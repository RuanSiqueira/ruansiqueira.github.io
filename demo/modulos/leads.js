/* Leads e campanhas · versão pública curta do módulo (id leads) para o site.
   Só a tela principal (Dashboard) é navegável, com dados fictícios já prontos; as outras abas mostram o cartão
   "fora da demonstração". Visual do kit do hub, nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const pad = (n, k) => String(n).padStart(k, '0');

  /* envios por dia nos últimos 30 dias, do mais antigo (índice 0) a hoje: [total, enviados, erros]. Os leads de hoje ainda esperam o ciclo. */
  const SERIE = [
    [3, 3, 0], [2, 2, 0], [0, 0, 0], [3, 2, 1], [2, 2, 0], [3, 3, 0], [2, 2, 0], [0, 0, 0], [3, 3, 0], [2, 1, 1],
    [3, 3, 0], [2, 2, 0], [3, 2, 0], [2, 2, 0], [0, 0, 0], [3, 3, 0], [2, 2, 0], [3, 2, 1], [2, 2, 0], [3, 3, 0],
    [2, 2, 0], [0, 0, 0], [3, 3, 0], [2, 2, 0], [3, 2, 1], [2, 2, 0], [3, 3, 0], [2, 1, 1], [3, 3, 0], [0, 0, 0],
  ];
  const LEADS_HOJE = 6, AGUARDANDO_HOJE = 5;
  const ULTIMOS = [
    ['Paula Mendes', 'Enviado', -1, '16:42'], ['Otávio Rocha', 'Enviado', -1, '15:10'], ['Olívia Prado', 'Erro', -1, '11:27'],
    ['Marcos Costa', 'Enviado', -2, '17:05'], ['Larissa Alves', 'Ignorado', -2, '09:48'], ['Júlio Reis', 'Enviado', -3, '14:31'],
  ];
  const OPORTUNIDADES = [
    ['OP-77106', 'C-05006 · Ana Souza', '10', P('Lead novo', 'New lead'), 0],
    ['OP-77107', 'C-05007 · Bruno Lima', '20', P('Lead novo', 'New lead'), 0],
    ['OP-77112', 'C-05012 · Paula Mendes', '20', P('Contatado pela automação', 'Contacted by the automation'), -1],
    ['OP-77113', 'C-05013 · Otávio Rocha', '10', P('Contatado pela automação', 'Contacted by the automation'), -1],
    ['OP-77114', 'C-05014 · Olívia Prado', '20', P('Erro no contato', 'Contact error'), -1],
    ['OP-77117', 'C-05017 · Felipe Gomes', '10', P('Oportunidade de exportação', 'Export opportunity'), -2],
    ['OP-77118', 'C-05018 · Marcos Costa', '20', P('Contatado pela automação', 'Contacted by the automation'), -2],
    ['OP-77121', 'C-05021 · Júlio Reis', '10', P('Contatado pela automação', 'Contacted by the automation'), -3],
  ];
  const ST = { Enviado: [P('Enviado', 'Sent'), 'ok'], Erro: [P('Erro', 'Error'), 'erro'], Ignorado: [P('Ignorado', 'Skipped'), 'neutro'] };

  Hub.registrar({
    id: 'leads',
    ordem: 6,
    grupo: P('Comercial', 'Sales'),
    icone: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M12 12l7-7M16 5h3v3"/>',
    nome: P('Leads e campanhas', 'Leads and campaigns'),
    resumo: P(
      'Responde ao lead do marketing em minutos pelo WhatsApp, avança a oportunidade no ERP, manda o lead de exportação para o setor certo e dispara campanhas por lista em WhatsApp e e-mail.',
      'Answers the marketing lead within minutes on WhatsApp, moves the opportunity forward in the ERP, routes export leads to the right team and runs list campaigns on WhatsApp and email.'
    ),
    manual: {
      pt: {
        destaque: 'Leads e campanhas responde ao lead do marketing enquanto o interesse está quente: quem baixa um catálogo no site recebe pelo WhatsApp a mensagem da divisão certa, a oportunidade avança no ERP e cada envio fica registrado. Na mesma tela, a equipe dispara campanhas para listas de clientes por WhatsApp e por e-mail.',
        oque: 'O que é. Uma tela do hub com seis abas: Dashboard, Leads, Log de Disparos, Disparos, Exportação e Configurações. Mostra os envios do período, os leads do dia, os que aguardam e os erros, e guarda o histórico de cada contato.\n\nO problema. O lead que baixava um catálogo no site entrava no ERP e esperava alguém copiar o telefone e mandar a primeira mensagem. O lead de uma feira internacional caía no funil nacional e era repassado à mão. Campanhas por lista dependiam de planilha e de envio manual, sem registro de quem recebeu.\n\nNesta demonstração. A tela principal funciona com dados fictícios; as outras abas ficam fora da demonstração pública.',
        finalidade: 'Para que serve. Responder ao lead em minutos, sem depender de alguém copiar contato de um sistema para outro e sem interromper o vendedor que já conversa com o cliente. Levar o lead de exportação direto ao setor certo. Disparar campanhas com registro de cada envio.',
        alcance: [
          'Cada lead novo recebe o modelo da sua divisão, sem interromper atendimento em andamento',
          'Lead de exportação encaminhado ao CRM de exportação, sem duplicar a oportunidade',
          'Oportunidade atualizada no ERP depois de cada contato',
          'Campanhas por lista em WhatsApp e e-mail, com fila em segundo plano',
          'Painel e histórico de envios, com exportação em planilha',
        ],
        tecnologias: ['Next.js / React', 'TypeScript', 'C# / .NET', 'SQL Server', 'API REST', 'Plataforma de WhatsApp', 'E-mail'],
      },
      en: {
        destaque: 'Leads and campaigns answers the marketing lead while interest is still warm: whoever downloads a catalogue on the website gets the right division message on WhatsApp, the opportunity moves forward in the ERP and every send is logged. On the same screen, the team runs campaigns for customer lists on WhatsApp and email.',
        oque: 'What it is. A hub screen with six tabs: Dashboard, Leads, Send Log, Sends, Export and Settings. It shows the sends in the period, today\'s leads, the ones waiting and the errors, and keeps the history of every contact.\n\nThe problem. A lead who downloaded a catalogue on the website landed in the ERP and waited for someone to copy the phone number and send the first message. A lead from an international trade fair fell into the domestic funnel and was handed over by hand. List campaigns depended on spreadsheets and manual sending, with no record of who received what.\n\nIn this demo. The main screen runs on fictitious data; the other tabs are not part of the public demo.',
        finalidade: 'What it is for. Answering the lead within minutes, without anyone copying contacts from one system to another and without interrupting a sales rep who is already talking to the customer. Sending the export lead straight to the right team. Running campaigns with a record of every send.',
        alcance: [
          'Every new lead gets the template of its division, without interrupting ongoing service',
          'Export leads routed to the export CRM, with no duplicate opportunity',
          'Opportunity updated in the ERP after every contact',
          'List campaigns on WhatsApp and email, with a background queue',
          'Dashboard and send history, with spreadsheet export',
        ],
        tecnologias: ['Next.js / React', 'TypeScript', 'C# / .NET', 'SQL Server', 'REST API', 'WhatsApp platform', 'Email'],
      },
    },
    /* mini tour: só ganchos do módulo (data-f, .lds-*), nada que dependa do idioma */
    tour: [
      { alvo: '.lds-real [data-f="aba-dashboard"]', acao: 'clicar', titulo: P('O painel dos leads', 'The leads dashboard'),
        texto: P('Quem baixa um catálogo no site recebe a mensagem certa pelo WhatsApp em minutos. Este painel mostra como isso anda.',
          'Whoever downloads a catalogue on the website gets the right message on WhatsApp within minutes. This dashboard shows how it is going.') },
      { alvo: '.lds-real .lds-kpis', titulo: P('Os números do dia', 'The numbers of the day'),
        texto: P('Disparados no período, leads de hoje, os que aguardam o próximo ciclo e os erros, cada um no seu destaque.',
          'Sent in the period, today\'s leads, the ones waiting for the next cycle and the errors, each one easy to spot.') },
      { alvo: '.lds-real .lds-g2', titulo: P('Dia a dia e um a um', 'Day by day and one by one'),
        texto: P('As barras comparam enviados e total de cada dia, e os últimos contatos trazem o resultado de cada envio.',
          'The bars compare sent and total for each day, and the latest contacts show the result of each send.') },
      { alvo: '.lds-real [data-f="pd-30d"]', acao: 'clicar', titulo: P('Escolha o período', 'Pick the period'),
        texto: P('Hoje, 7 dias, 30 dias ou o mês: o painel inteiro acompanha a escolha.', 'Today, 7 days, 30 days or the month: the whole dashboard follows your choice.') },
      { alvo: '.lds-real [data-f="aba-exportacao"]', acao: 'clicar', titulo: P('Lead de exportação no lugar certo', 'Export leads in the right place'),
        texto: P('O lead de uma feira internacional não se perde no funil nacional: segue direto para a equipe de exportação. Leads, logs e campanhas moram nas outras abas.',
          'A lead from an international trade fair does not get lost in the domestic funnel: it goes straight to the export team. Leads, logs and campaigns live in the other tabs.') },
      { alvo: '.lds-real .ph-fora', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('Aqui o vídeo mostra o sistema completo em ação. Gostou? Logo abaixo dá para falar comigo e ver tudo funcionando de verdade.',
          'Here the video shows the full system in action. Liked it? Right below you can reach me and see it all running for real.') },
    ],

    montar(el, api) {
      const { t, h, ui, fmt } = api;
      const E = api.estado;
      injetarCss();
      if (!E.aba) E.aba = 'dashboard';
      if (!E.per) E.per = '7d';
      let carregando = false;

      const ic = (nome, tam, classe) => { const s = api.icone(IC[nome], 'lds-ic' + (classe ? ' ' + classe : '')); s.style.cssText = 'width:' + tam + 'px;height:' + tam + 'px'; return s; };
      const btn = (texto, aoClicar, o = {}) => {
        const b = ui.botao({ texto, aoClicar, icone: o.ic && IC[o.ic], tom: o.tom || 'secundario', tamanho: 'p', titulo: o.titulo, classe: o.classe });
        if (o.f) b.setAttribute('data-f', o.f);
        return b;
      };
      const stB = s => { const b = ui.badge(ST[s][0], ST[s][1]); b.classList.add('lds-st'); return b; };
      const fDia = d => (api.lang === 'en' ? pad(d.getMonth() + 1, 2) + '/' + pad(d.getDate(), 2) : pad(d.getDate(), 2) + '/' + pad(d.getMonth() + 1, 2));
      const fData = d => fDia(d) + '/' + String(d.getFullYear()).slice(2) + ', ' + pad(d.getHours(), 2) + ':' + pad(d.getMinutes(), 2);
      const foraDaDemo = titulo => (ui.foraDaDemo ? ui.foraDaDemo({ titulo })
        : ui.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is not part of the public demo.') }));

      const raiz = h('div', { class: 'lds-real lds-raiz' });
      el.append(raiz);
      function pintar(foco) {
        raiz.replaceChildren(faixaDemo(), abas());
        const alvo = foco && raiz.querySelector('[data-f="' + foco + '"]');
        if (alvo) alvo.focus();
      }

      /* faixa discreta com as ajudas da demonstração; no celular nasce fechada para o sistema aparecer primeiro */
      const estreito = () => { try { return matchMedia('(max-width: 639.98px)').matches; } catch (e) { return false; } };
      function faixaDemo() {
        return h('details', { class: 'lds-demo', open: E.demo != null ? E.demo : !estreito(), ontoggle: ev => { E.demo = !!ev.target.open; } },
          h('summary', null, ic('sliders', 13), h('span', null, P('Controles da demonstração', 'Demo controls')), h('span', { class: 'nota' }, P('não fazem parte do sistema real', 'not part of the real system')), ic('chevd', 13)),
          h('div', { class: 'corpo' },
            btn(P('O que a rotina faz', 'What the job does'), rastroCiclo, { ic: 'server', f: 'demo-rotina' }),
            btn(P('Ver oportunidades no ERP', 'View opportunities in the ERP'), erpLista, { ic: 'window', f: 'demo-erp' })));
      }

      const ABAS = [['dashboard', 'chart', P('Dashboard', 'Dashboard')], ['leads', 'users', P('Leads', 'Leads')], ['log', 'clipl', P('Log de Disparos', 'Send Log')],
        ['disparos', 'mega', P('Disparos', 'Sends')], ['exportacao', 'globe', P('Exportação', 'Export')], ['configuracoes', 'gear', P('Configurações', 'Settings')]];
      const CONTA = { leads: AGUARDANDO_HOJE, log: 2, exportacao: 1 };
      function abas() {
        const bAtualizar = btn(null, atualizar, { ic: 'refresh', titulo: P('Atualizar', 'Refresh'), f: 'refresh' });
        if (carregando) bAtualizar.querySelector('.ph-ico').classList.add('lds-gira');
        const el = ui.abas({
          chave: 'aba', rotulo: P('Seções de leads e campanhas', 'Leads and campaigns sections'), acoes: [bAtualizar],
          abas: ABAS.map(([id, icn, rot]) => ({ id, rotulo: rot, icone: IC[icn], contador: CONTA[id] || 0,
            montar: pn => { pn.classList.add('lds-conteudo'); pn.append(...(id === 'dashboard' ? abaDashboard() : [foraDaDemo(rot)])); } })),
        });
        const nav = el.querySelector('.ph-abas-lista');
        nav.classList.add('lds-tabs');
        Array.from(nav.children).forEach((b, i) => b.setAttribute('data-f', 'aba-' + ABAS[i][0]));
        return el;
      }
      function atualizar() { carregando = true; pintar('refresh'); api.depois(() => { carregando = false; pintar('refresh'); }, 450); }

      /* ================= Dashboard ================= */
      const PERIODOS = [['hoje', P('Hoje', 'Today')], ['7d', P('Últimos 7d', 'Last 7d')], ['30d', P('Últimos 30d', 'Last 30d')], ['mes', P('Este mês', 'This month')]];
      const diasDo = per => ({ hoje: 1, '7d': 7, '30d': 30, mes: Math.min(30, new Date().getDate()) }[per] || 7);
      function abaDashboard() {
        const k = diasDo(E.per);
        const dias = SERIE.slice(-k).map((d, i) => ({ d, data: api.data(i - k + 1) })).filter(x => x.d[0]);
        const env = dias.reduce((s, x) => s + x.d[1], 0), err = dias.reduce((s, x) => s + x.d[2], 0);
        const max = Math.max(1, ...dias.map(x => x.d[0]));
        const per = ui.chips({ rotulo: P('Período', 'Period'), opcoes: PERIODOS.map(([valor, texto]) => ({ valor, texto })), valor: E.per, aoMudar: v => { E.per = v; pintar('pd-' + v); } });
        Array.from(per.children).forEach((b, i) => b.setAttribute('data-f', 'pd-' + PERIODOS[i][0]));
        per.classList.add('lds-per-g');
        const kp = ui.kpis([
          { rotulo: P('Disparados', 'Sent'), valor: fmt.num(env), tom: 'ok', icone: IC.send },
          { rotulo: P('Leads hoje', 'Leads today'), valor: fmt.num(LEADS_HOJE), tom: 'info', icone: IC.users },
          { rotulo: P('Aguardando hoje', 'Waiting today'), valor: fmt.num(AGUARDANDO_HOJE), tom: 'erro', icone: IC.clock },
          { rotulo: P('Erros período', 'Errors in period'), valor: fmt.num(err), tom: 'erro', icone: IC.alert },
        ]);
        kp.classList.add('lds-kpis');
        Array.from(kp.children).forEach(c => c.classList.add('lds-kpi'));
        const cartao = (icone, titulo, ...conteudo) => ui.cartao({ classe: 'lds-card', icone: IC[icone], titulo, conteudo });
        return [
          h('div', { class: 'lds-per' }, ic('calendar', 15, 'mut'), per),
          kp,
          h('div', { class: 'lds-g2' },
            cartao('chart', P('Disparos por dia', 'Sends per day'),
              dias.length ? h('div', { class: 'lds-barras' }, dias.map(({ d, data }) => h('div', { class: 'lin' },
                h('span', { class: 'dia' }, fDia(data)),
                h('div', { class: 'trilho', 'aria-hidden': 'true' }, h('div', { class: 'tot', style: { width: (d[0] / max * 100) + '%' } }), h('div', { class: 'env', style: { width: (d[1] / max * 100) + '%' } })),
                h('span', { class: 'n', title: P(d[1] + ' enviados de ' + d[0], d[1] + ' sent of ' + d[0]) }, d[1] + t(P(' env', ' sent'))))))
                : h('p', { class: 'lds-vazio' }, P('Sem dados no período', 'No data in the period')),
              h('div', { class: 'lds-leg' }, h('span', null, h('i', { class: 'q env' }), P('Enviados', 'Sent')), h('span', null, h('i', { class: 'q tot' }), P('Total', 'Total')))),
            cartao('send', P('Últimos disparos', 'Latest sends'),
              h('div', { class: 'lds-ult' }, ULTIMOS.map(([nome, st, dia, hora]) => h('div', { class: 'r' }, stB(st), h('span', { class: 'nm' }, nome), h('span', { class: 'dt' }, fData(api.data(dia, hora)))))),
              btn(P('Ver todos os logs', 'See all logs'), () => { E.aba = 'log'; pintar('aba-log'); }, { tom: 'fantasma', ic: 'right', f: 'ver-logs', classe: 'lds-link' }))),
        ];
      }

      /* ================= ajudas da demonstração ================= */
      function rastroCiclo() {
        ui.backend({
          titulo: P('Ciclo de disparo dos leads', 'Lead send cycle'), subtitulo: P('Rotina automática do hub', 'Hub scheduled job'),
          passos: [
            { tipo: 'erp', ms: 140, titulo: P('Lê os leads novos do ERP', 'Reads the new leads from the ERP') },
            { tipo: 'whatsapp', ms: 180, titulo: P('Confere se já há conversa em andamento', 'Checks whether a conversation is already under way') },
            { tipo: 'whatsapp', ms: 420, titulo: P('Envia o modelo da divisão', 'Sends the division template') },
            { tipo: 'erp', ms: 160, titulo: P('Atualiza a oportunidade', 'Updates the opportunity') },
          ],
          resumo: P('Cada lead novo recebe o modelo da sua divisão, sem interromper atendimento em andamento.', 'Every new lead gets the template of its division, without interrupting ongoing service.'),
        });
      }
      function erpLista() {
        ui.erp({
          programa: P('Oportunidades de venda', 'Sales opportunities'), codigo: 'ERP-0310', consulta: true, largura: 900, colunas: 6,
          campos: [
            { rotulo: P('Origem', 'Source'), valor: P('Plataforma de marketing', 'Marketing platform'), largura: 2 },
            { rotulo: P('Oportunidades', 'Opportunities'), valor: String(OPORTUNIDADES.length), largura: 1 },
            { rotulo: P('Lead novo', 'New lead'), valor: '2', largura: 1, destaque: true },
          ],
          grade: {
            colunas: [P('Oportunidade', 'Opportunity'), P('Cliente', 'Customer'), P('Divisão', 'Division'), P('Etapa', 'Stage'), P('Abertura', 'Opened')],
            linhas: OPORTUNIDADES.map(([op, cli, div, etapa, dia]) => [op, cli, div, t(etapa), fmt.data(api.data(dia))]), alturaMax: 240,
          },
          acoes: [{ texto: P('Fechar', 'Close'), tom: 'primario' }],
        });
      }

      pintar();
    },
  });

  /* ================= ícones (traço único, grade 24x24) e o bloco de estilo ================= */
  const IC = {
    sliders: '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>',
    window: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/>',
    server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/>',
    right: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    clipl: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    mega: '<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
    gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    send: '<path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  };
  const R = '.lds-real ';
  /* só layout e as peças sem equivalente no kit, com tokens --ph-* (nenhuma cor, fonte ou regra por tema) */
  const ROT = 'font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const CSS = [
    '.lds-real{min-width:0;color:var(--ph-text)}',
    R + 'p{margin:0}' + R + '.lds-ic{flex:none}' + R + '.lds-gira{animation:lds-gira 1s linear infinite}' + R + '.mut{color:var(--ph-text-muted)}',
    R + '.lds-demo{border-bottom:1px dashed var(--ph-border-soft);background:var(--ph-surface);font-size:13px;color:var(--ph-text-muted)}',
    R + '.lds-demo summary{cursor:pointer;padding:8px 16px;display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;list-style:none;' + ROT + ';color:var(--ph-text-dim)}' + R + '.lds-demo summary:focus-visible{outline-offset:-2px}',
    R + '.lds-demo summary::-webkit-details-marker{display:none}' + R + '.lds-demo summary .nota{font:400 12px/1.5 var(--ph-font);letter-spacing:0;text-transform:none;font-stretch:100%}' + R + '.lds-demo[open] summary .lds-ic:last-child{transform:rotate(180deg)}',
    R + '.lds-demo .corpo{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:2px 16px 12px;min-width:0}',
    R + '.lds-demo .ph-btn{max-width:100%;height:auto;min-height:2rem;white-space:normal;text-align:left}',
    R + '.lds-per{display:flex;gap:8px 10px;margin-bottom:16px;flex-wrap:wrap;align-items:center;min-width:0}' + R + '.lds-per-g{max-width:calc(100% - 25px)}',
    R + '.lds-kpis{margin-bottom:18px}',
    R + '.lds-g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;align-items:start}',
    R + '.lds-vazio{font-size:13px;color:var(--ph-text-dim);text-align:center;padding:20px 0}',
    R + '.lds-barras{display:flex;flex-direction:column;gap:8px}' + R + '.lds-barras .lin{display:flex;align-items:center;gap:10px}',
    R + '.lds-barras .dia{font-size:12px;color:var(--ph-text-muted);width:40px;flex:none;font-variant-numeric:tabular-nums}',
    R + '.lds-barras .trilho{flex:1;height:14px;background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio);overflow:hidden;position:relative;min-width:0}',
    R + '.lds-barras .tot{height:100%}' + R + '.lds-barras .env{position:absolute;top:0;left:0;height:100%;background:var(--ph-vivo-azul)}',
    R + '.lds-barras .tot,' + R + '.lds-leg .q.tot{background:color-mix(in srgb,var(--ph-vivo-azul) 30%,transparent)}',
    R + '.lds-barras .n{font-size:12px;color:var(--ph-text-2);width:52px;text-align:right;flex:none;font-variant-numeric:tabular-nums}',
    R + '.lds-leg{display:flex;gap:16px;font-size:12px;color:var(--ph-text-muted)}' + R + '.lds-leg span{display:flex;align-items:center;gap:6px}',
    R + '.lds-leg .q{width:10px;height:10px;border-radius:2px;display:inline-block}' + R + '.lds-leg .q.env{background:var(--ph-vivo-azul)}',
    R + '.lds-ult{display:flex;flex-direction:column}' + R + '.lds-ult .r{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--ph-border);min-width:0}' + R + '.lds-ult .r:last-child{border-bottom:0}',
    R + '.lds-ult .nm{font-size:13px;color:var(--ph-text);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}' + R + '.lds-ult .dt{font-size:12px;color:var(--ph-text-dim);flex:none;font-variant-numeric:tabular-nums}',
    R + '.lds-link{align-self:flex-start}',
    '@keyframes lds-gira{to{transform:rotate(360deg)}}',
    '@media (max-width:767px){' + R + '.lds-g2{grid-template-columns:minmax(0,1fr)}}',
    '@media (max-width:639.98px){' + R + '.lds-demo .corpo{padding-inline:12px}}',
    '@media (prefers-reduced-motion:reduce){' + R + '.lds-gira{animation:none}}',
  ].join('\n');
  function injetarCss() {
    if (document.getElementById('lds-real-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'lds-real-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
})();
