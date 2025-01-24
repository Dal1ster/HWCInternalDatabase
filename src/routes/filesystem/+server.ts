
import { respond } from "$lib/server/util/respond";
import type { RequestEvent } from "@sveltejs/kit";
import { FileSystem, FileSystemError } from "$lib/server/classes/FileSystem";
import { smartRead } from "$lib/server/smartRead";
import User from "$lib/server/classes/User";
import { instanceToPlain } from "class-transformer";
import logger from "$lib/server/util/logger";
import { getPresistentState } from "$lib/server/util/getPresistentState";
export async function GET(ctx: RequestEvent) {
    const { url, locals } = ctx;
    const location = url.searchParams.get('location') || '';
    const contents = Boolean(url.searchParams.get('content') || false);
    const user = new User(locals.session);

    if(!location) {
        return respond(400, {}, 'No location provided');
    }

    try {
        const fs = FileSystem.create(user);
        const resource = await fs.accessPath(location);

        if(contents && resource.type !== 'directory') {
            const attribute = resource.flattenAttributes(user, getPresistentState());

            if(attribute.hotlinked) {
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