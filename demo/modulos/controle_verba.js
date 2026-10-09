/* Controle de verba · versão pública curta do módulo (id controle_verba) para o site.
   Só a tela principal (Controle de Verba) é navegável, com dados fictícios já prontos; as telas da Base Orçamentária
   continuam na navegação e mostram o cartão "fora da demonstração". Visual do kit do hub, só tokens --ph-*,
   nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const S = (tipo, titulo, ms) => ({ tipo, titulo, ms });
  const HOJE = new Date();
  const ANO = HOJE.getFullYear(), MESN = HOJE.getMonth(), PROX = ANO + 1;
  const pad = n => String(n).padStart(2, '0');
  const iso = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const deIso = s => new Date(s + 'T00:00:00');
  const mm = d => pad(d.getMonth() + 1) + '/' + d.getFullYear();
  const r2 = v => Math.round(v * 100) / 100;
  const soma = a => a.reduce((x, y) => x + y, 0);
  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const pct = (parte, todo) => (todo > 0 ? parte / todo * 100 : 0);
  const lim = v => Math.max(0, Math.min(100, v));

  const IC = {
    chevl: '<path d="m15 18-6-6 6-6"/>', chevr: '<path d="m9 18 6-6-6-6"/>', chevd: '<path d="m6 9 6 6 6-6"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
    sliders: '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    handcoins: '<path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/>',
    dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  };

  /* um bloco de estilo (#cvb-css), todo seletor prefixado por .cvb, só com tokens --ph-* e nenhuma regra por tema */
  const ROT = 'font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const CSS = [
    '.cvb{min-width:0}.cvb [hidden]{display:none!important}.cvb p{margin:0}.cvb.x-shell{color:var(--ph-text);font-size:13.5px;line-height:1.5}',
    '.cvb .x-ic{display:inline-flex;flex:none}.cvb .x-ic svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.cvb .num{font-variant-numeric:tabular-nums lining-nums}.cvb .mono{font-family:var(--ph-font-mono);font-variant-numeric:tabular-nums}.cvb .neg{color:var(--ph-erro)}',
    '.cvb .acbtn:focus-visible,.cvb .x-erp:focus-visible{outline:var(--ph-foco-largura) solid var(--ph-focus);outline-offset:2px}',
    '.cvb .hint{font-size:12px;color:var(--ph-text-dim)}',
    /* faixa "Controles da demonstração" e botões tracejados (só existem na demonstração) */
    '.cvb .x-demo{border-bottom:1px dashed var(--ph-border-soft);background:var(--ph-surface);font-size:13px;color:var(--ph-text-muted)}',
    '.cvb .x-demo summary{cursor:pointer;padding:8px 16px;display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;list-style:none;' + ROT + ';color:var(--ph-text-dim)}.cvb .x-demo summary:focus-visible{outline-offset:-2px}',
    '.cvb .x-demo summary::-webkit-details-marker{display:none}.cvb .x-demo summary .nota{font:400 12px/1.5 var(--ph-font);letter-spacing:0;text-transform:none;font-stretch:100%}.cvb .x-demo[open] summary .x-ic:last-child{transform:rotate(180deg)}',
    '.cvb .x-demo .corpo{display:flex;flex-direction:column;gap:8px;padding:2px 16px 12px}.cvb .x-demo .ln{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;min-width:0}',
    '.cvb .x-demo .rt{' + ROT + ';color:var(--ph-text-dim);min-width:96px}.cvb .x-demo .dim{font-size:12.5px;color:var(--ph-text-dim)}',
    '.cvb .x-erp{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border:1px dashed currentColor;border-radius:var(--ph-raio);background:none;color:var(--ph-accent-light);font:inherit;font-size:11.5px;font-weight:600;line-height:1.6;white-space:nowrap;vertical-align:middle;cursor:pointer}.cvb .x-erp:hover{background:var(--ph-accent-soft)}',
    '.cvb .x-aids{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin-top:12px}.cvb .x-aids .x-leg{font-size:11.5px;color:var(--ph-text-dim)}',
    /* barra do painel */
    '.cvb.cv .cv-head{display:flex;align-items:center;gap:8px 10px;flex-wrap:wrap;margin-bottom:16px}.cvb.cv .cv-head .spacer{flex:1 1 0}.cvb.cv .unsel.ph-input{width:auto;min-width:9.5rem}',
    '.cvb.cv .flt{display:flex;align-items:center;gap:6px;flex-wrap:wrap;max-width:100%;padding:4px 6px;border:1px solid var(--ph-border);border-radius:var(--ph-raio);background:var(--ph-card)}',
    '.cvb.cv .flt .lbl{' + ROT + ';color:var(--ph-text-dim)}.cvb.cv .flt .ph-input{width:auto;height:2rem;min-height:2rem;font-size:12.5px}.cvb.cv .flt .mes-atual{min-width:5.5rem}',
    /* sino: ações do robô */
    '.cvb .cfgwrap{position:relative}.cvb .bell{position:relative}.cvb .bell .ponto{position:absolute;top:5px;right:5px;width:7px;height:7px;border-radius:50%;background:var(--ph-erro);box-shadow:0 0 0 2px var(--ph-card)}',
    '.cvb .cfg-pop{position:absolute;right:0;top:calc(100% + 8px);z-index:60;width:360px;max-width:calc(100vw - 32px);padding:14px 16px;text-align:left;font-size:13px;color:var(--ph-text);background:var(--ph-card);border:1px solid var(--ph-border);border-radius:var(--ph-raio-lg);box-shadow:var(--ph-sombra-alta)}',
    '.cvb .cfg-pop h5{margin:0 0 10px;font-size:13.5px;font-weight:700;line-height:1.4;color:var(--ph-text)}',
    '.cvb .sino-row{display:flex;gap:8px;align-items:baseline;padding:3px 0;font-size:12px;color:var(--ph-text-2)}.cvb .sino-row .a{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cvb .sino-row .v{flex:none;font-weight:600}',
    '.cvb .sino-pop{width:380px}.cvb .sino-list{max-height:330px;overflow-y:auto;overscroll-behavior:contain}.cvb .sino-g{margin:8px 0 3px;padding-top:7px;border-top:1px solid var(--ph-border);' + ROT + ';color:var(--ph-text-dim)}.cvb .sino-list .sino-g:first-child{margin-top:0;padding-top:0;border-top:0}',
    /* saldo disponível e composição da verba */
    '.cvb.cv .wrap{display:flex;flex-direction:column;gap:16px}',
    '.cvb.cv .hero.ph-card{display:grid;grid-template-columns:minmax(200px,270px) minmax(0,1fr);gap:22px 32px;align-items:center;padding:20px 22px}',
    '.cvb.cv .hero .lbl{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:600;color:var(--ph-text-muted)}.cvb.cv .hero .lbl .d{width:9px;height:9px;border-radius:2px;background:var(--ph-vivo-verde)}',
    '.cvb.cv .hero .big{margin:8px 0;font-family:var(--ph-font-display);font-weight:var(--ph-display-weight);font-size:calc(40px * var(--ph-display-scale));line-height:1.05;letter-spacing:var(--ph-display-tracking);color:var(--ph-cor-verde);overflow-wrap:anywhere}',
    '.cvb.cv .hero .big.m{font-size:calc(30px * var(--ph-display-scale))}.cvb.cv .hero .big.p{font-size:calc(23px * var(--ph-display-scale))}.cvb.cv .hero .big.neg{color:var(--ph-erro)}.cvb.cv .hero .cur{margin-right:5px;font-size:.5em;color:var(--ph-text-dim)}',
    '.cvb.cv .hero .sub{font-size:12.5px;color:var(--ph-text-muted)}.cvb.cv .hero .sub b{font-weight:650;color:var(--ph-text)}',
    '.cvb.cv .compo{min-width:0}.cvb.cv .compo .cap{display:flex;justify-content:space-between;align-items:baseline;gap:10px;flex-wrap:wrap;margin-bottom:10px}.cvb.cv .compo .cap span{font-size:12.5px;font-weight:600;color:var(--ph-text-muted)}.cvb.cv .compo .cap em{font-style:normal;font-size:12px;color:var(--ph-text-dim)}',
    '.cvb.cv .bar{display:flex;height:22px;overflow:hidden;border-radius:var(--ph-raio);background:var(--ph-card-2);border:1px solid var(--ph-border-soft)}.cvb.cv .bar .seg-b{height:100%;width:0}.cvb.cv .bar .seg-b+.seg-b{border-left:2px solid var(--ph-card)}',
    '.cvb.cv .bar .b-real{background:var(--ph-vivo-azul)}.cvb.cv .bar .b-res{background:var(--ph-vivo-ambar)}.cvb.cv .bar .b-sal{flex:1;background:var(--ph-vivo-verde)}',
    '.cvb.cv .legend{display:flex;flex-wrap:wrap;gap:12px 26px;margin-top:14px}.cvb.cv .legend .it{display:flex;align-items:center;gap:8px}.cvb.cv .legend .k{flex:none;width:10px;height:10px;border-radius:2px}.cvb.cv .legend .t{font-size:12px;color:var(--ph-text-muted)}.cvb.cv .legend .v{font:700 15px/1.3 var(--ph-font-mono);color:var(--ph-text)}',
    '.cvb.cv .k.k-plan{background:var(--ph-neutro)}.cvb.cv .k.k-res{background:var(--ph-vivo-ambar)}.cvb.cv .k.k-real{background:var(--ph-vivo-azul)}.cvb.cv .k.k-sal{background:var(--ph-vivo-verde)}',
    /* verba por conta: cartão do kit com a tabela do kit */
    '.cvb.cv .panel.ph-card{padding:0;gap:0}.cvb.cv .panel .ph{padding:14px 18px;border-bottom:1px solid var(--ph-border)}.cvb.cv .panel .ph .ph-linha{gap:8px 12px}.cvb.cv .panel .ph-busca{width:230px;max-width:100%}',
    '.cvb.cv .x-rx{overflow-x:auto;min-width:0;container-type:inline-size}.cvb .acct th.is-num>span{justify-content:flex-end}.cvb .acct>tbody>tr>td{text-align:right}.cvb .acct>tbody>tr>td:first-child{text-align:left}',
    '.cvb .acct .code{padding:2px 7px;border-radius:var(--ph-raio);font:600 12px/1.4 var(--ph-font-mono);color:var(--ph-accent-light);background:var(--ph-accent-soft)}.cvb .acct .name{display:block;margin-top:4px;font-weight:600;color:var(--ph-text)}',
    '.cvb .acct .acbtn{display:block;margin:0;padding:0;border:0;border-radius:var(--ph-raio);background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}',
    '.cvb .acct .money{font-weight:650;white-space:nowrap;color:var(--ph-text)}.cvb .acct .money.res{color:var(--ph-cor-ambar)}.cvb .acct .money.real{color:var(--ph-cor-azul)}.cvb .acct .money.sal{color:var(--ph-cor-verde)}.cvb .acct .money.neg{color:var(--ph-erro)}',
    '.cvb .acct .gauge-cell{min-width:180px}.cvb .gauge{display:flex;height:8px;margin-bottom:6px;overflow:hidden;border-radius:999px;background:var(--ph-card-2)}.cvb .gauge .g{height:100%;width:0}.cvb .gauge .g-real{background:var(--ph-vivo-azul)}.cvb .gauge .g-res{background:var(--ph-vivo-ambar)}',
    '.cvb .gline{display:flex;justify-content:space-between;align-items:center}.cvb .pct{display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--ph-text-muted)}.cvb .pct .dot{width:7px;height:7px;border-radius:50%}.cvb .dot.ok{background:var(--ph-ok)}.cvb .dot.warn{background:var(--ph-alerta)}.cvb .dot.crit{background:var(--ph-erro)}',
    '.cvb .acct tr.clk{cursor:pointer}.cvb .acct>tbody>tr.aberta>td{background:var(--ph-accent-soft)}.cvb .acct>tbody>tr.det-row>td{padding:0;text-align:left;white-space:normal;background:var(--ph-surface);box-shadow:none}.cvb .det{position:sticky;left:0;box-sizing:border-box;width:100cqw;padding:14px 16px}',
    '.cvb .acct>tbody>tr.foot-row>td{background:var(--ph-surface);border-top:2px solid var(--ph-border);font-weight:700}',
    /* extrato da conta */
    '.cvb .det .det-tot{display:flex;gap:6px 18px;flex-wrap:wrap;align-items:center;margin-bottom:10px;font-size:12.5px;color:var(--ph-text-muted)}.cvb .det .det-tot b{margin-left:5px;font-weight:700;color:var(--ph-text)}',
    '.cvb .det-tot b.c-res{color:var(--ph-cor-ambar)}.cvb .det-tot b.c-real{color:var(--ph-cor-azul)}.cvb .det-tot b.c-sal{color:var(--ph-cor-verde)}.cvb .det-tot b.c-neg{color:var(--ph-erro)}.cvb .det-tot .falta.ph-badge b{margin-left:4px;color:inherit}',
    '.cvb .det-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}.cvb .det-cols>div{min-width:0}.cvb .det-cols .fila-box{grid-column:1 / -1}',
    '@media (min-width:901px){.cvb .det-cols .fila-box{grid-column:2}}',
    '.cvb .det h4{display:flex;align-items:center;gap:5px;margin:8px 0 4px;' + ROT + ';color:var(--ph-text-dim)}',
    '.cvb .det-cofre,.cvb .fila-box{padding:10px 14px 12px;border:1px solid color-mix(in srgb,var(--tom) 40%,var(--ph-border));border-radius:var(--ph-raio-lg);background:color-mix(in srgb,var(--tom) 7%,var(--ph-card))}.cvb .det-cofre{--tom:var(--ph-alerta)}.cvb .fila-box{--tom:var(--ph-erro);margin-top:12px}',
    '.cvb .det-cofre h4,.cvb .fila-box h4{margin-top:2px;color:var(--tom)}.cvb .cofre-tot{margin:0 0 8px;font-size:12.5px;color:var(--ph-text-2)}.cvb .cofre-tot b{margin-left:6px;font:700 16px/1.3 var(--ph-font-mono);color:var(--ph-text)}.cvb .fila-note{margin-top:6px;font-size:12px;font-style:italic;color:var(--ph-text-2)}',
    '.cvb .det-scroll{max-height:336px;overflow-y:auto;overscroll-behavior:contain;padding-right:4px}.cvb .det-tab{width:100%;border-collapse:collapse}',
    '.cvb .acct .det-tab td{padding:5px 6px;border-top:1px solid var(--ph-border-soft);border-bottom:0;font-size:12.5px;text-align:left;vertical-align:middle;white-space:normal;background:none;box-shadow:none}',
    '.cvb .acct .det-tab td.r{text-align:right;font-weight:650;white-space:nowrap}.cvb .acct .det-tab td.mono{white-space:nowrap}.cvb .det-dt{font-size:12px;color:var(--ph-text-dim)}.cvb .det-cofre .det-dt{min-width:130px}.cvb .det-vazio{margin:2px 0 6px;font-size:12.5px;color:var(--ph-text-dim)}.cvb .det-tab .ph-badge .x-ic{width:11px;height:11px}',
    '.cvb.cv .state.ph-card{padding:8px}.cvb.dsp.x-tela{padding:0}',
    /* responsivo */
    '@media (max-width:1100px){.cvb .cfg-pop{position:fixed;left:12px;right:12px;top:auto;bottom:12px;width:auto;max-width:580px;max-height:76vh;margin:0 auto;overflow:auto}}',
    '@media (max-width:1080px){.cvb.cv .hero.ph-card{grid-template-columns:minmax(0,1fr)}}',
    '@media (max-width:900px){.cvb .det-cols{grid-template-columns:minmax(0,1fr)}}',
    '@media (max-width:760px){.cvb .acct .gauge-cell{display:none}.cvb .det{padding:12px 10px}.cvb.cv .legend{gap:12px 20px}.cvb.cv .hero.ph-card{padding:16px}}',
    '@media (max-width:640px){.cvb .x-demo .corpo{padding-inline:12px}.cvb.cv .cv-head .spacer{display:none}}',
    '@media (prefers-reduced-motion:reduce){.cvb *{transition:none!important}}',
  ].join('\n');
  function injetarCss() {
    if (document.getElementById('cvb-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'cvb-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- dados de exemplo, fictícios e prontos ---------- */
  const UNS = [['010', P('Matriz', 'Head office')], ['020', P('Filial Norte', 'North branch')], ['030', P('Filial Sul', 'South branch')], ['040', P('Centro de distribuição', 'Distribution center')]];
  /* [conta, descrição, planejado, previsto, realizado, faixa de consumo] no mês, todas as unidades; acima = nota acima da OC, fila = nota aguardando liberação */
  const CONTAS = [
    [6305, P('Energia elétrica', 'Electricity'), 22000, 0, 14600, 'warn'],
    [6205, P('Manutenção de máquinas e equipamentos', 'Machinery and equipment maintenance'), 18000, 5400, 9800, 'crit', { acima: 1240 }],
    [6405, P('Fretes sobre vendas', 'Freight on sales'), 16000, 1800, 6200, 'ok'],
    [6520, P('Serviços de terceiros', 'Outsourced services'), 14000, 4200, 3900, 'warn'],
    [6105, P('Material de consumo', 'Consumables'), 12000, 3200, 5100, 'warn'],
    [6545, P('Embalagens', 'Packaging'), 10000, 2600, 2700, 'ok'],
    [6320, P('Licenças de software', 'Software licenses'), 9000, 2500, 3100, 'warn'],
    [6325, P('Equipamentos de informática', 'IT equipment'), 8000, 6100, 0, 'warn'],
    [6210, P('Manutenção predial', 'Building maintenance'), 7000, 1500, 1700, 'ok'],
    [6420, P('Viagens e hospedagem', 'Travel and lodging'), 6000, 0, 2300, 'ok'],
    [6510, P('Equipamentos de proteção individual', 'Personal protective equipment'), 5000, 900, 1650, 'ok'],
    [6425, P('Feiras e eventos', 'Trade shows and events'), 4000, 1500, 3350, 'crit', { fila: true }],
  ].map(([cod, nome, plan, prev, real, faixa, x], i) => ({ i, codigo: String(cod), nome, plan, prev, real, faixa, ...(x || {}) }));
  /* variação só de demonstração: o mesmo quadro muda de escala com o período e a unidade escolhidos */
  const PESO_UN = { todas: 1, '010': 0.42, '020': 0.23, '030': 0.2, '040': 0.15 };
  /* ações do sino, já roteirizadas: [dias, hora, ação, valor] */
  const SINO = [
    [0, '09:30', P('Reserva registrada · OC 4507', 'Reservation recorded · PO 4507'), 3120],
    [0, '09:30', P('Nota entrou: reserva baixada · NF 18010', 'Invoice posted: reservation closed · Invoice 18010'), 1950],
    [0, '08:00', P('Aviso de estouro enviado · conta 6425', 'Overrun alert sent · account 6425'), 0],
    [-1, '17:30', P('Nota liberada: compras avisado · NF 18064', 'Invoice released: purchasing notified · Invoice 18064'), 0],
    [-1, '17:30', P('Reserva registrada · OC 4561', 'Reservation recorded · PO 4561'), 2400],
  ];
  let ciclosNovos = [];   // ciclos encenados pelo botão Atualizar; sobrevivem à troca de idioma

  Hub.registrar({
    id: 'controle_verba',
    ordem: 3,
    grupo: P('Fiscal e financeiro', 'Tax and finance'),
    icone: 'dinheiro',
    nome: P('Controle de verba', 'Budget control'),
    resumo: P(
      'Verba de cada conta em uma tela: planejado, previsto, realizado e saldo, com um robô que acompanha as ordens de compra, aviso de estouro e a base orçamentária do ano seguinte, montada com os gestores.',
      'The budget of each account on one screen: planned, committed, actual and balance, with a robot that follows purchase orders, overrun alerts and next year\'s budget base, built with the managers.'
    ),
    manual: {
      pt: {
        destaque: 'O Controle de Verba mostra, conta por conta, quanto foi planejado, quanto já está comprometido em ordens de compra e quanto virou despesa, para o gestor saber quanto ainda cabe antes de comprar. A Base Orçamentária fecha o ciclo: os gestores montam o orçamento do ano seguinte mês a mês, o Financeiro aprova e tudo fica com histórico.',
        oque: 'O problema. A verba de cada conta era planejada no ERP, mas nenhuma tela respondia a pergunta do dia a dia: quanto ainda cabe nesta conta antes de comprar? Notas de ordens de compra ficavam presas por falta de verba, o financeiro parava para destravar e o orçamento do ano seguinte circulava em planilhas por e-mail.\n\nO que o sistema faz. Para o período e a unidade escolhidos, o painel mostra o planejado, o previsto, o realizado e o saldo de cada conta; ao abrir a conta aparece o extrato com as ordens de compra e as notas. Um robô acompanha cada ordem de compra até a nota chegar, destrava casos de verba presa e avisa estouro a quem pediu e a quem aprovou. O planejado do ERP nunca é alterado e tudo nasceu em modo sombra. Com o robô de notas fiscais, a verba nunca é contada duas vezes.\n\nNesta demonstração pública, a tela principal do Controle de Verba funciona com dados fictícios; as telas da Base Orçamentária ficam fora da demonstração.',
        finalidade: 'Dar ao gestor, em uma tela, o número que antes exigia uma consulta ao financeiro: quanto ainda cabe nesta conta. Trocar o conserto depois do problema pela visão antes da compra, e as planilhas por e-mail por um fluxo único de orçamento, com histórico.\n\nProjetado e construído por Ruan Siqueira.',
        alcance: [
          'Painel por conta com planejado, previsto, realizado, saldo e consumo, por período e por unidade de negócio',
          'Extrato da conta com as ordens de compra, as notas e o que aguarda liberação',
          'Robô que acompanha cada ordem de compra e avisa estouro a quem pediu e a quem aprovou',
          'Orçamento anual montado pelos gestores, com envio, aprovação e histórico',
          'Validação: o realizado bateu com a planilha de orçamento em 30 de 30 valores, ao centavo',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript'],
      },
      en: {
        destaque: 'Budget Control shows, account by account, how much was planned, how much is already committed in purchase orders and how much has become expense, so managers know how much still fits before buying. Budget Base closes the cycle: managers build next year\'s budget month by month, Finance approves and everything keeps a history.',
        oque: 'The problem. The budget of each account was planned in the ERP, but the everyday question had no answer on a single screen: how much still fits in this account before buying? Purchase order invoices got stuck for lack of budget, finance stopped to unblock them and next year\'s budget travelled in spreadsheets by email.\n\nWhat the system does. For the chosen period and business unit, the dashboard shows the planned, committed, actual and balance of each account; opening an account shows its statement with the purchase orders and invoices. A robot follows each purchase order until the invoice arrives, unblocks stuck budget cases and alerts overruns to whoever requested and whoever approved. The planned amount in the ERP is never changed and everything started in shadow mode. Together with the invoice robot, the budget is never counted twice.\n\nIn this public demo, the main Budget Control screen works on fictitious data; the Budget Base screens are outside the demo.',
        finalidade: 'Give managers, on one screen, the answer that used to require a call to finance: how much still fits in this account. Replace the fix after the problem with the view before the purchase, and the spreadsheets sent by email with a single budget flow, with history.\n\nDesigned and built by Ruan Siqueira.',
        alcance: [
          'Dashboard per account with planned, committed, actual, balance and usage, by period and business unit',
          'Account statement with the purchase orders, the invoices and what awaits release',
          'A robot that follows each purchase order and alerts overruns to whoever requested and whoever approved',
          'Yearly budget built by the managers, with submit, approval and history',
          'Validation: actuals matched the budget spreadsheet in 30 of 30 values, to the cent',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript'],
      },
    },
    /* mini tour: só ganchos do módulo (.cvb, data-f), nada que dependa do idioma. O 1o passo volta ao Controle de Verba
       (o tour termina na Base Orçamentária e o estado sobrevive); o 3o abre a primeira entre 6205 e 6425 que estiver fechada. */
    tour: [
      { alvo: '.cvb [data-f="sis-verba"]', acao: 'clicar', titulo: P('Quanto ainda cabe na conta?', 'How much still fits in the account?'),
        texto: P('Antes, o gestor perguntava ao financeiro antes de cada compra. Agora o Controle de Verba mostra isso em uma tela, conta por conta.',
          'Managers used to ask finance before every purchase. Now Budget Control shows it on one screen, account by account.') },
      { alvo: '.cvb .hero', titulo: P('O saldo em primeiro lugar', 'The balance comes first'),
        texto: P('Para o período e a unidade escolhidos na barra de cima, o saldo disponível vem em destaque. Ao lado, a verba dividida em realizado, previsto em ordens de compra e livre.',
          'For the period and business unit picked in the bar above, the available balance stands out. Next to it, the budget split into actual, committed in purchase orders and free.') },
      { alvo: '.cvb tr.clk:not(.aberta) [data-f="conta-6205"], .cvb tr.clk:not(.aberta) [data-f="conta-6425"]', acao: 'clicar', titulo: P('Conta por conta', 'Account by account'),
        texto: P('Cada linha traz planejado, previsto, realizado, saldo e consumo, com a cor do risco. Um clique na conta abre o extrato.',
          'Each row shows planned, committed, actual, balance and usage, coloured by risk. One click on the account opens its statement.') },
      { alvo: '.cvb .det', titulo: P('O extrato e o cofre do robô', 'The statement and the robot vault'),
        texto: P('Ordens de compra e notas da conta, ao lado do cofre com o que o robô reservou. Se a conta estoura, ele avisa quem pediu e quem aprovou; o sino no topo conta cada ciclo.',
          'Purchase orders and invoices of the account, next to the vault with what the robot reserved. If the account overruns, it alerts whoever requested and whoever approved; the bell at the top lists every cycle.') },
      { alvo: '.cvb [data-f="sis-base"]', acao: 'clicar', titulo: P('E o orçamento do ano seguinte', 'And next year\'s budget'),
        texto: P('Na Base Orçamentária os gestores montam o orçamento mês a mês, o Financeiro aprova e tudo fica com histórico. Nada de planilha por e-mail.',
          'In Budget Base managers build the budget month by month, Finance approves and everything keeps a history. No more spreadsheets by email.') },
      { alvo: '.cvb .ph-fora', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('A demonstração pública mostra a tela principal. Quer ver o sistema inteiro funcionando? É só me chamar por aqui.',
          'The public demo shows the main screen. Want to see the whole system running? Just reach me from here.') },
    ],

    montar(el, api) {
      injetarCss();
      const { t, h, ui, fmt } = api;
      const E = api.estado;
      const n2z = v => fmt.num(v || 0, 2), rs = v => 'R$ ' + n2z(v);
      const MES = Array.from({ length: 12 }, (_, i) => fmt.mes(new Date(2001, i, 1)));
      const OCp = t(P('OC ', 'PO ')), NFp = t(P('NF ', 'Invoice '));
      const filhos = (...f) => f.flat(Infinity).filter(x => x != null && x !== false && x !== '');
      const ic = (nome, tam = 14) => h('span', { class: 'x-ic', 'aria-hidden': 'true', style: 'width:' + tam + 'px;height:' + tam + 'px', html: '<svg viewBox="0 0 24 24" focusable="false">' + (IC[nome] || IC.info) + '</svg>' });
      const e = (tag, classe, ...kids) => h(tag, classe ? { class: classe } : null, ...kids);
      const CAMPO = ui.campo({}).input.className, TAB = ui.tabela({ colunas: [], busca: false }).querySelector('table').className;
      const fora = titulo => (api.ui.foraDaDemo ? api.ui.foraDaDemo({ titulo })
        : ui.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is outside the public demo.') }));
      let raiz = null;

      const btn = (texto, aoClicar, o = {}) => {
        const b = ui.botao({ texto, aoClicar, icone: o.ic && IC[o.ic], tom: o.tom || 'secundario', tamanho: o.grande ? null : 'p', titulo: o.titulo, classe: 'btn' + (o.classe ? ' ' + o.classe : '') });
        if (o.aria) b.setAttribute('aria-label', t(o.aria));
        if (o.expandido != null) b.setAttribute('aria-expanded', String(o.expandido));
        if (o.foco) b.setAttribute('data-f', o.foco);
        return b;
      };
      const botaoErp = (rot, fn, titulo) => h('button', { type: 'button', class: 'x-erp', title: titulo || P('Recurso da demonstração: abre a janela do ERP simulado', 'Demo aid: opens the simulated ERP window'), onclick: ev => { ev.stopPropagation(); fn(); } }, ic('eye', 11), rot);
      const botaoConsulta = fn => h('button', { type: 'button', class: 'x-erp', title: P('Recurso da demonstração: mostra, passo a passo, o que o servidor faz nesta consulta', 'Demo aid: shows, step by step, what the server does for this query'), onclick: ev => { ev.stopPropagation(); fn(); } }, ic('server', 11), P('O que o servidor faz', 'What the server does'));
      const cartao = (cls, ...kids) => ui.cartao({ classe: cls, conteudo: filhos(kids) });
      const selo = (tom, tx, titulo, icn) => { const s = ui.badge(tx, tom); s.classList.add('badge'); if (titulo) s.setAttribute('title', t(titulo)); if (icn) s.append(ic(icn, 11)); return s; };

      /* ---------- período e unidade ---------- */
      const janela = p => (p === 'ano' ? { de: ANO + '-01-01', ate: ANO + '-12-31' } : { de: iso(new Date(ANO, MESN, 1)), ate: iso(new Date(ANO, MESN + 1, 0)) });
      if (!E.de) Object.assign(E, janela('mes'));
      if (!E.un) E.un = 'todas';
      function rotuloPeriodo() {
        const d = deIso(E.de), a = deIso(E.ate);
        if (isNaN(d) || isNaN(a)) return t(P('período', 'period'));
        if (d.getDate() === 1 && d.getMonth() === a.getMonth() && d.getFullYear() === a.getFullYear() && a.getDate() === new Date(a.getFullYear(), a.getMonth() + 1, 0).getDate()) return MES[d.getMonth()].toLowerCase() + '/' + d.getFullYear();
        if (E.de === d.getFullYear() + '-01-01' && E.ate === d.getFullYear() + '-12-31') return String(d.getFullYear());
        return t(P('período', 'period'));
      }
      function quadro() {
        const de = deIso(E.de); let ate = deIso(E.ate);
        if (isNaN(ate) || ate < de) ate = de;
        if (isNaN(de) || de.getFullYear() > PROX || ate.getFullYear() < ANO) return { de, ate, contas: [] };
        const k = Math.max(1, (ate.getFullYear() - de.getFullYear()) * 12 + ate.getMonth() - de.getMonth() + 1) * PESO_UN[E.un];
        return { de, ate, contas: CONTAS.map(c => ({ ...c, plan: r2(c.plan * k), prev: r2(c.prev * k), real: r2(c.real * k), acima: c.acima ? r2(c.acima * k) : 0 })) };
      }
      /* documentos do extrato, montados a partir da linha da conta: duas OCs em aberto e três notas */
      function docsDe(c) {
        const oc = n => String(4500 + c.i * 6 + n), nf = n => 18000 + c.i * 9 + n;
        const a = r2(c.prev * 0.6), b = r2(c.real * 0.5), d = r2(c.real * 0.3);
        const ocs = c.prev > 0 ? [{ oc: oc(1), valor: a }, { oc: oc(2), valor: r2(c.prev - a) }] : [];
        const notas = c.real > 0 ? [{ nf: nf(1), oc: oc(3), valor: b, acima: c.acima }, { nf: nf(2), oc: oc(4), valor: d }, { nf: nf(3), valor: r2(c.real - b - d), pendente: !!c.fila }] : [];
        return { ocs, notas, fila: notas.filter(x => x.pendente) };
      }

      /* ---------- rastros e janela do ERP (só o essencial de cada passo) ---------- */
      const rastroPainel = q => ui.backend({ titulo: P('Montar o painel de verba', 'Build the budget dashboard'), subtitulo: fmt.data(q.de) + ' - ' + fmt.data(q.ate),
        passos: [S('erp', P('Lê do ERP o planejado, o previsto e o realizado de cada conta', 'Reads planned, committed and actual for each account from the ERP'), 420), S('regra', P('Calcula saldo e consumo', 'Computes balance and usage'), 40), S('api', P('Devolve só o que o seu papel pode ver', 'Returns only what your role can see'), 20)],
        resumo: P('Painel montado só com leitura no ERP.', 'Dashboard built with reads on the ERP only.') });
      const rastroConta = c => ui.backend({ titulo: P('Montar o extrato da conta', 'Build the account statement'), subtitulo: c.codigo + ' · ' + t(c.nome),
        passos: [S('erp', P('Lê as ordens de compra e as notas da conta', 'Reads the purchase orders and invoices of the account'), 310), S('sql', P('Lê as reservas do cofre', 'Reads the vault reservations'), 60), S('api', P('Devolve o extrato', 'Returns the statement'), 15)],
        resumo: P('Extrato montado só com leitura.', 'Statement built with reads only.') });
      function erpOc(num, total) {
        const i1 = r2(total * 0.6), linhas = [[1, P('Item de catálogo 01', 'Catalog item 01'), 4, r2(i1 / 4), i1], [2, P('Item de catálogo 02', 'Catalog item 02'), 1, r2(total - i1), r2(total - i1)]];
        ui.erp({
          programa: P('Ordem de compra', 'Purchase order'), codigo: 'ERP-0205', consulta: true, largura: 860, colunas: 6,
          campos: [{ rotulo: P('Ordem', 'Order'), valor: num }, { rotulo: P('Situação', 'Status'), valor: P('Aprovada', 'Approved') }, { rotulo: P('Emissão', 'Issued'), valor: fmt.data(api.data(-12)) },
            { rotulo: P('Fornecedor', 'Supplier'), valor: P('Fornecedor ' + 'ABCDEFGH'[Number(num) % 8], 'Supplier ' + 'ABCDEFGH'[Number(num) % 8]), largura: 2 }, { rotulo: P('Total da ordem', 'Order total'), valor: 'R$ ' + n2z(total), destaque: true }],
          grade: { colunas: [P('Seq', 'Seq'), P('Descrição', 'Description'), P('UN', 'UoM'), { rotulo: P('Qtd', 'Qty'), tipo: 'numero' }, { rotulo: P('Preço unitário', 'Unit price'), tipo: 'numero' }, { rotulo: P('Total', 'Total'), tipo: 'numero' }],
            linhas: linhas.map(l => [l[0], l[1], P('UN', 'EA'), fmt.num(l[2]), n2z(l[3]), n2z(l[4])]), total: [P('Total dos itens', 'Items total'), '', '', '', '', n2z(total)] },
          acoes: [{ texto: P('Fechar', 'Close'), tom: 'primario' }],
        });
      }
      function atualizar() {
        ui.backend({
          titulo: P('Atualizar tudo agora: ciclo do robô e releitura do painel', 'Refresh everything now: robot cycle and dashboard re-read'), escrita: 'update',
          passos: [S('job', P('Lê ordens e notas novas', 'Reads new orders and invoices'), 320), S('sql', P('Atualiza o cofre', 'Updates the vault'), 140), S('email', P('Envia os avisos', 'Sends the alerts'), 90), S('erp', P('Relê o painel', 'Re-reads the dashboard'), 260)],
          resumo: P('Ciclo concluído e painel relido.', 'Cycle finished and dashboard re-read.'),
          aoConcluir: () => {
            const agora = new Date();
            E.atualizado = fmt.hora(agora);
            ciclosNovos = [[agora, P('Ciclo concluído · nenhuma ação pendente', 'Cycle finished · no pending action'), 0]].concat(ciclosNovos).slice(0, 3);
            pintar('atualizar');
            ui.toast(P('Painel atualizado', 'Dashboard refreshed'));
          },
        });
      }

      /* ---------- sino: ações do robô, ciclo a ciclo ---------- */
      const fecharSino = () => { E.pop = false; pintar('pop-sino'); };
      function popSino() {
        const acoes = ciclosNovos.concat(SINO.map(([d, hh, a, v]) => [api.data(d, hh), a, v]));
        return h('div', { class: 'cfg-pop sino-pop', role: 'group', 'aria-label': P('Ações do robô, ciclo a ciclo', 'Robot actions, cycle by cycle'), onkeydown: ev => { if (ev.key === 'Escape') { ev.stopPropagation(); fecharSino(); } } },
          h('h5', null, P('Ações do robô · ciclo a ciclo', 'Robot actions · cycle by cycle')),
          h('div', { class: 'sino-list', tabindex: '0', role: 'region', 'aria-label': P('Ações do robô', 'Robot actions') }, acoes.map((a, i) => [
            (i === 0 || +acoes[i - 1][0] !== +a[0]) && e('div', 'sino-g', P('ciclo ', 'cycle '), fmt.dataHora(a[0])),
            h('div', { class: 'sino-row' }, e('span', 'a', a[1]), e('span', 'v num', a[2] > 0 ? n2z(a[2]) : ''))])));
      }

      /* ---------- Controle de Verba: a tela principal ---------- */
      function pintarVerba(p) {
        const q = quadro();
        if (!E.atualizado) E.atualizado = fmt.hora(new Date());
        const filtrar = foco => { E.contaAberta = null; pintar(foco); };
        const mudarMes = delta => { const b = deIso(E.de), ref = isNaN(b) ? HOJE : b, alvo = new Date(ref.getFullYear(), ref.getMonth() + delta, 1); E.de = iso(alvo); E.ate = iso(new Date(alvo.getFullYear(), alvo.getMonth() + 1, 0)); filtrar(delta < 0 ? 'mes-ant' : 'mes-prox'); };
        const data = (chave, rot) => h('input', { class: CAMPO, type: 'date', value: E[chave], 'aria-label': rot, 'data-f': 'data-' + chave, onchange: ev => { if (ev.target.value) { E[chave] = ev.target.value; filtrar('data-' + chave); } } });
        const periodo = (qual, foco) => () => { Object.assign(E, janela(qual)); filtrar(foco); };
        const un = ui.select({ ariaLabel: P('Unidade de negócio', 'Business unit'), valor: E.un, opcoes: [{ valor: 'todas', texto: P('Todas as UN', 'All BUs') }].concat(UNS.map(u => ({ valor: u[0], texto: t(P('UN ', 'BU ')) + u[0] + ' · ' + t(u[1]) }))), aoMudar: v => { E.un = v; filtrar('un'); } });
        un.classList.add('unsel'); un.setAttribute('data-f', 'un');
        const sino = btn(null, () => { E.pop = !E.pop; pintar('pop-sino'); }, { ic: 'bell', grande: true, titulo: P('Ações do robô, ciclo a ciclo', 'Robot actions, cycle by cycle'), aria: P('Ações do robô', 'Robot actions'), expandido: !!E.pop, foco: 'pop-sino', classe: 'bell' });
        sino.addEventListener('keydown', ev => { if (ev.key === 'Escape' && E.pop) { ev.stopPropagation(); fecharSino(); } });
        sino.append(h('span', { class: 'ponto', 'aria-hidden': 'true' }));

        p.append(h('div', { class: 'cv-head', role: 'toolbar', 'aria-label': P('Filtros e ações do painel', 'Dashboard filters and actions') },
          un,
          h('div', { class: 'flt', role: 'group', 'aria-label': P('Período do painel', 'Dashboard period') },
            btn(null, () => mudarMes(-1), { tom: 'fantasma', ic: 'chevl', titulo: P('mês anterior', 'previous month'), foco: 'mes-ant' }),
            btn(rotuloPeriodo(), periodo('mes', 'mes-atual'), { tom: 'fantasma', classe: 'mes-atual', titulo: P('clique: volta para o mês atual', 'click: back to the current month'), foco: 'mes-atual' }),
            btn(null, () => mudarMes(1), { tom: 'fantasma', ic: 'chevr', titulo: P('próximo mês', 'next month'), foco: 'mes-prox' }),
            e('span', 'lbl', P('De', 'From')), data('de', P('De', 'From')), e('span', 'lbl', P('Até', 'To')), data('ate', P('Até', 'To')),
            btn(P('ano', 'year'), periodo('ano', 'ano'), { tom: 'fantasma', titulo: P('ano inteiro', 'whole year'), foco: 'ano' })),
          e('div', 'spacer'),
          h('span', { class: 'hint' }, P('atualizado ', 'updated '), E.atualizado),
          btn(P('Atualizar', 'Refresh'), atualizar, { ic: 'refresh', titulo: P('Atualizar tudo agora', 'Refresh everything now'), foco: 'atualizar' }),
          h('div', { class: 'cfgwrap' }, sino, E.pop && popSino())));

        if (!q.contas.length) {
          p.append(cartao('state', ui.vazio({ icone: IC.wallet, titulo: P('Nenhuma verba cadastrada ainda.', 'No budget registered yet.'),
            texto: P('Nesta demonstração o planejamento existe para ' + ANO + ' e ' + PROX + '.', 'In this demo the planning exists for ' + ANO + ' and ' + PROX + '.') })));
          return;
        }

        const b = norm((E.busca || '').trim());
        const vis = b ? q.contas.filter(c => norm(c.codigo).includes(b) || norm(t(c.nome)).includes(b)) : q.contas;
        const r = { plan: soma(vis.map(c => c.plan)), prev: soma(vis.map(c => c.prev)), real: soma(vis.map(c => c.real)) };
        r.saldo = r.plan - r.prev - r.real;
        const real = pct(r.real, r.plan), res = pct(r.prev, r.plan), livre = pct(r.saldo, r.plan);
        const txSaldo = n2z(r.saldo);
        const leg = (cor, v, tx) => h('div', { class: 'it' }, h('span', { class: 'k k-' + cor }), h('div', null, e('div', 'v num', rs(v)), e('div', 't', tx)));
        const heroi = cartao('hero',
          h('div', { class: 'lead' },
            h('div', { class: 'lbl' }, e('span', 'd'), ' ', P('Saldo disponível', 'Available balance')),
            h('div', { class: 'big num' + (txSaldo.length > 13 ? ' p' : txSaldo.length > 10 ? ' m' : '') + (r.saldo < 0 ? ' neg' : '') }, e('span', 'cur', 'R$'), txSaldo),
            h('div', { class: 'sub' }, P('de ', 'of '), h('b', null, rs(r.plan)), P(' planejados · ', ' planned · '), h('b', null, Math.round(livre) + '%'), P(' livre', ' free'))),
          h('div', { class: 'compo' },
            h('div', { class: 'cap' }, h('span', null, P('Composição da verba total', 'How the total budget is split')), h('em', null, P('Realizado + Previsto + Saldo', 'Actual + Committed + Balance'))),
            h('div', { class: 'bar', role: 'img', 'aria-label': P('Realizado ' + Math.round(real) + '%, previsto ' + Math.round(res) + '%, saldo ' + Math.round(livre) + '%', 'Actual ' + Math.round(real) + '%, committed ' + Math.round(res) + '%, balance ' + Math.round(livre) + '%') },
              h('div', { class: 'seg-b b-real', style: 'width:' + lim(real) + '%' }), h('div', { class: 'seg-b b-res', style: 'width:' + Math.min(lim(res), 100 - lim(real)) + '%' }), e('div', 'seg-b b-sal')),
            h('div', { class: 'legend' },
              leg('plan', r.plan, P('Planejado', 'Planned')), leg('res', r.prev, P('Previsto · ' + Math.round(res) + '% em OCs', 'Committed · ' + Math.round(res) + '% in POs')),
              leg('real', r.real, P('Realizado · ' + Math.round(real) + '% já lançado', 'Actual · ' + Math.round(real) + '% already posted')), leg('sal', r.saldo, P('Saldo · ' + Math.round(livre) + '% livre', 'Balance · ' + Math.round(livre) + '% free')))));

        const pctCel = (v, faixa) => h('span', { class: 'pct' }, h('span', { class: 'dot ' + faixa }), Math.round(v) + '%');
        const linhaConta = c => {
          const saldo = c.plan - c.prev - c.real, aberta = E.contaAberta === c.codigo, pr = lim(pct(c.real, c.plan));
          return [h('tr', { class: 'clk' + (aberta ? ' aberta' : ''), onclick: () => { E.contaAberta = aberta ? null : c.codigo; pintar('conta-' + c.codigo); } },
            h('td', null, h('button', { type: 'button', class: 'acbtn', 'aria-expanded': String(aberta), title: P('extrato da conta', 'account statement'), 'data-f': 'conta-' + c.codigo }, e('span', 'code', c.codigo), e('span', 'name', c.nome))),
            h('td', { class: 'money num' }, n2z(c.plan)), h('td', { class: 'money res num' }, n2z(c.prev)), h('td', { class: 'money real num' }, n2z(c.real)),
            h('td', { class: 'money sal num' + (saldo < 0 || c.faixa === 'crit' ? ' neg' : '') }, n2z(saldo)),
            h('td', { class: 'gauge-cell' }, h('div', { class: 'gauge' }, h('div', { class: 'g g-real', style: 'width:' + pr + '%' }), h('div', { class: 'g g-res', style: 'width:' + Math.min(lim(pct(c.prev, c.plan)), 100 - pr) + '%' })), h('div', { class: 'gline' }, pctCel(pct(c.prev + c.real, c.plan), c.faixa)))),
          aberta && h('tr', { class: 'det-row' }, h('td', { colspan: '6' }, extrato(c)))];
        };
        const th = (tx, cls) => h('th', { scope: 'col', class: cls }, h('span', null, tx));
        const busca = ui.busca({ placeholder: P('buscar/selecionar conta...', 'search/select account...'), rotulo: P('buscar ou selecionar conta', 'search or select account'), valor: E.busca || '', aoDigitar: v => { E.busca = v; filtrar('busca'); } });
        busca.input.classList.add('busca'); busca.input.setAttribute('list', 'cvb-contas'); busca.input.setAttribute('data-f', 'busca');
        const totalCons = pct(r.prev + r.real, r.plan);
        const painel = ui.cartao({ classe: 'panel', titulo: P('Verba por conta', 'Budget by account'),
          acoes: [e('span', 'hint', P('clique na conta para o extrato', 'click an account for its statement')), busca,
            h('datalist', { id: 'cvb-contas' }, q.contas.map(c => h('option', { value: c.codigo }, c.nome))),
            e('span', 'hint', vis.length + ' ' + t(vis.length === 1 ? P('conta', 'account') : P('contas', 'accounts'))),
            botaoConsulta(() => rastroPainel(q))],
          conteudo: h('div', { class: 'x-rx' }, h('table', { class: TAB + ' acct' },
            h('thead', null, h('tr', null, th(P('Conta', 'Account')), th(P('Planejado', 'Planned'), 'is-num'), th(P('Previsto', 'Committed'), 'is-num'), th(P('Realizado', 'Actual'), 'is-num'), th(P('Saldo', 'Balance'), 'is-num'), th(P('Consumo', 'Usage'), 'gauge-cell'))),
            h('tbody', null, vis.map(linhaConta),
              h('tr', { class: 'foot-row' }, h('td', null, 'Total'), h('td', { class: 'money num' }, n2z(r.plan)), h('td', { class: 'money res num' }, n2z(r.prev)), h('td', { class: 'money real num' }, n2z(r.real)), h('td', { class: 'money sal num' + (r.saldo < 0 ? ' neg' : '') }, n2z(r.saldo)),
                h('td', { class: 'gauge-cell' }, h('div', { class: 'gline' }, pctCel(totalCons, ''))))))) });
        painel.querySelector('.ph-card-topo').classList.add('ph');
        p.append(h('div', { class: 'wrap' }, heroi, painel));
      }

      function extrato(c) {
        const d = docsDe(c), saldo = r2(c.plan - c.prev - c.real), hoje1 = new Date(ANO, MESN, 1);
        const tot = (rot, v, cor) => h('span', null, rot, h('b', { class: 'num' + (cor ? ' c-' + cor : '') }, rs(v)));
        const linhasDoc = d.ocs.map(x => h('tr', null, h('td', { class: 'mono' }, OCp + x.oc), h('td', null, selo('alerta', P('previsto', 'committed'))), h('td', { class: 'num r' }, n2z(x.valor)), h('td', { class: 'det-dt' }),
          h('td', { class: 'r' }, botaoErp('OC', () => erpOc(x.oc, x.valor), P('Recurso da demonstração: abre a ordem de compra no ERP simulado', 'Demo aid: opens the purchase order in the simulated ERP')))))
          .concat(d.notas.map(x => h('tr', null, h('td', { class: 'mono' }, NFp + x.nf + (x.oc ? ' · ' + OCp + x.oc : '')),
            h('td', null, selo('ok', P('realizado', 'actual')),
              x.acima > 0 && [' ', selo('erro', P(rs(x.acima) + ' acima da OC', rs(x.acima) + ' above the PO'), P('valor da nota maior que o da OC', 'invoice amount above the PO amount'))],
              x.pendente && [' ', selo('erro', P('aguardando liberação', 'awaiting release'), P('lançada sem saldo: pendente na fila de liberação do ERP', 'posted with no balance: pending in the ERP release queue'))]),
            h('td', { class: 'num r' }, n2z(x.valor)), h('td', { class: 'det-dt' }),
            h('td', { class: 'r' }, x.oc ? botaoErp('OC', () => erpOc(x.oc, r2(x.valor - (x.acima || 0))), P('Recurso da demonstração: abre a ordem de compra no ERP simulado', 'Demo aid: opens the purchase order in the simulated ERP')) : null))));
        const docs = !linhasDoc.length ? e('p', 'det-vazio', P('nenhuma OC ou nota no período', 'no PO or invoice in the period'))
          : h('div', { class: 'det-scroll' }, h('table', { class: 'det-tab' }, h('tbody', null, linhasDoc)));
        const cofre = h('div', { class: 'det-cofre' },
          h('h4', null, ic('lock', 11), P('Cofre · reservas automáticas do robô', 'Vault · automatic robot reservations')),
          h('div', { class: 'cofre-tot' }, P('no cofre agora ', 'in the vault now '), h('b', { class: 'num' }, rs(c.prev))),
          !d.ocs.length ? e('p', 'det-vazio', P('nenhuma reserva ativa: ao aprovar uma OC o robô guarda o valor aqui', 'no active reservation: when a PO is approved the robot stores the amount here'))
            : h('div', { class: 'det-scroll' }, h('table', { class: 'det-tab' }, h('tbody', null, d.ocs.map((x, k) => h('tr', null, h('td', { class: 'mono' }, OCp + x.oc),
              h('td', null, selo('alerta', P('no cofre', 'in the vault'), null, 'lock')), h('td', { class: 'num r' }, n2z(x.valor)),
              h('td', { class: 'det-dt' }, P('parcela ', 'installment '), mm(hoje1), P(' · desde ', ' · since '), fmt.dataHora(api.data(-3 - k * 4, '10:15'))),
              h('td', { class: 'r' }, botaoErp('OC', () => erpOc(x.oc, x.valor)))))))));
        const fila = d.fila.length > 0 && h('div', { class: 'fila-box' },
          h('h4', null, ic('hourglass', 11), P('Na fila de liberação do ERP', 'In the ERP release queue')),
          h('table', { class: 'det-tab' }, h('tbody', null, d.fila.map(x => h('tr', null, h('td', { class: 'mono' }, NFp + x.nf), h('td', { class: 'num r' }, n2z(x.valor)), h('td', { class: 'det-dt' }, P('desde ', 'since '), fmt.data(api.data(-2))))))),
          e('p', 'fila-note', saldo < 0 ? P('lançada sem saldo: faltam ' + rs(-saldo) + '. Liberar na fila ou suplementar a conta', 'posted with no balance: ' + rs(-saldo) + ' missing. Release in the queue or supplement the account') : P('lançada sem saldo na época; a conta já tem saldo: basta liberar na fila', 'posted with no balance at the time; the account has balance now: just release it in the queue')));
        let falta = null;
        if (saldo < 0) { falta = ui.badge([P('faltam', ''), h('b', { class: 'num' }, rs(-saldo)), P(' · suplementar', ' missing · supplement')], 'erro'); falta.classList.add('falta'); }
        return h('div', { class: 'det' },
          h('div', { class: 'det-tot' },
            tot(P('Planejado', 'Planned'), c.plan), tot(P('Previsto', 'Committed'), c.prev, 'res'), tot(P('· monitorado pelo robô', '· watched by the robot'), c.prev, 'res'),
            tot(P('Realizado', 'Actual'), c.real, 'real'), tot(P('Saldo', 'Balance'), saldo, saldo < 0 ? 'neg' : 'sal'), falta),
          h('div', { class: 'det-cols' }, h('div', null, h('h4', null, P('OC / Nota · reservas e realizados', 'PO / Invoice · reservations and actuals')), docs), cofre, fila),
          h('div', { class: 'x-aids' }, e('span', 'x-leg', P('Recursos da demonstração:', 'Demo aids:')), botaoConsulta(() => rastroConta(c))));
      }

      /* ---------- Base Orçamentária: as telas na navegação, fora da demonstração pública ---------- */
      const TELAS_BO = [['meu', P('Meu orçamento', 'My budget'), 'wallet'], ['verba', P('Solicitações de verba', 'Budget requests'), 'handcoins'], ['painel', P('Painel', 'Dashboard'), 'dashboard'],
        ['orcamentos', P('Orçamentos', 'Budgets'), 'clipboard'], ['grade', P('Grade', 'Grid'), 'table'], ['gestores', P('Gestores', 'Managers'), 'users'], ['config', P('Configuração', 'Settings'), 'gear']];
      const pintarBase = p => p.append(ui.abas({ rotulo: P('Telas da Base Orçamentária', 'Budget Base screens'), chave: 'boTela',
        abas: TELAS_BO.map(([id, rotulo, icn]) => ({ id, rotulo, icone: IC[icn], montar: painel => painel.append(fora(rotulo)) })) }));

      /* ---------- casca: faixa "Controles da demonstração" e o sistema escolhido ---------- */
      const SIS = [['verba', P('Controle de Verba', 'Budget Control')], ['base', P('Base Orçamentária', 'Budget Base')]];
      E.sis = E.sis === 'base' ? 'base' : 'verba';
      const estreito = () => { try { return matchMedia('(max-width: 639.98px)').matches; } catch (err) { return false; } };
      raiz = h('div', { class: 'cvb x-shell' });
      el.append(raiz);

      /* redesenha a tela; foco = valor de data-f do controle que volta a ter o foco */
      function pintar(foco) {
        const sistemas = ui.chips({ rotulo: P('Sistema', 'System'), valor: E.sis, opcoes: SIS.map(s => ({ valor: s[0], texto: t(s[1]) })), aoMudar: v => { E.sis = v === 'base' ? 'base' : 'verba'; E.pop = false; pintar('sis-' + E.sis); } });
        [...sistemas.children].forEach((b, i) => b.setAttribute('data-f', 'sis-' + SIS[i][0]));
        const faixaDemo = h('details', { class: 'x-demo', open: E.demoAberto != null ? E.demoAberto : !estreito(), ontoggle: ev => { E.demoAberto = !!ev.target.open; } },
          h('summary', null, ic('sliders', 13), h('span', null, P('Controles da demonstração', 'Demo controls')), e('span', 'nota', P('não fazem parte do sistema real, assim como os botões tracejados nas telas', 'not part of the real system, nor are the dashed buttons on the screens')), ic('chevd', 13)),
          h('div', { class: 'corpo' },
            h('div', { class: 'ln' }, e('span', 'rt', P('Sistema', 'System')), sistemas, e('span', 'dim', P('no hub real são dois projetos do Financeiro', 'in the real hub these are two Finance projects')))));
        const telaEl = h('div', { class: E.sis === 'verba' ? 'cvb cv x-tela ph-pagina' : 'cvb dsp x-tela' });
        (E.sis === 'verba' ? pintarVerba : pintarBase)(telaEl);
        raiz.replaceChildren(faixaDemo, telaEl);
        const alvo = foco && raiz.querySelector('[data-f="' + foco + '"]');
        if (alvo) alvo.focus();
      }
      pintar();
    },
  });
})();
