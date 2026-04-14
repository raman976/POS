import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc'
const IV_LENGTH = 16

export class EncryptionService {
  private readonly key: Buffer

  constructor(secret: string) {
    this.key = crypto.scryptSync(secret, 'pos-vault-salt', 32)
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(IV_LENGTH)
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv)
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
    return iv.toString('hex') + ':' + encrypted.toString('hex')
  }

  decrypt(ciphertext: string): string {
    const [ivHex, encryptedHex] = ciphertext.split(':')
    if (!ivHex || !encryptedHex) throw new Error('Invalid ciphertext format')

    const iv = Buffer.from(ivHex, 'hex')
    const encrypted = Buffer.from(encryptedHex, 'hex')
    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv)
    return decipher.update(encrypted).toString('utf8') + decipher.final('utf8')
  }
}
