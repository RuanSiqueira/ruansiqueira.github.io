/* ProjectHub de demonstração · núcleo 3.3.0
   Casca (login, painel, administração, menu, cabeçalho), roteador por hash, idioma, três temas (Rack, Crachá, Plaqueta), o alto contraste de acessibilidade,
   a moldura que envolve cada sistema e o kit de UI para os módulos.
   JavaScript puro, sem framework e sem build. Componentes com as classes do daisyUI 5 (prefixo "dy-"). Todos os dados são fictícios.
   Contrato dos módulos: Hub.registrar({ id, ordem, grupo, icone, nome, resumo, manual, montar(el, api) }). Detalhes em CONTRATO.md.
   Rotas: #/entrar login · #/ painel · #/<id> sistema (alias #/<id>/sistema) · #/<id>/manual manual · #/admin/<tela> administração.
   Carga sob demanda: com data-modulos no <script> do core, cada módulo é baixado só quando a rota dele abre.
   Versão pública: com <html data-publico>, api.publico = true, o rastro mostra só título, tipo, estado e tempo de cada passo e o manual omite outras_empresas. */
(() => {
  'use strict';

  const VERSAO = '3.3.0';
  const P = (pt, en) => ({ pt, en });

  /* ---------- de onde vêm os módulos (sem data-modulos: modo legado, módulos carregados por <script> próprio) ---------- */
  const SCRIPT = (typeof document !== 'undefined' && document.currentScript) || null;
  const DIR_MODULOS = SCRIPT && SCRIPT.getAttribute ? SCRIPT.getAttribute('data-modulos') : null;
  const VER = (() => { const m = /[?&]v=([^&#]+)/.exec((SCRIPT && SCRIPT.getAttribute && SCRIPT.getAttribute('src')) || ''); return m ? m[1] : ''; })();
  const SOB_DEMANDA = typeof DIR_MODULOS === 'string' && DIR_MODULOS !== '';

  /* ---------- preferências (idioma é o mesmo do portfólio) ---------- */
  const CHAVE_LANG = 'plaqueta-lang';
  const CHAVE_VISUAL = 'ph-demo-visual';
  const CHAVE_PERFIL = 'ph-demo-perfil';
  const ler = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento: vale só nesta visita */ } };
  const apagar = k => { try { localStorage.removeItem(k); } catch (e) { /* sem armazenamento */ } };
  const consulta = q => { try { return !!(window.matchMedia && window.matchMedia(q).matches); } catch (e) { return false; } };

  /* Três temas com conceito (data-visual mantém os ids antigos: escuro = Rack, claro = Crachá, portfolio = Plaqueta).
     O alto contraste não é tema: é uma opção de acessibilidade que vale sobre qualquer um (data-visual="contraste"). */
  const VISUAIS = {
    escuro: { rotulo: P('Rack', 'Rack'), desc: P('A sala de TI: painéis de metal presos no rack, LEDs de status e etiqueta de patrimônio.', 'The server room: metal panels mounted on the rack, status LEDs and an asset sticker.'), cor: '#0c0e11', amostra: ['#0c0e11', '#23272e', '#60a5fa', '#34d399'] },
    claro: { rotulo: P('Crachá', 'Badge'), desc: P('O crachá corporativo: cartões brancos, chip dourado e uma faixa de cor por indicador.', 'The corporate badge: white cards, a gold chip and one color stripe per indicator.'), cor: '#eef2f7', amostra: ['#e8edf4', '#ffffff', '#3b82f6', '#10b981'] },
    portfolio: { rotulo: P('Plaqueta', 'Asset tag'), desc: P('O tema do portfólio: fita amarela, preto anodizado e alumínio escovado.', 'The portfolio theme: yellow label tape, anodized black and brushed aluminum.'), cor: '#111214', amostra: ['#111214', '#bfc4c9', '#f2c500', '#f39200'] },
  };
  const ALIAS_VISUAL = { rack: 'escuro', corporativo: 'escuro', cracha: 'claro', plaqueta: 'portfolio' };
  const normVisual = v => (VISUAIS[v] ? v : (ALIAS_VISUAL[v] || null));
  const ehContraste = v => v === 'contraste' || v === 'alto-contraste';
  const CHAVE_CONTRASTE = 'ph-demo-contraste';

  let lang = ler(CHAVE_LANG) === 'en' ? 'en' : 'pt';
  let visual = normVisual(ler(CHAVE_VISUAL)) || 'portfolio';
  /* sem escolha salva, segue a preferência do sistema; o tema antigo "contraste" vira a opção ligada */
  let altoContraste = ler(CHAVE_CONTRASTE) != null ? ler(CHAVE_CONTRASTE) === '1' : (ehContraste(ler(CHAVE_VISUAL)) || consulta('(prefers-contrast: more)'));
  const visualAplicado = () => (altoContraste ? 'contraste' : visual);

  /* ---------- catálogo: os 14 sistemas aparecem no menu e no painel sem baixar o arquivo do módulo ---------- */
  const GRUPOS = [
    { id: 'fiscal', nome: P('Fiscal e financeiro', 'Tax and finance'), icone: 'landmark', descricao: P('Entrada de notas, notas de débito e controle da verba orçamentária.', 'Inbound invoices, debit notes and budget control.') },
    { id: 'comercial', nome: P('Comercial', 'Sales'), icone: 'chart-line', descricao: P('Reativação da base, funis, campanhas, CRM e atendimento automático.', 'Customer reactivation, funnels, campaigns, CRM and automated service.') },
    { id: 'pessoas', nome: P('Pessoas', 'People'), icone: 'users-round', descricao: P('Pesquisas de clima, eNPS e entrevistas de desligamento.', 'Climate surveys, eNPS and exit interviews.') },
    { id: 'operacao', nome: P('Operação', 'Operations'), icone: 'factory', descricao: P('Almoxarifado, frota e comunicação nas TVs.', 'Stockroom, fleet and factory TV signage.') },
    { id: 'conhecimento', nome: P('Conhecimento', 'Knowledge'), icone: 'graduation-cap', descricao: P('A base de conhecimento da TI: manuais, arquitetura e runbooks.', 'The IT knowledge base: manuals, architecture and runbooks.') },
    { id: 'outros', nome: P('Outros', 'Other'), icone: 'folder', descricao: P('Sistemas fora do catálogo.', 'Systems outside the catalog.') },
  ];
  const T3 = (pt, en) => ({ pt, en: en || pt });
  /* Os 6 sistemas com vídeo de ~20 s da versão completa (caminho a partir da raiz do site): o cartão "fora da demonstração" mostra o vídeo.
     O testes/ferramenta_publicar.js lê esta lista para conferir os arquivos. */
  const CONTATO = { linkedin: 'https://www.linkedin.com/in/ruan-siqueira-1898b7252', email: 'ruandoaqw@gmail.com' }; // os mesmos da seção Contato do portfólio
  const VIDEOS = ['nf_autonoma', 'nota_debito', 'controle_verba', 'disparos', 'base', 'leads', 'exportacao', 'raio_x', 'dash_ia', 'pesquisa_clima', 'estoque_epi', 'controle_veiculos', 'carrossel_tv', 'base_conhecimento'];
  const CATALOGO = [
    ['nf_autonoma', 'fiscal', 'receipt', P('Notas fiscais de entrada', 'Inbound invoices'), P('Lança no ERP as notas fiscais de entrada e os CT-es (fretes) da empresa, conferindo cada uma antes de gravar; no modo automático, lança tudo sozinha.', 'Posts the company\'s inbound invoices and CT-es (freight bills) to the ERP, checking each one before writing; in automatic mode, it posts everything on its own.'), T3(['C# / .NET', 'SQL Server', 'API de IA generativa'], ['C# / .NET', 'SQL Server', 'Generative AI API'])],
    ['nota_debito', 'fiscal', 'file-minus', P('Notas de débito', 'Debit notes'), P('Nota de Débito de pagamento antecipado exigida pela Reforma Tributária: emitida a partir do pedido e acompanhada até a venda, sem controle manual.', 'Advance-payment debit note required by Brazil\'s tax reform: issued from the sales order and tracked through to the sale, with no manual control.'), T3(['C# / .NET', 'SQL Server', 'Next.js / React'])],
    ['controle_verba', 'fiscal', 'wallet', P('Controle de verba', 'Budget control'), P('A camada inteligente sobre o ERP para a verba de cada conta: planejado, previsto, realizado e saldo, cofre de reservas mantido por um robô, aviso de estouro e a base orçamentária do ano seguinte.', 'The intelligent layer on top of the ERP for the budget of each account: planned, committed, actual and balance, a reservation vault kept by a robot, overrun alerts and next year\'s budget base.'), T3(['C# / .NET', 'SQL Server', 'Next.js / React'])],
    ['disparos', 'comercial', 'refresh-cw', P('Reativação de clientes', 'Customer reactivation'), P('Reativa a base de clientes pelo WhatsApp e mede quanto virou orçamento e compra no funil do vendedor.', 'Reactivates the customer base on WhatsApp and measures how much turned into quotes and orders in the sales rep\'s funnel.'), T3(['C# / .NET', 'SQL Server', 'Next.js / React'])],
    ['base', 'comercial', 'funnel', P('Funis do CRM', 'CRM funnels'), P('A camada inteligente sobre o ERP que leva ao funil de vendas todo cliente tocado pelas campanhas de WhatsApp, pela Regra do Ciclo: um card por cliente, para o vendedor certo, sem duplicar.', 'The intelligent layer on top of the ERP that takes every customer touched by WhatsApp campaigns to the sales funnel, using the Cycle Rule: one card per customer, for the right sales rep, with no duplicates.'), T3(['C# / .NET', 'SQL Server', 'Next.js / React'])],
    ['leads', 'comercial', 'megaphone', P('Leads e campanhas', 'Leads and campaigns'), P('Responde ao lead do marketing em minutos pelo WhatsApp, avança a oportunidade no ERP, manda o lead de exportação para o setor certo e dispara campanhas por lista.', 'Answers the marketing lead within minutes on WhatsApp, moves the opportunity forward in the ERP, routes export leads to the right team and runs list campaigns.'), T3(['Next.js / React', 'TypeScript', 'C# / .NET'])],
    ['exportacao', 'comercial', 'bot', P('AUTO CRM', 'AUTO CRM'), P('CRM comercial por setor: funil de cada vendedor, leads com cadência, mapa de mercados e gerencial que une ERP e hub.', 'Sales CRM by sector: each seller\'s funnel, leads with a cadence, market map and a management report joining ERP and hub.'), T3(['Next.js', 'React', 'TypeScript'])],
    ['raio_x', 'comercial', 'id-card', P('Raio-X do cliente', 'Customer X-ray'), P('Digite o CNPJ ou o CPF e receba o resumo do cliente pronto para a ligação, em um mural de adesivos: score, notas, financeiro, produtos, insights, próxima ação e script.', 'Type in a tax ID and get the customer summary ready for the call on a sticky-note board: score, invoices, finances, products, insights, next action and script.'), T3(['Next.js / React', 'TypeScript', 'C# / .NET'])],
    ['dash_ia', 'comercial', 'bot-message-square', P('Atendimento com IA', 'AI customer service'), P('A camada inteligente sobre o ERP que mede o que cada disparo de WhatsApp devolve, leva o cliente ao vendedor da carteira e protege a IA de atendimento contra robô conversando com robô.', 'The intelligent layer on top of the ERP that measures what every WhatsApp message returns, routes the customer to the rep who owns the portfolio and protects the AI assistant from bots talking to bots.'), T3(['Next.js / React', 'C# / .NET', 'SQL Server'])],
    ['pesquisa_clima', 'pessoas', 'clipboard-list', P('Pesquisa de clima e RH', 'Climate survey and HR'), P('Pesquisas internas por setor, respondidas de forma anônima por link, com relatório de favorabilidade e eNPS, comparativo, análise por IA e apresentação em slides.', 'Internal surveys per sector, answered anonymously through a link, with a favorability and eNPS report, comparison, AI analysis and slide presentation.'), T3(['Next.js', 'React', 'TypeScript'])],
    ['estoque_epi', 'operacao', 'hard-hat', P('Almoxarifado', 'Stockroom'), P('EPI, uniformes, ferramentas e descartáveis de cada unidade em um só lugar: saldo, estoque mínimo e reposição, entrega em lote por funcionário, listas configuráveis e funcionários sincronizados com o RH.', 'PPE, uniforms, tools and disposables for every branch in one place: balance, minimum stock and restocking, batch delivery per employee, configurable lists and employees synced with HR.'), T3(['Next.js / React', 'C# / .NET', 'SQL Server'])],
    ['controle_veiculos', 'operacao', 'truck', P('Controle de veículos', 'Fleet control'), P('Reserva, aprovação, chave, retorno e manutenção da frota da empresa, com quilometragem registrada em cada viagem e alerta de revisão.', 'Booking, approval, key handover, return and maintenance of the company fleet, with the odometer logged on every trip and service alerts.'), T3(['Next.js', 'React', 'TypeScript'])],
    ['carrossel_tv', 'operacao', 'tv', P('Carrossel TV', 'TV Carousel'), P('Comunicação interna nas TVs da empresa: biblioteca de mídias, uma grade por setor, a TV que se atualiza e se defende sozinha, player para PC e aplicativo Android.', 'Internal communication on the company TVs: a media library, one grid per department, a TV that updates and defends itself, a PC player and an Android app.'), T3(['React / Next.js', 'ASP.NET Core (.NET)', 'SQL Server'])],
    ['base_conhecimento', 'conhecimento', 'book-open', P('Base de conhecimento', 'Knowledge base'), P('A base de conhecimento da TI: pilares, páginas de arquitetura e runbooks em Markdown, anexos com formatos permitidos, rascunho e publicação, busca em todo o texto.', 'The IT knowledge base: pillars, architecture pages and runbooks in Markdown, attachments with allowed formats, drafts and publishing, full-text search.'), T3(['Next.js', 'React', 'TypeScript'])],
  ].map(([id, grupo, icone, nome, resumo, tecs], i) => ({ id, grupo, icone, nome, resumo, tecs, ordem: i + 1, ...(VIDEOS.includes(id) && { video: 'assets/videos/' + id + '.mp4', poster: 'assets/videos/' + id + '.jpg' }) }));

  /* ---------- textos da casca ---------- */
  const TX = {
    pular: P('Pular para o conteúdo', 'Skip to content'),
    sistemas: P('Sistemas', 'Systems'),
    menu: P('Menu', 'Menu'),
    abrirMenu: P('Abrir menu', 'Open menu'),
    fecharMenu: P('Fechar menu', 'Close menu'),
    expandirMenu: P('Expandir menu', 'Expand menu'),
    recolherMenu: P('Recolher menu', 'Collapse menu'),
    faixa: P('Demonstração com dados fictícios', 'Demo with fictitious data'),
    voltarPortfolio: P('Voltar ao portfólio', 'Back to portfolio'),
    portfolioCurto: P('Portfólio', 'Portfolio'),
    usuario: P('Visitante (demonstração)', 'Visitor (demo)'),
    papel: P('Acesso de demonstração', 'Demo access'),
    visual: P('Tema', 'Theme'),
    temaInterface: P('Tema da interface', 'Interface theme'),
    temaSalvo: P('A escolha fica salva neste navegador.', 'Your choice is saved in this browser.'),
    contraste: P('Alto contraste para acessibilidade', 'High contrast for accessibility'),
    contrasteAjuda: P('Preto e branco com cores acima de 7:1, foco de 3 px e nenhuma animação decorativa. Vale sobre o tema escolhido.', 'Black and white with colors above 7:1, a 3 px focus ring and no decorative motion. It applies over the chosen theme.'),
    contrasteNota: P('O alto contraste para acessibilidade está ligado e vale sobre o tema escolhido.', 'High contrast for accessibility is on and applies over the chosen theme.'),
    emProducao: P('Em produção', 'In production'),
    idioma: P('Idioma', 'Language'),
    inicio: P('Painel inicial', 'Home dashboard'),
    painelInicial: P('Painel inicial', 'Home dashboard'),
    vocEsta: P('Você está em', 'You are here'),
    voltar: P('Voltar', 'Back'),
    autoria: P('Projetado e construído por Ruan Siqueira', 'Designed and built by Ruan Siqueira'),
    tituloSufixo: P('ProjectHub (demonstração)', 'ProjectHub (demo)'),
    empresa: 'EMPRESA DEMO',
    motorOnline: P('Motor central · online', 'Core engine · online'),
    buscarHub: P('Buscar sistemas e páginas', 'Search systems and pages'),
    buscarNoHub: P('Buscar no hub', 'Search the hub'),
    resultadosBusca: P(n => (n ? n + (n === 1 ? ' resultado' : ' resultados') : 'Nenhum resultado'), n => (n ? n + (n === 1 ? ' result' : ' results') : 'No results')),
    nadaBusca: P(q => 'Nada encontrado para "' + q + '".', q => 'Nothing found for "' + q + '".'),
    fecharBusca: P('Fechar busca', 'Close search'),
    departamentos: P('Departamentos', 'Departments'),
    administracao: P('Administração', 'Administration'),
    usuarios: P('Usuários', 'Users'),
    auditoria: P('Auditoria', 'Audit log'),
    configuracoes: P('Configurações', 'Settings'),
    configConta: P('Configurações da conta', 'Account settings'),
    trocarPerfil: P('Trocar perfil', 'Switch profile'),
    sair: P('Sair', 'Sign out'),
    menuUsuario: P(n => 'Usuário: ' + n, n => 'User: ' + n),
    bemVindo: P('Bem-vindo ao', 'Welcome to'),
    heroAutoria: P('Projetado e construído por Ruan Siqueira, do levantamento de requisitos à implantação.', 'Designed and built by Ruan Siqueira, from requirements gathering to deployment.'),
    heroContagem: P((n, tot) => n + ' de ' + tot + ' sistemas com demonstração navegável', (n, tot) => n + ' of ' + tot + ' systems with a hands-on demo'),
    buscarSistema: P('Buscar sistema ou tecnologia', 'Search system or technology'),
    todos: P('Todos', 'All'),
    filtrarGrupo: P('Filtrar por departamento', 'Filter by department'),
    nadaEncontrado: P('Nenhum sistema encontrado', 'No system found'),
    nadaEncontradoTexto: P('Tente outro termo ou volte para todos os departamentos.', 'Try another term or go back to all departments.'),
    resultadoBusca: P(n => n + (n === 1 ? ' sistema na lista' : ' sistemas na lista'), n => n + (n === 1 ? ' system listed' : ' systems listed')),
    demoDisponivel: P('Demonstração navegável', 'Hands-on demo'),
    emPreparacao: P('Em preparação', 'In preparation'),
    emPreparacaoParen: P('(em preparação)', '(in preparation)'),
    entrar: P('Entrar no sistema', 'Open the system'),
    oque: P('O que faz', 'What it does'),
    finalidade: P('Finalidade', 'Purpose'),
    alcance: P('Alcance', 'Scope'),
    outras: P('Como outras empresas podem usar ou integrar', 'How other companies could use or integrate it'),
    tecnologias: P('Tecnologias', 'Technologies'),
    informacoes: P('Informações', 'Details'),
    tipo: P('Tipo', 'Type'),
    tipoValor: P('Sistema web interno do ProjectHub', 'Internal web system in the ProjectHub'),
    grupo: P('Departamento', 'Department'),
    autoriaRotulo: P('Autoria', 'Authorship'),
    dadosRotulo: P('Dados desta demonstração', 'Data in this demo'),
    dadosValor: P('Fictícios, criados para a demonstração', 'Fictitious, created for this demo'),
    dadosCurto: P('Dados fictícios', 'Fictitious data'),
    preparacaoTitulo: P('Módulo em preparação', 'Module in preparation'),
    preparacaoTexto: P('A demonstração deste sistema está sendo montada com dados fictícios. Os outros sistemas continuam disponíveis.', 'The demo for this system is being assembled with fictitious data. The other systems remain available.'),
    abrindoModulo: P('Abrindo o sistema', 'Opening the system'),
    naoEncontrado: P('Página não encontrada', 'Page not found'),
    naoEncontradoSis: P('Sistema não encontrado', 'System not found'),
    naoEncontradoTexto: P('O endereço não corresponde a nenhum dos 14 sistemas nem a uma tela do hub.', 'This address does not match any of the 14 systems or a hub screen.'),
    irInicio: P('Voltar ao painel', 'Back to the dashboard'),
    tentarDeNovo: P('Tentar de novo', 'Try again'),
    secoes: P('Seções', 'Sections'),
    parteFalhou: P('Esta parte não abriu', 'This part did not open'),
    parteFalhouTexto: P('Troque de aba ou volte ao painel. O restante da demonstração segue funcionando.', 'Switch tabs or go back to the dashboard. The rest of the demo keeps working.'),
    buscar: P('Buscar', 'Search'),
    tabela: P('Tabela', 'Table'),
    semResultado: P('Nenhum registro corresponde à busca.', 'No records match the search.'),
    semRegistros: P('Nenhum registro ainda.', 'No records yet.'),
    contagemLinhas: P((v, tot) => (v === tot ? tot + (tot === 1 ? ' registro' : ' registros') : v + ' de ' + tot + ' registros'), (v, tot) => (v === tot ? tot + (tot === 1 ? ' record' : ' records') : v + ' of ' + tot + ' records')),
    filtros: P('Filtros', 'Filters'),
    fechar: P('Fechar', 'Close'),
    progresso: P('Progresso', 'Progress'),
    semDados: P('Sem dados no período.', 'No data for this period.'),
    colunaVazia: P('Nenhum cartão', 'No cards'),
    moverPara: P(c => 'Mover para ' + c, c => 'Move to ' + c),
    carregando: P('Carregando', 'Loading'),
    manual: P('Manual', 'Manual'),
    manualDe: P(n => 'Manual de ' + n, n => n + ' manual'),
    abrir: P('Abrir', 'Open'),
    campoObrigatorio: P('Preencha este campo.', 'Fill in this field.'),
    marcaObrigatoria: P('Marque esta opção para continuar.', 'Tick this option to continue.'),
    numeroInvalido: P('Informe um número válido.', 'Enter a valid number.'),
    valorMin: P(v => 'O valor mínimo é ' + v + '.', v => 'The minimum value is ' + v + '.'),
    valorMax: P(v => 'O valor máximo é ' + v + '.', v => 'The maximum value is ' + v + '.'),
    beTitulo: P('O que o back-end faz', 'What the back end does'),
    beIntro: P('Passos que o servidor executa nesta ação, na ordem, com o tempo de cada um. Nada aqui acessa um servidor de verdade: é a reprodução do rastro.', 'Steps the server runs for this action, in order, with the time of each one. Nothing here reaches a real server: it is a replay of the trace.'),
    beIntroPublico: P('Visão resumida do que o sistema faz quando você clica. Reprodução ilustrativa, com dados fictícios; etapas e tempos simplificados.', 'A summary of what the system does when you click. Illustrative replay with fictitious data; steps and timings simplified.'),
    foraTitulo: P(a => (a ? a + ': fora da demonstração pública' : 'Fora da demonstração pública'), a => (a ? a + ': outside the public demo' : 'Outside the public demo')),
    foraTexto: P('Esta tela existe na versão completa do sistema. A demonstração pública mostra só a tela principal, com dados fictícios.', 'This screen exists in the full version of the system. The public demo shows only the main screen, with fictitious data.'),
    foraVideo: P('Veja o sistema completo em ação', 'See the full system in action'),
    foraContatoTitulo: P('Tem interesse na versão completa?', 'Interested in the full version?'),
    completoBotao: P('Versão completa', 'Full version'),
    completoTitulo: P(n => 'Versão completa: ' + n, n => 'Full version: ' + n),
    completoTexto: P('Esta demonstração pública mostra a tela principal, com dados fictícios. Quer ver o sistema completo funcionando? Fale comigo e eu libero o acesso para a sua empresa.', 'This public demo shows the main screen, with fictitious data. Want to see the full system running? Get in touch and I will give your company access.'),
    completoFaixaTitulo: P('Você está na versão pública da demonstração', 'You are in the public version of the demo'),
    completoFaixaTexto: P('O hub é completo; cada sistema mostra a tela principal. Quer ver algum sistema inteiro? Fale comigo e eu libero o acesso à versão completa.', 'The hub is complete; each system shows its main screen. Want to see a whole system? Get in touch and I will give you access to the full version.'),
    foraContatoTexto: P('Fale comigo e eu apresento o sistema completo funcionando.', 'Get in touch and I will walk you through the full system.'),
    foraLinkedin: P('Falar no LinkedIn', 'Message me on LinkedIn'),
    foraEmail: P('Enviar e-mail', 'Send an email'),
    foraVideoRotulo: P(n => 'Vídeo sem som: ' + n + ', versão completa', n => 'Silent video: ' + n + ', full version'),
    beTipos: P('Tipos:', 'Types:'),
    bePreparando: P('Preparando', 'Preparing'),
    bePular: P('Pular animação', 'Skip animation'),
    beRepetir: P('Repetir', 'Replay'),
    beRequisicao: P('Requisição', 'Request'),
    beResposta: P('Resposta', 'Response'),
    beExecutando: P('Executando', 'Running'),
    bePasso: P((i, n) => 'Passo ' + i + ' de ' + n, (i, n) => 'Step ' + i + ' of ' + n),
    beFim: P((i, n, ms) => i + ' de ' + n + ' passos · ' + ms + ' ms', (i, n, ms) => i + ' of ' + n + ' steps · ' + ms + ' ms'),
    beParou: P(n => 'A execução parou no erro. ' + (n === 1 ? '1 passo não foi executado.' : n + ' passos não foram executados.'), n => 'The run stopped at the error. ' + (n === 1 ? '1 step did not run.' : n + ' steps did not run.')),
    erpSelo: P('Simulação de ERP · dados fictícios', 'ERP simulation · fictitious data'),
    erpJanela: P('Janela do ERP', 'ERP window'),
    erpItens: P('Itens do registro', 'Record items'),
    erpAbas: P('Abas do programa', 'Program tabs'),
    erpPronto: P('Pronto', 'Ready'),
    erpGravado: P('Registro gravado', 'Record saved'),
    erpConsulta: P('Consulta: somente leitura', 'Inquiry: read-only'),
    erpModoConsulta: P('CONSULTA', 'INQUIRY'),
    erpNarracao: P(['Abrindo o programa...', 'Preenchendo os campos...', 'Gravando os itens...'], ['Opening the program...', 'Filling in the fields...', 'Writing the items...']),
    avisoAuto: P('Você entrou como Visitante para abrir este endereço direto. Para administrar ou ver outro papel, troque de perfil.', 'You were signed in as Visitor to open this address directly. To administer or see another role, switch profile.'),
    fecharAviso: P('Fechar aviso', 'Close notice'),
    acessoRestrito: P('Acesso restrito', 'Restricted access'),
    acessoRestritoTexto: P('Esta área é do Gestor do departamento e do Super admin. Entre com outro perfil para ver.', 'This area belongs to the Department manager and the Super admin. Sign in with another profile to see it.'),
    bemVindoToast: P(p => 'Bem-vindo ao ProjectHub. Você entrou como ' + p + '.', p => 'Welcome to ProjectHub. You are signed in as ' + p + '.'),
    sessaoEncerrada: P('Sessão encerrada. Escolha um perfil para entrar de novo.', 'Signed out. Choose a profile to sign in again.'),
    temaAplicado: P(n => 'Tema ' + n + ' aplicado.', n => n + ' theme applied.'),
    avisos: P('Avisos', 'Notices'),
    tourBotao: P('Tour', 'Tour'),
    tourBotaoRotulo: P('Tour guiado pelo hub', 'Guided tour of the hub'),
    tourSistema: P('Tour deste sistema', 'Tour of this system'),
    tourNome: P('Primeiro dia na EMPRESA DEMO', 'First day at EMPRESA DEMO'),
    tourConviteKicker: P('Tour guiado', 'Guided tour'),
    tourConviteTexto: P('Quer conhecer o hub? Eu mostro tudo na interface de verdade, sem vídeo: a entrada, o painel, um sistema por dentro, a auditoria e os temas.', 'Want to get to know the hub? I will show you everything in the real interface, no video: signing in, the dashboard, a system inside, the audit log and the themes.'),
    tourAssistir: P('Assistir o tour (1 min)', 'Watch the tour (1 min)'),
    tourPassoAPasso: P('Passo a passo', 'Step by step'),
    tourSozinho: P('Explorar sozinho', 'Explore on my own'),
    tourAnterior: P('Anterior', 'Back'),
    tourProximo: P('Próximo', 'Next'),
    tourConcluir: P('Concluir', 'Finish'),
    tourPausar: P('Pausar', 'Pause'),
    tourContinuar: P('Continuar', 'Resume'),
    tourAssistirCurto: P('Assistir', 'Watch'),
    tourVerDeNovo: P('Ver de novo', 'Watch again'),
    tourSair: P('Sair do tour', 'Leave the tour'),
    tourCapitulos: P('Capítulos do tour', 'Tour chapters'),
    tourVisto: P('(visto)', '(seen)'),
    tourPasso: P((i, n) => 'Passo ' + i + '/' + n, (i, n) => 'Step ' + i + '/' + n),
    tourPassoDe: P((i, n) => 'Passo ' + i + ' de ' + n, (i, n) => 'Step ' + i + ' of ' + n),
    tourDica: P('Setas avançam e voltam, Espaço pausa, Esc sai do tour.', 'Arrow keys move forward and back, Space pauses, Esc leaves the tour.'),
  };

  /* ---------- rastro do back-end: tipos (rótulo, ícone e cor) e estados ---------- */
  const BE_TIPOS = {
    api: { icone: 'api', cor: 'azul', rotulo: P('API', 'API') },
    regra: { icone: 'regra', cor: 'violeta', rotulo: P('Regra de negócio', 'Business rule') },
    sql: { icone: 'banco', cor: 'teal', rotulo: P('Banco de dados', 'Database') },
    erp: { icone: 'erp', cor: 'rosa', rotulo: P('ERP', 'ERP') },
    ia: { icone: 'ia', cor: 'violeta', rotulo: P('IA', 'AI') },
    whatsapp: { icone: 'whatsapp', cor: 'verde', rotulo: P('WhatsApp', 'WhatsApp') },
    sefaz: { icone: 'sefaz', cor: 'ambar', rotulo: P('SEFAZ', 'SEFAZ (tax authority)') },
    email: { icone: 'email', cor: 'azul', rotulo: P('E-mail', 'Email') },
    arquivo: { icone: 'arquivo', cor: 'teal', rotulo: P('Arquivo', 'File') },
    job: { icone: 'job', cor: 'ambar', rotulo: P('Rotina automática', 'Scheduled job') },
  };
  const BE_ESTADOS = {
    ok: { icone: 'circle-check', tom: 'ok', rotulo: P('Concluído', 'Done') },
    alerta: { icone: 'triangle-alert', tom: 'alerta', rotulo: P('Atenção', 'Warning') },
    erro: { icone: 'circle-x', tom: 'erro', rotulo: P('Falhou', 'Failed') },
    pulado: { icone: 'circle-dashed', tom: 'neutro', rotulo: P('Pulado', 'Skipped') },
  };

  /* ---------- ícones: traço único da casca v2 (24x24) e desenhos Lucide (licença ISC em assets/vendor/daisyui) ---------- */
  const ICONES = {
    grade: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
    inicio: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5M10 20v-5h4v5',
    menu: 'M4 7h16M4 12h16M4 17h16',
    fechar: 'M6 6l12 12M18 6 6 18',
    voltar: 'M19 12H5m6-6-6 6 6 6',
    avancar: 'M5 12h14m-6-6 6 6-6 6',
    'seta-esq': 'M15 6l-6 6 6 6',
    'seta-dir': 'M9 6l6 6-6 6',
    'seta-cima': 'M6 15l6-6 6 6',
    'seta-baixo': 'M6 9l6 6 6-6',
    mais: 'M12 5v14M5 12h14',
    busca: 'M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14zM20 20l-4-4',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    alerta: 'M12 4 21.5 20h-19zM12 10v4.5M12 17.5v.01',
    info: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 11v5.5M12 7.5v.01',
    relogio: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM12 7v5l3.5 2',
    calendario: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
    usuario: 'M12 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4.5 20.5c.8-3.6 3.9-5.5 7.5-5.5s6.7 1.9 7.5 5.5',
    pessoas: 'M9 5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7zM2.5 20c.6-3.4 3.2-5.2 6.5-5.2s5.9 1.8 6.5 5.2M16 5.3a3.5 3.5 0 0 1 0 6.4M18 15c2 .5 3.2 2.1 3.5 5',
    grafico: 'M4 4v16h16M8 16v-5M12 16V8M16 16v-3',
    editar: 'M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4',
    download: 'M12 4v11m-5-5 5 5 5-5M5 20h14',
    filtro: 'M4 5h16l-6 7.5V19l-4 1.5v-8z',
    documento: 'M6 3h8.5L19 7.5V21H6zM14 3v5h5M9 13h7M9 17h5',
    externo: 'M14 4h6v6M20 4l-9 9M18 14v6H4V6h6',
    carro: 'M3.5 16.5v-4.2L5.6 7h12.8l2.1 5.3v4.2zM3.5 16.5V19h3v-2.5M17.5 16.5V19h3v-2.5M7 13h2M15 13h2',
    chave: 'M8 9a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM12 13h9M18 13v3M21 13v2',
    retorno: 'M4 12a8 8 0 1 0 2.3-5.7M4 4v4.5h4.5',
    ferramenta: 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94z',
    pino: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 7.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z',
    enviar: 'M21 3 10 14M21 3l-7 18-4-7-7-4z',
    mensagem: 'M4 5h16v11H9l-5 4z',
    tv: 'M3 5h18v12H3zM8 21h8M12 17v4',
    escudo: 'M12 3l8 3v6c0 4.5-3.4 8-8 9-4.6-1-8-4.5-8-9V6z',
    caixa: 'M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9',
    livro: 'M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5zM4 19.5A1.5 1.5 0 0 0 5.5 21H20v-3',
    dinheiro: 'M3 6h18v12H3zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM6.5 9v.01M17.5 15v.01',
    globo: 'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18zM3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z',
    ia: 'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
    menos: 'M5 12h14',
    servidor: 'M4 4h16v6H4zM4 14h16v6H4zM7.5 7v.01M7.5 17v.01M11 7h5M11 17h5',
    api: 'M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 5l-3 14',
    regra: 'M12 3l9 9-9 9-9-9zM8.5 12l2.5 2.5 4.5-5',
    banco: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
    erp: 'M3 5h18v14H3zM3 9h18M7 13h4M7 16h4M14 13h3M14 16h3',
    whatsapp: 'M12 3.5a8.5 8.5 0 1 1-4.2 15.9L3.5 20.5l1.2-4.1A8.5 8.5 0 0 1 12 3.5zM9 10.5h6M9 14h4',
    sefaz: 'M3 9.5 12 4l9 5.5zM4 20h16M6 9.5V17M10 9.5V17M14 9.5V17M18 9.5V17M4.5 17h15',
    email: 'M3 6h18v12H3zM3 7l9 6.5L21 7',
    arquivo: 'M6 3h8.5L19 7.5V21H6zM14 3v5h5',
    job: 'M12 7.5V12l3 2M20.5 12a8.5 8.5 0 1 1-2.6-6.1M20.5 4v4.5H16',
  };
  const LUCIDE = {
    'panel-left-close': "<rect width='18' height='18' x='3' y='3' rx='2'/><path d='M9 3v18'/><path d='m16 15-3-3 3-3'/>",
    'panel-left-open': "<rect width='18' height='18' x='3' y='3' rx='2'/><path d='M9 3v18'/><path d='m14 9 3 3-3 3'/>",
    'layout-dashboard': "<rect width='7' height='9' x='3' y='3' rx='1'/><rect width='7' height='5' x='14' y='3' rx='1'/><rect width='7' height='9' x='14' y='12' rx='1'/><rect width='7' height='5' x='3' y='16' rx='1'/>",
    landmark: "<path d='M10 18v-7'/><path d='M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z'/><path d='M14 18v-7'/><path d='M18 18v-7'/><path d='M3 22h18'/><path d='M6 18v-7'/>",
    'chart-line': "<path d='M3 3v16a2 2 0 0 0 2 2h16'/><path d='m19 9-5 5-4-4-3 3'/>",
    'users-round': "<path d='M18 21a8 8 0 0 0-16 0'/><circle cx='10' cy='8' r='5'/><path d='M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3'/>",
    factory: "<path d='M12 16h.01'/><path d='M16 16h.01'/><path d='M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z'/><path d='M8 16h.01'/>",
    'graduation-cap': "<path d='M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z'/><path d='M22 10v6'/><path d='M6 12.5V16a6 3 0 0 0 12 0v-3.5'/>",
    folder: "<path d='M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'/>",
    receipt: "<path d='M12 17V7'/><path d='M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8'/><path d='M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z'/>",
    'file-minus': "<path d='M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z'/><path d='M14 2v5a1 1 0 0 0 1 1h5'/><path d='M9 15h6'/>",
    wallet: "<path d='M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1'/><path d='M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4'/>",
    'refresh-cw': "<path d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8'/><path d='M21 3v5h-5'/><path d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16'/><path d='M8 16H3v5'/>",
    funnel: "<path d='M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z'/>",
    megaphone: "<path d='M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z'/><path d='M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14'/><path d='M8 6v8'/>",
    bot: "<path d='M12 8V4H8'/><rect width='16' height='12' x='4' y='8' rx='2'/><path d='M2 14h2'/><path d='M20 14h2'/><path d='M15 13v2'/><path d='M9 13v2'/>",
    'id-card': "<path d='M13 19a4 4 0 00-8 0'/><path d='M16 10h2'/><path d='M16 14h2'/><circle cx='9' cy='12' r='3'/><rect x='2' y='5' width='20' height='14' rx='2'/>",
    'bot-message-square': "<path d='M12 6V2H8'/><path d='M15 11v2'/><path d='M2 12h2'/><path d='M20 12h2'/><path d='M20 16a2 2 0 0 1-2 2H8.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 4 20.286V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z'/><path d='M9 11v2'/>",
    'clipboard-list': "<rect width='8' height='4' x='8' y='2' rx='1' ry='1'/><path d='M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2'/><path d='M12 11h4'/><path d='M12 16h4'/><path d='M8 11h.01'/><path d='M8 16h.01'/>",
    'hard-hat': "<path d='M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5'/><path d='M14 6a6 6 0 0 1 6 6v3'/><path d='M4 15v-3a6 6 0 0 1 6-6'/><rect x='2' y='15' width='20' height='4' rx='1'/>",
    truck: "<path d='M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2'/><path d='M15 18H9'/><path d='M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14'/><circle cx='17' cy='18' r='2'/><circle cx='7' cy='18' r='2'/>",
    'badge-check': "<path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z'/><path d='m16 9-5.5 5.5L8 12'/>",
    'book-open': "<path d='M12 5v16'/><path d='M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z'/>",
    mic: "<path d='M12 19v3'/><path d='M19 10v2a7 7 0 0 1-14 0v-2'/><rect x='9' y='2' width='6' height='13' rx='3'/>",
    'shield-check': "<path d='M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z'/><path d='m9 12 2 2 4-4'/>",
    users: "<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/><path d='M16 3.128a4 4 0 0 1 0 7.744'/><path d='M22 21v-2a4 4 0 0 0-3-3.87'/><circle cx='9' cy='7' r='4'/>",
    'building-2': "<path d='M10 12h4'/><path d='M10 8h4'/><path d='M14 21v-3a2 2 0 0 0-4 0v3'/><path d='M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2'/><path d='M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16'/>",
    'scroll-text': "<path d='M15 12h-5'/><path d='M15 8h-5'/><path d='M19 17V5a2 2 0 0 0-2-2H4'/><path d='M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3'/>",
    settings: "<path d='M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915'/><circle cx='12' cy='12' r='3'/>",
    search: "<path d='m21 21-4.34-4.34'/><circle cx='11' cy='11' r='8'/>",
    contrast: "<circle cx='12' cy='12' r='10'/><path d='M12 18a6 6 0 0 0 0-12v12z'/>",
    'log-out': "<path d='m16 17 5-5-5-5'/><path d='M21 12H9'/><path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'/>",
    'log-in': "<path d='m10 17 5-5-5-5'/><path d='M15 12H3'/><path d='M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4'/>",
    'arrow-left-right': "<path d='M8 3 4 7l4 4'/><path d='M4 7h16'/><path d='m16 21 4-4-4-4'/><path d='M20 17H4'/>",
    'arrow-right': "<path d='M5 12h14'/><path d='m12 5 7 7-7 7'/>",
    x: "<path d='M18 6 6 18'/><path d='m6 6 12 12'/>",
    'chevron-right': "<path d='m9 18 6-6-6-6'/>",
    clock: "<circle cx='12' cy='12' r='10'/><path d='M12 6v6l4 2'/>",
    zap: "<path d='M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z'/>",
    hourglass: "<path d='M5 22h14'/><path d='M5 2h14'/><path d='M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22'/><path d='M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2'/>",
    'triangle-alert': "<path d='m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'/><path d='M12 9v4'/><path d='M12 17h.01'/>",
    'app-window': "<rect x='2' y='4' width='20' height='16' rx='2'/><path d='M10 4v4'/><path d='M2 8h20'/><path d='M6 4v4'/>",
    'chart-column': "<path d='M3 3v16a2 2 0 0 0 2 2h16'/><path d='M18 17V9'/><path d='M13 17V5'/><path d='M8 17v-3'/>",
    pause: "<rect x='14' y='3' width='5' height='18' rx='1'/><rect x='5' y='3' width='5' height='18' rx='1'/>",
    play: "<path d='M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z'/>",
    plus: "<path d='M5 12h14'/><path d='M12 5v14'/>",
    pencil: "<path d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/><path d='m15 5 4 4'/>",
    lock: "<rect width='18' height='11' x='3' y='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/>",
    'lock-open': "<rect width='18' height='11' x='3' y='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 9.9-1'/>",
    'trash-2': "<path d='M10 11v6'/><path d='M14 11v6'/><path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6'/><path d='M3 6h18'/><path d='M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'/>",
    eye: "<path d='M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0'/><circle cx='12' cy='12' r='3'/>",
    'eye-off': "<path d='M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49'/><path d='M14.084 14.158a3 3 0 0 1-4.242-4.242'/><path d='M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143'/><path d='m2 2 20 20'/>",
    'circle-check': "<circle cx='12' cy='12' r='10'/><path d='m16 9-5.5 5.5L8 12'/>",
    'circle-x': "<circle cx='12' cy='12' r='10'/><path d='m15 9-6 6'/><path d='m9 9 6 6'/>",
    'circle-dashed': "<path d='M10.1 2.182a10 10 0 0 1 3.8 0'/><path d='M13.9 21.818a10 10 0 0 1-3.8 0'/><path d='M17.609 3.721a10 10 0 0 1 2.69 2.7'/><path d='M2.182 13.9a10 10 0 0 1 0-3.8'/><path d='M20.279 17.609a10 10 0 0 1-2.7 2.69'/><path d='M21.818 10.1a10 10 0 0 1 0 3.8'/><path d='M3.721 6.391a10 10 0 0 1 2.7-2.69'/><path d='M6.391 20.279a10 10 0 0 1-2.69-2.7'/>",
    workflow: "<rect width='8' height='8' x='3' y='3' rx='2'/><path d='M7 11v4a2 2 0 0 0 2 2h4'/><rect width='8' height='8' x='13' y='13' rx='2'/>",
    monitor: "<rect width='20' height='14' x='2' y='3' rx='2'/><line x1='8' x2='16' y1='21' y2='21'/><line x1='12' x2='12' y1='17' y2='21'/>",
    'rotate-ccw': "<path d='M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'/><path d='M3 3v5h5'/>",
    gauge: "<path d='m12 14 4-4'/><path d='M3.34 19a10 10 0 1 1 17.32 0'/>",
    list: "<path d='M3 5h.01'/><path d='M3 12h.01'/><path d='M3 19h.01'/><path d='M8 5h13'/><path d='M8 12h13'/><path d='M8 19h13'/>",
    ban: "<circle cx='12' cy='12' r='10'/><path d='M4.929 4.929 19.07 19.071'/>",
    map: "<path d='M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z'/><path d='M15 5.764v15'/><path d='M9 3.236v15'/>",
  };

  /* ---------- utilitários ---------- */
  const TONS = ['ok', 'alerta', 'erro', 'info', 'neutro'];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const cls = (...c) => c.filter(Boolean).join(' ');
  const ehBilingue = v => v != null && typeof v === 'object' && !Array.isArray(v) && !(typeof Node !== 'undefined' && v instanceof Node) && ('pt' in v || 'en' in v);
  const t = v => (ehBilingue(v) ? (v[lang] ?? v.pt ?? v.en ?? '') : (v ?? ''));
  const tx = (chave, ...args) => { const v = t(TX[chave]); return typeof v === 'function' ? v(...args) : v; };
  const ptDe = v => (ehBilingue(v) ? (v.pt ?? v.en) : String(v ?? ''));
  const enDe = v => (ehBilingue(v) ? (v.en ?? v.pt) : String(v ?? ''));
  const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const loc = () => (lang === 'en' ? 'en-US' : 'pt-BR');
  const agora = () => Date.now();
  let seq = 0;
  const uid = p => 'ph-' + p + '-' + (++seq);

  function h(tag, attrs, ...filhos) {
    const el = document.createElement(tag);
    const props = [];
    if (attrs) for (const k of Object.keys(attrs)) {
      let v = attrs[k];
      if (v == null || v === false) continue;
      if (ehBilingue(v)) v = t(v);
      if (k === 'class') el.className = v;
      else if (k === 'style') {
        if (typeof v === 'string') el.style.cssText = v;
        else for (const p of Object.keys(v)) {
          if (v[p] == null) continue;
          if (p.startsWith('--')) el.style.setProperty(p, String(v[p])); else el.style[p] = v[p];
        }
      }
      else if (k === 'html') el.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'value' || k === 'checked' || k === 'selected') props.push([k, v]);
      else el.setAttribute(k, v === true ? '' : String(v));
    }
    anexar(el, filhos);
    for (const [k, v] of props) el[k] = v;
    return el;
  }
  function anexar(el, filhos) {
    for (const f of [filhos].flat(Infinity)) {
      if (f == null || f === false || f === true || f === '') continue;
      el.append(f instanceof Node ? f : String(t(f)));
    }
    return el;
  }
  function icone(nome, classe) {
    const s = h('span', { class: cls('ph-ico', classe), 'aria-hidden': 'true' });
    const n = typeof nome === 'string' ? nome.trim() : '';
    let svg;
    if (n.startsWith('<svg')) svg = n;
    else if (n.startsWith('<')) svg = '<svg viewBox="0 0 24 24" focusable="false">' + n + '</svg>';
    else if (ICONES[n]) svg = '<svg viewBox="0 0 24 24" focusable="false"><path d="' + ICONES[n] + '"/></svg>';
    else if (LUCIDE[n]) svg = '<svg viewBox="0 0 24 24" focusable="false">' + LUCIDE[n] + '</svg>';
    else svg = '<svg viewBox="0 0 24 24" focusable="false"><path d="' + ICONES.grade + '"/></svg>';
    s.innerHTML = svg;
    return s;
  }

  const FMT = {
    num: (n, casas = 0) => Number(n ?? 0).toLocaleString(loc(), { minimumFractionDigits: casas, maximumFractionDigits: casas }),
    moeda: n => Number(n ?? 0).toLocaleString(loc(), { style: 'currency', currency: 'BRL' }),
    pct: (n, casas = 0) => FMT.num(n, casas) + '%',
    data: d => (d ? new Date(d).toLocaleDateString(loc(), { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''),
    dataHora: d => (d ? new Date(d).toLocaleString(loc(), { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''),
    hora: d => (d ? new Date(d).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' }) : ''),
    mes: d => { const s = new Date(d).toLocaleDateString(loc(), { month: 'short' }).replace('.', ''); return s.charAt(0).toUpperCase() + s.slice(1); },
  };
  const horaSeg = d => [d.getHours(), d.getMinutes(), d.getSeconds()].map(v => String(v).padStart(2, '0')).join(':');
  function dataRel(delta = 0, hhmm) {
    const d = new Date();
    d.setDate(d.getDate() + delta);
    if (hhmm) { const [hh, mm] = String(hhmm).split(':').map(Number); d.setHours(hh || 0, mm || 0, 0, 0); }
    return d;
  }
  function relativo(d) {
    const m = Math.round((agora() - new Date(d).getTime()) / 6e4);
    if (lang === 'en') { if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; const hh = Math.floor(m / 60); if (hh < 24) return hh + ' h ago'; const dd = Math.floor(hh / 24); return dd === 1 ? 'yesterday' : dd + ' days ago'; }
    if (m < 1) return 'agora'; if (m < 60) return 'há ' + m + ' min'; const hh = Math.floor(m / 60); if (hh < 24) return 'há ' + hh + ' h'; const dd = Math.floor(hh / 24); return dd === 1 ? 'ontem' : 'há ' + dd + ' dias';
  }
  const iniciais = nome => { const p = String(t(nome)).trim().split(/\s+/); return ((p[0] || '')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase(); };
  const semMovimento = () => consulta('(prefers-reduced-motion: reduce)') || altoContraste;
  /* Versão pública (ruansiqueira.dev.br): o publicador grava data-publico no <html> da demo. Lido na hora, nunca guardado. */
  const publico = () => !!(document.documentElement && document.documentElement.hasAttribute && document.documentElement.hasAttribute('data-publico'));

  /* Código de barras Code 128 (conjunto B), o mesmo do portfólio: decorativo, aparece no tema Plaqueta. */
  const C128 = ('212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 ' +
    '221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 ' +
    '231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 ' +
    '314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 ' +
    '111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 ' +
    '114131 311141 411131 211412 211214 211232 2331112').split(' ');
  function codigoBarras(texto, classe) {
    const vals = [104];
    for (const ch of String(texto)) { const c = ch.charCodeAt(0); vals.push(c >= 32 && c <= 126 ? c - 32 : 0); }
    vals.push(vals.reduce((s, v, i) => s + v * (i || 1), 0) % 103, 106);
    const larguras = vals.map(v => C128[v]).join('');
    let x = 10, d = '';
    for (let i = 0; i < larguras.length; i++) { const w = +larguras[i]; if (i % 2 === 0) d += 'M' + x + ' 0h' + w + 'v1h-' + w + 'z'; x += w; }
    return h('span', { class: cls('ph-barras-cod', classe), 'aria-hidden': 'true', html: '<svg viewBox="0 0 ' + (x + 10) + ' 1" preserveAspectRatio="none" shape-rendering="crispEdges" focusable="false"><path d="' + d + '"/></svg>' });
  }

  /* Marca do ProjectHub (nós em volta de um losango), colorida pelos tokens do tema. */
  let seqMarca = 0;
  function marca(grande) {
    const id = 'phm' + (++seqMarca);
    const nos = [0, 60, 120, 180, 240, 300].map(a => { const r = (a - 90) * Math.PI / 180; return [50 + 31 * Math.cos(r), 50 + 31 * Math.sin(r)]; });
    const g = 'url(#' + id + ')';
    const svg = '<svg viewBox="0 0 100 100" focusable="false"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" style="stop-color:var(--ph-marca-1)"/><stop offset=".55" style="stop-color:var(--ph-marca-2)"/><stop offset="1" style="stop-color:var(--ph-marca-3)"/></linearGradient></defs>' +
      (grande ? '<circle class="ph-anel" cx="50" cy="50" r="47" fill="none" stroke="' + g + '" stroke-width="1.6" stroke-dasharray="70 10 22 10 40 10"/>' : '<circle cx="50" cy="50" r="45" fill="none" stroke="' + g + '" stroke-width="7"/>') +
      nos.map(([x, y]) => '<line x1="50" y1="50" x2="' + x.toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="' + g + '" stroke-width="' + (grande ? 1.6 : 5) + '"/>').join('') +
      nos.map(([x, y], i) => '<circle class="' + (grande ? 'ph-no' : '') + '" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (grande ? 5.5 : 9) + '" fill="' + g + '" style="animation-delay:' + (i * 0.5).toFixed(1) + 's"/>').join('') +
      '<rect x="39" y="39" width="22" height="22" rx="3" transform="rotate(45 50 50)" fill="' + g + '"/><rect x="45" y="45" width="10" height="10" rx="1.5" transform="rotate(45 50 50)" style="fill:var(--ph-card)"/></svg>';
    return h('span', { class: cls('ph-marca-svg', grande ? 'is-grande' : 'is-mini'), 'aria-hidden': 'true', html: svg });
  }

  /* ---------- registro dos módulos e carga sob demanda ---------- */
  const modulos = new Map();
  const estados = new Map();
  const cargas = new Map(); // id -> 'carregando' | 'falhou'
  let iniciado = false;

  function registrar(def) {
    try {
      if (!def || typeof def !== 'object') throw new Error('definição vazia');
      if (typeof def.id !== 'string' || !/^[a-z0-9_]+$/.test(def.id)) throw new Error('id inválido: ' + (def && def.id));
      if (typeof def.montar !== 'function') throw new Error('montar(el, api) ausente em ' + def.id);
      modulos.set(def.id, def);
      cargas.delete(def.id);
      if (iniciado) { pintarNav(); if (rotaAtual().id === def.id) moduloChegou(def.id); }
      return true;
    } catch (e) {
      console.warn('[Hub] módulo ignorado:', e && e.message);
      return false;
    }
  }

  function pedirModulo(id) {
    if (!SOB_DEMANDA || modulos.has(id) || cargas.has(id) || !CATALOGO.some(c => c.id === id)) return;
    cargas.set(id, 'carregando');
    const s = document.createElement('script');
    s.setAttribute('src', DIR_MODULOS + id + '.js' + (VER ? '?v=' + VER : ''));
    s.async = true;
    s.setAttribute('data-modulo', id);
    const falhou = () => {
      if (modulos.has(id)) return;
      cargas.set(id, 'falhou');
      console.warn('[Hub] o módulo ' + id + ' não carregou');
      if (rotaAtual().id === id) rotear(false, true);
    };
    s.addEventListener('error', falhou);
    s.addEventListener('load', () => { if (!modulos.has(id)) falhou(); });
    (document.head || document.body).append(s);
  }
  /* SH-1: o arquivo chegou com a rota aberta. Só o esqueleto é trocado: barra do sistema, painéis do cabeçalho e foco ficam onde estão. */
  function moduloChegou(id) {
    pintarTourSistema(); // a barra do sistema fica onde está: só ganha o botão "Tour deste sistema" se o módulo trouxer def.tour
    const manual = rotaAtual().sub === 'manual';
    const item = itemPorId(id);
    const vaga = main && main.querySelector(manual ? '.ph-pagina[aria-busy]' : '.ph-sys[data-modulo="' + id + '"][aria-busy]');
    if (!item || !vaga) { rotear(false, true); return; }
    if (manual) { vaga.replaceWith(telaManual(item).el.querySelector('.ph-moldura-corpo').firstElementChild); return; }
    const minha = montagem;
    aposPintura(() => {
      if (minha !== montagem) return;
      vaga.removeAttribute('aria-busy');
      vaga.classList.remove('ph-pagina');
      vaga.replaceChildren();
      montarModulo(item, vaga);
    });
  }
  const temDemo = x => !!(x.def || (SOB_DEMANDA && x.catalogo && cargas.get(x.id) !== 'falhou'));

  /* Menu, painel, busca e contagem mostram só o catálogo (os 14). Um módulo fora do catálogo (página de teste do kit)
     abre só pelo endereço direto e nunca aparece para o visitante nem entra na contagem. */
  function itens() {
    return CATALOGO.map(c => {
      const def = modulos.get(c.id) || null;
      return { id: c.id, grupo: c.grupo, nome: (def && def.nome) || c.nome, icone: c.icone, resumo: (def && def.resumo) || c.resumo, tecs: c.tecs, ordem: def && Number.isFinite(def.ordem) ? def.ordem : c.ordem, pat: c.ordem, def, catalogo: true };
    });
  }
  function itemForaDoCatalogo(id) {
    const def = modulos.get(id);
    if (!def) return null;
    const g = GRUPOS.find(gr => def.grupo && norm(t(gr.nome)) === norm(t(def.grupo)));
    return { id, grupo: g ? g.id : 'outros', nome: def.nome || id, icone: def.icone || 'app-window', resumo: def.resumo, tecs: null, ordem: 99, pat: 99, def, catalogo: false };
  }
  function gruposComItens(lista) {
    return GRUPOS.map(g => ({ ...g, itens: lista.filter(x => x.grupo === g.id).sort((a, b) => a.ordem - b.ordem) })).filter(g => g.itens.length);
  }
  const grupoDe = id => GRUPOS.find(g => g.id === id) || GRUPOS[GRUPOS.length - 1];
  const nomeGrupo = id => t(grupoDe(id).nome);
  const corGrupo = id => 'var(--ph-grupo-' + (Math.max(0, GRUPOS.findIndex(g => g.id === id)) % 5 + 1) + ')';
  const manualDe = def => (def && def.manual && (def.manual[lang] || def.manual.pt)) || {};
  const tecsDe = x => { const m = manualDe(x.def); return (m.tecnologias && m.tecnologias.length ? m.tecnologias : x.tecs ? t(x.tecs) : []) || []; };
  const itemPorId = id => itens().find(x => x.id === id) || itemForaDoCatalogo(id);
  const patDe = item => 'PAT-' + String(item.pat).padStart(4, '0');

  /* ---------- dados do hub (fictícios): perfis, usuários, departamentos, auditoria e atividade ---------- */
  const PERFIS = {
    visitante: { rotulo: P('Visitante', 'Visitor'), descricao: P('Navega pelo painel e pelos sistemas, sem administração.', 'Browses the dashboard and the systems, no administration.'), nome: P('Visitante da demonstração', 'Demo visitor'), email: 'visitante@empresademo.example', admin: false, super: false, deptos: [], meus: ['nf_autonoma', 'raio_x', 'base_conhecimento'] },
    membro: { rotulo: P('Membro', 'Member'), descricao: P('Opera os sistemas do seu departamento.', 'Operates the systems of their department.'), nome: 'Lucas Andrade', email: 'lucas.andrade@empresademo.example', admin: false, super: false, deptos: ['fiscal'], meus: ['nf_autonoma', 'nota_debito'] },
    gestor: { rotulo: P('Gestor do departamento', 'Department manager'), descricao: P('Também administra as pessoas do seu departamento.', 'Also manages the people in their department.'), nome: 'Carla Menezes', email: 'carla.menezes@empresademo.example', admin: true, super: false, deptos: ['fiscal'], meus: ['nf_autonoma', 'nota_debito', 'controle_verba'] },
    super: { rotulo: P('Super admin', 'Super admin'), descricao: P('Vê e administra todo o hub: usuários, departamentos e auditoria.', 'Sees and manages the whole hub: users, departments and audit log.'), nome: 'Marina Costa', email: 'marina.costa@empresademo.example', admin: true, super: true, deptos: [], meus: ['nf_autonoma', 'controle_verba', 'base_conhecimento', 'carrossel_tv'] },
  };
  let perfilId = PERFIS[ler(CHAVE_PERFIL)] ? ler(CHAVE_PERFIL) : null;
  let perfilAuto = false;      // entrou sozinho como Visitante por um link direto (não fica salvo)
  let perfilEdit = {};         // nome e e-mail alterados em Configurações, só nesta visita
  let retornoLogin = '';       // rota para onde o login devolve
  let avisoPerfilFechado = false;
  const perfil = () => (perfilId ? { id: perfilId, ...PERFIS[perfilId], ...perfilEdit } : null);

  const MIN = 6e4;
  const haMin = m => new Date(agora() - m * MIN);
  let hub = null;
  function dadosHub() {
    if (hub) return hub;
    const U = (id, nome, email, deptos, extra) => ({ id, nome, email, deptos, ativo: true, ...extra });
    hub = {
      usuarios: [
        U(1, 'Marina Costa', 'marina.costa@empresademo.example', [], { super: true }),
        U(2, 'Carla Menezes', 'carla.menezes@empresademo.example', [['fiscal', 'admin']]),
        U(3, 'Davi Pacheco', 'davi.pacheco@empresademo.example', [['fiscal', 'member'], ['operacao', 'member']]),
        U(4, 'Lucas Andrade', 'lucas.andrade@empresademo.example', [['fiscal', 'member']]),
        U(5, 'Eduarda Lins', 'eduarda.lins@empresademo.example', [['comercial', 'admin']]),
        U(6, 'Renato Alves', 'renato.alves@empresademo.example', [['comercial', 'member']]),
        U(7, 'Sofia Martins', 'sofia.martins@empresademo.example', [['comercial', 'member']]),
        U(8, 'Patrícia Gomes', 'patricia.gomes@empresademo.example', [['pessoas', 'admin']]),
        U(9, 'Bruno Teixeira', 'bruno.teixeira@empresademo.example', [['operacao', 'admin']]),
        U(10, 'Juliana Rocha', 'juliana.rocha@empresademo.example', [['conhecimento', 'admin'], ['pessoas', 'member']]),
        U(11, 'Felipe Moura', 'felipe.moura@empresademo.example', [], { ativo: false }),
      ],
      deptos: GRUPOS.filter(g => g.id !== 'outros').map(g => ({ id: g.id, nome: g.nome, descricao: g.descricao, cor: corGrupo(g.id) })),
      auditoria: [
        [5, P('Membro adicionado', 'Member added'), 'create', P('Sofia Martins em Comercial (Membro)', 'Sofia Martins in Sales (Member)'), 'Marina Costa', 'departamentos'],
        [32, P('Configuração alterada', 'Setting changed'), 'update', P('Tema do sistema: Corporativo claro', 'System theme: Corporate light'), 'Marina Costa', 'aparencia'],
        [58, P('Projeto atualizado', 'Project updated'), 'update', P('Reativação de clientes: status Ativo', 'Customer reactivation: status Active'), 'Eduarda Lins', 'sistemas'],
        [97, P('Papel alterado', 'Role changed'), 'update', P('Davi Pacheco em Operação: Membro', 'Davi Pacheco in Operations: Member'), 'Bruno Teixeira', 'departamentos'],
        [140, P('Usuário criado', 'User created'), 'create', 'Sofia Martins (sofia.martins@empresademo.example)', 'Marina Costa', 'usuarios'],
        [210, P('Projeto criado', 'Project created'), 'create', P('Base de conhecimento em Conhecimento', 'Knowledge base in Knowledge'), 'Juliana Rocha', 'sistemas'],
        [300, P('Membro removido', 'Member removed'), 'delete', P('Felipe Moura de Operação', 'Felipe Moura from Operations'), 'Bruno Teixeira', 'departamentos'],
        [420, P('Projeto atualizado', 'Project updated'), 'update', P('Controle de verba: descrição e tecnologias', 'Budget control: description and technologies'), 'Carla Menezes', 'sistemas'],
        [1500, P('Depto adicionado', 'Department linked'), 'create', P('Notas de débito ligado a Fiscal e financeiro', 'Debit notes linked to Tax and finance'), 'Marina Costa', 'departamentos'],
        [1640, P('Projeto desativado', 'Project deactivated'), 'update', P('Painel antigo de vendas', 'Old sales dashboard'), 'Eduarda Lins', 'sistemas'],
        [1820, P('Usuário criado', 'User created'), 'create', 'Renato Alves (renato.alves@empresademo.example)', 'Marina Costa', 'usuarios'],
        [2970, P('Configuração alterada', 'Setting changed'), 'update', P('Forma de exibição: Grade', 'Layout: Grid'), 'Marina Costa', 'aparencia'],
        [3180, P('Membro adicionado', 'Member added'), 'create', P('Lucas Andrade em Fiscal e financeiro (Membro)', 'Lucas Andrade in Tax and finance (Member)'), 'Carla Menezes', 'departamentos'],
        [4440, P('Projeto excluído', 'Project deleted'), 'delete', P('Protótipo de etiquetas', 'Label prototype'), 'Marina Costa', 'sistemas'],
        [4720, P('Depto removido', 'Department unlinked'), 'delete', P('Raio-X do cliente desligado de Pessoas', 'Customer X-ray unlinked from People'), 'Patrícia Gomes', 'departamentos'],
        [5820, P('Projeto criado', 'Project created'), 'create', P('Carrossel TV em Operação', 'TV Carousel in Operations'), 'Bruno Teixeira', 'sistemas'],
        [7230, P('Papel alterado', 'Role changed'), 'update', P('Eduarda Lins em Comercial: Admin', 'Eduarda Lins in Sales: Admin'), 'Marina Costa', 'departamentos'],
        [8650, P('Projeto atualizado', 'Project updated'), 'update', P('Notas fiscais de entrada: status Ativo', 'Inbound invoices: status Active'), 'Carla Menezes', 'sistemas'],
      ].map(([m, acao, tipo, detalhes, usuario, area], k) => ({ seq: k + 1, quando: haMin(m), acao, tipo, detalhes, usuario, area })),
      atividade: [
        [4, 'Robô NF', P('Nota lançada', 'Invoice posted'), 'ok', P('NF 47990 de Metalúrgica Exemplo Ltda lançada na produção', 'Invoice 47990 from Metalúrgica Exemplo Ltda posted to production'), 'nf_autonoma'],
        [21, 'Carla Menezes', P('Bloqueio analisado', 'Block reviewed'), 'alerta', P('NF 90217 aguarda o XML corrigido do fornecedor', 'Invoice 90217 is waiting for the supplier\'s corrected XML'), 'nf_autonoma'],
        [38, 'Marina Costa', P('Membro adicionado', 'Member added'), 'info', P('Sofia Martins entrou em Comercial como Membro', 'Sofia Martins joined Sales as Member'), ''],
        [66, 'Robô Verba', P('Alerta', 'Alert'), 'erro', P('Conta G-2206 Manutenção perto do limite do mês', 'Account G-2206 Maintenance close to the monthly limit'), 'controle_verba'],
        [112, 'Eduarda Lins', P('Projeto atualizado', 'Project updated'), 'info', P('Reativação de clientes: nova régua de disparos', 'Customer reactivation: new message schedule'), 'disparos'],
        [170, 'Davi Pacheco', P('Entrega registrada', 'Delivery logged'), 'neutro', P('12 pares de luva de proteção entregues à expedição', '12 pairs of safety gloves delivered to shipping'), 'estoque_epi'],
      ].map(([m, quem, acao, tom, texto, sistema]) => ({ quando: haMin(m), quem, acao, tom, texto, sistema })),
      lancHoje: 42,
      feedPausado: false,
      poolIdx: 0,
      seqAud: 18,
      depSel: '',
      filtroUsu: { termo: '', status: '', depto: '' },
      filtroAud: { tipo: 'all', termo: '', usuario: '', periodo: 'todos' },
    };
    return hub;
  }
  const POOL = [
    ['Robô NF', P('Nota lançada', 'Invoice posted'), 'ok', P('NF 48230 de Parafusos Amostra Ltda lançada na produção', 'Invoice 48230 from Parafusos Amostra Ltda posted to production'), 'nf_autonoma', true],
    ['Robô Verba', P('Previsão consumida', 'Commitment used'), 'info', P('OC 7802 consumiu R$ 4.120,00 da conta G-2101 Matéria-prima', 'PO 7802 used BRL 4,120.00 of account G-2101 Raw material'), 'controle_verba'],
    ['Robô NF', P('Conferência', 'Check'), 'info', P('NF 66120 conferida antes do lançamento: sem bloqueios', 'Invoice 66120 checked before posting: no blocks'), 'nf_autonoma'],
    ['Atendimento IA', P('Resposta enviada', 'Reply sent'), 'neutro', P('Cliente 4471 recebeu a segunda via do boleto pelo WhatsApp', 'Customer 4471 got a copy of the bank slip on WhatsApp'), 'dash_ia'],
    ['Renato Alves', P('Campanha agendada', 'Campaign scheduled'), 'info', P('Reativação: 120 clientes inativos na campanha', 'Reactivation: 120 inactive customers in the campaign'), 'disparos'],
    ['Robô NF', P('Nota lançada', 'Invoice posted'), 'ok', P('NF 7735 de Química Demo S.A. lançada na produção', 'Invoice 7735 from Química Demo S.A. posted to production'), 'nf_autonoma', true],
    ['Davi Pacheco', P('Entrega registrada', 'Delivery logged'), 'neutro', P('4 capacetes de segurança entregues à manutenção', '4 safety helmets delivered to maintenance'), 'estoque_epi'],
    ['Robô Frota', P('Alerta', 'Alert'), 'alerta', P('Veículo DEM-2A41 com revisão vencendo', 'Vehicle DEM-2A41 has a service coming due'), 'controle_veiculos'],
    ['AUTO CRM', P('Lead qualificado', 'Lead qualified'), 'ok', P('Usinagem Modelo Ltda entrou no funil como oportunidade', 'Usinagem Modelo Ltda entered the funnel as an opportunity'), 'exportacao'],
    ['Robô NF', P('Nota lançada', 'Invoice posted'), 'ok', P('NF 15510 de Fornecedor A Ltda lançada na produção', 'Invoice 15510 from Fornecedor A Ltda posted to production'), 'nf_autonoma', true],
    ['Juliana Rocha', P('Manual publicado', 'Manual published'), 'info', P('Procedimento de recebimento de notas, versão 3', 'Invoice receiving procedure, version 3'), 'base_conhecimento'],
    ['Robô NF', P('Pendência', 'Pending'), 'alerta', P('NF 3318 aguarda conferência do comprador', 'Invoice 3318 is waiting for the buyer\'s review'), 'nf_autonoma'],
  ];
  const TOM_TIPO = { create: 'ok', update: 'info', delete: 'erro' };
  /* Todo gesto da demonstração (administração, tema, ações dos sistemas) entra na auditoria e no feed do painel. */
  /* area: usuarios, departamentos, sistemas, aparencia ou o id do sistema (a coluna Área mostra o nome, nunca tabela ou id interno) */
  const AREAS = { usuarios: P('Usuários', 'Users'), departamentos: P('Departamentos', 'Departments'), sistemas: P('Sistemas', 'Systems'), aparencia: P('Aparência', 'Appearance') };
  const nomeArea = a => t(AREAS[a] || (itemPorId(a) || {}).nome || a);
  function registrarAuditoria(acao, tipo, detalhes, area, sistema) {
    const d = dadosHub();
    const p = perfil();
    const quem = p ? t(p.nome) : 'Demo';
    d.auditoria.unshift({ seq: ++d.seqAud, quando: new Date(), acao, tipo, detalhes, usuario: quem, area });
    d.atividade.unshift({ quando: new Date(), quem, acao, tom: TOM_TIPO[tipo] || 'info', texto: detalhes, sistema: sistema || '' });
  }

  /* ---------- kit de UI ---------- */
  const timers = new Set();
  const abertos = new Set();
  function depois(fn, ms) {
    const id = setTimeout(() => { timers.delete(id); fn(); }, ms || 0);
    timers.add(id);
    return id;
  }
  const aposPintura = fn => requestAnimationFrame(() => depois(fn, 0));

  const BTN_TOM = { primario: 'dy-btn-primary', secundario: 'ph-btn-neutro', fantasma: 'dy-btn-ghost', ok: 'dy-btn-success dy-btn-soft', perigo: 'dy-btn-error dy-btn-soft', alerta: 'dy-btn-warning dy-btn-soft' };
  function botao(o = {}) {
    const tom = BTN_TOM[o.tom] ? o.tom : 'secundario';
    const soIcone = !o.texto;
    return h('button', {
      type: o.tipo || 'button',
      class: cls('ph-btn', 'ph-btn--' + tom, 'dy-btn', BTN_TOM[tom], o.tamanho === 'p' && 'ph-btn--p dy-btn-sm', o.tamanho === 'g' && 'ph-btn--g dy-btn-lg', soIcone && 'ph-btn--icone dy-btn-square', o.classe),
      title: o.titulo, 'aria-label': soIcone ? o.titulo : null, disabled: o.desabilitado ? true : null,
      onclick: o.aoClicar,
    }, o.icone && icone(o.icone), o.texto && h('span', null, o.texto));
  }

  const BADGE_TOM = { ok: 'dy-badge-success', alerta: 'dy-badge-warning', erro: 'dy-badge-error', info: 'dy-badge-info', neutro: 'dy-badge-neutral' };
  function badge(texto, tom) {
    const tm = TONS.includes(tom) ? tom : 'neutro';
    return h('span', { class: cls('ph-badge', 'tom-' + tm, 'dy-badge', 'dy-badge-sm', 'dy-badge-soft', BADGE_TOM[tm]) }, h('span', { class: 'ph-badge-ponto', 'aria-hidden': 'true' }), texto);
  }

  function kpis(lista) {
    return h('div', { class: 'ph-kpis' }, (lista || []).filter(Boolean).map(k => h('div', { class: cls('ph-kpi', 'dy-card', 'dy-card-border', TONS.includes(k.tom) && 'tom-' + k.tom) },
      h('span', { class: 'ph-kpi-rotulo' }, k.icone && icone(k.icone), h('span', null, k.rotulo)),
      h('span', { class: 'ph-kpi-valor' }, typeof k.valor === 'number' ? FMT.num(k.valor) : k.valor),
      k.detalhe && h('span', { class: 'ph-kpi-detalhe' }, k.detalhe))));
  }

  const ALERTA_TOM = { ok: 'dy-alert-success', alerta: 'dy-alert-warning', erro: 'dy-alert-error', info: 'dy-alert-info', neutro: '' };
  function aviso(texto, tom = 'info') {
    const tm = TONS.includes(tom) ? tom : 'info';
    return h('div', { class: cls('ph-aviso', 'tom-' + tm, 'dy-alert', 'dy-alert-soft', ALERTA_TOM[tm]), role: tm === 'erro' ? 'alert' : null },
      icone(tm === 'erro' ? 'circle-x' : tm === 'alerta' ? 'triangle-alert' : tm === 'ok' ? 'circle-check' : 'info'), h('div', null, texto));
  }

  function vazio(o = {}) {
    return h('div', { class: 'ph-vazio' },
      icone(o.icone || 'info'),
      h(o.tag || 'strong', { class: o.tag ? 'ph-h2' : null, tabindex: o.foco ? '-1' : null, 'data-foco': o.foco ? '' : null }, o.titulo),
      o.texto && h('p', null, o.texto),
      o.acao);
  }

  function esqueleto(linhas = 4) {
    return h('div', { class: 'ph-esqueleto', role: 'status' }, h('span', { class: 'vh' }, TX.carregando), Array.from({ length: linhas }, () => h('i', { class: 'dy-skeleton', 'aria-hidden': 'true' })));
  }

  function carregar(alvo, montar, ms = 500, linhas = 4) {
    alvo.setAttribute('aria-busy', 'true');
    const marcaEsq = esqueleto(linhas);
    alvo.replaceChildren(marcaEsq);
    depois(() => {
      if (marcaEsq.parentNode !== alvo) return; // outra aba já redesenhou o painel
      alvo.removeAttribute('aria-busy');
      alvo.replaceChildren();
      try { montar(alvo); } catch (e) { console.error('[Hub] falha ao carregar', e); alvo.replaceChildren(vazio({ icone: 'alerta', titulo: TX.parteFalhou, texto: TX.parteFalhouTexto })); }
    }, ms);
  }

  function cartao(o = {}) {
    const tid = o.titulo ? uid('cartao') : null;
    let corpo = o.conteudo;
    if (typeof corpo === 'function') { const c = h('div', { class: 'ph-pilha' }); corpo(c); corpo = c; }
    return h('section', { class: cls('ph-card', 'dy-card', 'dy-card-border', o.classe), 'aria-labelledby': tid },
      (o.titulo || o.acoes) && h('div', { class: 'ph-card-topo' },
        o.titulo && h('h2', { class: 'ph-h2 ph-card-titulo', id: tid }, o.icone && icone(o.icone), h('span', null, o.titulo)),
        o.acoes && h('div', { class: 'ph-linha' }, o.acoes)),
      corpo);
  }

  function busca(o = {}) {
    const input = h('input', { type: 'search', class: 'ph-busca-campo', placeholder: o.placeholder || TX.buscar, 'aria-label': o.rotulo || o.placeholder || TX.buscar, value: o.valor || '', autocomplete: 'off', spellcheck: 'false' });
    input.addEventListener('input', () => { if (o.aoDigitar) o.aoDigitar(input.value); });
    const el = h('label', { class: 'ph-busca dy-input' }, icone('search'), input);
    el.input = input;
    return el;
  }

  function rotuloCampo(id, o) {
    return h('label', { class: 'ph-campo-rotulo', for: id }, o.rotulo, o.obrigatorio && h('span', { 'aria-hidden': 'true' }, ' *'));
  }

  /* Dá a todo campo com rótulo: el.input, el.valor(), el.erro(msg) e el.validar(). */
  function ligarCampo(el, input, o, tipo, id, ajudaId) {
    const erroId = id + '-erro';
    const msg = h('span', { class: 'ph-campo-erro', id: erroId, role: 'alert', hidden: true });
    el.append(msg);
    el.input = input;
    el.erro = texto => {
      const tem = texto != null && texto !== false && texto !== '';
      msg.hidden = !tem;
      msg.textContent = tem ? String(t(texto)) : '';
      const descr = cls(ajudaId, tem && erroId);
      if (descr) input.setAttribute('aria-describedby', descr); else input.removeAttribute('aria-describedby');
      if (tem) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
      return !tem;
    };
    el.valor = () => (tipo === 'marcar' ? !!input.checked : tipo === 'numero' ? (input.value === '' ? null : Number(input.value)) : String(input.value).trim());
    el.validar = () => {
      const v = el.valor();
      let m = null;
      if (o.obrigatorio && (v === '' || v == null || v === false)) m = tipo === 'marcar' ? TX.marcaObrigatoria : TX.campoObrigatorio;
      else if (tipo === 'numero' && v != null) {
        if (!Number.isFinite(v)) m = TX.numeroInvalido;
        else if (o.min != null && v < Number(o.min)) m = tx('valorMin', o.min);
        else if (o.max != null && v > Number(o.max)) m = tx('valorMax', o.max);
      }
      if (!m && typeof o.validar === 'function') m = o.validar(v);
      return el.erro(m);
    };
    const limpar = () => { if (!msg.hidden) el.erro(null); };
    input.addEventListener('input', limpar);
    input.addEventListener('change', limpar);
    return el;
  }

  function select(o = {}) {
    const id = uid('sel');
    const ajudaId = o.ajuda ? id + '-ajuda' : null;
    const opcoes = (o.opcoes || []).map(op => (op != null && typeof op === 'object' && !ehBilingue(op) ? op : { valor: t(op), texto: op }));
    const sel = h('select', {
      class: 'ph-input dy-select', id, required: o.obrigatorio ? true : null, disabled: o.desabilitado ? true : null,
      'aria-label': o.rotulo ? null : (o.ariaLabel || TX.filtros), 'aria-describedby': ajudaId,
      value: o.valor != null ? String(o.valor) : (o.vazio ? '' : null),
    },
    o.vazio && h('option', { value: '' }, o.vazio),
    opcoes.map(op => h('option', { value: String(op.valor), disabled: op.desabilitado ? true : null }, op.texto)));
    sel.addEventListener('change', () => { sel.removeAttribute('aria-invalid'); if (o.aoMudar) o.aoMudar(sel.value); });
    if (!o.rotulo) { sel.input = sel; return sel; }
    const el = h('div', { class: 'ph-campo' }, rotuloCampo(id, o), sel, o.ajuda && h('span', { class: 'ph-campo-ajuda', id: ajudaId }, o.ajuda));
    return ligarCampo(el, sel, o, 'select', id, ajudaId);
  }

  function campo(o = {}) {
    const TIPOS = { texto: 'text', numero: 'number', data: 'date', datahora: 'datetime-local', email: 'email', tel: 'tel', senha: 'password' };
    const id = uid('campo');
    const ajudaId = o.ajuda ? id + '-ajuda' : null;
    const comum = { class: cls('ph-input', o.tipo === 'area' ? 'dy-textarea' : 'dy-input'), id, placeholder: o.placeholder, required: o.obrigatorio ? true : null, disabled: o.desabilitado ? true : null, 'aria-describedby': ajudaId, value: o.valor != null ? String(o.valor) : '' };
    const input = o.tipo === 'area'
      ? h('textarea', { ...comum, rows: String(o.linhas || 3) })
      : h('input', { ...comum, type: TIPOS[o.tipo] || 'text', min: o.min, max: o.max, step: o.passo, inputmode: o.tipo === 'numero' ? 'decimal' : null, autocomplete: o.autocomplete || 'off' });
    input.addEventListener('input', () => { input.removeAttribute('aria-invalid'); if (o.aoMudar) o.aoMudar(input.value); });
    const el = h('div', { class: 'ph-campo' }, rotuloCampo(id, o), input, o.ajuda && h('span', { class: 'ph-campo-ajuda', id: ajudaId }, o.ajuda));
    return ligarCampo(el, input, o, o.tipo === 'numero' ? 'numero' : 'texto', id, ajudaId);
  }

  function marcar(o = {}) {
    const id = uid('marca');
    const ajudaId = o.ajuda ? id + '-ajuda' : null;
    const input = h('input', { type: 'checkbox', class: cls('ph-marca-caixa', o.alternar ? 'dy-toggle dy-toggle-primary' : 'dy-checkbox dy-checkbox-primary dy-checkbox-sm'), id, checked: o.marcado ? true : null, disabled: o.desabilitado ? true : null, 'aria-describedby': ajudaId });
    input.addEventListener('change', () => { if (o.aoMudar) o.aoMudar(!!input.checked); });
    const el = h('div', { class: 'ph-campo' },
      h('label', { class: 'ph-marca', for: id }, input, h('span', null, o.rotulo, o.obrigatorio && h('span', { 'aria-hidden': 'true' }, ' *'))),
      o.ajuda && h('span', { class: 'ph-campo-ajuda', id: ajudaId }, o.ajuda));
    return ligarCampo(el, input, o, 'marcar', id, ajudaId);
  }

  /* Atalhos de formulário. "campos" é um objeto { chave: campo } ou uma lista de campos do kit. */
  const comValidacao = campos => Object.values(campos || {}).filter(c => c && typeof c.validar === 'function');
  const form = Object.freeze({
    texto: o => campo({ ...o, tipo: 'texto' }),
    numero: o => campo({ ...o, tipo: 'numero' }),
    data: o => campo({ ...o, tipo: 'data' }),
    dataHora: o => campo({ ...o, tipo: 'datahora' }),
    area: o => campo({ ...o, tipo: 'area' }),
    select,
    marcar,
    validar(campos) {
      const ruins = comValidacao(campos).filter(c => !c.validar());
      if (ruins.length) ruins[0].input.focus();
      return !ruins.length;
    },
    valores: campos => Object.fromEntries(Object.entries(campos || {}).filter(([, c]) => c && typeof c.valor === 'function').map(([k, c]) => [k, c.valor()])),
    limpar: campos => comValidacao(campos).forEach(c => c.erro(null)),
  });

  function chips(o = {}) {
    const opcoes = o.opcoes || [];
    let valor = o.valor != null ? o.valor : (opcoes[0] && opcoes[0].valor);
    const botoes = opcoes.map(op => {
      const b = h('button', { type: 'button', class: 'ph-chip dy-btn dy-btn-sm', 'aria-pressed': 'false' },
        op.icone && icone(op.icone), h('span', null, op.texto), op.contador != null && h('span', { class: 'ph-chip-n' }, String(op.contador)));
      b.addEventListener('click', () => { if (valor === op.valor) return; valor = op.valor; pintarChips(); if (o.aoMudar) o.aoMudar(valor); });
      return b;
    });
    const pintarChips = () => botoes.forEach((b, i) => b.setAttribute('aria-pressed', String(opcoes[i].valor === valor)));
    pintarChips();
    const el = h('div', { class: 'ph-chips', role: 'group', 'aria-label': o.rotulo || TX.filtros }, botoes);
    el.definir = v => { valor = v; pintarChips(); };
    return el;
  }

  function abas(o, estado) {
    const lista = (o.abas || []).filter(Boolean);
    const chave = o.chave || 'aba';
    const base = uid('abas');
    const painel = h('div', { class: 'ph-pagina ph-abas-painel', role: 'tabpanel', id: base + '-painel', tabindex: '0' });
    const botoes = lista.map(a => h('button', {
      type: 'button', role: 'tab', id: base + '-' + a.id, class: 'ph-aba dy-tab', 'aria-controls': base + '-painel', 'aria-selected': 'false', tabindex: '-1',
      'data-aba-id': a.id, // gancho estável da aba (o id do módulo, nunca o texto): tours e testes
      onclick: () => ir(a.id, false), onkeydown: tecla,
    }, a.icone && icone(a.icone), h('span', null, a.rotulo), h('span', { class: 'ph-aba-contador', hidden: true })));
    const existe = id => lista.some(a => a.id === id);
    let ativa = existe(estado[chave]) ? estado[chave] : (existe(o.inicial) ? o.inicial : (lista[0] && lista[0].id));

    function contadores() {
      lista.forEach((a, i) => {
        let n = 0;
        try { n = typeof a.contador === 'function' ? a.contador() : a.contador; } catch (e) { n = 0; }
        const c = botoes[i].querySelector('.ph-aba-contador');
        c.hidden = !n;
        c.textContent = n ? String(n) : '';
      });
    }
    function pintar() {
      const a = lista.find(x => x.id === ativa);
      botoes.forEach((b, i) => {
        const sel = lista[i].id === ativa;
        b.setAttribute('aria-selected', String(sel));
        b.tabIndex = sel ? 0 : -1;
        if (sel) b.classList.add('dy-tab-active'); else b.classList.remove('dy-tab-active');
      });
      painel.setAttribute('aria-labelledby', base + '-' + ativa);
      painel.replaceChildren();
      contadores();
      if (!a) return;
      try { a.montar(painel); } catch (e) {
        console.error('[Hub] falha na aba ' + a.id, e);
        painel.replaceChildren(vazio({ icone: 'alerta', titulo: TX.parteFalhou, texto: TX.parteFalhouTexto }));
      }
    }
    function ir(id, focar) {
      if (!existe(id)) return;
      ativa = id;
      estado[chave] = id;
      pintar();
      if (focar) botoes[lista.findIndex(a => a.id === id)].focus();
      if (o.aoTrocar) o.aoTrocar(id);
    }
    function tecla(e) {
      const i = botoes.indexOf(e.currentTarget);
      const n = { ArrowRight: (i + 1) % botoes.length, ArrowLeft: (i - 1 + botoes.length) % botoes.length, Home: 0, End: botoes.length - 1 }[e.key];
      if (n === undefined) return;
      e.preventDefault();
      ir(lista[n].id, true);
    }

    const raiz = h('div', { class: 'ph-abas-raiz' },
      h('div', { class: 'ph-abas' },
        h('div', { class: 'ph-abas-lista dy-tabs dy-tabs-border', role: 'tablist', 'aria-label': o.rotulo || TX.secoes }, botoes),
        o.acoes && h('div', { class: 'ph-abas-acoes' }, o.acoes)),
      painel);
    pintar();
    raiz.ir = id => ir(id, false);
    raiz.recarregar = pintar;
    raiz.contadores = contadores;
    raiz.painel = painel;
    return raiz;
  }

  function comparar(a, b) {
    const va = a == null || a === '', vb = b == null || b === '';
    if (va || vb) return va === vb ? 0 : (va ? 1 : -1);
    if (a instanceof Date || b instanceof Date) return +new Date(a) - +new Date(b);
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(t(a)).localeCompare(String(t(b)), loc(), { numeric: true, sensitivity: 'base' });
  }

  function tabela(o = {}) {
    const cols = o.colunas || [];
    let linhas = o.linhas || [];
    let termo = '';
    let ord = o.ordem ? { col: o.ordem.coluna, dir: o.ordem.dir === 'desc' ? 'desc' : 'asc' } : { col: null, dir: 'asc' };
    let visiveis = [];
    const valorDe = (c, l) => (c.valor ? c.valor(l) : l[c.id]);
    const textoDe = (c, l) => { const v = valorDe(c, l); return v instanceof Date ? FMT.dataHora(v) : typeof v === 'number' ? FMT.num(v) + ' ' + v : String(t(v)); };
    const thead = h('thead');
    const tbody = h('tbody');
    const contagem = h('span', { class: 'ph-tabela-contagem', 'aria-live': 'polite' });
    const rodape = h('div', { class: 'ph-tabela-rodape' });

    function cabecalho() {
      thead.replaceChildren(h('tr', null, cols.map(c => {
        const ativo = ord.col === c.id;
        const conteudo = c.ordenavel === false
          ? h('span', null, c.rotulo)
          : h('button', { type: 'button', onclick: () => { ord = { col: c.id, dir: ativo && ord.dir === 'asc' ? 'desc' : 'asc' }; cabecalho(); pintar(); const b = thead.querySelector('[aria-sort] button'); if (b) b.focus(); } },
            h('span', null, c.rotulo), icone('seta-cima', 'ph-ordem'));
        return h('th', { scope: 'col', class: c.tipo === 'numero' ? 'is-num' : null, 'aria-sort': ativo ? (ord.dir === 'asc' ? 'ascending' : 'descending') : null }, conteudo);
      })));
    }
    function celula(c, l) {
      if (c.render) return c.render(l);
      const v = valorDe(c, l);
      if (v instanceof Date) return c.tipo === 'data' ? FMT.data(v) : FMT.dataHora(v);
      if (typeof v === 'number') return FMT.num(v);
      return v;
    }
    function linha(l) {
      const tr = h('tr', { class: o.aoClicarLinha ? 'is-clicavel' : null }, cols.map(c => h('td', { class: cls(c.tipo === 'numero' && 'is-num', c.quebra && 'is-quebra') }, celula(c, l))));
      if (o.aoClicarLinha) {
        tr.tabIndex = 0;
        tr.addEventListener('click', () => o.aoClicarLinha(l));
        tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); o.aoClicarLinha(l); } });
      }
      return tr;
    }
    function pintar() {
      const q = norm(termo.trim());
      visiveis = q ? linhas.filter(l => cols.some(c => norm(textoDe(c, l)).includes(q))) : linhas.slice();
      const c = ord.col && cols.find(x => x.id === ord.col);
      if (c) { const m = ord.dir === 'asc' ? 1 : -1; visiveis.sort((a, b) => m * comparar(valorDe(c, a), valorDe(c, b))); }
      tbody.replaceChildren(...(visiveis.length
        ? visiveis.map(linha)
        : [h('tr', null, h('td', { class: 'ph-tabela-vazio', colspan: String(cols.length || 1) }, linhas.length ? TX.semResultado : (o.vazio || TX.semRegistros)))]));
      contagem.textContent = tx('contagemLinhas', visiveis.length, linhas.length);
      if (o.rodape) { rodape.replaceChildren(); anexar(rodape, [o.rodape(visiveis)]); }
    }

    cabecalho();
    pintar();
    const wrap = h('div', { class: 'ph-tabela-wrap', tabindex: '0', role: 'region', 'aria-label': o.rotulo || TX.tabela, style: o.alturaMax ? { maxHeight: o.alturaMax } : null },
      h('table', { class: 'ph-tabela dy-table dy-table-sm' }, o.rotulo && h('caption', { class: 'vh' }, o.rotulo), thead, tbody));
    const raiz = h('div', { class: 'ph-tabela-raiz' },
      (o.busca !== false || o.acoes) && h('div', { class: 'ph-tabela-topo' },
        o.busca !== false && busca({ placeholder: o.placeholder || TX.buscar, aoDigitar: v => { termo = v; pintar(); } }),
        o.acoes, contagem),
      wrap,
      o.rodape && rodape);
    raiz.atualizar = novas => { if (novas) linhas = novas; pintar(); };
    raiz.visiveis = () => visiveis.slice();
    return raiz;
  }

  function progresso(o = {}) {
    const max = Number(o.max) || 100;
    const v = Math.max(0, Math.min(max, Number(o.valor) || 0));
    const pct = v / max * 100;
    return h('div', { class: cls('ph-progresso', TONS.includes(o.tom) && 'tom-' + o.tom) },
      (o.rotulo || o.texto != null) && h('div', { class: 'ph-progresso-topo' }, h('span', null, o.rotulo), h('span', { class: 'ph-num' }, o.texto != null ? o.texto : FMT.num(pct) + '%')),
      h('div', { class: 'ph-progresso-trilho', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(max), 'aria-valuenow': String(v), 'aria-label': o.rotulo || TX.progresso, 'aria-valuetext': o.texto != null ? o.texto : null },
        h('div', { class: 'ph-progresso-barra', style: { transform: 'scaleX(' + (pct / 100).toFixed(3) + ')' } })));
  }

  function barras(o = {}) {
    const dados = o.dados || [];
    const max = Math.max(1, ...dados.map(d => Number(d.valor) || 0));
    const fv = o.formato || (v => FMT.num(v));
    return h('figure', { class: 'ph-barras' },
      o.titulo && h('figcaption', { class: 'ph-barras-titulo' }, o.titulo),
      dados.length
        ? h('ul', { class: 'ph-barras-lista' }, dados.map(d => {
          const v = Number(d.valor) || 0;
          const pct = v > 0 ? Math.max(1.5, v / max * 100) : 0;
          return h('li', { class: cls('ph-barras-item', TONS.includes(d.tom) && 'tom-' + d.tom) },
            h('span', { class: 'ph-barras-rotulo', title: d.rotulo }, d.rotulo),
            h('span', { class: 'ph-barras-trilho', 'aria-hidden': 'true', html: '<svg width="100%" height="14" focusable="false"><rect x="0" y="0" height="14" rx="2" width="' + pct.toFixed(2) + '%"/></svg>' }),
            h('span', { class: 'ph-barras-valor' }, fv(v, d)));
        }))
        : h('p', { class: 'ph-texto-fraco' }, o.vazio || TX.semDados));
  }

  function linhaTempo(lista) {
    return h('ol', { class: 'ph-tempo' }, (lista || []).map(it => h('li', { class: cls('ph-tempo-item', TONS.includes(it.tom) && 'tom-' + it.tom) },
      h('span', { class: 'ph-tempo-ponto', 'aria-hidden': 'true' }),
      h('div', null,
        it.quando != null && h('time', { class: 'ph-tempo-quando', datetime: it.quando instanceof Date ? it.quando.toISOString() : null }, it.quando instanceof Date ? FMT.dataHora(it.quando) : it.quando),
        h('p', { class: 'ph-tempo-titulo' }, it.titulo),
        it.texto && h('p', { class: 'ph-tempo-texto' }, it.texto)))));
  }

  function kanban(o = {}) {
    const raiz = h('div', { class: 'ph-kanban' });
    const cols = o.colunas || [];
    if (!o.cartoes) o.cartoes = [];
    let arrastando = null;

    function mover(id, para, focar) {
      const k = o.cartoes.find(x => String(x.id) === String(id));
      if (!k || k.coluna === para) return;
      const de = k.coluna;
      k.coluna = para;
      if (o.aoMover && o.aoMover(k, para, de) === false) k.coluna = de;
      pintar();
      if (focar) { const alvo = $$('[data-cartao]', raiz).find(el => el.dataset.cartao === String(id)); if (alvo) alvo.focus(); }
    }
    function cartaoK(k, ci) {
      const ant = cols[ci - 1], prox = cols[ci + 1];
      const li = h('li', { class: 'ph-kanban-cartao', tabindex: '0', draggable: 'true', 'data-cartao': String(k.id) },
        o.renderCartao ? o.renderCartao(k) : [h('strong', null, k.titulo), k.texto && h('p', null, k.texto)],
        h('div', { class: 'ph-kanban-rodape' },
          k.meta && h('span', { class: 'ph-kanban-meta' }, k.meta),
          h('span', { class: 'ph-kanban-mover' },
            ant && botao({ icone: 'seta-esq', tamanho: 'p', tom: 'fantasma', titulo: tx('moverPara', t(ant.titulo)), aoClicar: () => mover(k.id, ant.id, true) }),
            prox && botao({ icone: 'seta-dir', tamanho: 'p', tom: 'fantasma', titulo: tx('moverPara', t(prox.titulo)), aoClicar: () => mover(k.id, prox.id, true) }))));
      li.addEventListener('dragstart', e => {
        arrastando = k.id;
        li.classList.add('is-arrastando');
        try { e.dataTransfer.setData('text/plain', String(k.id)); e.dataTransfer.effectAllowed = 'move'; } catch (er) { /* navegador sem dataTransfer */ }
      });
      li.addEventListener('dragend', () => { arrastando = null; li.classList.remove('is-arrastando'); $$('.is-alvo', raiz).forEach(c => c.classList.remove('is-alvo')); });
      li.addEventListener('keydown', e => {
        if (e.target !== li) return;
        if (e.key === 'ArrowLeft' && ant) { e.preventDefault(); mover(k.id, ant.id, true); }
        if (e.key === 'ArrowRight' && prox) { e.preventDefault(); mover(k.id, prox.id, true); }
      });
      return li;
    }
    function pintar() {
      raiz.replaceChildren(...cols.map((c, ci) => {
        const doCol = o.cartoes.filter(k => k.coluna === c.id);
        const tid = uid('kb');
        const sec = h('section', { class: cls('ph-kanban-col', TONS.includes(c.tom) && 'tom-' + c.tom), 'aria-labelledby': tid },
          h('header', { class: 'ph-kanban-topo' }, h('h3', { id: tid }, c.titulo), h('span', { class: 'ph-kanban-n' }, String(doCol.length))),
          h('ul', { class: 'ph-kanban-lista' }, doCol.length ? doCol.map(k => cartaoK(k, ci)) : h('li', { class: 'ph-kanban-vazio' }, o.vazio || TX.colunaVazia)));
        sec.addEventListener('dragover', e => { if (arrastando == null) return; e.preventDefault(); sec.classList.add('is-alvo'); });
        sec.addEventListener('dragleave', e => { if (!sec.contains(e.relatedTarget)) sec.classList.remove('is-alvo'); });
        sec.addEventListener('drop', e => { e.preventDefault(); sec.classList.remove('is-alvo'); if (arrastando != null) mover(arrastando, c.id, false); });
        return sec;
      }));
    }
    pintar();
    raiz.atualizar = novos => { if (novos) o.cartoes = novos; pintar(); };
    return raiz;
  }

  function toast(texto, tom = 'ok') {
    let caixa = document.getElementById('ph-toasts');
    if (!caixa) { caixa = h('div', { class: 'ph-toasts dy-toast dy-toast-end dy-toast-bottom', id: 'ph-toasts', 'aria-live': 'polite' }); document.body.append(caixa); }
    const tm = TONS.includes(tom) ? tom : 'info';
    const el = h('div', { class: cls('ph-toast', 'tom-' + tm, 'dy-alert', 'dy-alert-soft', ALERTA_TOM[tm]), role: tm === 'erro' ? 'alert' : null },
      icone(tm === 'erro' ? 'circle-x' : tm === 'alerta' ? 'triangle-alert' : tm === 'ok' ? 'circle-check' : 'info'), h('span', null, texto));
    caixa.append(el);
    while (caixa.children.length > 3) caixa.firstElementChild.remove();
    setTimeout(() => { el.classList.add('is-saindo'); setTimeout(() => el.remove(), 260); }, 3800);
    return el;
  }

  /* ---------- camada modal: véu, foco preso, Esc, fundo inerte e empilhamento ----------
     Base do painel lateral, do modal, do rastro de back-end e da janela de ERP. Um diálogo pode abrir outro por cima. */
  const FOCAVEIS = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const topoDaPilha = () => Array.from(abertos).pop() || null;

  function camada(el, aoFechar) {
    /* SH-2: quem abriu pode ter sido redesenhado; o body não serve de retorno */
    const ativo = document.activeElement;
    const anterior = ativo && ativo !== document.body && ativo !== document.documentElement ? ativo : null;
    const appEl = document.getElementById('ph-app');
    const veu = h('div', { class: 'ph-veu' });
    let fechado = false;
    const ctl = {
      el,
      fechar(silencioso) {
        if (fechado) return;
        fechado = true;
        abertos.delete(ctl);
        el.remove();
        veu.remove();
        const topo = topoDaPilha();
        if (topo) topo.el.inert = false;
        else { document.documentElement.classList.remove('ph-travado'); if (appEl) appEl.inert = false; }
        if (aoFechar) { try { aoFechar(silencioso === true); } catch (e) { console.error('[Hub] falha ao fechar', e); } }
        if (silencioso === true || topoDaPilha() !== topo) return; // o retorno abriu outro diálogo: o foco é dele
        const alvo = topo ? (anterior && anterior.isConnected && topo.el.contains(anterior) ? anterior : topo.el)
          : (anterior && anterior.isConnected ? anterior : ($('.ph-abas-painel') || $('#ph-main')));
        if (alvo) alvo.focus({ preventScroll: true });
      },
    };
    veu.addEventListener('click', () => ctl.fechar());
    el.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); ctl.fechar(); return; }
      if (e.key !== 'Tab') return;
      const foco = $$(FOCAVEIS, el).filter(x => x.getClientRects().length);
      if (!foco.length) { e.preventDefault(); return; }
      const pri = foco[0], ult = foco[foco.length - 1];
      if (e.shiftKey && (document.activeElement === pri || document.activeElement === el)) { e.preventDefault(); ult.focus(); }
      else if (!e.shiftKey && document.activeElement === ult) { e.preventDefault(); pri.focus(); }
    });
    const abrir = alvoFoco => {
      fecharSuspensos(false);
      const n = abertos.size;
      veu.style.zIndex = String(90 + n * 2);
      el.style.zIndex = String(91 + n * 2);
      abertos.forEach(c => { c.el.inert = true; });
      document.body.append(veu, el);
      document.documentElement.classList.add('ph-travado');
      if (appEl) appEl.inert = true;
      abertos.add(ctl);
      requestAnimationFrame(() => { veu.classList.add('is-aberto'); el.classList.add('is-aberto'); });
      (alvoFoco || el).focus({ preventScroll: true });
      if (!el.contains(document.activeElement)) el.focus({ preventScroll: true }); // SH-3: o foco sempre entra no diálogo
    };
    return [ctl, abrir];
  }

  /* Ações de rodapé: aceita nós prontos (ui.botao) ou descrições { texto, tom, icone, aoClicar(ctl) }. */
  function acoesDe(lista, ctl) {
    return [lista].flat(Infinity).filter(Boolean).map(a => (a instanceof Node ? a : botao({ ...a, aoClicar: () => { if (a.aoClicar) a.aoClicar(ctl); else ctl.fechar(); } })));
  }

  function dialogo(el, corpo, rodape, btnFechar, o) {
    const [ctl, abrir] = camada(el, () => { if (o.aoFechar) o.aoFechar(); });
    let avisoEl = null;
    ctl.corpo = corpo;
    ctl.erro = msg => {
      if (avisoEl) avisoEl.remove();
      avisoEl = null;
      if (msg) { avisoEl = aviso(msg, 'erro'); corpo.prepend(avisoEl); corpo.scrollTop = 0; }
    };
    btnFechar.addEventListener('click', () => ctl.fechar());
    const conteudo = o.conteudo !== undefined ? o.conteudo : o.corpo;
    if (typeof conteudo === 'function') conteudo(corpo, ctl); else anexar(corpo, [conteudo]);
    const acoes = typeof o.acoes === 'function' ? o.acoes(ctl) : o.acoes;
    if (acoes) rodape.append(...acoesDe(acoes, ctl)); else rodape.remove();
    /* SH-3: o primeiro campo que pode receber foco (nunca um input escondido) */
    const primeiro = $$('input,select,textarea', corpo).find(x => x.getAttribute('type') !== 'hidden' && x.getAttribute('type') !== 'file' && !x.hidden && !x.hasAttribute('disabled') && x.getAttribute('tabindex') !== '-1');
    abrir(primeiro);
    return ctl;
  }

  function painel(o = {}) {
    const tid = uid('painel');
    const corpo = h('div', { class: 'ph-drawer-corpo' });
    const rodape = h('div', { class: 'ph-drawer-rodape' });
    const btnFechar = botao({ icone: 'fechar', titulo: TX.fechar, tom: 'fantasma' });
    const dr = h('div', { class: 'ph-drawer', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': tid, tabindex: '-1' },
      h('div', { class: 'ph-drawer-topo' }, h('h2', { class: 'ph-h2', id: tid }, o.titulo), btnFechar), corpo, rodape);
    return dialogo(dr, corpo, rodape, btnFechar, o);
  }

  function modal(o = {}) {
    const tid = uid('modal');
    const corpo = h('div', { class: 'ph-modal-corpo' });
    const rodape = h('div', { class: 'ph-modal-rodape' });
    const btnFechar = botao({ icone: 'fechar', titulo: TX.fechar, tom: 'fantasma' });
    const larg = { p: 420, m: 560, g: 820 }[o.largura] || (Number(o.largura) > 0 ? Number(o.largura) : 560);
    const el = h('div', { class: cls('ph-modal', o.classe), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': tid, tabindex: '-1', style: { '--ph-modal-larg': larg + 'px' } },
      h('div', { class: 'ph-modal-topo' }, h('h2', { class: 'ph-h2 ph-modal-titulo', id: tid }, o.icone && icone(o.icone), h('span', null, o.titulo)), btnFechar), corpo, rodape);
    return dialogo(el, corpo, rodape, btnFechar, o);
  }

  /* Bloco de código com rolagem própria. Aceita texto, {pt,en} ou um objeto (vira JSON identado). */
  function codigo(v, rotulo) {
    const texto = v != null && typeof v === 'object' && !ehBilingue(v) ? JSON.stringify(v, null, 2) : String(t(v));
    return h('div', { class: 'ph-codigo-bloco' },
      rotulo && h('span', { class: 'ph-codigo-rotulo' }, rotulo),
      h('pre', { class: 'ph-codigo', tabindex: '0', role: 'group', 'aria-label': rotulo || 'code' }, texto));
  }

  /* ---------- rastro do back-end: linha do tempo com os passos tipados entrando um a um ---------- */
  let moduloAtual = null;
  function backend(o = {}) {
    /* Na versão pública o passo leva só título, tipo, estado e tempo: requisição, resposta e detalhe (a regra escrita) nunca chegam à tela. */
    const pub = publico();
    const passos = (o.passos || []).filter(Boolean).map(p => ({
      ...(pub ? { tipo: p.tipo, titulo: p.titulo, ms: p.ms, estado: p.estado } : p),
      ms: Number.isFinite(p.ms) ? p.ms : 300 + Math.round(Math.random() * 600),
      estado: BE_ESTADOS[p.estado] ? p.estado : 'ok',
    }));
    const tipoDe = p => BE_TIPOS[p.tipo] || BE_TIPOS.api;
    const origem = moduloAtual;
    const vel = Number(o.velocidade) > 0 ? Number(o.velocidade) : 1;
    const tid = uid('be');
    const lista = h('ol', { class: 'ph-be-passos', 'aria-label': TX.beTitulo });
    const fim = h('div', { class: 'ph-be-fim' });
    const trilho = h('div', { class: 'ph-be-barra' });
    const progEl = h('div', { class: 'ph-be-trilho', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0', 'aria-label': TX.progresso }, trilho);
    const progTexto = h('span', { class: 'ph-be-prog-texto' }, TX.bePreparando);
    const progMs = h('span', { class: 'ph-be-prog-ms ph-num' }, '0 ms');
    const tiposUsados = passos.map(p => p.tipo in BE_TIPOS ? p.tipo : 'api').filter((v, i, a) => a.indexOf(v) === i);
    const corpo = h('div', { class: 'ph-modal-corpo' },
      (o.titulo || o.subtitulo) && h('div', { class: 'ph-be-cab' },
        o.titulo && h('p', { class: 'ph-h3' }, o.titulo),
        o.subtitulo && h('p', { class: 'ph-texto-mudo ph-texto-p' }, o.subtitulo)),
      h('p', { class: 'ph-be-intro' }, pub ? TX.beIntroPublico : TX.beIntro),
      h('div', { class: 'ph-be-legenda' }, h('span', null, TX.beTipos), tiposUsados.map(k => h('span', { class: 'ph-be-tipo dy-badge dy-badge-sm', style: { '--cor': 'var(--ph-cor-' + BE_TIPOS[k].cor + ')' } }, BE_TIPOS[k].rotulo))),
      h('div', { class: 'ph-be-progresso' }, h('div', { class: 'ph-be-prog-rot' }, progTexto, progMs), progEl),
      lista, fim);
    const status = h('span', { class: 'ph-be-status', role: 'status' });
    const btnPular = botao({ texto: TX.bePular, tamanho: 'p', tom: 'fantasma', aoClicar: () => pular() });
    const btnRepetir = botao({ texto: TX.beRepetir, icone: 'rotate-ccw', tamanho: 'p', aoClicar: () => rodar() });
    const btnOk = botao({ texto: TX.fechar, tamanho: 'p', tom: 'primario', aoClicar: () => ctl.fechar() });
    const btnX = botao({ icone: 'fechar', titulo: TX.fechar, tom: 'fantasma', aoClicar: () => ctl.fechar() });
    const el = h('div', { class: 'ph-modal ph-be', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': tid, tabindex: '-1', style: { '--ph-modal-larg': '720px' } },
      h('div', { class: 'ph-modal-topo' }, h('h2', { class: 'ph-h2 ph-modal-titulo', id: tid }, icone('workflow'), h('span', null, TX.beTitulo)), btnX),
      corpo,
      h('div', { class: 'ph-modal-rodape' }, status, btnPular, btnRepetir, btnOk));
    let timer = null;
    let i = 0;
    let acumulado = 0;
    let avisado = false;

    /* O resultado sai só da lista de passos: vale igual com animação, pulando ou fechando antes do fim. */
    function resultado() {
      const iErro = passos.findIndex(p => p.estado === 'erro');
      const feitos = iErro < 0 ? passos : passos.slice(0, iErro + 1);
      return {
        ok: iErro < 0,
        estado: iErro >= 0 ? 'erro' : feitos.some(p => p.estado === 'alerta') ? 'alerta' : 'ok',
        executados: feitos.length,
        total: passos.length,
        erro: iErro < 0 ? null : passos[iErro],
        ms: feitos.reduce((s, p) => s + (p.estado === 'pulado' ? 0 : p.ms), 0),
      };
    }
    function avisar() {
      if (avisado) return;
      avisado = true;
      if (o.aoConcluir) { try { o.aoConcluir(resultado()); } catch (e) { console.error('[Hub] falha em aoConcluir', e); } }
      auditarAcao(o, origem);
    }
    const rolar = () => { corpo.scrollTop = corpo.scrollHeight; };
    function progredir(feitos, texto) {
      const pct = passos.length ? Math.round(feitos / passos.length * 100) : 100;
      trilho.style.transform = 'scaleX(' + (pct / 100).toFixed(3) + ')';
      progEl.setAttribute('aria-valuenow', String(pct));
      if (texto != null) progTexto.textContent = String(t(texto));
      progMs.textContent = FMT.num(acumulado) + ' ms';
    }

    function itemPasso(p) {
      const tp = tipoDe(p);
      const marcaEl = h('span', { class: 'ph-be-marca' });
      const ms = h('span', { class: 'ph-be-ms ph-num' });
      const resp = h('div', { class: 'ph-be-resp' });
      const marco = h('span', { class: 'ph-be-marco' }, icone('circle-dashed'));
      const li = h('li', { class: 'ph-be-passo', style: { '--cor': 'var(--ph-cor-' + tp.cor + ')' } },
        marco,
        h('div', { class: 'ph-be-caixa' },
          h('div', { class: 'ph-be-linha' },
            h('span', { class: 'ph-be-ico' }, icone(tp.icone)),
            h('p', { class: 'ph-be-titulo' }, p.titulo),
            h('span', { class: 'ph-be-tags' }, h('span', { class: 'ph-be-tipo dy-badge dy-badge-sm' }, tp.rotulo), marcaEl, ms)),
          p.detalhe && h('p', { class: 'ph-be-detalhe' }, p.detalhe),
          p.requisicao != null && codigo(p.requisicao, t(TX.beRequisicao)),
          resp));
      return {
        li,
        rodando() {
          li.className = 'ph-be-passo is-rodando';
          marco.replaceChildren(h('span', { class: 'dy-loading dy-loading-spinner dy-loading-xs ph-gira', 'aria-hidden': 'true' }));
          marcaEl.replaceChildren(h('span', { class: 'ph-badge tom-info dy-badge dy-badge-sm' }, TX.beExecutando));
        },
        final() {
          const es = BE_ESTADOS[p.estado];
          li.className = 'ph-be-passo is-' + p.estado + ' tom-' + es.tom;
          marco.replaceChildren(icone(es.icone));
          marcaEl.replaceChildren(h('span', { class: cls('ph-badge', 'tom-' + es.tom, 'dy-badge dy-badge-sm') }, es.rotulo));
          ms.textContent = p.estado === 'pulado' ? '' : FMT.num(p.ms) + ' ms';
          if (p.resposta != null && p.estado !== 'pulado') resp.replaceChildren(codigo(p.resposta, t(TX.beResposta)));
        },
      };
    }

    function proximo() {
      if (i >= passos.length) return concluir();
      const p = passos[i];
      const it = itemPasso(p);
      lista.append(it.li);
      const rot = tx('bePasso', i + 1, passos.length) + ': ' + t(p.titulo);
      status.textContent = rot;
      if (p.estado === 'pulado') { it.final(); i++; progredir(i, rot); rolar(); timer = setTimeout(proximo, 160 / vel); return; }
      it.rodando();
      progredir(i, rot);
      rolar();
      /* a espera real é limitada a 1,4 s por passo; o tempo exibido continua sendo o ms informado */
      timer = setTimeout(() => {
        it.final();
        acumulado += p.ms;
        rolar();
        i++;
        progredir(i);
        if (p.estado === 'erro') return concluir();
        timer = setTimeout(proximo, 180 / vel);
      }, Math.max(120, Math.min(p.ms, 1400)) / vel);
    }
    function pular() {
      clearTimeout(timer);
      i = resultado().executados;
      lista.replaceChildren(...passos.slice(0, i).map(p => { const it = itemPasso(p); it.final(); return it.li; }));
      concluir();
    }
    function concluir() {
      clearTimeout(timer);
      timer = null;
      const r = resultado();
      const faltam = r.total - r.executados;
      acumulado = r.ms;
      const texto = tx('beFim', r.executados, r.total, FMT.num(r.ms));
      status.textContent = texto;
      progredir(r.total, texto);
      if (!r.ok) progEl.classList.add('is-erro'); else progEl.classList.remove('is-erro');
      fim.replaceChildren(...[
        faltam > 0 && aviso(tx('beParou', faltam), 'erro'),
        o.resumo && aviso(o.resumo, r.estado),
      ].filter(Boolean));
      const focoNoPular = document.activeElement === btnPular;
      btnPular.hidden = true;
      btnRepetir.hidden = false;
      if (focoNoPular) btnOk.focus();
      if (!semMovimento()) rolar();
      avisar();
    }
    function rodar() {
      clearTimeout(timer);
      i = 0;
      acumulado = 0;
      lista.replaceChildren();
      fim.replaceChildren();
      progEl.classList.remove('is-erro');
      progredir(0, TX.bePreparando);
      btnPular.hidden = false;
      btnRepetir.hidden = true;
      if (consulta('(prefers-reduced-motion: reduce)') || !passos.length) return pular();
      proximo();
    }

    const [ctl, abrir] = camada(el, silencioso => {
      clearTimeout(timer);
      if (!silencioso) avisar();
      if (o.aoFechar) o.aoFechar();
    });
    ctl.repetir = rodar;
    ctl.pular = pular;
    abrir(el);
    rodar();
    return ctl;
  }

  /* A ação de escrita de um sistema (o rastro concluído) entra na auditoria do hub. Consultas (GET) não entram.
     O tipo sai de o.escrita ('create' | 'update' | 'delete', o jeito da versão pública, que não leva requisição) ou do verbo da primeira requisição. */
  const ESCRITAS = ['create', 'update', 'delete'];
  function auditarAcao(o, origem) {
    if (!origem || !perfilId) return;
    let tipo = ESCRITAS.includes(o.escrita) ? o.escrita : '';
    if (!tipo) {
      const req = (o.passos || []).filter(Boolean).map(p => (p.requisicao != null && typeof p.requisicao !== 'object' ? String(t(p.requisicao)) : '')).find(Boolean) || '';
      const m = ((/^\s*(GET|POST|PUT|PATCH|DELETE)\b/i.exec(req) || [])[1] || '').toUpperCase();
      if (!/^(POST|PUT|PATCH|DELETE)$/.test(m)) return; // consulta e rotina sem requisição de escrita não entram
      tipo = m === 'POST' ? 'create' : m === 'DELETE' ? 'delete' : 'update';
    }
    const it = itemPorId(origem);
    const nomeSis = it ? it.nome : origem;
    const titulo = o.titulo || TX.beTitulo;
    const detalhes = o.subtitulo ? P(ptDe(nomeSis) + ': ' + ptDe(o.subtitulo), enDe(nomeSis) + ': ' + enDe(o.subtitulo)) : nomeSis;
    registrarAuditoria(titulo, tipo, detalhes, origem, origem);
  }

  /* ---------- janela de ERP simulado: documento com o visual do hub e o selo de simulação ---------- */
  function erp(o = {}) {
    const tid = uid('erp');
    const vel = Number(o.velocidade) > 0 ? Number(o.velocidade) : 1;
    const fila = []; // células na ordem em que o robô preenche
    const statusEl = h('span', { class: 'ph-erp-status-texto', role: 'status' });

    const aoTerminar = []; // o que só aparece quando o preenchimento acaba (detalhe da linha selecionada)
    const anima = fixo => !!o.preencher && !fixo;
    function blocoCampos(campos, antes, fixo) {
      const lista = (campos || []).filter(Boolean);
      if (!lista.length) return null;
      return h('div', { class: 'ph-erp-campos' }, lista.map(c => {
        const texto = String(t(c.valor));
        const alvo = h('span', { class: 'ph-erp-valor', title: texto }, anima(fixo) ? '' : texto);
        const el = h('div', { class: cls('ph-erp-campo', 'l' + Math.min(4, Math.max(1, Math.round(Number(c.largura)) || 1)), c.destaque && 'is-destaque') },
          h('span', { class: 'ph-erp-rotulo' }, c.rotulo), alvo);
        if (anima(fixo)) fila.push({ el, alvo, texto, antes });
        return el;
      }));
    }
    /* grupo com título (moldura): campos e/ou grade */
    function blocoGrupos(grupos, antes) {
      return (grupos || []).filter(Boolean).map(g => h('fieldset', { class: 'ph-erp-grupo' }, g.titulo && h('legend', null, g.titulo), blocoCampos(g.campos, antes), blocoGrade(g.grade, antes)));
    }
    function blocoGrade(g, antes) {
      if (!g) return null;
      const temDet = typeof g.detalhe === 'function';
      const det = temDet ? h('div', { class: 'ph-erp-detalhe', hidden: o.preencher ? true : null }) : null;
      const selecionar = k => {
        linhas.forEach((tr, j) => { if (j === k) tr.classList.add('is-sel'); else tr.classList.remove('is-sel'); tr.setAttribute('aria-selected', String(j === k)); });
        const d = g.detalhe(k) || {};
        det.replaceChildren(h('fieldset', { class: 'ph-erp-grupo' }, d.titulo && h('legend', null, d.titulo), blocoCampos(d.campos, null, true)));
      };
      const cols = (g.colunas || []).map(c => (c != null && typeof c === 'object' && !ehBilingue(c) ? c : { rotulo: c }));
      const num = k => (cols[k] && cols[k].tipo === 'numero' ? 'is-num' : null);
      const linhas = (g.linhas || []).map(l => {
        const tr = h('tr', { hidden: o.preencher ? true : null }, l.map((c, k) => h('td', { class: num(k) }, c == null ? '' : typeof c === 'number' ? String(c) : c)));
        if (o.preencher) fila.push({ el: tr, linha: true, antes });
        return tr;
      });
      if (temDet) linhas.forEach((tr, k) => {
        tr.classList.add('is-clicavel');
        tr.tabIndex = 0;
        tr.addEventListener('click', () => selecionar(k));
        tr.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selecionar(k); } });
      });
      const wrap = h('div', { class: 'ph-erp-grade-wrap', tabindex: '0', role: 'region', 'aria-label': TX.erpItens, style: g.alturaMax ? { '--ph-erp-grade-max': (Number(g.alturaMax) || 190) + 'px' } : null },
        h('table', { class: 'ph-erp-grade dy-table dy-table-xs' },
          h('thead', null, h('tr', null, cols.map((c, k) => h('th', { scope: 'col', class: num(k) }, c.rotulo)))),
          h('tbody', null, linhas),
          g.total && h('tfoot', null, h('tr', null, g.total.map((c, k) => h('td', { class: num(k) }, c == null ? '' : typeof c === 'number' ? String(c) : c))))));
      if (temDet && linhas.length) { selecionar(0); if (o.preencher) aoTerminar.push(() => { det.hidden = false; }); }
      return temDet ? [wrap, det] : wrap;
    }

    const topo = blocoCampos(o.campos);
    const abasO = (o.abas || []).filter(Boolean);
    const paineis = abasO.map((a, k) => h('div', { class: 'ph-erp-aba-painel', role: 'tabpanel', hidden: k ? true : null },
      blocoCampos(a.campos, () => irAba(k)), blocoGrade(a.grade, () => irAba(k)), blocoGrupos(a.grupos, () => irAba(k))));
    const botoesAba = abasO.map((a, k) => h('button', {
      type: 'button', role: 'tab', class: cls('ph-erp-aba', 'dy-tab', k === 0 && 'dy-tab-active'), 'aria-selected': String(k === 0), tabindex: k ? '-1' : '0',
      onclick: () => irAba(k),
      onkeydown: e => {
        const n = e.key === 'ArrowRight' ? (k + 1) % abasO.length : e.key === 'ArrowLeft' ? (k - 1 + abasO.length) % abasO.length : -1;
        if (n < 0) return;
        e.preventDefault();
        irAba(n);
        botoesAba[n].focus();
      },
    }, a.rotulo));
    function irAba(n) {
      botoesAba.forEach((b, k) => { b.setAttribute('aria-selected', String(k === n)); b.tabIndex = k === n ? 0 : -1; if (k === n) b.classList.add('dy-tab-active'); else b.classList.remove('dy-tab-active'); });
      paineis.forEach((p, k) => { p.hidden = k !== n; });
    }
    const gradeTopo = blocoGrade(o.grade);

    const acoesO = (o.acoes || []).filter(Boolean);
    const botoesAcao = (acoesO.length ? acoesO : [{ texto: TX.fechar }]).map(a => h('button', {
      type: 'button', class: cls('ph-erp-btn', 'dy-btn', 'dy-btn-sm', a.tom === 'primario' ? 'is-padrao dy-btn-primary' : 'ph-btn-neutro'), disabled: o.preencher ? true : null,
      onclick: () => { if (a.aoClicar) a.aoClicar(ctl); else ctl.fechar(); },
    }, a.texto));
    const btnPular = h('button', { type: 'button', class: 'ph-erp-btn dy-btn dy-btn-sm dy-btn-ghost', hidden: true, onclick: () => terminar() }, TX.bePular);
    const btnX = h('button', { type: 'button', class: 'ph-erp-x dy-btn dy-btn-ghost dy-btn-sm dy-btn-square', 'aria-label': TX.fechar, title: TX.fechar, onclick: () => ctl.fechar() }, icone('fechar'));
    const corpo = h('div', { class: 'ph-erp-corpo' },
      topo,
      blocoGrupos(o.grupos),
      abasO.length > 0 && h('div', { class: 'ph-erp-abas-raiz' }, h('div', { class: 'ph-erp-abas dy-tabs dy-tabs-lift', role: 'tablist', 'aria-label': TX.erpAbas }, botoesAba), paineis),
      gradeTopo);
    const el = h('div', { class: 'ph-modal ph-erp', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': tid, tabindex: '-1',
      style: { '--ph-modal-larg': (Number(o.largura) > 0 ? Number(o.largura) : 860) + 'px', '--ph-erp-cols': String(Math.min(8, Math.max(4, Math.round(Number(o.colunas)) || 4))) } },
      h('div', { class: 'ph-erp-titulo' },
        h('span', { class: 'ph-erp-luzes', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
        h('span', { class: 'ph-erp-kicker', 'aria-hidden': 'true' }, TX.erpJanela),
        h('h2', { class: 'ph-erp-titulo-texto', id: tid }, o.codigo && [o.codigo, ' - '], o.programa),
        btnX),
      h('p', { class: 'ph-erp-selo' }, icone('shield-check'), h('span', null, TX.erpSelo)),
      corpo,
      h('div', { class: 'ph-erp-status' }, h('span', { class: 'ph-erp-led', 'aria-hidden': 'true' }), statusEl, h('span', { class: 'ph-erp-modo' }, 'DEMO'), h('span', { class: 'ph-erp-modo' }, o.consulta ? TX.erpModoConsulta : 'INS')),
      h('div', { class: 'ph-erp-acoes' }, btnPular, botoesAcao));

    let timer = null;
    let i = 0;
    let pos = 0;
    let avisado = false;
    const narr = o.narracao && o.narracao.length ? o.narracao : t(TX.erpNarracao);
    function avisar() {
      if (avisado || !o.preencher) return;
      avisado = true;
      if (o.aoConcluir) { try { o.aoConcluir(ctl); } catch (e) { console.error('[Hub] falha em aoConcluir', e); } }
    }
    function passo() {
      if (i >= fila.length) return terminar();
      const it = fila[i];
      if (pos === 0) {
        if (it.antes) it.antes();
        statusEl.textContent = t(narr[Math.min(narr.length - 1, Math.floor(i / fila.length * narr.length))]);
        it.el.classList.add('is-gravando');
        if (it.el.scrollIntoView) it.el.scrollIntoView({ block: 'nearest' });
        if (it.linha) { it.el.hidden = false; pos = 1; timer = setTimeout(passo, 170 / vel); return; }
      }
      if (!it.linha && pos < it.texto.length) {
        pos = Math.min(it.texto.length, pos + Math.max(1, Math.ceil(it.texto.length / 8)));
        it.alvo.textContent = it.texto.slice(0, pos);
        timer = setTimeout(passo, 32 / vel);
        return;
      }
      it.el.classList.remove('is-gravando');
      i++;
      pos = 0;
      timer = setTimeout(passo, 90 / vel);
    }
    function terminar() {
      clearTimeout(timer);
      timer = null;
      fila.forEach(it => { it.el.classList.remove('is-gravando'); if (it.linha) it.el.hidden = false; else it.alvo.textContent = it.texto; });
      i = fila.length;
      el.classList.remove('is-preenchendo');
      statusEl.textContent = t(o.rodape != null ? o.rodape : (o.preencher ? TX.erpGravado : o.consulta ? TX.erpConsulta : TX.erpPronto));
      aoTerminar.forEach(f => f());
      const focoNoPular = document.activeElement === btnPular;
      btnPular.hidden = true;
      botoesAcao.forEach(b => b.removeAttribute('disabled'));
      if (focoNoPular) botoesAcao[0].focus();
      avisar();
    }

    const [ctl, abrir] = camada(el, silencioso => {
      clearTimeout(timer);
      if (!silencioso) avisar();
      if (o.aoFechar) o.aoFechar();
    });
    ctl.status = texto => { statusEl.textContent = String(t(texto)); };
    ctl.pular = terminar;
    abrir(el);
    if (o.preencher && fila.length && !consulta('(prefers-reduced-motion: reduce)')) { el.classList.add('is-preenchendo'); btnPular.hidden = false; passo(); } else terminar();
    return ctl;
  }

  const KIT = { botao, badge, kpis, aviso, vazio, esqueleto, carregar, cartao, busca, select, campo, marcar, form, chips, tabela, progresso, barras, linhaTempo, kanban, toast, painel, modal, codigo, backend, erp };

  /* Cartão "fora da demonstração pública" (versão pública: só a tela principal de cada sistema é navegável).
     Nos sistemas com vídeo no catálogo, mostra o vídeo da versão completa: sem som, em repetição, com pôster e controles;
     com movimento reduzido (ou alto contraste) não começa sozinho. Os caminhos do catálogo partem da raiz do site (a demo fica em demo/). */
  function foraDaDemo(o, id) {
    const midia = videoDoCatalogo(id);
    const contato = h('div', { class: 'ph-fora-contato' },
      h('p', { class: 'ph-fora-contato-titulo' }, TX.foraContatoTitulo), h('p', { class: 'ph-texto-mudo' }, TX.foraContatoTexto), linksContato());
    return cartao({ classe: 'ph-fora', icone: 'lock', titulo: tx('foraTitulo', o.titulo ? t(o.titulo) : ''), conteudo: [h('p', { class: 'ph-texto-mudo' }, TX.foraTexto), midia, contato] });
  }
  /* o vídeo da versão completa (catálogo): no cartão "fora da demonstração" e no fim do tour de um sistema que não tem esse cartão */
  function videoDoCatalogo(id) {
    const c = CATALOGO.find(x => x.id === id);
    if (!c || !c.video) return null;
    const it = itemPorId(id);
    const anda = !semMovimento();
    const outra = c.video.replace(/\.(mp4|webm)$/, (m, e) => (e === 'mp4' ? '.webm' : '.mp4')); // aceita as duas extensões: a que existir toca
    const v = h('video', { class: 'ph-fora-video', muted: true, loop: true, playsinline: true, controls: true, autoplay: anda, preload: anda ? 'auto' : 'none', poster: c.poster && '../' + c.poster, 'aria-label': tx('foraVideoRotulo', t(it ? it.nome : id)) },
      [c.video, outra].map(src => h('source', { src: '../' + src, type: 'video/' + src.split('.').pop() })));
    v.muted = true;            // o atributo sozinho não liga o mudo de um vídeo criado por script, e sem mudo o navegador não toca sozinho
    v.defaultMuted = true;
    return h('figure', { class: 'ph-fora-midia' }, v, h('figcaption', null, TX.foraVideo));
  }
  /* LinkedIn e e-mail da versão completa: os mesmos no cartão "fora da demonstração" e no fim do tour */
  function linksContato() {
    const link = (href, ic, texto, tom) => h('a', { class: cls('ph-btn', 'ph-btn--' + tom, 'dy-btn', BTN_TOM[tom], 'ph-btn--p dy-btn-sm'), href, target: '_blank', rel: 'noopener' }, icone(ic), h('span', null, texto));
    return h('div', { class: 'ph-linha' }, link(CONTATO.linkedin, 'externo', TX.foraLinkedin, 'primario'), link('mailto:' + CONTATO.email, 'email', TX.foraEmail, 'secundario'));
  }

  function criarApi(id) {
    if (!estados.has(id)) estados.set(id, {});
    const estado = estados.get(id);
    return Object.freeze({
      id, lang, t, h, icone, fmt: FMT, estado,
      publico: publico(),
      data: dataRel,
      depois,
      /* ir('controle_veiculos') abre o sistema; ir('controle_veiculos/manual') abre o manual; ir('') volta ao painel. */
      ir: rota => { location.hash = '#/' + String(rota == null ? '' : rota).replace(/^#?\/?/, ''); },
      ui: Object.freeze({ ...KIT, abas: o => abas(o || {}, estado), foraDaDemo: o => foraDaDemo(o || {}, id) }),
    });
  }

  /* ---------- casca ---------- */
  let app, nav, main, migalhas, coluna;
  let limpeza = null;
  let montagem = 0;
  const filtroInicio = { termo: '', grupo: '' };
  const telaEstado = {}; // preferências das telas do hub (aba de configurações etc.)

  function rotaAtual() {
    let bruto = location.hash.replace(/^#\/?/, '');
    try { bruto = decodeURIComponent(bruto); } catch (e) { /* hash malformado: usa como veio */ }
    const partes = bruto.split('/').filter(Boolean);
    return { id: partes[0] || '', sub: partes[1] || '', bruto: partes.join('/') };
  }
  /* troca a rota sem criar entrada nova no histórico */
  function substituirRota(rota) {
    const alvo = '#/' + rota;
    try { if (window.history && history.replaceState) { history.replaceState(null, '', alvo); rotear(false); return; } } catch (e) { /* segue pelo hash */ }
    location.hash = alvo;
    rotear(false);
  }
  function irPara(rota) {
    const alvo = '#/' + rota;
    if (location.hash === alvo || (alvo === '#/' && !location.hash)) rotear(true); else location.hash = alvo;
  }

  function pintarCasca() {
    const raiz = document.documentElement;
    raiz.lang = lang === 'en' ? 'en' : 'pt-BR';
    raiz.setAttribute('data-visual', visualAplicado());
    $$('[data-i18n]').forEach(el => { const v = TX[el.dataset.i18n]; if (v) el.textContent = t(v); });
    $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(par => {
      const [attr, chave] = par.split(':');
      if (TX[chave]) el.setAttribute(attr, t(TX[chave]));
    }));
    $$('[data-lang]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    $$('[data-tema]').forEach(b => b.setAttribute('aria-pressed', String(normVisual(b.dataset.tema) === visual)));
    $$('[data-tema-nome]').forEach(el => { const v = VISUAIS[el.getAttribute('data-tema-nome')]; if (v) el.textContent = t(v.rotulo); });
    $$('[data-tema-desc]').forEach(el => { const v = VISUAIS[el.getAttribute('data-tema-desc')]; if (v) el.textContent = t(v.desc); });
    $$('[data-tema-select]').forEach(s => { s.value = visual; });
    $$('[data-tema-radio]').forEach(r => { r.checked = r.value === visual; });
    $$('[data-contraste-chave]').forEach(c => { c.checked = altoContraste; });
    $$('[data-contraste-nota]').forEach(n => { n.hidden = !altoContraste; });
    const cor = $('meta[name="theme-color"]');
    if (cor) cor.setAttribute('content', altoContraste ? '#000000' : VISUAIS[visual].cor);
    pintarUsuario();
    pintarAvisoPerfil();
  }

  /* Menu recolhido (trilho de ícones): recolhe sozinho ao entrar num sistema e volta aberto nas telas do hub.
     Se a pessoa abrir dentro do sistema, fica aberto até ela recolher ou trocar de sistema. Só no computador: no celular a gaveta não muda. */
  let menuRecolhido = false;
  let sistemaDoMenu = '';
  let fechadosNav = []; // grupos que a pessoa fechou no menu aberto (o trilho não tem grupos para fechar)

  function pintarNav() {
    if (!nav) return;
    /* redesenhar o menu não fecha grupo nem tira o foco de quem está nele (um módulo pode chegar no meio da navegação) */
    const focaveis = () => $$('a, summary', nav);
    const iFoco = focaveis().indexOf(document.activeElement);
    const hrefFoco = iFoco >= 0 ? document.activeElement.getAttribute('href') : null;
    const grupos = $$('details', nav);
    if (grupos.length) fechadosNav = grupos.filter(d => !d.hasAttribute('open')).map(d => d.getAttribute('data-grupo'));
    const trilho = menuRecolhido && consulta('(min-width: 1024px)');
    const trocou = !!app && app.classList.contains('ph-recolhido') !== trilho; // trilho <-> aberto: a lista muda, o índice do foco não vale
    esconderDica();
    if (app) app.classList[trilho ? 'add' : 'remove']('ph-recolhido');
    $$('[data-acao="recolher-menu"]').forEach(b => {
      const rotulo = t(trilho ? TX.expandirMenu : TX.recolherMenu);
      b.setAttribute('aria-expanded', String(!trilho));
      b.setAttribute('aria-label', rotulo);
      b.setAttribute('data-dica', rotulo);
      b.replaceChildren(icone(trilho ? 'panel-left-open' : 'panel-left-close'));
    });
    const atual = rotaAtual();
    const p = perfil();
    const link = (href, rotulo, ic, ativo, extra) => h('li', null, h('a', { class: cls('ph-nav-item', ativo && 'dy-menu-active'), href, 'aria-current': ativo ? 'page' : null, 'data-dica': trilho ? rotulo : null }, icone(ic), h('span', { class: 'ph-cresce' }, rotulo), extra));
    const blocos = [link('#/', TX.painelInicial, 'layout-dashboard', !atual.id)];
    if (!trilho) blocos.push(h('li', { class: 'dy-menu-title ph-nav-titulo' }, TX.departamentos));
    for (const g of gruposComItens(itens())) {
      const lista = g.itens.map(it => link('#/' + it.id, it.nome, it.icone, it.id === atual.id,
        !temDemo(it) && h('span', { class: 'vh' }, ' ', TX.emPreparacaoParen)));
      blocos.push(trilho
        ? h('li', { class: 'ph-trilho-grupo', style: { '--cor': corGrupo(g.id) } }, h('ul', { 'aria-label': g.nome }, lista))
        : h('li', { class: 'ph-nav-grupo' }, h('details', { open: !fechadosNav.includes(g.id), 'data-grupo': g.id },
          h('summary', null, icone(g.icone), h('span', { class: 'ph-cresce' }, g.nome)), h('ul', null, lista))));
    }
    if (p && p.admin && !trilho) {
      blocos.push(h('li', { class: 'dy-menu-title ph-nav-titulo' }, TX.administracao));
      const adm = atual.id === 'admin' ? atual.sub : '';
      blocos.push(link('#/admin/usuarios', TX.usuarios, 'users', adm === 'usuarios'));
      blocos.push(link('#/admin/departamentos', TX.departamentos, 'building-2', adm === 'departamentos'));
      blocos.push(link('#/admin/auditoria', TX.auditoria, 'scroll-text', adm === 'auditoria', h('span', { class: 'ph-pulso tom-info', 'aria-hidden': 'true' })));
      blocos.push(link('#/admin/configuracoes', TX.configuracoes, 'settings', adm === 'configuracoes'));
    }
    nav.replaceChildren(h('ul', { class: 'dy-menu ph-menu' }, blocos));
    const ativo = nav.querySelector('[aria-current="page"]');
    if (iFoco >= 0) {
      const lista = focaveis();
      const alvo = !trocou ? lista[iFoco] : lista.find(a => hrefFoco && a.getAttribute('href') === hrefFoco) || ativo || lista[0];
      if (alvo) alvo.focus({ preventScroll: !trocou });
    } else if (trocou && ativo && ativo.scrollIntoView) ativo.scrollIntoView({ block: 'nearest' }); // ao recolher ou abrir, o item atual fica à vista
  }

  function pintarMigalhas(partes) {
    if (!migalhas) return;
    migalhas.setAttribute('aria-label', t(TX.vocEsta));
    const lista = [{ texto: TX.painelInicial, href: '#/' }, ...(partes || [])];
    if (lista.length === 1) lista[0] = { texto: TX.painelInicial };
    migalhas.replaceChildren(h('ul', null, lista.map((p, i) => h('li', null,
      i === lista.length - 1 ? h('span', { 'aria-current': 'page' }, p.texto) : p.href ? h('a', { href: p.href }, p.texto) : h('span', null, p.texto)))));
    migalhas.scrollLeft = migalhas.scrollWidth || 0; // sem espaço, a página atual (a última) é a que fica à vista
  }

  /* ---------- cabeçalho: painéis suspensos (busca, tema e idioma, usuário) ---------- */
  const suspensos = [];
  function ligarSuspenso(btn, pn, aoAbrir) {
    if (!btn || !pn) return;
    const reg = { btn, pn, aberto: false };
    reg.abrir = () => {
      fecharSuspensos(false, reg);
      reg.aberto = true;
      pn.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.classList.add('dy-btn-active');
      const alvo = (aoAbrir && aoAbrir()) || $(FOCAVEIS, pn);
      if (alvo) alvo.focus();
    };
    reg.fechar = devolver => {
      if (!reg.aberto) return;
      reg.aberto = false;
      pn.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      btn.classList.remove('dy-btn-active');
      if (devolver) btn.focus();
    };
    btn.addEventListener('click', () => (reg.aberto ? reg.fechar(false) : reg.abrir()));
    const esc = e => { if (e.key === 'Escape' && reg.aberto) { e.stopPropagation(); reg.fechar(true); } };
    btn.addEventListener('keydown', esc);
    pn.addEventListener('keydown', esc);
    pn.addEventListener('focusout', e => { if (reg.aberto && e.relatedTarget && !pn.contains(e.relatedTarget) && e.relatedTarget !== btn) reg.fechar(false); });
    suspensos.push(reg);
  }
  function fecharSuspensos(devolver, exceto) { suspensos.forEach(r => { if (r !== exceto) r.fechar(devolver); }); }

  function itensBusca() {
    const p = perfil();
    const base = [{ rotulo: TX.painelInicial, href: '#/', grupo: 'Hub', icone: 'layout-dashboard', extra: '' }]
      .concat(itens().map(x => ({ rotulo: x.nome, href: '#/' + x.id, grupo: nomeGrupo(x.grupo), icone: x.icone, extra: [t(x.resumo), ...tecsDe(x)].join(' ') })));
    if (p && p.admin) [['usuarios', TX.usuarios, 'users'], ['departamentos', TX.departamentos, 'building-2'], ['auditoria', TX.auditoria, 'scroll-text']]
      .forEach(([r, rot, ic]) => base.push({ rotulo: rot, href: '#/admin/' + r, grupo: t(TX.administracao), icone: ic, extra: '' }));
    if (p) base.push({ rotulo: TX.configuracoes, href: '#/admin/configuracoes', grupo: t(p.admin ? TX.administracao : TX.configConta), icone: 'settings', extra: t(TX.contraste) });
    return base;
  }
  function pintarBusca(q) {
    const lista = $('#ph-busca-lista');
    const st = $('#ph-busca-status');
    if (!lista) return;
    const termo = norm(q.trim());
    const achados = itensBusca().filter(i => !termo || norm([t(i.rotulo), i.grupo, i.extra].join(' ')).includes(termo)).slice(0, 12);
    lista.replaceChildren(achados.length
      ? h('ul', { class: 'dy-menu ph-busca-menu' }, achados.map(i => h('li', null, h('a', { href: i.href, onclick: () => fecharSuspensos(false) }, icone(i.icone), h('span', { class: 'ph-cresce' }, i.rotulo), h('span', { class: 'ph-busca-grupo' }, i.grupo)))))
      : h('p', { class: 'ph-busca-vazia' }, tx('nadaBusca', q)));
    if (st) st.textContent = tx('resultadosBusca', achados.length);
  }

  function pintarUsuario() {
    const p = perfil();
    const av = $('#ph-usuario-av');
    const btn = $('#ph-usuario-btn');
    const pn = $('#ph-usuario-painel');
    const rod = $('#ph-lado-usuario');
    if (av) av.textContent = p ? iniciais(p.nome) : '';
    if (btn) btn.setAttribute('aria-label', p ? tx('menuUsuario', t(p.nome)) : t(TX.usuario));
    if (rod) {
      rod.replaceChildren(...(p ? [h('span', { class: 'ph-av ph-av-sm', 'aria-hidden': 'true' }, iniciais(p.nome)), h('span', { class: 'ph-lado-nome' }, t(p.nome), ' · ', t(p.rotulo))] : []));
      if (p) rod.setAttribute('data-dica', t(p.nome) + ' · ' + t(p.rotulo)); else rod.removeAttribute('data-dica');
    }
    if (!pn) return;
    if (!p) { pn.replaceChildren(); return; }
    const deps = dadosHub().deptos;
    pn.replaceChildren(
      h('div', { class: 'ph-perfil-cab' }, h('span', { class: 'ph-av ph-av-lg', 'aria-hidden': 'true' }, iniciais(p.nome)),
        h('div', null, h('strong', null, p.nome), h('span', null, p.email))),
      h('div', { class: 'ph-tags' }, badge(p.rotulo, p.super ? 'alerta' : p.admin ? 'info' : 'neutro'), p.deptos.map(d => { const dp = deps.find(x => x.id === d); return dp ? badge(dp.nome, 'ok') : null; })),
      h('p', { class: 'ph-somente' }, p.descricao),
      h('ul', { class: 'dy-menu ph-painel-menu' },
        h('li', null, h('a', { href: '#/admin/configuracoes', onclick: () => fecharSuspensos(false) }, icone('settings'), h('span', null, TX.configConta))),
        h('li', null, h('button', { type: 'button', onclick: () => trocarPerfil() }, icone('arrow-left-right'), h('span', null, TX.trocarPerfil))),
        h('li', null, h('a', { href: '../index.html' }, icone('voltar'), h('span', null, TX.voltarPortfolio)))),
      botao({ texto: TX.sair, icone: 'log-out', tom: 'perigo', classe: 'dy-btn-block', aoClicar: () => sair() }));
  }

  function pintarAvisoPerfil() {
    const caixa = $('#ph-aviso-perfil');
    if (!caixa) return;
    const mostrar = perfilAuto && !avisoPerfilFechado && rotaAtual().id !== 'entrar';
    caixa.hidden = !mostrar;
    if (!mostrar) { caixa.replaceChildren(); return; }
    caixa.replaceChildren(h('div', { class: 'ph-aviso-perfil-caixa dy-alert dy-alert-info dy-alert-soft', role: 'status' },
      icone('info'),
      h('p', null, TX.avisoAuto),
      h('div', { class: 'ph-linha' },
        botao({ texto: TX.trocarPerfil, icone: 'arrow-left-right', tamanho: 'p', tom: 'primario', aoClicar: () => trocarPerfil() }),
        botao({ icone: 'fechar', titulo: TX.fecharAviso, tamanho: 'p', tom: 'fantasma', aoClicar: () => { avisoPerfilFechado = true; pintarAvisoPerfil(); const m = main && (main.querySelector('[data-foco]') || main); if (m) m.focus(); } }))));
  }

  /* relógio do cabeçalho e do menu (texto, sem região viva) */
  function relogio() {
    const txtH = horaSeg(new Date());
    $$('[data-relogio]').forEach(r => { r.textContent = txtH; });
    setTimeout(relogio, 1000 - (Date.now() % 1000) + 20);
  }

  /* dica do trilho: o nome ao lado do ícone, no mouse e no foco do teclado. O nome acessível já está no próprio item, então a dica fica fora da árvore de acessibilidade.
     O botão de recolher só tem ícone, então mostra a dica também com o menu aberto. */
  let dica = null;
  function esconderDica() { if (dica) dica.hidden = true; }
  function mostrarDica(alvo) {
    const texto = alvo && app && (app.classList.contains('ph-recolhido') || alvo.getAttribute('data-acao') === 'recolher-menu') && alvo.getAttribute('data-dica');
    if (!texto) { esconderDica(); return; }
    if (!dica) { dica = h('div', { class: 'ph-dica', 'aria-hidden': 'true' }); document.body.append(dica); }
    const r = alvo.getBoundingClientRect();
    dica.textContent = texto;
    dica.style.left = Math.round(r.right + 10) + 'px';
    dica.style.top = Math.round(r.top + r.height / 2) + 'px';
    dica.hidden = false;
  }

  /* ---------- menu lateral no celular (drawer do daisyUI) ---------- */
  const menuAberto = () => !!(app && app.classList.contains('menu-aberto'));
  function abrirMenu() {
    if (!app) return;
    app.classList.add('menu-aberto');
    const chk = $('#ph-drawer'); if (chk) chk.checked = true;
    $$('[data-acao="abrir-menu"]').forEach(b => b.setAttribute('aria-expanded', 'true'));
    if (coluna) coluna.inert = true;
    $$('.ph-pular').forEach(b => { b.inert = true; }); // SH-6: o Tab não sai do menu
    /* o drawer do daisyUI só fica visível depois da transição; o foco entra quando der */
    const alvo = nav && (nav.querySelector('[aria-current]') || nav.querySelector('a'));
    const focar = n => { if (!alvo || !menuAberto()) return; alvo.focus(); if (document.activeElement !== alvo && n < 8) setTimeout(() => focar(n + 1), 60); };
    focar(0);
  }
  function fecharMenu(devolverFoco) {
    if (!menuAberto()) return;
    app.classList.remove('menu-aberto');
    const chk = $('#ph-drawer'); if (chk) chk.checked = false;
    $$('[data-acao="abrir-menu"]').forEach(b => b.setAttribute('aria-expanded', 'false'));
    if (coluna) coluna.inert = false;
    $$('.ph-pular').forEach(b => { b.inert = false; });
    if (devolverFoco) { const b = $('[data-acao="abrir-menu"]'); if (b) b.focus(); }
  }

  /* ---------- idioma, tema e perfil ---------- */
  function trocarLang(novo) {
    if (novo !== 'pt' && novo !== 'en') return;
    if (novo === lang) return;
    lang = novo;
    gravar(CHAVE_LANG, lang);
    pintarCasca();
    rotear(false, true);
    tourPintar(); // o balão do tour (ou o convite) acompanha o idioma
  }
  /* O tema muda só o CSS (tokens): a tela não é remontada e nada se perde. */
  function trocarVisual(novo, silencioso) {
    if (ehContraste(novo)) { trocarContraste(true, silencioso); return; } // nome antigo do alto contraste
    const v = normVisual(novo);
    if (!v || v === visual) return;
    visual = v;
    gravar(CHAVE_VISUAL, visual);
    pintarCasca();
    if (!silencioso && perfilId) registrarAuditoria(P('Configuração alterada', 'Setting changed'), 'update', P('Tema da interface: ' + VISUAIS[v].rotulo.pt, 'Interface theme: ' + VISUAIS[v].rotulo.en), 'aparencia');
  }
  /* Alto contraste para acessibilidade: liga sobre qualquer tema e guarda a escolha à parte do tema. */
  function trocarContraste(liga, silencioso) {
    liga = !!liga;
    if (liga === altoContraste) return;
    altoContraste = liga;
    gravar(CHAVE_CONTRASTE, liga ? '1' : '0');
    pintarCasca();
    if (!silencioso && perfilId) registrarAuditoria(P('Configuração alterada', 'Setting changed'), 'update', P('Alto contraste: ' + (liga ? 'ligado' : 'desligado'), 'High contrast: ' + (liga ? 'on' : 'off')), 'aparencia');
  }
  function entrarComo(id, auto) {
    if (!PERFIS[id]) id = 'visitante';
    perfilId = id;
    perfilAuto = !!auto;
    perfilEdit = {};
    avisoPerfilFechado = false;
    const d = dadosHub();
    d.depSel = PERFIS[id].deptos[0] || 'fiscal';
    if (!auto) { gravar(CHAVE_PERFIL, id); gravar(CHAVE_PERFIL + '-ultimo', id); }
    pintarNav();
    pintarUsuario();
  }
  function trocarPerfil() {
    fecharSuspensos(false);
    const r = rotaAtual();
    retornoLogin = r.id && r.id !== 'entrar' ? r.bruto : retornoLogin;
    irPara('entrar');
  }
  function sair() {
    fecharSuspensos(false);
    perfilId = null;
    perfilAuto = false;
    perfilEdit = {};
    retornoLogin = '';
    apagar(CHAVE_PERFIL);
    irPara('entrar');
    toast(TX.sessaoEncerrada, 'info');
  }

  /* ---------- telas ---------- */
  function cabecalho(o) {
    return h('section', { class: cls('ph-cabecalho', o.classe), 'aria-labelledby': 'ph-h1' },
      h('div', { class: 'ph-cab-linha' },
        h('div', { class: 'ph-cab-titulo' },
          o.kicker && h('p', { class: 'ph-kicker' }, o.kicker),
          h('h1', { class: 'ph-titulo-grad', id: 'ph-h1', tabindex: '-1', 'data-foco': '' }, h('span', { class: 'ph-fita' }, o.titulo)),
          o.sub && h('p', { class: 'ph-sub' }, o.sub)),
        o.lado && h('div', { class: 'ph-cab-lado' }, o.lado)),
      o.rodape);
  }
  const chipVivo = (texto, tom) => h('span', { class: 'ph-chip-vivo' }, h('span', { class: cls('ph-pulso', 'tom-' + (tom || 'ok')), 'aria-hidden': 'true' }), h('span', null, texto));

  function preparacao(item, foco) {
    const deNovo = item && !item.def && cargas.get(item.id) === 'falhou' && botao({ texto: TX.tentarDeNovo, icone: 'retorno', tom: 'primario', aoClicar: () => { cargas.delete(item.id); rotear(true); } });
    return vazio({
      icone: 'relogio', tag: foco ? 'h1' : null, foco,
      titulo: TX.preparacaoTitulo,
      texto: item ? [t(item.nome), '. ', t(TX.preparacaoTexto)].join('') : TX.preparacaoTexto,
      acao: h('div', { class: 'ph-linha' }, deNovo, h('a', { class: 'ph-btn ph-btn--secundario dy-btn ph-btn-neutro', href: '#/' }, icone('layout-dashboard'), h('span', null, TX.irInicio))),
    });
  }

  /* --- login --- */
  function telaLogin() {
    const ultimo = PERFIS[ler(CHAVE_PERFIL + '-ultimo')] ? ler(CHAVE_PERFIL + '-ultimo') : 'visitante';
    let escolhido = ultimo;
    const email = campo({ tipo: 'email', rotulo: P('E-mail', 'Email'), placeholder: 'nome@empresademo.example', obrigatorio: true, autocomplete: 'off',
      validar: v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : P('Informe um e-mail válido, como nome@empresademo.example.', 'Enter a valid email, such as name@empresademo.example.')) });
    const senha = campo({ tipo: 'senha', rotulo: P('Senha', 'Password'), obrigatorio: true, autocomplete: 'off', ajuda: P('Na demonstração, qualquer e-mail e senha entram com o perfil escolhido abaixo. Nada é guardado.', 'In the demo, any email and password sign in with the profile chosen below. Nothing is stored.') });
    const verSenha = h('button', { type: 'button', class: 'ph-ver-senha dy-btn dy-btn-ghost dy-btn-xs dy-btn-square', 'aria-pressed': 'false', 'aria-label': P('Mostrar senha', 'Show password') }, icone('eye'));
    verSenha.addEventListener('click', () => {
      const ver = senha.input.getAttribute('type') === 'password';
      senha.input.setAttribute('type', ver ? 'text' : 'password');
      verSenha.setAttribute('aria-pressed', String(ver));
      verSenha.setAttribute('aria-label', t(ver ? P('Ocultar senha', 'Hide password') : P('Mostrar senha', 'Show password')));
      verSenha.replaceChildren(icone(ver ? 'eye-off' : 'eye'));
    });
    const caixaSenha = h('div', { class: 'ph-senha-caixa' });
    senha.input.replaceWith(caixaSenha);
    caixaSenha.append(senha.input, verSenha);
    const msg = h('div', { class: 'ph-login-msg', 'aria-live': 'assertive' });
    const entrarJa = () => {
      entrarComo(escolhido, false);
      const destino = retornoLogin;
      retornoLogin = '';
      toast(tx('bemVindoToast', t(PERFIS[escolhido].rotulo)), 'ok');
      irPara(destino);
    };
    const formEl = h('form', { class: 'ph-form-login', novalidate: true },
      msg, email, senha,
      h('button', { type: 'submit', class: 'ph-btn dy-btn dy-btn-primary dy-btn-block ph-brilho' }, h('span', null, P('Entrar', 'Sign in')), icone('arrow-right')));
    formEl.addEventListener('submit', e => {
      if (e && e.preventDefault) e.preventDefault();
      msg.replaceChildren();
      const ok = form.validar({ email, senha });
      if (!ok) { msg.replaceChildren(aviso(P('Preencha todos os campos', 'Fill in all fields'), 'erro')); return; }
      senha.input.value = '';
      entrarJa();
    });
    const nomeRadio = uid('perfil');
    const opcoes = Object.entries(PERFIS).map(([k, p]) => {
      const id = nomeRadio + '-' + k;
      const r = h('input', { type: 'radio', class: 'dy-radio dy-radio-primary dy-radio-sm', name: nomeRadio, id, value: k, checked: k === escolhido ? true : null });
      r.addEventListener('change', () => { if (r.checked) escolhido = k; });
      return h('label', { class: 'ph-opcao', for: id }, r, h('span', { class: 'ph-opcao-txt' }, h('strong', null, p.rotulo), h('span', null, p.descricao)));
    });
    /* tema à vista na entrada ("nem todos gostam do preto"): a miniatura mostra o visual do tema mesmo com a tela em outro;
       trocar aplica na hora pela mesma função do cabeçalho (grava e entra na auditoria quando há perfil). O alto contraste fica em Configurações. */
    const nomeTema = uid('tema');
    const CURTA = { portfolio: P('Preto e alumínio, fita amarela', 'Black and aluminum, yellow tape'), escuro: P('Escuro, metal e LEDs', 'Dark, metal and LEDs'), claro: P('Fundo claro, cartões brancos', 'Light background, white cards') };
    const temas = h('fieldset', { class: 'ph-perfis ph-login-temas' }, h('legend', { class: 'ph-campo-rotulo' }, TX.temaInterface),
      h('div', { class: 'ph-temas-grade' }, ['portfolio', 'escuro', 'claro'].map(k => {
        const id = nomeTema + '-' + k;
        const r = h('input', { type: 'radio', class: 'dy-radio dy-radio-primary dy-radio-sm', name: nomeTema, id, value: k, checked: k === visual ? true : null, 'data-tema-radio': '' });
        r.addEventListener('change', () => { if (r.checked) trocarVisual(k); });
        return h('label', { class: 'ph-opcao ph-tema-cartao', for: id },
          h('span', { class: 'ph-tema-mini', 'data-mini': k, 'aria-hidden': 'true' }, h('i'), h('i'), h('i')),
          h('span', { class: 'ph-tema-txt' }, r, h('strong', null, VISUAIS[k].rotulo), h('span', null, CURTA[k])));
      })),
      h('p', { class: 'ph-somente', 'data-contraste-nota': '', hidden: !altoContraste }, TX.contrasteNota));
    const segLang = h('div', { class: 'ph-seg dy-join', role: 'group', 'aria-label': TX.idioma },
      ['pt', 'en'].map(l => h('button', { type: 'button', class: 'dy-join-item dy-btn dy-btn-sm', 'data-lang': l, 'aria-pressed': String(l === lang), onclick: () => trocarLang(l) }, l.toUpperCase())));
    const linhasTerm = [
      ['$', 'projecthub iniciar --empresa "EMPRESA DEMO"', ''],
      ['>', P('conectando ao motor central ....... ', 'connecting to the core engine ..... '), 'ok'],
      ['>', P('14 sistemas em 5 departamentos .... ', '14 systems in 5 departments ....... '), 'ok'],
      ['>', P('robô de notas fiscais ............. ', 'invoice robot ..................... '), P('em execução', 'running')],
      ['>', P('modo demonstração: dados fictícios', 'demo mode: fictitious data'), ''],
    ];
    const term = h('div', { class: 'ph-terminal', 'aria-hidden': 'true' });
    const pintarTerm = n => term.replaceChildren(...linhasTerm.slice(0, n).map(([pre, txt, ok], k) => h('pre', { class: cls(k === linhasTerm.length - 1 && 'is-aviso') }, h('span', { class: 'ph-term-pre' }, pre), h('code', null, txt, ok && h('span', { class: 'ph-term-ok' }, ok === 'ok' ? 'ok' : ok))), n >= linhasTerm.length && h('pre', null, h('span', { class: 'ph-term-pre' }, '$'), h('span', { class: 'ph-cursor' }))));
    const nums = [[14, P('sistemas', 'systems')], [5, P('departamentos', 'departments')], [42, P('lançamentos hoje', 'postings today')]];
    const el = h('div', { class: 'ph-login' },
      h('div', { class: 'ph-login-topo' },
        h('span', { class: 'ph-marca-txt' }, marca(false), h('span', null, 'ProjectHub')),
        h('div', { class: 'ph-linha' }, segLang,
          h('a', { class: 'ph-btn dy-btn dy-btn-sm dy-btn-ghost', href: '../index.html' }, icone('voltar'), h('span', null, TX.voltarPortfolio)))),
      h('div', { class: 'ph-login-meio' },
        h('section', { class: 'ph-heroi', 'aria-labelledby': 'ph-h1' },
          h('div', { class: 'ph-heroi-marca' }, marca(true),
            h('div', null,
              h('h1', { id: 'ph-h1', class: 'ph-heroi-titulo', tabindex: '-1', 'data-foco': '' }, 'Project', h('b', null, 'Hub')),
              h('p', { class: 'ph-empresa-g' }, TX.empresa))),
          h('p', { class: 'ph-lema' }, P('Os sistemas da empresa em um só lugar: notas fiscais, comercial, pessoas, operação e conhecimento, com robôs trabalhando por trás de cada tela.', 'The company systems in one place: invoices, sales, people, operations and knowledge, with robots working behind every screen.')),
          term,
          h('div', { class: 'ph-heroi-nums' }, nums.map(([n, r]) => h('div', null, h('strong', { class: 'ph-num', 'data-contador': String(n) }, String(n)), h('span', null, r))))),
        h('section', { class: 'ph-login-cartao dy-card', 'aria-labelledby': 'ph-login-t' },
          h('div', { class: 'dy-card-body' },
            h('h2', { id: 'ph-login-t', class: 'ph-login-titulo' }, P('Acesse o ProjectHub', 'Sign in to ProjectHub')),
            h('p', { class: 'ph-texto-mudo' }, TX.empresa, P(' · ambiente de demonstração', ' · demo environment')),
            formEl,
            h('div', { class: 'dy-divider ph-ou' }, P('ou explore sem senha', 'or explore without a password')),
            h('fieldset', { class: 'ph-perfis' }, h('legend', { class: 'ph-campo-rotulo' }, P('Perfil de acesso da demonstração', 'Demo access profile')), h('div', { class: 'ph-perfis-grade' }, opcoes)),
            temas,
            h('button', { type: 'button', class: 'ph-btn dy-btn dy-btn-outline dy-btn-primary dy-btn-block', 'data-acao': 'entrar-visitante', onclick: entrarJa }, icone('log-in'), h('span', null, P('Entrar como visitante', 'Enter as visitor'))),
            aviso(h('span', null, h('strong', null, TX.faixa), h('br'), P('Nenhuma tela acessa sistemas reais e nenhuma senha é guardada.', 'No screen reaches real systems and no password is stored.')), 'info')))),
      h('p', { class: 'ph-login-rodape' }, 'ProjectHub ' + new Date().getFullYear() + ' · ' + TX.empresa + ' · ', TX.autoria));
    return {
      el, titulo: P('Entrar', 'Sign in'), migalhas: [], semCasca: true,
      depois() {
        animarContadores(el);
        /* primeira visita: o convite do tour já aparece na entrada, a primeira tela do hub (sair da tela antes cancela) */
        if (!tour && !ler(CHAVE_TOUR)) depois(() => { if (!tour && !abertos.size && rotaAtual().id === 'entrar') tourConvidar(false); }, 1200);
        if (semMovimento()) { pintarTerm(linhasTerm.length); return; }
        let n = 0;
        const passo = () => { n++; pintarTerm(n); if (n < linhasTerm.length) depois(passo, 420); };
        passo();
      },
    };
  }

  /* --- números animados e minigráficos --- */
  function animarContadores(raiz) {
    $$('[data-contador]', raiz).forEach(el => {
      const alvo = Number(el.getAttribute('data-contador'));
      const casas = Number(el.getAttribute('data-casas') || 0);
      if (semMovimento()) { el.textContent = FMT.num(alvo, casas); return; }
      const t0 = agora(), dur = 1100;
      const passo = () => {
        if (!el.isConnected) return;
        const k = Math.min(1, (agora() - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        el.textContent = FMT.num(alvo * e, casas);
        if (k < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    });
  }
  function sparkline(serie) {
    const w = 200, alt = 40, max = Math.max(...serie), min = Math.min(...serie), amp = max - min || 1;
    const pts = serie.map((v, i) => [i * w / (serie.length - 1), alt - 4 - (v - min) / amp * (alt - 10)]);
    const lin = pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const area = 'M0,' + alt + ' L' + pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + ' L' + w + ',' + alt + ' Z';
    const gid = uid('sg');
    return h('span', { class: cls('ph-spark', !semMovimento() && 'ph-desenha'), 'aria-hidden': 'true', html: '<svg viewBox="0 0 ' + w + ' ' + alt + '" preserveAspectRatio="none" focusable="false"><defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".38"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path class="ph-spark-area" d="' + area + '" fill="url(#' + gid + ')"/><polyline class="ph-spark-linha" pathLength="1" points="' + lin + '"/></svg>' });
  }

  /* --- painel inicial --- */
  function serieLancamentos() {
    const d = dadosHub(), hoje = new Date(), dias = [];
    for (let i = 13; i >= 0; i--) {
      const dia = new Date(hoje.getTime() - i * 864e5), fds = dia.getDay() === 0 || dia.getDay() === 6;
      dias.push({ d: dia, v: i === 0 ? d.lancHoje : fds ? 2 + ((i * 7) % 5) : 27 + ((i * 13 + 5) % 14), fds, hoje: i === 0 });
    }
    return dias;
  }
  function itemFeed(a, novo) {
    const ehRobo = /^(Robô|AUTO CRM|Atendimento IA)/.test(a.quem);
    const sis = a.sistema && itemPorId(a.sistema);
    return h('li', { class: cls('ph-feed-item', novo && 'ph-novo') },
      ehRobo ? h('span', { class: 'ph-av ph-av-robo', 'aria-hidden': 'true' }, icone('bot')) : h('span', { class: 'ph-av', 'aria-hidden': 'true' }, iniciais(a.quem)),
      h('div', { class: 'ph-feed-miolo' },
        h('p', { class: 'ph-feed-texto' }, h('strong', null, a.quem), ' · ', a.texto),
        h('div', { class: 'ph-feed-meta' }, badge(a.acao, a.tom),
          sis ? h('a', { href: '#/' + sis.id }, sis.nome) : h('span', null, a.sistema ? a.sistema : TX.administracao),
          h('time', { datetime: a.quando.toISOString(), 'data-rel': String(a.quando.getTime()) }, relativo(a.quando)))));
  }
  function telaPainel() {
    const d = dadosHub();
    const p = perfil();
    const lista = itens();
    const prontos = lista.filter(temDemo).length;
    const hora = new Date().getHours();
    const saud = hora < 12 ? P('Bom dia', 'Good morning') : hora < 18 ? P('Boa tarde', 'Good afternoon') : P('Boa noite', 'Good evening');
    const primeiroNome = p.id === 'visitante' ? t(P('visitante', 'visitor')) : String(t(p.nome)).split(' ')[0];
    const tiles = [
      { cor: 'azul', ic: 'app-window', rot: P('Sistemas ativos', 'Active systems'), valor: lista.length, nota: P('em 5 departamentos', 'in 5 departments'), serie: [9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 13, 14, 14, 14], pat: 'PAT-0101', leds: 1 },
      { cor: 'verde', ic: 'zap', rot: P('Lançamentos hoje', 'Postings today'), valor: d.lancHoje, nota: P('8 a mais que ontem', '8 more than yesterday'), serie: [18, 26, 22, 31, 28, 35, 30, 38, 29, 34, 36, 33, 34, 42], pat: 'PAT-0102', id: 'lanc', leds: 2 },
      { cor: 'ambar', ic: 'hourglass', rot: P('Pendências', 'Pending items'), valor: 7, nota: P('2 notas bloqueadas na fila', '2 invoices blocked in the queue'), serie: [12, 10, 11, 9, 9, 8, 10, 9, 8, 7, 8, 6, 8, 7], pat: 'PAT-0103', leds: 1 },
      { cor: 'vermelho', ic: 'triangle-alert', rot: P('Alertas', 'Alerts'), valor: 2, nota: P('1 de verba, 1 de estoque', '1 budget, 1 stock'), serie: [1, 0, 2, 1, 1, 3, 2, 1, 2, 2, 1, 3, 2, 2], pat: 'PAT-0104', leds: 3 },
    ];
    const kpiLanc = { el: null };
    const tilesEl = h('div', { class: 'ph-tiles' }, tiles.map((k, i) => {
      const num = h('span', { class: 'ph-num', 'data-contador': String(k.valor) }, FMT.num(k.valor));
      if (k.id === 'lanc') kpiLanc.el = num;
      return h('article', { class: 'ph-tile dy-card', style: { '--cor': 'var(--ph-cor-' + k.cor + ')', '--vivo': 'var(--ph-vivo-' + k.cor + ')' } },
        /* peças do Rack (fresta de ventilação, LEDs e posição U no rack): só aparecem nesse tema */
        h('span', { class: 'ph-tile-rack', 'aria-hidden': 'true' }, h('span', { class: 'ph-tile-ventila' }),
          h('span', { class: 'ph-tile-leds' }, [0, 1, 2].map(n => h('i', { class: n < k.leds ? 'is-on' : null }))), h('span', { class: 'ph-tile-u' }, 'U0' + (i + 1))),
        h('div', { class: 'ph-tile-cab' }, h('h3', { class: 'ph-tile-rotulo' }, k.rot), h('span', { class: 'ph-tile-ico' }, icone(k.ic))),
        h('p', { class: 'ph-tile-valor' }, num),
        h('p', { class: 'ph-tile-nota' }, k.nota),
        sparkline(k.serie),
        h('div', { class: 'ph-tile-placa', 'aria-hidden': 'true' }, h('span', null, k.pat), codigoBarras(k.pat)));
    }));

    /* gráfico de 14 dias */
    const dias = serieLancamentos();
    const uteis = dias.filter(x => !x.fds && !x.hoje);
    const media = Math.round(uteis.reduce((s, x) => s + x.v, 0) / uteis.length);
    const maxV = Math.max(...dias.map(x => x.v)) * 1.1;
    const valHoje = h('span', null, String(d.lancHoje));
    const barraHoje = { el: null };
    const area = h('div', { class: 'ph-graf-area', role: 'img', 'aria-label': t(P('Gráfico de barras: média de ' + media + ' lançamentos por dia útil; hoje ' + d.lancHoje + ' até agora; fins de semana com poucos lançamentos.', 'Bar chart: an average of ' + media + ' postings per business day; ' + d.lancHoje + ' so far today; few postings on weekends.')) },
      dias.map((x, i) => {
        const barra = h('span', { class: cls('ph-graf-barra', !semMovimento() && 'cresce'), style: { height: (x.v / maxV * 100).toFixed(1) + '%', animationDelay: (i * 35) + 'ms' } });
        if (x.hoje) barraHoje.el = barra;
        return h('div', { class: cls('ph-graf-col', x.hoje && 'is-hoje', x.fds && 'is-fds'), title: FMT.data(x.d) + ': ' + x.v },
          h('span', { class: 'ph-graf-val ph-num', 'aria-hidden': 'true' }, x.hoje ? valHoje : String(x.v)),
          barra,
          h('span', { class: 'ph-graf-dia ph-num', 'aria-hidden': 'true' }, x.hoje ? t(P('hoje', 'today')) : String(x.d.getDate()).padStart(2, '0')));
      }));
    const grafico = h('section', { class: 'ph-graf dy-card', 'aria-labelledby': 'ph-graf-t' },
      h('div', { class: 'ph-secao-cab' }, h('h2', { class: 'ph-tile-titulo', id: 'ph-graf-t' }, icone('chart-column'), h('span', null, P('Lançamentos do robô nos últimos 14 dias', 'Robot postings in the last 14 days'))), badge(t(P('média de ' + media + ' por dia útil', media + ' per business day on average')), 'info')),
      area,
      h('div', { class: 'ph-legenda-mini' }, h('span', null, P('Barras mais baixas: fins de semana', 'Lower bars: weekends')), h('span', null, P('Destaque: hoje, atualizado ao vivo', 'Highlight: today, updated live'))));

    /* meus projetos */
    const meus = p.meus.map(itemPorId).filter(Boolean);
    const meusEl = h('section', { class: 'ph-secao', 'aria-labelledby': 'ph-meus-t' },
      h('div', { class: 'ph-secao-cab' }, h('h2', { class: 'ph-secao-titulo', id: 'ph-meus-t' }, h('span', { class: 'ph-fita' }, P('Meus projetos', 'My projects'))), h('p', null, t(P(meus.length + (meus.length === 1 ? ' sistema fixado' : ' sistemas fixados') + ' para o perfil ', meus.length + (meus.length === 1 ? ' system pinned' : ' systems pinned') + ' for the ')) + t(p.rotulo) + (lang === 'en' ? ' profile' : ''))),
      h('div', { class: 'ph-meus' }, meus.map(x => h('a', { class: 'ph-proj dy-card', href: '#/' + x.id, style: { '--cor': corGrupo(x.grupo) } },
        h('span', { class: 'ph-proj-ic' }, icone(x.icone)),
        h('strong', { class: 'ph-proj-nome' }, x.nome),
        h('span', { class: 'ph-proj-desc' }, x.resumo),
        h('span', { class: 'ph-proj-meta' }, badge(P('Ativo', 'Active'), 'ok'), h('span', null, nomeGrupo(x.grupo)))))));

    /* feed ao vivo */
    const feedLista = h('ol', { class: 'ph-feed-lista', 'aria-label': t(P('Últimos registros, do mais recente ao mais antigo', 'Latest entries, newest first')) }, d.atividade.slice(0, 8).map(a => itemFeed(a)));
    const pulsoFeed = h('span', { class: cls('ph-pulso', d.feedPausado ? 'tom-alerta is-parado' : 'tom-ok'), 'aria-hidden': 'true' });
    const btnFeed = botao({ texto: d.feedPausado ? P('Retomar', 'Resume') : P('Pausar', 'Pause'), icone: d.feedPausado ? 'play' : 'pause', tom: 'fantasma', tamanho: 'p', aoClicar: () => {
      d.feedPausado = !d.feedPausado;
      btnFeed.setAttribute('aria-pressed', String(d.feedPausado));
      btnFeed.replaceChildren(icone(d.feedPausado ? 'play' : 'pause'), h('span', null, d.feedPausado ? P('Retomar', 'Resume') : P('Pausar', 'Pause')));
      pulsoFeed.className = cls('ph-pulso', d.feedPausado ? 'tom-alerta is-parado' : 'tom-ok');
    } });
    btnFeed.setAttribute('aria-pressed', String(d.feedPausado));
    const feed = h('section', { class: 'ph-feed dy-card', 'aria-labelledby': 'ph-feed-t' },
      h('div', { class: 'ph-feed-cab' }, h('h2', { class: 'ph-tile-titulo', id: 'ph-feed-t' }, pulsoFeed, h('span', null, P('Atividade em tempo real', 'Live activity'))), btnFeed),
      feedLista);

    /* sistemas por departamento (busca e filtro) */
    const grade = h('div', { class: 'ph-deptos' });
    const anuncio = h('p', { class: 'vh', 'aria-live': 'polite' });
    function cartaoSistema(x) {
      return h('article', { class: 'ph-sis', style: { '--grupo': corGrupo(x.grupo) } },
        h('span', { class: 'ph-sis-icone' }, icone(x.icone)),
        h('div', { class: 'ph-sis-titulos' },
          h('h4', { class: 'ph-sis-nome' }, h('a', { class: 'ph-sis-link', href: '#/' + x.id }, x.nome)),
          x.resumo && h('p', { class: 'ph-sis-resumo' }, x.resumo)),
        h('div', { class: 'ph-sis-rodape' },
          temDemo(x) ? badge(TX.demoDisponivel, 'ok') : badge(TX.emPreparacao, 'neutro'),
          h('span', { class: 'ph-sis-acoes' },
            temDemo(x) && h('a', { class: 'ph-sis-manual', href: '#/' + x.id + '/manual', 'aria-label': tx('manualDe', t(x.nome)) }, TX.manual),
            h('span', { class: 'ph-sis-ir', 'aria-hidden': 'true' }, icone('arrow-right')))));
    }
    function pintarGrade() {
      const q = norm(filtroInicio.termo.trim());
      const grupos = gruposComItens(lista).map(g => ({ ...g, itens: g.itens.filter(x =>
        (!filtroInicio.grupo || x.grupo === filtroInicio.grupo) &&
        (!q || norm([t(x.nome), t(x.resumo), nomeGrupo(x.grupo), ...tecsDe(x)].join(' ')).includes(q))) })).filter(g => g.itens.length);
      const n = grupos.reduce((s, g) => s + g.itens.length, 0);
      grade.replaceChildren(...(n
        ? grupos.map(g => h('section', { class: 'ph-depto dy-card', style: { '--cor': corGrupo(g.id) }, 'aria-labelledby': 'ph-dep-' + g.id },
          h('div', { class: 'ph-depto-cab' },
            h('h3', { id: 'ph-dep-' + g.id }, icone(g.icone), h('span', { class: 'ph-cresce' }, g.nome), badge(t(P(g.itens.length + (g.itens.length === 1 ? ' sistema' : ' sistemas'), g.itens.length + (g.itens.length === 1 ? ' system' : ' systems'))), 'neutro')),
            h('p', null, g.descricao)),
          h('ul', { class: 'ph-depto-lista' }, g.itens.map(x => h('li', null, cartaoSistema(x))))))
        : [vazio({ icone: 'busca', titulo: TX.nadaEncontrado, texto: TX.nadaEncontradoTexto })]));
      anuncio.textContent = tx('resultadoBusca', n);
    }
    const filtroGrupos = chips({
      rotulo: TX.filtrarGrupo,
      valor: filtroInicio.grupo,
      opcoes: [{ valor: '', texto: TX.todos }, ...gruposComItens(lista).map(g => ({ valor: g.id, texto: g.nome, contador: g.itens.length }))],
      aoMudar: v => { filtroInicio.grupo = v; pintarGrade(); },
    });
    const campoBusca = busca({ placeholder: TX.buscarSistema, valor: filtroInicio.termo, aoDigitar: v => { filtroInicio.termo = v; pintarGrade(); } });
    pintarGrade();
    const sistemas = h('section', { class: 'ph-secao', 'aria-labelledby': 'ph-sis-t', id: 'ph-sistemas' },
      h('div', { class: 'ph-secao-cab' }, h('h2', { class: 'ph-secao-titulo', id: 'ph-sis-t' }, h('span', { class: 'ph-fita' }, P('Sistemas por departamento', 'Systems by department'))), h('p', null, tx('heroContagem', prontos, lista.length))),
      h('div', { class: 'ph-inicio-filtros' }, campoBusca, filtroGrupos),
      anuncio,
      grade);

    const dataHoje = new Date().toLocaleDateString(loc(), { weekday: 'long', day: 'numeric', month: 'long' });
    const el = h('div', { class: 'ph-pagina ph-inicio' },
      cabecalho({
        kicker: [TX.painelInicial, ' · ', TX.empresa],
        titulo: t(saud) + ', ' + primeiroNome,
        sub: [TX.bemVindo, ' ProjectHub. ', P('O que está rodando agora, o que precisa de atenção e onde estão os seus sistemas.', 'What is running now, what needs attention and where your systems are.')],
        lado: [chipVivo(P('4 robôs em execução', '4 robots running')), h('span', { class: 'ph-chip-vivo' }, icone('clock'), h('span', null, dataHoje))],
        rodape: h('p', { class: 'ph-cab-meta' }, h('span', { class: 'ph-hero-ponto', 'aria-hidden': 'true' }), h('span', null, tx('heroContagem', prontos, lista.length)), h('span', { 'aria-hidden': 'true' }, ' · '), h('span', null, TX.heroAutoria)),
      }),
      publico() && h('section', { class: 'ph-faixa-completo ph-card dy-card', 'aria-labelledby': 'ph-completo-t' },
        h('div', null, h('h2', { class: 'ph-h3', id: 'ph-completo-t' }, icone('lock'), h('span', null, TX.completoFaixaTitulo)), h('p', { class: 'ph-texto-mudo' }, TX.completoFaixaTexto)), linksContato()),
      h('section', { 'aria-labelledby': 'ph-kpi-t' }, h('h2', { id: 'ph-kpi-t', class: 'vh' }, P('Indicadores do dia', 'Today\'s indicators')), tilesEl),
      h('div', { class: 'ph-colunas' },
        h('div', { class: 'ph-coluna-principal' }, grafico, meusEl),
        feed),
      sistemas);

    return {
      el, titulo: TX.painelInicial, migalhas: [],
      depois() {
        animarContadores(el);
        let poolIdx = d.poolIdx;
        const tick = () => {
          if (!d.feedPausado && !(document.hidden === true)) {
            const [quem, acao, tom, texto, sistema, lanc] = POOL[poolIdx++ % POOL.length];
            d.poolIdx = poolIdx;
            const a = { quando: new Date(), quem, acao, tom, texto, sistema };
            d.atividade.unshift(a);
            feedLista.prepend(itemFeed(a, !semMovimento()));
            while (feedLista.children.length > 8) feedLista.children[feedLista.children.length - 1].remove();
            if (lanc) {
              d.lancHoje++;
              if (kpiLanc.el) { kpiLanc.el.textContent = FMT.num(d.lancHoje); kpiLanc.el.setAttribute('data-contador', String(d.lancHoje)); }
              valHoje.textContent = String(d.lancHoje);
              if (barraHoje.el) barraHoje.el.style.height = Math.min(100, d.lancHoje / maxV * 100).toFixed(1) + '%';
            }
            $$('[data-rel]', feedLista).forEach(tm => { tm.textContent = relativo(new Date(Number(tm.getAttribute('data-rel')))); });
          }
          depois(tick, 5000);
        };
        depois(tick, 5000);
        /* primeira visita: o convite do tour aparece depois que o painel assenta (sair da tela antes cancela) */
        if (!tour && !ler(CHAVE_TOUR)) depois(() => { if (!tour && !abertos.size && !rotaAtual().id) tourConvidar(false); }, 900);
      },
    };
  }

  /* --- sistema, manual, preparação, restrita, não encontrada --- */
  /* Moldura do sistema: o hub é uma coisa, o que está dentro dele é outra. Cabeçalho com ícone, departamento (na cor dele),
     nome, situação, número PAT com código de barras e Manual; o módulo (ou o manual) monta no corpo. Cada tema veste a moldura. */
  function moldura(item, sub, corpo) {
    const pat = patDe(item);
    return h('div', { class: 'ph-pagina ph-moldura-pagina' },
      h('section', { class: 'ph-moldura', style: { '--cor': corGrupo(item.grupo) }, 'aria-labelledby': 'ph-sys-titulo' },
        h('header', { class: 'ph-sysbar' },
          h('span', { class: 'ph-sysbar-icone' }, icone(item.icone)),
          h('div', { class: 'ph-sysbar-textos' },
            h('p', { class: 'ph-kicker ph-sysbar-dep' }, h('i', { 'aria-hidden': 'true' }), nomeGrupo(item.grupo)),
            h('h1', { class: 'ph-h2 ph-sysbar-titulo', id: 'ph-sys-titulo', tabindex: '-1', 'data-foco': '' }, h('span', { class: 'ph-fita' }, item.nome, sub === 'manual' && [' · ', t(TX.manual)]))),
          h('div', { class: 'ph-sysbar-estado' },
            h('span', { class: 'ph-status' }, h('span', { class: 'ph-status-led', 'aria-hidden': 'true' }), TX.emProducao),
            badge(TX.dadosCurto, 'info')),
          h('div', { class: 'ph-sysbar-pat', 'aria-hidden': 'true' }, h('span', { class: 'ph-chip-ouro' }), h('span', null, pat), codigoBarras(pat)),
          h('div', { class: 'ph-sysbar-acoes' },
            sub === 'manual'
              ? h('a', { class: 'ph-btn ph-btn--primario dy-btn dy-btn-primary dy-btn-sm', href: '#/' + item.id }, h('span', null, TX.entrar), icone('arrow-right'))
              : h('a', { class: 'ph-btn ph-btn--secundario dy-btn dy-btn-sm ph-btn-neutro', href: '#/' + item.id + '/manual' }, icone('livro'), h('span', null, TX.manual)),
            publico() && botao({ texto: TX.completoBotao, icone: 'lock', tom: 'primario', tamanho: 'p', classe: 'ph-btn-completo', aoClicar: () => modal({ titulo: tx('completoTitulo', t(item.nome)), icone: 'lock', largura: 'm', corpo: [h('p', null, TX.completoTexto), linksContato()] }) }))),
        corpo));
  }

  function telaSistema(item) {
    const migs = [{ texto: nomeGrupo(item.grupo) }, { texto: item.nome, href: '#/' + item.id }];
    if (!item.def) {
      if (SOB_DEMANDA && item.catalogo && cargas.get(item.id) !== 'falhou') {
        pedirModulo(item.id);
        return { el: moldura(item, '', h('div', { class: 'ph-sys ph-moldura-corpo ph-pagina', 'data-modulo': item.id, 'aria-busy': 'true' }, h('p', { class: 'ph-texto-fraco ph-texto-p' }, TX.abrindoModulo), esqueleto(8))), titulo: item.nome, migalhas: migs };
      }
      /* arquivo que não chegou (ou sistema sem demonstração): a tela de preparação fica dentro da moldura, como no manual; o h1 e o foco são os da moldura */
      return { el: moldura(item, '', h('div', { class: 'ph-sys ph-moldura-corpo', 'data-modulo': item.id }, h('div', { class: 'ph-pagina' }, preparacao(item, false)))), titulo: item.nome, migalhas: migs };
    }
    const alvo = h('div', { class: 'ph-sys ph-moldura-corpo', 'data-modulo': item.id });
    return {
      el: moldura(item, '', alvo),
      titulo: item.nome, migalhas: migs,
      depois: () => {
        if (!SOB_DEMANDA) return montarModulo(item, alvo); // modo legado: monta na hora, como na v2
        alvo.setAttribute('aria-busy', 'true');
        alvo.replaceChildren(h('div', { class: 'ph-pagina' }, esqueleto(8)));
        const minha = montagem;
        aposPintura(() => { if (minha === montagem) { alvo.removeAttribute('aria-busy'); alvo.replaceChildren(); montarModulo(item, alvo); } }); // SH-5
      },
    };
  }

  function montarModulo(item, alvo) {
    const minha = montagem;
    moduloAtual = item.id;
    const falhar = e => {
      console.error('[Hub] falha ao montar o módulo ' + item.id, e);
      if (minha !== montagem) return;
      alvo.replaceChildren(h('div', { class: 'ph-pagina' }, preparacao(item, false)));
    };
    try {
      const r = item.def.montar(alvo, criarApi(item.id));
      if (r && typeof r.then === 'function') {
        r.then(fn => { if (typeof fn !== 'function') return; if (minha === montagem) limpeza = fn; else fn(); }, falhar);
      } else if (typeof r === 'function') limpeza = r;
    } catch (e) { falhar(e); }
  }

  function prosa(v) {
    if (Array.isArray(v)) return h('ul', null, v.map(x => h('li', null, x)));
    return String(t(v)).split(/\n\s*\n/).filter(Boolean).map(p => h('p', null, p));
  }

  function telaManual(item) {
    const def = item.def;
    const migs = [{ texto: nomeGrupo(item.grupo) }, { texto: item.nome, href: '#/' + item.id }, { texto: TX.manual }];
    if (!def && SOB_DEMANDA && item.catalogo && cargas.get(item.id) !== 'falhou') {
      pedirModulo(item.id);
      return { el: moldura(item, 'manual', h('div', { class: 'ph-moldura-corpo' }, h('div', { class: 'ph-pagina', 'aria-busy': 'true' }, esqueleto(6)))), titulo: [t(item.nome), ' · ', t(TX.manual)].join(''), migalhas: migs };
    }
    if (!def) return { el: moldura(item, 'manual', h('div', { class: 'ph-moldura-corpo' }, h('div', { class: 'ph-pagina' }, preparacao(item, false)))), titulo: item.nome, migalhas: migs };
    const m = manualDe(def);
    const secao = (titulo, ic, valor) => {
      const vazioV = valor == null || valor === '' || (Array.isArray(valor) && !valor.length);
      return vazioV ? null : cartao({ titulo, icone: ic, conteudo: h('div', { class: 'ph-prosa' }, prosa(valor)) });
    };
    const tecs = m.tecnologias || [];
    return {
      el: moldura(item, 'manual', h('div', { class: 'ph-moldura-corpo' },
        h('div', { class: 'ph-pagina ph-manual-grade' },
          h('div', { class: 'ph-pilha' },
            m.destaque && h('p', { class: 'ph-manual-destaque' }, m.destaque),
            secao(TX.oque, 'info', m.oque),
            secao(TX.finalidade, 'pino', m.finalidade),
            secao(TX.alcance, 'grade', m.alcance),
            !publico() && secao(TX.outras, 'globo', m.outras_empresas)),
          h('div', { class: 'ph-pilha' },
            cartao({
              titulo: TX.informacoes, icone: 'documento',
              conteudo: h('dl', { class: 'ph-dados' },
                [[TX.tipo, TX.tipoValor], [TX.grupo, nomeGrupo(item.grupo)], [TX.autoriaRotulo, TX.autoria], [TX.dadosRotulo, TX.dadosValor]]
                  .map(([dt, dd]) => h('div', null, h('dt', null, dt), h('dd', null, dd)))),
            }),
            tecs.length > 0 && cartao({ titulo: TX.tecnologias, icone: 'caixa', conteudo: h('div', { class: 'ph-tags' }, tecs.map(tc => h('span', { class: 'ph-tag' }, tc))) }))))),
      titulo: [t(item.nome), ' · ', t(TX.manual)].join(''), migalhas: migs,
    };
  }

  function telaNaoEncontrada(sistema) {
    return {
      el: h('div', { class: 'ph-pagina' }, vazio({
        icone: 'busca', tag: 'h1', foco: true, titulo: sistema ? TX.naoEncontradoSis : TX.naoEncontrado, texto: TX.naoEncontradoTexto,
        acao: h('a', { class: 'ph-btn ph-btn--secundario dy-btn ph-btn-neutro', href: '#/' }, icone('layout-dashboard'), h('span', null, TX.irInicio)),
      })),
      titulo: TX.naoEncontrado, migalhas: [{ texto: TX.naoEncontrado }],
    };
  }

  function telaRestrita(rotulo) {
    return {
      el: h('div', { class: 'ph-pagina' },
        cabecalho({ kicker: TX.administracao, titulo: t(rotulo) }),
        h('section', { class: 'ph-marcador dy-card', style: { '--cor': 'var(--ph-cor-ambar)' } },
          h('span', { class: 'ph-marcador-ic' }, icone('lock')),
          h('h2', { class: 'ph-h2' }, TX.acessoRestrito),
          h('p', null, TX.acessoRestritoTexto),
          h('div', { class: 'ph-linha' }, botao({ texto: TX.trocarPerfil, icone: 'arrow-left-right', tom: 'primario', aoClicar: () => trocarPerfil() })))),
      titulo: rotulo, migalhas: [{ texto: TX.administracao }, { texto: rotulo }],
    };
  }

  /* --- administração --- */
  const PAPEL = { admin: P('Admin', 'Admin'), member: P('Membro', 'Member') };
  const deptoPorId = id => dadosHub().deptos.find(x => x.id === id);
  /* filtro de busca com rótulo visível acima, como os selects ao lado */
  function filtroBusca(el) {
    const id = uid('busca');
    el.input.setAttribute('id', id);
    return h('div', { class: 'ph-campo' }, h('label', { class: 'ph-campo-rotulo', for: id }, TX.buscar), el);
  }
  function avatarUsuario(nome, email, extra) {
    return h('div', { class: 'ph-usuario' }, h('span', { class: 'ph-av', 'aria-hidden': 'true' }, iniciais(nome)),
      h('div', null, h('strong', null, nome, extra), email && h('small', null, email)));
  }

  function telaUsuarios() {
    const d = dadosHub();
    const p = perfil();
    const f = d.filtroUsu;
    const visiveis = () => d.usuarios.filter(u => (p.super || u.deptos.some(([dp]) => p.deptos.includes(dp))) &&
      (!f.termo || norm(u.nome + ' ' + u.email).includes(norm(f.termo))) &&
      (!f.status || (f.status === 'ativo' ? u.ativo && !u.convite : f.status === 'convite' ? !!u.convite : !u.ativo)) &&
      (!f.depto || u.deptos.some(([dp]) => dp === f.depto)));
    const contagem = h('span', { class: 'ph-chip-vivo', 'aria-live': 'polite' });
    let tab = null;
    const atualizar = () => { const v = visiveis(); tab.atualizar(v); contagem.textContent = t(P(v.length + (v.length === 1 ? ' usuário' : ' usuários') + ' · ' + v.filter(u => u.ativo).length + ' ativos', v.length + (v.length === 1 ? ' user' : ' users') + ' · ' + v.filter(u => u.ativo).length + ' active')); };
    const acoes = u => {
      const voce = u.email === p.email;
      return h('div', { class: 'ph-acoes-linha' },
        botao({ icone: 'pencil', titulo: t(P('Editar ', 'Edit ')) + u.nome, tom: 'fantasma', tamanho: 'p', aoClicar: () => abrirUsuario(u) }),
        !voce && botao({ icone: u.ativo ? 'lock' : 'lock-open', titulo: t(u.ativo ? P('Desativar ', 'Deactivate ') : P('Reativar ', 'Reactivate ')) + u.nome, tom: 'fantasma', tamanho: 'p', aoClicar: () => {
          u.ativo = !u.ativo; if (u.ativo) u.convite = false;
          registrarAuditoria(u.ativo ? P('Usuário reativado', 'User reactivated') : P('Usuário desativado', 'User deactivated'), 'update', u.nome, 'usuarios');
          atualizar();
          toast(t(u.ativo ? P(u.nome + ' volta a acessar o hub.', u.nome + ' can access the hub again.') : P(u.nome + ' não acessa mais o hub.', u.nome + ' can no longer access the hub.')), u.ativo ? 'ok' : 'info');
        } }),
        !voce && (p.super || !u.super) && botao({ icone: 'trash-2', titulo: t(P('Excluir ' + u.nome + ' permanentemente', 'Delete ' + u.nome + ' permanently')), tom: 'perigo', tamanho: 'p', aoClicar: () => modal({
          titulo: t(P('Excluir ', 'Delete ')) + u.nome + '?', icone: 'trash-2', largura: 'p', classe: 'ph-modal-perigo',
          corpo: h('p', null, P('O usuário perde o acesso e sai de todos os departamentos. Na demonstração, ele some só desta sessão.', 'The user loses access and leaves every department. In the demo, they disappear from this session only.')),
          acoes: [{ texto: P('Cancelar', 'Cancel') }, { texto: P('Excluir', 'Delete'), tom: 'perigo', icone: 'trash-2', aoClicar: c => {
            d.usuarios = d.usuarios.filter(x => x !== u);
            registrarAuditoria(P('Usuário excluído', 'User deleted'), 'delete', u.nome + ' (' + u.email + ')', 'usuarios');
            c.fechar(); atualizar(); toast(t(P(u.nome + ' foi removido desta sessão.', u.nome + ' was removed from this session.')), 'ok');
          } }],
        }) }));
    };
    tab = tabela({
      rotulo: TX.usuarios, busca: false, alturaMax: '62vh', vazio: P('Nenhum usuário encontrado.', 'No user found.'),
      colunas: [
        { id: 'nome', rotulo: P('Usuário', 'User'), render: u => avatarUsuario(u.nome, u.email, u.email === p.email && [' ', badge(P('Você', 'You'), 'info')]) },
        { id: 'deptos', rotulo: P('Departamentos e papéis', 'Departments and roles'), ordenavel: false, valor: u => u.deptos.map(([dp]) => t((deptoPorId(dp) || {}).nome)).join(' '), render: u => h('div', { class: 'ph-tags' }, u.super ? badge(P('Super admin · acesso global', 'Super admin · global access'), 'alerta') : u.deptos.length ? u.deptos.map(([dp, r]) => badge(t((deptoPorId(dp) || { nome: dp }).nome) + ' · ' + t(PAPEL[r]), r === 'admin' ? 'info' : 'neutro')) : h('span', { class: 'ph-texto-fraco ph-texto-p' }, P('Sem departamento', 'No department'))) },
        { id: 'status', rotulo: P('Status', 'Status'), valor: u => (u.convite ? 1 : u.ativo ? 0 : 2), render: u => (u.convite ? badge(P('Convite pendente', 'Pending invite'), 'alerta') : u.ativo ? badge(P('Ativo', 'Active'), 'ok') : badge(P('Inativo', 'Inactive'), 'neutro')) },
        { id: 'acoes', rotulo: P('Ações', 'Actions'), ordenavel: false, render: acoes },
      ],
      linhas: visiveis(),
    });
    function abrirUsuario(u0) {
      const novo = !u0;
      const u = u0 || { nome: '', email: '', super: false, deptos: p.super ? [] : [[p.deptos[0], 'member']] };
      const F = {
        nome: form.texto({ rotulo: P('Nome', 'Name'), valor: u.nome, obrigatorio: true }),
        email: form.texto({ rotulo: P('E-mail', 'Email'), valor: u.email, obrigatorio: true, validar: v => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? P('Informe um e-mail válido.', 'Enter a valid email.') : d.usuarios.some(x => x !== u0 && x.email.toLowerCase() === v.toLowerCase()) ? P('Já existe um usuário com este e-mail.', 'A user with this email already exists.') : null) }),
        sup: form.marcar({ rotulo: P('Super admin: acesso total ao hub', 'Super admin: full access to the hub'), marcado: !!u.super, desabilitado: !p.super, alternar: true, ajuda: p.super ? null : P('Somente o Super admin pode alterar.', 'Only the Super admin can change this.') }),
      };
      const linhasDep = d.deptos.map(dp => {
        const tem = u.deptos.find(([x]) => x === dp.id);
        const pode = p.super || p.deptos.includes(dp.id);
        const papel = select({ ariaLabel: t(P('Papel em ', 'Role in ')) + t(dp.nome), opcoes: [{ valor: 'member', texto: PAPEL.member }, { valor: 'admin', texto: PAPEL.admin }], valor: tem ? tem[1] : 'member', desabilitado: !pode || !tem });
        const chk = marcar({ rotulo: dp.nome, marcado: !!tem, desabilitado: !pode, aoMudar: v => { if (v) papel.removeAttribute('disabled'); else papel.setAttribute('disabled', ''); } });
        return { dp, chk, papel, el: h('div', { class: 'ph-dep-papel' }, chk, papel) };
      });
      modal({
        titulo: novo ? P('Convidar usuário', 'Invite user') : u.nome, icone: novo ? 'plus' : 'pencil', largura: 'm',
        corpo: h('div', { class: 'ph-form' }, F.nome, F.email, h('div', { class: 'ph-largo' }, F.sup),
          h('fieldset', { class: 'ph-grupo ph-largo' }, h('legend', { class: 'ph-campo-rotulo' }, P('Departamentos e papéis', 'Departments and roles')), h('div', { class: 'ph-dep-papeis' }, linhasDep.map(x => x.el))),
          novo && h('div', { class: 'ph-largo' }, aviso(P('Convite de demonstração: nenhum e-mail é enviado. O usuário aparece na lista como convite pendente.', 'Demo invite: no email is sent. The user shows up in the list as a pending invite.'), 'info'))),
        acoes: [{ texto: P('Cancelar', 'Cancel') }, { texto: novo ? P('Enviar convite', 'Send invite') : P('Salvar', 'Save'), tom: 'primario', icone: 'check', aoClicar: c => {
          if (!form.validar(F)) { c.erro(P('Nome e e-mail são obrigatórios. Corrija os campos marcados.', 'Name and email are required. Fix the highlighted fields.')); return; }
          const sup = F.sup.valor();
          const deptos = sup ? [] : linhasDep.filter(x => x.chk.valor()).map(x => [x.dp.id, x.papel.value]);
          if (novo) {
            const nu = { id: Math.max(...d.usuarios.map(x => x.id), 0) + 1, nome: F.nome.valor(), email: F.email.valor(), super: sup, deptos, ativo: true, convite: true };
            d.usuarios.unshift(nu);
            registrarAuditoria(P('Usuário criado', 'User created'), 'create', nu.nome + ' (' + nu.email + ')', 'usuarios');
            toast(t(P('Convite registrado para ' + nu.nome + '. Demonstração: nenhum e-mail foi enviado.', 'Invite recorded for ' + nu.nome + '. Demo: no email was sent.')), 'ok');
          } else {
            Object.assign(u0, { nome: F.nome.valor(), email: F.email.valor(), super: sup, deptos });
            registrarAuditoria(P('Usuário atualizado', 'User updated'), 'update', P(u0.nome + ': departamentos e papéis', u0.nome + ': departments and roles'), 'usuarios');
            toast(t(P(u0.nome + ' foi atualizado nesta sessão.', u0.nome + ' was updated in this session.')), 'ok');
          }
          c.fechar(); atualizar();
        } }],
      });
    }
    const filtros = h('div', { class: 'ph-filtros', role: 'group', 'aria-label': t(P('Filtros de usuários', 'User filters')) },
      filtroBusca(busca({ rotulo: P('Buscar por nome ou e-mail', 'Search by name or email'), placeholder: P('Nome ou e-mail', 'Name or email'), valor: f.termo, aoDigitar: v => { f.termo = v; atualizar(); } })),
      select({ rotulo: P('Status', 'Status'), valor: f.status, opcoes: [{ valor: '', texto: P('Todos os status', 'All statuses') }, { valor: 'ativo', texto: P('Ativos', 'Active') }, { valor: 'inativo', texto: P('Inativos', 'Inactive') }, { valor: 'convite', texto: P('Convite pendente', 'Pending invite') }], aoMudar: v => { f.status = v; atualizar(); } }),
      select({ rotulo: P('Departamento', 'Department'), valor: f.depto, opcoes: [{ valor: '', texto: P('Todos os departamentos', 'All departments') }, ...d.deptos.map(dp => ({ valor: dp.id, texto: dp.nome }))], aoMudar: v => { f.depto = v; atualizar(); } }));
    atualizar();
    return {
      el: h('div', { class: 'ph-pagina' },
        cabecalho({ kicker: TX.administracao, titulo: t(TX.usuarios), sub: p.super ? P('Quem acessa o hub, em quais departamentos e com qual papel.', 'Who accesses the hub, in which departments and with which role.') : P('Você administra as pessoas de ' + p.deptos.map(x => t((deptoPorId(x) || {}).nome)).join(', ') + '.', 'You manage the people in ' + p.deptos.map(x => (deptoPorId(x) || { nome: { en: x } }).nome.en).join(', ') + '.'),
          lado: [contagem, botao({ texto: P('Novo usuário', 'New user'), icone: 'plus', tom: 'primario', aoClicar: () => abrirUsuario(null) })] }),
        h('section', { class: 'ph-painel-tabela dy-card', 'aria-label': t(TX.usuarios) }, filtros, tab)),
      titulo: TX.usuarios, migalhas: [{ texto: TX.administracao }, { texto: TX.usuarios }],
    };
  }

  function telaDepartamentos() {
    const d = dadosHub();
    const p = perfil();
    if (!d.deptos.some(x => x.id === d.depSel)) d.depSel = p.deptos[0] || d.deptos[0].id;
    const listaEl = h('ul', { class: 'ph-dep-lista dy-menu dy-card', 'aria-label': t(TX.departamentos) });
    const detalhe = h('section', { class: 'ph-dep-detalhe dy-card', 'aria-labelledby': 'ph-dep-nome' });
    const membrosDe = id => d.usuarios.filter(u => u.deptos.some(([x]) => x === id)).map(u => ({ u, papel: u.deptos.find(([x]) => x === id)[1] }));
    function pintarLista() {
      listaEl.replaceChildren(...d.deptos.map(dp => {
        const n = membrosDe(dp.id).length, ns = CATALOGO.filter(c => c.grupo === dp.id).length;
        return h('li', null, h('button', { type: 'button', class: cls('ph-dep-item', dp.id === d.depSel && 'dy-menu-active'), 'aria-pressed': String(dp.id === d.depSel), style: { '--cor': dp.cor }, onclick: () => { d.depSel = dp.id; pintar(); const hh = $('#ph-dep-nome'); if (hh) hh.focus(); } },
          h('i', { 'aria-hidden': 'true' }), h('span', { class: 'ph-cresce' }, h('strong', null, dp.nome), h('small', null, t(P(n + (n === 1 ? ' membro' : ' membros') + ' · ' + ns + (ns === 1 ? ' sistema' : ' sistemas'), n + (n === 1 ? ' member' : ' members') + ' · ' + ns + (ns === 1 ? ' system' : ' systems'))))), icone('chevron-right')));
      }));
    }
    function pintarDetalhe() {
      const dp = d.deptos.find(x => x.id === d.depSel);
      const pode = p.super || p.deptos.includes(dp.id);
      const mem = membrosDe(dp.id);
      const ss = itens().filter(x => x.grupo === dp.id);
      const fora = d.usuarios.filter(u => !u.super && !u.deptos.some(([x]) => x === dp.id));
      detalhe.style.setProperty('--cor', dp.cor);
      const selU = select({ rotulo: P('Adicionar ao departamento', 'Add to department'), vazio: fora.length ? P('Selecione um usuário', 'Select a user') : P('Todos os usuários já estão aqui', 'Every user is already here'), opcoes: fora.map(u => ({ valor: String(u.id), texto: u.nome + ' · ' + u.email })), desabilitado: !fora.length, obrigatorio: true });
      const selP = select({ rotulo: P('Papel no departamento', 'Role in the department'), opcoes: [{ valor: 'member', texto: PAPEL.member }, { valor: 'admin', texto: PAPEL.admin }], valor: 'member' });
      detalhe.replaceChildren(h('div', { class: 'dy-card-body' },
        h('div', { class: 'ph-dep-detalhe-cab' },
          h('div', null, h('h2', { id: 'ph-dep-nome', class: 'ph-h2', tabindex: '-1' }, dp.nome), h('p', { class: 'ph-texto-mudo' }, dp.descricao || P('Sem descrição.', 'No description.'))),
          h('div', { class: 'ph-tags' }, badge(t(P(mem.length + (mem.length === 1 ? ' membro' : ' membros'), mem.length + (mem.length === 1 ? ' member' : ' members'))), 'neutro'), badge(t(P(ss.length + (ss.length === 1 ? ' sistema' : ' sistemas'), ss.length + (ss.length === 1 ? ' system' : ' systems'))), 'neutro'), !pode && badge(P('Somente leitura', 'Read only'), 'alerta'))),
        h('div', { class: 'ph-dep-secao' },
          h('h3', { class: 'ph-h3' }, icone('users'), h('span', null, P('Membros', 'Members'))),
          pode ? h('div', { class: 'ph-add-membro' }, selU, selP, botao({ texto: P('Adicionar', 'Add'), icone: 'plus', tom: 'primario', desabilitado: !fora.length, aoClicar: () => {
            if (!selU.validar()) { selU.input.focus(); return; }
            const u = d.usuarios.find(x => String(x.id) === selU.input.value);
            const papel = selP.input.value;
            u.deptos.push([dp.id, papel]);
            registrarAuditoria(P('Membro adicionado', 'Member added'), 'create', P(u.nome + ' em ' + ptDe(dp.nome) + ' (' + PAPEL[papel].pt + ')', u.nome + ' in ' + enDe(dp.nome) + ' (' + PAPEL[papel].en + ')'), 'departamentos');
            pintar();
            toast(t(P(u.nome + ' entrou em ' + ptDe(dp.nome) + '.', u.nome + ' joined ' + enDe(dp.nome) + '.')), 'ok');
          } })) : h('p', { class: 'ph-somente' }, P('Você vê este departamento, mas só administra o seu.', 'You can see this department, but you only manage your own.')),
          mem.length ? tabela({ rotulo: t(P('Membros de ', 'Members of ')) + t(dp.nome), busca: false, alturaMax: '48vh', linhas: mem, colunas: [
            { id: 'pessoa', rotulo: P('Pessoa', 'Person'), valor: m => m.u.nome, render: m => avatarUsuario(m.u.nome, m.u.email) },
            { id: 'papel', rotulo: P('Papel', 'Role'), valor: m => m.papel, render: m => (pode ? h('button', { type: 'button', class: 'ph-papel-btn', 'aria-label': t(P('Papel de ' + m.u.nome + ': ' + PAPEL[m.papel].pt + '. Clique para alterar', 'Role of ' + m.u.nome + ': ' + PAPEL[m.papel].en + '. Click to change')), onclick: () => {
              const it = m.u.deptos.find(([x]) => x === dp.id); it[1] = it[1] === 'admin' ? 'member' : 'admin';
              registrarAuditoria(P('Papel alterado', 'Role changed'), 'update', P(m.u.nome + ' em ' + ptDe(dp.nome) + ': ' + PAPEL[it[1]].pt, m.u.nome + ' in ' + enDe(dp.nome) + ': ' + PAPEL[it[1]].en), 'departamentos');
              pintar(); toast(t(P(m.u.nome + ' agora é ' + PAPEL[it[1]].pt + '.', m.u.nome + ' is now ' + PAPEL[it[1]].en + '.')), 'ok');
            } }, badge(PAPEL[m.papel], m.papel === 'admin' ? 'info' : 'neutro')) : badge(PAPEL[m.papel], m.papel === 'admin' ? 'info' : 'neutro')) },
            { id: 'acoes', rotulo: P('Ações', 'Actions'), ordenavel: false, render: m => pode && botao({ icone: 'x', titulo: t(P('Remover ' + m.u.nome + ' do departamento', 'Remove ' + m.u.nome + ' from the department')), tom: 'fantasma', tamanho: 'p', aoClicar: () => {
              m.u.deptos = m.u.deptos.filter(([x]) => x !== dp.id);
              registrarAuditoria(P('Membro removido', 'Member removed'), 'delete', P(m.u.nome + ' de ' + ptDe(dp.nome), m.u.nome + ' from ' + enDe(dp.nome)), 'departamentos');
              pintar(); toast(t(P(m.u.nome + ' saiu de ' + ptDe(dp.nome) + '.', m.u.nome + ' left ' + enDe(dp.nome) + '.')), 'info');
            } }) },
          ] }) : vazio({ icone: 'users', titulo: P('Nenhum usuário neste departamento', 'No user in this department') })),
        h('div', { class: 'ph-dep-secao' },
          h('h3', { class: 'ph-h3' }, icone('app-window'), h('span', null, P('Sistemas do departamento', 'Department systems'))),
          ss.length ? h('div', { class: 'ph-tags' }, ss.map(x => h('a', { class: 'ph-btn dy-btn dy-btn-sm dy-btn-soft dy-btn-primary', href: '#/' + x.id }, icone(x.icone), h('span', null, x.nome)))) : h('p', { class: 'ph-somente' }, P('Nenhum sistema ligado a este departamento ainda.', 'No system linked to this department yet.')))));
    }
    function pintar() { pintarLista(); pintarDetalhe(); }
    pintar();
    const novoDepto = () => {
      const F = { nome: form.texto({ rotulo: P('Nome', 'Name'), obrigatorio: true, placeholder: P('Ex.: Tecnologia da Informação', 'E.g.: Information Technology') }), desc: form.area({ rotulo: P('Descrição', 'Description') }),
        cor: form.select({ rotulo: P('Cor', 'Color'), valor: 'azul', opcoes: [{ valor: 'azul', texto: P('Azul', 'Blue') }, { valor: 'violeta', texto: P('Roxo', 'Purple') }, { valor: 'teal', texto: P('Turquesa', 'Teal') }, { valor: 'verde', texto: P('Verde', 'Green') }, { valor: 'ambar', texto: P('Âmbar', 'Amber') }] }) };
      modal({ titulo: P('Novo departamento', 'New department'), icone: 'building-2', largura: 'p', corpo: h('div', { class: 'ph-pilha' }, F.nome, F.desc, F.cor),
        acoes: [{ texto: P('Cancelar', 'Cancel') }, { texto: P('Criar', 'Create'), tom: 'primario', icone: 'check', aoClicar: c => {
          if (!form.validar(F)) return;
          const id = 'dep' + (d.deptos.length + 1);
          d.deptos.push({ id, nome: F.nome.valor(), descricao: F.desc.valor(), cor: 'var(--ph-cor-' + F.cor.valor() + ')' });
          d.depSel = id;
          registrarAuditoria(P('Departamento criado', 'Department created'), 'create', F.nome.valor(), 'departamentos');
          c.fechar(); pintar(); toast(t(P(F.nome.valor() + ' já pode receber membros.', F.nome.valor() + ' can now receive members.')), 'ok');
          const hh = $('#ph-dep-nome'); if (hh) hh.focus();
        } }] });
    };
    return {
      el: h('div', { class: 'ph-pagina' },
        cabecalho({ kicker: TX.administracao, titulo: t(TX.departamentos), sub: P('Pessoas e sistemas de cada departamento, com o papel de cada membro.', 'People and systems of each department, with each member\'s role.'),
          lado: p.super && botao({ texto: P('Novo departamento', 'New department'), icone: 'plus', tom: 'primario', aoClicar: novoDepto }) }),
        h('div', { class: 'ph-dep-layout' }, listaEl, detalhe)),
      titulo: TX.departamentos, migalhas: [{ texto: TX.administracao }, { texto: TX.departamentos }],
    };
  }

  function telaAuditoria() {
    const d = dadosHub();
    const f = d.filtroAud;
    const TIPO = { create: [P('Criação', 'Create'), 'ok'], update: [P('Edição', 'Edit'), 'info'], delete: [P('Remoção', 'Delete'), 'erro'] };
    const PER = [['todos', P('Todo o período', 'Any time')], ['hoje', P('Hoje', 'Today')], ['7', P('Últimos 7 dias', 'Last 7 days')], ['30', P('Últimos 30 dias', 'Last 30 days')]];
    const noPeriodo = q => { if (f.periodo === 'todos') return true; const x = new Date(q); if (f.periodo === 'hoje') return x.toDateString() === new Date().toDateString(); return agora() - x.getTime() <= Number(f.periodo) * 864e5; };
    const filtrados = () => d.auditoria.filter(a => (f.tipo === 'all' || a.tipo === f.tipo) && (!f.usuario || a.usuario === f.usuario) && noPeriodo(a.quando) &&
      (!f.termo || norm([a.usuario, t(a.acao), t(a.detalhes), nomeArea(a.area)].join(' ')).includes(norm(f.termo))));
    const contagem = h('span', { class: 'ph-chip-vivo', 'aria-live': 'polite' });
    const cont = tp => d.auditoria.filter(a => tp === 'all' || a.tipo === tp).length;
    const tab = tabela({
      rotulo: TX.auditoria, busca: false, alturaMax: '64vh', vazio: P('Nenhum registro encontrado.', 'No record found.'),
      ordem: { coluna: 'quando', dir: 'desc' },
      colunas: [
        { id: 'quando', rotulo: P('Data/Hora', 'Date/time'), tipo: 'data', render: a => h('span', { class: 'ph-num ph-mono' }, FMT.data(a.quando), h('br'), h('span', { class: 'ph-texto-fraco' }, horaSeg(a.quando))) },
        { id: 'usuario', rotulo: P('Usuário', 'User'), render: a => avatarUsuario(a.usuario) },
        { id: 'acao', rotulo: P('Ação', 'Action'), valor: a => t(a.acao), render: a => badge(a.acao, (TIPO[a.tipo] || TIPO.update)[1]) },
        { id: 'detalhes', rotulo: P('Detalhes', 'Details'), valor: a => t(a.detalhes), quebra: true },
        { id: 'area', rotulo: P('Área', 'Area'), valor: a => nomeArea(a.area) },
      ],
      linhas: filtrados(),
    });
    const atualizar = () => { const l = filtrados(); tab.atualizar(l); contagem.textContent = t(P(l.length + (l.length === 1 ? ' registro' : ' registros'), l.length + (l.length === 1 ? ' record' : ' records'))); };
    const tipos = chips({ rotulo: P('Tipo de ação', 'Action type'), valor: f.tipo, opcoes: [['all', P('Todos', 'All')], ['create', P('Criações', 'Creates')], ['update', P('Edições', 'Edits')], ['delete', P('Remoções', 'Deletes')]].map(([v, r]) => ({ valor: v, texto: r, contador: cont(v) })), aoMudar: v => { f.tipo = v; atualizar(); } });
    const usuarios = Array.from(new Set(d.auditoria.map(a => a.usuario))).sort();
    const filtros = h('div', { class: 'ph-filtros', role: 'group', 'aria-label': t(P('Filtros da auditoria', 'Audit filters')) },
      filtroBusca(busca({ rotulo: P('Buscar na auditoria', 'Search the audit log'), placeholder: P('Usuário, ação, detalhe ou área', 'User, action, detail or area'), valor: f.termo, aoDigitar: v => { f.termo = v; atualizar(); } })),
      select({ rotulo: P('Usuário', 'User'), valor: f.usuario, opcoes: [{ valor: '', texto: P('Todos os usuários', 'All users') }, ...usuarios.map(u => ({ valor: u, texto: u }))], aoMudar: v => { f.usuario = v; atualizar(); } }),
      select({ rotulo: P('Período', 'Period'), valor: f.periodo, opcoes: PER.map(([v, r]) => ({ valor: v, texto: r })), aoMudar: v => { f.periodo = v; atualizar(); } }));
    atualizar();
    return {
      el: h('div', { class: 'ph-pagina' },
        cabecalho({ kicker: TX.administracao, titulo: t(TX.auditoria), sub: P('Todo gesto da demonstração fica registrado: administração, tema e as ações de escrita dos sistemas. Quem fez, quando, o quê e onde.', 'Every gesture in the demo is logged: administration, theme and the write actions of the systems. Who did it, when, what and where.'),
          lado: [chipVivo(P('Gravando registros', 'Recording entries'), 'info'), contagem] }),
        tipos,
        h('section', { class: 'ph-painel-tabela dy-card', 'aria-label': t(TX.auditoria) }, filtros, tab)),
      titulo: TX.auditoria, migalhas: [{ texto: TX.administracao }, { texto: TX.auditoria }],
    };
  }

  function telaConfiguracoes() {
    const p = perfil();
    const tituloCard = (titulo, sub, corpo) => h('section', { class: 'ph-cfg-cartao dy-card' }, h('div', { class: 'dy-card-body' }, h('h2', { class: 'ph-h2' }, titulo), h('p', { class: 'ph-texto-mudo' }, sub), corpo));
    const abasCfg = abas({
      rotulo: P('Seções das configurações', 'Settings sections'), chave: 'cfgAba',
      abas: [
        { id: 'perfil', rotulo: P('Perfil', 'Profile'), icone: 'usuario', montar: pn => {
          const F = { nome: form.texto({ rotulo: P('Nome completo', 'Full name'), valor: t(p.nome), obrigatorio: true }), email: form.texto({ rotulo: P('E-mail', 'Email'), valor: p.email, obrigatorio: true, validar: v => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : P('Informe um e-mail válido.', 'Enter a valid email.')) }) };
          pn.append(tituloCard(P('Informações do perfil', 'Profile information'), P('Você pode alterar nome e e-mail. Vale para esta visita.', 'You can change name and email. It lasts for this visit.'), h('div', { class: 'ph-form ph-cfg-form' }, F.nome, F.email,
            campo({ rotulo: P('Papel', 'Role'), valor: t(p.rotulo), desabilitado: true, ajuda: P('Não pode ser alterado aqui.', 'Cannot be changed here.') }),
            h('div', null, h('p', { class: 'ph-campo-rotulo' }, TX.departamentos), h('div', { class: 'ph-tags' }, p.deptos.length ? p.deptos.map(x => badge((deptoPorId(x) || {}).nome, 'ok')) : badge(p.super ? P('Todos, como Super admin', 'All, as Super admin') : P('Nenhum', 'None'), 'neutro'))),
            h('div', { class: 'ph-largo ph-linha' }, botao({ texto: P('Salvar alterações', 'Save changes'), tom: 'primario', icone: 'check', aoClicar: () => {
              if (!form.validar(F)) return;
              perfilEdit = { nome: F.nome.valor(), email: F.email.valor() };
              registrarAuditoria(P('Perfil atualizado', 'Profile updated'), 'update', P('Nome e e-mail de ' + F.nome.valor(), 'Name and email of ' + F.nome.valor()), 'usuarios');
              pintarUsuario();
              toast(P('Perfil atualizado. Vale para esta visita.', 'Profile updated. It lasts for this visit.'), 'ok');
            } })))));
        } },
        { id: 'senha', rotulo: P('Senha', 'Password'), icone: 'chave', montar: pn => {
          const F = { atual: campo({ tipo: 'senha', rotulo: P('Senha atual', 'Current password'), obrigatorio: true }), nova: campo({ tipo: 'senha', rotulo: P('Nova senha', 'New password'), obrigatorio: true, ajuda: P('Pelo menos 12 caracteres.', 'At least 12 characters.'), validar: v => (v.length < 12 ? P('A nova senha deve ter pelo menos 12 caracteres.', 'The new password must have at least 12 characters.') : null) }), conf: campo({ tipo: 'senha', rotulo: P('Confirmar nova senha', 'Confirm new password'), obrigatorio: true }) };
          F.conf.validar = (orig => () => (orig() && (F.conf.valor() === F.nova.valor() ? true : F.conf.erro(P('As senhas não coincidem.', 'Passwords do not match.')))))(F.conf.validar);
          pn.append(tituloCard(P('Alterar senha', 'Change password'), P('Demonstração: nenhuma senha é guardada nem enviada.', 'Demo: no password is stored or sent.'), h('div', { class: 'ph-form ph-cfg-form' }, h('div', { class: 'ph-largo' }, F.atual), F.nova, F.conf,
            h('div', { class: 'ph-largo ph-linha' }, botao({ texto: P('Alterar senha', 'Change password'), tom: 'primario', icone: 'check', aoClicar: () => {
              if (!form.validar(F)) return;
              Object.values(F).forEach(c => { c.input.value = ''; });
              toast(P('Senha alterada. Demonstração: nada foi guardado.', 'Password changed. Demo: nothing was stored.'), 'ok');
            } })))));
        } },
        { id: 'notificacoes', rotulo: P('Notificações', 'Notifications'), icone: 'mensagem', montar: pn => {
          pn.append(tituloCard(P('Notificações', 'Notifications'), P('Avisos do hub para você.', 'Hub notices for you.'), h('div', { class: 'ph-pilha' },
            aviso(P('Todo envio nasce desligado: quem liga é o responsável, por escrito.', 'Every sending starts switched off: the owner turns it on, in writing.'), 'info'),
            marcar({ rotulo: P('Resumo diário por e-mail', 'Daily email summary'), alternar: true, desabilitado: true }),
            marcar({ rotulo: P('Alertas de verba da minha conta', 'Budget alerts for my account'), alternar: true, desabilitado: true }),
            marcar({ rotulo: P('Notas bloqueadas na fila', 'Blocked invoices in the queue'), alternar: true, desabilitado: true }))));
        } },
        { id: 'aparencia', rotulo: P('Aparência', 'Appearance'), icone: 'contrast', montar: pn => {
          const nome = uid('cfgtema');
          const tiles = h('div', { class: 'ph-opcoes-tile', role: 'radiogroup', 'aria-label': t(TX.temaInterface) }, Object.entries(VISUAIS).map(([k, v]) => {
            const id = nome + '-' + k;
            const r = h('input', { type: 'radio', class: 'dy-radio dy-radio-primary dy-radio-sm', name: nome, id, value: k, checked: k === visual ? true : null, 'data-tema-radio': '' });
            r.addEventListener('change', () => { if (r.checked) trocarVisual(k); });
            return h('label', { class: 'ph-opcao', for: id }, r, h('span', { class: 'ph-amostra', 'aria-hidden': 'true', style: { '--a1': v.amostra[0], '--a2': v.amostra[1], '--a3': v.amostra[2], '--a4': v.amostra[3] } }, h('i'), h('i'), h('i')), h('span', { class: 'ph-opcao-txt' }, h('strong', null, v.rotulo), h('span', null, v.desc)));
          }));
          const segLang = h('div', { class: 'ph-seg dy-join', role: 'group', 'aria-label': t(TX.idioma) }, [['pt', 'Português'], ['en', 'English']].map(([l, r]) => h('button', { type: 'button', class: 'dy-join-item dy-btn dy-btn-sm', 'data-lang': l, 'aria-pressed': String(l === lang), onclick: () => trocarLang(l) }, r)));
          const chaveContraste = marcar({ rotulo: TX.contraste, alternar: true, marcado: altoContraste, ajuda: TX.contrasteAjuda, aoMudar: v => trocarContraste(v) });
          chaveContraste.input.setAttribute('data-contraste-chave', '');
          pn.append(tituloCard(P('Aparência', 'Appearance'), P('A prévia aparece na hora. O tema fica salvo neste navegador.', 'The preview shows up right away. The theme is saved in this browser.'), h('div', { class: 'ph-pilha' },
            h('fieldset', { class: 'ph-grupo' }, h('legend', { class: 'ph-campo-rotulo' }, TX.temaInterface), tiles),
            h('fieldset', { class: 'ph-grupo' }, h('legend', { class: 'ph-campo-rotulo' }, P('Acessibilidade', 'Accessibility')), chaveContraste),
            h('fieldset', { class: 'ph-grupo' }, h('legend', { class: 'ph-campo-rotulo' }, TX.idioma), segLang),
            p.super && h('div', { class: 'ph-linha' }, botao({ texto: P('Aplicar para todos', 'Apply to everyone'), icone: 'check', tom: 'primario', aoClicar: () => {
              registrarAuditoria(P('Configuração alterada', 'Setting changed'), 'update', P('Tema do sistema para todos: ' + VISUAIS[visual].rotulo.pt, 'System theme for everyone: ' + VISUAIS[visual].rotulo.en), 'aparencia');
              toast(tx('temaAplicado', t(VISUAIS[visual].rotulo)), 'ok');
            } }), h('span', { class: 'ph-somente' }, P('Somente o Super admin aplica para todos.', 'Only the Super admin applies it to everyone.'))))));
        } },
      ],
    }, telaEstado);
    return {
      el: h('div', { class: 'ph-pagina' },
        cabecalho({ kicker: p.admin ? TX.administracao : TX.configConta, titulo: t(TX.configuracoes), sub: P('Sua conta e suas preferências.', 'Your account and preferences.') }),
        abasCfg),
      titulo: TX.configuracoes, migalhas: p.admin ? [{ texto: TX.administracao }, { texto: TX.configuracoes }] : [{ texto: TX.configuracoes }],
    };
  }

  const TELAS_ADMIN = { usuarios: [telaUsuarios, TX.usuarios], departamentos: [telaDepartamentos, TX.departamentos], auditoria: [telaAuditoria, TX.auditoria], configuracoes: [telaConfiguracoes, TX.configuracoes] };

  /* ---------- tour guiado: "Primeiro dia na EMPRESA DEMO" (CONTRATO, seção 10) ----------
     Roda na interface de verdade, não é vídeo. Holofote: o resto da tela escurece e o alvo fica recortado com a borda do destaque
     do tema, acompanhando rolagem e redimensionamento. Balão que veste o tema, cursor fantasma, dois modos (Assistir = piloto
     automático com pausa; Passo a passo = Próximo e Anterior, e a pessoa pode clicar ela mesma no alvo destacado), capítulos em
     etiquetas, teclado (Esc sai, setas avançam e voltam, Espaço pausa, foco preso no balão e devolvido ao sair), leitor de tela
     (região viva com o texto do passo), celular (o balão vira folha na base) e movimento reduzido (troca direta, sem deslizar).
     Alvo que não aparece em 2 s: o passo é pulado, sem erro. O tour principal mora aqui; cada módulo pode trazer def.tour.
     Passo: { capitulo?, rota?, alvo?, titulo, texto, acao?: 'clicar', antes?, espera?, posicao? }. Só o core usa rota, alvo
     em lista (o holofote cobre todos), alvo, antes e cada passo como função, e fim: true (a chamada final com o contato). */
  const CHAVE_TOUR = 'ph-demo-tour';          // escolha do convite da primeira visita: 'auto' | 'passo' | 'sozinho'
  const TOUR_ALVO_MS = 2000;                  // espera máxima pelo alvo antes de pular o passo
  const ANTES_DA_ROTA = ['fechar-dialogos', 'perfil-auditoria', 'perfil-devolver']; // ações que valem antes de desenhar a rota (o perfil muda a tela; trocar de rota fecharia o rastro calado, sem auditoria)
  let tour = null;                            // o tour em andamento ou o convite aberto (um de cada vez)
  let rotaPintada = null;                     // a última rota que o rotear desenhou: o tour espera a tela nova antes de procurar o alvo
  const depoisDe = ms => !!(tour && tour.mostrado && agora() - tour.tMostrado >= ms); // alvo que passeia dentro do passo
  const normRota = r => '#/' + String(r == null ? '' : r).replace(/^#?\/?/, '');
  const largo = () => consulta('(min-width: 1024px)');
  const folha = () => consulta('(max-width: 639.98px)');
  const telaWH = () => ({ w: window.innerWidth || 1280, h: window.innerHeight || 800 });
  const tourTimer = (fn, ms, grupo) => { if (!tour) return null; const dono = tour, set = dono[grupo || 'timers']; const id = setTimeout(() => { set.delete(id); if (tour === dono) fn(); }, ms); set.add(id); return id; };
  const limparTimers = grupo => { if (tour) { tour[grupo].forEach(clearTimeout); tour[grupo].clear(); } };
  function disparar(el, tipo) {
    if (typeof Event === 'function' && el.dispatchEvent) el.dispatchEvent(new Event(tipo, { bubbles: true }));
    else if (el.dispatch) el.dispatch(tipo);
  }

  /* O tour principal. Os alvos são ganchos estáveis (ids, classes, data-*), nunca texto da tela. */
  function tourHub() {
    const C = { entrada: P('Entrada', 'Sign-in'), painel: P('Painel', 'Dashboard'), sistema: P('Um sistema', 'A system'), auditoria: P('Auditoria', 'Audit log'), temas: P('Temas', 'Themes'), contato: P('Contato', 'Contact') };
    /* a fila da NF Autônoma à vista, mesmo que a pessoa tenha deixado outra aba aberta */
    const telaDaFila = () => {
      const aba = $('.nfa-real [data-aba-id="lanc"]');
      if (aba && aba.getAttribute('aria-selected') !== 'true') aba.click();
      const fila = $('.nfa-real [data-f="op-fila"]');
      if (fila && fila.getAttribute('aria-pressed') !== 'true') fila.click();
    };
    /* troca o tema ao vivo pelos 3 e volta ao da pessoa; nada fica gravado nem entra na auditoria */
    const cicloTemas = () => {
      const orig = visual;
      const mostrar = v => { visual = v; pintarCasca(); };
      ['escuro', 'claro', 'portfolio'].filter(v => v !== orig).concat(orig).forEach((v, k) => tourTimer(() => mostrar(v), 900 + k * 1500, 'timersPasso'));
      return () => mostrar(orig);
    };
    return {
      id: 'hub', nome: TX.tourNome,
      passos: [
        { capitulo: C.entrada, rota: '#/entrar', alvo: '.ph-login-temas', titulo: TX.tourNome,
          texto: P('Bem-vindo. Eu levo você pela mão, na interface de verdade. Primeiro, como o hub se veste: Plaqueta, Rack ou Crachá. A escolha vale na hora.', 'Welcome. I will walk you through the real interface. First, how the hub dresses up: Asset tag, Rack or Badge. The choice applies at once.') },
        { capitulo: C.entrada, rota: '#/entrar', antes: 'escolher-visitante', alvo: '[data-acao="entrar-visitante"]', acao: 'clicar', titulo: P('Entre como visitante', 'Enter as a visitor'),
          texto: P('Sem senha e sem cadastro. Cada perfil vê o hub de um jeito; o visitante navega pelo painel e pelos 14 sistemas.', 'No password and no sign-up. Each profile sees the hub its own way; the visitor browses the dashboard and the 14 systems.') },
        { capitulo: C.painel, rota: '#/', alvo: () => (depoisDe(2600) ? '.ph-feed' : '.ph-tiles'), titulo: P('O painel do dia', 'Today\'s dashboard'),
          texto: P('Primeiro os indicadores, uma cor cada. Depois a atividade em tempo real: robôs e pessoas registrando o que fazem, uma linha nova a cada poucos segundos.', 'First the indicators, one color each. Then live activity: robots and people logging what they do, a new line every few seconds.') },
        { capitulo: C.sistema, rota: '#/', antes: 'abrir-menu', alvo: '#ph-nav a[href="#/nf_autonoma"]', acao: 'clicar', titulo: P('Abra um sistema pelo menu', 'Open a system from the menu'),
          texto: P('Os 14 sistemas ficam no menu, por departamento. Vamos ao robô que lança no ERP as notas fiscais de entrada.', 'The 14 systems live in the menu, by department. Let us visit the robot that posts inbound invoices to the ERP.') },
        { capitulo: C.sistema, rota: '#/nf_autonoma', alvo: () => (largo() && !depoisDe(2600) ? '#ph-lateral' : '.ph-sysbar'), titulo: P('O menu recolhe, o sistema ganha espaço', 'The menu folds, the system gets room'),
          texto: P('Dentro de um sistema o menu vira um trilho de ícones e a moldura mostra departamento, situação e número de patrimônio.', 'Inside a system the menu becomes an icon rail and the frame shows department, status and asset number.') },
        { capitulo: C.sistema, rota: '#/nf_autonoma', antes: telaDaFila, alvo: '.nfa-real button.n-robo.ph-btn--ok', acao: 'clicar', titulo: P('A fila viva e um gesto', 'The live queue and one gesture'),
          texto: P('O robô simula cada nota antes de gravar. Esta passou limpa: um clique em Lançar e ela segue para a produção.', 'The robot simulates every invoice before writing. This one passed clean: one click on Post and it goes to production.') },
        { capitulo: C.sistema, alvo: ['.ph-modal-rodape .dy-btn-primary', '.ph-modal'], acao: 'clicar', titulo: P('Confirme: lançar agora', 'Confirm: post now'),
          texto: P('A janela resume o que o robô decidiu. Nada foi gravado ainda; o clique grava tudo em uma única transação.', 'The window sums up what the robot decided. Nothing has been written yet; the click writes everything in a single transaction.') },
        { capitulo: C.sistema, alvo: () => ($('.ph-erp') ? '.ph-erp' : '.ph-be'), espera: 4000, titulo: P('O rastro e a nota no ERP', 'The trace and the invoice in the ERP'),
          texto: P('Primeiro o rastro: o que o sistema faz quando você clica. Depois a janela do ERP abre com a nota pronta, preenchida pelo robô.', 'First the trace: what the system does when you click. Then the ERP window opens with the invoice ready, filled in by the robot.') },
        publico() && { capitulo: C.sistema, rota: '#/nf_autonoma', antes: 'fechar-dialogos', alvo: () => ($('.nfa-real .ph-fora') ? '.nfa-real .ph-fora' : '.nfa-real [data-aba-id="emails"]'), acao: 'clicar', espera: 2600, titulo: P('O resto, em vídeo', 'The rest, on video'),
          texto: P('As outras abas existem na versão completa. Aqui, cada uma mostra o vídeo do sistema funcionando.', 'The other tabs exist in the full version. Here, each one shows a video of the system running.') },
        { capitulo: C.auditoria, rota: '#/admin/auditoria', antes: ['fechar-dialogos', 'perfil-auditoria'], alvo: '.ph-painel-tabela tbody tr', titulo: P('A auditoria registrou o gesto', 'The audit log recorded the gesture'),
          texto: P('Quem fez, quando, o quê e onde. Para mostrar esta tela, o tour entrou por um instante como Super admin; o seu perfil volta no próximo passo.', 'Who, when, what and where. To show this screen, the tour signed in as Super admin for a moment; your profile comes back on the next step.') },
        { capitulo: C.temas, rota: '#/', antes: ['perfil-devolver', cicloTemas], alvo: '#ph-tema-btn', espera: 600, titulo: P('Troque o tema ao vivo', 'Switch the theme live'),
          texto: P('Plaqueta, Rack e Crachá: o mesmo hub, três mundos. A troca muda só a aparência e nada na tela é refeito.', 'Asset tag, Rack and Badge: the same hub, three worlds. Switching changes only the look and nothing on screen is rebuilt.') },
        { capitulo: C.contato, rota: '#/', antes: 'perfil-devolver', fim: true, titulo: TX.foraContatoTitulo,
          texto: P('Este foi o seu primeiro dia na EMPRESA DEMO. Fale comigo e eu apresento o sistema completo funcionando.', 'That was your first day at EMPRESA DEMO. Get in touch and I will walk you through the full system.') },
      ].filter(Boolean),
    };
  }

  /* Mini tour do módulo (def.tour): só o que o contrato deixa (alvo em texto, ação conhecida por nome); a rota é sempre a do sistema. */
  function tourDoSistema(item) {
    const lista = item && item.def && Array.isArray(item.def.tour) ? item.def.tour : [];
    const passos = lista.filter(p => p && typeof p === 'object' && p.titulo && p.texto).map(p => ({
      capitulo: p.capitulo, alvo: typeof p.alvo === 'string' ? p.alvo : undefined, titulo: p.titulo, texto: p.texto,
      acao: p.acao === 'clicar' ? 'clicar' : undefined, antes: typeof p.antes === 'string' ? p.antes : undefined,
      espera: Number.isFinite(p.espera) ? Math.max(0, Math.min(p.espera, 10000)) : 0, posicao: p.posicao,
    }));
    return passos.length ? { id: item.id, sistema: item.id, nome: item.nome, cor: corGrupo(item.grupo), passos } : null;
  }
  /* botão "Tour deste sistema" na barra do sistema, quando o módulo traz def.tour */
  function pintarTourSistema() {
    const r = rotaAtual();
    const acoes = main && main.querySelector('.ph-sysbar-acoes');
    const item = r.id && r.id !== 'admin' && itemPorId(r.id);
    if (!acoes || !item || acoes.querySelector('[data-acao="tour-sistema"]') || !tourDoSistema(item)) return;
    acoes.prepend(h('button', { type: 'button', class: 'ph-btn ph-btn--secundario dy-btn dy-btn-sm ph-btn-neutro', 'data-acao': 'tour-sistema',
      onclick: () => { const def = tourDoSistema(itemPorId(item.id)); if (def) tourIniciar(def, ler(CHAVE_TOUR) === 'passo' ? 'passo' : 'auto'); } },
    icone('map'), h('span', null, TX.tourSistema)));
  }
  function tourDaRota(sub) {
    const modo = sub === 'passo' ? 'passo' : 'auto';
    gravar(CHAVE_TOUR, modo); // quem chegou pelo link do tour não recebe o convite depois
    tourIniciar(tourHub(), modo);
  }

  /* ---- convite (primeira visita ou botão Tour do cabeçalho) ---- */
  function tourConvidar(doBotao) {
    if (tour) return;
    tour = novoTour({ convite: true, doBotao: !!doBotao });
    montarTour();
    tourPintar();
    posicionar();
    focarBalao(true);
  }
  function tourEscolher(escolha) {
    gravar(CHAVE_TOUR, escolha);
    if (escolha === 'auto' || escolha === 'passo') tourIniciar(tourHub(), escolha);
    else tourFechar(true);
  }
  /* fechar o convite (Esc, X ou navegar) não é escolha nova: na primeira visita vale "explorar sozinho"; depois, a escolha de antes fica */
  function fecharConvite(devolverFoco) {
    if (!ler(CHAVE_TOUR)) gravar(CHAVE_TOUR, 'sozinho');
    tourFechar(devolverFoco);
  }

  /* ---- ciclo do tour ---- */
  function novoTour(extra) {
    return { timers: new Set(), timersPasso: new Set(), timersPiloto: new Set(), limpezas: [], alvos: [], gen: 0, i: -1,
      focoAntes: document.activeElement, perfilInicial: perfilId, perfilAutoInicial: perfilAuto, perfilTroca: null, ...extra };
  }
  function tourIniciar(def, modo) {
    if (!def || !def.passos || !def.passos.length) return;
    const focoAntes = tour ? tour.focoAntes : document.activeElement;
    const perfilAntes = tour && !tour.convite ? { perfilInicial: tour.perfilInicial, perfilAutoInicial: tour.perfilAutoInicial } : {}; // "Ver de novo" lembra o perfil de quem começou
    tourFechar(false);
    tour = novoTour({ def, passos: def.passos, modo, rodando: modo === 'auto', focoAntes, ...perfilAntes });
    montarTour();
    tourIr(0, 1);
  }
  function montarTour() {
    const raiz = h('div', { class: cls('ph-tour', semMovimento() && 'is-reduzido', tour.convite && 'is-convite') });
    const holo = h('div', { class: 'ph-tour-holofote is-vazio', 'aria-hidden': 'true' });
    const cursor = h('div', { class: 'ph-tour-cursor is-oculto', 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24" focusable="false"><path d="M5 2.5 19.5 11l-6.3 1.7L10 19.5z"/></svg>' });
    const balao = h('section', { class: 'ph-tour-balao', role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': 'ph-tour-t', 'aria-describedby': 'ph-tour-x ph-tour-dica', tabindex: '-1' });
    const anuncio = h('p', { class: 'vh', 'aria-live': 'polite' });
    if (tour.def && tour.def.cor) balao.style.setProperty('--cor', tour.def.cor);
    raiz.append(holo, cursor, balao, anuncio);
    document.body.append(raiz);
    document.documentElement.classList.add('ph-tour-ativo');
    Object.assign(tour, { raiz, holo, cursor, balao, anuncio });
    ouvirTour(true);
    const dono = tour;
    /* o foco volta ao balão quando a tela o leva embora (rota nova foca o título, janela do kit foca a si mesma); só a pessoa
       clicando no alvo destacado tira o foco do balão naquele passo */
    const seguir = () => { if (tour !== dono) return; posicionar(); if (tour.rodando && tour.mostrado) moverCursor(); if (tour.mostrado && !tour.focoLivre) focarBalao(); tourTimer(seguir, 300); };
    tourTimer(seguir, 300);
  }
  function ouvirTour(liga) {
    const f = liga ? 'addEventListener' : 'removeEventListener';
    if (document[f]) { document[f]('keydown', tourTecla, true); document[f]('click', tourClique, true); document[f]('scroll', tourRolou, true); }
    if (window[f]) window[f]('resize', tourRolou);
  }
  let rolando = false;
  function tourRolou() {
    if (rolando || !tour) return;
    rolando = true;
    requestAnimationFrame(() => { rolando = false; if (!tour) return; posicionar(); if (tour.rodando && tour.mostrado) moverCursor(); });
  }
  function sairDoPasso() {
    limparTimers('timersPasso');
    limparTimers('timersPiloto');
    const l = tour.limpezas.splice(0);
    l.forEach(f => { try { f(); } catch (e) { console.error('[Hub] tour: falha ao sair do passo', e); } });
    tour.mostrado = false;
  }

  function tourIr(i, dir) {
    if (!tour || !tour.passos) return;
    sairDoPasso();
    if (i < 0) i = 0;
    if (i >= tour.passos.length) { tourParar(); return; }
    const gen = ++tour.gen;
    const p = tour.passos[i];
    tour.i = i;
    tour.feito = false;
    tour.focoLivre = false;
    tour.alvos = [];
    tour.proximoPendente = false;
    if (i === tour.passos.length - 1) tour.rodando = false; // o último passo espera a pessoa (Concluir, Ver de novo, Explorar sozinho)
    const antes = [].concat(p.antes || []);
    tour.repintar = false;
    antes.filter(a => ANTES_DA_ROTA.includes(a)).forEach(a => executarAntes(a, p));
    const rota = p.rota || (tour.def.sistema ? '#/' + tour.def.sistema : '');
    if (rota && normRota(rota) !== normRota(location.hash)) irRotaTour(rota);
    else if (tour.repintar) rotear(false); // o perfil mudou e a rota é a mesma: a tela é refeita com o perfil certo
    if (!tour.rodando) esconderCursor();
    tourPintar();
    const tRota = agora();
    let t0 = null, feitosAntes = false;
    const procurar = () => {
      if (!tour || gen !== tour.gen) return;
      const pronta = !rota || (rotaPintada === normRota(rota) && !(main && main.querySelector('[aria-busy]')));
      if (!pronta && agora() - tRota < 8000) { tourTimer(procurar, 80, 'timersPasso'); return; } // a tela nova (e o módulo) primeiro
      if (!feitosAntes) { feitosAntes = true; antes.filter(a => !ANTES_DA_ROTA.includes(a)).forEach(a => executarAntes(a, p)); }
      if (t0 == null) t0 = agora();
      const els = p.alvo ? acharAlvos(p.alvo) : [];
      if (p.alvo && !els.length) {
        if (agora() - t0 < TOUR_ALVO_MS) { tourTimer(procurar, 100, 'timersPasso'); return; }
        const prox = i + dir; // o alvo não apareceu: segue para o próximo passo (no mesmo sentido), sem erro
        if (prox >= 0 && prox < tour.passos.length) { tourIr(prox, dir); return; }
      }
      tour.alvos = els;
      mostrarPasso(gen);
    };
    tourTimer(procurar, 0, 'timersPasso');
  }
  function irRotaTour(rota) {
    if (rotaAtual().id === 'tour') { substituirRota(normRota(rota).slice(2)); return; } // #/tour não fica no histórico
    location.hash = normRota(rota);
    tourTimer(() => { if (rotaPintada !== normRota(location.hash)) rotear(true); }, 60); // sem hashchange (teste), desenha mesmo assim
  }
  function mostrarPasso(gen) {
    const a = tour.alvos[0];
    abrirDetalhes(tour.alvos);
    if (a && a.scrollIntoView) { try { a.scrollIntoView({ block: folha() ? 'start' : 'center', inline: 'nearest', behavior: semMovimento() ? 'auto' : 'smooth' }); } catch (e) { a.scrollIntoView(); } }
    tour.mostrado = true;
    tour.tMostrado = agora();
    tour.principal = a || null;
    posicionar();
    anunciar();
    focarBalao();
    tourTimer(() => { if (gen !== tour.gen) return; posicionar(); focarBalao(); if (tour.rodando) piloto(gen); }, semMovimento() ? 0 : 420, 'timersPasso');
    if (tour.proximoPendente) tourProximo(); // o Próximo chegou antes do alvo: vale agora, com o passo preparado
  }
  const leitura = p => Math.max(3000, Math.min(6500, 800 + (String(t(p.titulo)) + String(t(p.texto))).length * 20));
  /* piloto automático: o cursor desliza até o alvo; no passo com clique, lê, clica e mostra a tela mudando; depois o próximo */
  function piloto(gen) {
    const p = tour.passos[tour.i];
    const desliza = semMovimento() ? 0 : 750;
    const vivo = () => tour && gen === tour.gen && tour.rodando;
    moverCursor();
    if (p.acao === 'clicar' && tour.alvos.length && !tour.feito) {
      tourTimer(() => {
        if (!vivo()) return;
        clicarCursor();
        tourTimer(() => { if (!vivo()) return; executarAcao(); tourTimer(() => { if (vivo()) tourIr(tour.i + 1, 1); }, 1300 + (p.espera || 0), 'timersPiloto'); }, semMovimento() ? 0 : 240, 'timersPiloto');
      }, desliza + Math.round(leitura(p) * 0.6), 'timersPiloto');
    } else tourTimer(() => { if (vivo()) tourIr(tour.i + 1, 1); }, desliza + leitura(p) + (p.espera || 0), 'timersPiloto');
  }
  /* o clique que o passo pede (piloto automático, ou o Próximo do passo a passo quando a pessoa não clicou) */
  function executarAcao() {
    const p = tour && tour.passos[tour.i];
    if (!p || p.acao !== 'clicar' || tour.feito) return false;
    tour.feito = true;
    const el = tour.alvos.find(e => e.isConnected) || acharAlvos(p.alvo)[0];
    if (!el) return false;
    const antes = fotoAntes(el);
    tour.livre = true;
    try { el.click(); } catch (e) { console.error('[Hub] tour: o clique falhou', e); }
    if (!tour) return true;
    tour.livre = false;
    aposAcao(antes);
    /* a tela cresce com o clique (uma aba abre): o holofote acompanha e a parte nova fica à vista */
    tourTimer(() => {
      const els = acharAlvos(p.alvo);
      if (els.length > 1 && els[els.length - 1].scrollIntoView) els[els.length - 1].scrollIntoView({ block: 'nearest', behavior: semMovimento() ? 'auto' : 'smooth' });
      posicionar();
    }, 320, 'timersPasso');
    return true;
  }
  /* passo a passo: depois do clique (da pessoa ou do Próximo) a tela muda na frente dela e o tour segue sozinho. Só fica no
     passo quando o próprio alvo do passo passou a ser o que o clique revelou (ex.: o vídeo da aba aberta); aí o Próximo segue. */
  const fotoAntes = el => ({ el, rota: normRota(location.hash), dialogos: new Set(abertos) });
  function aposAcao(antes) {
    if (!tour || tour.rodando) return;
    const gen = tour.gen, p = tour.passos[tour.i];
    tourTimer(() => {
      if (!tour || tour.gen !== gen) return;
      const abriu = Array.from(abertos).some(c => !antes.dialogos.has(c));
      const revelou = acharAlvos(p.alvo)[0];
      if (normRota(location.hash) === antes.rota && !abriu && antes.el && antes.el.isConnected && revelou && revelou !== antes.el) posicionar();
      else tourIr(tour.i + 1, 1);
    }, 650, 'timersPasso');
  }
  function executarAntes(a, p) {
    if (!tour) return;
    tour.livre = true; // cliques da própria preparação (trocar de aba) não são barrados
    try {
      if (typeof a === 'function') { if (tour.def.id === 'hub') { const f = a(); if (typeof f === 'function') tour.limpezas.push(f); } return; } // função: só no tour do core
      if (a === 'abrir-menu') {
        if (!largo() && !menuAberto()) { abrirMenu(); tour.limpezas.push(() => fecharMenu(false)); } // no celular, a gaveta; no computador o menu já está à vista
        const sel = typeof p.alvo === 'string' ? p.alvo : null;
        if (sel) $$('#ph-nav details').forEach(d => { if (!d.hasAttribute('open') && $$(sel).some(x => d.contains(x))) d.setAttribute('open', ''); });
      } else if (a === 'abrir-menu-usuario') {
        const s = suspensos.find(x => x.btn && x.btn.id === 'ph-usuario-btn');
        if (s && !s.aberto) { s.abrir(); tour.limpezas.push(() => s.fechar(false)); }
      } else if (a === 'fechar-dialogos') {
        fecharSuspensos(false);
        fecharMenu(false);
        /* o rastro e a janela do ERP terminam antes de fechar: o que a ação grava (e a auditoria) acontece mesmo com pressa */
        for (let k = 0; k < 5 && abertos.size; k++) Array.from(abertos).reverse().forEach(c => { if (c.pular) { try { c.pular(); } catch (e) { /* já terminou */ } } c.fechar(true); });
      } else if (a === 'escolher-visitante') {
        const r = $$('.ph-perfis-grade input').find(x => x.value === 'visitante');
        if (r && !r.checked) { r.checked = true; disparar(r, 'change'); }
      } else if (a === 'perfil-auditoria') {
        Object.assign(dadosHub().filtroAud, { tipo: 'all', termo: '', usuario: '', periodo: 'todos' });
        if (!(perfil() && perfil().admin)) {
          if (!tour.perfilTroca) tour.perfilTroca = { id: perfilId, edit: perfilEdit, auto: perfilAuto };
          perfilId = 'super'; perfilEdit = {}; perfilAuto = false; // só nesta visita e só enquanto o passo pede: nada é gravado
          tour.repintar = true;
          pintarNav(); pintarUsuario();
        }
      } else if (a === 'perfil-devolver') devolverPerfil();
      /* nome desconhecido: ignorado (o passo segue) */
    } catch (e) {
      console.error('[Hub] tour: a preparação do passo falhou', e);
    } finally { if (tour) tour.livre = false; }
  }
  function devolverPerfil() {
    if (!tour || !tour.perfilTroca) return;
    ({ id: perfilId, edit: perfilEdit, auto: perfilAuto } = tour.perfilTroca);
    tour.perfilTroca = null;
    tour.repintar = true;
    pintarNav(); pintarUsuario();
  }

  function acharAlvos(alvo) {
    let sel = alvo;
    try { if (typeof sel === 'function') sel = sel(); } catch (e) { sel = null; }
    const { w } = telaWH();
    const visivel = e => {
      if (!e || !e.isConnected) return false;
      if (e.getClientRects && !e.getClientRects().length) return false;
      if (!e.getBoundingClientRect) return true;
      const r = e.getBoundingClientRect();
      if (!(r.width > 0 || r.height > 0)) return false;
      return (r.right > 0 && r.left < w) || rolaNaHorizontal(e); // fora da tela na horizontal (gaveta fechada) não vale; aba de uma faixa que rola, vale
    };
    return [].concat(sel || []).map(s => { try { return typeof s === 'string' ? $$(s).find(visivel) || null : null; } catch (e) { return null; } }).filter(Boolean);
  }
  /* a aba fica fora da tela dentro de uma faixa que rola de lado (abas no celular): o scrollIntoView do passo a traz */
  function rolaNaHorizontal(e) {
    for (let n = e.parentElement; n && n !== document.body; n = n.parentElement) {
      if (n.scrollWidth > n.clientWidth + 1 && typeof getComputedStyle === 'function' && /auto|scroll/.test(getComputedStyle(n).overflowX)) return true;
    }
    return false;
  }
  /* alvo dentro de um <details> fechado (a faixa "Controles da demonstração" começa fechada no celular): abre antes de apontar */
  function abrirDetalhes(els) {
    (els || []).forEach(e => {
      for (let d = e && e.parentElement && e.parentElement.closest && e.parentElement.closest('details:not([open])'); d; d = d.parentElement && d.parentElement.closest('details:not([open])')) d.open = true;
    });
  }
  function retangulo(els) {
    const rs = (els || []).filter(e => e && e.isConnected && e.getBoundingClientRect).map(e => e.getBoundingClientRect()).filter(r => r.width || r.height);
    if (!rs.length) return null;
    const top = Math.min(...rs.map(r => r.top)), left = Math.min(...rs.map(r => r.left)), right = Math.max(...rs.map(r => r.right)), bottom = Math.max(...rs.map(r => r.bottom));
    return { top, left, right, bottom, width: right - left, height: bottom - top };
  }
  /* holofote no alvo (ou escuro inteiro sem alvo) e o balão do lado que couber; no celular o balão é uma folha na base (CSS) */
  function posicionar() {
    if (!tour || !tour.balao) return;
    const { w, h: alt } = telaWH();
    const p = tour.passos && tour.passos[tour.i];
    if (p && p.alvo && tour.mostrado) {
      const novos = acharAlvos(p.alvo);
      tour.alvos = novos.length ? novos : tour.alvos.filter(e => e.isConnected);
      const a = tour.alvos[0];
      if (a && a !== tour.principal) { tour.principal = a; abrirDetalhes([a]); if (a.scrollIntoView) a.scrollIntoView({ block: 'nearest', behavior: semMovimento() ? 'auto' : 'smooth' }); } // o holofote passeou: o novo alvo fica à vista
    }
    const r = tour.convite ? null : retangulo(tour.alvos);
    const hs = tour.holo.style;
    if (r) {
      const top = Math.max(-8, r.top - 6), left = Math.max(-8, r.left - 6), right = Math.min(w + 8, r.right + 6), bottom = Math.min(alt + 8, r.bottom + 6);
      Object.assign(hs, { top: top + 'px', left: left + 'px', width: Math.max(0, right - left) + 'px', height: Math.max(0, bottom - top) + 'px' });
      tour.holo.classList.remove('is-vazio');
    } else {
      Object.assign(hs, { top: Math.round(alt / 2) + 'px', left: Math.round(w / 2) + 'px', width: '0px', height: '0px' });
      tour.holo.classList.add('is-vazio');
    }
    const b = tour.balao;
    if (folha()) {
      b.style.left = ''; b.style.top = '';
      /* o alvo que não rola (botão no rodapé de uma janela) ficaria atrás da folha: se ele cabe acima dela, a folha sobe para o topo */
      const a0 = r && retangulo(tour.alvos.slice(0, 1)), fh = b.offsetHeight || 0;
      b.setAttribute('data-lado', a0 && a0.bottom > alt - fh && a0.top >= fh + 8 ? 'folha-topo' : 'folha');
      return;
    }
    const bw = b.offsetWidth || 380, bh = b.offsetHeight || 240, m = 12, gap = 16;
    let x, y, lado = 'centro';
    if (!r) { x = (w - bw) / 2; y = (alt - bh) / 2; }
    else {
      const cabe = { baixo: r.bottom + gap + bh <= alt - m, cima: r.top - gap - bh >= m, direita: r.right + gap + bw <= w - m, esquerda: r.left - gap - bw >= m };
      lado = [p && p.posicao].concat(['baixo', 'cima', 'direita', 'esquerda']).find(l => cabe[l]) || 'canto';
      const cx = r.left + r.width / 2 - bw / 2, cy = r.top + r.height / 2 - bh / 2;
      if (lado === 'baixo') { x = cx; y = r.bottom + gap; } else if (lado === 'cima') { x = cx; y = r.top - gap - bh; }
      else if (lado === 'direita') { x = r.right + gap; y = cy; } else if (lado === 'esquerda') { x = r.left - gap - bw; y = cy; }
      else { x = w - bw - 24; y = alt - bh - 24; } // alvo que ocupa a tela: o balão fica no canto, por cima
    }
    b.style.left = Math.round(Math.min(Math.max(m, x), w - bw - m)) + 'px';
    b.style.top = Math.round(Math.min(Math.max(m, y), alt - bh - m)) + 'px';
    b.setAttribute('data-lado', lado);
  }
  function moverCursor() {
    const c = tour && tour.cursor;
    if (!c) return;
    const r = tour.rodando && retangulo(tour.alvos.slice(0, 1)); // o primeiro alvo é o que recebe o clique
    if (!r) { esconderCursor(); return; }
    const { w, h: alt } = telaWH();
    const x = Math.min(Math.max(6, r.left + Math.min(r.width / 2, 64)), w - 28), y = Math.min(Math.max(6, r.top + Math.min(r.height / 2, 30)), alt - 28);
    c.classList.remove('is-oculto'); // por opacidade, não display: o cursor continua deslizando de onde estava
    c.style.transform = 'translate(' + Math.round(x) + 'px, ' + Math.round(y) + 'px)';
  }
  function esconderCursor() { if (tour && tour.cursor) tour.cursor.classList.add('is-oculto'); }
  function clicarCursor() {
    const c = tour.cursor;
    c.classList.remove('is-clique');
    void c.offsetWidth; // reinicia a animação do anel
    c.classList.add('is-clique');
  }
  function anunciar() {
    const p = tour && tour.passos && tour.passos[tour.i];
    if (p) tour.anuncio.textContent = tx('tourPassoDe', tour.i + 1, tour.passos.length) + ': ' + t(p.titulo) + '. ' + t(p.texto);
  }
  /* o foco fica no balão (o primeiro botão de ação); um painel do cabeçalho aberto pelo passo mantém o dele */
  function focarBalao(forcar) {
    if (!tour || !tour.balao) return;
    const a = document.activeElement;
    if (!forcar && a && (tour.balao.contains(a) || suspensos.some(s => s.aberto && s.pn.contains(a)))) return;
    (tour.balao.querySelector('[data-tour-foco]') || tour.balao).focus({ preventScroll: true });
  }

  function capitulos() {
    const caps = [];
    let atual = null;
    tour.passos.forEach((p, i) => {
      const nome = p.capitulo ? t(p.capitulo) : atual ? atual.nome : '';
      if (!atual || nome !== atual.nome) caps.push(atual = { nome, de: i, ate: i }); else atual.ate = i;
    });
    /* sem capítulos (mini tour de um sistema): uma etiqueta por passo */
    return caps.length > 1 ? caps : tour.passos.map((p, i) => ({ nome: String(i + 1).padStart(2, '0'), de: i, ate: i }));
  }
  function tourPintar() {
    if (!tour || !tour.balao) return;
    const b = tour.balao;
    const a = document.activeElement;
    const papelFoco = a && b.contains(a) ? a.getAttribute('data-tour-papel') : null;
    const btn = (papel, o, foco) => { const el = botao({ tamanho: 'p', ...o }); el.setAttribute('data-tour-papel', papel); if (foco) el.setAttribute('data-tour-foco', ''); return el; };
    const titulo = texto => h('h2', { class: 'ph-tour-titulo', id: 'ph-tour-t' }, h('span', { class: 'ph-fita' }, texto));
    const rodape = (rotulo, acoes) => h('div', { class: 'ph-tour-rodape' },
      h('span', { class: 'ph-tour-passo' }, h('span', null, rotulo), codigoBarras(String(rotulo).toUpperCase())), acoes && h('div', { class: 'ph-tour-acoes' }, acoes));
    const cab = kicker => h('div', { class: 'ph-tour-cab' }, h('span', { class: 'ph-tour-led', 'aria-hidden': 'true' }), h('p', { class: 'ph-tour-kicker' }, kicker),
      btn('sair', { icone: 'fechar', titulo: TX.tourSair, tom: 'fantasma', aoClicar: () => (tour.convite ? fecharConvite(true) : tourFechar(true)) }));
    const dica = h('p', { class: 'vh', id: 'ph-tour-dica' }, TX.tourDica);
    if (tour.convite) {
      b.replaceChildren(cab(TX.tourConviteKicker), titulo(TX.tourNome), h('p', { class: 'ph-tour-texto', id: 'ph-tour-x' }, TX.tourConviteTexto),
        h('div', { class: 'ph-tour-escolhas' },
          btn('auto', { texto: TX.tourAssistir, icone: 'play', tom: 'primario', aoClicar: () => tourEscolher('auto') }, true),
          btn('passo', { texto: TX.tourPassoAPasso, icone: 'list', aoClicar: () => tourEscolher('passo') }),
          btn('sozinho', { texto: TX.tourSozinho, tom: 'fantasma', aoClicar: () => tourEscolher('sozinho') })),
        dica, rodape(TX.empresa));
    } else {
      const n = tour.passos.length, i = Math.max(0, tour.i), p = tour.passos[i], ultimo = i === n - 1;
      const caps = capitulos(), k = caps.findIndex(c => i >= c.de && i <= c.ate);
      /* fim do tour de um sistema que não termina no cartão "fora da demonstração" (Raio-X, Base de conhecimento): o vídeo e o contato vêm no balão */
      const chamada = p.fim || (ultimo && tour.def.sistema && !/ph-fora/.test(String(p.alvo || '')));
      const anterior = btn('anterior', { texto: TX.tourAnterior, icone: 'seta-esq', tom: 'fantasma', desabilitado: i === 0, aoClicar: tourAnterior });
      const acoes = p.fim
        ? [anterior, btn('denovo', { texto: TX.tourVerDeNovo, icone: 'rotate-ccw', aoClicar: tourDeNovo }), btn('sozinho', { texto: TX.tourSozinho, icone: 'arrow-right', tom: 'primario', aoClicar: () => tourFechar(true) }, true)]
        : ultimo
          ? [anterior, btn('denovo', { texto: TX.tourVerDeNovo, icone: 'rotate-ccw', aoClicar: tourDeNovo }), btn('proximo', { texto: TX.tourConcluir, icone: 'check', tom: 'primario', aoClicar: () => tourFechar(true) }, true)]
          : [anterior,
            btn('pausa', { texto: tour.rodando ? TX.tourPausar : tour.modo === 'auto' ? TX.tourContinuar : TX.tourAssistirCurto, icone: tour.rodando ? 'pause' : 'play', aoClicar: tourAlternar }, tour.rodando),
            btn('proximo', { texto: TX.tourProximo, icone: 'seta-dir', tom: 'primario', aoClicar: tourProximo }, !tour.rodando)];
      const passo = tx('tourPasso', String(i + 1).padStart(2, '0'), String(n).padStart(2, '0'));
      b.replaceChildren(...[cab(tour.def.nome), titulo(p.titulo), h('p', { class: 'ph-tour-texto', id: 'ph-tour-x' }, p.texto),
        chamada && h('div', { class: 'ph-tour-contato' }, !p.fim && h('p', { class: 'ph-fora-contato-titulo' }, TX.foraContatoTitulo), linksContato(), !p.fim && videoDoCatalogo(tour.def.sistema)), // o contato primeiro: na folha do celular ele fica à vista
        h('ol', { class: 'ph-tour-caps', 'aria-label': t(TX.tourCapitulos) }, caps.map((c, j) => h('li', { class: cls(j < k && 'is-visto', j === k && 'is-atual'), 'aria-current': j === k ? 'step' : null },
          c.nome, j < k && h('span', { class: 'vh' }, ' ', TX.tourVisto)))),
        dica, rodape(passo, acoes)].filter(Boolean));
    }
    tour.raiz.classList[tour.rodando ? 'add' : 'remove']('is-rodando');
    const volta = papelFoco && (b.querySelector('[data-tour-papel="' + papelFoco + '"]:not([disabled])') || b.querySelector('[data-tour-foco]'));
    if (volta) volta.focus({ preventScroll: true });
  }

  function tourProximo() {
    if (!tour || !tour.passos || tour.i >= tour.passos.length - 1) return;
    if (!tour.mostrado) { tour.proximoPendente = true; return; } // o passo ainda procura o alvo: o clique dele precisa da tela pronta
    limparTimers('timersPiloto');
    const gen = tour.gen;
    /* o Próximo faz o clique que o passo pede, se ainda não foi feito: no piloto automático segue logo; no passo a passo
       a pessoa vê o resultado (o aposAcao decide se o tour segue sozinho) */
    if (executarAcao()) {
      if (tour && tour.rodando) tourTimer(() => { if (tour && tour.gen === gen) tourIr(tour.i + 1, 1); }, 350, 'timersPasso');
      return;
    }
    tourIr(tour.i + 1, 1);
  }
  function tourAnterior() {
    if (tour && tour.passos && tour.i > 0) tourIr(tour.i - 1, -1);
  }
  function tourAlternar() {
    if (!tour || !tour.passos || tour.i >= tour.passos.length - 1) return;
    tour.rodando = !tour.rodando;
    if (!tour.rodando) { limparTimers('timersPiloto'); esconderCursor(); }
    tourPintar();
    if (tour.rodando && tour.mostrado) piloto(tour.gen);
  }
  function tourParar() {
    tour.rodando = false;
    esconderCursor();
    tourPintar();
  }
  function tourDeNovo() {
    if (tour && tour.def) tourIniciar(tour.def.id === 'hub' ? tourHub() : tour.def, tour.modo);
  }
  /* sai do tour: o perfil que a pessoa tinha volta (a troca para ver a auditoria nunca fica) e o foco volta para onde estava */
  function tourFechar(devolverFoco) {
    if (!tour) return;
    sairDoPasso();
    limparTimers('timers');
    const tt = tour;
    devolverPerfil();
    tour = null;
    ouvirTour(false);
    tt.raiz.remove();
    document.documentElement.classList.remove('ph-tour-ativo');
    let repintar = tt.repintar;
    if (tt.passos && tt.perfilInicial && perfilId !== tt.perfilInicial) { entrarComo(tt.perfilInicial, tt.perfilAutoInicial); repintar = true; }
    if (repintar && rotaAtual().id !== 'entrar') rotear(false);
    if (!devolverFoco) return;
    const visivel = x => !x.getClientRects || x.getClientRects().length > 0; // o botão Tour some na tela de entrada: aí o foco vai para a página
    const alvo = tt.focoAntes && tt.focoAntes.isConnected && tt.focoAntes !== document.body && visivel(tt.focoAntes) ? tt.focoAntes : (main && (main.querySelector('[data-foco]') || main));
    if (alvo) alvo.focus({ preventScroll: true });
  }

  /* teclado: Esc sai; setas e Espaço só com o foco no balão (ou na página), para não roubar as teclas de campos e abas */
  function tourTecla(e) {
    if (!tour) return;
    const alvo = e.target;
    const noBalao = !!(alvo && tour.balao.contains(alvo));
    if (e.key === 'Escape') {
      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation();
      if (tour.convite) fecharConvite(true); else tourFechar(true);
      return;
    }
    if (e.key === 'Tab' && noBalao) { // foco preso no balão
      const foco = $$(FOCAVEIS, tour.balao).filter(x => x.getClientRects().length);
      if (!foco.length) return;
      const pri = foco[0], ult = foco[foco.length - 1];
      if (e.shiftKey && (alvo === pri || alvo === tour.balao)) { e.preventDefault(); ult.focus(); } else if (!e.shiftKey && alvo === ult) { e.preventDefault(); pri.focus(); }
      return;
    }
    if (tour.convite) return;
    const livre = noBalao || !alvo || alvo === document || alvo === document.body || alvo === document.documentElement || alvo === main;
    if (!livre) return;
    if (e.key === 'ArrowRight') { if (e.preventDefault) e.preventDefault(); tourProximo(); }
    else if (e.key === 'ArrowLeft') { if (e.preventDefault) e.preventDefault(); tourAnterior(); }
    else if (e.key === ' ' || e.key === 'Spacebar') {
      if (noBalao && /^(BUTTON|A)$/.test(alvo.tagName || '')) return; // botão focado: o Espaço é dele (o de pausa já alterna)
      if (e.preventDefault) e.preventDefault();
      tourAlternar();
    }
  }
  /* durante o tour só o balão e o alvo destacado recebem clique; clicar no alvo de um passo "clicar" vale como o clique do passo */
  function tourClique(e) {
    if (!tour || tour.convite || tour.livre) return;
    const n = e.target;
    if (!n || tour.balao.contains(n)) return;
    if (n.closest && n.closest('[data-lang]')) return; // trocar o idioma no meio do tour vale (o balão acompanha)
    const p = tour.passos[tour.i];
    if (tour.alvos.some(a => a.contains(n))) {
      // passo sem clique: botões e links dentro do alvo não abrem nada (a janela aberta ficaria presa embaixo do véu)
      if (!(p && p.acao === 'clicar') && n.closest && n.closest('button, a[href], [role="button"], [role="tab"], summary')) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        return;
      }
      tour.focoLivre = true; // a pessoa entrou no alvo (um campo, um botão): o foco fica com ela neste passo
      if (p && p.acao === 'clicar' && !tour.feito) {
        tour.feito = true;
        if (!tour.rodando) { aposAcao(fotoAntes(tour.alvos.find(a => a.contains(n)))); return; }
        limparTimers('timersPiloto');
        const gen = tour.gen;
        tourTimer(() => { if (tour && tour.gen === gen && tour.rodando) tourIr(tour.i + 1, 1); }, 1300 + (p.espera || 0), 'timersPiloto');
      }
      return;
    }
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }

  function desmontar() {
    montagem++;
    moduloAtual = null;
    Array.from(abertos).forEach(c => c.fechar(true));
    timers.forEach(clearTimeout);
    timers.clear();
    if (typeof limpeza === 'function') { try { limpeza(); } catch (e) { console.error('[Hub] falha na limpeza', e); } }
    limpeza = null;
  }

  function rotear(navegou, manterFoco) {
    if (!main) return;
    const r = rotaAtual();
    if (r.id === 'tour') { tourDaRota(r.sub); return; } // #/tour (links do portfólio) começa o tour principal; #/tour/passo, no passo a passo
    if (navegou && cargas.get(r.id) === 'falhou') cargas.delete(r.id); // voltar à rota tenta baixar o arquivo de novo
    if (r.id !== 'entrar' && !perfilId) {
      if (!r.id) { substituirRota('entrar'); return; } // sem perfil, o hub abre no login
      entrarComo('visitante', true);                 // link direto: entra como Visitante, com aviso
    }
    const focoAntes = manterFoco && document.activeElement && main.contains(document.activeElement) && document.activeElement.hasAttribute('data-foco');
    desmontar();
    fecharSuspensos(false);
    let tela;
    try {
      if (r.id === 'entrar') tela = telaLogin();
      else if (!r.id) tela = telaPainel();
      else if (r.id === 'admin') {
        const adm = TELAS_ADMIN[r.sub];
        tela = !adm ? telaNaoEncontrada(false) : perfil().admin || r.sub === 'configuracoes' ? adm[0]() : telaRestrita(adm[1]); // Configurações é da conta: todo perfil abre
      } else {
        const item = itemPorId(r.id);
        tela = !item ? telaNaoEncontrada(true) : r.sub === 'manual' ? telaManual(item) : telaSistema(item);
      }
    } catch (e) {
      console.error('[Hub] falha ao desenhar a tela', e);
      tela = { el: h('div', { class: 'ph-pagina' }, preparacao(null, true)), titulo: TX.preparacaoTitulo, migalhas: [] };
    }
    const raiz = document.documentElement;
    if (tela.semCasca) raiz.classList.add('ph-modo-entrar'); else raiz.classList.remove('ph-modo-entrar');
    if (tela.semCasca && menuAberto()) fecharMenu(false);
    main.replaceChildren(tela.el);
    if (tela.depois) tela.depois();
    const sis = r.id && r.id !== 'admin' && r.id !== 'entrar' && itemPorId(r.id) ? r.id : '';
    if (sis !== sistemaDoMenu) { sistemaDoMenu = sis; menuRecolhido = !!sis; } // entrou num sistema (ou trocou): recolhe; voltou ao hub: abre
    pintarNav();
    pintarMigalhas(tela.migalhas);
    pintarAvisoPerfil();
    pintarTourSistema();
    rotaPintada = normRota(r.bruto);
    document.title = (tela.titulo ? t(tela.titulo) + ' · ' : '') + t(TX.tituloSufixo);
    if (navegou || focoAntes) {
      if (navegou) window.scrollTo(0, 0);
      if (tour && tour.balao && !tour.convite) { focarBalao(); return; } // no tour o foco fica no balão (as teclas do tour seguem valendo)
      const alvo = main.querySelector('[data-foco]') || main;
      alvo.focus({ preventScroll: true });
    }
  }

  function iniciar() {
    if (iniciado) return;
    app = $('#ph-app');
    main = $('#ph-main');
    if (!app || !main) return;
    iniciado = true;
    nav = $('#ph-nav');
    migalhas = $('#ph-migalhas');
    coluna = $('.ph-coluna');
    if (migalhas) migalhas.classList.add('dy-breadcrumbs');
    $$('[data-icone]').forEach(el => el.replaceWith(icone(el.dataset.icone)));
    $$('[data-marca]').forEach(el => el.replaceWith(marca(false)));
    const opcoesTema = $('#ph-tema-opcoes');
    if (opcoesTema) opcoesTema.replaceChildren(...Object.entries(VISUAIS).map(([k, v]) => h('button', { type: 'button', class: 'ph-opcao', 'data-tema': k, 'aria-pressed': String(k === visual) },
      h('span', { class: 'ph-amostra', 'aria-hidden': 'true', style: { '--a1': v.amostra[0], '--a2': v.amostra[1], '--a3': v.amostra[2], '--a4': v.amostra[3] } }, h('i'), h('i'), h('i')),
      h('span', { class: 'ph-opcao-txt' }, h('strong', { 'data-tema-nome': k }, v.rotulo), h('span', { 'data-tema-desc': k }, v.desc)))));
    $$('[data-tema]').forEach(b => b.addEventListener('click', () => trocarVisual(b.dataset.tema)));
    $$('[data-lang]').forEach(b => b.addEventListener('click', () => trocarLang(b.dataset.lang)));
    $$('[data-acao="abrir-menu"]').forEach(b => b.addEventListener('click', () => (menuAberto() ? fecharMenu(true) : abrirMenu())));
    $$('[data-acao="fechar-menu"]').forEach(b => b.addEventListener('click', e => { if (e && e.preventDefault) e.preventDefault(); fecharMenu(true); }));
    $$('[data-acao="recolher-menu"]').forEach(b => b.addEventListener('click', () => { menuRecolhido = !menuRecolhido; pintarNav(); }));
    const lado = $('#ph-lateral');
    if (lado) {
      const comDica = e => { let n = e.target; while (n && n !== lado) { if (n.getAttribute && n.getAttribute('data-dica')) return n; n = n.parentNode; } return null; };
      lado.addEventListener('mouseover', e => mostrarDica(comDica(e)));
      lado.addEventListener('focusin', e => mostrarDica(comDica(e)));
      lado.addEventListener('mouseleave', esconderDica);
      lado.addEventListener('focusout', esconderDica);
    }
    if (nav) nav.addEventListener('scroll', () => mostrarDica(nav.contains(document.activeElement) ? document.activeElement : null)); // o Tab que rola o trilho leva a dica junto
    $$('.ph-pular').forEach(b => b.addEventListener('click', e => { if (e && e.preventDefault) e.preventDefault(); const alvo = main.querySelector('[data-foco]') || main; alvo.focus(); }));
    if (nav) nav.addEventListener('click', e => { let n = e.target; while (n && n !== nav) { if (n.tagName === 'A') { fecharMenu(false); break; } n = n.parentNode; } });
    ligarSuspenso($('#ph-busca-btn'), $('#ph-busca-painel'), () => { const q = $('#ph-busca-q'); if (q) { q.value = ''; pintarBusca(''); } return q; });
    ligarSuspenso($('#ph-tema-btn'), $('#ph-tema-painel'), () => $('#ph-tema-painel [aria-pressed="true"]'));
    ligarSuspenso($('#ph-usuario-btn'), $('#ph-usuario-painel'));
    const q = $('#ph-busca-q');
    if (q) {
      q.addEventListener('input', () => pintarBusca(q.value));
      q.addEventListener('keydown', e => {
        const links = $$('#ph-busca-lista a');
        if (e.key === 'Enter' && links[0]) { e.preventDefault(); links[0].click(); }
        if (e.key === 'ArrowDown' && links[0]) { e.preventDefault(); links[0].focus(); }
      });
      const lista = $('#ph-busca-lista');
      if (lista) lista.addEventListener('keydown', e => {
        const links = $$('#ph-busca-lista a'), i = links.indexOf(document.activeElement);
        if (i < 0) return;
        if (e.key === 'ArrowDown') { e.preventDefault(); (links[i + 1] || links[0]).focus(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); (i === 0 ? q : links[i - 1]).focus(); }
      });
    }
    document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; esconderDica(); if (menuAberto()) fecharMenu(true); });
    document.addEventListener('click', e => {
      if (!suspensos.some(s => s.aberto)) return;
      let n = e.target;
      while (n) { if (suspensos.some(s => s.pn === n || s.btn === n)) return; n = n.parentNode; }
      fecharSuspensos(false);
    });
    $$('[data-acao="tour"]').forEach(b => b.addEventListener('click', () => { if (!tour) tourConvidar(true); }));
    window.addEventListener('hashchange', () => {
      if (tour && tour.convite) fecharConvite(false); // navegar com o convite aberto: explorar sozinho
      fecharMenu(false);
      rotear(true);
    });
    try {
      const largo = window.matchMedia ? window.matchMedia('(min-width: 1024px)') : null;
      if (largo && largo.addEventListener) largo.addEventListener('change', e => { if (e.matches) fecharMenu(false); pintarNav(); }); // o trilho só existe no computador
    } catch (e) { /* navegador antigo */ }
    pintarCasca();
    rotear(false);
    relogio();
  }

  window.Hub = Object.freeze({ registrar, versao: VERSAO });
  if (document.readyState === 'complete') iniciar();
  else { document.addEventListener('DOMContentLoaded', iniciar); window.addEventListener('load', iniciar); }
})();
