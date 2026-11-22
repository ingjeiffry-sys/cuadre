// Lee el texto de una factura (sacado con el lector de texto del teléfono, sin internet) y busca total, fecha, comercio, ITBIS, NCF y RNC.
// Solo sugiere: el usuario siempre revisa antes de guardar. Probada en tests/v6.test.js.
(function (g) {
  'use strict';
  // "1,234.56" | "1.234,56" | "RD$ 450" -> centavos. null si no parece un monto.
  function monto(txt) {
    let s = String(txt).replace(/[^\d.,]/g, '');
    if (!/\d/.test(s)) return null;
    const ultP = s.lastIndexOf('.'), ultC = s.lastIndexOf(',');
    if (ultC > ultP && s.length - ultC === 3) s = s.replace(/\./g, '').replace(',', '.'); // 1.234,56
    else s = s.replace(/,/g, '');
    const n = Number(s);
    return Number.isFinite(n) && n > 0 && n < 1e9 ? Math.round(n * 100) : null;
  }
  // Montos con decimales (o con símbolo de moneda) dentro de una línea; así no se confunden con teléfonos o el RNC.
  function montosDe(linea) {
    const out = [];
    const re = /(?:RD\$|US\$|\$)\s*\d[\d.,]*|\d{1,3}(?:[.,]\d{3})*[.,]\d{2}\b|\d+[.,]\d{2}\b/g;
    for (const m of linea.matchAll(re)) { const v = monto(m[0]); if (v !== null) out.push(v); }
    return out;
  }
  const NO_TOTAL = /sub\s*-?\s*total|itbis|i\.t\.b\.i\.s|iva|impuesto|descuento|propina|cambio|efectivo recibido|recibido|devuelta|ahorr/i;
  function fecha(texto) {
    const hoyA = new Date().getFullYear();
    const ok = (y, m, d) => (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 2000 && y <= hoyA + 1) ? `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null;
    let m = /\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/.exec(texto);
    if (m) { const r = ok(+m[1], +m[2], +m[3]); if (r) return r; }
    for (const x of texto.matchAll(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})\b/g)) {
      let a = +x[1], b = +x[2], y = +x[3];
      if (y < 100) y += 2000;
      const r = a > 12 ? ok(y, b, a) : b > 12 ? ok(y, a, b) : ok(y, b, a); // en RD se escribe día/mes
      if (r) return r;
    }
    return null;
  }
  // Errores típicos del lector en números: «1O0.00» -> «100.00», «5.345,0O» -> «5.345,00», «S» pegada a dígitos -> 5.
  const arreglarOcr = l => l.replace(/(?<=\d)[Oo](?=[\d.,])|(?<=[\d.,])[Oo](?=\d|\b)/g, '0').replace(/(?<=\d[.,]?)[Ss](?=\d)/g, '5');
  const ES_TOTAL = /\btotal\b|a pagar|importe|monto total|total pagado|total general/i;
  const PAGO = /efectivo|tarjeta|cr[eé]dito|d[eé]bito|recibido|cambio|devuelta|vuelto|transferencia/i;

  // El total se elige por puntos: está en una línea de «TOTAL» (+3), está debajo de una (+1, hasta 3 líneas, por las columnas),
  // se repite en la factura (+1 por vez: subtotal, total y pago suelen dar lo mismo) y es el monto mayor (+1).
  function elegirTotal(lineas) {
    const puntos = new Map(), suma = (v, p) => puntos.set(v, (puntos.get(v) || 0) + p);
    let maximo = 0;
    lineas.forEach((l, i) => {
      const ms = montosDe(l);
      ms.forEach(v => { suma(v, 1); if (v > maximo && !PAGO.test(l)) maximo = v; });
      if (!ES_TOTAL.test(l) || NO_TOTAL.test(l)) return;
      if (ms.length) suma(Math.max(...ms), 3); // en la misma línea: el mayor (si hay ITBIS y valor, el valor)
      else for (let k = 1; k <= 3 && lineas[i + k]; k++) montosDe(lineas[i + k]).forEach(v => suma(v, 1));
    });
    if (!puntos.size) return { total: null, confianza: 'baja' };
    if (maximo) suma(maximo, 1);
    const [total, p] = [...puntos.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0];
    return { total, confianza: p >= 4 ? 'alta' : p >= 2 ? 'media' : 'baja' };
  }

  function leer(texto) {
    const lineas = String(texto || '').split(/\r?\n/).map(l => arreglarOcr(l.trim())).filter(Boolean);
    const out = { total: null, fecha: fecha(lineas.join('\n')), comercio: null, itbis: null, ncf: null, rnc: null, confianza: 'baja' };
    Object.assign(out, elegirTotal(lineas));
    // ITBIS: una línea «ITBIS … monto»; si no, en la línea de TOTAL con dos montos, el menor (columna ITBIS | VALOR).
    const lItbis = lineas.find(l => /itbis|i\.t\.b\.i\.s|\biva\b/i.test(l) && montosDe(l).length);
    if (lItbis) { const ms = montosDe(lItbis); out.itbis = ms[ms.length - 1]; }
    else { const lt = lineas.find(l => ES_TOTAL.test(l) && !NO_TOTAL.test(l) && montosDe(l).length >= 2); if (lt) out.itbis = Math.min(...montosDe(lt)); }
    if (out.itbis && out.total && out.itbis >= out.total) out.itbis = null;
    // NCF: B o E + 2 dígitos + 8 a 10 dígitos; puede venir pegado a ceros de relleno (00000000B0200102818).
    const ncf = /([BE]\d{2})[-\s]?(\d{8,10})(?!\d)/.exec(lineas.join(' '));
    if (ncf) out.ncf = ncf[1] + ncf[2];
    else { // en papel térmico la «B» se lee a veces como 3 u 8 detrás de los ceros de relleno
      const m = /NCF[^\dA-Z]{0,4}0{3,}[38](\d{2})(\d{8})(?!\d)/i.exec(lineas.join(' '));
      if (m) out.ncf = 'B' + m[1] + m[2];
    }
    const rnc = /RNC[^\d]{0,6}([\d-]{9,14})/i.exec(lineas.join(' ')); // 1-01-23456-7, 101234567 o cédula de 11
    if (rnc) { const n = rnc[1].replace(/-/g, ''); if (n.length === 9 || n.length === 11) out.rnc = n; }
    // Comercio: la primera línea con letras que no sea un dato de la factura.
    const ignorar = /rnc|ncf|factura|fecha|tel|direcci|calle|av\.|www|@|caja|cajero|cliente|comprobante|valor fiscal|consumidor|^\d/i;
    const com = lineas.slice(0, 8).find(l => /[a-záéíóúñ]{3}/i.test(l) && !ignorar.test(l) && l.length <= 40);
    if (com) out.comercio = com.replace(/\s+/g, ' ').replace(/^[^\wÁÉÍÓÚÑáéíóúñ]+/, '').slice(0, 40);
    return out;
  }

  const api = { leer, monto, montosDe, fecha };
  g.Factura = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
