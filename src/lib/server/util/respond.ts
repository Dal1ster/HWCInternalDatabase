export function respond(status: number, data: object, message: string = "") {
    return new Response(JSON.stringify({ data, message }), { status })
}

