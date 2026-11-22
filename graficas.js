// Gráficas en SVG puro (sin librerías). Cada función devuelve un texto SVG.
window.Graficas = (function () {
  'use strict';
  const r2 = n => Math.round(n * 100) / 100;

  // Anillo de progreso (pct 0..1+). El color sale de la clase CSS.
  function anillo(pct, { tam = 120, grosor = 12, clase = '', centro = '' } = {}) {
    const r = (tam - grosor) / 2, c = 2 * Math.PI * r, v = Math.min(1, Math.max(0, pct));
    return `<svg class="anillo ${clase}" viewBox="0 0 ${tam} ${tam}" width="${tam}" height="${tam}" role="img" aria-label="${Math.round(pct * 100)} %">
      <circle cx="${tam / 2}" cy="${tam / 2}" r="${r}" class="pista" stroke-width="${grosor}" fill="none"/>
      <circle cx="${tam / 2}" cy="${tam / 2}" r="${r}" class="valor" stroke-width="${grosor}" fill="none" stroke-linecap="round"
        stroke-dasharray="${r2(c * v)} ${r2(c)}" transform="rotate(-90 ${tam / 2} ${tam / 2})"/>
      ${centro ? `<foreignObject x="0" y="0" width="${tam}" height="${tam}"><div class="anillo-centro">${centro}</div></foreignObject>` : ''}
    </svg>`;
  }

  // Dona de segmentos [{valor, color, id?}]. Con sel (id), ese segmento se resalta y los demás se apagan; con accion, cada segmento se puede tocar.
  function dona(segs, { tam = 168, grosor = 22, centro = '', sel = '', accion = '' } = {}) {
    const total = segs.reduce((s, x) => s + x.valor, 0) || 1;
    const r = (tam - grosor) / 2, c = 2 * Math.PI * r, hueco = segs.length > 1 ? 3 : 0;
    let acum = 0;
    const arcos = segs.map(s => {
      const largo = Math.max(0, (s.valor / total) * c - hueco);
      const extra = accion && s.id ? ` class="seg${sel === s.id ? ' sel' : sel ? ' apagado' : ''}" data-accion="${accion}" data-cat="${s.id}"` : '';
      const arco = `<circle${extra} cx="${tam / 2}" cy="${tam / 2}" r="${r}" fill="none" stroke="${s.color}" stroke-width="${grosor}"
        stroke-dasharray="${r2(largo)} ${r2(c)}" stroke-dashoffset="${r2(-acum)}" transform="rotate(-90 ${tam / 2} ${tam / 2})" stroke-linecap="butt"/>`;
      acum += (s.valor / total) * c;
      return arco;
    }).join('');
    return `<svg class="dona" viewBox="0 0 ${tam} ${tam}" width="${tam}" height="${tam}" role="img">
      <circle cx="${tam / 2}" cy="${tam / 2}" r="${r}" class="pista" stroke-width="${grosor}" fill="none"/>${arcos}
      ${centro ? `<foreignObject x="0" y="0" width="${tam}" height="${tam}"><div class="anillo-centro">${centro}</div></foreignObject>` : ''}</svg>`;
  }

  // Barras dobles por mes: [{etiqueta, a, b}] (a = ingresos, b = gastos).
  function barras(filas, { alto = 150 } = {}) {
    const max = Math.max(1, ...filas.flatMap(f => [f.a, f.b]));
    const ancho = 320, paso = ancho / filas.length, bw = Math.min(14, paso / 3.2), base = alto - 20;
    const cols = filas.map((f, i) => {
      const x = i * paso + paso / 2;
      const ha = (f.a / max) * (base - 6), hb = (f.b / max) * (base - 6);
      return `<rect class="barra-a" x="${r2(x - bw - 2)}" y="${r2(base - ha)}" width="${r2(bw)}" height="${r2(Math.max(ha, 1.5))}" rx="${r2(bw / 2.5)}"/>
        <rect class="barra-b" x="${r2(x + 2)}" y="${r2(base - hb)}" width="${r2(bw)}" height="${r2(Math.max(hb, 1.5))}" rx="${r2(bw / 2.5)}"/>
        <text x="${r2(x)}" y="${alto - 4}" text-anchor="middle" class="eje">${f.etiqueta}</text>`;
    }).join('');
    return `<svg class="barras" viewBox="0 0 ${ancho} ${alto}" width="100%" preserveAspectRatio="xMidYMid meet" role="img">${cols}</svg>`;
  }

  // Línea con área degradada: valores numéricos; marca el último punto.
  function linea(valores, { alto = 140, id = 'g', ini = 'Hoy', fin = '12 meses' } = {}) {
    const lo = Math.min(...valores), hi = Math.max(...valores), holgura = Math.max((hi - lo) * 0.25, Math.abs(hi) * 0.02, 1);
    const ancho = 320, min = lo - holgura, max = hi + holgura * 0.4, pad = 10;
    const x = i => pad + (i * (ancho - 2 * pad)) / Math.max(1, valores.length - 1);
    const y = v => pad + (1 - (v - min) / (max - min || 1)) * (alto - 2 * pad - 14);
    const pts = valores.map((v, i) => `${r2(x(i))},${r2(y(v))}`);
    const ultimo = pts[pts.length - 1].split(',');
    return `<svg class="linea" viewBox="0 0 ${ancho} ${alto}" width="100%" role="img">
      <defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" class="area-a"/><stop offset="1" class="area-b"/></linearGradient></defs>
      ${min < 0 && max > 0 ? `<line x1="${pad}" x2="${ancho - pad}" y1="${r2(y(0))}" y2="${r2(y(0))}" class="cero"/>` : ''}
      <path d="M${pts[0]} L${pts.join(' L')} L${r2(x(valores.length - 1))},${alto - 14} L${pad},${alto - 14} Z" fill="url(#${id})"/>
      <polyline points="${pts.join(' ')}" class="trazo" fill="none"/>
      <circle cx="${ultimo[0]}" cy="${ultimo[1]}" r="5" class="punto"/>
      <text x="${pad}" y="${alto - 2}" class="eje">${ini}</text><text x="${ancho - pad}" y="${alto - 2}" class="eje" text-anchor="end">${fin}</text>
    </svg>`;
  }

  return { anillo, dona, barras, linea };
})();
