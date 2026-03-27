import crypto from 'crypto';
import {ENC_BYTE} from '../../../../config/config.service.js'
const IV_LENGTH = 16;
const ENCRYPTION_SECRET_KEY = Buffer.from(ENC_BYTE); 

export const encrypt = async (text) => {
    
    const iv = crypto.randomBytes(IV_LENGTH);
    console.log({ ENCRYPTION_SECRET_KEY, iv });

    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, iv);
    console.log(cipher);

    let encryptedData = cipher.update(text, 'utf-8', 'hex');
    console.log(encryptedData);

    encryptedData += cipher.final('hex');
    console.log(encryptedData);

    return `${iv.toString('hex')}:${encryptedData}`;
}

export const decrypt = async (encryptedData) => {
    const [iv, encryptedText] = encryptedData.split(":");

    const binaryLikeIv = Buffer.from(iv, 'hex');  
    console.log({ binaryLikeIv });

    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_SECRET_KEY, binaryLikeIv);

    let decryptedData = decipher.update(encryptedText, 'hex', 'utf8');
    decryptedData += decipher.final("utf8");

    return decryptedData;
};
