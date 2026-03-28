
// Per-session AES-GCM encryption for localStorage.
// The CryptoKey lives only in module memory — it is never written to any storage.
// When the browser tab/session closes the key is lost, making stored ciphertext
// unreadable without it (acceptable for a calculator that re-hydrates on open).

let sessionKey: CryptoKey | null = null;

const SESSION_KEY_MARKER = 'kalkulator_enc_session';

/**
 * Returns the per-session CryptoKey, generating it once per page load.
 * We store a marker in sessionStorage so we know a key was generated this
 * session, but the actual CryptoKey object stays in module memory only.
 */
export async function getEncryptionKey(): Promise<CryptoKey> {
  if (sessionKey) return sessionKey;

  // Generate a new non-extractable AES-GCM 256-bit key
  sessionKey = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    false,          // non-extractable — can never be exported
    ['encrypt', 'decrypt']
  );

  sessionStorage.setItem(SESSION_KEY_MARKER, '1');
  return sessionKey;
}

/** Encodes a Uint8Array to a base64 string. */
function toBase64(buf: Uint8Array): string {
  return btoa(String.fromCharCode(...buf));
}

/** Decodes a base64 string to a Uint8Array. */
function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

/**
 * Encrypts a plaintext string with AES-GCM.
 * Returns a string formatted as `base64(iv):base64(ciphertext)`.
 */
export async function encryptData(data: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(data);

  const cipherBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  return `${toBase64(iv)}:${toBase64(new Uint8Array(cipherBuf))}`;
}

/**
 * Decrypts a string produced by `encryptData`.
 * Throws if the format is invalid or decryption fails (e.g. wrong key).
 */
export async function decryptData(encrypted: string): Promise<string> {
  const sep = encrypted.indexOf(':');
  if (sep === -1) throw new Error('Invalid encrypted data format');

  const iv = fromBase64(encrypted.slice(0, sep));
  const cipherBytes = fromBase64(encrypted.slice(sep + 1));
  const key = await getEncryptionKey();

  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBytes
  );

  return new TextDecoder().decode(plainBuf);
}

/**
 * Encrypts `value` and writes it to localStorage under `key`.
 */
export async function secureSetItem(key: string, value: string): Promise<void> {
  const encrypted = await encryptData(value);
  localStorage.setItem(key, encrypted);
}

/**
 * Reads the value at `key` from localStorage and decrypts it.
 * Returns `null` if the key is absent, the value is plaintext (legacy),
 * or decryption fails for any reason — and removes the stale entry in
 * the latter two cases so the caller can start fresh.
 */
export async function secureGetItem(key: string): Promise<string | null> {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;

  // Detect legacy plaintext: valid encrypted values always contain ':'
  // AND the IV portion decodes to exactly 12 bytes.
  // A simple heuristic: if it doesn't match `<base64>:<base64>` we treat
  // it as unencrypted legacy data and clear it.
  if (!raw.includes(':')) {
    if (import.meta.env.DEV) console.warn(`[storageEncryption] Removing legacy plaintext for key "${key}"`);
    localStorage.removeItem(key);
    return null;
  }

  try {
    return await decryptData(raw);
  } catch {
    if (import.meta.env.DEV) console.warn(`[storageEncryption] Decryption failed for key "${key}", removing entry`);
    localStorage.removeItem(key);
    return null;
  }
}
