import { HttpError } from './index';

export class NotFoundError extends HttpError {
    constructor(message: string) {
        super(message, 404);
    }
}
