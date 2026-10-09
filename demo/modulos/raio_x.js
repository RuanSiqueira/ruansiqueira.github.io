/* Raio-X do cliente · versão pública curta do módulo de demonstração (id raio_x).
   Busca por CNPJ ou CPF e mural de dez adesivos com o resumo do cliente pronto para a ligação. O sistema tem uma tela só, toda navegável,
   sobre cinco clientes fictícios com resultados prontos (score, insights, próxima ação, resumo e script). Visual do kit do hub,
   nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });

  const PERFIL = {
    fiel: [P('Fiel', 'Loyal'), 'ok'], risco: [P('Em risco', 'At risk'), 'alerta'], inadimplente: [P('Inadimplente', 'Delinquent'), 'erro'],
    sazonal: [P('Sazonal', 'Seasonal'), 'neutro'], inativo: [P('Inativo', 'Inactive'), 'neutro'],
  };
  const SCORE_ROT = {
    otima: [P('Ótima oportunidade!', 'Great opportunity!'), 'ok'], boa: [P('Boa oportunidade', 'Good opportunity'), 'info'],
    moderada: [P('Oportunidade moderada', 'Moderate opportunity'), 'alerta'], atencao: [P('Requer atenção', 'Needs attention'), 'erro'],
  };
  const PROD = {
    kit: ['KR-1010', P('Kit padrão A', 'Standard kit A')], desg: ['PD-3075', P('Peça de desgaste', 'Wear part')],
    fix: ['CF-2040', P('Fixador reforçado B', 'Reinforced fastener B')], seg: ['AS-4120', P('Acessório de segurança', 'Safety accessory')],
    ins: ['IM-6408', P('Insumo de manutenção', 'Maintenance supply')],
  };
  const CENARIO_EXTERNO = [
    P('Demanda do setor tende a se manter estável', 'Sector demand tends to stay stable'),
    P('Eficiência e continuidade de operação são prioridades', 'Efficiency and operational continuity are priorities'),
    P('Câmbio pressionando o custo das matérias-primas', 'Exchange rate pushing up raw material costs'),
    P('Reposição e padronização são estratégicas', 'Restocking and standardization are strategic'),
  ];
  const ORDEM_PADRAO = ['cliente', 'score', 'notas', 'financeiro', 'insights', 'proximaAcao', 'produtos', 'cenario', 'emDia', 'resumoIA'];
  const NAO_CADASTRADO = '99999999000199';
  const FIN_OK = P('Situação financeira em dia, sem restrições para novas vendas', 'Finances up to date, no restrictions on new sales');
  const RECORRENTE = P('Padrão de recompra recorrente identificado', 'Recurring repurchase pattern identified');
  const CONSISTENTE = P('Histórico de compras consistente', 'Consistent purchase history');
  const REGULARIZAR = P('Verificar situação financeira antes de oferecer novos produtos. Acionar responsável financeiro para regularização.',
    'Check the financial situation before offering new products. Bring in the person in charge of finance to settle it.');

  /* Clientes de exemplo com o resumo já pronto. dias = dias desde a última nota; notas: [dias atrás, valor]; lanc: títulos em aberto
     [vencimento em dias a partir de hoje, saldo]; prod: [produto, quantidade, total]. Nos textos, {nome}, {data} e {ticket} só recebem a formatação. */
  const CLIENTES = [
    { cod: '000101', doc: '11111111000111', nome: 'Cliente Alfa Comércio Ltda', cidade: 'Porto Exemplo/RS', perfil: 'fiel', vend: 'Carlos Lima', dias: 9, ativo: true,
      totalNotas: 12, total: 208150, ticket: 17345.83, score: 82, rotulo: 'otima', limiteOk: true, atraso: false,
      notas: [[9, 18412.36], [38, 17248.9], [69, 19095.12], [98, 16803.44], [130, 18897.6]], lanc: [],
      prod: [['kit', 604, 98400], ['desg', 314, 61300], ['ins', 496, 28800], ['fix', 396, 19650]],
      insights: [P('Recompra recente: momento ideal para ampliar o mix', 'Recent repurchase: the ideal moment to broaden the mix'), P('Produto principal: Kit padrão A', 'Main product: Standard kit A'), FIN_OK, RECORRENTE],
      acao: P('Ligar oferecendo reposição programada de kit padrão a. Verificar necessidade de complementar mix e padronizar pedido.', 'Call offering a scheduled restock of standard kit a. Check whether the mix needs complementing and standardize the order.'),
      resumo: P('Cliente ativo e comprando regularmente. Ticket médio {ticket}. Situação financeira em dia. Foco em reposição de Kit padrão A.', 'Customer active and buying regularly. Average order {ticket}. Finances up to date. Focus on restocking Standard kit A.'),
      script: P('Olá, aqui é da Empresa Demo. Tudo bem? Vi que a {nome} comprou conosco em {data} e que o item que mais gira é o kit padrão A. Queria entender a necessidade atual de reposição e se posso ajudar a completar o pedido. Pode ser?',
        'Hello, I am calling from Demo Company. How are you? I saw that {nome} last ordered from us on {data} and that the item that moves the most is standard kit A. I would like to understand your current restocking need and whether I can help complete the order. Would that work?') },
    { cod: '000103', doc: '33333333000133', nome: 'Cliente Gama Distribuidora Ltda', cidade: 'Serra Fictícia/SC', perfil: 'risco', vend: 'Carlos Lima', dias: 135, ativo: true,
      totalNotas: 6, total: 85700, ticket: 14283.33, score: 52, rotulo: 'moderada', limiteOk: true, atraso: false,
      notas: [[135, 12388.2], [178, 14806.75], [219, 15297.1], [262, 13912.4], [301, 15094.55]], lanc: [],
      prod: [['desg', 268, 52100], ['fix', 438, 21700], ['ins', 205, 11900]],
      insights: [P('Atenção: 135 dias sem comprar. Acionar agora', 'Heads up: 135 days without buying. Reach out now'), P('Produto principal: Peça de desgaste', 'Main product: Wear part'), FIN_OK, RECORRENTE],
      acao: P('Ligar oferecendo reposição programada de peça de desgaste. Verificar necessidade de complementar mix e padronizar pedido.', 'Call offering a scheduled restock of wear part. Check whether the mix needs complementing and standardize the order.'),
      resumo: P('Cliente ativo com oportunidade de recompra. Ticket médio {ticket}. Situação financeira em dia. Foco em reposição de Peça de desgaste.', 'Customer active with a repurchase opportunity. Average order {ticket}. Finances up to date. Focus on restocking Wear part.'),
      script: P('Olá, aqui é da Empresa Demo. Tudo bem? Faz um tempo desde o último pedido da {nome}, em {data}, e queria saber como está o estoque de peça de desgaste. Posso preparar uma proposta de reposição?',
        'Hello, I am calling from Demo Company. How are you? It has been a while since the last order from {nome}, on {data}, and I wanted to check how your stock of wear parts is doing. Can I put together a restocking proposal?') },
    { cod: '000104', doc: '44444444000144', nome: 'Cliente Delta Serviços Ltda', cidade: 'Vale Demonstração/SP', perfil: 'inadimplente', vend: 'Marcos Teixeira', dias: 75, ativo: true,
      totalNotas: 5, total: 53000, ticket: 10600, score: 41, rotulo: 'moderada', limiteOk: false, atraso: true,
      notas: [[75, 9812.3], [121, 11196.84], [166, 10405.12], [214, 12087.66], [259, 9498.08]], lanc: [[-45, 3270.77], [-15, 3270.77], [15, 3270.76]],
      prod: [['seg', 257, 24700], ['kit', 106, 17200], ['ins', 191, 11100]],
      insights: [P('Última compra há 75 dias, dentro do ciclo normal', 'Last purchase 75 days ago, within the normal cycle'), P('Produto principal: Acessório de segurança', 'Main product: Safety accessory'), P('2 títulos em atraso: verificar antes de oferecer', '2 overdue receivables: check before offering'), RECORRENTE],
      acao: REGULARIZAR,
      resumo: P('Cliente ativo e comprando regularmente. Ticket médio {ticket}. Atenção para 2 títulos em atraso. Foco em reposição de Acessório de segurança.', 'Customer active and buying regularly. Average order {ticket}. Mind the 2 overdue receivables. Focus on restocking Safety accessory.'),
      script: P('Olá, aqui é da Empresa Demo. Tudo bem? Estava olhando o histórico da {nome}, a última compra foi em {data}. Antes de falarmos de reposição, queria alinhar com você os títulos em aberto. Podemos ver isso juntos?',
        'Hello, I am calling from Demo Company. How are you? I was looking at the history of {nome}, the last order was on {data}. Before we talk about restocking, I would like to go over the open receivables with you. Can we look at that together?') },
    { cod: '000106', doc: '66666666000166', nome: 'Cliente Zeta Logística Ltda', cidade: 'Barra Exemplo/BA', perfil: 'inativo', vend: 'Marcos Teixeira', dias: 240, ativo: false,
      totalNotas: 4, total: 32000, ticket: 8000, score: 28, rotulo: 'atencao', limiteOk: true, atraso: false,
      notas: [[240, 7604.5], [292, 8093.2], [351, 7911.8], [410, 8390.5]], lanc: [],
      prod: [['seg', 206, 19800], ['ins', 143, 8300], ['kit', 24, 3900]],
      insights: [P('Cliente inativo há 240 dias. Reativar com urgência', 'Customer inactive for 240 days. Win back urgently'), P('Produto principal: Acessório de segurança', 'Main product: Safety accessory'), FIN_OK, CONSISTENTE],
      acao: P('Reativar cliente: ligar perguntando sobre necessidade de reposição de acessório de segurança. Oferecer condição especial de reativação.', 'Win the customer back: call asking whether they need to restock safety accessory. Offer a special reactivation deal.'),
      resumo: P('Cliente inativo, necessita reativação. Ticket médio {ticket}. Situação financeira em dia. Foco em reposição de Acessório de segurança.', 'Customer inactive, needs to be won back. Average order {ticket}. Finances up to date. Focus on restocking Safety accessory.'),
      script: P('Olá, aqui é da Empresa Demo. Tudo bem? Faz alguns meses desde o último pedido da {nome}, em {data}. Preparamos uma condição especial para a volta, começando pelo acessório de segurança que vocês mais compravam. Posso te contar?',
        'Hello, I am calling from Demo Company. How are you? It has been a few months since the last order from {nome}, on {data}. We have a special deal for your return, starting with the safety accessory you used to buy the most. Can I tell you about it?') },
    { cod: '000112', doc: '11122233300', nome: 'Produtor Sigma (pessoa física)', cidade: 'Campo Demonstração/RS', perfil: 'sazonal', vend: 'Paula Ribeiro', dias: 95, ativo: true,
      totalNotas: 3, total: 13000, ticket: 4333.33, score: 33, rotulo: 'atencao', limiteOk: false, atraso: true,
      notas: [[95, 4806.1], [452, 4297.35], [831, 3896.55]], lanc: [[-50, 2403.05]],
      prod: [['kit', 37, 6100], ['ins', 79, 4700], ['seg', 22, 2200]],
      insights: [P('Última compra há 95 dias, dentro do ciclo normal', 'Last purchase 95 days ago, within the normal cycle'), P('Produto principal: Kit padrão A', 'Main product: Standard kit A'), P('1 título em atraso: verificar antes de oferecer', '1 overdue receivable: check before offering'), CONSISTENTE],
      acao: REGULARIZAR,
      resumo: P('Cliente ativo com oportunidade de recompra. Ticket médio {ticket}. Atenção para 1 título em atraso. Foco em reposição de Kit padrão A.', 'Customer active with a repurchase opportunity. Average order {ticket}. Mind the 1 overdue receivable. Focus on restocking Standard kit A.'),
      script: P('Olá, aqui é da Empresa Demo. Tudo bem? Estava olhando o seu histórico, a última compra foi em {data}. Antes da próxima safra, queria alinhar o título em aberto e ver a reposição do kit padrão A. Pode ser?',
        'Hello, I am calling from Demo Company. How are you? I was looking at your history, the last order was on {data}. Before the next season, I would like to sort out the open receivable and look at restocking standard kit A. Would that work?') },
  ];

  /* máscara do campo: até 11 dígitos é CPF, acima disso é CNPJ */
  function mascara(v) {
    const d = String(v).replace(/\D/g, '').slice(0, 14);
    if (d.length <= 11) {
      if (d.length <= 3) return d;
      if (d.length <= 6) return d.slice(0, 3) + '.' + d.slice(3);
      if (d.length <= 9) return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6);
      return d.slice(0, 3) + '.' + d.slice(3, 6) + '.' + d.slice(6, 9) + '-' + d.slice(9);
    }
    return d.slice(0, 2) + '.' + d.slice(2, 5) + '.' + d.slice(5, 8) + '/' + d.slice(8, 12) + '-' + d.slice(12);
  }

  Hub.registrar({
    id: 'raio_x',
    ordem: 8,
    grupo: P('Comercial', 'Sales'),
    icone: 'ia',
    nome: P('Raio-X do cliente', 'Customer X-ray'),
    resumo: P(
      'Digite o CNPJ ou o CPF e receba o resumo do cliente pronto para a ligação, em um mural de adesivos: score, notas, financeiro, produtos, insights, próxima ação e script.',
      'Type in a tax ID and get the customer summary ready for the call on a sticky-note board: score, invoices, finances, products, insights, next action and script.'
    ),
    manual: {
      pt: {
        destaque: 'O Raio-X do cliente é o resumo pronto para a ligação: o vendedor digita o CNPJ ou o CPF e recebe, em uma tela, o que precisa saber antes de pegar o telefone, com o script da abordagem a um clique. É uma tela do hub, a camada inteligente sobre o ERP.',
        oque: 'O que é. Uma tela do hub em que o vendedor digita o CNPJ ou o CPF do cliente e recebe um mural de dez adesivos: cliente em destaque, score de oportunidade de 0 a 100, últimas notas fiscais, financeiro, insights rápidos, próxima ação recomendada, produtos mais comprados, leitura de cenário externo, títulos em aberto e o resumo. O botão "Iniciar abordagem" abre o script da ligação, pronto para copiar. Os adesivos podem ser arrastados para trocar de lugar.\n\nO problema. Preparar uma ligação exigia abrir várias telas do ERP: notas, itens, títulos e cadastro. Sem tempo para juntar tudo, o vendedor ligava sem saber há quantos dias o cliente não comprava, qual item mais girava ou se havia título vencido a resolver antes de oferecer algo novo.\n\nRegras, não IA generativa. Os textos da tela saem de regras explicáveis: o resultado sai na hora, não tem custo por consulta e nenhum dado de cliente vai para um serviço externo de IA.\n\nNesta demonstração. A tela funciona com cinco clientes fictícios de perfis diferentes e resultados prontos. Um rastro resumido mostra as etapas da consulta e uma janela de ERP simulado mostra o cliente e os itens faturados.',
        finalidade: 'Para que serve. Fazer o vendedor chegar à conversa sabendo o que o cliente compra, há quanto tempo não compra e o que precisa ser resolvido antes de oferecer algo novo, em uma tela lida em um minuto.\n\nO que muda na rotina. A preparação da ligação deixa de ser uma busca em várias telas do ERP e passa a ser uma consulta pelo documento. O score ordena a prioridade, a próxima ação indica o caminho e o script dá a primeira fala.\n\nCuidados. A consulta é somente leitura: nada é gravado no ERP. O texto é apoio: o vendedor revisa e decide a abordagem.',
        alcance: [
          'Busca por CNPJ ou CPF com máscara automática',
          'Score de oportunidade de 0 a 100 com mostrador',
          'Últimas notas, financeiro, produtos mais comprados e títulos em aberto em um mural de dez adesivos reordenáveis',
          'Insights, próxima ação, resumo e script de ligação escritos por regras explicáveis, sem IA generativa',
          'Somente leitura: nenhuma gravação no ERP',
        ],
        tecnologias: ['Next.js / React', 'TypeScript', 'C# / .NET', 'SQL Server', 'API REST', 'Motor de regras'],
      },
      en: {
        destaque: 'Customer X-ray is the customer summary, ready for the call: the sales rep types in the tax ID and gets, on one screen, what they need to know before picking up the phone, with the call script one click away. It is a screen of the hub, the intelligent layer on top of the ERP.',
        oque: 'What it is. A hub screen where the sales rep types in the customer tax ID (company CNPJ or personal CPF) and gets a board of ten sticky notes: featured customer, an opportunity score from 0 to 100, latest invoices, finances, quick insights, recommended next action, top products, a reading of the external scenario, open receivables and the summary. The "Start outreach" button opens the call script, ready to copy. The notes can be dragged to swap places.\n\nThe problem. Preparing a call meant opening several ERP screens: invoices, items, receivables and the customer record. With no time to put it together, the rep called without knowing how many days it had been since the last order, which item moved the most or whether an overdue receivable had to be settled before offering anything new.\n\nRules, not generative AI. The texts on the screen come from explainable rules: the answer is immediate, has no cost per lookup and no customer data goes to an outside AI service.\n\nIn this demo. The screen runs on five made-up customers with different profiles and ready results. A short trace shows the stages of the lookup and a simulated ERP window shows the customer and the billed items.',
        finalidade: 'What it is for. Getting the sales rep into the conversation knowing what the customer buys, how long it has been since the last order and what has to be settled before offering anything new, on one screen that reads in a minute.\n\nWhat changes in the routine. Preparing a call stops being a hunt across several ERP screens and becomes a lookup by tax ID. The score sets the priority, the next action points the way and the script gives the opening line.\n\nSafeguards. The lookup is read-only: nothing is written to the ERP. The text is support: the rep reviews it and decides the approach.',
        alcance: [
          'Search by company or personal tax ID with an automatic mask',
          'Opportunity score from 0 to 100 with a gauge',
          'Latest invoices, finances, top products and open receivables on a board of ten sticky notes that can be reordered',
          'Insights, next action, summary and call script written by explainable rules, with no generative AI',
          'Read-only: nothing is written to the ERP',
        ],
        tecnologias: ['Next.js / React', 'TypeScript', 'C# / .NET', 'SQL Server', 'REST API', 'Rule engine'],
      },
    },
    /* mini tour: só ganchos do módulo (.ly-*), nada que dependa do idioma. O primeiro passo volta à busca se um mural estiver
       aberto (clica em Nova busca); na busca, o alvo é a própria área e o clique não muda nada. Sem aba fora da demonstração
       neste sistema: o último passo fica no centro, sem alvo (o core põe no balão o vídeo e o contato), e não abre o rastro. */
    tour: [
      { alvo: '.raiox-real .ly-nova, .raiox-real .ly-busca', acao: 'clicar', titulo: P('Um documento, um resumo', 'One tax ID, one summary'),
        texto: P('Antes de ligar, o vendedor digita o CNPJ ou o CPF do cliente e recebe numa tela só o que antes estava espalhado pelo ERP.',
          'Before calling, the sales rep types in the customer\'s tax ID and gets on one screen what used to be scattered across the ERP.') },
      { alvo: '.raiox-real .ly-busca .ly-linha', titulo: P('Digite e analise', 'Type and analyze'),
        texto: P('O campo coloca a máscara sozinho. Analisar consulta o ERP só para leitura: nada é gravado.',
          'The field applies the mask on its own. Analyze reads from the ERP only: nothing is written.') },
      { alvo: '.raiox-real .ly-demo', titulo: P('Clientes fictícios para testar', 'Fictitious customers to try'),
        texto: P('Na faixa da demonstração há cinco clientes de exemplo e um documento sem cadastro. Um clique preenche o campo e monta o resumo.',
          'The demo strip has five sample customers and one tax ID with no record. One click fills in the field and builds the summary.') },
      { titulo: P('Agora é com você', 'Now it is your turn'),
        texto: P('Escolha um cliente e veja o mural montar: score de 0 a 100, notas, financeiro, produtos, próxima ação e o script da ligação. Tem interesse na versão completa? O vídeo mostra o sistema inteiro, e é só me chamar.',
          'Pick a customer and watch the board come together: a 0 to 100 score, invoices, finances, products, next action and the call script. Interested in the full version? The video shows the whole system, and you can just reach me.') },
    ],

    montar(el, api) {
      const { t, h, ui, fmt } = api;
      const E = api.estado;
      injetarCss();
      let carregando = false;

      const cliente = dig => CLIENTES.find(c => c.doc === dig) || null;
      const dataDe = dias => api.data(-dias);
      const visitante = t(P('Visitante', 'Visitor'));
      const ic = (nome, classe) => api.icone(IC[nome] || nome, classe);
      const com = (no, classe) => { no.classList.add(classe); return no; };
      const e = (tag, classe, ...filhos) => h(tag, classe ? { class: classe } : null, ...filhos);
      const texto = (p, c) => t(p).replace('{nome}', c.nome.toUpperCase()).replace('{data}', fmt.data(dataDe(c.dias))).replace('{ticket}', fmt.moeda(c.ticket));

      /* ---------- rastro resumido da consulta ---------- */
      function abrirRastro(dig, foraDoAr, aoConcluir, aoFechar) {
        const c = foraDoAr ? null : cliente(dig), alvo = cliente(dig);
        const passo = (tipo, ms, titulo, estado) => ({ tipo, ms, titulo, estado });
        const envia = passo('api', 35, P('A tela envia o documento para o hub', 'The screen sends the tax ID to the hub'));
        return ui.backend({
          titulo: P('Buscar cliente e montar o resumo', 'Look up the customer and build the summary'),
          subtitulo: mascara(dig) + (alvo ? ' · ' + alvo.nome : ''),
          passos: c ? [
            envia,
            passo('erp', 1850, P('Lê o histórico de faturamento no ERP (somente leitura)', 'Reads the billing history from the ERP (read-only)')),
            passo('regra', 8, P('Calcula o score de oportunidade (0 a 100) a partir do histórico, da recência e do financeiro', 'Computes the opportunity score (0 to 100) from history, recency and finances')),
            passo('regra', 6, P('Monta insights e script por regras explicáveis (sem IA generativa)', 'Builds insights and script from explainable rules (no generative AI)')),
            passo('api', 20, P('Devolve o painel do cliente para a tela', 'Returns the customer panel to the screen')),
          ] : [
            envia,
            passo('erp', foraDoAr ? 3000 : 1200, foraDoAr ? P('O ERP não respondeu', 'The ERP did not answer') : P('Cliente não encontrado no ERP', 'Customer not found in the ERP'), 'erro'),
            passo('api', 15, P('Devolve a mensagem para a tela', 'Returns the message to the screen')),
          ],
          resumo: c
            ? P('Resumo montado em uma única consulta. Nada foi gravado no ERP: a consulta é somente leitura.', 'Summary built in a single lookup. Nothing was written to the ERP: the lookup is read-only.')
            : P('A busca parou e a tela mostra a mensagem.', 'The search stopped and the screen shows the message.'),
          aoConcluir, aoFechar,
        });
      }

      /* ---------- janela de ERP: o cliente e os itens faturados. lendo = logo depois da busca, os campos entram um a um ---------- */
      function abrirErp(c, lendo) {
        const C = (rotulo, valor, largura, destaque) => ({ rotulo, valor, largura, destaque });
        const NM = rotulo => ({ rotulo, tipo: 'numero' });
        const fisica = c.doc.length <= 11;
        ui.erp({
          programa: P('Cliente e itens faturados', 'Customer and billed items'), codigo: 'ERP-0310', largura: 960, colunas: 6, consulta: true, preencher: !!lendo, velocidade: 8,
          campos: [
            C(P('Código', 'Code'), c.cod), C(fisica ? P('Nome', 'Name') : P('Razão social', 'Legal name'), c.nome.toUpperCase(), 2), C(fisica ? 'CPF' : 'CNPJ', mascara(c.doc)),
            C(P('Município / UF', 'City / state'), c.cidade.replace('/', ' / ')), C(P('Vendedor', 'Sales rep'), c.vend), C(P('Última nota', 'Last invoice'), fmt.data(dataDe(c.dias))),
            C(P('Notas no histórico', 'Invoices on record'), String(c.totalNotas)), C(P('Ticket médio', 'Average order'), fmt.moeda(c.ticket)), C(P('Total faturado', 'Total billed'), fmt.moeda(c.total), 1, true),
          ],
          grade: { alturaMax: 220,
            colunas: [P('Referência', 'Reference'), P('Descrição', 'Description'), NM(P('Qtde total', 'Total qty')), NM(P('Valor total', 'Total amount'))],
            linhas: c.prod.map(([k, q, v]) => [PROD[k][0], t(PROD[k][1]), fmt.num(q), fmt.moeda(v)]),
            total: ['', P('Total faturado', 'Total billed'), '', fmt.moeda(c.total)] },
          narracao: [P('Localizando o cliente pelo documento...', 'Finding the customer by tax ID...'), P('Lendo o cadastro e os itens faturados...', 'Reading the record and the billed items...')],
          rodape: P('Consulta concluída. Somente leitura: nenhum dado foi alterado.', 'Inquiry finished. Read-only: no data was changed.'),
          acoes: [{ texto: lendo ? P('Ver o resumo', 'See the summary') : P('Fechar', 'Close'), tom: 'primario' }],
        });
      }

      /* ---------- estrutura fixa: faixa da demonstração e a tela. O caminho e o nome do sistema ficam na moldura da casca. ---------- */
      const raiz = h('div', { class: 'raiox-real ly-raiz' });
      el.append(raiz);
      pintar();

      /* foco = valor de data-f do controle que deve receber o foco depois de redesenhar */
      function pintar(foco) {
        const c = cliente(E.doc);
        raiz.replaceChildren(faixaDemo(c), c ? telaPainel(c) : telaBusca());
        if (foco) { const alvo = raiz.querySelector('[data-f="' + foco + '"]'); if (alvo) alvo.focus(); }
      }

      function buscar(dig) {
        if (dig.length < 11 || carregando) return;
        const foraDoAr = E.cenario === 'fora';
        E.doc = null;
        E.termo = mascara(dig);
        E.erro = null;
        carregando = true;
        pintar();
        abrirRastro(dig, foraDoAr, r => {
          carregando = false;
          if (!r.ok) {
            E.erro = foraDoAr ? P('Falha ao consultar o ERP', 'Failed to query the ERP') : P('Cliente não encontrado na base de dados', 'Customer not found in the database');
            return pintar();
          }
          E.doc = dig;
          pintar();
          abrirErp(cliente(dig), true);
        }, () => {
          /* os adesivos entram quando o rastro fecha (a janela do ERP fecha antes) */
          if (E.doc !== dig) return;
          E.entrar = true;
          pintar('saudacao');
        });
      }

      /* faixa discreta com o que só existe na demonstração: documentos para testar, situação do ERP, rastro e ERP */
      function faixaDemo(c) {
        const doc = (nome, dig, perfil, tom) => h('li', null, ui.botao({
          tamanho: 'p', classe: 'ly-doc', titulo: nome, aoClicar: () => buscar(dig),
          texto: [h('b', { class: 'ph-mono' }, mascara(dig)), e('span', 'nm', nome), ui.badge(perfil, tom)],
        }));
        const rotCenario = P('Situação do ERP na próxima busca', 'ERP status for the next search');
        return h('details', { class: 'ly-demo', open: E.demo !== false, ontoggle: ev => { E.demo = !!ev.target.open; } },
          h('summary', null, ic('sliders'), h('span', null, P('Controles da demonstração', 'Demo controls')), e('span', 'nota', P('não fazem parte do sistema', 'not part of the system')), ic('chevd')),
          h('div', { class: 'corpo' },
            h('p', { id: 'raiox-docs-rot' }, P('Documentos fictícios para testar (um clique preenche o campo e analisa):', 'Fictitious tax IDs to try (one click fills in the field and analyzes):')),
            h('ul', { class: 'ly-docs', 'aria-labelledby': 'raiox-docs-rot' },
              CLIENTES.map(k => doc(k.nome, k.doc, ...PERFIL[k.perfil])),
              doc(P('Documento sem cadastro', 'Tax ID with no record'), NAO_CADASTRADO, P('Não encontrado', 'Not found'), 'erro')),
            h('div', { class: 'lin' },
              h('label', { class: 'ly-cenario' },
                h('span', null, rotCenario),
                ui.select({ ariaLabel: rotCenario, valor: E.cenario || 'normal', aoMudar: v => { E.cenario = v; }, opcoes: [
                  { valor: 'normal', texto: P('ERP no ar', 'ERP up') },
                  { valor: 'fora', texto: P('ERP fora do ar', 'ERP down') },
                ] })),
              c && ui.botao({ tamanho: 'p', icone: 'servidor', texto: P('O que o back-end fez', 'What the back end did'), aoClicar: () => abrirRastro(c.doc, false) }),
              c && ui.botao({ tamanho: 'p', icone: 'erp', texto: P('Ver no ERP', 'View in the ERP'), aoClicar: () => abrirErp(c, false) })),
            c && h('p', null, P('Para reordenar o mural, arraste um adesivo sobre outro. No teclado, leve o foco à alça do adesivo (canto superior direito) e use as setas.', 'To reorder the board, drag a note onto another. On the keyboard, move focus to the note handle (top right corner) and use the arrow keys.'))));
      }

      /* ---------- tela de busca: o estado vazio do kit com o campo e o botão ---------- */
      function telaBusca() {
        const campo = com(ui.busca({ placeholder: '00.000.000/0000-00', rotulo: P('CNPJ ou CPF do cliente', 'Customer tax ID (CNPJ or CPF)'), valor: E.termo || '' }), 'ly-campo');
        const input = campo.input;
        input.classList.add('ph-mono');
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('data-f', 'doc');
        const digitos = () => input.value.replace(/\D/g, '');
        const btn = ui.botao({ tom: 'primario', classe: 'ly-analisar', icone: carregando ? IC.loader : IC.sparkles, texto: carregando ? P('Buscando...', 'Searching...') : P('Analisar', 'Analyze'), aoClicar: () => buscar(digitos()) });
        if (carregando) btn.querySelector('.ph-ico').classList.add('ly-gira');
        const habilitar = () => {
          const valido = digitos().length >= 11;
          btn.classList[valido ? 'remove' : 'add']('off');
          if (valido && !carregando) btn.removeAttribute('disabled'); else btn.setAttribute('disabled', '');
        };
        input.addEventListener('input', () => { const m = mascara(input.value); if (m !== input.value) input.value = m; E.termo = m; habilitar(); });
        input.addEventListener('keydown', ev => { if (ev.key === 'Enter' && digitos().length >= 11) { ev.preventDefault(); buscar(digitos()); } });
        habilitar();
        return h('div', { class: 'ly-busca' },
          ui.vazio({ icone: IC.sparkles, tag: 'h2', titulo: P('Buscar cliente', 'Find a customer'),
            texto: P('Digite o CNPJ do cliente para carregar o resumo inteligente', 'Type the customer tax ID (CNPJ) to load the smart summary'),
            acao: h('div', { class: 'ly-linha' }, campo, btn) }),
          E.erro && com(ui.aviso(E.erro, 'erro'), 'ly-erro'));
      }

      /* ---------- painel: mural de adesivos (cada adesivo é um cartão do kit com a cor do bloco em --cor) ---------- */
      function telaPainel(c) {
        if (!Array.isArray(E.ordem) || E.ordem.length !== ORDEM_PADRAO.length) E.ordem = ORDEM_PADRAO.slice();
        const entrar = !!E.entrar;
        E.entrar = false;
        const grade = h('div', { class: 'ly-grade' });
        const anuncio = h('p', { class: 'vh', 'aria-live': 'polite' });
        const atraso = c.atraso, nLanc = c.lanc.length, [rotulo, tom] = SCORE_ROT[c.rotulo];
        let arrastando = null;

        const cor = token => 'var(--ph-' + token + ')';
        const fin = (ok, txt) => h('div', { class: 'ly-fin' }, ic(ok ? 'okc' : 'xc', ok ? 'i-ok' : 'i-no'), h('span', null, txt));

        const CARTOES = {
          cliente: { cor: cor('cor-ambar'), icone: 'star', nome: P('Cliente em destaque', 'Featured customer'), corpo: () => [
            e('h3', 'ly-nome', c.nome.toUpperCase()),
            e('p', 'l1', c.cidade + ' · ' + mascara(c.doc)),
            e('p', 'l2', P('Última compra: ', 'Last purchase: '), h('strong', null, fmt.data(dataDe(c.dias))), h('span', null, P('(há ' + c.dias + ' dias)', '(' + c.dias + ' days ago)'))),
            e('p', 'l3', P('Vendedor: ', 'Sales rep: '), h('strong', null, c.vend.split(' ')[0])),
            ui.badge(c.ativo ? P('Cliente ativo', 'Active customer') : P('Cliente inativo', 'Inactive customer'), c.ativo ? 'ok' : 'erro'),
          ] },
          score: { cor: cor('cor-violeta'), icone: 'grafico', nome: P('Score de oportunidade', 'Opportunity score'), corpo: () => [
            h('div', { class: 'ly-score' }, e('span', 'n', String(c.score)), e('span', 'de', '/100')),
            mostrador(c.score),
            com(ui.badge(rotulo, tom), 'ly-rotulo'),
          ] },
          notas: { cor: cor('cor-azul'), icone: 'file', nome: P('Últimas notas fiscais', 'Latest invoices'),
            acoes: () => c.totalNotas > 5 && e('span', 'tot', P(c.totalNotas + ' no total', c.totalNotas + ' in total')),
            corpo: () => c.notas.map(([dias, valor]) => h('div', { class: 'ly-nf' }, h('span', { class: 'pt', 'aria-hidden': 'true' }), e('span', 'dt', fmt.data(dataDe(dias))), e('span', 'vl', fmt.moeda(valor)))) },
          financeiro: { cor: cor('cor-teal'), icone: 'dollar', nome: P('Financeiro', 'Finances'), corpo: () => [
            fin(true, t(P('Ticket médio: ', 'Average order: ')) + fmt.moeda(c.ticket)),
            fin(!atraso, atraso ? P('Consta título(s) em atraso!', 'Overdue receivable(s) on record!') : nLanc > 0 ? P('Títulos em aberto (no prazo)', 'Open receivables (on time)') : P('Sem títulos em atraso', 'No overdue receivables')),
            fin(c.limiteOk, c.limiteOk ? P('Limite de crédito ok', 'Credit limit ok') : P('Limite de crédito excedido/bloq.', 'Credit limit exceeded/blocked')),
          ] },
          insights: { cor: cor('cor-ambar'), icone: 'bulb', nome: P('Insights rápidos', 'Quick insights'),
            corpo: () => c.insights.map(x => h('div', { class: 'ly-ins' }, ic('right', 'i-cor'), h('span', null, x))) },
          proximaAcao: { cor: cor('cor-rosa'), icone: 'target', nome: P('Próxima ação recomendada', 'Recommended next action'), corpo: () => [
            e('p', 'ly-acao', c.acao),
            ui.botao({ tom: 'primario', icone: IC.phone, classe: 'ly-abordar', texto: P('Iniciar abordagem', 'Start outreach'), aoClicar: () => abrirScript(c) }),
          ] },
          produtos: { cor: cor('cor-violeta'), icone: 'cart', span: true, nome: P('Top produtos', 'Top products'),
            titulo: () => [P('Top produtos', 'Top products'), e('span', 'sub', P('(histórico completo)', '(full history)'))],
            corpo: () => c.prod.map(([k, qtde, total], i) => h('div', { class: 'ly-prod' }, e('div', 'ly-rank', String(i + 1)),
              h('div', { class: 'tx' },
                e('p', 'nm', e('span', 'cd', PROD[k][0]), PROD[k][1]),
                e('span', 'qt', P('Qtde: ', 'Qty: '), h('strong', null, fmt.num(qtde))),
                e('span', 'vl', fmt.moeda(total))))) },
          cenario: { cor: cor('cor-verde'), icone: 'cloud', nome: P('Leitura de cenário externo', 'External scenario reading'),
            corpo: () => CENARIO_EXTERNO.map(x => h('div', { class: 'ly-cen' }, ic('okc', 'i-ok'), h('span', null, x))) },
          emDia: { cor: cor(atraso ? 'erro' : 'alerta'), icone: atraso ? 'alert' : 'days', nome: atraso ? P('Títulos em atraso', 'Overdue receivables') : P('Lançamentos em aberto', 'Open entries'), corpo: () => (nLanc > 0 ? [
            h('p', { class: 'ly-pend' + (atraso ? ' at' : '') }, atraso ? P('Atenção: Consta pendência financeira', 'Heads up: financial issue on record') : P('Títulos a vencer no prazo', 'Receivables due within their term')),
            e('span', 'ly-total', t(P('Total de títulos identificados: ', 'Receivables identified: ')) + nLanc),
            c.lanc.map(([dias, saldo]) => h('div', { class: 'ly-tit' + (dias < 0 ? ' at' : '') },
              h('span', null, dias < 0 && ic('alert'), dias < 0 && e('span', 'vh', P('Vencido: ', 'Overdue: ')), fmt.data(api.data(dias))), e('span', 'vl', fmt.moeda(saldo)))),
          ] : e('p', 'ly-nada', ic('check', 'i-ok'), P('Sem lançamentos em aberto', 'No open entries'))) },
          resumoIA: { cor: cor('cor-verde'), icone: 'sparkles', span: true, nome: P('Resumo do Raio-X', 'X-ray summary'),
            corpo: () => e('p', 'ly-resumo', texto(c.resumo, c)) },
        };

        /* troca dois adesivos de lugar; pelo teclado, o foco acompanha o adesivo movido */
        function trocar(a, b, teclado) {
          const o = E.ordem, ia = o.indexOf(a), ib = o.indexOf(b);
          if (ia < 0 || ib < 0 || ia === ib) return;
          [o[ia], o[ib]] = [o[ib], o[ia]];
          pintarGrade(false);
          if (!teclado) return;
          const alca = grade.querySelector('[data-f="alca-' + a + '"]');
          if (alca) alca.focus();
          anuncio.textContent = t(CARTOES[a].nome) + t(P(': posição ', ': position ')) + (ib + 1) + t(P(' de ', ' of ')) + o.length;
        }

        function adesivo(id, i, anima) {
          const k = CARTOES[id];
          const alca = ui.botao({ icone: IC.grip, tom: 'fantasma', tamanho: 'p', classe: 'ly-alca',
            titulo: P('Arraste o adesivo sobre outro para trocar os dois de lugar. No teclado, use as setas.', 'Drag the note onto another to swap them. On the keyboard, use the arrow keys.') });
          alca.setAttribute('aria-label', t(P('Mover o adesivo ' + k.nome.pt + ' com as setas', 'Move the ' + k.nome.en + ' note with the arrow keys')));
          alca.setAttribute('data-f', 'alca-' + id);
          alca.addEventListener('keydown', ev => {
            const passo = ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1 : ev.key === 'ArrowRight' || ev.key === 'ArrowDown' ? 1 : 0;
            if (!passo) return;
            ev.preventDefault();
            if (E.ordem[i + passo]) trocar(id, E.ordem[i + passo], true);
          });
          const cartao = ui.cartao({ classe: 'ly-adesivo k-' + id, icone: IC[k.icone] || k.icone, titulo: k.titulo ? k.titulo() : k.nome,
            acoes: [k.acoes && k.acoes(), alca], conteudo: h('div', { class: 'ly-corpo' }, k.corpo()) });
          cartao.style.setProperty('--cor', k.cor);
          const item = h('div', { class: 'ly-item' + (k.span ? ' span2' : '') + (anima ? ' entra ph-entrada' : ''), draggable: 'true', style: { '--i': i } }, cartao);
          item.addEventListener('dragstart', ev => { arrastando = id; item.classList.add('some'); try { ev.dataTransfer.setData('text/plain', id); ev.dataTransfer.effectAllowed = 'move'; } catch (er) { /* sem dataTransfer */ } });
          item.addEventListener('dragend', () => { arrastando = null; item.classList.remove('some'); });
          item.addEventListener('dragover', ev => { if (arrastando) ev.preventDefault(); });
          item.addEventListener('drop', ev => { ev.preventDefault(); const de = arrastando; arrastando = null; if (de) trocar(de, id); });
          return item;
        }

        function pintarGrade(anima) {
          grade.replaceChildren(...E.ordem.filter(id => CARTOES[id]).map((id, i) => adesivo(id, i, anima)));
        }
        pintarGrade(entrar);

        return h('div', { class: 'ly-painel' },
          h('div', { class: 'ly-topo' },
            h('div', null,
              h('h2', { class: 'ph-h1', tabindex: '-1', 'data-f': 'saudacao' }, P('Oi, ' + visitante + '!', 'Hi, ' + visitante + '!')),
              h('p', { class: 'ph-sub' }, t(P('Resumo inteligente: ', 'Smart summary: ')) + c.nome.toUpperCase())),
            ui.botao({ icone: 'busca', classe: 'ly-nova', texto: P('Nova busca', 'New search'), aoClicar: () => { E.doc = null; E.termo = ''; E.erro = null; pintar('doc'); } })),
          grade, anuncio);
      }

      /* mostrador do score: arco de 260 graus com ponteiro */
      function mostrador(score) {
        const rad = g => g * Math.PI / 180;
        const cx = 70, cy = 72, r = 50, ini = -220, total = 260;
        const fim = ini + score / 100 * total;
        const pt = (g, raio) => (cx + raio * Math.cos(rad(g))).toFixed(2) + ' ' + (cy + raio * Math.sin(rad(g))).toFixed(2);
        const arco = (a, b) => 'M ' + pt(a, r) + ' A ' + r + ' ' + r + ' 0 ' + (b - a > 180 ? 1 : 0) + ' 1 ' + pt(b, r);
        const [nx, ny] = pt(fim, r - 16).split(' ');
        return h('div', {
          class: 'ly-mostrador', role: 'img', 'aria-label': P('Mostrador: ' + score + ' de 100', 'Gauge: ' + score + ' out of 100'),
          html: '<svg width="140" height="110" viewBox="0 0 140 110" focusable="false" aria-hidden="true">'
            + '<path class="trilho" d="' + arco(ini, ini + total) + '"/><path class="arco" d="' + arco(ini, fim) + '"/>'
            + '<line class="ponteiro" x1="' + cx + '" y1="' + cy + '" x2="' + nx + '" y2="' + ny + '"/><circle class="eixo" cx="' + cx + '" cy="' + cy + '" r="5"/></svg>',
        });
      }

      /* ---------- diálogo: script de ligação (moldura do kit; a classe raiox-real só dá escopo ao miolo) ---------- */
      function abrirScript(c) {
        const fala = texto(c.script, c);
        const copiar = P('Copiar script', 'Copy script');
        const rotulo = h('span', { role: 'status' }, copiar);
        const avisar = msg => { rotulo.textContent = t(msg); api.depois(() => { rotulo.textContent = t(copiar); }, 2400); };
        const falhou = () => avisar(P('Selecione o texto acima e copie manualmente', 'Select the text above and copy it manually'));
        ui.modal({
          classe: 'raiox-real', largura: 520, icone: IC.phone,
          titulo: h('span', { class: 'ly-mtit' }, h('span', null, P('Script de ligação do Raio-X', 'X-ray call script')), h('span', { class: 'ph-tag' }, '30-45s')),
          corpo: [
            h('blockquote', { class: 'ly-fala' }, h('p', null, '"' + fala + '"')),
            ui.botao({ tom: 'primario', icone: IC.clip, classe: 'ly-copiar', texto: rotulo, aoClicar: () => {
              try { navigator.clipboard.writeText(fala).then(() => avisar(P('Script copiado', 'Script copied')), falhou); } catch (er) { falhou(); }
            } }),
          ],
        });
      }
    },
  });

  /* ícones de traço (grade 24x24), desenhados pelo api.icone do kit (sem preenchimento) */
  const CAL = '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>';
  const IC = {
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    dollar: '<path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    bulb: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
    target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
    days: CAL + '<path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    okc: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    xc: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    grip: '<circle cx="12" cy="9" r="1"/><circle cx="19" cy="9" r="1"/><circle cx="5" cy="9" r="1"/><circle cx="12" cy="15" r="1"/><circle cx="19" cy="15" r="1"/><circle cx="5" cy="15" r="1"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    clip: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
    sliders: '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>',
  };

  /* ================= bloco de estilo: só layout e as peças sem equivalente no kit, com tokens --ph-* =================
     Visual único do hub (CONTRATO, seção 7): nenhuma cor, fonte, raio ou sombra fixa e nenhuma regra por tema; o que muda por tema
     vem dos tokens e do core.css. Todo seletor é prefixado por .raiox-real (a raiz e o diálogo do script, que recebe a mesma classe
     como escopo do miolo). --cor = cor do bloco de cada adesivo (--ph-cor-* ou estado), posta pelo módulo no cartão. */
  const ROTULO = 'font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const CSS = `
