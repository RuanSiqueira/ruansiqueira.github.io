/* Atendimento com IA (id dash_ia) · versão pública curta do ProjectHub de demonstração.
   Só a tela Resultados é navegável, com números de exemplo já prontos; as outras telas abrem o cartão "fora da demonstração".
   Dados fictícios, nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });

  /* Números de exemplo por mês, do mais recente ao mais antigo (o primeiro é o mês corrente, ainda parcial).
     pri = linhas P1, P2 e P3: [enviados, responderam, orçaram, compraram, receita]. Os dois últimos meses são da ferramenta anterior. */
  const MESES = [
    { pri: [[20, 2, 1, 0, 0], [39, 5, 2, 1, 404], [59, 9, 3, 1, 589]], perdidos: 2, vlrPerdido: 801, vlrAtivo: 809, recorr: 0, erros: 1, custo: 112.1, roi: 786, cac: 56.05 },
    { pri: [[92, 16, 5, 2, 1068], [184, 22, 7, 3, 1380], [276, 38, 12, 4, 2514]], perdidos: 7, vlrPerdido: 3360, vlrAtivo: 3819, recorr: 2, erros: 4, custo: 524.4, roi: 846, cac: 58.27 },
    { pri: [[100, 17, 6, 2, 1097], [199, 29, 8, 4, 1785], [298, 42, 14, 4, 1861]], perdidos: 8, vlrPerdido: 3875, vlrAtivo: 3028, recorr: 2, erros: 8, custo: 567.15, roi: 736, cac: 56.72 },
    { pri: [[81, 12, 4, 2, 1029], [163, 20, 6, 2, 823], [244, 38, 10, 3, 1867]], perdidos: 6, vlrPerdido: 1957, vlrAtivo: 3020, recorr: 1, erros: 3, custo: 463.6, roi: 702, cac: 66.23 },
    { pri: [[89, 15, 5, 2, 1080], [178, 28, 9, 4, 1754], [267, 38, 12, 6, 3799]], perdidos: 8, vlrPerdido: 3431, vlrAtivo: 2748, recorr: 2, erros: 9, custo: 507.3, roi: 1208, cac: 42.28, legado: true },
    { pri: [[95, 16, 5, 2, 1124], [190, 33, 9, 3, 1494], [286, 49, 14, 4, 1827]], perdidos: 8, vlrPerdido: 2582, vlrAtivo: 3991, recorr: 2, erros: 9, custo: 542.45, roi: 719, cac: 60.27, legado: true },
  ];
  const TRANSICAO = 3, LEGADO_TRANSICAO = 212, CUSTO_MSG = 0.95;
  /* pedido de exemplo para a janela do ERP simulado: [item, quantidade, unitário] */
  const PEDIDO = [['A-100', 12, 16.4], ['D-400', 8, 24.8], ['F-600', 5, 32.5]];

  const IC = {
    sliders: '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>',
    barras2: '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>',
    barras3: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    usercog: '<circle cx="18" cy="15" r="3"/><circle cx="9" cy="7" r="4"/><path d="M10 15H6a4 4 0 0 0-4 4v2"/><path d="m21.7 16.4-.9-.3"/><path d="m15.2 13.9-.9-.3"/><path d="m16.6 18.7.3-.9"/><path d="m19.1 12.2.3-.9"/><path d="m19.6 18.7-.4-1"/><path d="m16.8 12.3-.4-1"/><path d="m14.3 16.6 1-.4"/><path d="m20.7 13.8 1-.4"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
    trend: '<polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>',
    zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
    bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    banco: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  };
  /* as cinco abas do Dash IA (legado) e a troca de tela da faixa da demonstração, como na versão completa */
  const ABAS = [
    { id: 'dashboard', rot: P('Dashboard', 'Dashboard'), ic: 'barras2' },
    { id: 'rastreamento', rot: P('Rastreamento', 'Tracking'), ic: 'users' },
    { id: 'orcamentos', rot: P('Orçamentos', 'Quotes'), ic: 'file' },
    { id: 'conversoes', rot: P('Conversões', 'Conversions'), ic: 'trend' },
    { id: 'ciclos', rot: P('Ciclos Ativos', 'Active Cycles'), ic: 'zap' },
  ];
  const LEGADO = ABAS.map(a => a.id);
  const TELAS_DEMO = [
    { id: 'resultados', rot: P('Resultados', 'Results'), ic: 'barras3' },
    { id: 'dashboard', rot: P('Dash IA (legado)', 'Dash IA (legacy)'), ic: 'barras2', leg: true },
    { id: 'carteiras', rot: P('Carteiras', 'Portfolios'), ic: 'usercog' },
    { id: 'simulador', rot: P('Simulador (demonstração)', 'Simulator (demo)'), ic: 'bot' },
  ];

  /* só layout e as peças sem equivalente no kit, com os tokens --ph-* da casca (nenhuma cor, fonte ou regra por tema) */
  const R = '.dia-real ';
  const CSS = [
    '.dia-real{min-width:0}',
    R + '.d-demo{border-bottom:1px dashed var(--ph-border-soft);background:var(--ph-surface);font-size:13px;color:var(--ph-text-muted)}',
    R + '.d-demo summary{cursor:pointer;padding:8px 16px;display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;list-style:none;font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch);color:var(--ph-text-dim)}',
    R + '.d-demo summary::-webkit-details-marker{display:none}' + R + '.d-demo summary .nota{font:400 12px/1.5 var(--ph-font);letter-spacing:0;text-transform:none;font-stretch:100%}' + R + '.d-demo[open] summary>.ph-ico:last-child{transform:rotate(180deg)}',
    R + '.d-demo .corpo{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:2px 16px 12px}' + R + '.d-demo .d-telas{display:flex;flex-wrap:wrap;align-items:center;gap:6px;flex:1 1 100%}',
    R + '.dia-cab{display:flex;justify-content:space-between;align-items:flex-end;gap:12px 16px;flex-wrap:wrap;margin-bottom:18px}' + R + '.dia-cab>div:first-child{min-width:0;flex:1 1 16rem}',
    R + '.dia-cab p{margin:6px 0 0;max-width:72ch;font-size:13.5px}' + R + '.mono{font-family:var(--ph-font-mono)}',
    R + '.dsp{min-width:0}' + R + '.dsp .row{display:flex;gap:9px;flex-wrap:wrap;align-items:center}' + R + '.dsp .sel{width:150px}',
    R + '.dsp .grid{display:grid;gap:14px}' + R + '.dsp .g2{grid-template-columns:minmax(0,3fr) minmax(0,2fr)}',
    R + '.dsp .kpis{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(150px,100%),1fr))}' + R + '.dsp .kpi .d{display:flex;align-items:center;gap:4px;flex-wrap:wrap}',
    R + '.dsp .up{color:var(--ph-ok)}' + R + '.dsp .down{color:var(--ph-erro)}' + R + '.dsp .card.ph-card{display:block;padding:0;min-width:0}',
    R + '.dsp .ch{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:14px 18px 12px}' + R + '.dsp .ch .ph-card-titulo{margin:0}' + R + '.dsp .ch .mini{font:400 11.5px/1.4 var(--ph-font-mono);color:var(--ph-text-dim)}',
    R + '.dsp .tblwrap{overflow-x:auto}' + R + '.dsp .tbl-max{max-height:62vh;overflow:auto}',
    R + '.dsp td.num{font-family:var(--ph-font-mono);font-variant-numeric:tabular-nums}' + R + '.dsp td b{font-weight:600;color:var(--ph-text)}' + R + '.dsp tr.cl{cursor:pointer}' + R + '.dsp tr.leg td{color:var(--ph-text-muted)}',
    R + '.dsp .subcell{display:block;font:400 11px/1.4 var(--ph-font-mono);color:var(--ph-text-dim);margin-top:3px}' + R + '.dsp .subcell.err{color:var(--ph-erro)}',
    R + '.dsp .chipn{--tom:var(--ph-text-muted);display:inline-block;font:700 13px/1.4 var(--ph-font-mono);padding:1px 9px;border-radius:var(--ph-raio);color:var(--tom);background:color-mix(in srgb,var(--tom) 13%,transparent);border:1px solid color-mix(in srgb,var(--tom) 35%,transparent)}',
    R + '.dsp .chipn.p1{--tom:var(--ph-erro)}' + R + '.dsp .chipn.p3{--tom:var(--ph-info)}' + R + '.dsp .chipn.ok{--tom:var(--ph-ok)}' + R + '.dsp .chipn.ac{--tom:var(--ph-accent-light)}',
    R + '.dsp td .v-ok{color:var(--ph-ok)}' + R + '.dsp td.v-info{color:var(--ph-info)}' + R + '.dsp td.v-mudo{color:var(--ph-text-muted)}' + R + '.dsp td .v-erro{color:var(--ph-erro)}',
    R + '.dsp .lnk{font:inherit;background:none;border:0;padding:0;cursor:pointer;color:var(--ph-accent-light);text-decoration:underline;text-underline-offset:3px}' + R + '.dsp .hist-m{font-family:var(--ph-font-mono);font-weight:600}',
    R + '.dsp .facet{display:flex;flex-direction:column;gap:13px;padding:4px 18px 18px}' + R + '.dsp .facet .fr{display:flex;flex-direction:column;gap:6px}' + R + '.dsp .facet .fr .t{display:flex;justify-content:space-between;align-items:center;font-size:13px}',
    R + '.dsp .bar{height:8px;border-radius:999px;background:var(--ph-card-2);overflow:hidden}' + R + '.dsp .bar i{display:block;height:100%;border-radius:inherit;background:var(--cor)}',
    R + '.dsp .foot-note{font-size:12.5px;color:var(--ph-text-muted);margin:12px 4px 0}',
    '@media (max-width:1100px){' + R + '.dsp .g2{grid-template-columns:minmax(0,1fr)}}',
  ].join('\n');
  function injetarCss() {
    if (document.getElementById('dia-real-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'dia-real-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  Hub.registrar({
    id: 'dash_ia',
    ordem: 9,
    grupo: P('Comercial', 'Sales'),
    icone: '<path d="M4 5h16v11H9l-5 4z"/><path d="M12 7.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>',
    nome: P('Atendimento com IA', 'AI customer service'),
    resumo: P(
      'A camada inteligente sobre o ERP que mede o que cada disparo de WhatsApp devolve, leva o cliente ao vendedor da carteira e protege a IA de atendimento contra robô conversando com robô.',
      'The intelligent layer on top of the ERP that measures what every WhatsApp campaign message returns, routes the customer to the rep who owns the portfolio and protects the AI assistant from bots talking to bots.'
    ),
    manual: {
      pt: {
        destaque: 'O Dash IA é a camada inteligente sobre o ERP que mede o que cada disparo de WhatsApp devolve, da mensagem enviada ao pedido, e garante que o cliente que responde chegue ao vendedor da carteira dele, com uma trava que impede a IA de atendimento de ficar conversando com outro robô.',
        oque: 'O que é. Um módulo do hub com três frentes ligadas pelo mesmo dado: o painel de resultados dos disparos (o Dash IA), a tela Carteiras, que define qual vendedor recebe cada cliente no WhatsApp, e a integração com o atendimento por IA. O hub não é um ERP: é a camada sobre o ERP que lê cadastro, carteira, orçamentos e pedidos e devolve à gestão um número confiável.\n\nO problema. A empresa disparava mensagens de reativação pelo WhatsApp e não sabia o que cada disparo devolvia: quem respondeu, quem pediu orçamento, quem comprou, quanto rendeu e quanto custou. E o cliente que já tinha vendedor caía na fila geral, porque a ligação entre o vendedor e o atendente do WhatsApp ficava presa no código e envelhecia a cada mudança na equipe.\n\nNesta demonstração. A tela Resultados funciona com números fictícios; as outras telas ficam fora da demonstração pública.',
        finalidade: 'Para que serve. Dar ao comercial um número único e confiável do retorno de cada disparo, mês a mês: enviados, quem respondeu, orçou e comprou, receita atribuída, custo, ROI e CAC. Cada disparo é acompanhado até o pedido, dentro de uma janela configurável. Quando o cliente responde, a conversa vai para o vendedor da carteira; sem ninguém disponível, para a fila geral. E, quando do outro lado está um robô, a IA para de gastar e a conversa passa para uma pessoa.',
        alcance: [
          'Resultado medido: na reexecução de um incidente de loop, as chamadas à IA caíram de 460 para 31 (93% a menos), sem bloquear nenhuma conversa real em mais de mil conversas.',
          'Painel mensal com funil, visão por prioridade, histórico e financeiro, aberto na hora.',
          'Cliente que já tem vendedor chega ao vendedor dele no WhatsApp.',
          'Carteiras mantidas pelo próprio comercial numa tela, sem mexer em código.',
        ],
        tecnologias: ['Next.js / React', 'C# / .NET', 'SQL Server', 'TypeScript', 'Python / Django', 'Plataforma de WhatsApp', 'IA generativa'],
      },
      en: {
        destaque: 'Dash IA is the intelligent layer on top of the ERP that measures what every WhatsApp campaign message returns, from the message sent to the order, and makes sure a customer who replies reaches the rep who owns their portfolio, with a guard that keeps the AI assistant from talking to another bot.',
        oque: 'What it is. A hub module with three fronts tied to the same data: the campaign results dashboard (Dash IA), the Portfolios screen, which defines which sales rep receives each customer on WhatsApp, and the integration with the AI customer service. The hub is not an ERP: it is the layer on top of the ERP that reads customer records, portfolios, quotes and orders and gives management a number it can trust.\n\nThe problem. The company sent reactivation messages on WhatsApp and did not know what each message returned: who replied, who asked for a quote, who bought, how much it brought in and how much it cost. And customers who already had a rep fell into the general queue, because the link between the rep and the WhatsApp agent was stuck in the code and went stale with every team change.\n\nIn this demo. The Results screen runs on fictitious figures; the other screens are not part of the public demo.',
        finalidade: 'What it is for. Giving the sales team one reliable number for the return of each campaign message, month by month: sent, who replied, quoted and bought, attributed revenue, cost, ROI and CAC. Each message is followed up to the order, within a configurable window. When the customer replies, the conversation goes to the rep who owns the portfolio; when nobody is available, to the general queue. And when a bot is on the other end, the AI stops spending and the conversation goes to a person.',
        alcance: [
          'Measured result: replaying a loop incident, AI calls dropped from 460 to 31 (93% fewer), without blocking any real conversation across more than a thousand conversations.',
          'Monthly dashboard with funnel, priority view, history and finance, open instantly.',
          'A customer who already has a rep reaches that rep on WhatsApp.',
          'Portfolios kept by the sales team on a screen, with no code changes.',
        ],
        tecnologias: ['Next.js / React', 'C# / .NET', 'SQL Server', 'TypeScript', 'Python / Django', 'WhatsApp platform', 'Generative AI'],
      },
    },
    /* mini tour: só ganchos do módulo (data-f, .dsp .kpis/.g2), nada que dependa do idioma */
    tour: [
      { alvo: '.dia-real [data-f="tela-resultados"]', acao: 'clicar', titulo: P('Quanto cada disparo devolve', 'What every send brings back'),
        texto: P('Cada mensagem de WhatsApp é acompanhada até o pedido. Esta tela mostra, mês a mês, o que os disparos trouxeram de volta.',
          'Every WhatsApp message is followed all the way to the order. This screen shows, month by month, what the campaigns brought back.') },
      { alvo: '.dia-real .dsp .kpis', titulo: P('Do envio ao pedido', 'From send to order'),
        texto: P('Quem recebeu, respondeu, orçou e comprou, com a receita que veio e o que ficou pelo caminho. Um número só, em que a gestão confia.',
          'Who received, replied, asked for a quote and bought, with the revenue it brought and what was lost on the way. One number management can trust.') },
      { alvo: '.dia-real .dsp .g2', titulo: P('Funil e prioridades', 'Funnel and priorities'),
        texto: P('O funil do mês traz custo, ROI e CAC no alto. Ao lado, as faixas P1, P2 e P3 mostram onde o retorno de fato aparece.',
          'The month funnel shows cost, ROI and CAC at the top. Next to it, tiers P1, P2 and P3 show where the return really shows up.') },
      { alvo: '.dia-real [data-f="res-h2"]', acao: 'clicar', titulo: P('Um mês ao lado do outro', 'Month next to month'),
        texto: P('O histórico põe os meses lado a lado. Um clique num mês abre o funil dele, e a tela inteira acompanha.',
          'The history puts the months side by side. One click on a month opens its funnel, and the whole screen follows.') },
      { alvo: '.dia-real [data-f="tela-carteiras"]', acao: 'clicar', titulo: P('Cada cliente com o seu vendedor', 'Every customer with their sales rep'),
        texto: P('Quando o cliente responde, a conversa vai para o vendedor da carteira dele. Quem cuida disso é a tela Carteiras, mantida pelo próprio comercial, sem mexer em código.',
          'When the customer replies, the conversation goes to the rep who owns their portfolio. The Portfolios screen takes care of that, kept by the sales team itself, with no code changes.') },
      { alvo: '.dia-real .ph-fora', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('As carteiras e a trava que impede a IA de conversar com outro robô estão na versão completa. Quer ver tudo funcionando? É só me chamar por aqui.',
          'The public demo shows the main screen. Portfolios and the guard that keeps the AI from talking to another bot are in the full version. Want to see the whole system running? Just reach me from here.') },
    ],

    montar(el, api) {
      injetarCss();
      const { t, h, ui, fmt } = api;
      const E = api.estado;
      if (!LEGADO.includes(E.aba) && !TELAS_DEMO.some(a => a.id === E.aba)) E.aba = 'resultados';
      if (E.resMes == null) E.resMes = 1;

      const tt = (pt, en) => (api.lang === 'en' ? en : pt);
      const brl = n => fmt.moeda(n);
      const brl0 = n => Number(n || 0).toLocaleString(api.lang === 'en' ? 'en-US' : 'pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
      const pct1 = (n, d) => fmt.num(d > 0 ? n / d * 100 : 0, 1) + '%';
      const hoje = new Date();
      const chaveMes = i => { const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); };
      /* soma as três faixas de prioridade do mês e junta os números já prontos dele */
      const somaMes = i => {
        const m = MESES[i], s = k => m.pri.reduce((a, p) => a + p[k], 0);
        return { ...m, i, mes: chaveMes(i), dis: s(0), res: s(1), orc: s(2), com: s(3), receita: s(4) };
      };
      const foraDaDemo = titulo => (ui.foraDaDemo ? ui.foraDaDemo({ titulo })
        : ui.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is not part of the public demo.') }));

      /* peças do kit: as classes saem dos próprios componentes, nenhuma classe de biblioteca escrita no módulo */
      const K = {
        kpi: ui.kpis([{ rotulo: '-', valor: '-' }]).querySelector('.ph-kpi').className,
        sel: ui.select({ opcoes: ['-'] }).className,
        chip: ui.chips({ opcoes: [{ valor: 1, texto: '-' }] }).querySelector('.ph-chip').className,
        card: ui.cartao({}).className,
        tab: ui.tabela({ colunas: [{ id: 'x', rotulo: '-' }], linhas: [], busca: false }).querySelector('table').className,
      };
      const ic = (nome, tam) => h('span', { class: 'ph-ico', 'aria-hidden': 'true', style: 'width:' + tam + 'px;height:' + tam + 'px', html: '<svg viewBox="0 0 24 24" focusable="false">' + IC[nome] + '</svg>' });
      const dbtn = (texto, aoClicar, o = {}) => {
        const b = ui.botao({ texto, aoClicar, icone: o.ic && IC[o.ic], tom: o.tom || 'secundario', tamanho: o.tam, titulo: o.titulo });
        if (o.f) b.setAttribute('data-f', o.f);
        return b;
      };
      const pill = (tom, txt, ...cls) => { const b = ui.badge(txt, tom); b.classList.add('pill', ...cls); return b; };
      const th = c => h('th', { scope: 'col' }, h('span', null, c));

      const raiz = h('div', { class: 'dia-real d-raiz' });
      el.append(raiz);
      function pintar(foco) {
        const conteudo = LEGADO.includes(E.aba) ? abasLegado() : h('div', { class: 'd-tela ph-pagina' });
        raiz.replaceChildren(faixaTopo(), conteudo);
        if (E.aba === 'resultados') telaResultados(conteudo);
        else if (!LEGADO.includes(E.aba)) conteudo.append(foraDaDemo(TELAS_DEMO.find(a => a.id === E.aba).rot));
        const alvo = foco && raiz.querySelector('[data-f="' + foco + '"]');
        if (alvo) alvo.focus();
      }
      const irPara = id => { E.aba = id; pintar('tela-' + id); };

      /* faixa discreta com a troca de tela e a janela do ERP simulado, que só existem na demonstração */
      function faixaTopo() {
        return h('details', { class: 'd-demo', open: E.demoAberto !== false, ontoggle: ev => { E.demoAberto = !!ev.target.open; } },
          h('summary', { 'data-f': 'demo-demoAberto' }, ic('sliders', 12), h('span', null, P('Controles da demonstração', 'Demo controls')), h('span', { class: 'nota' }, P('não fazem parte do sistema real', 'not part of the real system')), ic('chevd', 12)),
          h('div', { class: 'corpo' },
            h('nav', { class: 'd-telas', 'aria-label': P('Telas da demonstração', 'Demo screens') }, h('span', null, P('Telas:', 'Screens:')),
              TELAS_DEMO.map(a => {
                const on = E.aba === a.id || (a.leg && LEGADO.includes(E.aba));
                return h('button', { type: 'button', class: K.chip, 'aria-pressed': String(on), 'aria-current': on ? 'page' : null, 'data-f': 'tela-' + a.id, onclick: () => irPara(a.id) }, ic(a.ic, 14), h('span', null, a.rot));
              })),
            h('span', null, P('Janela do ERP simulado:', 'Simulated ERP window:')),
            dbtn(P('Pedido de venda', 'Sales order'), erpPedido, { ic: 'banco', tam: 'p', f: 'demo-ped' })));
      }

      /* as cinco abas do Dash IA (legado) continuam na navegação; cada uma abre o cartão "fora da demonstração" */
      function abasLegado() {
        const abas = ui.abas({ chave: 'aba', rotulo: P('Telas do Dash IA', 'Dash IA screens'),
          abas: ABAS.map(a => ({ id: a.id, icone: IC[a.ic], rotulo: a.rot, montar: painel => painel.append(foraDaDemo(a.rot)) })) });
        const lista = abas.querySelector('[role="tablist"]');
        lista.classList.add('dia-abas');
        lista.querySelectorAll('[role="tab"]').forEach((b, i) => b.setAttribute('data-f', 'aba-' + ABAS[i].id));
        return abas;
      }

      /* ================= Resultados (tela principal) ================= */
      function telaResultados(p) {
        const tela = h('section');
        p.append(h('div', { class: 'dsp' },
          h('div', { class: 'dia-cab' }, h('div', null,
            h('h2', { class: 'ph-h1' }, P('Dash IA · Resultados dos disparos', 'Dash IA · Campaign results')),
            h('p', { class: 'ph-texto-mudo' }, P('Mesma medição do módulo de disparos: era da ferramenta anterior e módulo. O detalhe por cliente fica nas outras abas.', 'Same measurement as the campaign module: previous tool era and module. The per-customer detail is in the other tabs.')))),
          tela));
        if (E.resCarregou) return conteudoResultados(tela);
        E.resCarregou = true;
        ui.carregar(tela, conteudoResultados, 450, 6);
      }
      function atualizar(fu) {
        ui.backend({
          titulo: P('Atualizar os resultados do mês', 'Refresh the month results'), subtitulo: fu.mes, velocidade: 2,
          passos: [
            { tipo: 'api', ms: 140, titulo: P('A tela pede os resultados do mês', 'The screen requests the month results') },
            { tipo: 'sql', ms: 60, titulo: P('Lê os números do mês (já calculados)', 'Reads the month figures (already computed)') },
            { tipo: 'api', ms: 30, titulo: P('Devolve funil, prioridades e histórico', 'Returns funnel, priorities and history') },
          ],
          resumo: P('Resultados lidos de uma fonte só, a mesma do módulo de disparos.', 'Results read from a single source, the same as the campaign module.'),
          aoConcluir: () => pintar('res-at'),
        });
      }
      function conteudoResultados(tela) {
        const fu = somaMes(E.resMes);
        const kpi = (rot, n, d, o = {}) => h('div', { class: K.kpi + ' kpi', style: o.cor ? { '--tom': o.cor } : null },
          h('span', { class: 'ph-kpi-rotulo lbl' }, h('span', null, rot)), h('span', { class: 'ph-kpi-valor n' }, n), h('span', { class: 'ph-kpi-detalhe d' }, h('span', { class: o.d || null }, d)));
        const est = [[P('Enviados', 'Sent'), fu.dis, 'var(--ph-accent)'], [P('Responderam', 'Replied'), fu.res, 'var(--ph-alerta)'], [P('Orçaram', 'Quoted'), fu.orc, 'var(--ph-info)'], [P('Compraram', 'Purchased'), fu.com, 'var(--ph-ok)']];
        const sub = (txt, erro) => h('span', { class: 'subcell' + (erro ? ' err' : '') }, txt);
        const num = (...f) => h('td', { class: 'num' }, ...f);
        const cardR = (titulo, mini, ...corpo) => h('section', { class: K.card + ' card' }, h('div', { class: 'ch' }, h('h3', { class: 'ph-h2 ph-card-titulo' }, titulo), mini && h('span', { class: 'mini' }, mini)), ...corpo);
        const TOM_PRI = ['erro', 'alerta', 'info'];
        const abrir = i => { E.resMes = i; pintar('res-mes'); };
        tela.append(
          h('div', { class: 'row', style: 'margin-bottom:14px' },
            h('select', { class: K.sel + ' sel', 'aria-label': P('Mês do disparo', 'Month of the send'), 'data-f': 'res-mes', value: String(E.resMes), onchange: ev => abrir(Number(ev.target.value)) },
              MESES.map((m, i) => !m.legado && h('option', { value: String(i) }, chaveMes(i)))),
            pill('neutro', P('janela de atribuição configurável', 'configurable attribution window'), 'dim'),
            pill('neutro', 'template · ' + brl(CUSTO_MSG), 'dim'),
            h('div', { style: 'flex:1' }),
            dbtn(P('Atualizar', 'Refresh'), () => atualizar(fu), { ic: 'refresh', tom: 'fantasma', f: 'res-at' })),
          h('div', { class: 'kpis', style: 'margin-bottom:14px' },
            kpi(P('Enviados', 'Sent'), fmt.num(fu.dis), fmt.num(fu.erros) + tt(' erro(s) de envio', ' send error(s)'), { d: fu.erros ? 'down' : '' }),
            kpi(P('Responderam', 'Replied'), fmt.num(fu.res), pct1(fu.res, fu.dis) + tt(' dos enviados', ' of sent'), { d: 'up', cor: 'var(--ph-alerta)' }),
            kpi(P('Orçaram', 'Quoted'), fmt.num(fu.orc), pct1(fu.orc, fu.dis) + tt(' dos enviados', ' of sent'), { cor: 'var(--ph-info)' }),
            kpi(P('Compraram', 'Purchased'), fmt.num(fu.com), pct1(fu.com, fu.dis) + tt(' global · ', ' overall · ') + pct1(fu.com, fu.orc) + tt(' dos orçados', ' of quoted') + (fu.recorr ? ' · ' + fmt.num(fu.recorr) + tt(' recorrente(s)', ' repeat') : ''), { d: 'up', cor: 'var(--ph-ok)' }),
            kpi(P('Receita atribuída', 'Attributed revenue'), brl0(fu.receita), brl0(fu.vlrAtivo) + tt(' em orçamento aberto', ' in open quotes'), { d: 'up', cor: 'var(--ph-ok)' }),
            kpi(P('Perdido', 'Lost'), brl0(fu.vlrPerdido), fmt.num(fu.perdidos) + tt(' orçamento(s) perdido(s)', ' lost quote(s)'), { cor: fu.perdidos ? 'var(--ph-erro)' : 'var(--ph-neutro)' })),
          h('div', { class: 'grid g2', style: 'margin-bottom:14px' },
            cardR(tt('Funil · ', 'Funnel · ') + fu.mes, tt('custo ', 'cost ') + brl0(fu.custo) + ' · ROI ' + fmt.num(fu.roi) + '%' + (fu.com ? ' · CAC ' + brl0(fu.cac) : ''),
              h('div', { class: 'facet' }, est.map(([rot, v, cor]) => h('div', { class: 'fr' },
                h('div', { class: 't' }, h('span', null, rot), h('b', { class: 'mono' }, fmt.num(v))),
                h('div', { class: 'bar' }, h('i', { style: 'width:' + (fu.dis > 0 ? v / fu.dis * 100 : 0).toFixed(2) + '%;--cor:' + cor })))))),
            cardR(P('Por prioridade', 'By priority'), null,
              h('div', { class: 'tblwrap' }, h('table', { class: K.tab },
                h('thead', null, h('tr', null, [P('Faixa', 'Tier'), P('Env.', 'Sent'), P('Resp.', 'Repl.'), P('Orç.', 'Quot.'), P('Comprou', 'Bought'), P('Receita', 'Revenue')].map(th))),
                h('tbody', null, fu.pri.map((d, k) => h('tr', null, h('td', null, pill(TOM_PRI[k], 'P' + (k + 1), 'p' + (k + 1))), num(fmt.num(d[0])), num(fmt.num(d[1])), num(fmt.num(d[2])), num(fmt.num(d[3])), num(brl0(d[4]))))))))),
          cardR(P('Histórico mensal', 'Monthly history'), P('mês do módulo é clicável · era da ferramenta anterior é só leitura', 'a module month is clickable · the previous tool era is read-only'),
            h('div', { class: 'tblwrap tbl-max', tabindex: '0', role: 'region', 'aria-label': P('Histórico mensal', 'Monthly history') }, h('table', { class: K.tab },
              h('thead', null, h('tr', null, [P('Mês', 'Month'), P('Enviados', 'Sent'), P('Resp.', 'Repl.'), P('Orç.', 'Quot.'), P('Comprou', 'Bought'), P('Perdido', 'Lost'), P('Receita', 'Revenue'), P('Em aberto', 'Open'), P('Custo', 'Cost'), 'ROI'].map(th))),
              h('tbody', null, MESES.map((_, i) => {
                const l = somaMes(i);
                const origem = l.legado ? P('era da ferramenta anterior', 'previous tool era') : i === TRANSICAO ? tt('módulo + ' + fmt.num(LEGADO_TRANSICAO) + ' da ferramenta anterior', 'module + ' + fmt.num(LEGADO_TRANSICAO) + ' from the previous tool') : P('módulo', 'module');
                return h('tr', { class: l.legado ? 'leg' : 'cl', onclick: l.legado ? null : () => abrir(i) },
                  num(l.legado ? h('b', { class: 'hist-m' }, l.mes) : h('button', { type: 'button', class: 'lnk', 'data-f': 'res-h' + i, title: P('Abrir o funil deste mês', 'Open this month funnel'), onclick: ev => { ev.stopPropagation(); abrir(i); } }, h('b', { class: 'hist-m' }, l.mes)), sub(origem)),
                  num(h('b', null, fmt.num(l.dis)), sub(l.legado ? P('sem log de erro', 'no error log') : fmt.num(l.erros) + tt(' erro(s)', ' error(s)'), !l.legado && l.erros > 0)),
                  num(h('span', { class: 'chipn p3' }, fmt.num(l.res)), sub(pct1(l.res, l.dis) + tt(' resp.', ' repl.'))),
                  num(h('span', { class: 'chipn ac' }, fmt.num(l.orc)), sub(pct1(l.orc, l.dis) + tt(' dos env.', ' of sent'))),
                  num(h('span', { class: 'chipn ok' }, fmt.num(l.com)), sub(pct1(l.com, l.orc) + tt(' dos orç.', ' of quot.') + (l.recorr ? ' · ' + fmt.num(l.recorr) + tt(' rec', ' repeat') : ''))),
                  num(h('span', { class: 'chipn ' + (l.perdidos ? 'p1' : '') }, fmt.num(l.perdidos)), sub(brl0(l.vlrPerdido), l.perdidos > 0)),
                  num(h('b', { class: 'v-ok' }, brl0(l.receita))),
                  h('td', { class: 'num v-info' }, brl0(l.vlrAtivo)),
                  h('td', { class: 'num v-mudo' }, brl0(l.custo)),
                  num(h('b', { class: 'v-ok' }, '+' + fmt.num(l.roi) + '%')));
              }))))),
          h('div', { class: 'foot-note' }, P('Cada disparo é acompanhado até o pedido, dentro de uma janela configurável. O mês corrente ainda está em andamento.', 'Each campaign message is followed up to the order, within a configurable window. The current month is still in progress.')));
      }

      /* ================= janela do ERP simulado: um pedido pronto ================= */
      function erpPedido() {
        const total = PEDIDO.reduce((s, [, q, u]) => s + q * u, 0);
        ui.erp({
          programa: P('Pedido de venda', 'Sales order'), codigo: 'ERP-0430', consulta: true,
          campos: [
            { rotulo: P('Pedido', 'Order'), valor: '71542', destaque: true }, { rotulo: P('Cliente', 'Customer'), valor: P('C-1093 Metalúrgica Demo 0032', 'C-1093 Demo Metalworks 0032'), largura: 2 },
            { rotulo: P('Data', 'Date'), valor: fmt.data(api.data(-6)) }, { rotulo: P('Situação', 'Status'), valor: P('Confirmado', 'Confirmed') },
            { rotulo: P('Itens', 'Items'), valor: String(PEDIDO.length) }, { rotulo: P('Total', 'Total'), valor: brl(total), destaque: true },
          ],
          grade: {
            colunas: [P('Item', 'Item'), P('Descrição', 'Description'), { rotulo: P('Qtd', 'Qty'), tipo: 'numero' }, { rotulo: P('Unitário', 'Unit price'), tipo: 'numero' }, { rotulo: P('Total', 'Total'), tipo: 'numero' }],
            linhas: PEDIDO.map(([it, q, u]) => [it, P('Item de catálogo ' + it, 'Catalog item ' + it), fmt.num(q), brl(u), brl(q * u)]),
            total: ['', P('Total', 'Total'), fmt.num(PEDIDO.reduce((s, x) => s + x[1], 0)), '', brl(total)],
          },
          acoes: [{ texto: P('Fechar', 'Close'), tom: 'primario' }],
        });
      }

      pintar();
    },
  });
})();
