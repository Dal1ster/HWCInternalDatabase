import type { RequestEvent } from "@sveltejs/kit";
import { fileTypeFromFile } from "file-type";
import { existsSync, readFileSync } from "fs";
import { open } from "fs/promises";
import { parse, resolve } from "path";
import { cwd } from "process";
import { FileSystemError } from "./classes/FileSystem";
import logger from "./util/logger";

export function readExecutable(path: string, { setHeaders }: RequestEvent) {
    const contents = readFileSync(path, { encoding: 'utf-8' });
    const { name } = parse(path);

    const js = `${contents}\r\nexport default "haltmann-${name}";`; // tacking on the custom html tag name as an export so the frontend knows what tag to create

    setHeaders({ 
        'Content-Type': 'text/javascript'
    })

    return new Response(js, { status: 200 })
}

export async function smartRead(content: string, ctx: RequestEvent){
    const { request, setHeaders } = ctx;
    const range = request.headers.get('range');
    
    const realPath = resolve(cwd(), 'fs', content);

    if(!existsSync(realPath)) {
        logger.error(`path does not exist: ${realPath}`);
        throw new FileSystemError('File not found', 'NOT_FOUND');
    }

    if(realPath.endsWith('.js')) {
        return readExecutable(realPath, ctx);
    }

    const fd = await open(realPath, 'r');

    try {
        const stat = await fd.stat();
        const type = await fileTypeFromFile(realPath);
    
        if(range) {
            const [startRaw, endRaw] = range.replace('bytes=', '').split('-');
            const start = parseInt(startRaw);
            let end = endRaw ? parseInt(endRaw) : stat.size - 1;
    
            if(end >= stat.size) {
                end = stat.size - 1;
            }
    
            const size = (end - start) + 1;
    
            const buffer = Buffer.alloc(size);
            const result = await fd.read(buffer, 0, size, start); 
    
            await fd.close();
    
            setHeaders({
                'Content-Length': result.bytesRead.toString(),
                'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Type': type?.mime || 'application/octet-stream'
            })

            return new Response(result.buffer, { status: 206 });
    
        } else {
            const size = stat.size;
    
            const buffer = Buffer.alloc(size);
            const result = await fd.read(buffer, 0, size, 0);       
            
            await fd.close();
    
            setHeaders({
                'Content-Length': result.bytesRead.toString(),
                'Accept-Ranges': 'bytes',
                'Content-Type': type?.mime || 'application/octet-stream'
            })
    
            return new Response(result.buffer, { status: 200 });
        }
    } catch (ex) {
        logger.error('Error reading file', ex);
        throw ex;
    } finally {
        await fd.close();
    }
}