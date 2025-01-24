import { FileSystem, FileSystemError } from "$lib/classes/FileSystem";
import User from "$lib/User";
import env from "$lib/util/env";
import { logPasswordAttempt } from "$lib/util/logPasswordAttempt";
import { respond } from "$lib/util/response";
import type { RequestEvent } from "@sveltejs/kit";

export async function POST(ctx: RequestEvent) {
    const { url, locals, request } = ctx;
    const location = url.searchParams.get('location');
    const body = await request.json();

    const user = new User(locals.session);
    
    const fs = FileSystem.create(user);

    if(!location) {
        return respond(400, {}, 'No location provided');
    }


    try {

        if(env.WINTER_BREAK) {
            logPasswordAttempt('Challenge', `Failed challenge (WINTER_BREAK) for ${location}: ${body.password}`);
            return respond(403, {}, 'Haltmann Works Company recommends using your unpaid vacation days to spend the Christmas season with your loved ones.');
        }

        // if someone datamines the hidden password for the haltmann account and tries to use it
        if(body.password === 'Susie$777$') {
            return respond(403, { silly: true }, 'You are being silly')
        }


        const resource = await fs.accessPath(location);

        if(resource.challenge?.isPasswordCorrect(body.password)) {
            await user.setChallenge(location);
            return respond(200, {}, 'Challenge completed');
        } else {
            logPasswordAttempt('Challenge', `Failed challenge for ${location}: ${body.password}`);
            return respond(403, {}, 'Incorrect password');
        }
    } catch (ex) {
        if(ex instanceof FileSystemError) {
            return respond(404, {}, ex.message);
        }
        return respond(500, {}, 'Internal server error');
    }

}