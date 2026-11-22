// Guarda el estado en IndexedDB (un solo registro) y, aparte, las fotos de facturas (tienda «fotos»). En vista previa no guarda nada.
window.DB = (function () {
  'use strict';
  const NOMBRE = 'wallet', TIENDA = 'datos', FOTOS = 'fotos', CLAVE = 'v1';
  let conexion = null;
  const memoria = new Map(); // fotos en vista previa (no se guardan)

  function abrir() {
    if (conexion) return conexion;
    conexion = new Promise((ok, mal) => {
      const r = indexedDB.open(NOMBRE, 2); // v2: tienda de fotos
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains(TIENDA)) db.createObjectStore(TIENDA);
        if (!db.objectStoreNames.contains(FOTOS)) db.createObjectStore(FOTOS);
      };
      r.onsuccess = () => ok(r.result);
      r.onerror = () => mal(r.error);
    });
    return conexion;
  }

  async function op(tienda, modo, fn) {
    const db = await abrir();
    return new Promise((ok, mal) => {
      const tx = db.transaction(tienda, modo);
      const r = fn(tx.objectStore(tienda));
      tx.oncomplete = () => ok(r && r.result);
      tx.onerror = tx.onabort = () => mal(tx.error);
    });
  }

  async function cargar() {
    if (window.WALLET_PREVIEW) return JSON.parse(JSON.stringify(window.WALLET_PREVIEW));
    return (await op(TIENDA, 'readonly', s => s.get(CLAVE))) || null;
  }
  async function guardar(datos) {
    if (window.WALLET_PREVIEW) return;
    await op(TIENDA, 'readwrite', s => s.put(datos, CLAVE));
  }
  async function borrarTodo() {
    if (window.WALLET_PREVIEW) { memoria.clear(); return; }
    await op(TIENDA, 'readwrite', s => s.delete(CLAVE));
    await op(FOTOS, 'readwrite', s => s.clear());
  }

  // Fotos: valor = {data: 'data:image/jpeg;base64,…'} o {caja: …} si está cifrada con la bóveda.
  async function guardarFoto(id, valor) {
    if (window.WALLET_PREVIEW) { memoria.set(id, valor); return; }
    await op(FOTOS, 'readwrite', s => s.put(valor, id));
  }
  async function leerFoto(id) {
    if (window.WALLET_PREVIEW) return memoria.get(id) || null;
    return (await op(FOTOS, 'readonly', s => s.get(id))) || null;
  }
  async function todasLasFotos() {
    if (window.WALLET_PREVIEW) return Object.fromEntries(memoria);
    const db = await abrir();
    return new Promise((ok, mal) => {
      const out = {}, tx = db.transaction(FOTOS, 'readonly'), r = tx.objectStore(FOTOS).openCursor();
      r.onsuccess = () => { const c = r.result; if (c) { out[c.key] = c.value; c.continue(); } };
      tx.oncomplete = () => ok(out); tx.onerror = () => mal(tx.error);
    });
  }

  return { cargar, guardar, borrarTodo, guardarFoto, leerFoto, todasLasFotos };
})();
