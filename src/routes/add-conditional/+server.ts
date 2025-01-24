// REMOVE THIS IN PRODUCTION!!!!!!!!!!!!

import User from '$lib/User';
import env from '$lib/util/env';
import { respond } from '$lib/util/response.js';
import { RequestEvent } from '@sveltejs/kit';
export async function GET(req: RequestEvent) {
    if(env.NODE_ENV !== 'development') {
        return respond(404, {}, 'Not Found');
    }

    const conditional = req.url.searchParams.get('conditonal')!;
    const value = req.url.searchParams.get('value') === 'true';
    const session = req.locals.session;

    const user = new User(session);
    await user.setConditional(conditional, value);
    await session.save();

    return respond(200, session.data.conditional);
}