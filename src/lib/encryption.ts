import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_TOKEN_ENCRYPTION_KEY || 'default-secret-key-12345';

/**
 * Encrypt a plain text string using AES
 */
export const encryptToken = (token: string): string => {
  try {
    return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
};

/**
 * Decrypt an AES encrypted string
 */
export const decryptToken = (encryptedToken: string): string => {
  if (!encryptedToken) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedToken, SECRET_KEY);
    const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
    
    // CryptoJS.enc.Utf8.stringify returns an empty string if it fails to parse
    // but sometimes it might throw if the bytes are completely garbage.
    // We double check decryptedText to ensure it's not empty/null.
    return decryptedText || '';
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
};
