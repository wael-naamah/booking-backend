export class AppError extends Error {
    status: number;
    constructor(message: string, httpCode = 500) {
        super(message);
        this.status = httpCode;
    }
}
