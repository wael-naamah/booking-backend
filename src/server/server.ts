import { app } from './app/app';

require('es6-promise').polyfill();
require('isomorphic-fetch');

// Constants
const PORT = app.get("port");

const startServer = () => {
    const listener = app.listen(PORT, () => {
        console.info(`Service is running at http://localhost:${PORT}`);
    });

    process.on('SIGTERM', () => {
        listener.close(() => {
            console.error('Closing http server.');
            process.exit(0);
        });
    });
};

startServer();

export { app };
