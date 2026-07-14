export function fromHex(hex: string): Uint8Array {
  const h = hex.startsWith('0x') ? hex.slice(2) : hex;
  return Uint8Array.from(h.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function generateSecret(): Uint8Array {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function generateNonce(): Uint8Array {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function saveSecret(role: 'organizer' | 'bidder', secret: Uint8Array) {
  localStorage.setItem(`sealed-bid:${role}:secret`, toHex(secret));
}

export function loadSecret(role: 'organizer' | 'bidder'): Uint8Array | null {
  const hex = localStorage.getItem(`sealed-bid:${role}:secret`);
  return hex ? fromHex(hex) : null;
}
