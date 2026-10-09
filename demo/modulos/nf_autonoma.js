/* NF Autônoma (notas fiscais de entrada) · versão pública curta do módulo do ProjectHub de demonstração (id nf_autonoma).
   Só a tela principal (Operação: painel de lançamentos com a fila e as processadas) é navegável, com dados fictícios e
   resultados prontos; as outras áreas aparecem na navegação e abrem o cartão "fora da demonstração" da casca.
   Visual do kit do hub: toda cor, fonte, raio e sombra vem dos tokens --ph-*. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const PP = f => ({ pt: f('pt'), en: f('en') });
  const r2 = v => Math.round(v * 100) / 100;
  let db = null;
  let A, ui, h, t, fmt;
  let pintar = () => {};

  /* ---------- dados fictícios ---------- */
  const TIPOS = {
    'E10-A': P('Compra para industrialização', 'Purchase for production'), 'E10-D': P('Compra para industrialização com diferimento', 'Purchase for production with deferral'),
    'E20-A': P('Compra interestadual para industrialização', 'Interstate purchase for production'), 'E20-E': P('Compra interestadual de item importado', 'Interstate purchase of imported item'),
    'E30-A': P('Compra para uso e consumo', 'Purchase for internal use'), 'E30-M': P('Compra para manutenção de máquinas', 'Purchase for machine maintenance'),
    'E50-F': P('Frete sobre compras', 'Freight on purchases'), 'E55-F': P('Frete sobre vendas', 'Freight on sales'),
  };
  const CONTAS = { 'G-2101': P('Matéria-prima', 'Raw materials'), 'G-2104': P('Embalagens', 'Packaging'), 'G-2105': P('Uso e consumo', 'Consumables'), 'G-2118': P('EPI', 'Safety gear'), 'G-2206': P('Manutenção', 'Maintenance'), 'G-8121': P('Fretes', 'Freight') };
  const comRotulo = (mapa, c) => (mapa[c] ? PP(l => c + ' · ' + mapa[c][l]) : c || '-');
  const condTxt = c => (c ? PP(l => c + (l === 'pt' ? ' dias' : ' days')) : '-');
  const I = (mat, pt, en, un, preco) => ({ mat, descr: P(pt, en), un, preco });
  const FORN = [
    ['F-0101', 'Metalúrgica Exemplo Ltda', 'PR', [I('MP-1001', 'Chapa de aço 3 mm', 'Steel sheet 3 mm', 'KG', 6.4), I('MP-1002', 'Barra redonda de aço', 'Round steel bar', 'KG', 7.1), I('MP-1004', 'Tubo de aço quadrado 40 x 40', 'Square steel tube 40 x 40', 'M', 19.6)]],
    ['F-0102', 'Química Demo S.A.', 'SP', [I('MP-2001', 'Tinta em pó', 'Powder coating', 'KG', 38.5), I('MP-2002', 'Desengraxante', 'Degreaser', 'L', 14.2), I('MP-2004', 'Primer epóxi', 'Epoxy primer', 'L', 46.9)]],
    ['F-0103', 'Gases Industriais Exemplo', 'PR', [I('MP-3001', 'Argônio industrial', 'Industrial argon', 'M3', 19.8), I('MP-3002', 'Oxigênio industrial', 'Industrial oxygen', 'M3', 9.6)]],
    ['F-0104', 'Embalagens Fictícias Ltda', 'PR', [I('EM-4001', 'Caixa de papelão', 'Cardboard box', 'UN', 3.9), I('EM-4002', 'Filme stretch', 'Stretch film', 'KG', 12.4), I('EM-4005', 'Palete de madeira', 'Wooden pallet', 'UN', 42)]],
    ['F-0105', 'Fornecedor A Ltda', 'PR', [I('UC-5001', 'Luva de proteção', 'Safety gloves', 'PAR', 8.7), I('UC-5003', 'Capacete de segurança', 'Safety helmet', 'UN', 24.9), I('UC-5005', 'Botina de segurança', 'Safety boots', 'PAR', 89)]],
    ['F-0106', 'Usinagem Modelo Ltda', 'SC', [I('MP-6001', 'Eixo usinado sob medida', 'Custom machined shaft', 'UN', 184), I('MP-6002', 'Bucha de bronze', 'Bronze bushing', 'UN', 46.5)]],
    ['F-0107', 'Máquinas Demo Ltda', 'SP', [I('MN-7001', 'Kit de reparo do compressor', 'Compressor repair kit', 'UN', 1260), I('MN-7002', 'Válvula de alívio', 'Relief valve', 'UN', 389)]],
    ['F-0108', 'Parafusos Amostra Ltda', 'PR', [I('MP-8001', 'Parafuso sextavado', 'Hex bolt', 'CEN', 21.4), I('MP-8002', 'Porca sextavada', 'Hex nut', 'CEN', 9.8), I('MP-8005', 'Parafuso Allen', 'Socket head screw', 'CEN', 34.8)]],
    ['F-0109', 'Elétrica Modelo Ltda', 'RS', [I('MN-9001', 'Disjuntor tripolar', 'Three-pole breaker', 'UN', 96), I('MN-9002', 'Cabo elétrico flexível', 'Flexible power cable', 'M', 5.2), I('MN-9003', 'Contator tripolar', 'Three-pole contactor', 'UN', 138)]],
    ['F-0110', 'Ferramentas Exemplo S.A.', 'SP', [I('UC-1101', 'Broca de aço rápido', 'High-speed steel drill', 'UN', 28.9), I('UC-1102', 'Disco de corte', 'Cutting disc', 'UN', 6.4)]],
    ['F-0111', 'Rolamentos Fictícios Ltda', 'SP', [I('MP-1201', 'Rolamento de esferas', 'Ball bearing', 'UN', 57.3), I('MP-1202', 'Retentor de borracha', 'Rubber seal', 'UN', 12.9)]],
    ['T-0201', 'Transportadora Modelo Ltda', 'PR', []], ['T-0202', 'Logística Exemplo Ltda', 'SP', []], ['T-0203', 'Expresso Demo Ltda', 'SC', []],
  ].map(([cod, nome, uf, itens]) => ({ cod, nome, uf, itens }));
  const REGRAS = {
    R241: P('Gases industriais deste fornecedor entram com diferimento.', 'Industrial gases from this supplier go in with deferral.'),
    R242: P('Embalagem que acompanha o produto vendido é custo de embalagem, nunca uso e consumo.', 'Packaging shipped with the sold product is packaging cost, never consumables.'),
    R243: P('ICMS de 4% destacado no XML indica item importado.', '4% ICMS on the XML indicates an imported item.'),
    R244: P('A finalidade da compra vem da ordem de compra e do item, nunca do histórico.', 'The purpose of the purchase comes from the purchase order and the item, never from history.'),
    R245: P('A condição de pagamento gravada é a das duplicatas do XML.', 'The payment term written is the one in the XML installments.'),
    R247: P('EPI vai para a conta de EPI mesmo quando a ordem de compra vier como uso e consumo.', 'Safety gear goes to the safety gear account even when the purchase order comes as consumables.'),
  };
  const ROT_MOTOR = { regra: [P('Regra da casa', 'House rule'), 'teal'], padrao: [P('Padrão do fornecedor', 'Supplier pattern'), 'cyan'], ia: [P('IA (caso ambíguo)', 'AI (ambiguous case)'), 'violet'] };
  const VISITANTE = P('Visitante (demonstração)', 'Visitor (demo)');
  const QUEM = [P('robô (automático)', 'robot (automatic)'), P('Analista fiscal', 'Tax analyst'), P('Gestor do departamento', 'Department manager'), P('robô (só análise)', 'robot (analysis only)')];
  const PADRAO = P('Fornecedor de padrão estável: o mesmo tipo e a mesma conta nas entradas recentes. Decidido por regra, sem IA.', 'Stable supplier pattern: the same type and account in recent entries. Decided by rule, no AI.');
  const PADRAO_CTE = P('Transportadora de padrão estável: decidido por regra, sem IA.', 'Carrier with a stable pattern: decided by rule, no AI.');
  /* lançamentos dos últimos 10 dias: [limpas, intactas até agora, corrigidas por uma pessoa] */
  const CURVA = [[5, 0, 0], [7, 0, 1], [6, 0, 0], [8, 0, 0], [4, 0, 1], [6, 0, 0], [6, 1, 0], [3, 4, 0], [1, 6, 0], [0, 5, 0]];

  function semear() {
    const fo = cod => FORN.find(f => f.cod === cod);
    let nf = 21400, pre = 5100;
    const an = (estado, metodo, regras, motivo, aviso) => ({ estado, metodo, regras, motivo, aviso, quando: A.data(0, '07:' + String(10 + (pre % 40)).padStart(2, '0')) });
    /* itens = as primeiras posições do catálogo do fornecedor, com as quantidades dadas */
    const nota = (cod, q, tp, conta, cond, o) => {
      const f = fo(cod), itens = q.map((qtd, k) => ({ seq: k + 1, ...f.itens[k], qtd, total: r2(qtd * f.itens[k].preco) }));
      pre++;
      return { id: pre, nf: ++nf, serie: '1', un: 'UN-0' + (1 + (pre % 2)), f, doc: 'nfe', temXml: true, sit: 'fila', tp, conta, cond, itens, valor: r2(itens.reduce((s, i) => s + i.total, 0)), analise: null, lanc: null, ...(o ? o() : {}) };
    };
    const cte = (cod, valor, saida, ref) => ({ id: 0, nf: ++nf, serie: '1', un: 'UN-01', f: fo(cod), doc: 'cte', saida, ref, temXml: true, sit: 'fila', tp: saida ? 'E55-F' : 'E50-F', conta: 'G-8121', cond: '30', itens: [], valor,
      analise: { estado: 'passou', metodo: 'padrao', regras: [], motivo: PADRAO_CTE, quando: A.data(0, '06:40') }, lanc: null });
    const fila = [
      nota('F-0101', [820, 460, 310], 'E10-A', 'G-2101', '28', () => ({ analise: an('passou', 'padrao', ['R244', 'R245'], PADRAO) })),
      nota('F-0103', [140, 220], 'E10-D', 'G-2101', '21', () => ({ analise: an('passou', 'regra', ['R241'], P('Regra da casa R241: gases industriais deste fornecedor entram com diferimento.', 'House rule R241: industrial gases from this supplier go in with deferral.')) })),
      nota('F-0106', [18, 40], 'E20-A', 'G-2101', '30', () => ({ analise: an('passou', 'ia', ['R244'], P('Peças usinadas sob desenho entram como matéria-prima do produto final; a ordem de compra está na conta de matéria-prima.', 'Parts machined to drawing go in as raw material for the final product; the purchase order is on the raw material account.')) })),
      nota('F-0109', [30, 400, 60], 'E20-A', 'G-2206', '28', () => ({ analise: an('revisao', 'ia', ['R243'], P('Histórico dividido do fornecedor: a IA manteve o tipo informado pelo Compras.', 'Split supplier history: the AI kept the type set by Purchasing.'),
        P('A revisão discorda do tipo de operação: o XML destaca ICMS de 4% e os itens têm origem importada. Conferir antes de lançar.', 'The review disagrees on the operation type: the XML shows 4% ICMS and the items are of imported origin. Check before posting.')) })),
      nota('F-0108', [120, 80, 20], 'E10-A', 'G-2101', '28', () => ({ analise: an('bloqueada', 'padrao', [], PADRAO,
        P('Nota maior que o saldo da ordem de compra: o item 1 traz 120 CEN e a ordem só tem saldo de 72. O Compras ajusta a ordem ou a nota é recusada.', 'Invoice above the purchase order balance: item 1 brings 120 CEN and the order only has 72 left. Purchasing adjusts the order or the invoice is refused.')) })),
      nota('F-0105', [90, 40, 12], 'E30-A', 'G-2118', '14', () => ({ analise: an('passou', 'regra', ['R247'], P('Regra da casa R247: EPI vai para a conta de EPI.', 'House rule R247: safety gear goes to the safety gear account.')) })),
      nota('F-0102', [60, 110], 'E20-A', 'G-2101', '30/60', () => ({ analise: an('bloqueada', 'padrao', [], PADRAO,
        P('Imposto da pré-nota diferente do XML do fornecedor. Normalmente é o tipo de operação errado na pré-nota: corrigir o tipo e lançar de novo.', 'Pre-invoice tax differs from the supplier XML. Usually the operation type on the pre-invoice is wrong: fix the type and post again.')) })),
      nota('F-0104', [1200, 85], 'E10-A', 'G-2104', '28', () => ({ analise: an('editada', 'regra', ['R242'], P('Regra da casa R242: embalagem que acompanha o produto vendido é custo de embalagem.', 'House rule R242: packaging shipped with the sold product is packaging cost.')) })),
      nota('F-0107', [1], 'E30-M', 'G-2206', '30', () => ({ devolucao: true })),
      nota('F-0102', [35], 'E20-A', 'G-2101', '30/60', () => ({ orfa: true })),
      nota('F-0110', [12, 40], 'E30-A', 'G-2105', '21', () => ({ analise: an('bloqueada', 'padrao', [], PADRAO, P('Nota cancelada na SEFAZ: o fornecedor cancelou esta NF-e. Cancelar a pré-nota.', 'Invoice canceled at SEFAZ: the supplier canceled this e-invoice. Cancel the pre-invoice.')) })),
      nota('F-0104', [700, 20], 'E10-A', 'G-2104', '28', () => ({ temXml: false, analise: an('passou', 'regra', ['R242'], P('Regra da casa R242: embalagem que acompanha o produto vendido é custo de embalagem.', 'House rule R242: packaging shipped with the sold product is packaging cost.')) })),
      /* ainda sem análise: o ciclo do robô aplica o resultado pronto */
      nota('F-0101', [300, 60], 'E10-A', 'G-2101', '28', () => ({ ciclo: an('passou', 'padrao', ['R244'], PADRAO) })),
      nota('F-0111', [260, 300], 'E20-E', 'G-2101', '30/60', () => ({ ciclo: an('passou', 'ia', ['R243'], P('Rolamentos com ICMS de 4% no XML: compra interestadual de item importado, na conta de matéria-prima.', 'Bearings with 4% ICMS on the XML: interstate purchase of an imported item, on the raw material account.')) })),
      nota('F-0108', [60], 'E10-A', 'G-2101', '28', () => ({ ciclo: an('passou', 'padrao', [], PADRAO) })),
    ];
    fila.push(cte('T-0201', 486.3, false, fila[0].nf), cte('T-0202', 1240.8, false, 0), cte('T-0203', 912.45, true, 0));
    /* processadas: [fornecedor, quantidades, tipo, conta, condição, dia, hora, quem, veredito (só nas que a equipe lançou)] */
    const feitas = [
      ['F-0101', [240, 96], 'E10-A', 'G-2101', '28', 0, '08:12', 0], ['F-0108', [40, 30, 12], 'E10-A', 'G-2101', '28', 0, '08:40', 1], ['F-0103', [80], 'E10-D', 'G-2101', '21', 0, '09:05', 0],
      ['F-0104', [600, 40], 'E10-A', 'G-2104', '28', 0, '09:31', 2], ['F-0102', [50, 90, 20], 'E20-A', 'G-2101', '30/60', -1, '10:14', 0], ['F-0111', [120, 60], 'E20-E', 'G-2101', '30/60', -1, '11:02', 1],
      ['F-0105', [60, 20], 'E30-A', 'G-2118', '14', -1, '14:20', 3, 'acertou'], ['F-0110', [30, 100], 'E30-A', 'G-2105', '21', -2, '09:48', 0], ['F-0109', [12, 200], 'E20-E', 'G-2206', '28', -2, '15:30', 3, 'errou'],
      ['F-0106', [10], 'E20-A', 'G-2101', '30', -3, '08:55', 2], ['F-0101', [400, 120, 40], 'E10-A', 'G-2101', '28', -3, '10:40', 0], ['F-0107', [2], 'E30-M', 'G-2206', '30/60/90', -4, '13:10', 3, ''],
      ['F-0108', [80, 60], 'E10-A', 'G-2101', '28', -5, '09:20', 0],
    ].map(([cod, q, tp, conta, cond, dias, hora, quem, v]) => feita(nota(cod, q, tp, conta, cond, () => ({ analise: an('passou', 'padrao', [], PADRAO) })), dias, hora, quem, v));
    [['T-0201', 312.4, false, 0, '07:30'], ['T-0202', 845.1, false, -1, '08:10'], ['T-0203', 655.9, true, -2, '16:00']].forEach(([cod, valor, saida, dias, hora]) => feitas.push(feita(cte(cod, valor, saida, 0), dias, hora, 0)));
    db = { notas: fila.concat(feitas), motor: { ligado: false, quem: QUEM[2], quando: A.data(-12, '13:52') },
      atividade: P('produção em dia, vigiando pré-notas liberadas', 'production up to date, watching released pre-invoices') };
  }
  function feita(n, dias, hora, quem, veredito) {
    n.sit = 'lancada';
    n.lanc = { alvo: veredito === undefined ? 'producao' : 'analise', veredito: veredito || null, quem: QUEM[quem], quando: A.data(dias, hora) };
    return n;
  }
  const marcarLancada = (n, quem) => Object.assign(n, { sit: 'lancada', lanc: { alvo: 'producao', veredito: null, quem, quando: new Date() } });
  const fila = () => db.notas.filter(n => n.sit === 'fila');
  const feitas = () => db.notas.filter(n => n.sit !== 'fila').sort((a, b) => b.lanc.quando - a.lanc.quando);
  const lancadasHoje = () => feitas().filter(n => n.lanc.alvo === 'producao' && n.lanc.quando.toDateString() === new Date().toDateString());

  /* ---------- registro ---------- */
  Hub.registrar({
    id: 'nf_autonoma',
    ordem: 1,
    grupo: P('Fiscal e financeiro', 'Tax and finance'),
    icone: '<path d="M6 3h8.5L19 7.5V21H6zM14 3v5h5M9 14.5l2 2 4-4"/>',
    nome: P('Notas fiscais de entrada', 'Inbound invoices'),
    resumo: P('A camada inteligente sobre o ERP que lança as notas fiscais de entrada e os CT-es (fretes) da empresa: decide, simula antes de gravar e, com o modo automático ligado, lança tudo sozinha.',
      'The intelligent layer on top of the ERP that posts the company\'s inbound invoices and CT-es (freight bills): it decides, simulates before writing and, with automatic mode on, posts everything on its own.'),
    manual: {
      pt: {
        destaque: 'A NF Autônoma é a camada inteligente sobre o ERP que lança as notas fiscais de entrada e os CT-es (fretes) da empresa. Com o modo automático ligado, a nota chega, é classificada e lançada sem ninguém digitar.',
        oque: 'O problema. Lançar uma nota de entrada mexe em estoque, custo, impostos, livro fiscal, contas a pagar, ordem de compra e orçamento. Cada fornecedor tem um padrão próprio de tipo de operação, conta e condição de pagamento, e esse conhecimento ficava com quem digitava, não em regra de sistema. Duas áreas passavam pela mesma nota e parte dos fretes ficava sem vínculo com a mercadoria transportada.\n\nO que faz. Lê cada nota de entrada e cada CT-e, decide a classificação fiscal por regras e, no caso ambíguo, por IA, simula o lançamento e grava tudo em uma transação. Com o automático ligado, lança sozinha.\n\nNesta demonstração pública, o painel de lançamentos funciona com dados fictícios; as outras áreas aparecem no vídeo da versão completa.',
        finalidade: 'Segurança. Nada grava sem simulação limpa; na dúvida ele não lança e explica o motivo. Cada lançamento registra quem lançou, quando e por quê, e a verba nunca é contada duas vezes.\n\nO propósito é tirar da equipe fiscal a digitação repetitiva e deixá-la livre para o que exige julgamento.',
        alcance: [
          'Resultado medido: acima de 97% de acerto nas decisões tomadas por regra, que são a maior parte do volume.',
          'Resultado medido: 98,1% de acerto para fornecedores de padrão estável.',
          'Resultado medido: 97% a 98% de acerto no frete, nos casos em que o sistema decide.',
          'Cada número compara a decisão do sistema com o lançamento feito por uma pessoa.',
          'Primeiro lançamento em produção 38 dias depois do início do projeto.',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'API de IA generativa', 'Next.js / React', 'XML de NF-e e CT-e'],
      },
      en: {
        destaque: 'NF Autônoma is the intelligent layer on top of the ERP that posts the company\'s inbound invoices and CT-es (freight bills). With automatic mode on, the invoice arrives, is classified and posted with no one typing.',
        oque: 'The problem. Posting an inbound invoice touches stock, cost, taxes, the fiscal book, accounts payable, the purchase order and the budget. Each supplier has its own pattern of operation type, account and payment terms, and that knowledge lived with whoever typed the invoice, not in a system rule. Two departments handled the same invoice and part of the freight had no link to the goods it carried.\n\nWhat it does. It reads every inbound invoice and every CT-e, decides the tax classification by rules and, in the ambiguous case, by AI, simulates the posting and writes everything in one transaction. With automatic mode on, it posts on its own.\n\nIn this public demo, the posting board works on fictitious data; the other areas appear in the video of the full version.',
        finalidade: 'Safety. Nothing is written without a clean simulation; when in doubt it does not post and explains why. Every posting records who posted, when and why, and the budget is never counted twice.\n\nThe purpose is to take repetitive typing off the tax team and leave it free for what needs judgment.',
        alcance: [
          'Measured result: above 97% accuracy in rule-based decisions, which are most of the volume.',
          'Measured result: 98.1% accuracy for suppliers with a stable pattern.',
          'Measured result: 97% to 98% accuracy on freight, in the cases where the system decides.',
          'Each figure compares the system decision with the posting made by a person.',
          'First posting in production 38 days after the project started.',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Generative AI API', 'Next.js / React', 'NF-e and CT-e XML'],
      },
    },
    /* mini tour: só ganchos do módulo (data-f, .n-*), nada que dependa do idioma */
    tour: [
      { alvo: '.nfa-real [data-f="aba-lanc"]', acao: 'clicar', titulo: P('Bem-vindo à mesa fiscal', 'Welcome to the tax desk'),
        texto: P('Toda nota de entrada e todo frete chegam aqui sozinhos, direto do ERP. Ninguém digita: o sistema lê, decide e simula cada um.',
          'Every inbound invoice and every freight bill lands here on its own, straight from the ERP. No one types: the system reads, decides and simulates each one.') },
      { alvo: '.nfa-real .n-metrics', titulo: P('A fila e o que já foi para a produção', 'The queue and what already went to production'),
        texto: P('De um lado, as notas que aguardam; do outro, as lançadas na produção. O botão de hoje mostra quem lançou, a hora e o valor.',
          'On one side, the invoices waiting; on the other, the ones posted to production. The today button shows who posted, when and the amount.') },
      { alvo: '.nfa-real .n-gb .n-robo', titulo: P('Cada nota diz o que precisa', 'Every invoice says what it needs'),
        texto: P('Simulação limpa vira o botão Lançar. Se algo não bate, aparece Conferir com o motivo já escrito. Nada é gravado sem simulação limpa.',
          'A clean simulation becomes the Post button. If something does not match, Check appears with the reason already written. Nothing is written without a clean simulation.') },
      { alvo: '.nfa-real [data-f="motor"]', titulo: P('O piloto automático', 'The autopilot'),
        texto: P('Com o modo automático ligado, o robô lança sozinho tudo o que passar limpo. Quem ligou ou desligou fica registrado, com dia e hora.',
          'With automatic mode on, the robot posts on its own everything that passes clean. Whoever turned it on or off is recorded, with date and time.') },
      { alvo: '.nfa-real [data-f="aba-motor"]', acao: 'clicar', titulo: P('Regras, IA e custo', 'Rules, AI and cost'),
        texto: P('O motor de regras da casa, o custo da IA, o assistente e os avisos por e-mail moram nas outras áreas.',
          'The house rules engine, the AI cost, the assistant and the email notices live in the other areas.') },
      { alvo: '.nfa-real .ph-fora', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('No vídeo, o sistema completo em ação. Quer ver tudo funcionando de verdade? É só me chamar por aqui.',
          'The video shows the full system in action. Want to see it all running for real? Just reach me from here.') },
    ],
    montar(el, api) {
      A = api; ui = api.ui; h = api.h; t = api.t; fmt = api.fmt;
      if (!db) semear();
      montar(el);
    },
  });

  /* ---------- peças de tela (kit do hub) ---------- */
  const DLG = 'nfa-real';
  const IC = {
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    files: '<path d="M20 7h-3a2 2 0 0 1-2-2V2"/><path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z"/><path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>', chevu: '<path d="m18 15-6-6-6 6"/>',
    inbox: '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    factory: '<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17 18h1"/><path d="M12 18h1"/><path d="M7 18h1"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    rotate: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
    sliders: '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',
  };
  /* cor de destaque por bloco, sempre ligada a um token do hub */
  const TOM = { teal: 'var(--ph-ok)', coral: 'var(--ph-erro)', amber: 'var(--ph-alerta)', am2: 'var(--ph-alerta)', laranja: 'var(--ph-cor-ambar)', cyan: 'var(--ph-info)', violet: 'var(--ph-cor-violeta)', roxo: 'var(--ph-cor-violeta)', dim: 'var(--ph-neutro)' };
  const BTOM = { teal: 'ok', coral: 'perigo', amber: 'alerta', am2: 'alerta', laranja: 'alerta' };
  const S = (tipo, titulo, ms, estado) => ({ tipo, titulo, ms, estado });
  const dm = d => fmt.data(d).slice(0, 5);
  const ic = (nome, tam = 14) => { const s = A.icone(IC[nome] || IC.x, 'n-ic'); s.style.cssText = 'width:' + tam + 'px;height:' + tam + 'px'; return s; };
  const e = (tag, classe, ...filhos) => h(tag, classe ? { class: classe } : null, ...filhos);
  const chip = (txt, cor, icn) => { const b = ui.badge(h('span', { class: 'n-chip-tx' }, txt), 'neutro'); b.classList.add('n-chip'); b.style.setProperty('--tom', TOM[cor] || TOM.dim); if (icn) b.firstElementChild.replaceWith(ic(icn, 12)); return b; };
  const pilha = (gap, ...filhos) => h('div', { class: 'col', style: 'gap:' + gap + 'px' }, ...filhos);
  const painel = (classe, ...filhos) => ui.cartao({ classe: 'n-painel' + (classe ? ' ' + classe : ''), conteudo: filhos });
  const campo = (rot, valor, sub, destaque) => h('div', { class: 'n-campo' + (destaque ? ' dest' : '') }, e('p', 'rot', rot), h('p', { class: 'val' + (valor === '-' ? ' vz' : ''), title: valor }, valor), sub && e('p', 'sub', sub));
  const nbtn = (texto, aoClicar, o = {}) => {
    const b = ui.botao({ texto, aoClicar, icone: o.ic && IC[o.ic], tom: o.tom || (o.primario ? 'primario' : 'secundario'), tamanho: o.grande ? null : 'p', titulo: o.titulo, classe: o.classe });
    if (o.foco) b.setAttribute('data-f', o.foco);
    return b;
  };
  const metricas = lista => {
    const k = ui.kpis(lista.map(m => ({ rotulo: m[0], valor: m[1], icone: IC[m[3]] })));
    k.classList.add('n-metrics');
    [...k.children].forEach((c, i) => { c.classList.add('n-metric'); c.style.setProperty('--tom', TOM[lista[i][2]]); c.querySelector('.ph-kpi-rotulo').classList.add('l'); c.querySelector('.ph-kpi-valor').classList.add('v'); });
    return k;
  };
  const foraDaDemo = titulo => (ui.foraDaDemo ? ui.foraDaDemo({ titulo })
    : ui.vazio({ icone: 'info', titulo: PP(l => t(titulo) + (l === 'pt' ? ': fora da demonstração pública' : ': outside the public demo')), texto: P('Esta tela fica na versão completa.', 'This screen is in the full version.') }));

  const ROTULO = 'font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const CSS = [
    '.nfa-real{min-width:0;color:var(--ph-text)}',
    Object.keys(TOM).map(k => '.nfa-real .c-' + k + '{--c:' + TOM[k] + '}').join(''),
    '.nfa-real .n-ic{flex:none}',
    [[10, 11], [10.5, 11.5], [11, 12], [11.5, 12.5]].map(([k, s]) => '.nfa-real .f' + String(k).replace('.', '') + '{font-size:' + s + 'px}').join(''),
    [['text', 'text'], ['mut', 'text-muted'], ['dim', 'text-dim'], ['cyan', 'accent-light'], ['teal', 'ok'], ['amber', 'alerta']].map(([k, v]) => '.nfa-real .t-' + k + '{color:var(--ph-' + v + ')}').join(''),
    '.nfa-real .mono{font-family:var(--ph-font-mono);font-variant-numeric:tabular-nums}.nfa-real .b{font-weight:700}.nfa-real .sb{font-weight:600}.nfa-real .lh{line-height:1.55}',
    '.nfa-real .row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}.nfa-real .col{display:flex;flex-direction:column;gap:12px;min-width:0}.nfa-real .rx{overflow-x:auto}',
    '.nfa-real .n-chip.ph-badge{max-width:100%}.nfa-real .n-chip .ph-ico{flex:none}.nfa-real .n-chip-tx{min-width:0;overflow:hidden;text-overflow:ellipsis}',
    '.nfa-real .n-painel.ph-card{padding:0;gap:0;min-width:0}.nfa-real .n-painel.p16{padding:16px}',
    '.nfa-real .n-campos{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(var(--min,130px),100%),1fr));gap:8px}',
    '.nfa-real .n-campo{background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio);padding:7px 11px;min-width:0}.nfa-real .n-campo.dest{border-color:color-mix(in srgb,var(--ph-accent) 45%,var(--ph-border))}',
    '.nfa-real .n-campo .rot,.nfa-real .n-lab,.nfa-real .n-cabt{' + ROTULO + ';color:var(--ph-text-dim)}.nfa-real .n-lab{color:var(--c,var(--ph-accent-light))}',
    '.nfa-real .n-campo .val{font:500 13px/1.5 var(--ph-font-mono);color:var(--ph-text);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nfa-real .n-campo.dest .val{font-size:15px;font-weight:700}.nfa-real .n-campo .val.vz{color:var(--ph-text-dim)}.nfa-real .n-campo .sub{font-size:12px;color:var(--ph-text-dim);margin-top:2px}',
    '.nfa-real .n-demo{border-bottom:1px dashed var(--ph-border-soft);background:var(--ph-surface);font-size:13px;color:var(--ph-text-muted)}',
    '.nfa-real .n-demo summary{cursor:pointer;padding:8px 16px;display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;list-style:none;' + ROTULO + ';color:var(--ph-text-dim)}.nfa-real .n-demo summary:focus-visible{outline-offset:-2px}',
    '.nfa-real .n-demo summary::-webkit-details-marker{display:none}.nfa-real .n-demo summary .nota{font:400 12px/1.5 var(--ph-font);letter-spacing:0;text-transform:none;font-stretch:100%}.nfa-real .n-demo[open] summary .n-ic:last-child{transform:rotate(180deg)}',
    '.nfa-real .n-demo .corpo{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:2px 16px 10px}',
    '.nfa-real .n-topbtn.ph-btn{white-space:normal;height:auto;min-height:2rem;padding-block:5px;text-align:left;max-width:100%}.nfa-real .n-topbtn small{display:block;font-size:11.5px;color:var(--ph-text-dim);font-weight:500}',
    '.nfa-real .n-dot{width:8px;height:8px;border-radius:50%;background:var(--ph-erro);display:inline-block;flex:none;margin-right:7px;vertical-align:1px}.nfa-real .n-dot.on{background:var(--ph-ok)}',
    '.nfa-real .n-sec{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;margin-bottom:20px;flex-wrap:wrap}.nfa-real .n-sec-tx{min-width:0;flex:1 1 26rem}.nfa-real .n-sec .ph-kicker{margin-bottom:6px}',
    '.nfa-real .n-metrics.ph-kpis{grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr));margin-bottom:20px}.nfa-real .n-metric .ph-kpi-rotulo>span{min-width:0}.nfa-real .n-metric .ph-kpi-valor{margin-top:auto}',
    '.nfa-real .n-tb-top{display:flex;flex-direction:column;gap:12px;padding:14px 16px;border-bottom:1px solid var(--ph-border)}.nfa-real .n-tb-l1{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 12px}',
    '.nfa-real .n-filtros{display:flex;gap:8px;align-items:center;flex-wrap:wrap;min-width:0}.nfa-real .n-busca.ph-busca{flex:0 1 260px}.nfa-real .n-cont2{font:400 12px/1.5 var(--ph-font-mono);color:var(--ph-text-dim)}',
    '.nfa-real .n-gi{min-width:1200px}.nfa-real .n-gh,.nfa-real .n-gr{display:grid;grid-template-columns:200px 118px 76px 92px 82px minmax(160px,1fr) 116px 80px 48px 108px;gap:10px;align-items:center}',
    '.nfa-real .n-gh{padding:0 16px;background:var(--ph-surface);border-bottom:1px solid var(--ph-border)}.nfa-real .n-gh span{padding:10px 0;' + ROTULO + ';text-transform:uppercase;color:var(--ph-text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.nfa-real .n-gb{max-height:340px;overflow-y:auto}.nfa-real .n-gr{color:var(--ph-text-2);cursor:pointer;padding:7px 16px;border-bottom:1px solid var(--ph-border);font-size:13px}',
    '.nfa-real .n-gr:hover{background:color-mix(in srgb,var(--ph-accent) 7%,var(--ph-card));box-shadow:inset 2px 0 0 var(--ph-accent)}.nfa-real .n-gr .n-link{font-weight:700;padding:0}',
    '.nfa-real .n-gr .c{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.nfa-real .n-gr .sit{display:inline-flex;align-items:center;gap:6px;justify-self:start;min-width:0;max-width:100%;overflow:hidden}',
    '.nfa-real .n-luz{width:9px;height:9px;border-radius:50%;flex:none;background:var(--ph-neutro)}.nfa-real .n-robo{justify-self:start;max-width:100%}',
    '.nfa-real .n-gr .doc{font:700 11.5px/1.5 var(--ph-font-mono);color:var(--c);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.nfa-real .n-link{background:none;border:0;padding:2px 0;cursor:pointer;font:inherit;font-family:var(--ph-font-mono);color:var(--ph-accent-light);text-align:left;text-decoration:underline;text-underline-offset:3px}',
    '.nfa-real .n-curva text{font-family:var(--ph-font-mono);text-anchor:middle}.nfa-real .n-curva .q{fill:var(--ph-text);stroke:var(--ph-card);stroke-width:3px;paint-order:stroke;font-size:9.5px;font-weight:700}.nfa-real .n-curva .d{fill:var(--ph-text-muted);font-size:10px;font-weight:700}.nfa-real .n-curva .l{fill:var(--ph-text-dim);font-size:9.5px}',
    '.nfa-real .n-leg{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--ph-text-dim)}.nfa-real .n-leg i{width:10px;height:10px;border-radius:2px;background:var(--c);display:inline-block}',
    '.nfa-real .n-abas-nota .ph-abas-painel.ph-pagina{padding:14px 0 0}',
    '.nfa-real .n-box{border:1px solid var(--ph-border);border-radius:var(--ph-raio);overflow:hidden}',
    '.nfa-real .n-lin{display:grid;grid-template-columns:150px 1fr;gap:9px;align-items:center;padding:7px 14px;border-bottom:1px solid var(--ph-border)}',
    '.nfa-real .n-barra{padding:10px 14px;border-bottom:1px solid var(--ph-border);background:var(--ph-surface);display:flex;align-items:center;gap:9px;flex-wrap:wrap}',
    '@media (max-width:1500px){.nfa-real .n-gi{min-width:1090px}.nfa-real .n-gh,.nfa-real .n-gr{grid-template-columns:170px 112px 70px 86px 78px minmax(140px,1fr) 108px 74px 44px 100px}}',
    '@media (max-width:700px){.nfa-real .n-tb-top{padding:12px}.nfa-real .n-busca.ph-busca{flex:1 1 100%;max-width:none}.nfa-real .n-chip.ph-badge{white-space:normal}.nfa-real .n-lin{grid-template-columns:1fr;gap:2px}}',
  ].join('\n');
  function injetarCss() {
    if (document.getElementById('nfa-real-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'nfa-real-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- casca do sistema: faixa da demonstração, abas e interruptor do robô ---------- */
  const AREAS = [
    { id: 'lanc', rot: P('Operação', 'Operations'), ic: 'zap' },
    { id: 'motor', rot: P('Motor de Regras', 'Rules Engine'), ic: 'database' },
    { id: 'cerebro', rot: P('Cérebro & custo', 'Brain & cost'), ic: 'sparkles' },
    { id: 'chat', rot: P('Assistente', 'Assistant'), ic: 'chat' },
    { id: 'emails', rot: P('E-mails', 'Emails'), ic: 'mail' },
  ];
  function montar(el) {
    injetarCss();
    const raiz = h('div', { class: 'nfa-real n-raiz' });
    el.append(raiz);
    const faixa = () => h('details', { class: 'n-demo', open: A.estado.demoAberto !== false, ontoggle: ev => { A.estado.demoAberto = !!ev.target.open; } },
      h('summary', null, ic('sliders', 13), h('span', null, P('Controles da demonstração', 'Demo controls')), e('span', 'nota', P('não fazem parte do sistema real', 'not part of the real system')), ic('chevd', 13)),
      h('div', { class: 'corpo' }, nbtn(P('Rodar um ciclo do robô', 'Run one robot cycle'), rodarCiclo, { ic: 'play', titulo: P('No sistema real o ciclo roda sozinho a cada poucos minutos', 'In the real system the cycle runs by itself every few minutes') }),
        h('span', { class: 't-dim' }, PP(l => (l === 'pt' ? 'Último ciclo do robô: ' : 'Last robot cycle: ') + db.atividade[l]))));
    pintar = foco => {
      const m = db.motor, lig = m.ligado;
      const interruptor = nbtn([h('span', { class: 'n-dot' + (lig ? ' on' : ''), 'aria-hidden': 'true' }),
        lig ? P('Modo automático ativo: lançamento autônomo', 'Automatic mode on: autonomous posting') : P('Modo automático inativo: apenas manual', 'Automatic mode off: manual only'),
        ' ', h('small', null, PP(l => (lig ? (l === 'pt' ? 'Ligado por ' : 'Turned on by ') : (l === 'pt' ? 'Desligado por ' : 'Turned off by ')) + m.quem[l] + (l === 'pt' ? ' em ' : ' on ') + dm(m.quando) + (l === 'pt' ? ' às ' : ' at ') + fmt.hora(m.quando)))],
      alternarMotor, { classe: 'n-topbtn', foco: 'motor', titulo: lig ? P('clique para DESLIGAR o automático', 'click to turn automatic mode OFF') : P('clique para LIGAR o automático', 'click to turn automatic mode ON') });
      const abas = ui.abas({ chave: 'area', rotulo: P('Áreas da NF Autônoma', 'NF Autônoma areas'), acoes: interruptor,
        abas: AREAS.map(a => ({ id: a.id, rotulo: a.rot, icone: IC[a.ic], montar: pn => (a.id === 'lanc' ? operacao(pn) : pn.append(foraDaDemo(a.rot))) })) });
      const nav = abas.querySelector('.ph-abas-lista');
      nav.classList.add('n-nav');
      [...nav.children].forEach((b, i) => b.setAttribute('data-f', 'aba-' + AREAS[i].id));
      raiz.replaceChildren(faixa(), abas);
      if (foco) { const x = raiz.querySelector('[data-f="' + foco + '"]'); if (x) x.focus(); }
    };
    pintar();
  }

  function alternarMotor() {
    const ligar = !db.motor.ligado;
    ui.modal({ titulo: ligar ? P('Ligar o lançamento automático?', 'Turn automatic posting on?') : P('Desligar o automático?', 'Turn automatic mode off?'), largura: 480, icone: IC.power, classe: DLG + (ligar ? ' ph-modal-perigo' : ''),
      corpo: e('p', 'ph-texto-mudo', ligar ? P('O robô passa a lançar sozinho, na base de produção, toda pré-nota liberada cuja simulação passar limpa, dentro dos limites configurados. Seu nome fica registrado.', 'The robot starts posting by itself, on the production database, every released pre-invoice whose simulation passes clean, within the configured limits. Your name is recorded.')
        : P('As notas passam a sair somente pelo botão Lançar (manual). Seu nome fica registrado.', 'Invoices will only be posted through the Post button (manual). Your name is recorded.')),
      acoes: ctl => [nbtn(P('Cancelar', 'Cancel'), () => ctl.fechar(), { grande: true }), nbtn(ligar ? P('Ligar', 'Turn on') : P('Desligar', 'Turn off'), () => {
        ctl.fechar();
        ui.backend({ titulo: P('Interruptor do robô', 'Robot switch'), velocidade: 1.5, escrita: 'update', passos: [S('api', P('Confere a permissão de administrador', 'Checks administrator permission'), 70), S('sql', P('Grava a chave e quem mudou', 'Stores the switch and who changed it'), 40)],
          resumo: ligar ? P('Automático ligado. As travas continuam valendo.', 'Automatic on. The safety locks still apply.') : P('Automático desligado: apenas manual.', 'Automatic off: manual only.'),
          aoConcluir: () => { db.motor = { ligado: ligar, quem: VISITANTE, quando: new Date() }; pintar('motor'); ui.toast(ligar ? P('Modo automático ligado', 'Automatic mode on') : P('Modo automático desligado', 'Automatic mode off'), ligar ? 'alerta' : 'ok'); } });
      }, { tom: ligar ? 'perigo' : 'primario', grande: true, ic: 'power' })] });
  }

  /* ciclo do robô: aplica às pré-notas novas (e às editadas) a análise já pronta; com o automático ligado, as que passaram são lançadas */
  function rodarCiclo() {
    const alvo = fila().filter(n => n.ciclo || (n.analise && n.analise.estado === 'editada'));
    const lig = db.motor.ligado, nada = alvo.length ? undefined : 'pulado';
    ui.backend({ titulo: P('Ciclo do robô', 'Robot cycle'), subtitulo: P('Rotina automática em segundo plano', 'Background scheduled job'), velocidade: 1.3,
      passos: [S('erp', P('Lê as pré-notas liberadas', 'Reads the released pre-invoices'), 280), S('ia', P('Decide a classificação (regra, padrão do fornecedor ou IA)', 'Decides the classification (rule, supplier pattern or AI)'), 1400, nada),
        S('regra', P('Simula o lançamento', 'Simulates the posting'), 420, nada), S('erp', P('Lança ou deixa para revisão humana, com o motivo', 'Posts or leaves it for human review, with the reason'), 600, lig ? undefined : 'pulado'),
        S('job', P('Atualiza o placar', 'Updates the scoreboard'), 240)],
      resumo: alvo.length ? PP(l => alvo.length + (l === 'pt' ? ' pré-nota(s) analisada(s) neste ciclo.' : ' pre-invoice(s) analyzed in this cycle.')) : P('Produção em dia: nada novo para analisar.', 'Production up to date: nothing new to analyze.'),
      aoConcluir: () => {
        alvo.forEach(n => { n.analise = { ...(n.ciclo || n.analise), estado: 'passou', quando: new Date() }; delete n.ciclo; });
        const auto = lig ? fila().filter(n => n.analise && n.analise.estado === 'passou' && n.doc === 'nfe') : [];
        auto.forEach(n => marcarLancada(n, QUEM[0]));
        db.atividade = PP(l => alvo.length + (l === 'pt' ? ' pré-nota(s) analisada(s) neste ciclo' : ' pre-invoice(s) analyzed in this cycle') + (auto.length ? (l === 'pt' ? ', ' + auto.length + ' lançada(s) pelo robô' : ', ' + auto.length + ' posted by the robot') : ''));
        pintar();
        ui.toast(PP(l => alvo.length + (l === 'pt' ? ' nota(s) analisada(s)' : ' invoice(s) analyzed')), 'ok');
      } });
  }

  /* ---------- TELA PRINCIPAL · OPERAÇÃO ---------- */
  function situacao(n) {
    if (n.sit === 'fila') return n.orfa ? [P('Órfã: já lançada direto', 'Orphan: already posted directly'), 'laranja', 'alert'] : n.devolucao ? [P('Retorno: não lançar', 'Return: do not post'), 'roxo', 'ban'] : [P('A lançar', 'To post'), 'cyan', null];
    const x = n.lanc;
    if (x.alvo === 'producao') return [P('Lançada na PRODUÇÃO', 'Posted to PRODUCTION'), 'am2', 'factory'];
    return x.veredito === 'acertou' ? [P('Conforme', 'Matched'), 'teal', 'check'] : x.veredito === 'errou' ? [P('Divergente', 'Differed'), 'coral', 'x'] : [P('Aguardando conferência', 'Awaiting check'), 'amber', null];
  }

  function botaoRobo(n) {
    if (n.doc !== 'nfe') return e('span');
    const selo = (txt, cor, titulo, icn) => { const s = chip(txt, cor, icn); s.classList.add('n-robo'); s.setAttribute('title', t(titulo)); return s; };
    const botao = (txt, cor, titulo, icn) => nbtn(txt, ev => { ev.stopPropagation(); popupRobo(n); }, { ic: icn, tom: BTOM[cor] || 'secundario', titulo, classe: 'n-robo' });
    if (n.orfa) return selo(P('órfã', 'orphan'), 'laranja', P('A entrada já existe no ERP: cancelar a pré-nota, nunca efetivar', 'The entry already exists in the ERP: cancel the pre-invoice, never post it'), 'alert');
    if (n.devolucao) return selo(e('span', 'vh', P('não lançar', 'do not post')), 'roxo', P('Devolução ou retorno: nunca se lança', 'Return: never posted'), 'ban');
    const a = n.analise;
    if (!a) return selo('...', 'dim', P('O robô ainda não analisou esta pré-nota (entra no próximo ciclo)', 'The robot has not analyzed this pre-invoice yet (it enters the next cycle)'));
    if (a.estado === 'passou') return botao(P('Lançar', 'Post'), 'teal', P('Simulação limpa: clique para lançar na PRODUÇÃO', 'Clean simulation: click to post to PRODUCTION'), 'check');
    if (a.estado === 'revisao') return botao(P('Conferir', 'Check'), 'amber', P('A simulação passou, mas a revisão discorda: clique para ver', 'The simulation passed, but the review disagrees: click to see'), 'alert');
    if (a.estado === 'editada') return botao(P('Editada', 'Edited'), 'dim', P('A pré-nota foi editada depois da simulação: o robô simula de novo no próximo ciclo', 'The pre-invoice was edited after the simulation: the robot simulates again on the next cycle'), 'rotate');
    return botao(P('Conferir', 'Check'), 'coral', P('Simulação bloqueada: clique para ver o motivo', 'Simulation blocked: click to see why'), 'x');
  }

  function curvaLancamentos() {
    const PASSO = 64, W = CURVA.length * PASSO + 40, BASE = 86, ALT = 54, max = Math.max(...CURVA.map(d => d[0] + d[1] + d[2]));
    const COR = ['var(--ph-vivo-verde)', 'var(--ph-vivo-verde)', 'var(--ph-vivo-vermelho)'], OP = [1, 0.45, 1];
    let svg = '<line x1="14" x2="' + (W - 8) + '" y1="' + BASE + '" y2="' + BASE + '" style="stroke:var(--ph-border-soft)" stroke-dasharray="3 4"/>';
    CURVA.forEach((d, i) => {
      const tot = d[0] + d[1] + d[2], x = 40 + i * PASSO, alt = tot / max * ALT;
      let y = BASE;
      d.forEach((q, k) => {
        if (!q) return;
        const hh = q / tot * alt; y -= hh;
        svg += '<rect x="' + (x - 13) + '" y="' + y.toFixed(1) + '" width="26" height="' + hh.toFixed(1) + '" style="fill:' + COR[k] + '" opacity="' + OP[k] + '"/>' + (hh >= 12 ? '<text class="q" x="' + x + '" y="' + (y + hh / 2 + 3).toFixed(1) + '">' + q + '</text>' : '');
      });
      svg += '<text class="d" x="' + x + '" y="102">' + dm(A.data(i - CURVA.length + 1)) + '</text><text class="l" x="' + x + '" y="114">' + tot + ' ' + t(P('lanç.', 'posted')) + '</text>';
    });
    const leg = (k, txt) => h('span', { class: 'n-leg', style: { '--c': COR[k] } }, h('i', { style: 'opacity:' + OP[k] }), txt);
    return painel('p16',
      h('h3', { class: 'ph-h3' }, P('Lançamentos reais na produção, dia a dia', 'Real postings to production, day by day')),
      h('p', { class: 'f105 t-dim', style: 'margin:2px 0 8px' }, P('o que o robô gravou no ERP e o que a conferência disse depois', 'what the robot wrote to the ERP and what the check said afterwards')),
      h('div', { class: 'rx' }, h('div', { class: 'n-curva', role: 'img', 'aria-label': P('Lançamentos por dia', 'Postings per day'), html: '<svg width="' + W + '" height="122" style="display:block">' + svg + '</svg>' })),
      h('div', { class: 'row', style: 'gap:14px;margin-top:8px' }, leg(0, P('conferida sem correção', 'checked, no correction')), leg(1, P('intacta até agora', 'untouched so far')), leg(2, P('uma pessoa corrigiu', 'a person corrected it'))));
  }

  function operacao(p) {
    const f = A.estado.op || (A.estado.op = { aba: 'fila', busca: '', un: '', xml: '', sit: '', curva: false });
    const pend = fila(), proc = feitas();
    const filtrar = (lista, ehProc) => lista.filter(n => {
      if (f.un && n.un !== f.un) return false;
      if (f.xml && String(+n.temXml) !== f.xml) return false;
      if (ehProc && f.sit) { const v = n.lanc.alvo === 'analise' ? n.lanc.veredito || 'aguardando' : 'producao'; if (f.sit !== n.doc && f.sit !== v) return false; }
      const q = f.busca.trim().toLowerCase();
      return !q || `${n.nf} ${n.id || ''} ${n.f.cod} ${n.f.nome} ${n.tp}`.toLowerCase().includes(q);
    });
    const linha = n => {
      const s = situacao(n), cte = n.doc === 'cte', x = n.lanc, abrir = () => abrirNota(n);
      /* a linha abre com o mouse; para teclado e leitor de tela o número do documento é o botão */
      return h('div', { class: 'n-gr', onclick: abrir },
        h('span', { class: 'sit' }, (() => { const c = chip(s[0], s[1], s[2]); c.setAttribute('title', t(s[0])); return c; })(),
          x && x.alvo === 'analise' && !x.veredito && h('span', { class: 'n-luz', title: P('a equipe ainda não lançou esta nota no ERP', 'the team has not posted this invoice in the ERP yet') })),
        f.aba === 'fila' ? botaoRobo(n) : nbtn(P('Ver no ERP', 'View in ERP'), ev => { ev.stopPropagation(); janelaErp(n); }, { ic: 'eye', classe: 'n-robo', titulo: P('Ver a nota pronta no ERP simulado', 'View the finished invoice in the simulated ERP') }),
        e('span', 'c mono t-dim', n.id || '-'),
        h('span', { class: 'c' }, h('button', { type: 'button', class: 'n-link', title: P('Abrir a tela de lançamento', 'Open the posting screen'), 'aria-label': PP(l => (cte ? 'CTe ' : '') + n.nf + ' · ' + n.f.nome + ' · ' + s[0][l]),
          onclick: ev => { ev.stopPropagation(); abrir(); } }, (cte ? 'CTe ' : '') + n.nf)),
        e('span', 'c mono t-mut', n.serie + ' / ' + n.un),
        h('span', { class: 'c', title: n.f.cod + ' · ' + n.f.nome }, n.f.nome),
        e('span', 'c mono t-mut', fmt.moeda(n.valor)),
        e('span', 'c mono t-cyan', n.tp || '-'),
        e('span', 'c mono t-dim', n.itens.length || '-'),
        h('span', { class: 'doc c-' + (cte ? 'violet' : n.temXml ? 'teal' : 'amber') }, cte ? (n.saida ? P('FRETE SAÍDA', 'FREIGHT OUT') : P('FRETE ENTRADA', 'FREIGHT IN')) : n.temXml ? 'XML' : 'OC'));
    };
    const corpo = e('div', 'n-gb'), cont = e('span', 'n-cont2');
    const limpar = nbtn(P('Limpar', 'Clear'), () => { Object.assign(f, { busca: '', un: '', xml: '', sit: '' }); pintar('op-busca'); }, { ic: 'x', tom: 'fantasma' });
    const pintarLinhas = () => {
      const ls = filtrar(f.aba === 'proc' ? proc : pend, f.aba === 'proc');
      corpo.replaceChildren(...(ls.length ? ls.map(linha) : [ui.vazio({ icone: IC.inbox, titulo: P('Nenhum registro encontrado', 'No records found'), texto: P('Ajuste os critérios de busca ou os filtros.', 'Adjust the search or the filters.') })]));
      cont.textContent = t(PP(l => ls.length + (l === 'pt' ? ' de ' : ' of ') + (f.aba === 'proc' ? proc : pend).length));
      limpar.hidden = !(f.busca || f.un || f.xml || f.sit);
    };
    const sel = (ops, chave, rot, larg) => { const s = ui.select({ ariaLabel: rot, opcoes: ops.map(o => ({ valor: o[0], texto: o[1] })), valor: f[chave], aoMudar: v => { f[chave] = v; pintarLinhas(); } }); s.style.width = larg + 'px'; return s; };
    const seg = ui.chips({ rotulo: P('Fila ou processadas', 'Queue or processed'), valor: f.aba, aoMudar: v => { f.aba = v; f.sit = ''; pintar('op-' + v); },
      opcoes: [{ valor: 'fila', texto: PP(l => (l === 'pt' ? 'Fila (' : 'Queue (') + pend.length + ')') }, { valor: 'proc', texto: PP(l => (l === 'pt' ? 'Processadas (' : 'Processed (') + proc.length + ')') }] });
    [...seg.children].forEach((b, i) => b.setAttribute('data-f', 'op-' + (i ? 'proc' : 'fila')));
    const busca = ui.busca({ placeholder: P('Buscar NF, fornecedor, tipo...', 'Search invoice, supplier, type...'), rotulo: P('Buscar NF, fornecedor ou tipo', 'Search invoice, supplier or type'), valor: f.busca, aoDigitar: v => { f.busca = v; pintarLinhas(); } });
    busca.classList.add('n-busca'); busca.input.setAttribute('data-f', 'op-busca');
    const CAB = [P('Situação', 'Status'), f.aba === 'proc' ? 'ERP' : P('Robô', 'Robot'), P('Pré-nota', 'Pre-invoice'), 'NF', P('Série/UN', 'Series/unit'), P('Fornecedor', 'Supplier'), P('Valor', 'Amount'), P('Tipo op.', 'Op. type'), P('Itens', 'Items'), 'Doc.'];
    p.append(
      h('div', { class: 'n-sec' }, h('div', { class: 'n-sec-tx' }, e('p', 'ph-kicker', P('Operação', 'Operations')), h('h2', { class: 'ph-h1' }, P('Painel de lançamentos', 'Posting board')),
        e('p', 'ph-sub', P('A fila viva do ERP: o robô decide e simula cada nota; o que passa limpo está pronto para efetivar na produção.', 'The live ERP queue: the robot decides and simulates each invoice; whatever passes clean is ready to post to production.'))),
        nbtn(P('Curva de evolução', 'Progress curve'), () => { f.curva = !f.curva; pintar('op-curva'); }, { ic: f.curva ? 'chevu' : 'chevd', foco: 'op-curva' })),
      f.curva ? h('div', { style: 'margin-bottom:16px' }, curvaLancamentos()) : '',
      metricas([
        [PP(l => (l === 'pt' ? 'Na fila · ' : 'In queue · ') + pend.filter(n => n.doc === 'nfe').length + ' NFe · ' + pend.filter(n => n.doc === 'cte').length + ' CTe'), pend.length, 'cyan', 'files'],
        [h('span', { class: 'row', style: 'gap:8px' }, P('Lançadas na produção', 'Posted to production'),
          nbtn(PP(l => (l === 'pt' ? 'hoje ' : 'today ') + lancadasHoje().length), popupHoje, { ic: 'eye', tom: 'alerta', classe: 'n-hoje', titulo: P('ver o que o hub lançou hoje: quem lançou, hora, tipo e valor', 'see what the hub posted today: who, when, type and amount') })),
        proc.filter(n => n.lanc.alvo === 'producao').length, 'am2', 'zap']]),
      painel(null,
        h('div', { class: 'n-tb-top' },
          h('div', { class: 'n-tb-l1' }, h('div', { class: 'row', style: 'gap:10px' }, chip(P('PRODUÇÃO', 'PRODUCTION'), 'am2', 'factory'), seg), cont),
          h('div', { class: 'n-filtros' }, busca,
            sel([['', 'U.N.'], ['UN-01', 'UN-01'], ['UN-02', 'UN-02']], 'un', P('Unidade de negócio', 'Business unit'), 96),
            sel([['', P('Doc: todos', 'Doc: all')], ['1', P('Com XML', 'With XML')], ['0', P('Sem XML', 'Without XML')]], 'xml', P('Documento', 'Document'), 120),
            sel([['', P('Todos os status', 'All statuses')]].concat(f.aba === 'proc' ? [['acertou', P('Conforme', 'Matched')], ['errou', P('Divergente', 'Differed')], ['aguardando', P('Aguardando conferência', 'Awaiting check')], ['cte', P('Frete (CTe)', 'Freight (CTe)')], ['nfe', P('Mercadoria (NFe)', 'Goods (NFe)')]] : []), 'sit', P('Status', 'Status'), 168),
            limpar)),
        h('div', { class: 'rx' }, h('div', { class: 'n-gi' }, h('div', { class: 'n-gh' }, CAB.map(c => h('span', null, c))), corpo))));
    pintarLinhas();
  }

  /* popup do botão do robô: lançar (simulação limpa) ou conferir (com o motivo pronto) */
  function popupRobo(n) {
    const a = n.analise, pode = a.estado === 'passou', perigo = a.estado === 'bloqueada';
    const titulo = pode ? P('Lançar na produção (ERP)', 'Post to production (ERP)') : a.estado === 'revisao' ? P('Revisão discorda: conferir antes de lançar', 'Review disagrees: check before posting')
      : a.estado === 'editada' ? P('Pré-nota editada: aguarde a reanálise', 'Pre-invoice edited: wait for re-analysis') : P('Não pode lançar: conferir', 'Cannot post: check');
    const texto = a.estado === 'editada' ? P('A pré-nota foi salva depois da última simulação. O robô simula de novo no próximo ciclo.', 'The pre-invoice was saved after the last simulation. The robot simulates again on the next cycle.') : a.aviso;
    ui.modal({ titulo, largura: 560, icone: pode ? IC.send : IC.alert, classe: DLG + (perigo ? ' ph-modal-perigo' : ''),
      corpo: c => c.append(pilha(8,
        h('p', { class: 'f115 t-mut' }, 'NF ', h('b', { class: 'mono t-text' }, n.nf), P(' · pré-nota ', ' · pre-invoice '), h('span', { class: 'mono' }, n.id), ' · ' + n.f.nome + ' · ' + fmt.moeda(n.valor)),
        h('div', { class: 'n-campos', style: { '--min': '140px' } }, campo(P('Tipo de operação', 'Operation type'), n.tp, null, true), campo(P('Conta gerencial', 'Management account'), n.conta, null, true),
          campo(P('Condição sugerida', 'Suggested term'), condTxt(n.cond)), campo(P('Analisado pelo robô', 'Analyzed by the robot'), fmt.dataHora(a.quando), ROT_MOTOR[a.metodo][0])),
        pode ? [h('p', { class: 'f115 lh t-mut' }, P('SIMULAÇÃO PASSOU: pronta para efetivar. Nada foi gravado.', 'SIMULATION PASSED: ready to post. Nothing was written.')),
          h('p', { class: 'f11 t-dim lh' }, P('Grava na base de produção em uma transação. Se algo mudou desde a simulação, nada é gravado e o motivo aparece.', 'Writes to the production database in one transaction. If something changed since the simulation, nothing is written and the reason is shown.'))]
          : ui.aviso(texto, perigo ? 'erro' : 'alerta'))),
      acoes: ctl => [nbtn(P('Abrir a nota', 'Open the invoice'), () => { ctl.fechar(); abrirNota(n); }, { grande: true }),
        pode && nbtn(P('LANÇAR AGORA', 'POST NOW'), () => { ctl.fechar(); efetivar(n); }, { primario: true, ic: 'send', grande: true }),
        nbtn(P('Cancelar', 'Cancel'), () => ctl.fechar(), { tom: 'fantasma', grande: true })] });
  }

  /* efetivação encenada: rastro curto e a nota pronta no ERP simulado */
  function efetivar(n, aoFim) {
    const cte = n.doc === 'cte';
    ui.backend({ titulo: cte ? P('Lançar frete na produção', 'Post freight to production') : P('Efetivar na produção', 'Post to production'), subtitulo: (cte ? 'CT-e ' : 'NF ') + n.nf + ' · ' + n.f.nome, velocidade: 1.4, escrita: 'create',
      passos: cte ? [S('sefaz', P('Confere se o documento segue autorizado', 'Checks that the document is still authorized'), 380), S('erp', P('Identifica a nota transportada', 'Finds the carried invoice'), 260),
        S('erp', P('Grava a entrada do frete em uma transação', 'Writes the freight entry in one transaction'), 700), S('sql', P('Registra e avisa', 'Logs and notifies'), 90)]
        : [S('api', P('Confere a permissão', 'Checks permission'), 90), S('regra', P('Refaz a simulação', 'Runs the simulation again'), 310),
          S('erp', P('Grava tudo em uma transação', 'Writes everything in one transaction'), 900), S('sql', P('Registra e avisa', 'Logs and notifies'), 120)],
      resumo: P('Documento lançado em uma única transação.', 'Document posted in a single transaction.'),
      aoConcluir: () => {
        marcarLancada(n, VISITANTE);
        pintar();
        ui.toast(PP(l => (cte ? 'CT-e ' : 'NF ') + n.nf + (l === 'pt' ? ' lançada na produção' : ' posted to production')), 'ok');
        if (aoFim) aoFim();
        janelaErp(n, true);
      } });
  }

  /* tela de lançamento (diálogo do kit com três abas) */
  function abrirNota(n) {
    const cte = n.doc === 'cte';
    ui.modal({ titulo: cte ? P('Tela de lançamento: CTe', 'Posting screen: CTe') : PP(l => (l === 'pt' ? 'Tela de lançamento: pré-nota ' : 'Posting screen: pre-invoice ') + n.id), largura: 1180, icone: IC.files, classe: DLG,
      corpo: (c, ctl) => {
        const feito = n.sit !== 'fila', a = n.analise, pode = !feito && a && a.estado === 'passou' && !n.orfa && !n.devolucao;
        const nItens = cte ? 1 : n.itens.length, titulos = n.cond.split('/').length;
        const plano = cte ? [[P('Documento', 'Document'), P('autorizado na SEFAZ', 'authorized at SEFAZ')], [P('Nota transportada', 'Carried invoice'), n.saida ? P('frete de venda: vínculo com a nota de saída', 'sales freight: linked to the outbound invoice') : n.ref ? 'NF ' + n.ref : P('identificada pela chave do XML', 'identified by the XML key')],
          [P('Entrada do frete', 'Freight entry'), PP(l => (l === 'pt' ? 'impostos e 1 título de ' : 'taxes and 1 title of ') + fmt.moeda(n.valor))], [P('Custo', 'Cost'), P('frete repartido nos itens da nota transportada', 'freight split across the carried invoice items')]]
          : [[P('Estoque', 'Stock'), PP(l => nItens + (l === 'pt' ? ' movimento(s) · ' : ' movement(s) · ') + fmt.moeda(n.valor))], [P('Fiscal', 'Tax'), PP(l => (l === 'pt' ? 'livro fiscal de ' : 'fiscal book for ') + nItens + (l === 'pt' ? ' item(ns)' : ' item(s)'))],
            [P('Contas a pagar', 'Accounts payable'), PP(l => titulos + (l === 'pt' ? ' título(s) · ' : ' title(s) · ') + fmt.moeda(n.valor))], [P('Ordem de compra', 'Purchase order'), PP(l => (l === 'pt' ? 'baixa de ' : 'write-off of ') + nItens + (l === 'pt' ? ' item(ns)' : ' item(s)'))],
            [P('Verba', 'Budget'), PP(l => (l === 'pt' ? 'consumo de ' : 'use of ') + fmt.moeda(n.valor) + (l === 'pt' ? ', sem contar duas vezes' : ', never counted twice'))], [P('Auditoria', 'Audit'), P('quem lançou, quando e por quê', 'who posted, when and why')]];
        const aviso = n.orfa ? P('Já lançada: esta NF já tem entrada no ERP; lançar de novo duplicaria estoque e financeiro. Cancelar a pré-nota.', 'Already posted: this invoice already has an ERP entry; posting again would duplicate stock and payables. Cancel the pre-invoice.')
          : n.devolucao ? P('Retorno de conserto: o robô não lança este tipo de nota.', 'Return from repair: the robot does not post this kind of invoice.')
            : !a ? P('O robô ainda não analisou esta nota (entra no próximo ciclo).', 'The robot has not analyzed this invoice yet (it enters the next cycle).')
              : a.estado === 'editada' ? P('A pré-nota foi editada depois da simulação: o robô simula de novo no próximo ciclo.', 'The pre-invoice was edited after the simulation: the robot simulates again on the next cycle.') : a.aviso;
        const efetivacao = () => painel(null,
          h('div', { class: 'n-barra' }, h('p', { class: 'n-cabt', style: 'flex:1 1 220px' }, P('Efetivação · plano do lançamento', 'Posting · posting plan')), chip(P('PRODUÇÃO (ERP)', 'PRODUCTION (ERP)'), 'am2'),
            feito ? chip(P('já efetivada', 'already posted'), 'teal') : pode && nbtn(P('Lançar na PRODUÇÃO', 'Post to PRODUCTION'), () => efetivar(n, () => ctl.fechar()), { primario: true, ic: 'send' })),
          !feito && !pode && aviso ? h('div', { style: 'padding:12px 14px' }, ui.aviso(aviso, a && a.estado === 'bloqueada' ? 'erro' : 'alerta'))
            : plano.map(([alvo, det]) => h('div', { class: 'n-lin' }, h('span', { class: 'f105 mono sb t-text' }, alvo), h('span', { class: 'f105 t-mut' }, det))));
        const itens = () => ui.tabela({ rotulo: P('Itens do documento', 'Document items'), busca: false, alturaMax: '40vh',
          linhas: cte ? [{ seq: 1, mat: 'SV-9001', descr: P('Serviço de frete', 'Freight service'), qtd: 1, un: 'SV', total: n.valor }] : n.itens,
          colunas: [{ id: 'seq', rotulo: 'Seq' }, { id: 'mat', rotulo: P('Material', 'Material') }, { id: 'descr', rotulo: P('Descrição', 'Description') }, { id: 'qtd', rotulo: P('Qtd', 'Qty'), tipo: 'numero', render: i => fmt.num(i.qtd) },
            { id: 'un', rotulo: 'UN' }, { id: 'total', rotulo: P('Valor', 'Amount'), tipo: 'numero', render: i => fmt.moeda(i.total) }] });
        const porque = () => painel('p16',
          a ? h('p', { class: 'f11 t-mut lh' }, h('b', { class: 'n-lab c-' + ROT_MOTOR[a.metodo][1] }, P('por quê: ', 'why: ')), a.motivo) : h('p', { class: 'f11 t-dim' }, P('O robô ainda não analisou esta nota.', 'The robot has not analyzed this invoice yet.')),
          feito && h('p', { class: 'f105 t-dim', style: 'margin-top:6px' }, P('lançado por ', 'posted by '), h('b', { class: 't-mut' }, n.lanc.quem), ' · ' + fmt.dataHora(n.lanc.quando)),
          a && a.regras.length > 0 && h('div', { style: 'margin-top:12px;border-top:1px solid var(--ph-border);padding-top:10px' }, h('p', { class: 'n-lab c-violet', style: 'margin-bottom:8px' }, P('Regras que participaram desta decisão', 'Rules that took part in this decision')),
            a.regras.map(id => h('div', { class: 'row', style: 'align-items:flex-start;padding:6px 0;border-bottom:1px solid var(--ph-border)' }, chip(id, 'teal'), h('p', { class: 'f11 t-mut lh', style: 'flex:1 1 200px' }, REGRAS[id])))));
        const abas = ui.abas({ chave: 'abaNota', rotulo: P('Detalhe da nota', 'Invoice detail'), abas: [['efetivacao', P('Efetivação', 'Posting'), efetivacao], ['itens', PP(l => (l === 'pt' ? 'Itens (' : 'Items (') + nItens + ')'), itens], ['porque', P('Por quê e regras', 'Why and rules'), porque]]
          .map(([id, rotulo, fn]) => ({ id, rotulo, montar: pn => pn.append(fn()) })) });
        abas.classList.add('n-abas-nota'); abas.querySelector('.ph-abas-lista').classList.add('n-abas');
        c.append(pilha(12,
          painel('p16',
            h('div', { class: 'row', style: 'gap:10px;margin-bottom:12px' },
              h('h3', { class: 'ph-h2', style: 'flex:1 1 160px' }, cte ? P('Frete CTe ', 'Freight CTe ') : P('Pré-nota ', 'Pre-invoice '), h('span', { class: 'mono t-cyan' }, cte ? n.nf : n.id)),
              chip(feito ? P('Efetivada', 'Posted') : P('Pendente', 'Pending'), feito ? 'teal' : 'amber'), a && chip(ROT_MOTOR[a.metodo][0], ROT_MOTOR[a.metodo][1]),
              feito && nbtn(P('Ver a nota no ERP', 'View the invoice in the ERP'), () => janelaErp(n), { primario: true, ic: 'eye' })),
            h('div', { class: 'n-campos', style: 'margin-bottom:12px' }, campo(cte ? P('Transportadora', 'Carrier') : P('Fornecedor', 'Supplier'), n.f.cod, n.f.nome), campo('NF', String(n.nf)), campo(P('Série / UN', 'Series / unit'), n.serie + ' / ' + n.un),
              campo(P('Valor', 'Amount'), fmt.moeda(n.valor)), campo(P('UF Fornecedor', 'Supplier state'), n.f.uf)),
            h('p', { class: 'n-lab', style: 'margin-bottom:6px' }, P('Campos decididos pela automação', 'Fields decided by the automation')),
            h('div', { class: 'n-campos', style: { '--min': '180px' } }, campo(P('Tipo de operação', 'Operation type'), n.tp, TIPOS[n.tp], true), campo(P('Conta gerencial', 'Management account'), n.conta, CONTAS[n.conta], true),
              campo(P('Condição de pagamento', 'Payment term'), condTxt(n.cond), null, true))),
          abas));
      } });
  }

  /* o que o hub lançou hoje */
  function popupHoje() {
    const itens = lancadasHoje();
    ui.modal({ titulo: PP(l => (l === 'pt' ? 'Lançadas pelo hub hoje · ' : 'Posted by the hub today · ') + itens.length), largura: 1080, icone: IC.zap, classe: DLG,
      corpo: (c, ctl) => c.append(pilha(12, ui.tabela({ rotulo: P('Lançadas pelo hub hoje', 'Posted by the hub today'), busca: false, alturaMax: '50vh', linhas: itens, aoClicarLinha: n => { ctl.fechar(); abrirNota(n); },
        colunas: [{ id: 'hora', rotulo: P('Hora', 'Time'), valor: n => n.lanc.quando, render: n => fmt.hora(n.lanc.quando) }, { id: 'nf', rotulo: 'NF', valor: n => n.nf },
          { id: 'forn', rotulo: P('Fornecedor', 'Supplier'), valor: n => n.f.nome }, { id: 'tp', rotulo: P('Tipo op.', 'Op. type'), valor: n => n.tp },
          { id: 'valor', rotulo: P('Valor', 'Amount'), tipo: 'numero', valor: n => n.valor, render: n => fmt.moeda(n.valor) }, { id: 'quem', rotulo: P('Quem lançou', 'Posted by'), valor: n => t(n.lanc.quem), render: n => n.lanc.quem }] }),
        h('p', { class: 'f105 t-dim lh' }, P('Conta só o que saiu do hub. Clique numa linha para abrir a nota.', 'Counts only what left the hub. Click a row to open the invoice.')))) });
  }

  /* a única janela do ERP simulado: o documento pronto, cabeçalho e itens */
  function janelaErp(n, preencher) {
    const cte = n.doc === 'cte', x = n.lanc, mo = fmt.moeda, NM = rotulo => ({ rotulo, tipo: 'numero' });
    const C = (rotulo, valor, largura, destaque) => ({ rotulo, valor, largura, destaque });
    const itens = cte ? [{ seq: 1, mat: 'SV-9001', descr: n.saida ? P('Serviço de frete sobre vendas', 'Freight service on sales') : P('Serviço de frete sobre compras', 'Freight service on purchases'), un: 'SV', qtd: 1, preco: n.valor, total: n.valor }] : n.itens;
    ui.erp({ programa: cte ? P('Entrada de conhecimento de frete', 'Freight document entry') : P('Nota fiscal de entrada', 'Inbound invoice'), codigo: 'ERP-0142', largura: 1000, colunas: 6, preencher: !!preencher, consulta: !preencher, velocidade: 4,
      campos: [C(cte ? P('Transportadora', 'Carrier') : P('Fornecedor', 'Supplier'), n.f.cod + ' · ' + n.f.nome, 2), C('UF', n.f.uf), C(P('Número', 'Number'), String(n.nf)), C(P('Série', 'Series'), n.serie), C(P('Modelo', 'Model'), cte ? '57 · CT-e' : '55 · NF-e'),
        C(P('Entrada', 'Entered'), fmt.dataHora(x.quando)), C(P('Unidade de negócio', 'Business unit'), n.un), C(P('Tipo de operação', 'Operation type'), comRotulo(TIPOS, n.tp), 2), C(P('Conta gerencial', 'Management account'), comRotulo(CONTAS, n.conta), 2),
        C(P('Condição de pagamento', 'Payment terms'), condTxt(n.cond)), C(P('Situação', 'Status'), x.alvo === 'analise' ? P('Efetivada pela equipe', 'Posted by the team') : P('Efetivada pelo hub, em uma transação', 'Posted by the hub, in one transaction'), 2),
        C(P('Total da nota', 'Invoice total'), mo(n.valor), 2, true)],
      grade: { alturaMax: 216, colunas: ['Seq', P('Material', 'Material'), P('Descrição', 'Description'), 'UN', NM(P('Qtd', 'Qty')), NM(P('Vl. unitário', 'Unit price')), NM(P('Vl. total', 'Total'))],
        linhas: itens.map(i => [i.seq, i.mat, i.descr, i.un, fmt.num(i.qtd), mo(i.preco), mo(i.total)]), total: ['', P('Totais', 'Totals'), '', '', '', '', mo(n.valor)] },
      narracao: [P('Gravando o cabeçalho da entrada...', 'Writing the entry header...'), P('Gravando os itens...', 'Writing the items...')],
      rodape: preencher ? P('Entrada efetivada pelo hub, em uma transação', 'Entry posted by the hub, in one transaction') : P('Consulta da nota efetivada: somente leitura', 'Inquiry of the posted invoice: read-only'),
      acoes: [{ texto: 'OK', tom: 'primario' }] });
  }
})();