.raiox-real{min-width:0;color:var(--ph-text);font-size:13px;line-height:1.5}
.raiox-real.ly-raiz{display:flex;flex-direction:column;container-type:inline-size}
.raiox-real .ly-demo{border-bottom:1px dashed var(--ph-border-soft);background:var(--ph-surface);color:var(--ph-text-muted)}
.raiox-real .ly-demo summary{cursor:pointer;padding:8px 16px;display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;list-style:none;color:var(--ph-text-dim);${ROTULO}}
.raiox-real .ly-demo summary:focus-visible{outline-offset:-2px}
.raiox-real .ly-demo summary::-webkit-details-marker{display:none}
.raiox-real .ly-demo summary .ph-ico{width:14px;height:14px}
.raiox-real .ly-demo summary .nota{font:400 12px/1.5 var(--ph-font);letter-spacing:0;text-transform:none;font-stretch:100%}
.raiox-real .ly-demo[open] summary .ph-ico:last-child{transform:rotate(180deg)}
.raiox-real .ly-demo .corpo{display:flex;flex-direction:column;gap:8px;padding:2px 16px 12px;min-width:0}
.raiox-real .ly-demo .lin{display:flex;flex-wrap:wrap;align-items:center;gap:8px;min-width:0}
.raiox-real .ly-demo .lin .ph-btn{white-space:normal;height:auto;min-height:2rem;max-width:100%}
.raiox-real .ly-docs{list-style:none;margin:0;padding:2px;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,360px),1fr));gap:6px;min-width:0}
.raiox-real .ly-docs li{min-width:0}
.raiox-real .ly-doc{width:100%;justify-content:flex-start;font-weight:500}
.raiox-real .ly-doc>span{flex:1;display:inline-flex;align-items:center;gap:8px;min-width:0;overflow:hidden}
.raiox-real .ly-doc b{flex:none;color:var(--ph-text)}
.raiox-real .ly-doc .nm{min-width:0;margin-right:auto;overflow:hidden;text-overflow:ellipsis}
.raiox-real .ly-doc .ph-badge{flex:none}
.raiox-real .ly-cenario{display:inline-flex;align-items:center;flex-wrap:wrap;gap:6px 8px;min-width:0;max-width:100%}
.raiox-real .ly-cenario .ph-input{width:auto;max-width:100%}

