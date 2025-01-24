
import { respond } from "$lib/util/response";
import type { RequestEvent } from "@sveltejs/kit";
import { FileSystem, FileSystemError } from "$lib/classes/FileSystem";
import { smartRead } from "$lib/smartRead";
import User from "$lib/User";
import { instanceToPlain } from "class-transformer";
import logger from "$lib/util/logger";
export async function GET(ctx: RequestEvent) {
    const { url, locals } = ctx;
    const location = url.searchParams.get('location') || '';
    const contents = Boolean(url.searchParams.get('content') || false);

    if(!location) {
        return respond(400, {}, 'No location provided');
    }

    try {
        const fs = FileSystem.create(new User(locals.session));
        const resource = await fs.accessPath(location);

        if(contents && resource.type !== 'directory') {
            if(resource.attribute.hotlinked) {
                return respond(200, { content: resource.content });
            }

            const content = await fs.accessContents(resource);

            return await smartRead(content, ctx);
        }

        return respond(200, instanceToPlain(resource, { groups: ['public'] }));
    } catch(e) {
        logger.error(e);
        if(e instanceof FileSystemError) {
            return respond(404, {}, e.message);
        } else {
            return respond(500, {}, 'Internal server error');
        }
    }
}