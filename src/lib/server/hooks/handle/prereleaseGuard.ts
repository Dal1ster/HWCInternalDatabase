import env from "$lib/server/util/env";
import { error, type Handle } from '@sveltejs/kit';

const handle: Handle = async ({ event, resolve }) => {
    if(env.PRERELEASE && env.PRERELEASE_PASSCODE) {
        if(event.cookies.get('preview') !== env.PRERELEASE_PASSCODE) {
            return error(404, 'Not Found');
        }
    }

    return await resolve(event);
}

export default handle;