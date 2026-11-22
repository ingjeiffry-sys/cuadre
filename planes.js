// Planes (lógica pura): nómina, pagos fijos, tarjetas, cuotas de préstamos, metas, SAM, encargos y avisos.
// Montos en centavos. Probada en tests/logica.test.js.
(function (g) {
  'use strict';
  const L = g.Logica || (typeof require !== 'undefined' ? require('./logica.js') : null);
  const PR = g.Prestamos || (typeof require !== 'undefined' ? require('./prestamos.js') : null);
  const vivos = a => (a || []).filter(x => !x.borrado);

  // ---------- nómina (República Dominicana: TSS + ISR; otros países: solo descuentos propios) ----------
  // Escala anual del ISR de asalariados (DGII). Cálculo aproximado: siempre revisar el volante de pago.
  const ISR_DO = [[41622000, 0, 0], [62432900, 0.15, 0], [86712300, 0.20, 3121600], [Infinity, 0.25, 7977600]];
  const TSS_DO = { afp: 0.0287, sfs: 0.0304 };
  function isrAnualDO(base) {
    let desde = 0;
    for (const [hasta, tasa, fijo] of ISR_DO) {
      if (base <= hasta) return tasa ? Math.round(fijo + (base - desde) * tasa) : 0;
      desde = hasta;
    }
    return 0;
  }
  // n = {bruto (por pago), rec, tss, isr, descuentos:[{nombre, pct?, monto?}]}
  function nominaNeto(n, pais) {
    const bruto = Math.max(0, n.bruto | 0), filas = [];
    let neto = bruto;
    const quitar = (nombre, v) => { v = Math.max(0, Math.round(v)); if (v) { filas.push({ nombre, monto: v }); neto -= v; } };
    if (pais === 'DO' && n.tss) { quitar('AFP', bruto * TSS_DO.afp); quitar('SFS', bruto * TSS_DO.sfs); }
    if (pais === 'DO' && n.isr) {
      const veces = L.vecesAlMes(n.rec);
      const base = (bruto - (n.tss ? Math.round(bruto * TSS_DO.afp) + Math.round(bruto * TSS_DO.sfs) : 0)) * veces * 12;
      quitar('ISR', isrAnualDO(base) / 12 / veces);
    }
    for (const x of n.descuentos || []) quitar(x.nombre || '—', x.pct ? bruto * x.pct / 100 : x.monto || 0);
    return { bruto, neto, filas };
  }

  // ¿Ya se registró esta fecha? Un movimiento con ref {tipo, id, periodo} la marca como hecha.
  const hechos = (d, tipo, id) => new Set(d.movimientos.filter(m => !m.borrado && m.ref && m.ref.tipo === tipo && m.ref.id === id).map(m => m.ref.periodo));

  // Pendientes: lo vencido sin registrar y lo que vence en los próximos días. dias < 0 = atrasado.
  function pendientes(d, fechaHoy, adelante) {
    const h = fechaHoy || L.hoy(), out = [];
    const desdeDe = x => (x.creado || h).slice(0, 10) > L.sumarDias(h, -62) ? (x.creado || h).slice(0, 10) : L.sumarDias(h, -62);
    for (const f of vivos(d.fijos)) {
      if (f.pausado) continue;
      const ya = hechos(d, 'fijo', f.id), omit = new Set(f.omitidos || []);
      for (const fecha of L.fechasEntre(f.rec, desdeDe(f), L.sumarDias(h, adelante == null ? (f.avisarDias || 7) : adelante))) {
        if (!ya.has(fecha) && !omit.has(fecha)) out.push({ tipo: 'fijo', id: f.id, fecha, dias: L.diasEntre(h, fecha), monto: f.monto, nombre: f.nombre, icono: f.icono });
      }
    }
    for (const n of vivos(d.nominas)) {
      const ya = hechos(d, 'nomina', n.id), omit = new Set(n.omitidos || []);
      for (const fecha of L.fechasEntre(n.rec, desdeDe(n), h)) {
        if (!ya.has(fecha) && !omit.has(fecha)) out.push({ tipo: 'nomina', id: n.id, fecha, dias: L.diasEntre(h, fecha), monto: nominaNeto(n, d.ajustes.pais).neto, nombre: n.nombre, icono: '💼' });
      }
    }
    // Tarjetas: pago antes del día límite si hay deuda.
    for (const c of d.cuentas.filter(c => !c.borrado && c.tipo === 'credito' && c.diaPago)) {
      const deuda = -L.saldoCuenta(d, c.id);
      if (deuda <= 0) continue;
      const fecha = L.proximaFecha({ frec: 'mensual', dia: c.diaPago }, h);
      if (L.diasEntre(h, fecha) <= 7) out.push({ tipo: 'tarjeta', id: c.id, fecha, dias: L.diasEntre(h, fecha), monto: deuda, nombre: c.parDe ? `${c.nombre} (${L.MONEDAS[c.moneda]})` : c.nombre, icono: '💳' });
    }
    // Cuotas de préstamos (los que debo y los que me deben).
    for (const c of d.cuentas.filter(c => !c.borrado && !c.castigado && (c.tipo === 'deuda' || c.tipo === 'porCobrar') && c.plan)) {
      const s = siguienteCuota(d, c);
      if (s && s.fecha && L.diasEntre(h, s.fecha) <= 7) out.push({ tipo: c.tipo === 'deuda' ? 'cuota' : 'cobro', id: c.id, fecha: s.fecha, dias: L.diasEntre(h, s.fecha), monto: s.fila.cuota, nombre: c.nombre, icono: c.tipo === 'deuda' ? '🏦' : '🤝' });
    }
    // SAM: mi cuota de cada ronda.
    for (const s of vivos(d.sams)) {
      const yo = (s.miembros || []).filter(m => m.yo).length;
      if (!yo) continue;
      const ya = hechos(d, 'sam', s.id);
      samFechas(s).forEach((fecha, r) => {
        if (L.diasEntre(h, fecha) <= 3 && L.diasEntre(h, fecha) >= -31 && !ya.has('p' + (r + 1)))
          out.push({ tipo: 'sam', id: s.id, ronda: r + 1, fecha, dias: L.diasEntre(h, fecha), monto: s.cuota * yo, nombre: s.nombre, icono: '🎲' });
      });
    }
    return out.sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
  }

  // ---------- préstamos reales (cuentas «deuda» y «porCobrar» con plan) ----------
  function tablaDe(c) { return c.plan ? PR.prestamo(c.plan) : null; }
  function siguienteCuota(d, c) {
    const t = tablaDe(c);
    if (!t) return null;
    const pagadas = (c.plan.pagadas | 0) + hechos(d, 'cuota', c.id).size; // pagadas: cuotas de antes de anotarlo en Wallet
    const fila = t.filas[pagadas];
    if (!fila) return null;
    const fechas = c.plan.inicio ? L.fechasEntre(recDePlan(c.plan), L.sumarDias(c.plan.inicio, 1), L.sumarDias(c.plan.inicio, 4000)) : [];
    return { fila, numero: pagadas + 1, total: t.filas.length, fecha: fechas[pagadas] || null };
  }
  function recDePlan(p) {
    const dia = Number(p.inicio.slice(8, 10));
    if (p.frecuencia === 'mensual') return { frec: 'mensual', dia };
    if (p.frecuencia === 'quincenal') return { frec: 'quincenal', dias: dia > 15 ? [dia - 15, dia] : [dia, dia + 15] };
    return { frec: 'cada', cada: { semanal: 7, catorcenal: 14, diaria: 1 }[p.frecuencia] || 30, desde: p.inicio };
  }

  // ---------- tarjetas: diferencia cambiaria entre el día de la compra y el día del pago ----------
  // Compras en otra moneda aún sin pagar (sin tasaPago) en una tarjeta.
  const comprasSinPagar = (d, cuentaId) => d.movimientos.filter(m => !m.borrado && m.cuentaId === cuentaId && m.tipo === 'gasto' && m.monedaOriginal && !m.tasaPago);
  // Con la tasa del banco de hoy: cuánto cuesta ahora y la diferencia (+ pierdes, − ganas).
  function diferenciaCambiaria(compras, tasaPago) {
    let antes = 0, ahora = 0;
    for (const m of compras) { antes += m.monto; ahora += Math.round(m.montoOriginal * tasaPago); }
    return { antes, ahora, diferencia: ahora - antes };
  }

  // Tarjeta de doble moneda: gastos del balance en moneda extranjera con la tasa del día guardada (tasaDia), aún sin pagar.
  const comprasConTasaDia = (d, cuentaId) => d.movimientos.filter(m => !m.borrado && m.cuentaId === cuentaId && m.tipo === 'gasto' && m.tasaDia && !m.tasaPago);
  // Al pagar ese balance con moneda local a la tasa t: cuánto más (+) o menos (−) que el día de cada compra, en moneda local.
  function difTasaDia(compras, t, balanceEsExtranjero) {
    if (!balanceEsExtranjero) return { diferencia: 0 };
    return { diferencia: compras.reduce((s, m) => s + Math.round(m.monto * t) - Math.round(m.monto * m.tasaDia), 0) };
  }

  // ---------- metas de ahorro ----------
  // Reto 52 semanas: la semana n se aparta n × base (base = objetivo / 1378, la suma de 1 a 52).
  function reto52(m, actual, fechaHoy) {
    const semana = Math.min(52, Math.floor(L.diasEntre((m.creado || fechaHoy).slice(0, 10), fechaHoy) / 7) + 1), base = m.objetivo / 1378;
    const esperado = Math.round((base * semana * (semana + 1)) / 2);
    return { semana, toca: Math.round(base * semana), esperado, vaBien: actual >= esperado };
  }
  function meta(d, m, fechaHoy) {
    const h = fechaHoy || L.hoy();
    const c = d.cuentas.find(x => x.id === m.cuentaId && !x.borrado);
    const actual = c ? Math.max(0, L.saldoCuenta(d, c.id)) : 0;
    const falta = Math.max(0, m.objetivo - actual);
    let porMes = null, meses = null;
    if (m.fecha && m.fecha > h) {
      meses = Math.max(1, (Number(m.fecha.slice(0, 4)) - Number(h.slice(0, 4))) * 12 + Number(m.fecha.slice(5, 7)) - Number(h.slice(5, 7)));
      porMes = Math.ceil(falta / meses);
    }
    return { actual, falta, pct: m.objetivo ? Math.min(1, actual / m.objetivo) : 0, porMes, meses, lograda: falta === 0, oculta: !c };
  }

  // ---------- SAM ----------
  // s = {cuota, rec, inicio, miembros:[{id,nombre,yo}], modo:'manual'|'rifaInicio'|'rifaRonda', orden:[id|null], fijos:{pos:id}, pagos:{r:[ids]}, rifa:{aporte, ganadores:{r:id}}}
  const samFechas = s => {
    const n = (s.miembros || []).length;
    if (!n || !s.inicio) return [];
    const r = s.rec || { frec: 'mensual', dia: Number(s.inicio.slice(8, 10)) };
    return L.fechasEntre(r, s.inicio, L.sumarDias(s.inicio, 4000)).slice(0, n);
  };
  const pozo = s => s.cuota * (s.miembros || []).length;
  // Número al azar sin sesgo en [0, n).
  function azar(n, rnd) {
    if (rnd) return Math.floor(rnd() * n);
    const max = Math.floor(0x100000000 / n) * n, b = new Uint32Array(1);
    do { g.crypto.getRandomValues(b); } while (b[0] >= max);
    return b[0] % n;
  }
  // Pone los fijos (quien pidió cobrar primero, último o en un turno) y sortea el resto de los turnos libres.
  function samSortear(s, rnd) {
    const n = s.miembros.length, orden = Array(n).fill(null);
    const fijos = s.fijos || {};
    for (const [pos, id] of Object.entries(fijos)) {
      const i = pos === 'ultimo' ? n - 1 : Number(pos) - 1;
      if (i >= 0 && i < n && orden[i] === null && s.miembros.some(m => m.id === id)) orden[i] = id;
    }
    const usados = new Set(orden.filter(Boolean));
    const resto = s.miembros.map(m => m.id).filter(id => !usados.has(id));
    for (let i = resto.length - 1; i > 0; i--) { const j = azar(i + 1, rnd); [resto[i], resto[j]] = [resto[j], resto[i]]; }
    for (let i = 0; i < n; i++) if (orden[i] === null) orden[i] = resto.shift();
    return orden;
  }
  // Rifa por ronda: sortea quién cobra en la ronda r entre los que no tienen turno todavía (respeta los fijos).
  function samSortearRonda(s, r, rnd) {
    const n = s.miembros.length, orden = (s.orden && s.orden.length === n ? s.orden : Array(n).fill(null)).slice();
    const fijos = s.fijos || {};
    const posFija = Object.entries(fijos).map(([p, id]) => [p === 'ultimo' ? n - 1 : Number(p) - 1, id]);
    for (const [i, id] of posFija) if (orden[i] === null && i >= 0 && i < n) orden[i] = id;
    if (orden[r - 1]) return orden;
    const usados = new Set(orden.filter(Boolean));
    const libres = s.miembros.map(m => m.id).filter(id => !usados.has(id));
    if (libres.length) orden[r - 1] = libres[azar(libres.length, rnd)];
    return orden;
  }
  function samEstado(s, fechaHoy) {
    const h = fechaHoy || L.hoy(), fechas = samFechas(s), n = (s.miembros || []).length;
    const rondas = fechas.map((fecha, i) => {
      const pagaron = new Set((s.pagos || {})[i + 1] || []);
      return { r: i + 1, fecha, cobra: (s.orden || [])[i] || null, pagaron: pagaron.size, faltan: s.miembros.filter(m => !pagaron.has(m.id)).map(m => m.id), cobrada: !!(s.cobradas || {})[i + 1] };
    });
    const actual = rondas.find(x => !x.cobrada) || null;
    const yo = s.miembros.filter(m => m.yo).map(m => m.id);
    const misTurnos = rondas.filter(x => yo.includes(x.cobra));
    return { rondas, actual, n, pozo: pozo(s), misTurnos, terminado: rondas.length > 0 && rondas.every(x => x.cobrada), proxima: rondas.find(x => x.fecha >= h) || null };
  }

  // ---------- encargos (comprar algo para otra persona y ganar comisión) ----------
  // e = {articuloCosto, articuloPrecio (en monedaArticulo), tasaCosto, tasaCobro, libras, libraCosto, libraPrecio, otrosCosto, otrosPrecio}
  // Los montos de libras y otros van en la moneda principal. Devuelve todo en moneda principal.
  function encargo(e) {
    const tc = Number(e.tasaCosto) || 1, tv = Number(e.tasaCobro) || tc, lb = Number(e.libras) || 0;
    const r = Math.round;
    const costoArt = r((e.articuloCosto || 0) * tc), cobroArt = r((e.articuloPrecio || 0) * tv);
    const costoLb = r(lb * (e.libraCosto || 0)), cobroLb = r(lb * (e.libraPrecio || 0));
    const costo = costoArt + costoLb + (e.otrosCosto || 0), cobro = cobroArt + cobroLb + (e.otrosPrecio || 0);
    return {
      costo, cobro, ganancia: cobro - costo,
      enArticulo: r(((e.articuloPrecio || 0) - (e.articuloCosto || 0)) * tc),
      enTasa: r((e.articuloPrecio || 0) * (tv - tc)),
      enLibras: cobroLb - costoLb,
      enOtros: (e.otrosPrecio || 0) - (e.otrosCosto || 0),
    };
  }

  // ---------- avisos (notificaciones del teléfono) ----------
  // De 7 días antes hasta el día del pago, a la hora elegida. Nómina: el día de cobro (mañana y tarde).
  function avisos(d, ahoraMs, T) {
    const h = L.hoy(new Date(ahoraMs)), hora = d.ajustes.horaAviso == null ? 9 : d.ajustes.horaAviso, out = [];
    const a = (fecha, hh) => { const [y, m, dd] = fecha.split('-').map(Number); return new Date(y, m - 1, dd, hh, 0, 0).getTime(); };
    for (const p of pendientes(d, h, 31)) {
      if (p.tipo === 'nomina') continue;
      const desde = p.tipo === 'sam' ? 1 : p.tipo === 'fijo' ? Math.min(7, (vivos(d.fijos).find(f => f.id === p.id) || {}).avisarDias || 7) : 7;
      for (let k = desde; k >= 0; k--) {
        const t = a(L.sumarDias(p.fecha, -k), hora);
        if (t > ahoraMs) out.push({ at: t, titulo: T.avisoTitulo(p), cuerpo: T.avisoCuerpo(p, k) });
      }
    }
    for (const n of vivos(d.nominas)) {
      for (const fecha of L.fechasEntre(n.rec, h, L.sumarDias(h, 31))) {
        for (const hh of [hora, 18]) { const t = a(fecha, hh); if (t > ahoraMs) out.push({ at: t, titulo: T.avisoNominaTitulo, cuerpo: T.avisoNomina(n.nombre) }); }
      }
    }
    return out.sort((x, y) => x.at - y.at).slice(0, 60);
  }

  const api = { ISR_DO, TSS_DO, isrAnualDO, nominaNeto, pendientes, tablaDe, siguienteCuota, comprasSinPagar, diferenciaCambiaria, comprasConTasaDia, difTasaDia,
    meta, reto52, samFechas, pozo, samSortear, samSortearRonda, samEstado, encargo, avisos };
  g.Planes = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
