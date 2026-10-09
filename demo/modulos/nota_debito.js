/* Notas de débito · versão pública curta do módulo do ProjectHub de demonstração (id nota_debito).
   Só a tela principal (Emissão da nota de débito) é navegável, com dados fictícios e resultados prontos. As outras áreas
   continuam na navegação e abrem o cartão "fora da demonstração". Visual único do hub: peças do kit da casca e tokens --ph-*;
   o nome e o departamento ficam na moldura. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const r2 = v => Math.round(v * 100) / 100;
  const soma = (lista, f) => r2(lista.reduce((s, x) => s + f(x), 0));
  let db = null;
  let A, ui, h, t, fmt;

  /* ---------- dados de exemplo (fictícios e já prontos) ---------- */
  const CLI = {
    'C-1001': ['Metalúrgica Exemplo Ltda', 'PR'], 'C-1008': ['Comercial Modelo Ltda', 'SC'], 'C-1015': ['Agropecuária Demo Ltda', 'PR'],
    'C-1022': ['Construtora Amostra Ltda', 'SP'], 'C-1029': ['Transportes Fictícia Ltda', 'PR'], 'C-1036': ['Usinagem Exemplo Ltda', 'RS'],
    'C-1043': ['Ferragens Modelo Ltda', 'MG'], 'C-1050': ['Distribuidora Demo Ltda', 'PR'], 'C-1057': ['Indústria Amostra Ltda', 'SC'],
    'C-1064': ['Cooperativa Fictícia Ltda', 'PR'],
  };
  const UNID = { '001': P('Matriz', 'Head office'), '002': P('Filial', 'Branch') };
  const MAT = {
    'PA-1010': [P('Engate rápido reforçado', 'Heavy-duty quick coupler'), '8431.49.29', 'PC'], 'PA-1024': [P('Suporte articulado 3 pontos', 'Three-point hinged bracket'), '8432.90.00', 'PC'],
    'PA-2003': [P('Kit de fixação com parafusos', 'Bolt fastening kit'), '7318.15.00', 'KT'], 'PA-2117': [P('Pino trava de aço', 'Steel lock pin'), '7318.24.00', 'PC'],
    'PA-3050': [P('Chapa de desgaste', 'Wear plate'), '7326.90.90', 'PC'], 'PA-3102': [P('Lâmina de corte tratada', 'Heat-treated cutting blade'), '8208.40.00', 'PC'],
    'PA-4008': [P('Cilindro hidráulico 2 pol.', 'Hydraulic cylinder 2 in'), '8412.21.10', 'PC'], 'PA-4215': [P('Mangueira hidráulica 1,5 m', 'Hydraulic hose 1.5 m'), '4009.22.90', 'PC'],
    'PA-5001': [P('Rolamento blindado', 'Sealed bearing'), '8482.10.10', 'PC'], 'PA-5120': [P('Correia dentada', 'Timing belt'), '4010.35.00', 'PC'],
    'PA-6033': [P('Protetor de eixo cardã', 'Driveshaft guard'), '3926.90.90', 'PC'], 'PA-7006': [P('Disco de arado 26 pol.', 'Plough disc 26 in'), '8432.90.00', 'PC'],
  };
  /* pedidos na fila: [número, cliente, unidade, dias atrás, situação, itens [material, qtd, preço, valor na nota], adiantamento, nota [número, série]] */
  const PEDIDOS = [
    ['715312', 'C-1001', '001', 0, 'apto', [['PA-1010', 4, 428.5, 1791.04], ['PA-2003', 20, 64.9, 1356.34], ['PA-5001', 6, 52.75, 330.72]], 3478.1, [61242, 'U01']],
    ['715309', 'C-1008', '002', 1, 'parcial', [['PA-1024', 3, 912, 1368], ['PA-4215', 10, 89.6, 448]], 1816, [20416, 'U02']],
    ['715307', 'C-1015', '001', 1, 'sem', [['PA-7006', 5, 318, 0], ['PA-3102', 4, 157.3, 0]], 0, null],
    ['715305', 'C-1022', '001', 2, 'simulado', [['PA-4008', 2, 1340, 2729.3], ['PA-5120', 10, 74.2, 755.65], ['PA-2117', 30, 18.4, 562.15]], 4047.1, [61243, 'U01']],
    ['715303', 'C-1029', '002', 2, 'conferir', [['PA-6033', 2, 119.9, 2365.46], ['PA-2117', 10, 18.4, 1815.04]], 4180.5, [20417, 'U02']],
    ['715301', 'C-1036', '001', 3, 'criada', [['PA-3050', 3, 236, 743.4], ['PA-5001', 8, 52.75, 443.1]], 1186.5, [61241, 'U01']],
    ['715298', 'C-1043', '001', 4, 'emitida', [['PA-1010', 2, 428.5, 886.42], ['PA-4215', 5, 89.6, 463.38]], 1349.8, [61238, 'U01']],
    ['715296', 'C-1050', '002', 6, 'apto', [['PA-1024', 1, 912, 950.81], ['PA-3102', 6, 157.3, 983.97], ['PA-2003', 10, 64.9, 676.62]], 2611.4, [20418, 'U02']],
  ];
  const SEM_PEDIDO = [['C-1057', 30, 950], ['C-1064', 64, 12600]];

  function semear(api) {
    db = {
      pedidos: PEDIDOS.map(([num, cli, un, dias, sit, itens, adiant, nf], k) => ({
        num, cli, un, itens, adiant, pronta: nf, dt: api.data(-dias, (9 + k) + ':' + (15 + k * 4)),
        sit: sit === 'simulado' ? 'apto' : sit, simulada: sit === 'simulado',
        nota: sit === 'criada' || sit === 'emitida' ? { nf: nf[0], serie: nf[1], emissao: api.data(-dias, '16:20') } : null,
      })),
      semPedido: SEM_PEDIDO.map(([cli, dias, valor]) => ({ cli, valor, data: api.data(-dias, '15:30') })),
    };
  }

  Hub.registrar({
    id: 'nota_debito',
    ordem: 2,
    grupo: P('Fiscal e financeiro', 'Tax and finance'),
    icone: '<path d="M6 3h8.5L19 7.5V21H6zM14 3v5h5M9 14.5h7"/>',
    nome: P('Notas de débito', 'Debit notes'),
    resumo: P('Nota de Débito de pagamento antecipado da Reforma Tributária: cria e emite a nota a partir do pedido, vincula a nota ao pedido e garante que a venda cite a nota, como a Reforma pede.',
      'Advance-payment debit note required by Brazil\'s tax reform: it creates and issues the note from the sales order, links it to the order and makes sure the sale references the note, as the reform requires.'),
    manual: {
      pt: {
        destaque: 'O módulo cria e emite a Nota de Débito a partir do pedido, vincula a nota ao pedido e garante que a venda cite a nota, como a Reforma Tributária pede. Antes, o ERP não fazia nada disso e cada nota era digitada à mão. Em 9 dias entreguei a automação, e desde agosto de 2026 a empresa emite e vincula sem digitação, logo no início da exigência.',
        oque: 'O que é. Um módulo do ProjectHub, a camada inteligente sobre o ERP, que cuida da Nota de Débito de pagamento antecipado do começo ao fim. Quando o cliente paga antes de receber a mercadoria, a Reforma Tributária pede uma nota de débito com os mesmos itens da venda futura, e depois a nota de venda precisa citar essa nota dentro do arquivo enviado à SEFAZ.\n\nO problema. O processo era manual e passava por uma pessoa: ler o relatório de adiantamentos, abrir o pedido, digitar a nota item a item, dividir o valor na calculadora e avisar a Expedição para que a venda citasse a nota. O ponto mais frágil era invisível: nenhuma tela mostrava quando a referência faltava.\n\nO que faz. Cria a nota de débito a partir do pedido pago antecipadamente, divide o valor entre os itens ao centavo, envia à SEFAZ e garante que a venda cite a nota dentro do XML.\n\nNesta demonstração pública, a tela de Emissão funciona com dados fictícios; as outras áreas aparecem no vídeo da versão completa.',
        finalidade: 'Tirar da área Fiscal a digitação e a coordenação por fora, e tornar visível o vínculo que antes só existia dentro do XML. As pessoas continuam com o que exige decisão: marcar o pedido, lançar o adiantamento, tratar exceções e ligar ou desligar a automação.\n\nSegurança. O módulo nasceu em modo sombra, passou por base de teste e tem um interruptor geral. O pedido só avança com a autorização da SEFAZ, e valor fora do padrão passa por conferência humana.\n\nResultados. 9 dias do pedido da área Fiscal até a primeira nota autorizada pela SEFAZ. A tela de conferência passou de 25 s para 165 ms.\n\nProjetado e construído por Ruan Siqueira: telas, serviços, banco de dados e robô. As regras fiscais foram validadas com a área Fiscal da empresa.',
        alcance: [
          'Emissão: antecipações aguardando nota, fila de pedidos pagos antecipadamente e a nota pronta, com as validações e o valor dividido por item.',
          'Envio à SEFAZ por um robô que opera o ERP, com a tela dele acompanhada ao vivo.',
          'Acompanhamento do vínculo com a venda, nota a nota: vinculadas, aguardando e atrasadas.',
          'Histórico de decisões e avisos por e-mail para a equipe.',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript', 'Robô de tela', 'NF-e (XML)'],
      },
      en: {
        destaque: 'The module creates and issues the Debit Note from the sales order, links it to the order and makes sure the sale references the note, as Brazil\'s tax reform requires. Before, the ERP did none of this and every note was typed by hand. I delivered the automation in 9 days, and since August 2026 the company has issued and linked notes with no typing, right at the start of the requirement.',
        oque: 'What it is. A module of ProjectHub, the intelligent layer on top of the ERP, that handles the advance-payment Debit Note from start to finish. When a customer pays before receiving the goods, Brazil\'s tax reform requires a debit note listing the same items as the future sale, and later the sales invoice must reference that note inside the file sent to SEFAZ, the state tax authority.\n\nThe problem. The process was manual and depended on one person: read the advances report, open the order, type the note item by item, split the amount on a calculator and warn Shipping so the sale would reference the note. The weakest point was invisible: no screen showed when the reference was missing.\n\nWhat it does. It creates the debit note from the order paid in advance, splits the amount across the items to the cent, sends it to SEFAZ and makes sure the sale references the note inside the XML.\n\nIn this public demo, the Issuing screen works on fictitious data; the other areas appear in the video of the full version.',
        finalidade: 'To take typing and side-channel coordination off the tax team, and to make visible a link that used to exist only inside the XML. People keep what needs a decision: flagging the order, posting the advance, handling exceptions and switching the automation on or off.\n\nSafeguards. The module was born in shadow mode, went through a test database and has a main switch. The order only moves on with SEFAZ authorisation, and an out-of-range amount goes through human review.\n\nResults. 9 days from the tax team\'s request to the first note authorised by SEFAZ. The check screen went from 25 s to 165 ms.\n\nDesigned and built by Ruan Siqueira: screens, services, database and robot. The tax rules were validated with the company tax team.',
        alcance: [
          'Issuing: advances awaiting a note, the queue of orders paid in advance and the ready note, with the checks and the amount split per item.',
          'Sending to SEFAZ by a robot that operates the ERP, with its screen followed live.',
          'Follow-up of the link to the sale, note by note: linked, waiting and late.',
          'Decision history and e-mail notices for the team.',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript', 'Screen robot', 'NF-e (XML)'],
      },
    },
    /* mini tour: só ganchos do módulo (data-f, .nd-*), nada que dependa do idioma */
    tour: [
      { alvo: '.nd-real [data-f="area-emissao"]', acao: 'clicar', titulo: P('A nota que a Reforma pede', 'The note the tax reform asks for'),
        texto: P('Quando o cliente paga antes de receber, a Reforma Tributária pede uma nota de débito. Aqui ela nasce do pedido, sem digitação.',
          'When a customer pays before receiving the goods, the tax reform requires a debit note. Here it is born from the sales order, with no typing.') },
      { alvo: '.nd-real .ndtv', titulo: P('O dinheiro que chegou antes', 'The money that arrived early'),
        texto: P('Antecipações aguardando nota, as prontas para emitir e as que ainda não têm pedido, cada grupo com o seu valor.',
          'Advances awaiting a note, the ones ready to issue and the ones still without an order, each group with its amount.') },
      { alvo: '.nd-real .nd-scroll', titulo: P('Pedidos que viram nota', 'Orders that become notes'),
        texto: P('Todo pedido marcado como Pagamento Antecipado entra aqui sozinho, com o saldo do cliente. Clique em um e a nota vem pronta, com o valor dividido entre os itens ao centavo.',
          'Every order flagged as Advance Payment shows up here by itself, with the customer balance. Click one and the note comes ready, with the amount split across the items to the cent.') },
      { alvo: '.nd-real .nd-filtros', titulo: P('Ache qualquer pedido', 'Find any order'),
        texto: P('Escolha o período ou digite o número do pedido para abrir a emissão direto.', 'Pick the period or type the order number to open issuing straight away.') },
      { alvo: '.nd-real [data-f="area-acomp"]', acao: 'clicar', titulo: P('A venda cita a nota', 'The sale references the note'),
        texto: P('O acompanhamento mostra, nota a nota, se a venda já citou a nota de débito. O robô de envio à SEFAZ, o histórico e os avisos moram nas outras áreas.',
          'The follow-up shows, note by note, whether the sale has referenced the debit note. The robot that sends to SEFAZ, the history and the notices live in the other areas.') },
      { alvo: '.nd-real .ph-fora', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('No vídeo, o sistema completo em ação. Quer ver tudo funcionando de verdade? É só me chamar por aqui.',
          'The video shows the full system in action. Want to see it all running for real? Just reach me from here.') },
    ],
    montar(el, api) {
      A = api; ui = api.ui; h = api.h; t = api.t; fmt = api.fmt;
      if (!db) semear(api);
      montarTela(el);
    },
  });

  /* ================= peças do kit ================= */
  const IC = {
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    link: '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
    list: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    okc: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    xc: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>', chevu: '<path d="m18 15-6-6-6 6"/>',
  };
  const ic = (nome, tam, classe) => { const s = A.icone(IC[nome], 'nd-ic' + (classe ? ' ' + classe : '')); s.style.cssText = 'width:' + tam + 'px;height:' + tam + 'px'; return s; };
  const e = (tag, classe, ...filhos) => h(tag, classe ? { class: classe } : null, ...filhos);
  const COR = { info: 'var(--ph-info)', azul: 'var(--ph-cor-azul)', ok: 'var(--ph-ok)', erro: 'var(--ph-erro)', alerta: 'var(--ph-alerta)' };
  const chip = (txt, tom) => { const b = ui.badge(txt, tom); b.classList.add('nd-chip'); return b; };
  const painel = (classe, ...filhos) => ui.cartao({ classe: 'nd-painel' + (classe ? ' ' + classe : ''), conteudo: filhos });
  const btn = (texto, aoClicar, o = {}) => {
    const b = ui.botao({ texto, aoClicar, icone: o.ic && IC[o.ic], tom: o.tom || (o.primario ? 'primario' : 'secundario'), tamanho: o.grande ? null : 'p', titulo: o.titulo, desabilitado: o.desabilitado, classe: o.classe });
    if (o.foco) b.setAttribute('data-f', o.foco);
    if (o.expandido != null) b.setAttribute('aria-expanded', String(o.expandido));
    return b;
  };
  const indicadores = (gancho, lista) => {
    const k = ui.kpis(lista.map(([rotulo, valor]) => ({ rotulo, valor })));
    k.classList.add('nd-kpis');
    [...k.children].forEach((c, i) => { c.classList.add(gancho); c.style.setProperty('--tom', COR[lista[i][2]]); });
    return k;
  };
  const aviso = (texto, tom, gancho) => { const a = ui.aviso(texto, tom); if (gancho) a.classList.add(gancho); if (!a.getAttribute('role')) { a.setAttribute('role', 'status'); a.setAttribute('aria-live', 'polite'); } return a; };
  const th = c => h('th', { scope: 'col' }, h('span', null, c));
  const tabela = (colunas, linhas, vazio) => h('table', { class: 'ph-tabela nd-tab' }, h('thead', null, h('tr', null, colunas.map(th))), h('tbody', null, linhas.length ? linhas : h('tr', null, h('td', { class: 'ph-tabela-vazio', colspan: colunas.length }, vazio))));
  const td = (classe, ...f) => h('td', classe ? { class: classe } : null, ...f);
  const topo = (titulo, sub, ...dir) => h('div', { class: 'nd-topo' }, h('div', { class: 'tx' }, h('h2', { class: 'ph-h2' }, titulo), sub && e('p', 'sub ph-texto-mudo', sub)), h('div', { class: 'dir' }, ...dir));
  const par = (pt, en) => h('p', { html: P(pt, en) });
  const ajuda = (...ps) => h('details', { class: 'nd-ajuda' }, h('summary', null, P('Como funciona esta tela: explicação simples', 'How this screen works: a simple explanation')), h('div', null, ps));
  const S = (tipo, titulo, ms) => ({ tipo, titulo, ms });
  const brl = v => fmt.moeda(v);
  const cliNome = cod => CLI[cod][0];
  const totalItens = p => soma(p.itens, i => i[1] * i[2]);
  const saldo = p => (p.nota ? 0 : p.adiant);
  const ident = p => p.nota.nf + '/' + p.nota.serie;
  const refrescar = foco => { if (pintarTela) pintarTela(foco); };
  let pintarTela = null;

  /* ================= casca do sistema: as cinco áreas; só a Emissão é navegável ================= */
  const AREAS = [
    { id: 'emissao', ic: 'send', rot: P('Emissão da nota de débito', 'Debit note issuing') },
    { id: 'acomp', ic: 'link', rot: P('Acompanhamento (vínculo com a venda)', 'Follow-up (link to the sale)') },
    { id: 'hist', ic: 'list', rot: P('Histórico de decisões', 'Decision history') },
    { id: 'avisos', ic: 'mail', rot: P('Avisos por e-mail', 'E-mail notices') },
    { id: 'robo', ic: 'bot', rot: P('Robô de envio', 'Sending robot') },
  ];
  const foraDaDemo = titulo => (ui.foraDaDemo ? ui.foraDaDemo({ titulo })
    : ui.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is not part of the public demo.') }));

  function montarTela(el) {
    injetarCss();
    const est = A.estado;
    est.area = est.area || 'emissao'; est.perFila = est.perFila || '30';
    const raiz = h('div', { class: 'nd-real nd-raiz' });
    el.append(raiz);
    pintarTela = foco => {
      const abas = ui.abas({ chave: 'area', rotulo: P('Áreas da Nota de Débito', 'Debit Note areas'),
        abas: AREAS.map(a => ({ id: a.id, rotulo: a.rot, icone: IC[a.ic], montar: pn => (a.id === 'emissao' ? emissao(pn) : pn.append(foraDaDemo(a.rot))) })) });
      const nav = abas.querySelector('.ph-abas-lista');
      nav.classList.add('nd-nav');
      [...nav.children].forEach((bt, i) => bt.setAttribute('data-f', 'area-' + AREAS[i].id));
      raiz.replaceChildren(abas);
      if (foco) { const alvo = raiz.querySelector('[data-f="' + foco + '"]'); if (alvo) alvo.focus(); }
    };
    pintarTela();
  }

  /* ================= Emissão: antecipações, fila de pedidos e a nota pronta ================= */
  const SIT = {
    apto: [P('APTO PARA EMISSÃO', 'READY TO ISSUE'), 'ok'], conferir: [P('APTO PARA EMISSÃO', 'READY TO ISSUE'), 'ok'],
    parcial: [P('SALDO PARCIAL', 'PARTIAL BALANCE'), 'alerta'], sem: [P('SEM SALDO DISPONÍVEL', 'NO BALANCE AVAILABLE'), 'erro'],
    criada: [P('ND CRIADA · AGUARDANDO SEFAZ', 'DN CREATED · AWAITING SEFAZ'), 'alerta'],
  };
  const sitChip = p => (p.sit === 'emitida' ? chip((A.lang === 'en' ? 'DN ' : 'ND ') + p.nota.nf + (A.lang === 'en' ? ' ISSUED' : ' EMITIDA'), 'info')
    : p.simulada && p.sit === 'apto' ? chip(P('APTO · SIMULADO', 'READY · SIMULATED'), 'ok') : chip(SIT[p.sit][0], SIT[p.sit][1]));
  const PERIODOS = [['dia', P('Hoje', 'Today')], ['mes', P('Mês atual', 'This month')], ['30', P('30 dias', '30 days')], ['90', P('90 dias', '90 days')], ['todos', P('Tudo', 'All')]];
  const dentro = (d, per) => { const a = new Date(); return per === 'todos' || (per === 'dia' ? d.toDateString() === a.toDateString() : per === 'mes' ? d.getMonth() === a.getMonth() && d.getFullYear() === a.getFullYear() : a - d <= Number(per) * 864e5); };

  function telao() {
    const est = A.estado;
    const feed = db.pedidos.filter(p => p.adiant > 0 && !p.nota).map(p => ({ data: p.dt, cli: p.cli, valor: p.adiant, p }))
      .concat(db.semPedido.map(x => ({ ...x, p: null }))).sort((x, y) => y.data - x.data);
    const tot = f => soma(feed.filter(f), x => x.valor), qt = f => feed.filter(f).length;
    const K = (rot, n) => t(rot) + ' · ' + n;
    const corpo = est.tvAberto && ui.cartao({ classe: 'ndtv-corpo', titulo: [e('span', 'ndtv-dot'), P('Antecipações e seus pedidos em aberto', 'Advances and their open orders')],
      conteudo: [h('div', { class: 'ndtv-feed', tabindex: '0', role: 'group', 'aria-label': P('Antecipações aguardando nota', 'Advances awaiting a note') }, feed.map(f => h('div', { class: 'ndtv-item' },
        e('span', 'd', fmt.data(f.data)), h('span', { class: 'c', title: cliNome(f.cli) + ' (' + f.cli + ')' }, cliNome(f.cli)),
        h('span', { class: 'ps' }, f.p ? btn(f.p.num, () => abrirPedido(f.p.num), { tom: 'ok', ic: 'check', classe: 'ndtv-ped', titulo: t(P('Pedido ', 'Order ')) + f.p.num + ' · ' + brl(totalItens(f.p)) + t(P(': clique para abrir', ': click to open')) }) : e('span', 'sp', P('sem pedido', 'no order'))),
        e('span', 'v', '+' + brl(f.valor))))),
      e('p', 'ndtv-nota', P('Pedido com o sinal de visto está marcado como Pagamento Antecipado, pronto para virar nota. Clique para abrir a emissão.', 'An order with a check mark is flagged as Advance Payment, ready to become a note. Click it to open issuing.'))] });
    return h('section', { class: 'ndtv', 'aria-label': P('Antecipações aguardando nota', 'Advances awaiting a note') },
      h('div', { class: 'ndtv-topo' },
        indicadores('ndtv-k', [[K(P('aguardando nota', 'awaiting note'), feed.length), brl(tot(() => true)), 'info'], [K(P('prontas p/ emitir', 'ready to issue'), qt(f => f.p)), brl(tot(f => f.p)), 'ok'], [K(P('sem pedido', 'no order'), qt(f => !f.p)), brl(tot(f => !f.p)), 'alerta']]),
        btn(est.tvAberto ? P('Ocultar antecipações', 'Hide advances') : P('Ver antecipações e pedidos', 'Show advances and orders'), () => { est.tvAberto = !est.tvAberto; refrescar('tv'); }, { ic: est.tvAberto ? 'chevu' : 'chevd', foco: 'tv', expandido: !!est.tvAberto })),
      corpo);
  }

  function emissao(cont) {
    const est = A.estado, fila = h('div');
    const linhas = () => db.pedidos.filter(p => dentro(p.dt, est.perFila)).sort((x, y) => y.dt - x.dt);
    const pintarFila = () => fila.replaceChildren(h('div', { class: 'nd-scroll ph-tabela-wrap', tabindex: '0', role: 'group', 'aria-label': P('Pedidos aguardando nota de débito', 'Orders awaiting a debit note') },
      tabela([P('Pedido', 'Order'), P('Cliente', 'Customer'), 'UN', P('Data', 'Date'), P('Itens', 'Items'), P('Valor do pedido', 'Order amount'), P('Saldo de adiantamento', 'Advance balance'), P('Valor sugerido', 'Suggested amount'), P('Situação', 'Status')],
        linhas().map(p => h('tr', { class: 'nd-row clic' + (est.pedidoSel === p.num ? ' sel' : ''), onclick: () => abrirPedido(p.num) },
          h('td', { class: 'num azul ped' }, h('button', { type: 'button', class: 'nd-lk', 'aria-label': t(P('Abrir a emissão do pedido ', 'Open issuing for order ')) + p.num }, p.num)),
          td('cli', cliNome(p.cli)), td('num', p.un), td('num', fmt.data(p.dt)), td('num', p.itens.length), td('num', brl(totalItens(p))),
          td('num b ' + (saldo(p) > 0 ? 't-ok' : 't-erro'), brl(saldo(p))), td('num', saldo(p) > 0 ? brl(p.adiant) : '-'), td('sit', sitChip(p)))),
        P('Nenhum pedido no período.', 'No order in the period.'))));
    const atualizar = () => ui.backend({ titulo: P('Atualizar a fila', 'Refresh the queue'), velocidade: 1.6,
      passos: [S('api', P('Recebe a consulta da fila', 'Receives the queue lookup'), 40), S('erp', P('Lê os pedidos marcados como Pagamento Antecipado', 'Reads the orders flagged as Advance Payment'), 260), S('erp', P('Consulta o adiantamento de cada cliente, só leitura', 'Reads each customer advance, read-only'), 210)],
      resumo: P('Fila atualizada.', 'Queue refreshed.'), aoConcluir: () => refrescar('atu') });
    const abrirDigitado = () => { const n = (est.buscaPed || '').trim(); if (n) abrirPedido(n); };
    const periodo = ui.chips({ rotulo: P('Período', 'Period'), opcoes: PERIODOS.map(([valor, texto]) => ({ valor, texto })), valor: est.perFila, aoMudar: v => { est.perFila = v; refrescar('per' + v); } });
    [...periodo.children].forEach((b, i) => b.setAttribute('data-f', 'per' + PERIODOS[i][0]));
    const busca = ui.busca({ placeholder: P('abrir pedido pelo número', 'open order by number'), rotulo: P('Abrir pedido pelo número', 'Open order by number'), valor: est.buscaPed || '', aoDigitar: v => { est.buscaPed = v; } });
    busca.input.addEventListener('keydown', ev => { if (ev.key === 'Enter') abrirDigitado(); });
    pintarFila();
    cont.append(
      ajuda(
        par('<b>1. De onde vem a lista:</b> os pedidos de venda que alguém marcou como <b>Pagamento Antecipado</b> no ERP entram aqui sozinhos. Marcar o pedido é o jeito de avisar: "este pedido tem adiantamento e precisa de nota de débito".',
          '<b>1. Where the list comes from:</b> sales orders someone flagged as <b>Advance Payment</b> in the ERP show up here by themselves. Flagging the order is the way to say: "this order has an advance and needs a debit note".'),
        par('<b>2. O saldo de adiantamento:</b> para cada pedido, o sistema consulta no financeiro do ERP quanto o cliente tem de adiantamento disponível. É só consulta: nada é alterado no financeiro.',
          '<b>2. The advance balance:</b> for each order, the system reads in ERP finance how much advance the customer has available. Read-only: nothing is changed in finance.'),
        par('<b>3. A nota pronta:</b> ao clicar em um pedido, o sistema preenche a nota com os mesmos itens do pedido e o valor do adiantamento dividido entre eles, ao centavo, e mostra as validações para emissão. Valor muito acima do pedido gera aviso para conferência humana.',
          '<b>3. The ready note:</b> when you click an order, the system fills in the note with the same items as the order and the advance amount split across them, to the cent, and shows the issuing checks. An amount far above the order raises a notice for human review.'),
        par('<b>4. Simular e emitir:</b> <b>Registrar simulação</b> guarda o resultado sem tocar no ERP, e <b>Emitir nota de débito</b> cria a nota, que o robô envia à SEFAZ.',
          '<b>4. Simulate and issue:</b> <b>Log simulation</b> stores the result without touching the ERP, and <b>Issue debit note</b> creates the note, which the robot sends to SEFAZ.')),
      telao(),
      painel('nd-bloco',
        topo(P('Pedidos aguardando nota de débito', 'Orders awaiting a debit note'), P('Pedidos marcados como Pagamento Antecipado no ERP', 'Orders flagged as Advance Payment in the ERP'),
          btn(P('Atualizar', 'Refresh'), atualizar, { ic: 'refresh', foco: 'atu' })),
        h('div', { class: 'nd-filtros' }, periodo, busca, btn(P('Abrir', 'Open'), abrirDigitado, { ic: 'search' })),
        fila));
  }

  function abrirPedido(num) {
    const p = db.pedidos.find(x => x.num === String(num).trim());
    if (!p) return ui.toast(P('Pedido não encontrado na fila.', 'Order not found in the queue.'), 'erro');
    ui.backend({ titulo: P('Montar a prévia da nota', 'Build the note preview'), subtitulo: t(P('Pedido ', 'Order ')) + p.num + ' · ' + cliNome(p.cli), velocidade: 1.9,
      passos: [S('api', P('Recebe o pedido de prévia', 'Receives the preview request'), 40), S('erp', P('Lê o pedido e os itens', 'Reads the order and its items'), 160),
        S('erp', P('Consulta o adiantamento do cliente, só leitura', 'Reads the customer advance, read-only'), 130), S('regra', P('Valida e divide o valor entre os itens', 'Checks and splits the amount across the items'), 30)],
      resumo: P('Prévia montada. Nada foi gravado.', 'Preview built. Nothing was written.'), aoConcluir: () => janela(p) });
  }

  /* validações já prontas por situação do pedido (null = informação) */
  const V = (ok, pt, en) => ({ ok, regra: P(pt, en) });
  function validacoes(p) {
    if (p.nota) return [V(null, 'Este pedido já tem a nota de débito ' + ident(p) + '.', 'This order already has debit note ' + ident(p) + '.'),
      V(null, 'A antecipação do cliente já virou nota de débito: o próximo passo é o faturamento da venda no ERP.', 'The customer advance has already become a debit note: the next step is invoicing the sale in the ERP.')];
    const tem = p.sit !== 'sem';
    return [
      V(true, 'Pedido marcado como Pagamento Antecipado', 'Order flagged as Advance Payment'),
      V(true, 'Pedido ativo e ainda não faturado', 'Active order, not invoiced yet'),
      V(true, 'Pedido sem nota de débito anterior', 'Order with no previous debit note'),
      tem ? V(true, 'Adiantamento disponível para o cliente', 'Advance available for the customer') : V(false, 'Cliente ainda sem adiantamento disponível', 'Customer has no advance available yet'),
      p.sit === 'conferir' ? V(true, 'CONFIRA: valor muito acima do pedido. A nota pode ser criada, mas passa por conferência humana antes do envio.', 'CHECK: amount far above the order. The note can be created, but it goes through human review before sending.')
        : V(tem, 'Valor compatível com o pedido', 'Amount compatible with the order'),
      V(tem, 'Itens válidos e soma do rateio exata ao centavo', 'Valid items and apportionment exact to the cent'),
    ];
  }

  function janela(p) {
    const st = { msg: null, criada: false }, cx = h('div', { class: 'np-corpo' });
    A.estado.pedidoSel = p.num; refrescar();
    const simular = () => ui.backend({ titulo: P('Registrar simulação (modo sombra)', 'Log simulation (shadow mode)'), subtitulo: t(P('Pedido ', 'Order ')) + p.num, velocidade: 1.6, escrita: 'create',
      passos: [S('erp', P('Relê o pedido e o adiantamento', 'Rereads the order and the advance'), 220), S('regra', P('Valida e divide o valor entre os itens', 'Checks and splits the amount across the items'), 40), S('sql', P('Arquiva a simulação no histórico', 'Archives the simulation in the history'), 60)],
      resumo: P('Nenhuma gravação foi realizada no ERP.', 'Nothing was written to the ERP.'),
      aoConcluir: () => { p.simulada = true; st.msg = P('Simulação registrada: nenhuma gravação foi realizada no ERP.', 'Simulation logged: nothing was written to the ERP.'); pintar(); refrescar(); } });
    const emitir = () => ui.modal({ titulo: P('Emitir a nota de débito?', 'Issue the debit note?'), largura: 500, classe: 'nd-real nd-dlg',
      corpo: e('p', 'nd-conf', P('A nota será criada no ERP simulado com os itens do pedido e o valor do adiantamento, pronta para o envio à SEFAZ pelo robô.', 'The note will be created in the simulated ERP with the order items and the advance amount, ready for the robot to send it to SEFAZ.')),
      acoes: ctl => [btn(P('Cancelar', 'Cancel'), () => ctl.fechar(), { grande: true }), btn(P('Emitir nota de débito', 'Issue debit note'), () => { ctl.fechar(); emitirAgora(); }, { primario: true, grande: true })] });
    const emitirAgora = () => ui.backend({ titulo: P('Emitir nota de débito', 'Issue debit note'), subtitulo: t(P('Pedido ', 'Order ')) + p.num + ' · ' + cliNome(p.cli), velocidade: 1.3, escrita: 'create',
      passos: [S('erp', P('Relê o pedido e o adiantamento', 'Rereads the order and the advance'), 210), S('regra', P('Valida e divide o valor entre os itens', 'Checks and splits the amount across the items'), 60),
        S('erp', P('Cria a nota no ERP com a numeração oficial, em uma transação', 'Creates the note in the ERP with the official numbering, in one transaction'), 480), S('sql', P('Registra no histórico e avisa quem precisa', 'Logs in the history and notifies who needs to know'), 90)],
      resumo: P('Nota criada no ERP. O envio à SEFAZ é feito pelo robô de envio.', 'Note created in the ERP. Sending to SEFAZ is done by the sending robot.'),
      aoConcluir: () => { p.nota = { nf: p.pronta[0], serie: p.pronta[1], emissao: new Date() }; p.sit = 'criada'; st.criada = true; st.msg = null; pintar(); refrescar(); verNoErp(p, true); } });

    function pintar() {
      const vals = validacoes(p), travado = !!p.nota || vals.some(v => v.ok === false), nIt = p.itens.length, total = totalItens(p);
      cx.replaceChildren(...[
        st.criada && aviso(h('div', { class: 'np-criada-in' },
          h('div', null, e('p', 'k', P('Nota de débito criada', 'Debit note created')), h('p', { class: 'n' }, String(p.nota.nf), ' ', h('span', null, '/ ' + p.nota.serie))),
          h('div', { class: 'tx' }, t(P('Valor ', 'Amount ')) + brl(p.adiant) + ' · ' + nIt + t(P(' itens', ' items')), h('br'), P('O envio à SEFAZ é feito pelo robô de envio.', 'Sending to SEFAZ is done by the sending robot.')),
          btn(P('Fechar', 'Close'), () => { st.criada = false; pintar(); }, { ic: 'x' })), 'ok', 'np-criada'),
        st.msg && aviso(st.msg, 'ok', 'nd-msg'),
        h('div', { class: 'np-tit' }, h('h2', { class: 'ph-h3' }, P('Nota de débito do pedido ', 'Debit note for order '), h('span', { class: 'ph-mono' }, p.num)),
          e('span', 'ctx', cliNome(p.cli) + ' (' + p.cli + ') · UF ' + CLI[p.cli][1] + ' · UN ' + p.un),
          p.nota && h('span', { class: 'nds' }, chip('ND ' + ident(p) + ' · ' + brl(p.adiant), 'info'))),
        painel('np-resumo',
          indicadores('np-k', [[P('Valor do pedido (itens)', 'Order amount (items)'), brl(total), 'azul'], [P('Antecipação disponível', 'Advance available'), brl(saldo(p)), saldo(p) > 0 ? 'ok' : 'erro'], [P('Valor da nota de débito', 'Debit note amount'), brl(p.adiant), 'info']]),
          h('div', { class: 'np-linha' }, h('div', { class: 'np-acoes' },
            btn(P('Registrar simulação', 'Log simulation'), simular, { ic: 'play', grande: true, desabilitado: travado }),
            btn(P('Emitir nota de débito', 'Issue debit note'), emitir, { primario: true, ic: 'send', grande: true, desabilitado: travado }),
            p.nota && btn(P('Ver a nota no ERP simulado', 'View the note in the simulated ERP'), () => verNoErp(p), { ic: 'eye', grande: true }))),
          p.nota ? aviso(t(P('Pedido concluído: a antecipação já virou a nota de débito ', 'Order done: its advance has already become debit note ')) + ident(p) + t(P('. O próximo passo é o faturamento da venda no ERP.', '. The next step is invoicing the sale in the ERP.')), 'info', 'np-obs')
            : travado && aviso(P('Emissão indisponível: há validação reprovada, veja a lista abaixo.', 'Issuing unavailable: a check failed, see the list below.'), 'alerta', 'np-obs')),
        h('div', { class: 'np-duo' },
          ui.cartao({ classe: 'nd-painel', titulo: p.nota ? P('Situação deste pedido', 'Status of this order') : P('Validações para emissão', 'Issuing checks'), conteudo: [
            h('div', null, vals.map(v => h('div', { class: 'np-val' }, v.ok ? ic('okc', 17, 'ok') : v.ok === null ? ic('okc', 17, 'az') : ic('xc', 17, 'no'),
              h('span', null, e('span', 'vh', v.ok ? P('Aprovada: ', 'Passed: ') : v.ok === null ? P('Informação: ', 'Information: ') : P('Reprovada: ', 'Failed: ')), v.regra)))),
            h('div', { class: 'np-pe' }, e('p', 'np-nota', P('A nota leva os mesmos itens do pedido e o valor do adiantamento dividido entre eles. O valor pode ficar acima da soma dos itens, porque o total do pedido não inclui o IPI.', 'The note carries the same items as the order and the advance amount split across them. The amount may be above the item total, because the order total does not include IPI.')))] }),
          ui.cartao({ classe: 'nd-painel', titulo: t(P('Rateio do adiantamento: ', 'Advance apportionment: ')) + nIt + t(P(' itens do pedido', ' order items')), conteudo: [
            h('div', { class: 'np-rat ph-tabela-wrap', tabindex: '0', role: 'group', 'aria-label': P('Rateio por item', 'Apportionment per item') }, h('table', { class: 'ph-tabela nd-tab' },
              h('thead', null, h('tr', null, ['Item', 'Material', P('Qtde', 'Qty'), P('Valor original', 'Original amount'), P('Participação', 'Share'), P('Valor na nota', 'Amount on note')].map(th))),
              h('tbody', null, p.itens.map(([m, q, pr, nd], k) => h('tr', { class: 'nd-row' }, td('num', k + 1), h('td', { class: 'num', title: t(MAT[m][0]) }, m), td('num', q), td('num', brl(r2(q * pr))), td('num', fmt.num(q * pr / total * 100, 2) + '%'), td('num azul', brl(nd)))),
                h('tr', null, h('td', { class: 'b', colspan: '3' }, 'Total'), td('num b', brl(total)), td('num', '100%'), td('num azul', brl(soma(p.itens, i => i[3]))))))),
            e('p', 'np-nota', P('Rateio proporcional ao valor de cada item: soma exata ao centavo, nenhum item negativo.', 'Apportionment proportional to each item amount: exact to the cent, no negative item.'))] })),
      ].filter(Boolean));
    }
    ui.modal({ largura: 1320, classe: 'nd-real nd-dlg', corpo: cx, aoFechar: () => { A.estado.pedidoSel = ''; refrescar(); },
      titulo: h('span', null, P('Emissão da nota de débito: pedido ', 'Debit note issuing: order '), h('span', { class: 'ph-mono' }, p.num)) });
    pintar();
  }

  /* a única janela de ERP simulado: o documento pronto, cabeçalho e itens */
  function verNoErp(p, preencher) {
    const n = p.nota;
    ui.erp({ programa: P('Nota fiscal de saída: nota de débito', 'Outbound invoice: debit note'), codigo: 'ERP-0310', preencher: !!preencher,
      campos: [
        { rotulo: P('Unidade', 'Unit'), valor: p.un + ' · ' + t(UNID[p.un]) }, { rotulo: P('Série', 'Series'), valor: n.serie }, { rotulo: P('Nota', 'Invoice'), valor: String(n.nf), destaque: true }, { rotulo: P('Espécie', 'Kind'), valor: P('Saída', 'Outbound') },
        { rotulo: P('Cliente', 'Customer'), valor: p.cli + ' · ' + cliNome(p.cli), largura: 2 }, { rotulo: 'UF', valor: CLI[p.cli][1] }, { rotulo: P('Emissão', 'Issued'), valor: fmt.dataHora(n.emissao) },
        { rotulo: P('Documento', 'Document'), valor: P('Nota de débito de pagamento antecipado', 'Advance payment debit note'), largura: 2 }, { rotulo: P('Pedido', 'Order'), valor: p.num }, { rotulo: P('Total da nota', 'Invoice total'), valor: brl(p.adiant), destaque: true },
        { rotulo: P('Situação da NF-e', 'NF-e status'), valor: p.sit === 'emitida' ? P('100 · Autorizado o uso da NF-e', '100 · NF-e use authorised') : P('Digitada: aguardando o envio pelo robô', 'Entered: waiting for the robot to send it'), largura: 4, destaque: true },
      ],
      grade: { colunas: ['Seq', 'Material', P('Descrição', 'Description'), 'NCM', { rotulo: P('Qtd', 'Qty'), tipo: 'numero' }, 'UN', { rotulo: P('Valor', 'Amount'), tipo: 'numero' }],
        linhas: p.itens.map(([m, q, , nd], k) => [k + 1, m, MAT[m][0], MAT[m][1], fmt.num(q), MAT[m][2], brl(nd)]),
        total: [null, null, 'Total', null, null, null, brl(soma(p.itens, i => i[3]))] },
      narracao: [P('Criando a nota no ERP...', 'Creating the note in the ERP...'), P('Itens com o valor rateado...', 'Items with the apportioned amount...'), P('Nota pronta para o envio pelo robô...', 'Note ready for the robot to send...')],
      rodape: preencher ? P('Nota criada pelo hub: pronta para o envio pelo robô', 'Note created by the hub: ready for the robot to send') : P('Somente leitura', 'Read-only'),
      acoes: [{ texto: 'OK', tom: 'primario' }] });
  }

  /* Só layout, com tokens --ph-*: nenhuma cor, fonte, raio ou sombra fixa e nenhuma regra por tema. */
  const ROT = 'font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const CSS = [
    '.nd-real{min-width:0;color:var(--ph-text)}.nd-real p{margin:0}.nd-real .nd-ic{flex:none}.nd-real .t-ok{color:var(--ph-ok)}.nd-real .t-erro{color:var(--ph-erro)}',
    '.nd-real .nd-ajuda{margin-bottom:16px;border:1px solid var(--ph-border);border-radius:var(--ph-raio-lg);background:var(--ph-surface)}.nd-real .nd-ajuda summary{cursor:pointer;padding:10px 14px;font-size:13.5px;font-weight:600;color:var(--ph-accent-light)}',
    '.nd-real .nd-ajuda summary:focus-visible{outline-offset:-2px}.nd-real .nd-ajuda>div{padding:2px 16px 14px;font-size:13.5px;line-height:1.7;color:var(--ph-text-2);max-width:120ch}.nd-real .nd-ajuda>div p+p{margin-top:8px}.nd-real .nd-ajuda b{color:var(--ph-text)}',
    '.nd-real .nd-painel.ph-card{min-width:0;margin-bottom:18px}.nd-real .nd-topo{display:flex;align-items:flex-end;gap:10px 16px;flex-wrap:wrap}.nd-real .nd-topo .tx{flex:1 1 18rem;min-width:0}.nd-real .nd-topo .sub{font-size:13px;margin-top:4px}',
    '.nd-real .nd-topo .dir{display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-width:0}',
    '.nd-real .nd-tab{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;color:var(--ph-text-2);font-variant-numeric:tabular-nums lining-nums}.nd-real .nd-scroll{--ph-tabela-max:max(320px,calc(100vh - 330px));min-height:min(260px,60vh)}',
    '.nd-real .nd-tab td.b{font-weight:700}.nd-real .nd-tab .nd-chip.ph-badge{white-space:normal;text-align:left}.nd-real .nd-tab td.sit{min-width:150px}.nd-real .nd-tab td.ped{white-space:normal;min-width:90px}.nd-real .nd-tab td.azul{font-weight:700;color:var(--ph-accent-light)}.nd-real .nd-tab td.cli{white-space:normal;min-width:140px}',
    '.nd-real .nd-tab tr.clic{cursor:pointer}.nd-real .nd-tab tr.sel td{background:var(--ph-accent-soft)}.nd-real .nd-tab tr.sel td:first-child{box-shadow:inset 3px 0 0 var(--ph-accent)}.nd-real .nd-tab th{white-space:normal}.nd-real .nd-tab th>span,.nd-real .nd-tab td{padding-inline:10px}',
    '.nd-real .nd-lk{background:none;border:0;padding:0;font:inherit;color:inherit;cursor:pointer;text-align:left}.nd-real .nd-lk:hover{text-decoration:underline;text-underline-offset:3px}',
    '.nd-real .nd-filtros{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;min-width:0}.nd-real .nd-filtros .ph-busca{flex:0 1 280px}.nd-real .np-corpo{display:flex;flex-direction:column;gap:14px;min-width:0}.nd-real .nd-msg{margin-bottom:12px}',
    /* faixa das antecipações: indicadores do kit e a lista */
    '.nd-real .ndtv{margin-bottom:18px}.nd-real .ndtv-topo{display:flex;align-items:flex-end;gap:12px;flex-wrap:wrap}.nd-real .ndtv-topo>.nd-kpis{flex:1 1 36rem}',
    '.nd-real .nd-kpis.ph-kpis{grid-template-columns:repeat(auto-fit,minmax(min(190px,100%),1fr))}.nd-real .nd-kpis .ph-kpi-rotulo{flex-wrap:wrap}.nd-real .ndtv-corpo{margin-top:12px}',
    '.nd-real .ndtv-dot{width:8px;height:8px;border-radius:50%;background:var(--ph-ok);display:inline-block;flex:none;margin-right:8px;vertical-align:1px}',
    '.nd-real .ndtv-feed{max-height:min(320px,50vh);overflow-y:auto;overscroll-behavior:contain;border:1px solid var(--ph-border);border-radius:var(--ph-raio);background:var(--ph-surface)}',
    '.nd-real .ndtv-item{display:flex;gap:6px 12px;align-items:center;flex-wrap:wrap;padding:7px 12px;border-bottom:1px solid var(--ph-border);font-size:13px}.nd-real .ndtv-item:last-child{border-bottom:0}',
    '.nd-real .ndtv-item .d{color:var(--ph-text-dim);font-variant-numeric:tabular-nums;flex:none}.nd-real .ndtv-item .c{color:var(--ph-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:130px;flex:0 1 auto;max-width:100%}',
    '.nd-real .ndtv-item .ps{display:flex;gap:5px;flex-wrap:wrap;flex:1;min-width:90px}.nd-real .ndtv-item .sp{color:var(--ph-alerta)}.nd-real .ndtv-item .v{color:var(--ph-ok);font-weight:700;font-variant-numeric:tabular-nums;flex:none}',
    '.nd-real .ndtv-ped.ph-btn{height:auto;min-height:1.75rem;padding-inline:8px;font-family:var(--ph-font-mono)}.nd-real .ndtv-nota{font-size:12.5px;color:var(--ph-text-dim);margin-top:8px}',
    /* diálogos do kit: só o miolo */
    '.nd-real .nd-conf{font-size:14px;line-height:1.6;color:var(--ph-text-2);white-space:pre-line}',
    '.nd-real .np-tit{display:flex;align-items:baseline;gap:6px 12px;flex-wrap:wrap}.nd-real .np-tit .ctx{font-size:13px;color:var(--ph-text-muted)}.nd-real .np-tit .nds{display:flex;gap:6px;flex-wrap:wrap}',
    '.nd-real .np-resumo.ph-card{gap:14px;margin-bottom:0}.nd-real .np-linha{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.nd-real .np-acoes{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}',
    '.nd-real .np-duo{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(420px,100%),1fr));gap:16px;align-items:start}.nd-real .np-duo>.nd-painel{margin-bottom:0}',
    '.nd-real .np-val{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid var(--ph-border);font-size:13px;line-height:1.5;color:var(--ph-text-2)}.nd-real .np-val:last-of-type{border-bottom:0}.nd-real .np-val .nd-ic{margin-top:1px}',
    '.nd-real .np-val .ok{color:var(--ph-ok)}.nd-real .np-val .az{color:var(--ph-info)}.nd-real .np-val .no{color:var(--ph-erro)}',
    '.nd-real .np-pe{padding-top:12px;border-top:1px solid var(--ph-border)}.nd-real .np-nota{font-size:12.5px;color:var(--ph-text-dim);line-height:1.55}.nd-real .np-rat{--ph-tabela-max:46vh}',
    '.nd-real .np-criada-in{display:flex;gap:10px 22px;align-items:center;flex-wrap:wrap}.nd-real .np-criada .k{' + ROT + ';color:var(--ph-ok)}.nd-real .np-criada .tx{font-size:13px;line-height:1.7;min-width:0;flex:1 1 20rem}',
    '.nd-real .np-criada .n{font:700 calc(28px * var(--ph-display-scale))/1.1 var(--ph-font-display);color:var(--ph-ok);margin-top:2px}.nd-real .np-criada .n span{font-size:17px;color:var(--ph-text-muted)}',
    '@media (max-width:700px){.nd-real .nd-topo .dir{width:100%}.nd-real .nd-chip.ph-badge{white-space:normal}.nd-real .np-acoes{margin-left:0}}',
  ].join('\n');
  function injetarCss() {
    if (document.getElementById('nd-real-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'nd-real-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
})();
