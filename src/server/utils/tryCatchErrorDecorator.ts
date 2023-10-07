import { NextFunction, Request, Response } from 'express';

const tryCatchErrorDecorator = (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
) => {
    const fn = descriptor.value;

    return {
        async value(req: Request, res: Response, next: NextFunction) {
            try {
                await fn.call(this, req, res, next);
            } catch (error) {
                console.error(error);
                next(error);
            }
        },
    };
};

export default tryCatchErrorDecorator;
