/* Carrossel TV (id carrossel_tv) · versão pública curta do ProjectHub de demonstração.
   Só a tela Carrosséis é navegável, com dados de exemplo já prontos e uma TV simulada que troca os slides num temporizador simples;
   Mídias, Configurações e o editor do carrossel abrem o cartão "fora da demonstração". Visual do kit do hub (ui.*, tokens --ph-*);
   o que aparece NA TELA da TV simulada mantém o desenho do aparelho. Dados fictícios, imagens desenhadas em SVG, nenhuma chamada de rede.
   Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const PP = f => ({ pt: f('pt'), en: f('en') });
  const L = (x, l) => (x != null && typeof x === 'object' && 'pt' in x ? x[l] : x);
  const PREVIEW_MS = 4000, SLIDE_S = 6;
  const SETORES = [P('Recepção', 'Front desk'), P('Produção', 'Production'), P('Refeitório', 'Cafeteria'), P('Comercial', 'Sales'), P('Expedição', 'Shipping')];

  /* mídias de exemplo: cada uma é um desenho (arte) */
  const M = (nome, tipo, arte) => ({ nome, tipo, arte });
  const MID = {
    boas: M(P('Boas-vindas aos visitantes', 'Welcome, visitors'), 'image', { k: 'boas', t: P('Bem-vindo à Empresa Demo', 'Welcome to Demo Company'), s: P('Visitantes: identifiquem-se na recepção', 'Visitors: please check in at the front desk') }),
    seg: M(P('Dias sem acidentes', 'Days without accidents'), 'image', { k: 'seg', n: 187, t: P('dias sem acidentes com afastamento', 'days without lost-time accidents'), s: P('Recorde da unidade: 412 dias', 'Site record: 412 days') }),
    epi: M(P('Cartaz: use o EPI completo', 'Poster: wear full PPE'), 'image', { k: 'epi', v: 1, t: P('Use o EPI completo', 'Wear full PPE'), linhas: [P('Óculos de proteção', 'Safety glasses'), P('Protetor auricular', 'Hearing protection'), P('Luvas e calçado de segurança', 'Gloves and safety shoes')] }),
    ind: M(P('Indicadores da produção', 'Production indicators'), 'image', { k: 'ind', t: P('Indicadores da produção', 'Production indicators'), s: P('Semana 40 · valores de exemplo', 'Week 40 · sample figures'),
      barras: [[P('Eficiência global (OEE)', 'Overall efficiency (OEE)'), 82, '82%'], [P('Entregas no prazo', 'On-time deliveries'), 96, '96%'], [P('Plano de produção cumprido', 'Production plan achieved'), 91, '91%'], [P('Refugo', 'Scrap'), 18, P('1,8%', '1.8%')]] }),
    meta: M(P('Meta de vendas do mês', 'Monthly sales target'), 'image', { k: 'meta', pct: 74, t: P('Meta de vendas do mês', 'Monthly sales target'), s: P('R$ 1,48 mi de R$ 2,00 mi', 'BRL 1.48 M of BRL 2.00 M') }),
    aniv: M(P('Aniversariantes do mês', 'Birthdays this month'), 'image', { k: 'aniv', t: P('Aniversariantes do mês', 'Birthdays this month'),
      linhas: [[P('Colaborador A', 'Employee A'), P('Produção · dia 04', 'Production · 4th')], [P('Colaboradora B', 'Employee B'), P('Comercial · dia 11', 'Sales · 11th')], [P('Colaborador C', 'Employee C'), P('Expedição · dia 19', 'Shipping · 19th')], [P('Colaboradora D', 'Employee D'), P('Recepção · dia 27', 'Front desk · 27th')]] }),
    cardapio: M(P('Cardápio da semana', 'This week\'s menu'), 'image', { k: 'lista', t: P('Cardápio da semana', 'This week\'s menu'),
      linhas: [[P('Segunda', 'Monday'), P('Frango grelhado e legumes', 'Grilled chicken and vegetables')], [P('Terça', 'Tuesday'), P('Carne de panela e purê', 'Pot roast and mashed potatoes')], [P('Quarta', 'Wednesday'), P('Peixe assado e arroz', 'Baked fish and rice')], [P('Quinta', 'Thursday'), P('Massa ao molho vermelho', 'Pasta with tomato sauce')], [P('Sexta', 'Friday'), P('Feijoada completa', 'Bean stew')]] }),
    inst: M(P('Vídeo institucional', 'Company video'), 'video', { k: 'video', t: P('Vídeo institucional', 'Company video'), s: P('Nossa história', 'Our story') }),
    cargas: M(P('Treinamento: movimentação de cargas', 'Training: load handling'), 'video', { k: 'video', cor: '#7a3d06', t: P('Movimentação de cargas', 'Load handling'), s: P('Treinamento de segurança', 'Safety training') }),
    vacina: M(P('Campanha de vacinação', 'Vaccination campaign'), 'image', { k: 'aviso', tag: P('CAMPANHA', 'CAMPAIGN'), t: P('Vacinação contra a gripe', 'Flu vaccination'), linhas: [P('Quinta-feira, das 8h às 16h', 'Thursday, 8 am to 4 pm'), P('No ambulatório. Leve o crachá.', 'At the health room. Bring your badge.')] }),
    simulado: M(P('Simulado de abandono de área', 'Evacuation drill'), 'image', { k: 'aviso', cor: '#d64545', tag: P('HOJE', 'TODAY'), t: P('Simulado de abandono', 'Evacuation drill'), linhas: [P('Ao ouvir a sirene, siga a rota de fuga', 'When the siren sounds, follow the escape route'), P('Ponto de encontro: pátio 2', 'Assembly point: yard 2')] }),
    coleta: M(P('Coleta seletiva', 'Recycling'), 'image', { k: 'aviso', cor: '#2f9e5b', tag: P('MEIO AMBIENTE', 'ENVIRONMENT'), t: P('Cada resíduo no seu lugar', 'Every kind of waste in its bin'), linhas: [P('Papel, plástico, metal e orgânico', 'Paper, plastic, metal and organic'), P('Dúvidas: fale com a equipe de segurança', 'Questions: talk to the safety team')] }),
    onibus: M(P('Horário do ônibus fretado', 'Shuttle bus times'), 'image', { k: 'lista', cor: '#d9660a', t: P('Ônibus fretado', 'Shuttle bus'),
      linhas: [[P('Linha 1', 'Line 1'), P('Saídas às 17h10 e 17h40', 'Departures at 5:10 and 5:40 pm')], [P('Linha 2', 'Line 2'), P('Saída às 17h20', 'Departure at 5:20 pm')], [P('Turno B', 'Shift B'), P('Saída às 22h15', 'Departure at 10:15 pm')]] }),
    pesquisa: M(P('Pesquisa de clima aberta', 'Climate survey is open'), 'image', { k: 'aviso', cor: '#f2790f', tag: P('PESSOAS', 'PEOPLE'), t: P('Pesquisa de clima aberta', 'Climate survey is open'), linhas: [P('Sua opinião em 5 minutos', 'Your opinion in 5 minutes'), P('Respostas anônimas até o dia 15', 'Anonymous answers until the 15th')] }),
    missao: M(P('Missão, visão e valores', 'Mission, vision and values'), 'image', { k: 'boas', cor: '#1b4636', t: P('Missão, visão e valores', 'Mission, vision and values'), s: P('Segurança, qualidade e respeito', 'Safety, quality and respect') }),
  };

  /* carrosséis de exemplo, já com o que cada TV exibe agora e a situação dela */
  const C = (id, nome, setor, midias, o) => ({ id, nome, setor, midias, ativo: true, tvOnline: true, radio: null, ...o });
  let db = null;
  const semear = () => ({ seq: 6, carrosseis: [
    C(1, P('TV Recepção', 'Front desk TV'), SETORES[0], ['boas', 'inst', 'meta', 'missao', 'pesquisa'], { radio: 'Rádio Demo FM' }),
    C(2, P('TV Produção Linha 1', 'Production TV Line 1'), SETORES[1], ['seg', 'epi', 'ind', 'cargas', 'simulado', 'coleta']),
    C(3, P('TV Refeitório', 'Cafeteria TV'), SETORES[2], ['cardapio', 'aniv', 'vacina', 'onibus', 'coleta'], { radio: 'Rádio Exemplo Hits' }),
    C(4, P('TV Comercial', 'Sales TV'), SETORES[3], ['meta', 'ind', 'boas'], { tvOnline: false }),
    C(5, P('TV Expedição', 'Shipping TV'), SETORES[4], ['seg', 'epi', 'onibus']),
    C(6, P('TV Auditório', 'Auditorium TV'), null, ['missao', 'inst'], { ativo: false, tvOnline: false }),
  ] });

  /* ícones de traço (grade 24x24) */
  const IC = {
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    tv: '<rect width="20" height="15" x="2" y="7" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>',
    eyeoff: '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    images: '<path d="M18 22H4a2 2 0 0 1-2-2V6"/><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18"/><circle cx="12" cy="8" r="2"/><rect width="16" height="16" x="6" y="2" rx="2"/>',
    grid: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    sliders: '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>', chevl: '<path d="m15 18-6-6 6-6"/>', chevr: '<path d="m9 18 6-6-6-6"/>',
    power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  };

  const semMov = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const X = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let t = x => x;

  /* as "imagens" e os "vídeos" da demonstração: desenhos em SVG. cover = corta para preencher (miniaturas); senão aparece inteira, como na TV. */
  function arte(m, cover, anim, classe) {
    const a = m.arte, W = a.v ? 900 : 1600, Hh = a.v ? 1600 : 900, cor = a.cor || '#14372c';
    const tx = (x, y, s, tam, fill, peso, anc, extra) => '<text x="' + x + '" y="' + y + '" font-size="' + tam + '" fill="' + fill + '" font-weight="' + (peso || 700) + '"' + (anc ? ' text-anchor="' + anc + '"' : '') + (extra || '') + '>' + X(t(s)) + '</text>';
    const marca = (x, y, fill, anc) => tx(x, y, 'EMPRESA DEMO', 30, fill, 800, anc, ' letter-spacing="6"');
    let g = '';
    if (a.k === 'boas') {
      g = '<rect width="1600" height="900" fill="' + cor + '"/><circle cx="1400" cy="120" r="310" fill="#235942" opacity=".6"/><circle cx="1520" cy="830" r="230" fill="#f2790f"/>' + marca(110, 150, '#f6b77a')
        + tx(110, 440, a.t, 100, '#ffffff', 800) + '<rect x="110" y="490" width="180" height="12" rx="6" fill="#f2790f"/>' + tx(110, 600, a.s, 46, '#d6e5de', 500);
    } else if (a.k === 'seg') {
      g = '<rect width="1600" height="900" fill="#ffffff"/><rect width="1600" height="150" fill="#14372c"/>' + tx(110, 98, P('SEGURANÇA', 'SAFETY'), 44, '#ffffff', 800, null, ' letter-spacing="4"') + marca(1490, 96, '#f6b77a', 'end')
        + tx(800, 580, String(a.n), 400, '#2f9e5b', 800, 'middle') + tx(800, 700, a.t, 60, '#1b2a26', 700, 'middle') + tx(800, 800, a.s, 40, '#64756f', 500, 'middle');
    } else if (a.k === 'epi') {
      g = '<rect width="900" height="1600" fill="#d9660a"/><circle cx="800" cy="130" r="260" fill="#ffffff" opacity=".12"/><circle cx="60" cy="1500" r="300" fill="#14372c" opacity=".25"/>' + marca(450, 150, '#ffffff', 'middle')
        + '<path d="M450 330l230 90v170c0 150-100 260-230 300-130-40-230-150-230-300V420z" fill="#ffffff" opacity=".95"/><path d="M340 600l80 80 150-170" fill="none" stroke="#2f9e5b" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>'
        + tx(450, 1010, a.t, 78, '#ffffff', 800, 'middle')
        + a.linhas.map((s, i) => '<rect x="90" y="' + (1080 + i * 130) + '" width="720" height="96" rx="20" fill="#ffffff" opacity=".16"/>' + tx(450, 1143 + i * 130, s, 42, '#ffffff', 600, 'middle')).join('');
    } else if (a.k === 'ind') {
      g = '<rect width="1600" height="900" fill="#ffffff"/>' + tx(110, 150, a.t, 72, '#14372c', 800) + tx(110, 215, a.s, 36, '#64756f', 500) + marca(1490, 140, '#d9660a', 'end')
        + a.barras.map((b, i) => { const y = 320 + i * 140; return tx(110, y, b[0], 40, '#1b2a26', 600) + '<rect x="110" y="' + (y + 24) + '" width="1160" height="44" rx="22" fill="#eef2f0"/><rect x="110" y="' + (y + 24) + '" width="' + Math.round(11.6 * b[1]) + '" height="44" rx="22" fill="' + (i % 2 ? '#f2790f' : '#235942') + '"/>' + tx(1490, y + 62, b[2], 54, '#14372c', 800, 'end'); }).join('');
    } else if (a.k === 'meta') {
      const CI = 2 * Math.PI * 230;
      g = '<rect width="1600" height="900" fill="#f4f7f6"/><circle cx="430" cy="460" r="230" fill="none" stroke="#e0e6e3" stroke-width="70"/><circle cx="430" cy="460" r="230" fill="none" stroke="#f2790f" stroke-width="70" stroke-linecap="round" stroke-dasharray="' + (CI * a.pct / 100).toFixed(0) + ' ' + CI.toFixed(0) + '" transform="rotate(-90 430 460)"/>'
        + tx(430, 505, a.pct + '%', 130, '#14372c', 800, 'middle') + tx(780, 410, a.t, 62, '#14372c', 800) + '<rect x="780" y="445" width="140" height="10" rx="5" fill="#f2790f"/>' + tx(780, 540, a.s, 44, '#64756f', 500) + marca(780, 770, '#235942');
    } else if (a.k === 'aniv') {
      g = '<rect width="1600" height="900" fill="#14372c"/>' + [[150, 120, 34, '#f2790f'], [1450, 170, 46, '#2f9e5b'], [1330, 80, 20, '#f6b77a'], [240, 800, 28, '#2f9e5b'], [1480, 760, 36, '#f2790f'], [90, 420, 18, '#f6b77a']].map(c => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="' + c[2] + '" fill="' + c[3] + '"/>').join('')
        + tx(800, 190, a.t, 84, '#ffffff', 800, 'middle') + a.linhas.map((r, i) => { const y = 280 + i * 135; return '<rect x="250" y="' + y + '" width="1100" height="104" rx="22" fill="#ffffff" opacity=".1"/>' + tx(300, y + 68, r[0], 46, '#ffffff', 700) + tx(1300, y + 68, r[1], 40, '#f6b77a', 600, 'end'); }).join('');
    } else if (a.k === 'lista') {
      g = '<rect width="1600" height="900" fill="#ffffff"/><rect width="1600" height="200" fill="' + (a.cor || '#235942') + '"/>' + tx(110, 130, a.t, 80, '#ffffff', 800) + marca(1490, 126, '#ffffff', 'end')
        + a.linhas.map((r, i) => { const y = 310 + i * 122; return tx(110, y, r[0], 44, '#d9660a', 800) + tx(470, y, r[1], 44, '#1b2a26', 500) + '<rect x="110" y="' + (y + 36) + '" width="1380" height="2" fill="#e0e6e3"/>'; }).join('');
    } else if (a.k === 'video') {
      const mov = anim && !semMov();
      g = '<rect width="1600" height="900" fill="' + cor + '"/><g opacity=".16">' + [0, 1, 2, 3, 4, 5, 6].map(i => '<rect x="' + (i * 300 - 500) + '" y="-200" width="120" height="1500" fill="#ffffff" transform="rotate(24 800 450)"/>').join('')
        + (mov ? '<animateTransform attributeName="transform" type="translate" from="-300 0" to="0 0" dur="3s" repeatCount="indefinite"/>' : '') + '</g>'
        + '<circle cx="800" cy="360" r="120" fill="#f2790f">' + (mov ? '<animate attributeName="r" values="112;134;112" dur="2.4s" repeatCount="indefinite"/>' : '') + '</circle><path d="M765 300v120l104-60z" fill="#ffffff"/>'
        + tx(800, 620, a.t, 84, '#ffffff', 800, 'middle') + tx(800, 700, a.s, 44, '#d6e5de', 500, 'middle') + marca(110, 110, '#f6b77a')
        + '<rect x="1340" y="70" width="170" height="60" rx="30" fill="#000000" opacity=".35"/>' + tx(1425, 112, P('VÍDEO', 'VIDEO'), 30, '#ffffff', 800, 'middle')
        + '<rect y="880" width="1600" height="20" fill="#ffffff" opacity=".2"/>' + (mov ? '<rect y="880" height="20" fill="#f2790f" width="0"><animate attributeName="width" from="0" to="1600" dur="' + SLIDE_S + 's" repeatCount="indefinite"/></rect>' : '');
    } else {
      const tag = t(a.tag);
      g = '<rect width="1600" height="900" fill="#f4f7f6"/><rect width="44" height="900" fill="' + cor + '"/><circle cx="1480" cy="760" r="240" fill="' + cor + '" opacity=".1"/>'
        + '<rect x="130" y="120" width="' + (tag.length * 27 + 70) + '" height="72" rx="36" fill="' + cor + '"/>' + tx(165, 169, tag, 36, '#ffffff', 800, null, ' letter-spacing="3"')
        + tx(130, 400, a.t, 92, '#14372c', 800) + a.linhas.map((s, i) => tx(130, 520 + i * 82, s, 50, '#475850', 500)).join('') + marca(130, 810, '#235942');
    }
    return '<svg class="ctv-art' + (classe ? ' ' + classe : '') + '" viewBox="0 0 ' + W + ' ' + Hh + '" preserveAspectRatio="xMidYMid ' + (cover ? 'slice' : 'meet') + '" focusable="false" aria-hidden="true" font-family="Inter,Arial,Helvetica,sans-serif">' + g + '</svg>';
  }

  /* estilo: layout e peças sem equivalente no kit, só com os tokens --ph-* da casca. A exceção é a TELA da TV simulada (.tvp), que
     é o conteúdo exibido no aparelho e mantém o desenho dele. */
  const R = (sel, css) => sel.split(',').map(s => '.ctv-root ' + s.trim()).join(',') + '{' + css + '}';
  const ROTULO = 'font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const BTN0 = 'appearance:none;border:0;background:none;padding:0;margin:0;font:inherit;color:inherit;text-align:left;cursor:pointer';
  const CSS = [
    '.ctv-root{min-width:0;color:var(--ph-text)}', '.ctv-root.ctv-app{display:flex;flex-direction:column}',
    R('.ctv-ic', 'display:inline-flex;flex:none;vertical-align:middle'), R('.ctv-ic svg', 'display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round'),
    R('.ctv-art', 'display:block;width:100%;height:100%'),
    R('.ctv-nav>.ph-abas-painel', 'padding:0;max-width:none'), R('.ctv-nav [data-f="aba-config"]', 'margin-left:auto'),
    R('.ctv-page', 'padding:22px clamp(16px,3vw,28px) 28px;min-width:0'),
    R('.ctv-topbar', 'display:flex;justify-content:space-between;align-items:flex-end;gap:12px 16px;flex-wrap:wrap;margin-bottom:20px'), R('.ctv-topbar>div:first-child', 'min-width:0;flex:1 1 22rem'),
    R('.ctv-sub', 'font-size:13px;color:var(--ph-text-muted);margin-top:4px'), R('.ctv-row', 'display:flex;gap:8px;align-items:center;flex-wrap:wrap'),
    R('.ctv-help', 'font-size:12px;color:var(--ph-text-dim);line-height:1.45;margin:10px 0 0'),
    /* lista de carrosséis: cartões do kit com a prévia que gira, a situação da TV e o botão Visualizar */
    R('.ctv-grid', 'display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(min(270px,100%),1fr))'),
    R('.ctv-ccard.ph-card', 'padding:0;gap:0;display:flex;flex-direction:column;min-width:0;overflow:hidden;position:relative'),
    R('.ctv-cardbtn', BTN0 + ';display:flex;flex-direction:column;width:100%;border-radius:inherit'), R('.ctv-cardbtn:focus-visible', 'outline:var(--ph-foco-largura) solid var(--ph-focus);outline-offset:-3px'),
    R('.ctv-ccard.inativo .ctv-thumb .ctv-art', 'filter:grayscale(.6) brightness(.6)'), R('.ctv-ccard.inativo .ctv-ctitle', 'color:var(--ph-text-muted)'),
    R('.ctv-thumb', 'position:relative;height:clamp(150px,24vh,220px);width:100%;background:var(--ph-card-2);display:flex;align-items:center;justify-content:center;overflow:hidden;border-bottom:1px solid var(--ph-border)'),
    R('.ctv-pv', 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--ph-text-dim);font-size:13px'),
    R('.ctv-overlay', 'position:absolute;inset:0;background:color-mix(in srgb,var(--ph-bg) 74%,transparent);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;color:var(--ph-text);font-weight:600;font-size:13px;opacity:0;transition:opacity .18s ease;pointer-events:none'),
    R('.ctv-ccard:hover .ctv-overlay,.ctv-cardbtn:focus-visible .ctv-overlay', 'opacity:1'),
    R('.ctv-bars', 'position:absolute;left:12px;right:12px;bottom:10px;display:flex;gap:4px;z-index:2'), R('.ctv-bar', 'flex:1;height:3px;border-radius:2px;background:color-mix(in srgb,var(--ph-card) 60%,transparent);overflow:hidden'),
    R('.ctv-bar>span', 'display:block;height:100%;background:var(--ph-accent);width:0'), R('.ctv-bar.done>span', 'width:100%'), R('.ctv-bar.on>span', 'width:100%;animation:ctv-fill ' + PREVIEW_MS + 'ms linear'),
    '@keyframes ctv-fill{from{width:0}to{width:100%}}',
    R('.ctv-thumb .ctv-status', 'position:absolute;top:10px;right:10px;z-index:2'),
    R('.ctv-viewbtn', 'position:absolute;top:calc(clamp(150px,24vh,220px) - 46px);right:10px;z-index:3;opacity:0;transition:opacity .18s ease'),
    R('.ctv-ccard:hover .ctv-viewbtn,.ctv-ccard:focus-within .ctv-viewbtn', 'opacity:1'), '@media(hover:none){' + R('.ctv-viewbtn', 'opacity:1') + '}',
    R('.ctv-cbody', 'padding:12px 14px 14px;min-width:0;width:100%'), R('.ctv-ctitle', 'font-size:15px;font-weight:700;color:var(--ph-text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis'),
    R('.ctv-cmeta', 'display:flex;gap:6px;margin-top:8px;flex-wrap:wrap'),
    /* faixa das ajudas que só existem na demonstração */
    R('.ctv-demo', 'border-bottom:1px dashed var(--ph-border-soft);background:var(--ph-surface);font-size:13px;color:var(--ph-text-muted)'),
    R('.ctv-demo summary', 'cursor:pointer;padding:8px clamp(16px,3vw,24px);display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;list-style:none;' + ROTULO + ';color:var(--ph-text-dim)'), R('.ctv-demo summary:focus-visible', 'outline-offset:-2px'),
    R('.ctv-demo summary::-webkit-details-marker', 'display:none'), R('.ctv-demo summary .nota', 'font:400 12px/1.5 var(--ph-font);letter-spacing:0;text-transform:none;font-stretch:100%'), R('.ctv-demo[open] summary .ctv-ic:last-child', 'transform:rotate(180deg)'),
    R('.ctv-demo .corpo', 'display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:2px clamp(16px,3vw,24px) 12px'),
    R('.ctv-demo .ph-campo', 'flex-direction:row;flex-wrap:wrap;align-items:center;gap:6px 8px'), R('.ctv-demo .ph-input', 'width:auto;max-width:100%'), R('.ctv-demo .ph-btn', 'white-space:normal;height:auto;min-height:2rem;text-align:left'),
    R('.ctv-demo .txt', 'flex-basis:100%;color:var(--ph-text-dim);line-height:1.5;font-size:12.5px'),
    /* a TV simulada: moldura do aparelho e a linha de situação seguem o hub */
    R('.ctv-bezel', 'position:relative;padding:10px 10px 16px;background:var(--ph-card-2);border:1px solid var(--ph-border-soft);border-radius:var(--ph-raio-lg);box-shadow:var(--ph-sombra)'),
    R('.ctv-bezel>i', 'position:absolute;bottom:5px;right:14px;width:6px;height:6px;border-radius:50%;background:var(--ph-vivo-verde)'),
    R('.ctv-pe', 'width:26%;height:10px;margin:0 auto;background:var(--ph-border-soft);border-radius:0 0 var(--ph-raio) var(--ph-raio)'),
    R('.ctv-st', 'font-family:var(--ph-font-mono);font-size:12px;color:var(--ph-text-2);background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio);padding:8px 10px;margin:10px 0 0;overflow-wrap:anywhere'),
    '@media (prefers-reduced-motion:reduce){' + R('.ctv-bar.on>span', 'animation:none') + R('.ctv-viewbtn,.ctv-overlay', 'transition:none') + R('.tvp .tveq span', 'animation:none') + R('.tvp .tvnight,.tvp .tvradio,.tvp .tvnav', 'transition:none') + '}',
    /* tela da TV: conteúdo exibido no aparelho */
    R('.tvp', 'position:relative;width:100%;aspect-ratio:16/9;background:#E9F5F8;overflow:hidden;font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;container-type:inline-size;--u:calc(100cqw / 960);border-radius:4px'),
    R('.tvp:focus-visible', 'outline:var(--ph-foco-largura) solid var(--ph-focus);outline-offset:2px'),
    R('.tvp .tvf', 'position:relative;width:92%;height:90%;border-radius:calc(20 * var(--u));background:#fff;border:calc(6 * var(--u)) solid #fff;box-shadow:0 calc(15 * var(--u)) calc(35 * var(--u)) rgba(0,0,0,.18);overflow:hidden'),
    R('.tvp .tvi', 'position:absolute;inset:0;background:#eef5f2'), R('.tvp .tvi .bd', 'position:absolute;inset:0;filter:blur(calc(40 * var(--u))) saturate(1.4) brightness(.55);transform:scale(1.35)'), R('.tvp .tvi .md', 'position:relative;z-index:1'),
    R('.tvp .tvvz', 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#9fb3aa;font-size:3cqw;text-align:center;background:#fff;padding:0 4%'),
    R('.tvp .tvnav', 'appearance:none;font-family:inherit;cursor:pointer;margin:0;position:absolute;top:50%;transform:translateY(-50%);z-index:20;width:max(28px,calc(56 * var(--u)));aspect-ratio:1;border:0;padding:0;border-radius:50%;background:rgba(15,43,35,.55);color:#fff;opacity:0;visibility:hidden;transition:opacity .25s ease,background .15s ease;display:flex;align-items:center;justify-content:center'),
    R('.tvp .tvnav:hover', 'background:rgba(15,43,35,.85)'), R('.tvp .tvnav.pv', 'left:calc(4% + 20 * var(--u))'), R('.tvp .tvnav.nx', 'right:calc(4% + 20 * var(--u))'), R('.tvp:hover .tvnav,.tvp:focus-within .tvnav', 'opacity:1;visibility:visible'),
    '@media(hover:none){' + R('.tvp .tvnav', 'opacity:.8;visibility:visible') + '}',
    R('.tvp .tvnight', 'position:absolute;inset:0;background:#000;z-index:100;opacity:0;visibility:hidden;transition:opacity .6s ease'), R('.tvp.night .tvnight', 'opacity:1;visibility:visible'),
    R('.tvp .tvradio', 'position:absolute;bottom:calc(24 * var(--u));right:calc(32 * var(--u));z-index:50;display:flex;align-items:center;gap:calc(12 * var(--u));max-width:48%;padding:calc(12 * var(--u)) calc(16 * var(--u));border-radius:calc(16 * var(--u));background:rgba(24,24,27,.9);border:1px solid rgba(63,63,70,.55);box-shadow:0 12px 30px rgba(0,0,0,.4);color:#fff;font-size:max(9px,calc(14 * var(--u)));font-weight:600;opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .45s ease,transform .45s ease,visibility .45s'),
    R('.tvp.radio .tvradio', 'opacity:1;visibility:visible;transform:none'), R('.tvp.duck .tvradio', 'opacity:.45'), R('.tvp .tvradio .nm', 'min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis'),
    R('.tvp .tveq', 'display:flex;align-items:flex-end;gap:3px;height:max(10px,calc(18 * var(--u)));flex-shrink:0'), R('.tvp .tveq span', 'display:block;width:3px;height:100%;border-radius:2px;background:#f2790f;transform-origin:bottom;animation:ctv-eq .9s ease-in-out infinite'),
    [2, 3, 4].map(n => R('.tvp .tveq span:nth-child(' + n + ')', 'animation-delay:' + ((n - 1) * 0.18).toFixed(2) + 's')).join(''), R('.tvp.duck .tveq span', 'animation-play-state:paused'),
    '@keyframes ctv-eq{0%,100%{transform:scaleY(.28)}50%{transform:scaleY(1)}}',
  ].join('\n');

  Hub.registrar({
    id: 'carrossel_tv',
    ordem: 13,
    grupo: P('Operação', 'Operations'),
    icone: 'tv',
    nome: P('Carrossel TV', 'TV Carousel'),
    resumo: P('Comunicação interna nas TVs da empresa: biblioteca de mídias, uma grade por setor, a TV que se atualiza e se defende sozinha, player para PC e aplicativo Android, e aviso quando uma tela fica sem sinal.',
      'Internal communication on the company TVs: a media library, one grid per department, a TV that updates and defends itself, a PC player and an Android app, and a notice when a screen loses signal.'),
    manual: {
      pt: {
        destaque: 'A comunicação interna das TVs da empresa administrada de dentro do portal: cada TV toca sozinha a grade do seu setor, aplica as mudanças sem ninguém ir até ela e avisa quando sai do ar.',
        oque: 'O que é. O Carrossel TV alimenta as televisões espalhadas pela empresa (recepção, fábrica, refeitório, áreas administrativas) com imagens e vídeos de comunicação interna. É um módulo do ProjectHub, a camada inteligente sobre o ERP, e usa o login e as permissões do portal.\n\n'
          + 'Quem cuida do conteúdo monta no portal a grade de cada TV com imagens e vídeos, períodos, mídias temporárias, rádio online e horário de desligamento. A TV abre um endereço, se atualiza sozinha sem cortar o que está na tela e o responsável é avisado quando uma tela fica sem sinal e quando volta. Funciona em PC, TV Box Android ou smart TV; um aplicativo próprio mantém a TV Box no ar sem intervenção.\n\n'
          + 'Nesta versão pública, a tela Carrosséis está aberta com dados fictícios e uma TV simulada; as outras telas aparecem no vídeo da versão completa.',
        finalidade: 'O problema. Comunicação interna em TV costuma depender de alguém ir até o aparelho. A tela travava e só voltava quando alguém reabria a página; uma TV parada passava horas sem ninguém perceber; um aviso com prazo continuava no ar depois de vencido; e um sistema separado, com login próprio, era mais uma coisa para hospedar, proteger e dar acesso.\n\n'
          + 'O que mudou. A comunicação das TVs passou a rodar sem supervisão: cada setor cuida do próprio conteúdo no portal, a TV se atualiza e se defende sozinha, e o responsável fica sabendo quando uma tela fica sem sinal e quando ela volta, sem alarme falso por oscilação de rede.\n\n'
          + 'Projetado e construído por Ruan Siqueira, do primeiro aplicativo das TVs ao módulo dentro do portal: o painel, a API, o banco de dados, a página da TV, o player de PC e o aplicativo Android.',
        alcance: [
          'Telas: Carrosséis, com prévia animada e a situação de cada TV; editor da grade, com ordem por arraste, período por item, rádio online e desligamento agendado; Mídias; e Configurações.',
          'Biblioteca de mídias separada das grades: a mesma mídia entra em vários carrosséis, e as temporárias saem das TVs sozinhas quando vencem.',
          'Confiabilidade: a TV se recupera sozinha de travamentos e quedas de rede, e os avisos só saem em mudança real de estado.',
          'Resultado medido em bancada: com o servidor respondendo erro por 40 s, o carrossel seguiu girando e aplicou a lista nova sozinho em 18 s.',
          'Ritmo e tamanho: seis versões do módulo em seis dias; 29 rotas de API e 6 tabelas.',
        ],
        tecnologias: ['React / Next.js', 'ASP.NET Core (.NET)', 'SQL Server', 'TypeScript', 'JavaScript', 'Android', 'Serviço em segundo plano'],
      },
      en: {
        destaque: 'Internal communication on the company TVs, run from inside the portal: each TV plays its department grid by itself, applies changes with nobody walking up to it, and reports when it goes off the air.',
        oque: 'What it is. TV Carousel feeds the televisions spread across the company (front desk, shop floor, cafeteria, offices) with internal communication images and videos. It is a module of the ProjectHub, the intelligent layer on top of the ERP, and it uses the portal login and permissions.\n\n'
          + 'Whoever looks after the content builds each TV grid in the portal with images and videos, periods, temporary media, online radio and switch-off hours. The TV opens an address, updates itself without cutting what is on screen, and the person in charge is notified when a screen loses signal and when it is back. It runs on a PC, an Android TV box or a smart TV; an app of its own keeps the TV box on air with no intervention.\n\n'
          + 'In this public version, the Carousels screen is open with fictitious data and a simulated TV; the other screens appear in the video of the full version.',
        finalidade: 'The problem. Internal communication on TVs usually depends on someone walking up to the device. The screen froze and only came back when someone reopened the page; a stopped TV went hours unnoticed; a notice with a deadline stayed on air after it expired; and a separate system, with its own login, was one more thing to host, protect and grant access to.\n\n'
          + 'What changed. TV communication now runs unattended: each department looks after its own content in the portal, the TV updates and defends itself, and the person in charge learns when a screen loses signal and when it is back, with no false alarm from a network hiccup.\n\n'
          + 'Designed and built by Ruan Siqueira, from the first TV application to the module inside the portal: the panel, the API, the database, the TV page, the PC player and the Android app.',
        alcance: [
          'Screens: Carousels, with an animated preview and the status of each TV; the grid editor, with drag ordering, a period per item, online radio and scheduled switch-off; Media; and Settings.',
          'Media library separate from the grids: the same media goes into several carousels, and temporary media leave the TVs by themselves when they expire.',
          'Reliability: the TV recovers by itself from freezes and network drops, and notices only go out on a real change of state.',
          'Bench-test result: with the server returning errors for 40 s, the carousel kept turning and applied the new list by itself in 18 s.',
          'Pace and size: six versions of the module in six days; 29 API routes and 6 tables.',
        ],
        tecnologias: ['React / Next.js', 'ASP.NET Core (.NET)', 'SQL Server', 'TypeScript', 'JavaScript', 'Android', 'Background service'],
      },
    },
    /* mini tour: só ganchos do módulo (data-f, .ctv-*), nada que dependa do idioma */
    tour: [
      { alvo: '.ctv-app [data-f="aba-carrosseis"]', acao: 'clicar', titulo: P('Todas as TVs numa tela só', 'Every TV on one screen'),
        texto: P('Recepção, produção, refeitório: cada TV da empresa tem a sua grade de imagens e vídeos, e todas aparecem aqui.',
          'Front desk, production, cafeteria: each company TV has its own grid of images and videos, and they all show up here.') },
      { alvo: '.ctv-app .ctv-ccard', titulo: P('O que a TV mostra agora', 'What the TV is showing now'),
        texto: P('A prévia gira como na própria TV e o selo diz se ela está no ar. Depois do tour, Visualizar abre a TV simulada.',
          'The preview cycles like the TV itself and the badge tells you whether it is on air. After the tour, View opens the simulated TV.') },
      /* fechar-dialogos: a TV, o editor ou o rastro abertos por um clique no alvo do passo anterior não ficam por cima do holofote */
      { alvo: '.ctv-app [data-f="novo"]', antes: 'fechar-dialogos', titulo: P('Cada setor cuida da sua TV', 'Each department runs its own TV'),
        texto: P('Quem cuida do conteúdo monta a grade com as mídias, o período de cada uma, a rádio e o horário de desligar. Ninguém precisa ir até o aparelho.',
          'Whoever looks after the content builds the grid with the media, the period of each one, the radio and the switch-off time. Nobody has to walk up to the device.') },
      { alvo: '.ctv-app .ctv-demo', antes: 'fechar-dialogos', titulo: P('A TV que avisa quando cai', 'A TV that speaks up when it drops'),
        texto: P('Um vigia confere as TVs sozinho e avisa o responsável quando uma tela fica sem sinal e quando volta. Depois do tour, esta faixa deixa você mesmo tirar a TV da tomada para ver.',
          'A watcher checks the TVs on its own and tells the person in charge when a screen loses signal and when it is back. After the tour, this strip lets you unplug the TV yourself and see.') },
      { alvo: '.ctv-app [data-f="aba-midias"]', antes: 'fechar-dialogos', acao: 'clicar', titulo: P('Uma biblioteca para todas as TVs', 'One library for every TV'),
        texto: P('A mesma mídia entra em várias TVs, e um aviso com prazo sai do ar sozinho quando vence.',
          'The same media goes into several TVs, and a notice with a deadline leaves the air by itself when it expires.') },
      { alvo: '.ctv-app .ph-fora', antes: 'fechar-dialogos', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('A demonstração pública mostra a tela principal. O vídeo mostra o sistema inteiro funcionando; quer ver ao vivo? É só me chamar por aqui.',
          'The public demo shows the main screen. The video shows the whole system running; want to see it live? Just reach me from here.') },
    ],

    montar(el, api) {
      if (!db) db = semear();
      const { h, ui } = api;
      t = api.t;
      const est = api.estado;
      if (!document.getElementById('ctv-pub-css')) {
        const st = document.createElement('style');
        st.setAttribute('id', 'ctv-pub-css');
        st.textContent = CSS;
        (document.head || document.documentElement).appendChild(st);
      }
      const ic = (nome, tam = 14) => h('span', { class: 'ctv-ic', 'aria-hidden': 'true', style: 'width:' + tam + 'px;height:' + tam + 'px', html: '<svg viewBox="0 0 24 24" focusable="false">' + IC[nome] + '</svg>' });
      /* botão do kit: tom 'primario' | 'secundario' | 'fantasma'; o = { p, f, titulo, classe } */
      const btn = (tom, icone, texto, aoClicar, o = {}) => {
        const b = ui.botao({ tom, tamanho: o.p ? 'p' : null, icone: icone && IC[icone], texto, titulo: o.titulo, classe: o.classe, aoClicar });
        if (o.f) b.setAttribute('data-f', o.f);
        return b;
      };
      const selo = (tom, ...x) => ui.badge(x, tom);
      const trocarTexto = (b, x) => { b.children[b.children.length - 1].textContent = x; };
      const nMid = n => PP(l => n + ' ' + (l === 'pt' ? (n === 1 ? 'mídia' : 'mídias') : (n === 1 ? 'media item' : 'media items')));
      const fora = titulo => (ui.foraDaDemo ? ui.foraDaDemo({ titulo })
        : ui.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is outside the public demo.') }));
      const rastro = (titulo, subtitulo, passos, aoConcluir, aoFechar, escrita) => ui.backend({ titulo, subtitulo, passos, velocidade: 1.5, aoConcluir, aoFechar, escrita });
      const ACESSO = { tipo: 'regra', ms: 14, titulo: P('Confere no servidor o papel e o setor de quem chamou', 'Checks on the server the role and department of the caller') };

      /* ---------- Carrosséis: a tela principal ---------- */
      let previas = [];
      const grade = h('div', { class: 'ctv-grid' });
      function pintarPrevia(st) {
        const m = st.prev[st.idx];
        if (m) st.el.innerHTML = arte(m, true, true); else st.el.replaceChildren(t(P('Sem mídia ainda', 'No media yet')));
        if (st.bars) Array.from(st.bars.children).forEach((b, i) => { b.className = 'ctv-bar' + (i < st.idx ? ' done' : i === st.idx ? ' on' : ''); });
      }
      function cardCarrossel(c) {
        const prev = c.midias.map(k => MID[k]);
        const st = { prev, idx: 0, el: h('div', { class: 'ctv-pv' }), bars: prev.length > 1 ? h('div', { class: 'ctv-bars' }, prev.map(() => h('div', { class: 'ctv-bar' }, h('span')))) : null };
        pintarPrevia(st);
        previas.push(st);
        const situacao = selo(c.tvOnline ? 'ok' : 'neutro', c.tvOnline ? 'Online' : 'Offline');
        situacao.classList.add('ctv-status');
        situacao.setAttribute('title', c.tvOnline ? 'TV online' : 'TV offline');
        return ui.cartao({ classe: 'ctv-ccard' + (c.ativo ? '' : ' inativo'), conteudo: [
          h('button', { type: 'button', class: 'ctv-cardbtn', 'data-f': 'card-' + c.id, 'aria-label': PP(l => (l === 'pt' ? 'Editar o carrossel ' : 'Edit the carousel ') + L(c.nome, l) + ' · ' + (c.tvOnline ? 'TV online' : 'TV offline')), onclick: () => editorFora(c) },
            h('div', { class: 'ctv-thumb' }, st.el, st.bars, situacao, h('div', { class: 'ctv-overlay' }, ic('pencil', 26), h('div', null, P('Clique para editar', 'Click to edit')))),
            h('div', { class: 'ctv-cbody' }, h('div', { class: 'ctv-ctitle', title: c.nome }, c.nome),
              h('div', { class: 'ctv-cmeta' },
                !c.ativo && selo('neutro', ic('eyeoff', 11), P('Inativo', 'Inactive')),
                c.setor && selo('info', c.setor), selo('neutro', nMid(c.midias.length))))),
          btn('primario', 'tv', P('Visualizar', 'View'), () => verNaTv(c), { p: true, classe: 'ctv-viewbtn', f: 'ver-' + c.id })] });
      }
      function pintarGrade() { previas = []; grade.replaceChildren(...db.carrosseis.map(cardCarrossel)); }

      function telaLista(painel) {
        const atualizar = () => rastro(P('Atualizar a lista de carrosséis', 'Refresh the carousel list'), null, [
          { tipo: 'api', ms: 35, titulo: P('Pede os carrosséis do projeto', 'Requests the project carousels') },
          ACESSO,
          { tipo: 'sql', ms: 24, titulo: P('Lê os carrosséis com a prévia e a situação de cada TV', 'Reads the carousels with the preview and the status of each TV') },
          { tipo: 'api', ms: 6, titulo: P('Devolve a lista', 'Returns the list') },
        ], () => pintarGrade());
        pintarGrade();
        painel.append(h('div', { class: 'ctv-page' },
          h('div', { class: 'ctv-topbar' },
            h('div', null, h('h2', { class: 'ph-h1' }, P('Carrosséis', 'Carousels')), h('p', { class: 'ctv-sub' }, P('Todas as grades cadastradas para exibição nas TVs. Clique em um card para editar', 'Every grid registered for display on the TVs. Click a card to edit'))),
            h('div', { class: 'ctv-row' },
              btn('secundario', 'refresh', null, atualizar, { titulo: P('Atualizar lista', 'Refresh list'), f: 'atualizar' }),
              btn('primario', 'plus', P('Novo Carrossel', 'New Carousel'), novoCarrossel, { f: 'novo' }))),
          grade));
      }

      function editorFora(c) {
        ui.modal({ titulo: c.nome, largura: 'm', classe: 'ctv-root', corpo: fora(P('Editor do carrossel', 'Carousel editor')) });
      }

      function novoCarrossel() {
        let setor = '0';
        const nome = ui.campo({ rotulo: P('Nome do carrossel', 'Carousel name'), placeholder: P('Ex: TV Recepção', 'E.g. Front desk TV'), obrigatorio: true });
        nome.input.setAttribute('maxlength', '100');
        const sel = ui.select({ rotulo: P('Setor', 'Department'), valor: setor, opcoes: [{ valor: '', texto: P('Sem setor', 'No department') }].concat(SETORES.map((s, k) => ({ valor: String(k), texto: s }))), aoMudar: x => { setor = x; } });
        ui.modal({ titulo: P('Novo carrossel', 'New carousel'), largura: 440, classe: 'ctv-root', corpo: [nome, sel],
          acoes: ctl => [btn('secundario', null, P('Cancelar', 'Cancel'), () => ctl.fechar()), btn('primario', null, P('Criar carrossel', 'Create carousel'), () => {
            const n = nome.valor();
            if (!n) { nome.erro(P('Informe o nome do carrossel.', 'Enter the carousel name.')); nome.input.focus(); return; }
            ctl.fechar();
            rastro(P('Criar carrossel', 'Create carousel'), n, [
              { tipo: 'api', ms: 38, titulo: P('Recebe o novo carrossel', 'Receives the new carousel') },
              ACESSO,
              { tipo: 'sql', ms: 16, titulo: P('Grava o carrossel e a trilha de auditoria', 'Writes the carousel and the audit trail') },
              { tipo: 'api', ms: 6, titulo: P('Devolve o carrossel criado, ainda sem mídias', 'Returns the created carousel, still without media') },
            ], () => {
              db.carrosseis.push(C(++db.seq, P(n, n), setor === '' ? null : SETORES[Number(setor)], [], { tvOnline: false }));
              pintarGrade(); pintarFaixa();
              ui.toast(P('Carrossel criado. A grade é montada no editor, que fica fora desta demonstração.', 'Carousel created. The grid is built in the editor, which is outside this demo.'));
            }, null, 'create');
          }, { f: 'criar' })] });
      }

      /* ---------- a TV simulada: os slides andam num temporizador simples ---------- */
      function verNaTv(c) {
        rastro(P('Abrir a página da TV', 'Open the TV page'), c.nome, [
          { tipo: 'api', ms: 30, titulo: P('A TV abre o endereço do carrossel', 'The TV opens the carousel address') },
          { tipo: 'api', ms: 26, titulo: P('A página pede o que está visível agora', 'The page asks for what is visible now') },
          { tipo: 'api', ms: 12, titulo: P('A TV informa que está no ar e o estado do áudio', 'The TV reports it is on air and the audio state') },
        ], null, () => abrirTv(c));
      }
      function abrirTv(c) {
        const slides = c.ativo ? c.midias.map(k => MID[k]) : [], radio = c.ativo && !!c.radio;
        const tv = { idx: 0, seg: 0, noite: false };
        const quadro = h('div', { class: 'tvf' }), linha = h('p', { class: 'ctv-st' });
        const andar = d => { if (!slides.length) return; tv.idx = (tv.idx + d + slides.length) % slides.length; tv.seg = 0; desenhar(); };
        const nav = (cls, icone, rotulo, d) => h('button', { type: 'button', class: 'tvnav ' + cls, 'data-f': cls, 'aria-label': rotulo, onclick: e => { e.stopPropagation(); andar(d); } }, ic(icone, 16));
        const tela = h('div', { class: 'tvp', tabindex: '0', role: 'group', 'aria-label': P('TV simulada. Setas esquerda e direita trocam de slide.', 'Simulated TV. Left and right arrows change the slide.'),
          onkeydown: e => { if (e.key === 'ArrowLeft') { e.preventDefault(); andar(-1); } else if (e.key === 'ArrowRight') { e.preventDefault(); andar(1); } } },
        quadro, h('div', { class: 'tvnight' }),
        h('div', { class: 'tvradio' }, h('div', { class: 'tveq', 'aria-hidden': 'true' }, h('span'), h('span'), h('span'), h('span')), h('div', { class: 'nm' }, t(P('Tocando agora: ', 'Now playing: ')) + (c.radio || ''))),
        slides.length > 1 && nav('pv', 'chevl', P('Slide anterior', 'Previous slide'), -1), slides.length > 1 && nav('nx', 'chevr', P('Próximo slide', 'Next slide'), 1));
        function desenhar() {
          const s = slides[tv.idx];
          tela.className = 'tvp' + (tv.noite ? ' night' : '') + (radio && !tv.noite ? ' radio' + (s && s.tipo === 'video' ? ' duck' : '') : '');
          if (!s) quadro.replaceChildren(h('div', { class: 'tvvz' }, P('Nenhum conteúdo ativo no momento.', 'No active content at the moment.')));
          else quadro.replaceChildren(h('div', { class: 'tvi', html: (s.tipo === 'image' ? arte(s, true, false, 'bd') : '') + arte(s, false, true, 'md') }));
          linha.textContent = (s ? 'slide ' + (tv.idx + 1) + '/' + slides.length : t(P('tela vazia: carrossel inativo', 'empty screen: inactive carousel')))
            + ' · ' + t(tv.noite ? P('desligamento agendado: tela preta e rádio pausada', 'scheduled switch-off: black screen and radio paused')
              : radio ? P('rádio tocando', 'radio playing') : P('sem rádio neste carrossel', 'no radio on this carousel'));
        }
        desenhar();
        const relogio = setInterval(() => { if (!tela.isConnected) { clearInterval(relogio); return; } if (!tv.noite && ++tv.seg >= SLIDE_S) andar(1); }, 1000);
        let bNoite;
        const rotNoite = () => t(tv.noite ? P('Encerrar o desligamento agendado', 'End the scheduled switch-off') : P('Simular o desligamento agendado', 'Simulate the scheduled switch-off'));
        ui.modal({ titulo: PP(l => (l === 'pt' ? 'Página da TV: ' : 'TV page: ') + L(c.nome, l)), largura: 'g', classe: 'ctv-root', aoFechar: () => clearInterval(relogio),
          corpo: [h('div', { class: 'ctv-bezel' }, tela, h('i')), h('div', { class: 'ctv-pe' }), linha,
            h('p', { class: 'ctv-help' }, P('No sistema real esta página abre sozinha, em tela cheia, em cada aparelho: PC, TV Box Android ou smart TV. A TV busca a grade nova sozinha e troca sem cortar o slide em exibição.', 'In the real system this page opens by itself, full screen, on each device: PC, Android TV box or smart TV. The TV fetches the new grid by itself and switches without cutting the slide on screen.'))],
          acoes: () => [bNoite = btn('secundario', 'moon', rotNoite(), () => { tv.noite = !tv.noite; trocarTexto(bNoite, rotNoite()); desenhar(); }, { f: 'noite' })] });
      }

      /* ---------- faixa da demonstração: a TV instalada sai da tomada e volta ---------- */
      const faixaCorpo = h('div', { class: 'corpo' });
      const faixa = h('details', { class: 'ctv-demo', open: est.demoAberto !== false, ontoggle: e => { est.demoAberto = !!e.target.open; } },
        h('summary', null, ic('sliders', 12), h('span', null, P('Controles da demonstração', 'Demo controls')), h('span', { class: 'nota' }, P('não fazem parte do sistema real', 'not part of the real system')), ic('chevd', 12)),
        faixaCorpo);
      const alvo = () => db.carrosseis.find(c => c.id === est.alvo) || db.carrosseis[0];
      const rotTomada = () => t(alvo().tvOnline ? P('Desligar a TV da tomada', 'Unplug the TV') : P('Religar a TV', 'Plug the TV back in'));
      let bTomada;
      function tomada() {
        const c = alvo(), cai = c.tvOnline;
        rastro(P('Vigia das TVs', 'TV watcher'), c.nome, cai ? [
          { tipo: 'job', ms: 4, titulo: P('O vigia confere o sinal de cada TV', 'The watcher checks the signal of each TV') },
          { tipo: 'regra', ms: 5, estado: 'alerta', titulo: P('Confirma a queda antes de avisar, sem alarme falso por oscilação de rede', 'Confirms the drop before notifying, with no false alarm from a network hiccup') },
          { tipo: 'sql', ms: 14, titulo: P('Marca a TV como sem sinal', 'Marks the TV as without signal') },
          { tipo: 'email', ms: 540, titulo: P('Avisa o responsável por e-mail (na demonstração nada é enviado)', 'Emails the person in charge (nothing is sent in the demo)') },
        ] : [
          { tipo: 'job', ms: 4, titulo: P('O vigia confere o sinal de cada TV', 'The watcher checks the signal of each TV') },
          { tipo: 'sql', ms: 14, titulo: P('Marca a TV como online', 'Marks the TV as online') },
          { tipo: 'email', ms: 540, titulo: P('Avisa o responsável que a TV voltou (na demonstração nada é enviado)', 'Tells the person in charge the TV is back (nothing is sent in the demo)') },
        ], () => {
          c.tvOnline = !cai;
          pintarGrade();
          trocarTexto(bTomada, rotTomada());
          ui.toast(PP(l => (l === 'pt' ? 'Vigia: ' : 'Watcher: ') + L(c.nome, l) + (cai ? (l === 'pt' ? ' sem sinal' : ' lost signal') : (l === 'pt' ? ' voltou' : ' is back'))), cai ? 'alerta' : 'ok');
        }, null, 'update');
      }
      function pintarFaixa() {
        const sel = ui.select({ rotulo: P('TV instalada', 'Installed TV'), valor: String(alvo().id), opcoes: db.carrosseis.map(c => ({ valor: String(c.id), texto: c.nome })),
          aoMudar: x => { est.alvo = Number(x); trocarTexto(bTomada, rotTomada()); } });
        sel.input.setAttribute('data-f', 'alvo');
        bTomada = btn('secundario', 'power', rotTomada(), tomada, { p: true, f: 'tomada' });
        faixaCorpo.replaceChildren(sel, bTomada,
          h('span', { class: 'txt' }, P('No sistema real ninguém aperta botão: um vigia no servidor confere as TVs sozinho e avisa quando uma tela fica sem sinal e quando volta. "Visualizar" abre a TV simulada.', 'In the real system nobody presses a button: a watcher on the server checks the TVs by itself and notifies when a screen loses signal and when it is back. "View" opens the simulated TV.')));
      }

      /* ---------- casca: faixa, abas do sistema e a tela ativa ---------- */
      const ABAS = [
        { id: 'carrosseis', icone: 'grid', rotulo: P('Carrosséis', 'Carousels') },
        { id: 'midias', icone: 'images', rotulo: P('Mídias', 'Media') },
        { id: 'config', icone: 'settings', rotulo: P('Configurações', 'Settings') },
      ];
      pintarFaixa();
      const abas = ui.abas({ chave: 'aba', rotulo: P('Seções do Carrossel TV', 'Carousel TV sections'), aoTrocar: id => { faixa.hidden = id !== 'carrosseis'; },
        abas: ABAS.map(a => ({ id: a.id, icone: IC[a.icone], rotulo: a.rotulo, montar: painel => {
          previas = [];
          if (a.id === 'carrosseis') telaLista(painel); else painel.append(h('div', { class: 'ctv-page' }, fora(a.rotulo)));
        } })) });
      abas.classList.add('ctv-nav');
      abas.querySelectorAll('[role="tab"]').forEach((b, i) => b.setAttribute('data-f', 'aba-' + ABAS[i].id));
      faixa.hidden = (est.aba || 'carrosseis') !== 'carrosseis';
      el.append(h('div', { class: 'ctv-root ctv-app' }, faixa, abas));

      /* a prévia dos cartões gira a cada 4 s; com movimento reduzido fica parada no primeiro slide */
      const relogio = semMov() ? null : setInterval(() => previas.forEach(st => {
        if (st.prev.length > 1 && st.el.isConnected) { st.idx = (st.idx + 1) % st.prev.length; pintarPrevia(st); }
      }), PREVIEW_MS);
      return () => { if (relogio) clearInterval(relogio); previas = []; };
    },
  });
})();
