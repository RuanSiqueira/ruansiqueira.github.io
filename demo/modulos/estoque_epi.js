/* Almoxarifado · versão pública curta do módulo de demonstração (id estoque_epi).
   EPI, uniformes, ferramentas e descartáveis de várias unidades no mesmo lugar. Só a tela principal (aba Estoque, com a barra
   de unidade e a entrada e a saída de exemplo) é navegável; as outras abas mostram o cartão "fora da demonstração".
   Dados fictícios e resultados prontos, nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const nrm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const UNIDADES = [[1, '001', P('Matriz', 'Headquarters')], [2, '002', P('Filial Norte', 'North branch')], [3, '003', P('Filial Sul', 'South branch')], [4, '004', P('Centro de distribuição', 'Distribution center')]];
  const CAT = { epi: P('EPI', 'PPE'), uni: P('Uniforme', 'Uniform'), eqp: P('Equipamento', 'Equipment'), fer: P('Ferramenta', 'Tool'), des: P('Descartável', 'Disposable') };
  const COR = { azul: P('Azul-marinho', 'Navy blue'), cinza: P('Cinza', 'Gray'), preta: P('Preta', 'Black'), laranja: P('Laranja', 'Orange'), branca: P('Branca', 'White') };
  const TAM = { G: P('G', 'L') };
  const SIT = { s: ['erro', P('Sem estoque', 'Out of stock')], a: ['alerta', P('Abaixo do mínimo', 'Below minimum')], o: ['ok', P('Normal', 'Normal')] };
  const ORD = { s: 0, a: 1, o: 2 };
  const FUNC = { 1: ['Ana Souza', 'Bruno Lima'], 2: ['Carla Mendes', 'Diego Rocha'], 3: ['Elisa Prado', 'Felipe Costa'], 4: ['Gabriela Nunes', 'Hugo Teixeira'] };
  /* [código, nome, categoria, tamanho, cor, lote de compra, dias desde a última movimentação, situação na visão consolidada,
      por unidade: { unidade: [entradas, saídas, mínimo, situação] }]; situação: s sem estoque, a abaixo do mínimo, o normal */
  const ITENS = [
    ['EPI-001', P('Luva de vaqueta', 'Leather work glove'), 'epi', 'G', null, 24, 2, 'o', { 1: [120, 86, 20, 'o'], 2: [70, 52, 12, 'o'], 3: [64, 49, 12, 'o'], 4: [40, 40, 8, 's'] }],
    ['EPI-002', P('Luva nitrílica', 'Nitrile glove'), 'epi', 'M', null, 40, 1, 'a', { 1: [150, 138, 30, 'a'], 2: [90, 71, 18, 'o'], 3: [80, 62, 18, 'o'] }],
    ['EPI-005', P('Óculos de proteção incolor', 'Clear safety glasses'), 'epi', null, null, 20, 4, 'a', { 1: [60, 41, 15, 'o'], 2: [36, 27, 9, 'o'], 3: [30, 26, 9, 'a'], 4: [20, 14, 6, 'o'] }],
    ['EPI-007', P('Protetor auricular tipo plug', 'Foam earplugs'), 'des', null, 'laranja', 60, 1, 'o', { 1: [400, 322, 50, 'o'], 2: [240, 240, 30, 's'], 3: [220, 181, 30, 'o'], 4: [150, 118, 20, 'o'] }],
    ['EPI-009', P('Respirador PFF2', 'PFF2 respirator'), 'des', null, 'branca', 50, 3, 'a', { 1: [200, 200, 40, 's'], 2: [120, 94, 24, 'o'], 3: [110, 84, 24, 'o'] }],
    ['EPI-012', P('Capacete de segurança', 'Safety helmet'), 'epi', null, 'branca', 10, 9, 'o', { 1: [30, 19, 8, 'o'], 2: [18, 13, 5, 'o'], 3: [16, 11, 5, 'o'], 4: [12, 8, 3, 'o'] }],
    ['EPI-014', P('Botina de segurança', 'Safety boot'), 'epi', '40', 'preta', 10, 6, 'a', { 1: [24, 22, 6, 'a'], 2: [14, 10, 4, 'o'], 3: [12, 8, 4, 'o'], 4: [10, 7, 3, 'o'] }],
    ['EPI-019', P('Máscara de solda', 'Welding helmet'), 'epi', null, 'preta', 4, 12, 'a', { 1: [8, 7, 3, 'a'], 3: [6, 4, 2, 'o'] }],
    ['UNI-002', P('Camisa de uniforme', 'Uniform shirt'), 'uni', 'M', 'azul', 12, 5, 'o', { 1: [48, 31, 12, 'o'], 2: [36, 27, 8, 'o'], 3: [28, 21, 7, 'o'], 4: [20, 18, 5, 'a'] }],
    ['UNI-005', P('Calça de uniforme', 'Uniform pants'), 'uni', '42', 'cinza', 12, 7, 'o', { 1: [50, 36, 10, 'o'], 2: [26, 21, 6, 'a'], 3: [24, 18, 6, 'o'], 4: [18, 12, 4, 'o'] }],
    ['EQP-001', P('Cinto paraquedista', 'Full-body harness'), 'eqp', null, null, 4, 20, 'a', { 1: [6, 3, 3, 'o'], 3: [4, 4, 2, 's'] }],
    ['FER-002', P('Estilete retrátil', 'Retractable utility knife'), 'fer', null, null, 10, 8, 'a', { 1: [20, 20, 6, 's'], 2: [12, 8, 4, 'o'], 4: [10, 7, 3, 'o'] }],
    ['DES-002', P('Luva de vinil descartável, caixa com 100', 'Disposable vinyl glove, box of 100'), 'des', 'M', null, 10, 2, 'o', { 1: [30, 18, 6, 'o'], 2: [20, 14, 4, 'o'] }],
  ];

  let db = null;   // sobrevive à troca de idioma

  const IC = {
    package: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    boxes: '<path d="M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"/><path d="m7 16.5-4.74-2.85"/><path d="m7 16.5 5-3"/><path d="M7 16.5v5.17"/><path d="M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"/><path d="m17 16.5-5-3"/><path d="m17 16.5 4.74-2.85"/><path d="M17 16.5v5.17"/><path d="M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"/><path d="M12 8 7.26 5.15"/><path d="m12 8 4.74-2.85"/><path d="M12 13.5V8"/>',
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    slidersh: '<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
    bars: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    upc: '<circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/>',
    downc: '<circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="m8 12 4 4 4-4"/>',
    alertc: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
    trend: '<polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>',
  };
  const ROT = 'font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const CSS = [
    '.ee-real{min-width:0}.ee-real.ee-raiz{color:var(--ph-text)}.ee-real p{margin:0}',
    '.ee-real .mono{font-family:var(--ph-font-mono);font-variant-numeric:tabular-nums}',
    '.ee-real .t-mut{color:var(--ph-text-muted)}.ee-real .t-dim{color:var(--ph-text-dim)}.ee-real .t-teal{color:var(--ph-ok)}.ee-real .t-coral{color:var(--ph-erro)}.ee-real .t-amber{color:var(--ph-alerta)}',
    /* barra de unidade logo abaixo das abas, com a mesma margem delas */
    '.ee-real .ph-abas-acoes{align-items:center}',
    '.ee-real .ee-ubar{display:flex;align-items:center;gap:8px 12px;flex-wrap:wrap;padding:10px clamp(8px,2vw,16px);background:var(--ph-surface);border-bottom:1px solid var(--ph-border)}',
    '.ee-real .ee-ubar .rot{' + ROT + ';color:var(--ph-text-dim)}.ee-real .ee-upill .c{font-family:var(--ph-font-mono);font-size:11px;opacity:.85;margin-right:2px}.ee-real .ee-upill.todas[aria-pressed="false"]{border-style:dashed}',
    '.ee-real .ee-ubar .obs{font-size:12.5px;color:var(--ph-text-dim);margin-left:auto}.ee-real .ee-ubar .obs.al{color:var(--ph-alerta)}',
    /* título, indicadores, filtros e tabela */
    '.ee-real .ee-sec{display:flex;align-items:flex-end;justify-content:space-between;gap:10px 16px;margin-bottom:18px;flex-wrap:wrap}.ee-real .ee-sec>div{flex:1 1 20rem;min-width:0}',
    '.ee-real .ee-kpis{margin-bottom:18px}',
    '.ee-real .ee-filtros{display:flex;gap:8px 10px;margin-bottom:14px;flex-wrap:wrap;align-items:center}.ee-real .ee-filtros .ee-busca{flex:1 1 220px;max-width:none}.ee-real .ee-filtros .ee-inp{width:auto;max-width:100%}',
    '.ee-real .ee-scroll{--ph-tabela-max:max(320px,calc(100vh - 280px))}.ee-real .ee-tbl{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;color:var(--ph-text-2);font-variant-numeric:tabular-nums lining-nums}',
    '.ee-real .ee-tbl th>span,.ee-real .ee-tbl td{padding-inline:10px}.ee-real .ee-tbl td.ctr{text-align:center}.ee-real .ee-tbl td.b6{font-weight:600;color:var(--ph-text);white-space:normal;min-width:150px}.ee-real .ee-tbl td.b7{font-weight:700}.ee-real .ee-tbl td.f12{font-size:12px}.ee-real .ee-tbl td.f14{font-size:14px}.ee-real .ee-tbl td.nw{white-space:nowrap}',
    '.ee-real .ee-tbl .pu{margin-right:10px;color:var(--ph-text-muted)}.ee-real .ee-tbl .pu b{color:var(--ph-text)}.ee-real .ee-tbl .pu.neg,.ee-real .ee-tbl .pu.neg b{color:var(--ph-erro)}',
    /* diálogo do lançamento de exemplo */
    '.ee-real .ee-dlg{display:grid;gap:14px;min-width:0}.ee-real .ee-3col{display:grid;gap:12px;grid-template-columns:repeat(3,minmax(0,1fr))}',
    '.ee-real .ee-lanc{background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio-lg)}.ee-real .ee-lanc .ee-scroll{--ph-tabela-max:none}',
    '.ee-real .ee-lanc-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border-bottom:1px solid var(--ph-border);flex-wrap:wrap}.ee-real .ee-lanc-top .t{font-size:13px;font-weight:700;color:var(--ph-text)}.ee-real .ee-lanc-top .r{font-family:var(--ph-font-mono);font-size:12px;color:var(--ph-text-muted)}',
    '.ee-real .ee-nota{font-size:12.5px;color:var(--ph-text-muted);line-height:1.6}',
    '@media (max-width:700px){.ee-real .ee-ubar .obs{margin-left:0}}',
    '@media (max-width:560px){.ee-real .ee-3col{grid-template-columns:minmax(0,1fr)}}',
  ].join('\n');

  Hub.registrar({
    id: 'estoque_epi',
    ordem: 11,
    grupo: P('Operação', 'Operations'),
    icone: 'escudo',
    nome: P('Almoxarifado', 'Stockroom'),
    resumo: P(
      'EPI, uniformes, ferramentas e descartáveis de cada unidade em um só lugar: saldo, estoque mínimo e reposição, entrega em lote por funcionário, listas configuráveis e funcionários sincronizados com o RH.',
      'PPE, uniforms, tools and disposables for every branch in one place: balance, minimum stock and restocking, batch delivery per employee, configurable lists and employees synced with HR.'
    ),
    manual: {
      pt: {
        destaque: 'O Almoxarifado controla equipamentos de proteção, uniformes, ferramentas e descartáveis de várias unidades no mesmo lugar: saldo e estoque mínimo por unidade, entradas e saídas em lote com o nome de quem recebeu e a lista de funcionários sempre igual à do RH.',
        oque: 'O que é. Um sistema de almoxarifado dentro do ProjectHub, usado por várias unidades da mesma empresa. O cadastro de itens é único; cada unidade tem o próprio saldo e o próprio estoque mínimo.\n\nO problema. O controle em planilha não dizia quanto havia de cada item em cada unidade, o que ia faltar nem qual equipamento cada funcionário recebeu. A falta só aparecia na hora da entrega, o material de uma unidade se misturava com o de outra e a lista de pessoas envelhecia a cada admissão e a cada desligamento.\n\nO que muda para quem usa. O saldo é sempre entradas menos saídas, os itens críticos sobem para o topo e a coluna A repor mostra quanto falta. Uma única tela entrega equipamentos para várias pessoas, e toda saída exige o funcionário identificado. A lista de funcionários vem dos contratos ativos do RH no ERP, só leitura: quem chegou entra, quem saiu fica inativo, nunca apagado.\n\nNesta demonstração. A aba Estoque funciona com dados fictícios, com uma entrada e uma saída de exemplo; as demais abas ficam fora da demonstração pública.',
        finalidade: 'Trocar a planilha por um registro único e auditável: quanto há de cada item em cada unidade, o que comprar antes de faltar e qual equipamento cada pessoa recebeu, quando e por qual motivo. O material de uma unidade não aparece no estoque de outra e o histórico nunca é apagado.',
        alcance: [
          'Saldo e estoque mínimo por item e por unidade, com visão consolidada',
          'Alerta de reposição: itens abaixo do mínimo ou sem estoque no topo, com a quantidade a repor',
          'Entrada e saída em lote, cada entrega com o nome de quem recebeu',
          'Funcionários sincronizados com o RH do ERP, só leitura, sozinho e sob demanda',
          'Histórico de movimentações, cadastro de itens, listas configuráveis e painel anual',
        ],
        tecnologias: ['Next.js / React', 'C# / .NET', 'SQL Server', 'TypeScript', 'Entity Framework Core', 'Integração com o RH do ERP'],
      },
      en: {
        destaque: 'Stockroom controls protective equipment, uniforms, tools and disposables for several branches in one place: balance and minimum stock per branch, batch inbound and outbound entries with the name of who received each item, and an employee list that always matches HR.',
        oque: 'What it is. A storeroom system inside ProjectHub, used by several branches of the same company. There is a single item register; each branch has its own balance and its own minimum stock.\n\nThe problem. Control by spreadsheet did not say how much of each item there was at each branch, what was about to run out or which equipment each employee received. Shortages only showed up at the moment of delivery, one branch\'s material got mixed with another\'s and the list of people went stale with every hire and every departure.\n\nWhat changes for users. The balance is always inbound minus outbound, critical items move to the top and the To restock column shows what is missing. A single screen hands equipment to several people, and every outbound entry requires the employee to be identified. The employee list comes from the active contracts in the ERP HR module, read-only: newcomers come in, leavers become inactive, never deleted.\n\nIn this demo. The Stock tab works with fictitious data, with a sample inbound and a sample outbound entry; the other tabs are not part of the public demo.',
        finalidade: 'Replace the spreadsheet with a single, auditable record: how much of each item there is at every branch, what to buy before it runs out and which equipment each person received, when and for what reason. One branch\'s material never shows up in another branch\'s stock and history is never deleted.',
        alcance: [
          'Balance and minimum stock per item and per branch, with a consolidated view',
          'Restock alert: items below minimum or out of stock at the top, with the quantity to restock',
          'Batch inbound and outbound entries, each delivery with the name of who received it',
          'Employees synced with the ERP HR module, read-only, on a schedule and on demand',
          'Movement history, item register, configurable lists and a yearly dashboard',
        ],
        tecnologias: ['Next.js / React', 'C# / .NET', 'SQL Server', 'TypeScript', 'Entity Framework Core', 'Integration with the ERP HR module'],
      },
    },
    /* mini tour: só ganchos do módulo (.ee-raiz, data-f, .ee-*), nada que dependa do idioma */
    tour: [
      { alvo: '.ee-raiz [data-f="aba-estoque"]', acao: 'clicar', titulo: P('Bem-vindo ao almoxarifado', 'Welcome to the stockroom'),
        texto: P('EPI, uniformes, ferramentas e descartáveis de todas as unidades em um só lugar. A aba Estoque é a primeira parada do dia.',
          'PPE, uniforms, tools and disposables from every branch in one place. The Stock tab is the first stop of the day.') },
      { alvo: '.ee-raiz .ee-ubar', titulo: P('Cada unidade com o seu saldo', 'Each branch with its own balance'),
        texto: P('Escolha a unidade para ver o estoque dela e lançar nela. Em Todas, a empresa aparece somada, com uma coluna que mostra onde está cada material.',
          'Pick a branch to see its stock and post entries there. In All, the whole company is added up, with a column showing where each item is.') },
      { alvo: '.ee-raiz .ee-kpis', titulo: P('O estoque em quatro números', 'Stock in four numbers'),
        texto: P('Itens cadastrados, peças na prateleira, o que está abaixo do mínimo e o que já acabou. Dá para saber como anda a unidade antes do primeiro café.',
          'Registered items, pieces on the shelf, what is below minimum and what has run out. You know how the branch is doing before the first coffee.') },
      { alvo: '.ee-raiz .ee-scroll', titulo: P('O que vai faltar aparece primeiro', 'What will run out comes first'),
        texto: P('Itens sem estoque ou abaixo do mínimo sobem para o topo, e a coluna A repor diz quanto comprar. A falta aparece aqui, não na hora da entrega.',
          'Items out of stock or below minimum rise to the top, and the To restock column says how much to buy. Shortages show up here, not at the moment of delivery.') },
      { alvo: '.ee-raiz [data-f="aba-movs"]', acao: 'clicar', titulo: P('Cada entrega com o nome de quem recebeu', 'Every delivery with the name of who received it'),
        texto: P('Entrada e Saída, no alto da tela, lançam várias linhas de uma vez. Toda saída leva o funcionário que recebeu, da lista do RH, e fica guardada em Movimentações.',
          'Inbound and Outbound, at the top of the screen, post several lines at once. Every outbound entry carries the employee who received it, from the HR list, and is kept in Movements.') },
      { alvo: '.ee-raiz .ph-fora', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('Movimentações, Itens, Config e o painel do ano ficam na versão completa. O vídeo deste cartão mostra o almoxarifado inteiro em ação; para ver de perto, é só me chamar por aqui.',
          'Movements, Items, Config and the yearly dashboard are in the full version. The video in this card shows the whole stockroom in action; to see it up close, just reach me from here.') },
    ],

    montar(el, api) {
      if (!db) db = ITENS.map(([codigo, nome, cat, tam, cor, lote, dias, sit, por]) => ({ codigo, nome, cat, tam, cor, lote, dias, sit, por: Object.fromEntries(Object.entries(por).map(([u, v]) => [u, v.slice()])) }));
      if (!document.getElementById('ee-real-css')) { const st = document.createElement('style'); st.setAttribute('id', 'ee-real-css'); st.textContent = CSS; (document.head || document.documentElement).appendChild(st); }
      const { t, h, ui, fmt } = api;
      const E = api.estado;
      if (E.unidade === undefined) E.unidade = 1;
      const raiz = h('div', { class: 'ee-real ee-raiz' });
      el.append(raiz);

      const fora = titulo => (ui.foraDaDemo ? ui.foraDaDemo({ titulo })
        : ui.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is not part of the public demo.') }));
      const un = id => UNIDADES.find(u => u[0] === id);
      const nomeUn = id => { const u = un(id); return u ? u[1] + ' ' + t(u[2]) : ''; };
      const tam = it => (it.tam ? TAM[it.tam] || it.tam : '-');
      const pl = (n, um, varios) => fmt.num(n) + ' ' + t(n === 1 ? um : varios);
      const PECA = [P('peça', 'piece'), P('peças', 'pieces')];
      const chip = (txt, tom) => { const b = ui.badge(txt, tom); b.classList.add('ee-chip'); return b; };
      const btn = (tom, texto, aoClicar, icn, foco) => { const b = ui.botao({ texto, aoClicar, tom, icone: icn && IC[icn], tamanho: 'p' }); if (foco) b.setAttribute('data-f', foco); return b; };
      const td = (classe, ...filhos) => h('td', classe ? { class: classe } : null, ...filhos);
      const tabela = (rotulo, minW, cab, corpo) => h('div', { class: 'ee-scroll ph-tabela-wrap', tabindex: '0', role: 'region', 'aria-label': rotulo },
        h('table', { class: 'ee-tbl ph-tabela', style: 'min-width:' + minW + 'px' }, h('thead', null, h('tr', null, cab.map(x => h('th', { scope: 'col' }, h('span', null, x))))), corpo));

      /* linhas da tela: a unidade escolhida ou a soma das unidades */
      function visao(u) {
        return db.map(it => {
          const ps = Object.entries(it.por).filter(([k]) => !u || Number(k) === u);
          if (!ps.length) return null;
          const soma = i => ps.reduce((a, [, v]) => a + v[i], 0);
          const ent = soma(0), sai = soma(1);
          return { it, ent, sai, saldo: ent - sai, min: soma(2), sit: u ? it.por[u][3] : it.sit, porUn: u ? null : ps.map(([k, v]) => [Number(k), v[0] - v[1], v[3]]) };
        }).filter(Boolean).sort((a, b) => ORD[a.sit] - ORD[b.sit] || t(CAT[a.it.cat]).localeCompare(t(CAT[b.it.cat])) || t(a.it.nome).localeCompare(t(b.it.nome)));
      }

      const ABAS = [['estoque', P('Estoque', 'Stock'), 'boxes'], ['movs', P('Movimentações', 'Movements'), 'clipboard'], ['itens', P('Itens', 'Items'), 'package'],
        ['config', P('Config', 'Config'), 'slidersh'], ['dashboard', P('Dashboard', 'Dashboard'), 'bars']];
      function pintar(foco) {
        const linhas = visao(E.unidade);
        const crit = linhas.filter(r => r.sit !== 'o').length;
        const nav = ui.abas({
          chave: 'aba', rotulo: P('Seções do controle de estoque', 'Stock control sections'),
          acoes: [crit > 0 && chip(crit === 1 ? P('1 item pede reposição', '1 item needs restocking') : P(crit + ' itens pedem reposição', crit + ' items need restocking'), 'alerta'),
            btn('ok', P('Entrada', 'Inbound'), () => lancar('ENTRADA'), 'upc', 'entrada'), btn('perigo', P('Saída', 'Outbound'), () => lancar('SAIDA'), 'downc', 'saida')],
          abas: ABAS.map(([id, rot, icn]) => ({ id, rotulo: rot, icone: IC[icn], montar: pn => (id === 'estoque' ? pintarEstoque(pn, linhas) : pn.append(fora(rot))) })),
        });
        nav.querySelector('.ph-abas-lista').classList.add('ee-nav');
        nav.querySelectorAll('[role="tab"]').forEach((b, i) => b.setAttribute('data-f', 'aba-' + ABAS[i][0]));
        nav.replaceChildren(nav.children[0], barraUnidade(), nav.painel);
        raiz.replaceChildren(nav);
        const alvo = foco && raiz.querySelector('[data-f="' + foco + '"]');
        if (alvo) alvo.focus();
      }

      function barraUnidade() {
        const uni = E.unidade;
        const ops = UNIDADES.map(([id, cod, nome]) => ({ valor: id, texto: [h('span', { class: 'c' }, cod), ' ', nome] })).concat([{ valor: 0, texto: P('Todas', 'All') }]);
        const pills = ui.chips({ rotulo: P('Unidade', 'Branch'), opcoes: ops, valor: uni, aoMudar: id => { E.unidade = id; pintar('un-' + id); } });
        [...pills.children].forEach((b, i) => { b.classList.add('ee-upill'); if (!ops[i].valor) b.classList.add('todas'); b.setAttribute('data-f', 'un-' + ops[i].valor); });
        return h('div', { class: 'ee-ubar' }, h('span', { class: 'rot' }, P('Unidade', 'Branch')), pills,
          h('span', { class: 'obs' + (uni ? '' : ' al') }, uni ? [P('Lançamentos serão registrados em ', 'Entries will be posted at '), nomeUn(uni)]
            : P('Visão consolidada. Selecione uma unidade para efetuar lançamentos.', 'Consolidated view. Select a branch to post entries.')));
      }

      /* ---------- aba Estoque (a tela principal) ---------- */
      function pintarEstoque(c, linhas) {
        const uni = E.unidade, consol = !uni;
        const conta = s => linhas.filter(r => r.sit === s).length;
        const corpo = h('tbody');
        const linha = r => {
          const repor = Math.max(0, r.min - r.saldo);
          return h('tr', { class: 'ee-row' },
            td('mono t-mut', r.it.codigo), td('b6', r.it.nome), td('t-mut', CAT[r.it.cat]), td('t-mut ctr', tam(r.it)), td('t-mut', r.it.cor ? COR[r.it.cor] : '-'),
            td('mono ctr t-teal', r.ent), td('mono ctr t-coral', r.sai), td('mono ctr b7 f14' + (r.sit === 's' ? ' t-coral' : ''), r.saldo),
            consol && td('mono f12 t-mut nw', r.porUn.map(([u, s, st]) => h('span', { class: 'pu' + (st === 's' ? ' neg' : '') }, t(un(u)[2]) + ' ', h('b', null, s)))),
            td('mono ctr t-dim', r.min), td('mono ctr b7 ' + (repor ? 't-amber' : 't-dim'), repor || '-'),
            td('mono t-dim f12', fmt.data(api.data(-r.it.dias))), td(null, chip(SIT[r.sit][1], SIT[r.sit][0])));
        };
        const aplicar = () => {
          const q = nrm(E.busca).trim(), fs = E.fSit || 'todos';
          const l = linhas.filter(r => (!q || nrm(t(r.it.nome)).includes(q) || nrm(r.it.codigo).includes(q)) && (fs === 'todos' || r.sit === fs) && (!E.fCat || r.it.cat === E.fCat));
          corpo.replaceChildren(...(l.length ? l.map(linha)
            : [h('tr', null, h('td', { class: 'ph-tabela-vazio', colspan: consol ? 13 : 12 }, P('Nenhum item corresponde aos filtros aplicados.', 'No items match the filters applied.')))]));
        };
        aplicar();
        const rotBusca = P('Localizar por nome ou código', 'Find by name or code');
        const busca = ui.busca({ placeholder: rotBusca, rotulo: rotBusca, valor: E.busca || '', aoDigitar: v => { E.busca = v; aplicar(); } });
        busca.classList.add('ee-busca');
        const situacao = ui.chips({ rotulo: P('Filtrar por situação', 'Filter by status'), valor: E.fSit || 'todos', aoMudar: s => { E.fSit = s; aplicar(); },
          opcoes: [{ valor: 'todos', texto: P('Todos', 'All') }].concat(['s', 'a', 'o'].map(s => ({ valor: s, texto: SIT[s][1] }))) });
        const cat = ui.select({ ariaLabel: P('Filtrar por categoria', 'Filter by category'), vazio: P('Todas as categorias', 'All categories'), valor: E.fCat || '',
          opcoes: Object.keys(CAT).map(k => ({ valor: k, texto: CAT[k] })), aoMudar: v => { E.fCat = v; aplicar(); } });
        cat.classList.add('ee-inp');
        const kpis = [
          [P('Itens cadastrados', 'Registered items'), fmt.num(linhas.length), 'var(--ph-cor-azul)', 'package', consol ? t(P('somando todas as unidades', 'across all branches')) : t(P('habilitados em ', 'enabled at ')) + t(un(uni)[2])],
          [P('Peças em estoque', 'Pieces in stock'), fmt.num(linhas.reduce((a, r) => a + r.saldo, 0)), 'var(--ph-info)', 'boxes'],
          [P('Abaixo do mínimo', 'Below minimum'), fmt.num(conta('a')), 'var(--ph-alerta)', 'trend'],
          [P('Sem estoque', 'Out of stock'), fmt.num(conta('s')), 'var(--ph-erro)', 'alertc'],
        ];
        const k = ui.kpis(kpis.map(([rotulo, valor, , icn, detalhe]) => ({ rotulo, valor, icone: IC[icn], detalhe })));
        k.classList.add('ee-kpis');
        [...k.children].forEach((x, i) => x.style.setProperty('--tom', kpis[i][2]));
        c.append(
          h('div', { class: 'ee-sec' }, h('div', null,
            h('p', { class: 'ph-kicker' }, consol ? P('posição atual · todas as unidades', 'current position · all branches') : [P('posição atual · ', 'current position · '), nomeUn(uni)]),
            h('h2', { class: 'ph-h1' }, P('Estoque', 'Stock')),
            h('p', { class: 'ph-sub' }, consol
              ? P('Posição somada de todas as unidades. A coluna Por unidade mostra onde está o material.', 'Position added up across all branches. The Per branch column shows where the material is.')
              : P('Posição de cada item nesta unidade: total de entradas menos total de saídas. A coluna A repor mostra quanto falta para voltar ao estoque mínimo.', 'Position of each item at this branch: total inbound minus total outbound. The To restock column shows how much is missing to get back to the minimum stock.')))),
          k,
          h('div', { class: 'ee-filtros' }, busca, situacao, cat),
          tabela(P('Posição do estoque', 'Stock position'), 900, [P('Código', 'Code'), P('Item', 'Item'), P('Categoria', 'Category'), P('Tam.', 'Size'), P('Cor', 'Color'), P('Entradas', 'Inbound'), P('Saídas', 'Outbound'), P('Saldo', 'Balance'),
            consol && P('Por unidade', 'Per branch'), P('Mínimo', 'Minimum'), P('A repor', 'To restock'), P('Últ. mov.', 'Last mov.'), P('Situação', 'Status')].filter(Boolean), corpo));
      }

      /* ---------- entrada e saída de exemplo: lote já preenchido, resultado pronto ---------- */
      function lancar(tipo) {
        const saida = tipo === 'SAIDA', u = E.unidade;
        if (!u) return ui.toast(P('A visão consolidada não permite lançamentos. Selecione uma unidade no topo da tela.', 'The consolidated view does not allow entries. Select a branch at the top of the screen.'), 'alerta');
        const linhas = visao(u);
        let ls;
        if (saida) {
          /* três entregas dos itens com mais folga, para nenhum mudar de situação */
          const folga = it => Object.values(it.por).reduce((a, v) => a + v[0] - v[1] - v[2], 0);
          ls = [];
          linhas.filter(r => r.sit === 'o').sort((a, b) => (b.saldo - b.min) - (a.saldo - a.min)).forEach(r => {
            const q = [2, 1, 1][ls.length];
            if (q && r.saldo - r.min >= q && (r.it.sit !== 'o' || folga(r.it) >= q)) ls.push({ r, q, quem: FUNC[u][ls.length > 1 ? 1 : 0] });
          });
        } else ls = linhas.filter(r => r.sit !== 'o').map(r => ({ r, q: r.it.lote }));
        if (!ls.length) return ui.toast(saida ? P('Nenhum item desta unidade tem saldo para a saída de exemplo.', 'No item at this branch has enough balance for the sample outbound entry.')
          : P('Nenhum item desta unidade pede reposição.', 'No item at this branch needs restocking.'), 'info');
        const pecas = ls.reduce((a, l) => a + l.q, 0);
        const resumo = [pl(ls.length, P('lançamento', 'entry'), P('lançamentos', 'entries')), pl(pecas, ...PECA), saida && pl(new Set(ls.map(l => l.quem)).size, P('pessoa', 'person'), P('pessoas', 'people'))].filter(Boolean).join(' · ');
        const mot = saida ? P('Entrega', 'Delivery') : P('Compra', 'Purchase'), novo = P('Novo', 'New');
        const titulo = saida ? P('Registrar saída', 'Post outbound') : P('Registrar entrada', 'Post inbound');
        const fixo = (rotulo, valor, tipoC) => ui.campo({ rotulo, valor: t(valor), tipo: tipoC, desabilitado: true });
        const d = new Date(), pad = n => String(n).padStart(2, '0');
        ui.modal({
          titulo, icone: IC[saida ? 'downc' : 'upc'], largura: 900, classe: 'ee-real ee-lanc-m',
          corpo: h('div', { class: 'ee-dlg' },
            ui.aviso([P('Lançamento na unidade ', 'Posting at branch '), h('b', { class: 'mono' }, un(u)[1]), ' ' + t(un(u)[2])], 'info'),
            h('div', { class: 'ee-3col' }, fixo(P('Data do lançamento', 'Entry date'), d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()), 'data'), fixo(P('Motivo', 'Reason'), mot), fixo(P('Estado do item', 'Item condition'), novo)),
            h('div', { class: 'ee-lanc' },
              h('div', { class: 'ee-lanc-top' }, h('span', { class: 't' }, saida ? P('Entregas', 'Deliveries') : P('Itens da nota', 'Invoice items')), h('span', { class: 'r' }, resumo)),
              tabela(saida ? P('Entregas', 'Deliveries') : P('Itens da nota', 'Invoice items'), 560, [saida && P('Funcionário', 'Employee'), P('Item', 'Item'), P('Qtd.', 'Qty'), P('Motivo', 'Reason'), P('Estado', 'Condition')].filter(Boolean),
                h('tbody', null, ls.map(l => h('tr', null, saida && td('b6', l.quem), td(saida ? 't-mut' : 'b6', l.r.it.codigo + ' · ' + t(l.r.it.nome) + (l.r.it.tam ? ' (' + t(tam(l.r.it)) + ')' : '')),
                  td('mono ctr b7 ' + (saida ? 't-coral' : 't-teal'), l.q), td('t-mut', mot), td('t-mut', novo)))))),
            h('p', { class: 'ee-nota' }, P('Exemplo já preenchido. Na versão completa cada linha escolhe item, quantidade, motivo, estado e, na saída, o funcionário que recebe.', 'Pre-filled example. In the full version every line picks the item, quantity, reason, condition and, for outbound, the employee who receives it.'))),
          acoes: ctl => [ui.botao({ texto: P('Cancelar', 'Cancel'), tom: 'secundario', aoClicar: () => ctl.fechar() }),
            ui.botao({ texto: t(titulo) + ' · ' + pl(pecas, ...PECA), tom: saida ? 'primario' : 'ok', aoClicar: () => { ctl.fechar(); registrar(saida, u, ls, resumo); } })],
        });
      }
      function registrar(saida, u, ls, resumo) {
        ui.backend({
          titulo: saida ? P('Registrar saída', 'Post outbound') : P('Registrar entrada', 'Post inbound'), subtitulo: nomeUn(u) + ' · ' + resumo, escrita: 'create',
          passos: [
            { tipo: 'api', ms: 150, titulo: P('A tela envia as linhas do lançamento', 'The screen sends the entry lines') },
            { tipo: 'regra', ms: 26, titulo: P('Confere no servidor o papel e a unidade de quem lançou', 'The server checks the role and branch of who posted') },
            { tipo: 'sql', ms: 90, titulo: saida ? P('Grava uma movimentação por linha, com o nome de quem recebeu', 'Saves one movement per line, with the name of who received it') : P('Grava uma movimentação por item da nota', 'Saves one movement per invoice item') },
            { tipo: 'api', ms: 180, titulo: P('Devolve o saldo atualizado da unidade', 'Returns the updated branch balance') },
          ],
          resumo: saida ? P('Saída registrada com o nome de quem recebeu.', 'Outbound posted with the name of who received it.') : P('Entrada registrada e saldo atualizado.', 'Inbound posted and balance updated.'),
          aoConcluir: () => {
            ls.forEach(({ r, q }) => {
              const v = r.it.por[u];
              r.it.dias = 0;
              if (saida) { v[1] += q; return; }
              v[0] += q; v[3] = 'o';
              if (Object.values(r.it.por).every(x => x[3] === 'o')) r.it.sit = 'o';
            });
            pintar();
            ui.toast(t(saida ? P('Saída registrada: ', 'Outbound posted: ') : P('Entrada registrada: ', 'Inbound posted: ')) + resumo, 'ok');
          },
        });
      }

      pintar();
    },
  });
})();
