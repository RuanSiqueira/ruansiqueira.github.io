/* Planejamento orçamentário · versão pública curta do módulo (id planejamento_orcamentario) para o site.
   Só a tela principal (Meu orçamento) é navegável, com dados fictícios já prontos: grade conta x mês com o realizado do ano
   anterior ao lado, salvamento por célula com totais ao vivo, "→ Dez", "+" conta gerencial, observação, histórico e o envio
   para aprovação. As outras telas continuam nas abas e mostram o cartão "fora da demonstração". Visual do kit do hub, só
   tokens --ph-*, nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const S = (tipo, titulo, ms, estado) => ({ tipo, titulo, ms, estado });
  const ANO = new Date().getFullYear() + 1, REAL = ANO - 1, YY = String(ANO).slice(2);
  const r2 = v => Math.round(v * 100) / 100;
  const soma = a => a.reduce((x, y) => x + y, 0);
  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const EU = P('Visitante (demonstração)', 'Visitor (demo)');

  const IC = {
    wallet: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
    handcoins: '<path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/>',
    dashboard: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>', chevr: '<path d="m9 18 6-6-6-6"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>', check: '<path d="M20 6 9 17l-5-5"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    lockopen: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
  };

  /* um bloco de estilo (#po-css), todo seletor prefixado por .po, só com tokens --ph-* e nenhuma regra por tema */
  const ROT = 'font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const CSS = [
    '.po{min-width:0;--c0w:clamp(190px,30vw,400px)}.po [hidden]{display:none!important}.po p{margin:0}.po.x-shell{color:var(--ph-text);font-size:13.5px;line-height:1.5}.po.x-tela{padding:0}',
    '.po .x-ic{display:inline-flex;flex:none}.po .x-ic svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.po .sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;border:0}.po .muted{color:var(--ph-text-muted)}.po .mono{font-family:var(--ph-font-mono);font-variant-numeric:tabular-nums}',
    '.po .gtg:focus-visible,.po .x-erp:focus-visible{outline:var(--ph-foco-largura) solid var(--ph-focus);outline-offset:2px}.po .foot-note{margin-top:12px;font-size:12px;color:var(--ph-text-dim)}',
    '.po .x-erp{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border:1px dashed currentColor;border-radius:var(--ph-raio);background:none;color:var(--ph-accent-light);font:inherit;font-size:11.5px;font-weight:600;line-height:1.6;white-space:nowrap;cursor:pointer}.po .x-erp:hover{background:var(--ph-accent-soft)}',
    '.po .x-aids{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin-top:12px}.po .x-aids .x-leg{font-size:11.5px;color:var(--ph-text-dim)}',
    /* contexto do ano e cabeçalho da tela no padrão do hub */
    '.po .bo-acoes{display:flex;align-items:center;justify-content:flex-end;gap:8px 12px;flex-wrap:wrap;margin:-6px 0 14px;padding-bottom:12px;border-bottom:1px dashed var(--ph-border)}',
    '.po .afoot{display:inline-flex;align-items:baseline;gap:8px;font-size:13px}.po .afoot b{font-weight:650;color:var(--ph-text)}.po .afoot small{font-size:12px;color:var(--ph-text-dim)}',
    '.po .head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px 16px;flex-wrap:wrap;margin-bottom:16px}.po .head>div:first-child{flex:1 1 22rem;min-width:0}',
    '.po .eyebrow{display:flex;align-items:center;gap:6px;margin:0 0 4px;' + ROT + ';color:var(--ph-accent-light)}.po .t1{margin:0 0 4px}.po .head .sub{max-width:80ch;font-size:13.5px;color:var(--ph-text-muted)}',
    '.po .ctx{display:flex;gap:4px 14px;flex-wrap:wrap;margin-top:8px;font:500 12px/1.5 var(--ph-font-mono);color:var(--ph-text-dim)}.po .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}',
    '.po .strip.ph-kpis{grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr));margin-bottom:16px}.po .alerts{display:grid;gap:8px;margin-bottom:14px}',
    '.po .fill{display:inline-block;width:84px;height:6px;overflow:hidden;border-radius:999px;background:var(--ph-card-2)}.po .fill i{display:block;height:100%;background:var(--ph-accent)}',
    '.po .toolbar{display:flex;gap:10px 12px;flex-wrap:wrap;align-items:flex-end;margin-bottom:12px}.po .toolbar .field{flex:2 1 220px;min-width:150px}.po .saved{margin-left:auto;align-self:center;font-size:12px;color:var(--ph-text-dim)}',
    /* grade editável: rola dentro da caixa, cabeçalho e primeira coluna fixos, rodapé fixo */
    '.po .gbox{position:relative;max-height:calc(100vh - 300px);min-height:340px;overflow:auto;overscroll-behavior:contain;border:1px solid var(--ph-border);border-radius:var(--ph-raio-lg);background:var(--ph-card);scroll-padding:44px 0 44px var(--c0w)}',
    '.po table.g{border-collapse:separate;border-spacing:0;width:max-content;min-width:100%;font-size:12.5px;color:var(--ph-text-2)}.po .g th,.po .g td{padding:0;border-bottom:1px solid var(--ph-border);background:var(--ph-card);white-space:nowrap}',
    '.po .g thead th{position:sticky;top:0;z-index:3;padding:9px 10px;text-align:right;vertical-align:bottom;background:var(--ph-surface);' + ROT + ';color:var(--ph-text-muted)}',
    '.po .g .c0{position:sticky;left:0;z-index:2;width:var(--c0w);min-width:var(--c0w);max-width:var(--c0w);text-align:left;box-shadow:1px 0 0 var(--ph-border)}.po .g thead .c0{z-index:5;white-space:normal;line-height:1.25}.po .g .c0:focus-within{z-index:6}',
    '.po .g tbody th,.po .g tfoot th{font:inherit;text-transform:none;letter-spacing:0;color:inherit;text-align:left}.po .g td.num{padding:6px 10px;text-align:right;font-family:var(--ph-font-mono)}',
    '.po .g .ref{background:color-mix(in srgb,var(--ph-info) 6%,var(--ph-card));color:var(--ph-text-muted)}.po .g thead .ref{background:color-mix(in srgb,var(--ph-info) 10%,var(--ph-surface))}.po .g .tt{font-weight:650;color:var(--ph-text);border-left:1px solid var(--ph-border)}',
    '.po .g tr.grp>*{border-top:1px solid var(--ph-border);background:var(--ph-surface);font-weight:650;color:var(--ph-text)}.po .g tr.grp td.ref{background:color-mix(in srgb,var(--ph-info) 10%,var(--ph-surface))}.po .g tr.grp td.gm{font-weight:500;color:var(--ph-text-muted)}',
    '.po .g tfoot tr>*{position:sticky;bottom:0;z-index:3;border-top:1px solid var(--ph-borda-campo);border-bottom:0;background:var(--ph-card-2);font-weight:700;color:var(--ph-text)}.po .g tfoot td.num{padding:10px}.po .g tfoot .c0{z-index:5;padding:10px 12px}.po .g tfoot td.tt,.po .g tfoot .c0 b{color:var(--ph-accent-light)}',
    '.po .gl{display:flex;align-items:center;gap:4px;min-width:0;padding:4px 6px}',
    '.po .gtg{flex:1;display:flex;align-items:center;gap:6px;min-width:0;overflow:hidden;padding:5px 4px;border:0;border-radius:var(--ph-raio);background:none;font:inherit;font-weight:650;color:var(--ph-text);text-align:left;cursor:pointer}.po .gtg:hover{background:var(--ph-card-2)}.po .gtg>.x-ic{color:var(--ph-text-dim)}',
    '.po .gcod{flex:none;font-family:var(--ph-font-mono);color:var(--ph-accent-light)}.po .gds,.po .lds{min-width:0;overflow:hidden;text-overflow:ellipsis}',
    '.po .g tr.ln .c0{padding:6px 10px 6px 34px}.po .lcell{display:flex;align-items:center;gap:6px;min-width:0}.po .lcod{flex:none;font:500 11.5px/1.4 var(--ph-font-mono);color:var(--ph-text-dim)}.po .g td.m{position:relative;padding:2px 3px}',
    /* "→ Dez": aparece com foco ou mouse na célula, preso à borda de cima, fora dos dígitos */
    '.po .g .rep{display:none;position:absolute;top:-3px;right:6px;z-index:1;height:14px;padding:0 4px;border:0;border-radius:var(--ph-raio);background:var(--ph-primario-bg);color:var(--ph-primario-fg);font:600 10px/14px var(--ph-font-mono);white-space:nowrap;cursor:pointer;box-shadow:var(--ph-sombra)}.po .g td.m:hover .rep,.po .g td.m:focus-within .rep{display:block}.po .g .rep:hover{background:var(--ph-primario-bg-hover)}',
    '@media (pointer:coarse){.po .g td.m:hover:not(:focus-within) .rep{display:none}.po .g .rep{top:-9px;height:20px;padding:0 7px;font-size:11px;line-height:20px}}',
    '.po .gi{width:94px;padding:6px 8px;border:1px solid var(--ph-borda-campo);border-radius:var(--ph-raio);background:var(--ph-campo-bg);color:var(--ph-text);font:500 12.5px/1.2 var(--ph-font-mono);font-variant-numeric:tabular-nums;text-align:right}',
    '.po .gi::placeholder{color:var(--ph-text-dim)}.po .gi:focus{outline:var(--ph-foco-largura) solid var(--ph-focus);outline-offset:-1px;border-color:var(--ph-focus)}.po .gi[aria-invalid="true"]{border-color:var(--ph-erro);color:var(--ph-erro)}',
    '.po .g thead tr.gh th:not(.c0){height:24px;padding:0 10px;text-align:center;font-size:10px}.po .g thead tr.gh th.pr{text-align:left;color:var(--ph-accent-light);background:color-mix(in srgb,var(--ph-accent) 10%,var(--ph-surface))}.po .g thead tr.gh th.cs{background:color-mix(in srgb,var(--ph-alerta) 9%,var(--ph-surface))}.po .g thead tr.gc th:not(.c0){top:24px}',
    '.po .g td.ro{color:var(--ph-text-muted)}.po .g .cs{border-left:1px solid var(--ph-border);color:var(--ph-text-muted);font-family:var(--ph-font-mono)}.po .g td.cs.neg{font-weight:650;color:var(--ph-erro)}.po .g .ca{padding:2px 6px;border-left:1px solid var(--ph-border)}',
    '.po .ib.ph-btn{--btn-fg:var(--ph-text-muted)}.po .ib.on.ph-btn{--btn-fg:var(--ph-accent-light)}.po .gerr{margin-top:8px;font-size:12.5px;font-weight:600;color:var(--ph-erro)}.po .gerr:empty{display:none}',
    /* miolo das janelas e da gaveta (a moldura é a do kit) */
    '.po .dform{display:grid;gap:12px}.po .dlist{display:grid;gap:8px}.po .hitem{font-size:12.5px;gap:4px;overflow-wrap:anywhere}.po .ferr{font-size:12.5px;font-weight:600;color:var(--ph-erro)}.po .ferr:empty{display:none}',
    '.po .sumry{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:0;overflow:hidden;border:1px solid var(--ph-border);border-radius:var(--ph-raio);background:var(--ph-border)}.po .sumry div{min-width:0;padding:10px 12px;background:var(--ph-surface)}',
    '.po .sumry dt{' + ROT + ';color:var(--ph-text-dim)}.po .sumry dd{margin:2px 0 0;font:700 15px/1.3 var(--ph-font-mono);color:var(--ph-text);overflow-wrap:anywhere}',
    '@media (max-width:640px){.po .gl{flex-wrap:wrap;gap:2px;padding:4px}.po .gtg{flex-basis:100%}.po .sumry{grid-template-columns:minmax(0,1fr)}.po .saved{width:100%;margin-left:0}.po .gbox{max-height:70vh}}',
    '@media (max-width:480px){.po{--c0w:clamp(150px,42vw,290px)}.po .gi{width:88px}.po .head .row{width:100%}}',
  ].join('\n');
  function injetarCss() {
    if (document.getElementById('po-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'po-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  /* valor digitado no formato do idioma da tela: pt "1.234,56", en "1,234.56"; vazio = 0; inválido ou negativo = null */
  function parseValor(s, lang) {
    const tx = String(s == null ? '' : s).trim().replace(/^R\$/, '').replace(/\s+/g, '');
    if (!tx) return 0;
    const [mil, dec] = lang === 'en' ? [',', '.'] : ['.', ','];
    if (!new RegExp('^(\\d{1,3}(\\' + mil + '\\d{3})+|\\d+)(\\' + dec + '\\d{1,2})?$').test(tx)) return null;
    return Number(tx.split(mil).join('').replace(dec, '.'));
  }

  /* ---------- dados de exemplo, fictícios e prontos (EMPRESA DEMO) ---------- */
  const CONTAS = {
    6110: P('Material de expediente', 'Office supplies'), 6315: P('Telefonia e internet', 'Phone and internet'), 6320: P('Licenças de software', 'Software licenses'),
    6325: P('Equipamentos de informática', 'IT equipment'), 6525: P('Consultoria e assessoria', 'Consulting and advisory'), 6535: P('Seguros', 'Insurance'),
  };
  const GER = {
    5101: P('Administração geral', 'General administration'), 5102: P('Recursos humanos', 'Human resources'), 5103: P('Tecnologia da informação', 'Information technology'),
    5104: P('Financeiro e controladoria', 'Finance and controlling'), 5105: P('Compras e suprimentos', 'Purchasing and supply'), 5112: P('Marketing', 'Marketing'),
  };
  /* realizado do ano anterior por unidade e conta (referência, só leitura) */
  const REALIZADO = { '010|6320': 84200, '010|6325': 51650, '010|6315': 15400, '010|6110': 13250, '010|6525': 61300, '010|6535': 33900, '020|6315': 4100, '020|6110': 3350 };
  let db = null;   // estado no escopo do módulo: sobrevive à troca de idioma
  function semear(api) {
    let id = 0;
    const linhas = [['010', 6320, 5103, 9500], ['010', 6325, 5103, 5700], ['010', 6315, 5101, 900], ['010', 6315, 5103, 400], ['010', 6110, 5101, 800], ['010', 6110, 5104, 300],
      ['010', 6525, 5104, 0], ['010', 6535, 5104, 0], ['020', 6315, 5101, 0], ['020', 6110, 5101, 0]]
      .map(([un, conta, ger, base]) => ({ id: ++id, un, conta, ger, valores: Array.from({ length: 12 }, (_, m) => (base ? base + (m % 3 === 2 ? 100 : 0) : 0)), obs: '', comprometido: 0 }));
    linhas[0].obs = P('Renovação anual das licenças, com reajuste previsto em março.', 'Yearly license renewal, with a price increase expected in March.');
    linhas[4].comprometido = 600;   // verba aprovada a outro gestor nesta conta
    const hist = [
      { dt: api.data(-14, '08:30'), quem: EU, acao: P('Configuração', 'Settings'), onde: P('Grade gerada do ERP', 'Grid generated from the ERP'), de: null, para: P('10 linhas incluídas', '10 lines added') },
      { dt: api.data(-10, '10:12'), quem: EU, acao: P('Edição', 'Edit'), onde: P('UN 010 · 6320 · 5103 · Jan', 'BU 010 · 6320 · 5103 · Jan'), de: 0, para: 9500 },
      { dt: api.data(-4, '09:15'), quem: 'Helena Castro', acao: P('Verba aprovada', 'Budget approved'), onde: P('UN 010 · 6110 · 5101', 'BU 010 · 6110 · 5101'), de: null, para: 600 },
    ];
    return { linhas, seq: id, status: 'EM_PREENCHIMENTO', enviadoEm: null, decididoEm: null, salvo: null, hist };
  }

  Hub.registrar({
    id: 'planejamento_orcamentario',
    ordem: 4,
    grupo: P('Fiscal e financeiro', 'Tax and finance'),
    icone: 'calculator',
    nome: P('Planejamento orçamentário', 'Budget planning'),
    resumo: P(
      'O orçamento anual de cada gestor no lugar da planilha: grade de contas por mês com o realizado do ano anterior como referência, envio para aprovação e pedidos de verba entre gestores.',
      'Each manager\'s annual budget in place of the spreadsheet: an accounts-by-month grid with last year\'s actuals as a reference, submission for approval and budget requests between managers.'
    ),
    manual: {
      pt: {
        destaque: 'O Planejamento orçamentário leva o orçamento anual para dentro do hub: cada gestor preenche as próprias contas mês a mês, com o realizado do ano anterior ao lado, e envia para aprovação; o Financeiro aprova, devolve ou reabre na mesma tela. Durante o ano, quem precisa usar a conta de outro gestor pede a verba no sistema e o dono da conta decide.',
        oque: 'O problema. O orçamento do ano seguinte nascia em planilhas: uma por gestor, enviadas por e-mail, preenchidas em versões diferentes e consolidadas à mão pelo Financeiro. Ninguém sabia quem já tinha enviado, o histórico de quem mudou o quê se perdia e, durante o ano, o uso da conta de outro gestor era combinado por conversa, sem registro.\n\nO que o sistema faz. Cada gestor abre Meu orçamento e vê só as próprias contas, com uma coluna por mês e o realizado do ano anterior ao lado como referência. Cada célula é salva sozinha, "→ Dez" leva o valor de um mês até dezembro e o "+" abre outra conta gerencial. Pronto, o gestor envia para aprovação; o Financeiro aprova, devolve com motivo ou reabre, e tudo fica no histórico. O Painel mostra o orçado, o saldo e o realizado por mês, e a Solicitação de verba registra o pedido de uso da conta de outro gestor, que o dono aprova ou recusa. Nenhum e-mail é enviado e nada é gravado no ERP.\n\nNesta demonstração pública, a tela Meu orçamento funciona com dados fictícios; as outras telas ficam fora da demonstração.',
        finalidade: 'Trocar as planilhas por e-mail por um fluxo único de orçamento, com histórico, e dar a cada gestor, durante o ano, a visão de quanto ainda resta em cada conta.\n\nProjetado e construído por Ruan Siqueira.',
        alcance: [
          'Orçamento anual em grade conta x mês, com o realizado do ano anterior como referência',
          'Salvamento por célula, "→ Dez" para levar um mês até dezembro e "+" para abrir outra conta gerencial',
          'Observação por linha e histórico de quem mudou o quê e quando',
          'Envio para aprovação, aprovação, devolução com motivo e reabertura',
          'Painel do gestor com orçado, saldo e realizado por mês',
          'Solicitação de verba entre gestores, decidida pelo dono da conta',
          'Grade gerada a partir da estrutura de orçamento do ERP, que só é lido',
          'Validação: o realizado bateu com a planilha de orçamento em 30 de 30 valores, ao centavo',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript'],
      },
      en: {
        destaque: 'Budget planning brings the yearly budget into the hub: each manager fills in their own accounts month by month, with last year’s actuals alongside, and submits for approval; Finance approves, returns or reopens it on the same screen. During the year, whoever needs to use another manager’s account requests the budget in the system and the account owner decides.',
        oque: 'The problem. Next year’s budget was born in spreadsheets: one per manager, sent by email, filled in across different versions and consolidated by hand by Finance. Nobody knew who had already submitted, the history of who changed what got lost and, during the year, using another manager’s account was agreed in conversation, with no record.\n\nWhat the system does. Each manager opens My budget and sees only their own accounts, with one column per month and last year’s actuals alongside as a reference. Each cell is saved by itself, "→ Dec" carries the amount of a month through December and the "+" opens another management account. When done, the manager submits for approval; Finance approves, returns it with a reason or reopens it, and everything stays in the history. The Dashboard shows the budget, the balance and the actuals by month, and Budget requests record the request to use another manager’s account, which the owner approves or rejects. No email is sent and nothing is written to the ERP.\n\nIn this public demo, the My budget screen works on fictitious data; the other screens are outside the demo.',
        finalidade: 'Replace the spreadsheets sent by email with a single budget flow, with history, and give each manager, during the year, the view of how much is still left in each account.\n\nDesigned and built by Ruan Siqueira.',
        alcance: [
          'Yearly budget in an account x month grid, with last year’s actuals as a reference',
          'Saved cell by cell, "→ Dec" to carry a month through December and "+" to open another management account',
          'A note per line and a history of who changed what and when',
          'Submit for approval, approve, return with a reason and reopen',
          'Manager dashboard with budget, balance and actuals by month',
          'Budget requests between managers, decided by the account owner',
          'Grid generated from the ERP budget structure, which is only read',
          'Validation: actuals matched the budget spreadsheet in 30 of 30 values, to the cent',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript'],
      },
    },
    /* mini tour: só ganchos do módulo (.po, .strip, .gbox, data-aba-id), nada que dependa do idioma. O 1o passo volta a Meu
       orçamento (o tour termina numa aba fora da demonstração e o estado sobrevive). */
    tour: [
      { alvo: '.po [data-aba-id="meu"]', acao: 'clicar', titulo: P('Cada gestor no próprio orçamento', 'Each manager in their own budget'),
        texto: P('Antes, o orçamento do ano seguinte era uma planilha por gestor, enviada por e-mail. Agora cada gestor abre Meu orçamento e vê só as próprias contas.',
          'Next year’s budget used to be one spreadsheet per manager, sent by email. Now each manager opens My budget and sees only their own accounts.') },
      { alvo: '.po .strip', titulo: P('O ano em quatro números', 'The year in four numbers'),
        texto: P('Orçado, realizado do ano anterior, saldo depois da verba já aprovada e quantas linhas já foram preenchidas. Tudo muda ao vivo enquanto o gestor digita.',
          'Budget, last year’s actuals, balance after the requests already approved and how many lines are filled in. Everything updates live as the manager types.') },
      { alvo: '.po .gbox', titulo: P('A grade conta por mês', 'The account by month grid'),
        texto: P('Uma coluna por mês, com o realizado do ano anterior ao lado. Cada célula é salva sozinha; "→ Dez" leva o valor do mês até dezembro e o "+" abre outra conta gerencial.',
          'One column per month, with last year’s actuals alongside. Each cell is saved by itself; "→ Dec" carries the month’s amount through December and the "+" opens another management account.') },
      { alvo: '.po [data-aba-id="orcamentos"]', acao: 'clicar', titulo: P('E o Financeiro aprova', 'And Finance approves'),
        texto: P('Quem configura vê todos os orçamentos em uma tela: aprova, devolve com motivo ou reabre, e tudo fica no histórico. Nenhum e-mail é enviado.',
          'Whoever sets things up sees every budget on one screen: approves, returns with a reason or reopens, and everything stays in the history. No email is sent.') },
      { alvo: '.po .ph-fora', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('A demonstração pública mostra Meu orçamento. Quer ver o sistema inteiro funcionando? É só me chamar por aqui.',
          'The public demo shows My budget. Want to see the whole system running? Just reach me from here.') },
    ],

    montar(el, api) {
      if (!db) db = semear(api);
      injetarCss();
      const { t, h, ui, fmt } = api;
      const E = api.estado, L = api.lang;
      const brl = v => fmt.moeda(v || 0), n2z = v => fmt.num(v || 0, 2), n2 = v => (v ? fmt.num(v, 2) : ''), traco = v => (v ? fmt.num(v, 2) : '-');
      const MES = Array.from({ length: 12 }, (_, i) => fmt.mes(new Date(2001, i, 1)));
      const filhos = (...f) => f.flat(Infinity).filter(x => x != null && x !== false && x !== '');
      const ic = (nome, tam = 14) => h('span', { class: 'x-ic', 'aria-hidden': 'true', style: 'width:' + tam + 'px;height:' + tam + 'px', html: '<svg viewBox="0 0 24 24" focusable="false">' + (IC[nome] || IC.wallet) + '</svg>' });
      const e = (tag, classe, ...kids) => h(tag, classe ? { class: classe } : null, ...kids);
      const AREA = ui.campo({ tipo: 'area' }).input.className;
      const btn = (texto, aoClicar, o = {}) => {
        const b = ui.botao({ texto, aoClicar, icone: o.ic && IC[o.ic], tom: o.tom || 'secundario', tamanho: o.p ? 'p' : null, titulo: o.titulo, classe: o.classe });
        if (o.foco) b.setAttribute('data-f', o.foco);
        return b;
      };
      const pill = (st) => { const b = ui.badge(STATUS[st][0], STATUS[st][1]); if (st === 'ENVIADO') b.style.setProperty('--tom', 'var(--ph-cor-violeta)'); return b; };
      const STATUS = { EM_PREENCHIMENTO: [P('Em preenchimento', 'In progress'), 'info'], ENVIADO: [P('Enviado', 'Submitted'), 'info'], APROVADO: [P('Aprovado', 'Approved'), 'ok'] };
      const editavel = () => db.status === 'EM_PREENCHIMENTO';
      const nomeConta = c => t(CONTAS[c]);
      const ondeTx = l => t(P('UN ', 'BU ')) + l.un + ' · ' + l.conta + ' · ' + l.ger;
      /* histórico guardado nos dois idiomas (a troca de idioma remonta a tela): local, mês e valores viram texto só ao desenhar */
      const MM = { pt: 'Jan Fev Mar Abr Mai Jun Jul Ago Set Out Nov Dez'.split(' '), en: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ') };
      const ondeP = (l, sufixo) => P('UN ' + l.un + ' · ' + l.conta + ' · ' + l.ger + (sufixo ? ' · ' + sufixo.pt : ''), 'BU ' + l.un + ' · ' + l.conta + ' · ' + l.ger + (sufixo ? ' · ' + sufixo.en : ''));
      const mesP = m => P(MM.pt[m], MM.en[m]);
      const registrar = (acao, onde, de, para, motivo) => db.hist.push({ dt: new Date(), quem: EU, acao, onde, de: de == null ? null : de, para: para == null ? null : para, motivo: motivo || null });
      const confirmar = (titulo, corpo, ok, aoOk) => ui.modal({ titulo, largura: 540, classe: 'po', corpo,
        acoes: ctl => [btn(P('Cancelar', 'Cancel'), () => ctl.fechar(), { tom: 'fantasma' }), btn(ok, () => aoOk(ctl), { tom: 'primario' })] });
      let raiz = null;

      /* ---------- Meu orçamento: a tela principal ---------- */
      function telaMeu(p) {
        const ls = db.linhas, ed = editavel();
        const grupos = [];
        ls.forEach(l => { let x = grupos.find(g => g.un === l.un && g.conta === l.conta); if (!x) grupos.push(x = { un: l.un, conta: l.conta, k: l.un + '|' + l.conta, linhas: [] }); x.linhas.push(l); });
        const fechados = E.fechados || (E.fechados = {});
        const q = norm(E.busca || '').trim(), vf = E.vf || 'todas';
        const passa = l => (!q || norm(l.conta + ' ' + nomeConta(l.conta) + ' ' + l.ger + ' ' + t(GER[l.ger])).includes(q)) && (vf === 'todas' || (vf === 'com') === l.valores.some(Boolean));
        const totReal = soma(grupos.map(x => REALIZADO[x.k] || 0));
        const refs = { linha: new Map(), grupo: new Map(), pe: null };
        const salvoEl = h('span', { class: 'saved mono', role: 'status' }, db.salvo ? t(P('Salvo às ', 'Saved at ')) + db.salvo : ed ? P('Salvamento automático', 'Autosave') : P('Somente consulta', 'Read only'));
        const erroEl = h('p', { class: 'gerr', role: 'alert' });
        const numTd = (cls, tx) => h('td', { class: 'num' + (cls ? ' ' + cls : '') }, tx);
        const neg = (cel, v) => cel.classList[v < 0 ? 'add' : 'remove']('neg');

        /* totais ao vivo, recalculados no lugar: a rolagem e o foco ficam onde estão */
        const kpi = ui.kpis([
          { rotulo: P('Orçado ' + ANO, 'Budgeted ' + ANO), valor: '', detalhe: P('soma dos 12 meses', 'sum of the 12 months') },
          { rotulo: P('Realizado ' + REAL, 'Actual ' + REAL), valor: brl(totReal), detalhe: P('contábil do ERP', 'ERP ledger') },
          { rotulo: P('Saldo ' + ANO, 'Balance ' + ANO), valor: '', detalhe: ' ' },
          { rotulo: P('Linhas preenchidas', 'Lines filled in'), valor: '', detalhe: h('span', { class: 'fill', 'aria-hidden': 'true' }, h('i')) }]);
        kpi.classList.add('strip');
        ['var(--ph-cor-azul)', 'var(--ph-neutro)', 'var(--ph-cor-verde)', 'var(--ph-cor-violeta)'].forEach((c, i) => kpi.children[i].style.setProperty('--tom', c));
        const kv = kpi.querySelectorAll('.ph-kpi-valor'), kd = kpi.querySelectorAll('.ph-kpi-detalhe');
        function recalc() {
          const F = Array(12).fill(0); let C = 0;
          grupos.forEach(x => {
            const G = Array(12).fill(0); let c = 0;
            x.linhas.forEach(l => {
              l.valores.forEach((v, m) => { G[m] += v; }); c += l.comprometido;
              const r = refs.linha.get(l.id); if (r) { const tl = soma(l.valores); r.tt.textContent = n2z(tl); r.s.textContent = n2z(tl - l.comprometido); neg(r.s, tl - l.comprometido); }
            });
            const rg = refs.grupo.get(x.k);
            if (rg) { G.forEach((v, m) => { rg.G[m].textContent = traco(v); }); rg.tt.textContent = n2z(soma(G)); rg.c.textContent = traco(c); rg.s.textContent = n2z(soma(G) - c); neg(rg.s, soma(G) - c); }
            G.forEach((v, m) => { F[m] += v; }); C += c;
          });
          const orcado = r2(soma(F)), saldo = r2(orcado - C), preench = ls.filter(l => l.valores.some(Boolean)).length;
          if (refs.pe) { F.forEach((v, m) => { refs.pe.F[m].textContent = n2z(v); }); refs.pe.tt.textContent = n2z(orcado); refs.pe.c.textContent = n2z(C); refs.pe.s.textContent = n2z(saldo); }
          kv[0].textContent = brl(orcado); kv[2].textContent = brl(saldo);
          kd[2].textContent = t(P('orçado menos verba aprovada (', 'budget minus approved requests (')) + brl(C) + ')';
          kv[3].textContent = preench + t(P(' de ', ' of ')) + ls.length;
          kd[3].querySelector('i').style.width = Math.round(preench / ls.length * 100) + '%';
          return { orcado, preench };
        }
        const gravou = () => { db.salvo = fmt.hora(new Date()); salvoEl.textContent = t(P('Salvo às ', 'Saved at ')) + db.salvo; recalc(); };

        function commit(l, m, input) {
          const v = parseValor(input.value, L);
          if (v === null) {
            input.setAttribute('aria-invalid', 'true');
            erroEl.textContent = t(P('Valor inválido em ' + l.conta + ' · ' + l.ger + ' · ' + MES[m] + ': use o formato 1.234,56. O valor anterior foi mantido.', 'Invalid amount in ' + l.conta + ' · ' + l.ger + ' · ' + MES[m] + ': use the 1,234.56 format. The previous amount was kept.'));
            return false;
          }
          input.removeAttribute('aria-invalid'); erroEl.textContent = '';
          const novo = r2(v), antigo = l.valores[m];
          input.value = n2(novo);
          if (novo !== antigo) { l.valores[m] = novo; registrar(P('Edição', 'Edit'), ondeP(l, mesP(m)), antigo, novo); gravou(); }
          return true;
        }
        function tecla(ev, l, m) {
          if (ev.key === 'ArrowRight' && ev.ctrlKey && ev.shiftKey && m < 11) { ev.preventDefault(); replicar(l, m, ev.currentTarget); return; }
          if (ev.key !== 'Enter') return;
          ev.preventDefault();
          const lista = [...p.querySelectorAll('input.gi[data-m="' + m + '"]')], prox = lista[lista.indexOf(ev.currentTarget) + (ev.shiftKey ? -1 : 1)];
          if (prox) prox.focus(); else commit(l, m, ev.currentTarget);
        }
        /* "→ Dez": leva o valor do mês até dezembro; pergunta antes de substituir meses já preenchidos com outro valor */
        function replicar(l, m, input) {
          if (input && input.value !== n2(l.valores[m]) && !commit(l, m, input)) return;
          const val = l.valores[m], mesTx = MES[m], seguintes = MES.map((_, i) => i).filter(i => i > m);
          if (!val) { ui.toast(P(mesTx + ' está vazio. Preencha o valor antes de replicar.', mesTx + ' is empty. Fill in the amount before carrying it over.'), 'erro'); return; }
          if (seguintes.every(i => l.valores[i] === val)) { ui.toast(P('Os meses de ' + mesTx + ' a dezembro já estão com o mesmo valor.', 'The months from ' + mesTx + ' to December already have the same amount.'), 'info'); return; }
          const sobre = seguintes.filter(i => l.valores[i] && l.valores[i] !== val), antes = soma(l.valores);
          const ir = () => ui.backend({
            titulo: P('Replicar ' + mesTx + ' até dezembro', 'Carry ' + mesTx + ' through December'), subtitulo: ondeTx(l), escrita: 'update',
            passos: [S('api', P('Recebe o pedido', 'Receives the request'), 30), S('regra', P('Confere se o orçamento pode ser editado', 'Checks that the budget can be edited'), 20), S('sql', P('Grava o valor nos meses seguintes', 'Writes the amount to the following months'), 55), S('sql', P('Grava o histórico', 'Writes the history'), 35)],
            resumo: P(mesTx + ' replicado até dezembro. Salvo.', mesTx + ' carried through December. Saved.'),
            aoConcluir: () => {
              seguintes.forEach(i => { l.valores[i] = val; });
              registrar(P('Edição', 'Edit'), ondeP(l, P(MM.pt[m] + ' a Dez', MM.en[m] + ' to Dec')), antes, soma(l.valores));
              db.salvo = fmt.hora(new Date()); pintar(); ui.toast(P(mesTx + ' replicado até dezembro.', mesTx + ' carried through December.'));
            },
          });
          if (!sobre.length) { ir(); return; }
          const lista = sobre.map(i => MES[i]).join(', ');
          confirmar(P('Replicar ' + mesTx + ' até dezembro', 'Carry ' + mesTx + ' through December'),
            h('p', null, sobre.length === 1 ? P('Isso substitui 1 mês já preenchido (' + lista + '). Continuar?', 'This replaces 1 month already filled in (' + lista + '). Continue?') : P('Isso substitui ' + sobre.length + ' meses já preenchidos (' + lista + '). Continuar?', 'This replaces ' + sobre.length + ' months already filled in (' + lista + '). Continue?')),
            P('Continuar', 'Continue'), ctl => { ctl.fechar(); ir(); });
        }
        function abrirObs(l) {
          const antes = t(l.obs), tx = h('textarea', { class: AREA, rows: '5', maxlength: '450', readonly: !ed, 'aria-label': P('Por que este valor?', 'Why this amount?'), placeholder: P('Explique a base do valor: contrato, quantidade, reajuste...', 'Explain what the amount is based on: contract, quantity, price increase...'), value: antes });
          ui.modal({ titulo: l.conta + ' · ' + nomeConta(l.conta), largura: 540, classe: 'po',
            corpo: h('div', { class: 'dform' }, e('p', 'muted', l.ger + ' · ' + t(GER[l.ger]) + ' · UN ' + l.un), tx),
            acoes: ctl => [btn(ed ? P('Cancelar', 'Cancel') : P('Fechar', 'Close'), () => ctl.fechar(), { tom: 'fantasma' }), ed && btn(P('Salvar observação', 'Save note'), () => {
              const v = tx.value.trim();
              if (v === antes) { ctl.fechar(); return; }
              ui.backend({ titulo: P('Salvar a observação da linha', 'Save the line note'), subtitulo: ondeTx(l), escrita: 'update',
                passos: [S('api', P('Recebe a observação', 'Receives the note'), 30), S('sql', P('Grava a observação na linha', 'Writes the note to the line'), 35), S('sql', P('Grava o histórico', 'Writes the history'), 35)],
                resumo: P('Observação salva.', 'Note saved.'),
                aoConcluir: () => { l.obs = v; registrar(P('Observação', 'Note'), ondeP(l)); db.salvo = fmt.hora(new Date()); ctl.fechar(); pintar(); ui.toast(P('Observação salva.', 'Note saved.')); } });
            }, { tom: 'primario', ic: 'check' })] });
        }
        function novaGerencial(x) {
          const tem = new Set(x.linhas.map(l => l.ger));
          const ops = Object.keys(GER).map(Number).filter(c => !tem.has(c));
          const sel = ui.select({ ariaLabel: P('Conta gerencial', 'Management account'), opcoes: ops.map(c => ({ valor: String(c), texto: c + ' · ' + t(GER[c]) })) });
          ui.modal({ titulo: P('Incluir conta gerencial', 'Add management account'), largura: 540, classe: 'po',
            corpo: h('div', { class: 'dform' }, e('p', 'muted', x.conta + ' · ' + nomeConta(x.conta) + ' · UN ' + x.un), sel, e('p', 'muted', P('A linha entra zerada no orçamento e fica no histórico.', 'The line enters the budget with zero amounts and stays in the history.'))),
            acoes: ctl => [btn(P('Cancelar', 'Cancel'), () => ctl.fechar(), { tom: 'fantasma' }), btn(P('Incluir conta gerencial', 'Add management account'), () => {
              const ger = Number(sel.value);
              ui.backend({ titulo: P('Incluir conta gerencial no orçamento', 'Add a management account to the budget'), subtitulo: x.conta + ' · ' + ger + ' · UN ' + x.un, escrita: 'create',
                passos: [S('api', P('Recebe o pedido', 'Receives the request'), 30), S('erp', P('Confere a conta gerencial no catálogo do ERP', 'Checks the management account in the ERP catalog'), 90), S('sql', P('Inclui a linha zerada', 'Inserts the line with zero amounts'), 40), S('sql', P('Grava o histórico', 'Writes the history'), 35)],
                resumo: P('Conta gerencial incluída. Informe os valores dos meses.', 'Management account added. Enter the monthly amounts.'),
                aoConcluir: () => {
                  const l = { id: ++db.seq, un: x.un, conta: x.conta, ger, valores: Array(12).fill(0), obs: '', comprometido: 0 };
                  db.linhas.splice(db.linhas.indexOf(x.linhas[x.linhas.length - 1]) + 1, 0, l);
                  registrar(P('Edição', 'Edit'), ondeP(l), null, P('Conta gerencial incluída', 'Management account added'));
                  delete fechados[x.k]; E.busca = ''; E.vf = 'todas'; ctl.fechar(); pintar();
                  ui.toast(P('Conta gerencial ' + ger + ' incluída.', 'Management account ' + ger + ' added.'));
                } });
            }, { tom: 'primario', ic: 'check' })] });
        }
        const resumoDl = pares => h('dl', { class: 'sumry' }, pares.map(([a, b]) => h('div', null, h('dt', null, a), h('dd', null, b))));
        function enviar() {
          if (p.querySelector('.gi[aria-invalid="true"]')) { ui.toast(P('Há valores inválidos na grade. Corrija os campos marcados antes de enviar.', 'There are invalid amounts in the grid. Fix the marked fields before submitting.'), 'erro'); return; }
          const tt = recalc();
          confirmar(P('Enviar para aprovação', 'Submit for approval'), h('div', { class: 'dform' },
            resumoDl([[P('Total orçado ' + ANO, 'Total budgeted ' + ANO), brl(tt.orcado)], [P('Linhas preenchidas', 'Lines filled in'), tt.preench + t(P(' de ', ' of ')) + ls.length], [P('Linhas vazias', 'Empty lines'), String(ls.length - tt.preench)]]),
            h('p', null, P('Após o envio, a edição fica bloqueada até a aprovação ou devolução pelo Financeiro.', 'After submission, editing is locked until Finance approves or returns it.'))),
          P('Confirmar envio', 'Confirm submission'), ctl => {
            ctl.fechar();
            ui.backend({ titulo: P('Enviar o orçamento para aprovação', 'Submit the budget for approval'), subtitulo: t(EU) + ' · ' + ANO, escrita: 'update',
              passos: [S('api', P('Recebe o envio', 'Receives the submission'), 30), S('regra', P('Confere quem envia e se o orçamento pode ser enviado', 'Checks who submits and that the budget can be submitted'), 25), S('sql', P('Grava a situação Enviado', 'Writes the Submitted status'), 40), S('sql', P('Grava o histórico', 'Writes the history'), 35), S('email', P('Nenhum e-mail é enviado', 'No email is sent'), 0, 'pulado')],
              resumo: P('Orçamento enviado para aprovação. O Financeiro vê na tela Orçamentos.', 'Budget submitted for approval. Finance sees it on the Budgets screen.'),
              aoConcluir: () => { db.status = 'ENVIADO'; db.enviadoEm = new Date(); registrar(P('Envio', 'Submission'), P('Orçamento ' + ANO, 'Budget ' + ANO), STATUS.EM_PREENCHIMENTO[0], STATUS.ENVIADO[0]); pintar('aprovar'); ui.toast(P('Orçamento enviado para aprovação.', 'Budget submitted for approval.')); } });
          });
        }
        function decidir(qual) {
          const D = qual === 'aprovar'
            ? { titulo: P('Aprovar orçamento', 'Approve budget'), ok: P('Aprovar', 'Approve'), para: 'APROVADO', foco: 'reabrir', texto: P('Após a aprovação, as linhas ficam travadas. Para alterar, será preciso reabrir com motivo. Nada é gravado no ERP.', 'After approval, the lines are locked. To change them, the budget must be reopened with a reason. Nothing is written to the ERP.') }
            : { titulo: P('Reabrir orçamento', 'Reopen budget'), ok: P('Reabrir', 'Reopen'), para: 'EM_PREENCHIMENTO', foco: 'enviar', motivo: true, texto: P('O orçamento volta para "Em preenchimento", com a edição liberada.', 'The budget goes back to "In progress", with editing allowed.') };
          const mot = D.motivo ? h('textarea', { class: AREA, rows: '3', maxlength: '450', 'aria-label': P('Motivo da reabertura', 'Reason for reopening'), placeholder: P('Informe o motivo da reabertura', 'Enter the reason for reopening') }) : null;
          const err = h('p', { class: 'ferr', role: 'alert' });
          confirmar(D.titulo, h('div', { class: 'dform' }, h('p', null, D.texto), mot, err), D.ok, ctl => {
            if (mot && !mot.value.trim()) { err.textContent = t(P('Informe o motivo.', 'Enter the reason.')); mot.focus(); return; }
            ctl.fechar();
            ui.backend({ titulo: D.titulo, subtitulo: t(EU) + ' · ' + ANO, escrita: 'update',
              passos: [S('api', P('Recebe a decisão', 'Receives the decision'), 30), S('regra', P('Confere quem decide e a situação do orçamento', 'Checks who decides and the budget status'), 20), S('sql', P('Grava a nova situação, quem decidiu e quando', 'Writes the new status, who decided and when'), 40), S('sql', P('Grava o histórico', 'Writes the history'), 35), S('email', P('Nenhum e-mail é enviado', 'No email is sent'), 0, 'pulado')],
              resumo: qual === 'aprovar' ? P('Orçamento aprovado.', 'Budget approved.') : P('Orçamento reaberto.', 'Budget reopened.'),
              aoConcluir: () => {
                const de = db.status; db.status = D.para; db.decididoEm = new Date();
                registrar(qual === 'aprovar' ? P('Aprovação', 'Approval') : P('Reabertura', 'Reopening'), P('Orçamento ' + ANO, 'Budget ' + ANO), STATUS[de][0], STATUS[D.para][0], mot && mot.value.trim());
                pintar(D.foco); ui.toast(qual === 'aprovar' ? P('Orçamento aprovado.', 'Budget approved.') : P('Orçamento reaberto.', 'Budget reopened.'));
              } });
          });
        }
        function abrirHistorico() {
          const itens = db.hist.slice().reverse();
          const fv = v => (v == null ? '-' : typeof v === 'number' ? brl(v) : v);
          ui.painel({ titulo: P('Histórico', 'History'), conteudo: h('div', { class: 'po' }, h('div', { class: 'dlist' }, itens.map(x => h('div', { class: 'hitem ph-lista-item' },
            h('div', { class: 'row' }, e('span', 'mono', fmt.data(x.dt) + ' ' + fmt.hora(x.dt)), ui.badge(x.acao, 'neutro')),
            h('div', null, h('b', null, x.quem), ' · ', x.onde),
            (x.de != null || x.para != null) && h('div', { class: 'mono' }, fv(x.de), ' → ', fv(x.para)),
            x.motivo && e('div', 'muted', x.motivo))))) });
        }
        const rastroCelula = () => ui.backend({ titulo: P('Salvar uma célula da grade', 'Save one grid cell'),
          passos: [S('api', P('Recebe o valor da célula', 'Receives the cell amount'), 30), S('regra', P('Valida o valor', 'Validates the amount'), 10), S('regra', P('Confere se o orçamento pode ser editado', 'Checks that the budget can be edited'), 20), S('sql', P('Grava o valor', 'Writes the amount'), 40), S('sql', P('Grava o histórico', 'Writes the history'), 35)],
          resumo: P('Cada célula é salva sozinha: não existe botão Salvar na grade.', 'Each cell is saved by itself: there is no Save button on the grid.') });

        /* ---------- montagem ---------- */
        const quando = d => fmt.dataHora(d || new Date());
        const alertas = filhos(
          db.status === 'ENVIADO' && ui.aviso(P('Enviado em ' + quando(db.enviadoEm) + '. Aguardando aprovação do Financeiro.', 'Submitted on ' + quando(db.enviadoEm) + '. Awaiting Finance approval.'), 'info'),
          db.status === 'APROVADO' && ui.aviso(P('Aprovado por ' + t(EU) + ' em ' + quando(db.decididoEm) + '. Linhas travadas.', 'Approved by ' + t(EU) + ' on ' + quando(db.decididoEm) + '. Lines locked.'), 'ok'),
          ed ? ui.aviso([P('Digite o valor de cada mês nas colunas ', 'Type the amount for each month in columns '), h('b', null, MES[0] + '/' + YY + t(P(' a ', ' to ')) + MES[11] + '/' + YY), P('. A coluna Realizado ' + REAL + ' é só referência. Para abrir outra conta gerencial em uma conta contábil, use o botão ', '. The Actual ' + REAL + ' column is only a reference. To open another management account under a ledger account, use the '), h('b', null, '+'), P(' na linha da conta.', ' button on the account row.')], 'info')
            : ui.aviso([h('b', null, P('Edição bloqueada.', 'Editing locked.')), ' ', db.status === 'ENVIADO' ? P('Orçamento enviado para aprovação; aguarde o retorno.', 'Budget submitted for approval; wait for the outcome.') : P('Orçamento aprovado. Para alterar, reabra.', 'Budget approved. To change it, reopen it.')], 'neutro'));
        const ib = (icn, rot, aoClicar, on) => { const b = ui.botao({ icone: IC[icn], titulo: rot, tom: 'fantasma', tamanho: 'p', classe: 'ib' + (on ? ' on' : ''), aoClicar }); b.setAttribute('aria-label', t(rot)); return b; };
        const celula = (l, m, rot) => {
          const inp = h('input', { class: 'gi', type: 'text', inputmode: 'decimal', autocomplete: 'off', 'data-m': String(m), placeholder: L === 'en' ? '0.00' : '0,00', 'aria-label': rot + ' · ' + MES[m] + ' ' + ANO, value: n2(l.valores[m]),
            onblur: ev => commit(l, m, ev.currentTarget), onkeydown: ev => tecla(ev, l, m), oninput: () => { if (rep) rep.hidden = !(parseValor(inp.value, L) > 0); } });
          const rep = m < 11 ? h('button', { type: 'button', class: 'rep', tabindex: '-1', hidden: !(l.valores[m] > 0), title: P('Replicar este valor até dezembro (Ctrl+Shift+seta para a direita)', 'Carry this amount through December (Ctrl+Shift+right arrow)'), 'aria-label': t(P('Replicar ' + MES[m] + ' até dezembro: ', 'Carry ' + MES[m] + ' through December: ')) + rot, onmousedown: ev => ev.preventDefault(), onclick: () => replicar(l, m, inp) }, '→ ' + MES[11]) : null;
          return h('td', { class: 'm' }, inp, rep);
        };
        const mostrados = grupos.map(x => ({ x, vis: x.linhas.filter(passa) })).filter(y => y.vis.length);
        let tabela;
        if (!mostrados.length) {
          tabela = ui.vazio({ titulo: P('Nenhuma conta corresponde aos filtros.', 'No account matches the filters.'), acao: btn(P('Limpar filtros', 'Clear filters'), () => { E.busca = ''; E.vf = 'todas'; pintar('busca'); }, { p: true }) });
        } else {
          const corpo = [];
          mostrados.forEach(({ x, vis }) => {
            let fechado = !!fechados[x.k];
            const filhas = [], icA = ic('chevd'), icF = ic('chevr');
            icA.hidden = fechado; icF.hidden = !fechado;
            const rg = { G: MES.map(() => numTd('gm', '')), tt: numTd('tt', ''), c: numTd('cs', ''), s: numTd('cs', '') };
            refs.grupo.set(x.k, rg);
            const alternar = ev => { fechado = !fechado; if (fechado) fechados[x.k] = true; else delete fechados[x.k]; filhas.forEach(tr => { tr.hidden = fechado; }); icA.hidden = fechado; icF.hidden = !fechado; ev.currentTarget.setAttribute('aria-expanded', String(!fechado)); };
            corpo.push(h('tr', { class: 'grp' },
              h('th', { scope: 'row', class: 'c0' }, h('div', { class: 'gl' },
                h('button', { type: 'button', class: 'gtg', 'aria-expanded': String(!fechado), title: x.conta + ' · ' + nomeConta(x.conta), onclick: alternar }, icA, icF, e('span', 'gcod', x.conta), e('span', 'gds', 'UN ' + x.un + ' · ' + nomeConta(x.conta))),
                ed && ib('plus', P('Incluir conta gerencial na conta ' + x.conta, 'Add a management account to account ' + x.conta), () => novaGerencial(x)))),
              numTd('ref', traco(REALIZADO[x.k])), rg.G, rg.tt, rg.c, rg.s, h('td', { class: 'ca' })));
            vis.forEach(l => {
              const rl = { tt: numTd('tt', ''), s: numTd('cs', '') };
              refs.linha.set(l.id, rl);
              const rot = x.conta + ' ' + nomeConta(x.conta) + ' · ' + l.ger + ' ' + t(GER[l.ger]);
              const tr = h('tr', { class: 'ln', hidden: fechado },
                h('th', { scope: 'row', class: 'c0' }, h('span', { class: 'lcell' }, e('span', 'lcod', l.ger), h('span', { class: 'lds', title: GER[l.ger] }, GER[l.ger]))),
                numTd('ref', '-'),
                l.valores.map((v, m) => (ed ? celula(l, m, rot) : numTd('ro', traco(v)))),
                rl.tt, numTd('cs', traco(l.comprometido)), rl.s,
                h('td', { class: 'ca' }, ib('message', t(l.obs) ? P('Ver observação: ', 'View note: ') : P('Incluir observação: ', 'Add note: '), () => abrirObs(l), !!t(l.obs))));
              tr.querySelector('.ca .ib').setAttribute('aria-label', t(t(l.obs) ? P('Ver observação: ', 'View note: ') : P('Incluir observação: ', 'Add note: ')) + rot);
              filhas.push(tr); corpo.push(tr);
            });
          });
          refs.pe = { F: MES.map(() => numTd('', '')), tt: numTd('tt', ''), c: numTd('cs', ''), s: numTd('cs', '') };
          tabela = h('div', { class: 'gbox', tabindex: '0', role: 'region', 'aria-label': P('Grade do orçamento ' + ANO, ANO + ' budget grid') },
            h('table', { class: 'g' },
              h('caption', { class: 'sr' }, P('Orçamento ' + ANO + ' por conta contábil e conta gerencial, em reais.', ANO + ' budget by ledger account and management account, in reais.')),
              h('thead', null,
                h('tr', { class: 'gh' }, h('th', { scope: 'col', class: 'c0', rowspan: '2' }, P('Conta contábil · gerencial', 'Ledger account · management')), h('th', { scope: 'colgroup', class: 'ref' }, P('Referência', 'Reference')),
                  h('th', { scope: 'colgroup', class: 'pr', colspan: '13' }, ed ? P('Orçamento ' + ANO + ' · preencha', 'Budget ' + ANO + ' · fill in') : P('Orçamento ' + ANO + ' · somente consulta', 'Budget ' + ANO + ' · read only')),
                  h('th', { scope: 'colgroup', class: 'cs', colspan: '2' }, P('Verba · uso no ano', 'Requests · use in the year')), h('th', { scope: 'col', class: 'ca', rowspan: '2' }, e('span', 'sr', P('Ações', 'Actions')))),
                h('tr', { class: 'gc' }, h('th', { scope: 'col', class: 'ref' }, P('Realizado ' + REAL, 'Actual ' + REAL)), MES.map(m => h('th', { scope: 'col' }, m + '/' + YY)),
                  h('th', { scope: 'col', class: 'tt' }, 'Total ' + ANO), h('th', { scope: 'col', class: 'cs' }, P('Comprometido', 'Committed')), h('th', { scope: 'col', class: 'cs' }, P('Saldo', 'Balance')))),
              h('tbody', null, corpo),
              h('tfoot', null, h('tr', null, h('th', { scope: 'row', class: 'c0' }, h('b', null, 'Total ' + ANO)), numTd('ref', n2z(totReal)), refs.pe.F, refs.pe.tt, refs.pe.c, refs.pe.s, h('td', { class: 'ca' })))));
        }
        const busca = ui.busca({ placeholder: P('Código ou descrição da conta', 'Account code or description'), rotulo: P('Buscar conta', 'Search account'), valor: E.busca || '', aoDigitar: v => { E.busca = v; pintar('busca'); } });
        busca.input.setAttribute('data-f', 'busca');
        const mostrar = ui.chips({ rotulo: P('Mostrar', 'Show'), valor: vf, opcoes: [{ valor: 'todas', texto: P('Todas as contas', 'All accounts') }, { valor: 'com', texto: P('Só com valor', 'With amount only') }, { valor: 'vaz', texto: P('Só vazias', 'Empty only') }], aoMudar: v => { E.vf = v; pintar('vf-' + v); } });
        [...mostrar.children].forEach((b, i) => b.setAttribute('data-f', 'vf-' + ['todas', 'com', 'vaz'][i]));
        const direita = [pill(db.status),
          db.status === 'EM_PREENCHIMENTO' && btn(P('Enviar para aprovação', 'Submit for approval'), enviar, { tom: 'primario', ic: 'send', foco: 'enviar' }),
          db.status === 'ENVIADO' && btn(P('Aprovar', 'Approve'), () => decidir('aprovar'), { tom: 'primario', ic: 'check', foco: 'aprovar' }),
          db.status === 'APROVADO' && btn(P('Reabrir', 'Reopen'), () => decidir('reabrir'), { ic: 'lockopen', foco: 'reabrir' }),
          btn(P('Histórico', 'History'), abrirHistorico, { ic: 'history', foco: 'historico' })];
        p.append(...filhos(
          h('div', { class: 'head' },
            h('div', null, h('p', { class: 'eyebrow' }, ic('wallet', 13), P('Orçamento anual ' + ANO, 'Yearly budget ' + ANO)), h('h2', { class: 't1 ph-h1' }, P('Meu orçamento ' + ANO, 'My budget ' + ANO)),
              e('p', 'sub', P('Preencha o valor de ' + ANO + ' mês a mês e envie para aprovação. O realizado vem do contábil do ERP.', 'Fill in the ' + ANO + ' amount month by month and submit for approval. Actuals come from the ERP ledger.')),
              h('div', { class: 'ctx' }, h('span', null, P('Gerência: Controladoria', 'Department: Controlling')), h('span', null, P('Diretoria: Administrativa e financeira', 'Division: Administration and finance')), h('span', null, P('Unidades: 010, 020', 'Business units: 010, 020')))),
            h('div', { class: 'row' }, direita)),
          kpi, h('div', { class: 'alerts' }, alertas),
          h('div', { class: 'toolbar' }, h('div', { class: 'field ph-campo' }, busca), mostrar, salvoEl),
          tabela, erroEl,
          ed && e('p', 'foot-note', [P('Cada alteração é salva sozinha e fica no histórico. Enter desce para a linha de baixo. Para levar o valor de um mês até dezembro, use ', 'Each change is saved by itself and stays in the history. Enter moves to the line below. To carry the amount of a month through December, use '), h('b', null, '→ ' + MES[11]), P(' na célula ou Ctrl+Shift+seta para a direita.', ' on the cell or Ctrl+Shift+right arrow.')]),
          h('div', { class: 'x-aids' }, e('span', 'x-leg', P('Recurso da demonstração:', 'Demo aid:')),
            h('button', { type: 'button', class: 'x-erp', 'data-f': 'rastro', title: P('Recurso da demonstração: mostra, passo a passo, o que o servidor faz', 'Demo aid: shows, step by step, what the server does'), onclick: rastroCelula }, ic('server', 11), P('O que o servidor faz a cada célula', 'What the server does for each cell')))));
        recalc();
      }

      /* ---------- as sete telas nas abas do kit; só Meu orçamento é navegável ---------- */
      const TELAS = [['meu', P('Meu orçamento', 'My budget'), 'wallet'], ['verba', P('Solicitações de verba', 'Budget requests'), 'handcoins'], ['painel', P('Painel', 'Dashboard'), 'dashboard'],
        ['orcamentos', P('Orçamentos', 'Budgets'), 'clipboard'], ['grade', P('Grade', 'Grid'), 'table'], ['gestores', P('Gestores', 'Managers'), 'users'], ['config', P('Configuração', 'Settings'), 'gear']];
      const contexto = () => h('div', { class: 'bo-acoes' }, ui.badge(P('Ano ' + ANO + ' · ligado', 'Year ' + ANO + ' · on'), 'ok'),
        h('span', { class: 'afoot' }, h('b', null, EU), h('small', null, P('Configuração · gestor', 'Settings · manager'))));
      raiz = h('div', { class: 'po x-shell' });
      el.append(raiz);
      /* redesenha a tela; foco = valor de data-f do controle que volta a ter o foco */
      function pintar(foco) {
        const tela = h('div', { class: 'po x-tela' });
        const abas = ui.abas({ rotulo: P('Telas do Planejamento orçamentário', 'Budget planning screens'), chave: 'boTela',
          abas: TELAS.map(([id, rotulo, icn]) => ({ id, rotulo, icone: IC[icn], contador: id === 'verba' ? 2 : 0,
            montar: painel => (id === 'meu' ? (painel.append(contexto()), telaMeu(painel)) : painel.append(api.ui.foraDaDemo({ titulo: rotulo }))) })) });
        abas.querySelector('.ph-abas-lista').classList.add('bo-nav');
        tela.append(abas);
        const g0 = raiz.querySelector('.gbox'), rolagem = g0 && [g0.scrollTop, g0.scrollLeft];   // a grade redesenhada fica onde estava
        raiz.replaceChildren(tela);
        const g1 = rolagem && raiz.querySelector('.gbox');
        if (g1) { g1.scrollTop = rolagem[0]; g1.scrollLeft = rolagem[1]; }
        const alvo = foco && raiz.querySelector('[data-f="' + foco + '"]');
        if (alvo) alvo.focus();
      }
      pintar();
    },
  });
})();
