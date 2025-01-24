export class ApiError<T> extends Error {
    data: T | undefined;

    constructor(message: string, data?: T) {
        super(message);
        this.data = data;
    }

    static from<T = any>(e: unknown): ApiError<T> {
        if(e instanceof ApiError) {
            return e;
        }

        if(e instanceof Error) {
            return new ApiError(e.message);
        } else if(typeof e === 'string') {
            return new ApiError(e);
        } else if(typeof e === 'object' && e !== null && 'message' in e && typeof e.message === 'string') {
            const err = new ApiError<T>(e.message, (e as any).data);
            return err;
        } else {
            return new ApiError('An unknown error occurred');
        }
    }
}