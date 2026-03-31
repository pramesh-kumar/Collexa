// ─── RSA Key Generation ───────────────────────────────────────────────────────

export const generateKeyPair = async () => {
  if (!crypto.subtle) return null;
  const keyPair = await crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"]
  );
  const publicKey = await exportPublicKey(keyPair.publicKey);
  const privateKey = await exportPrivateKey(keyPair.privateKey);
  return { publicKey, privateKey };
};

// ─── RSA Key Export/Import ────────────────────────────────────────────────────

export const exportPublicKey = async (key) => {
  const buf = await crypto.subtle.exportKey("spki", key);
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
};

export const exportPrivateKey = async (key) => {
  const buf = await crypto.subtle.exportKey("pkcs8", key);
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
};

export const importPublicKey = async (b64) => {
  const buf = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("spki", buf, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
};

export const importPrivateKey = async (b64) => {
  const buf = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("pkcs8", buf, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);
};

// ─── Password-based Private Key Encryption ───────────────────────────────────

const deriveKey = async (password, salt) => {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptPrivateKey = async (privateKeyB64, password) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(privateKeyB64));
  // combine salt + iv + encrypted into one base64 string
  const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  combined.set(salt, 0);
  combined.set(iv, 16);
  combined.set(new Uint8Array(encrypted), 28);
  return btoa(String.fromCharCode(...combined));
};

export const decryptPrivateKey = async (encryptedB64, password) => {
  const combined = Uint8Array.from(atob(encryptedB64), (c) => c.charCodeAt(0));
  const salt = combined.slice(0, 16);
  const iv = combined.slice(16, 28);
  const data = combined.slice(28);
  const key = await deriveKey(password, salt);
  const dec = new TextDecoder();
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return dec.decode(decrypted);
};

// ─── RSA Text Encryption/Decryption ──────────────────────────────────────────

export const encryptText = async (text, publicKeyB64) => {
  const publicKey = await importPublicKey(publicKeyB64);
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, enc.encode(text));
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
};

export const decryptText = async (encryptedB64, privateKeyB64) => {
  try {
    // Check if it looks like base64 encrypted data
    if (!privateKeyB64 || !encryptedB64) return encryptedB64;
    const privateKey = await importPrivateKey(privateKeyB64);
    const buf = Uint8Array.from(atob(encryptedB64), (c) => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, buf);
    return new TextDecoder().decode(decrypted);
  } catch {
    // If decryption fails, return as-is (plain text fallback)
    return encryptedB64;
  }
};

// ─── AES File Encryption/Decryption ──────────────────────────────────────────

export const generateAESKey = async () => {
  return crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
};

export const exportAESKey = async (key) => {
  const buf = await crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
};

export const importAESKey = async (b64) => {
  const buf = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", buf, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
};

export const encryptFile = async (file) => {
  const aesKey = await generateAESKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buf = await file.arrayBuffer();
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, buf);
  // prepend iv to encrypted data
  const combined = new Uint8Array(12 + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), 12);
  const encryptedFile = new File([combined], file.name, { type: file.type });
  const aesKeyB64 = await exportAESKey(aesKey);
  return { encryptedFile, aesKeyB64 };
};

export const decryptFile = async (encryptedBuf, aesKeyB64, mimeType) => {
  const aesKey = await importAESKey(aesKeyB64);
  const combined = new Uint8Array(encryptedBuf);
  const iv = combined.slice(0, 12);
  const data = combined.slice(12);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, data);
  return new Blob([decrypted], { type: mimeType });
};

// ─── RSA encrypt/decrypt AES key ─────────────────────────────────────────────

export const encryptAESKey = async (aesKeyB64, publicKeyB64) => {
  return encryptText(aesKeyB64, publicKeyB64);
};

export const decryptAESKey = async (encryptedAESKeyB64, privateKeyB64) => {
  return decryptText(encryptedAESKeyB64, privateKeyB64);
};