.raiox-real .ly-busca{display:flex;flex-direction:column;align-items:center;gap:12px;padding:12px clamp(16px,3vw,32px) 36px}
.raiox-real .ly-linha{display:flex;gap:8px;width:100%;max-width:480px}
.raiox-real .ly-linha .ph-busca{flex:1 1 auto;max-width:none}
.raiox-real .ly-linha .ly-analisar{flex:none}
.raiox-real .ly-erro{width:100%;max-width:480px}
.raiox-real .ly-gira{animation:ph-roda 1s linear infinite}

.raiox-real .ly-painel{padding:20px clamp(16px,3vw,32px) 28px;min-width:0}
.raiox-real .ly-topo{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:20px}
.raiox-real .ly-topo>div{min-width:0}
.raiox-real .ly-topo .ph-sub{overflow-wrap:anywhere}
.raiox-real .ly-grade{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;align-items:start}
.raiox-real .ly-item{min-width:0;cursor:grab}
.raiox-real .ly-item.span2{grid-column:span 2}
.raiox-real .ly-item.some{opacity:.4}
@container (max-width:960px){.raiox-real .ly-grade{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container (max-width:560px){.raiox-real .ly-grade{grid-template-columns:minmax(0,1fr)}.raiox-real .ly-item.span2{grid-column:span 1}}

.raiox-real .ly-adesivo{position:relative;overflow:hidden}
.raiox-real .ly-adesivo::before{content:"";position:absolute;inset:0 0 auto;height:3px;background:var(--cor)}
.raiox-real .ly-adesivo .ph-card-titulo .ph-ico{color:var(--cor)}
.raiox-real .ly-adesivo .tot,.raiox-real .ly-adesivo .sub{font:500 12px/1.4 var(--ph-font);letter-spacing:0;text-transform:none;color:var(--ph-text-dim)}
.raiox-real .ly-adesivo .sub{margin-left:6px}
.raiox-real .ly-alca{cursor:grab}
.raiox-real .ly-corpo{display:flex;flex-direction:column;gap:7px;min-width:0}
.raiox-real .ly-corpo .ph-ico{width:14px;height:14px}
.raiox-real .ly-corpo>.ph-badge{align-self:flex-start}
.raiox-real .i-ok{color:var(--ph-ok)}
.raiox-real .i-no{color:var(--ph-erro)}
.raiox-real .i-cor{color:var(--cor)}

.raiox-real .ly-nome{font-size:16px;font-weight:700;line-height:1.25;color:var(--ph-text);overflow-wrap:anywhere}
.raiox-real .k-cliente .l1,.raiox-real .k-cliente .l3{font-size:12px;color:var(--ph-text-muted);overflow-wrap:anywhere}
.raiox-real .k-cliente .l2{font-size:12.5px;color:var(--ph-text-2)}
.raiox-real .k-cliente .l2 span{margin-left:6px;color:var(--ph-text-dim)}

.raiox-real .ly-score{display:flex;align-items:baseline;gap:4px}
.raiox-real .ly-score .n{font-family:var(--ph-font-display);font-weight:700;font-size:calc(40px * var(--ph-display-scale));line-height:1;color:var(--cor);font-variant-numeric:tabular-nums lining-nums}
.raiox-real .ly-score .de{font-size:14px;color:var(--ph-text-dim)}
.raiox-real .ly-mostrador svg{display:block;fill:none;stroke-linecap:round}
.raiox-real .ly-mostrador .trilho{stroke:var(--ph-border);stroke-width:9}
.raiox-real .ly-mostrador .arco{stroke:var(--cor);stroke-width:9}
.raiox-real .ly-mostrador .ponteiro{stroke:var(--ph-text);stroke-width:2.5}
.raiox-real .ly-mostrador .eixo{fill:var(--ph-text)}

.raiox-real .ly-nf{display:flex;align-items:center;gap:8px;font-size:12.5px}
.raiox-real .ly-nf .pt{flex:none;width:5px;height:5px;border-radius:50%;background:var(--cor)}
.raiox-real .ly-nf .dt{color:var(--ph-text-muted)}
.raiox-real .ly-nf .vl{margin-left:auto;font-weight:600;color:var(--ph-text);font-variant-numeric:tabular-nums}
.raiox-real .ly-fin,.raiox-real .ly-ins,.raiox-real .ly-cen{display:flex;align-items:flex-start;gap:8px;font-size:12.5px;color:var(--ph-text-2)}
.raiox-real .ly-fin .ph-ico,.raiox-real .ly-ins .ph-ico,.raiox-real .ly-cen .ph-ico{margin-top:2px}
.raiox-real .ly-acao{font-size:12.5px;line-height:1.6;color:var(--ph-text-2);margin-bottom:6px}
.raiox-real .ly-abordar,.raiox-real .ly-copiar{width:100%}

.raiox-real .ly-prod{display:flex;align-items:flex-start;gap:10px;font-size:12.5px}
.raiox-real .ly-rank{flex:none;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--cor);background:color-mix(in srgb,var(--cor) 14%,transparent);border:1px solid color-mix(in srgb,var(--cor) 40%,transparent)}
.raiox-real .ly-prod .tx{flex:1;min-width:0}
.raiox-real .ly-prod .nm{font-weight:600;color:var(--ph-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.raiox-real .ly-prod .cd{margin-right:6px;font-family:var(--ph-font-mono);font-weight:700;color:var(--cor)}
.raiox-real .ly-prod .qt{color:var(--ph-text-muted)}
.raiox-real .ly-prod .vl{margin-left:8px;font-weight:600;color:var(--ph-text);font-variant-numeric:tabular-nums}

.raiox-real .ly-pend{font-size:12.5px;font-weight:600;color:var(--ph-alerta)}
.raiox-real .ly-pend.at{color:var(--ph-erro)}
.raiox-real .ly-total{font-size:12px;color:var(--ph-text-muted)}
.raiox-real .ly-tit{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;color:var(--ph-text-2)}
.raiox-real .ly-tit.at{color:var(--ph-erro);font-weight:700}
.raiox-real .ly-tit>span:first-child{display:inline-flex;align-items:center;gap:4px}
.raiox-real .ly-tit .vl{font-weight:700;font-variant-numeric:tabular-nums}
.raiox-real .ly-mais{font-size:12px;font-weight:600;color:var(--ph-text-dim);text-align:center}
.raiox-real .ly-nada{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;color:var(--ph-ok)}
.raiox-real .ly-resumo{font-size:13.5px;line-height:1.6;color:var(--ph-text-2)}

.raiox-real .ly-mtit{display:inline-flex;align-items:center;flex-wrap:wrap;gap:8px}
.raiox-real .ly-fala{margin:0;padding:14px 16px;border:1px solid var(--ph-border);border-left:3px solid var(--ph-accent);border-radius:var(--ph-raio);background:var(--ph-surface)}
.raiox-real .ly-fala p{margin:0;font-size:14px;line-height:1.7;font-style:italic;color:var(--ph-text-2)}

@container (max-width:600px){.raiox-real .ly-docs{max-height:150px;overflow-y:auto;overscroll-behavior:contain;padding:6px;border:1px solid var(--ph-border-soft);border-radius:var(--ph-raio)}}
@container (max-width:480px){.raiox-real .ly-linha{flex-wrap:wrap}.raiox-real .ly-linha>*,.raiox-real .ly-linha .ly-analisar{flex:1 1 100%}}
@media (prefers-reduced-motion:reduce){.raiox-real .ly-gira{animation:none}}
`;
  function injetarCss() {
    if (document.getElementById('raiox-real-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'raiox-real-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
})();
