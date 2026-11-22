// Plan del sueldo, consejos por país y ciudad, proyección de ahorro y logros (lógica pura). Probada en tests/v4.test.js.
// Base: reglas de presupuesto de uso común en educación financiera (orientación general, no asesoría):
//   50/30/20 (necesidades/deseos/ahorro), 60/20/20 (ciudad cara), 70/20/10 (ingreso justo), 50/20/30 (salir de deudas / ahorro fuerte).
//   Vivienda ≈ 30 % del ingreso como guía; fondo de emergencia de 3 a 6 meses de gastos básicos.
(function (g) {
  'use strict';
  const L = g.Logica || (typeof require !== 'undefined' ? require('./logica.js') : null);
  const PL = g.Planes || (typeof require !== 'undefined' ? require('./planes.js') : null);
  const PR = g.Prestamos || (typeof require !== 'undefined' ? require('./prestamos.js') : null);

  const REGLAS = { '50/30/20': [50, 30, 20], '60/20/20': [60, 20, 20], '70/20/10': [70, 20, 10], '50/20/30': [50, 20, 30] };
  // Reparto dentro de cada grupo (se mezcla con lo que la persona gasta de verdad).
  const NECESIDADES = { 'c-casa': 0.36, 'c-comida': 0.24, 'c-servicios': 0.12, 'c-transporte': 0.12, 'c-salud': 0.06, 'c-educacion': 0.05, 'c-familia': 0.05 };
  const DESEOS = { 'c-ocio': 0.30, 'c-ropa': 0.20, 'c-internet': 0.20, 'c-juegos': 0.10, 'c-regalos': 0.10, 'c-mascotas': 0.10 };

  // Costo de vida aproximado por ciudad (alto, medio, bajo). El usuario lo puede cambiar.
  const CIUDADES = {
    DO: { 'Distrito Nacional': 'alto', 'Santo Domingo Este': 'medio', 'Santo Domingo Norte': 'medio', 'Santo Domingo Oeste': 'medio', 'Punta Cana / Bávaro': 'alto',
      'Santiago': 'medio', 'La Romana': 'medio', 'Puerto Plata': 'medio', 'San Pedro de Macorís': 'medio', 'Higüey': 'medio', 'La Vega': 'medio',
      'San Francisco de Macorís': 'medio', 'Moca': 'bajo', 'Bonao': 'bajo', 'Baní': 'bajo', 'San Cristóbal': 'medio', 'Barahona': 'bajo', 'Samaná / Las Terrenas': 'alto' },
    US: { 'Nueva York': 'alto', 'Miami': 'alto', 'Boston': 'alto', 'Los Ángeles': 'alto', 'Orlando': 'medio', 'Houston': 'medio', 'Filadelfia': 'medio' },
    PR: { 'San Juan': 'alto', 'Bayamón': 'medio', 'Ponce': 'bajo', 'Mayagüez': 'bajo' },
    MX: { 'Ciudad de México': 'alto', 'Monterrey': 'alto', 'Guadalajara': 'medio', 'Cancún': 'alto', 'Puebla': 'medio', 'Mérida': 'medio' },
    CO: { 'Bogotá': 'alto', 'Medellín': 'medio', 'Cali': 'medio', 'Barranquilla': 'medio', 'Cartagena': 'alto' },
    ES: { 'Madrid': 'alto', 'Barcelona': 'alto', 'Valencia': 'medio', 'Sevilla': 'medio', 'Málaga': 'medio' },
  };
  const VIVIENDA = { alto: 35, medio: 30, bajo: 25 }; // % máximo sugerido para vivienda

  const sumaVals = o => Object.values(o).reduce((s, v) => s + v, 0);

  // Ingreso mensual: el que escribió el usuario, si no la nómina (neto al mes), si no el promedio de ingresos.
  function ingresoMensual(d, fechaHoy) {
    if (d.ajustes.ingresoPlan > 0) return { monto: d.ajustes.ingresoPlan, origen: 'manual' };
    const ns = (d.nominas || []).filter(n => !n.borrado);
    if (ns.length) return { monto: Math.round(ns.reduce((s, n) => s + PL.nominaNeto(n, d.ajustes.pais).neto * L.vecesAlMes(n.rec), 0)), origen: 'nomina' };
    return { monto: L.promedios(d, fechaHoy).ingresos, origen: 'promedio' };
  }
  // Gasto promedio por categoría principal: últimos 3 meses completos con datos; si no hay, el mes en curso.
  function gastoPromedio(d, fechaHoy) {
    const h = fechaHoy || L.hoy(), mes = h.slice(0, 7), out = {};
    const meses = [1, 2, 3].map(i => L.mesAnterior(mes, i)).map(m => L.flujoMes(d, m)).filter(f => f.gastos > 0);
    const base = meses.length ? meses : [L.flujoMes(d, mes)];
    for (const f of base) for (const [k, v] of Object.entries(f.porCat)) out[k] = (out[k] || 0) + v / base.length;
    for (const k of Object.keys(out)) out[k] = Math.round(out[k]);
    return out;
  }
  const deudaCara = d => d.cuentas.some(c => !c.borrado && (c.tipo === 'credito' || c.tipo === 'deuda') && L.saldoCuenta(d, c.id) < 0);

  function costoVida(d) {
    if (d.ajustes.costoVida) return d.ajustes.costoVida;
    const c = (CIUDADES[d.ajustes.pais] || {})[d.ajustes.ciudad];
    return c || 'medio';
  }
  function recomendarRegla(d, ingreso, gastos) {
    const necesidades = Object.keys(NECESIDADES).reduce((s, k) => s + (gastos[k] || 0), 0);
    if (ingreso > 0 && necesidades / ingreso > 0.65) return '70/20/10';
    if (deudaCara(d)) return '50/20/30';
    if (costoVida(d) === 'alto') return '60/20/20';
    return '50/30/20';
  }
  // Reparte el monto de un grupo entre sus categorías: mitad pesos base, mitad lo que la persona gasta en realidad.
  function repartir(monto, pesos, gastos) {
    const real = Object.keys(pesos).reduce((s, k) => s + (gastos[k] || 0), 0);
    const w = {};
    for (const k of Object.keys(pesos)) w[k] = real > 0 ? 0.5 * pesos[k] + 0.5 * ((gastos[k] || 0) / real) : pesos[k];
    const tot = sumaVals(w), out = {};
    for (const k of Object.keys(w)) out[k] = Math.round((monto * w[k]) / tot);
    return out;
  }

  // El plan completo del mes.
  function plan(d, fechaHoy) {
    const h = fechaHoy || L.hoy(), ing = ingresoMensual(d, h), gastos = gastoPromedio(d, h);
    const sugerida = recomendarRegla(d, ing.monto, gastos);
    const regla = REGLAS[d.ajustes.regla] ? d.ajustes.regla : sugerida;
    const [n, w, s] = REGLAS[regla], I = ing.monto;
    const grupos = { necesidades: Math.round((I * n) / 100), deseos: Math.round((I * w) / 100), ahorro: Math.round((I * s) / 100) };
    // Categorías propias del usuario (con grupo) también reciben su parte.
    const propias = gr => Object.fromEntries(d.categorias.filter(c => !c.borrado && !c.padre && c.tipo === 'gasto' && c.grupo === gr && !NECESIDADES[c.id] && !DESEOS[c.id]).map(c => [c.id, 0.05]));
    const cats = { ...repartir(grupos.necesidades, { ...NECESIDADES, ...propias('necesidades') }, gastos), ...repartir(grupos.deseos, { ...DESEOS, ...propias('deseos') }, gastos) };
    // Tope de vivienda: lo que sobra pasa al resto de necesidades.
    const tope = Math.round((I * VIVIENDA[costoVida(d)]) / 100);
    if (cats['c-casa'] > tope) {
      const sobra = cats['c-casa'] - tope; cats['c-casa'] = tope;
      const otras = Object.keys(NECESIDADES).filter(k => k !== 'c-casa'), base = otras.reduce((t, k) => t + cats[k], 0) || 1;
      for (const k of otras) cats[k] += Math.round((sobra * cats[k]) / base);
    }
    const filas = Object.entries(cats).map(([id, sugerido]) => {
      const real = gastos[id] || 0;
      return { id, grupo: grupoDe(d, id) || 'deseos', sugerido, real, estado: !sugerido ? 'ok' : real > sugerido * 1.1 ? 'pasado' : real > sugerido * 0.9 ? 'justo' : 'ok' };
    });
    // Ahorro: primero el fondo de emergencia, después deudas caras, después metas e inversión.
    const fondo = fondoEmergencia(d, h, grupos.necesidades);
    const reparto = fondo.falta > 0 ? (deudaCara(d) ? { fondo: 0.5, deudas: 0.3, metas: 0.2 } : { fondo: 0.6, deudas: 0, metas: 0.4 })
      : (deudaCara(d) ? { fondo: 0, deudas: 0.6, metas: 0.4 } : { fondo: 0, deudas: 0, metas: 1 });
    const ahorro = Object.fromEntries(Object.entries(reparto).map(([k, v]) => [k, Math.round(grupos.ahorro * v)]));
    fondo.mesesParaLlegar = fondo.falta > 0 && ahorro.fondo > 0 ? Math.ceil(fondo.falta / ahorro.fondo) : 0;
    return { ingreso: ing, regla, sugerida, porcentajes: { necesidades: n, deseos: w, ahorro: s }, grupos, filas, ahorro, fondo, costo: costoVida(d), topeVivienda: tope };
  }

  // Fondo de emergencia: 6 meses de gastos básicos (3 si tiene nómina fija registrada). Cuenta ahorro + uso diario.
  function fondoEmergencia(d, fechaHoy, basicosSugeridos) {
    const r = L.resumen(d, fechaHoy || L.hoy());
    const gastos = gastoPromedio(d, fechaHoy);
    const basicosReales = Object.keys(NECESIDADES).reduce((s, k) => s + (gastos[k] || 0), 0);
    const basicos = Math.max(basicosReales, basicosSugeridos || 0);
    const meses = (d.nominas || []).some(n => !n.borrado) ? 3 : 6;
    const meta = basicos * meses, tienes = Math.max(0, r.porTipo.ahorro + r.porTipo.diaria);
    return { meses, meta, tienes, falta: Math.max(0, meta - tienes), pct: meta ? Math.min(1, tienes / meta) : 0, basicos };
  }

  // Si ahorras «aporte» al mes (con tasa anual opcional), cuánto tendrás en 1, 3 y 5 años.
  function proyeccionAhorro(inicial, aporte, tasaAnual) {
    const r = PR.ahorro({ inicial, aporte, tasa: tasaAnual || 0, meses: 60 });
    const en = m => r.filas[m - 1].saldo;
    return { anio1: en(12), anio3: en(36), anio5: en(60), serie: [inicial].concat(r.filas.map(f => f.saldo)) };
  }

  // ---------- logros (se celebran una vez) ----------
  const LOGROS = ['primer-ahorro', 'fondo-1', 'fondo-3', 'fondo-6', 'ahorro-10', 'ahorro-20', 'mes-presupuesto', 'racha-7', 'racha-30',
    'meta-lograda', 'deuda-saldada', 'sam-cobrado', 'comision', 'plan-aplicado'];
  function logros(d, fechaHoy) {
    const h = fechaHoy || L.hoy(), mesPas = L.mesAnterior(h.slice(0, 7));
    const s = L.salud(d, h), fp = L.flujoMes(d, mesPas), pr = L.presupuesto(d, mesPas), racha = L.racha(d, h);
    const tasaPas = fp.ingresos > 0 ? (fp.ingresos - fp.gastos) / fp.ingresos : 0;
    const vivos = d.movimientos.filter(m => !m.borrado);
    const hecho = {
      'primer-ahorro': d.cuentas.some(c => !c.borrado && (c.tipo === 'ahorro' || c.tipo === 'inversion') && L.saldoCuenta(d, c.id) > 0),
      'fondo-1': s.mesesEmergencia >= 1, 'fondo-3': s.mesesEmergencia >= 3, 'fondo-6': s.mesesEmergencia >= 6,
      'ahorro-10': tasaPas >= 0.1, 'ahorro-20': tasaPas >= 0.2,
      'mes-presupuesto': pr.limite > 0 && fp.gastos > 0 && pr.usado <= pr.limite,
      'racha-7': racha >= 7, 'racha-30': racha >= 30,
      'meta-lograda': (d.metas || []).some(m => !m.borrado && PL.meta(d, m, h).lograda),
      'deuda-saldada': d.cuentas.some(c => !c.borrado && c.tipo === 'deuda' && L.saldoCuenta(d, c.id) === 0 && vivos.some(m => m.cuentaDestinoId === c.id)),
      'sam-cobrado': vivos.some(m => m.ref && m.ref.tipo === 'sam' && m.ref.periodo.startsWith('c')),
      'comision': vivos.some(m => m.categoriaId === 'c-comision'),
      'plan-aplicado': !!d.ajustes.planAplicado,
    };
    const lista = LOGROS.map(id => ({ id, hecho: !!hecho[id] }));
    return { lista, hechos: lista.filter(x => x.hecho).length, total: lista.length };
  }

  // Grupo de una categoría (necesidades o deseos): las propias del usuario traen «grupo»; las de fábrica, por su lista.
  function grupoDe(d, catId) {
    const padre = L.padreDe(d, catId), c = d.categorias.find(x => x.id === padre) || {};
    return c.grupo || (NECESIDADES[padre] ? 'necesidades' : DESEOS[padre] ? 'deseos' : null);
  }

  // ---------- salud por período (7, 15, 30, 90, 180 o 365 días) con semáforo y consejos ----------
  // Puntos (0–100): ahorro del período (40), presupuesto prorrateado (30) y tendencia contra el período anterior (30).
  const PERIODOS = [7, 15, 30, 90, 180, 365];
  const lim01 = x => Math.max(0, Math.min(1, x));
  function saludPeriodo(d, dias, fechaHoy) {
    const h = fechaHoy || L.hoy(), desde = L.sumarDias(h, -(dias - 1));
    const prevHasta = L.sumarDias(desde, -1), prevDesde = L.sumarDias(prevHasta, -(dias - 1));
    const f = L.flujoRango(d, desde, h), fp = L.flujoRango(d, prevDesde, prevHasta);
    const ing = f.ingresos, gas = f.gastos, tasa = ing > 0 ? (ing - gas) / ing : gas > 0 ? -1 : 0;
    const pres = d.ajustes.presupuestos || {};
    let lim = 0, usado = 0;
    const pasadas = [];
    for (const [k, v] of Object.entries(pres)) {
      const l = Math.round((v * dias) / 30.4), u = f.porCat[k] || 0;
      lim += l; usado += u;
      if (u > l) pasadas.push({ id: k, exceso: u - l });
    }
    const gustos = Object.entries(f.porCat).filter(([k]) => grupoDe(d, k) === 'deseos').reduce((s, [, v]) => s + v, 0);
    const cambio = fp.gastos > 0 ? gas / fp.gastos - 1 : null;
    const sinDatos = !ing && !gas;
    const ptsAhorro = Math.round(40 * lim01(tasa / 0.2));
    const ptsPres = lim ? Math.round(30 * lim01(2 - usado / lim)) : 15;
    const ptsTend = cambio === null ? 15 : Math.round(30 * lim01(1 - cambio / 0.3));
    const puntos = sinDatos ? null : ptsAhorro + ptsPres + ptsTend;
    const nivel = puntos === null ? 'gris' : puntos >= 70 ? 'verde' : puntos >= 40 ? 'amarillo' : 'rojo';
    // Lo que más subió contra el período anterior.
    let subio = null;
    for (const [k, v] of Object.entries(f.porCat)) { const dlt = v - (fp.porCat[k] || 0); if (dlt > 0 && (!subio || dlt > subio.delta)) subio = { id: k, delta: dlt }; }
    const top = Object.entries(f.porCat).sort((a, b) => b[1] - a[1])[0];
    const consejos = [];
    const c = (tipo, clave, datos) => consejos.push({ tipo, clave, datos: datos || {} });
    if (!sinDatos) {
      if (!ing) c('ojo', 'sinIngresos');
      else if (tasa < 0) c('mal', 'gastasMas', { monto: gas - ing });
      else if (tasa < 0.1) c('ojo', 'ahorroBajo', { pct: Math.round(tasa * 100) });
      else if (tasa >= 0.2) c('bien', 'ahorroAlto', { pct: Math.round(tasa * 100) });
      else c('bien', 'ahorroMedio', { pct: Math.round(tasa * 100) });
      pasadas.sort((a, b) => b.exceso - a.exceso).slice(0, 2).forEach(p => c('mal', 'presupuestoPasado', p));
      if (cambio !== null && cambio > 0.15 && subio) c('ojo', 'subioGasto', { pct: Math.round(cambio * 100), id: subio.id, monto: subio.delta });
      if (cambio !== null && cambio < -0.1) c('bien', 'bajoGasto', { pct: Math.round(-cambio * 100) });
      if (ing > 0 && gustos / ing > 0.3) c('ojo', 'muchosGustos', { pct: Math.round((gustos / ing) * 100) });
      if (top) c('info', 'top', { id: top[0], monto: top[1], pct: Math.round((top[1] / gas) * 100) });
    }
    // Serie de los últimos 6 períodos del mismo largo (el más viejo primero).
    const serie = [];
    for (let i = 5; i >= 0; i--) {
      const hs = L.sumarDias(h, -dias * i), ds = L.sumarDias(hs, -(dias - 1)), fx = L.flujoRango(d, ds, hs);
      serie.push({ desde: ds, hasta: hs, ingresos: fx.ingresos, gastos: fx.gastos });
    }
    return { dias, desde, hasta: h, ingresos: ing, gastos: gas, ahorro: ing - gas, tasa, gastoDiario: Math.round(gas / dias), cambio,
      limite: lim, usado, gustos, puntos, nivel, partes: { ahorro: ptsAhorro, presupuesto: ptsPres, tendencia: ptsTend }, consejos, serie };
  }

  const api = { grupoDe, PERIODOS, saludPeriodo, REGLAS, NECESIDADES, DESEOS, CIUDADES, VIVIENDA, ingresoMensual, gastoPromedio, costoVida, recomendarRegla, plan, fondoEmergencia, proyeccionAhorro, LOGROS, logros };
  g.Consejos = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
