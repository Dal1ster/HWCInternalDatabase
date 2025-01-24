// src/hooks.server.ts
import prereleaseGuard from '$lib/hooks/handle/prereleaseGuard';
import requestLogger from '$lib/hooks/handle/requestLogger';
import logger from '$lib/util/logger';
import { Handle, redirect } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { cwd } from 'process';
import { sveltekitSessionHandle } from 'svelte-kit-sessions';
export const handle: Handle = sequence(
    prereleaseGuard,
    sveltekitSessionHandle({ secret: 'hwc-i2-51', saveUninitialized: true }),
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