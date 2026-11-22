// Puente con el teléfono. En el APK: huella (Android Keystore), notificaciones, cámara y lector de texto (ML Kit).
// En la web (PWA): huella o cara con passkey (WebAuthn + PRF) y lector de facturas con Tesseract empaquetado (src/ocr, sin internet).
// La huella guarda el PIN cifrado con una llave que solo se abre con la huella; el PIN nunca queda en claro.
window.Sistema = (function () {
  'use strict';
  const P = () => (window.Capacitor && window.Capacitor.Plugins) || {};
  const SERVIDOR = 'wallet.pin';

  const esApk = () => !!window.Capacitor;
  const PASSKEY = 'cuadre-passkey', SAL = new TextEncoder().encode('cuadre-pin-v1');
  const b64 = u8 => btoa(String.fromCharCode(...new Uint8Array(u8))), deB64 = t => Uint8Array.from(atob(t), c => c.charCodeAt(0));
  const webAuthn = () => !esApk() && window.PublicKeyCredential && navigator.credentials && window.isSecureContext;
  const llavePrf = (cred, uso) => {
    const r = cred.getClientExtensionResults().prf, sec = r && r.results && r.results.first;
    if (!sec) throw new Error('sin-prf'); // el navegador o la llave no dan el secreto: se queda solo el PIN
    return crypto.subtle.importKey('raw', sec, 'AES-GCM', false, [uso]);
  };
  async function secretoPasskey(id) {
    return navigator.credentials.get({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), userVerification: 'required', timeout: 60000,
      allowCredentials: [{ type: 'public-key', id }], extensions: { prf: { eval: { first: SAL } } } } });
  }

  async function huellaDisponible() {
    if (webAuthn()) { try { return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); } catch { return false; } }
    const B = P().NativeBiometric;
    if (!B) return false;
    try { const r = await B.isAvailable({ useFallback: false }); return !!(r && r.isAvailable && r.strongBiometryIsAvailable !== false); }
    catch { return false; }
  }
  // Guarda el PIN amarrado a la huella (pide la huella para protegerlo).
  async function guardarPin(pin, T) {
    if (webAuthn()) {
      const cred = await navigator.credentials.create({ publicKey: { challenge: crypto.getRandomValues(new Uint8Array(32)), rp: { name: T.app },
        user: { id: crypto.getRandomValues(new Uint8Array(16)), name: T.app, displayName: T.app }, pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'preferred' }, timeout: 60000, extensions: { prf: { eval: { first: SAL } } } } });
      let llave;
      try { llave = await llavePrf(cred, 'encrypt'); } catch { llave = await llavePrf(await secretoPasskey(cred.rawId), 'encrypt'); } // algunos solo lo dan al usarla
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const c = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, llave, new TextEncoder().encode(pin));
      localStorage.setItem(PASSKEY, JSON.stringify({ id: b64(cred.rawId), iv: b64(iv), c: b64(c) })); // solo en este navegador, nunca en el respaldo
      return;
    }
    const B = P().NativeBiometric;
    await B.setCredentials({ username: 'wallet', password: pin, server: SERVIDOR, accessControl: 1 /* BIOMETRY_CURRENT_SET: si cambian las huellas del teléfono, hay que volver a activarla */,
      title: T.huellaTitulo, negativeButtonText: T.cancelar });
  }
  // Devuelve el PIN si la huella es correcta; null si se cancela o falla.
  async function pinConHuella(T) {
    if (webAuthn()) {
      try {
        const g = JSON.parse(localStorage.getItem(PASSKEY) || 'null'); if (!g) return null;
        const llave = await llavePrf(await secretoPasskey(deB64(g.id)), 'decrypt');
        return new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: deB64(g.iv) }, llave, deB64(g.c)));
      } catch { return null; }
    }
    const B = P().NativeBiometric;
    if (!B) return null;
    try {
      const c = await B.getSecureCredentials({ server: SERVIDOR, title: T.huellaTitulo, subtitle: T.huellaSub, negativeButtonText: T.usarPin });
      return c && c.password ? c.password : null;
    } catch { return null; }
  }
  async function borrarPin() {
    try { localStorage.removeItem(PASSKEY); } catch { /* sin almacenamiento */ } // shortcut: la passkey queda en el teléfono (la web no puede borrarla); sin el PIN cifrado no sirve de nada
    const B = P().NativeBiometric; if (B) try { await B.deleteCredentials({ server: SERVIDOR }); } catch { /* no había */ }
  }

  // Reemplaza todas las notificaciones programadas por la lista nueva [{at, titulo, cuerpo}].
  async function programar(lista, activo) {
    const N = P().LocalNotifications;
    if (!N) return 'sin-plugin';
    try {
      const pend = await N.getPending();
      if (pend.notifications.length) await N.cancel({ notifications: pend.notifications.map(n => ({ id: n.id })) });
      if (!activo || !lista.length) return 'ok';
      let perm = await N.checkPermissions();
      if (perm.display !== 'granted') perm = await N.requestPermissions();
      if (perm.display !== 'granted') return 'sin-permiso';
      await N.schedule({ notifications: lista.map((x, i) => ({ id: i + 1, title: x.titulo, body: x.cuerpo, schedule: { at: new Date(x.at), allowWhileIdle: true } })) });
      return 'ok';
    } catch (e) { console.warn('avisos', e); return 'error'; }
  }

  // Cámara y galería (APK). Devuelve {uri, webPath} o null si se cancela. En la web, app.js usa un <input type=file>.
  async function foto(origen) {
    const C = P().Camera;
    if (!C) return null;
    try {
      if (origen === 'galeria') { const r = await C.chooseFromGallery({ quality: 70, allowMultipleSelection: false }); return (r.results || [])[0] || null; }
      return await C.takePhoto({ quality: 70, targetWidth: 1600, correctOrientation: true });
    } catch (e) { if (!/cancel/i.test(String(e && e.message))) console.warn('camara', e); return null; }
  }
  // Lee el texto de una foto con ML Kit dentro del teléfono (sin internet). null si no está disponible o falla.
  // La ruta que da la cámara a veces viene sin «file://» y ML Kit no la abre: por eso se escribe una copia propia
  // (más grande y nítida que la que se guarda) en la caché y se lee esa. Después se borra.
  let tesseract = null; // promesa del lector web (se crea una vez)
  function lectorWeb() {
    if (!tesseract) tesseract = new Promise((ok, mal) => {
      if (window.Tesseract) return ok();
      const sc = document.createElement('script'); sc.src = 'ocr/tesseract.min.js'; sc.onload = ok; sc.onerror = () => mal(new Error('sin lector'));
      document.head.appendChild(sc);
    }).then(() => {
      const base = new URL('ocr/', location.href).href;
      return window.Tesseract.createWorker('spa', 1, { workerPath: base + 'worker.min.js', corePath: base, langPath: base, workerBlobURL: false, gzip: true });
    }).catch(e => { tesseract = null; throw e; });
    return tesseract;
  }
  async function leerTexto(dataUrl) {
    if (!dataUrl) return null;
    if (!esApk()) { try { return (await (await lectorWeb()).recognize(dataUrl)).data.text || ''; } catch (e) { console.warn('ocr web', e); return null; } }
    const R = P().TextRecognition, F = P().Filesystem;
    if (!R || !F) return null;
    const nombre = `ocr-${Date.now()}.jpg`;
    try {
      const w = await F.writeFile({ path: nombre, data: dataUrl.split(',')[1], directory: 'CACHE' });
      const ruta = /^[a-z]+:\/\//i.test(w.uri) ? w.uri : 'file://' + w.uri;
      return (await R.processImage({ path: ruta })).text || '';
    } catch (e) { console.warn('ocr', e); return null; }
    finally { F.deleteFile({ path: nombre, directory: 'CACHE' }).catch(() => {}); }
  }

  return { huellaDisponible, guardarPin, pinConHuella, borrarPin, programar, foto, leerTexto, hayCamara: () => !!P().Camera, esApk };
})();
