import { sign, verify } from 'jsonwebtoken';
import { hashSync, compareSync } from 'bcrypt';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class AuthService {
  static hashPassword(password: string) {
    return hashSync(password, 10);
  }
  static comparePassword(password: string, hash: string) {
    return compareSync(password, hash);
  }
  static signJWT(value: object) {
    return sign(value, process.env.JWT_SECRET!);
  }
  static verifyJWT(token: string) {
    return verify(token, process.env.JWT_SECRET!);
  }

  static fixedEncryption(value: string) {
    // encryption algorithm
    const algorithm = 'aes-256-cbc';
    // Use SHA-256 to get a 32-byte key for AES-256
    const key = crypto.createHash('sha256').update(process.env.JWT_SECRET!).digest();
    // Use a fixed IV to maintain compatibility with existing encrypted data
    const iv = Buffer.alloc(16, 0);

    // create a cipher object
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    // encrypt the plain text
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
  }

  static fixedDecryption(hash: string) {
    const algorithm = 'aes-256-cbc';
    const iv = Buffer.alloc(16, 0);

    // Try with SHA-256 key first (new format)
    try {
      const key = crypto.createHash('sha256').update(process.env.JWT_SECRET!).digest();
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      let decrypted = decipher.update(hash, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      // If that fails, try with legacy approach using AES-128-CBC (which works with MD5 16-byte key)
      try {
        const legacyAlgorithm = 'aes-128-cbc';
        const legacyKey = crypto.createHash('md5').update(process.env.JWT_SECRET!).digest();
        const legacyIv = Buffer.alloc(16, 0);

        const decipher = crypto.createDecipheriv(legacyAlgorithm, legacyKey, legacyIv);
        let decrypted = decipher.update(hash, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
      } catch (legacyError) {
        throw new Error('Failed to decrypt data with both new and legacy methods');
      }
    }
  }
}
