/* Gestão de Pessoas · versão pública curta do módulo (id gestao_pessoas) para o site.
   Só a tela principal (Início) é navegável, com dados fictícios já prontos: os indicadores de pendência, a lista de pendências
   por prazo (com busca e ordem) e as férias a vencer. As outras telas continuam nas abas e mostram o cartão "fora da
   demonstração"; registrar uma entrevista ou uma conversa também abre esse cartão. Visual do kit do hub, só tokens --ph-*,
   nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const IC = {
    house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    userminus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="22" x2="16" y1="11" y2="11"/>',
    calcheck: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="m9 16 2 2 4-4"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    msgs: '<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>',
    bar: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    sparkles: '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="m4.9 4.9 2.1 2.1"/><path d="m17 17 2.1 2.1"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="m4.9 19.1 2.1-2.1"/><path d="m17 7 2.1-2.1"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
  };
  const ROT = 'font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const CSS = [
    '.gp{min-width:0}.gp p{margin:0}.gp.x-shell{color:var(--ph-text);font-size:13.5px;line-height:1.5}',
    '.gp .x-ic{display:inline-flex;flex:none}.gp .x-ic svg{display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '.gp .head{margin-bottom:16px}.gp .eyebrow{display:flex;align-items:center;gap:6px;margin:0 0 4px;' + ROT + ';color:var(--ph-accent-light)}.gp .t1{margin:0 0 4px}.gp .head .sub{max-width:80ch;font-size:13.5px;color:var(--ph-text-muted)}',
    '.gp .ctx{display:flex;align-items:center;justify-content:flex-end;gap:8px 12px;flex-wrap:wrap;margin:-6px 0 14px;padding-bottom:12px;border-bottom:1px dashed var(--ph-border)}.gp .ctx b{font-weight:650;color:var(--ph-text)}.gp .ctx small{font-size:12px;color:var(--ph-text-dim)}',
    '.gp .ph-kpis{grid-template-columns:repeat(auto-fit,minmax(min(170px,100%),1fr));margin-bottom:16px}',
    '.gp .duo{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,400px),1fr));align-items:start}',
    '.gp .dim{font-size:12px;color:var(--ph-text-dim)}.gp .forte{font-weight:650;color:var(--ph-text)}.gp .ph-tabela td .sub2{display:block;font-size:12px;color:var(--ph-text-dim);white-space:normal}.gp .ph-tabela td .ph-btn{white-space:nowrap}',
  ].join('\n');
  function injetarCss() {
    if (document.getElementById('gp-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'gp-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- dados prontos (fictícios): [nome, cargo, setor, pendência, dias desde, dias até o prazo ou null] ---------- */
  const CARGOS = { op: P('Operador de produção', 'Production operator'), sol: P('Soldador', 'Welder'), pin: P('Pintor industrial', 'Industrial painter'), aux: P('Auxiliar de logística', 'Logistics assistant'),
    con: P('Conferente', 'Stock checker'), mec: P('Mecânico de manutenção', 'Maintenance mechanic'), ven: P('Vendedor interno', 'Inside sales rep'), adm: P('Assistente administrativo', 'Administrative assistant'), ins: P('Inspetor de qualidade', 'Quality inspector') };
  const SETORES = { op: P('Produção', 'Production'), sol: P('Produção', 'Production'), pin: P('Produção', 'Production'), aux: P('Logística', 'Logistics'), con: P('Logística', 'Logistics'), mec: P('Manutenção', 'Maintenance'), ven: P('Comercial', 'Sales'), adm: P('Administrativo', 'Administration'), ins: P('Qualidade', 'Quality') };
  const TIPO = {
    ent: [P('Entrevista de desligamento', 'Exit interview'), P('Registrar entrevista', 'Record interview')],
    c30: [P('Conversa de 30 dias', '30-day conversation'), P('Registrar conversa', 'Record conversation')],
    c90: [P('Conversa de 90 dias', '90-day conversation'), P('Registrar conversa', 'Record conversation')],
    sem: [P('Sem entrevista (folha)', 'No interview (payroll)'), P('Criar agora', 'Create now')],
  };
  const PENDENCIAS = [
    ['Caetano Andrade', 'aux', 'ent', 7, null], ['Rebeca Fontana', 'aux', 'ent', 9, null], ['Emanuel Zanetti', 'op', 'ent', 11, null], ['Rebeca Coelho', 'ins', 'ent', 13, null],
    ['Yasmin Duarte', 'pin', 'c30', 2, 2], ['Gustavo Peixoto', 'aux', 'c90', 4, 5], ['Larissa Leal', 'mec', 'c30', 6, -2],
    ['Murilo Batista', 'sol', 'sem', 0, null], ['Simone Rocha', 'con', 'sem', 1, null],
  ];
  const FERIAS = [['Otávio Neves', 'op', -9], ['Joana Coelho', 'adm', -2], ['Igor Viana', 'pin', 6], ['Flávia Lobo', 'sol', 14], ['Débora Moura', 'ven', 23], ['Heloísa Coelho', 'ins', 31], ['Vicente Carvalho', 'mec', 47], ['Priscila Xavier', 'aux', 58]];
  const ABAS = [
    ['inicio', P('Início', 'Home'), 'house'], ['desligamentos', P('Entrevistas de desligamento', 'Exit interviews'), 'userminus'], ['experiencia', P('Experiência 30/90', 'Probation 30/90'), 'calcheck'],
    ['vagas', P('Vagas e candidatos', 'Openings and candidates'), 'briefcase'], ['feedbacks', P('Feedbacks semestrais', 'Semiannual feedback'), 'msgs'], ['indicadores', P('Indicadores', 'Indicators'), 'bar'],
    ['analises', P('Análises IA', 'AI analyses'), 'sparkles'], ['assistente', P('Assistente do RH', 'HR Assistant'), 'bot'], ['config', P('Configurações', 'Settings'), 'gear'],
  ];

  const MANUAL = {
    pt: {
      destaque: 'O Gestão de Pessoas é o sistema do RH dentro do hub. Quando a folha de pagamento mostra uma rescisão ou uma admissão, o sistema cria sozinho a entrevista de desligamento e as conversas de 30 e 90 dias, e o RH só transcreve o que foi conversado. Ao redor ficam os feedbacks semestrais por equipe, as vagas com o perfil de permanência de cada cargo, os indicadores, três análises por IA e um assistente que só consulta.',
      oque: 'O problema. As entrevistas de desligamento eram feitas no papel e digitadas depois numa planilha; as conversas de 30 e 90 dias dependiam de lembrar a data de cada admissão; os feedbacks semestrais eram controlados em planilha; e perguntas simples sobre a folha viravam pedido de relatório.'
        + '\n\nO que o sistema faz. A tela inicial reúne as pendências do dia, do prazo mais antigo para o mais recente. A entrevista de desligamento e as conversas de experiência nascem sozinhas a partir da folha, que é só lida. Os feedbacks semestrais seguem as equipes da folha, com o coordenador do portal como gestor e avisos por e-mail que nascem desligados. Cada vaga aberta mostra o perfil de permanência do cargo, só com fatores ligados à função, e todos os candidatos, sem eliminar ninguém. Três análises por IA recebem só o agregado, e o Assistente do RH responde em linguagem comum com ferramentas fechadas, só de leitura, recusando o que não é RH e registrando cada consulta.'
        + '\n\nNesta demonstração pública, a tela Início funciona com dados fictícios; as outras telas ficam fora da demonstração.',
      finalidade: 'Tirar o RH do papel e das planilhas sem tirar o RH da conversa: o sistema cria o que a folha já sabe, lembra o que está para vencer e deixa as pessoas do RH concentradas em ouvir e registrar.\n\nProjetado e construído por Ruan Siqueira. Os modelos de entrevista e os critérios de acompanhamento vieram da área de RH.',
      alcance: [
        'Início com as pendências do dia por prazo',
        'Entrevistas de desligamento e conversas de 30 e 90 dias criadas sozinhas a partir da folha',
        'Feedbacks semestrais por equipe, com avisos por e-mail que nascem desligados',
        'Vagas com perfil de permanência por cargo e candidatos sem eliminação',
        'Indicadores e três análises por IA só com o agregado',
        'Assistente do RH só de leitura, com recusa fora do escopo e auditoria',
        'Acesso pela regra do hub, conferido no servidor',
      ],
      tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript', 'API de IA generativa'],
    },
    en: {
      destaque: 'People management is the HR system inside the hub. When payroll shows a termination or a new hire, the system creates the exit interview and the 30 and 90-day conversations on its own, and HR only transcribes what was discussed. Around it sit semiannual feedback by team, openings with the retention profile of each role, indicators, three AI analyses and an assistant that only reads.',
      oque: 'The problem. Exit interviews were done on paper and typed later into a spreadsheet; 30 and 90-day conversations depended on remembering each hire date; semiannual feedback was tracked in a spreadsheet; and simple payroll questions turned into report requests.'
        + '\n\nWhat the system does. The home screen gathers today\'s pending items, from the oldest deadline to the newest. Exit interviews and probation conversations are born on their own from payroll, which is only read. Semiannual feedback follows the payroll teams, with the portal coordinator as manager and email reminders born switched off. Each open position shows the retention profile of the role, with job-related factors only, and every candidate, ruling nobody out. Three AI analyses receive only the aggregate, and the HR Assistant answers in plain language with closed, read-only tools, refusing anything that is not HR and logging every query.'
        + '\n\nIn this public demo, the Home screen works on fictitious data; the other screens are outside the demo.',
      finalidade: 'Take HR off paper and spreadsheets without taking HR out of the conversation: the system creates what payroll already knows, reminds what is coming due and lets the HR team focus on listening and recording.\n\nDesigned and built by Ruan Siqueira. The interview templates and follow-up criteria came from the HR team.',
      alcance: [
        'Home with today\'s pending items by deadline',
        'Exit interviews and 30 and 90-day conversations created on their own from payroll',
        'Semiannual feedback by team, with email reminders born switched off',
        'Openings with a retention profile by role and candidates with no rule-out',
        'Indicators and three AI analyses with the aggregate only',
        'Read-only HR Assistant, with out-of-scope refusal and an audit log',
        'Access by the hub rule, checked on the server',
      ],
      tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript', 'Generative AI API'],
    },
  };

  Hub.registrar({
    id: 'gestao_pessoas',
    ordem: 1,
    grupo: P('Pessoas', 'People'),
    icone: 'pessoas',
    nome: P('Gestão de Pessoas', 'People management'),
    resumo: P('O sistema do RH no hub: entrevistas de desligamento e conversas de 30 e 90 dias criadas sozinhas a partir da folha, feedbacks semestrais, vagas com perfil de permanência, indicadores, análises por IA e um assistente só de leitura.',
      'The HR system in the hub: exit interviews and 30 and 90-day conversations created on their own from payroll, semiannual feedback, openings with a retention profile, indicators, AI analyses and a read-only assistant.'),
    manual: MANUAL,
    /* mini tour: só ganchos do módulo (.gp, data-aba-id, .gp-pend, .gp-prazo), nada que dependa do idioma */
    tour: [
      { alvo: '.gp [data-aba-id="inicio"]', acao: 'clicar', titulo: P('O dia do RH começa pelas pendências', "HR's day starts with what is pending"),
        texto: P('O Gestão de Pessoas é o sistema do RH no hub. A tela inicial junta o que precisa de atenção hoje.', 'People management is the HR system in the hub. The home screen gathers what needs attention today.') },
      { alvo: '.gp .gp-pend', titulo: P('Quatro números para começar', 'Four numbers to start with'),
        texto: P('Entrevistas e conversas de 30/90 a preencher, desligados que a folha já mostra e férias a vencer em 60 dias.', 'Interviews and 30/90 conversations to fill in, exits payroll already shows and vacation due in 60 days.') },
      { alvo: '.gp .gp-prazo', titulo: P('Do prazo mais antigo para o mais recente', 'From the oldest deadline to the newest'),
        texto: P('Tudo aqui foi criado sozinho a partir da folha. O RH só transcreve o que conversou, sem lembrar datas de cabeça.', 'Everything here was created on its own from payroll. HR only transcribes the conversation, without remembering dates by heart.') },
      { alvo: '.gp [data-aba-id="assistente"]', acao: 'clicar', titulo: P('E um assistente que só consulta', 'And an assistant that only reads'),
        texto: P('Feedbacks por equipe, vagas com perfil de permanência, análises por IA e um assistente com ferramentas fechadas e auditoria completam o sistema.', 'Feedback by team, openings with a retention profile, AI analyses and an assistant with closed tools and an audit log complete the system.') },
      { alvo: '.gp .ph-fora', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('A demonstração pública mostra o Início. Quer ver o sistema inteiro funcionando? É só me chamar por aqui.', 'The public demo shows Home. Want to see the whole system running? Just reach me from here.') },
    ],

    montar(el, api) {
      injetarCss();
      const { t, h, ui, fmt } = api;
      const E = api.estado;
      const hoje = api.data(0, '00:00');
      const dia = n => new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + n);
      const ic = (nome, tam) => h('span', { class: 'x-ic', 'aria-hidden': 'true', style: 'width:' + tam + 'px;height:' + tam + 'px', html: '<svg viewBox="0 0 24 24" focusable="false">' + IC[nome] + '</svg>' });
      const fora = titulo => (ui.foraDaDemo ? ui.foraDaDemo({ titulo }) : ui.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is outside the public demo.') }));
      const foraModal = titulo => ui.modal({ titulo, classe: 'gp', corpo: fora(titulo) });
      const selo = par => ui.badge(par[0], par[1]);
      const nomeCel = (nome, k) => h('span', null, h('b', { class: 'forte' }, nome), h('span', { class: 'sub2' }, t(CARGOS[k]), ' · ', t(SETORES[k])));
      const semValor = c => (c.render && !c.valor ? { ...c, valor: () => '' } : c);

      const linhas = PENDENCIAS.map(([nome, k, tipo, desde, limite]) => ({ nome, k, tipo, desde: dia(-desde), limite: limite == null ? null : dia(limite), dias: desde,
        sit: tipo === 'sem' ? [P('Aguarda a rotina', 'Waiting for the routine'), 'neutro'] : limite == null ? (desde === 0 ? [P('Desligado hoje', 'Left today'), 'info'] : [P('A preencher', 'To fill in'), 'alerta'])
          : limite < 0 ? [P('Fora da janela', 'Past the window'), 'erro'] : limite === 0 ? [P('Vence hoje', 'Due today'), 'alerta'] : [P('Dentro do prazo', 'On time'), 'ok'] }));
      const conta = tp => PENDENCIAS.filter(p => tp.includes(p[2])).length;

      function telaInicio(painel) {
        painel.append(
          h('div', { class: 'ctx' }, ui.badge(P('Departamento Pessoas', 'People department'), 'info'), h('span', null, h('b', null, P('Visitante (demonstração)', 'Visitor (demo)')), ' ', h('small', null, P('Super administrador', 'Super administrator')))),
          h('div', { class: 'head' }, h('p', { class: 'eyebrow' }, ic('house', 13), P('Gestão de Pessoas', 'People management')), h('h2', { class: 't1 ph-h1' }, P('Início', 'Home')),
            h('p', { class: 'sub' }, P('O que está pendente hoje, do prazo mais antigo para o mais recente. Entrevistas e conversas são criadas sozinhas a partir da folha.', 'What is pending today, from the oldest deadline to the newest. Interviews and conversations are created on their own from payroll.'))),
          (() => { const k = ui.kpis([
            { rotulo: P('Entrevistas a preencher', 'Interviews to fill in'), valor: conta(['ent']), icone: IC.userminus, tom: 'alerta' },
            { rotulo: P('Conversas 30/90 a preencher', '30/90 conversations to fill in'), valor: conta(['c30', 'c90']), icone: IC.calcheck, tom: 'erro' },
            { rotulo: P('Sem entrevista (folha)', 'No interview (payroll)'), valor: conta(['sem']), icone: IC.file, tom: 'alerta' },
            { rotulo: P('Férias a vencer em 60 dias', 'Vacation due in 60 days'), valor: FERIAS.length, icone: IC.calendar, tom: 'erro' }]); k.classList.add('gp-pend'); return k; })(),
          h('div', { class: 'duo' },
            ui.cartao({ titulo: P('Pendências por prazo', 'Pending by deadline'), icone: IC.clock, classe: 'gp-prazo', conteudo: [
              h('p', { class: 'dim' }, P('Criadas automaticamente a partir da folha. Transcreva o formulário em papel.', 'Created automatically from payroll. Transcribe the paper form.')),
              ui.tabela({ placeholder: P('Localizar por nome', 'Find by name'), ordem: { coluna: 'desde', dir: 'asc' }, vazio: P('Nenhuma pendência.', 'Nothing pending.'), linhas, colunas: [
                { id: 'col', rotulo: P('Colaborador', 'Employee'), valor: l => l.nome, render: l => nomeCel(l.nome, l.k) },
                { id: 'tipo', rotulo: P('Pendência', 'Item'), valor: l => t(TIPO[l.tipo][0]) },
                { id: 'desde', rotulo: P('Desde', 'Since'), tipo: 'data', valor: l => l.desde },
                { id: 'limite', rotulo: P('Prazo limite', 'Deadline'), tipo: 'data', valor: l => l.limite, render: l => (l.limite ? fmt.data(l.limite) : '-') },
                { id: 'dias', rotulo: P('Dias pendentes', 'Days pending'), tipo: 'numero', valor: l => l.dias },
                { id: 'sit', rotulo: P('Situação', 'Status'), valor: l => t(l.sit[0]), render: l => selo(l.sit) },
                { id: 'acao', rotulo: '', ordenavel: false, render: l => ui.botao({ texto: TIPO[l.tipo][1], tom: 'primario', tamanho: 'p', aoClicar: () => foraModal(TIPO[l.tipo][1]) }) },
              ].map(semValor) })] }),
            ui.cartao({ titulo: P('Férias a vencer em 60 dias', 'Vacation due in 60 days'), icone: IC.calendar, conteudo: [
              ui.tabela({ busca: false, linhas: FERIAS.map(([nome, k, d]) => ({ nome, k, d, vence: dia(d) })), colunas: [
                { id: 'col', rotulo: P('Colaborador', 'Employee'), valor: f => f.nome, render: f => nomeCel(f.nome, f.k) },
                { id: 'vence', rotulo: P('Vence em', 'Due on'), tipo: 'data', valor: f => f.vence },
                { id: 'sit', rotulo: P('Situação', 'Status'), ordenavel: false, render: f => selo(f.d < 0 ? [P('Prazo estourado', 'Overdue'), 'erro'] : [P('em ' + f.d + ' dias', 'in ' + f.d + ' days'), 'alerta']) },
              ].map(semValor) }),
              h('p', { class: 'dim' }, P('Lido da folha, somente leitura.', 'Read from payroll, read only.'))] })));
      }

      const raiz = h('div', { class: 'gp x-shell' });
      el.append(raiz);
      const abas = ui.abas({ chave: 'tela', rotulo: P('Telas do Gestão de Pessoas', 'People management screens'),
        abas: ABAS.map(([id, rotulo, icn]) => ({ id, rotulo, icone: IC[icn], contador: id === 'inicio' ? PENDENCIAS.length : 0,
          montar: pn => (id === 'inicio' ? telaInicio(pn) : pn.append(fora(rotulo))) })) }, E);
      abas.querySelector('.ph-abas-lista').classList.add('gp-nav');
      raiz.append(abas);
    },
  });
})();
