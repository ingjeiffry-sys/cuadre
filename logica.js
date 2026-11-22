// Lógica pura (sin pantalla): dinero, fechas, formato de datos, saldos y análisis. Probada en tests/logica.test.js.
(function (g) {
  'use strict';
  const VERSION = 3;
  const ZONA = 'America/Santo_Domingo';

  // Moneda -> símbolo. La moneda principal sale del país que elige el usuario.
  const MONEDAS = {
    DOP: 'RD$', USD: 'US$', EUR: '€', MXN: 'MX$', COP: 'COL$', PEN: 'S/', CLP: 'CLP$', ARS: 'AR$', VES: 'Bs.',
    GTQ: 'Q', HNL: 'L', NIO: 'C$', CRC: '₡', PAB: 'B/.', BOB: 'Bs', PYG: '₲', UYU: '$U', BRL: 'R$', HTG: 'G',
    CAD: 'CA$', GBP: '£', CUP: 'CUP$',
  };
  const PAISES = {
    DO: 'DOP', US: 'USD', PR: 'USD', MX: 'MXN', CO: 'COP', PE: 'PEN', CL: 'CLP', AR: 'ARS', VE: 'VES', GT: 'GTQ',
    HN: 'HNL', SV: 'USD', NI: 'NIO', CR: 'CRC', PA: 'USD', EC: 'USD', BO: 'BOB', PY: 'PYG', UY: 'UYU', BR: 'BRL',
    HT: 'HTG', CU: 'CUP', ES: 'EUR', CA: 'CAD', GB: 'GBP',
  };
  // credito y deuda llevan saldo negativo (lo que se debe); porCobrar y sam, positivo (lo que te deben o pusiste).
  const TIPOS_CUENTA = ['diaria', 'ahorro', 'inversion', 'credito', 'deuda', 'porCobrar', 'sam'];
  const CON_QUIEN = ['solo', 'pareja', 'amigos', 'familia', 'trabajo'];

  // padre: subcategoría. social: pregunta «¿con quién?». lugar: pide tienda o sitio. oculta: no sale en los chips.
  const C = (id, icono, tipo, color, extra) => ({ id, icono, tipo, color, ...(extra || {}) });
  const CATEGORIAS = [
    C('c-comida', '🍽️', 'gasto', '#FF9F0A', { social: true, lugar: true }),
    C('s-super', '🛒', 'gasto', '#FF9F0A', { padre: 'c-comida' }), C('s-restaurante', '🍝', 'gasto', '#FF9F0A', { padre: 'c-comida' }),
    C('s-rapida', '🍔', 'gasto', '#FF9F0A', { padre: 'c-comida' }), C('s-delivery', '🛵', 'gasto', '#FF9F0A', { padre: 'c-comida' }),
    C('s-cafe', '☕', 'gasto', '#FF9F0A', { padre: 'c-comida' }),
    C('c-transporte', '🚗', 'gasto', '#0A84FF', { social: true }),
    C('s-combustible', '⛽', 'gasto', '#0A84FF', { padre: 'c-transporte' }), C('s-taxi', '🚕', 'gasto', '#0A84FF', { padre: 'c-transporte' }),
    C('s-publico', '🚌', 'gasto', '#0A84FF', { padre: 'c-transporte' }), C('s-vehiculo', '🔧', 'gasto', '#0A84FF', { padre: 'c-transporte' }),
    C('s-parqueo', '🅿️', 'gasto', '#0A84FF', { padre: 'c-transporte' }),
    C('c-casa', '🏠', 'gasto', '#5E5CE6'),
    C('s-alquiler', '🔑', 'gasto', '#5E5CE6', { padre: 'c-casa' }), C('s-hogar', '🛋️', 'gasto', '#5E5CE6', { padre: 'c-casa' }),
    C('s-limpieza', '🧽', 'gasto', '#5E5CE6', { padre: 'c-casa' }), C('s-reparacion', '🔨', 'gasto', '#5E5CE6', { padre: 'c-casa' }),
    C('c-servicios', '💡', 'gasto', '#FFC300'),
    C('s-luz', '💡', 'gasto', '#FFC300', { padre: 'c-servicios' }), C('s-agua', '🚰', 'gasto', '#FFC300', { padre: 'c-servicios' }),
    C('s-internet', '🌐', 'gasto', '#FFC300', { padre: 'c-servicios' }), C('s-telefono', '📱', 'gasto', '#FFC300', { padre: 'c-servicios' }),
    C('s-streaming', '📺', 'gasto', '#FFC300', { padre: 'c-servicios' }), C('s-gas', '🔥', 'gasto', '#FFC300', { padre: 'c-servicios' }),
    C('c-internet', '📦', 'gasto', '#FF6B35', { lugar: true }),
    C('s-int-ropa', '👗', 'gasto', '#FF6B35', { padre: 'c-internet' }), C('s-int-tec', '💻', 'gasto', '#FF6B35', { padre: 'c-internet' }),
    C('s-int-hogar', '🏡', 'gasto', '#FF6B35', { padre: 'c-internet' }), C('s-int-belleza', '💄', 'gasto', '#FF6B35', { padre: 'c-internet' }),
    C('c-juegos', '🎮', 'gasto', '#7B61FF', { lugar: true, social: true }),
    C('s-tokens', '🪙', 'gasto', '#7B61FF', { padre: 'c-juegos' }), C('s-suscrip', '🔁', 'gasto', '#7B61FF', { padre: 'c-juegos' }),
    C('s-compra-juego', '🕹️', 'gasto', '#7B61FF', { padre: 'c-juegos' }),
    C('c-ocio', '🎉', 'gasto', '#BF5AF2', { social: true, lugar: true }),
    C('s-salidas', '🍻', 'gasto', '#BF5AF2', { padre: 'c-ocio' }), C('s-cine', '🎬', 'gasto', '#BF5AF2', { padre: 'c-ocio' }),
    C('s-viajes', '✈️', 'gasto', '#BF5AF2', { padre: 'c-ocio' }), C('s-eventos', '🎟️', 'gasto', '#BF5AF2', { padre: 'c-ocio' }),
    C('c-ropa', '👕', 'gasto', '#FF7EB3', { lugar: true }),
    C('s-ropa', '👚', 'gasto', '#FF7EB3', { padre: 'c-ropa' }), C('s-calzado', '👟', 'gasto', '#FF7EB3', { padre: 'c-ropa' }),
    C('s-belleza', '💇', 'gasto', '#FF7EB3', { padre: 'c-ropa' }),
    C('c-salud', '💊', 'gasto', '#FF375F'),
    C('s-farmacia', '💊', 'gasto', '#FF375F', { padre: 'c-salud' }), C('s-medico', '🩺', 'gasto', '#FF375F', { padre: 'c-salud' }),
    C('s-seguro', '🛡️', 'gasto', '#FF375F', { padre: 'c-salud' }), C('s-gimnasio', '🏋️', 'gasto', '#FF375F', { padre: 'c-salud' }),
    C('c-educacion', '📚', 'gasto', '#64D2FF'),
    C('s-colegio', '🏫', 'gasto', '#64D2FF', { padre: 'c-educacion' }), C('s-libros', '📖', 'gasto', '#64D2FF', { padre: 'c-educacion' }),
    C('s-cursos', '🎓', 'gasto', '#64D2FF', { padre: 'c-educacion' }),
    C('c-familia', '👨‍👩‍👧', 'gasto', '#34C7A0'),
    C('s-hijos', '🧸', 'gasto', '#34C7A0', { padre: 'c-familia' }), C('s-ayuda-fam', '🤝', 'gasto', '#34C7A0', { padre: 'c-familia' }),
    C('c-mascotas', '🐾', 'gasto', '#A2845E'),
    C('c-regalos', '🎁', 'gasto', '#E85D75', { social: true }),
    C('s-donacion', '🙏', 'gasto', '#E85D75', { padre: 'c-regalos' }),
    C('c-finanzas', '🏦', 'gasto', '#636E8A'),
    C('c-impuestos', '🏛️', 'gasto', '#636E8A', { padre: 'c-finanzas' }), C('c-intereses', '📉', 'gasto', '#636E8A', { padre: 'c-finanzas' }),
    C('c-cambio', '💱', 'gasto', '#636E8A', { padre: 'c-finanzas' }), C('c-incobrable', '🚫', 'gasto', '#636E8A', { padre: 'c-finanzas' }),
    C('c-otros-g', '🧾', 'gasto', '#8E8E93'),
    C('c-salario', '💼', 'ingreso', '#30D158'),
    C('c-extra', '⭐', 'ingreso', '#20C997'),
    C('s-horas', '⏱️', 'ingreso', '#20C997', { padre: 'c-extra' }), C('s-bono', '🎉', 'ingreso', '#20C997', { padre: 'c-extra' }),
    C('s-propina', '🪙', 'ingreso', '#20C997', { padre: 'c-extra' }), C('s-freelance', '🧑‍💻', 'ingreso', '#20C997', { padre: 'c-extra' }),
    C('s-doble', '🎄', 'ingreso', '#20C997', { padre: 'c-extra' }),
    C('c-ventas', '🛍️', 'ingreso', '#66D4CF'),
    C('c-comision', '🤝', 'ingreso', '#2DB87E'),
    C('c-intereses-i', '📈', 'ingreso', '#3CB371'),
    C('c-sam', '🎲', 'ingreso', '#9B7BFF'),
    C('c-recuperado', '♻️', 'ingreso', '#4CAF50'),
    C('c-cambio-i', '💱', 'ingreso', '#4CAF50'),
    C('c-otros-i', '➕', 'ingreso', '#A2845E'),
    // Dinero de encargos (pagar y cobrar lo de otros): mueve saldos pero no cuenta como gasto ni ingreso.
    C('c-encargo', '📮', 'neutral', '#8E8E93', { oculta: true }),
  ];
  const NEUTRAS = new Set(['c-encargo']);

  // "1,250.5" -> 125050 centavos. Devuelve null si no es un monto válido.
  function parseMonto(txt, permitirNegativo) {
    let s = String(txt == null ? '' : txt).replace(/[\s,]/g, '').replace(/^[A-Z]{0,3}\$/i, '');
    let neg = false;
    if (s.startsWith('-')) { if (!permitirNegativo) return null; neg = true; s = s.slice(1); }
    const m = /^(\d{1,12})(?:\.(\d{0,2}))?$/.exec(s) || /^()\.(\d{1,2})$/.exec(s);
    if (!m) return null;
    const c = Number(m[1] || 0) * 100 + Number((m[2] || '').padEnd(2, '0'));
    return neg ? -c : c;
  }
  // Tasa o porcentaje con decimales ("60.25", "0.15"). null si no es número positivo.
  function parseNum(txt) {
    const s = String(txt == null ? '' : txt).replace(/[\s,]/g, '');
    if (!/^\d{0,9}(\.\d{0,6})?$/.test(s) || !/\d/.test(s)) return null;
    const n = Number(s);
    return n > 0 ? n : null;
  }

  const nf = new Intl.NumberFormat('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const nf0 = new Intl.NumberFormat('es-DO', { maximumFractionDigits: 0 });
  function formato(centavos, moneda, corto) {
    const neg = centavos < 0, v = Math.abs(centavos) / 100;
    const n = corto ? (v >= 1e6 ? nf.format(v / 1e6).replace(/\.?0+$/, '') + 'M' : v >= 1e4 ? nf0.format(v / 1e3) + 'k' : nf0.format(v)) : nf.format(v);
    return (neg ? '−' : '') + (MONEDAS[moneda] || moneda + ' ') + n;
  }

  // ---------- fechas (texto AAAA-MM-DD, sin horas) ----------
  function hoy(fecha) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(fecha || new Date());
  }
  const diasDelMes = mes => new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 0).getDate();
  function mesAnterior(mes, n) {
    const d = new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)) - 1 - (n == null ? 1 : n), 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }
  const aUTC = f => Date.UTC(Number(f.slice(0, 4)), Number(f.slice(5, 7)) - 1, Number(f.slice(8, 10)));
  const deUTC = t => new Date(t).toISOString().slice(0, 10);
  const sumarDias = (f, n) => deUTC(aUTC(f) + n * 864e5);
  const diasEntre = (a, b) => Math.round((aUTC(b) - aUTC(a)) / 864e5);
  const diaSemana = f => new Date(aUTC(f)).getUTCDay(); // 0 = domingo
  // Día del mes ajustado: el 30 o 31 en febrero cae el último día.
  const fechaDia = (mes, dia) => mes + '-' + String(Math.min(dia, diasDelMes(mes))).padStart(2, '0');
  function sumarMeses(mes, n) {
    const d = new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)) - 1 + n, 1);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
  }

  // Repetición: {frec:'mensual',dia} | {frec:'quincenal',dias:[15,30]} | {frec:'semanal',diaSemana} |
  // {frec:'cada',cada:14,desde} | {frec:'anual',mes,dia} | {frec:'unica',fecha}. Devuelve fechas entre desde y hasta (incluidas).
  function fechasEntre(rec, desde, hasta) {
    const out = [];
    if (!rec || desde > hasta) return out;
    const f = rec.frec;
    if (f === 'unica') return rec.fecha >= desde && rec.fecha <= hasta ? [rec.fecha] : [];
    if (f === 'semanal' || f === 'cada') {
      const paso = f === 'semanal' ? 7 : Math.max(1, rec.cada | 0);
      let x;
      if (f === 'semanal') x = sumarDias(desde, ((rec.diaSemana | 0) - diaSemana(desde) + 7) % 7);
      else { const base = rec.desde || desde; const k = Math.ceil(diasEntre(base, desde) / paso); x = sumarDias(base, Math.max(0, k) * paso); }
      for (; x <= hasta; x = sumarDias(x, paso)) if (x >= desde) out.push(x);
      return out;
    }
    const dias = f === 'quincenal' ? (rec.dias && rec.dias.length ? rec.dias : [15, 30]) : [rec.dia || 1];
    for (let mes = desde.slice(0, 7); mes <= hasta.slice(0, 7); mes = sumarMeses(mes, 1)) {
      if (f === 'anual' && Number(mes.slice(5, 7)) !== Number(rec.mes || 1)) continue;
      for (const d of [...new Set(dias.map(x => fechaDia(mes, x)))].sort()) if (d >= desde && d <= hasta) out.push(d);
    }
    return out;
  }
  // Primera fecha en o después de "desde" (hasta 2 años).
  const proximaFecha = (rec, desde) => fechasEntre(rec, desde, sumarDias(desde, 731))[0] || null;
  // Cuántas veces al mes (para pasar sueldos a mensual).
  const vecesAlMes = rec => ({ mensual: 1, quincenal: 2, semanal: 52 / 12, cada: 365 / 12 / Math.max(1, (rec && rec.cada) || 14), anual: 1 / 12, unica: 1 })[rec && rec.frec] || 1;

  function uuid() {
    if (g.crypto && g.crypto.randomUUID) return g.crypto.randomUUID();
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }

  const COLECCIONES = ['fijos', 'nominas', 'metas', 'sams', 'encargos', 'calculos'];
  function vacio() {
    const d = {
      version: VERSION,
      ajustes: { monedaPrincipal: 'DOP', pais: 'DO', tasas: {}, ultimoRespaldo: null, presupuestos: {}, ocultarMontos: false,
        candado: null, bloqueoApp: false, huella: false, avisos: true, horaAviso: 9 },
      cuentas: [], movimientos: [],
      categorias: CATEGORIAS.map(c => ({ ...c })),
      boveda: null,
    };
    for (const k of COLECCIONES) d[k] = [];
    return d;
  }

  // Lleva datos viejos al formato vigente. Cada cambio de formato agrega un paso aquí. Nunca toca montos.
  function migrar(d) {
    if (!d || typeof d !== 'object') return vacio();
    if (!d.version) d.version = 1;
    if (d.version === 1) {
      for (const c of d.cuentas || []) { c.tipo = c.tipo || 'diaria'; c.privada = false; }
      d.ajustes = { presupuestos: {}, ...(d.ajustes || {}) };
      for (const c of d.categorias || []) if (!c.color) c.color = (CATEGORIAS.find(x => x.id === c.id) || {}).color || '#8E8E93';
      d.boveda = null;
      d.version = 2;
    }
    if (d.version === 2) {
      // v3: categorías nuevas (las que ya tenía el usuario quedan igual), país, colecciones nuevas, impuesto 0.
      const ya = new Set((d.categorias || []).map(c => c.id));
      d.categorias = (d.categorias || []).concat(CATEGORIAS.filter(c => !ya.has(c.id)).map(c => ({ ...c })));
      for (const c of d.categorias) { const b = CATEGORIAS.find(x => x.id === c.id); if (b) Object.assign(c, { padre: b.padre, social: b.social, lugar: b.lugar }); }
      d.ajustes = { pais: d.ajustes && d.ajustes.monedaPrincipal === 'USD' ? 'US' : 'DO', avisos: true, horaAviso: 9, ...(d.ajustes || {}) };
      for (const k of COLECCIONES) d[k] = d[k] || [];
      d.version = 3;
    }
    return d;
  }

  const esId = v => typeof v === 'string' && v.length > 0;
  const esFecha = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
  const ent = (v, min) => (Number.isInteger(v) && v >= (min == null ? 0 : min) ? v : null);
  const txt = (v, n) => String(v == null ? '' : v).slice(0, n || 60);

  function normCuenta(c, ahora) {
    if (!c || !esId(c.id)) return null;
    const out = {
      id: c.id, nombre: txt(c.nombre, 40) || '—',
      moneda: MONEDAS[c.moneda] ? c.moneda : 'DOP', icono: c.icono || '💳',
      tipo: TIPOS_CUENTA.includes(c.tipo) ? c.tipo : 'diaria', privada: !!c.privada,
      creado: c.creado || ahora, editado: c.editado || c.creado || ahora, borrado: !!c.borrado,
    };
    const pct = Number(c.impuestoPct);
    if (pct > 0 && pct < 100) out.impuestoPct = pct;
    if (/^\d{4}$/.test(c.ultimos4 || '')) out.ultimos4 = c.ultimos4; // de la tarjeta solo se guardan los 4 últimos
    if (/^(0[1-9]|1[0-2])\/\d{2}$/.test(c.vence || '')) out.vence = c.vence;
    if (ent(c.limite) !== null) out.limite = c.limite;
    for (const k of ['diaCorte', 'diaPago']) if (ent(c[k], 1) !== null && c[k] <= 31) out[k] = c[k];
    if (c.banco) out.banco = txt(c.banco, 30);
    if (c.persona) out.persona = txt(c.persona, 40);
    if (esId(c.parDe)) out.parDe = c.parDe;
    // Tarjeta: última tasa del banco usada al pagar ({USD: 61}) y última cuenta de origen por moneda ({USD: id}).
    for (const k of ['ultimaTasa', 'ultimoOrigen']) if (c[k] && typeof c[k] === 'object') out[k] = c[k]; // tarjeta de doble moneda: balance en la otra moneda
    if (c.plan && typeof c.plan === 'object') out.plan = c.plan;
    if (esFecha(c.castigado)) out.castigado = c.castigado;
    return out;
  }
  function normMov(m, ahora) {
    if (!m || !esId(m.id) || !['gasto', 'ingreso', 'saldo', 'transferencia'].includes(m.tipo)) return null;
    if (!Number.isInteger(m.monto) || !esFecha(m.fecha) || !esId(m.cuentaId)) return null;
    const out = {
      id: m.id, tipo: m.tipo, cuentaId: m.cuentaId, monto: m.monto, fecha: m.fecha,
      categoriaId: m.categoriaId || null, nota: txt(m.nota, 80),
      creado: m.creado || ahora, editado: m.editado || m.creado || ahora, borrado: !!m.borrado,
    };
    if (m.tipo === 'transferencia') {
      if (!esId(m.cuentaDestinoId) || m.monto <= 0) return null;
      out.cuentaDestinoId = m.cuentaDestinoId;
      out.montoDestino = Number.isInteger(m.montoDestino) && m.montoDestino > 0 ? m.montoDestino : m.monto;
    }
    if ((m.tipo === 'gasto' || m.tipo === 'transferencia') && ent(m.impuesto, 1) !== null) out.impuesto = m.impuesto;
    if (Number(m.tasaDia) > 0) { out.tasaDia = Number(m.tasaDia); if (Number(m.tasaPago) > 0) out.tasaPago = Number(m.tasaPago); }
    if (CON_QUIEN.includes(m.conQuien)) out.conQuien = m.conQuien;
    if (m.lugar) out.lugar = txt(m.lugar, 40);
    if (MONEDAS[m.monedaOriginal] && ent(m.montoOriginal, 1) !== null && Number(m.tasaCompra) > 0) {
      out.monedaOriginal = m.monedaOriginal; out.montoOriginal = m.montoOriginal; out.tasaCompra = Number(m.tasaCompra);
      if (Number(m.tasaPago) > 0) out.tasaPago = Number(m.tasaPago);
    }
    if (esId(m.grupo)) out.grupo = m.grupo;
    if (esId(m.foto)) out.foto = m.foto; // id de la foto de la factura (tienda «fotos»)
    if (m.ref && esId(m.ref.tipo) && esId(m.ref.id)) out.ref = { tipo: m.ref.tipo, id: m.ref.id, periodo: txt(m.ref.periodo, 20) };
    return out;
  }
  function normLista(arr, ahora) {
    return (Array.isArray(arr) ? arr : []).filter(x => x && esId(x.id))
      .map(x => ({ ...x, creado: x.creado || ahora, editado: x.editado || x.creado || ahora, borrado: !!x.borrado }));
  }

  // Limpia: completa campos que faltan y descarta registros rotos. Nunca recalcula saldos.
  function normalizar(d) {
    const base = vacio();
    const ahora = new Date().toISOString();
    const out = {
      version: VERSION,
      ajustes: { ...base.ajustes, ...(d.ajustes || {}) },
      cuentas: (Array.isArray(d.cuentas) ? d.cuentas : []).map(c => normCuenta(c, ahora)).filter(Boolean),
      movimientos: (Array.isArray(d.movimientos) ? d.movimientos : []).map(m => normMov(m, ahora)).filter(Boolean),
      categorias: [],
      boveda: d.boveda && typeof d.boveda === 'object' && d.boveda.datos ? d.boveda : null,
    };
    for (const k of COLECCIONES) out[k] = normLista(d[k], ahora);
    if (!MONEDAS[out.ajustes.monedaPrincipal]) out.ajustes.monedaPrincipal = 'DOP';
    if (!PAISES[out.ajustes.pais]) out.ajustes.pais = 'DO';
    out.ajustes.tasas = { ...(out.ajustes.tasas || {}) };
    const pres = {};
    for (const [k, v] of Object.entries(out.ajustes.presupuestos || {})) if (Number.isInteger(v) && v > 0) pres[k] = v;
    out.ajustes.presupuestos = pres;
    const cats = Array.isArray(d.categorias) && d.categorias.length ? d.categorias : base.categorias;
    for (const c of cats) if (c && esId(c.id)) out.categorias.push({ color: '#8E8E93', ...c, borrado: !!c.borrado });
    return out;
  }

  const orden = (a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : a.creado < b.creado ? -1 : a.creado > b.creado ? 1 : 0);

  // Saldo = último «saldo» fijado + entradas − salidas posteriores (por fecha y luego creado). El impuesto sale de la cuenta de origen.
  const saldoCuenta = (d, cuentaId) => saldosCorridos(d, cuentaId).final;
  // Como un estado de cuenta: el saldo después de cada movimiento (id -> saldo) y el saldo final.
  function saldosCorridos(d, cuentaId) {
    let s = 0;
    const despues = new Map();
    const movs = d.movimientos.filter(x => !x.borrado && (x.cuentaId === cuentaId || x.cuentaDestinoId === cuentaId)).sort(orden);
    for (const m of movs) {
      if (m.tipo === 'transferencia') s += m.cuentaId === cuentaId ? -m.monto - (m.impuesto || 0) : m.montoDestino;
      else if (m.tipo === 'saldo') s = m.monto;
      else if (m.tipo === 'ingreso') s += m.monto;
      else s -= m.monto + (m.impuesto || 0);
      despues.set(m.id, s);
    }
    return { final: s, despues };
  }

  // Pasa a la moneda principal. tasas[M] = cuánto de la principal vale 1 M. null si falta la tasa.
  function aPrincipal(d, centavos, moneda) {
    const p = d.ajustes.monedaPrincipal;
    if (moneda === p) return centavos;
    const t = Number(d.ajustes.tasas[moneda]);
    return t > 0 ? Math.round(centavos * t) : null;
  }
  // Convierte entre dos monedas cualesquiera usando las tasas guardadas. null si falta alguna.
  function convertir(d, centavos, de, a) {
    if (de === a) return centavos;
    const p = aPrincipal(d, centavos, de);
    if (p === null) return null;
    if (a === d.ajustes.monedaPrincipal) return p;
    const t = Number(d.ajustes.tasas[a]);
    return t > 0 ? Math.round(p / t) : null;
  }
  // Al cambiar de moneda principal, las tasas se recalculan con la que había (si existía).
  function cambiarPrincipal(d, nueva) {
    const vieja = d.ajustes.monedaPrincipal;
    if (nueva === vieja) return;
    const r = Number(d.ajustes.tasas[nueva]); // vieja por 1 nueva
    const t = {};
    if (r > 0) {
      for (const [m, v] of Object.entries(d.ajustes.tasas)) if (m !== nueva && Number(v) > 0) t[m] = Math.round((v / r) * 1e6) / 1e6;
      t[vieja] = Math.round((1 / r) * 1e6) / 1e6;
    }
    d.ajustes.tasas = t;
    d.ajustes.monedaPrincipal = nueva;
  }

  const catDe = (d, id) => d.categorias.find(c => c.id === id);
  const padreDe = (d, id) => { const c = catDe(d, id); return c && c.padre ? c.padre : id; };

  // Gastos e ingresos de un mes en moneda principal. Transferencias, saldos y encargos no cuentan; sus impuestos sí son gasto.
  const flujoMes = (d, mes) => flujoRango(d, mes + '-01', mes + '-31');
  // Gastos e ingresos entre dos fechas (incluidas), en moneda principal.
  function flujoRango(d, desde, hasta) {
    const monedaDe = Object.fromEntries(d.cuentas.map(c => [c.id, c.moneda]));
    let gastos = 0, ingresos = 0, faltaTasa = false;
    const porCat = {}, porSub = {}, porQuien = {}, porCatIng = {};
    const suma = (o, k, v) => { o[k] = (o[k] || 0) + v; };
    for (const m of d.movimientos) {
      if (m.borrado || m.fecha < desde || m.fecha > hasta || m.tipo === 'saldo') continue;
      const mon = monedaDe[m.cuentaId] || 'DOP';
      if (m.impuesto) {
        const pi = aPrincipal(d, m.impuesto, mon);
        if (pi === null) faltaTasa = true;
        else { gastos += pi; suma(porCat, 'c-finanzas', pi); suma(porSub, 'c-impuestos', pi); }
      }
      if (m.tipo === 'transferencia' || NEUTRAS.has(m.categoriaId)) continue;
      const p = aPrincipal(d, m.monto, mon);
      if (p === null) { faltaTasa = true; continue; }
      if (m.tipo === 'gasto') {
        const id = m.categoriaId || 'c-otros-g';
        gastos += p; suma(porCat, padreDe(d, id), p); suma(porSub, id, p);
        if (m.conQuien) suma(porQuien, m.conQuien, p);
      } else { ingresos += p; suma(porCatIng, padreDe(d, m.categoriaId || 'c-otros-i'), p); }
    }
    return { gastos, ingresos, porCat, porSub, porQuien, porCatIng, faltaTasa };
  }

  function resumen(d, fechaHoy) {
    const mes = (fechaHoy || hoy()).slice(0, 7);
    const porMoneda = {}, porTipo = Object.fromEntries(TIPOS_CUENTA.map(t => [t, 0]));
    let total = 0, faltaTasa = false;
    for (const c of d.cuentas.filter(x => !x.borrado)) {
      const s = saldoCuenta(d, c.id);
      porMoneda[c.moneda] = (porMoneda[c.moneda] || 0) + s;
      const p = aPrincipal(d, s, c.moneda);
      if (p === null) faltaTasa = true; else { total += p; porTipo[c.tipo] += p; }
    }
    const f = flujoMes(d, mes);
    return { total, porMoneda, porTipo, gastos: f.gastos, ingresos: f.ingresos, faltaTasa: faltaTasa || f.faltaTasa, mes };
  }

  // Gastos del mes por categoría principal, de mayor a menor.
  function porCategoria(d, mes) {
    return Object.entries(flujoMes(d, mes).porCat).map(([id, total]) => ({ id, total })).sort((a, b) => b.total - a.total);
  }

  // Últimos n meses (el actual incluido), del más viejo al más nuevo.
  function historial(d, n, fechaHoy) {
    const mes = (fechaHoy || hoy()).slice(0, 7), out = [];
    for (let i = n - 1; i >= 0; i--) { const m = mesAnterior(mes, i); const f = flujoMes(d, m); out.push({ mes: m, gastos: f.gastos, ingresos: f.ingresos }); }
    return out;
  }

  // Ritmo de gasto del mes y a dónde llega si sigue igual.
  function ritmoMes(d, fechaHoy) {
    const h = fechaHoy || hoy(), mes = h.slice(0, 7);
    const dias = diasDelMes(mes), pasados = Number(h.slice(8, 10));
    const f = flujoMes(d, mes);
    const diario = Math.round(f.gastos / pasados);
    return { gastos: f.gastos, ingresos: f.ingresos, diario, proyectado: f.gastos + diario * (dias - pasados), dias, pasados };
  }

  // Promedio mensual de los últimos meses completos con datos (máx. 3). Si no hay, usa el mes en curso proyectado.
  function promedios(d, fechaHoy) {
    const h = fechaHoy || hoy();
    const prev = historial(d, 4, h).slice(0, 3).filter(x => x.gastos || x.ingresos);
    if (prev.length) {
      const g = Math.round(prev.reduce((s, x) => s + x.gastos, 0) / prev.length);
      const i = Math.round(prev.reduce((s, x) => s + x.ingresos, 0) / prev.length);
      return { gastos: g, ingresos: i, flujo: i - g, meses: prev.length };
    }
    const r = ritmoMes(d, h);
    return { gastos: r.proyectado, ingresos: r.ingresos, flujo: r.ingresos - r.proyectado, meses: 0 };
  }

  // Patrimonio proyectado: hoy + (flujo promedio + extra) por mes.
  function proyeccion(total, flujoMensual, extra, meses) {
    const out = [];
    for (let i = 0; i <= meses; i++) out.push(total + (flujoMensual + (extra || 0)) * i);
    return out;
  }

  function presupuesto(d, mes) {
    const pres = d.ajustes.presupuestos || {};
    const gastado = flujoMes(d, mes).porCat;
    const filas = Object.entries(pres).map(([id, limite]) => ({ id, limite, gastado: gastado[id] || 0 }))
      .sort((a, b) => b.gastado / b.limite - a.gastado / a.limite);
    const limite = filas.reduce((s, x) => s + x.limite, 0);
    const usado = filas.reduce((s, x) => s + x.gastado, 0);
    return { filas, limite, usado, pct: limite ? usado / limite : 0 };
  }
  const nivel = pct => (pct >= 1 ? 'rojo' : pct >= 0.8 ? 'amarillo' : 'verde');

  // Salud financiera 0–100: ahorro (40), fondo de emergencia (40), presupuesto (20).
  function salud(d, fechaHoy) {
    const h = fechaHoy || hoy();
    const p = promedios(d, h);
    const r = resumen(d, h);
    const tasaAhorro = p.ingresos > 0 ? (p.ingresos - p.gastos) / p.ingresos : 0;
    const colchon = r.porTipo.ahorro + r.porTipo.diaria;
    const mesesEmergencia = p.gastos > 0 ? Math.max(0, colchon) / p.gastos : 0;
    const pr = presupuesto(d, h.slice(0, 7));
    const ptsAhorro = Math.round(40 * Math.min(1, Math.max(0, tasaAhorro) / 0.2));
    const ptsEmerg = Math.round(40 * Math.min(1, mesesEmergencia / 6));
    const ptsPres = pr.limite ? Math.round(20 * Math.max(0, Math.min(1, 2 - pr.pct * (r.mes === h.slice(0, 7) ? diasDelMes(r.mes) / Number(h.slice(8, 10)) : 1)))) : 10;
    return { puntos: ptsAhorro + ptsEmerg + ptsPres, tasaAhorro, mesesEmergencia, ptsAhorro, ptsEmerg, ptsPres };
  }

  // Días seguidos (hasta hoy o ayer) con al menos un movimiento anotado.
  function racha(d, fechaHoy) {
    const dias = new Set(d.movimientos.filter(m => !m.borrado && m.tipo !== 'saldo').map(m => m.creado.slice(0, 10)));
    let f = new Date((fechaHoy || hoy()) + 'T12:00:00Z');
    const clave = x => x.toISOString().slice(0, 10);
    if (!dias.has(clave(f))) f = new Date(f - 864e5);
    let n = 0;
    while (dias.has(clave(f))) { n++; f = new Date(f - 864e5); }
    return n;
  }

  // Bóveda: separa lo privado (cuentas privadas y movimientos que solo tocan cuentas privadas) de lo visible.
  function dividir(d) {
    const priv = new Set(d.cuentas.filter(c => c.privada).map(c => c.id));
    const soloPriv = m => priv.has(m.cuentaId) && (m.tipo !== 'transferencia' || priv.has(m.cuentaDestinoId));
    return {
      publico: { ...d, cuentas: d.cuentas.filter(c => !priv.has(c.id)), movimientos: d.movimientos.filter(m => !soloPriv(m)) },
      privado: { cuentas: d.cuentas.filter(c => priv.has(c.id)), movimientos: d.movimientos.filter(soloPriv) },
    };
  }
  function unir(publico, privado) {
    if (!privado) return publico;
    const ids = new Set(publico.movimientos.map(m => m.id));
    return { ...publico, cuentas: publico.cuentas.concat(privado.cuentas), movimientos: publico.movimientos.concat(privado.movimientos.filter(m => !ids.has(m.id))) };
  }

  // Primeros pasos tipo juego: cada misión se cumple sola al usar la app.
  // v4: 10 misiones que recorren lo principal de la app.
  const MISIONES = ['cuenta', 'gasto', 'ingreso', 'plan', 'fijo', 'meta', 'analisis', 'seguridad', 'tema', 'respaldo'];
  const MISIONES_VERSION = 2;
  function misiones(d) {
    const vivos = d.movimientos.filter(m => !m.borrado), viva = k => (d[k] || []).some(x => !x.borrado);
    const hecho = {
      cuenta: d.cuentas.some(c => !c.borrado) || !!d.boveda,
      gasto: vivos.some(m => m.tipo === 'gasto'),
      ingreso: vivos.some(m => m.tipo === 'ingreso') || viva('nominas'),
      plan: !!d.ajustes.planAplicado || Object.keys(d.ajustes.presupuestos || {}).length > 0,
      fijo: viva('fijos'),
      meta: viva('metas'),
      analisis: !!d.ajustes.vioAnalisis,
      seguridad: !!d.boveda || !!d.ajustes.bloqueoApp,
      tema: !!d.ajustes.temaElegido,
      respaldo: !!d.ajustes.ultimoRespaldo,
    };
    const lista = MISIONES.map(id => ({ id, hecho: !!hecho[id] }));
    const n = lista.filter(x => x.hecho).length;
    return { lista, hechas: n, total: lista.length, xp: n * 100, nivel: n >= 10 ? 3 : n >= 7 ? 2 : n >= 3 ? 1 : 0 };
  }

  function necesitaRespaldo(d, fechaHoy) {
    if (!d.movimientos.some(m => !m.borrado)) return false;
    const u = d.ajustes.ultimoRespaldo;
    if (!u) return true;
    return (Date.parse(fechaHoy || hoy()) - Date.parse(u.slice(0, 10))) / 864e5 > 7;
  }

  // Lee un respaldo (texto JSON). Lanza Error con mensaje sencillo si no sirve.
  function leerRespaldo(texto) {
    let d;
    try { d = JSON.parse(texto); } catch { throw new Error('El archivo no es un respaldo válido.'); }
    if (!d || typeof d !== 'object' || !Array.isArray(d.cuentas) || !Array.isArray(d.movimientos)) {
      throw new Error('El archivo no es un respaldo de esta app.');
    }
    if (d.version > VERSION) throw new Error('El respaldo es de una versión más nueva. Actualiza la app.');
    return normalizar(migrar(d));
  }

  const api = { VERSION, MISIONES_VERSION, MONEDAS, PAISES, CATEGORIAS, NEUTRAS, TIPOS_CUENTA, CON_QUIEN, COLECCIONES, parseMonto, parseNum, formato,
    hoy, diasDelMes, mesAnterior, sumarDias, diasEntre, sumarMeses, fechasEntre, proximaFecha, vecesAlMes, uuid, vacio,
    migrar, normalizar, orden, saldoCuenta, saldosCorridos, flujoRango, aPrincipal, convertir, cambiarPrincipal, padreDe, flujoMes, resumen, porCategoria,
    historial, ritmoMes, promedios, proyeccion, presupuesto, nivel, salud, racha, dividir, unir, misiones, necesitaRespaldo, leerRespaldo };
  g.Logica = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
