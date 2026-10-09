/* Base de conhecimento (CoreEngine) · módulo do ProjectHub de demonstração (id base_conhecimento).
   Réplica de ponta a ponta do sistema real: central de comando (relógio, busca, indicadores, distribuição por tipo, pilares,
   mural e links rápidos), trilha de pilares, lista, leitor com tópicos, editor em Markdown com barra de ferramentas e modelos,
   anexos com lista de formatos permitidos, rascunho e publicação por quem gere, e o rastro do que o servidor faz em cada chamada.
   Visual único do hub (CONTRATO, seção 7; migrado em 06/10/2026): sem paleta, tema, fonte nem marca próprios. O nome do sistema
   fica na moldura da casca; o título de cada tela usa o padrão do hub (ph-h1). Botões, selos, indicadores, cartões, busca, campos,
   caixas de marcar, vazio, avisos (toast), diálogos (ui.modal) e rastros (ui.backend) vêm do kit. O bloco de estilo (#bc-real-css,
   escopo .bc-real) só arruma o layout e desenha, com os tokens --ph-*, as peças sem equivalente no kit: a trilha de pilares, a barra
   de tipos, o mural, os links rápidos, a barra de ferramentas do editor e o leitor de Markdown (tipografia de leitura com os tokens).
   O que só existe na demonstração (perfil simulado, rastro das leituras, entrega dos anexos e auditoria) fica na faixa
   "Controles da demonstração".
   Todo o conteúdo é fictício, escrito para a demonstração. Nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const md = (...linhas) => linhas.join('\n');
  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const PROJ = 15; // id fictício do projeto no portal
  const ROTA = '/api/conhecimento/' + PROJ;
  const MB = 1024 * 1024;

  /* ---------- ícones de traço (grade 24x24), os mesmos desenhos usados pelo sistema real ---------- */
  const IC = {
    book: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    pin: '<path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>',
    fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    fileCode: '<path d="M10 12.5 8 15l2 2.5"/><path d="m14 12.5 2 2.5-2 2.5"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z"/>',
    lifeBuoy: '<circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/>',
    server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
    database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    headphones: '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
    back: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    upRight: '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
    save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
    eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
    /* no lugar dos símbolos da barra de ferramentas e do leitor do sistema real */
    list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
    quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
    checkSq: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/>',
    image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
    video: '<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
    clip: '<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>',
    timer: '<path d="M10 2h4"/><path d="M12 14l3-3"/><circle cx="12" cy="14" r="8"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
    /* faixa "Controles da demonstração" */
    sliders: '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
  };

  /* ---------- tipos de página, ícones dos pilares e cores ----------
     A tela pinta só com os tokens de destaque da casca (TOKEN). PALETA é DADO: o valor gravado no campo "cor" do pilar (o sistema
     real guarda a cor livre em hexadecimal); um pilar com a cor da paleta aparece com o token equivalente, e só uma cor escolhida
     pela pessoa no seletor do diálogo é pintada como veio, no ícone e no filete do pilar. */
  const PALETA = { azul: '#3b82f6', violeta: '#8b5cf6', verde: '#22c55e', ambar: '#f59e0b', rosa: '#ec4899', turquesa: '#2dd4bf', ceu: '#60a5fa', lilas: '#a78bfa' };
  const TOKEN = { azul: 'var(--ph-cor-azul)', violeta: 'var(--ph-cor-violeta)', verde: 'var(--ph-cor-verde)', ambar: 'var(--ph-cor-ambar)', rosa: 'var(--ph-cor-rosa)', turquesa: 'var(--ph-cor-teal)', ceu: 'var(--ph-cor-azul)', lilas: 'var(--ph-cor-violeta)' };
  const corPilar = cor => { const k = Object.keys(PALETA).find(x => PALETA[x] === String(cor).toLowerCase()); return k ? TOKEN[k] : cor; };
  /* cores dos links rápidos, na ordem do sistema real (o pilar usa cor livre) */
  const CORES =[['azul', P('Azul', 'Blue')], ['violeta', P('Violeta', 'Violet')], ['verde', P('Verde', 'Green')], ['ambar', P('Âmbar', 'Amber')], ['rosa', P('Rosa', 'Pink')], ['turquesa', P('Turquesa', 'Teal')]];
  const TIPOS = {
    livre: { rotulo: P('Livre', 'Free-form'), icone: 'fileText', cor: 'ceu' },
    arquitetura: { rotulo: P('Arquitetura', 'Architecture'), icone: 'fileCode', cor: 'lilas' },
    runbook: { rotulo: P('Runbook', 'Runbook'), icone: 'lifeBuoy', cor: 'ambar' },
  };
  const ORDEM_TIPOS = ['arquitetura', 'runbook', 'livre'];
  const ICONES_CAT = { Folder: 'folder', Server: 'server', Database: 'database', ShieldCheck: 'shield', Headphones: 'headphones', Users: 'users' };
  /* o que cada registro da auditoria descreve, em palavras */
  const AREAS = { paginas: P('Página', 'Page'), pilares: P('Pilar', 'Pillar'), anexos: P('Anexo do projeto', 'Project attachment') };
  const MESES = P(['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);

  /* Modelos por tipo (o tipo "livre" não tem modelo, como no sistema real). */
  const MODELOS = {
    arquitetura: P(
      md('## 1. Visão geral', 'Qual dor de negócio este sistema resolve.', '', '## 2. Desenho técnico e topologia', 'Inserir o diagrama (use o botão Imagem).', '', '## 3. Componentes físicos e lógicos', '- Servidor:', '- Sistema operacional:', '- Endereço:', '- Dependências (portas, APIs):', '', '## 4. Saúde do serviço', 'Como validar que o serviço está 100% no ar.'),
      md('## 1. Overview', 'Which business pain this system solves.', '', '## 2. Technical design and topology', 'Insert the diagram (use the Image button).', '', '## 3. Physical and logical components', '- Server:', '- Operating system:', '- Address:', '- Dependencies (ports, APIs):', '', '## 4. Service health', 'How to validate that the service is 100% up.')),
    runbook: P(
      md('**Criticidade e área afetada:** (ex.: Alta / ERP)', '', '## 1. Sintomas comuns', 'Ex.: erro de tempo esgotado na tela de pedidos.', '', '## 2. Causa raiz histórica', 'Explicação breve da causa.', '', '## 3. Resolução passo a passo', 'Instruções diretas (comandos, caminhos de tela).', '', '## 4. Plano de contingência', 'Se o passo a passo não funcionar, quem acionar.'),
      md('**Severity and affected area:** (e.g. High / ERP)', '', '## 1. Common symptoms', 'E.g. timeout error on the orders screen.', '', '## 2. Historical root cause', 'Brief explanation of the cause.', '', '## 3. Step-by-step fix', 'Direct instructions (commands, screen paths).', '', '## 4. Contingency plan', 'If the step by step does not work, who to call.')),
  };

  /* ---------- pessoas e perfis (fictícios) ---------- */
  const DEPTOS = { 1: P('TI', 'IT'), 2: P('Suporte', 'Support'), 3: P('Comercial', 'Sales'), 4: P('RH', 'HR') };
  const USUARIOS = [
    { id: 1, nome: P('Visitante (demonstração)', 'Visitor (demo)'), depto: 1 },
    { id: 2, nome: 'Rafael Nunes', depto: 2 },
    { id: 3, nome: 'Paulo Teixeira', depto: 3 },
    { id: 4, nome: 'Helena Prado', depto: 1 },
    { id: 5, nome: 'Bruno Lima', depto: 1 },
    { id: 6, nome: 'Carla Mendes', depto: 1 },
    { id: 7, nome: 'Diego Rocha', depto: 1 },
    { id: 8, nome: 'Elisa Prado', depto: 4 },
    { id: 9, nome: 'Ana Souza', depto: 2 },
  ];
  const usuario = id => USUARIOS.find(u => u.id === id) || null;
  /* acesso: 'dono' = do departamento dono do projeto · 'vinculo' = vinculado direto ao projeto · 'super' = super_admin */
  const PERFIS = [
    { id: 'gestor', usuario: 1, acesso: 'dono', gere: true, rotulo: P('Gestor da base', 'Base manager'), papel: P('Gere a base', 'Manages the base'), tom: 'ok' },
    { id: 'contribuidor', usuario: 2, acesso: 'vinculo', gere: false, rotulo: P('Contribuidor', 'Contributor'), papel: P('Lê publicadas e escreve rascunhos', 'Reads published pages and writes drafts'), tom: 'info' },
    { id: 'super', usuario: 4, acesso: 'super', gere: true, rotulo: P('Super administrador', 'Super administrator'), papel: P('Acesso total', 'Full access'), tom: 'ok' },
    { id: 'semacesso', usuario: 3, acesso: null, gere: false, rotulo: P('Sem acesso ao projeto', 'No access to the project'), papel: P('Bloqueado (403)', 'Blocked (403)'), tom: 'erro' },
    { id: 'semlogin', usuario: null, acesso: null, gere: false, rotulo: P('Sessão expirada', 'Expired session'), papel: P('Sem login (401)', 'Not signed in (401)'), tom: 'erro' },
  ];

  /* ---------- regras do upload (extensão e tamanho); limites inventados para a demonstração ---------- */
  const EXT = {
    image: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    video: ['.mp4', '.webm', '.mov', '.m4v'],
    doc: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.md', '.csv', '.zip'],
  };
  const TETO_MB = 35;
  const CORTE_MB = 45;
  const LIM = { titulo: 120, tipo: 30, tags: 300, nome: 90, descricao: 600, cor: 12, icone: 30 };
  const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.zip': 'application/zip', '.txt': 'text/plain', '.csv': 'text/csv', '.md': 'text/markdown', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation' };
  const extDe = nome => { const m = String(nome).match(/\.[^./\\]*$/); return m ? m[0].toLowerCase() : ''; };
  const tipoDeExt = ext => (EXT.image.includes(ext) ? 'image' : EXT.video.includes(ext) ? 'video' : EXT.doc.includes(ext) ? 'doc' : null);
  /* Aplica as regras na mesma ordem do servidor e diz em que etapa o arquivo parou. */
  function avaliarUpload(a) {
    const ext = extDe(a.nome);
    const r = { ext, tipo: tipoDeExt(ext), etapa: null, erro: null, nome: a.nome };
    if (!a.bytes) return { ...r, etapa: 'vazio', erro: P('Arquivo inválido', 'Invalid file') };
    if (a.bytes > TETO_MB * MB) return { ...r, etapa: 'teto', erro: P('Arquivo deve ter no máximo ' + TETO_MB + 'MB', 'File must be ' + TETO_MB + 'MB at most') };
    if (!r.tipo) return { ...r, etapa: 'formato', erro: P('Formato não permitido (imagens, vídeos ou documentos).', 'Format not allowed (images, videos or documents).') };
    return r;
  }
  const AMOSTRAS = {
    image: [
      { nome: P('diagrama-portal.png', 'portal-diagram.png'), bytes: 188416, diagrama: true, nota: P('Imagem PNG', 'PNG image') },
      { nome: P('foto-rack.jpg', 'rack-photo.jpg'), bytes: 2411724, nota: P('Imagem JPEG', 'JPEG image') },
      { nome: P('logo-vetorial.svg', 'vector-logo.svg'), bytes: 12288, nota: P('SVG pode carregar script embutido', 'SVG can carry an embedded script') },
    ],
    video: [
      { nome: P('treinamento-chamados.mp4', 'ticket-training.mp4'), bytes: 18874368, nota: P('Vídeo MP4', 'MP4 video') },
      { nome: P('tela-gravada.webm', 'screen-recording.webm'), bytes: 7340032, nota: P('Vídeo WebM', 'WebM video') },
      { nome: P('reuniao-completa.mp4', 'full-meeting.mp4'), bytes: 46137344, nota: P('Acima do teto do envio', 'Above the upload ceiling') },
    ],
    doc: [
      { nome: P('checklist-notebook.pdf', 'laptop-checklist.pdf'), bytes: 317440, nota: P('Documento PDF', 'PDF document') },
      { nome: P('inventario-equipamentos.xlsx', 'equipment-inventory.xlsx'), bytes: 58368, nota: P('Planilha', 'Spreadsheet') },
      { nome: P('instalador.exe', 'installer.exe'), bytes: 4194304, nota: P('Executável', 'Executable') },
      { nome: P('vazio.txt', 'empty.txt'), bytes: 0, nota: P('Arquivo com 0 bytes', 'File with 0 bytes') },
    ],
  };

  const slugify = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'pagina';
  /* Endereço do anexo no Markdown: o do sistema real (pasta do projeto e nome aleatório). No site público (api.publico) o editor
     mostra só um nome neutro, sem caminho do servidor. */
  const endAnexo = (pub, guid, n, ext) => (pub ? 'anexo-' + n + ext : '/anexos/' + PROJ + '/' + guid + ext);

  /* ---------- dados no escopo do arquivo: sobrevivem à troca de idioma e de visual ---------- */
  let db = null;

  function semear(api) {
    const categorias = [
      { id: 1, nome: P('Operações e infraestrutura', 'Operations and infrastructure'), descricao: P('Servidores, rede, acessos, monitoramento e automação', 'Servers, network, access, monitoring and automation'), cor: PALETA.azul, icone: 'Server', ordem: 1, ativo: true },
      { id: 2, nome: P('Aplicações, dados e desenvolvimento', 'Applications, data and development'), descricao: P('ERP, banco de dados, desenvolvimento e indicadores', 'ERP, database, development and reporting'), cor: PALETA.violeta, icone: 'Database', ordem: 2, ativo: true },
      { id: 3, nome: P('Segurança, continuidade e governança', 'Security, continuity and governance'), descricao: P('Acessos, backup, recuperação e proteção de dados', 'Access, backup, recovery and data protection'), cor: PALETA.ambar, icone: 'ShieldCheck', ordem: 3, ativo: true },
      { id: 4, nome: P('Serviços e fornecedores', 'Services and suppliers'), descricao: P('Chamados, erros conhecidos, contratos e mudanças', 'Tickets, known errors, contracts and changes'), cor: PALETA.verde, icone: 'Headphones', ordem: 4, ativo: true },
      { id: 5, nome: P('Cultura, pessoas e estratégia', 'Culture, people and strategy'), descricao: P('Integração de novos colegas, pós-incidente, carreira e planejamento', 'Onboarding, post-incident reviews, careers and planning'), cor: PALETA.rosa, icone: 'Users', ordem: 5, ativo: true },
    ];
    const ax = (n, ext) => endAnexo(api.publico, '3f2a91c0-7b1d-4e55-9a10-' + String(n).padStart(12, '0'), n, ext);
    const anexos = {
      [ax(1, '.png')]: { nome: P('diagrama-portal.png', 'portal-diagram.png'), tipo: 'image', bytes: 188416, diagrama: true },
      [ax(2, '.mp4')]: { nome: P('treinamento-chamados.mp4', 'ticket-training.mp4'), tipo: 'video', bytes: 18874368 },
      [ax(3, '.pdf')]: { nome: P('checklist-notebook.pdf', 'laptop-checklist.pdf'), tipo: 'doc', bytes: 317440 },
      [ax(4, '.xlsx')]: { nome: P('inventario-equipamentos.xlsx', 'equipment-inventory.xlsx'), tipo: 'doc', bytes: 58368 },
    };
    const [AX_IMG, AX_VID, AX_PDF, AX_XLS] = Object.keys(anexos);

    const paginas = [];
    /* pg(categoria, tipo, status, fixada, autor, criada há N dias, atualizada há N dias (ou null), tags, título, conteúdo) */
    const pg = (cat, tipo, status, pinned, autor, dCriado, dAtual, tags, titulo, conteudo) => paginas.push({
      id: paginas.length + 1, categoriaId: cat, tipo, status, pinned, donoId: autor, criadoPorId: autor,
      criadoEm: api.data(-dCriado, '09:20'), atualizadoEm: dAtual == null ? null : api.data(-dAtual, '15:40'), atualizadoPorId: dAtual == null ? null : (status === 'publicado' ? 5 : autor),
      tags, titulo, conteudo, slug: slugify(titulo.pt), ativo: true,
    });

    /* ----- 1. Operações e infraestrutura ----- */
    pg(1, 'arquitetura', 'publicado', true, 5, 120, 2, P('portal, api, banco de dados', 'portal, api, database'),
      P('Arquitetura do portal interno', 'Internal portal architecture'),
      P(md('## 1. Visão geral', 'O portal reúne os sistemas internos com login único e permissão por setor. Esta página descreve como as partes se conectam e como saber se está tudo no ar.', '',
        '## 2. Desenho técnico', '![Diagrama do portal](' + AX_IMG + ')', '',
        '## 3. Componentes', '| Componente | Papel | Depende de |', '| --- | --- | --- |', '| Interface web | Telas dos módulos | API |', '| API | Regras de negócio e permissões | Banco de dados |', '| Banco de dados | Cadastros e histórico | Armazenamento |', '| Serviço de tarefas | Rotinas agendadas | API e banco |', '| Proxy reverso | Entrada única por HTTPS | Certificado |', '',
        '## 4. Saúde do serviço', '1. Abrir o endereço de saúde da API e conferir a resposta `200 OK`.', '2. Entrar no portal com um usuário de teste e abrir um módulo.', '3. Conferir no painel de tarefas se a última rotina terminou sem erro.', '',
        '> Se a API responde e o banco não, siga o runbook **Serviço de integração parado**.'),
      md('## 1. Overview', 'The portal brings the internal systems together with single sign-on and per-department permissions. This page describes how the parts connect and how to tell that everything is up.', '',
        '## 2. Technical design', '![Portal diagram](' + AX_IMG + ')', '',
        '## 3. Components', '| Component | Role | Depends on |', '| --- | --- | --- |', '| Web interface | Module screens | API |', '| API | Business rules and permissions | Database |', '| Database | Records and history | Storage |', '| Task service | Scheduled routines | API and database |', '| Reverse proxy | Single HTTPS entry point | Certificate |', '',
        '## 4. Service health', '1. Open the API health address and check for a `200 OK` response.', '2. Sign in to the portal with a test user and open a module.', '3. Check on the task board that the last routine finished without errors.', '',
        '> If the API answers but the database does not, follow the runbook **Integration service stopped**.')));

    pg(1, 'arquitetura', 'publicado', false, 7, 95, 18, P('rede, segmentos, wifi', 'network, segments, wifi'),
      P('Topologia da rede da matriz', 'Head office network topology'),
      P(md('## 1. Visão geral', 'A rede da matriz é dividida em segmentos para que um problema em uma área não derrube as outras e para que visitantes nunca alcancem os servidores.', '',
        '## 2. Segmentos', '| Segmento | Quem usa | Pode falar com |', '| --- | --- | --- |', '| Servidores | Aplicações e banco | Administrativo, por portas liberadas |', '| Administrativo | Computadores dos setores | Servidores e internet |', '| Fábrica | Coletores e painéis | Servidores, só a API |', '| Visitantes | Wi-Fi de visitantes | Somente internet |', '| Gerência de equipamentos | Switches e impressoras | Apenas a equipe de TI |', '',
        '## 3. Regras', '- Equipamento novo entra primeiro no inventário, depois na rede.', '- Nenhum servidor recebe conexão direta da rede de visitantes.', '- Mudança de regra entre segmentos passa pela janela de manutenção.', '',
        '## 4. Saúde', 'O painel de monitoramento mostra a disponibilidade de cada segmento. Queda de mais de 5 minutos abre chamado automaticamente.'),
      md('## 1. Overview', 'The head office network is split into segments so that a problem in one area does not bring the others down and so that guests never reach the servers.', '',
        '## 2. Segments', '| Segment | Who uses it | Can talk to |', '| --- | --- | --- |', '| Servers | Applications and database | Office, through allowed ports |', '| Office | Department computers | Servers and the internet |', '| Shop floor | Handhelds and dashboards | Servers, API only |', '| Guests | Guest Wi-Fi | Internet only |', '| Device management | Switches and printers | IT team only |', '',
        '## 3. Rules', '- New equipment goes into the inventory first, then onto the network.', '- No server accepts a direct connection from the guest network.', '- Any rule change between segments goes through the maintenance window.', '',
        '## 4. Health', 'The monitoring dashboard shows the availability of each segment. An outage longer than 5 minutes opens a ticket automatically.')));

    pg(1, 'runbook', 'publicado', false, 7, 80, 9, P('disco, arquivos, espaço', 'disk, files, space'),
      P('Servidor de arquivos sem espaço', 'File server out of space'),
      P(md('**Criticidade e área afetada:** Alta / todos os setores que salvam arquivos na rede.', '',
        '## 1. Sintomas comuns', '- Mensagem de disco cheio ao salvar um arquivo.', '- Alerta do monitoramento com menos de 10% de espaço livre.', '',
        '## 2. Causa raiz histórica', 'Quase sempre são cópias duplicadas de pastas grandes ou vídeos salvos fora da pasta de mídia.', '',
        '## 3. Resolução passo a passo', '1. Abrir o relatório de uso por pasta e ordenar pelo tamanho.', '2. Conferir as três maiores pastas com o responsável do setor.', '3. Mover o que for arquivo morto para o armazenamento de longo prazo.', '4. Esvaziar a lixeira do compartilhamento.', '5. Confirmar no monitoramento que o espaço livre voltou a ficar acima de 20%.', '',
        '```', 'relatorio-uso --pasta /compartilhado --maiores 20', '```', '',
        '## 4. Plano de contingência', 'Se não for possível liberar espaço em 1 hora, ampliar o volume temporariamente e abrir uma mudança para a ampliação definitiva.'),
      md('**Severity and affected area:** High / every department that saves files on the network.', '',
        '## 1. Common symptoms', '- Disk full message when saving a file.', '- Monitoring alert with less than 10% free space.', '',
        '## 2. Historical root cause', 'It is almost always duplicated copies of large folders or videos saved outside the media folder.', '',
        '## 3. Step-by-step fix', '1. Open the usage report by folder and sort it by size.', '2. Review the three largest folders with the department lead.', '3. Move whatever is dead archive to long-term storage.', '4. Empty the share recycle bin.', '5. Confirm on monitoring that free space is back above 20%.', '',
        '```', 'usage-report --folder /shared --largest 20', '```', '',
        '## 4. Contingency plan', 'If space cannot be freed within 1 hour, extend the volume temporarily and open a change request for the permanent extension.')));

    pg(1, 'livre', 'publicado', false, 5, 70, 12, P('manutenção, janela, atualização', 'maintenance, window, updates'),
      P('Janela de manutenção mensal', 'Monthly maintenance window'),
      P(md('## Quando acontece', 'No segundo sábado de cada mês, das 14h às 18h. O aviso sai para todos os setores com 5 dias de antecedência.', '',
        '## Antes da janela', '- [x] Lista de mudanças aprovada pelo gestor de TI', '- [x] Backup completo conferido na véspera', '- [ ] Plano de retorno escrito para cada mudança', '- [ ] Aviso enviado aos setores', '',
        '## Durante', '1. Aplicar as atualizações primeiro no servidor de homologação.', '2. Aplicar em produção, um servidor por vez.', '3. Rodar a conferência de saúde depois de cada servidor.', '',
        '## Depois', 'Registrar o que foi feito, o que ficou pendente e qualquer surpresa. Surpresa vira runbook.', '',
        '---', '*Mudança urgente fora da janela exige aprovação do gestor e registro no mesmo dia.*'),
      md('## When it happens', 'On the second Saturday of each month, from 2 pm to 6 pm. The notice goes out to every department 5 days ahead.', '',
        '## Before the window', '- [x] Change list approved by the IT manager', '- [x] Full backup checked the day before', '- [ ] Rollback plan written for each change', '- [ ] Notice sent to the departments', '',
        '## During', '1. Apply the updates on the staging server first.', '2. Apply to production, one server at a time.', '3. Run the health check after each server.', '',
        '## After', 'Log what was done, what is still pending and any surprise. A surprise becomes a runbook.', '',
        '---', '*An urgent change outside the window needs the manager approval and a record on the same day.*')));

    pg(1, 'runbook', 'publicado', false, 6, 64, null, P('energia, nobreak, sala de servidores', 'power, ups, server room'),
      P('Queda de energia na sala de servidores', 'Power outage in the server room'),
      P(md('**Criticidade e área afetada:** Alta / todos os sistemas.', '',
        '## 1. Sintomas comuns', '- Alarme do nobreak e aviso de funcionamento em bateria.', '- Monitoramento mostra a sala sem alimentação externa.', '',
        '## 2. Causa raiz histórica', 'Queda da concessionária ou disjuntor desarmado depois de manutenção elétrica no prédio.', '',
        '## 3. Resolução passo a passo', '1. Conferir no painel do nobreak a autonomia restante.', '2. Com menos de 15 minutos, iniciar o desligamento ordenado: aplicações, depois banco, depois virtualização.', '3. Avisar os setores pelo canal de emergência.', '4. Quando a energia voltar, ligar na ordem inversa e rodar a conferência de saúde.', '',
        '## 4. Plano de contingência', 'Se a energia não voltar em 2 horas, acionar o gestor de TI e a manutenção predial para avaliar o gerador.'),
      md('**Severity and affected area:** High / all systems.', '',
        '## 1. Common symptoms', '- UPS alarm and a notice that it is running on battery.', '- Monitoring shows the room with no external power.', '',
        '## 2. Historical root cause', 'Utility outage or a tripped breaker after electrical maintenance in the building.', '',
        '## 3. Step-by-step fix', '1. Check the remaining runtime on the UPS panel.', '2. With less than 15 minutes left, start the orderly shutdown: applications, then database, then virtualization.', '3. Notify the departments through the emergency channel.', '4. When power returns, start everything in reverse order and run the health check.', '',
        '## 4. Contingency plan', 'If power is not back within 2 hours, call the IT manager and building maintenance to assess the generator.')));

    /* ----- 2. Aplicações, dados e desenvolvimento ----- */
    pg(2, 'arquitetura', 'publicado', false, 7, 110, 3, P('erp, api, integração', 'erp, api, integration'),
      P('Integração do portal com o ERP', 'Portal and ERP integration'),
      P(md('## 1. Visão geral', 'O portal lê dados do ERP para montar painéis e filas de trabalho. A gravação no ERP acontece só por rotinas aprovadas, com registro de quem fez e quando.', '',
        '## 2. Regras de leitura', '- Consultas medidas antes de entrar em produção.', '- Nada de consulta pesada em horário comercial.', '- Leitura por visões próprias do banco, nunca direto nas tabelas do ERP.', '',
        '## 3. Regras de gravação', '1. Toda rotina de gravação começa desligada.', '2. A primeira execução real é acompanhada por uma pessoa.', '3. Cada gravação deixa rastro: origem, usuário e horário.', '',
        '## 4. Saúde', 'Conferir no painel de tarefas se a última sincronização terminou e quantos registros vieram.'),
      md('## 1. Overview', 'The portal reads ERP data to build dashboards and work queues. Writing to the ERP only happens through approved routines, recording who did it and when.', '',
        '## 2. Read rules', '- Queries are measured before going to production.', '- No heavy queries during business hours.', '- Reads go through dedicated database views, never straight from the ERP tables.', '',
        '## 3. Write rules', '1. Every write routine starts switched off.', '2. The first real run is watched by a person.', '3. Every write leaves a trail: source, user and time.', '',
        '## 4. Health', 'Check on the task board that the last sync finished and how many records came in.')));

    pg(2, 'runbook', 'publicado', true, 7, 60, 5, P('integração, erp, pedidos', 'integration, erp, orders'),
      P('Serviço de integração parado', 'Integration service stopped'),
      P(md('**Criticidade e área afetada:** Alta / pedidos e notas no ERP.', '',
        '## 1. Sintomas comuns', '- Pedidos novos não aparecem no portal há mais de 15 minutos.', '- O painel de tarefas mostra a rotina de integração em atraso.', '',
        '## 2. Causa raiz histórica', 'Reinício do servidor fora da janela de manutenção: o serviço não volta sozinho.', '',
        '## 3. Resolução passo a passo', '1. Conferir no painel de tarefas a hora da última execução.', '2. Reiniciar o serviço de integração no servidor de aplicação.', '3. Aguardar um ciclo completo e conferir um pedido de teste.', '4. Registrar o ocorrido no chamado, com horário de início e fim.', '',
        '## 4. Plano de contingência', 'Se o serviço não voltar em 30 minutos, acionar o plantão de TI e avisar o Comercial de que os pedidos entram com atraso.'),
      md('**Severity and affected area:** High / orders and invoices in the ERP.', '',
        '## 1. Common symptoms', '- New orders have not shown up in the portal for more than 15 minutes.', '- The task board shows the integration routine running late.', '',
        '## 2. Historical root cause', 'A server restart outside the maintenance window: the service does not come back on its own.', '',
        '## 3. Step-by-step fix', '1. Check the time of the last run on the task board.', '2. Restart the integration service on the application server.', '3. Wait for a full cycle and check a test order.', '4. Log the incident in the ticket, with start and end times.', '',
        '## 4. Contingency plan', 'If the service is not back within 30 minutes, call the IT on-call person and let Sales know that orders will come in late.')));

    pg(2, 'livre', 'rascunho', false, 6, 6, 1, P('módulo, padrão, desenvolvimento', 'module, standard, development'),
      P('Padrão para criar um módulo novo', 'Standard for building a new module'),
      P(md('## Antes de escrever código', '1. Levantar o problema com quem usa: o que dói hoje e como se mede o sucesso.', '2. Desenhar o fluxo e aprovar com a área.', '3. Fazer o rascunho de todas as telas e validar antes da API.', '',
        '## Durante', '- Permissão por setor desde o primeiro dia.', '- Todo envio de e-mail nasce desligado.', '- Listas e tabelas com limite de altura e rolagem.', '',
        '## Entrega', 'Revisão por um segundo olhar, publicação e acompanhamento do primeiro uso real.', '',
        '> Rascunho: falta descrever o padrão de testes.'),
      md('## Before writing code', '1. Map the problem with the people who use it: what hurts today and how success is measured.', '2. Draw the flow and get it approved by the department.', '3. Sketch every screen and validate it before the API.', '',
        '## While building', '- Per-department permissions from day one.', '- Every email sender starts switched off.', '- Lists and tables with a height limit and scrolling.', '',
        '## Delivery', 'Review by a second pair of eyes, release and follow-up on the first real use.', '',
        '> Draft: the testing standard is still to be described.')));

    pg(2, 'livre', 'publicado', false, 6, 88, 30, P('dados, cadastro, clientes', 'data, records, customers'),
      P('Dicionário de dados: cadastro de clientes', 'Data dictionary: customer records'),
      P(md('## Para que serve', 'Explica o que cada campo do cadastro de clientes significa, para que relatórios e integrações usem o mesmo entendimento.', '',
        '## Campos principais', '| Campo | Significado | Quem mantém |', '| --- | --- | --- |', '| Código | Identificador interno, nunca reaproveitado | ERP |', '| Razão social | Nome legal do cliente | Cadastro |', '| Situação | Ativo, bloqueado ou inativo | Financeiro |', '| Vendedor | Responsável pela carteira | Comercial |', '| Última compra | Data do último pedido faturado | Calculado |', '',
        '## Cuidados', '- Cliente inativo não some dos relatórios históricos.', '- O campo **Última compra** é calculado e não deve ser editado à mão.', '- Dúvida sobre um campo novo: abrir chamado antes de usar em relatório.'),
      md('## What it is for', 'Explains what each field in the customer record means, so that reports and integrations share the same understanding.', '',
        '## Main fields', '| Field | Meaning | Maintained by |', '| --- | --- | --- |', '| Code | Internal identifier, never reused | ERP |', '| Legal name | The customer legal name | Records team |', '| Status | Active, blocked or inactive | Finance |', '| Sales rep | Owner of the account | Sales |', '| Last purchase | Date of the last invoiced order | Calculated |', '',
        '## Watch out', '- An inactive customer does not vanish from historical reports.', '- The **Last purchase** field is calculated and must not be edited by hand.', '- Unsure about a new field: open a ticket before using it in a report.')));

    pg(2, 'runbook', 'publicado', false, 5, 50, 7, P('banco de dados, lentidão, consulta', 'database, slowness, query'),
      P('Consulta lenta travando o banco', 'Slow query blocking the database'),
      P(md('**Criticidade e área afetada:** Alta / ERP e portal.', '',
        '## 1. Sintomas comuns', '- Telas do ERP demoram mais de 30 segundos para abrir.', '- O monitoramento mostra sessões em espera crescendo.', '',
        '## 2. Causa raiz histórica', 'Relatório pesado rodado em horário comercial ou transação esquecida aberta em uma estação.', '',
        '## 3. Resolução passo a passo', '1. Listar as sessões que estão bloqueando outras.', '2. Identificar o usuário e o programa da sessão bloqueadora.', '3. Ligar para a pessoa antes de encerrar: ela pode só precisar confirmar uma tela.', '4. Se não houver resposta em 5 minutos, encerrar a sessão.', '',
        '```', 'sessoes-bloqueadoras --ordenar espera --maiores 10', '```', '',
        '## 4. Plano de contingência', 'Se o bloqueio voltar em seguida, suspender a rotina que o provoca e acionar quem mantém o relatório.'),
      md('**Severity and affected area:** High / ERP and portal.', '',
        '## 1. Common symptoms', '- ERP screens take more than 30 seconds to open.', '- Monitoring shows waiting sessions piling up.', '',
        '## 2. Historical root cause', 'A heavy report run during business hours or a forgotten transaction left open on a workstation.', '',
        '## 3. Step-by-step fix', '1. List the sessions that are blocking others.', '2. Identify the user and the program of the blocking session.', '3. Call the person before ending it: they may only need to confirm a screen.', '4. If there is no answer within 5 minutes, end the session.', '',
        '```', 'blocking-sessions --sort waiting --top 10', '```', '',
        '## 4. Contingency plan', 'If the block comes straight back, suspend the routine that causes it and call whoever maintains the report.')));

    /* ----- 3. Segurança, continuidade e governança ----- */
    pg(3, 'livre', 'publicado', true, 6, 130, 20, P('senha, acesso, política', 'password, access, policy'),
      P('Política de senhas e acesso', 'Password and access policy'),
      P(md('## Regras', '- Senha com no mínimo 12 caracteres, trocada quando houver suspeita de vazamento.', '- Verificação em duas etapas obrigatória para acesso remoto e para administradores.', '- Cada pessoa tem o próprio usuário: conta compartilhada não é permitida.', '',
        '## Desligamentos', 'O acesso é removido no mesmo dia em que o RH registra o desligamento. O gestor confirma a lista de sistemas que a pessoa usava.', '',
        '## Revisão', 'A lista de administradores é revisada a cada trimestre.', '',
        '> Ninguém da TI pede senha por telefone, e-mail ou mensagem. Se pedirem, é golpe.'),
      md('## Rules', '- Passwords of at least 12 characters, changed whenever a leak is suspected.', '- Two-step verification required for remote access and for administrators.', '- Everyone has their own user: shared accounts are not allowed.', '',
        '## Departures', 'Access is removed on the same day HR records the departure. The manager confirms the list of systems the person used.', '',
        '## Review', 'The administrator list is reviewed every quarter.', '',
        '> Nobody from IT asks for a password by phone, email or message. If someone does, it is a scam.')));

    pg(3, 'arquitetura', 'publicado', false, 5, 100, 14, P('backup, restauração, continuidade', 'backup, restore, continuity'),
      P('Rotina de backup e teste de restauração', 'Backup routine and restore testing'),
      P(md('## 1. Visão geral', 'Backup que nunca foi restaurado é só uma esperança. A rotina abaixo garante cópia e prova de que a cópia funciona.', '',
        '## 2. O que é copiado', '| Conjunto | Frequência | Guarda |', '| --- | --- | --- |', '| Banco do ERP | A cada hora (incremental) e diário (completo) | 35 dias |', '| Arquivos dos setores | Diário | 90 dias |', '| Servidores virtuais | Semanal | 4 semanas |', '| Configuração de rede | A cada mudança | 12 versões |', '',
        '## 3. Regra das três cópias', '- Uma cópia no próprio local, para restauração rápida.', '- Uma cópia em outro prédio.', '- Uma cópia fora da rede, que um ataque não alcança.', '',
        '## 4. Saúde', '1. O relatório diário precisa chegar com todas as tarefas em verde.', '2. Uma vez por mês, restaurar um arquivo e um banco em ambiente separado e registrar o tempo gasto.'),
      md('## 1. Overview', 'A backup that has never been restored is only a hope. The routine below guarantees a copy and proof that the copy works.', '',
        '## 2. What is copied', '| Set | Frequency | Retention |', '| --- | --- | --- |', '| ERP database | Hourly (incremental) and daily (full) | 35 days |', '| Department files | Daily | 90 days |', '| Virtual servers | Weekly | 4 weeks |', '| Network configuration | On every change | 12 versions |', '',
        '## 3. The three-copy rule', '- One copy on site, for a fast restore.', '- One copy in another building.', '- One copy off the network, out of reach of an attack.', '',
        '## 4. Health', '1. The daily report must arrive with every job in green.', '2. Once a month, restore one file and one database in a separate environment and record how long it took.')));

    pg(3, 'runbook', 'publicado', false, 6, 45, 4, P('phishing, e-mail, incidente', 'phishing, email, incident'),
      P('Suspeita de phishing por e-mail', 'Suspected email phishing'),
      P(md('**Criticidade e área afetada:** Média / a pessoa que recebeu e, se houve clique, a conta dela.', '',
        '## 1. Sintomas comuns', '- E-mail com urgência incomum pedindo senha, pagamento ou clique em link.', '- Remetente parecido com um contato conhecido, com uma letra trocada.', '',
        '## 2. Causa raiz histórica', 'Campanhas que imitam fornecedores e bancos, enviadas em massa.', '',
        '## 3. Resolução passo a passo', '1. Não clicar e não responder. Encaminhar o e-mail como anexo para a TI.', '2. Se houve clique ou digitação de senha: trocar a senha na hora e avisar a TI por telefone.', '3. A TI bloqueia o remetente e procura o mesmo e-mail em outras caixas.', '4. Registrar o caso, com horário e quantas pessoas receberam.', '',
        '## 4. Plano de contingência', 'Se houve acesso indevido confirmado, encerrar as sessões da conta, revisar regras de encaminhamento e acionar o gestor de TI.'),
      md('**Severity and affected area:** Medium / the person who received it and, if there was a click, their account.', '',
        '## 1. Common symptoms', '- An email with unusual urgency asking for a password, a payment or a click on a link.', '- A sender that looks like a known contact, with one letter changed.', '',
        '## 2. Historical root cause', 'Mass campaigns that imitate suppliers and banks.', '',
        '## 3. Step-by-step fix', '1. Do not click and do not reply. Forward the email as an attachment to IT.', '2. If there was a click or a password was typed: change the password right away and call IT.', '3. IT blocks the sender and looks for the same email in other mailboxes.', '4. Log the case, with the time and how many people received it.', '',
        '## 4. Contingency plan', 'If improper access is confirmed, end the account sessions, review forwarding rules and call the IT manager.')));

    pg(3, 'livre', 'rascunho', false, 2, 4, null, P('acessos, revisão, auditoria', 'access, review, audit'),
      P('Revisão trimestral de acessos', 'Quarterly access review'),
      P(md('## Objetivo', 'Garantir que cada pessoa tem só o acesso de que precisa hoje, e não o que acumulou com o tempo.', '',
        '## Lista de conferência', '- [ ] Exportar a lista de usuários ativos por sistema', '- [ ] Enviar a cada gestor a lista da própria equipe', '- [ ] Remover o que o gestor não confirmar em 10 dias', '- [ ] Conferir contas de serviço sem dono', '- [ ] Registrar o resultado e as exceções aprovadas', '',
        '## Pendências deste rascunho', 'Falta definir quem aprova as exceções quando o gestor está de férias.'),
      md('## Goal', 'Make sure each person only has the access they need today, not what they accumulated over time.', '',
        '## Checklist', '- [ ] Export the list of active users per system', '- [ ] Send each manager the list for their own team', '- [ ] Remove whatever the manager does not confirm within 10 days', '- [ ] Check service accounts with no owner', '- [ ] Record the result and the approved exceptions', '',
        '## Open points in this draft', 'Still to define who approves exceptions when the manager is on leave.')));

    pg(3, 'runbook', 'publicado', false, 9, 38, null, P('arquivo, restauração, backup', 'file, restore, backup'),
      P('Restaurar um arquivo apagado', 'Restoring a deleted file'),
      P(md('**Criticidade e área afetada:** Baixa / uma pessoa ou um setor.', '',
        '## 1. Sintomas comuns', 'O arquivo sumiu da pasta de rede ou foi salvo por cima de uma versão boa.', '',
        '## 2. Causa raiz histórica', 'Exclusão por engano ou substituição ao salvar com o mesmo nome.', '',
        '## 3. Resolução passo a passo', '1. Perguntar o caminho da pasta e a data aproximada em que o arquivo estava certo.', '2. Tentar primeiro as versões anteriores da própria pasta.', '3. Se não houver versão, restaurar do backup diário para uma pasta temporária.', '4. Entregar o arquivo e pedir que a pessoa confira antes de fechar o chamado.', '',
        '## 4. Plano de contingência', 'Arquivo com mais de 90 dias pode não estar no backup diário: consultar o armazenamento de longo prazo.'),
      md('**Severity and affected area:** Low / one person or one department.', '',
        '## 1. Common symptoms', 'The file vanished from the network folder or was saved over a good version.', '',
        '## 2. Historical root cause', 'Accidental deletion or overwriting when saving with the same name.', '',
        '## 3. Step-by-step fix', '1. Ask for the folder path and the approximate date when the file was right.', '2. Try the previous versions of the folder itself first.', '3. If there is no version, restore from the daily backup into a temporary folder.', '4. Hand over the file and ask the person to check it before closing the ticket.', '',
        '## 4. Contingency plan', 'A file older than 90 days may not be in the daily backup: check long-term storage.')));

    /* ----- 4. Serviços e fornecedores ----- */
    pg(4, 'runbook', 'publicado', false, 9, 75, 4, P('impressora, fila, rede', 'printer, queue, network'),
      P('Impressora de rede não imprime', 'Network printer not printing'),
      P(md('**Criticidade e área afetada:** Baixa / um setor.', '',
        '## 1. Sintomas comuns', 'Os documentos ficam parados na fila de impressão.', '',
        '## 2. Causa raiz histórica', 'Papel atolado, fila travada no computador ou troca do endereço de rede da impressora.', '',
        '## 3. Resolução passo a passo', '1. Conferir se a impressora está ligada e sem papel atolado.', '2. Imprimir a página de configuração direto no painel da impressora.', '3. Limpar a fila de impressão no computador e enviar um teste.', '4. Se o endereço de rede mudou, atualizar a impressora no cadastro.', '',
        '## 4. Plano de contingência', 'Direcionar o setor para a impressora mais próxima e abrir chamado com o fornecedor.'),
      md('**Severity and affected area:** Low / one department.', '',
        '## 1. Common symptoms', 'Documents sit in the print queue.', '',
        '## 2. Historical root cause', 'A paper jam, a stuck queue on the computer or a change in the printer network address.', '',
        '## 3. Step-by-step fix', '1. Check that the printer is on and has no paper jam.', '2. Print the configuration page straight from the printer panel.', '3. Clear the print queue on the computer and send a test page.', '4. If the network address changed, update the printer in the register.', '',
        '## 4. Contingency plan', 'Send the department to the nearest printer and open a ticket with the supplier.')));

    pg(4, 'livre', 'publicado', true, 9, 140, 25, P('chamado, atendimento, prioridade', 'ticket, service desk, priority'),
      P('Como abrir um chamado para a TI', 'How to open an IT ticket'),
      P(md('## Por que chamado e não mensagem', 'Chamado tem dono, prazo e histórico. Mensagem solta se perde e ninguém sabe o que já foi tentado.', '',
        '## Passo a passo', '1. Entrar no portal e abrir **Chamados**.', '2. Escolher a categoria mais próxima do problema.', '3. Descrever o que aconteceu, desde quando e o que aparece na tela.', '4. Anexar uma foto ou captura de tela.', '',
        '@video(' + AX_VID + ')', '',
        '## Prazos de atendimento', '| Prioridade | Exemplo | Primeiro retorno |', '| --- | --- | --- |', '| Alta | Setor inteiro parado | 30 minutos |', '| Média | Uma pessoa sem conseguir trabalhar | 2 horas |', '| Baixa | Dúvida ou melhoria | 1 dia útil |', '',
        '> Sistema fora do ar para todos? Ligue para o ramal do plantão em vez de abrir chamado.'),
      md('## Why a ticket and not a message', 'A ticket has an owner, a deadline and a history. A loose message gets lost and nobody knows what has already been tried.', '',
        '## Step by step', '1. Sign in to the portal and open **Tickets**.', '2. Pick the category closest to the problem.', '3. Describe what happened, since when and what shows on the screen.', '4. Attach a photo or a screenshot.', '',
        '@video(' + AX_VID + ')', '',
        '## Response times', '| Priority | Example | First response |', '| --- | --- | --- |', '| High | A whole department stopped | 30 minutes |', '| Medium | One person unable to work | 2 hours |', '| Low | Question or improvement | 1 business day |', '',
        '> System down for everyone? Call the on-call extension instead of opening a ticket.')));

    pg(4, 'runbook', 'publicado', false, 2, 33, 6, P('vpn, acesso remoto', 'vpn, remote access'),
      P('VPN não conecta', 'VPN will not connect'),
      P(md('**Criticidade e área afetada:** Média / quem trabalha de fora.', '',
        '## 1. Sintomas comuns', '- A conexão fica em "conectando" e desiste.', '- Mensagem de usuário ou senha inválidos, mesmo com a senha certa.', '',
        '## 2. Causa raiz histórica', 'Senha expirada, relógio do computador errado ou verificação em duas etapas ainda não configurada.', '',
        '## 3. Resolução passo a passo', '1. Conferir se a pessoa consegue entrar no portal com a mesma senha.', '2. Acertar data e hora do computador.', '3. Refazer o cadastro da verificação em duas etapas.', '4. Testar em outra rede, por exemplo o roteador do celular.', '',
        '## 4. Plano de contingência', 'Se nada resolver, liberar acesso temporário ao portal pela web e agendar a troca do equipamento.'),
      md('**Severity and affected area:** Medium / whoever works remotely.', '',
        '## 1. Common symptoms', '- The connection stays on "connecting" and gives up.', '- Invalid user or password message, even with the right password.', '',
        '## 2. Historical root cause', 'Expired password, wrong computer clock or two-step verification not set up yet.', '',
        '## 3. Step-by-step fix', '1. Check whether the person can sign in to the portal with the same password.', '2. Fix the computer date and time.', '3. Redo the two-step verification enrollment.', '4. Test on another network, for example a phone hotspot.', '',
        '## 4. Contingency plan', 'If nothing works, grant temporary web access to the portal and schedule an equipment swap.')));

    pg(4, 'livre', 'publicado', false, 9, 58, 11, P('notebook, preparação, inventário', 'laptop, setup, inventory'),
      P('Preparar um notebook novo', 'Preparing a new laptop'),
      P(md('## Antes de entregar', '- [x] Registrar o equipamento no inventário', '- [x] Instalar a imagem padrão e as atualizações', '- [ ] Ativar a criptografia do disco', '- [ ] Instalar o antivírus e o agente de inventário', '- [ ] Entrar com o usuário da pessoa e testar e-mail e portal', '',
        '## Documentos', '[checklist-notebook.pdf](' + AX_PDF + ')', '',
        '[inventario-equipamentos.xlsx](' + AX_XLS + ')', '',
        '## Na entrega', '1. Conferir o termo de responsabilidade assinado.', '2. Mostrar como abrir um chamado.', '3. Anotar no inventário a data e quem recebeu.'),
      md('## Before handing it over', '- [x] Register the equipment in the inventory', '- [x] Install the standard image and the updates', '- [ ] Turn on disk encryption', '- [ ] Install the antivirus and the inventory agent', '- [ ] Sign in with the person user and test email and the portal', '',
        '## Documents', '[laptop-checklist.pdf](' + AX_PDF + ')', '',
        '[equipment-inventory.xlsx](' + AX_XLS + ')', '',
        '## At handover', '1. Check the signed responsibility form.', '2. Show how to open a ticket.', '3. Note in the inventory the date and who received it.')));

    pg(4, 'livre', 'publicado', false, 2, 28, null, P('e-mail, dúvidas, caixa cheia', 'email, questions, mailbox full'),
      P('Perguntas frequentes sobre e-mail', 'Email frequently asked questions'),
      P(md('## Minha caixa está cheia. O que faço?', 'Esvazie a lixeira e a pasta de enviados com anexos grandes. Arquivos que precisam ficar guardados vão para a pasta do setor, não para o e-mail.', '',
        '## Posso encaminhar e-mail de trabalho para o pessoal?', 'Não. O encaminhamento automático para fora é bloqueado.', '',
        '## Como peço um grupo de e-mail?', 'Abra um chamado com o nome do grupo, quem participa e quem aprova a entrada de novos membros.', '',
        '## Recebi um e-mail estranho', 'Siga o runbook **Suspeita de phishing por e-mail**. Na dúvida, não clique.', '',
        '## Qual o tamanho máximo de anexo?', 'Até `20 MB`. Acima disso, salve na pasta do setor e envie o caminho.'),
      md('## My mailbox is full. What do I do?', 'Empty the trash and the sent folder with large attachments. Files that must be kept go to the department folder, not to email.', '',
        '## Can I forward work email to my personal address?', 'No. Automatic forwarding to outside addresses is blocked.', '',
        '## How do I request a mailing group?', 'Open a ticket with the group name, who is in it and who approves new members.', '',
        '## I received a strange email', 'Follow the runbook **Suspected email phishing**. When in doubt, do not click.', '',
        '## What is the attachment size limit?', 'Up to `20 MB`. Above that, save it to the department folder and send the path.')));

    pg(4, 'livre', 'publicado', false, 5, 52, 16, P('fornecedor, contrato, renovação', 'supplier, contract, renewal'),
      P('Contratos de fornecedores de TI', 'IT supplier contracts'),
      P(md('## Para que serve', 'Evitar renovação automática sem análise e saber a quem ligar quando um serviço contratado falha.', '',
        '## Contratos vigentes', '| Serviço | Fornecedor | Renovação | Responsável |', '| --- | --- | --- | --- |', '| Link de internet principal | Fornecedor A | Anual | Infraestrutura |', '| Link de internet reserva | Fornecedor B | Anual | Infraestrutura |', '| Impressoras | Fornecedor C | A cada 3 anos | Suporte |', '| Licenças de escritório | Fornecedor D | Anual | Gestão de TI |', '',
        '## Regras', '- Aviso de vencimento 90 dias antes, para dar tempo de cotar.', '- Todo contrato tem um responsável interno com nome.', '- Falha do fornecedor é registrada no chamado, com horário, para cobrar o acordo de serviço.'),
      md('## What it is for', 'Avoid automatic renewals with no review and know who to call when a contracted service fails.', '',
        '## Current contracts', '| Service | Supplier | Renewal | Owner |', '| --- | --- | --- | --- |', '| Main internet link | Supplier A | Yearly | Infrastructure |', '| Backup internet link | Supplier B | Yearly | Infrastructure |', '| Printers | Supplier C | Every 3 years | Support |', '| Office licenses | Supplier D | Yearly | IT management |', '',
        '## Rules', '- Expiry notice 90 days ahead, to leave time for quotes.', '- Every contract has a named internal owner.', '- A supplier failure is logged in the ticket, with the time, to enforce the service agreement.')));

    /* ----- 5. Cultura, pessoas e estratégia ----- */
    pg(5, 'livre', 'publicado', false, 8, 90, 10, P('primeiro dia, acesso, integração', 'first day, access, onboarding'),
      P('Acessos do primeiro dia de quem chega', 'First-day access for new hires'),
      P(md('## Até a véspera', '- [x] Usuário criado com base no cargo informado pelo RH', '- [x] Equipamento preparado e testado', '- [ ] Grupos de e-mail e pastas do setor liberados', '',
        '## No primeiro dia', '1. Entregar o equipamento e conferir o acesso ao portal.', '2. Ativar a verificação em duas etapas junto com a pessoa.', '3. Apresentar esta base de conhecimento e como abrir um chamado.', '',
        '## Na primeira semana', 'O gestor confirma se falta algum sistema. Pedido de acesso novo vem sempre do gestor, nunca da própria pessoa.'),
      md('## By the day before', '- [x] User created from the job title HR provided', '- [x] Equipment prepared and tested', '- [ ] Department mailing groups and folders granted', '',
        '## On the first day', '1. Hand over the equipment and check portal access.', '2. Set up two-step verification together with the person.', '3. Show this knowledge base and how to open a ticket.', '',
        '## In the first week', 'The manager confirms whether any system is missing. A new access request always comes from the manager, never from the person.')));

    pg(5, 'livre', 'publicado', false, 8, 85, 22, P('desligamento, acesso, equipamento', 'offboarding, access, equipment'),
      P('Desligamento: o que a TI faz', 'Offboarding: what IT does'),
      P(md('## No dia do desligamento', '- [ ] Bloquear o usuário no login único', '- [ ] Encerrar sessões abertas e acesso remoto', '- [ ] Redirecionar o e-mail para o gestor por 30 dias', '- [ ] Recolher notebook, crachá e celular corporativo', '',
        '## Nos 30 dias seguintes', '1. Transferir os arquivos da pessoa para a pasta do setor.', '2. Remover a pessoa dos grupos de e-mail.', '3. Liberar as licenças para reaproveitamento.', '',
        '## Depois de 30 dias', 'A conta é excluída. O histórico do que a pessoa fez nos sistemas continua guardado, ligado ao nome dela.'),
      md('## On the leaving day', '- [ ] Block the user in single sign-on', '- [ ] End open sessions and remote access', '- [ ] Redirect email to the manager for 30 days', '- [ ] Collect the laptop, badge and company phone', '',
        '## Over the next 30 days', '1. Move the person files to the department folder.', '2. Remove the person from mailing groups.', '3. Release the licenses for reuse.', '',
        '## After 30 days', 'The account is deleted. The history of what the person did in the systems stays on record, linked to their name.')));

    pg(5, 'livre', 'publicado', false, 5, 66, 8, P('pós-incidente, aprendizado, causa', 'post-incident, learning, cause'),
      P('Como escrever um pós-incidente', 'How to write a post-incident review'),
      P(md('## Princípio', 'O pós-incidente procura a causa, não o culpado. O objetivo é que o mesmo problema não aconteça duas vezes.', '',
        '## Estrutura', '### 1. O que aconteceu', 'Linha do tempo com horários: quando começou, quando foi percebido, quando foi resolvido.', '',
        '### 2. Impacto', 'Quem ficou parado, por quanto tempo e o que deixou de ser feito.', '',
        '### 3. Causa', 'Perguntar *por quê* até chegar a algo que dá para mudar.', '',
        '### 4. Ações', '| Ação | Dono | Prazo |', '| --- | --- | --- |', '| Corrigir a causa | Nome | Data |', '| Criar ou atualizar o runbook | Nome | Data |', '| Criar o alerta que faltou | Nome | Data |', '',
        '## Prazo', 'Publicar em até 5 dias úteis depois do incidente, enquanto a memória está fresca.'),
      md('## Principle', 'A post-incident review looks for the cause, not for someone to blame. The goal is that the same problem never happens twice.', '',
        '## Structure', '### 1. What happened', 'A timeline with times: when it started, when it was noticed, when it was fixed.', '',
        '### 2. Impact', 'Who was stopped, for how long and what was left undone.', '',
        '### 3. Cause', 'Ask *why* until you reach something that can be changed.', '',
        '### 4. Actions', '| Action | Owner | Due |', '| --- | --- | --- |', '| Fix the cause | Name | Date |', '| Create or update the runbook | Name | Date |', '| Create the missing alert | Name | Date |', '',
        '## Deadline', 'Publish within 5 business days after the incident, while the memory is fresh.')));

    pg(5, 'livre', 'publicado', true, 5, 150, 6, P('manutenção, memória, método', 'maintenance, memory, method'),
      P('Como assumir a manutenção de um sistema do portal', 'Taking over maintenance of a portal system'),
      P(md('## Princípio', 'Nenhum sistema depende da memória de uma pessoa. Cada módulo tem a própria memória de projeto: decisões, regras de negócio, armadilhas conhecidas e o estado de cada entrega.', '',
        '## Onde está cada coisa', '- **Memória do projeto**: um arquivo por assunto, com data e motivo de cada decisão.', '- **Runbooks**: o passo a passo de cada problema que já aconteceu.', '- **Método versionado**: como levantar requisitos, revisar e entregar.', '- **Páginas de arquitetura**: como as partes de cada sistema se conectam.', '',
        '## Primeira semana', '1. Ler a página de arquitetura do módulo e a memória do projeto.', '2. Reproduzir um runbook em ambiente separado.', '3. Entregar uma correção pequena seguindo o método, do levantamento à entrega.'),
      md('## Principle', 'No system depends on the memory of one person. Each module has its own project memory: decisions, business rules, known pitfalls and the state of every delivery.', '',
        '## Where everything lives', '- **Project memory**: one file per topic, with the date and reason for each decision.', '- **Runbooks**: the step by step for every problem that has already happened.', '- **Versioned method**: how to gather requirements, review and deliver.', '- **Architecture pages**: how the parts of each system connect.', '',
        '## First week', '1. Read the module architecture page and its project memory.', '2. Reproduce a runbook in a separate environment.', '3. Ship a small fix following the method, from requirements to delivery.')));

    pg(5, 'livre', 'rascunho', false, 5, 3, null, P('planejamento, prioridades, ano', 'planning, priorities, year'),
      P('Roteiro de evolução da TI para o próximo ano', 'IT roadmap for next year'),
      P(md('## Prioridades em discussão', '1. Trocar o servidor de arquivos, que chega ao fim da garantia.', '2. Levar o monitoramento para todos os segmentos da rede.', '3. Automatizar a revisão trimestral de acessos.', '',
        '## Critérios', '- Reduz risco de parada?', '- Tira trabalho manual repetido de alguém?', '- Cabe no orçamento aprovado?', '',
        '> Rascunho para a reunião de planejamento. Os valores entram depois das cotações.'),
      md('## Priorities under discussion', '1. Replace the file server, which is reaching the end of its warranty.', '2. Extend monitoring to every network segment.', '3. Automate the quarterly access review.', '',
        '## Criteria', '- Does it reduce the risk of downtime?', '- Does it remove repeated manual work from someone?', '- Does it fit the approved budget?', '',
        '> Draft for the planning meeting. Figures come in after the quotes.')));

    /* ----- sem categoria (o sistema real permite) ----- */
    pg(null, 'livre', 'publicado', false, 6, 40, 15, P('glossário, siglas', 'glossary, acronyms'),
      P('Glossário de siglas da TI', 'IT acronym glossary'),
      P(md('## Para que serve', 'Traduzir as siglas que aparecem nos chamados e nas páginas desta base.', '',
        '| Sigla | Significado |', '| --- | --- |', '| API | Interface que um sistema oferece para outro conversar com ele |', '| ERP | Sistema de gestão da empresa: pedidos, estoque, notas e financeiro |', '| VPN | Conexão segura para acessar a rede de fora |', '| 2FA | Verificação em duas etapas |', '| SLA | Acordo de prazo de atendimento |', '',
        'Faltou alguma? Edite esta página ou abra um chamado.'),
      md('## What it is for', 'Translating the acronyms that show up in tickets and in the pages of this base.', '',
        '| Acronym | Meaning |', '| --- | --- |', '| API | The interface a system offers for another one to talk to it |', '| ERP | The company management system: orders, stock, invoices and finance |', '| VPN | A secure connection to reach the network from outside |', '| 2FA | Two-step verification |', '| SLA | Agreed response time |', '',
        'Is one missing? Edit this page or open a ticket.')));

    /* trilha de auditoria: o servidor grava cada criação, edição e mudança de situação */
    const audit = [];
    paginas.forEach(p => {
      audit.push({ id: audit.length + 1, action: 'CREATE', userId: p.criadoPorId, area: 'paginas', recordId: p.id, old: null, novo: { titulo: p.titulo, status: 'rascunho' }, quando: p.criadoEm });
      if (p.atualizadoEm) audit.push({ id: audit.length + 1, action: 'UPDATE', userId: p.atualizadoPorId, area: 'paginas', recordId: p.id, old: null, novo: { titulo: p.titulo }, quando: p.atualizadoEm });
      if (p.status === 'publicado') audit.push({ id: audit.length + 1, action: 'STATUS_CHANGE', userId: 5, area: 'paginas', recordId: p.id, old: { status: 'rascunho' }, novo: { status: 'publicado' }, quando: p.atualizadoEm || p.criadoEm });
    });
    Object.keys(anexos).forEach((u, i) => audit.push({ id: audit.length + 1, action: 'CREATE', userId: 9, area: 'anexos', recordId: PROJ, old: null, novo: { arquivo: anexos[u].nome, tipo: anexos[u].tipo }, quando: api.data(-60 + i, '11:05') }));

    const links = [
      { label: P('Virtualização', 'Virtualization'), url: '' },
      { label: P('Backup', 'Backup'), url: '' },
      { label: P('Painéis', 'Dashboards'), url: '' },
      { label: P('Monitoramento', 'Monitoring'), url: '' },
    ];
    return { categorias, paginas, anexos, audit, links, seq: { pagina: paginas.length + 1, categoria: 6, anexo: 5 } };
  }

  /* ================= apresentação: visual único do hub (CONTRATO, seção 7) =================
     O miolo é o kit (botões, selos, indicadores, cartões, busca, campos, avisos, diálogos). Este bloco só arruma o layout e desenha
     as peças sem equivalente no kit (trilha de pilares, barra de tipos, mural, links rápidos, leitor de Markdown, barra de
     ferramentas do editor), sempre com os tokens --ph-* da casca: nenhuma cor, fonte ou regra por tema aqui; o tema e o alto
     contraste vêm da casca. Os diálogos usam a moldura do kit sem sobrescrita: a classe .bc-real no ui.modal só dá escopo ao miolo. */
  const ROTULO = 'font-family:var(--ph-font-mono);font-size:11px;font-weight:700;line-height:1.4;text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const BTN0 = 'appearance:none;border:0;background:none;padding:0;margin:0;font:inherit;color:inherit;text-align:left;cursor:pointer';
  const FOCO = 'outline:var(--ph-foco-largura) solid var(--ph-focus);outline-offset:2px';
  const CSS = [
    '.bc-real{color:var(--ph-text);min-width:0}',
    '.bc-real .b-ic{display:inline-flex;flex:none}.bc-real .b-ic svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    Object.keys(TOKEN).map(k => '.bc-real .k-' + k + '{--c:' + TOKEN[k] + '}').join(''),
    '.bc-real .b-corpo{display:flex;gap:16px;align-items:flex-start}.bc-real .b-area{flex:1;min-width:0}.bc-real .b-carg{color:var(--ph-text-muted);font-size:13px;padding:20px 0}',
    /* faixa das ajudas que só existem na demonstração */
    '.bc-real .b-demo{border-bottom:1px dashed var(--ph-border-soft);background:var(--ph-surface);font-size:13px;color:var(--ph-text-muted)}',
    '.bc-real .b-demo summary{cursor:pointer;padding:8px clamp(16px,3vw,24px);display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;list-style:none;' + ROTULO + ';color:var(--ph-text-dim)}',
    '.bc-real .b-demo summary::-webkit-details-marker{display:none}.bc-real .b-demo summary:focus-visible{' + FOCO + ';outline-offset:-2px}',
    '.bc-real .b-demo summary .nota{font-family:var(--ph-font);font-size:12px;font-weight:400;letter-spacing:0;text-transform:none;font-stretch:100%}.bc-real .b-demo[open] summary .b-ic:last-child{transform:rotate(180deg)}',
    '.bc-real .b-demo .corpo{display:flex;flex-wrap:wrap;align-items:center;gap:8px 20px;padding:2px clamp(16px,3vw,24px) 12px}.bc-real .b-demo .g{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;min-width:0;max-width:100%}',
    '.bc-real .b-demo .tag{' + ROTULO + ';font-size:10px;color:var(--ph-text-dim);border:1px dashed var(--ph-border-soft);border-radius:var(--ph-raio);padding:1px 6px;white-space:nowrap}',
    '.bc-real .b-demo .rota{font-family:var(--ph-font-mono);font-size:12px;color:var(--ph-text-muted);overflow-wrap:anywhere;min-width:0}',
    '.bc-real .b-demo .ph-campo{flex-direction:row;flex-wrap:wrap;align-items:center;gap:6px 8px;max-width:100%}.bc-real .b-demo .ph-input{width:auto;max-width:100%;min-width:0}',
    '.bc-real .b-demo .ph-btn{white-space:normal;height:auto;min-height:2rem;text-align:left}',
    /* trilha de pilares (navegação interna do sistema real), dentro de um cartão do kit */
    '.bc-real .b-trilha{width:264px;flex:none;position:sticky;top:80px;min-width:0}.bc-real .b-trilha>.ph-card{padding:10px;gap:2px}',
    '.bc-real .b-nav{' + BTN0 + ';display:flex;align-items:center;gap:8px;width:100%;color:var(--ph-text-muted);border-radius:var(--ph-raio);padding:8px 10px;font-size:13px;line-height:1.4}',
    '.bc-real .b-nav:hover{background:var(--ph-surface);color:var(--ph-text)}.bc-real .b-nav.on{background:var(--ph-active-bg);color:var(--ph-active-fg);font-weight:600}.bc-real .b-nav:focus-visible{' + FOCO + ';outline-offset:-2px}',
    '.bc-real .b-trilha .rot{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 4px 4px 10px;' + ROTULO + ';color:var(--ph-text-dim)}',
    '.bc-real .b-cats{max-height:52vh;overflow-y:auto;min-height:0}.bc-real .b-catrow{display:flex;align-items:center;gap:2px}.bc-real .b-catrow .b-nav{flex:1;min-width:0}.bc-real .b-catrow .ph-btn{flex:none;width:1.75rem;height:1.75rem;min-height:0;padding:0}.bc-real .b-nav.on .ci{color:inherit}',
    '.bc-real .b-catrow .ci{color:var(--c);display:inline-flex}.bc-real .b-catrow .nm{flex:1;min-width:0;overflow-wrap:break-word}.bc-real .b-catrow .n{font-size:11px;color:var(--ph-text-dim);font-variant-numeric:tabular-nums}.bc-real .b-nav.on .n{color:inherit}',
    /* barra superior das telas internas */
    '.bc-real .b-topo{display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;align-items:center}.bc-real .b-topo .b-busca{flex:1 1 220px;max-width:none}',
    /* visão geral (central de comando) */
    '.bc-real .cc-in{display:flex;flex-direction:column;gap:18px}',
    '.bc-real .cc-hero{display:flex;gap:12px 20px;flex-wrap:wrap;align-items:flex-start;justify-content:space-between}.bc-real .cc-hero .esq{min-width:0;flex:1 1 260px;display:flex;flex-direction:column;align-items:flex-start;gap:6px}',
    '.bc-real .cc-sub{color:var(--ph-text-muted);font-size:13.5px;margin:0}',
    '.bc-real .cc-rel{text-align:right;font-variant-numeric:tabular-nums}.bc-real .cc-rel .h{font-family:var(--ph-font-mono);font-size:26px;font-weight:700;color:var(--ph-text);line-height:1}.bc-real .cc-rel .d{color:var(--ph-text-muted);font-size:12.5px;margin-top:6px}',
    '.bc-real .cc-busca{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.bc-real .cc-busca .ph-busca{flex:1 1 240px;max-width:none}',
    '.bc-real .cc-kpis{grid-template-columns:repeat(auto-fit,minmax(min(130px,100%),1fr))}',
    '.bc-real .cc-cols{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:16px;align-items:start}.bc-real .cc-col{display:flex;flex-direction:column;gap:16px;min-width:0}',
    '.bc-real .cc-tipos{display:flex;gap:2px;height:10px;border-radius:999px;overflow:hidden;background:var(--ph-card-2)}.bc-real .cc-tipos i{display:block;background:var(--c)}',
    '.bc-real .cc-leg{display:flex;gap:8px 16px;flex-wrap:wrap}.bc-real .cc-leg .it{display:flex;align-items:center;gap:7px;font-size:12.5px;color:var(--ph-text-muted)}.bc-real .cc-leg .it .b-ic{color:var(--c)}.bc-real .cc-leg .q{width:9px;height:9px;border-radius:2px;background:var(--c)}.bc-real .cc-leg strong{color:var(--ph-text);font-variant-numeric:tabular-nums}',
    '.bc-real .cc-pilares{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(210px,100%),1fr));gap:12px}.bc-real .cc-pcard.ph-card{padding:0;gap:0;min-width:0;overflow:hidden}',
    '.bc-real .cc-pilar{' + BTN0 + ';position:relative;display:flex;flex-direction:column;width:100%;height:100%;padding:16px;border-radius:inherit;min-width:0}.bc-real .cc-pilar:hover{box-shadow:inset 0 0 0 1px var(--ph-accent)}.bc-real .cc-pilar:focus-visible{' + FOCO + ';outline-offset:-3px}',
    '.bc-real .cc-pilar .fio{position:absolute;top:0;left:0;right:0;height:2px;background:var(--c)}.bc-real .cc-pilar .ln{display:flex;align-items:center;gap:10px;min-width:0}',
    '.bc-real .cc-pilar .q{display:inline-flex;align-items:center;justify-content:center;flex:none;width:34px;height:34px;border-radius:var(--ph-raio);color:var(--c);background:color-mix(in srgb,var(--c) 12%,transparent);border:1px solid color-mix(in srgb,var(--c) 30%,transparent)}',
    '.bc-real .cc-pilar .nm{color:var(--ph-text);font-weight:650;font-size:14px;min-width:0}.bc-real .cc-pilar .ds{display:block;color:var(--ph-text-muted);font-size:12.5px;margin-top:10px;line-height:1.5}',
    '.bc-real .cc-pilar .qt{display:flex;align-items:center;gap:4px;color:var(--ph-accent-light);font-size:12px;font-weight:600;margin-top:auto;padding-top:12px}',
    '.bc-real .cc-vz{color:var(--ph-text-muted);font-size:13px;margin:0}',
    '.bc-real .cc-feed{display:flex;flex-direction:column}.bc-real .cc-feed button{' + BTN0 + ';display:flex;gap:11px;align-items:flex-start;border-top:1px solid var(--ph-border);padding:10px 6px;min-width:0;border-radius:var(--ph-raio)}.bc-real .cc-feed button:first-child{border-top:0}',
    '.bc-real .cc-feed button:hover{background:var(--ph-surface)}.bc-real .cc-feed button:focus-visible{' + FOCO + ';outline-offset:-2px}',
    '.bc-real .cc-feed .i{margin-top:2px;color:var(--c);display:inline-flex}.bc-real .cc-feed .tx{flex:1;min-width:0}.bc-real .cc-feed .t{display:block;color:var(--ph-text);font-size:13px;font-weight:600;line-height:1.4;overflow-wrap:break-word}',
    '.bc-real .cc-feed .m{display:flex;gap:8px;align-items:center;margin-top:4px;flex-wrap:wrap}.bc-real .cc-feed .dt{font-size:12px;color:var(--ph-text-dim)}',
    '.bc-real .cc-links{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(200px,100%),1fr));gap:8px}',
    '.bc-real .cc-link{display:flex;align-items:center;gap:2px;min-width:0;background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio)}.bc-real .cc-link:hover{border-color:var(--ph-border-soft)}',
    '.bc-real .cc-link .cx{' + BTN0 + ';display:flex;align-items:center;gap:8px;flex:1;min-width:0;padding:8px 4px 8px 10px;border-radius:var(--ph-raio)}.bc-real .cc-link .cx:focus-visible{' + FOCO + ';outline-offset:-2px}.bc-real .cc-link .cx.sem .nm{color:var(--ph-text-muted)}',
    '.bc-real .cc-link .lt{display:inline-flex;align-items:center;justify-content:center;flex:none;width:24px;height:24px;border-radius:var(--ph-raio);background:color-mix(in srgb,var(--c) 14%,transparent);color:var(--c);font-weight:700;font-size:12px}',
    '.bc-real .cc-link .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;color:var(--ph-text)}.bc-real .cc-link .sg{display:inline-flex;color:var(--ph-text-dim)}.bc-real .cc-link .pt{width:4px;height:4px;border-radius:50%;background:var(--ph-text-dim);margin:0 4px}',
    '.bc-real .cc-add{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;align-items:center}.bc-real .cc-add .ph-campo{flex:1 1 110px}.bc-real .cc-add .ph-campo.u{flex:2 1 160px}.bc-real .cc-addbtn{margin-top:10px;width:100%}',
    '.bc-real .cc-pe{text-align:center;color:var(--ph-text-dim);font-family:var(--ph-font-mono);font-size:12px;margin:0;padding-top:12px;border-top:1px solid var(--ph-border)}',
    /* lista */
    '.bc-real .b-lcab{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;gap:12px;flex-wrap:wrap}.bc-real .b-lcab h2{display:flex;align-items:center;gap:10px;min-width:0;margin:0}',
    '.bc-real .b-cont{font-family:var(--ph-font);font-weight:600;text-transform:none;letter-spacing:0;font-variant-numeric:tabular-nums}',
    '.bc-real .b-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(240px,100%),1fr));gap:12px}.bc-real .bc-cartao.ph-card{padding:0;gap:0;min-width:0;overflow:hidden}',
    '.bc-real .bc-card{' + BTN0 + ';display:flex;flex-direction:column;width:100%;height:100%;padding:16px;border-radius:inherit;min-width:0}.bc-real .bc-card:hover{box-shadow:inset 0 0 0 1px var(--ph-accent)}.bc-real .bc-card:focus-visible{' + FOCO + ';outline-offset:-3px}',
    '.bc-real .bc-card .sl{display:flex;align-items:center;gap:6px;margin-bottom:10px;flex-wrap:wrap}.bc-real .bc-card .pin{display:inline-flex;color:var(--ph-cor-ambar)}',
    '.bc-real .bc-card .t{display:block;color:var(--ph-text);font-weight:650;font-size:14px;line-height:1.4;overflow-wrap:break-word}.bc-real .bc-card .m{display:block;color:var(--ph-text-dim);font-size:12px;margin-top:auto;padding-top:8px}',
    /* leitor */
    '.bc-real .b-leitor.ph-card{max-width:880px;min-width:0;padding:24px;gap:0}.bc-real .b-leitor .volta{margin-bottom:14px}',
    '.bc-real .b-selos{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}.bc-real .b-selos .fx{display:inline-flex;align-items:center;gap:3px;font-size:12px;font-weight:600;color:var(--ph-cor-ambar)}.bc-real .b-selos .mt{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--ph-text-muted)}',
    '.bc-real .b-leitor .tit{margin:0 0 6px;overflow-wrap:anywhere}.bc-real .b-leitor .aut{color:var(--ph-text-dim);font-size:12.5px;margin:0 0 4px}.bc-real .b-tags{margin:10px 0 4px}',
    '.bc-real .b-hr{border:0;border-top:1px solid var(--ph-border);margin:16px 0}',
    '.bc-real .b-topicos{background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio);padding:12px 16px;margin-bottom:18px}.bc-real .b-topicos p{margin:0 0 8px;' + ROTULO + ';color:var(--ph-text-dim)}',
    '.bc-real .b-topicos button{' + BTN0 + ';display:block;width:100%;font-size:13.5px;color:var(--ph-text-muted);padding:3px 0;border-radius:var(--ph-raio)}.bc-real .b-topicos button:hover{color:var(--ph-accent-light)}.bc-real .b-topicos button:focus-visible{' + FOCO + '}',
    '.bc-real .b-topicos .n1{color:var(--ph-text);font-weight:600}.bc-real .b-topicos .n2{padding-left:14px}.bc-real .b-topicos .n3{padding-left:28px}',
    '.bc-real .b-acoes{display:flex;gap:8px;margin-top:24px;border-top:1px solid var(--ph-border);padding-top:16px;flex-wrap:wrap}',
    /* conteúdo em Markdown: tipografia de leitura com os tokens do hub */
    '.bc-real .md-body{color:var(--ph-text-2);font-family:var(--ph-font);font-size:15px;line-height:1.7;min-width:0;overflow-wrap:break-word}.bc-real .md-body>:first-child{margin-top:0}',
    '.bc-real .md-body>p,.bc-real .md-body>ul,.bc-real .md-body>ol,.bc-real .md-body>blockquote{max-width:75ch}',
    '.bc-real .md-body .mh{color:var(--ph-text);font-family:var(--ph-font);font-weight:650;margin:26px 0 8px;line-height:1.3;letter-spacing:0;text-transform:none;outline:none;scroll-margin-top:96px}',
    '.bc-real .md-body .mh1{font-size:22px}.bc-real .md-body .mh2{font-size:19px}.bc-real .md-body .mh3{font-size:16.5px}.bc-real .md-body .mh4{font-size:15px}',
    '.bc-real .md-body p{margin:10px 0}.bc-real .md-body strong{color:var(--ph-text);font-weight:650}.bc-real .md-body em{font-style:italic}',
    '.bc-real .md-body ul,.bc-real .md-body ol{margin:10px 0 10px 22px;padding:0}.bc-real .md-body ul{list-style:disc}.bc-real .md-body ol{list-style:decimal}.bc-real .md-body li{margin:4px 0;padding-left:2px}.bc-real .md-body li::marker{color:var(--ph-text-dim)}',
    '.bc-real .md-body code{background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio);padding:1px 6px;font-family:var(--ph-font-mono);font-size:.88em;color:var(--ph-accent-light)}',
    '.bc-real .md-body pre.md-pre{background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio);padding:14px;overflow-x:auto;margin:14px 0;font-family:var(--ph-font-mono);font-size:13px;line-height:1.55;white-space:pre}',
    '.bc-real .md-body pre.md-pre code{background:none;border:0;padding:0;color:var(--ph-text);font-size:inherit}.bc-real .md-body pre.md-pre:focus-visible,.bc-real .md-body .md-tw:focus-visible,.bc-real .md-body .md-dg:focus-visible{' + FOCO + '}',
    '.bc-real .md-body .md-a{' + BTN0 + ';display:inline;color:var(--ph-accent-light);text-decoration:underline;text-underline-offset:3px}.bc-real .md-body .md-a .b-ic{vertical-align:-1px;margin-right:4px}.bc-real .md-body .md-a:focus-visible{' + FOCO + '}',
    '.bc-real .md-body .md-img{max-width:100%;border-radius:var(--ph-raio);border:1px solid var(--ph-border);margin:12px 0;display:block}',
    '.bc-real .md-body .md-dg{background:var(--ph-surface);padding:12px;overflow-x:auto}.bc-real .md-body .md-dg svg{display:block;width:100%;min-width:520px;max-width:660px;height:auto;margin:0 auto}.bc-real .md-body .md-dg rect{fill:var(--ph-card);stroke:var(--ph-border-soft)}',
    '.bc-real .md-body .md-dg .t{fill:var(--ph-text);font-family:var(--ph-font);font-size:13px;font-weight:600;text-anchor:middle}.bc-real .md-body .md-dg .s{fill:var(--ph-text-muted);font-family:var(--ph-font);font-size:10px;text-anchor:middle}.bc-real .md-body .md-dg .l{fill:none;stroke:var(--ph-accent);stroke-width:1.5}.bc-real .md-body .md-dg .p{fill:var(--ph-accent)}',
    '.bc-real .md-body .md-ph{display:flex;flex-direction:column;align-items:center;gap:6px;padding:26px 12px;background:var(--ph-surface);color:var(--ph-text-muted);font-size:12.5px;line-height:1.5;text-align:center}.bc-real .md-body .md-ph b{color:var(--ph-text);font-weight:600}',
    '.bc-real .md-body .md-video{max-width:100%;border-radius:var(--ph-raio);border:1px solid var(--ph-border);margin:12px 0;background:var(--ph-card-2)}',
    '.bc-real .md-body .md-vd{display:flex;flex-direction:column;width:100%;max-width:640px;aspect-ratio:16 / 9;overflow:hidden}.bc-real .md-body .md-vd .pl{' + BTN0 + ';flex:1;display:flex;align-items:center;justify-content:center;color:var(--ph-text)}.bc-real .md-body .md-vd .pl:focus-visible{' + FOCO + ';outline-offset:-4px}',
    '.bc-real .md-body .md-vd .rd{display:inline-flex;padding:14px;border-radius:50%;background:var(--ph-surface);border:1px solid var(--ph-border-soft)}.bc-real .md-body .md-vd .pl:hover .rd{border-color:var(--ph-accent);color:var(--ph-accent-light)}',
    '.bc-real .md-body .md-vd .bar{display:flex;align-items:center;gap:10px;padding:8px 12px;font-size:11.5px;line-height:1.5;color:var(--ph-text-muted);border-top:1px solid var(--ph-border);background:var(--ph-surface)}.bc-real .md-body .md-vd .bar i{flex:1;min-width:20px;height:3px;border-radius:2px;background:var(--ph-border-soft)}.bc-real .md-body .md-vd .bar .nm{min-width:0;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.bc-real .md-body .md-tw{overflow-x:auto;margin:14px 0;border:1px solid var(--ph-border);border-radius:var(--ph-raio)}.bc-real .md-body table.md-table{border-collapse:collapse;width:100%;font-size:13.5px;line-height:1.5}',
    '.bc-real .md-body table.md-table th,.bc-real .md-body table.md-table td{border-bottom:1px solid var(--ph-border);padding:9px 12px;text-align:left;vertical-align:top}.bc-real .md-body table.md-table tbody tr:last-child td{border-bottom:0}',
    '.bc-real .md-body table.md-table th{background:var(--ph-surface);color:var(--ph-text-muted);font-size:12px;font-weight:600;text-transform:var(--ph-rotulo-case);letter-spacing:var(--ph-rotulo-tracking)}.bc-real .md-body table.md-table td{color:var(--ph-text-2)}',
    '.bc-real .md-body li.md-task{list-style:none;display:flex;align-items:flex-start;gap:8px;margin-left:-22px}',
    '.bc-real .md-body .md-check{flex:none;width:16px;height:16px;border:1px solid var(--ph-borda-campo);border-radius:4px;display:inline-flex;align-items:center;justify-content:center;color:var(--ph-ok);margin-top:4px;background:var(--ph-campo-bg)}.bc-real .md-body .md-check.on{border-color:var(--ph-ok);background:color-mix(in srgb,var(--ph-ok) 18%,var(--ph-campo-bg))}',
    '.bc-real .md-body blockquote{border-left:3px solid var(--ph-accent);margin:14px 0;padding:6px 14px;color:var(--ph-text-muted);background:var(--ph-surface);border-radius:0 var(--ph-raio) var(--ph-raio) 0}',
    '.bc-real .md-body hr{border:0;border-top:1px solid var(--ph-border);margin:18px 0}.bc-real .md-body .md-empty{color:var(--ph-text-muted)}',
    /* editor */
    '.bc-real .b-editor.ph-card{max-width:900px;min-width:0}',
    '.bc-real .b-form{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}.bc-real .b-form .lg{grid-column:1 / -1}',
    '.bc-real .b-clab{display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap}',
    '.bc-real .b-tb{display:flex;gap:2px;flex-wrap:wrap;align-items:center;background:var(--ph-surface);border:1px solid var(--ph-borda-campo);border-bottom:0;border-radius:var(--ph-raio) var(--ph-raio) 0 0;padding:4px 6px;margin-bottom:-5px}',
    '.bc-real .b-tb .ph-btn.bd{font-weight:800}.bc-real .b-tb .ph-btn.it{font-style:italic}.bc-real .b-tb .sep{width:1px;height:18px;background:var(--ph-border);margin:0 4px}',
    '.bc-real .b-ta.ph-input{min-height:280px;font-family:var(--ph-font-mono);font-size:13px;line-height:1.6;border-top-left-radius:0;border-top-right-radius:0}.bc-real .b-ta.arr{border-color:var(--ph-accent);box-shadow:inset 0 0 0 2px color-mix(in srgb,var(--ph-accent) 35%,transparent)}',
    '.bc-real .b-prev summary{cursor:pointer;color:var(--ph-text-muted);font-size:12.5px;border-radius:var(--ph-raio)}.bc-real .b-prev summary:focus-visible{' + FOCO + '}.bc-real .b-prev .md-body{margin-top:10px;padding:14px;background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio)}',
    '.bc-real .b-epe{display:flex;align-items:center;gap:10px 16px;flex-wrap:wrap;padding-top:4px}.bc-real .b-epe .nt{font-size:12.5px;color:var(--ph-text-muted)}.bc-real .b-epe .dir{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}',
    /* miolo dos diálogos do sistema (a moldura é a do kit) */
    '.bc-real .b-duo{display:flex;gap:10px;flex-wrap:wrap}.bc-real .b-duo>.ph-campo{flex:1 1 140px}.bc-real .b-cor.ph-input{padding:3px 4px;cursor:pointer}',
    '.bc-real .b-conf{margin:0;color:var(--ph-text-2);font-size:13.5px}.bc-real .b-conf-n{margin:0;color:var(--ph-text);font-size:14px;font-weight:650;overflow-wrap:anywhere}',
    '@media (max-width:980px){.bc-real .cc-cols{grid-template-columns:minmax(0,1fr)}}',
    '@media (max-width:760px){.bc-real .b-corpo{flex-direction:column;align-items:stretch}.bc-real .b-trilha{width:auto;position:static}}',
    '@media (max-width:520px){.bc-real .b-tb .sep{display:none}.bc-real .b-form{grid-template-columns:minmax(0,1fr)}.bc-real .b-leitor.ph-card{padding:16px}.bc-real .cc-rel{text-align:left}}',
  ].join('\n');
  function injetarCss() {
    if (document.getElementById('bc-real-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'bc-real-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  Hub.registrar({
    id: 'base_conhecimento',
    ordem: 14,
    grupo: P('Conhecimento', 'Knowledge'),
    icone: 'livro',
    nome: P('Base de conhecimento', 'Knowledge base'),
    resumo: P(
      'CoreEngine, a base de conhecimento da TI: pilares, páginas de arquitetura e runbooks em Markdown, anexos com lista de formatos permitidos, rascunho e publicação por quem gere, busca em todo o texto.',
      'CoreEngine, the IT knowledge base: pillars, architecture pages and runbooks in Markdown, attachments limited to allowed formats, drafts published by managers, full-text search.'
    ),
    manual: {
      pt: {
        destaque: 'O CoreEngine é a base de conhecimento do ProjectHub, a camada inteligente sobre o ERP: um lugar único para a documentação da TI, organizado por pilares, escrito em Markdown, com rascunho e publicação, permissões por perfil, anexos com lista de formatos permitidos e trilha de auditoria.',
        oque: [
          'O problema. Em qualquer equipe técnica, o conhecimento tende a ficar preso em pessoas e espalhado em arquivos: a solução de um incidente mora na memória de quem atendeu, a arquitetura de um sistema está em um documento que poucos sabem onde fica, e quem chega precisa descobrir de novo o que já foi resolvido uma vez.',
          'Como funciona. A base é dividida em pilares, por exemplo operações e infraestrutura, aplicações e dados, segurança e continuidade, serviços e fornecedores, cultura e pessoas. Cada pilar tem nome, cor e ícone e reúne as páginas do assunto. A tela inicial é uma central de comando: relógio, busca em toda a base, cinco indicadores, distribuição por tipo de página, os pilares, o mural e os links rápidos de TI, guardados no navegador de cada pessoa.',
          'As páginas são escritas em Markdown, com barra de ferramentas para títulos, listas, tabelas, citações, links e checklists. Dois modelos prontos padronizam o que mais importa: a página de arquitetura (visão geral, desenho técnico, componentes e como verificar a saúde do serviço) e o runbook (sintomas, causa raiz, resolução passo a passo e plano de contingência). O leitor monta os tópicos a partir dos títulos e informa o tempo de leitura.',
          'Página de quem não gere nasce como rascunho. Quem tem acesso ao projeto lê as páginas publicadas e escreve rascunhos; só quem gere a base (administrador do departamento dono ou super administrador) publica, fixa no mural, exclui e mantém os pilares. As páginas fixadas aparecem primeiro no mural, seguidas das atualizações mais recentes.',
          'Imagens, vídeos e documentos entram por botão ou arrastando o arquivo. O servidor confere a extensão na lista permitida e o teto de tamanho. Cada criação, edição, mudança de situação, exclusão e envio de anexo fica registrada na trilha de auditoria, com quem fez e quando.',
          'Nesta demonstração todas as telas funcionam sobre dados fictícios. Onde o sistema real chama o servidor, um rastro mostra o que o back-end faz, passo a passo; a faixa Controles da demonstração permite trocar de perfil e ver o que cada papel enxerga.',
        ].join('\n\n'),
        finalidade: [
          'Fazer com que um problema resolvido uma vez não precise ser descoberto de novo. Quem chega à equipe encontra como as coisas funcionam, quem atende um chamado segue o runbook em vez de improvisar, e a documentação de cada sistema fica dentro do mesmo portal onde os sistemas são usados, com o mesmo login e as mesmas permissões.',
          'Salvaguardas. Toda chamada à API da base exige login e acesso ao projeto. Rascunho não aparece para quem só lê. A exclusão é lógica: a página sai das telas e continua guardada no banco. O servidor confere de novo o título obrigatório, os limites de tamanho dos campos, as permissões e os anexos (extensão e tamanho), e grava cada arquivo com um nome aleatório.',
        ].join('\n\n'),
        alcance: [
          'Central de comando com relógio, busca em toda a base, cinco indicadores, distribuição por tipo, pilares, mural e links rápidos',
          'Pilares com nome, cor e ícone, criados, editados e excluídos por quem gere',
          'Lista de páginas por pilar ou de toda a base, com as fixadas primeiro',
          'Busca por título, tag e conteúdo',
          'Leitor com tipo, situação, pilar, tempo de leitura, dono, autor, data, tags e tópicos navegáveis',
          'Editor em Markdown com barra de ferramentas, modelos de arquitetura e de runbook e pré-visualização',
          'Anexos de imagem, vídeo e documento com lista de extensões permitidas e teto de tamanho',
          'Rascunho por qualquer pessoa com acesso; publicar, fixar e excluir só por quem gere',
          'Exclusão lógica e identificador legível (slug) único por projeto, gerado a partir do título',
          'Trilha de auditoria de cada criação, edição, mudança de situação, exclusão e anexo',
        ],
        outras_empresas: [
          'Como adotar. Serve para qualquer equipe que precisa registrar como as coisas funcionam: TI, manutenção industrial, qualidade, atendimento e RH. O caminho é curto: definir os pilares da área, escolher quem gere a base, adaptar os dois modelos ao vocabulário da casa e começar pelos runbooks dos problemas que mais se repetem.',
          'O que se aproveita sem mudança: a estrutura de pilares e páginas, o fluxo de rascunho e publicação, as permissões por perfil, a validação dos anexos e a auditoria. O que muda em cada empresa: o login corporativo que alimenta os perfis e o conteúdo. Como as páginas são Markdown, o acervo é fácil de exportar, versionar e reaproveitar: pode alimentar a busca da intranet, um assistente interno de perguntas ou o material de integração de novos colegas.',
          'Projetado e construído por Ruan Siqueira.',
        ].join('\n\n'),
        tecnologias: ['Next.js', 'React', 'TypeScript', '.NET', 'Entity Framework', 'SQL Server', 'Markdown'],
      },
      en: {
        destaque: 'CoreEngine is the knowledge base of ProjectHub, the intelligent layer on top of the ERP: a single home for IT documentation, organized by pillars, written in Markdown, with drafts and publishing, role-based permissions, attachments limited to allowed formats and an audit trail.',
        oque: [
          'The problem. In any technical team, knowledge tends to get trapped in people and scattered across files: the fix for an incident lives in the memory of whoever handled it, the architecture of a system sits in a document few people can find, and newcomers have to figure out again what was already solved once.',
          'How it works. The base is split into pillars, for example operations and infrastructure, applications and data, security and continuity, services and suppliers, culture and people. Each pillar has a name, a color and an icon and gathers the pages on its subject. The home screen is a command center: clock, search across the whole base, five indicators, distribution by page type, the pillars, the board and the IT quick links, saved in each person\'s browser.',
          'Pages are written in Markdown, with a toolbar for headings, lists, tables, quotes, links and checklists. Two ready-made templates standardize what matters most: the architecture page (overview, technical design, components and how to check service health) and the runbook (symptoms, root cause, step-by-step fix and contingency plan). The reader builds the topics from the headings and shows the reading time.',
          'A page from someone who does not manage the base starts as a draft. Anyone with access to the project reads the published pages and writes drafts; only whoever manages the base (an administrator of the owning department or a super administrator) publishes, pins to the board, deletes and maintains the pillars. Pinned pages come first on the board, followed by the most recent updates.',
          'Images, videos and documents come in through a button or by dragging the file. The server checks the extension against the allow-list and the overall size ceiling. Every creation, edit, status change, deletion and attachment upload is recorded in the audit trail, with who did it and when.',
          'In this demo every screen works on fictitious data. Where the real system calls the server, a trace shows what the back end does, step by step; the Demo controls strip lets you switch profiles and see what each role gets.',
        ].join('\n\n'),
        finalidade: [
          'Make sure a problem solved once never has to be figured out again. Newcomers find how things work, whoever handles a ticket follows the runbook instead of improvising, and the documentation of each system lives inside the same portal where the systems are used, with the same login and the same permissions.',
          'Safeguards. Every call to the base API requires a login and access to the project. A draft is not shown to read-only users. Deletion is logical: the page leaves the screens and stays stored in the database. The server checks the required title, the field size limits, the permissions and the attachments (extension and size) again, and saves every file under a random name.',
        ].join('\n\n'),
        alcance: [
          'Command center with clock, search across the whole base, five indicators, distribution by type, pillars, board and quick links',
          'Pillars with name, color and icon, created, edited and deleted by managers',
          'Page list per pillar or for the whole base, pinned pages first',
          'Search by title, tag and content',
          'Reader with type, status, pillar, reading time, owner, author, date, tags and navigable topics',
          'Markdown editor with toolbar, architecture and runbook templates and preview',
          'Image, video and document attachments with an extension allow-list and a size ceiling',
          'Drafts by anyone with access; publishing, pinning and deleting only by managers',
          'Soft delete and a readable identifier (slug) unique per project, generated from the title',
          'Audit trail of every creation, edit, status change, deletion and attachment',
        ],
        outras_empresas: [
          'How to adopt it. It fits any team that needs to record how things work: IT, plant maintenance, quality, customer service and HR. The path is short: define the pillars for the department, choose who manages the base, adapt the two templates to the house vocabulary and start with the runbooks for the problems that repeat the most.',
          'What carries over unchanged: the structure of pillars and pages, the draft and publishing flow, the role-based permissions, the attachment validation and the audit trail. What changes in each company: the corporate login that feeds the profiles, and the content. Because pages are Markdown, the collection is easy to export, version and reuse: it can feed the intranet search, an internal question assistant or onboarding material for new staff.',
          'Designed and built by Ruan Siqueira.',
        ].join('\n\n'),
        tecnologias: ['Next.js', 'React', 'TypeScript', '.NET', 'Entity Framework', 'SQL Server', 'Markdown'],
      },
    },
    /* mini tour: só ganchos do módulo (.b-raiz, .cc-*, .b-*), nada que dependa do idioma; parte da central de comando (visão geral) */
    tour: [
      { alvo: '.b-raiz .cc-busca', titulo: P('Tudo o que a TI sabe, num lugar só', 'Everything IT knows, in one place'),
        texto: P('A solução de um incidente não fica mais só na memória de quem atendeu. Uma busca acha qualquer página pelo título, pela tag ou pelo texto.',
          'The fix for an incident no longer lives only in the memory of whoever handled it. One search finds any page by title, tag or text.') },
      { alvo: '.b-raiz .cc-pilares', titulo: P('Organizada por pilares', 'Organized by pillars'),
        texto: P('Infraestrutura, aplicações, segurança, fornecedores e pessoas: cada pilar reúne as páginas do seu assunto, com cor e ícone próprios.',
          'Infrastructure, applications, security, suppliers and people: each pillar gathers the pages on its subject, with its own color and icon.') },
      { alvo: '.b-raiz .cc-feed', titulo: P('O mural da equipe', 'The team board'),
        texto: P('O que importa fica fixado no topo; logo abaixo, o que acabou de mudar na base.', 'What matters stays pinned at the top; right below, what just changed in the base.') },
      { alvo: '.b-raiz .cc-feed button', acao: 'clicar', titulo: P('Abra uma página', 'Open a page'),
        texto: P('Arquitetura dos sistemas e runbooks de incidentes, escritos para quem chega amanhã.', 'System architecture and incident runbooks, written for whoever joins tomorrow.') },
      { alvo: '.b-raiz .b-topicos', titulo: P('Pronta para o plantão', 'Ready for the on-call shift'),
        texto: P('Os tópicos saem dos próprios títulos da página, com tempo de leitura, dono e tags logo acima. Quem atende o chamado segue o passo a passo em vez de improvisar.',
          'The topics come from the page headings, with reading time, owner and tags right above. Whoever handles the ticket follows the steps instead of improvising.') },
      { alvo: '.b-raiz .b-demo', titulo: P('Cada papel vê o que deve', 'Each role sees what it should'),
        texto: P('Quem lê vê o publicado, quem escreve deixa rascunho e quem gere publica. Troque o perfil aqui e veja: nesta base tudo funciona, fique à vontade.',
          'Readers see what is published, writers leave drafts and managers publish. Switch the profile here and see: everything in this base works, so make yourself at home.') },
    ],

    montar(el, api) {
      if (!db) db = semear(api);
      injetarCss();
      const { t, h, ui, fmt } = api;
      const est = api.estado;
      if (!est.view) Object.assign(est, { view: 'overview', catSel: null, busca: '', q: '', atualId: null, form: null, perfil: 'gestor', addLink: false, pronto: false });
      let vivo = true;
      let relogioEl = null, dataEl = null;
      let focarTitulo = false;
      let pintura = 0;

      /* ---------- peças de apresentação ---------- */
      const ic = (nome, tam = 14) => h('span', { class: 'b-ic', 'aria-hidden': 'true', style: 'width:' + tam + 'px;height:' + tam + 'px', html: '<svg viewBox="0 0 24 24" focusable="false">' + (IC[nome] || IC.x) + '</svg>' });
      const e = (tag, classe, ...filhos) => h(tag, classe ? { class: classe } : null, ...filhos);
      /* botões do kit: tom 'primario' | 'secundario' | 'fantasma' | 'perigo'; o ícone é o desenho de traço do sistema real (IC) */
      const btn = (texto, aoClicar, tom, o = {}) => ui.botao({ texto, aoClicar, tom: tom || 'secundario', icone: o.ic && IC[o.ic], tamanho: o.tam, titulo: o.titulo, classe: o.classe });
      const mini = (icn, titulo, aoClicar) => ui.botao({ icone: IC[icn], titulo, tom: 'fantasma', tamanho: 'p', aoClicar });

      /* Avisos: o toast do kit (o sistema real mostra o aviso verde ou vermelho). O aviso que só existe na demonstração leva o rótulo. */
      function flash(msg, ok = true, demo = false) {
        if (vivo) ui.toast(demo ? [h('b', null, P('Demonstração: ', 'Demo: ')), msg] : msg, demo ? 'info' : ok ? 'ok' : 'erro');
      }
      const notaDemo = msg => flash(msg, true, true);

      /* ---------- quem está usando ---------- */
      const perfil = () => PERFIS.find(p => p.id === est.perfil) || PERFIS[0];
      const eu = () => usuario(perfil().usuario);
      const logado = () => perfil().usuario != null;
      const temAcesso = () => !!perfil().acesso;
      const gere = () => perfil().gere;
      const nomeU = id => { const u = usuario(id); return u ? t(u.nome) : ''; };

      /* ---------- leitura dos dados (o que o servidor devolveria para este perfil) ---------- */
      const cats = () => db.categorias.filter(c => c.ativo).sort((a, b) => a.ordem - b.ordem || t(a.nome).localeCompare(t(b.nome)));
      const cat = id => db.categorias.find(c => c.id === id && c.ativo) || null;
      const visiveis = () => db.paginas.filter(p => p.ativo && (gere() || p.status === 'publicado'));
      const atualizado = p => p.atualizadoEm || p.criadoEm;
      const pagina = id => db.paginas.find(p => p.id === id) || null;
      const nPorCat = id => visiveis().filter(p => p.categoriaId === id).length;
      const listar = (categoriaId, q) => {
        const termo = norm(q.trim());
        return visiveis()
          .filter(p => categoriaId == null || p.categoriaId === categoriaId)
          .filter(p => !termo || norm(t(p.titulo)).includes(termo) || norm(t(p.tags) || '').includes(termo) || norm(t(p.conteudo)).includes(termo))
          .sort((a, b) => (b.pinned - a.pinned) || (atualizado(b) - atualizado(a)));
      };
      const palavras = txt => { const s = String(txt).trim(); return s ? s.split(/\s+/).length : 0; };
      const tamanho = n => (n >= MB ? fmt.num(n / MB, 1) + ' MB' : fmt.num(Math.max(n ? 1 : 0, Math.round(n / 1024))) + ' KB');
      const audit = (action, area, recordId, old, novo) => db.audit.push({ id: db.audit.length + 1, action, userId: eu().id, area, recordId, old: old || null, novo: novo || null, quando: new Date() });
      function uniqueSlug(base, excluirId) {
        const tentativas = [];
        let slug = base, i = 2;
        while (db.paginas.some(p => p.slug === slug && p.id !== excluirId)) { tentativas.push(slug); slug = base + '-' + i++; }
        return { slug, tentativas };
      }

      /* ---------- peças do rastro do back-end (a mesma ordem do controlador real). Os passos de banco dizem em palavras o que é lido ou gravado. ---------- */
      const json = o => JSON.stringify(o, null, 2);
      const sn = v => t(v ? P('sim', 'yes') : P('não', 'no'));
      const vazioTxt = () => t(P('(vazio)', '(empty)'));
      function pAuth(metodo, caminho, corpo, multipart) {
        const ok = logado();
        return {
          tipo: 'api', ms: 28, estado: ok ? 'ok' : 'erro',
          titulo: P('Recebe a chamada e confere o login', 'Receives the call and checks the login'),
          detalhe: ok
            ? P('O controlador inteiro exige usuário autenticado: o token do login único do portal é validado antes de qualquer regra.', 'The whole controller requires an authenticated user: the portal single sign-on token is validated before any rule.')
            : P('Sem um token válido a chamada para aqui. Nenhuma regra e nenhuma consulta chegam a rodar.', 'Without a valid token the call stops here. No rule and no query gets to run.'),
          requisicao: metodo + ' ' + ROTA + caminho + '\nAuthorization: Bearer ' + t(P('<token da sessão>', '<session token>')) +
            (multipart ? '\nContent-Type: multipart/form-data\n\n' + multipart : corpo ? '\nContent-Type: application/json\n\n' + json(corpo) : ''),
          resposta: ok ? t(P('Token válido. Usuário ', 'Valid token. User ')) + eu().id + ' · ' + nomeU(eu().id) : '401 Unauthorized',
        };
      }
      function pAcesso() {
        if (!logado()) return []; // a chamada já parou no 401
        const a = perfil().acesso;
        const titulo = P('Confere o acesso ao projeto', 'Checks access to the project');
        if (a === 'super') return [{ tipo: 'regra', ms: 3, titulo, detalhe: P('Super administrador entra em qualquer projeto, sem consultar vínculos.', 'A super administrator gets into any project, with no link lookup.') }];
        const u = eu();
        const passos = [
          { tipo: 'sql', ms: 22, titulo: P('Busca os departamentos do usuário', 'Fetches the user departments'), detalhe: P('Lê a quais departamentos o usuário pertence.', 'Reads which departments the user belongs to.'), resposta: t(P('Departamento: ', 'Department: ')) + t(DEPTOS[u.depto]) },
          {
            tipo: 'regra', ms: 5, titulo,
            detalhe: a === 'dono'
              ? P('O usuário é do departamento dono do projeto: isso já conta como acesso.', 'The user belongs to the department that owns the project: that already counts as access.')
              : P('O usuário não é do departamento dono do projeto. O servidor confere os vínculos extras.', 'The user is not in the department that owns the project. The server checks the extra links.'),
          },
        ];
        if (a !== 'dono') passos.push({
          tipo: 'sql', ms: 31, titulo: P('Confere os vínculos extras do projeto', 'Checks the extra project links'),
          detalhe: P('Duas consultas: o usuário foi vinculado direto ao projeto? Algum departamento dele foi liberado no projeto?', 'Two lookups: was the user linked directly to the project? Was any of the user departments granted access to the project?'),
          resposta: a === 'vinculo' ? P('Vínculo direto do usuário com o projeto: encontrado. Acesso liberado.', 'Direct link between the user and the project: found. Access granted.') : P('Nenhum vínculo nas duas consultas.', 'No link found in either lookup.'),
        });
        if (!a) passos.push({ tipo: 'api', ms: 2, estado: 'erro', titulo: P('Recusa a chamada', 'Refuses the call'), detalhe: P('Sem vínculo com o projeto, nada é lido nem gravado.', 'With no link to the project, nothing is read or written.'), resposta: '403 Forbidden' });
        return passos;
      }
      function pGere(exige) {
        if (!temAcesso()) return []; // a chamada já parou no 401 ou no 403
        if (perfil().acesso === 'super') return [{ tipo: 'regra', ms: 3, titulo: P('Confere se o usuário gere a base', 'Checks whether the user manages the base'), detalhe: P('Super administrador gere qualquer projeto.', 'A super administrator manages any project.'), resposta: 'canManage = true' }];
        const g = gere();
        const passos = [{
          tipo: 'sql', ms: 19, titulo: P('Confere se o usuário gere a base', 'Checks whether the user manages the base'),
          detalhe: P('Gere a base quem é administrador do departamento dono do projeto: o servidor procura o usuário entre esses administradores.', 'Whoever is an administrator of the department that owns the project manages the base: the server looks for the user among those administrators.'),
          resposta: g ? P('Encontrado: canManage = true', 'Found: canManage = true') : P('Não encontrado: canManage = false', 'Not found: canManage = false'),
        }];
        if (exige && !g) passos.push({ tipo: 'api', ms: 2, estado: 'erro', titulo: P('Recusa a chamada', 'Refuses the call'), detalhe: P('Esta ação é só de quem gere a base.', 'This action is only for whoever manages the base.'), resposta: '403 Forbidden' });
        return passos;
      }
      const pVisibilidade = () => ({
        tipo: 'regra', ms: 3, titulo: P('Define o que este usuário pode ver', 'Decides what this user may see'),
        detalhe: gere()
          ? P('Quem gere a base enxerga rascunhos e publicadas.', 'Whoever manages the base sees drafts and published pages.')
          : P('Quem não gere só enxerga páginas publicadas: o filtro de situação entra em toda consulta.', 'Whoever does not manage only sees published pages: the status filter goes into every query.'),
      });
      const pAudit = (action, area, recordId, old, novo) => ({
        tipo: 'sql', ms: 17, titulo: P('Grava a auditoria', 'Writes the audit log'),
        detalhe: P('Quem fez, o que fez e quando, com o antes e o depois em JSON.', 'Who did it, what was done and when, with before and after as JSON.'),
        requisicao: [
          t(P('Ação: ', 'Action: ')) + action,
          t(P('Usuário: ', 'User: ')) + eu().id + ' · ' + nomeU(eu().id),
          t(P('Registro: ', 'Record: ')) + t(AREAS[area]) + t(P(' nº ', ' no. ')) + recordId,
          t(P('Antes: ', 'Before: ')) + (old ? JSON.stringify(old) : vazioTxt()),
          t(P('Depois: ', 'After: ')) + (novo ? JSON.stringify(novo) : vazioTxt()),
        ].join('\n'),
        resposta: P('1 registro de auditoria gravado', '1 audit record written'),
      });
      const pTela = (linhas, detalhe) => ({ tipo: 'api', ms: 140, titulo: P('A tela recarrega os dados', 'The screen reloads the data'), detalhe, requisicao: linhas.join('\n'), resposta: '200 OK' });
      const rastro = (titulo, subtitulo, passos, resumo, feito) => ui.backend({ titulo, subtitulo, passos, resumo, aoConcluir: r => { if (feito) feito(r); } });
      const erro400 = msg => '400 Bad Request\n' + json({ message: t(msg) });

      /* ---------- rastros de leitura ---------- */
      function rastroOverview() {
        const ps = visiveis();
        const g = gere();
        const porTipo = {}; ORDEM_TIPOS.forEach(k => { porTipo[k] = ps.filter(p => p.tipo === k).length; });
        rastro(P('Carregar a visão geral', 'Load the overview'), nomeU(perfil().usuario) || t(P('Sem login', 'Not signed in')), [
          pAuth('GET', '/overview'), ...pAcesso(), ...pGere(false), pVisibilidade(),
          { tipo: 'sql', ms: 34, titulo: P('Lista os pilares com a contagem de páginas', 'Lists the pillars with their page counts'),
            detalhe: g ? P('Pilares ativos do projeto, na ordem definida, cada um com o total de páginas ativas.', 'Active pillars of the project, in the defined order, each with its total of active pages.') : P('Pilares ativos do projeto, na ordem definida, cada um com o total de páginas publicadas.', 'Active pillars of the project, in the defined order, each with its total of published pages.'),
            resposta: t(P('Pilares: ', 'Pillars: ')) + cats().length },
          { tipo: 'sql', ms: 27, titulo: P('Busca as 8 páginas atualizadas mais recentemente', 'Fetches the 8 most recently updated pages'),
            detalhe: g ? P('Páginas ativas do projeto, com o nome do dono, da mais recente para a mais antiga.', 'Active pages of the project, with the owner name, from newest to oldest.') : P('Páginas ativas e publicadas do projeto, com o nome do dono, da mais recente para a mais antiga.', 'Active published pages of the project, with the owner name, from newest to oldest.'),
            resposta: t(P('Páginas: ', 'Pages: ')) + Math.min(8, ps.length) },
          { tipo: 'sql', ms: 14, titulo: P('Busca as páginas fixadas no mural', 'Fetches the pages pinned to the board'), detalhe: P('Páginas ativas e fixadas, em ordem de título.', 'Active pinned pages, sorted by title.'), resposta: t(P('Páginas: ', 'Pages: ')) + ps.filter(p => p.pinned).length },
          { tipo: 'sql', ms: 41, titulo: P('Calcula os indicadores', 'Works out the indicators'), detalhe: P('Cinco contagens: total, publicadas, rascunhos, autores distintos e páginas por tipo.', 'Five counts: total, published, drafts, distinct authors and pages per type.') },
          { tipo: 'api', ms: 6, titulo: P('Devolve a visão geral', 'Returns the overview'), resposta: '200 OK\n' + json({ canManage: g, totalCategorias: cats().length, totalPaginas: ps.length, totalPublicadas: ps.filter(p => p.status === 'publicado').length, totalRascunhos: ps.filter(p => p.status === 'rascunho').length, contribuidores: new Set(ps.map(p => p.criadoPorId)).size, porTipo }) },
        ], temAcesso() ? P('Visão geral montada com o que este perfil pode ver.', 'Overview built with what this profile may see.') : P('Chamada recusada: a tela não recebe nenhum dado.', 'Call refused: the screen receives no data.'));
      }
      const qsLista = () => [est.catSel != null ? 'categoriaId=' + est.catSel : '', est.q ? 'q=' + encodeURIComponent(est.q) : ''].filter(Boolean).join('&');
      function rastroLista() {
        const linhas = listar(est.catSel, est.q);
        const qs = qsLista();
        const c = est.catSel != null ? cat(est.catSel) : null;
        const filtro = [t(P('projeto atual', 'current project')), t(P('páginas ativas', 'active pages')), !gere() && t(P('só publicadas', 'published only')),
          c && t(P('pilar "', 'pillar "')) + t(c.nome) + '"', est.q && t(P('termo "', 'term "')) + est.q + t(P('" no título, nas tags ou no conteúdo', '" in the title, the tags or the content'))].filter(Boolean).join(', ');
        rastro(est.q ? P('Buscar páginas', 'Search pages') : P('Listar páginas', 'List pages'), est.q ? '"' + est.q + '"' : (c ? t(c.nome) : t(P('Todas as páginas', 'All pages'))), [
          pAuth('GET', '/paginas' + (qs ? '?' + qs : '')), ...pAcesso(), ...pGere(false), pVisibilidade(),
          {
            tipo: 'sql', ms: est.q ? 96 : 33, titulo: est.q ? P('Procura o termo no título, nas tags e no conteúdo', 'Looks for the term in title, tags and content') : P('Lista as páginas do filtro', 'Lists the pages for the filter'),
            detalhe: est.q ? P('A busca procura o termo nos três campos, inclusive no texto completo em Markdown.', 'The search looks for the term in the three fields, including the full Markdown text.') : null,
            requisicao: t(P('Filtro: ', 'Filter: ')) + filtro + '\n' + t(P('Ordem: fixadas primeiro, depois as atualizadas mais recentemente', 'Order: pinned first, then the most recently updated')),
            resposta: t(P('Páginas: ', 'Pages: ')) + linhas.length,
          },
          { tipo: 'api', ms: 5, titulo: P('Devolve a lista', 'Returns the list'), resposta: '200 OK\n' + json(linhas.slice(0, 3).map(p => ({ id: p.id, titulo: t(p.titulo), slug: p.slug, tipo: p.tipo, status: p.status, pinned: p.pinned, donoNome: nomeU(p.donoId) }))) + (linhas.length > 3 ? '\n' + t(P('... e mais ', '... and ')) + (linhas.length - 3) + t(P(' páginas', ' more pages')) : '') },
        ], linhas.length ? P('Fixadas primeiro, depois as atualizadas mais recentemente.', 'Pinned first, then the most recently updated.') : P('Nenhuma página corresponde ao filtro.', 'No pages match the filter.'));
      }
      function rastroPagina(p) {
        const podeVer = p.status === 'publicado' || gere() || p.criadoPorId === eu().id;
        rastro(P('Abrir uma página', 'Open a page'), t(p.titulo), [
          pAuth('GET', '/paginas/' + p.id), ...pAcesso(), ...pGere(false),
          { tipo: 'sql', ms: 24, titulo: P('Busca a página com dono, autor e pilar', 'Fetches the page with owner, author and pillar'), detalhe: P('Uma leitura traz a página ativa do projeto com o nome do dono, do autor e do pilar.', 'One read brings the active page of the project with the names of its owner, author and pillar.'), resposta: P('1 página', '1 page') },
          { tipo: 'regra', ms: 3, estado: podeVer ? 'ok' : 'erro', titulo: P('Rascunho só abre para quem gere ou para o autor', 'A draft only opens for managers or for its author'), detalhe: p.status === 'publicado' ? P('A página está publicada: qualquer pessoa com acesso ao projeto pode ler.', 'The page is published: anyone with access to the project may read it.') : P('A página é um rascunho.', 'The page is a draft.'), resposta: podeVer ? null : '403 Forbidden' },
          { tipo: 'api', ms: 5, titulo: P('Devolve a página', 'Returns the page'), resposta: '200 OK\n' + json({ id: p.id, titulo: t(p.titulo), slug: p.slug, tipo: p.tipo, tags: t(p.tags) || null, status: p.status, pinned: p.pinned, categoriaNome: p.categoriaId != null && cat(p.categoriaId) ? t(cat(p.categoriaId).nome) : null, donoNome: nomeU(p.donoId), criadoPorNome: nomeU(p.criadoPorId), conteudoMd: '(' + t(p.conteudo).length + t(P(' caracteres de Markdown)', ' characters of Markdown)')) }) },
        ], P('O leitor monta os tópicos e o tempo de leitura a partir do Markdown recebido.', 'The reader builds the topics and the reading time from the Markdown it receives.'));
      }
      function servirAnexo(url) {
        const a = db.anexos[url];
        if (!a) return;
        const ext = extDe(url);
        rastro(P('Entregar um anexo', 'Serve an attachment'), t(a.nome) + ' · ' + tamanho(a.bytes), [
          { tipo: 'api', ms: 12, titulo: P('O navegador pede o arquivo', 'The browser requests the file'), requisicao: 'GET ' + url },
          { tipo: 'arquivo', ms: 38, titulo: P('Lê o arquivo da pasta de anexos do projeto', 'Reads the file from the project attachment folder'), detalhe: P('No disco o arquivo tem um nome aleatório; o nome original fica só no Markdown da página.', 'On disk the file has a random name; the original name lives only in the page Markdown.'), requisicao: t(P('<pasta de anexos>', '<attachment folder>')) + url.replace('/anexos', '') },
          { tipo: 'api', ms: 4, titulo: P('Entrega o arquivo', 'Delivers the file'), resposta: '200 OK · ' + tamanho(a.bytes) + '\nContent-Type: ' + (MIME[ext] || 'application/octet-stream') },
        ], P('Nesta demonstração o arquivo é fictício: a entrega é simulada.', 'In this demo the file is fictitious: the delivery is simulated.'));
      }

      /* ---------- Markdown: mesmo conjunto e mesmas classes do sistema real (.md-body), montado como nós (nunca HTML cru) ---------- */
      /* Desenho no lugar do arquivo fictício diagrama-portal.png, para a página de arquitetura ter a imagem que teria no sistema real. */
      function diagramaPortal() {
        const cx = (x, y, w, tit, sub) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="56" rx="8"/><text class="t" x="' + (x + w / 2) + '" y="' + (y + 24) + '">' + t(tit) + '</text><text class="s" x="' + (x + w / 2) + '" y="' + (y + 41) + '">' + t(sub) + '</text>';
        const seta = (d, x, y, g) => '<path class="l" d="' + d + '"/><path class="p" d="M0 0l-7 -4v8z" transform="translate(' + x + ' ' + y + ') rotate(' + g + ')"/>';
        return '<svg viewBox="0 0 660 236" focusable="false">' +
          cx(14, 30, 132, P('Proxy reverso', 'Reverse proxy'), P('entrada única por HTTPS', 'single HTTPS entry')) +
          cx(176, 30, 132, P('Interface web', 'Web interface'), P('telas dos módulos', 'module screens')) +
          cx(338, 30, 132, 'API', P('regras e permissões', 'rules and permissions')) +
          cx(500, 30, 146, P('Banco de dados', 'Database'), P('cadastros e histórico', 'records and history')) +
          cx(338, 150, 132, P('Serviço de tarefas', 'Task service'), P('rotinas agendadas', 'scheduled routines')) +
          seta('M146 58h30', 176, 58, 0) + seta('M308 58h30', 338, 58, 0) + seta('M470 58h30', 500, 58, 0) +
          seta('M404 150V86', 404, 86, -90) + seta('M470 178h103V86', 573, 86, -90) + '</svg>';
      }
      function imagemMd(alt, url) {
        const u = url.trim();
        const a = db.anexos[u];
        if (a && a.blobUrl) return h('img', { class: 'md-img', src: a.blobUrl, alt });
        const rotulo = alt || (a && t(a.nome)) || u;
        if (a && a.diagrama) return h('span', { class: 'md-img md-dg', role: 'img', tabindex: '0', 'aria-label': rotulo, html: diagramaPortal() });
        return h('span', { class: 'md-img md-ph', role: 'img', 'aria-label': rotulo }, ic('image', 22), h('b', null, rotulo),
          h('span', null, a ? t(P('Imagem de exemplo da demonstração: o arquivo é fictício · ', 'Demo sample image: the file is fictitious · ')) + tamanho(a.bytes) : P('Imagem externa: não é carregada nesta demonstração', 'External image: it is not loaded in this demo')));
      }
      function linkMd(txt, url) {
        const u = url.trim();
        const a = db.anexos[u];
        return h('button', {
          type: 'button', class: 'md-a', title: a ? P('Abrir o anexo: a demonstração mostra como o servidor entrega o arquivo', 'Open the attachment: the demo shows how the server delivers the file') : u,
          onclick: () => (a ? servirAnexo(u) : notaDemo(t(P('os links não saem do site (', 'links do not leave the site (')) + u + ').')),
        }, a && ic('clip', 12), inline(txt));
      }
      function inline(s) {
        const out = [];
        const re = /!\[([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
        let i = 0, m;
        while ((m = re.exec(s))) {
          if (m.index > i) out.push(s.slice(i, m.index));
          if (m[2] !== undefined) out.push(imagemMd(m[1], m[2]));
          else if (m[4] !== undefined) out.push(linkMd(m[3], m[4]));
          else if (m[5] !== undefined) out.push(h('code', null, m[5]));
          else if (m[6] !== undefined) out.push(h('strong', null, inline(m[6])));
          else out.push(h('em', null, inline(m[7])));
          i = re.lastIndex;
        }
        if (i < s.length) out.push(s.slice(i));
        return out;
      }
      function blocos(texto, corpo, heads) {
        const linhas = texto.split('\n');
        let lista = null, tagLista = '', para = [];
        const soltar = () => { if (para.length) corpo.append(h('p', null, inline(para.join(' ')))); para = []; };
        const fecharListas = () => { lista = null; tagLista = ''; };
        const abrirUl = tag => {
          if (lista && tagLista === tag) return;
          lista = h(tag);
          tagLista = tag;
          corpo.append(lista);
        };
        const celulas = s => s.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim());
        const ehSeparador = s => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(s);
        for (let i = 0; i < linhas.length; i++) {
          const linha = linhas[i].replace(/\s+$/, '');
          if (!linha.trim()) { soltar(); fecharListas(); continue; }
          if (linha.includes('|') && i + 1 < linhas.length && ehSeparador(linhas[i + 1])) {
            soltar(); fecharListas();
            const cab = celulas(linha);
            const regs = [];
            i += 2;
            while (i < linhas.length && linhas[i].trim() && linhas[i].includes('|')) { regs.push(celulas(linhas[i])); i++; }
            i--;
            /* a tabela larga rola dentro da própria moldura (o sistema real não tem a moldura) */
            corpo.append(h('div', { class: 'md-tw', tabindex: '0', role: 'region', 'aria-label': P('Tabela do conteúdo', 'Content table') },
              h('table', { class: 'md-table' },
                h('thead', null, h('tr', null, cab.map(c => h('th', { scope: 'col' }, inline(c))))),
                h('tbody', null, regs.map(r => h('tr', null, cab.map((_, ci) => h('td', null, inline(r[ci] || '')))))))));
            continue;
          }
          let m;
          if ((m = linha.match(/^@video\((.+)\)\s*$/))) {
            soltar(); fecharListas();
            const url = m[1].trim();
            const a = db.anexos[url];
            if (a && a.blobUrl) corpo.append(h('video', { class: 'md-video', controls: true, src: a.blobUrl }));
            else {
              /* arquivo fictício: a caixa do vídeo com o botão de reproduzir, que mostra como o servidor entrega o arquivo */
              const nome = a ? t(a.nome) : url;
              corpo.append(h('div', { class: 'md-video md-vd', role: 'group', 'aria-label': nome },
                h('button', {
                  type: 'button', class: 'pl', 'aria-label': t(P('Reproduzir ', 'Play ')) + nome,
                  title: P('Na demonstração a reprodução é simulada: o clique mostra como o servidor entrega o arquivo', 'Playback is simulated in the demo: the click shows how the server delivers the file'),
                  onclick: () => (a ? servirAnexo(url) : notaDemo(P('vídeo externo não é carregado.', 'external videos are not loaded.'))),
                }, h('span', { class: 'rd' }, ic('play', 22))),
                h('div', { class: 'bar' }, h('span', null, '0:00'), h('i'), h('span', { class: 'nm' }, nome + (a ? ' · ' + tamanho(a.bytes) : '') + t(P(' · reprodução simulada', ' · simulated playback'))))));
            }
            continue;
          }
          if ((m = linha.match(/^(#{1,6})\s+(.*)$/))) {
            soltar(); fecharListas();
            const nivel = m[1].length;
            /* a casca já usa h1 e a tela h2: o título do conteúdo desce um degrau na marcação e mantém o tamanho do sistema real */
            const hx = h(nivel <= 2 ? 'h3' : nivel === 3 ? 'h4' : 'h5', { class: 'mh mh' + nivel, tabindex: nivel <= 3 ? '-1' : null }, inline(m[2]));
            if (nivel <= 3) heads.push({ nivel, texto: m[2].trim(), el: hx });
            corpo.append(hx);
            continue;
          }
          if (/^(---|\*\*\*|___)\s*$/.test(linha)) { soltar(); fecharListas(); corpo.append(h('hr')); continue; }
          if ((m = linha.match(/^>\s?(.*)$/))) { soltar(); fecharListas(); corpo.append(h('blockquote', null, inline(m[1]))); continue; }
          if ((m = linha.match(/^[-*]\s+\[([ xX])\]\s+(.*)$/))) {
            soltar(); abrirUl('ul');
            const feito = m[1].toLowerCase() === 'x';
            lista.append(h('li', { class: 'md-task' }, h('span', { class: 'md-check' + (feito ? ' on' : '') }, feito && ic('check', 11)),
              h('span', null, h('span', { class: 'vh' }, feito ? P('Feito: ', 'Done: ') : P('A fazer: ', 'To do: ')), inline(m[2]))));
            continue;
          }
          if ((m = linha.match(/^[-*]\s+(.*)$/))) { soltar(); abrirUl('ul'); lista.append(h('li', null, inline(m[1]))); continue; }
          if ((m = linha.match(/^\d+\.\s+(.*)$/))) { soltar(); abrirUl('ol'); lista.append(h('li', null, inline(m[1]))); continue; }
          fecharListas();
          para.push(linha);
        }
        soltar();
      }
      function renderMd(src) {
        const corpo = h('div', { class: 'md-body' });
        const heads = [];
        if (!src || !String(src).trim()) { corpo.append(h('p', { class: 'md-empty' }, P('Sem conteúdo ainda.', 'No content yet.'))); return { corpo, heads }; }
        String(src).replace(/\r\n/g, '\n').split('```').forEach((parte, idx) => {
          if (idx % 2 === 1) corpo.append(h('pre', { class: 'md-pre', tabindex: '0', role: 'group', 'aria-label': P('Bloco de código', 'Code block') }, h('code', null, parte.replace(/^[a-zA-Z0-9_-]*\n/, '').replace(/\n$/, ''))));
          else blocos(parte, corpo, heads);
        });
        return { corpo, heads };
      }

      /* ---------- navegação (as mesmas quatro visões do sistema real) ---------- */
      const raiz = h('div', { class: 'bc-real b-raiz' });
      el.append(raiz);

      function abrirLista(categoriaId) {
        est.catSel = categoriaId;
        est.q = est.busca.trim();
        est.view = 'lista';
        focarTitulo = true;
        pintar();
      }
      function abrirPagina(id) {
        const p = pagina(id);
        if (!p || !p.ativo) { flash(P('Erro 404', 'Error 404'), false); return; }
        if (p.status !== 'publicado' && !gere() && p.criadoPorId !== eu().id) { flash(P('Erro 403', 'Error 403'), false); return; }
        est.atualId = id;
        est.view = 'leitor';
        focarTitulo = true;
        pintar();
      }
      function irVisaoGeral() { est.view = 'overview'; focarTitulo = true; pintar(); }
      function novaPagina() {
        est.form = { id: null, titulo: '', categoriaId: est.catSel, tipo: 'livre', tags: '', conteudo: '', status: 'rascunho', pinned: false };
        est.view = 'editor';
        focarTitulo = true;
        pintar();
      }
      function editarPagina(p) {
        est.form = { id: p.id, titulo: t(p.titulo), categoriaId: p.categoriaId, tipo: p.tipo, tags: t(p.tags) || '', conteudo: t(p.conteudo), status: p.status, pinned: p.pinned };
        est.view = 'editor';
        focarTitulo = true;
        pintar();
      }
      function sairDoEditor() { const f = est.form; if (f && f.id) abrirPagina(f.id); else abrirLista(est.catSel); }
      function trocarPerfil(v) {
        est.perfil = v;
        est.form = null;
        const p = pagina(est.atualId);
        if (est.view === 'editor' || (est.view === 'leitor' && (!p || !p.ativo || (p.status !== 'publicado' && !gere())))) est.view = 'overview';
        pintar('perfil');
        if (!temAcesso()) flash(logado() ? P('Erro 403', 'Error 403') : P('Erro 401', 'Error 401'), false);
        else notaDemo(t(P('perfil trocado. ', 'profile switched. ')) + t(perfil().papel) + '.');
      }

      /* ---------- pintura: faixa da demonstração, trilha (fora da visão geral) e área principal ---------- */
      function pintar(foco) {
        const n = ++pintura;
        relogioEl = dataEl = null;
        if (est.view === 'leitor') { const p = pagina(est.atualId); if (!p || !p.ativo) est.view = 'lista'; }
        const area = h('div', { class: 'b-area' });
        raiz.replaceChildren(faixaDemo(), h('div', { class: 'ph-pagina b-pag' }, h('div', { class: 'b-corpo' }, temAcesso() && est.view !== 'overview' && trilha(), area)));
        if (temAcesso()) {
          const montarArea = () => {
            if (est.view !== 'overview') area.append(barraTopo());
            const alvoFoco = (est.view === 'overview' ? pintarOverview : est.view === 'lista' ? pintarListaView : est.view === 'leitor' ? pintarLeitor : pintarEditor)(area);
            if (focarTitulo && alvoFoco && alvoFoco.focus) alvoFoco.focus({ preventScroll: true });
            focarTitulo = false;
          };
          if (est.pronto) montarArea();
          else {
            /* primeira carga: o mesmo "Carregando…" do sistema real */
            est.pronto = true;
            area.append(h('div', { class: 'b-carg', role: 'status' }, P('Carregando…', 'Loading…')));
            api.depois(() => { if (!vivo || n !== pintura) return; area.replaceChildren(); montarArea(); }, 350);
          }
        }
        if (foco) { const alvo = raiz.querySelector('[data-f="' + foco + '"]'); if (alvo) alvo.focus(); }
      }

      /* O que só existe na demonstração: perfil simulado, rastro da leitura desta tela, entrega dos anexos e auditoria. */
      function chamada() {
        if (!temAcesso() || est.view === 'overview') return { rota: 'GET ' + ROTA + '/overview', abrir: rastroOverview };
        if (est.view === 'lista') { const qs = qsLista(); return { rota: 'GET ' + ROTA + '/paginas' + (qs ? '?' + qs : ''), abrir: rastroLista }; }
        if (est.view === 'leitor') { const p = pagina(est.atualId); return { rota: 'GET ' + ROTA + '/paginas/' + p.id + '  ·  slug: ' + p.slug, abrir: () => rastroPagina(p) }; }
        return null;
      }
      function faixaDemo() {
        const pf = perfil(), ch = chamada(), acesso = temAcesso();
        const tag = () => h('span', { class: 'tag' }, P('Ajuda da demonstração', 'Demo aid'));
        const dbtn = (texto, aoClicar, icn, titulo) => btn(texto, aoClicar, 'secundario', { ic: icn, tam: 'p', titulo });
        const anexos = acesso && est.view === 'leitor' ? Object.keys(db.anexos).filter(u => t(pagina(est.atualId).conteudo).includes(u)) : [];
        const selPerfil = ui.select({
          rotulo: P('Simular acesso como', 'Simulate access as'), valor: est.perfil, aoMudar: trocarPerfil,
          opcoes: PERFIS.map(p => ({ valor: p.id, texto: (p.usuario ? nomeU(p.usuario) + ' · ' : '') + t(p.rotulo) })),
        });
        selPerfil.input.setAttribute('data-f', 'perfil');
        selPerfil.input.setAttribute('title', t(P('No sistema real o perfil vem do login único do portal', 'In the real system the profile comes from the portal single sign-on')));
        return h('details', { class: 'b-demo', open: est.demoAberto !== false, ontoggle: ev => { est.demoAberto = !!ev.target.open; } },
          h('summary', null, ic('sliders', 12), h('span', null, P('Controles da demonstração', 'Demo controls')), e('span', 'nota', P('não fazem parte do sistema real', 'not part of the real system')), ic('chevd', 12)),
          /* um selo só para a faixa inteira: tudo nela é ajuda da demonstração */
          h('div', { class: 'corpo' }, tag(),
            h('div', { class: 'g' }, selPerfil, ui.badge(pf.papel, pf.tom)),
            !acesso && h('div', { class: 'g' }, h('span', null, logado()
              ? P('Este usuário não é do departamento dono do projeto nem foi vinculado a ele: o servidor responde 403 e, no sistema real, a tela fica vazia, só com o aviso de erro.', 'This user is not in the department that owns the project and was not linked to it: the server answers 403 and, in the real system, the screen stays empty, with only the error notice.')
              : P('Sem sessão válida o servidor responde 401 a toda chamada e, no sistema real, a tela fica vazia, só com o aviso de erro.', 'With no valid session the server answers 401 to every call and, in the real system, the screen stays empty, with only the error notice.'))),
            ch && h('div', { class: 'g' }, !api.publico && h('span', { class: 'rota' }, ch.rota), dbtn(acesso ? P('O que o servidor fez', 'What the server did') : P('O que o servidor respondeu', 'What the server answered'), ch.abrir, 'server', P('O rastro da chamada que carregou esta tela', 'The trace of the call that loaded this screen'))),
            acesso && est.view === 'editor' && h('div', { class: 'g' }, h('span', null, P('Nesta tela, Salvar e os botões de anexo abrem o rastro do servidor.', 'On this screen, Save and the attachment buttons open the server trace.'))),
            anexos.length > 0 && h('div', { class: 'g' }, h('span', null, P('Como o servidor entrega os anexos desta página:', 'How the server delivers the attachments on this page:')), anexos.map(u => dbtn(db.anexos[u].nome, () => servirAnexo(u), 'file'))),
            acesso && h('div', { class: 'g' }, dbtn(P('Auditoria', 'Audit log'), abrirAuditoria, 'history', P('O que o servidor registrou em cada ação', 'What the server recorded for each action')))));
      }

      /* Trilha de pilares: só fora da visão geral, como no sistema real. Fica num cartão do kit, sem repetir o nome do sistema
         (o nome está na moldura); o item ativo usa as cores de seleção do menu do hub. */
      function trilha() {
        const nav = (ativo, aoClicar, ...filhos) => h('button', { type: 'button', class: 'b-nav' + (ativo ? ' on' : ''), 'aria-current': ativo ? 'true' : null, onclick: aoClicar }, filhos);
        return h('aside', { class: 'b-trilha', 'aria-label': P('Navegação da base', 'Base navigation') }, ui.cartao({
          conteudo: [
            nav(est.catSel === null, () => abrirLista(null), ic('eye', 14), P('Todas as páginas', 'All pages')),
            nav(false, irVisaoGeral, ic('folder', 14), P('Visão geral', 'Overview')),
            h('div', { class: 'rot' }, P('Pilares', 'Pillars'), gere() && mini('plus', P('Nova categoria', 'New category'), () => abrirCategoria(null))),
            h('div', { class: 'b-cats' }, cats().map(c => h('div', { class: 'b-catrow' },
              nav(est.catSel === c.id, () => abrirLista(c.id), h('span', { class: 'ci', style: { '--c': corPilar(c.cor) } }, ic(ICONES_CAT[c.icone] || 'folder', 15)), h('span', { class: 'nm' }, c.nome), h('span', { class: 'n' }, String(nPorCat(c.id)))),
              gere() && mini('pencil', t(P('Editar ', 'Edit ')) + t(c.nome), () => abrirCategoria(c)),
              gere() && mini('trash', t(P('Excluir ', 'Delete ')) + t(c.nome), () => excluirCategoria(c))))),
          ],
        }));
      }

      /* selos do kit: situação (publicado = ok, rascunho = alerta) e tipo, com o ícone do tipo e a cor do bloco em --tom */
      const stBadge = p => (p.status === 'publicado' ? ui.badge(P('Publicado', 'Published'), 'ok') : ui.badge(P('Rascunho', 'Draft'), 'alerta'));
      const tpBadge = p => {
        const b = ui.badge(TIPOS[p.tipo].rotulo, 'neutro');
        b.style.setProperty('--tom', TOKEN[TIPOS[p.tipo].cor]);
        b.firstElementChild.replaceWith(ic(TIPOS[p.tipo].icone, 12));
        return b;
      };

      /* Barra superior: busca e nova página (oculta na visão geral, que tem a própria). */
      function barraTopo() {
        const busca = ui.busca({ valor: est.busca, placeholder: P('Buscar por título, tag ou conteúdo…', 'Search by title, tag or content…'), rotulo: P('Buscar por título, tag ou conteúdo', 'Search by title, tag or content'), aoDigitar: v => { est.busca = v; } });
        busca.classList.add('b-busca');
        busca.input.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); abrirLista(est.catSel); } });
        return h('div', { class: 'b-topo' }, busca,
          btn(P('Buscar', 'Search'), () => abrirLista(est.catSel)),
          btn(P('Nova página', 'New page'), novaPagina, 'primario', { ic: 'plus' }));
      }

      /* ---------- VISÃO GERAL (central de comando) ---------- */
      function tique() {
        if (!vivo) return;
        tiqueAgora();
        api.depois(tique, 1000 - (Date.now() % 1000) + 20); // vira junto com o relógio do cabeçalho do hub
      }
      function tiqueAgora() {
        const agora = new Date();
        const dois = v => String(v).padStart(2, '0');
        if (relogioEl) relogioEl.textContent = dois(agora.getHours()) + ':' + dois(agora.getMinutes()) + ':' + dois(agora.getSeconds());
        if (dataEl) {
          const mes = t(MESES)[agora.getMonth()];
          dataEl.textContent = api.lang === 'en' ? mes + ' ' + agora.getDate() + ', ' + agora.getFullYear() : agora.getDate() + ' de ' + mes + '. ' + agora.getFullYear();
        }
      }

      function pintarOverview(alvo) {
        const ps = visiveis();
        const cs = cats();
        const publicadas = ps.filter(p => p.status === 'publicado').length;
        const rascunhos = ps.filter(p => p.status === 'rascunho').length;
        const contribuidores = new Set(ps.map(p => p.criadoPorId).filter(Boolean)).size;
        const porTipo = {}; ORDEM_TIPOS.forEach(k => { porTipo[k] = ps.filter(p => p.tipo === k).length; });
        const totalTipos = Math.max(1, ORDEM_TIPOS.reduce((s, k) => s + porTipo[k], 0));
        const fixados = ps.filter(p => p.pinned).sort((a, b) => t(a.titulo).localeCompare(t(b.titulo)));
        const recentes = ps.slice().sort((a, b) => atualizado(b) - atualizado(a)).slice(0, 8).filter(p => !p.pinned);
        const feed = fixados.concat(recentes).slice(0, 10);

        relogioEl = h('div', { class: 'h', 'aria-hidden': 'true' }, '--:--:--');
        dataEl = e('div', 'd');
        /* título da tela no padrão do hub (ph-h1); o nome do sistema fica na moldura */
        const titulo = h('h2', { class: 'ph-h1 cc-title', tabindex: '-1' }, 'CoreEngine');
        /* a busca da central começa vazia e vale para toda a base, como no sistema real */
        let termo = '';
        const buscar = () => { est.busca = termo; abrirLista(null); };
        const busca = ui.busca({ placeholder: P('Buscar em toda a base: título, tag ou conteúdo…   (Enter)', 'Search the whole base: title, tag or content…   (Enter)'), rotulo: P('Buscar em toda a base', 'Search the whole base'), aoDigitar: v => { termo = v; } });
        busca.input.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); buscar(); } });
        /* indicadores do kit, cada bloco com a sua cor de destaque (--tom ligado a um token) */
        const KPIS = [['folder', P('Pilares', 'Pillars'), cs.length, 'azul'], ['fileText', P('Páginas', 'Pages'), ps.length, 'violeta'], ['eye', P('Publicadas', 'Published'), publicadas, 'verde'], ['fileCode', P('Rascunhos', 'Drafts'), rascunhos, 'ambar'], ['users', P('Contribuidores', 'Contributors'), contribuidores, 'rosa']];
        const kpis = ui.kpis(KPIS.map(([icn, rotulo, valor]) => ({ icone: IC[icn], rotulo, valor })));
        kpis.classList.add('cc-kpis');
        [...kpis.children].forEach((k, i) => { k.classList.add('cc-kpi'); k.style.setProperty('--tom', TOKEN[KPIS[i][3]]); });
        const painel = (rotulo, ...filhos) => ui.cartao({ titulo: rotulo, classe: 'cc-panel', conteudo: h('div', { class: 'ph-pilha' }, filhos) });

        const painelTipos = painel(P('Distribuição por tipo', 'Distribution by type'),
          h('div', { class: 'cc-tipos', role: 'img', 'aria-label': ORDEM_TIPOS.map(k => t(TIPOS[k].rotulo) + ': ' + porTipo[k]).join(', ') },
            ORDEM_TIPOS.map(k => h('i', { class: 'k-' + TIPOS[k].cor, title: t(TIPOS[k].rotulo) + ': ' + porTipo[k], style: 'width:' + (porTipo[k] / totalTipos * 100).toFixed(2) + '%' }))),
          h('div', { class: 'cc-leg' }, ORDEM_TIPOS.map(k => h('div', { class: 'it k-' + TIPOS[k].cor }, e('span', 'q'), ic(TIPOS[k].icone, 13), h('span', null, TIPOS[k].rotulo), h('strong', null, String(porTipo[k]))))));

        const painelPilares = painel(P('Pilares do conhecimento', 'Knowledge pillars'),
          h('div', { class: 'cc-pilares' }, cs.map(c => ui.cartao({
            classe: 'cc-pcard',
            conteudo: h('button', { type: 'button', class: 'cc-pilar', style: { '--c': corPilar(c.cor) }, onclick: () => abrirLista(c.id) },
              e('span', 'fio'),
              h('span', { class: 'ln' }, h('span', { class: 'q' }, ic(ICONES_CAT[c.icone] || 'folder', 17)), h('span', { class: 'nm' }, c.nome)),
              c.descricao && h('span', { class: 'ds' }, c.descricao),
              h('span', { class: 'qt' }, nPorCat(c.id) + t(P(' página(s)', ' page(s)')), ic('right', 11))),
          }))));

        const painelMural = painel(P('Mural & atualizações', 'Board & updates'), feed.length
          ? h('div', { class: 'cc-feed' }, feed.map(p => h('button', { type: 'button', class: 'k-' + TIPOS[p.tipo].cor, onclick: () => abrirPagina(p.id) },
            h('span', { class: 'i' }, ic(p.pinned ? 'pin' : TIPOS[p.tipo].icone, 15), p.pinned && h('span', { class: 'vh' }, P('Fixada: ', 'Pinned: '))),
            h('span', { class: 'tx' }, h('span', { class: 't' }, p.titulo),
              /* as fixadas chegam do servidor sem data e sem dono, como no sistema real */
              h('span', { class: 'm' }, stBadge(p), h('span', { class: 'dt' }, p.pinned ? '' : fmt.data(atualizado(p)) + (p.donoId ? ' · ' + nomeU(p.donoId) : '')))))))
          : e('p', 'cc-vz', P('Nada por aqui ainda. Publique a primeira página!', 'Nothing here yet. Publish the first page!')));

        alvo.append(h('div', { class: 'cc-root' },
          h('div', { class: 'cc-in' },
            h('div', { class: 'cc-hero' },
              h('div', { class: 'esq' },
                ui.badge(P('Motor Central · Online', 'Central Engine · Online'), 'ok'),
                titulo,
                e('p', 'cc-sub', P('Base de conhecimento, operação e inteligência de TI: tudo num só lugar.', 'Knowledge base, operations and IT intelligence: all in one place.'))),
              h('div', { class: 'cc-rel' }, relogioEl, dataEl)),
            h('div', { class: 'cc-busca' }, busca,
              btn(P('Buscar', 'Search'), buscar),
              btn(P('Nova página', 'New page'), novaPagina, 'primario', { ic: 'plus' })),
            kpis,
            h('div', { class: 'cc-cols' },
              h('div', { class: 'cc-col' }, painelTipos, painelPilares),
              h('div', { class: 'cc-col' }, painelMural, painelLinks())),
            e('p', 'cc-pe', 'CoreEngine · ProjectHub · ' + t(P('Empresa Demo', 'Demo Company')) + ' · ' + ps.length + t(P(' páginas em ', ' pages in ')) + cs.length + t(P(' pilares', ' pillars'))))));
        tiqueAgora();
        return titulo;
      }

      /* Links rápidos: no sistema real ficam guardados no navegador de cada pessoa; aqui, só na memória da visita, e o clique não sai do site. */
      function painelLinks() {
        const corpo = h('div');
        const normalizar = u => (u && !/^https?:\/\//i.test(u) ? 'https://' + u : u);
        function pintarLinks(focar) {
          const grade = h('div', { class: 'cc-links' }, db.links.map((l, i) => {
            const temUrl = !!l.url;
            return h('div', { class: 'cc-link k-' + CORES[i % CORES.length][0] },
              h('button', {
                type: 'button', class: 'cx' + (temUrl ? '' : ' sem'), title: temUrl ? normalizar(l.url) : P('Sem URL: remova e adicione com o endereço', 'No URL: remove it and add it again with the address'),
                onclick: () => notaDemo(temUrl ? t(P('o clique não sai do site (', 'the click does not leave the site (')) + normalizar(l.url) + ').' : P('este link ainda não tem endereço. Remova e adicione com o endereço.', 'this link has no address yet. Remove it and add it again with the address.')),
              },
              h('span', { class: 'lt', 'aria-hidden': 'true' }, t(l.label).charAt(0).toUpperCase()), h('span', { class: 'nm' }, l.label),
              temUrl ? h('span', { class: 'sg' }, ic('upRight', 12)) : h('span', { class: 'pt', 'aria-hidden': 'true' })),
              mini('x', t(P('Remover ', 'Remove ')) + t(l.label), () => { db.links.splice(i, 1); pintarLinks(true); }));
          }));
          if (!est.addLink) {
            const add = btn(P('Adicionar link', 'Add link'), () => { est.addLink = true; pintarLinks(true); }, 'secundario', { ic: 'plus', tam: 'p', classe: 'cc-addbtn' });
            corpo.replaceChildren(grade, add);
            if (focar) add.focus();
            return;
          }
          /* campos do kit; o rótulo fica para o leitor de tela, como no formulário compacto do sistema real */
          const campo = (rotulo, placeholder, classe) => { const c = ui.campo({ rotulo, placeholder }); c.querySelector('.ph-campo-rotulo').classList.add('vh'); if (classe) c.classList.add(classe); return c; };
          const cNome = campo(P('Nome do link', 'Link name'), P('Nome', 'Name'));
          const cUrl = campo(P('Endereço do link', 'Link address'), 'https://…', 'u');
          const nome = cNome.input, url = cUrl.input;
          const ok = () => {
            if (!nome.value.trim()) { nome.focus(); return; }
            db.links.push({ label: nome.value.trim(), url: url.value.trim() });
            est.addLink = false;
            pintarLinks(true);
          };
          url.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); ok(); } });
          corpo.replaceChildren(grade, h('div', { class: 'cc-add' }, cNome, cUrl, btn('OK', ok, 'primario', { tam: 'p' }), btn(P('Cancelar', 'Cancel'), () => { est.addLink = false; pintarLinks(true); }, 'secundario', { tam: 'p' })));
          if (focar) nome.focus();
        }
        pintarLinks(false);
        return ui.cartao({ titulo: P('Links rápidos de TI', 'IT quick links'), classe: 'cc-panel', conteudo: corpo });
      }

      /* ---------- LISTA ---------- */
      function pintarListaView(alvo) {
        const lista = listar(est.catSel, est.q);
        const c = est.catSel != null ? cat(est.catSel) : null;
        const titulo = h('h2', { class: 'ph-h1', tabindex: '-1' }, h('span', null, est.catSel == null ? P('Todas as páginas', 'All pages') : (c ? c.nome : P('Páginas', 'Pages'))),
          h('span', { class: 'ph-tag b-cont', 'aria-label': t(P('Páginas na lista: ', 'Pages listed: ')) + lista.length }, String(lista.length)));
        alvo.append(
          h('div', { class: 'b-lcab' }, titulo),
          lista.length
            ? h('div', { class: 'b-grid' }, lista.map(p => ui.cartao({
              classe: 'bc-cartao',
              conteudo: h('button', { type: 'button', class: 'bc-card', onclick: () => abrirPagina(p.id) },
                h('span', { class: 'sl' }, tpBadge(p), stBadge(p), p.pinned && h('span', { class: 'pin' }, ic('pin', 12), h('span', { class: 'vh' }, P('fixada', 'pinned')))),
                h('span', { class: 't' }, p.titulo),
                h('span', { class: 'm' }, (p.donoId ? nomeU(p.donoId) + ' · ' : '') + fmt.data(atualizado(p)))),
            })))
            : ui.vazio({ icone: 'busca', titulo: P('Nenhuma página encontrada.', 'No pages found.') }));
        return titulo;
      }

      /* ---------- LEITOR (cartão do kit; o conteúdo usa a tipografia de leitura do bloco .md-body) ---------- */
      function pintarLeitor(alvo) {
        const p = pagina(est.atualId);
        const texto = t(p.conteudo);
        const { corpo, heads } = renderMd(texto);
        const n = palavras(texto);
        const c = p.categoriaId != null ? cat(p.categoriaId) : null;
        const titulo = h('h2', { class: 'ph-h1 tit', tabindex: '-1' }, p.titulo);
        const tags = (t(p.tags) || '').split(',').map(s => s.trim()).filter(Boolean);
        const podeEditar = gere() || p.status === 'rascunho';
        alvo.append(ui.cartao({
          classe: 'b-leitor',
          conteudo: h('article', null,
            h('div', { class: 'volta' }, btn(P('Voltar', 'Back'), () => abrirLista(p.categoriaId), 'fantasma', { ic: 'back', tam: 'p' })),
            h('div', { class: 'b-selos' }, tpBadge(p), stBadge(p),
              p.pinned && h('span', { class: 'fx' }, ic('pin', 11), P('fixada', 'pinned')),
              c && h('span', { class: 'mt' }, '· ', c.nome),
              h('span', { class: 'mt' }, '·', ic('timer', 11), Math.max(1, Math.round(n / 200)) + ' min · ' + n + t(P(' palavras', ' words')))),
            titulo,
            h('p', { class: 'aut' },
              (p.donoId ? t(P('Dono: ', 'Owner: ')) + nomeU(p.donoId) + ' · ' : '') + (p.criadoPorId ? t(P('Criado por ', 'Created by ')) + nomeU(p.criadoPorId) : '') +
              (p.atualizadoEm ? ' · ' + t(P('Atualizado em ', 'Updated on ')) + p.atualizadoEm.toLocaleString(api.lang === 'en' ? 'en-US' : 'pt-BR') : '')),
            tags.length > 0 && h('div', { class: 'ph-tags b-tags' }, tags.map(tg => h('span', { class: 'ph-tag' }, '#' + tg))),
            e('hr', 'b-hr'),
            heads.length >= 2 && h('nav', { class: 'b-topicos', 'aria-label': P('Tópicos', 'Topics') },
              h('p', null, P('Tópicos', 'Topics')),
              heads.map(tp => h('button', {
                type: 'button', class: 'n' + tp.nivel,
                onclick: () => { if (tp.el.scrollIntoView) tp.el.scrollIntoView({ behavior: 'smooth', block: 'start' }); tp.el.focus({ preventScroll: true }); },
              }, tp.texto.replace(/[*`]/g, '')))),
            corpo,
            podeEditar && h('div', { class: 'b-acoes' },
              btn(P('Editar', 'Edit'), () => editarPagina(p), 'secundario', { ic: 'pencil' }),
              gere() && btn(P('Excluir', 'Delete'), () => excluirPagina(p), 'perigo', { ic: 'trash' }))),
        }));
        return titulo;
      }

      /* ---------- EDITOR ---------- */
      function pintarEditor(alvo) {
        const f = est.form || (est.form = { id: null, titulo: '', categoriaId: est.catSel, tipo: 'livre', tags: '', conteudo: '', status: 'rascunho', pinned: false });
        /* campos do kit (rótulo, erro no campo e foco); a ordem dos campos é a do sistema real */
        const cTitulo = ui.campo({ rotulo: P('Título', 'Title'), obrigatorio: true, valor: f.titulo, placeholder: P('Ex.: Arquitetura do ERP', 'E.g. ERP architecture'), aoMudar: v => { f.titulo = v; } });
        const cCat = ui.select({ rotulo: P('Categoria (pilar)', 'Category (pillar)'), valor: f.categoriaId == null ? '' : String(f.categoriaId), opcoes: [{ valor: '', texto: P('Sem categoria', 'No category') }].concat(cats().map(c => ({ valor: String(c.id), texto: c.nome }))), aoMudar: v => { f.categoriaId = v ? Number(v) : null; } });
        const cTipo = ui.select({ rotulo: P('Tipo', 'Type'), valor: f.tipo, opcoes: Object.keys(TIPOS).map(k => ({ valor: k, texto: TIPOS[k].rotulo })), aoMudar: v => { f.tipo = v; pintarModelo(); } });
        const cTags = ui.campo({ rotulo: P('Tags (separadas por vírgula)', 'Tags (comma separated)'), valor: f.tags, placeholder: P('erp, integração, backup', 'erp, integration, backup'), aoMudar: v => { f.tags = v; } });
        const cMd = ui.campo({
          tipo: 'area', linhas: 14, rotulo: P('Conteúdo (Markdown)', 'Content (Markdown)'), valor: f.conteudo,
          placeholder: P('# Título\n\nEscreva em markdown…  Arraste arquivos aqui, ou use a barra acima para anexar imagem/vídeo/documento.', '# Title\n\nWrite in markdown…  Drag files here, or use the bar above to attach an image/video/document.'),
          aoMudar: v => { f.conteudo = v; atualizarPrevia(); },
        });
        const ta = cMd.input;
        ta.classList.add('b-ta');
        ta.setAttribute('spellcheck', 'false');

        /* pré-visualização: só aparece quando há conteúdo, como no sistema real */
        const caixaPrevia = h('div');
        const detalhes = h('details', { class: 'b-prev', hidden: f.conteudo.trim() ? null : true, ontoggle: () => atualizarPrevia() }, h('summary', null, P('Pré-visualizar', 'Preview')), caixaPrevia);
        function atualizarPrevia() {
          detalhes.hidden = !f.conteudo.trim();
          if (detalhes.open) caixaPrevia.replaceChildren(renderMd(f.conteudo).corpo);
        }
        function definir(v) { f.conteudo = v; ta.value = v; atualizarPrevia(); }
        const cursor = () => (typeof ta.selectionStart === 'number' ? [ta.selectionStart, ta.selectionEnd] : [f.conteudo.length, f.conteudo.length]);
        function aplicarMd(antes, depois, marcador) {
          const cur = f.conteudo;
          const [s, fim] = cursor();
          const sel = cur.slice(s, fim) || t(marcador);
          definir(cur.slice(0, s) + antes + sel + depois + cur.slice(fim));
          ta.focus();
          const pos = s + antes.length + sel.length + depois.length;
          if (ta.setSelectionRange) ta.setSelectionRange(pos, pos);
        }
        function inserirMd(texto) {
          const cur = f.conteudo;
          const [s] = cursor();
          const cola = s > 0 && cur[s - 1] !== '\n' ? '\n' : '';
          definir(cur.slice(0, s) + cola + texto + '\n' + cur.slice(s));
          ta.focus();
        }

        const caixaModelo = h('span');
        function pintarModelo() {
          caixaModelo.replaceChildren();
          if (!MODELOS[f.tipo]) return;
          caixaModelo.append(btn(api.lang === 'en' ? 'Insert ' + f.tipo.replace('arquitetura', 'architecture') + ' template' : 'Inserir template ' + f.tipo, () => {
            const aplicar = () => { definir(t(MODELOS[f.tipo])); ta.focus(); };
            if (!f.conteudo.trim()) aplicar();
            else confirmar(P('Inserir template', 'Insert template'), P('Substituir o conteúdo atual pelo template?', 'Replace the current content with the template?'), null, P('Substituir', 'Replace'), 'primario', aplicar);
          }, 'secundario', { tam: 'p' }));
        }
        pintarModelo();

        /* barra de ferramentas: botões fantasma do kit; os símbolos do sistema real viraram ícones de traço */
        const tb = (rotulo, aoClicar, o = {}) => btn(rotulo, aoClicar, 'fantasma', { ic: o.ic, tam: 'p', titulo: o.titulo, classe: o.classe });
        const barra = h('div', { class: 'b-tb', role: 'toolbar', 'aria-label': P('Formatação e anexos', 'Formatting and attachments') },
          tb('H2', () => aplicarMd('## ', '', P('Título da seção', 'Section title')), { titulo: P('Título de seção', 'Section heading') }),
          tb('H3', () => aplicarMd('### ', '', P('Subtítulo', 'Subheading')), { titulo: P('Subtítulo', 'Subheading') }),
          tb('B', () => aplicarMd('**', '**', P('negrito', 'bold')), { classe: 'bd', titulo: P('Negrito', 'Bold') }),
          tb('I', () => aplicarMd('*', '*', P('itálico', 'italic')), { classe: 'it', titulo: P('Itálico', 'Italic') }),
          tb('</>', () => aplicarMd('`', '`', P('código', 'code')), { titulo: P('Código', 'Code') }),
          tb(P('Lista', 'List'), () => aplicarMd('- ', '', P('item', 'item')), { ic: 'list' }),
          tb('1. Num.', () => aplicarMd('1. ', '', P('item', 'item')), { titulo: P('Lista numerada', 'Numbered list') }),
          tb(P('Citação', 'Quote'), () => aplicarMd('> ', '', P('citação', 'quote')), { ic: 'quote' }),
          tb('Link', () => aplicarMd('[', '](https://)', P('texto', 'text')), { ic: 'link' }),
          tb(P('Tabela', 'Table'), () => inserirMd(t(P('| Coluna A | Coluna B |\n| --- | --- |\n| valor | valor |', '| Column A | Column B |\n| --- | --- |\n| value | value |'))), { ic: 'table' }),
          tb('Checklist', () => aplicarMd('- [ ] ', '', P('tarefa', 'task')), { ic: 'checkSq' }),
          h('span', { class: 'sep', 'aria-hidden': 'true' }),
          tb(P('Imagem', 'Image'), () => escolherAnexo('image', inserirMd), { ic: 'image' }),
          tb(P('Vídeo', 'Video'), () => escolherAnexo('video', inserirMd), { ic: 'video' }),
          tb(P('Documento', 'Document'), () => escolherAnexo('doc', inserirMd), { ic: 'clip' }));
        /* o rótulo do conteúdo divide a linha com o botão do modelo; a barra fica colada no campo, como no sistema real */
        const [rotMd, ...restoMd] = cMd.children; // rótulo, campo e a mensagem de erro do kit
        cMd.replaceChildren(h('div', { class: 'b-clab' }, rotMd, caixaModelo), barra, ...restoMd);

        ta.addEventListener('dragover', ev => { ev.preventDefault(); ta.classList.add('arr'); });
        ta.addEventListener('dragleave', () => { ta.classList.remove('arr'); });
        ta.addEventListener('drop', ev => {
          ev.preventDefault();
          ta.classList.remove('arr');
          const arq = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
          if (arq) arquivoReal(arq, inserirMd);
        });

        const fechar = mini('x', P('Fechar o editor', 'Close the editor'), sairDoEditor);
        const cartao = ui.cartao({
          titulo: f.id ? P('Editar página', 'Edit page') : P('Nova página', 'New page'), acoes: fechar, classe: 'b-editor',
          conteudo: [
            h('div', { class: 'b-form' }, h('div', { class: 'lg' }, cTitulo), cCat, cTipo, h('div', { class: 'lg' }, cTags)),
            cMd,
            detalhes,
            h('div', { class: 'b-epe' },
              gere() && ui.marcar({ rotulo: P('Publicar', 'Publish'), marcado: f.status === 'publicado', aoMudar: v => { f.status = v ? 'publicado' : 'rascunho'; } }),
              gere() && ui.marcar({ rotulo: P('Fixar', 'Pin'), marcado: f.pinned, aoMudar: v => { f.pinned = v; } }),
              !gere() && e('span', 'nt', P('Será salva como rascunho para revisão.', 'It will be saved as a draft for review.')),
              h('div', { class: 'dir' }, btn(P('Cancelar', 'Cancel'), sairDoEditor), btn(P('Salvar', 'Save'), () => salvarPagina(cTitulo), 'primario', { ic: 'save' }))),
          ],
        });
        alvo.append(cartao);
        /* o título do cartão é o alvo do foco ao abrir o editor */
        const titulo = cartao.querySelector('.ph-card-titulo');
        titulo.setAttribute('tabindex', '-1');
        return titulo;
      }

      /* ---------- diálogos do sistema: confirmação (o sistema real usa a confirmação do navegador). Moldura do kit; .bc-real só dá escopo ao miolo ---------- */
      function confirmar(titulo, pergunta, nome, rotulo, tom, aoConfirmar) {
        ui.modal({
          titulo, largura: 'p', classe: 'bc-real',
          corpo: h('div', { class: 'ph-pilha' }, h('p', { class: 'b-conf' }, pergunta), nome && h('p', { class: 'b-conf-n' }, nome)),
          acoes: ctl => [btn(P('Cancelar', 'Cancel'), () => ctl.fechar()), btn(rotulo, () => { ctl.fechar(); aoConfirmar(); }, tom)],
        });
      }

      /* ---------- anexos: arquivos de exemplo (ajuda da demonstração), validação real e rastro ---------- */
      function escolherAnexo(tipo, inserirMd) {
        const titulos = { image: P('Anexar imagem', 'Attach image'), video: P('Anexar vídeo', 'Attach video'), doc: P('Anexar documento', 'Attach document') };
        const aceita = { image: 'image/*', video: 'video/*', doc: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.csv,.zip' };
        ui.modal({
          titulo: titulos[tipo], icone: 'arquivo',
          corpo: (corpo, ctl) => {
            const entrada = h('input', { type: 'file', accept: aceita[tipo], hidden: true, tabindex: '-1', 'aria-hidden': 'true' });
            entrada.addEventListener('change', () => { const arq = entrada.files && entrada.files[0]; if (arq) { ctl.fechar(); arquivoReal(arq, inserirMd); } });
            corpo.append(h('div', { class: 'ph-pilha', style: { gap: '12px' } },
              ui.aviso(P('Ajuda da demonstração: no sistema real este botão abre a janela de arquivos do computador. Aqui, escolha um arquivo de exemplo: cada um exercita uma regra diferente do servidor (formato e tamanho).', 'Demo aid: in the real system this button opens the computer file dialog. Here, pick a sample file: each one exercises a different server rule (format and size).'), 'info'),
              h('ul', { class: 'ph-lista ph-rola', style: { '--ph-rola-max': '46vh' } }, AMOSTRAS[tipo].map(a => h('li', { class: 'ph-lista-item' },
                h('div', { class: 'ph-linha ph-entre' },
                  h('div', { style: { minWidth: '0', flex: '1 1 180px' } },
                    h('strong', { class: 'ph-mono', style: { fontSize: '12.5px', color: 'var(--ph-text)', overflowWrap: 'anywhere' } }, a.nome),
                    h('p', { class: 'ph-texto-p ph-texto-fraco', style: { margin: '2px 0 0' } }, tamanho(a.bytes) + ' · ' + t(a.nota))),
                  ui.botao({ texto: P('Enviar', 'Upload'), icone: 'enviar', tamanho: 'p', titulo: t(P('Enviar ', 'Upload ')) + t(a.nome), aoClicar: () => { ctl.fechar(); enviarAnexo({ ...a, nome: t(a.nome) }, inserirMd); } }))))),
              entrada,
              h('div', { class: 'ph-linha' },
                ui.botao({ texto: P('Escolher um arquivo do meu computador', 'Choose a file from my computer'), icone: 'arquivo', tamanho: 'p', aoClicar: () => entrada.click() }),
                h('span', { class: 'ph-texto-p ph-texto-fraco' }, P('O arquivo não sai do seu navegador: a demonstração só lê o nome e o tamanho.', 'The file never leaves your browser: the demo only reads the name and size.')))));
          },
          acoes: [{ texto: P('Cancelar', 'Cancel') }],
        });
      }
      function arquivoReal(arq, inserirMd) {
        if (vivo) enviarAnexo({ nome: arq.name, bytes: arq.size, blob: arq }, inserirMd);
      }
      function enviarAnexo(a, inserirMd) {
        const r = avaliarUpload(a);
        const ORD = ['vazio', 'teto', 'formato'];
        const parou = r.etapa ? ORD.indexOf(r.etapa) : 99;
        const regra = (i, titulo, detalheOk, extra) => (parou < i ? null : { tipo: 'regra', ms: 3, titulo, estado: parou === i ? 'erro' : 'ok', detalhe: detalheOk, resposta: parou === i ? erro400(r.erro) : null, ...extra });
        const guid = '8c1e4f7a-2d90-4b3c-a6e1-' + String(db.seq.anexo).padStart(12, '0');
        const url = endAnexo(api.publico, guid, db.seq.anexo, r.ext);
        const rotulosTipo = { image: P('imagem', 'image'), video: P('vídeo', 'video'), doc: P('documento', 'document') };
        const marcacao = () => (r.tipo === 'image' ? '![' + r.nome + '](' + url + ')' : r.tipo === 'video' ? '@video(' + url + ')' : '[' + r.nome + '](' + url + ')');
        const passos = [
          pAuth('POST', '/upload', null, 'file = ' + a.nome + ' (' + tamanho(a.bytes) + ')'),
          ...pAcesso(),
          regra(0, P('Recusa arquivo vazio', 'Refuses an empty file'), t(P('Tamanho recebido: ', 'Size received: ')) + tamanho(a.bytes) + '.'),
          regra(1, P('Aplica o teto geral de ' + TETO_MB + ' MB', 'Applies the overall ' + TETO_MB + ' MB ceiling'), P('Vale para qualquer tipo de arquivo. A requisição em si é cortada em ' + CORTE_MB + ' MB.', 'It applies to every file type. The request itself is cut off at ' + CORTE_MB + ' MB.')),
          regra(2, P('Confere a extensão na lista permitida', 'Checks the extension against the allow-list'),
            t(P('Extensão "', 'Extension "')) + (r.ext || '?') + (r.tipo ? t(P('": tratada como ', '": handled as ')) + t(rotulosTipo[r.tipo]) + '.' : t(P('" não está na lista. SVG fica de fora de propósito: pode carregar script embutido.', '" is not on the list. SVG is left out on purpose: it can carry an embedded script.'))),
            { requisicao: t(P('imagens: ', 'images: ')) + EXT.image.join(' ') + '\n' + t(P('vídeos: ', 'videos: ')) + EXT.video.join(' ') + '\n' + t(P('documentos: ', 'documents: ')) + EXT.doc.join(' ') }),
        ];
        if (parou === 99) {
          passos.push(
            { tipo: 'arquivo', ms: 64, titulo: P('Grava o arquivo com um nome aleatório', 'Saves the file under a random name'), detalhe: P('Uma pasta por projeto. O identificador aleatório impede que alguém adivinhe ou sobrescreva o arquivo de outra página.', 'One folder per project. The random identifier prevents anyone from guessing or overwriting the file of another page.'), requisicao: t(P('<pasta de anexos>', '<attachment folder>')) + '/' + PROJ + '/' + guid + r.ext, resposta: tamanho(a.bytes) + t(P(' gravados', ' written')) },
            pAudit('CREATE', 'anexos', PROJ, null, { arquivo: r.nome, tipo: r.tipo }),
            { tipo: 'api', ms: 4, titulo: P('Devolve o endereço do anexo', 'Returns the attachment address'), resposta: '200 OK\n' + json({ url, nome: r.nome, tipo: r.tipo }) },
            { tipo: 'api', ms: 12, titulo: P('O editor insere o Markdown no cursor', 'The editor inserts the Markdown at the cursor'), resposta: marcacao() });
        }
        rastro(P('Enviar um anexo', 'Upload an attachment'), a.nome + ' · ' + tamanho(a.bytes), passos.filter(Boolean),
          parou === 99 ? P('Arquivo aceito, gravado e referenciado no conteúdo.', 'File accepted, saved and referenced in the content.') : P('Arquivo recusado: nada foi gravado em disco.', 'File refused: nothing was written to disk.'),
          res => {
            if (!res.ok) { flash(r.erro || P('Falha no upload', 'Upload failed'), false); return; }
            db.seq.anexo++;
            db.anexos[url] = { nome: r.nome, tipo: r.tipo, bytes: a.bytes, diagrama: !!a.diagrama };
            if (a.blob && (r.tipo === 'image' || r.tipo === 'video')) { try { db.anexos[url].blobUrl = URL.createObjectURL(a.blob); } catch (err) { /* sem pré-visualização */ } }
            audit('CREATE', 'anexos', PROJ, null, { arquivo: r.nome, tipo: r.tipo });
            inserirMd(marcacao());
            flash(P('Anexo adicionado ao conteúdo', 'Attachment added to the content'));
          });
      }

      /* ---------- salvar e excluir página ---------- */
      function salvarPagina(cTitulo) {
        const f = est.form;
        const tit = f.titulo.trim();
        if (!tit) {
          /* a tela confere antes de chamar o servidor: a mensagem fica no campo, como em todo formulário do hub */
          cTitulo.erro(P('Informe um título', 'Enter a title'));
          cTitulo.input.focus();
          return;
        }
        const g = gere();
        const existente = f.id ? pagina(f.id) : null;
        const c = f.categoriaId != null ? cat(f.categoriaId) : null;
        const corpo = { categoriaId: f.categoriaId, titulo: f.titulo, tipo: f.tipo, tags: f.tags || null, conteudoMd: '(' + f.conteudo.length + t(P(' caracteres de Markdown)', ' characters of Markdown)')), status: f.status, pinned: f.pinned, donoId: null };
        const erroLimite = tit.length > LIM.titulo ? P('Título deve ter no máximo ' + LIM.titulo + ' caracteres', 'Title must be ' + LIM.titulo + ' characters at most')
          : (f.tags || '').length > LIM.tags ? P('Tags devem ter no máximo ' + LIM.tags + ' caracteres', 'Tags must be ' + LIM.tags + ' characters at most') : null;
        const pTitulo = { tipo: 'regra', ms: 2, titulo: P('Título é obrigatório', 'Title is required'), detalhe: P('A tela já confere, e o servidor confere de novo, sem depender só do navegador.', 'The screen already checks it, and the server checks again rather than relying on the browser alone.') };
        const pLimites = {
          tipo: 'regra', ms: 3, estado: erroLimite ? 'erro' : 'ok', titulo: P('Confere os limites de tamanho dos campos', 'Checks the field size limits'),
          detalhe: t(P('Título até ', 'Title up to ')) + LIM.titulo + t(P(' caracteres, tipo até ', ' characters, type up to ')) + LIM.tipo + t(P(' e tags até ', ' and tags up to ')) + LIM.tags + t(P(' caracteres.', ' characters.')),
          resposta: erroLimite ? erro400(erroLimite) : null,
        };
        const base = slugify(tit);
        const ocupados = (tentativas, slug) => (tentativas.length ? tentativas.map(s => '"' + s + '" ' + t(P('já existe', 'already exists'))).join('\n') + '\n' : '') + '"' + slug + '" ' + t(P('está livre', 'is free'));
        const campos = (slug, status, pinned) => [
          t(P('Pilar: ', 'Pillar: ')) + (c ? t(c.nome) : t(P('sem pilar', 'none'))),
          t(P('Tipo: ', 'Type: ')) + t(TIPOS[f.tipo].rotulo),
          t(P('Situação: ', 'Status: ')) + t(status === 'publicado' ? P('publicada', 'published') : P('rascunho', 'draft')) + ' · ' + t(P('Fixada: ', 'Pinned: ')) + sn(pinned),
          'Slug: ' + slug,
        ];

        if (!existente) {
          const status = f.status === 'publicado' && g ? 'publicado' : 'rascunho';
          const pinned = !!(f.pinned && g);
          const { slug, tentativas } = uniqueSlug(base, null);
          const novoId = db.seq.pagina;
          rastro(P('Criar página', 'Create page'), tit, [
            pAuth('POST', '/paginas', corpo), ...pAcesso(), pTitulo, pLimites, ...pGere(false),
            { tipo: 'regra', ms: 3, titulo: P('Publicar e fixar exigem gestão', 'Publishing and pinning require management rights'), detalhe: g ? P('Quem gere a base decide a situação e se a página vai para o mural.', 'Whoever manages the base decides the status and whether the page goes to the board.') : P('Contribuidor cria como rascunho e não fixa, mesmo que a requisição peça outra coisa.', 'A contributor creates a draft and cannot pin, even if the request asks otherwise.'), resposta: 'status = ' + status + ' · pinned = ' + pinned },
            { tipo: 'regra', ms: 4, titulo: P('Gera o identificador legível (slug) a partir do título', 'Builds the readable identifier (slug) from the title'), detalhe: P('Tira acentos, passa para minúsculas e troca o que não é letra ou número por hífen.', 'Strips accents, lowercases and replaces anything that is not a letter or digit with a hyphen.'), requisicao: tit, resposta: base },
            { tipo: 'sql', ms: 18 + tentativas.length * 9, titulo: P('Garante que o slug é único no projeto', 'Makes sure the slug is unique within the project'), detalhe: P('Procura outra página do projeto com o mesmo slug; se existir, acrescenta um número ao final e procura de novo.', 'Looks for another page in the project with the same slug; if there is one, it appends a number and looks again.'), resposta: ocupados(tentativas, slug) },
            { tipo: 'sql', ms: 36, titulo: P('Grava a página', 'Saves the page'), detalhe: P('A tela envia dono vazio; o servidor usa o usuário da sessão como dono e autor.', 'The screen sends an empty owner; the server uses the session user as owner and author.'), requisicao: campos(slug, status, pinned).concat(t(P('Dono e autor: usuário ', 'Owner and author: user ')) + eu().id).join('\n'), resposta: t(P('Página nº ', 'Page no. ')) + novoId },
            pAudit('CREATE', 'paginas', novoId, null, { titulo: tit, status }),
            { tipo: 'api', ms: 4, titulo: P('Confirma a criação', 'Confirms the creation'), resposta: '201 Created\n' + json({ id: novoId, slug }) },
            pTela(['GET ' + ROTA + '/overview', 'GET ' + ROTA + '/paginas' + (f.categoriaId != null ? '?categoriaId=' + f.categoriaId : '')], g ? null : P('O rascunho não aparece na lista de quem não gere: fica aguardando a revisão de quem gere a base.', 'The draft does not show in the list for non-managers: it waits for review by whoever manages the base.')),
          ], status === 'publicado' ? P('Página criada e publicada.', 'Page created and published.') : P('Página criada como rascunho.', 'Page created as a draft.'), res => {
            if (!res.ok) { flash(erroLimite || P('Erro ao salvar', 'Error while saving'), false); return; }
            db.seq.pagina++;
            db.paginas.push({ id: novoId, categoriaId: f.categoriaId, tipo: f.tipo || 'livre', status, pinned, donoId: eu().id, criadoPorId: eu().id, criadoEm: new Date(), atualizadoEm: null, atualizadoPorId: null, tags: f.tags || null, titulo: tit, conteudo: f.conteudo, slug, ativo: true });
            audit('CREATE', 'paginas', novoId, null, { titulo: tit, status });
            est.form = null;
            flash(P('Página salva', 'Page saved'));
            if (!g) notaDemo(P('o rascunho sai desta lista e aparece para quem gere a base revisar e publicar.', 'the draft leaves this list and shows up for the base managers to review and publish.'));
            abrirLista(f.categoriaId);
          });
          return;
        }

        const p = existente;
        const rascunhoDoAutor = p.criadoPorId === eu().id && p.status === 'rascunho';
        const podeEditar = g || rascunhoDoAutor;
        const statusAntes = p.status;
        const novoStatus = g ? (f.status === 'publicado' ? 'publicado' : 'rascunho') : p.status;
        const fixada = g ? !!f.pinned : p.pinned;
        const mudouTitulo = t(p.titulo) !== tit;
        const { slug, tentativas } = mudouTitulo ? uniqueSlug(base, p.id) : { slug: p.slug, tentativas: [] };
        rastro(P('Salvar página', 'Save page'), tit, [
          pAuth('PUT', '/paginas/' + p.id, corpo),
          { tipo: 'sql', ms: 15, titulo: P('Localiza a página ativa do projeto', 'Finds the active page in the project'), resposta: P('1 página', '1 page') },
          ...pGere(false),
          { tipo: 'regra', ms: 3, estado: podeEditar ? 'ok' : 'erro', titulo: P('Quem não gere só edita o próprio rascunho', 'Non-managers only edit their own draft'), detalhe: g ? P('Quem gere a base edita qualquer página.', 'Whoever manages the base edits any page.') : rascunhoDoAutor ? P('O usuário é o autor e a página ainda é rascunho.', 'The user is the author and the page is still a draft.') : P('Página publicada ou de outro autor.', 'Published page or page from another author.'), resposta: podeEditar ? null : '403 Forbidden' },
          pTitulo, pLimites,
          { tipo: 'regra', ms: 3, titulo: P('Só quem gere publica, despublica e fixa', 'Only managers publish, unpublish and pin'), detalhe: g ? null : P('A situação e a fixação continuam como estavam.', 'Status and pinning stay as they were.'), resposta: 'status: ' + statusAntes + ' -> ' + novoStatus + ' · pinned = ' + fixada },
          mudouTitulo
            ? { tipo: 'sql', ms: 21 + tentativas.length * 9, titulo: P('O título mudou: gera um slug novo e único', 'The title changed: builds a new unique slug'), detalhe: P('Procura outra página do projeto com o mesmo slug, sem contar a própria.', 'Looks for another page in the project with the same slug, not counting itself.'), resposta: (tentativas.length ? tentativas.map(s => '"' + s + '" ' + t(P('já existe', 'already exists'))).join('\n') + '\n' : '') + p.slug + ' -> ' + slug }
            : { tipo: 'regra', estado: 'pulado', titulo: P('Título igual: o slug não muda', 'Same title: the slug does not change') },
          { tipo: 'sql', ms: 33, titulo: P('Atualiza a página', 'Updates the page'), detalhe: P('Grava título, slug, pilar, tipo, tags, conteúdo, situação e fixação, e registra quem alterou e quando.', 'Writes title, slug, pillar, type, tags, content, status and pinning, and records who changed it and when.'), requisicao: campos(slug, novoStatus, fixada).concat(t(P('Alterada por: usuário ', 'Changed by: user ')) + eu().id).join('\n'), resposta: P('1 página atualizada', '1 page updated') },
          pAudit('UPDATE', 'paginas', p.id, null, { titulo: tit }),
          statusAntes !== novoStatus
            ? { ...pAudit('STATUS_CHANGE', 'paginas', p.id, { status: statusAntes }, { status: novoStatus }), titulo: P('Registra a mudança de situação', 'Records the status change') }
            : { tipo: 'sql', estado: 'pulado', titulo: P('Situação igual: sem registro de mudança de situação', 'Same status: no status-change record') },
          { tipo: 'api', ms: 3, titulo: P('Confirma a gravação', 'Confirms the save'), resposta: '204 No Content' },
          pTela(['GET ' + ROTA + '/overview', 'GET ' + ROTA + '/paginas/' + p.id]),
        ], statusAntes !== novoStatus ? (novoStatus === 'publicado' ? P('Página salva e publicada: agora aparece para todos com acesso.', 'Page saved and published: it now shows for everyone with access.') : P('Página salva e devolvida para rascunho.', 'Page saved and moved back to draft.')) : P('Página salva.', 'Page saved.'), res => {
          if (!res.ok) { flash(erroLimite || P('Erro 403', 'Error 403'), false); return; }
          if (mudouTitulo) p.titulo = tit;
          if ((t(p.tags) || '') !== f.tags) p.tags = f.tags || null;
          if (t(p.conteudo) !== f.conteudo) p.conteudo = f.conteudo;
          Object.assign(p, { slug, categoriaId: f.categoriaId, tipo: f.tipo || 'livre', status: novoStatus, atualizadoEm: new Date(), atualizadoPorId: eu().id });
          if (g) p.pinned = !!f.pinned;
          audit('UPDATE', 'paginas', p.id, null, { titulo: tit });
          if (statusAntes !== novoStatus) audit('STATUS_CHANGE', 'paginas', p.id, { status: statusAntes }, { status: novoStatus });
          est.form = null;
          flash(P('Página salva', 'Page saved'));
          abrirPagina(p.id);
        });
      }

      function excluirPagina(p) {
        confirmar(P('Excluir página', 'Delete page'), P('Excluir esta página?', 'Delete this page?'), p.titulo, P('Excluir', 'Delete'), 'perigo', () => {
          rastro(P('Excluir página', 'Delete page'), t(p.titulo), [
            pAuth('DELETE', '/paginas/' + p.id), ...pGere(true),
            { tipo: 'sql', ms: 14, titulo: P('Localiza a página do projeto', 'Finds the page in the project'), resposta: P('1 página', '1 page') },
            { tipo: 'sql', ms: 22, titulo: P('Desativa a página (exclusão lógica)', 'Deactivates the page (soft delete)'), detalhe: P('Nada é apagado do banco: a página sai das telas e continua guardada no banco.', 'Nothing is erased from the database: the page leaves the screens and stays stored in the database.'), resposta: P('1 página desativada', '1 page deactivated') },
            pAudit('DELETE', 'paginas', p.id, { titulo: t(p.titulo) }, null),
            { tipo: 'api', ms: 3, titulo: P('Confirma a exclusão', 'Confirms the deletion'), resposta: '204 No Content' },
            pTela(['GET ' + ROTA + '/overview', 'GET ' + ROTA + '/paginas' + (est.catSel != null ? '?categoriaId=' + est.catSel : '')]),
          ], P('Página fora das telas, guardada no banco e registrada na auditoria.', 'Page off the screens, kept in the database and recorded in the audit log.'), res => {
            if (!res.ok) { flash(P('Erro 403', 'Error 403'), false); return; }
            p.ativo = false;
            audit('DELETE', 'paginas', p.id, { titulo: t(p.titulo) }, null);
            est.atualId = null;
            flash(P('Página excluída', 'Page deleted'));
            abrirLista(est.catSel);
          });
        });
      }

      /* ---------- categorias (pilares): o modal do sistema real, com a cor livre (seletor de cor do navegador) ---------- */
      const corValida = v => (/^#[0-9a-f]{6}$/i.test(v || '') ? v : PALETA.azul);
      function abrirCategoria(c) {
        const cNome = ui.campo({ rotulo: P('Nome', 'Name'), obrigatorio: true, valor: c ? t(c.nome) : '' });
        /* o kit não tem campo de cor: o campo do kit vira o seletor de cor do navegador, a cor livre do sistema real */
        const cCor = ui.campo({ rotulo: P('Cor', 'Color'), valor: corValida(c && c.cor) });
        cCor.input.setAttribute('type', 'color');
        cCor.input.classList.add('b-cor');
        const cIcone = ui.select({ rotulo: P('Ícone', 'Icon'), valor: c ? c.icone : 'Folder', opcoes: Object.keys(ICONES_CAT).map(k => ({ valor: k, texto: k })) });
        ui.modal({
          titulo: c ? P('Editar categoria', 'Edit category') : P('Nova categoria', 'New category'), largura: 'p', classe: 'bc-real',
          corpo: h('div', { class: 'ph-pilha' }, cNome, h('div', { class: 'b-duo' }, cCor, cIcone)),
          acoes: ctl => [btn(P('Cancelar', 'Cancel'), () => ctl.fechar()), btn(P('Salvar', 'Save'), () => {
            const nome = cNome.valor();
            if (!nome) { cNome.erro(P('Informe o nome da categoria', 'Enter the category name')); cNome.input.focus(); return; }
            ctl.fechar();
            salvarCategoria(c, nome, corValida(cCor.input.value), cIcone.input.value);
          }, 'primario')],
        });
      }
      function salvarCategoria(c, nome, cor, icon) {
        const longo = nome.length > LIM.nome ? P('Nome deve ter no máximo ' + LIM.nome + ' caracteres', 'Name must be ' + LIM.nome + ' characters at most') : null;
        const novoId = db.seq.categoria;
        const ordem = c ? c.ordem : cats().length + 1;
        const corpo = { nome, descricao: c && c.descricao ? t(c.descricao) : null, cor, icone: icon, ordem };
        rastro(c ? P('Salvar categoria', 'Save category') : P('Criar categoria', 'Create category'), nome, [
          pAuth(c ? 'PUT' : 'POST', '/categorias' + (c ? '/' + c.id : ''), corpo), ...pGere(true),
          c ? { tipo: 'sql', ms: 12, titulo: P('Localiza a categoria do projeto', 'Finds the category in the project'), resposta: P('1 categoria', '1 category') } : { tipo: 'regra', ms: 2, titulo: P('Nome é obrigatório', 'Name is required') },
          { tipo: 'regra', ms: 3, estado: longo ? 'erro' : 'ok', titulo: P('Confere os limites dos campos', 'Checks the field limits'), detalhe: t(P('Nome até ', 'Name up to ')) + LIM.nome + t(P(' caracteres, descrição até ', ' characters, description up to ')) + LIM.descricao + t(P(', cor até ', ', color up to ')) + LIM.cor + t(P(' e ícone até ', ' and icon up to ')) + LIM.icone + '.', resposta: longo ? erro400(longo) : null },
          c
            ? { tipo: 'sql', ms: 20, titulo: P('Atualiza a categoria', 'Updates the category'), detalhe: P('Grava nome, descrição, cor, ícone e ordem como vieram da tela.', 'Writes name, description, color, icon and order as sent by the screen.'), resposta: P('1 categoria atualizada', '1 category updated') }
            : { tipo: 'sql', ms: 24, titulo: P('Grava a categoria', 'Saves the category'), detalhe: P('Grava nome, descrição, cor, ícone e ordem, com quem criou e quando.', 'Writes name, description, color, icon and order, with who created it and when.'), resposta: t(P('Categoria nº ', 'Category no. ')) + novoId },
          pAudit(c ? 'UPDATE' : 'CREATE', 'pilares', c ? c.id : novoId, null, { nome }),
          { tipo: 'api', ms: 3, titulo: P('Confirma a gravação', 'Confirms the save'), resposta: c ? '204 No Content' : '201 Created\n' + json({ id: novoId, nome }) },
          pTela(['GET ' + ROTA + '/overview']),
        ], P('Pilar gravado e disponível na trilha e na visão geral.', 'Pillar saved and available on the trail and on the overview.'), res => {
          if (!res.ok) { flash(longo || P('Erro ao salvar categoria', 'Error while saving the category'), false); return; }
          if (c) { if (t(c.nome) !== nome) c.nome = nome; Object.assign(c, { cor, icone: icon }); }
          else { db.seq.categoria++; db.categorias.push({ id: novoId, nome, descricao: null, cor, icone: icon, ordem, ativo: true }); }
          audit(c ? 'UPDATE' : 'CREATE', 'pilares', c ? c.id : novoId, null, { nome });
          flash(P('Categoria salva', 'Category saved'));
          pintar();
        });
      }
      function excluirCategoria(c) {
        const orfas = db.paginas.filter(p => p.categoriaId === c.id).length;
        confirmar(P('Excluir categoria', 'Delete category'), P('Excluir a categoria? As páginas dela ficam sem categoria.', 'Delete the category? Its pages are left with no category.'), c.nome, P('Excluir', 'Delete'), 'perigo', () => {
          rastro(P('Excluir categoria', 'Delete category'), t(c.nome), [
            pAuth('DELETE', '/categorias/' + c.id), ...pGere(true),
            { tipo: 'sql', ms: 12, titulo: P('Localiza a categoria do projeto', 'Finds the category in the project'), resposta: P('1 categoria', '1 category') },
            { tipo: 'sql', ms: 26, titulo: P('Solta as páginas do pilar', 'Detaches the pages from the pillar'), detalhe: P('As páginas não somem: ficam sem categoria e continuam em "Todas as páginas".', 'The pages do not vanish: they are left with no category and stay under "All pages".'), resposta: t(P('Páginas soltas: ', 'Pages detached: ')) + orfas },
            { tipo: 'sql', ms: 15, titulo: P('Desativa a categoria (exclusão lógica)', 'Deactivates the category (soft delete)'), resposta: P('1 categoria desativada', '1 category deactivated') },
            pAudit('DELETE', 'pilares', c.id, { nome: t(c.nome) }, null),
            { tipo: 'api', ms: 3, titulo: P('Confirma a exclusão', 'Confirms the deletion'), resposta: '204 No Content' },
            pTela(['GET ' + ROTA + '/overview']),
          ], P('Pilar excluído e páginas preservadas.', 'Pillar deleted and pages preserved.'), res => {
            if (!res.ok) { flash(P('Erro 403', 'Error 403'), false); return; }
            db.paginas.forEach(p => { if (p.categoriaId === c.id) p.categoriaId = null; });
            c.ativo = false;
            audit('DELETE', 'pilares', c.id, { nome: t(c.nome) }, null);
            flash(P('Categoria excluída', 'Category deleted'));
            if (est.form && est.form.categoriaId === c.id) est.form.categoriaId = null;
            if (est.catSel === c.id) abrirLista(null); else pintar();
          });
        });
      }

      /* ---------- auditoria (ajuda da demonstração, com a cara do kit: o sistema real grava a trilha, mas não tem esta tela) ---------- */
      function abrirAuditoria() {
        const TONS = { CREATE: 'ok', UPDATE: 'info', STATUS_CHANGE: 'alerta', DELETE: 'erro' };
        /* os registros semeados guardam o título nos dois idiomas: mostra o do idioma da tela */
        const tx = x => (x && typeof x === 'object' && 'pt' in x ? t(x) : x);
        /* no site público a trilha sai em palavras: nada de JSON nem de nome de campo ou de ação do servidor */
        const PALAVRA = { CREATE: P('Criação', 'Creation'), UPDATE: P('Edição', 'Edit'), STATUS_CHANGE: P('Mudança de situação', 'Status change'), DELETE: P('Exclusão', 'Deletion'),
          titulo: P('Título', 'Title'), status: P('Situação', 'Status'), arquivo: P('Arquivo', 'File'), tipo: P('Tipo', 'Type'), nome: P('Nome', 'Name'),
          rascunho: P('rascunho', 'draft'), publicado: P('publicado', 'published'), image: P('imagem', 'image'), video: P('vídeo', 'video'), doc: P('documento', 'document') };
        const palavra = k => (PALAVRA[k] ? t(PALAVRA[k]) : k);
        const js = v => (!v ? '' : api.publico ? Object.entries(v).map(([k, x]) => palavra(k) + ': ' + palavra(tx(x))).join(' · ') : JSON.stringify(v, (k, x) => tx(x)));
        const dado = v => h('span', { class: api.publico ? 'ph-texto-p' : 'ph-mono ph-texto-p' }, js(v));
        ui.modal({
          titulo: P('Auditoria da base (ajuda da demonstração)', 'Base audit log (demo aid)'), largura: 'g', icone: 'relogio',
          corpo: h('div', { class: 'ph-pilha', style: { gap: '12px' } },
            ui.aviso(P('Bastidores da demonstração: o sistema real não tem tela de versões. O histórico de cada página é esta trilha, gravada pelo servidor em toda criação, edição, mudança de situação, exclusão e anexo.', 'Behind the scenes of the demo: the real system has no version screen. The history of each page is this trail, written by the server on every creation, edit, status change, deletion and attachment.'), 'info'),
            ui.tabela({
              rotulo: P('Registros de auditoria', 'Audit records'), alturaMax: '50vh', ordem: { coluna: 'quando', dir: 'desc' },
              placeholder: P('Buscar ação, usuário ou registro', 'Search action, user or record'),
              linhas: db.audit,
              colunas: [
                { id: 'quando', rotulo: P('Quando', 'When'), valor: a => a.quando },
                { id: 'usuario', rotulo: P('Usuário', 'User'), valor: a => nomeU(a.userId) },
                { id: 'action', rotulo: P('Ação', 'Action'), valor: a => (api.publico ? palavra(a.action) : a.action), render: a => ui.badge(api.publico ? palavra(a.action) : a.action, TONS[a.action] || 'neutro') },
                { id: 'area', rotulo: P('Registro de', 'Record of'), valor: a => t(AREAS[a.area]) },
                { id: 'recordId', rotulo: P('Número', 'Number'), tipo: 'numero', valor: a => a.recordId },
                { id: 'old', rotulo: P('Antes', 'Before'), quebra: true, ordenavel: false, valor: a => js(a.old), render: a => dado(a.old) },
                { id: 'novo', rotulo: P('Depois', 'After'), quebra: true, ordenavel: false, valor: a => js(a.novo), render: a => dado(a.novo) },
              ],
            })),
          acoes: [{ texto: P('Fechar', 'Close'), tom: 'primario' }],
        });
      }

      pintar();
      tique();
      return () => { vivo = false; };
    },
  });
})();
