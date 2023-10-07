import Joi from 'joi';
import { ValidationError, AppError } from './exceptions';

const normaliseErrorMessages = (errors: any) => {
    const fields = errors.details.reduce((acc: any, e: any) => {
        if (e.path.length) {
            acc[e.path[0]] = e.message;
        } else {
            acc[e.context.label] = e.message;
        }
        return acc;
    }, {});

    return { fields };
};

const validate = async (data: any, schema: Joi.ObjectSchema<any>) => {
    try {
        const { error } = await schema.validate(data, { abortEarly: false });
        const valid = error == null;
        if (!valid) {
            console.error(error) // getLogger().error(error);
            const errors = normaliseErrorMessages(error);
            throw new ValidationError(errors);
        }

        return valid;
    } catch (err: any) {
        if (err instanceof ValidationError) {
            throw err;
        } else {
            throw new AppError(err.message);
        }
    }
};

export default { validate };
