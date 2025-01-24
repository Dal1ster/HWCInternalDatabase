import { FileSystem, FileSystemError } from "$lib/classes/FileSystem";
import User from "$lib/User";
import { instanceToPlain } from "class-transformer";
import { RequestEvent } from "@sveltejs/kit";
import { respond } from "$lib/util/response";

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

        const children = await fs.accessChildren(resource, false);

        if(typeof resource.attribute.setConditionalOnLoad !== 'undefined') {
            await user.setConditional(resource.attribute.setConditionalOnLoad, true);
        }

        return respond(200, instanceToPlain(children));
    } catch(e) {
        if(e instanceof FileSystemError) {
            return respond(404, {}, e.message);
        } else {
            return respond(500, {}, 'Internal server error');
        }
    }
}