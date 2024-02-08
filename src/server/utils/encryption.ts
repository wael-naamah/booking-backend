import crypto from 'crypto';
import { getEnv } from '../env';

const ENCRYPTION_KEY = getEnv().encryption_key;


const algorithm = 'aes-256-ctr';
const IV_LENGTH = 16;

export function encrypt(text: string) {
	let iv = crypto.randomBytes(IV_LENGTH);
	let cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
	let encrypted = cipher.update(text);
	encrypted = Buffer.concat([encrypted, cipher.final()]);
	return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(text: string) {
	let textParts = text.split(':');
	let iv = Buffer.from(textParts.shift()!, 'hex');
	let encryptedText = Buffer.from(textParts.join(':'), 'hex');
	let decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
	let decrypted = decipher.update(encryptedText);
	decrypted = Buffer.concat([decrypted, decipher.final()]);
	return decrypted.toString();
}