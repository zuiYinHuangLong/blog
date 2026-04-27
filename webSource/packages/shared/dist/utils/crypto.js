import { API_BASE_URL } from './constants';
import JSEncrypt from 'jsencrypt';
import axios from 'axios';
let publicKey = null;
export async function fetchPublicKey() {
    if (publicKey)
        return publicKey;
    const res = await axios.get(`${API_BASE_URL}/auth/public-key`);
    publicKey = res.data.data.public_key;
    return publicKey;
}
export async function rsaEncrypt(plaintext) {
    const key = await fetchPublicKey();
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(key);
    const encrypted = encryptor.encrypt(plaintext);
    if (!encrypted) {
        throw new Error('RSA encryption failed');
    }
    return encrypted;
}
//# sourceMappingURL=crypto.js.map