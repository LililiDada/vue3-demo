function a(a: number, b: number) {
  const c = a + b;
  console.log(c);
}

a(1, 3);

import CryptoJS from 'crypto-js';

/**
 * AES加密
 * @param plainText 明文
 * @param keyInBase64Str base64编码后的key
 * @returns {string} base64编码后的密文
 */
export function encryptByAES(plainText: any, keyInBase64Str: any) {
  if (plainText instanceof Object) {
    plainText = JSON.stringify(plainText);
  }

  const key = CryptoJS.enc.Base64.parse(keyInBase64Str);
  const encrypted = CryptoJS.AES.encrypt(plainText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  // 这里的encrypted不是字符串，而是一个CipherParams对象
  return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
}

/**
 * AES解密
 * @param cipherText 密文
 * @param keyInBase64Str base64编码后的key
 * @return 明文
 */
export function decryptByAES(cipherText: string, keyInBase64Str: string) {
  const key = CryptoJS.enc.Base64.parse(keyInBase64Str);
  // 返回的是一个Word Array Object，其实就是Java里的字节数组
  const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
}

const secretKey = 'sQPoC/1do9BZMkg8I5c09A==';
const key = [1, 3, 4, 5];
const cipherText = encryptByAES(key, secretKey);
const plainText: any = decryptByAES(cipherText, secretKey);
console.log(`Hello加密后的密文为：${cipherText}`, secretKey.length);
console.log(`解密后的内容为：${plainText},${typeof plainText}`);
