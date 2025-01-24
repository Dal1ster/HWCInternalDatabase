import type { RequestEvent } from "@sveltejs/kit";

export function GET(ctx: RequestEvent) {
    return new Response(JSON.stringify(ctx.locals.session.data, undefined, 2), { status: 200})
}