import { Handle, RequestEvent } from "@sveltejs/kit";
import logger from "../../util/logger";

// in production this is deployed behind an nginx reverse proxy, so we can trust this header
// event.getClientAddress() should work here, but it doesnt because of env not loading in the built handler (?), so we have to use this instead
export function getClientIp(event: RequestEvent) {
    const ip = event.request.headers.get('x-real-ip') || event.getClientAddress(); // still gonna use it as fallback tho
    return ip;
}

const handle: Handle = async ({ event, resolve }) => {
    logger.info({
        method: event.request.method,
        url: event.request.url,
        headers: [...event.request.headers.entries()],
        body: event.request.method !== 'GET' && (await event.request.clone().json().catch(() => 'no body')),
        session: event.locals?.session?.id,
        ip: getClientIp(event)
    });
    return await resolve(event);
}

export default handle;