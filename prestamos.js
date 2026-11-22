// Calculadora de préstamos y ahorros (lógica pura, montos en centavos). Probada en tests/logica.test.js.
// Tipos de préstamo:
//   frances  cuota fija (bancos, cooperativas)            aleman  capital fijo, cuota que baja
//   flat     interés sobre el monto original cada cuota (prestamistas: «10 % mensual»)
//   interes  solo intereses cada cuota y el capital al final (réditos)
//   unico    todo (capital + interés) en un solo pago al final
(function (g) {
  'use strict';
  const POR_ANIO = { anual: 1, semestral: 2, trimestral: 4, mensual: 12, quincenal: 24, catorcenal: 26, semanal: 52, diaria: 365 };
  const TIPOS = ['frances', 'aleman', 'flat', 'interes', 'unico'];
  const FRECUENCIAS = ['mensual', 'quincenal', 'catorcenal', 'semanal', 'diaria'];

  // Tasa por cuota: la tasa dada en su período se pasa a anual nominal y luego a la frecuencia de pago.
  const tasaPorCuota = (tasa, periodoTasa, frecuencia) => (tasa / 100) * (POR_ANIO[periodoTasa] || 12) / (POR_ANIO[frecuencia] || 12);

  // Tasa por cuota que iguala lo recibido con lo pagado (bisección). Sirve para el costo real de cualquier préstamo.
  function tir(recibido, pagos) {
    const vp = r => pagos.reduce((s, p, k) => s + p / Math.pow(1 + r, k + 1), 0);
    if (recibido <= 0 || !pagos.length || vp(0) <= recibido) return 0;
    let lo = 0, hi = 1;
    while (vp(hi) > recibido && hi < 1e3) hi *= 2;
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (vp(mid) > recibido) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }

  // p = {monto, tasa (%), periodoTasa, plazo (n.º de cuotas), frecuencia, tipo, abonoExtra?, comision?, seguro?}
  function prestamo(p) {
    const monto = Math.max(0, Math.round(p.monto || 0)), n = Math.max(1, Math.min(3650, Math.round(p.plazo || 1)));
    const i = tasaPorCuota(Number(p.tasa) || 0, p.periodoTasa, p.frecuencia);
    const tipo = TIPOS.includes(p.tipo) ? p.tipo : 'frances';
    const extra = Math.max(0, Math.round(p.abonoExtra || 0)), seguro = Math.max(0, Math.round(p.seguro || 0));
    const filas = [];
    let saldo = monto;
    const cuotaFr = i ? (monto * i) / (1 - Math.pow(1 + i, -n)) : monto / n;
    for (let k = 1; k <= n && saldo > 0; k++) {
      let interes, capital;
      if (tipo === 'flat') { interes = Math.round(monto * i); capital = k === n ? saldo : Math.min(saldo, Math.round(monto / n)); }
      else if (tipo === 'unico') { interes = k === n ? Math.round(monto * i * n) : 0; capital = k === n ? saldo : 0; }
      else {
        interes = Math.round(saldo * i);
        if (tipo === 'frances') capital = k === n ? saldo : Math.min(saldo, Math.round(cuotaFr) - interes);
        else if (tipo === 'aleman') capital = k === n ? saldo : Math.min(saldo, Math.round(monto / n));
        else capital = k === n ? saldo : 0; // interes
      }
      const ab = tipo === 'unico' ? 0 : Math.min(extra, saldo - capital);
      saldo -= capital + ab;
      filas.push({ n: k, cuota: interes + capital + seguro, interes, capital, extra: ab, seguro, saldo });
    }
    const pagos = filas.map(f => f.cuota + f.extra);
    const totalPagado = pagos.reduce((s, x) => s + x, 0);
    const totalInteres = filas.reduce((s, f) => s + f.interes, 0);
    const comision = Math.max(0, Math.round(p.comision || 0));
    const r = tir(monto - comision, pagos);
    const anual = POR_ANIO[p.frecuencia] || 12;
    // Sin abono extra, para mostrar cuánto se ahorra con él.
    const sinExtra = extra ? prestamo({ ...p, abonoExtra: 0 }) : null;
    return {
      tipo, filas, cuota: filas.length ? filas[0].cuota : 0, totalPagado, totalInteres, comision, cuotas: filas.length,
      costoTotal: totalPagado + comision - monto,
      tasaPorCuota: i, tasaEfectivaAnual: Math.pow(1 + r, anual) - 1,
      ahorroConExtra: sinExtra ? sinExtra.totalInteres - totalInteres : 0, cuotasMenos: sinExtra ? sinExtra.cuotas - filas.length : 0,
    };
  }

  // ¿Cuánto me prestan si puedo pagar «cuota» por cuota? (cuota fija).
  function cuantoMePrestan({ cuota, tasa, periodoTasa, plazo, frecuencia }) {
    const n = Math.max(1, Math.round(plazo || 1)), i = tasaPorCuota(Number(tasa) || 0, periodoTasa, frecuencia);
    return Math.floor(i ? (cuota * (1 - Math.pow(1 + i, -n))) / i : cuota * n);
  }

  // Ahorro o certificado: {inicial, aporte (por mes), tasa (% anual), meses, retencion (% sobre intereses, ej. 10)}.
  function ahorro(p) {
    const meses = Math.max(1, Math.min(600, Math.round(p.meses || 1)));
    const i = (Number(p.tasa) || 0) / 100 / 12, ret = (Number(p.retencion) || 0) / 100;
    let saldo = Math.max(0, Math.round(p.inicial || 0)), aportado = saldo, intereses = 0, retenido = 0;
    const filas = [];
    for (let k = 1; k <= meses; k++) {
      const bruto = Math.round(saldo * i), r = Math.round(bruto * ret);
      saldo += bruto - r + Math.round(p.aporte || 0);
      aportado += Math.round(p.aporte || 0); intereses += bruto - r; retenido += r;
      filas.push({ n: k, interes: bruto - r, saldo });
    }
    return { filas, final: saldo, aportado, intereses, retenido };
  }

  const api = { POR_ANIO, TIPOS, FRECUENCIAS, tasaPorCuota, tir, prestamo, cuantoMePrestan, ahorro };
  g.Prestamos = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
