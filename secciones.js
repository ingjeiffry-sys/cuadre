// Secciones Planes (pagos fijos, nómina, metas, SAM, encargos) y Calculadora. app.js las llama con su contexto W.
window.Secciones = function (W) {
  'use strict';
  const { L, T, PL, PR, esc, ico, din, sim, aInput, aviso, guardar, abrirHoja, cuenta, cat, catNombre, opcionesCuentas, opcionesMonedas, segmento, fechaCorta, ahora, nuevoMov } = W;
  const $ = s => document.querySelector(s);
  const D = () => W.D;
  const vivos = k => (D()[k] || []).filter(x => !x.borrado);
  const buscar = (k, id) => (D()[k] || []).find(x => x.id === id);
  const nuevo = (k, obj) => { const t = ahora(); const x = { id: L.uuid(), creado: t, editado: t, borrado: false, ...obj }; D()[k].push(x); return x; };
  let sub = 'plan';
  const SUBS = ['plan', 'fijos', 'nomina', 'metas', 'sam', 'encargos'];

  // ---------- repetición (mensual, quincenal, semanal, cada N días, anual, una vez) ----------
  const DIAS_SEM = [1, 2, 3, 4, 5, 6, 0];
  function camposRec(rec, opciones) {
    rec = rec || { frec: 'mensual', dia: Number(L.hoy().slice(8, 10)) };
    const ops = opciones || ['mensual', 'quincenal', 'semanal', 'cada', 'anual', 'unica'];
    return `<div class="rec">
      <label class="campo">${T.seRepite}<select name="frec">${ops.map(f => `<option value="${f}" ${rec.frec === f ? 'selected' : ''}>${T.frecRec[f]}</option>`).join('')}</select></label>
      <div class="dos">
        <label class="campo" data-r="mensual anual">${T.elDia}<input name="dia" type="number" min="1" max="31" value="${rec.dia || 1}"></label>
        <label class="campo" data-r="anual">${T.mes}<select name="mes">${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${Number(rec.mes) === i + 1 ? 'selected' : ''}>${new Date(2026, i, 1).toLocaleDateString('es-DO', { month: 'long' })}</option>`).join('')}</select></label>
        <label class="campo" data-r="quincenal">${T.primerDia}<input name="dia1" type="number" min="1" max="31" value="${(rec.dias || [15, 30])[0]}"></label>
        <label class="campo" data-r="quincenal">${T.segundoDia}<input name="dia2" type="number" min="1" max="31" value="${(rec.dias || [15, 30])[1]}"></label>
        <label class="campo" data-r="semanal">${T.diaSemana}<select name="diaSemana">${DIAS_SEM.map(d => `<option value="${d}" ${Number(rec.diaSemana) === d ? 'selected' : ''}>${T.semana[d]}</option>`).join('')}</select></label>
        <label class="campo" data-r="cada">${T.cadaDias}<input name="cada" type="number" min="1" max="365" value="${rec.cada || 14}"></label>
        <label class="campo" data-r="cada unica">${T.fecha}<input name="recFecha" type="date" value="${rec.desde || rec.fecha || L.hoy()}"></label>
      </div></div>`;
  }
  function conectarRec(f) {
    const ver = () => f.querySelectorAll('[data-r]').forEach(e => { e.hidden = !e.dataset.r.split(' ').includes(f.frec.value); });
    f.frec.addEventListener('change', ver); ver();
  }
  function leerRec(fd) {
    const n = k => Math.min(31, Math.max(1, Number(fd.get(k)) || 1));
    const fr = fd.get('frec');
    if (fr === 'mensual') return { frec: fr, dia: n('dia') };
    if (fr === 'quincenal') return { frec: fr, dias: [n('dia1'), n('dia2')].sort((a, b) => a - b) };
    if (fr === 'semanal') return { frec: fr, diaSemana: Number(fd.get('diaSemana')) };
    if (fr === 'cada') return { frec: fr, cada: Math.max(1, Number(fd.get('cada')) || 14), desde: fd.get('recFecha') || L.hoy() };
    if (fr === 'anual') return { frec: fr, mes: Number(fd.get('mes')), dia: n('dia') };
    return { frec: 'unica', fecha: fd.get('recFecha') || L.hoy() };
  }
  function textoRec(r) {
    if (!r) return '';
    if (r.frec === 'mensual') return T.recMensual(r.dia);
    if (r.frec === 'quincenal') return T.recQuincenal(r.dias[0], r.dias[1]);
    if (r.frec === 'semanal') return T.recSemanal(T.semana[r.diaSemana]);
    if (r.frec === 'cada') return T.recCada(r.cada);
    if (r.frec === 'anual') return T.recAnual(r.dia, new Date(2026, r.mes - 1, 1).toLocaleDateString('es-DO', { month: 'long' }));
    return T.recUnica(fechaCorta(r.fecha));
  }
  const cuandoTxt = f => { const n = L.diasEntre(L.hoy(), f); return n < 0 ? T.atrasado(-n) : n === 0 ? T.venceHoy : T.venceEn(n); };
  const opcionesCats = (tipo, sel) => D().categorias.filter(c => !c.borrado && !c.oculta && c.tipo === tipo && !c.padre)
    .map(p => `<option value="${esc(p.id)}" ${p.id === sel ? 'selected' : ''}>${p.icono} ${esc(catNombre(p.id))}</option>` +
      D().categorias.filter(s => !s.borrado && s.padre === p.id).map(s => `<option value="${esc(s.id)}" ${s.id === sel ? 'selected' : ''}>&nbsp;&nbsp;&nbsp;${s.icono} ${esc(catNombre(s.id))}</option>`).join('')).join('');
  const usoCuentas = ['diaria', 'ahorro', 'inversion', 'credito'];

  // ---------- vista Planes ----------
  function vPlanes() {
    const cuerpo = { plan: vPlan, fijos: vFijos, nomina: vNomina, metas: vMetas, sam: vSam, encargos: vEncargos }[sub]();
    return `<div class="pestanas" role="tablist">${SUBS.map(s => `<button role="tab" data-accion="plan-sub" data-sub="${s}" aria-selected="${s === sub}">${T.subPlan[s]}</button>`).join('')}</div>${cuerpo}`;
  }
  const vacioTxt = (txt, accion, boton) => `<section class="tarjeta centro vacia-plan"><p>${txt}</p><button class="pildora oscura" data-accion="${accion}">${ico('mas')} ${boton}</button></section>`;

  // ---------- Mi plan: cómo dividir el sueldo, cuánto gastar por categoría, fondo de emergencia, proyección, consejos y logros ----------
  const CS = window.Consejos;
  let aporteProy = null, tasaProy = 0;
  function vPlan() {
    const d = D(), p = CS.plan(d, L.hoy()), P = W.P();
    const ciudades = Object.keys(CS.CIUDADES[d.ajustes.pais] || {});
    const colores = { necesidades: 'var(--azul)', deseos: 'var(--morado)', ahorro: 'var(--verde)' };
    const estadoIco = { ok: '✓', justo: '≈', pasado: '!' };
    if (!p.ingreso.monto) {
      return `<section class="tarjeta">${ubicacion(d, ciudades)}${campoIngreso(d, p)}<p class="nota">${T.planSinIngreso}</p></section>`;
    }
    const ap = aporteProy == null ? p.grupos.ahorro : aporteProy;
    const pr = CS.proyeccionAhorro(p.fondo.tienes, ap, tasaProy);
    const consejos = [].concat(T.consejosPais[d.ajustes.pais] || [], T.consejosCosto[p.costo] || [], T.consejosGenerales);
    const lg = CS.logros(d, L.hoy());
    return `
      <section class="tarjeta">${ubicacion(d, ciudades)}${campoIngreso(d, p)}</section>
      <section class="tarjeta">
        <h2>🧭 ${T.comoDividir}</h2>
        <div class="reglas">${Object.keys(CS.REGLAS).map(r => `<button class="regla ${r === p.regla ? 'sel' : ''}" data-accion="plan-regla" data-regla="${r}">
          <b>${r}</b><small>${T.reglas[r]}</small>${r === p.sugerida ? `<i>${T.sugerida}</i>` : ''}</button>`).join('')}</div>
        <p class="nota">${T.reglaPorQue[p.sugerida]}</p>
        <div class="barra-grupos" aria-hidden="true">${['necesidades', 'deseos', 'ahorro'].map(k => `<i style="flex:${p.porcentajes[k]};background:${colores[k]}"></i>`).join('')}</div>
        <div class="grupos">${['necesidades', 'deseos', 'ahorro'].map(k => `<div><small><i style="background:${colores[k]}"></i>${T.grupos[k]} · ${p.porcentajes[k]} %</small><b>${din(p.grupos[k])}</b></div>`).join('')}</div>
      </section>
      <section class="tarjeta">
        <h2>🎯 ${T.cuantoGastar}</h2><p class="nota">${T.cuantoGastarTxt}</p>
        ${['necesidades', 'deseos'].map(gr => `<h3>${T.grupos[gr]}</h3><ul class="lista-plana plan-cats">${p.filas.filter(f => f.grupo === gr).map(f => `<li class="${f.estado}">
          <span class="ico" style="--c:${cat(f.id).color}">${cat(f.id).icono}</span><span class="txt"><b>${esc(catNombre(f.id))}</b><small>${T.gastasPromedio} ${din(f.real)}</small></span>
          <span class="plan-monto"><b>${din(f.sugerido)}</b><small class="estado-${f.estado}">${estadoIco[f.estado]} ${T.estadoPlan[f.estado]}</small></span></li>`).join('')}</ul>`).join('')}
        ${p.costo === 'alto' ? `<p class="nota">🏠 ${T.topeVivienda(din(p.topeVivienda), CS.VIVIENDA[p.costo])}</p>` : ''}
        <button class="pildora oscura ancho" data-accion="plan-aplicar">${T.usarComoPresupuesto}</button>
      </section>
      <section class="tarjeta">
        <h2>🛟 ${T.fondoTitulo}</h2>
        <div class="salud-top">${W.G.anillo(p.fondo.pct, { tam: 92, grosor: 10, clase: p.fondo.pct >= 1 ? 'verde' : p.fondo.pct >= 0.5 ? 'amarillo' : 'rojo', centro: `<b>${Math.round(p.fondo.pct * 100)}%</b>` })}
          <div><p class="grande">${din(p.fondo.tienes)} <small>/ ${din(p.fondo.meta)}</small></p><small>${T.fondoMeses(p.fondo.meses, din(p.fondo.basicos))}</small></div></div>
        <p class="nota">${p.fondo.falta ? T.fondoFalta(din(p.fondo.falta), din(p.ahorro.fondo), p.fondo.mesesParaLlegar) : T.fondoListo}</p>
        <h3>${T.repartoAhorro}</h3>
        <div class="desglose">${Object.entries(p.ahorro).filter(([, v]) => v > 0).map(([k, v]) => `<div><small>${T.destinoAhorro[k]}</small><b>${din(v)}</b></div>`).join('')}</div>
      </section>
      <section class="tarjeta" id="plan-proy">
        <h2>📈 ${T.siAhorras}</h2>
        <label class="deslizador"><span>${T.ahorroAlMes}: <b data-ap>${din(ap)}</b></span>
          <input type="range" id="plan-aporte" min="0" max="${Math.max(100, Math.round(p.ingreso.monto / 100 / 2))}" step="100" value="${Math.round(ap / 100)}"></label>
        <div class="segmento chico" role="radiogroup" aria-label="${T.tasaAhorroProy}">${[0, 4, 8].map(t => `<label><input type="radio" name="plan-tasa" value="${t}" ${tasaProy === t ? 'checked' : ''}><span>${t ? t + ' %' : T.sinInteres}</span></label>`).join('')}</div>
        <div class="proy-anios" data-proy>${proyHtml(pr)}</div>
        ${W.G.linea(pr.serie, { id: 'gpp' })}
      </section>
      <section class="tarjeta">
        <h2>💡 ${T.consejosPara(esc(d.ajustes.ciudad || T.paises[d.ajustes.pais]))}</h2>
        <ul class="consejos">${consejos.map(c => `<li>${c}</li>`).join('')}</ul>
        <p class="nota">${T.avisoConsejos}</p>
      </section>
      ${vLogros(lg)}`;
  }
  const proyHtml = pr => [['anio1', 1], ['anio3', 3], ['anio5', 5]].map(([k, n]) => `<div><small>${T.enAnios(n)}</small><b>${din(pr[k], W.P(), true)}</b></div>`).join('');
  function vLogros(lg) {
    return `<section class="tarjeta"><div class="sub-fila"><h2>🏆 ${T.misLogros}</h2><small>${lg.hechos}/${lg.total}</small></div>
      <div class="logros">${lg.lista.map(x => `<div class="logro ${x.hecho ? 'hecho' : ''}" title="${esc(T.logros[x.id].d)}"><span>${T.logros[x.id].i}</span><small>${T.logros[x.id].t}</small></div>`).join('')}</div></section>`;
  }
  function ubicacion(d, ciudades) {
    return `<h2>📍 ${T.dondeVives}</h2>
      <p class="nota">${T.paisActual(T.paises[d.ajustes.pais])} <button class="enlace" data-tab-ir="ajustes">${T.cambiar}</button></p>
      <div class="dos"><label class="campo">${T.ciudad}<input id="plan-ciudad" list="plan-ciudades" maxlength="40" autocomplete="off" value="${esc(d.ajustes.ciudad || '')}" placeholder="${T.ciudadEj}"></label>
        <label class="campo">${T.costoVida}<select id="plan-costo">${['alto', 'medio', 'bajo'].map(c => `<option value="${c}" ${CS.costoVida(d) === c ? 'selected' : ''}>${T.costos[c]}</option>`).join('')}</select></label></div>
      <datalist id="plan-ciudades">${ciudades.map(c => `<option value="${esc(c)}">`).join('')}</datalist>`;
  }
  function campoIngreso(d, p) {
    return `<label class="campo">${T.ingresoMensual} (${sim(W.P())})<input id="plan-ingreso" inputmode="decimal" autocomplete="off" value="${d.ajustes.ingresoPlan ? aInput(d.ajustes.ingresoPlan) : ''}" placeholder="${aInput(p.ingreso.monto) || '0.00'}"></label>
      <p class="nota">${T.ingresoOrigen[p.ingreso.origen]}</p>`;
  }
  function conectarPlan() {
    const d = D();
    const cambia = (id, fn) => { const e = $('#' + id); if (e) e.onchange = () => { fn(e.value.trim()); guardar(T.guardado); }; };
    cambia('plan-ciudad', v => { d.ajustes.ciudad = v || undefined; const c = (CS.CIUDADES[d.ajustes.pais] || {})[v]; if (c) d.ajustes.costoVida = c; });
    cambia('plan-costo', v => { d.ajustes.costoVida = v; });
    cambia('plan-ingreso', v => { const m = v ? L.parseMonto(v) : 0; if (m === null) return aviso(T.montoInvalido, true); d.ajustes.ingresoPlan = m || undefined; });
    const s = $('#plan-aporte'); if (!s) return;
    const proy = () => {
      const p = CS.plan(d, L.hoy()), pr = CS.proyeccionAhorro(p.fondo.tienes, aporteProy == null ? p.grupos.ahorro : aporteProy, tasaProy), caja = $('#plan-proy');
      caja.querySelector('[data-ap]').innerHTML = din(aporteProy == null ? p.grupos.ahorro : aporteProy);
      caja.querySelector('[data-proy]').innerHTML = proyHtml(pr);
      caja.querySelector('.linea').outerHTML = W.G.linea(pr.serie, { id: 'gpp' });
    };
    s.oninput = () => { aporteProy = Number(s.value) * 100; proy(); };
    document.querySelectorAll('[name=plan-tasa]').forEach(r => { r.onchange = () => { tasaProy = Number(r.value); proy(); }; });
  }
  function aplicarPlan() {
    const p = CS.plan(D(), L.hoy());
    if (!confirm(T.confirmarAplicarPlan)) return;
    D().ajustes.presupuestos = Object.fromEntries(p.filas.filter(f => f.sugerido > 0).map(f => [f.id, Math.round(f.sugerido / 10000) * 10000 || f.sugerido]));
    D().ajustes.planAplicado = true;
    guardar(T.planAplicado);
  }

  // Pagos fijos
  function vFijos() {
    const fs = vivos('fijos');
    if (!fs.length) return vacioTxt(T.fijosVacio, 'fijo-nuevo', T.nuevoFijo);
    const pend = PL.pendientes(D(), L.hoy(), 400).filter(p => p.tipo === 'fijo');
    const totalMes = fs.filter(f => !f.pausado).reduce((s, f) => s + Math.round(f.monto * L.vecesAlMes(f.rec)), 0);
    return `<section class="tarjeta resumen-plan"><small>${T.fijosAlMes}</small><b>${din(totalMes)}</b></section>
      <button class="pildora oscura ancho" data-accion="fijo-nuevo">${ico('mas')} ${T.nuevoFijo}</button>
      <ul class="lista">${fs.map(f => {
        const p = pend.find(x => x.id === f.id);
        return `<li><button class="fila" data-accion="fijo-editar" data-id="${esc(f.id)}"><span class="ico" style="--c:${cat(f.categoriaId).color}">${f.icono || cat(f.categoriaId).icono}</span>
          <span class="txt"><b>${esc(f.nombre)}</b><small>${textoRec(f.rec)}${f.pausado ? ' · ' + T.pausado : p ? ' · ' + cuandoTxt(p.fecha) : ''}</small></span>
          <span class="monto ${p && p.dias < 0 ? 'neg' : ''}">${din(f.monto)}</span></button></li>`;
      }).join('')}</ul>`;
  }
  function hojaFijo(f) {
    const fm = abrirHoja(`<h2>${f ? T.editarFijo : T.nuevoFijo}</h2>
      <label class="campo">${T.nombre}<input name="nombre" maxlength="40" required value="${f ? esc(f.nombre) : ''}" placeholder="${T.fijoEj}"></label>
      <label class="campo monto-campo">${T.monto} (${sim(W.P())})<input name="monto" inputmode="decimal" autocomplete="off" value="${f ? aInput(f.monto) : ''}" placeholder="0.00"></label>
      <label class="campo">${T.categoria}<select name="cat">${opcionesCats('gasto', f ? f.categoriaId : 'c-servicios')}</select></label>
      <label class="campo">${T.pagarDesde}<select name="cuenta"><option value="">—</option>${opcionesCuentas(f && f.cuentaId, { tipos: usoCuentas })}</select></label>
      <label class="interruptor"><span>🤖 ${T.autoFijo}</span><input type="checkbox" name="auto" ${f && f.auto ? 'checked' : ''}><i></i></label>
      <p class="nota">${T.autoFijoTxt}</p>
      ${camposRec(f && f.rec)}
      <label class="campo">${T.avisarAntes}<select name="avisar">${[1, 2, 3, 5, 7].map(n => `<option value="${n}" ${(f ? f.avisarDias || 7 : 7) === n ? 'selected' : ''}>${T.diasAntes(n)}</option>`).join('')}</select></label>
      ${f ? `<label class="interruptor"><span>${T.pausar}</span><input type="checkbox" name="pausado" ${f.pausado ? 'checked' : ''}><i></i></label>
        <button type="button" class="pildora peligro ancho" data-borrar>${T.borrar}</button>` : ''}`,
      fd => {
        const nombre = String(fd.get('nombre') || '').trim(); if (!nombre) return T.nombreFalta;
        const monto = L.parseMonto(fd.get('monto')); if (!monto) return T.montoInvalido;
        const auto = fd.get('auto') === 'on'; if (auto && !fd.get('cuenta')) return T.autoSinCuenta;
        const datos = { nombre, monto, categoriaId: fd.get('cat'), icono: cat(fd.get('cat')).icono, cuentaId: fd.get('cuenta') || null, rec: leerRec(fd), avisarDias: Number(fd.get('avisar')) || 7, pausado: fd.get('pausado') === 'on', editado: ahora(),
          auto, autoDesde: auto ? (f && f.auto && f.autoDesde) || L.hoy() : undefined }; // solo desde hoy: nunca anota pagos viejos
        if (f) Object.assign(f, datos); else nuevo('fijos', datos);
        guardar(T.guardado);
      });
    conectarRec(fm);
    const b = fm.querySelector('[data-borrar]'); if (b) b.onclick = () => { if (confirm(T.confirmarBorrar)) { f.borrado = true; f.editado = ahora(); W.hoja().close(); guardar(T.borrado); } };
  }
  function hojaPagarFijo(f, fecha) {
    const fm = abrirHoja(`<h2>${T.pagar} · ${esc(f.nombre)}</h2><p class="nota">${cuandoTxt(fecha)} · ${fechaCorta(fecha)}</p>
      <label class="campo monto-campo">${T.monto}<input name="monto" inputmode="decimal" autocomplete="off" value="${aInput(f.monto)}"></label>
      <label class="campo">${T.desde}<select name="cuenta">${opcionesCuentas(f.cuentaId || D().ajustes.ultimaCuenta, { tipos: usoCuentas })}</select></label>
      ${W.bloqueImpuesto(0)}
      <label class="campo">${T.fecha}<input type="date" name="fecha" value="${fecha < L.hoy() ? fecha : L.hoy()}"></label>
      <button type="button" class="pildora ancho" data-saltar>${T.saltarVez}</button>`,
      fd => {
        const monto = L.parseMonto(fd.get('monto')); if (!monto) return T.montoInvalido;
        if (!fd.get('cuenta')) return T.creaCuentaPrimero;
        const imp = W.leerImpuesto(fd); if (imp === null) return T.montoInvalido;
        nuevoMov({ tipo: 'gasto', cuentaId: fd.get('cuenta'), monto, impuesto: imp || undefined, fecha: fd.get('fecha') || L.hoy(), categoriaId: f.categoriaId, nota: f.nombre, ref: { tipo: 'fijo', id: f.id, periodo: fecha } });
        guardar(T.pagado);
      }, { textoOk: T.pagar });
    W.conectarImpuesto(fm, () => fm.cuenta.value, () => L.parseMonto(fm.monto.value) || 0);
    fm.cuenta.onchange = () => fm.querySelector('[data-imp]')._calc();
    fm.querySelector('[data-saltar]').onclick = () => { f.omitidos = (f.omitidos || []).concat(fecha); f.editado = ahora(); W.hoja().close(); guardar(T.saltado); };
  }

  // Nómina: se anota el bruto; los descuentos se calculan solos y cada día de cobro la app pide confirmar lo que llegó.
  function vNomina() {
    const ns = vivos('nominas');
    if (!ns.length) return vacioTxt(T.nominaVacio, 'nomina-nueva', T.nuevaNomina);
    return `<button class="pildora oscura ancho" data-accion="nomina-nueva">${ico('mas')} ${T.nuevaNomina}</button>
      ${ns.map(n => {
        const r = PL.nominaNeto(n, D().ajustes.pais), prox = L.proximaFecha(n.rec, L.hoy());
        return `<section class="tarjeta nomina"><button class="fila sin-borde" data-accion="nomina-editar" data-id="${esc(n.id)}"><span class="ico">💼</span>
          <span class="txt"><b>${esc(n.nombre)}</b><small>${textoRec(n.rec)}${prox ? ' · ' + T.proximo + ' ' + fechaCorta(prox) : ''}</small></span></button>
          <div class="desglose"><div><small>${T.bruto}</small><b>${din(r.bruto)}</b></div>${r.filas.map(x => `<div><small>${esc(x.nombre)}</small><b class="neg">−${din(x.monto)}</b></div>`).join('')}
          <div class="total"><small>${T.neto}</small><b class="pos">${din(r.neto)}</b></div></div></section>`;
      }).join('')}`;
  }
  function hojaNomina(n) {
    const rd = D().ajustes.pais === 'DO', ds = (n && n.descuentos) || [];
    const fila = (x, i) => `<div class="tres-col"><input name="dn${i}" maxlength="25" placeholder="${T.descuentoEj}" value="${esc(x ? x.nombre : '')}" aria-label="${T.descuento}">
      <input name="dv${i}" inputmode="decimal" placeholder="0" value="${x ? (x.pct || aInput(x.monto)) : ''}" aria-label="${T.monto}">
      <select name="dt${i}" aria-label="${T.tipo}"><option value="monto">${sim(W.P())}</option><option value="pct" ${x && x.pct ? 'selected' : ''}>%</option></select></div>`;
    const fm = abrirHoja(`<h2>${n ? T.editarNomina : T.nuevaNomina}</h2>
      <label class="campo">${T.nombreTrabajo}<input name="nombre" maxlength="40" required value="${n ? esc(n.nombre) : ''}"></label>
      <label class="campo monto-campo">${T.brutoPorPago} (${sim(W.P())})<input name="bruto" inputmode="decimal" autocomplete="off" value="${n ? aInput(n.bruto) : ''}" placeholder="0.00"></label>
      <label class="campo">${T.caeEn}<select name="cuenta">${opcionesCuentas(n && n.cuentaId, { tipos: ['diaria', 'ahorro'] })}</select></label>
      ${camposRec(n ? n.rec : { frec: 'quincenal', dias: [15, 30] }, ['mensual', 'quincenal', 'semanal', 'cada'])}
      ${rd ? `<label class="interruptor"><span>${T.descTSS}</span><input type="checkbox" name="tss" ${!n || n.tss ? 'checked' : ''}><i></i></label>
        <label class="interruptor"><span>${T.descISR}</span><input type="checkbox" name="isr" ${!n || n.isr ? 'checked' : ''}><i></i></label>` : ''}
      <fieldset class="chips"><legend>${T.otrosDescuentos}</legend>${[0, 1, 2].map(i => fila(ds[i], i)).join('')}</fieldset>
      <div class="caja-info" data-neto></div>
      ${rd ? `<p class="nota">${T.nominaAprox}</p>` : ''}
      ${n ? `<button type="button" class="pildora peligro ancho" data-borrar>${T.borrar}</button>` : ''}`,
      fd => {
        const nombre = String(fd.get('nombre') || '').trim(); if (!nombre) return T.nombreFalta;
        const datos = leer(fd); if (!datos) return T.montoInvalido;
        if (!fd.get('cuenta')) return T.creaCuentaPrimero;
        Object.assign(datos, { nombre, cuentaId: fd.get('cuenta'), editado: ahora() });
        if (n) Object.assign(n, datos); else nuevo('nominas', datos);
        guardar(T.guardado);
      });
    function leer(fd) {
      const bruto = L.parseMonto(fd.get('bruto')); if (!bruto) return null;
      const descuentos = [];
      for (const i of [0, 1, 2]) {
        const nom = String(fd.get('dn' + i) || '').trim(), v = String(fd.get('dv' + i) || '').trim();
        if (!v) continue;
        if (fd.get('dt' + i) === 'pct') { const p = L.parseNum(v); if (!p || p >= 100) return null; descuentos.push({ nombre: nom || T.descuento, pct: p }); }
        else { const m = L.parseMonto(v); if (!m) return null; descuentos.push({ nombre: nom || T.descuento, monto: m }); }
      }
      return { bruto, rec: leerRec(fd), tss: fd.get('tss') === 'on', isr: fd.get('isr') === 'on', descuentos };
    }
    const prev = () => {
      const d = leer(new FormData(fm)), caja = fm.querySelector('[data-neto]');
      if (!d) { caja.innerHTML = ''; return; }
      const r = PL.nominaNeto(d, D().ajustes.pais);
      caja.innerHTML = `${r.filas.map(x => `<small>${esc(x.nombre)} −${L.formato(x.monto, W.P())}</small>`).join(' · ')}<b>${T.neto}: ${L.formato(r.neto, W.P())}</b>`;
    };
    fm.addEventListener('input', prev); fm.addEventListener('change', prev); prev();
    conectarRec(fm);
    const b = fm.querySelector('[data-borrar]'); if (b) b.onclick = () => { if (confirm(T.confirmarBorrar)) { n.borrado = true; n.editado = ahora(); W.hoja().close(); guardar(T.borrado); } };
  }
  function hojaCobroNomina(n, fecha) {
    const r = PL.nominaNeto(n, D().ajustes.pais);
    const fm = abrirHoja(`<h2>💼 ${T.cobrasteNomina(esc(n.nombre))}</h2><p class="nota">${fechaCorta(fecha)} · ${T.bruto} ${din(r.bruto)}</p>
      <label class="campo monto-campo">${T.netoLlego}<input name="monto" inputmode="decimal" autocomplete="off" value="${aInput(r.neto)}"></label>
      <label class="campo">${T.caeEn}<select name="cuenta">${opcionesCuentas(n.cuentaId, { tipos: ['diaria', 'ahorro'] })}</select></label>
      <label class="campo">${T.fecha}<input type="date" name="fecha" value="${fecha}"></label>
      <button type="button" class="pildora ancho" data-saltar>${T.noCobre}</button>`,
      fd => {
        const monto = L.parseMonto(fd.get('monto')); if (!monto) return T.montoInvalido;
        nuevoMov({ tipo: 'ingreso', cuentaId: fd.get('cuenta'), monto, fecha: fd.get('fecha') || fecha, categoriaId: 'c-salario', nota: n.nombre, ref: { tipo: 'nomina', id: n.id, periodo: fecha } });
        guardar(T.nominaRegistrada);
      }, { textoOk: T.registrar });
    fm.querySelector('[data-saltar]').onclick = () => { n.omitidos = (n.omitidos || []).concat(fecha); n.editado = ahora(); W.hoja().close(); guardar(T.saltado); };
  }

  // Metas de ahorro (cada meta usa una cuenta de ahorro; el avance es su saldo).
  function vMetas() {
    const ms = vivos('metas'), p = CS.plan(D(), L.hoy());
    // Sugerencia: si no hay meta de fondo de emergencia, proponerla con el monto del plan.
    const tieneFondo = ms.some(m => m.tipo === 'fondo' || /emergencia/i.test(m.nombre));
    const sugerencia = !tieneFondo && p.fondo.meta > 0 ? `<section class="tarjeta sugerencia"><span class="meta-ico">🛟</span><div class="txt"><b>${T.sugerenciaFondo}</b>
      <small>${T.sugerenciaFondoTxt(din(p.fondo.meta), p.fondo.meses)}</small></div><button class="pildora oscura" data-accion="meta-fondo">${T.crear}</button></section>` : '';
    if (!ms.length) return sugerencia + vacioTxt(T.metasVacio, 'meta-nueva', T.nuevaMeta);
    // Lo que el plan aparta para metas se reparte entre las metas sin fecha, para decir en cuánto tiempo se logran.
    const sinFecha = ms.filter(m => !m.fecha && !PL.meta(D(), m, L.hoy()).lograda).length || 1;
    const porMetaPlan = Math.floor((p.ahorro.metas || 0) / sinFecha);
    return `${sugerencia}<button class="pildora oscura ancho" data-accion="meta-nueva">${ico('mas')} ${T.nuevaMeta}</button>
      ${ms.map(m => {
        const e = PL.meta(D(), m, L.hoy()), c = cuenta(m.cuentaId);
        if (e.oculta) return `<section class="tarjeta meta"><b>${m.icono || '🎯'} ${esc(m.nombre)}</b><p class="nota">🔒 ${T.metaEnBoveda}</p></section>`;
        return `<section class="tarjeta meta ${e.lograda ? 'lograda' : ''}"><div class="meta-top"><span class="meta-ico">${m.icono || '🎯'}</span>
          <div class="txt"><b>${esc(m.nombre)}</b><small>${esc(c.nombre)}${m.fecha ? ' · ' + T.para + ' ' + fechaCorta(m.fecha) : ''}</small></div>
          ${W.G.anillo(e.pct, { tam: 58, grosor: 7, centro: `<b>${Math.round(e.pct * 100)}%</b>` })}</div>
          <p class="grande">${din(e.actual, c.moneda)} <small>/ ${din(m.objetivo, c.moneda)}</small></p>
          <small>${e.lograda ? T.metaLograda : e.porMes ? T.metaPorMes(din(e.porMes, c.moneda), e.meses) : T.teFaltan + ' ' + din(e.falta, c.moneda)}</small>
          ${!e.lograda && !m.fecha && porMetaPlan > 0 && c.moneda === W.P() ? `<small class="mini-det">${T.metaConPlan(din(porMetaPlan), Math.ceil(e.falta / porMetaPlan))}</small>` : ''}
          ${m.reto === '52' && !e.lograda ? (() => { const r = PL.reto52(m, e.actual, L.hoy()); return `<small class="mini-det">🗓️ ${T.reto52(r.semana, din(r.toca, c.moneda), r.vaBien)}</small>`; })() : ''}
          <div class="acciones"><button class="pildora" data-accion="meta-editar" data-id="${esc(m.id)}">${T.editar}</button>
            <button class="pildora oscura" data-accion="meta-aportar" data-id="${esc(m.id)}">${T.aportar}</button></div></section>`;
      }).join('')}`;
  }
  function hojaMeta(m, prefill) {
    const ahorros = W.cuentasVivas().filter(c => c.tipo === 'ahorro' || c.tipo === 'inversion');
    const fm = abrirHoja(`<h2>${m ? T.editarMeta : T.nuevaMeta}</h2>
      ${m ? '' : `<div class="chips plantillas">${T.plantillasMeta.map(([i, n]) => `<button type="button" class="chip-btn" data-plantilla="${esc(i)}|${esc(n)}">${i} ${esc(n)}</button>`).join('')}</div>`}
      <div class="dos"><label class="campo">${T.icono}<input name="icono" maxlength="4" value="${m ? esc(m.icono || '🎯') : '🎯'}"></label>
        <label class="campo">${T.nombre}<input name="nombre" maxlength="40" required value="${m ? esc(m.nombre) : ''}" placeholder="${T.metaEj}"></label></div>
      <label class="campo monto-campo"><span>${T.cuantoQuieres} <span data-sim></span></span><input name="objetivo" inputmode="decimal" autocomplete="off" value="${m ? aInput(m.objetivo) : ''}" placeholder="0.00"></label>
      <label class="campo">${T.paraCuando}<input type="date" name="fecha" value="${m && m.fecha || ''}"></label>
      <label class="campo">${T.reto}<select name="reto">${Object.entries(T.retos).map(([k, v]) => `<option value="${k}" ${(m && m.reto || '') === k ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
      <label class="campo">${T.dondeAhorras}<select name="cuenta"><option value="">${T.crearCuentaMeta}</option>${ahorros.map(c => `<option value="${esc(c.id)}" ${m && m.cuentaId === c.id ? 'selected' : ''}>${esc(c.nombre)} (${sim(c.moneda)})</option>`).join('')}</select></label>
      ${m ? `<button type="button" class="pildora peligro ancho" data-borrar>${T.borrar}</button>` : ''}`,
      fd => {
        const nombre = String(fd.get('nombre') || '').trim(); if (!nombre) return T.nombreFalta;
        const objetivo = L.parseMonto(fd.get('objetivo')); if (!objetivo) return T.montoInvalido;
        let cuentaId = fd.get('cuenta');
        if (!cuentaId) {
          const t = ahora(); cuentaId = L.uuid();
          D().cuentas.push({ id: cuentaId, nombre, moneda: W.P(), icono: '🐷', tipo: 'ahorro', privada: false, creado: t, editado: t, borrado: false });
          nuevoMov({ tipo: 'saldo', cuentaId, monto: 0, fecha: L.hoy() });
        }
        const datos = { nombre, icono: String(fd.get('icono') || '🎯').trim() || '🎯', objetivo, fecha: fd.get('fecha') || null, cuentaId, reto: fd.get('reto') || undefined, editado: ahora() };
        if (m) Object.assign(m, datos); else nuevo('metas', datos);
        guardar(T.guardado);
      });
    const simMeta = () => { const c = cuenta(fm.cuenta.value); fm.querySelector('[data-sim]').textContent = `(${sim(c ? c.moneda : W.P())})`; };
    fm.querySelectorAll('[data-plantilla]').forEach(b => b.onclick = () => { const [i, n] = b.dataset.plantilla.split('|'); fm.icono.value = i; fm.nombre.value = n; if (n === T.reto52Nombre) { fm.reto.value = '52'; if (!fm.objetivo.value) fm.objetivo.value = aInput(68900); } fm.objetivo.focus(); });
    if (prefill) { fm.icono.value = prefill.icono; fm.nombre.value = prefill.nombre; fm.objetivo.value = aInput(prefill.objetivo); }
    fm.cuenta.onchange = simMeta; simMeta();
    const b = fm.querySelector('[data-borrar]'); if (b) b.onclick = () => { if (confirm(T.confirmarBorrarMeta)) { m.borrado = true; m.editado = ahora(); W.hoja().close(); guardar(T.borrado); } };
  }
  function aportarMeta(m) {
    const otras = W.cuentasVivas().filter(c => c.id !== m.cuentaId && !c.castigado);
    if (!otras.length) return aviso(T.dosCuentas, true);
    W.hojaMov(null, 'transferencia');
    const f = $('#hoja form');
    f.destino.value = m.cuentaId;
    if (f.cuenta.value === m.cuentaId) f.cuenta.value = otras[0].id;
    f.destino.dispatchEvent(new Event('change'));
  }

  // ---------- SAM ----------
  function vSam() {
    const ss = vivos('sams');
    if (!ss.length) return vacioTxt(T.samVacio, 'sam-nuevo', T.nuevoSam);
    return `<button class="pildora oscura ancho" data-accion="sam-nuevo">${ico('mas')} ${T.nuevoSam}</button>
      ${ss.map(s => {
        const e = PL.samEstado(s, L.hoy()), nom = id => (s.miembros.find(x => x.id === id) || {}).nombre || '—';
        const a = e.actual;
        return `<button class="tarjeta sam-tarjeta" data-accion="sam-ver" data-id="${esc(s.id)}">
          <div class="sub-fila"><b>🎲 ${esc(s.nombre)}</b><small>${T.modoSam[s.modo]}</small></div>
          <p class="grande">${din(e.pozo)} <small>${T.pozo}</small></p>
          <small>${din(s.cuota)} · ${textoRec(s.rec)} · ${T.personas(e.n)}</small>
          ${e.terminado ? `<p class="pos">${T.samTerminado}</p>` : a ? `<div class="caja-info"><b>${T.ronda(a.r, e.n)} · ${fechaCorta(a.fecha)}</b><small>${a.cobra ? T.cobra(esc(nom(a.cobra))) : T.porSortear} · ${T.pagaron(a.pagaron, e.n)}</small></div>` : ''}
          ${e.misTurnos.length ? `<small class="pos">${T.tuTurno} ${e.misTurnos.map(r => T.rondaCorta(r.r) + ' (' + fechaCorta(r.fecha) + ')').join(', ')}</small>` : ''}</button>`;
      }).join('')}`;
  }
  function hojaSam(s) {
    const lista = s ? s.miembros.filter(m => !m.yo).map(m => m.nombre).join('\n') : '';
    const yo = s ? s.miembros.filter(m => m.yo) : [];
    const fm = abrirHoja(`<h2>${s ? T.editarSam : T.nuevoSam}</h2>
      <label class="campo">${T.nombre}<input name="nombre" maxlength="40" required value="${s ? esc(s.nombre) : ''}" placeholder="${T.samEj}"></label>
      <div class="dos"><label class="campo">${T.cuotaCadaUno}<input name="cuota" inputmode="decimal" autocomplete="off" value="${s ? aInput(s.cuota) : ''}" placeholder="0.00"></label>
        <label class="campo">${T.primerPago}<input type="date" name="inicio" value="${s ? s.inicio : L.hoy()}"></label></div>
      ${camposRec(s ? s.rec : { frec: 'quincenal', dias: [15, 30] }, ['semanal', 'quincenal', 'mensual', 'cada'])}
      <label class="interruptor"><span>${T.yoParticipo}</span><input type="checkbox" name="yo" ${!s || yo.length ? 'checked' : ''}><i></i></label>
      <div class="dos" data-yo><label class="campo">${T.tuNombreSam}<input name="yoNombre" maxlength="30" value="${esc(yo[0] ? yo[0].nombre : T.yo)}"></label>
        <label class="campo">${T.cuantosNumeros}<select name="yoN">${[1, 2, 3, 4].map(n => `<option ${yo.length === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label></div>
      <label class="campo">${T.participantes}<textarea name="miembros" rows="6" placeholder="${T.participantesEj}">${esc(lista)}</textarea></label>
      <p class="nota">${T.participantesTxt}</p>
      ${s && s.orden && s.orden.some(Boolean) ? `<p class="nota">⚠️ ${T.samCambiarOrden}</p>` : ''}
      <label class="campo">${T.comoOrden}<select name="modo">${['rifaInicio', 'rifaRonda', 'manual'].map(m => `<option value="${m}" ${(s ? s.modo : 'rifaInicio') === m ? 'selected' : ''}>${T.modoSam[m]}</option>`).join('')}</select></label>
      <div class="dos"><label class="campo">${T.cobraPrimero}<select name="primero"></select></label><label class="campo">${T.cobraUltimo}<select name="ultimo"></select></label></div>
      <label class="campo">${T.rifaAporte}<input name="rifa" inputmode="decimal" autocomplete="off" value="${s && s.rifa ? aInput(s.rifa.aporte) : ''}" placeholder="0.00"></label>
      <p class="nota">${T.rifaTxt}</p>
      ${s ? `<button type="button" class="pildora peligro ancho" data-borrar>${T.borrar}</button>` : ''}`,
      fd => {
        const nombre = String(fd.get('nombre') || '').trim(); if (!nombre) return T.nombreFalta;
        const cuota = L.parseMonto(fd.get('cuota')); if (!cuota) return T.montoInvalido;
        const rifa = String(fd.get('rifa') || '').trim() ? L.parseMonto(fd.get('rifa')) : 0; if (rifa === null) return T.montoInvalido;
        const nombres = nombresDe(fd), viejos = s ? s.miembros : [];
        if (nombres.length < 2) return T.samPocos;
        // Conserva los id de quienes ya estaban (por nombre y orden) para no perder pagos marcados.
        const usados = new Set();
        const miembros = nombres.map(([n, esYo]) => {
          const v = viejos.find(x => x.nombre === n && !!x.yo === esYo && !usados.has(x.id));
          const id = v ? v.id : L.uuid(); usados.add(id);
          return { id, nombre: n, yo: esYo };
        });
        const fijos = {};
        if (fd.get('primero')) fijos[1] = miembros[Number(fd.get('primero'))].id;
        if (fd.get('ultimo') && fd.get('ultimo') !== fd.get('primero')) fijos.ultimo = miembros[Number(fd.get('ultimo'))].id;
        const modo = fd.get('modo');
        const datos = { nombre, cuota, inicio: fd.get('inicio') || L.hoy(), rec: leerRec(fd), miembros, modo, fijos, rifa: rifa ? { aporte: rifa, ganadores: (s && s.rifa && s.rifa.ganadores) || {} } : null, editado: ahora() };
        const cambioGente = !s || s.miembros.map(m => m.id).join() !== miembros.map(m => m.id).join() || s.modo !== modo || JSON.stringify(s.fijos || {}) !== JSON.stringify(fijos);
        let sam = s;
        if (s) Object.assign(s, datos); else sam = nuevo('sams', { ...datos, pagos: {}, cobradas: {}, sorteos: [] });
        if (cambioGente) {
          if (modo === 'manual') sam.orden = ordenManual(sam);
          else if (modo === 'rifaInicio') { sam.orden = PL.samSortear(sam); sam.sorteos = (sam.sorteos || []).concat({ fecha: ahora(), texto: T.sorteoTurnos }); }
          else sam.orden = PL.samSortearRonda({ ...sam, orden: null }, 1).map((x, i) => (i === 0 && !fijos[1] ? null : x)); // solo fijos; cada ronda se sortea al llegar
        }
        if (miembros.some(m => m.yo) && !sam.cuentaId) {
          const t = ahora(), id = L.uuid();
          D().cuentas.push({ id, nombre: nombre, moneda: W.P(), icono: '🎲', tipo: 'sam', privada: false, creado: t, editado: t, borrado: false });
          nuevoMov({ tipo: 'saldo', cuentaId: id, monto: 0, fecha: L.hoy() });
          sam.cuentaId = id;
        }
        guardar(cambioGente && modo === 'rifaInicio' ? T.sorteoListo : T.guardado);
        if (!s) hojaSamDetalle(sam);
      });
    function nombresDe(fd) {
      const otros = String(fd.get('miembros') || '').split('\n').map(x => x.trim()).filter(Boolean).slice(0, 60).map(n => [n.slice(0, 30), false]);
      if (fd.get('yo') !== 'on') return otros;
      const yoN = String(fd.get('yoNombre') || T.yo).trim().slice(0, 30) || T.yo;
      return Array.from({ length: Number(fd.get('yoN')) || 1 }, (_, i) => [Number(fd.get('yoN')) > 1 ? `${yoN} ${i + 1}` : yoN, true]).concat(otros);
    }
    const fijosViejos = s ? s.fijos || {} : {};
    const llenarFijos = () => {
      const ns = nombresDe(new FormData(fm));
      const idx = id => (s ? s.miembros.findIndex(m => m.id === id) : -1);
      for (const [campo, clave] of [['primero', 1], ['ultimo', 'ultimo']]) {
        const sel = fm[campo].value || (fijosViejos[clave] ? String(idx(fijosViejos[clave])) : '');
        fm[campo].innerHTML = `<option value="">${T.porSorteo}</option>` + ns.map(([n], i) => `<option value="${i}" ${String(i) === sel ? 'selected' : ''}>${esc(n)}</option>`).join('');
      }
      fm.querySelector('[data-yo]').hidden = !fm.yo.checked;
    };
    fm.addEventListener('input', ev => { if (['miembros', 'yoNombre'].includes(ev.target.name)) llenarFijos(); });
    fm.yo.onchange = llenarFijos; fm.yoN.onchange = llenarFijos;
    llenarFijos(); conectarRec(fm);
    const b = fm.querySelector('[data-borrar]'); if (b) b.onclick = () => {
      if (!confirm(T.confirmarBorrar)) return;
      s.borrado = true; s.editado = ahora();
      const c = cuenta(s.cuentaId); if (c && L.saldoCuenta(D(), c.id) === 0) { c.borrado = true; c.editado = ahora(); }
      W.hoja().close(); guardar(T.borrado);
    };
  }
  function ordenManual(s) {
    const n = s.miembros.length, orden = Array(n).fill(null), f = s.fijos || {};
    if (f[1]) orden[0] = f[1];
    if (f.ultimo) orden[n - 1] = f.ultimo;
    const resto = s.miembros.map(m => m.id).filter(id => !orden.includes(id));
    return orden.map(x => x || resto.shift());
  }
  function hojaSamDetalle(s) {
    const e = PL.samEstado(s, L.hoy()), nom = id => (s.miembros.find(x => x.id === id) || {}).nombre || '—';
    const fm = abrirHoja(`<h2>🎲 ${esc(s.nombre)}</h2>
      <p class="nota">${din(s.cuota)} · ${textoRec(s.rec)} · ${T.personas(e.n)} · ${T.pozoEt} ${din(e.pozo)}${s.rifa ? ' · 🎁 ' + din(s.rifa.aporte * e.n) : ''}</p>
      ${(s.sorteos || []).length ? `<p class="nota">🎲 ${T.sorteoHecho(new Date(s.sorteos[s.sorteos.length - 1].fecha).toLocaleString('es-DO', { dateStyle: 'medium', timeStyle: 'short' }))}</p>` : ''}
      <ul class="lista-plana rondas">${e.rondas.map(r => `<li class="${r.cobrada ? 'hecha' : r === e.actual ? 'actual' : ''}">
        <button type="button" class="fila" data-ronda="${r.r}"><span class="m-ico">${r.cobrada ? '✓' : r.r}</span>
        <span class="txt"><b>${r.cobra ? esc(nom(r.cobra)) : T.porSortear}${s.miembros.some(m => m.yo && m.id === r.cobra) ? ' ⭐' : ''}</b><small>${fechaCorta(r.fecha)} · ${T.pagaron(r.pagaron, e.n)}${s.rifa && s.rifa.ganadores[r.r] ? ' · 🎁 ' + esc(nom(s.rifa.ganadores[r.r])) : ''}</small></span>
        <span class="chev">›</span></button></li>`).join('')}</ul>
      <div class="acciones"><button type="button" class="pildora" data-editar>${T.editar}</button><button type="button" class="pildora oscura" data-cerrar>${T.listo}</button></div>`, () => {}, { sinAcciones: true });
    fm.querySelector('[data-editar]').onclick = () => hojaSam(s);
    fm.querySelectorAll('[data-ronda]').forEach(b => b.onclick = () => hojaRonda(s, Number(b.dataset.ronda)));
  }
  function hojaRonda(s, r) {
    const e = PL.samEstado(s, L.hoy()), ronda = e.rondas[r - 1], nom = id => (s.miembros.find(x => x.id === id) || {}).nombre || '—';
    const pagos = new Set((s.pagos || {})[r] || []), yo = s.miembros.filter(m => m.yo), cobraYo = yo.some(m => m.id === ronda.cobra);
    const yaPague = D().movimientos.some(m => !m.borrado && m.ref && m.ref.tipo === 'sam' && m.ref.id === s.id && m.ref.periodo === 'p' + r);
    const yaCobre = D().movimientos.some(m => !m.borrado && m.ref && m.ref.tipo === 'sam' && m.ref.id === s.id && m.ref.periodo === 'c' + r);
    const fm = abrirHoja(`<h2>${T.ronda(r, e.n)} · ${fechaCorta(ronda.fecha)}</h2>
      <div class="caja-info"><b>${ronda.cobra ? T.cobra(esc(nom(ronda.cobra))) : T.porSortear}</b><small>${T.pozoEt} ${din(e.pozo)}</small></div>
      ${!ronda.cobra ? `<button type="button" class="pildora oscura ancho" data-sortear>🎲 ${T.sortearQuienCobra}</button>` : ''}
      <fieldset class="chips"><legend>${T.quienPago}</legend><div class="pagos">${s.miembros.map(m => `<label class="chip"><input type="checkbox" name="pago" value="${esc(m.id)}" ${pagos.has(m.id) ? 'checked' : ''}><span>${esc(m.nombre)}</span></label>`).join('')}</div></fieldset>
      ${s.rifa ? `<div class="caja-info"><b>🎁 ${T.premioRifa} ${din(s.rifa.aporte * e.n)}</b><small>${s.rifa.ganadores[r] ? T.gano(esc(nom(s.rifa.ganadores[r]))) : ''}</small>
        ${s.rifa.ganadores[r] ? '' : `<button type="button" class="pildora ancho" data-rifa>🎁 ${T.sortearPremio}</button>`}</div>` : ''}
      ${yo.length && s.cuentaId ? `<button type="button" class="pildora ancho" data-pague ${yaPague ? 'disabled' : ''}>${yaPague ? '✓ ' + T.yaPague : T.pagueMiCuota}</button>
        ${cobraYo ? `<button type="button" class="pildora oscura ancho" data-cobre ${yaCobre ? 'disabled' : ''}>${yaCobre ? '✓ ' + T.yaCobre : T.cobreElPozo}</button>` : ''}` : ''}
      <label class="interruptor"><span>${T.rondaCobrada}</span><input type="checkbox" name="cobrada" ${ronda.cobrada ? 'checked' : ''}><i></i></label>`,
      fd => {
        s.pagos = { ...(s.pagos || {}), [r]: fd.getAll('pago') };
        s.cobradas = { ...(s.cobradas || {}), [r]: fd.get('cobrada') === 'on' };
        s.editado = ahora(); guardar(T.guardado);
      });
    const on = (sel, fn) => { const b = fm.querySelector(sel); if (b) b.onclick = fn; };
    on('[data-sortear]', () => {
      s.orden = PL.samSortearRonda(s, r); s.sorteos = (s.sorteos || []).concat({ fecha: ahora(), texto: T.ronda(r, e.n) });
      s.editado = ahora(); guardar(T.cobra(nom(s.orden[r - 1]))); hojaRonda(s, r);
    });
    on('[data-rifa]', () => {
      const g = PL.samSortear({ miembros: s.miembros, fijos: {} })[0]; // el primero de un sorteo al azar
      s.rifa.ganadores = { ...s.rifa.ganadores, [r]: g }; s.editado = ahora();
      if (s.miembros.some(m => m.yo && m.id === g)) aviso('🎉 ' + T.ganasteRifa);
      guardar(T.gano(nom(g))); hojaRonda(s, r);
    });
    on('[data-pague]', () => pagarSam(s, r));
    on('[data-cobre]', () => cobrarSam(s, r));
  }
  function pagarSam(s, r) {
    const n = s.miembros.filter(m => m.yo).length, monto = s.cuota * n + (s.rifa ? s.rifa.aporte * n : 0);
    const sc = cuenta(s.cuentaId);
    const fm = abrirHoja(`<h2>${T.pagueMiCuota} · ${T.rondaCorta(r)}</h2>
      <label class="campo monto-campo">${T.monto}<input name="monto" inputmode="decimal" value="${aInput(monto)}"></label>
      <label class="campo">${T.desde}<select name="cuenta">${opcionesCuentas(D().ajustes.ultimaCuenta, { moneda: sc.moneda, tipos: ['diaria', 'ahorro'] })}</select></label>
      ${W.bloqueImpuesto(0)}
      <label class="campo">${T.fecha}<input type="date" name="fecha" value="${L.hoy()}"></label>`,
      fd => {
        const m = L.parseMonto(fd.get('monto')); if (!m) return T.montoInvalido;
        if (!fd.get('cuenta')) return T.creaCuentaPrimero;
        const imp = W.leerImpuesto(fd); if (imp === null) return T.montoInvalido;
        nuevoMov({ tipo: 'transferencia', cuentaId: fd.get('cuenta'), cuentaDestinoId: s.cuentaId, monto: m, montoDestino: m, impuesto: imp || undefined, fecha: fd.get('fecha'), ref: { tipo: 'sam', id: s.id, periodo: 'p' + r } });
        const yoIds = s.miembros.filter(x => x.yo).map(x => x.id);
        s.pagos = { ...(s.pagos || {}), [r]: [...new Set(((s.pagos || {})[r] || []).concat(yoIds))] };
        guardar(T.pagado);
      }, { textoOk: T.pagar });
    W.conectarImpuesto(fm, () => fm.cuenta.value, () => L.parseMonto(fm.monto.value) || 0);
  }
  function cobrarSam(s, r) {
    const sc = cuenta(s.cuentaId);
    abrirHoja(`<h2>${T.cobreElPozo} · ${T.rondaCorta(r)}</h2>
      <label class="campo monto-campo">${T.monto}<input name="monto" inputmode="decimal" value="${aInput(PL.pozo(s))}"></label>
      <label class="campo">${T.hacia}<select name="cuenta">${opcionesCuentas(null, { moneda: sc.moneda, tipos: ['diaria', 'ahorro'] })}</select></label>
      <label class="campo">${T.fecha}<input type="date" name="fecha" value="${L.hoy()}"></label>`,
      fd => {
        const m = L.parseMonto(fd.get('monto')); if (!m) return T.montoInvalido;
        if (!fd.get('cuenta')) return T.creaCuentaPrimero;
        nuevoMov({ tipo: 'transferencia', cuentaId: s.cuentaId, cuentaDestinoId: fd.get('cuenta'), monto: m, montoDestino: m, fecha: fd.get('fecha'), ref: { tipo: 'sam', id: s.id, periodo: 'c' + r } });
        s.cobradas = { ...(s.cobradas || {}), [r]: true };
        guardar('🎉 ' + T.yaCobre);
      }, { textoOk: T.cobrar });
  }

  // ---------- encargos (le compro algo a alguien y gano comisión) ----------
  function vEncargos() {
    const es = vivos('encargos');
    if (!es.length) return vacioTxt(T.encargosVacio, 'encargo-nuevo', T.nuevoEncargo);
    const mes = L.hoy().slice(0, 7);
    const ganado = D().movimientos.filter(m => !m.borrado && m.categoriaId === 'c-comision' && m.fecha.slice(0, 7) === mes).reduce((s, m) => s + m.monto, 0);
    const porCobrar = es.filter(e => e.estado !== 'cobrado').reduce((s, e) => s + PL.encargo(e).cobro, 0);
    const fila = e => {
      const r = PL.encargo(e);
      return `<li><button class="fila" data-accion="encargo-ver" data-id="${esc(e.id)}"><span class="ico">📮</span>
        <span class="txt"><b>${esc(e.cliente)} · ${esc(e.descripcion)}</b><small>${T.estadoEnc[e.estado || 'pedido']} · ${fechaCorta(e.fecha)}</small></span>
        <span class="monto pos">+${din(r.ganancia)}</span></button></li>`;
    };
    const abiertos = es.filter(e => e.estado !== 'cobrado'), listos = es.filter(e => e.estado === 'cobrado');
    return `<section class="tarjeta resumen-plan dos-col"><div><small>${T.ganadoMes}</small><b class="pos">${din(ganado)}</b></div><div><small>${T.porCobrar}</small><b>${din(porCobrar)}</b></div></section>
      <button class="pildora oscura ancho" data-accion="encargo-nuevo">${ico('mas')} ${T.nuevoEncargo}</button>
      ${abiertos.length ? `<h2 class="sub">${T.enCurso}</h2><ul class="lista">${abiertos.map(fila).join('')}</ul>` : ''}
      ${listos.length ? `<h2 class="sub">${T.cobrados}</h2><ul class="lista">${listos.slice(-30).reverse().map(fila).join('')}</ul>` : ''}`;
  }
  function hojaEncargo(e) {
    const P = W.P();
    const fm = abrirHoja(`<h2>${e ? T.editarEncargo : T.nuevoEncargo}</h2>
      <div class="dos"><label class="campo">${T.cliente}<input name="cliente" maxlength="30" required value="${e ? esc(e.cliente) : ''}"></label>
        <label class="campo">${T.fecha}<input type="date" name="fecha" value="${e ? e.fecha : L.hoy()}"></label></div>
      <label class="campo">${T.queEs}<input name="descripcion" maxlength="50" list="lugares-enc" value="${e ? esc(e.descripcion) : ''}" placeholder="${T.encargoEj}"></label>
      <datalist id="lugares-enc">${T.tiendas.map(x => `<option value="${esc(x)}">`).join('')}</datalist>
      <h3>🛍️ ${T.articulo}</h3>
      <label class="campo">${T.monedaArticulo}<select name="moneda">${opcionesMonedas(e ? e.monedaArticulo : (P === 'USD' ? 'USD' : 'USD'))}</select></label>
      <div class="dos"><label class="campo">${T.teCuesta}<input name="aCosto" inputmode="decimal" value="${e ? aInput(e.articuloCosto) : ''}" placeholder="5.00"></label>
        <label class="campo">${T.leCobras}<input name="aPrecio" inputmode="decimal" value="${e ? aInput(e.articuloPrecio) : ''}" placeholder="8.00"></label></div>
      <div class="dos" data-tasas><label class="campo">${T.tasaReal}<input name="tCosto" inputmode="decimal" value="${e && e.tasaCosto || ''}" placeholder="0.00"></label>
        <label class="campo">${T.tasaCobras}<input name="tCobro" inputmode="decimal" value="${e && e.tasaCobro || ''}" placeholder="0.00"></label></div>
      <h3>⚖️ ${T.libras} (${sim(P)})</h3>
      <div class="tres-col"><label class="campo">${T.cuantasLibras}<input name="libras" inputmode="decimal" value="${e && e.libras || ''}" placeholder="0"></label>
        <label class="campo">${T.libraReal}<input name="lCosto" inputmode="decimal" value="${e ? aInput(e.libraCosto) : ''}" placeholder="160"></label>
        <label class="campo">${T.libraCobras}<input name="lPrecio" inputmode="decimal" value="${e ? aInput(e.libraPrecio) : ''}" placeholder="200"></label></div>
      <h3>📦 ${T.otrosCargos} (${sim(P)})</h3>
      <div class="dos"><label class="campo">${T.teCuesta}<input name="oCosto" inputmode="decimal" value="${e ? aInput(e.otrosCosto) : ''}" placeholder="0"></label>
        <label class="campo">${T.leCobras}<input name="oPrecio" inputmode="decimal" value="${e ? aInput(e.otrosPrecio) : ''}" placeholder="0"></label></div>
      <div class="caja-info ganancia" data-gan></div>
      ${e ? `<div class="acciones"><button type="button" class="pildora" data-pague ${e.estado !== 'pedido' && e.estado ? 'disabled' : ''}>${T.registrePago}</button>
        <button type="button" class="pildora oscura" data-cobre ${e.estado === 'cobrado' ? 'disabled' : ''}>${T.mePagaron}</button></div>
        <button type="button" class="pildora peligro ancho" data-borrar>${T.borrar}</button>` : ''}`,
      fd => {
        const cliente = String(fd.get('cliente') || '').trim(); if (!cliente) return T.nombreFalta;
        const datos = leer(fd); if (!datos) return T.montoInvalido;
        Object.assign(datos, { cliente, descripcion: String(fd.get('descripcion') || '').trim() || T.encargo, fecha: fd.get('fecha') || L.hoy(), editado: ahora() });
        if (e) Object.assign(e, datos); else nuevo('encargos', { ...datos, estado: 'pedido' });
        guardar(T.guardado);
      });
    function leer(fd) {
      const m = k => { const v = String(fd.get(k) || '').trim(); return v ? L.parseMonto(v) : 0; };
      const n = k => { const v = String(fd.get(k) || '').trim(); return v ? L.parseNum(v) : 0; };
      const r = { monedaArticulo: fd.get('moneda'), articuloCosto: m('aCosto'), articuloPrecio: m('aPrecio'), libras: n('libras'), libraCosto: m('lCosto'), libraPrecio: m('lPrecio'), otrosCosto: m('oCosto'), otrosPrecio: m('oPrecio') };
      const mismo = r.monedaArticulo === P;
      r.tasaCosto = mismo ? 1 : n('tCosto'); r.tasaCobro = mismo ? 1 : (n('tCobro') || r.tasaCosto);
      if (Object.values(r).some(v => v === null)) return null;
      if (!mismo && (r.articuloCosto || r.articuloPrecio) && !r.tasaCosto) return null;
      return r;
    }
    const prev = () => {
      const mismo = fm.moneda.value === P;
      fm.querySelector('[data-tasas]').hidden = mismo;
      if (!mismo && !fm.tCosto.value) { const t = L.convertir(D(), 1000000, fm.moneda.value, P); if (t) fm.tCosto.value = String(t / 1000000); }
      const d = leer(new FormData(fm)), caja = fm.querySelector('[data-gan]');
      if (!d) { caja.innerHTML = `<small>${T.faltaTasaEnc}</small>`; return; }
      const r = PL.encargo(d), f = v => L.formato(v, P);
      caja.innerHTML = `<b>${T.ganas} ${f(r.ganancia)}</b><small>${T.enArticulo} ${f(r.enArticulo)}${r.enTasa ? ' · ' + T.enTasa + ' ' + f(r.enTasa) : ''} · ${T.enLibras} ${f(r.enLibras)}${r.enOtros ? ' · ' + T.enOtros + ' ' + f(r.enOtros) : ''}</small>
        <small>${T.teCuestaTotal} ${f(r.costo)} · ${T.leCobrasTotal} ${f(r.cobro)}</small>`;
    };
    fm.addEventListener('input', prev); fm.moneda.addEventListener('change', () => { fm.tCosto.value = ''; prev(); }); prev();
    if (!e) return;
    const r = PL.encargo(e);
    fm.querySelector('[data-pague]').onclick = () => abrirHoja(`<h2>${T.registrePago}</h2><p class="nota">${T.encargoNeutroTxt}</p>
      <label class="campo monto-campo">${T.monto} (${sim(P)})<input name="monto" inputmode="decimal" value="${aInput(r.costo)}"></label>
      <label class="campo">${T.desde}<select name="cuenta">${opcionesCuentas(D().ajustes.ultimaCuenta, { moneda: P, tipos: usoCuentas })}</select></label>
      <label class="campo">${T.fecha}<input type="date" name="fecha" value="${L.hoy()}"></label>`, fd => {
      const m = L.parseMonto(fd.get('monto')); if (!m) return T.montoInvalido;
      if (!fd.get('cuenta')) return T.creaCuentaPrimero;
      nuevoMov({ tipo: 'gasto', cuentaId: fd.get('cuenta'), monto: m, fecha: fd.get('fecha'), categoriaId: 'c-encargo', nota: `${e.cliente} · ${e.descripcion}`, ref: { tipo: 'encargo', id: e.id, periodo: 'pago' } });
      e.estado = 'pagado'; e.editado = ahora(); guardar(T.guardado);
    });
    fm.querySelector('[data-cobre]').onclick = () => abrirHoja(`<h2>${T.mePagaron} · ${esc(e.cliente)}</h2>
      <label class="campo monto-campo">${T.recibiste} (${sim(P)})<input name="monto" inputmode="decimal" value="${aInput(r.cobro)}"></label>
      <label class="campo">${T.hacia}<select name="cuenta">${opcionesCuentas(D().ajustes.ultimaCuenta, { moneda: P, tipos: ['diaria', 'ahorro'] })}</select></label>
      <label class="campo">${T.fecha}<input type="date" name="fecha" value="${L.hoy()}"></label>`, fd => {
      const m = L.parseMonto(fd.get('monto')); if (!m) return T.montoInvalido;
      if (!fd.get('cuenta')) return T.creaCuentaPrimero;
      // Lo que me devuelven del costo no es ingreso; lo de más es mi comisión.
      const devuelto = Math.min(m, r.costo), comision = m - devuelto, grupo = L.uuid(), ref = { tipo: 'encargo', id: e.id, periodo: 'cobro' };
      if (devuelto) nuevoMov({ tipo: 'ingreso', cuentaId: fd.get('cuenta'), monto: devuelto, fecha: fd.get('fecha'), categoriaId: 'c-encargo', nota: `${e.cliente} · ${e.descripcion}`, grupo, ref });
      if (comision) nuevoMov({ tipo: 'ingreso', cuentaId: fd.get('cuenta'), monto: comision, fecha: fd.get('fecha'), categoriaId: 'c-comision', nota: `${e.cliente} · ${e.descripcion}`, grupo, ref }, 2);
      e.estado = 'cobrado'; e.editado = ahora(); guardar(comision ? T.ganaste(L.formato(comision, P)) : T.guardado);
    });
    fm.querySelector('[data-borrar]').onclick = () => { if (confirm(T.confirmarBorrar)) { e.borrado = true; e.editado = ahora(); W.hoja().close(); guardar(T.borrado); } };
  }

  // ---------- calculadora ----------
  // Cálculos de préstamos para cualquier persona (no son préstamos del usuario). Se pueden guardar con nombre.
  let calc = { modo: 'prestamo', v: { monto: '100000', tasa: '18', periodoTasa: 'anual', plazo: '24', frecuencia: 'mensual', tipo: 'frances', comision: '', seguro: '', abonoExtra: '', cuota: '5000', inicial: '50000', aporte: '5000', meses: '12', retencion: '10' }, id: null };
  function vCalculadora() {
    const v = calc.v, opt = (lista, sel, txt) => lista.map(x => `<option value="${x}" ${sel === x ? 'selected' : ''}>${txt[x]}</option>`).join('');
    const guardados = vivos('calculos');
    const campo = (n, et, extra = '') => `<label class="campo">${et}<input name="${n}" inputmode="decimal" autocomplete="off" value="${esc(v[n] || '')}" ${extra}></label>`;
    return `<section class="tarjeta calc" id="calc">
      ${segmento('modo', [['prestamo', T.calcPrestamo], ['cuanto', T.calcCuanto], ['ahorro', T.calcAhorro]], calc.modo)}
      <div data-m="prestamo cuanto">
        ${calc.modo === 'cuanto' ? campo('cuota', T.cuotaPuedes + ` (${sim(W.P())})`) : campo('monto', T.montoPrestamo + ` (${sim(W.P())})`)}
        <div class="dos">${campo('tasa', T.tasaPct)}
          <label class="campo">${T.periodoTasa}<select name="periodoTasa">${opt(['anual', 'mensual', 'quincenal', 'semanal', 'diaria'], v.periodoTasa, T.porPeriodo)}</select></label>
          <label class="campo">${T.plazoCuotas}<input name="plazo" type="number" min="1" max="3650" value="${esc(v.plazo)}"></label>
          <label class="campo">${T.frecuencia}<select name="frecuencia">${opt(PR.FRECUENCIAS, v.frecuencia, T.frec)}</select></label></div>
        <div data-m="prestamo"><label class="campo">${T.tipoCalculo}<select name="tipo">${opt(PR.TIPOS, v.tipo, T.tiposPrestamo)}</select></label>
          <p class="nota">${T.tiposAyuda[v.tipo]}</p>
          <details><summary>${T.masOpciones}</summary><div class="dos">${campo('comision', T.comisionCierre)}${campo('seguro', T.seguroCuota)}</div>${campo('abonoExtra', T.abonoExtra)}</details></div>
      </div>
      <div data-m="ahorro"><div class="dos">${campo('inicial', T.montoInicial)}${campo('aporte', T.aporteMensual)}${campo('tasa', T.tasaAnual)}
        <label class="campo">${T.mesesEt}<input name="meses" type="number" min="1" max="600" value="${esc(v.meses)}"></label></div>${campo('retencion', T.retencion)}</div>
      </section>
      <section class="tarjeta resultado" id="calc-res"></section>
      ${guardados.length ? `<h2 class="sub">${T.calculosGuardados}</h2><ul class="lista">${guardados.slice().reverse().map(c => `<li><button class="fila" data-accion="calc-abrir" data-id="${esc(c.id)}">
        <span class="ico">${c.modo === 'ahorro' ? '🐷' : '🧮'}</span><span class="txt"><b>${esc(c.nombre)}</b><small>${T.calcModos[c.modo]} · ${fechaCorta(c.creado.slice(0, 10))}</small></span><span class="chev">›</span></button></li>`).join('')}</ul>` : ''}`;
  }
  const num = (v, k) => { const x = String(v[k] || '').trim(); return x ? L.parseNum(x) : 0; };
  const cent = (v, k) => { const x = String(v[k] || '').trim(); return x ? L.parseMonto(x) : 0; };
  function planDe(v, monto) { return { monto, tasa: num(v, 'tasa') || 0, periodoTasa: v.periodoTasa, plazo: Number(v.plazo) || 1, frecuencia: v.frecuencia, tipo: v.tipo, comision: cent(v, 'comision') || 0, seguro: cent(v, 'seguro') || 0, abonoExtra: cent(v, 'abonoExtra') || 0 }; }
  function resultado() {
    const v = calc.v, P = W.P(), f = x => L.formato(x, P), caja = $('#calc-res');
    if (!caja) return;
    const pct = x => (x * 100).toLocaleString('es-DO', { maximumFractionDigits: 2 }) + ' %';
    let html = '';
    if (calc.modo === 'ahorro') {
      const r = PR.ahorro({ inicial: cent(v, 'inicial') || 0, aporte: cent(v, 'aporte') || 0, tasa: num(v, 'tasa') || 0, meses: Number(v.meses) || 1, retencion: num(v, 'retencion') || 0 });
      html = `<small>${T.tendras}</small><strong class="calc-grande">${f(r.final)}</strong>
        <div class="desglose"><div><small>${T.pusiste}</small><b>${f(r.aportado)}</b></div><div><small>${T.ganasIntereses}</small><b class="pos">+${f(r.intereses)}</b></div>${r.retenido ? `<div><small>${T.retenido}</small><b class="neg">−${f(r.retenido)}</b></div>` : ''}</div>
        ${W.G.linea([cent(v, 'inicial') || 0].concat(r.filas.map(x => x.saldo)), { id: 'gc' })}`;
    } else {
      let monto = cent(v, 'monto');
      if (calc.modo === 'cuanto') {
        const cuota = cent(v, 'cuota');
        if (!cuota) return void (caja.innerHTML = `<p class="nota">${T.llenaDatos}</p>`);
        monto = PR.cuantoMePrestan({ cuota, tasa: num(v, 'tasa') || 0, periodoTasa: v.periodoTasa, plazo: Number(v.plazo) || 1, frecuencia: v.frecuencia });
        html = `<small>${T.tePrestan}</small><strong class="calc-grande">${f(monto)}</strong><p class="nota">${T.cuantoTxt(f(cuota), v.plazo, T.frec[v.frecuencia])}</p>`;
        v.tipo = 'frances';
      }
      if (!monto) return void (caja.innerHTML = html || `<p class="nota">${T.llenaDatos}</p>`);
      const r = PR.prestamo(planDe(v, monto)), ultima = r.filas[r.filas.length - 1];
      if (calc.modo === 'prestamo') html = `<small>${v.tipo === 'unico' ? T.pagoFinal : v.tipo === 'frances' || v.tipo === 'flat' ? T.cuotaFija : T.primeraCuota}</small>
        <strong class="calc-grande">${f(v.tipo === 'unico' ? ultima.cuota : r.cuota)}</strong>${v.tipo === 'aleman' || v.tipo === 'interes' ? `<small>${T.ultimaCuota} ${f(ultima.cuota)}</small>` : ''}`;
      html += `<div class="desglose"><div><small>${T.totalPagas}</small><b>${f(r.totalPagado + r.comision)}</b></div><div><small>${T.totalInteres}</small><b class="neg">${f(r.totalInteres)}</b></div>
        <div><small>${T.cuotas}</small><b>${r.cuotas}</b></div><div><small>${T.costoReal}</small><b>${pct(r.tasaEfectivaAnual)}</b></div></div>
        ${r.ahorroConExtra ? `<p class="pos">${T.conAbono(f(r.ahorroConExtra), r.cuotasMenos)}</p>` : ''}
        <div class="barra-doble" aria-hidden="true"><i style="flex:${monto}"></i><i style="flex:${Math.max(1, r.totalInteres)}"></i></div>
        <div class="leyenda-mini"><span><i class="a"></i>${T.capital}</span><span><i class="b"></i>${T.interes}</span></div>`;
      if (calc.modo === 'prestamo') {
        const comp = PR.TIPOS.map(t => ({ t, r: PR.prestamo(planDe({ ...v, tipo: t }, monto)) }));
        html += `<h3>${T.comparaTipos}</h3><div class="tabla-mini"><table><thead><tr><th>${T.tipo}</th><th>${T.cuota}</th><th>${T.interes}</th><th>${T.costoReal}</th></tr></thead><tbody>
          ${comp.map(({ t, r: x }) => `<tr class="${t === v.tipo ? 'sel' : ''}"><td>${T.tiposPrestamo[t]}</td><td>${L.formato(t === 'unico' ? x.filas[x.filas.length - 1].cuota : x.cuota, P, true)}</td><td>${L.formato(x.totalInteres, P, true)}</td><td>${pct(x.tasaEfectivaAnual)}</td></tr>`).join('')}</tbody></table></div>`;
      }
      html += `<div class="acciones"><button class="pildora" data-accion="calc-tabla">${T.verTabla}</button><button class="pildora" data-accion="calc-guardar">${T.guardarCalculo}</button></div>
        <button class="pildora oscura ancho" data-accion="calc-real">${T.usarEnPrestamo}</button>`;
      calc.ultimo = { r, plan: planDe(v, monto) };
    }
    if (calc.modo === 'ahorro') html += `<button class="pildora ancho" data-accion="calc-guardar">${T.guardarCalculo}</button>`;
    caja.innerHTML = html;
  }
  function alPintar(t) {
    if (t === 'planes' && sub === 'plan') return conectarPlan();
  if (t !== 'calculadora') return;
    const c = $('#calc');
    const ver = () => c.querySelectorAll('[data-m]').forEach(e => { e.hidden = !e.dataset.m.split(' ').includes(calc.modo); });
    c.addEventListener('input', ev => { if (ev.target.name && ev.target.name !== 'modo') { calc.v[ev.target.name] = ev.target.value; resultado(); } });
    c.addEventListener('change', ev => {
      if (ev.target.name === 'modo') { calc.modo = ev.target.value; W.pintar(); return; }
      if (ev.target.name) { calc.v[ev.target.name] = ev.target.value; if (ev.target.name === 'tipo') W.pintar(); else resultado(); }
    });
    ver(); resultado();
  }
  function hojaTabla(t, moneda, nombre) {
    const f = x => L.formato(x, moneda);
    abrirHoja(`<h2>${T.tablaPagos}${nombre ? ' · ' + esc(nombre) : ''}</h2>
      <div class="tabla-mini alta"><table><thead><tr><th>#</th><th>${T.cuota}</th><th>${T.interes}</th><th>${T.capital}</th><th>${T.saldoRestante}</th></tr></thead><tbody>
      ${t.filas.slice(0, 400).map(x => `<tr><td>${x.n}</td><td>${f(x.cuota + x.extra)}</td><td>${f(x.interes)}</td><td>${f(x.capital + x.extra)}</td><td>${f(x.saldo)}</td></tr>`).join('')}</tbody></table></div>
      <div class="acciones uno"><button type="button" class="pildora oscura" data-cerrar>${T.listo}</button></div>`, () => {}, { sinAcciones: true });
  }
  function guardarCalculo() {
    const fm = abrirHoja(`<h2>${T.guardarCalculo}</h2><label class="campo">${T.nombreCalculo}<input name="nombre" maxlength="40" required placeholder="${T.calculoEj}"></label>`, fd => {
      const nombre = String(fd.get('nombre') || '').trim(); if (!nombre) return T.nombreFalta;
      nuevo('calculos', { nombre, modo: calc.modo, v: { ...calc.v } });
      guardar(T.guardado);
    });
    setTimeout(() => fm.nombre.focus(), 60);
  }
  function abrirCalculo(c) {
    const fm = abrirHoja(`<h2>🧮 ${esc(c.nombre)}</h2><p class="nota">${T.calcModos[c.modo]} · ${fechaCorta(c.creado.slice(0, 10))}</p>
      <button type="button" class="pildora oscura ancho" data-cargar>${T.abrirCalculo}</button>
      <button type="button" class="pildora peligro ancho" data-borrar>${T.borrar}</button>
      <div class="acciones uno"><button type="button" class="pildora" data-cerrar>${T.cancelar}</button></div>`, () => {}, { sinAcciones: true });
    fm.querySelector('[data-cargar]').onclick = () => { calc = { modo: c.modo, v: { ...calc.v, ...c.v } }; W.hoja().close(); W.pintar(); window.scrollTo(0, 0); };
    fm.querySelector('[data-borrar]').onclick = () => { c.borrado = true; c.editado = ahora(); W.hoja().close(); guardar(T.borrado); };
  }

  // ---------- acciones y pendientes ----------
  function accion(a, el) {
    const id = el.dataset.id;
    const mapa = {
      'plan-sub': () => { sub = el.dataset.sub; W.pintar(); },
      'plan-regla': () => { D().ajustes.regla = el.dataset.regla; aporteProy = null; guardar(); },
      'plan-aplicar': aplicarPlan,
      'fijo-nuevo': () => hojaFijo(), 'fijo-editar': () => hojaFijo(buscar('fijos', id)),
      'nomina-nueva': () => hojaNomina(), 'nomina-editar': () => hojaNomina(buscar('nominas', id)),
      'meta-nueva': () => hojaMeta(),
      'meta-fondo': () => { const p = CS.plan(D(), L.hoy()); hojaMeta(null, { icono: '🛟', nombre: T.fondoTitulo, objetivo: p.fondo.meta }); },
'meta-editar': () => hojaMeta(buscar('metas', id)), 'meta-aportar': () => aportarMeta(buscar('metas', id)),
      'sam-nuevo': () => hojaSam(), 'sam-ver': () => hojaSamDetalle(buscar('sams', id)),
      'encargo-nuevo': () => hojaEncargo(), 'encargo-ver': () => hojaEncargo(buscar('encargos', id)),
      'calc-tabla': () => calc.ultimo && hojaTabla(calc.ultimo.r, W.P()),
      'calc-guardar': guardarCalculo, 'calc-abrir': () => abrirCalculo(buscar('calculos', id)),
      'calc-real': () => calc.ultimo && W.hojaPrestamo('deuda', calc.ultimo.plan),
    };
    if (mapa[a]) mapa[a]();
  }
  function pendiente(tipo, id, fecha, ronda) {
    if (tipo === 'fijo') return hojaPagarFijo(buscar('fijos', id), fecha);
    if (tipo === 'nomina') return hojaCobroNomina(buscar('nominas', id), fecha);
    if (tipo === 'sam') return hojaRonda(buscar('sams', id), ronda);
  }
  function abrirSamDeCuenta(c) {
    const s = vivos('sams').find(x => x.cuentaId === c.id);
    if (s) return hojaSamDetalle(s);
    W.irTab('planes');
  }

  return { vPlanes, vCalculadora, alPintar, accion, pendiente, hojaTabla, abrirSamDeCuenta, vLogros, irA: s => { if (SUBS.includes(s)) sub = s; } };
};
