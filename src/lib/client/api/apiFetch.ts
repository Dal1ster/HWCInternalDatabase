import { ApiError } from "./ApiError";

export default function apiFetch(...args: Parameters<typeof fetch>) {
    return fetch(...args).then(async res => {
        try {
            const body = await res.json();
    
            if(res.ok) {
                return body as { message: string, data: any };
            } else {
                throw ApiError.from(body);
            }
        } catch (ex) { // for json parsing errors
            if(ex instanceof ApiError) {
                throw ex;
            } else {
                if(!res.ok && res.status === 429) {
                    throw new ApiError('Too many requests');
                }
                throw new ApiError('An unknown error occurred');
            }
        }
    });
}