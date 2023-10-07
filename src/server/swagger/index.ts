const swaggerAutogen = require('swagger-autogen')();
import path from 'path';
const defaultPath = path.resolve(__dirname, '../');
const doc = {
    info: {
        title: 'Calendar API',
        description: 'Documentation of the calendar APIs',
    },
    host: 'localhost:9010',
    schemes: ['http'],
    basePath: '/app/',
    securityDefinitions: {
        apiKeyAuth: {
            type: 'apiKey',
            name: 'key',
            in: 'query',
        },
    },
    definitions: {
        SuccessResponse: {
            status: 'success',
        },
    },
};

const outputFile = defaultPath + '/swagger/swagger_output.json';

const endpointsFiles = [
    path.resolve(__dirname, '../app/user/resource'),
];

swaggerAutogen(outputFile, endpointsFiles, doc);
