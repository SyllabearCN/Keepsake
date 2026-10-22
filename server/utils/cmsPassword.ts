import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const KEY_LENGTH = 64
const SCRYPT_OPTIONS = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 64 * 1024 * 1024,
}

function derivePassword(password: string, pepper: string) {
  return createHmac('sha256', pepper).update(password).digest()
}

export function hashCmsPassword(password: string, pepper: string) {
  const salt = randomBytes(16)
  const hash = scryptSync(derivePassword(password, pepper), salt, KEY_LENGTH, SCRYPT_OPTIONS)
  return [
    'scrypt',
    SCRYPT_OPTIONS.N,
    SCRYPT_OPTIONS.r,
    SCRYPT_OPTIONS.p,
    salt.toString('hex'),
    hash.toString('hex'),
  ].join('$')
}

export function verifyCmsPassword(password: string, encoded: string, pepper: string) {
  const [algorithm, n, r, p, saltHex, hashHex] = encoded.split('$')
  if (algorithm !== 'scrypt' || !n || !r || !p || !saltHex || !hashHex) {
    return false
  }

  try {
    const expected = Buffer.from(hashHex, 'hex')
    const actual = scryptSync(derivePassword(password, pepper), Buffer.from(saltHex, 'hex'), expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: 64 * 1024 * 1024,
    })
    return expected.length === actual.length && timingSafeEqual(expected, actual)
  }
  catch {
    return false
  }
}

const dummyHash = hashCmsPassword('invalid-password-placeholder', 'keepsake-dummy-pepper')

export function consumeDummyPasswordCheck(password: string, pepper: string) {
  verifyCmsPassword(password, dummyHash, pepper)
}
