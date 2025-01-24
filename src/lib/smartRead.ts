import type { RequestEvent } from "@sveltejs/kit";
import { fileTypeFromFile } from "file-type";
import { existsSync, readFileSync, statSync } from "fs";
import { open } from "fs/promises";
import { parse, resolve } from "path";
import { cwd } from "process";
import { FileSystemError } from "./classes/FileSystem";
import logger from "./util/logger";

export function readExecutable(path: string, { setHeaders }: RequestEvent) {
    const contents = readFileSync(path, { encoding: 'utf-8' });
    const { name } = parse(path);

    const js = `${contents}\r\nexport default "haltmann-${name}";`;

    setHeaders({ 
        'Content-Type': 'text/javascript'
    })

    return new Response(js, { status: 200 })
}

export async function smartRead(content: string, ctx: RequestEvent){
    const { request, setHeaders } = ctx;
    const range = request.headers.get('range');
    const path = resolve(cwd(), 'fs', content);

    if(!existsSync(path)) {
        logger.error(`path does not exist: ${path}`);
        throw new FileSystemError('File not found', 'NOT_FOUND');
    }

    const fileSize = statSync(path).size;
    const type = await fileTypeFromFile(path);

    if(path.endsWith('.js')) {
        return readExecutable(path, ctx);
    }

    if(range) {
        const [startRaw, endRaw] = range.replace('bytes=', '').split('-');
        const start = parseInt(startRaw);
        let end = endRaw ? parseInt(endRaw) : fileSize - 1;

        if(end >= fileSize) {
            end = fileSize - 1;
        }

        const size = (end - start) + 1;

        const fd = await open(path, 'r');
        const buffer = Buffer.alloc(size);

        const result = await fd.read(buffer, 0, size, start); 

        await fd.close();

        setHeaders({
            'Content-Length': result.bytesRead.toString(),
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Type': type?.mime || 'application/octet-stream'
        })

        
        // we SHOULD be able to use a raw ReadStream here and it works locally but in production it throws ERR_INVALID_STATE with no stack trace
        // and we dont have time to troubleshoot it so we're just going to read the whole buffer then pass to the client 
        // which is not ideal but it works
        return new Response(result.buffer, { status: 206 });

    } else {
        const fd = await open(path, 'r');
        const stat = await fd.stat();
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
}