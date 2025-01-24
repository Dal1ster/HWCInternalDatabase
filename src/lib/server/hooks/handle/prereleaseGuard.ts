import env from "$lib/server/util/env";
import { error, type Handle } from '@sveltejs/kit';

const handle: Handle = async ({ event, resolve }) => {
    if(env.PRERELEASE) {
        if(event.cookies.get('preview') !== 'afgvisavjhsiefocashdfvlsdjvs') {
            return error(404, 'Not Found');
        }
    }

    return await resolve(event);
}

export default handle;