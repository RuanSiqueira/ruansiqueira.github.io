/* Planejamento de importados · versão pública curta do módulo (id planejamento_importados) para o site.
   Só a tela principal (Painel) é navegável, com dados fictícios já prontos: os quatro números do dia, a fila de compras pela
   data limite de colocar a OC, os alertas, a situação por família e os itens a programar por mês; "Ver item" abre a ficha com o
   resumo da falta e o mês a mês. As outras telas continuam nas abas e mostram o cartão "fora da demonstração". Visual do kit do
   hub, só tokens --ph-*, nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const S = (tipo, titulo, ms) => ({ tipo, titulo, ms });
  const r2 = v => Math.round(v * 100) / 100;
  const soma = a => a.reduce((x, y) => x + y, 0);
  const MM = { pt: 'jan fev mar abr mai jun jul ago set out nov dez'.split(' '), en: 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ') };
  const LOC = { pt: 'pt-BR', en: 'en-US' };
  const chave = (a, m) => a + '-' + String(m).padStart(2, '0');
  const dia1 = k => { const [a, m] = k.split('-').map(Number); return new Date(a, m - 1, 1); };
  const soData = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diasAte = (d, hoje) => Math.round((soData(d) - soData(hoje)) / 86400000);

  const IC = {
    ship: '<path d="M12 10.189V14"/><path d="M12 2v3"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-8.188-3.639a2 2 0 0 0-1.624 0L3 14a11.6 11.6 0 0 0 2.81 7.76"/><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1s1.2 1 2.5 1c2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
    pacote: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/>',
    painel: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    prancheta: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    alvo: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    ajuda: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
    alerta: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    relogio: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    sobe: '<path d="M16 7h6v6"/><path d="m22 7-8.5 8.5-5-5L2 17"/>',
    camadas: '<path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z"/><path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12"/><path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17"/>',
    carrinho: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    seta: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    servidor: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  };
  /* um bloco de estilo (#pimp-css), todo seletor preso à raiz .pimp, só com tokens --ph-* e nenhuma regra por tema */
  const ROT = 'font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const CSS = [
    '.pimp{min-width:0}.pimp [hidden]{display:none!important}.pimp p{margin:0}.pimp.x-shell{color:var(--ph-text);font-size:13.5px;line-height:1.5}',
    '.pimp .x-ic{display:inline-flex;flex:none}.pimp .x-ic svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.pimp .mono{font-family:var(--ph-font-mono);font-variant-numeric:tabular-nums}.pimp .muted{color:var(--ph-text-muted)}.pimp .nota{font-size:12px;color:var(--ph-text-dim)}',
    '.pimp .x-erp{display:inline-flex;align-items:center;gap:4px;padding:1px 7px;border:1px dashed currentColor;border-radius:var(--ph-raio);background:none;color:var(--ph-accent-light);font:inherit;font-size:11.5px;font-weight:600;line-height:1.6;white-space:nowrap;cursor:pointer}.pimp .x-erp:hover{background:var(--ph-accent-soft)}',
    '.pimp .x-erp:focus-visible,.pimp .lnk:focus-visible{outline:var(--ph-foco-largura) solid var(--ph-focus);outline-offset:2px}.pimp .x-aids{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px}.pimp .x-aids .x-leg{font-size:11.5px;color:var(--ph-text-dim)}',
    '.pimp .tela{display:flex;flex-direction:column;gap:16px;min-width:0}',
    '.pimp .ctxbar{display:flex;align-items:center;justify-content:flex-end;gap:8px 12px;flex-wrap:wrap;margin:-6px 0 14px;padding-bottom:12px;border-bottom:1px dashed var(--ph-border)}',
    '.pimp .ctxbar .ciclo{font:500 12px/1.4 var(--ph-font-mono);color:var(--ph-text-dim)}.pimp .quem{display:inline-flex;align-items:baseline;gap:8px;font-size:13px}.pimp .quem b{font-weight:650}.pimp .quem small{font-size:12px;color:var(--ph-text-dim)}',
    '.pimp .head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px 16px;flex-wrap:wrap}.pimp .head>div:first-child{flex:1 1 22rem;min-width:0}',
    '.pimp .eyebrow{display:flex;align-items:center;gap:6px;margin:0 0 4px;' + ROT + ';color:var(--ph-accent-light)}.pimp .t1{margin:0 0 4px}.pimp .head .sub{max-width:80ch;color:var(--ph-text-muted)}',
    '.pimp .ph-tabela td.neg{color:var(--ph-erro);font-weight:650}.pimp .ph-tabela td.dest{background:color-mix(in srgb,var(--ph-alerta) 10%,var(--ph-card))}',
    '.pimp .cel{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:170px;max-width:340px;white-space:normal}.pimp .cel small{font-size:12px;color:var(--ph-text-dim)}',
    '.pimp .cod{font-family:var(--ph-font-mono);font-weight:650;color:var(--ph-accent-light)}',
    '.pimp .lnk{padding:0;border:0;background:none;font:inherit;color:var(--ph-accent-light);font-weight:650;text-align:left;cursor:pointer}.pimp .lnk:hover{text-decoration:underline}',
    '.pimp .lista{display:grid;gap:8px;margin:0;padding:0;list-style:none;max-height:min(52vh,540px);overflow:auto;overscroll-behavior:contain}',
    '.pimp .al{display:flex;align-items:flex-start;gap:10px;min-width:0}.pimp .al>.x-ic{margin-top:2px;color:var(--tom,var(--ph-text-dim))}.pimp .al>div{flex:1;min-width:0}',
    '.pimp .al b{display:block;font-weight:650;overflow-wrap:anywhere}.pimp .al small{display:block;font-size:12.5px;color:var(--ph-text-muted)}.pimp .al .ph-btn{flex:none}',
    '.pimp .grupo-forn{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:12px}.pimp .grupo-forn .chip{display:inline-flex;gap:6px;align-items:center;padding:3px 10px;border:1px solid var(--ph-border);border-radius:var(--ph-raio);background:var(--ph-surface);font-size:12.5px}',
    '.pimp.dlg{display:grid;gap:14px}',
    '@media (max-width:640px){.pimp .ctxbar{justify-content:flex-start}.pimp .al{flex-wrap:wrap}}',
  ].join('\n');
  function injetarCss() {
    if (document.getElementById('pimp-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'pimp-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- dados de exemplo, fictícios e prontos (EMPRESA DEMO) ---------- */
  const FAMILIAS = [['kits', P('Kits de fixação', 'Fastening kits')], ['fitas', P('Fitas', 'Webbing')], ['travas', P('Travas', 'Ratchets')], ['ganchos', P('Ganchos', 'Hooks')],
    ['ferragens', P('Ferragens', 'Hardware')], ['elevacao', P('Elevação', 'Lifting')], ['redes', P('Redes', 'Nets')]];
  const PRODUTOS = {
    'KD-1001': [1200, 1150, 900, 1200, 1250, 1250, 1300], 'KD-1002': [5400, 5400, 4600, 5400, 5500, 5500, 5600], 'KD-1105': [300, 280, 220, 300, 320, 320, 340],
    'KD-1210': [140, 120, 90, 140, 150, 150, 160], 'KD-1320': [420, 400, 300, 420, 440, 440, 460], 'KD-1330': [380, 350, 260, 380, 400, 400, 420], 'KD-1450': [20, 15, 15, 20, 20, 25, 25],
    'AV-2001': [25, 25, 20, 25, 25, 25, 30], 'AV-2002': [600, 600, 600, 600, 600, 600, 600], 'EL-3001': [32, 30, 22, 32, 32, 36, 36], 'RD-4001': [60, 55, 40, 60, 65, 65, 70], 'FE-5002': [12, 12, 12, 12, 12, 12, 12],
  };
  const SEM_ESTRUTURA = [['KD-1600', P('Kit compacto 1 t, 2 m, com trava e gancho', '1 t compact kit, 2 m, with ratchet and hook')]];
  /* [código, descrição, família, tipo, unidade, estoque, fator, fornecedor, prazo do fornecedor em dias, consumo médio, estrutura, base = média] */
  const ITENS = [
    ['PI-410', P('Kit de fixação 5 t, 9 m, importado pronto', '5 t fastening kit, 9 m, imported ready'), 'kits', 'pronto', 'UN', 2700, 0, 'Fornecedor Alfa', 107, 1180, [['KD-1001', 1]]],
    ['PI-420', P('Kit de fixação 2 t, 6 m, importado pronto', '2 t fastening kit, 6 m, imported ready'), 'kits', 'pronto', 'UN', 26400, 0.1, 'Fornecedor Alfa', 107, 5300, [['KD-1002', 1]]],
    ['PI-610', P('Talha manual 1 t', '1 t manual hoist'), 'elevacao', 'pronto', 'UN', 125, 0, 'Fornecedor Delta', 106, 28, [['EL-3001', 1]]],
    ['PI-710', P('Rede de carga 3 x 3 m', '3 x 3 m cargo net'), 'redes', 'pronto', 'UN', 420, 1, 'Fornecedor Gama', 108, 58, [['RD-4001', 1]]],
    ['CM-110', P('Fita técnica 50 mm', '50 mm technical webbing'), 'fitas', 'componente', 'M', 20000, 1, 'Fornecedor Beta', 117, 9400, [['KD-1105', 1], ['KD-1210', 9.3], ['KD-1320', 6.2], ['KD-1330', 6.4], ['KD-1450', 20.3], ['AV-2002', 1]], true],
    ['CM-210', P('Trava de aço 50 mm', '50 mm steel ratchet'), 'travas', 'componente', 'UN', 3600, 1.5, 'Fornecedor Gama', 108, 820, [['KD-1105', 1], ['KD-1210', 1], ['KD-1330', 1], ['KD-1450', 1], ['AV-2001', 1]]],
    ['CM-310', P('Gancho forjado 3 t', '3 t forged hook'), 'ganchos', 'componente', 'UN', 4300, 1, 'Fornecedor Beta', 117, 1150, [['KD-1320', 1], ['KD-1330', 2]]],
    ['CM-320', P('Gancho forjado 5 t', '5 t forged hook'), 'ganchos', 'componente', 'UN', 1500, 1, 'Fornecedor Beta', 117, 130, [['KD-1210', 1], ['KD-1450', 2]]],
    ['CM-410', P('Elo de conexão 2 t', '2 t connecting link'), 'ferragens', 'componente', 'UN', 210, 0.2, 'Fornecedor Épsilon', 127, 30, [['FE-5002', 2]]],
  ];
  /* ordens de compra: [número, item, saldo, situação, índice do mês de chegada na janela (null = sem processo vinculado)] */
  const OCS = [[5140, 'PI-410', 2500, 'Aprovada', 2], [5172, 'PI-410', 1200, 'Pendente', 4], [5140, 'PI-420', 6000, 'Aprovada', 2], [5172, 'PI-420', 6000, 'Pendente', 4], [5175, 'PI-710', 200, 'Aprovada', 4],
    [5122, 'CM-110', 10000, 'Aprovada', 1], [5161, 'CM-110', 12000, 'Pendente', 3], [4870, 'CM-110', 8000, 'Aprovada', null], [5130, 'CM-210', 900, 'Aprovada', 1], [5175, 'CM-210', 1200, 'Aprovada', 4], [5148, 'CM-310', 2500, 'Aprovada', 2]];
  let db = null;   // estado no escopo do módulo: sobrevive à troca de idioma
  function semear() {
    const hoje = soData(new Date());
    const meses = Array.from({ length: 7 }, (_, i) => { const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1); return chave(d.getFullYear(), d.getMonth() + 1); });
    const itens = ITENS.map(([cod, desc, fam, tipo, un, estoque, fator, forn, prazo, consumo, pais, media]) => ({ cod, desc, fam, tipo, un, estoque, fator, forn, prazo, consumo, pais, fonte: media ? 'media' : 'explosao',
      ocs: OCS.filter(o => o[1] === cod).map(([num, , saldo, sit, mi]) => ({ num, saldo, sit, mes: mi == null ? null : meses[mi] })) }));
    return { hoje, meses, itens, sugestoes: 0 };
  }
  /* a mesma conta do sistema: saldo, OC que chega no mês, segurança = necessidade x fator, compra no primeiro mês com falta */
  const explodir = it => db.meses.map((_, i) => r2(soma(it.pais.map(([c, q]) => PRODUTOS[c][i] * q))));
  function calcular(it) {
    const nec = it.fonte === 'media' ? db.meses.map(() => it.consumo) : explodir(it);
    let ant = it.estoque;
    return db.meses.map((mes, i) => {
      const oc = soma(it.ocs.filter(o => o.mes === mes).map(o => o.saldo));
      const saldo = r2(ant - nec[i]), saldoFinal = r2(saldo + oc), seg = r2(nec[i] * it.fator), prog = seg > saldoFinal;
      ant = saldoFinal;
      return { mes, nec: nec[i], saldo, oc, saldoFinal, seg, prog, abrir: prog ? Math.ceil(seg - saldoFinal) : 0 };
    });
  }
  const limite = (it, mes) => { const d = dia1(mes); d.setDate(d.getDate() - it.prazo); return d; };
  const calcularFila = () => db.itens.flatMap(it => { const falta = calcular(it).find(l => l.prog); if (!falta) return []; const lim = limite(it, falta.mes); return [{ item: it, falta, lim, dias: diasAte(lim, db.hoje) }]; }).sort((a, b) => a.lim - b.lim);

  Hub.registrar({
    id: 'planejamento_importados',
    ordem: 16,
    grupo: P('Comercial', 'Sales'),
    icone: 'caixa',
    nome: P('Planejamento de importados', 'Import planning'),
    resumo: P(
      'Diz o que comprar de importados, quanto e até quando: programação por produto vendido, explosão da estrutura para os componentes, estoque de segurança e o prazo de cada fornecedor.',
      'Tells what to buy from abroad, how much and by when: a schedule per product sold, structure explosion for the components, safety stock and each supplier lead time.'
    ),
    manual: {
      pt: {
        destaque: 'O Planejamento de importados leva para o hub a planilha em que o Comercial decide a compra dos itens importados: a programação de venda entra uma vez, por produto vendido, e o sistema calcula para cada item comprado em que mês falta, quanto comprar e até quando colocar a ordem de compra.',
        oque: 'O problema. A compra de importados era decidida numa planilha com uma aba por família, com a programação de venda copiada à mão para cada item e a conta de saldo refeita todo mês. Componentes que entram em muitos produtos exigiam abrir a estrutura de cada produto no ERP e somar peça por peça.\n\nO que o sistema faz. O produto pronto chega importado e a necessidade é a programação do código de venda, um para um. O componente entra em vários produtos montados na fábrica e a necessidade é a explosão da estrutura, ao lado da média de consumo real. A conta do mês mostra saldo, ordens que chegam e estoque de segurança; no primeiro mês com falta, o item entra na fila de compras com a quantidade e a data limite de colocar a ordem, pelo prazo do fornecedor. Há ainda a programação versionada por ciclo, os processos de importação, o acerto da programação com análise da IA, as configurações e uma aba de ajuda. O ERP é só lido.\n\nNesta demonstração pública, o Painel funciona com dados fictícios; as outras telas ficam fora da demonstração.',
        finalidade: 'Tirar a decisão de compra de importados da planilha: uma programação só, uma regra de cálculo só e uma fila que diz o que comprar, quanto e até quando.\n\nSituação: em implantação.\n\nProjetado e construído por Ruan Siqueira.',
        alcance: [
          'Dois tipos de item: produto pronto (um para um) e componente (explosão da estrutura)',
          'Programação por produto vendido, com ciclo mensal e versões',
          'Conta do mês com saldo, ordens que chegam, estoque de segurança e compra no primeiro mês com falta',
          'Fila de compras pela data limite de colocar a ordem, pelo prazo de cada fornecedor',
          'Processos de importação, acerto da programação e análise da IA que sugere e não altera',
          'ERP somente leitura e histórico de toda alteração',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript'],
      },
      en: {
        destaque: 'Import planning brings into the hub the spreadsheet where Sales decides the purchase of imported items: the sales schedule is entered once, per product sold, and the system works out for each purchased item the month it runs short, how much to buy and by when to place the purchase order.',
        oque: 'The problem. Import purchases were decided in a spreadsheet with one tab per family, with the sales schedule copied by hand to each item and the balance recalculated every month. Components that go into many products required opening each product structure in the ERP and adding piece by piece.\n\nWhat the system does. A ready product arrives imported and its requirement is the sales code schedule, one to one. A component goes into several products assembled at the plant and its requirement is the structure explosion, next to actual average consumption. The month calculation shows balance, arriving orders and safety stock; in the first short month, the item enters the purchase queue with the quantity and the deadline to place the order, from the supplier lead time. There is also a schedule versioned by cycle, import processes, schedule accuracy with an AI analysis, settings and a help tab. The ERP is only read.\n\nIn this public demo, the Dashboard works on fictitious data; the other screens are outside the demo.',
        finalidade: 'Take the import purchase decision out of the spreadsheet: one schedule, one calculation rule and a queue that says what to buy, how much and by when.\n\nStatus: being deployed.\n\nDesigned and built by Ruan Siqueira.',
        alcance: [
          'Two kinds of item: ready product (one to one) and component (structure explosion)',
          'Schedule per product sold, with a monthly cycle and versions',
          'Month calculation with balance, arriving orders, safety stock and purchase in the first short month',
          'Purchase queue by the deadline to place the order, from each supplier lead time',
          'Import processes, schedule accuracy and an AI analysis that suggests and does not change',
          'Read-only ERP and a history of every change',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript'],
      },
    },
    /* mini tour: só ganchos do módulo (.pimp, classes próprias, data-aba-id), nada que dependa do idioma; termina no cartão fora da demonstração */
    tour: [
      { alvo: '.pimp [data-aba-id="painel"]', acao: 'clicar', titulo: P('O que comprar, quanto e até quando', 'What to buy, how much and by when'),
        texto: P('A compra de importados saiu da planilha. O Painel abre o dia com o que precisa de ação.', 'Import purchasing left the spreadsheet. The Dashboard opens the day with what needs action.') },
      { alvo: '.pimp .kpis-painel', titulo: P('Quatro números', 'Four numbers'),
        texto: P('Itens em dia, a programar, data limite vencida e consumo acima do previsto.', 'Items on track, to schedule, overdue deadlines and consumption above forecast.') },
      { alvo: '.pimp .fila-painel', titulo: P('A fila de compras', 'The purchase queue'),
        texto: P('Um item por linha, no primeiro mês com falta: quanto comprar e até quando colocar a OC, pelo prazo do fornecedor. "Ver item" abre o mês a mês.', 'One item per row, in the first short month: how much to buy and by when to place the PO, from the supplier lead time. "View item" opens the month by month.') },
      { alvo: '.pimp [data-aba-id="programacao"]', acao: 'clicar', titulo: P('A programação entra uma vez', 'The schedule is entered once'),
        texto: P('Por produto vendido, mês a mês, com ciclo e versões; para os componentes, o sistema explode a estrutura.', 'Per product sold, month by month, with cycle and versions; for components, the system explodes the structure.') },
      { alvo: '.pimp .ph-fora', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('A demonstração pública mostra o Painel. Quer ver o sistema inteiro funcionando? É só me chamar por aqui.', 'The public demo shows the Dashboard. Want to see the whole system running? Just reach me from here.') },
    ],

    montar(el, api) {
      if (!db) db = semear();
      injetarCss();
      const { t, h, ui, fmt } = api;
      const E = api.estado, L = api.lang;
      const tx = (pt, en) => (L === 'en' ? en : pt);
      const filhos = (...f) => f.flat(Infinity).filter(x => x != null && x !== false && x !== '');
      const ic = (nome, tam = 14) => h('span', { class: 'x-ic', 'aria-hidden': 'true', style: 'width:' + tam + 'px;height:' + tam + 'px', html: '<svg viewBox="0 0 24 24" focusable="false">' + (IC[nome] || IC.info) + '</svg>' });
      const e = (tag, cls, ...k) => h(tag, cls ? { class: cls } : null, ...k);
      const TAB = ui.tabela({ colunas: [], busca: false }).querySelector('table').className;
      const nq = v => fmt.num(v || 0, Number.isInteger(r2(v || 0)) ? 0 : 1);
      const qtd = (v, un) => nq(v) + ' ' + (un === 'M' ? 'm' : tx('un', 'pcs'));
      const mesTx = k => { const [a, m] = k.split('-'); return MM[L][Number(m) - 1] + '/' + a.slice(2); };
      const diasTx = n => n + (L === 'en' ? (n === 1 ? ' day' : ' days') : (n === 1 ? ' dia' : ' dias'));
      const famTx = f => t((FAMILIAS.find(x => x[0] === f) || [f, f])[1]);
      const itemDe = cod => db.itens.find(i => i.cod === cod);
      const btn = (texto, aoClicar, o = {}) => {
        const b = ui.botao({ texto, aoClicar, icone: o.ic && IC[o.ic], tom: o.tom || 'secundario', tamanho: o.g ? null : 'p' });
        if (o.foco) b.setAttribute('data-f', o.foco);
        if (o.aria) b.setAttribute('aria-label', t(o.aria));
        return b;
      };
      const tom = (b, cor) => { b.style.setProperty('--tom', cor); return b; };
      const badgeTipo = tp => (tp === 'pronto' ? ui.badge(P('Produto pronto', 'Ready product'), 'info') : tom(ui.badge(P('Componente', 'Component'), 'neutro'), 'var(--ph-cor-violeta)'));
      const badgeLimite = d => { const n = diasAte(d, db.hoje); return ui.badge(fmt.data(d) + ' · ' + (n < 0 ? tx('vencida há ', 'overdue by ') + diasTx(-n) : n === 0 ? tx('hoje', 'today') : tx('em ', 'in ') + diasTx(n)), n < 0 ? 'erro' : n <= 15 ? 'alerta' : 'ok'); };
      const tab = (rotulo, cab, linhas) => h('div', { class: 'ph-tabela-wrap', tabindex: '0', role: 'region', 'aria-label': rotulo, style: { '--ph-tabela-max': '50vh' } },
        h('table', { class: TAB }, h('caption', { class: 'vh' }, rotulo),
          h('thead', null, h('tr', null, cab.map(c => (Array.isArray(c) ? h('th', { scope: 'col', class: 'is-num' }, h('span', null, c[0])) : h('th', { scope: 'col' }, h('span', null, c)))))),
          h('tbody', null, linhas)));
      const td = (x, cls) => h('td', cls ? { class: cls } : null, x);
      const tdn = (x, cls) => h('td', { class: 'is-num' + (cls ? ' ' + cls : '') }, x);
      const cartao = (titulo, icn, conteudo, o = {}) => ui.cartao({ titulo, icone: icn && IC[icn], acoes: o.acoes, classe: o.classe, conteudo: filhos(conteudo) });
      const verItem = cod => btn(P('Ver item', 'View item'), () => abrirItem(cod), { ic: 'seta', tom: 'fantasma', foco: 'ver-' + cod, aria: P('Abrir o item ' + cod, 'Open item ' + cod) });
      let raiz = null, abas = null;
      const irAba = id => { E.aba = id; if (abas) { abas.ir(id); const b = raiz.querySelector('[data-aba-id="' + id + '"]'); if (b) b.focus(); } };

      /* ---------- ficha do item: resumo da falta e mês a mês ---------- */
      function abrirItem(cod) {
        const it = itemDe(cod), c = calcular(it), falta = c.find(l => l.prog);
        const linha = (rot, f, cls) => h('tr', null, td(rot), c.map(l => { const v = f(l); return tdn(typeof v === 'number' ? nq(v) : v, filhos([cls && cls(l), l.prog && 'dest']).join(' ') || null); }));
        ui.painel({ titulo: it.cod + ' · ' + t(it.desc), acoes: ctl => [btn(P('Fechar', 'Close'), () => ctl.fechar(), { g: true })],
          conteudo: h('div', { class: 'pimp dlg' }, h('div', { class: 'ph-linha' }, badgeTipo(it.tipo), e('span', 'muted', famTx(it.fam) + ' · ' + it.forn)),
            falta ? ui.aviso([h('b', null, tx('Falta em ', 'Short in ') + mesTx(falta.mes)), ' · ', tx('comprar ', 'buy '), h('b', null, qtd(falta.abrir, it.un)), ' · ', tx('colocar OC até ', 'place PO by '), badgeLimite(limite(it, falta.mes))], 'alerta')
              : ui.aviso(P('Sem falta nos 7 meses da janela.', 'No shortage in the 7 months of the window.'), 'ok'),
            falta && h('div', { class: 'ph-linha' }, btn(tx('Abrir OC de ', 'Open PO for ') + qtd(falta.abrir, it.un), () => sugerir(it, falta), { tom: 'primario', ic: 'carrinho', foco: 'abrir-oc' })),
            cartao(P('Mês a mês', 'Month by month'), 'painel', [tab(P('Mês a mês', 'Month by month'), [P('Indicador', 'Indicator'), ...c.map(l => [mesTx(l.mes)])], [
              linha(it.tipo === 'pronto' ? P('Necessidade (1 para 1)', 'Requirement (1 to 1)') : it.fonte === 'media' ? P('Necessidade (média de consumo)', 'Requirement (average consumption)') : P('Necessidade (explosão)', 'Requirement (explosion)'), l => l.nec),
              linha(P('Saldo', 'Balance'), l => l.saldo, l => l.saldo < 0 && 'neg'), linha(P('OC do mês', 'Month PO'), l => (l.oc ? l.oc : '-')),
              linha(P('Saldo final', 'Closing balance'), l => l.saldoFinal, l => l.saldoFinal < 0 && 'neg'), linha(P('Estoque de segurança', 'Safety stock'), l => l.seg),
              linha(P('Situação', 'Status'), l => (l.prog ? ui.badge(P('Programar', 'Schedule'), 'alerta') : ui.badge('OK', 'ok'))), linha(P('Abrir OC', 'Open PO'), l => (l.abrir ? l.abrir : '-'))])]),
            e('p', 'nota', P('A versão completa traz também os produtos que usam o item, as ordens de compra e o acerto.', 'The full version also shows the products that use the item, the purchase orders and the accuracy.'))) });
      }
      function sugerir(it, falta) {
        ui.backend({ titulo: P('Registrar a sugestão de OC', 'Record the PO suggestion'), subtitulo: it.cod + ' · ' + qtd(falta.abrir, it.un), escrita: 'create',
          passos: [S('api', P('Recebe a sugestão', 'Receives the suggestion'), 30), S('regra', P('Confere o acesso pelo departamento', 'Checks access through the department'), 20),
            S('sql', P('Grava o histórico', 'Writes the history'), 30), S('regra', P('Não escreve no ERP', 'Does not write to the ERP'), 5)],
          resumo: P('Sugestão registrada. A OC é aberta no ERP pelo Comercial.', 'Suggestion recorded. The PO is opened in the ERP by Sales.'),
          aoConcluir: () => { db.sugestoes++; ui.toast(P('Sugestão registrada. A OC é aberta no ERP pelo Comercial.', 'Suggestion recorded. The PO is opened in the ERP by Sales.')); } });
      }
      const rastroPainel = () => ui.backend({ titulo: P('Montar o planejamento', 'Build the plan'),
        passos: [S('api', P('Recebe o pedido', 'Receives the request'), 30), S('regra', P('Confere o acesso pelo departamento', 'Checks access through the department'), 20),
          S('sql', P('Lê itens, programação, ciclos e processos do hub', 'Reads items, schedule, cycles and processes from the hub'), 60), S('sql', P('Lê o retrato do ERP gravado pela rotina de leitura', 'Reads the ERP snapshot written by the reading job'), 45),
          S('regra', P('Monta cada item com a conta do mês', 'Builds each item with the month calculation'), 35), S('api', P('Devolve os dados da tela', 'Returns the screen data'), 15)],
        resumo: P('A fila, os alertas e as situações saem da mesma regra.', 'The queue, alerts and statuses come from the same rule.') });

      /* ---------- Painel: a tela principal ---------- */
      function telaPainel(p) {
        const fila = calcularFila(), venc = fila.filter(l => l.dias < 0).length;
        const acima = db.itens.filter(i => { const x = explodir(i)[0]; return x > 0 && i.consumo / x - 1 > 0.2; });
        const k = ui.kpis([
          { rotulo: P('Itens em dia', 'Items on track'), valor: db.itens.length - fila.length, tom: 'ok', detalhe: tx('de ', 'of ') + db.itens.length + tx(' itens acompanhados', ' items tracked') },
          { rotulo: P('Itens a programar', 'Items to schedule'), valor: fila.length, tom: 'alerta', detalhe: fila.length ? tx('Primeira falta em ', 'First shortage in ') + mesTx(fila.map(l => l.falta.mes).sort()[0]) : P('Nenhuma falta na janela', 'No shortage in the window') },
          { rotulo: P('Data limite vencida', 'Overdue deadline'), valor: venc, tom: 'erro', detalhe: venc ? P('OC ainda não colocada', 'PO not placed yet') : P('Nenhuma OC em atraso', 'No PO overdue') },
          { rotulo: P('Consumo acima do previsto', 'Consumption above forecast'), valor: acima.length, detalhe: P('Média real mais de 20% acima da explosão', 'Actual average over 20% above the explosion') }]);
        k.classList.add('kpis-painel');
        tom(k.children[3], 'var(--ph-cor-violeta)');
        const porForn = new Map();
        fila.forEach(l => { const f = porForn.get(l.item.forn) || { n: 0, UN: 0, M: 0 }; f.n++; f[l.item.un] += l.falta.abrir; porForn.set(l.item.forn, f); });
        const filaCard = cartao(P('Fila de compras', 'Purchase queue'), 'carrinho', [e('p', 'nota', P('Ordenada pela data limite de colocar a OC.', 'Sorted by the deadline to place the PO.')),
          tab(P('Fila de compras', 'Purchase queue'), [P('Item', 'Item'), P('Mês da falta', 'Short in'), [P('Comprar', 'Buy')], P('Fornecedor', 'Supplier'), P('Colocar OC até', 'Place PO by'), h('span', { class: 'vh' }, P('Ação', 'Action'))],
            fila.map(l => h('tr', null, td(h('div', { class: 'cel' }, e('span', 'cod', l.item.cod), e('small', null, l.item.desc), badgeTipo(l.item.tipo))), td(mesTx(l.falta.mes)), tdn(qtd(l.falta.abrir, l.item.un)), td(l.item.forn), td(badgeLimite(l.lim)), td(verItem(l.item.cod))))),
          h('div', { class: 'grupo-forn' }, e('span', 'nota', P('Por fornecedor:', 'By supplier:')),
            [...porForn].map(([f, x]) => h('span', { class: 'chip' }, h('b', null, f), ' ' + x.n + ' ' + tx(x.n === 1 ? 'item' : 'itens', x.n === 1 ? 'item' : 'items') + (x.UN ? ' · ' + qtd(x.UN, 'UN') : '') + (x.M ? ' · ' + qtd(x.M, 'M') : ''))))], { classe: 'fila-painel' });
        const alerta = (icn, tm, titulo, texto, acao) => h('li', { class: 'ph-lista-item tom-' + tm }, h('div', { class: 'al' }, ic(icn, 16), h('div', null, h('b', null, titulo), h('small', null, texto)), acao));
        const grupos = sit => { const m = new Map(); db.itens.forEach(i => i.ocs.forEach(o => { if (sit(o)) { const g = m.get(o.num) || { o, itens: [] }; g.itens.push(i); m.set(o.num, g); } })); return [...m.values()]; };
        const lista = [
          ...grupos(o => !o.mes).map(({ o, itens }) => alerta('alerta', 'erro', tx('OC ' + o.num + ' sem mês de chegada', 'PO ' + o.num + ' with no arrival month'),
            itens.map(i => i.cod).join(' · ') + tx('. Fora da conta até ser vinculada a um processo de importação.', '. Out of the calculation until linked to an import process.'), verItem(itens[0].cod))),
          ...grupos(o => o.sit === 'Pendente').map(({ o, itens }) => alerta('relogio', 'alerta', tx('OC ' + o.num + ' aguardando aprovação no ERP', 'PO ' + o.num + ' awaiting approval in the ERP'),
            itens.map(i => i.cod).join(' · ') + tx(' · chegada prevista em ', ' · expected arrival in ') + mesTx(o.mes) + tx('. Já entra na conta; se não for aprovada, o saldo cai.', '. It already counts; if it is not approved, the balance drops.'), verItem(itens[0].cod))),
          ...acima.map(i => tom(alerta('sobe', 'info', i.cod + tx(' · consumo real acima da explosão', ' · actual consumption above the explosion'),
            tx('Média de ', 'Average of ') + qtd(i.consumo, i.un) + tx(' contra explosão de ', ' against an explosion of ') + qtd(explodir(i)[0], i.un) + tx('. Revise a programação ou a estrutura do produto.', '. Review the schedule or the product structure.'), verItem(i.cod)), 'var(--ph-cor-violeta)')),
          ...SEM_ESTRUTURA.map(([cod, desc]) => alerta('camadas', 'alerta', cod + tx(' sem estrutura no ERP', ' with no structure in the ERP'),
            t(desc) + tx('. A programação não gera necessidade de componente. Peça o cadastro da estrutura à Engenharia.', '. The schedule creates no component requirement. Ask Engineering to register the structure.'),
            btn(P('Ver programação', 'View schedule'), () => irAba('programacao'), { foco: 'al-est' }))),
        ];
        const fams = FAMILIAS.map(([f]) => { const n = db.itens.filter(i => i.fam === f).length, prog = fila.filter(l => l.item.fam === f); return { f, n, prog: prog.length, prox: prog.map(l => l.falta.mes).sort()[0] }; }).filter(x => x.n);
        const porMes = db.meses.map((m, i) => ({ rotulo: mesTx(m), valor: db.itens.filter(it => calcular(it)[i].prog).length, tom: i === 0 ? 'alerta' : 'info' }));
        p.append(h('div', { class: 'tela' },
          h('div', { class: 'head' }, h('div', null, h('p', { class: 'eyebrow' }, ic('painel', 13), P('Comercial · importados', 'Sales · imports')), h('h2', { class: 't1 ph-h1' }, P('Painel', 'Dashboard')),
            e('p', 'sub', P('O que precisa de ação hoje: o que falta, quanto comprar e até quando colocar a OC.', 'What needs action today: what is short, how much to buy and by when to place the PO.')))),
          k, filaCard,
          h('div', { class: 'ph-grade-2' },
            cartao(P('Alertas', 'Alerts'), 'alerta', h('ul', { class: 'lista' }, lista), { acoes: ui.badge(String(lista.length), 'erro'), classe: 'alertas' }),
            cartao(P('Situação por família', 'Status by family'), 'camadas', tab(P('Situação por família', 'Status by family'), [P('Família', 'Family'), [P('Itens', 'Items')], [P('OK', 'OK')], [P('Programar', 'Schedule')], P('Primeira falta', 'First shortage')],
              fams.map(x => h('tr', null, td(famTx(x.f)), tdn(x.n), tdn(x.n - x.prog), tdn(x.prog, x.prog ? 'neg' : null), td(x.prox ? ui.badge(mesTx(x.prox), 'alerta') : '-')))))),
          cartao(P('Meses', 'Months'), 'painel', [e('p', 'nota', P('Itens com situação Programar em cada mês da janela; o mês atual em destaque.', 'Items with status Schedule in each month of the window; the current month highlighted.')), ui.barras({ dados: porMes, formato: v => fmt.num(v) })]),
          h('div', { class: 'x-aids' }, e('span', 'x-leg', P('Recurso da demonstração:', 'Demo aid:')),
            h('button', { type: 'button', class: 'x-erp', 'data-f': 'rastro', title: P('Recurso da demonstração: mostra, passo a passo, o que o servidor faz', 'Demo aid: shows, step by step, what the server does'), onclick: rastroPainel }, ic('servidor', 11), P('O que o servidor faz ao abrir', 'What the server does on open')))));
      }

      /* ---------- as sete telas nas abas do kit; só o Painel é navegável ---------- */
      const TELAS = [['painel', P('Painel', 'Dashboard'), 'painel'], ['itens', P('Itens', 'Items'), 'pacote'], ['programacao', P('Programação', 'Schedule'), 'prancheta'],
        ['importacao', P('Importação', 'Imports'), 'ship'], ['acerto', P('Acerto', 'Accuracy'), 'alvo'], ['config', P('Configurações', 'Settings'), 'gear'], ['ajuda', P('Ajuda', 'Help'), 'ajuda']];
      const contexto = () => h('div', { class: 'ctxbar' },
        e('span', 'ciclo', tx('Ciclo de ', 'Cycle of ') + mesTx(db.meses[0]) + ' · ' + mesTx(db.meses[1]) + tx(' validado · versão 2', ' validated · version 2')),
        h('span', { class: 'quem' }, h('b', null, P('Visitante (demonstração)', 'Visitor (demo)')), h('small', null, P('Membro do Comercial', 'Sales member'))));
      raiz = h('div', { class: 'pimp x-shell' });
      el.append(raiz);
      const fila0 = calcularFila();
      abas = ui.abas({ rotulo: P('Telas do Planejamento de importados', 'Import planning screens'), chave: 'aba',
        abas: TELAS.map(([id, rotulo, icn]) => ({ id, rotulo, icone: IC[icn], contador: id === 'itens' ? fila0.length : id === 'importacao' ? fila0.filter(l => l.dias < 0).length : 0,
          montar: painel => { painel.append(contexto()); if (id === 'painel') telaPainel(painel); else painel.append(ui.foraDaDemo({ titulo: rotulo })); } })) }, E);
      abas.querySelector('.ph-abas-lista').classList.add('pimp-nav');
      raiz.append(abas);
    },
  });
})();
