/* Reativação de clientes (id disparos) · versão pública curta do ProjectHub de demonstração.
   Só o Painel é navegável, com números de exemplo já prontos; as outras telas do menu abrem o cartão "fora da demonstração".
   Dados fictícios, nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const pad = n => String(n).padStart(2, '0');
  const dm = d => pad(d.getDate()) + '/' + pad(d.getMonth() + 1);
  const ROT_P = { P1: P('P1 · Crítico', 'P1 · Critical'), P2: P('P2 · Alta', 'P2 · High'), P3: P('P3 · Baixa', 'P3 · Low') };
  const WA = P('Plataforma de WhatsApp', 'WhatsApp platform');

  /* números de exemplo, sempre os mesmos */
  let db = null;
  const semear = () => ({
    hoje: 46, mes: 612, total: 4870, erros: 3, aguardando: 18, quarentena: 1236, queda: false,
    serie: [38, 41, 35, 44, 52, 47, 49, 45, 39, 51, 48, 43, 50, 46],
    pp: { P1: 14, P2: 19, P3: 13 },
    atividade: [
      ['10:42:18', P('Enviado P2', 'Sent P2'), WA, 512, 'ok'],
      ['10:42:10', P('Enviado P1', 'Sent P1'), WA, 468, 'ok'],
      ['10:42:02', P('Não entregue P3', 'Not delivered P3'), WA, 731, 'erro'],
      ['10:41:54', P('Enviado P2', 'Sent P2'), WA, 455, 'ok'],
      ['10:41:46', P('Enviado P1', 'Sent P1'), WA, 489, 'ok'],
      ['10:41:38', P('Enviado P3', 'Sent P3'), WA, 502, 'ok'],
      ['08:00:00', P('Início do envio', 'Sending started'), P('Rotina automática', 'Scheduled job'), 0, 'ok'],
      ['04:30:00', P('Fila do dia montada', 'Day queue built'), P('Banco de dados', 'Database'), 38200, 'ok'],
    ],
  });

  const NAV = [
    ['painel', P('Painel', 'Dashboard'), 'painel'],
    ['disparar', P('Disparar', 'Send'), 'send'],
    ['fila', P('Execução', 'Execution'), 'zap', { badge: true }],
    ['exclusoes', P('Exclusões', 'Exclusions'), 'ban'],
    ['config', P('Configurações', 'Settings'), 'ajustes'],
    { sep: P('Medição', 'Measurement') },
    ['resultados', P('Resultados', 'Results'), 'barras'],
    ['dashia', 'Dash IA', 'atividade', { tag: P('legado', 'legacy'), titulo: P('Dash IA (legado)', 'Dash IA (legacy)') }],
    { sep: 'CRM' },
    ['crm', P('Automação CRM', 'CRM automation'), 'radio'],
    { sep: P('Integração IA', 'AI integration') },
    ['carteiras', P('Carteiras', 'Portfolios'), 'usercog'],
    { sep: P('Prospecção', 'Prospecting'), cls: 'pros' },
    ['p_painel', P('Painel', 'Dashboard'), 'fluxo', { titulo: P('Prospecção · Painel', 'Prospecting · Dashboard') }],
    ['p_regras', P('Regras', 'Rules'), 'lista', { titulo: P('Prospecção · Regras', 'Prospecting · Rules') }],
    ['p_leads', 'Leads', 'predio', { titulo: P('Prospecção · Leads', 'Prospecting · Leads') }],
    ['p_config', P('Configurações', 'Settings'), 'regua', { titulo: P('Prospecção · Configurações', 'Prospecting · Settings') }],
  ];

  const IC = {
    painel: '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    ajustes: '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
    barras: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    predio: '<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>',
    regua: '<path d="M21 4h-7"/><path d="M10 4H3"/><path d="M21 12h-9"/><path d="M8 12H3"/><path d="M21 20h-5"/><path d="M12 20H3"/><path d="M14 2v4"/><path d="M8 10v4"/><path d="M16 18v4"/>',
    okc: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    alerta: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>',
    atividade: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    radio: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
    usercog: '<circle cx="18" cy="15" r="3"/><circle cx="9" cy="7" r="4"/><path d="M10 15H6a4 4 0 0 0-4 4v2"/><path d="m21.7 16.4-.9-.3"/><path d="m15.2 13.9-.9-.3"/><path d="m16.6 18.7.3-.9"/><path d="m19.1 12.2.3-.9"/><path d="m19.6 18.7-.4-1"/><path d="m16.8 12.3-.4-1"/><path d="m14.3 16.6 1-.4"/><path d="m20.7 13.8 1-.4"/>',
    menuf: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/>',
    menua: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m14 9 3 3-3 3"/>',
    fluxo: '<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
    lista: '<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
    controles: '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',
    play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  };

  const CSS = [
    '.dspr{--accent:var(--ph-accent);--line:var(--ph-border);--surface:var(--ph-card);--surface-3:var(--ph-card-2);--ink:var(--ph-text);--muted:var(--ph-text-muted);--font-display:var(--ph-font-display);--p1:var(--ph-erro);--p2:var(--ph-alerta);--p3:var(--ph-info)}',
    '.dsp-raiz{min-width:0;display:flex;flex-direction:column;color:var(--ph-text);font-size:13.5px;line-height:1.5}',
    '.dspr .mono{font-family:var(--ph-font-mono);font-variant-numeric:tabular-nums}',
    '.dspr .sr-only{position:absolute;width:1px;height:1px;margin:-1px;padding:0;border:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}',
    '.dspr .dsp-g{display:grid;grid-template-columns:214px minmax(0,1fr);position:relative;height:calc(100vh - 150px);min-height:540px}',
    '.dspr .dsp-g.mini{grid-template-columns:62px minmax(0,1fr)}',
    '.dspr .dmain{min-width:0;overflow-y:auto;height:100%;max-height:100vh;container:dsp-main/inline-size}',
    '.dspr .wrap{padding:clamp(16px,2.4vw,28px) clamp(16px,2.8vw,40px) 48px;width:100%}',
    '@media(max-width:1068px){.dspr .dsp-g,.dspr .dsp-g.mini{grid-template-columns:minmax(0,1fr);height:auto;min-height:0}.dspr .dmain{max-height:none;overflow-x:hidden}}',
    '.dspr .aside{background:var(--ph-surface);border-right:1px solid var(--ph-border);padding:10px;display:flex;flex-direction:column;gap:1px;position:sticky;top:0;height:100%;max-height:100vh;overflow:auto}',
    '.dspr .nav-topo{display:flex;justify-content:flex-end;margin-bottom:4px}',
    '.dspr .nav{appearance:none;background:none;border:0;position:relative;width:100%;min-height:36px;padding:7px 10px;border-radius:var(--ph-raio);color:var(--ph-text-2);font:inherit;font-size:13.5px;font-weight:500;cursor:pointer;display:flex;align-items:center;gap:9px;text-align:left}',
    '.dspr .nav:hover{background:var(--ph-card-2);color:var(--ph-text)}',
    '.dspr .nav.active{background:var(--ph-active-bg);color:var(--ph-active-fg);font-weight:600;box-shadow:inset 3px 0 0 var(--ph-accent)}',
    '.dspr .nav .ph-ico{width:17px;height:17px}.dspr .nav .badge{margin-left:auto;width:8px;height:8px;border-radius:50%;background:var(--ph-erro);flex:none}.dspr .nav .opt{margin-left:auto}',
    '.dspr .sep{padding:14px 10px 4px;font:600 11px/1.4 var(--ph-font-mono);letter-spacing:.14em;text-transform:uppercase;color:var(--ph-text-dim)}.dspr .sep.pros{color:var(--ph-accent-light)}',
    '.dspr .dsp-g.mini .aside{padding:10px 8px;align-items:center}.dspr .dsp-g.mini .nav{justify-content:center;padding:9px 0;width:44px}.dspr .dsp-g.mini .nav .lbl,.dspr .dsp-g.mini .nav .opt{display:none}',
    '.dspr .dsp-g.mini .nav .badge{position:absolute;top:6px;right:6px;margin:0}.dspr .dsp-g.mini .nav-topo{justify-content:center}',
    '.dspr .dsp-g.mini .sep{width:100%;height:1px;padding:0;margin:8px 0;background:var(--ph-border);font-size:0;color:transparent;overflow:hidden}',
    '@media(max-width:1068px){.dspr .aside,.dspr .dsp-g.mini .aside{position:static;height:auto;max-height:none;flex-direction:row;flex-wrap:wrap;align-items:center;overflow:visible;border-right:0;border-bottom:1px solid var(--ph-border)}.dspr .aside .nav,.dspr .dsp-g.mini .nav{width:auto;padding:7px 10px}.dspr .sep,.dspr .dsp-g.mini .sep,.dspr .nav-topo{display:none}}',
    '.dspr .opt{white-space:nowrap;font:600 10.5px/1.4 var(--ph-font-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--ph-text-muted);background:var(--ph-card-2);padding:2px 7px;border-radius:var(--ph-raio)}',
    '.dspr .demo{border-bottom:1px dashed var(--ph-border-soft);background:var(--ph-surface);font-size:13px;color:var(--ph-text-muted)}',
    '.dspr .demo summary{cursor:pointer;padding:8px 16px;display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;list-style:none;font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch);color:var(--ph-text-dim)}',
    '.dspr .demo summary::-webkit-details-marker{display:none}.dspr .demo summary .nota{font:400 12px/1.5 var(--ph-font);letter-spacing:0;text-transform:none;font-stretch:100%}.dspr .demo[open] summary .ph-ico:last-child{transform:rotate(180deg)}',
    '.dspr .demo .corpo{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:2px 16px 12px}.dspr .demo .estado{flex:1 1 100%;font-size:13px;line-height:1.5;color:var(--ph-text)}.dspr .demo .estado.al{color:var(--ph-alerta)}',
    '.dspr .card.ph-card{display:block;flex-direction:row;min-width:0;padding:0}',
    '.dspr .ch{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:14px 18px 0}.dspr .ch .mini{font:400 11.5px/1.4 var(--ph-font-mono);color:var(--ph-text-dim)}',
    '.dspr .ph-card-titulo{margin:0;display:flex;align-items:center;gap:8px;flex-wrap:wrap}',
    '.dspr .kpis{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr))}',
    '.dspr .kpi.ph-kpi{gap:4px}.dspr .kpi .d{display:flex;align-items:center;gap:4px;flex-wrap:wrap}',
    '.dspr .up{color:var(--ph-ok)}.dspr .down{color:var(--ph-erro)}',
    '.dspr table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;color:var(--ph-text-2)}',
    '.dspr .ph-tabela th{padding:10px 14px}.dspr td.num{font-family:var(--ph-font-mono);font-variant-numeric:tabular-nums}.dspr td b{font-weight:600;color:var(--ph-text)}',
    '.dspr .tblwrap{overflow-x:auto}',
    '.dspr .facet{display:flex;flex-direction:column;gap:13px}.dspr .facet .fr{display:flex;flex-direction:column;gap:6px}.dspr .facet .fr .t{display:flex;justify-content:space-between;align-items:center;font-size:13px}',
    '.dspr .bar{height:8px;border-radius:999px;background:var(--ph-card-2);overflow:hidden}.dspr .bar i{display:block;height:100%;border-radius:inherit}',
    '.dspr .grid{display:grid;gap:14px}.dspr .grid>*{min-width:0}.dspr .g2{grid-template-columns:2fr 1fr}',
    '@container dsp-main (max-width:760px){.dspr .g2{grid-template-columns:1fr}}',
  ].join('\n');

  Hub.registrar({
    id: 'disparos',
    ordem: 4,
    grupo: P('Comercial', 'Sales'),
    icone: '<path d="M4 5h16v11H9l-5 4z"/><path d="M9.2 12.2a3 3 0 1 0 .9-2.6M9.6 7.8v1.9h1.9"/>',
    nome: P('Reativação de clientes', 'Customer reactivation'),
    resumo: P(
      'Reativa quem parou de comprar e prospecta empresas novas pelo WhatsApp, com modelos aprovados, e acompanha cada contato até o pedido no funil do vendedor.',
      'Reactivates customers who stopped buying and prospects new companies over WhatsApp, with approved templates, and follows each contact through to the order in the sales rep funnel.'
    ),
    manual: {
      pt: {
        destaque: 'Reativa quem parou de comprar e prospecta empresas novas pelo WhatsApp, com modelos aprovados pela Meta, e acompanha cada contato até o pedido, abrindo a oportunidade no funil do vendedor sem ninguém digitar.',
        oque: 'O que é. Um módulo do hub que cuida da base de clientes de ponta a ponta: reativa quem parou de comprar e prospecta quem ainda não é cliente, sem ninguém montar lista, sem planilha e sem copiar e colar. O hub não é um ERP: é a camada sobre o ERP, que lê os dados de cliente e devolve só o registro do contato e a oportunidade no funil. Quem pede para sair nunca mais recebe.\n\nNesta versão pública, o Painel está aberto com dados fictícios; as outras telas aparecem no vídeo da versão completa.',
        finalidade: 'O problema. A reativação por WhatsApp era feita por um serviço contratado, com regra fechada: não dava para medir quem respondeu, quem orçou e quem comprou, nem excluir um cliente específico.\n\nO que mudou. A regra passou a ser da empresa, ajustável na tela e com rastro de cada contato do início ao fim. Cada disparo é acompanhado até o pedido, dentro de uma janela configurável, e o retorno passou a ser medido contra o ERP.\n\nResultado medido. A etapa mais pesada do painel de medição caiu de mais de 900 s para cerca de 18 s, com resultado idêntico. Antes de a ferramenta anterior ser desligada, o motor foi validado lado a lado com ela.\n\nProjetado e construído por Ruan Siqueira, do levantamento de requisitos à implantação.',
        alcance: [
          'Regras de elegibilidade, prioridade, horários e janelas ajustáveis pela tela, sem mexer no código',
          'Proteções contra envio repetido, queda da plataforma e envio fora de hora',
          'A prospecção nunca grava no ERP e respeita quem pediu para sair',
          'Telas: Painel, Disparar, Execução, Exclusões, Configurações, Resultados, Dash IA (legado), Automação CRM, Carteiras e, na Prospecção, Painel, Regras, Leads e Configurações',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript', 'DuckDB', 'Parquet', 'API da plataforma de WhatsApp', 'Webhook', 'Serviços em segundo plano'],
      },
      en: {
        destaque: 'Reactivates customers who stopped buying and prospects new companies over WhatsApp, with templates approved by Meta, and follows each contact through to the order, opening the opportunity in the sales rep funnel with nobody typing.',
        oque: 'What it is. A hub module that looks after the customer base end to end: it reactivates customers who stopped buying and prospects companies that are not customers yet, with nobody building lists, no spreadsheets and no copy and paste. The hub is not an ERP: it is the layer on top of the ERP, reading customer data and writing back only the contact record and the funnel opportunity. Whoever opts out never receives again.\n\nIn this public version, the Dashboard is open with fictitious data; the other screens appear in the video of the full version.',
        finalidade: 'The problem. WhatsApp reactivation was done by a contracted service with a closed rule: there was no way to measure who replied, who asked for a quote and who bought, nor to exclude a specific customer.\n\nWhat changed. The rule now belongs to the company, adjustable on screen and with a trace of every contact from start to finish. Each send is followed through to the order, within a configurable window, and return is now measured against the ERP.\n\nMeasured result. The heaviest step of the measurement dashboard went from more than 900 s to about 18 s, with an identical result. Before the previous tool was switched off, the engine was validated side by side against it.\n\nDesigned and built by Ruan Siqueira, from requirements gathering to deployment.',
        alcance: [
          'Eligibility, priority, schedule and window rules adjustable on screen, without touching the code',
          'Safeguards against repeated sending, platform outages and sending outside business hours',
          'Prospecting never writes to the ERP and respects whoever opted out',
          'Screens: Dashboard, Send, Execution, Exclusions, Settings, Results, Dash IA (legacy), CRM automation, Portfolios and, under Prospecting, Dashboard, Rules, Leads and Settings',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript', 'DuckDB', 'Parquet', 'WhatsApp platform API', 'Webhook', 'Background services'],
      },
    },
    /* mini tour: só ganchos do módulo (.dspr, data-k), nada que dependa do idioma; o 1o passo volta ao Painel */
    tour: [
      { alvo: '.dspr [data-k="nav-painel"]', acao: 'clicar', titulo: P('Clientes de volta pelo WhatsApp', 'Customers back through WhatsApp'),
        texto: P('Quem parou de comprar recebe uma mensagem com modelo aprovado, e cada contato é acompanhado até o pedido, no funil do vendedor. O Painel mostra o dia.',
          'Customers who stopped buying get a message with an approved template, and each contact is followed through to the order, in the sales rep funnel. The Dashboard shows the day.') },
      { alvo: '.dspr .kpis', titulo: P('O dia em números', 'The day in numbers'),
        texto: P('Envios de hoje, do mês e do total, os erros, quem aguarda na fila e quem descansa na quarentena antes de ser chamado de novo.',
          'Sends today, this month and in total, the errors, who waits in the queue and who rests in quarantine before being contacted again.') },
      { alvo: '.dspr .g2', titulo: P('Ritmo e prioridade', 'Pace and priority'),
        texto: P('Os envios dos últimos 14 dias e, ao lado, a divisão de hoje por faixa: crítica, alta e baixa.',
          'Sends over the last 14 days and, next to them, today\'s split by tier: critical, high and low.') },
      { alvo: '.dspr details.demo', titulo: P('Experimente você mesmo', 'Try it yourself'),
        texto: P('Nesta faixa você acompanha o próximo envio passo a passo ou simula uma queda da plataforma: o envio pausa com segurança e volta sozinho.',
          'In this strip you can follow the next send step by step or simulate a platform outage: sending pauses safely and resumes on its own.') },
      { alvo: '.dspr [data-k="nav-disparar"]', acao: 'clicar', titulo: P('O menu do sistema', 'The system menu'),
        texto: P('Daqui saem os disparos. No mesmo menu: Execução, Exclusões, Resultados e a Prospecção de empresas novas. Quem pede para sair nunca mais recebe.',
          'Sends start here. In the same menu: Execution, Exclusions, Results and the Prospecting of new companies. Whoever opts out never receives again.') },
      { alvo: '.dspr .ph-fora', titulo: P('Veja o sistema completo em ação', 'See the full system in action'),
        texto: P('Esta tela fica na versão completa, e o vídeo mostra o sistema inteiro funcionando. Quer ver ao vivo? É só me chamar por aqui.',
          'This screen lives in the full version, and the video shows the whole system running. Want to see it live? Just reach me from here.') },
    ],

    montar(el, api) {
      if (!db) db = semear();
      const { t, h, ui, fmt } = api;
      const E = api.estado;
      const e = (tag, classe, ...filhos) => h(tag, classe ? { class: classe } : null, ...filhos);
      if (!document.getElementById('dspr-css')) {
        const st = document.createElement('style');
        st.setAttribute('id', 'dspr-css');
        st.textContent = CSS;
        (document.head || document.documentElement).appendChild(st);
      }

      const ic = (nome, tam = 15) => h('span', { class: 'ph-ico ico', 'aria-hidden': 'true', style: 'width:' + tam + 'px;height:' + tam + 'px', html: '<svg viewBox="0 0 24 24" focusable="false">' + IC[nome] + '</svg>' });
      const K = { card: ui.cartao({}).className, kpi: ui.kpis([{ rotulo: '-', valor: '-' }]).querySelector('.ph-kpi').className };
      const TOM_PILL = { p1: 'erro', p2: 'alerta', p3: 'info', ok: 'ok', dim: 'neutro', err: 'erro' };
      const pill = (classe, ...txt) => { const x = ui.badge(txt, TOM_PILL[classe] || 'neutro'); x.classList.add('pill', classe); return x; };
      /* botão do módulo = botão do kit; o = { cls: 'primary' | 'ghost' e 'sm', ic, k, title, dis } */
      const btn = (texto, aoClicar, o = {}) => {
        const c = ' ' + (o.cls || '') + ' ';
        const bt = ui.botao({ texto, aoClicar, titulo: o.title, desabilitado: o.dis, classe: 'btn', icone: o.ic && IC[o.ic],
          tom: c.includes(' primary ') ? 'primario' : c.includes(' ghost ') ? 'fantasma' : 'secundario', tamanho: c.includes(' sm ') ? 'p' : null });
        if (o.k) bt.setAttribute('data-k', o.k);
        return bt;
      };
      /* redesenha um bloco preservando o foco do teclado */
      const comFoco = (raizF, fn) => {
        const a = document.activeElement;
        const k = a && a.getAttribute && raizF.contains(a) ? a.getAttribute('data-k') : null;
        fn();
        const alvo = k && Array.from(raizF.querySelectorAll('[data-k]')).find(x => x.getAttribute('data-k') === k);
        if (alvo) alvo.focus({ preventScroll: true });
      };
      const kpi = (lbl, n, d, o = {}) => h('div', { class: K.kpi + ' kpi', style: o.tom ? { '--tom': o.tom } : null },
        h('span', { class: 'ph-kpi-rotulo lbl' }, lbl), h('span', { class: 'ph-kpi-valor n', style: o.n }, n), h('span', { class: 'ph-kpi-detalhe d' + (o.d ? ' ' + o.d : '') }, d));

      function svgArea(vals, rotulo) {
        const mx = Math.max(1, ...vals) * 1.1, X = i => 6 + i / (vals.length - 1) * 628, Y = v => 184 - (v / mx) * 168;
        const linha = vals.map((v, i) => (i ? 'L' : 'M') + X(i).toFixed(1) + ' ' + Y(v).toFixed(1)).join(' ');
        return '<svg viewBox="0 0 640 210" role="img" aria-label="' + rotulo + '" focusable="false" style="width:100%;height:auto;display:block;padding:8px 6px 0">' +
          '<defs><linearGradient id="dspag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent);stop-opacity:.22"/><stop offset="1" style="stop-color:var(--accent);stop-opacity:0"/></linearGradient></defs>' +
          [0, 1, 2, 3].map(g => '<line x1="0" x2="640" y1="' + (16 + g * 56) + '" y2="' + (16 + g * 56) + '" style="stroke:var(--line)" stroke-width="1"/>').join('') +
          '<path d="' + linha + ' L' + X(vals.length - 1).toFixed(1) + ' 184 L6 184 Z" fill="url(#dspag)"/>' +
          '<path d="' + linha + '" style="fill:none;stroke:var(--accent)" stroke-width="2.4" stroke-linejoin="round"/>' +
          '<circle cx="' + X(vals.length - 1).toFixed(1) + '" cy="' + Y(vals[vals.length - 1]).toFixed(1) + '" r="3.6" style="fill:var(--accent);stroke:var(--surface)" stroke-width="2"/></svg>';
      }
      function svgRosca(pp, rotulo) {
        const tot = pp.P1 + pp.P2 + pp.P3, circ = 2 * Math.PI * 48;
        let off = 0;
        const seg = ['P1', 'P2', 'P3'].map(k => {
          const len = pp[k] / tot * circ;
          const s = '<circle cx="59" cy="59" r="48" style="fill:none;stroke:var(--' + k.toLowerCase() + ')" stroke-width="14" stroke-dasharray="' + len.toFixed(1) + ' ' + (circ - len).toFixed(1) + '" stroke-dashoffset="' + (-off).toFixed(1) + '" transform="rotate(-90 59 59)"/>';
          off += len;
          return s;
        }).join('');
        return '<svg width="118" height="118" viewBox="0 0 118 118" role="img" aria-label="' + rotulo + ': ' + tot + '" focusable="false">' +
          '<circle cx="59" cy="59" r="48" style="fill:none;stroke:var(--surface-3)" stroke-width="14"/>' + seg +
          '<text x="59" y="56" text-anchor="middle" font-weight="800" font-size="22" style="fill:var(--ink);font-family:var(--font-display)">' + fmt.num(tot) + '</text>' +
          '<text x="59" y="72" text-anchor="middle" font-size="9" style="fill:var(--muted)">' + rotulo + '</text></svg>';
      }

      /* ================= TELA · PAINEL (a única aberta na versão pública) ================= */
      function pintarPainel(p) {
        const tot = db.pp.P1 + db.pp.P2 + db.pp.P3;
        const dias = db.serie.map((n, i) => ({ dia: api.data(i - 13), n }));
        p.append(
          h('div', { class: 'kpis', style: 'margin-bottom:14px' },
            kpi(P('Disparos hoje', 'Sends today'), fmt.num(db.hoje), P('enviados pelo motor hoje', 'sent by the engine today')),
            kpi(P('Disparos no mês', 'Sends this month'), fmt.num(db.mes), P('somando dia a dia', 'adding up day by day'), { d: 'up', tom: 'var(--ph-cor-azul)' }),
            kpi(P('Disparos no total', 'Sends in total'), fmt.num(db.total), P('desde o início do módulo', 'since the module started'), { tom: 'var(--ph-cor-teal)' }),
            kpi(P('Erros no mês', 'Errors this month'), fmt.num(db.erros), P('requer atenção', 'needs attention'), { tom: 'var(--ph-erro)' }),
            kpi(P('Aguardando', 'Waiting'), fmt.num(db.aguardando), P('na fila agora', 'queued right now'), { tom: 'var(--ph-alerta)' }),
            kpi(P('Na quarentena', 'In quarantine'), fmt.num(db.quarentena), P('voltam ao fim do prazo', 'back when the period ends'), { d: 'down', tom: 'var(--ph-cor-violeta)' }),
            kpi(P('Disparo automático', 'Automatic sending'), pill('ok', P('ligado', 'on')), P('ligado em Configurações', 'switched on in Settings'), { n: 'font-size:16px', tom: 'var(--ph-ok)' })),
          h('div', { class: 'grid g2' },
            h('div', { class: K.card + ' card' },
              h('div', { class: 'ch' }, h('h2', { class: 'ph-h2 ph-card-titulo' }, P('Disparos · 14 dias', 'Sends · 14 days')), e('span', 'mini', dm(dias[0].dia) + ' → ' + dm(dias[13].dia))),
              h('div', { html: svgArea(db.serie, t(P('Envios por dia nos últimos 14 dias', 'Sends per day over the last 14 days'))) }),
              e('p', 'sr-only', dias.map(s => dm(s.dia) + ': ' + s.n).join(', '))),
            h('div', { class: K.card + ' card' },
              h('div', { class: 'ch' }, h('h2', { class: 'ph-h2 ph-card-titulo' }, P('Por faixa · hoje', 'By tier · today')), e('span', 'mini', fmt.num(tot) + ' total')),
              h('div', { style: 'display:flex;flex-wrap:wrap;gap:16px;align-items:center;padding:14px 18px 18px' },
                h('div', { html: svgRosca(db.pp, t(P('disparos', 'sends'))) }),
                h('div', { class: 'facet', style: 'flex:1 1 170px;min-width:0' }, ['P1', 'P2', 'P3'].map(k => h('div', { class: 'fr' },
                  h('div', { class: 't' }, pill(k.toLowerCase(), ROT_P[k]), h('b', { class: 'mono' }, fmt.num(db.pp[k]))),
                  h('div', { class: 'bar' }, h('i', { style: 'width:' + (db.pp[k] / tot * 100) + '%;background:var(--' + k.toLowerCase() + ')' })))))))),
          h('div', { class: K.card + ' card', style: 'margin-top:14px' },
            h('div', { class: 'ch', style: 'padding-bottom:14px' }, h('h2', { class: 'ph-h2 ph-card-titulo' }, P('Atividade recente', 'Recent activity')), btn(P('Ver execução →', 'View execution →'), () => irTela('fila'), { cls: 'ghost', k: 'ir-exec' })),
            h('div', { class: 'tblwrap' }, h('table', { class: 'ph-tabela' },
              h('thead', null, h('tr', null, [P('Hora', 'Time'), P('Passo', 'Step'), P('Ferramenta', 'Tool'), P('Duração', 'Duration'), 'Status'].map(x => h('th', { scope: 'col' }, x)))),
              h('tbody', null, db.atividade.map(([hora, nome, ferr, ms, st]) => h('tr', null,
                h('td', { class: 'num' }, hora), h('td', null, h('b', null, nome)), h('td', { class: 'mono', style: 'color:var(--muted)' }, ferr),
                h('td', { class: 'num' }, ms >= 1000 ? fmt.num(ms / 1000, 3) + 's' : ms + 'ms'),
                h('td', null, st === 'ok' ? pill('ok', 'OK') : pill('err', P('erro', 'error'))))))))));
      }

      /* ações encenadas da faixa: o resultado já vem pronto */
      function proximoEnvio() {
        ui.backend({
          titulo: P('Próximo envio da fila do dia', 'Next send in the day queue'),
          subtitulo: P('Rotina automática · horário comercial', 'Scheduled job · business hours'),
          escrita: 'create',
          velocidade: 1.5,
          passos: [
            { tipo: 'job', ms: 40, titulo: P('Pega o próximo cliente da fila', 'Takes the next customer in the queue') },
            { tipo: 'regra', ms: 20, titulo: P('Confere as proteções antes do envio', 'Checks the safeguards before sending') },
            { tipo: 'whatsapp', ms: 480, titulo: P('Envia o modelo aprovado pela plataforma de WhatsApp', 'Sends the approved template through the WhatsApp platform') },
            { tipo: 'sql', ms: 30, titulo: P('Registra o resultado', 'Records the result') },
          ],
          resumo: P('Mensagem enviada. O Painel já soma este envio.', 'Message sent. The Dashboard already counts this send.'),
          aoConcluir: () => {
            const d = new Date();
            db.hoje++; db.mes++; db.total++; db.serie[13]++; db.pp.P2++; db.aguardando--;
            db.atividade.unshift([pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()), P('Enviado P2', 'Sent P2'), WA, 497, 'ok']);
            db.atividade.length = 8;
            recarregar();
            ui.toast(P('Envio registrado no Painel.', 'Send recorded on the Dashboard.'));
          },
        });
      }
      function alternarQueda() {
        db.queda = !db.queda;
        recarregar();
        ui.toast(db.queda ? P('Envio pausado com segurança.', 'Sending paused safely.') : P('Plataforma de volta: o envio retomou.', 'Platform is back: sending resumed.'), db.queda ? 'alerta' : 'ok');
      }

      /* ================= casca do módulo: faixa da demonstração, menu próprio e conteúdo ================= */
      const ITENS = NAV.filter(x => Array.isArray(x));
      if (!ITENS.some(x => x[0] === E.tela)) E.tela = 'painel';
      const raiz = h('div', { class: 'dspr dsp-raiz' });
      const faixaCorpo = h('div', { class: 'corpo' });
      const faixa = h('details', { class: 'demo', open: E.demoAberto !== false, ontoggle: ev => { E.demoAberto = !!ev.target.open; } },
        h('summary', null, ic('controles', 12), h('span', null, P('Controles da demonstração', 'Demo controls')), e('span', 'nota', P('não fazem parte do sistema real', 'not part of the real system')), ic('chevd', 12)),
        faixaCorpo);
      const nav = h('nav', { class: 'aside', 'aria-label': P('Módulo Disparos', 'Disparos module') });
      const secao = h('section', { class: 'screen' });
      const mainEl = h('div', { class: 'dmain' }, h('div', { class: 'wrap' }, secao));
      const grade = h('div', { class: 'dsp-g' }, nav, mainEl);
      raiz.append(faixa, grade);
      el.append(raiz);

      function pintarFaixa() {
        faixa.hidden = E.tela !== 'painel';
        const bd = (texto, fn, o) => btn(texto, fn, Object.assign({}, o, { cls: (o.cls || '') + ' sm' }));
        faixaCorpo.replaceChildren(...Array.from(h('div', null,
          h('span', { class: 'estado' + (db.queda ? ' al' : ''), role: 'status' }, db.queda
            ? P('Plataforma de WhatsApp fora do ar (simulação). Envio pausado com segurança; retoma sozinho quando a plataforma volta.', 'WhatsApp platform down (simulation). Sending paused safely; it resumes on its own when the platform is back.')
            : t(P('Horário comercial: a fila do dia está em envio, com ', 'Business hours: the day queue is being sent, with ')) + fmt.num(db.aguardando) + t(P(' clientes aguardando.', ' customers waiting.'))),
          bd(P('Ver o próximo envio passo a passo', 'See the next send step by step'), proximoEnvio, { cls: 'primary', ic: 'play', k: 'd-passo', dis: db.queda || db.aguardando < 1 }),
          bd(db.queda ? P('Restabelecer a plataforma', 'Restore the platform') : P('Simular queda da plataforma', 'Simulate a platform outage'), alternarQueda, { ic: db.queda ? 'okc' : 'alerta', k: 'd-plat' }),
          h('span', null, P('No sistema real nada disto é botão: o envio e a detecção de queda acontecem sozinhos.', 'In the real system none of this is a button: sending and outage detection happen on their own.'))).childNodes));
      }
      function pintarNav() {
        const mini = !!E.mini;
        grade.className = 'dsp-g' + (mini ? ' mini' : '');
        nav.replaceChildren(
          h('div', { class: 'nav-topo' }, btn('', () => { E.mini = !mini; recarregar(); }, { cls: 'ghost sm', ic: mini ? 'menua' : 'menuf', k: 'nav-mini', title: mini ? P('expandir menu', 'expand menu') : P('recolher menu', 'collapse menu') })),
          ...NAV.map(x => {
            if (!Array.isArray(x)) return h('div', { class: 'sep' + (x.cls ? ' ' + x.cls : '') }, x.sep);
            const [key, rot, icn, o = {}] = x, ativo = E.tela === key;
            return h('button', { type: 'button', class: 'nav' + (ativo ? ' active' : ''), 'aria-current': ativo ? 'page' : null, title: o.titulo || rot, 'aria-label': o.titulo || null, 'data-k': 'nav-' + key, onclick: () => irTela(key) },
              ic(icn, 17), e('span', 'lbl', rot), o.badge && h('span', { class: 'badge', 'aria-hidden': 'true' }), o.tag && e('span', 'opt', o.tag));
          }));
      }
      function pintarTela() {
        secao.replaceChildren();
        if (E.tela === 'painel') return pintarPainel(secao);
        const [, rot, , o = {}] = ITENS.find(x => x[0] === E.tela);
        const titulo = o.titulo || rot;
        secao.append(ui.foraDaDemo ? ui.foraDaDemo({ titulo })
          : ui.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is outside the public demo.') }));
      }
      function recarregar() { comFoco(raiz, () => { pintarFaixa(); pintarNav(); pintarTela(); }); }
      function irTela(id) {
        const mudou = E.tela !== id;
        E.tela = id;
        recarregar();
        if (mudou) mainEl.scrollTop = 0;
      }
      recarregar();
    },
  });
})();
