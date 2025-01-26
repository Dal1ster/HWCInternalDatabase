// REMOVE THIS IN PRODUCTION!!!!!!!!!!!!
// lol

import User from '$lib/server/classes/User';
import env from '$lib/server/util/env';
import { respond } from '$lib/server/util/respond';
import type { RequestEvent } from '@sveltejs/kit';
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