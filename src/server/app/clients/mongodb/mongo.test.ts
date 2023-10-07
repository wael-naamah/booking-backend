import { getMongo } from './mongo';
import { delay } from 'bluebird';

describe('mongodb', () => {
    it('should connect', async () => {
        await getMongo();
        return delay(1000);
    });
});
