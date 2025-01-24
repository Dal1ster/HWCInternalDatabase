import { FileSystem, FileSystemError } from "$lib/server/classes/FileSystem";
import User from "$lib/server/classes/User";
import { instanceToPlain } from "class-transformer";
import type { RequestEvent } from "@sveltejs/kit";
import { respond } from "$lib/server/util/respond";

export async function GET({ url, locals }: RequestEvent ) {
    const location = url.searchParams.get('location');
    const user = new User(locals.session);

    try {    
        if(!location) {
            throw new FileSystemError('No location provided', 'NOT_FOUND');
        }
        
        const fs = FileSystem.create(user);
        const resource = await fs.accessPath(location);

        if(resource.type !== 'directory') {
            throw new FileSystemError('Not a directory', 'NOT_A_DIRECTORY');
        }

        const children = fs.clientAccessChildren(resource);

        return respond(200, instanceToPlain(children));
    } catch(e) {
        if(e instanceof FileSystemError) {
            return respond(404, {}, e.message);
        } else {
            return respond(500, {}, 'Internal server error');
        }
    }
}