// Bóveda: cifra las cuentas privadas con un PIN (PBKDF2-SHA256 + AES-GCM 256, WebCrypto).
// Sin el PIN los datos no se pueden leer, ni siquiera desde un respaldo. Si se olvida el PIN, no hay forma de recuperarlos.
(function (g) {
  'use strict';
  const ITER = 310000;
  const sub = () => g.crypto.subtle;
  const b64 = buf => { let s = ''; new Uint8Array(buf).forEach(b => (s += String.fromCharCode(b))); return g.btoa(s); };
  const deB64 = s => Uint8Array.from(g.atob(s), c => c.charCodeAt(0));

  async function derivar(pin, salt, iter) {
    const base = await sub().importKey('raw', new TextEncoder().encode(String(pin)), 'PBKDF2', false, ['deriveKey']);
    return sub().deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base,
      { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  }

  // Devuelve { llave, salt, iter } para guardar luego con sellar(). La llave no se puede exportar.
  async function crear(pin, iter) {
    const salt = g.crypto.getRandomValues(new Uint8Array(16));
    const it = iter || ITER;
    return { llave: await derivar(pin, salt, it), salt: b64(salt), iter: it };
  }

  async function sellar(sesion, privado) {
    const iv = g.crypto.getRandomValues(new Uint8Array(12));
    const datos = await sub().encrypt({ name: 'AES-GCM', iv }, sesion.llave, new TextEncoder().encode(JSON.stringify(privado)));
    return { v: 1, salt: sesion.salt, iter: sesion.iter, iv: b64(iv), datos: b64(datos) };
  }

  // Lanza Error('PIN') si el PIN no es correcto.
  async function abrir(pin, caja) {
    const llave = await derivar(pin, deB64(caja.salt), caja.iter || ITER);
    let plano;
    try { plano = await sub().decrypt({ name: 'AES-GCM', iv: deB64(caja.iv) }, llave, deB64(caja.datos)); }
    catch { throw new Error('PIN'); }
    return { sesion: { llave, salt: caja.salt, iter: caja.iter || ITER }, privado: JSON.parse(new TextDecoder().decode(plano)) };
  }

  // Candado de la app: guarda solo una huella del PIN (PBKDF2), nunca el PIN. Mismo costo que la bóveda.
  async function candado(pin, iter) {
    const salt = g.crypto.getRandomValues(new Uint8Array(16)), it = iter || ITER;
    return { v: 1, salt: b64(salt), iter: it, hash: await bits(pin, salt, it) };
  }
  async function bits(pin, salt, iter) {
    const base = await sub().importKey('raw', new TextEncoder().encode(String(pin)), 'PBKDF2', false, ['deriveBits']);
    return b64(await sub().deriveBits({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, 256));
  }
  async function verificar(pin, c) {
    if (!c || !c.hash) return false;
    const h = await bits(pin, deB64(c.salt), c.iter || ITER);
    let dif = h.length ^ c.hash.length;
    for (let i = 0; i < Math.min(h.length, c.hash.length); i++) dif |= h.charCodeAt(i) ^ c.hash.charCodeAt(i);
    return dif === 0;
  }

  // Abre una caja con la llave de la sesión ya abierta (para fotos de cuentas privadas).
  async function abrirCon(sesion, caja) {
    const plano = await sub().decrypt({ name: 'AES-GCM', iv: deB64(caja.iv) }, sesion.llave, deB64(caja.datos));
    return JSON.parse(new TextDecoder().decode(plano));
  }

  const api = { crear, sellar, abrir, abrirCon, candado, verificar };
  g.Boveda = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
