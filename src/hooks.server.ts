// src/hooks.server.ts
import prereleaseGuard from '$lib/server/hooks/handle/prereleaseGuard';
import requestLogger from '$lib/server/hooks/handle/requestLogger';
import env from '$lib/server/util/env';
import logger from '$lib/server/util/logger';
import { type Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { cwd } from 'process';
import { sveltekitSessionHandle } from 'svelte-kit-sessions';
export const handle: Handle = sequence(
    prereleaseGuard,
    sveltekitSessionHandle({ secret: env.SESSION_SECRET, saveUninitialized: true }),
    requestLogger
);

/** @type {import('@sveltejs/kit').HandleServerError} */
export async function handleError(ctx) {
    logger.error(ctx.error);

    if('error' in ctx) {
        const { error } = ctx;

        if(error.status === 404 && error.text === 'Not Found') {
            const possiblePath = resolve(cwd(), `./fs/${ctx.event.url.pathname}`);
            
            // someone is being silly and trying to access protected filesystem paths directly
            // lets inform them that they are being silly

            if(existsSync(possiblePath) && possiblePath.startsWith(resolve(cwd(), './fs'))) {
                redirect(302, '/youarebeingsilly.png');
            }
        }
    }
}