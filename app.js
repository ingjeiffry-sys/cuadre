// Pantallas y acciones. Lógica de dinero en logica.js, planes.js y prestamos.js; cifrado en boveda.js; teléfono en sistema.js.
// Las secciones Planes y Calculadora están en secciones.js (reciben el contexto W).
(function () {
  'use strict';
  const APP_VERSION = '17';
  const L = window.Logica, T = window.T, G = window.Graficas, B = window.Boveda, PL = window.Planes, PR = window.Prestamos, S = window.Sistema;
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const ICON = {
    inicio: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    analisis: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    cuentas: '<rect x="2.5" y="5" width="19" height="14" rx="3"/><path d="M2.5 10h19M6.5 15h4"/>',
    planes: '<rect x="3.5" y="4.5" width="17" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3.5 10h17M8 14h3M8 17h6"/>',
    ajustes: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    calc: '<rect x="4.5" y="2.5" width="15" height="19" rx="3"/><path d="M8 6.5h8M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5v3.5M8.5 18h.01M12 18h.01"/>',
    mas: '<path d="M12 5v14M5 12h14"/>',
    ojo: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    ojoNo: '<path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.9 8.3 2 12 2 12s3.6 7 10 7a9.8 9.8 0 0 0 5.4-1.6"/>',
    candado: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    flechas: '<path d="M7 7h13l-4-4M17 17H4l4 4"/>',
    llama: '<path d="M12 22c4 0 7-2.7 7-6.6 0-3.4-2.3-5.6-3.6-7.4-.4 1.8-1.5 3-2.6 3.4.3-2.9-.9-6.4-3.8-8.4.2 3.2-1.7 5.3-3.1 7.1C4.7 11.8 5 13.2 5 15.4 5 19.3 8 22 12 22z"/>',
    huella: '<path d="M7 11a5 5 0 0 1 10 0c0 3 .5 5.5 1.5 7.5M12 11c0 4 .7 7.3 2.3 10M9.5 21c-1.2-2.8-1.8-5.8-1.8-9.3M4.5 8.5A8 8 0 0 1 19 7M3.5 13.5c0-1.3.2-2.6.6-3.8M20.4 15.2c.1-.8.1-1.6.1-2.4"/>',
    campana: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4zM10 20a2 2 0 0 0 4 0"/>',
    abajo: '<path d="M12 4v14M6 12l6 6 6-6"/>', arriba: '<path d="M12 20V6M6 12l6-6 6 6"/>',
    // v10: íconos vivos de Inicio (las clases an-* se animan en estilos.css; quietos con prefers-reduced-motion)
    mover: '<path class="an-der" d="M7 7h13l-4-4"/><path class="an-izq" d="M17 17H4l4 4"/>',
    brujula: '<circle cx="12" cy="12" r="9"/><path class="an-gira" d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8z"/>',
    camara: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path class="an-escanea" d="M6.5 12h11"/>',
    calendario: '<rect x="3.5" y="4.5" width="17" height="16" rx="3"/><path d="M8 2.5v4M16 2.5v4M3.5 10h17"/><circle class="an-punto" cx="12" cy="15.2" r="1.7"/>',
  };
  const ico = (n, cls = '') => `<svg class="ico-svg ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICON[n]}</svg>`;

  let D = L.vacio();      // datos en pantalla (con lo privado solo si la bóveda está abierta)
  let sesion = null;      // llave de la bóveda en memoria (nunca se guarda)
  let tab = 'inicio';
  let extraProy = 0;
  let bloqueada = false;  // candado de la app activo en pantalla
  let huellaOk = false;   // el teléfono tiene huella
  let salioEn = 0;
  let tabPintado = '';    // para animar la entrada solo al cambiar de pestaña
  let catGasto = '';      // categoría elegida en la dona de Inicio

  // ---------- guardar y avisos ----------
  let guardando = 0; // la versión nueva no se aplica a mitad de un guardado
  async function guardar(msg) {
    guardando++;
    try {
      const mis = L.misiones(D), ya = D.ajustes.misionesCelebradas || [];
      const nuevas = mis.lista.filter(x => x.hecho && !ya.includes(x.id)).map(x => x.id);
      if (nuevas.length) { D.ajustes.misionesCelebradas = ya.concat(nuevas); msg = T.misionCumplida(T.misiones[nuevas[nuevas.length - 1]].t); confeti(); }
      const yaL = D.ajustes.logrosCelebrados || [];
      const nuevosL = window.Consejos.logros(D).lista.filter(x => x.hecho && !yaL.includes(x.id)).map(x => x.id);
      if (nuevosL.length) { D.ajustes.logrosCelebrados = yaL.concat(nuevosL); msg = T.logroNuevo(T.logros[nuevosL[nuevosL.length - 1]].t); confeti(); }
      msg = revisarCelebraciones() || msg;
      let aGuardar = D;
      if (D.boveda && sesion) {
        const { publico, privado } = L.dividir(D);
        aGuardar = { ...publico, boveda: await B.sellar(sesion, privado) };
        D.boveda = aGuardar.boveda;
      }
      await DB.guardar(aGuardar);
      actualizarWidget();
      if (msg) aviso(msg);
      programarAvisos();
    } catch (e) { console.error(e); aviso(T.errorGuardar, true); }
    finally { guardando--; }
    pintar();
  }
  let tAviso, avisoHasta = 0;
  const ocultarAviso = () => { clearTimeout(tAviso); avisoHasta = 0; $('#aviso').className = 'aviso'; };
  // El temporizador puede no correr si Android pausó la app; al volver o al tocar, se quita el aviso vencido.
  const revisarAviso = () => { if (avisoHasta && Date.now() >= avisoHasta) ocultarAviso(); };
  function aviso(txt, error) {
    const a = $('#aviso');
    a.textContent = txt; a.className = 'aviso visible' + (error ? ' error' : '');
    avisoHasta = Date.now() + 2400;
    clearTimeout(tAviso); tAviso = setTimeout(ocultarAviso, 2400);
  }
  let tProg;
  function programarAvisos() {
    if (!S.esApk()) return;
    clearTimeout(tProg);
    tProg = setTimeout(() => S.programar(PL.avisos(D, Date.now(), T), D.ajustes.avisos !== false), 1200);
  }

  // Confeti: lluvia (misiones y logros). Con grande, además dos cañones desde abajo (metas y presupuesto cumplidos).
  function confeti(grande) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('div'); c.className = 'confeti'; c.setAttribute('aria-hidden', 'true');
    const acento = getComputedStyle(document.documentElement).getPropertyValue('--acento').trim() || '#7B61FF';
    const colores = [acento, '#FF8A65', '#FF5C8A', '#FFC93C', '#2EC4A0', '#A78BFA', '#4DA3FF'];
    const formas = ['', 'circulo', 'tira', 'estrella'], az = (a, b) => a + Math.random() * (b - a);
    const pieza = (i, o) => `<i class="${formas[i % 4]} ${o.cls || ''}" style="left:${o.left}%;background:${colores[i % colores.length]};animation-delay:${az(0, o.retraso || 0.3).toFixed(2)}s;--x:${o.x.toFixed(0)}px;--y:${(o.y || 0).toFixed(0)}px;--r:${az(-720, 720).toFixed(0)}deg"></i>`;
    let html = Array.from({ length: grande ? 50 : 36 }, (_, i) => pieza(i, { left: az(0, 100), x: az(-80, 80) })).join('');
    if (grande) for (const lado of [0, 1]) html += Array.from({ length: 45 }, (_, i) => pieza(i + lado, { cls: 'canon', left: lado ? 100 : 0, retraso: 0.15,
      x: (lado ? -1 : 1) * az(60, 260), y: -az(380, 760) })).join('');
    c.innerHTML = html;
    document.body.appendChild(c); setTimeout(() => c.remove(), grande ? 3400 : 2200);
  }
  // Celebración grande (como en Moniva): tarjeta al centro con el ícono que salta y confeti con cañones. No bloquea los toques.
  function celebrar(icono, titulo, texto) {
    confeti(true);
    document.querySelectorAll('.celebra').forEach(x => x.remove());
    const c = document.createElement('div'); c.className = 'celebra'; c.setAttribute('role', 'status');
    c.innerHTML = `<div class="celebra-caja"><span class="celebra-ico" aria-hidden="true">${icono}</span><b>${esc(titulo)}</b><small>${esc(texto)}</small></div>`;
    document.body.appendChild(c); setTimeout(() => c.remove(), 3600);
  }
  // Metas logradas y presupuesto del mes pasado cumplido: se celebran una vez. Lo que ya estaba cumplido al actualizar se marca en silencio.
  function revisarCelebraciones(silencio) {
    const a = D.ajustes, hoy = L.hoy(); let msg = '';
    const logradas = (D.metas || []).filter(m => !m.borrado && cuenta(m.cuentaId)).filter(m => { const e = PL.meta(D, m, hoy); return !e.oculta && e.lograda; });
    if (!a.metasCelebradas) { a.metasCelebradas = logradas.map(m => m.id); silencio = true; }
    const nueva = logradas.find(m => !a.metasCelebradas.includes(m.id));
    a.metasCelebradas = [...new Set(a.metasCelebradas.concat(logradas.map(m => m.id)))];
    if (nueva && !silencio) { msg = T.metaLogradaMsg(nueva.nombre); celebrar(nueva.icono || '🎯', T.metaLogradaT, msg); }
    const mp = L.mesAnterior(hoy.slice(0, 7));
    if (a.presCelebrado !== mp && !msg) { // si ya se celebró una meta, el presupuesto espera al próximo guardado
      const pr = L.presupuesto(D, mp), cumplio = pr.limite > 0 && pr.usado > 0 && pr.usado <= pr.limite;
      if (a.presCelebrado !== undefined && cumplio && !silencio) { msg = T.presCumplido(mesCorto(mp)); celebrar('🏅', T.presCumplidoT, msg); }
      a.presCelebrado = mp;
    }
    return msg;
  }
  // Montos que se achican solos para no cortarse (nunca menos de 12 px).
  function ajustarMontos(raiz) {
    (raiz || document).querySelectorAll('.hero-monto, .cartera-saldo, .resumen-filas b, .hero-mes b, .fila .monto, .anillo-centro b').forEach(el => {
      el.style.fontSize = '';
      let t = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.clientWidth + 1 && t > 12) { t -= 1; el.style.fontSize = t + 'px'; }
    });
  }
  // Cifras que cuentan desde el valor anterior hasta el nuevo (el saldo de Inicio).
  const cifras = new Map();
  function animarCifras() {
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelectorAll('[data-contar]').forEach(el => {
      const fin = Number(el.dataset.contar), mon = el.dataset.mon, clave = el.dataset.clave || 'hero';
      const ini = cifras.has(clave) ? cifras.get(clave) : 0; cifras.set(clave, fin);
      if (quieto || ini === fin) return;
      const t0 = performance.now(), dur = 750;
      const paso = t => {
        if (!el.isConnected) return;
        const k = Math.min(1, Math.max(0, (t - t0) / dur)), e = 1 - Math.pow(1 - k, 3);
        el.textContent = L.formato(Math.round(ini + (fin - ini) * e), mon);
        if (k < 1) requestAnimationFrame(paso); else ajustarMontos(el.parentNode);
      };
      requestAnimationFrame(paso);
    });
  }

  // ---------- v11: pagos fijos que se anotan solos, widget de Android y archivos para compartir ----------
  // Pagos fijos con «Anotar solo»: el día del pago (o al abrir la app después) se anota el gasto. Solo desde el día en que se activó.
  function autoAnotar() {
    const hoy = L.hoy(); let n = 0;
    for (const p of PL.pendientes(D, hoy, 0)) {
      if (p.tipo !== 'fijo' || p.fecha > hoy) continue;
      const f = (D.fijos || []).find(x => x.id === p.id), c = f && cuenta(f.cuentaId);
      if (!f || !f.auto || !f.autoDesde || p.fecha < f.autoDesde || !c || c.borrado) continue;
      nuevoMov({ tipo: 'gasto', cuentaId: c.id, monto: f.monto, fecha: p.fecha, categoriaId: f.categoriaId, nota: f.nombre, ref: { tipo: 'fijo', id: f.id, periodo: p.fecha }, auto: true });
      n++;
    }
    return n;
  }
  // Widget de la pantalla de inicio (solo en el APK): saldo y gasto de hoy. Con candado o montos ocultos no muestra cifras.
  const pluginWidget = () => window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.WalletWidget;
  function actualizarWidget() {
    const w = pluginWidget(); if (!w) return;
    const pub = D.boveda && sesion ? L.dividir(D).publico : D, hoy = L.hoy(), tapar = oculto() || !!D.ajustes.bloqueoApp;
    const gHoy = pub.movimientos.filter(m => !m.borrado && m.tipo === 'gasto' && m.fecha === hoy)
      .reduce((a, m) => a + (L.aPrincipal(D, m.monto + (m.impuesto || 0), (cuenta(m.cuentaId) || {}).moneda || P()) || 0), 0);
    w.actualizar({ saldo: tapar ? '••••' : L.formato(L.resumen(pub, hoy).total, P()), hoy: tapar ? T.widgetOculto : T.widgetHoy(L.formato(gHoy, P())) }).catch(() => {});
  }
  // «＋ Anotar» del widget: abre Anotar (después del candado, si lo hay).
  async function accionWidget() {
    const w = pluginWidget(); if (!w) return;
    try {
      const r = await w.pendiente();
      if (r && r.accion === 'gasto') { guardarBorrador({ t: Date.now(), campos: { tipo: 'gasto', fecha: L.hoy() } }); reanudarBorrador(); }
    } catch (e) { console.warn('widget', e); }
  }
  // Guarda un archivo y abre «Compartir» en el APK; en la web lo descarga. Devuelve true si salió bien.
  async function compartirArchivo(nombre, texto, tipo) {
    const Pl = window.Capacitor && window.Capacitor.Plugins;
    try {
      salioEn = -1; // compartir saca la app un momento: no cerrar el candado por eso
      if (Pl && Pl.Filesystem && Pl.Share) {
        const r = await Pl.Filesystem.writeFile({ path: nombre, data: texto, directory: 'CACHE', encoding: 'utf8' });
        await Pl.Share.share({ title: nombre, url: r.uri });
      } else if (/Android|iPhone|iPad/i.test(navigator.userAgent) && navigator.canShare && navigator.canShare({ files: [new File([texto], nombre, { type: tipo })] })) {
        await navigator.share({ title: nombre, files: [new File([texto], nombre, { type: tipo })] });
      } else {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([texto], { type: tipo }));
        a.download = nombre; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 5000);
      }
      return true;
    } catch (e) { if (!/cancel/i.test(String(e))) { console.error(e); aviso(String(e.message || e), true); } return false; }
    finally { setTimeout(() => { if (salioEn === -1) salioEn = 0; }, 1500); }
  }
  // Exportar lo que se ve en Movimientos (con sus filtros) a CSV, que abre en Excel o Google Sheets.
  function exportarCsv() {
    const q = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const filas = movsFiltrados().map(m => {
      const c = cuenta(m.cuentaId) || {}, d = (m.cuentaDestinoId && cuenta(m.cuentaDestinoId)) || {};
      const signo = m.tipo === 'gasto' || m.tipo === 'transferencia' ? -1 : 1;
      return [m.fecha, T[m.tipo] || m.tipo, c.nombre, d.nombre, m.categoriaId ? catNombre(m.categoriaId) : '', m.nota, m.lugar,
        (signo * m.monto / 100).toFixed(2), c.moneda, m.impuesto ? (m.impuesto / 100).toFixed(2) : ''].map(q).join(',');
    });
    const texto = '\ufeff' + [T.csvCabecera.map(q).join(',')].concat(filas).join('\r\n');
    compartirArchivo(`wallet-movimientos-${L.hoy()}.csv`, texto, 'text/csv').then(ok => { if (ok) aviso(T.exportado(filas.length)); });
  }
  // «Me deben»: una cuenta por persona para lo que se dividió (sin plan de cuotas). Se reusa si ya existe.
  function cuentaMeDebe(nombre, moneda) {
    const n = nombre.toLowerCase();
    let c = cuentasVivas().find(x => x.tipo === 'porCobrar' && !x.plan && !x.castigado && x.moneda === moneda && String(x.persona || '').toLowerCase() === n);
    if (c) return c;
    const t = ahora();
    c = { id: L.uuid(), nombre: T.meDebe(nombre), persona: nombre, moneda, icono: '🤝', tipo: 'porCobrar', privada: false, creado: t, editado: t, borrado: false };
    D.cuentas.push(c); nuevoMov({ tipo: 'saldo', cuentaId: c.id, monto: 0, fecha: L.hoy() });
    return c;
  }
  // Cambiar la categoría con un toque (desde el ícono de la fila).
  function hojaCambiarCat(m) {
    if (!m) return;
    const t = m.tipo === 'ingreso' ? 'ingreso' : 'gasto', actual = L.padreDe(D, m.categoriaId);
    const cs = D.categorias.filter(c => !c.borrado && !c.oculta && !c.padre && c.tipo === t);
    const f = abrirHoja(`<h2>${T.cambiarCat}</h2><p class="nota">${esc(m.nota || m.lugar || catNombre(m.categoriaId))} · ${din(m.monto, (cuenta(m.cuentaId) || {}).moneda)}</p>
      <div class="cat-rapida">${cs.map(c => `<button type="button" class="chip-btn" data-elegir-cat="${esc(c.id)}" aria-pressed="${actual === c.id}" style="--c:${c.color}">${c.icono} ${esc(catNombre(c.id))}</button>`).join('')}</div>
      <div class="acciones uno"><button type="button" class="pildora" data-cerrar>${T.cerrar}</button></div>`, () => {}, { sinAcciones: true });
    f.querySelectorAll('[data-elegir-cat]').forEach(b => b.onclick = () => { m.categoriaId = b.dataset.elegirCat; m.editado = ahora(); hoja().close(); guardar(T.categoriaCambiada); });
  }
  // Te quedan X hasta tu próximo cobro: lo de las cuentas de uso menos lo que hay que pagar antes, entre los días que faltan.
  function tarjetaCobro() {
    const hoy = L.hoy();
    const prox = (D.nominas || []).filter(n => !n.borrado).map(n => L.proximaFecha(n.rec, L.sumarDias(hoy, 1))).filter(Boolean).sort()[0];
    if (!prox) return '';
    const dias = Math.max(1, L.diasEntre(hoy, prox));
    const enUso = cuentasVivas().filter(c => c.tipo === 'diaria').reduce((a, c) => a + (L.aPrincipal(D, L.saldoCuenta(D, c.id), c.moneda) || 0), 0);
    const apartar = PL.pendientes(D, hoy, dias).filter(p => p.fecha < prox && !['nomina', 'cobro'].includes(p.tipo))
      .reduce((a, p) => a + (L.aPrincipal(D, p.monto, ['tarjeta', 'cuota'].includes(p.tipo) ? cuenta(p.id).moneda : P()) || 0), 0);
    const libre = enUso - apartar;
    return `<section class="tarjeta perspectiva cobro ${libre < 0 ? 'falta' : ''}"><span class="burbuja">💼</span><div><small>${T.proxCobro(dias, fechaCorta(prox))}</small>
      <p>${libre < 0 ? T.cobroFalta(`<b>${din(-libre)}</b>`) : T.cobroPorDia(`<b>${din(Math.floor(libre / dias))}</b>`)}</p>
      <small>${T.cobroDetalle(din(enUso), din(apartar))}</small></div></section>`;
  }
  // Estado de cuenta de la tarjeta por fecha de corte: [desde, hasta] del período actual o del último corte.
  function periodoCorte(c, anterior) {
    const h = L.hoy(), enMes = m => `${m}-${String(Math.min(c.diaCorte, L.diasDelMes(m))).padStart(2, '0')}`;
    let mes = h.slice(0, 7), corte = enMes(mes);
    if (corte > h) { mes = L.mesAnterior(mes); corte = enMes(mes); }
    const previo = enMes(L.mesAnterior(mes));
    return anterior ? [L.sumarDias(previo, 1), corte] : [L.sumarDias(corte, 1), h];
  }
  function estadoCorte(c) {
    const [a, b] = periodoCorte(c, true), corr = L.saldosCorridos(D, c.id).despues;
    const ult = D.movimientos.filter(m => !m.borrado && (m.cuentaId === c.id || m.cuentaDestinoId === c.id) && m.fecha <= b).sort(L.orden).pop();
    const s = ult && corr.has(ult.id) ? corr.get(ult.id) : 0;
    const pago = c.diaPago ? L.proximaFecha({ frec: 'mensual', dia: c.diaPago }, L.sumarDias(b, 1)) : null;
    return `<section class="tarjeta estado-corte"><h2>🧾 ${T.estadoCuenta}</h2><p class="nota">${T.estadoPeriodo(fechaCorta(a), fechaCorta(b))}</p>
      <p class="grande">${T.saldoAlCorte} <b>${din(Math.max(0, -s), c.moneda)}</b></p>${pago ? `<small>${T.pagarAntesDe(fechaCorta(pago))}</small>` : ''}</section>`;
  }
  // Lo de siempre: gastos que se repiten (misma categoría, nota, monto y cuenta) en los últimos 90 días.
  function frecuentes() {
    const desde = L.sumarDias(L.hoy(), -90), n = new Map();
    for (const x of D.movimientos) {
      if (x.borrado || x.tipo !== 'gasto' || x.fecha < desde || x.ref || !cuenta(x.cuentaId) || !x.categoriaId) continue;
      const k = [x.categoriaId, x.nota, x.monto, x.cuentaId].join('|'), v = n.get(k);
      if (v) v.n++; else n.set(k, { m: x, n: 1 });
    }
    return [...n.values()].filter(v => v.n >= 2).sort((a, b) => b.n - a.n).slice(0, 4).map(v => v.m);
  }
  // % del presupuesto de una categoría en el mes actual (null si no tiene presupuesto).
  const usoCat = id => { const fl = L.presupuesto(D, L.hoy().slice(0, 7)).filas.find(x => x.id === id); return fl && fl.limite ? fl.gastado / fl.limite : null; };

  // ---------- PWA (web): instalar, versión nueva y almacenamiento persistente ----------
  const instalada = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const esIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const webSuelta = () => !S.esApk() && !instalada(); // en el navegador sin instalar: Safari puede borrar los datos si no se usa
  let swEspera = null; // el aviso de instalar de Chrome lo guarda index.html en window.__instalar (llega antes que la app)
  window.addEventListener('appinstalled', () => { window.__instalar = null; pintar(); });
  function mostrarInstalar() {
    if (!webSuelta()) return false;
    try { const x = localStorage.getItem('cuadre-instalar-oculto'); return !x || Date.now() - Number(x) > 7 * 864e5; } catch { return true; }
  }
  const tarjetaInstalar = () => mostrarInstalar() ? `<section class="tarjeta instalar"><span class="burbuja">📲</span><div class="txt"><b>${T.instalarTit}</b><small>${T.instalarTxt}</small></div>
    <div class="acciones"><button class="enlace" data-accion="instalar-luego">${T.ahoraNo}</button><button class="pildora oscura" data-accion="instalar">${T.instalar}</button></div></section>` : '';
  async function instalar() {
    const nativo = window.__instalar; // Android y PC con Chrome o Edge: la ventana de instalación de un toque
    if (nativo) { window.__instalar = null; nativo.prompt(); const r = await nativo.userChoice.catch(() => ({})); if (r.outcome === 'accepted') return; }
    const pasos = esIOS() ? T.pasosIOS : /Android/i.test(navigator.userAgent) ? T.pasosAndroid : T.pasosPC;
    abrirHoja(`<h2>📲 ${T.instalarTit}</h2><p class="nota">${T.instalarPor}</p><ol class="pasos-instalar">${pasos.map(p => `<li>${p}</li>`).join('')}</ol>
      <div class="acciones uno"><button type="button" class="pildora oscura" data-cerrar>${T.entendido}</button></div>`, () => {}, { sinAcciones: true });
  }
  // Respaldo: 7 días en la app instalada; en el navegador sin instalar, a los 3 días y con un aviso más fuerte.
  function avisoRespaldo() {
    const u = D.ajustes.ultimoRespaldo, suelta = webSuelta();
    const viejo = suelta && D.movimientos.some(m => !m.borrado) && (!u || L.diasEntre(u.slice(0, 10), L.hoy()) >= 3);
    if (!L.necesitaRespaldo(D) && !viejo) return '';
    return `<button class="banda ${suelta ? 'fuerte' : ''}" data-tab-ir="ajustes">⚠️ ${suelta ? T.avisoRespaldoWeb : T.avisoRespaldo}</button>`;
  }
  // La versión nueva se aplica de una vez (Android e iPhone): enseguida si no hay un formulario abierto;
  // si lo hay, al salir de la app (el borrador ya quedó guardado) o al tocar el aviso. Después se recarga y migrar() corre igual.
  let pidioVersion = false;
  function aplicarVersion() { if (!swEspera) return; guardarBorradorActivo(); pidioVersion = true; swEspera.postMessage('saltar'); }
  document.addEventListener('visibilitychange', () => { if (document.hidden && swEspera && !guardando) aplicarVersion(); });
  function registrarSw() {
    navigator.serviceWorker.register('sw.js').then(reg => {
      const avisar = w => { swEspera = w; if (!hoja().open && !guardando) aplicarVersion(); else pintar(); };
      if (reg.waiting && navigator.serviceWorker.controller) avisar(reg.waiting);
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) avisar(w); });
      });
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
    }).catch(e => console.warn('sw', e));
    let recargando = false; // la versión nueva toma el control: se recarga una vez (migrar() corre al abrir; los saldos no cambian)
    // solo recarga cuando se aplicó una versión nueva (en la primera visita el service worker toma el control sin recargar)
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (pidioVersion && !recargando) { recargando = true; location.reload(); } });
  }

  // ---------- ayudas ----------
  const P = () => D.ajustes.monedaPrincipal;
  const oculto = () => !!D.ajustes.ocultarMontos;
  const din = (c, m, corto) => (oculto() ? '<span class="oculto">••••</span>' : L.formato(c, m || P(), corto));
  const cuentasVivas = () => D.cuentas.filter(c => !c.borrado);
  const cuenta = id => D.cuentas.find(c => c.id === id);
  const cat = id => D.categorias.find(c => c.id === id) || { icono: '•', color: '#8E8E93' };
  const catNombre = id => cat(id).nombre || T.cat[id] || ''; // el nombre que puso el usuario manda
  const ahora = (ms) => new Date(Date.now() + (ms || 0)).toISOString();
  const bovedaAbierta = () => !!(D.boveda && sesion);
  const aInput = c => (c ? (c / 100).toFixed(2) : '');
  const sim = m => L.MONEDAS[m] || m;
  function fechaCorta(f) {
    const [y, m, d] = f.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-DO', { day: 'numeric', month: 'short' });
  }
  const mesCorto = m => new Date(Number(m.slice(0, 4)), Number(m.slice(5, 7)) - 1, 1).toLocaleDateString('es-DO', { month: 'short' }).replace('.', '');
  const nuevoMov = (datos, ms) => { const t = ahora(ms); const m = { id: L.uuid(), creado: t, editado: t, borrado: false, categoriaId: null, nota: '', ...datos }; D.movimientos.push(m); return m; };
  const esPasivo = c => c.tipo === 'credito' || c.tipo === 'deuda';

  // ---------- fotos de facturas ----------
  // Pide una imagen (cámara o galería). En el APK usa el plugin; en la web, un <input type=file>. Devuelve {data (JPEG comprimido), uri}.
  async function pedirImagen(origen) {
    if (S.hayCamara()) { // guardada: liviana; para leer: más grande y nítida
      const r = await S.foto(origen); if (!r || !r.webPath) return null;
      return { data: await comprimir(r.webPath), ocr: await comprimir(r.webPath, 2000, 0.9) };
    }
    const archivo = await new Promise(ok => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*'; if (origen === 'camara') i.capture = 'environment';
      i.onchange = () => ok(i.files[0] || null); i.click();
    });
    if (!archivo) return null;
    const url = URL.createObjectURL(archivo);
    try { return { data: await comprimir(url), ocr: await comprimir(url, 2000, 0.9) }; } finally { URL.revokeObjectURL(url); }
  }
  // Para guardar: máximo 1280 px y JPEG al 60 % (~150 KB). Para leer el texto: 2000 px al 90 %.
  async function comprimir(src, max = 1280, calidad = 0.6) {
    const img = new Image(); img.src = src; await img.decode();
    const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', calidad);
  }
  const valorFoto = async (data, privada) => (privada && sesion ? { caja: await B.sellar(sesion, { data }) } : { data });
  async function verFoto(id) {
    const v = await DB.leerFoto(id);
    if (!v) return null;
    if (v.caja) return sesion ? (await B.abrirCon(sesion, v.caja)).data : null;
    return v.data;
  }
  // Foto a pantalla completa dentro de la hoja abierta (no cierra el formulario).
  function verFotoGrande(src) {
    if (!src) return;
    const v = document.createElement('div'); v.className = 'visor';
    v.innerHTML = `<img src="${esc(src)}" alt="${T.fotoFactura}"><button type="button" class="pildora oscura">${T.cerrar}</button>`;
    v.onclick = () => v.remove();
    (hoja().open ? hoja() : document.body).appendChild(v);
  }

  // ---------- diseño (5 temas) y modo claro/oscuro ----------
  const TEMAS = ['lavanda', 'vidrio', 'atardecer', 'oceano', 'menta', 'tech', 'princesa', 'rosado', 'naturaleza'];
  const MUESTRAS = { lavanda: ['linear-gradient(160deg,#E6E1FA,#C9C3F4)', '#111015'], vidrio: ['linear-gradient(160deg,#E4DCFF,#FFD9C8)', '#16132A'],
    atardecer: ['linear-gradient(160deg,#FFD8C2,#F7A1AE)', '#2B1D1A'], oceano: ['linear-gradient(180deg,#E6F6FF 40%,#5FB4E8)', '#0B5E8E'], menta: ['linear-gradient(160deg,#E2F7C9,#BDEEDB)', '#0F2E27'],
    tech: ['repeating-linear-gradient(0deg,#0B1220 0 9px,#14304A 9px 10px)', '#00E5FF'], princesa: ['linear-gradient(160deg,#EEF2F8,#A9BCD9)', '#4F6E9C'],
    rosado: ['linear-gradient(160deg,#FFE6F0,#FFB0CC)', '#D6336C'], naturaleza: ['linear-gradient(160deg,#F1F0E2,#B9CF94)', '#3F5F2A'] };
  const mqOscuro = matchMedia('(prefers-color-scheme: dark)');
  function aplicarTema() {
    const h = document.documentElement, tema = TEMAS.includes(D.ajustes.tema) ? D.ajustes.tema : 'lavanda', modo = D.ajustes.modo || 'auto';
    h.dataset.tema = tema;
    if (modo === 'oscuro' || (modo === 'auto' && mqOscuro.matches)) h.dataset.oscuro = ''; else delete h.dataset.oscuro;
    try { localStorage.setItem('wallet-tema', JSON.stringify({ tema, modo })); } catch { /* solo acelera el primer pintado */ }
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = getComputedStyle(h).getPropertyValue('--fondo').trim();
  }
  mqOscuro.addEventListener('change', () => aplicarTema());

  // ---------- pantallas ----------
  function pintar() {
    aplicarTema();
    if (bloqueada) return;
    const enNav = tab === 'cuentas' || tab === 'movimientos' ? 'cartera' : tab;
    document.querySelectorAll('nav [data-tab], header [data-tab]').forEach(b => b.setAttribute('aria-current', b.dataset.tab === enNav ? 'page' : 'false'));
    const h = new Date().getHours();
    $('#fecha').textContent = new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' });
    $('#titulo').textContent = tab === 'inicio' ? T.saludos[Math.floor(h / 6)] : T[tab];
    if (tab === 'movimientos') tab = 'cartera';
    const vistas = { inicio: vInicio, analisis: vAnalisis, cuentas: vCuentas, ajustes: vAjustes, planes: X.vPlanes, calculadora: X.vCalculadora, cartera: vCartera };
    const v = $('#vista'); v.innerHTML = (swEspera ? `<button class="banda nueva" data-accion="actualizar">🔄 ${T.versionNueva}</button>` : '') + (vistas[tab] || vInicio)();
    if (tab !== tabPintado) { v.classList.remove('entra'); void v.offsetWidth; v.classList.add('entra'); tabPintado = tab; }
    animarCifras(); ajustarMontos();
    const s = $('#extra'); if (s) s.oninput = () => { extraProy = Number(s.value) * 100; pintarProy(); };
    if (X.alPintar) X.alPintar(tab);
  }

  // op (historial de una cuenta): {saldo, moneda, propio, multi} -> muestra el saldo después del movimiento, como el banco.
  function filaMov(m, op) {
    const c = cuenta(m.cuentaId) || { nombre: T.hacia_boveda, moneda: P() };
    let titulo, icono, monto, clase = '', color, mon = c.moneda;
    if (m.tipo === 'transferencia') {
      const dst = cuenta(m.cuentaDestinoId);
      titulo = `${c.nombre} → ${dst ? dst.nombre : T.hacia_boveda}`; icono = '↔️'; monto = -m.monto; color = '#8E8E93';
      if (op && op.propio === m.cuentaDestinoId) { monto = m.montoDestino; mon = dst.moneda; clase = 'pos'; }
    } else if (m.tipo === 'saldo') { titulo = T.saldo; icono = '⚖️'; monto = m.monto; color = '#8E8E93'; }
    else {
      titulo = catNombre(m.categoriaId) || m.nota || m.lugar; icono = cat(m.categoriaId).icono; color = cat(m.categoriaId).color;
      monto = m.tipo === 'gasto' ? -m.monto : m.monto; clase = m.tipo === 'gasto' ? '' : 'pos';
    }
    const extra = [m.tipo === 'transferencia' ? T.transferencia : esc(c.nombre), fechaCorta(m.fecha)];
    if (m.tipo === 'gasto' || m.tipo === 'ingreso') { const det = [m.nota, m.lugar].filter(x => x && x !== titulo).map(esc).join(' · '); if (det) extra.unshift(det); }
    if (m.conQuien) extra.push(T.quien[m.conQuien]);
    if (m.monedaOriginal) extra.push(L.formato(m.montoOriginal, m.monedaOriginal));
    if (m.impuesto) extra.push(`${T.imp} ${oculto() ? '••' : L.formato(m.impuesto, c.moneda)}`);
    if (m.foto) extra.push('📎');
    return `<li><button class="fila" data-mov="${esc(m.id)}">
      <span class="ico" style="--c:${color}" ${m.tipo === 'gasto' || m.tipo === 'ingreso' ? `data-cambiar-cat="${esc(m.id)}" title="${T.cambiarCat}"` : ''}>${icono}</span>
      <span class="txt"><b>${esc(titulo)}</b><small>${extra.join(' · ')}</small></span>
      <span class="monto ${clase}">${(m.tipo === 'ingreso' || clase === 'pos') && monto > 0 && !oculto() ? '+' : ''}${din(monto, mon)}
        ${op && op.saldo != null ? `<small class="saldo-tras">${T.saldoTras} ${op.multi ? sim(op.moneda) + ' ' : ''}${din(op.saldo, op.moneda)}</small>` : ''}</span></button></li>`;
  }

  function vGuia() {
    const m = L.misiones(D);
    if (D.ajustes.guiaOculta) return '';
    if (m.hechas === m.total) return `<section class="tarjeta guia completa"><p class="grande">${T.guiaCompleta}</p>
      <small>${T.niveles[3]} · ${m.xp} XP</small><button class="enlace" data-accion="ocultar-guia">${T.ocultarGuia}</button></section>`;
    const sig = m.lista.find(x => !x.hecho);
    return `<section class="tarjeta guia">
      <div class="guia-top"><div><h2>🎮 ${T.guia}</h2><small>${T.niveles[m.nivel]} · ${m.xp} XP</small></div>
        <b class="guia-cuenta">${m.hechas}/${m.total}</b></div>
      <div class="barra-prog xp"><i style="width:${Math.round((m.hechas / m.total) * 100)}%"></i></div>
      <ul class="misiones">${m.lista.map(x => `<li class="${x.hecho ? 'hecha' : ''} ${x.id === sig.id ? 'siguiente' : ''}">
        <button class="mision" data-mision="${x.id}" ${x.hecho ? 'disabled' : ''}>
          <span class="m-ico">${x.hecho ? '✓' : T.misiones[x.id].i}</span>
          <span class="txt"><b>${T.misiones[x.id].t}</b>${x.id === sig.id ? `<small>${T.misiones[x.id].d}</small>` : ''}</span>
          <span class="xp-chip">${x.hecho ? '' : '+100'}</span></button></li>`).join('')}</ul>
    </section>`;
  }

  function vPendientes() {
    const lista = PL.pendientes(D, L.hoy());
    if (!lista.length) return '';
    const cuando = p => (p.dias < 0 ? T.atrasado(-p.dias) : p.dias === 0 ? T.venceHoy : T.venceEn(p.dias));
    const boton = p => ({ fijo: T.pagar, nomina: T.registrar, tarjeta: T.pagar, cuota: T.pagar, cobro: T.cobrar, sam: T.pagar })[p.tipo];
    return `<section class="tarjeta pendientes"><div class="sub-fila"><h2>${ico('campana')} ${T.pendientes}</h2>${lista.length > 3 ? `<button class="enlace" data-accion="ver-pend">${T.verTodo} (${lista.length})</button>` : `<small>${lista.length}</small>`}</div>
      <ul class="lista-plana">${lista.slice(0, 3).map(p => `<li class="pend ${p.dias < 0 ? 'tarde' : p.dias <= 1 ? 'pronto' : ''}">
        <span class="ico">${p.icono || '•'}</span>
        <span class="txt"><b>${esc(p.tipo === 'nomina' ? T.cobrasteNomina(p.nombre) : p.nombre)}</b><small>${cuando(p)} · ${fechaCorta(p.fecha)}</small></span>
        <span class="pend-der"><b class="monto">${din(p.monto, p.tipo === 'tarjeta' || p.tipo === 'cuota' || p.tipo === 'cobro' ? cuenta(p.id).moneda : undefined)}</b>
        <button class="mini" data-pend="${p.tipo}|${esc(p.id)}|${p.fecha}|${p.ronda || ''}">${boton(p)}</button></span></li>`).join('')}</ul></section>`;
  }

  function vInicio() {
    if (!cuentasVivas().length && !D.boveda) {
      return `<section class="hero vacia"><h2>${T.bienvenida}</h2><p>${T.bienvenidaTxt}</p>
        <button class="pildora oscura" data-accion="nueva-cuenta">${T.crearCuenta}</button></section>${tarjetaInstalar()}${vGuia()}`;
    }
    const hoy = L.hoy(), r = L.resumen(D, hoy), rit = L.ritmoMes(D, hoy);
    const otras = Object.entries(r.porMoneda).filter(([m]) => m !== P());
    const pr = L.presupuesto(D, r.mes);
    const restantes = rit.dias - rit.pasados + 1;
    const movs = D.movimientos.filter(m => !m.borrado && m.tipo !== 'saldo').sort(L.orden).reverse().slice(0, 3);
    const queda = pr.limite - pr.usado;
    return `
      ${avisoRespaldo()}
      ${tarjetaInstalar()}
      <section class="hero">
        <div class="hero-top"><small>${T.patrimonio}</small>
          <button class="icono-btn" data-accion="ocultar" aria-label="${oculto() ? T.mostrar : T.ocultar}">${ico(oculto() ? 'ojoNo' : 'ojo')}</button></div>
        <strong class="hero-monto" ${oculto() ? '' : `data-contar="${r.total}" data-mon="${P()}"`}>${din(r.total)}</strong>
        <div class="chips-hero">
          ${otras.length ? `<span>${din(r.porMoneda[P()] || 0)}</span>` : ''}${otras.map(([m, v]) => `<span>${din(v, m)}</span>`).join('')}
          ${D.boveda ? `<button class="chip-boveda" data-accion="${sesion ? 'bloquear' : 'desbloquear'}">${ico('candado')} ${sesion ? T.bovedaAbierta : T.bovedaOculta}</button>` : ''}
        </div>
        ${r.faltaTasa ? `<p class="hero-nota">${T.faltaTasa}</p>` : ''}
        <div class="hero-mes">
          <div><small>${ico('abajo')} ${T.recibido}</small><b>${din(r.ingresos)}</b></div>
          <div><small>${ico('arriba')} ${T.gastado}</small><b>${din(r.gastos)}</b></div>
        </div>
        <div class="hero-botones"><button class="pildora clara" data-accion="gasto">${T.gasto}</button><button class="pildora oscura" data-accion="ingreso">${T.ingreso}</button></div>
      </section>
      <div class="rapidas">
        ${[['mover', 'mover', T.transferencia, 'lila'], ['ir-plan', 'brujula', T.miPlan, 'durazno'], ['escanear', 'camara', T.escanear, 'menta'], ['ir-fijos', 'calendario', T.fijos, 'rosa']]
          .map(([a, i, t, c]) => `<button class="rapida ${c}" data-accion="${a}"><span class="r-ico">${ico(i, 'vivo')}</span><small>${t}</small></button>`).join('')}
      </div>
      ${vPendientes()}
      <section class="tarjeta pres ${pr.limite ? L.nivel(pr.pct) : ''}">
        ${pr.limite ? `${G.anillo(pr.pct, { tam: 96, grosor: 11, clase: L.nivel(pr.pct), centro: `<b>${Math.round(pr.pct * 100)}%</b>` })}
          <div class="pres-txt"><h2>${T.presupuesto}</h2>
            <p class="grande">${queda >= 0 ? T.teQuedan : T.tePasaste} <b>${din(Math.abs(queda))}</b></p>
            <small>${T.diasRestantes(restantes)}${queda > 0 ? ` · ${din(Math.floor(queda / restantes))} ${T.porDia}` : ''}</small></div>`
        : `<div class="pres-txt"><h2>${T.presupuesto}</h2><p>${T.sinPresupuesto}</p>
            <button class="pildora oscura" data-accion="presupuesto">${T.crearPresupuesto}</button></div>`}
      </section>
      ${tarjetaGastos(r.mes)}
      <div class="sub-fila"><h2 class="sub">${T.ultimos}</h2><button class="enlace" data-accion="ver-movs">${T.verTodo}</button></div>
      ${movs.length ? `<ul class="lista">${movs.map(filaMov).join('')}</ul>` : `<p class="nota centro">${T.sinMovs}</p>`}`;
  }

  // Gastos del mes: dona que se toca (o los chips de abajo) para ver una categoría y sus gastos; la lista sigue debajo.
  function tarjetaGastos(mes) {
    const cats = L.porCategoria(D, mes); if (!cats.length) return '';
    const total = cats.reduce((a, x) => a + x.total, 0), el = cats.find(c => c.id === catGasto), sel = el ? el.id : '';
    const pct = v => Math.round((v / total) * 100);
    const centro = el ? `<span class="c-ico">${cat(sel).icono}</span><b>${din(el.total, P(), true)}</b><small>${pct(el.total)} %</small>`
      : `<small>${T.gastado}</small><b>${din(total, P(), true)}</b>`;
    const movs = el ? D.movimientos.filter(m => !m.borrado && m.tipo === 'gasto' && m.fecha.slice(0, 7) === mes && L.padreDe(D, m.categoriaId) === sel).sort(L.orden).reverse().slice(0, 4) : [];
    return `<section class="tarjeta gastos-mes"><div class="sub-fila"><h2>${T.gastosDelMes}</h2>${el ? `<button class="enlace" data-accion="gasto-cat" data-cat="">${T.todas}</button>` : ''}</div>
      <div class="dona-fila">${G.dona(cats.map(c => ({ valor: c.total, color: cat(c.id).color, id: c.id })), { centro, sel, accion: 'gasto-cat' })}</div>
      <div class="chips-cat">${cats.slice(0, 8).map(c => `<button class="chip-cat" data-accion="gasto-cat" data-cat="${esc(c.id)}" aria-pressed="${c.id === sel}" style="--c:${cat(c.id).color}">
        <span>${cat(c.id).icono}</span>${esc(catNombre(c.id))}<small>${pct(c.total)} %</small></button>`).join('')}</div>
      ${el ? `<ul class="lista">${movs.map(m => filaMov(m)).join('')}</ul>
        <button class="pildora ancho" data-accion="gastos-ver" data-cat="${esc(sel)}">${T.verGastosDe(esc(catNombre(sel)))}</button>` : `<p class="nota">${T.tocaCategoria}</p>`}
    </section>`;
  }

  // ¿Cómo vas? Salud por período (7 días a 1 año) con semáforo verde/amarillo/rojo y consejos según los datos.
  let periodoSalud = 30;
  function vSaludPeriodo() {
    const CS = window.Consejos, s = CS.saludPeriodo(D, periodoSalud, L.hoy());
    const fx = (v, m) => din(v, m);
    const icoC = { bien: '✅', ojo: '⚠️', mal: '⛔', info: 'ℹ️' };
    const textoC = c => {
      const x = c.datos;
      return ({ sinIngresos: T.cs.sinIngresos, gastasMas: T.cs.gastasMas(fx(x.monto)), ahorroBajo: T.cs.ahorroBajo(x.pct), ahorroAlto: T.cs.ahorroAlto(x.pct),
        ahorroMedio: T.cs.ahorroMedio(x.pct), presupuestoPasado: T.cs.presupuestoPasado(esc(catNombre(x.id)), fx(x.exceso)),
        subioGasto: T.cs.subioGasto(x.pct, esc(catNombre(x.id)), fx(x.monto)), bajoGasto: T.cs.bajoGasto(x.pct),
        muchosGustos: T.cs.muchosGustos(x.pct), top: T.cs.top(esc(catNombre(x.id)), fx(x.monto), x.pct) })[c.clave];
    };
    const cambio = s.cambio === null ? '—' : `${s.cambio > 0 ? '▲' : '▼'} ${Math.abs(Math.round(s.cambio * 100))} %`;
    const etq = x => (periodoSalud >= 90 ? mesCorto(x.hasta.slice(0, 7)) : fechaCorta(x.desde));
    return `<div class="pestanas filtros">${CS.PERIODOS.map(p => `<button data-accion="salud-periodo" data-p="${p}" aria-pressed="${p === periodoSalud}">${T.periodos[p]}</button>`).join('')}</div>
      <section class="tarjeta semaforo s-${s.nivel}">
        <div class="salud-top">${s.puntos === null ? '<span class="semaforo-ico">⚪</span>' : G.anillo(s.puntos / 100, { tam: 104, grosor: 12, clase: s.nivel, centro: `<b class="xl">${s.puntos}</b><small>de 100</small>` })}
          <div><h2>${T.comoVas}</h2><span class="pill-semaforo">${T.semaforo[s.nivel]}</span><small>${fechaCorta(s.desde)} – ${fechaCorta(s.hasta)}</small></div></div>
        ${s.puntos === null ? `<p class="nota">${T.sinDatosPeriodo}</p>` : `
        <div class="desglose seis">
          <div><small>${T.entro}</small><b class="pos">${fx(s.ingresos)}</b></div><div><small>${T.gastaste}</small><b class="neg">${fx(s.gastos)}</b></div>
          <div><small>${T.ahorraste}</small><b>${fx(s.ahorro)} <small>(${Math.round(s.tasa * 100)} %)</small></b></div><div><small>${T.gastoDiario}</small><b>${fx(s.gastoDiario)}</b></div>
          <div><small>${T.vsAnterior}</small><b class="${s.cambio > 0 ? 'neg' : 'pos'}">${cambio}</b></div>
          <div><small>${T.presupuestoUsado}</small><b>${s.limite ? Math.round((s.usado / s.limite) * 100) + ' %' : '—'}</b></div></div>
        <div class="leyenda-mini"><span><i class="a"></i>${T.recibido}</span><span><i class="b"></i>${T.gastado}</span></div>
        ${G.barras(s.serie.map(x => ({ etiqueta: etq(x), a: x.ingresos, b: x.gastos })))}
        <h3>${T.recomendaciones}</h3>
        <ul class="consejos-salud">${s.consejos.map(c => `<li class="c-${c.tipo}"><span>${icoC[c.tipo]}</span><p>${textoC(c)}</p></li>`).join('')}</ul>
        <small class="nota">${T.comoSeCalcula}</small>`}
      </section>`;
  }

  function vAnalisis() {
    const hoy = L.hoy(), mes = hoy.slice(0, 7), s = L.salud(D, hoy), p = L.promedios(D, hoy), r = L.resumen(D, hoy);
    const f = L.flujoMes(D, mes);
    const cats = L.porCategoria(D, mes), totalG = cats.reduce((a, x) => a + x.total, 0);
    const hist = L.historial(D, 6, hoy);
    const pr = L.presupuesto(D, mes);
    const nivelS = s.puntos >= 60 ? 'verde' : s.puntos >= 40 ? 'amarillo' : 'rojo';
    const rit = L.ritmoMes(D, hoy), pasado = L.flujoMes(D, L.mesAnterior(mes)).gastos, racha = L.racha(D, hoy);
    const metas = (D.metas || []).filter(m => !m.borrado).map(m => ({ m, e: PL.meta(D, m, hoy) })).filter(x => !x.e.oculta).slice(0, 3);
    const arriba = `${racha >= 2 ? `<p class="racha">${ico('llama')} ${T.racha(racha)}</p>` : ''}${tarjetaCobro()}${vGuia()}
      ${metas.length ? `<section class="tarjeta"><div class="sub-fila"><h2>🎯 ${T.metas}</h2><button class="enlace" data-accion="ir-metas">${T.verTodo}</button></div>
        ${metas.map(({ m, e }) => `<div class="metrica"><div class="m-top"><span>${m.icono || '🎯'} ${esc(m.nombre)}</span><b>${Math.round(e.pct * 100)} %</b></div>
          <div class="barra-prog xp"><i style="width:${Math.round(e.pct * 100)}%"></i></div><small>${din(e.actual, cuenta(m.cuentaId).moneda)} / ${din(m.objetivo, cuenta(m.cuentaId).moneda)}</small></div>`).join('')}</section>` : ''}
      ${rit.gastos ? `<section class="tarjeta perspectiva"><span class="burbuja">📈</span><div><small>${T.ritmo}</small>
        <p>${T.ritmoTxt(`<b>${din(rit.proyectado)}</b>`)}</p>
        ${pasado ? `<small class="${rit.proyectado > pasado ? 'neg' : 'pos'}">${T.vsMesPasado(Math.round((rit.proyectado / pasado - 1) * 100))}</small>` : ''}</div></section>` : ''}`;
    const metrica = (t, v, pct, meta) => `<div class="metrica ${pct >= 1 ? '' : pct >= 0.5 ? 'amarillo' : 'rojo'}"><div class="m-top"><span>${t}</span><b>${v}</b></div>
      <div class="barra-prog"><i style="width:${Math.round(Math.min(1, Math.max(0, pct)) * 100)}%"></i></div><small>${meta}</small></div>`;
    const subs = padre => Object.entries(f.porSub).filter(([id]) => id !== padre && L.padreDe(D, id) === padre).sort((a, b) => b[1] - a[1]);
    const quien = Object.entries(f.porQuien).sort((a, b) => b[1] - a[1]), totalQ = quien.reduce((a, x) => a + x[1], 0);
    const ing = Object.entries(f.porCatIng).sort((a, b) => b[1] - a[1]);
    return `${arriba}
      ${vSaludPeriodo()}
      <section class="tarjeta salud">
        <div class="salud-top">${G.anillo(s.puntos / 100, { tam: 124, grosor: 13, clase: nivelS, centro: `<b class="xl">${s.puntos}</b><small>de 100</small>` })}
          <div><h2>${T.salud}</h2><p class="grande nivel-${nivelS}">${T.saludNivel(s.puntos)}</p></div></div>
        ${p.ingresos || p.gastos ? `
          ${metrica(T.tasaAhorro, Math.round(s.tasaAhorro * 100) + ' %', s.tasaAhorro / 0.2, T.metaAhorro)}
          ${metrica(T.fondoEmergencia, T.meses(s.mesesEmergencia), s.mesesEmergencia / 6, T.metaFondo + (D.boveda && !sesion ? ' · 🔒' : ''))}
          ${pr.limite ? metrica(T.cumplePresupuesto, Math.round(pr.pct * 100) + ' %', s.ptsPres / 20, din(pr.usado) + ' / ' + din(pr.limite)) : ''}`
        : `<p class="nota">${T.sinDatos}</p>`}
      </section>
      <section class="tarjeta">
        <h2>${T.gastosCategoria}</h2>
        ${cats.length ? `<div class="dona-fila">${G.dona(cats.map(c => ({ valor: c.total, color: cat(c.id).color })), { centro: `<small>${T.gastado}</small><b>${din(totalG, P(), true)}</b>` })}</div>
          <ul class="leyenda">${cats.map(c => `<li><i style="background:${cat(c.id).color}"></i><span>${cat(c.id).icono} ${esc(catNombre(c.id))}</span>
            <small>${Math.round((c.total / totalG) * 100)} %</small><b>${din(c.total)}</b></li>
            ${subs(c.id).map(([id, v]) => `<li class="sub-ley"><i></i><span>${cat(id).icono} ${esc(catNombre(id))}</span><small></small><b>${din(v)}</b></li>`).join('')}`).join('')}</ul>`
        : `<p class="nota">${T.sinDatos}</p>`}
      </section>
      ${quien.length ? `<section class="tarjeta"><h2>${T.conQuienGastas}</h2>
        ${quien.map(([k, v]) => `<div class="metrica"><div class="m-top"><span>${T.quienIco[k]} ${T.quien[k]}</span><b>${din(v)}</b></div>
          <div class="barra-prog xp"><i style="width:${Math.round((v / totalQ) * 100)}%"></i></div></div>`).join('')}</section>` : ''}
      ${ing.length ? `<section class="tarjeta"><h2>${T.deDondeEntra}</h2><ul class="leyenda">${ing.map(([id, v]) => `<li><i style="background:${cat(id).color}"></i>
        <span>${cat(id).icono} ${esc(catNombre(id))}</span><small>${Math.round((v / f.ingresos) * 100)} %</small><b>${din(v)}</b></li>`).join('')}</ul></section>` : ''}
      <section class="tarjeta">
        <h2>${T.ingresosGastos}</h2>
        <div class="leyenda-mini"><span><i class="a"></i>${T.recibido}</span><span><i class="b"></i>${T.gastado}</span></div>
        ${G.barras(hist.map(h => ({ etiqueta: mesCorto(h.mes), a: h.ingresos, b: h.gastos })))}
      </section>
      <section class="tarjeta" id="proy" data-total="${r.total}" data-flujo="${p.flujo}">${tarjetaProy(r.total, p.flujo)}</section>
      ${X.vLogros(window.Consejos.logros(D, hoy))}
      <button class="pildora oscura ancho" data-accion="ir-plan">🧭 ${T.verMiPlan}</button>
      ${pr.filas.length ? `<section class="tarjeta"><h2>${T.presupuesto}</h2>
        ${pr.filas.map(fl => `<div class="metrica ${L.nivel(fl.gastado / fl.limite)}"><div class="m-top"><span>${cat(fl.id).icono} ${esc(catNombre(fl.id))}</span><b>${din(fl.gastado)} <small>/ ${din(fl.limite)}</small></b></div>
          <div class="barra-prog"><i style="width:${Math.round(Math.min(1, fl.gastado / fl.limite) * 100)}%"></i></div></div>`).join('')}
        <button class="pildora ancho" data-accion="presupuesto">${T.presupuesto}</button></section>` : ''}`;
  }
  function tarjetaProy(total, flujo) {
    const v = L.proyeccion(total, flujo, extraProy, 12);
    return `<h2>${T.proyeccion}</h2><p class="nota">${T.proyeccionTxt}</p>
      <strong class="proy-monto ${v[12] < total ? 'neg' : ''}">${din(v[12])}</strong>
      ${G.linea(v, { id: 'gp' })}
      <label class="deslizador"><span>${T.extraAhorro}: <b>${din(extraProy)}</b></span>
        <input type="range" id="extra" min="0" max="${Math.max(5000, Math.round(Math.abs(flujo) / 100 / 1000) * 1000 * 2 || 20000)}" step="500" value="${extraProy / 100}"></label>`;
  }
  function pintarProy() {
    const t = $('#proy'); if (!t) return;
    const total = Number(t.dataset.total), flujo = Number(t.dataset.flujo);
    const v = L.proyeccion(total, flujo, extraProy, 12);
    t.querySelector('.proy-monto').innerHTML = din(v[12]);
    t.querySelector('.linea').outerHTML = G.linea(v, { id: 'gp' });
    t.querySelector('.deslizador b').innerHTML = din(extraProy);
  }

  // ---------- cuentas ----------
  const COLORES_CC = [['#FFB199', '#FF7A85'], ['#B9A8FF', '#7B61FF'], ['#8FE3CF', '#2EB8A0'], ['#FFC2E2', '#E86AA6'], ['#9FD3FF', '#5B8CFF']];
  // Tarjeta de doble moneda: la cuenta en la otra moneda lleva parDe = id de la principal.
  const pareja = c => D.cuentas.find(x => x.parDe === c.id && !x.borrado);
  function tarjetaCC(c, i) {
    const deuda = -L.saldoCuenta(D, c.id), [g1, g2] = COLORES_CC[i % COLORES_CC.length], par = pareja(c);
    const uso = c.limite ? Math.min(1, Math.max(0, deuda) / c.limite) : 0;
    const d2 = par ? -L.saldoCuenta(D, par.id) : 0;
    return `<button class="cc" data-cuenta="${esc(c.id)}" style="--g1:${g1};--g2:${g2}">
      <span class="cc-top"><b>${esc(c.banco || c.nombre)}</b>${c.privada ? ico('candado') : '<i class="cc-chip"></i>'}</span>
      <span class="cc-saldos"><span class="cc-saldo"><small>${deuda > 0 ? T.debes : T.aFavor}</small><b>${din(Math.abs(deuda), c.moneda)}</b></span>
      ${par ? `<span class="cc-saldo dos-mon"><small>${d2 > 0 ? T.debes : T.aFavor}</small><b>${din(Math.abs(d2), par.moneda)}</b></span>` : ''}</span>
      ${c.limite && !par ? `<span class="cc-uso"><i style="width:${Math.round(uso * 100)}%"></i></span><small class="cc-disp">${T.disponible} ${din(c.limite - Math.max(0, deuda), c.moneda)}</small>` : ''}
      <span class="cc-pie"><span>•••• ${esc(c.ultimos4 || '····')}</span><span>${esc(c.vence || '')}</span></span></button>`;
  }
  function filaCuenta(c) {
    const s = L.saldoCuenta(D, c.id);
    let det = `${T[c.tipo]} · ${sim(c.moneda)}`, monto = din(s, c.moneda), extra = '';
    if (c.tipo === 'deuda') { monto = din(Math.max(0, -s), c.moneda); det = `${T.debes} · ${esc(c.persona || '')}`; }
    if (c.tipo === 'porCobrar') { monto = din(Math.max(0, s), c.moneda); det = c.castigado ? `${T.castigado} · ${fechaCorta(c.castigado)}` : `${T.teDebe} · ${esc(c.persona || '')}`; }
    if (c.castigado) monto = `<span class="neg">−${din(perdidoDe(c), c.moneda)}</span>`;
    if ((c.tipo === 'deuda' || c.tipo === 'porCobrar') && c.plan && !c.castigado) {
      const sc = PL.siguienteCuota(D, c);
      extra = sc ? `<small class="mini-det">${T.cuotaN(sc.numero, sc.total)}${sc.fecha ? ' · ' + fechaCorta(sc.fecha) : ''} · ${din(sc.fila.cuota, c.moneda)}</small>` : `<small class="mini-det pos">${T.saldado}</small>`;
    }
    if (c.impuestoPct) det += ` · ${T.imp} ${c.impuestoPct} %`;
    return `<li><button class="fila" data-cuenta="${esc(c.id)}"><span class="ico">${c.icono}</span>
      <span class="txt"><b>${esc(c.nombre)}</b><small>${det}</small>${extra}</span><span class="monto ${c.tipo === 'deuda' ? 'neg' : ''}">${monto}</span></button></li>`;
  }
  function vCuentas() {
    const vis = cuentasVivas().filter(c => !c.privada || sesion);
    const grupo = (titulo, lista, cls = '') => !lista.length ? '' : `<h2 class="sub">${titulo}</h2><ul class="lista ${cls}">${lista.map(filaCuenta).join('')}</ul>`;
    const deTipo = (t, priv) => vis.filter(c => c.tipo === t && !!c.privada === !!priv && !c.castigado);
    const tarjetas = vis.filter(c => c.tipo === 'credito' && !c.parDe);
    let bov = '';
    if (D.boveda && !sesion) {
      bov = `<section class="tarjeta boveda-cerrada"><span class="burbuja">${ico('candado')}</span><div><h2>${T.boveda}</h2><p class="nota">${T.bovedaTxt}</p></div>
        <button class="pildora oscura ancho" data-accion="desbloquear">${T.abrirBoveda}</button></section>`;
    } else if (D.boveda) {
      const priv = vis.filter(c => c.privada && c.tipo !== 'credito');
      bov = `<div class="sub-fila"><h2 class="sub">${ico('candado')} ${T.boveda}</h2><button class="enlace" data-accion="bloquear">${T.cerrarBoveda}</button></div>
        ${priv.length ? `<ul class="lista privada">${priv.map(filaCuenta).join('')}</ul>` : `<p class="nota">${T.bovedaTxt}</p>`}`;
    }
    const castigados = vis.filter(c => c.castigado);
    return `<button class="enlace" data-tab-ir="cartera">← ${T.cartera}</button>
      <div class="acciones-top tres"><button class="pildora oscura" data-accion="nueva-cuenta">${ico('mas')} ${T.cuenta}</button>
        <button class="pildora" data-accion="mover">${ico('flechas')} ${T.transferencia}</button>
        <button class="pildora" data-accion="nuevo-prestamo">🤝 ${T.prestamo}</button></div>
      ${tarjetas.length ? `<h2 class="sub">💳 ${T.credito}</h2><div class="carrusel">${tarjetas.map(tarjetaCC).join('')}</div>` : ''}
      ${grupo(T.diaria, deTipo('diaria'))}${grupo(T.ahorro, deTipo('ahorro'))}${grupo(T.inversion, deTipo('inversion'))}
      ${grupo('🏦 ' + T.misDeudas, deTipo('deuda'))}${grupo('🤝 ' + T.meDeben, deTipo('porCobrar'))}${grupo('🎲 ' + T.sam, deTipo('sam'))}
      ${castigados.length ? `<h2 class="sub">🚫 ${T.castigados}</h2><p class="nota">${T.castigadosTxt}</p><ul class="lista">${castigados.map(filaCuenta).join('')}</ul>` : ''}
      ${bov}`;
  }

  // ---------- Cartera: cuentas y movimientos juntos, por período (día, semana, mes…), con el saldo después de cada movimiento ----------
  const PERIODOS = ['dia', 'semana', 'mes', 'trimestre', 'anio', 'todos', 'rango'];
  const leerPer = () => { try { const p = localStorage.getItem('wallet-periodo'); return PERIODOS.includes(p) ? p : 'mes'; } catch { return 'mes'; } };
  let filtroMovs = { per: leerPer(), off: 0, desde: '', hasta: '', tipo: 'todos', cuentaId: '', cat: '', texto: '', limite: 150, buscar: false };
  function rangoFechas(f) {
    const h = L.hoy(), o = f.off | 0, tc = cuenta(f.cuentaId);
    if (f.per === 'corte' && tc && tc.diaCorte) return periodoCorte(tc, o < 0);
    if (f.per === 'dia') { const d = L.sumarDias(h, o); return [d, d]; }
    if (f.per === 'semana') { const lun = L.sumarDias(h, -((new Date(h + 'T12:00:00').getDay() + 6) % 7) + 7 * o); return [lun, L.sumarDias(lun, 6)]; }
    if (f.per === 'mes') { const m = L.mesAnterior(h.slice(0, 7), -o); return [m + '-01', m + '-' + L.diasDelMes(m)]; }
    if (f.per === 'trimestre') {
      const q = Math.floor((Number(h.slice(5, 7)) - 1) / 3) + o, y = Number(h.slice(0, 4)) + Math.floor(q / 4), qq = ((q % 4) + 4) % 4;
      const m1 = `${y}-${String(qq * 3 + 1).padStart(2, '0')}`, m3 = `${y}-${String(qq * 3 + 3).padStart(2, '0')}`;
      return [m1 + '-01', m3 + '-' + L.diasDelMes(m3)];
    }
    if (f.per === 'anio') { const y = Number(h.slice(0, 4)) + o; return [y + '-01-01', y + '-12-31']; }
    if (f.per === 'rango') return [f.desde || '0000-01-01', f.hasta || '9999-12-31'];
    return ['0000-01-01', '9999-12-31'];
  }
  function etiquetaPer(per, o) {
    const rel = (T.perRel[per] || {})[o];
    if (rel) return rel;
    const [a] = rangoFechas({ ...filtroMovs, per, off: o });
    if (per === 'dia') return fechaCorta(a);
    if (per === 'semana') return T.semanaDel(fechaCorta(a));
    if (per === 'mes') return new Date(Number(a.slice(0, 4)), Number(a.slice(5, 7)) - 1, 1).toLocaleDateString('es-DO', { month: 'short', year: 'numeric' }).replace('.', '');
    if (per === 'trimestre') return `T${Math.floor((Number(a.slice(5, 7)) - 1) / 3) + 1} ${a.slice(0, 4)}`;
    return a.slice(0, 4);
  }
  const idsVista = () => { const c = filtroMovs.cuentaId && cuenta(filtroMovs.cuentaId); if (!c) return null; const p = pareja(c); return new Set([c.id].concat(p ? [p.id] : [])); };
  // Buscador: nota, comercio, categoría, cuenta y también el monto («350» encuentra 350.00 y 1,350.00).
  function coincide(m, txt) {
    const c = cuenta(m.cuentaId) || {};
    if ([m.nota, m.lugar, catNombre(m.categoriaId), c.nombre].some(x => String(x || '').toLowerCase().includes(txt))) return true;
    const num = txt.replace(/[^\d.]/g, '');
    return !!num && /\d/.test(num) && [m.monto, m.montoDestino].some(v => v && (v / 100).toFixed(2).includes(num));
  }
  function movsFiltrados() {
    const f = filtroMovs, [desde, hasta] = rangoFechas(f), ids = idsVista(), txt = f.texto.trim().toLowerCase();
    return D.movimientos.filter(m => {
      if (m.borrado || m.fecha < desde || m.fecha > hasta) return false;
      if (ids ? !(ids.has(m.cuentaId) || ids.has(m.cuentaDestinoId)) : m.tipo === 'saldo') return false;
      if (f.tipo !== 'todos' && m.tipo !== f.tipo) return false;
      if (f.cat && L.padreDe(D, m.categoriaId) !== f.cat) return false;
      if (txt && !coincide(m, txt)) return false;
      return true;
    }).sort(L.orden).reverse();
  }
  // Efecto de un movimiento: en la vista de una cuenta, en su moneda; en general, en moneda principal (mover no cuenta).
  function efecto(m, ids) {
    if (ids) {
      if (m.tipo === 'saldo') return 0;
      if (m.tipo === 'transferencia') return (ids.has(m.cuentaDestinoId) ? m.montoDestino : 0) - (ids.has(m.cuentaId) ? m.monto + (m.impuesto || 0) : 0);
      return m.tipo === 'ingreso' ? m.monto : -(m.monto + (m.impuesto || 0));
    }
    const mon = (cuenta(m.cuentaId) || {}).moneda || P();
    const imp = m.impuesto ? -(L.aPrincipal(D, m.impuesto, mon) || 0) : 0;
    if (m.tipo === 'transferencia' || L.NEUTRAS.has(m.categoriaId)) return imp;
    const v = L.aPrincipal(D, m.monto, mon) || 0;
    return (m.tipo === 'ingreso' ? v : -v) + imp;
  }
  function etiquetaDia(f) {
    const h = L.hoy();
    if (f === h) return T.hoyDia;
    if (f === L.sumarDias(h, -1)) return T.ayer;
    if (f === L.sumarDias(h, 1)) return T.manana;
    const [y, m, d] = f.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-DO', { weekday: 'long', month: 'short', year: y === Number(h.slice(0, 4)) ? undefined : 'numeric' }).replace('.', '');
  }
  // Lo que viene (recurrentes y programados) dentro del período: pagos fijos, tarjetas, cuotas, SAM y nóminas.
  function programados(desde, hasta, ids) {
    const h = L.hoy(), fin = hasta > L.sumarDias(h, 400) ? L.sumarDias(h, 400) : hasta;
    if (fin <= h) return [];
    const ini = desde > h ? desde : L.sumarDias(h, 1);
    const dias = L.diasEntre(h, fin);
    const fijo = id => (D.fijos || []).find(x => x.id === id) || {};
    const lista = PL.pendientes(D, h, dias).filter(p => p.fecha >= ini && p.fecha <= fin && p.tipo !== 'nomina')
      .map(p => ({ ...p, cuentaId: p.tipo === 'fijo' ? fijo(p.id).cuentaId : p.tipo === 'sam' ? null : p.id, ingreso: p.tipo === 'cobro' }));
    for (const n of (D.nominas || []).filter(x => !x.borrado)) {
      for (const fecha of L.fechasEntre(n.rec, ini, fin)) lista.push({ tipo: 'nomina', id: n.id, fecha, monto: PL.nominaNeto(n, D.ajustes.pais).neto, nombre: n.nombre, icono: '💼', cuentaId: n.cuentaId, ingreso: true });
    }
    return lista.filter(p => !ids || (p.cuentaId && ids.has(p.cuentaId))).sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
  }
  function listaMovs() {
    const ids = idsVista(), c = ids && cuenta(filtroMovs.cuentaId), mon = c ? c.moneda : P();
    const [desde, hasta] = rangoFechas(filtroMovs);
    const todos = movsFiltrados(), lista = todos.slice(0, filtroMovs.limite);
    let entra = 0, sale = 0;
    for (const m of todos) { const e = efecto(m, ids); if (e > 0) entra += e; else sale -= e; }
    // Saldo después de cada movimiento, en la cuenta del movimiento (o en la cuenta elegida).
    const corr = new Map(), saldoTras = (m, cid) => { if (!corr.has(cid)) corr.set(cid, L.saldosCorridos(D, cid).despues); return corr.get(cid).get(m.id); };
    const grupos = [];
    for (const m of lista) { const g = grupos[grupos.length - 1]; if (g && g.fecha === m.fecha) g.movs.push(m); else grupos.push({ fecha: m.fecha, movs: [m] }); }
    const multi = ids && ids.size > 1;
    const prog = filtroMovs.texto || filtroMovs.cat || !['todos', 'gasto', 'ingreso'].includes(filtroMovs.tipo) ? [] : programados(desde, hasta, ids)
      .filter(p => filtroMovs.tipo === 'todos' || (filtroMovs.tipo === 'ingreso') === !!p.ingreso);
    const fila = m => {
      if (m.tipo === 'saldo') return `<li class="fila-saldo"><button class="divisor" data-mov="${esc(m.id)}"><span>⚖️ ${T.saldoFijado}</span><b>${din(m.monto, cuenta(m.cuentaId).moneda)}</b></button></li>`;
      const propio = ids ? (ids.has(m.cuentaId) ? m.cuentaId : m.cuentaDestinoId) : m.cuentaId, cp = cuenta(propio);
      return filaMov(m, cp ? { saldo: saldoTras(m, propio), moneda: cp.moneda, propio, multi } : undefined);
    };
    const filaProg = p => `<li class="pend"><span class="ico">${p.icono || '🗓️'}</span><span class="txt"><b>${esc(p.tipo === 'nomina' ? T.cobrasteNomina(p.nombre) : p.nombre)}</b><small>${T.programado} · ${fechaCorta(p.fecha)}</small></span>
      <span class="pend-der"><b class="monto ${p.ingreso ? 'pos' : ''}">${p.ingreso ? '+' : '−'}${din(p.monto, ['tarjeta', 'cuota', 'cobro'].includes(p.tipo) ? cuenta(p.id).moneda : undefined)}</b>
      ${p.tipo === 'nomina' ? '' : `<button class="mini" data-pend="${p.tipo}|${esc(p.id)}|${p.fecha}|${p.ronda || ''}">${p.ingreso ? T.cobrar : T.pagar}</button>`}</span></li>`;
    return `<section class="tarjeta resumen-filas">
        <div><span>${T.entro}</span><b class="pos">+${din(entra, mon)}</b></div>
        <div><span>${T.salio}</span><b class="neg">−${din(sale, mon)}</b></div>
        <div class="neto"><span>${T.neto}</span><b>${din(entra - sale, mon)}</b></div>
        <small class="cuantos">${T.nMovs(todos.length)}</small>
        <button class="pildora ancho" data-accion="informe">📊 ${T.verInforme}</button></section>
      ${prog.length ? `<div class="dia prog-tit"><h3>🗓️ ${T.porVenir}</h3><small class="dia-total">${prog.length}</small></div><ul class="lista-plana tarjeta prog">${prog.map(filaProg).join('')}</ul>` : ''}
      ${grupos.length ? grupos.map(g => {
        const neto = g.movs.reduce((a, m) => a + efecto(m, ids), 0);
        return `<div class="dia"><b class="dia-num">${Number(g.fecha.slice(8))}</b><h3>${etiquetaDia(g.fecha)}</h3><small class="dia-total">${neto > 0 ? '+' : ''}${din(neto, mon)}</small></div>
          <ul class="lista">${g.movs.map(fila).join('')}</ul>`;
      }).join('') : prog.length ? '' : `<p class="nota centro">${T.sinMovsFiltro}</p>`}
      ${todos.length > lista.length ? `<button class="pildora ancho" data-accion="movs-mas">${T.verMas(todos.length - lista.length)}</button>` : ''}`;
  }
  function vCartera() {
    const f = filtroMovs, c = f.cuentaId && cuenta(f.cuentaId);
    const vis = cuentasVivas().filter(x => (!x.privada || sesion) && !x.parDe && !x.castigado);
    const cats = D.categorias.filter(x => !x.borrado && !x.padre && !x.oculta);
    const pers = (c && c.tipo === 'credito' && c.diaCorte ? ['corte'] : []).concat(PERIODOS);
    if (!pers.includes(f.per)) { f.per = 'mes'; f.off = 0; }
    const tabs = f.per === 'todos' || f.per === 'rango' ? [] : f.per === 'corte' ? [-1, 0] : [f.off - 1, f.off, f.off + 1];
    let saldo = L.resumen(D, L.hoy()).total, mon = P(), debe = false, par = null;
    if (c) { const s = L.saldoCuenta(D, c.id); mon = c.moneda; par = pareja(c); debe = c.tipo === 'credito' && s < 0; saldo = c.tipo === 'credito' ? Math.abs(s) : s; }
    const filtrando = f.tipo !== 'todos' || f.cat;
    return `<section class="tarjeta cartera-top">
        <div class="cartera-fila"><label class="selector-cartera">${c ? c.icono : '👛'}<select id="cartera-sel" aria-label="${T.elegirCartera}">
          <option value="">${T.todasCuentas}</option>${vis.map(x => `<option value="${esc(x.id)}" ${c && c.id === x.id ? 'selected' : ''}>${esc(x.nombre)}</option>`).join('')}</select><span aria-hidden="true">▾</span></label>
          <button class="icono-btn lupa" data-accion="buscar" aria-label="${T.buscar}" aria-pressed="${!!(f.buscar || f.texto)}">🔎</button></div>
        <small>${c ? T[c.tipo] + (c.ultimos4 ? ' · •••• ' + esc(c.ultimos4) : '') : T.patrimonio}</small>
        <strong class="cartera-saldo">${debe ? T.debes + ' ' : ''}${din(saldo, mon)}</strong>
        ${par ? `<small>${din(Math.abs(L.saldoCuenta(D, par.id)), par.moneda)}</small>` : ''}
        <div class="acciones-cab">${c ? `${c.tipo === 'credito' ? `<button class="pildora oscura" data-accion="cab-pagar">${T.pagarTarjeta}</button>` : ''}
          <button class="pildora" data-accion="cab-editar">${T.editarCuenta}</button><button class="pildora" data-accion="cab-saldo">${T.fijarSaldo}</button>`
        : `<button class="pildora" data-accion="mover">↔️ ${T.transferencia}</button>`}<button class="pildora" data-tab-ir="cuentas" aria-label="${T.misCuentas}">🏦 ${T.misCuentas}</button></div>
      </section>
      ${f.buscar || f.texto ? `<label class="campo buscar"><input type="search" data-filtro="texto" value="${esc(f.texto)}" placeholder="🔎 ${T.buscarMovs}" aria-label="${T.buscarMovs}"></label>` : ''}
      <div class="periodo-fila"><label class="pildora selector-per">📅 <select id="per-sel" aria-label="${T.periodo}">${pers.map(p => `<option value="${p}" ${f.per === p ? 'selected' : ''}>${T.periodos2[p]}</option>`).join('')}</select><span aria-hidden="true">▾</span></label>
        <details class="mas-filtros" ${filtrando ? 'open' : ''}><summary>${T.filtros}${filtrando ? ' •' : ''}</summary>
          <div class="segmento chico">${['todos', 'gasto', 'ingreso', 'transferencia'].map(t => `<label><input type="radio" name="filtro-tipo" data-filtro="tipo" value="${t}" ${f.tipo === t ? 'checked' : ''}><span>${T.tiposFiltro[t]}</span></label>`).join('')}</div>
          <label class="campo">${T.categoria}<select data-filtro="cat"><option value="">${T.todas}</option>${cats.map(x => `<option value="${esc(x.id)}" ${f.cat === x.id ? 'selected' : ''}>${x.icono} ${esc(catNombre(x.id))}</option>`).join('')}</select></label></details></div>
      ${tabs.length ? `<div class="per-tabs" role="tablist" data-desliza>${tabs.map(o => `<button role="tab" data-accion="per-off" data-o="${o}" aria-selected="${o === f.off}">${etiquetaPer(f.per, o)}</button>`).join('')}</div>` : ''}
      ${f.per === 'rango' ? `<div class="dos"><label class="campo">${T.desdeFecha}<input type="date" data-filtro="desde" value="${f.desde}"></label><label class="campo">${T.hastaFecha}<input type="date" data-filtro="hasta" value="${f.hasta}"></label></div>` : ''}
      ${c && c.diaCorte && f.per === 'corte' && f.off < 0 ? estadoCorte(c) : ''}
      <div id="movs-res" data-desliza>${listaMovs()}</div>
      <button class="pildora ancho" data-accion="exportar-csv">📤 ${T.exportarCsv}</button>`;
  }
  function abrirMovs(cuentaId) {
    filtroMovs = { ...filtroMovs, cuentaId: cuentaId || '', limite: 150, texto: '', cat: '', tipo: 'todos', buscar: false };
    if (filtroMovs.per === 'corte' && !(cuentaId && cuenta(cuentaId).diaCorte)) { filtroMovs.per = 'mes'; filtroMovs.off = 0; }
    tab = 'cartera'; pintar(); window.scrollTo(0, 0);
  }
  function cambiarPer(per) {
    filtroMovs.per = per; filtroMovs.off = 0; filtroMovs.limite = 150;
    try { if (per !== 'corte') localStorage.setItem('wallet-periodo', per); } catch { /* solo recuerda la preferencia */ }
    pintar();
  }
  function moverPer(o) {
    if (filtroMovs.per === 'corte') o = Math.min(0, Math.max(-1, o));
    if (o === filtroMovs.off) return;
    const dir = o > filtroMovs.off ? 'izq' : 'der';
    filtroMovs.off = o; filtroMovs.limite = 150; pintar();
    const r = $('#movs-res'); if (r) r.classList.add('desliza-' + dir);
  }
  // Informe del período: barras de ingresos y gastos, dona por categoría, saldo acumulado o los gastos más grandes.
  let grafInforme = 'barras';
  function hojaInforme() {
    const ids = idsVista(), c = ids && cuenta(filtroMovs.cuentaId), mon = c ? c.moneda : P();
    const movs = movsFiltrados().filter(m => m.tipo !== 'saldo').reverse();
    let [desde, hasta] = rangoFechas(filtroMovs);
    if (movs.length && desde < movs[0].fecha) desde = filtroMovs.per === 'todos' || filtroMovs.per === 'rango' ? movs[0].fecha : desde;
    if (hasta > L.hoy()) hasta = L.hoy() < desde ? desde : L.hoy();
    const dias = Math.max(1, L.diasEntre(desde, hasta) + 1);
    const unidad = dias <= 10 ? 'dia' : dias <= 45 ? 'semana' : dias <= 400 ? 'mes' : 'anio';
    const llave = f => unidad === 'dia' ? f : unidad === 'semana' ? Math.floor(L.diasEntre(desde, f) / 7) : unidad === 'mes' ? f.slice(0, 7) : f.slice(0, 4);
    const claves = [];
    if (unidad === 'dia') for (let d = desde; d <= hasta; d = L.sumarDias(d, 1)) claves.push(d);
    else if (unidad === 'semana') for (let k = 0; k <= Math.floor((dias - 1) / 7); k++) claves.push(k);
    else if (unidad === 'mes') for (let m = desde.slice(0, 7); m <= hasta.slice(0, 7); m = L.mesAnterior(m, -1)) claves.push(m);
    else for (let y = Number(desde.slice(0, 4)); y <= Number(hasta.slice(0, 4)); y++) claves.push(String(y));
    const etq = k => unidad === 'dia' ? String(Number(k.slice(8))) : unidad === 'semana' ? fechaCorta(L.sumarDias(desde, k * 7)) : unidad === 'mes' ? mesCorto(k) : k;
    const cubos = new Map(claves.map(k => [k, { a: 0, b: 0, n: 0 }])), porCat = {};
    for (const m of movs) {
      const e = efecto(m, ids), cb = cubos.get(llave(m.fecha)); if (!cb) continue;
      if (e > 0) cb.a += e; else cb.b -= e; cb.n += e;
      if (m.tipo === 'gasto' && e < 0) { const p = L.padreDe(D, m.categoriaId) || 'c-otros'; porCat[p] = (porCat[p] || 0) - e; }
    }
    const cats = Object.entries(porCat).sort((a, b) => b[1] - a[1]), totalG = cats.reduce((a, x) => a + x[1], 0);
    let acum = 0; const linea = claves.map(k => (acum += cubos.get(k).n));
    const top = movs.filter(m => m.tipo === 'gasto').sort((a, b) => b.monto - a.monto).slice(0, 5);
    const graf = g => {
      if (!movs.length) return `<p class="nota">${T.sinMovsFiltro}</p>`;
      if (g === 'barras') return `<div class="leyenda-mini"><span><i class="a"></i>${T.recibido}</span><span><i class="b"></i>${T.gastado}</span></div>
        ${G.barras(claves.slice(-12).map(k => ({ etiqueta: etq(k), a: cubos.get(k).a, b: cubos.get(k).b })))}`;
      if (g === 'dona') return cats.length ? `<div class="dona-fila">${G.dona(cats.map(([id, v]) => ({ valor: v, color: cat(id).color })), { centro: `<small>${T.gastado}</small><b>${din(totalG, mon, true)}</b>` })}</div>
        <ul class="leyenda">${cats.map(([id, v]) => `<li><i style="background:${cat(id).color}"></i><span>${cat(id).icono} ${esc(catNombre(id))}</span><small>${Math.round((v / totalG) * 100)} %</small><b>${din(v, mon)}</b></li>`).join('')}</ul>` : `<p class="nota">${T.sinDatos}</p>`;
      if (g === 'linea') return `<p class="nota">${T.netoAcumulado}</p>${G.linea(linea.length > 1 ? linea : [0].concat(linea), { id: 'g-inf', ini: etq(claves[0]), fin: etq(claves[claves.length - 1]) })}`;
      return top.length ? `<ul class="lista">${top.map(m => filaMov(m)).join('')}</ul>` : `<p class="nota">${T.sinDatos}</p>`;
    };
    const f = abrirHoja(`<h2>📊 ${T.informe}</h2><p class="nota">${T.estadoPeriodo(fechaCorta(desde), fechaCorta(hasta))}${c ? ' · ' + esc(c.nombre) : ''}</p>
      ${segmento('graf', [['barras', T.grafBarras], ['dona', T.grafDona], ['linea', T.grafLinea], ['top', T.grafTop]], grafInforme)}
      <div data-graf class="informe-graf">${graf(grafInforme)}</div>
      <div class="acciones uno"><button type="button" class="pildora" data-cerrar>${T.cerrar}</button></div>`, () => {}, { sinAcciones: true });
    f.querySelectorAll('[name=graf]').forEach(r => r.onchange = () => { grafInforme = r.value; f.querySelector('[data-graf]').innerHTML = graf(grafInforme); });
  }

  // ---------- ajustes ----------
  function vAjustes() {
    const u = D.ajustes.ultimoRespaldo;
    const usadas = [...new Set(['USD'].concat(cuentasVivas().map(c => c.moneda)))].filter(m => m !== P());
    const paises = Object.keys(L.PAISES).sort((a, b) => T.paises[a].localeCompare(T.paises[b]));
    return `<h2 class="sub">${T.general}</h2><section class="tarjeta">
        <label class="campo">${T.pais}<select id="pais">${paises.map(p => `<option value="${p}" ${D.ajustes.pais === p ? 'selected' : ''}>${T.paises[p]} (${sim(L.PAISES[p])})</option>`).join('')}</select></label>
        ${usadas.map(m => `<label class="campo">${T.tasaDe(sim(m), sim(P()))}<input class="tasa" data-moneda="${m}" inputmode="decimal" autocomplete="off" value="${D.ajustes.tasas[m] || ''}" placeholder="0.00"></label>`).join('')}
        <button class="pildora ancho" data-accion="presupuesto">${T.presupuesto}</button>
        <button class="pildora ancho" data-accion="categorias">${T.categorias}</button>
        <label class="interruptor"><span>${T.ocultar}</span><input type="checkbox" id="ocultar" ${oculto() ? 'checked' : ''}><i></i></label>
        <label class="campo fila-campo"><span>🪙 ${T.redondeo}</span><select id="redondeo-cuenta"><option value="">${T.apagado}</option>${cuentasVivas().filter(c => c.tipo === 'ahorro' || c.tipo === 'inversion').map(c => `<option value="${esc(c.id)}" ${(D.ajustes.redondeo || {}).cuentaId === c.id ? 'selected' : ''}>${esc(c.nombre)}</option>`).join('')}</select></label>
        ${D.ajustes.redondeo ? `<label class="campo fila-campo"><span>${T.redondeoA}</span><select id="redondeo-a">${[10, 25, 50, 100].map(v => `<option value="${v}" ${(D.ajustes.redondeo.a || 100) === v ? 'selected' : ''}>${sim(P())} ${v}</option>`).join('')}</select></label>` : ''}
        <p class="nota">${T.redondeoTxt}</p>
        ${D.ajustes.guiaOculta ? `<button class="pildora ancho" data-accion="ver-guia">🎮 ${T.verGuia}</button>` : ''}
      </section>
      <h2 class="sub">🎨 ${T.diseno}</h2><section class="tarjeta">
        <div class="temas">${TEMAS.map(t => `<button class="tema-btn" data-accion="tema" data-tema="${t}" aria-pressed="${(D.ajustes.tema || 'lavanda') === t}">
          <i style="background:${MUESTRAS[t][0]};--m2:${MUESTRAS[t][1]}"></i><small>${T.temas[t]}</small></button>`).join('')}</div>
        <div class="segmento" role="radiogroup" aria-label="${T.modo}">${['auto', 'claro', 'oscuro'].map(m => `<label><input type="radio" name="modo-app" value="${m}" ${(D.ajustes.modo || 'auto') === m ? 'checked' : ''}><span>${T.modos[m]}</span></label>`).join('')}</div>
      </section>
      <h2 class="sub">${ico('candado')} ${T.seguridad}</h2><section class="tarjeta">
        <label class="interruptor"><span>${T.bloquearApp}</span><input type="checkbox" id="bloqueo" ${D.ajustes.bloqueoApp ? 'checked' : ''}><i></i></label>
        <p class="nota">${T.bloquearTxt}</p>
        ${huellaOk ? `<label class="interruptor"><span>${ico('huella')} ${T.usarHuella}</span><input type="checkbox" id="huella" ${D.ajustes.huella ? 'checked' : ''}><i></i></label>` : S.esApk() ? `<p class="nota">${T.sinHuella}</p>` : ''}
        ${D.ajustes.candado ? `<button class="pildora ancho" data-accion="cambiar-pin">${T.cambiarPin}</button>` : ''}
      </section>
      <h2 class="sub">${ico('candado')} ${T.boveda}</h2><section class="tarjeta">
        <p class="nota">${T.bovedaTxt}</p>
        ${!D.boveda ? `<button class="pildora oscura ancho" data-accion="crear-boveda">${T.crearBoveda}</button>`
        : sesion ? `<button class="pildora ancho" data-accion="bloquear">${T.cerrarBoveda}</button>`
        : `<button class="pildora oscura ancho" data-accion="desbloquear">${T.abrirBoveda}</button>
           <button class="enlace peligro" data-accion="olvide">${T.olvidePin}</button>`}
      </section>
      <h2 class="sub">${ico('campana')} ${T.avisos}</h2><section class="tarjeta">
        <label class="interruptor"><span>${T.avisosPagos}</span><input type="checkbox" id="avisos" ${D.ajustes.avisos !== false ? 'checked' : ''}><i></i></label>
        <label class="campo fila-campo"><span>${T.horaAviso}</span><select id="hora">${[6, 7, 8, 9, 10, 12, 15, 18, 20].map(h => `<option value="${h}" ${(D.ajustes.horaAviso == null ? 9 : D.ajustes.horaAviso) === h ? 'selected' : ''}>${String(h).padStart(2, '0')}:00</option>`).join('')}</select></label>
        <p class="nota">${S.esApk() ? T.avisosTxt : T.avisosWeb}</p>
      </section>
      <h2 class="sub">${T.datos}</h2><section class="tarjeta">
        <button class="pildora oscura ancho" data-accion="respaldar">${T.respaldar}</button>
        <small class="nota">${T.ultimoRespaldo}: ${u ? fechaCorta(u.slice(0, 10)) : T.nunca}</small>
        <label class="pildora ancho">${T.restaurar}<input type="file" id="archivo" accept="application/json,.json" hidden></label>
        <button class="pildora peligro ancho" data-accion="borrar-todo">${T.borrarTodo}</button>
      </section>
      <p class="nota centro">🔒 ${T.privacidad}</p>
      <p class="nota centro">${T.app} — ${T.lema} · ${T.version} ${APP_VERSION}</p>`;
  }

  // ---------- hojas (formularios) ----------
  const hoja = () => $('#hoja');
  function abrirHoja(html, alEnviar, { sinAcciones, textoOk } = {}) {
    const h = hoja();
    snapActivo = null; // otra hoja reemplaza al formulario de Anotar (su borrador ya quedó guardado)
    h.innerHTML = `<div class="agarre"></div><form method="dialog" novalidate>${html}
      <p class="error-form" role="alert"></p>
      ${sinAcciones ? '' : `<div class="acciones"><button type="button" class="pildora" data-cerrar>${T.cancelar}</button>
      <button class="pildora oscura" value="ok">${textoOk || T.guardar}</button></div>`}</form>`;
    const f = h.querySelector('form');
    f.onsubmit = async ev => {
      ev.preventDefault();
      const err = await alEnviar(new FormData(f), f);
      if (err) { f.querySelector('.error-form').textContent = err; return; }
      if (h.open && h.contains(f)) h.close(); // si alEnviar abrió otra hoja, esa se queda
    };
    const x = h.querySelector('[data-cerrar]'); if (x) x.onclick = () => h.close();
    if (!h.open) h.showModal();
    h.scrollTop = 0;
    return f;
  }
  const opcionesCuentas = (sel, { excluir, moneda, tipos } = {}) => cuentasVivas()
    .filter(c => c.id !== excluir && (!moneda || c.moneda === moneda) && (!tipos || tipos.includes(c.tipo)) && !c.castigado)
    .map(c => `<option value="${esc(c.id)}" ${c.id === sel ? 'selected' : ''}>${c.privada ? '🔒 ' : ''}${esc(c.nombre)} (${sim(c.moneda)})</option>`).join('');
  const cuentasDeUso = () => ['diaria', 'ahorro', 'inversion', 'credito'];
  const opcionesMonedas = sel => Object.keys(L.MONEDAS).map(k => `<option value="${k}" ${k === sel ? 'selected' : ''}>${sim(k)} · ${k}</option>`).join('');
  const segmento = (nombre, opciones, sel) => `<div class="segmento" role="radiogroup">${opciones.map(([v, t]) => `<label><input type="radio" name="${nombre}" value="${v}" ${v === sel ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div>`;

  // Impuesto del banco: % de la cuenta (se puede quitar o cambiar). Se puede agregar días después editando el movimiento.
  function bloqueImpuesto(valor) {
    return `<div class="imp" data-imp><label class="interruptor"><span>🏛️ <span data-imp-et>${T.impuesto}</span></span><input type="checkbox" name="conImp" ${valor ? 'checked' : ''}><i></i></label>
      <label class="campo" data-imp-campo ${valor ? '' : 'hidden'}>${T.montoImpuesto}<input name="impuesto" inputmode="decimal" autocomplete="off" value="${aInput(valor)}" placeholder="0.00"></label></div>`;
  }
  function conectarImpuesto(f, cuentaDe, montoDe, inicial) {
    const caja = f.querySelector('[data-imp]'); if (!caja) return;
    let tocado = !!inicial;
    const chk = f.conImp, inp = f.impuesto, campo = caja.querySelector('[data-imp-campo]');
    const pct = () => (cuenta(cuentaDe()) || {}).impuestoPct || 0;
    const calc = () => {
      const p = pct();
      caja.querySelector('[data-imp-et]').textContent = p ? T.impuestoPct(p) : T.impuesto;
      if (!tocado) { chk.checked = p > 0; const m = montoDe(); inp.value = p && m ? aInput(Math.round(m * p / 100)) : ''; }
      campo.hidden = !chk.checked;
    };
    chk.onchange = () => { tocado = true; campo.hidden = !chk.checked; if (chk.checked && !inp.value) { const m = montoDe(), p = pct(); if (p && m) inp.value = aInput(Math.round(m * p / 100)); } };
    inp.oninput = () => { tocado = true; };
    caja._calc = calc; calc();
    return calc;
  }
  function leerImpuesto(fd) {
    if (fd.get('conImp') !== 'on' || !String(fd.get('impuesto') || '').trim()) return 0;
    return L.parseMonto(fd.get('impuesto'));
  }

  function hojaMov(m, tipoInicial, borrador) {
    const cs = cuentasVivas().filter(c => !c.castigado);
    if (!cs.length) { tab = 'cuentas'; pintar(); return hojaCuenta(); }
    if (m && m.tipo === 'saldo') return hojaSaldo(cuenta(m.cuentaId), m);
    const tipo = m ? m.tipo : (tipoInicial || 'gasto');
    const ult = D.ajustes.ultimaCuenta && cuenta(D.ajustes.ultimaCuenta) && !cuenta(D.ajustes.ultimaCuenta).borrado ? D.ajustes.ultimaCuenta : cs[0].id;
    const cuentaSel = m ? m.cuentaId : ult;
    const catSel = m && m.categoriaId ? L.padreDe(D, m.categoriaId) : null, subSel = m && m.categoriaId !== catSel ? m.categoriaId : '';
    const padres = t => D.categorias.filter(c => !c.borrado && !c.padre && !c.oculta && c.tipo === t);
    const chips = (t, sel) => padres(t).map((c, i) => `
      <label class="chip" style="--c:${c.color}"><input type="radio" name="cat" value="${esc(c.id)}" ${(sel ? sel === c.id : i === 0) ? 'checked' : ''}>
      <span>${c.icono} ${esc(catNombre(c.id))}</span></label>`).join('') + `<button type="button" class="chip-btn" data-nueva-cat="${t}">＋ ${T.nuevaCorta}</button>`;
    const subChips = (padre, sel) => {
      const ss = D.categorias.filter(c => !c.borrado && c.padre === padre);
      return ss.length ? `<label class="chip sub" style="--c:${cat(padre).color}"><input type="radio" name="sub" value="" ${!sel ? 'checked' : ''}><span>${T.general}</span></label>` +
        ss.map(c => `<label class="chip sub" style="--c:${c.color}"><input type="radio" name="sub" value="${esc(c.id)}" ${sel === c.id ? 'checked' : ''}><span>${c.icono} ${esc(catNombre(c.id))}</span></label>`).join('') : '';
    };
    const lugares = [...new Set(T.tiendas.concat(D.movimientos.filter(x => x.lugar).map(x => x.lugar)))].slice(0, 40);
    const destino = m && m.tipo === 'transferencia' ? m.cuentaDestinoId : (cs.find(c => c.id !== cuentaSel) || {}).id;
    const fr = m || borrador ? [] : frecuentes();
    const f = abrirHoja(`
      <h2>${m ? T.editarMov : T.anotar}</h2>
      ${fr.length ? `<div class="chips plantillas frecuentes" aria-label="${T.frecuentes}">${fr.map((x, i) => `<button type="button" class="chip-btn" data-frecuente="${i}">${cat(x.categoriaId).icono} ${esc(x.nota || catNombre(x.categoriaId))} · ${din(x.monto, cuenta(x.cuentaId).moneda)}</button>`).join('')}</div>` : ''}
      <div class="foto-acciones">${m ? `<button type="button" class="pildora" data-foto-origen="camara">📷 ${T.tomarFoto}</button>` : `<button type="button" class="pildora oscura" data-foto-origen="camara">📷 ${T.escanearFactura}</button>`}
        <button type="button" class="pildora" data-foto-origen="galeria">🖼️ ${T.galeria}</button></div>
      <div class="caja-info leido" data-leido hidden></div>
      <div class="foto-zona" data-foto-zona hidden><img data-foto-img alt="${T.fotoFactura}"><div><button type="button" class="enlace" data-ver-foto>${T.verFoto}</button><button type="button" class="enlace peligro" data-quitar-foto>${T.quitarFoto}</button></div></div>
      <div class="segmento" role="radiogroup">
        ${['gasto', 'ingreso', 'transferencia'].map(t => `<label><input type="radio" name="tipo" value="${t}" ${tipo === t ? 'checked' : ''} ${m && (m.tipo === 'transferencia') !== (t === 'transferencia') ? 'disabled' : ''}><span>${T[t]}</span></label>`).join('')}
      </div>
      <label class="campo monto-campo"><span>${T.monto} <span data-sim></span></span><input name="monto" inputmode="decimal" autocomplete="off" required
        value="${m ? aInput(m.monto) : ''}" placeholder="0.00"></label>
      <label class="campo nota-campo">${T.nota}<input name="nota" maxlength="80" enterkeyhint="done" autocomplete="off" placeholder="${T.notaEj}" value="${m ? esc(m.nota) : ''}"></label>
      <div data-no-tr ${tipo === 'transferencia' ? 'hidden' : ''}>
        <label class="interruptor"><span>💱 ${T.otraMoneda}</span><input type="checkbox" name="otra" ${m && m.monedaOriginal ? 'checked' : ''}><i></i></label>
        <div class="dos" data-otra ${m && m.monedaOriginal ? '' : 'hidden'}>
          <label class="campo">${T.moneda}<select name="monOrig">${opcionesMonedas(m && m.monedaOriginal ? m.monedaOriginal : (P() === 'USD' ? 'EUR' : 'USD'))}</select></label>
          <label class="campo">${T.montoEn}<input name="montoOrig" inputmode="decimal" autocomplete="off" value="${m && m.montoOriginal ? aInput(m.montoOriginal) : ''}" placeholder="0.00"></label>
          <label class="campo">${T.tasaDia}<input name="tasaOrig" inputmode="decimal" autocomplete="off" value="${m && m.tasaCompra ? m.tasaCompra : ''}" placeholder="0.00"></label>
          <p class="nota" data-otra-txt></p>
        </div>
      </div>
      <label class="campo"><span data-et-cuenta>${tipo === 'transferencia' ? T.desde : T.cuenta}</span><select name="cuenta">${opcionesCuentas(cuentaSel)}</select></label>
      <div data-solo="transferencia" ${tipo === 'transferencia' ? '' : 'hidden'}>
        <label class="campo">${T.hacia}<select name="destino">${opcionesCuentas(destino)}</select></label>
        <label class="campo" data-llega hidden>${T.montoLlega}<input name="llega" inputmode="decimal" autocomplete="off" value="${m && m.montoDestino && m.montoDestino !== m.monto ? aInput(m.montoDestino) : ''}" placeholder="0.00"></label>
      </div>
      <fieldset class="chips" data-solo="cat" ${tipo === 'transferencia' ? 'hidden' : ''}><legend>${T.categoria}</legend><div data-chips>${chips(tipo === 'ingreso' ? 'ingreso' : 'gasto', catSel)}</div>
        <div data-subs class="subs"></div></fieldset>
      <label class="campo" data-lugar hidden>${T.lugar}<input name="lugar" list="lugares" maxlength="40" autocomplete="off" value="${m ? esc(m.lugar || '') : ''}"></label>
      <datalist id="lugares">${lugares.map(x => `<option value="${esc(x)}">`).join('')}</datalist>
      <details class="mas-opciones" data-mas ${m && (m.conQuien || m.impuesto) ? 'open' : ''}><summary>${T.masOpcionesMov} <small data-mas-res></small></summary>
      <fieldset class="chips" data-quien hidden><legend>${T.conQuien}</legend><div>${['', ...L.CON_QUIEN].map(q => `<label class="chip quien"><input type="radio" name="quien" value="${q}" ${(m && m.conQuien || '') === q ? 'checked' : ''}><span>${q ? T.quienIco[q] + ' ' + T.quien[q] : T.nadie}</span></label>`).join('')}</div></fieldset>
      ${m ? '' : `<div data-div-zona ${tipo === 'gasto' ? '' : 'hidden'}><label class="interruptor"><span>👥 ${T.dividirGasto}</span><input type="checkbox" name="dividir"><i></i></label>
        <div data-div hidden><label class="campo">${T.conQuienes}<input name="personas" maxlength="120" autocomplete="off" placeholder="${T.dividirEj}"></label><p class="nota" data-div-txt></p></div></div>`}
      <div data-imp-zona ${tipo === 'ingreso' ? 'hidden' : ''}>${bloqueImpuesto(m && m.impuesto)}</div>
      </details>
      <label class="campo">${T.fecha}<input type="date" name="fecha" required value="${m ? m.fecha : L.hoy()}"></label>
      ${m ? `<button type="button" class="pildora peligro ancho" data-borrar-mov>${T.borrar}</button>` : ''}`,
      async fd => {
        const t = fd.get('tipo');
        let monto = L.parseMonto(fd.get('monto'));
        const datos = { tipo: t, cuentaId: fd.get('cuenta'), fecha: fd.get('fecha') || L.hoy(), nota: String(fd.get('nota') || '').trim(), editado: ahora() };
        const c0 = cuenta(datos.cuentaId);
        // Pagado en otra moneda: se guarda el monto original y la tasa del día de la compra.
        delete datos.monedaOriginal;
        if (t !== 'transferencia' && fd.get('otra') === 'on') {
          const mo = L.parseMonto(fd.get('montoOrig')), tasa = L.parseNum(fd.get('tasaOrig'));
          if (!mo || !tasa) return T.faltaOtra;
          if (fd.get('monOrig') === c0.moneda) return T.mismaMoneda;
          Object.assign(datos, { monedaOriginal: fd.get('monOrig'), montoOriginal: mo, tasaCompra: tasa });
          if (!monto) monto = Math.round(mo * tasa);
        }
        if (!monto) return T.montoInvalido;
        datos.monto = monto;
        const imp = t === 'ingreso' ? 0 : leerImpuesto(fd);
        if (imp === null) return T.montoInvalido;
        datos.impuesto = imp || undefined;
        // Gasto en una cuenta de otra moneda (ej. balance en US$ de la tarjeta): se guarda la tasa del día para comparar al pagar.
        if (t === 'gasto' && !datos.monedaOriginal && c0.moneda !== P() && Number(D.ajustes.tasas[c0.moneda]) > 0 && !(m && m.tasaDia)) datos.tasaDia = Number(D.ajustes.tasas[c0.moneda]);
        if (t === 'transferencia') {
          if (cs.length < 2) return T.dosCuentas;
          datos.cuentaDestinoId = fd.get('destino');
          if (datos.cuentaDestinoId === datos.cuentaId) return T.mismaCuenta;
          const mo = c0.moneda, md = cuenta(datos.cuentaDestinoId).moneda;
          let llega = monto;
          if (mo !== md) { llega = L.parseMonto(fd.get('llega')) || L.convertir(D, monto, mo, md); if (!llega) return T.faltaTasaMover; }
          datos.montoDestino = llega; datos.categoriaId = null; datos.conQuien = undefined; datos.lugar = undefined;
        } else {
          const padre = fd.get('cat'), sub = fd.get('sub');
          datos.categoriaId = sub || padre;
          const pc = cat(padre);
          datos.conQuien = pc.social && fd.get('quien') ? fd.get('quien') : undefined;
          datos.lugar = pc.lugar && String(fd.get('lugar') || '').trim() ? String(fd.get('lugar')).trim() : undefined;
        }
        // Foto de la factura: se guarda aparte (comprimida; cifrada si la cuenta está en la bóveda).
        if (fotoNueva) {
          const id = 'f-' + L.uuid();
          try { await DB.guardarFoto(id, await valorFoto(fotoNueva, c0.privada)); datos.foto = id; } catch (e) { console.error(e); return T.errorFoto; }
        } else if (fotoQuitada) datos.foto = undefined;
        // Dividir: mi parte queda como gasto; la de cada persona pasa a «Me deben» (el total sí sale de la cuenta).
        const personas = !m && t === 'gasto' && fd.get('dividir') === 'on' ? String(fd.get('personas') || '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 20) : [];
        if (!m && t === 'gasto' && fd.get('dividir') === 'on' && !personas.length) return T.faltanPersonas;
        const cada = personas.length ? Math.floor(monto / (personas.length + 1)) : 0;
        if (personas.length) datos.monto = monto - cada * personas.length;
        const padreCat = t === 'gasto' && datos.fecha.slice(0, 7) === L.hoy().slice(0, 7) ? L.padreDe(D, datos.categoriaId) : null;
        const antes = padreCat ? usoCat(padreCat) : null;
        let msg = T.guardado;
        if (m) {
          Object.assign(m, datos);
          if (!datos.monedaOriginal) { delete m.monedaOriginal; delete m.montoOriginal; delete m.tasaCompra; delete m.tasaPago; }
          if (fotoQuitada && !fotoNueva) delete m.foto;
        } else {
          const nm = nuevoMov(datos);
          for (const p of personas) {
            const pc = cuentaMeDebe(p, c0.moneda);
            nuevoMov({ tipo: 'transferencia', cuentaId: c0.id, cuentaDestinoId: pc.id, monto: cada, montoDestino: cada, fecha: datos.fecha, nota: T.parteDe(datos.nota || catNombre(datos.categoriaId)), ref: { tipo: 'dividir', id: nm.id } });
          }
          if (personas.length) msg = T.dividido(personas.length, L.formato(cada, c0.moneda));
          // Redondeo al ahorro: la diferencia hasta el múltiplo elegido pasa a la cuenta de ahorro (solo desde cuentas de uso).
          const red = D.ajustes.redondeo, dst = red && cuenta(red.cuentaId);
          if (t === 'gasto' && dst && !dst.borrado && c0.tipo === 'diaria' && dst.id !== c0.id && dst.moneda === c0.moneda) {
            const paso = (red.a || 100) * 100, dif = Math.ceil(monto / paso) * paso - monto;
            if (dif > 0) { nuevoMov({ tipo: 'transferencia', cuentaId: c0.id, cuentaDestinoId: dst.id, monto: dif, montoDestino: dif, fecha: datos.fecha, nota: T.redondeoNota, ref: { tipo: 'redondeo', id: nm.id } }); msg = T.guardadoRedondeo(L.formato(dif, c0.moneda)); }
          }
        }
        // Aviso al momento si el presupuesto de esa categoría pasa del 80 % o del 100 %.
        const despues = padreCat ? usoCat(padreCat) : null;
        if (despues !== null && antes !== null) {
          if (antes <= 1 && despues > 1) msg = T.alertaPasaste(catNombre(padreCat));
          else if (antes < 0.8 && despues >= 0.8) msg = T.alerta80(catNombre(padreCat), Math.round(despues * 100));
        }
        D.ajustes.ultimaCuenta = datos.cuentaId;
        borrarBorrador();
        guardar(msg);
      });
    // ---- foto y escaneo de la factura ----
    let fotoNueva = null, fotoQuitada = false;
    const zona = f.querySelector('[data-foto-zona]'), leido = f.querySelector('[data-leido]');
    const mostrarFoto = src => { zona.hidden = !src; if (src) zona.querySelector('img').src = src; };
    if (m && m.foto) verFoto(m.foto).then(src => mostrarFoto(src || '')).catch(() => {});
    f.querySelectorAll('[data-foto-origen]').forEach(b => b.onclick = async () => {
      const img = await pedirImagen(b.dataset.fotoOrigen);
      if (!img) return;
      fotoNueva = img.data; fotoQuitada = false; mostrarFoto(img.data);
      if (m) return; // al editar no se cambian los datos ya anotados
      leido.hidden = false; leido.innerHTML = `<small>${S.esApk() ? T.leyendo : T.leyendoWeb}</small>`;
      const texto = img.ocr ? await S.leerTexto(img.ocr) : null;
      if (texto === null) { leido.innerHTML = `<small>${T.ocrNoPudo}</small>`; return; }
      const r = window.Factura.leer(texto);
      const tg = f.querySelector('[name=tipo][value=gasto]'); if (tg && !tg.checked) { tg.checked = true; tg.dispatchEvent(new Event('change')); }
      if (r.total) { f.monto.value = aInput(r.total); f.monto.dispatchEvent(new Event('input')); }
      if (r.fecha) f.fecha.value = r.fecha;
      if (r.comercio) { if (!f.querySelector('[data-lugar]').hidden) f.lugar.value = r.comercio; else if (!f.nota.value) f.nota.value = r.comercio.slice(0, 80); }
      const extra = [r.ncf ? 'NCF ' + r.ncf : '', r.itbis ? 'ITBIS ' + L.formato(r.itbis, P()) : ''].filter(Boolean).join(' · ');
      if (extra && !f.nota.value.includes('NCF')) f.nota.value = (f.nota.value ? f.nota.value + ' · ' : '') + extra.slice(0, 60);
      leido.innerHTML = r.total ? `<b>🧾 ${T.leidoTotal(L.formato(r.total, P()))}</b><small>${[r.comercio, r.fecha && fechaCorta(r.fecha), extra].filter(Boolean).map(esc).join(' · ')}</small><small>${T.revisaAntes}</small>`
        : `<small>${T.ocrSinTotal}</small>`;
    });
    f.querySelector('[data-quitar-foto]').onclick = () => { fotoNueva = null; fotoQuitada = true; mostrarFoto(''); };
    f.querySelector('[data-ver-foto]').onclick = () => verFotoGrande(zona.querySelector('img').src);
    const montoActual = () => L.parseMonto(f.monto.value) || 0;
    const calcImp = conectarImpuesto(f, () => f.cuenta.value, montoActual, m && m.impuesto);
    const revisar = () => {
      const tr = f.querySelector('[name=tipo]:checked').value;
      const o = cuenta(f.cuenta.value), d2 = cuenta(f.destino.value);
      f.querySelector('[data-llega]').hidden = !(tr === 'transferencia' && o && d2 && o.moneda !== d2.moneda);
      f.querySelector('[data-sim]').textContent = o ? `(${sim(o.moneda)})` : '';
      const pc = f.querySelector('[name=cat]:checked') ? cat(f.querySelector('[name=cat]:checked').value) : {};
      f.querySelector('[data-quien]').hidden = tr === 'transferencia' || !pc.social;
      f.querySelector('[data-lugar]').hidden = tr === 'transferencia' || !pc.lugar;
      f.querySelector('[data-imp-zona]').hidden = tr === 'ingreso';
      const dz = f.querySelector('[data-div-zona]');
      if (dz) {
        dz.hidden = tr !== 'gasto'; f.querySelector('[data-div]').hidden = !f.dividir.checked;
        const n = String(f.personas.value).split(',').map(x => x.trim()).filter(Boolean).length + 1, mt = montoActual();
        f.querySelector('[data-div-txt]').textContent = n > 1 && mt ? T.dividirTxt(n, L.formato(Math.floor(mt / n), (o || {}).moneda || P())) : T.dividirAyuda;
      }
      if (calcImp) calcImp();
      resumenMas();
    };
    const resumenMas = () => {
      const q = f.querySelector('[name=quien]:checked'), tr = f.querySelector('[name=tipo]:checked').value, partes = [];
      if (tr !== 'ingreso' && f.conImp && f.conImp.checked && f.impuesto.value) partes.push(`${T.imp} ${f.impuesto.value}`);
      if (q && q.value && !f.querySelector('[data-quien]').hidden) partes.push(T.quien[q.value]);
      if (f.dividir && f.dividir.checked && tr === 'gasto') partes.push(T.dividido1);
      const mas = f.querySelector('[data-mas]');
      mas.hidden = tr === 'transferencia' && f.querySelector('[data-imp-zona]').hidden;
      f.querySelector('[data-mas-res]').textContent = partes.length ? '· ' + partes.join(' · ') : '';
    };
    f.addEventListener('change', () => resumenMas()); f.addEventListener('input', ev => { if (ev.target.name === 'impuesto' || ev.target.name === 'monto') resumenMas(); });
    const pintarSubs = sel => { const p = f.querySelector('[name=cat]:checked'); f.querySelector('[data-subs]').innerHTML = p ? subChips(p.value, sel) : ''; };
    const otraCalc = () => {
      const caja = f.querySelector('[data-otra]'); caja.hidden = !f.otra.checked;
      if (!f.otra.checked) return;
      const o = cuenta(f.cuenta.value), mon = f.monOrig.value;
      if (!f.tasaOrig.value && o) { const t1 = L.convertir(D, 1000000, mon, o.moneda); if (t1) f.tasaOrig.value = String(t1 / 1000000); }
      const mo = L.parseMonto(f.montoOrig.value), tasa = L.parseNum(f.tasaOrig.value);
      if (mo && tasa && o) { f.monto.value = aInput(Math.round(mo * tasa)); if (calcImp) calcImp(); }
      f.querySelector('[data-otra-txt]').textContent = o ? T.otraTxt(sim(mon), sim(o.moneda)) : '';
    };
    f.otra.onchange = otraCalc; f.montoOrig.oninput = otraCalc; f.tasaOrig.oninput = otraCalc;
    f.monOrig.onchange = () => { f.tasaOrig.value = ''; otraCalc(); };
    f.querySelectorAll('[name=tipo]').forEach(r => r.onchange = () => {
      const tr = r.value === 'transferencia';
      f.querySelector('[data-solo=transferencia]').hidden = !tr;
      f.querySelector('[data-solo=cat]').hidden = tr;
      f.querySelector('[data-no-tr]').hidden = tr;
      f.querySelector('[data-et-cuenta]').textContent = tr ? T.desde : T.cuenta;
      if (!tr) { f.querySelector('[data-chips]').innerHTML = chips(r.value); pintarSubs(); }
      revisar();
    });
    f.querySelector('[data-chips]').onchange = ev => { if (ev.target.name === 'cat') { pintarSubs(); revisar(); } };
    // Nueva categoría desde aquí: al guardarla (o cancelar) se vuelve a este formulario con todo lo escrito y la categoría elegida.
    f.querySelector('[data-chips]').onclick = ev => {
      const b = ev.target.closest('[data-nueva-cat]'); if (!b) return;
      const bor = snap(); guardarBorrador(bor);
      hojaCategoria(null, b.dataset.nuevaCat, { volver: nueva => {
        if (nueva) { const c = cat(nueva); bor.campos.cat = c.padre || c.id; bor.campos.sub = c.padre ? c.id : ''; }
        hojaMov(m, null, bor);
      } });
    };
    f.monto.oninput = () => { if (calcImp) calcImp(); if (f.dividir) revisar(); };
    if (f.dividir) { f.dividir.onchange = revisar; f.personas.oninput = revisar; }
    f.querySelectorAll('[data-frecuente]').forEach(bt => bt.onclick = () => { // lo de siempre: llena el formulario
      const x = fr[bt.dataset.frecuente], padre = L.padreDe(D, x.categoriaId);
      hojaMov(null, null, { t: Date.now(), campos: { tipo: 'gasto', monto: aInput(x.monto), cuenta: x.cuentaId, cat: padre, sub: padre !== x.categoriaId ? x.categoriaId : '', nota: x.nota || '', fecha: L.hoy(), quien: x.conQuien || '', lugar: x.lugar || '' } });
    });
    f.cuenta.onchange = () => { otraCalc(); revisar(); };
    f.destino.onchange = revisar;
    pintarSubs(subSel); revisar(); if (m && m.monedaOriginal) otraCalc();
    const b = f.querySelector('[data-borrar-mov]');
    if (b) b.onclick = () => {
      if (!confirm(T.confirmarBorrarMov)) return;
      const t = ahora(); m.borrado = true; m.editado = t;
      D.movimientos.filter(x => !x.borrado && x.ref && x.ref.id === m.id && (x.ref.tipo === 'dividir' || x.ref.tipo === 'redondeo')).forEach(x => { x.borrado = true; x.editado = t; });
      borrarBorrador(); hoja().close(); guardar(T.borrado);
    };
    // ---- borrador: lo escrito se guarda solo; si la app se bloquea, te llaman o Android la cierra, se continúa luego ----
    const snap = () => ({
      editId: m ? m.id : null, t: Date.now(), foto: fotoNueva, fotoQuitada,
      campos: Object.fromEntries([...f.elements].filter(e => e.name && !e.disabled).map(e => [e.name,
        e.type === 'radio' ? ((f.querySelector(`[name="${e.name}"]:checked`) || {}).value || '') : e.type === 'checkbox' ? e.checked : e.value])),
    });
    if (borrador) { // volver a poner todo como estaba
      const c = borrador.campos || {}, poner = (n, v) => { if (f[n] && v != null && f[n].type !== 'radio') f[n].value = v; };
      const radio = (n, v) => { const r = f.querySelector(`[name="${n}"][value="${CSS.escape(String(v))}"]`); if (r && !r.disabled) { r.checked = true; return r; } };
      const rt = radio('tipo', c.tipo); if (rt) rt.dispatchEvent(new Event('change'));
      ['monto', 'cuenta', 'destino', 'llega', 'monOrig', 'montoOrig', 'tasaOrig', 'fecha', 'nota', 'lugar'].forEach(n => poner(n, c[n]));
      if (c.otra) { f.otra.checked = true; otraCalc(); }
      if (radio('cat', c.cat)) { pintarSubs(c.sub || ''); }
      radio('quien', c.quien || '');
      if (f.conImp && c.conImp != null) { f.conImp.checked = !!c.conImp; f.conImp.dispatchEvent(new Event('change')); if (c.impuesto != null) { f.impuesto.value = c.impuesto; f.impuesto.dispatchEvent(new Event('input')); } }
      if (borrador.foto) { fotoNueva = borrador.foto; mostrarFoto(fotoNueva); }
      if (borrador.fotoQuitada) { fotoQuitada = true; mostrarFoto(''); }
      revisar();
    }
    snapActivo = snap;
    let tBor;
    // Solo si el formulario sigue abierto: guardar o cancelar justo después de escribir no debe revivir el borrador.
    const alCambiar = () => { clearTimeout(tBor); tBor = setTimeout(() => { if (snapActivo === snap && hoja().open) guardarBorrador(snap()); }, 250); };
    f.addEventListener('input', alCambiar); f.addEventListener('change', alCambiar);
    f.querySelector('[data-cerrar]').addEventListener('click', borrarBorrador); // Cancelar = ya no lo quiere
    if (!borrador) setTimeout(() => f.monto.focus(), 60);
  }

  // Borrador de Anotar (una copia en este teléfono; se borra al guardar o cancelar). Dura hasta 2 días.
  let snapActivo = null;
  const BORRADOR = 'wallet-borrador';
  function guardarBorrador(b) {
    try { localStorage.setItem(BORRADOR, JSON.stringify(b)); }
    catch { try { localStorage.setItem(BORRADOR, JSON.stringify({ ...b, foto: null })); } catch { /* sin espacio: se pierde solo la foto */ } }
  }
  function borrarBorrador() { snapActivo = null; try { localStorage.removeItem(BORRADOR); } catch { /* nada */ } }
  function leerBorrador() { try { const b = JSON.parse(localStorage.getItem(BORRADOR) || 'null'); return b && Date.now() - b.t < 2 * 864e5 ? b : null; } catch { return null; } }
  // Reabre lo que se estaba anotando (después de la huella, de volver de otra app o si Android cerró Wallet).
  function reanudarBorrador() {
    if (bloqueada || hoja().open) return;
    const b = leerBorrador(); if (!b) return;
    const m = b.editId ? D.movimientos.find(x => x.id === b.editId && !x.borrado) : null;
    if (b.editId && !m) return borrarBorrador();
    hojaMov(m, null, b);
    aviso(T.borradorRecuperado);
  }
  const guardarBorradorActivo = () => { if (snapActivo && hoja().open) guardarBorrador(snapActivo()); };

  // Cuenta normal o tarjeta de crédito. De la tarjeta solo se piden los 4 últimos números y el vencimiento (MM/AA).
  function hojaCuenta(c, tipoInicial) {
    if (c && (c.tipo === 'deuda' || c.tipo === 'porCobrar')) return hojaDetallePrestamo(c);
    if (c && c.tipo === 'sam') return X.abrirSamDeCuenta(c);
    if (c && c.parDe && cuenta(c.parDe)) return hojaCuenta(cuenta(c.parDe));
    const tipo = c ? c.tipo : (tipoInicial || 'diaria');
    const par = c && pareja(c);
    const f = abrirHoja(`
      <h2>${c ? T.editarCuenta : T.nuevaCuenta}</h2>
      ${segmento('tipo', ['diaria', 'ahorro', 'inversion', 'credito'].map(t => [t, T[t + 'Corto'] || T[t]]), tipo)}
      <label class="campo">${T.nombreCuenta}<input name="nombre" maxlength="40" required value="${c ? esc(c.nombre) : ''}"></label>
      <label class="campo">${T.banco}<input name="banco" maxlength="30" autocomplete="off" value="${c ? esc(c.banco || '') : ''}" placeholder="${T.bancoEj}"></label>
      <div data-cc ${tipo === 'credito' ? '' : 'hidden'}>
        <div class="dos">
          <label class="campo">${T.ultimos4}<input name="ultimos4" inputmode="numeric" maxlength="4" autocomplete="off" value="${c ? esc(c.ultimos4 || '') : ''}" placeholder="1234"></label>
          <label class="campo">${T.vence}<input name="vence" inputmode="numeric" maxlength="5" autocomplete="off" value="${c ? esc(c.vence || '') : ''}" placeholder="MM/AA"></label>
        </div>
        <p class="nota">🔒 ${T.ccSeguro}</p>
        <label class="campo">${T.limite}<input name="limite" inputmode="decimal" autocomplete="off" value="${c ? aInput(c.limite) : ''}" placeholder="0.00"></label>
        <div class="dos">
          <label class="campo">${T.diaCorte}<input name="diaCorte" type="number" min="1" max="31" value="${c && c.diaCorte || ''}"></label>
          <label class="campo">${T.diaPago}<input name="diaPago" type="number" min="1" max="31" value="${c && c.diaPago || ''}"></label>
        </div>
        <label class="interruptor"><span>💱 ${T.dobleMoneda}</span><input type="checkbox" name="doble" ${par ? 'checked' : ''}><i></i></label>
        <div data-doble ${par ? '' : 'hidden'}>
          <div class="dos">
            <label class="campo">${T.segundaMoneda}<select name="moneda2" ${par ? 'disabled' : ''}>${opcionesMonedas(par ? par.moneda : (P() === 'USD' ? 'DOP' : 'USD'))}</select></label>
            <label class="campo">${T.limite2}<input name="limite2" inputmode="decimal" autocomplete="off" value="${par ? aInput(par.limite) : ''}" placeholder="0.00"></label>
            ${par ? '' : `<label class="campo">${T.debesHoy2}<input name="saldo2" inputmode="decimal" autocomplete="off" placeholder="0.00"></label>`}
          </div>
          <p class="nota">${T.dobleTxt}</p>
        </div>
      </div>
      ${c ? '' : `<div class="dos">
        <label class="campo">${T.moneda}<select name="moneda">${opcionesMonedas(P())}</select></label>
        <label class="campo"><span data-et-saldo>${tipo === 'credito' ? T.debesHoy : T.saldoInicial}</span><input name="saldo" inputmode="decimal" autocomplete="off" placeholder="0.00"></label></div>`}
      <label class="campo">${T.impuestoCuenta}<input name="impuestoPct" inputmode="decimal" autocomplete="off" value="${c && c.impuestoPct || ''}" placeholder="0.15"></label>
      <p class="nota">${T.impuestoCuentaTxt}</p>
      <label class="interruptor"><span>${ico('candado')} ${T.enBoveda}</span><input type="checkbox" name="privada" ${c && c.privada ? 'checked' : ''}><i></i></label>
      ${c && c.tipo === 'credito' ? `<button type="button" class="pildora oscura ancho" data-pagar-cc>${T.pagarTarjeta}</button>` : ''}
      ${c ? `<button type="button" class="pildora ancho" data-fijar>${T.fijarSaldo}${par ? ` (${sim(c.moneda)})` : ''}</button>
             ${par ? `<button type="button" class="pildora ancho" data-fijar2>${T.fijarSaldo} (${sim(par.moneda)})</button>` : ''}
             <button type="button" class="pildora peligro ancho" data-borrar-cuenta>${T.borrarCuenta}</button>` : ''}`,
      fd => {
        const nombre = String(fd.get('nombre') || '').trim();
        if (!nombre) return T.nombreFalta;
        const privada = fd.get('privada') === 'on', tp = fd.get('tipo');
        if (privada && !bovedaAbierta()) return T.necesitaBoveda;
        const extra = { banco: String(fd.get('banco') || '').trim() || undefined };
        const pctTxt = String(fd.get('impuestoPct') || '').trim();
        extra.impuestoPct = pctTxt ? L.parseNum(pctTxt) : undefined;
        if (pctTxt && (!extra.impuestoPct || extra.impuestoPct >= 100)) return T.pctInvalido;
        if (tp === 'credito') {
          const u4 = String(fd.get('ultimos4') || '').trim(), v = String(fd.get('vence') || '').trim();
          if (u4 && !/^\d{4}$/.test(u4)) return T.ultimos4Mal;
          if (v && !/^(0[1-9]|1[0-2])\/\d{2}$/.test(v)) return T.venceMal;
          const lim = String(fd.get('limite') || '').trim() ? L.parseMonto(fd.get('limite')) : undefined;
          if (lim === null) return T.montoInvalido;
          const dia = k => { const n = Number(fd.get(k)); return n >= 1 && n <= 31 ? n : undefined; };
          Object.assign(extra, { ultimos4: u4 || undefined, vence: v || undefined, limite: lim, diaCorte: dia('diaCorte'), diaPago: dia('diaPago') });
        }
        const t = ahora();
        const icono = tp === 'credito' ? '💳' : tp === 'inversion' ? '📈' : tp === 'ahorro' ? '🐷' : '💵';
        // Doble moneda: segunda cuenta de crédito ligada (parDe) con los mismos datos de la tarjeta.
        const doble = tp === 'credito' && fd.get('doble') === 'on';
        let dob = null;
        if (doble) {
          const m2 = par ? par.moneda : fd.get('moneda2'), m1 = c ? c.moneda : fd.get('moneda');
          if (m2 === m1) return T.mismaMoneda;
          const l2 = String(fd.get('limite2') || '').trim() ? L.parseMonto(fd.get('limite2')) : undefined;
          const s2 = String(fd.get('saldo2') || '').trim() ? L.parseMonto(fd.get('saldo2'), true) : 0;
          if (l2 === null || s2 === null) return T.montoInvalido;
          dob = { moneda: m2, limite: l2, saldo: -Math.abs(s2 || 0) };
        } else if (par && L.saldoCuenta(D, par.id) !== 0) return T.dobleConSaldo;
        const comunes = () => JSON.parse(JSON.stringify({ nombre, privada, ...extra, limite: undefined }));
        const sincronizar = (principalId) => {
          if (dob && par) { for (const k of ['banco', 'impuestoPct', 'ultimos4', 'vence', 'diaCorte', 'diaPago']) delete par[k]; Object.assign(par, comunes(), { limite: dob.limite, editado: t }); }
          else if (dob) {
            const id2 = L.uuid();
            D.cuentas.push({ id: id2, moneda: dob.moneda, icono: '💳', tipo: 'credito', parDe: principalId, creado: t, editado: t, borrado: false, ...comunes(), limite: dob.limite });
            nuevoMov({ tipo: 'saldo', cuentaId: id2, monto: dob.saldo, fecha: L.hoy() });
          } else if (par) { par.borrado = true; par.editado = t; }
        };
        if (c) {
          for (const k of ['banco', 'impuestoPct', 'ultimos4', 'vence', 'limite', 'diaCorte', 'diaPago']) delete c[k];
          Object.assign(c, { nombre, tipo: tp, privada, editado: t, icono: c.tipo === tp ? c.icono : icono }, JSON.parse(JSON.stringify(extra)));
          sincronizar(c.id);
          return void guardar(T.guardado);
        }
        const txt = String(fd.get('saldo') || '').trim();
        let saldo = txt ? L.parseMonto(txt, true) : 0;
        if (saldo === null) return T.montoInvalido;
        if (tp === 'credito') saldo = -Math.abs(saldo);
        const id = L.uuid(), moneda = fd.get('moneda');
        D.cuentas.push({ id, nombre, moneda, icono, tipo: tp, privada, creado: t, editado: t, borrado: false, ...JSON.parse(JSON.stringify(extra)) });
        nuevoMov({ tipo: 'saldo', cuentaId: id, monto: saldo, fecha: L.hoy() });
        sincronizar(id);
        guardar(T.guardado);
      });
    f.querySelectorAll('[name=tipo]').forEach(r => r.onchange = () => {
      f.querySelector('[data-cc]').hidden = r.value !== 'credito';
      const e = f.querySelector('[data-et-saldo]'); if (e) e.textContent = r.value === 'credito' ? T.debesHoy : T.saldoInicial;
    });
    f.ultimos4.oninput = () => { f.ultimos4.value = f.ultimos4.value.replace(/\D/g, '').slice(0, 4); };
    f.vence.oninput = () => { let v = f.vence.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); f.vence.value = v; };
    f.doble.onchange = () => { f.querySelector('[data-doble]').hidden = !f.doble.checked; };
    if (!c) return;
    const pc = f.querySelector('[data-pagar-cc]'); if (pc) pc.onclick = () => hojaPagarTarjeta(c);
    f.querySelector('[data-fijar]').onclick = () => hojaSaldo(c);
    const f2 = f.querySelector('[data-fijar2]'); if (f2) f2.onclick = () => hojaSaldo(par);
    f.querySelector('[data-borrar-cuenta]').onclick = () => borrarCuenta(c);
  }
  function borrarCuenta(c) {
    if (!confirm(T.confirmarBorrarCuenta)) return;
    const t = ahora(), ids = new Set([c.id].concat(D.cuentas.filter(x => x.parDe === c.id).map(x => x.id)));
    D.cuentas.forEach(x => { if (ids.has(x.id)) { x.borrado = true; x.editado = t; } });
    D.movimientos.forEach(m => { if (ids.has(m.cuentaId) || ids.has(m.cuentaDestinoId)) { m.borrado = true; m.editado = t; } });
    hoja().close(); guardar(T.borrado);
  }

  function hojaSaldo(c, m) {
    const actual = m ? m.monto : L.saldoCuenta(D, c.id);
    const f = abrirHoja(`
      <h2>${T.fijarSaldo} · ${esc(c.nombre)}</h2>
      <label class="campo monto-campo">${T.nuevoSaldo} (${sim(c.moneda)})<input name="saldo" inputmode="decimal" autocomplete="off" required value="${(actual / 100).toFixed(2)}"></label>
      ${esPasivo(c) ? `<p class="nota">${T.saldoNegativoTxt}</p>` : ''}
      <label class="campo">${T.fecha}<input type="date" name="fecha" required value="${m ? m.fecha : L.hoy()}"></label>
      ${m ? `<button type="button" class="pildora peligro ancho" data-borrar-mov>${T.borrar}</button>` : ''}`,
      fd => {
        const monto = L.parseMonto(fd.get('saldo'), true);
        if (monto === null) return T.montoInvalido;
        if (m) Object.assign(m, { monto, fecha: fd.get('fecha'), editado: ahora() });
        else nuevoMov({ tipo: 'saldo', cuentaId: c.id, monto, fecha: fd.get('fecha') || L.hoy() });
        guardar(T.guardado);
      });
    const b = f.querySelector('[data-borrar-mov]');
    if (b) b.onclick = () => { if (confirm(T.confirmarBorrarMov)) { m.borrado = true; m.editado = ahora(); hoja().close(); guardar(T.borrado); } };
  }

  // Pagar la tarjeta. Si hubo compras en otra moneda, con la tasa del banco de hoy se calcula la diferencia desde el día de la compra.
  // Tasa «1 extranjera = t local»: la local es la moneda principal (si ninguna lo es, la de la cuenta de origen).
  function tasaPar(de, a) {
    const local = de === P() || a === P() ? P() : de, ext = local === de ? a : de;
    return { local, ext, sugerida: Number(D.ajustes.tasas[ext]) && local === P() ? Number(D.ajustes.tasas[ext]) : '' };
  }
  // Pasa un monto de la moneda «a» (lo que se paga) a la moneda «de» (lo que sale), con la tasa «1 ext = t local».
  const convertirCon = (monto, a, de, info, t) => (a === de ? monto : a === info.ext ? Math.round(monto * t) : Math.round(monto / t));

  // Pagar la tarjeta (cualquiera de sus balances si es de doble moneda), desde cualquier cuenta.
  // - Tarjeta en pesos con compras en otra moneda: con la tasa de hoy se anota la diferencia desde la compra.
  // - Balance en dólares pagado con pesos: se muestra cuánto más (o menos) cuesta que el día de cada compra.
  function hojaPagarTarjeta(c0) {
    const principal = c0.parDe ? cuenta(c0.parDe) : c0, par = pareja(principal);
    const balances = [principal].concat(par ? [par] : []);
    const origenes = cuentasVivas().filter(x => !balances.includes(x) && ['diaria', 'ahorro', 'inversion'].includes(x.tipo) && !x.castigado);
    if (!origenes.length) return aviso(T.creaCuentaPrimero, true);
    const f = abrirHoja(`
      <h2>${T.pagarTarjeta} · ${esc(principal.nombre)}</h2>
      ${balances.length > 1 ? segmento('bal', balances.map(b => [b.id, `${T.balance} ${sim(b.moneda)}`]), c0.id) : `<input type="hidden" name="bal" value="${esc(principal.id)}">`}
      <p class="nota" data-debes></p>
      <div class="caja-info" data-compras hidden></div>
      <label class="campo monto-campo"><span>${T.montoPagar} <span data-sim></span></span><input name="monto" inputmode="decimal" autocomplete="off" required></label>
      <label class="campo">${T.desde}<select name="cuenta">${origenes.map(x => `<option value="${esc(x.id)}">${esc(x.nombre)} (${sim(x.moneda)})</option>`).join('')}</select></label>
      <div class="caja-info conversion" data-conv>
        <label class="campo" data-tasa hidden><span data-tasa-et></span><input name="tasa" inputmode="decimal" autocomplete="off" placeholder="0.00"></label>
        <small data-tasa-origen></small>
        <b data-sale></b>
      </div>
      <p class="nota" data-dif></p>
      ${bloqueImpuesto(0)}
      <label class="campo">${T.fecha}<input type="date" name="fecha" required value="${L.hoy()}"></label>`,
      fd => {
        const b = cuenta(fd.get('bal')), o = cuenta(fd.get('cuenta'));
        const monto = L.parseMonto(fd.get('monto')); if (!monto) return T.montoInvalido;
        const imp = leerImpuesto(fd); if (imp === null) return T.montoInvalido;
        const info = tasaPar(o.moneda, b.moneda), t = L.parseNum(fd.get('tasa'));
        if (o.moneda !== b.moneda && !t) return T.faltaTasaPago;
        const fecha = fd.get('fecha') || L.hoy(), grupo = L.uuid();
        const compras = PL.comprasSinPagar(D, b.id);
        if (o.moneda === b.moneda && compras.length && t) { // compras en otra moneda en una tarjeta de una sola moneda
          const dif = PL.diferenciaCambiaria(compras, t).diferencia;
          if (dif) nuevoMov({ tipo: dif > 0 ? 'gasto' : 'ingreso', cuentaId: b.id, monto: Math.abs(dif), fecha, categoriaId: dif > 0 ? 'c-cambio' : 'c-cambio-i', nota: T.difCambiaria, grupo });
          compras.forEach(m => { m.tasaPago = t; m.editado = ahora(); });
        }
        if (o.moneda !== b.moneda) PL.comprasConTasaDia(D, b.id).forEach(m => { m.tasaPago = t; m.editado = ahora(); });
        const sale = convertirCon(monto, b.moneda, o.moneda, info, t);
        // Se recuerda la tasa del banco para esta tarjeta y la cuenta con que se pagó cada balance.
        if (o.moneda !== b.moneda) principal.ultimaTasa = { ...(principal.ultimaTasa || {}), [info.ext]: t };
        principal.ultimoOrigen = { ...(principal.ultimoOrigen || {}), [b.moneda]: o.id };
        if (o.moneda !== b.moneda && !(Number(D.ajustes.tasas[info.ext]) > 0) && info.local === P()) D.ajustes.tasas[info.ext] = t;
        nuevoMov({ tipo: 'transferencia', cuentaId: o.id, cuentaDestinoId: b.id, monto: sale, montoDestino: monto, impuesto: imp || undefined, fecha, grupo, ref: { tipo: 'tarjeta', id: b.id, periodo: fecha } }, 2);
        guardar(T.guardado);
      }, { textoOk: T.pagar });
    const calcImp = conectarImpuesto(f, () => f.cuenta.value, () => { const b = cuenta(f.bal.value), o = cuenta(f.cuenta.value), m = L.parseMonto(f.monto.value) || 0, t = L.parseNum(f.tasa.value); return o.moneda === b.moneda ? m : t ? convertirCon(m, b.moneda, o.moneda, tasaPar(o.moneda, b.moneda), t) : 0; });
    const actualizar = (cambioBalance) => {
      const b = cuenta(f.bal.value), o = cuenta(f.cuenta.value);
      const deuda = Math.max(0, -L.saldoCuenta(D, b.id)), info = tasaPar(o.moneda, b.moneda);
      f.querySelector('[data-debes]').innerHTML = `${T.debes}: <b>${din(deuda, b.moneda)}</b>`;
      f.querySelector('[data-sim]').textContent = `(${sim(b.moneda)})`;
      if (cambioBalance) f.monto.value = aInput(deuda);
      const otra = o.moneda !== b.moneda, compras = PL.comprasSinPagar(D, b.id);
      f.querySelector('[data-tasa]').hidden = !(otra || compras.length);
      f.querySelector('[data-tasa-et]').textContent = otra ? T.tasaUno(sim(info.ext), sim(info.local)) : T.tasaBancoHoy;
      const ultima = otra && principal.ultimaTasa && Number(principal.ultimaTasa[info.ext]);
      if (otra && !f.tasa.value && (ultima || info.sugerida)) f.tasa.value = String(ultima || info.sugerida);
      f.querySelector('[data-tasa-origen]').textContent = otra ? (ultima ? T.tasaUltima : info.sugerida ? T.tasaDeAjustes : T.tasaEscribe) : '';
      const caja = f.querySelector('[data-compras]');
      const porMon = {}; compras.forEach(m => { porMon[m.monedaOriginal] = (porMon[m.monedaOriginal] || 0) + m.montoOriginal; });
      caja.hidden = otra || !compras.length;
      caja.innerHTML = compras.length ? `<b>💱 ${T.comprasOtraMoneda(compras.length)}</b><small>${Object.entries(porMon).map(([mo, v]) => L.formato(v, mo)).join(' · ')}</small>` : '';
      const t = L.parseNum(f.tasa.value), m = L.parseMonto(f.monto.value) || 0, dif = f.querySelector('[data-dif]'), sale = f.querySelector('[data-sale]');
      sale.textContent = !m ? '' : otra ? (t ? T.seDebitan(L.formato(convertirCon(m, b.moneda, o.moneda, info, t), o.moneda), o.nombre) : '') : T.sinConversion(L.formato(m, o.moneda), o.nombre);
      dif.innerHTML = '';
      if (t && !otra && compras.length) {
        const r = PL.diferenciaCambiaria(compras, t);
        dif.innerHTML = r.diferencia > 0 ? T.difPierdes(din(r.diferencia, b.moneda)) : r.diferencia < 0 ? T.difGanas(din(-r.diferencia, b.moneda)) : T.difNada;
        if (cambioBalance !== false) f.monto.value = aInput(Math.max(0, deuda + r.diferencia));
      }
      if (t && otra) { // balance en dólares pagado con pesos: comparar con la tasa del día de cada compra
        const r = PL.difTasaDia(PL.comprasConTasaDia(D, b.id), t, b.moneda === info.ext);
        if (r.diferencia) dif.innerHTML = r.diferencia > 0 ? T.difPierdes(din(r.diferencia, info.local)) : T.difGanas(din(-r.diferencia, info.local));
      }
      if (calcImp) calcImp();
    };
    // Cuenta de origen: la última usada para ese balance (si existe).
    const origenDe = b => { const id = (principal.ultimoOrigen || {})[b.moneda]; if (id && origenes.some(x => x.id === id)) f.cuenta.value = id; };
    origenDe(cuenta(f.bal.value));
    f.querySelectorAll('[name=bal]').forEach(r => { r.onchange = () => { f.tasa.value = ''; origenDe(cuenta(f.bal.value)); monPrev = cuenta(f.cuenta.value).moneda; actualizar(true); }; });
    let monPrev = cuenta(f.cuenta.value).moneda; // la tasa escrita solo se borra si cambia la moneda de origen
    f.cuenta.onchange = () => { const m = cuenta(f.cuenta.value).moneda; if (m !== monPrev) f.tasa.value = ''; monPrev = m; actualizar(false); };
    f.tasa.oninput = () => actualizar(); f.monto.oninput = () => actualizar(false);
    actualizar(true);
  }

  // ---------- préstamos reales: los que debo (deuda) y los que hice (porCobrar) ----------
  function camposPlan(p) {
    p = p || {};
    return `<div class="dos">
        <label class="campo">${T.tipoCalculo}<select name="tipoCalc">${PR.TIPOS.map(t => `<option value="${t}" ${(p.tipo || 'frances') === t ? 'selected' : ''}>${T.tiposPrestamo[t]}</option>`).join('')}</select></label>
        <label class="campo">${T.frecuencia}<select name="frecuencia">${PR.FRECUENCIAS.map(t => `<option value="${t}" ${(p.frecuencia || 'mensual') === t ? 'selected' : ''}>${T.frec[t]}</option>`).join('')}</select></label>
        <label class="campo">${T.tasaPct}<input name="tasa" inputmode="decimal" autocomplete="off" value="${p.tasa || ''}" placeholder="0"></label>
        <label class="campo">${T.periodoTasa}<select name="periodoTasa">${['anual', 'mensual', 'quincenal', 'semanal', 'diaria'].map(t => `<option value="${t}" ${(p.periodoTasa || 'anual') === t ? 'selected' : ''}>${T.porPeriodo[t]}</option>`).join('')}</select></label>
        <label class="campo">${T.plazoCuotas}<input name="plazo" type="number" min="1" max="3650" value="${p.plazo || 12}"></label>
        <label class="campo">${T.fechaPrestamo}<input type="date" name="inicio" value="${p.inicio || L.hoy()}"></label>
        <label class="campo" data-pagadas>${T.cuotasPagadas}<input name="pagadas" type="number" min="0" max="3650" value="${p.pagadas || 0}"></label>
      </div><p class="nota" data-plan-txt></p>`;
  }
  function leerPlan(fd, monto) {
    const tasa = String(fd.get('tasa') || '').trim() ? L.parseNum(fd.get('tasa')) : 0;
    if (tasa === null) return null;
    const plazo = Math.max(1, Number(fd.get('plazo')) || 1);
    return { monto, tasa, periodoTasa: fd.get('periodoTasa'), plazo, frecuencia: fd.get('frecuencia'), tipo: fd.get('tipoCalc'), inicio: fd.get('inicio') || L.hoy(),
      pagadas: Math.min(plazo, Math.max(0, Number(fd.get('pagadas')) || 0)) };
  }
  function hojaPrestamo(dir, planInicial) {
    const esDeuda = dir === 'deuda';
    const f = abrirHoja(`
      <h2>${T.nuevoPrestamo}</h2>
      ${segmento('dir', [['deuda', T.meprestaron], ['porCobrar', T.yopreste]], dir)}
      <label class="campo"><span data-et-persona>${esDeuda ? T.quienTePresto : T.aQuienPrestaste}</span><input name="persona" maxlength="40" required autocomplete="off"></label>
      <div class="dos">
        <label class="campo">${T.moneda}<select name="moneda">${opcionesMonedas(P())}</select></label>
        <label class="campo">${T.montoPrestamo}<input name="monto" inputmode="decimal" autocomplete="off" value="${planInicial ? aInput(planInicial.monto) : ''}" placeholder="0.00"></label>
      </div>
      <label class="campo"><span data-et-cuenta>${esDeuda ? T.entroEn : T.salioDe}</span><select name="cuenta"><option value="">${T.noPasoPorCuentas}</option></select></label>
      ${camposPlan(planInicial)}`,
      fd => {
        const persona = String(fd.get('persona') || '').trim(); if (!persona) return T.nombreFalta;
        const monto = L.parseMonto(fd.get('monto')); if (!monto) return T.montoInvalido;
        const plan = leerPlan(fd, monto); if (!plan) return T.montoInvalido;
        const d0 = fd.get('dir'), moneda = fd.get('moneda'), id = L.uuid(), t = ahora();
        D.cuentas.push({ id, nombre: persona, persona, moneda, icono: d0 === 'deuda' ? '🏦' : '🤝', tipo: d0, privada: false, plan, creado: t, editado: t, borrado: false });
        const fecha = L.hoy(), cta = fd.get('cuenta');
        if (cta) plan.pagadas = 0;
        else if (plan.pagadas) { // préstamo que ya venía pagándose: lo que falta es el saldo de la tabla tras esas cuotas
          const fila = PR.prestamo(plan).filas[plan.pagadas - 1];
          if (fila) { const resta = fila.saldo; nuevoMov({ tipo: 'saldo', cuentaId: id, monto: d0 === 'deuda' ? -resta : resta, fecha }); return void guardar(T.guardado); }
        }
        if (cta) {
          nuevoMov({ tipo: 'saldo', cuentaId: id, monto: 0, fecha });
          nuevoMov(d0 === 'deuda' ? { tipo: 'transferencia', cuentaId: id, cuentaDestinoId: cta, monto, montoDestino: monto, fecha } : { tipo: 'transferencia', cuentaId: cta, cuentaDestinoId: id, monto, montoDestino: monto, fecha }, 2);
        } else nuevoMov({ tipo: 'saldo', cuentaId: id, monto: d0 === 'deuda' ? -monto : monto, fecha });
        guardar(T.guardado);
      });
    const llenar = () => {
      const sel = f.cuenta.value;
      f.cuenta.innerHTML = `<option value="">${T.noPasoPorCuentas}</option>` + opcionesCuentas(sel, { moneda: f.moneda.value, tipos: ['diaria', 'ahorro', 'inversion'] });
      f.querySelector('[data-pagadas]').hidden = !!f.cuenta.value;
    };
    f.cuenta.onchange = llenar;
    const resumenPlan = () => {
      const monto = L.parseMonto(f.monto.value), plan = monto && leerPlan(new FormData(f), monto);
      const r = plan ? PR.prestamo(plan) : null;
      f.querySelector('[data-plan-txt]').innerHTML = r ? T.resumenPlan(L.formato(r.cuota, f.moneda.value), r.cuotas, L.formato(r.totalInteres, f.moneda.value)) : '';
    };
    f.querySelectorAll('[name=dir]').forEach(r => r.onchange = () => {
      const deu = r.value === 'deuda';
      f.querySelector('[data-et-persona]').textContent = deu ? T.quienTePresto : T.aQuienPrestaste;
      f.querySelector('[data-et-cuenta]').textContent = deu ? T.entroEn : T.salioDe;
    });
    f.moneda.onchange = llenar; llenar();
    f.oninput = resumenPlan; resumenPlan();
  }
  const sumaMovs = f => D.movimientos.filter(m => !m.borrado && f(m)).reduce((a, m) => a + m.monto, 0);
  const recuperadoDe = c => sumaMovs(m => m.ref && m.ref.tipo === 'recupera' && m.ref.id === c.id);
  const perdidoDe = c => sumaMovs(m => m.cuentaId === c.id && m.categoriaId === 'c-incobrable') - recuperadoDe(c);
  function hojaDetallePrestamo(c) {
    const s = L.saldoCuenta(D, c.id), deuda = c.tipo === 'deuda', pendiente = deuda ? -s : s;
    const sc = PL.siguienteCuota(D, c), t = PL.tablaDe(c);
    const recuperado = recuperadoDe(c), perdido = perdidoDe(c) + recuperado;
    const f = abrirHoja(`
      <h2>${c.icono} ${esc(c.nombre)}</h2>
      <p class="grande">${c.castigado ? T.perdido : deuda ? T.debes : T.teDebe}: <b>${din(c.castigado ? perdido - recuperado : Math.max(0, pendiente), c.moneda)}</b></p>
      ${c.castigado ? `<p class="nota">${T.castigadoEl(fechaCorta(c.castigado))}${recuperado ? ' · ' + T.recuperado + ' ' + din(recuperado, c.moneda) : ''}</p>` : ''}
      ${t && !c.castigado ? `<p class="nota">${T.tiposPrestamo[c.plan.tipo]} · ${c.plan.tasa} % ${T.porPeriodo[c.plan.periodoTasa]} · ${T.frec[c.plan.frecuencia]} · ${T.resumenPlan(din(t.cuota, c.moneda), t.cuotas, din(t.totalInteres, c.moneda))}</p>
        ${sc ? `<div class="caja-info"><b>${T.cuotaN(sc.numero, sc.total)}${sc.fecha ? ' · ' + fechaCorta(sc.fecha) : ''}</b><small>${T.capital} ${din(sc.fila.capital, c.moneda)} · ${T.interes} ${din(sc.fila.interes, c.moneda)}</small></div>` : `<p class="pos">${T.saldado}</p>`}` : ''}
      ${c.castigado ? `<button type="button" class="pildora oscura ancho" data-recuperar>${T.mePagoAlgo}</button>`
        : `<button type="button" class="pildora oscura ancho" data-cuota>${deuda ? T.pagarCuota : T.cobrarCuota}</button>
           ${t ? `<button type="button" class="pildora ancho" data-tabla>${T.verTabla}</button>` : ''}
           ${!deuda && pendiente > 0 ? `<button type="button" class="pildora peligro ancho" data-castigar>🚫 ${T.castigar}</button>` : ''}`}
      <button type="button" class="pildora ancho" data-fijar>${T.fijarSaldo}</button>
      <button type="button" class="pildora peligro ancho" data-borrar-cuenta>${T.borrarCuenta}</button>
      <div class="acciones uno"><button type="button" class="pildora" data-cerrar>${T.cerrar}</button></div>`, () => {}, { sinAcciones: true });
    const on = (sel, fn) => { const b = f.querySelector(sel); if (b) b.onclick = fn; };
    on('[data-cuota]', () => hojaCuota(c));
    on('[data-tabla]', () => X.hojaTabla(t, c.moneda, c.nombre));
    on('[data-castigar]', () => {
      if (!confirm(T.confirmarCastigar(L.formato(pendiente, c.moneda)))) return;
      nuevoMov({ tipo: 'gasto', cuentaId: c.id, monto: pendiente, fecha: L.hoy(), categoriaId: 'c-incobrable', nota: T.castigado });
      c.castigado = L.hoy(); c.editado = ahora(); hoja().close(); guardar(T.guardado);
    });
    on('[data-recuperar]', () => hojaRecuperar(c));
    on('[data-fijar]', () => hojaSaldo(c));
    on('[data-borrar-cuenta]', () => borrarCuenta(c));
  }
  function hojaCuota(c) {
    const deuda = c.tipo === 'deuda', sc = PL.siguienteCuota(D, c), pend = Math.abs(L.saldoCuenta(D, c.id));
    const f = abrirHoja(`
      <h2>${deuda ? T.pagarCuota : T.cobrarCuota} · ${esc(c.nombre)}</h2>
      ${sc ? `<p class="nota">${T.cuotaN(sc.numero, sc.total)}</p>` : ''}
      <div class="dos">
        <label class="campo">${T.capital} (${sim(c.moneda)})<input name="capital" inputmode="decimal" autocomplete="off" value="${aInput(sc ? Math.min(sc.fila.capital + sc.fila.extra, pend) : pend)}"></label>
        <label class="campo">${T.interes} (${sim(c.moneda)})<input name="interes" inputmode="decimal" autocomplete="off" value="${aInput(sc ? sc.fila.interes : 0)}"></label>
      </div>
      <p class="nota">${T.abonoTxt}</p>
      <label class="campo">${deuda ? T.desde : T.hacia}<select name="cuenta">${opcionesCuentas(null, { moneda: c.moneda, tipos: ['diaria', 'ahorro', 'inversion', 'credito'] })}</select></label>
      ${deuda ? bloqueImpuesto(0) : ''}
      <label class="campo">${T.fecha}<input type="date" name="fecha" required value="${sc && sc.fecha && sc.fecha < L.hoy() ? sc.fecha : L.hoy()}"></label>`,
      fd => {
        const cap = String(fd.get('capital') || '').trim() ? L.parseMonto(fd.get('capital')) : 0;
        const int = String(fd.get('interes') || '').trim() ? L.parseMonto(fd.get('interes')) : 0;
        if (cap === null || int === null || !(cap + int)) return T.montoInvalido;
        const cta = fd.get('cuenta'); if (!cta) return T.sinCuentaPago(sim(c.moneda));
        const imp = deuda ? leerImpuesto(fd) : 0; if (imp === null) return T.montoInvalido;
        const fecha = fd.get('fecha') || L.hoy(), grupo = L.uuid(), ref = { tipo: 'cuota', id: c.id, periodo: String(sc ? sc.numero : 'x' + Date.now()) };
        if (cap) nuevoMov(deuda ? { tipo: 'transferencia', cuentaId: cta, cuentaDestinoId: c.id, monto: cap, montoDestino: cap, impuesto: imp || undefined, fecha, grupo, ref }
          : { tipo: 'transferencia', cuentaId: c.id, cuentaDestinoId: cta, monto: cap, montoDestino: cap, fecha, grupo, ref });
        if (int) nuevoMov({ tipo: deuda ? 'gasto' : 'ingreso', cuentaId: cta, monto: int, fecha, categoriaId: deuda ? 'c-intereses' : 'c-intereses-i', nota: c.nombre, grupo, ref }, 2);
        guardar(L.saldoCuenta(D, c.id) === 0 ? T.prestamoSaldado : T.guardado);
      }, { textoOk: deuda ? T.pagar : T.cobrar });
    if (deuda) { conectarImpuesto(f, () => f.cuenta.value, () => L.parseMonto(f.capital.value) || 0); f.cuenta.onchange = () => f.querySelector('[data-imp]')._calc(); }
  }
  function hojaRecuperar(c) {
    abrirHoja(`<h2>${T.mePagoAlgo} · ${esc(c.nombre)}</h2>
      <label class="campo monto-campo">${T.monto} (${sim(c.moneda)})<input name="monto" inputmode="decimal" autocomplete="off" required></label>
      <label class="campo">${T.hacia}<select name="cuenta">${opcionesCuentas(null, { moneda: c.moneda, tipos: ['diaria', 'ahorro', 'inversion'] })}</select></label>
      <label class="campo">${T.fecha}<input type="date" name="fecha" required value="${L.hoy()}"></label>`,
      fd => {
        const monto = L.parseMonto(fd.get('monto')); if (!monto) return T.montoInvalido;
        if (!fd.get('cuenta')) return T.sinCuentaPago(sim(c.moneda));
        nuevoMov({ tipo: 'ingreso', cuentaId: fd.get('cuenta'), monto, fecha: fd.get('fecha'), categoriaId: 'c-recuperado', nota: c.nombre, ref: { tipo: 'recupera', id: c.id, periodo: L.hoy() } });
        guardar(T.guardado);
      });
  }

  function hojaPresupuesto() {
    const pres = D.ajustes.presupuestos;
    abrirHoja(`<h2>${T.presupuesto}</h2><p class="nota">${T.limitePorCategoria} (${sim(P())})</p>
      ${D.categorias.filter(c => !c.borrado && c.tipo === 'gasto' && !c.padre).map(c => `<label class="campo fila-campo"><span>${c.icono} ${esc(catNombre(c.id))}</span>
        <input name="${esc(c.id)}" inputmode="decimal" autocomplete="off" placeholder="—" value="${pres[c.id] ? (pres[c.id] / 100).toFixed(0) : ''}"></label>`).join('')}`,
      fd => {
        const nuevo = {};
        for (const [k, v] of fd.entries()) {
          if (!String(v).trim()) continue;
          const c = L.parseMonto(v); if (!c) return T.montoInvalido;
          nuevo[k] = c;
        }
        D.ajustes.presupuestos = nuevo;
        guardar(T.guardado);
      });
  }

  // Categorías: el usuario agrega las suyas (o subcategorías) y oculta las que no usa.
  function hojaCategorias() {
    const fila = c => `<li class="cat-fila ${c.borrado ? 'apagada' : ''}"><button type="button" class="cat-editar" data-cat-editar="${esc(c.id)}"><span class="ico" style="--c:${c.color}">${c.icono}</span><span class="txt"><b>${esc(catNombre(c.id))}</b><small>${c.tipo === 'gasto' && !c.padre ? T.grupoCorto[window.Consejos.grupoDe(D, c.id) || 'otro'] : ''}</small></span></button>
      <button type="button" class="mini" data-cat-ver="${esc(c.id)}">${c.borrado ? T.mostrar : T.ocultarCat}</button></li>`;
    const grupo = tipo => D.categorias.filter(c => c.tipo === tipo && !c.padre).map(p => fila(p) + D.categorias.filter(s => s.padre === p.id).map(s => fila(s).replace('cat-fila', 'cat-fila hija')).join('')).join('');
    const f = abrirHoja(`<h2>${T.categorias}</h2><p class="nota">${T.categoriasTxt}</p>
      <button type="button" class="pildora oscura ancho" data-cat-nueva>${ico('mas')} ${T.nuevaCategoria}</button>
      <h3>${T.gasto}</h3><ul class="lista-plana">${grupo('gasto')}</ul><h3>${T.ingreso}</h3><ul class="lista-plana">${grupo('ingreso')}</ul>
      <div class="acciones uno"><button type="button" class="pildora" data-cerrar>${T.listo}</button></div>`, () => {}, { sinAcciones: true });
    f.onclick = ev => {
      const b = ev.target.closest('[data-cat-ver]');
      if (b) { const c = cat(b.dataset.catVer); c.borrado = !c.borrado; c.editado = ahora(); guardar(); return hojaCategorias(); }
      if (ev.target.closest('[data-cat-nueva]')) return hojaCategoria();
      const e = ev.target.closest('[data-cat-editar]'); if (e) hojaCategoria(cat(e.dataset.catEditar));
    };
  }
  // Crear o editar una categoría: ícono de una cuadrícula, nombre, tipo (gasto o ingreso), grupo (necesidad o gusto), dentro de cuál y color.
  const EMOJIS = ['🏷️', '🛒', '🍔', '🍕', '☕', '🍺', '🥗', '🍰', '🎮', '🎬', '🎵', '🎟️', '📚', '🎓', '💻', '📱', '🎧', '👕', '👟', '👜', '💄', '💇', '💅', '🏋️', '⚽', '🏖️',
    '🚗', '⛽', '🚕', '🚌', '🛵', '✈️', '🏠', '🔑', '🛋️', '💡', '💧', '🌐', '📺', '🔥', '🧽', '🔧', '🐶', '🐱', '👶', '🧸', '🎁', '🙏', '💊', '🩺', '🦷', '👓',
    '💼', '💰', '🪙', '📈', '🏦', '💳', '🧾', '🎉', '🛍️', '📦', '✂️', '🌱', '🎨', '📷', '🧳', '⛪'];
  function hojaCategoria(c, tipoInicial, { volver } = {}) { // volver(idNueva|null): se abrió desde Anotar y hay que regresar ahí
    const paleta = ['#FF9F0A', '#FF6B35', '#FF375F', '#FF7EB3', '#BF5AF2', '#7B61FF', '#5E5CE6', '#0A84FF', '#64D2FF', '#34C7A0', '#30D158', '#A2845E', '#8E8E93'];
    const tipo = c ? c.tipo : (tipoInicial || 'gasto'), grupoSel = c ? (window.Consejos.grupoDe(D, c.id) || 'deseos') : 'necesidades';
    const icono0 = c ? c.icono : '🏷️', color0 = c ? c.color : paleta[0];
    const f = abrirHoja(`<h2>${c ? T.editarCategoria : T.nuevaCategoria}</h2>
      ${c ? '' : segmento('tipo', [['gasto', T.gasto], ['ingreso', T.ingreso]], tipo)}
      <div class="cat-vista"><span class="ico grande-ico" data-vista style="--c:${color0}">${icono0}</span>
        <label class="campo">${T.nombre}<input name="nombre" maxlength="30" required autocomplete="off" value="${c ? esc(catNombre(c.id)) : ''}" placeholder="${T.nombreCatEj}"></label></div>
      <fieldset class="chips"><legend>${T.icono}</legend><div class="emojis">${EMOJIS.map(e => `<label class="emoji"><input type="radio" name="icono" value="${e}" ${e === icono0 ? 'checked' : ''}><span>${e}</span></label>`).join('')}</div>
        <label class="campo otro-emoji">${T.otroIcono}<input name="iconoLibre" maxlength="4" autocomplete="off" placeholder="😀"></label></fieldset>
      <div data-grupo ${tipo === 'gasto' ? '' : 'hidden'}><p class="campo-et">${T.tipoGasto}</p>${segmento('grupo', [['necesidades', '🏠 ' + T.necesidad], ['deseos', '🎉 ' + T.gusto]], grupoSel)}
        <p class="nota">${T.tipoGastoTxt}</p></div>
      ${c && c.padre ? '' : `<label class="campo">${T.dentroDe}<select name="padre"></select></label>`}
      <fieldset class="chips"><legend>${T.color}</legend><div>${paleta.map(x => `<label class="chip color" style="--c:${x}"><input type="radio" name="color" value="${x}" ${x === color0 ? 'checked' : ''}><span></span></label>`).join('')}</div></fieldset>
      ${c ? `<button type="button" class="pildora ancho" data-ocultar>${c.borrado ? T.mostrar : T.ocultarCat}</button>` : ''}`,
      fd => {
        const nombre = String(fd.get('nombre') || '').trim(); if (!nombre) return T.nombreFalta;
        const icono = String(fd.get('iconoLibre') || '').trim() || fd.get('icono') || '🏷️';
        const tp = c ? c.tipo : fd.get('tipo'), padre = c && c.padre ? c.padre : (fd.get('padre') || undefined), t = ahora();
        const datos = { nombre, icono, color: padre ? cat(padre).color : fd.get('color'), grupo: tp === 'gasto' && !padre ? fd.get('grupo') : undefined, padre, editado: t };
        if (c) {
          if (padre && padre === c.id) return T.mismaCuenta;
          Object.assign(c, datos); if (!datos.grupo) delete c.grupo; if (!padre) delete c.padre;
          // Si cambió el nombre de una de fábrica, se guarda en «nombre» y deja de usar el texto traducido.
        }
        let idNueva = c ? c.id : null;
        if (!c) { idNueva = 'u-' + L.uuid(); D.categorias.push({ id: idNueva, tipo: tp, creado: t, borrado: false, ...JSON.parse(JSON.stringify(datos)) }); }
        guardar(T.categoriaLista(icono, nombre));
        if (volver) volver(idNueva);
      });
    const vista = f.querySelector('[data-vista]');
    const ver = () => { vista.textContent = String(f.iconoLibre.value || '').trim() || (f.querySelector('[name=icono]:checked') || {}).value || '🏷️'; vista.style.setProperty('--c', (f.querySelector('[name=color]:checked') || {}).value || color0); };
    f.addEventListener('change', ver); f.iconoLibre.oninput = ver;
    const tipoAct = () => (c ? c.tipo : f.querySelector('[name=tipo]:checked').value);
    const llenar = () => {
      f.querySelector('[data-grupo]').hidden = tipoAct() !== 'gasto';
      if (!f.padre) return;
      f.padre.innerHTML = `<option value="">${T.ninguna}</option>` + D.categorias.filter(x => !x.borrado && !x.padre && !x.oculta && x.tipo === tipoAct() && (!c || x.id !== c.id))
        .map(x => `<option value="${esc(x.id)}" ${c && c.padre === x.id ? 'selected' : ''}>${x.icono} ${esc(catNombre(x.id))}</option>`).join('');
    };
    f.querySelectorAll('[name=tipo]').forEach(r => r.onchange = llenar); llenar();
    if (f.padre) f.padre.onchange = () => { f.querySelector('[data-grupo]').hidden = !!f.padre.value || tipoAct() !== 'gasto'; };
    const o = f.querySelector('[data-ocultar]'); if (o) o.onclick = () => { c.borrado = !c.borrado; c.editado = ahora(); hoja().close(); guardar(T.guardado); };
    if (volver) f.querySelector('[data-cerrar]').onclick = () => volver(null); // cancelar también regresa al gasto
  }

  // ---------- PIN: candado de la app, bóveda y huella ----------
  // Un solo «PIN de la cartera» para el candado y la bóveda. La huella lo guarda en el Keystore del teléfono.
  function teclado(titulo, alTerminar, { aviso: txtAviso, olvide, huella, enPantalla } = {}) {
    let pin = '';
    const html = `<div class="pin">${ico('candado', 'pin-ico')}<h2 data-pin-tit>${titulo}</h2>
      <div class="puntos" aria-live="polite">${'<i></i>'.repeat(6)}</div>
      <p class="error-form pin-err"></p>
      <div class="teclas">${[1, 2, 3, 4, 5, 6, 7, 8, 9, huella ? 'h' : '', 0, '⌫'].map(k => k === '' ? '<span></span>' : k === 'h' ? `<button type="button" data-huella aria-label="${T.usarHuella}">${ico('huella')}</button>` : `<button type="button" data-k="${k}" aria-label="${k === '⌫' ? T.borrar : k}">${k}</button>`).join('')}</div>
      ${txtAviso ? `<p class="nota">${txtAviso}</p>` : ''}
      <div class="acciones-pin">${enPantalla ? '<span></span>' : `<button type="button" class="enlace" data-cerrar>${T.cancelar}</button>`}${olvide ? `<button type="button" class="enlace peligro" data-olvide>${T.olvidePin}</button>` : ''}</div></div>`;
    let raiz;
    if (enPantalla) { raiz = $('#candado'); raiz.innerHTML = `<div class="candado-caja"><p class="candado-marca">${T.app}</p>${html}</div>`; raiz.hidden = false; }
    else raiz = abrirHoja(html, () => 'x', { sinAcciones: true });
    const pintarPuntos = () => raiz.querySelectorAll('.puntos i').forEach((p, i) => p.classList.toggle('lleno', i < pin.length));
    const ctrl = {
      error(msg) { pin = ''; pintarPuntos(); raiz.querySelector('.pin-err').textContent = msg; const p = raiz.querySelector('.puntos'); p.classList.remove('sacudir'); void p.offsetWidth; p.classList.add('sacudir'); },
      titulo(t) { pin = ''; pintarPuntos(); raiz.querySelector('[data-pin-tit]').textContent = t; raiz.querySelector('.pin-err').textContent = ''; },
      cerrar() { if (enPantalla) { raiz.hidden = true; raiz.innerHTML = ''; } else hoja().close(); },
    };
    const x = raiz.querySelector('[data-cerrar]'); if (x) x.onclick = () => hoja().close();
    const o = raiz.querySelector('[data-olvide]'); if (o) o.onclick = olvide;
    const hb = raiz.querySelector('[data-huella]'); if (hb) hb.onclick = async () => { const p = await S.pinConHuella(T); if (p) await alTerminar(p, ctrl, true); };
    raiz.querySelectorAll('[data-k]').forEach(b => b.onclick = async () => {
      const k = b.dataset.k;
      if (k === '⌫') pin = pin.slice(0, -1); else if (pin.length < 6) pin += k;
      pintarPuntos();
      if (pin.length === 6) { const p = pin; await alTerminar(p, ctrl); }
    });
    if (hb && huella === 'auto') setTimeout(() => hb.click(), 250);
    return ctrl;
  }
  // Espera creciente tras 5 PIN incorrectos (vale para el candado y la bóveda).
  function esperaPin() { return Math.ceil(((D.ajustes.bloqueoHasta || 0) - Date.now()) / 1000); }
  function pinFallido(ui) {
    const n = (D.ajustes.intentosPin || 0) + 1;
    D.ajustes.intentosPin = n;
    if (n >= 5) D.ajustes.bloqueoHasta = Date.now() + Math.min(900, 30 * 2 ** (n - 5)) * 1000;
    DB.guardar(sesion ? { ...L.dividir(D).publico, boveda: D.boveda } : D).catch(() => {});
    ui.error(n >= 5 ? T.pinEspera(Math.min(900, 30 * 2 ** (n - 5))) : T.pinMal);
  }
  // ¿Es el PIN de la cartera? Usa el candado; si no hay, la bóveda.
  async function pinCorrecto(pin) {
    if (D.ajustes.candado) return B.verificar(pin, D.ajustes.candado);
    if (D.boveda) { try { await B.abrir(pin, D.boveda); return true; } catch { return false; } }
    return false;
  }
  // Pide el PIN actual (o crea uno nuevo si no hay ninguno) y llama despues(pin).
  function pedirPin(titulo, despues) {
    if (!D.ajustes.candado && !D.boveda) {
      let primero = null;
      return teclado(T.pinNuevo, async (pin, ui) => {
        if (!primero) { primero = pin; return ui.titulo(T.pinRepite); }
        if (pin !== primero) { primero = null; ui.titulo(T.pinNuevo); return ui.error(T.pinNoCoincide); }
        D.ajustes.candado = await B.candado(pin);
        ui.cerrar(); await despues(pin);
      }, { aviso: T.pinAviso });
    }
    teclado(titulo, async (pin, ui) => {
      if (esperaPin() > 0) return ui.error(T.pinEspera(esperaPin()));
      if (!(await pinCorrecto(pin))) return pinFallido(ui);
      D.ajustes.intentosPin = 0; D.ajustes.bloqueoHasta = 0;
      if (!D.ajustes.candado) D.ajustes.candado = await B.candado(pin);
      ui.cerrar(); await despues(pin);
    }, { huella: D.ajustes.huella });
  }

  function crearBoveda() {
    pedirPin(T.pinEntraBoveda, async pin => {
      sesion = await B.crear(pin);
      D.boveda = await B.sellar(sesion, { cuentas: [], movimientos: [] });
      programarCierre(); guardar(T.bovedaAbierta);
    });
  }
  function desbloquear(despues) {
    teclado(T.pinEntra, async (pin, ui, conHuella) => {
      if (esperaPin() > 0 && !conHuella) return ui.error(T.pinEspera(esperaPin()));
      try {
        const r = await B.abrir(pin, D.boveda);
        sesion = r.sesion;
        D = L.unir(D, L.normalizar({ ...D, cuentas: r.privado.cuentas, movimientos: r.privado.movimientos }));
        D.ajustes.intentosPin = 0; D.ajustes.bloqueoHasta = 0;
        ui.cerrar(); programarCierre(); pintar(); aviso(T.bovedaAbierta);
        if (despues) despues();
      } catch (e) {
        if (e.message !== 'PIN') { console.error(e); return ui.error(T.errorGuardar); }
        pinFallido(ui);
      }
    }, { huella: D.ajustes.huella, olvide: () => { if (confirm(T.confirmarOlvide)) { hoja().close(); D.boveda = null; D.cuentas = D.cuentas.filter(c => !c.privada); guardar(T.borrado); } } });
  }
  function bloquear(silencioso) {
    if (!sesion) return;
    D = L.dividir(D).publico; sesion = null;
    guardarBorradorActivo(); if (hoja().open) hoja().close();
    pintar(); if (!silencioso) aviso(T.bovedaOculta);
  }
  let tCierre;
  function programarCierre() { clearTimeout(tCierre); if (sesion) tCierre = setTimeout(() => bloquear(), 3 * 60 * 1000); }

  // Candado de la app: pantalla completa que tapa todo hasta poner el PIN o la huella.
  function cerrarApp() {
    if (!D.ajustes.bloqueoApp || !D.ajustes.candado) return;
    bloqueada = true;
    guardarBorradorActivo(); if (hoja().open) hoja().close();
    $('#vista').innerHTML = '';
    teclado(T.appBloqueada, async (pin, ui, conHuella) => {
      if (!conHuella && esperaPin() > 0) return ui.error(T.pinEspera(esperaPin()));
      if (!(await B.verificar(pin, D.ajustes.candado))) return pinFallido(ui);
      D.ajustes.intentosPin = 0; D.ajustes.bloqueoHasta = 0;
      bloqueada = false; ui.cerrar(); pintar(); reanudarBorrador();
    }, { enPantalla: true, huella: D.ajustes.huella ? 'auto' : false, olvide: () => alert(T.olvideCandado) });
  }
  function activarBloqueo(on) {
    if (!on) return pedirPin(T.pinEntra, async () => { D.ajustes.bloqueoApp = false; D.ajustes.huella = false; await S.borrarPin(); guardar(T.guardado); });
    pedirPin(T.pinEntra, async () => { D.ajustes.bloqueoApp = true; guardar(T.bloqueoListo); });
  }
  function activarHuella(on) {
    if (!on) { D.ajustes.huella = false; S.borrarPin(); return guardar(T.guardado); }
    pedirPin(T.pinEntra, async pin => {
      try { await S.guardarPin(pin, T); D.ajustes.huella = true; guardar(T.huellaLista); }
      catch (e) { console.warn(e); aviso(T.huellaError, true); pintar(); }
    });
  }
  function cambiarPin() {
    pedirPin(T.pinActual, async viejo => {
      let primero = null;
      teclado(T.pinNuevo, async (pin, ui) => {
        if (!primero) { primero = pin; return ui.titulo(T.pinRepite); }
        if (pin !== primero) { primero = null; ui.titulo(T.pinNuevo); return ui.error(T.pinNoCoincide); }
        try {
          if (D.boveda) { // la bóveda se vuelve a cifrar con el PIN nuevo
            if (!sesion) { const r = await B.abrir(viejo, D.boveda); D = L.unir(D, L.normalizar({ ...D, cuentas: r.privado.cuentas, movimientos: r.privado.movimientos })); }
            sesion = await B.crear(pin); programarCierre();
          }
          D.ajustes.candado = await B.candado(pin);
          if (D.ajustes.huella) { try { await S.guardarPin(pin, T); } catch { D.ajustes.huella = false; } }
          ui.cerrar(); guardar(T.pinCambiado);
        } catch (e) { console.error(e); ui.error(T.errorGuardar); }
      }, { aviso: T.pinAviso });
    });
  }

  // ---------- respaldo ----------
  async function respaldar() {
    const nombre = `wallet-respaldo-${L.hoy()}.json`;
    let base = D;
    if (D.boveda && sesion) { const { publico, privado } = L.dividir(D); base = { ...publico, boveda: await B.sellar(sesion, privado) }; }
    const copia = { ...base, ajustes: { ...base.ajustes, ultimoRespaldo: ahora() } };
    // Fotos de facturas: opcionales (hacen el archivo más grande). Las de la bóveda van cifradas.
    try { const fotos = await DB.todasLasFotos(); if (Object.keys(fotos).length && confirm(T.incluirFotos(Object.keys(fotos).length))) copia.fotos = fotos; }
    catch (e) { console.warn('fotos', e); }
    const texto = JSON.stringify(copia, null, 1);
    if (await compartirArchivo(nombre, texto, 'application/json')) { // en el APK: «Compartir» (Drive, WhatsApp, correo…)
      D.ajustes.ultimoRespaldo = copia.ajustes.ultimoRespaldo;
      guardar(T.respaldoListo);
    }
  }

  async function restaurar(archivo) {
    if (!archivo || !confirm(T.confirmarRestaurar)) return;
    try {
      const texto = await archivo.text();
      const d = L.leerRespaldo(texto);
      const fotos = (JSON.parse(texto) || {}).fotos; // fotos de facturas que venían en el respaldo
      if (fotos && typeof fotos === 'object') for (const [id, v] of Object.entries(fotos)) if (/^f-/.test(id) && v && (v.data || v.caja)) await DB.guardarFoto(id, v);
      d.ajustes.misionesCelebradas = L.misiones(d).lista.filter(x => x.hecho).map(x => x.id); // sin confeti al restaurar
      d.ajustes.logrosCelebrados = window.Consejos.logros(d).lista.filter(x => x.hecho).map(x => x.id);
      d.ajustes.misionesVersion = L.MISIONES_VERSION;
      delete d.ajustes.metasCelebradas; delete d.ajustes.presCelebrado; // se vuelven a marcar en silencio
      // El candado y la huella de este teléfono se quedan como estaban.
      Object.assign(d.ajustes, { candado: D.ajustes.candado, bloqueoApp: D.ajustes.bloqueoApp, huella: D.ajustes.huella });
      sesion = null; D = d; revisarCelebraciones(true); guardar(T.restaurado);
    }
    catch (e) { aviso(e.message, true); }
  }

  // ---------- pendientes desde Inicio ----------
  function accionPendiente(txt) {
    const [tipo, id, fecha, ronda] = txt.split('|');
    if (tipo === 'tarjeta') return hojaPagarTarjeta(cuenta(id));
    if (tipo === 'cuota' || tipo === 'cobro') return hojaCuota(cuenta(id));
    return X.pendiente(tipo, id, fecha, Number(ronda) || 0);
  }

  // ---------- eventos ----------
  document.addEventListener('click', ev => {
    programarCierre(); revisarAviso();
    if (bloqueada) return;
    const cc = ev.target.closest('[data-cambiar-cat]');
    if (cc) return hojaCambiarCat(D.movimientos.find(m => m.id === cc.dataset.cambiarCat));
    const el = ev.target.closest('[data-tab],[data-tab-ir],[data-accion],[data-mov],[data-cuenta],[data-mision],[data-pend]');
    if (!el) return;
    if (el.dataset.tab || el.dataset.tabIr) {
      tab = el.dataset.tab || el.dataset.tabIr;
      if (tab === 'analisis' && !D.ajustes.vioAnalisis) { D.ajustes.vioAnalisis = true; guardar(); }
      pintar(); window.scrollTo(0, 0); return;
    }
    if (el.dataset.pend) return accionPendiente(el.dataset.pend);
    if (el.dataset.mision) {
      const mi = el.dataset.mision;
      if (mi === 'cuenta') return hojaCuenta();
      if (mi === 'gasto' || mi === 'ingreso') return hojaMov(null, mi);
      const irA = (t, s) => { tab = t; if (s) X.irA(s); pintar(); window.scrollTo(0, 0); };
      if (mi === 'plan') return irA('planes', 'plan');
      if (mi === 'fijo') return X.accion('fijo-nuevo', { dataset: {} });
      if (mi === 'meta') return X.accion('meta-nueva', { dataset: {} });
      if (mi === 'analisis') { tab = 'analisis'; D.ajustes.vioAnalisis = true; guardar(); window.scrollTo(0, 0); return; }
      if (mi === 'seguridad' || mi === 'tema') return irA('ajustes');
      if (mi === 'respaldo') return respaldar();
    }
    if (el.dataset.mov) return hojaMov(D.movimientos.find(m => m.id === el.dataset.mov));
    if (el.dataset.cuenta) { // cuentas de uso y tarjetas: su historial (como el banco); préstamos y SAM: su detalle
      const c = cuenta(el.dataset.cuenta);
      return ['diaria', 'ahorro', 'inversion', 'credito'].includes(c.tipo) && !c.castigado ? abrirMovs(c.parDe || c.id) : hojaCuenta(c);
    }
    const a = el.dataset.accion;
    const ir = (t, sub) => { tab = t; if (sub) X.irA(sub); pintar(); window.scrollTo(0, 0); };
    if (a === 'gasto' || a === 'ingreso') hojaMov(null, a);
    else if (a === 'mover') { if (cuentasVivas().length < 2) aviso(T.dosCuentas, true); else hojaMov(null, 'transferencia'); }
    else if (a === 'nueva-cuenta') hojaCuenta();
    else if (a === 'nuevo-prestamo') hojaPrestamo('deuda');
    else if (a === 'presupuesto') hojaPresupuesto();
    else if (a === 'categorias') hojaCategorias();
    else if (a === 'ocultar') { D.ajustes.ocultarMontos = !oculto(); guardar(); }
    else if (a === 'ocultar-guia') { D.ajustes.guiaOculta = true; guardar(); }
    else if (a === 'ver-guia') { D.ajustes.guiaOculta = false; tab = 'inicio'; guardar(); }
    else if (a === 'crear-boveda') crearBoveda();
    else if (a === 'desbloquear') desbloquear();
    else if (a === 'bloquear') bloquear();
    else if (a === 'cambiar-pin') cambiarPin();
    else if (a === 'olvide' && confirm(T.confirmarOlvide)) { D.boveda = null; guardar(T.borrado); }
    else if (a === 'respaldar') respaldar();
    else if (a === 'ir-fijos') ir('planes', 'fijos');
    else if (a === 'ir-metas') ir('planes', 'metas');
    else if (a === 'exportar-csv') exportarCsv();
    else if (a === 'instalar') instalar();
    else if (a === 'instalar-luego') { try { localStorage.setItem('cuadre-instalar-oculto', String(Date.now())); } catch { /* sin almacenamiento */ } pintar(); }
    else if (a === 'actualizar') aplicarVersion();
    else if (a === 'gasto-cat') { catGasto = el.dataset.cat === catGasto ? '' : el.dataset.cat; pintar(); }
    else if (a === 'gastos-ver') { filtroMovs = { ...filtroMovs, cuentaId: '', per: 'mes', off: 0, tipo: 'gasto', cat: el.dataset.cat, texto: '', limite: 150 }; tab = 'cartera'; pintar(); window.scrollTo(0, 0); }
    else if (a === 'ir-plan') ir('planes', 'plan');
    else if (a === 'ver-movs' || a === 'ver-pend') abrirMovs('');
    else if (a === 'escanear') { hojaMov(null, 'gasto'); const b = document.querySelector('#hoja [data-foto-origen="camara"]'); if (b) b.click(); }
    else if (a === 'salud-periodo') { periodoSalud = Number(el.dataset.p); pintar(); }
    else if (a === 'per-off') moverPer(Number(el.dataset.o));
    else if (a === 'informe') hojaInforme();
    else if (a === 'buscar') { filtroMovs.buscar = !(filtroMovs.buscar || filtroMovs.texto); if (!filtroMovs.buscar) filtroMovs.texto = ''; pintar(); const i = $('[data-filtro="texto"]'); if (i) i.focus(); }
    else if (a === 'movs-mas') { filtroMovs.limite += 150; $('#movs-res').innerHTML = listaMovs(); }
    else if (a === 'cab-pagar') hojaPagarTarjeta(cuenta(filtroMovs.cuentaId));
    else if (a === 'cab-editar') hojaCuenta(cuenta(filtroMovs.cuentaId));
    else if (a === 'cab-saldo') hojaSaldo(cuenta(filtroMovs.cuentaId));
    else if (a === 'tema') { D.ajustes.tema = el.dataset.tema; D.ajustes.temaElegido = true; guardar(T.temaListo(T.temas[el.dataset.tema])); }
    else if (a === 'ir-encargos') ir('planes', 'encargos');
    else if (a === 'ir-calc') ir('calculadora');
    else if (a === 'borrar-todo' && confirm(T.confirmarBorrarTodo)) {
      DB.borrarTodo().then(async () => { await S.borrarPin(); D = L.vacio(); sesion = null; tab = 'inicio'; guardar(T.borrado); });
    } else if (a) X.accion(a, el);
  });
  // Filtros de Movimientos: solo se vuelve a pintar la lista (el buscador no pierde el foco).
  let tBusca;
  const aplicarFiltro = t => { filtroMovs[t.dataset.filtro] = t.value; filtroMovs.limite = 150; const r = $('#movs-res'); if (r) r.innerHTML = listaMovs(); };
  document.addEventListener('input', ev => { const t = ev.target; if (t.dataset && t.dataset.filtro === 'texto') { clearTimeout(tBusca); tBusca = setTimeout(() => aplicarFiltro(t), 200); } });
  document.addEventListener('change', ev => {
    const t = ev.target;
    if (t.dataset && t.dataset.filtro && t.dataset.filtro !== 'texto') return aplicarFiltro(t);
    if (t.id === 'cartera-sel' || t.id === 'per-sel') { const bs = $('[data-filtro="texto"]'); if (bs) { clearTimeout(tBusca); filtroMovs.texto = bs.value; } } // lo que se escribió en el buscador no se pierde
    if (t.id === 'cartera-sel') { filtroMovs.cuentaId = t.value; if (filtroMovs.per === 'corte') { filtroMovs.per = leerPer(); filtroMovs.off = 0; } filtroMovs.limite = 150; return pintar(); }
    if (t.id === 'per-sel') return cambiarPer(t.value);
    if (t.classList.contains('tasa')) {
      const v = L.parseNum(t.value);
      if (t.value.trim() && !v) return aviso(T.montoInvalido, true);
      if (v) D.ajustes.tasas[t.dataset.moneda] = v; else delete D.ajustes.tasas[t.dataset.moneda];
      guardar(T.guardado);
    } else if (t.id === 'pais') {
      const nueva = L.PAISES[t.value];
      if (nueva !== P() && !confirm(T.confirmarPais(sim(nueva)))) return pintar();
      D.ajustes.pais = t.value; L.cambiarPrincipal(D, nueva); guardar(T.guardado);
    } else if (t.id === 'ocultar') { D.ajustes.ocultarMontos = t.checked; guardar(); }
    else if (t.id === 'bloqueo') { t.checked = !t.checked; activarBloqueo(!D.ajustes.bloqueoApp); }
    else if (t.id === 'huella') { t.checked = !t.checked; activarHuella(!D.ajustes.huella); }
    else if (t.name === 'modo-app') { D.ajustes.modo = t.value; guardar(); }
    else if (t.id === 'avisos') { D.ajustes.avisos = t.checked; guardar(t.checked ? T.avisosOn : T.avisosOff); }
    else if (t.id === 'hora') { D.ajustes.horaAviso = Number(t.value); guardar(T.guardado); }
    else if (t.id === 'redondeo-cuenta') { D.ajustes.redondeo = t.value ? { cuentaId: t.value, a: (D.ajustes.redondeo || {}).a || 100 } : null; guardar(T.guardado); }
    else if (t.id === 'redondeo-a') { D.ajustes.redondeo.a = Number(t.value); guardar(T.guardado); }
    else if (t.id === 'archivo') restaurar(t.files[0]);
  });
  // Al salir de la app: la bóveda se cierra sola y, si pasan más de 30 s fuera, la app pide el PIN al volver.
  document.addEventListener('visibilitychange', () => {
    revisarAviso();
    if (document.hidden) { guardarBorradorActivo(); bloquear(true); if (salioEn !== -1) salioEn = Date.now(); }
    else if (salioEn > 0 && Date.now() - salioEn > 30000) { salioEn = 0; cerrarApp(); }
    else { setTimeout(reanudarBorrador, 50); accionWidget(); } // si la bóveda cerró el formulario al salir, se reabre
  });

  // ---------- Cartera: deslizar el dedo cambia de período ----------
  let toque = null;
  document.addEventListener('touchstart', ev => { toque = tab === 'cartera' && ev.target.closest('[data-desliza]') && !hoja().open ? { x: ev.touches[0].clientX, y: ev.touches[0].clientY } : null; }, { passive: true });
  document.addEventListener('touchend', ev => {
    if (!toque || filtroMovs.per === 'todos' || filtroMovs.per === 'rango') return;
    const dx = ev.changedTouches[0].clientX - toque.x, dy = ev.changedTouches[0].clientY - toque.y; toque = null;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 45) moverPer(filtroMovs.off + (dx < 0 ? 1 : -1));
  }, { passive: true });

  // ---------- botón «atrás» del teléfono ----------
  // Cierra lo que esté abierto, paso a paso, como cualquier app: foto en grande → hoja → historial de cuenta → Inicio.
  // Solo en Inicio, sin nada abierto, la app se va al fondo (no se cierra ni pierde nada).
  function atras() {
    const v = document.querySelector('.visor'); if (v) { v.remove(); return true; }
    if (hoja().open) { if (snapActivo) borrarBorrador(); hoja().close(); return true; } // atrás en Anotar = cancelar
    if (bloqueada) return false;
    if (tab === 'cuentas') { tab = 'cartera'; pintar(); window.scrollTo(0, 0); return true; }
    if (tab === 'cartera' && filtroMovs.cuentaId) { filtroMovs.cuentaId = ''; pintar(); window.scrollTo(0, 0); return true; }
    if (tab !== 'inicio') { tab = 'inicio'; pintar(); window.scrollTo(0, 0); return true; }
    return false;
  }

  // ---------- contexto para secciones.js ----------
  const W = {
    L, T, G, PL, PR, S, esc, ico, din, sim, aInput, aviso, guardar, pintar, abrirHoja, hoja, cuenta, cuentasVivas, cat, catNombre,
    opcionesCuentas, opcionesMonedas, segmento, fechaCorta, ahora, nuevoMov, bloqueImpuesto, conectarImpuesto, leerImpuesto,
    hojaPrestamo, hojaMov, P, get D() { return D; },
    irTab(t) { tab = t; pintar(); window.scrollTo(0, 0); },
  };
  const X = window.Secciones(W);

  // ---------- arranque ----------
  async function iniciar() {
    document.title = T.app;
    document.querySelectorAll('[data-t]').forEach(e => (e.textContent = T[e.dataset.t]));
    document.querySelectorAll('[data-ico]').forEach(e => (e.innerHTML = ico(e.dataset.ico)));
    document.querySelectorAll('[data-et]').forEach(e => e.setAttribute('aria-label', T[e.dataset.et]));
    if (window.WALLET_PREVIEW) { const b = $('#preview'); b.textContent = T.vistaPrevia; b.hidden = false; }
    try { D = L.normalizar(L.migrar((await DB.cargar()) || L.vacio())); }
    catch (e) { console.error(e); aviso(T.errorGuardar, true); }
    // Logros que ya estaban cumplidos al actualizar: se marcan sin confeti.
    if (D.ajustes.misionesVersion !== L.MISIONES_VERSION) { // misiones nuevas que ya estaban cumplidas: sin confeti
      D.ajustes.misionesCelebradas = L.misiones(D).lista.filter(x => x.hecho).map(x => x.id); D.ajustes.misionesVersion = L.MISIONES_VERSION;
    }
    if (!D.ajustes.logrosCelebrados) D.ajustes.logrosCelebrados = window.Consejos.logros(D).lista.filter(x => x.hecho).map(x => x.id);
    if (!D.ajustes.metasCelebradas || D.ajustes.presCelebrado === undefined) revisarCelebraciones(true); // al actualizar a la v10: sin confeti
    huellaOk = await S.huellaDisponible();
    if (D.ajustes.huella && !huellaOk) D.ajustes.huella = false;
    const nAuto = autoAnotar();
    if (D.ajustes.bloqueoApp && D.ajustes.candado) cerrarApp(); else { pintar(); reanudarBorrador(); }
    if (nAuto) guardar(bloqueada ? '' : T.autoAnotados(nAuto)); else actualizarWidget();
    accionWidget();
    programarAvisos();
    const Ap = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
    if (Ap) Ap.addListener('backButton', () => { if (!atras()) Ap.minimizeApp(); });
    if (!S.esApk() && navigator.storage && navigator.storage.persist) navigator.storage.persisted().then(p => p || navigator.storage.persist()).catch(() => {});
    if (!window.WALLET_PREVIEW && !window.Capacitor && 'serviceWorker' in navigator && location.protocol.startsWith('http')) {
      registrarSw();
    }
  }
  window.WalletApp = { datos: () => D, version: APP_VERSION, bovedaAbierta, atras };
  iniciar();
})();
