/* Funis do CRM · versão pública curta do módulo de demonstração (id base).
   Leva ao funil de vendas do CRM quem foi contatado pelas campanhas de WhatsApp. Só a tela principal (canal Contatados, Fila) é navegável;
   as outras seções mostram o cartão "fora da demonstração". Dados fictícios e resultados prontos, nenhuma chamada de rede.
   Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const VEND = { 201: 'Ana Souza', 202: 'Bruno Lima', 203: 'Carla Mendes', 214: 'Diego Rocha', 215: 'Elisa Prado', 226: 'Felipe Costa', 231: 'Gabriela Nunes' };
  /* fila de exemplo: código, cliente, fantasia, vendedor, etapa, faixa, prioridade, fat. médio, UF, minutos desde o disparo, desfecho pronto do envio */
  const FILA = [
    ['010012', 'Agropecuária Alfa Ltda', 'Alfa Agro', 201, 'K1', 'A', 'P1', 38250, 'SC', 35, 'criado'],
    ['010057', 'Transportes Beta', '', 214, 'K2', 'A', 'P1', 27480, 'RS', 140, 'atualizado'],
    ['010093', 'Metalúrgica Gama Ltda', 'Gama Metal', 203, 'K1', 'A', 'P1', 19870, 'PR', 260, 'criado'],
    ['010129', 'Comercial Delta', '', 0, '', 'A', 'P1', 15320, 'MG', 410, ''],
    ['010165', 'Distribuidora Épsilon Ltda', 'Épsilon Dist', 202, 'K1', 'B', 'P2', 7340, 'SP', 55, 'criado'],
    ['010201', 'Oficina Zeta', '', 226, 'K3', 'B', 'P2', 6880, 'GO', 190, 'criado'],
    ['010237', 'Construtora Eta', 'Eta Const', 215, 'K2', 'B', 'P2', 5925, 'MT', 320, 'atualizado'],
    ['010273', 'Cooperativa Teta Ltda', '', 201, 'K1', 'B', 'P2', 4410, 'BA', 505, 'criado'],
    ['010309', 'Hidráulica Iota', '', 231, '', 'B', 'P2', 3870, 'MS', 610, 'ignorado'],
    ['010345', 'Ferragens Kapa', 'Kapa Com', 214, 'K2', 'B', 'P2', 2960, 'SC', 700, 'criado'],
    ['010381', 'Mecânica Lambda Ltda', '', 203, 'K1', 'C', 'P3', 2140, 'RS', 80, 'criado'],
    ['010417', 'Logística Mi', 'Mi Log', 202, 'K1', 'C', 'P3', 1785, 'PR', 230, 'atualizado'],
    ['010453', 'Madeireira Ni', '', 226, 'K3', 'C', 'P3', 1320, 'MG', 380, 'criado'],
    ['010489', 'Auto Peças Csi Ltda', '', 0, '', 'C', 'P3', 980, 'SP', 540, ''],
    ['010525', 'Rodoviário Ômicron', '', 215, 'K2', 'C', 'P3', 640, 'GO', 800, 'criado'],
    ['010561', 'Usinagem Pi', 'Pi Mec', 201, 'K1', 'A', '', 22610, 'MT', 15, 'criado'],
    ['010597', 'Agropecuária Rô Ltda', '', 203, 'K1', 'A', '', 12930, 'BA', 95, 'atualizado'],
    ['010633', 'Transportes Sigma', 'Sigma Log', 214, 'K2', 'B', '', 6150, 'MS', 170, 'criado'],
    ['010669', 'Metalúrgica Tau', '', 202, 'K1', 'B', '', 4790, 'SC', 290, 'criado'],
    ['010705', 'Comercial Ípsilon Ltda', 'Ípsilon Com', 226, 'K3', 'B', '', 3380, 'RS', 450, 'criado'],
    ['010741', 'Distribuidora Fi', '', 215, 'K2', 'C', '', 2270, 'PR', 580, 'atualizado'],
    ['010777', 'Oficina Qui', '', 201, 'K1', 'C', '', 1510, 'MG', 660, 'criado'],
    ['010813', 'Construtora Psi Ltda', 'Psi Const', 0, '', 'C', '', 890, 'SP', 720, ''],
    ['010849', 'Cooperativa Ômega', '', 203, 'K1', 'C', '', 420, 'GO', 840, 'criado'],
  ];
  /* disparos que chegam na primeira sincronização */
  const RESERVA = [
    ['010885', 'Mecânica Gama', 'Gama Mec', 201, 'K1', 'A', 'P1', 16480, 'PR', 4, 'criado'],
    ['010921', 'Hidráulica Alfa', '', 202, 'K1', 'B', 'P2', 5210, 'SC', 6, 'criado'],
    ['010957', 'Ferragens Beta Ltda', '', 214, 'K2', 'C', '', 1160, 'RS', 9, 'criado'],
  ];
  const linha = ([cd, nome, fantasia, vend, etapa, faixa, prio, fat, uf, min, fim]) =>
    ({ id: cd, cd, nome, fantasia, vend: vend ? String(vend) : '', etapa, faixa, prio, fat, uf, fim, dt: new Date(Date.now() - min * 6e4) });
  const ordem = (a, b) => (a.prio || 'P9').localeCompare(b.prio || 'P9') || b.fat - a.fat;
  /* status de cada canal: última execução, criados, acompanhados ou pulados, ignorados */
  const STATUS = { con: { ativo: true, min: 3, n: [4, null, 2] }, sem: { ativo: false, min: 1505, n: [7, 41, 38] } };

  let db = null;   // sobrevive à troca de idioma

  const IC = {
    fone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
    antena: '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
    sync: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    lampada: '<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
  };
  const CSS = [
    '.sint.s-raiz{min-width:0;color:var(--ph-text);font-size:13.5px;line-height:1.5}',
    '.sint,.sint .verde,.sint.verde{--a:var(--ph-cor-verde)}.sint .amb{--a:var(--ph-cor-ambar)}.sint b{font-weight:650}',
    '.sint .s-seg .s-dot{width:7px;height:7px;border-radius:50%;background:var(--ph-text-dim);flex:none}.sint .s-seg .s-dot.on{background:var(--ph-ok)}',
    '.sint .s-vivo{display:flex;align-items:center;gap:6px 14px;flex-wrap:wrap;min-width:0}.sint .s-mini{font-size:12px;color:var(--ph-text-muted);white-space:nowrap}.sint .s-mini b{color:var(--ph-text);font-variant-numeric:tabular-nums;font-size:13px}',
    '.sint .s-bars{display:inline-flex;align-items:flex-end;gap:2px;height:14px;flex:none}.sint .s-bars i{width:3px;border-radius:1px;background:var(--ph-border)}.sint .s-bars i.on{background:var(--c)}',
    /* seções do canal: abas do kit dentro da página do canal, sem a faixa de fundo nem o recuo da página */
    '.sint .s-canal .ph-abas{padding:0;background:none;margin-bottom:16px}.sint .s-canal .ph-abas-painel{padding:0}',
    '.sint .s-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:14px;min-width:0}.sint .s-txt{font-size:12.5px;color:var(--ph-text-muted)}',
    '.sint .ph-input.s-in{width:auto;max-width:100%;flex:0 1 auto}.sint .s-row .ph-busca{flex:0 1 260px}.sint .s-note{margin-bottom:14px;line-height:1.55}.sint .s-note b{color:var(--ph-text)}',
    '.sint .s-tw{margin-bottom:14px}.sint .s-t .c{text-align:center}.sint .s-t th.c>span{justify-content:center}.sint .s-t .s{color:var(--ph-text-muted)}.sint .s-t .f{color:var(--ph-text-dim)}',
    '.sint .s-t tbody tr.sel td{background:color-mix(in srgb,var(--a) 12%,var(--ph-card))}.sint .s-vz{padding:24px;font-size:13px;color:var(--ph-text-dim);text-align:center}',
    '.sint .s-selbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;background:color-mix(in srgb,var(--a) 10%,var(--ph-card));border:1px solid color-mix(in srgb,var(--a) 45%,var(--ph-border));border-radius:var(--ph-raio);padding:10px 14px;margin-bottom:14px}',
    '.sint .s-selbar .n{color:var(--a);font-weight:700}.sint .s-selbar .d{color:var(--ph-text-muted);font-size:12.5px}.sint .s-selbar .bts{margin-left:auto;display:flex;gap:8px;flex-wrap:wrap}',
    '.sint .s-resultado{margin-bottom:14px}.sint .s-resmsg{font-size:14px;font-weight:700;color:var(--a)}.sint .s-pills{display:flex;gap:8px;flex-wrap:wrap}',
    '.sint .s-dlg{display:flex;flex-direction:column;gap:10px;min-width:0}.sint .s-p{font-size:13px;line-height:1.55;color:var(--ph-text-muted);margin:0}.sint .s-p.i{color:var(--ph-text)}',
    '.sint .s-dl{margin:0;padding:0;list-style:none;display:grid;gap:4px}.sint .s-dl li{display:flex;justify-content:space-between;gap:12px;padding:6px 10px;border:1px solid var(--ph-border);border-radius:var(--ph-raio);background:var(--ph-surface);font-size:13px;color:var(--ph-text-2)}.sint .s-dl b{font-variant-numeric:tabular-nums;color:var(--ph-text)}',
    '@media (max-width:760px){.sint .s-selbar .bts{margin-left:0}}',
  ].join('\n');

  Hub.registrar({
    id: 'base',
    ordem: 5,
    grupo: P('Comercial', 'Sales'),
    icone: '<path d="M3.5 4.5h17l-6.5 7.5v6l-4 2v-8z"/>',
    nome: P('Funis do CRM', 'CRM funnels'),
    resumo: P('Leva ao funil de vendas do CRM cada cliente contatado pelas campanhas de WhatsApp: um card por cliente, para o vendedor certo, sem duplicar.',
      'Takes every customer contacted by the WhatsApp campaigns to the CRM sales funnel: one card per customer, for the right sales rep, with no duplicates.'),
    manual: {
      pt: {
        destaque: 'Funis do CRM leva ao funil de vendas do ERP cada cliente contatado pelas campanhas de WhatsApp, para o vendedor certo, sem duplicar cards e sem mexer no que já virou negócio.',
        oque: 'O que é. Uma tela do hub que reúne quem foi contatado pela automação de WhatsApp e transforma cada contato em uma oportunidade no funil do vendedor responsável, dentro do CRM do ERP. Um segundo canal cuida dos clientes sem WhatsApp válido, que vão para o vendedor fazer o contato por telefone.\n\nO problema. A campanha conversa com o cliente, mas a venda acontece no funil do vendedor. Listar quem foi chamado, descobrir o vendedor de cada um e abrir a oportunidade no CRM, uma a uma, era trabalho manual, lento e sujeito a erro.\n\nNesta demonstração. A fila de contatados funciona com dados fictícios; as demais seções ficam fora da demonstração pública.',
        finalidade: 'Nenhum cliente contatado se perde entre a conversa e o funil. O CRM não se enche de cards repetidos, a negociação em andamento não é atropelada e o vendedor encontra o cliente certo, com o histórico do contato. A equipe comercial deixa de digitar oportunidades e passa a atender.',
        alcance: [
          'Dois canais na mesma tela: clientes contatados pelo WhatsApp e clientes sem WhatsApp válido',
          'Fila com busca, filtros, seleção em lote, envio para o funil e exportação em CSV',
          'Uma oportunidade por cliente, para o vendedor da carteira, sem duplicar e sem mexer em negociação em andamento',
          'Rotina automática por canal, com status ao vivo e histórico do que saiu da fila',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript', 'Integração com ERP', 'Plataforma de WhatsApp'],
      },
      en: {
        destaque: 'CRM funnels takes every customer contacted by the WhatsApp campaigns to the ERP sales funnel, for the right sales rep, with no duplicate cards and without touching what has already become business.',
        oque: 'What it is. A hub screen that gathers everyone contacted by the WhatsApp automation and turns each contact into an opportunity in the funnel of the responsible sales rep, inside the ERP CRM. A second channel handles customers with no valid WhatsApp, who go to the rep for a phone call.\n\nThe problem. The campaign talks to the customer, but the sale happens in the rep\'s funnel. Listing who was contacted, finding the rep for each one and opening the opportunity in the CRM, one by one, was manual, slow and error-prone work.\n\nIn this demo. The contacted queue works with fictitious data; the other sections are not part of the public demo.',
        finalidade: 'No contacted customer gets lost between the conversation and the funnel. The CRM does not fill up with duplicate cards, the ongoing negotiation is not overridden and the rep finds the right customer, with the contact history. The sales team stops typing opportunities and serves customers instead.',
        alcance: [
          'Two channels on one screen: customers contacted on WhatsApp and customers with no valid WhatsApp',
          'Queue with search, filters, batch selection, send to the funnel and CSV export',
          'One opportunity per customer, for the portfolio sales rep, with no duplicates and no meddling with ongoing negotiations',
          'Scheduled routine per channel, with live status and a history of what left the queue',
        ],
        tecnologias: ['C# / .NET', 'SQL Server', 'Next.js / React', 'TypeScript', 'ERP integration', 'WhatsApp platform'],
      },
    },
    /* mini tour: só ganchos do módulo (data-f, .s-tw), nada que dependa do idioma */
    tour: [
      { alvo: '.sint [data-f="canal-con"]', acao: 'clicar', titulo: P('Dois canais, uma tela', 'Two channels, one screen'),
        texto: P('Quem a campanha de WhatsApp chamou fica em Contatados. Quem não tem WhatsApp válido vai para o vendedor ligar. Ao lado, o status ao vivo da rotina.',
          'Everyone the WhatsApp campaign reached sits in Contacted. Customers with no valid WhatsApp go to the sales rep for a call. Next to them, the live status of the routine.') },
      { alvo: '.sint [data-f="con-fila"]', acao: 'clicar', espera: 700, titulo: P('A fila de contatados', 'The contacted queue'),
        texto: P('Cada cliente chamado pela campanha chega aqui sozinho, pronto para virar oportunidade no funil de vendas.',
          'Every customer the campaign reached lands here on its own, ready to become an opportunity in the sales funnel.') },
      { alvo: '.sint .s-tw', titulo: P('Cada cliente com o seu vendedor', 'Every customer with their sales rep'),
        texto: P('A linha já traz o vendedor da carteira, a etapa, a faixa e a prioridade. Cliente sem vendedor ganha o selo SEM BASE antes de qualquer envio.',
          'Each row already shows the portfolio sales rep, stage, tier and priority. A customer with no rep gets the NO REP badge before anything is sent.') },
      { alvo: '.sint [data-f="filtros"]', titulo: P('Ache, marque e envie', 'Find, tick and send'),
        texto: P('Busque por nome ou código e filtre por faixa, prioridade, etapa ou vendedor. Marque os clientes e envie de uma vez: um card por cliente, sem duplicar.',
          'Search by name or code and filter by tier, priority, stage or sales rep. Tick the customers and send them in one go: one card per customer, no duplicates.') },
      { alvo: '.sint [data-f="con-historico"]', acao: 'clicar', titulo: P('Histórico e automação', 'History and automation'),
        texto: P('O histórico do que saiu da fila, o ajuste por vendedor e a rotina automática moram nas outras seções.',
          'The history of what left the queue, the adjustment by sales rep and the scheduled routine live in the other sections.') },
      { alvo: '.sint .ph-fora', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('Aqui o vídeo mostra o sistema completo em ação. Gostou? Logo abaixo dá para falar comigo e ver tudo funcionando de verdade.',
          'Here the video shows the full system in action. Liked it? Right below you can reach me and see it all running for real.') },
    ],
    montar(el, api) {
      if (!db) db = { fila: FILA.map(linha), reserva: RESERVA.map(linha), num: 48300 };
      if (!document.getElementById('sint-css')) { const st = document.createElement('style'); st.setAttribute('id', 'sint-css'); st.textContent = CSS; (document.head || document.documentElement).appendChild(st); }
      const { t, h, ui, fmt } = api;
      const E = api.estado;
      E.f = E.f || { q: '', faixa: '', prio: '', etapa: '', vend: '' };
      E.sel = E.sel || new Set();

      const fora = titulo => (ui.foraDaDemo ? ui.foraDaDemo({ titulo })
        : ui.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is not part of the public demo.') }));
      const ic = n => IC[n] || n;
      const CX = ui.marcar({}).input.className, TB = ui.tabela({ busca: false }).querySelector('table').className + ' s-t';
      const caixa = attrs => h('input', { type: 'checkbox', class: CX, ...attrs });
      const btn = (texto, tom, aoClicar, icone, dis) => ui.botao({ texto, tom, icone: icone && ic(icone), desabilitado: dis, aoClicar });
      const pill = (txt, tom) => { const tok = /^var\(/.test(tom); const b = ui.badge(txt, tok ? 'neutro' : tom); b.classList.add('s-pill'); if (tok) b.style.setProperty('--tom', tom); return b; };
      const pEtapa = et => pill(et || '-', !et ? 'neutro' : et === 'K3' ? 'var(--ph-cor-violeta)' : et === 'K2' ? 'var(--ph-cor-azul)' : 'var(--ph-cor-verde)');
      const pPrio = p => (p ? pill(p, p === 'P1' ? 'erro' : p === 'P2' ? 'alerta' : 'neutro') : '');
      const barras = (nivel, cor) => h('span', { class: 's-bars', style: { '--c': cor }, 'aria-hidden': 'true' }, [0, 1, 2, 3].map(i => h('i', { class: i < nivel ? 'on' : null, style: 'height:' + (i + 1) * 25 + '%' })));
      const nota = (...f) => { const a = ui.aviso(f, 'info'); a.classList.add('s-note'); a.style.setProperty('--tom', 'var(--a)'); return a; };
      const sel = (rot, valor, ops, aoMudar) => { const s = ui.select({ ariaLabel: rot, vazio: rot, valor, opcoes: ops.map(([v, tx]) => ({ valor: v, texto: tx })), aoMudar }); s.classList.add('s-in'); return s; };
      const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
      const pad2 = n => String(n).padStart(2, '0');
      const dIso = d => d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
      const nomeV = l => (l.vend ? VEND[l.vend] : '');

      function baixarCsv(nome, ls) {
        const esc = x => { const s = String(x == null ? '' : x); return /[;"\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
        const cab = [P('Código', 'Code'), P('Cliente', 'Customer'), P('Vendedor', 'Sales rep'), P('Etapa', 'Stage'), P('Faixa', 'Tier'), P('Prioridade', 'Priority'), P('Fat. médio mensal', 'Avg. monthly sales'), P('Disparo', 'Contacted at'), P('UF', 'State')].map(t);
        const linhas = ls.map(l => [l.cd, l.nome, nomeV(l), l.etapa, l.faixa, l.prio, String(l.fat).replace('.', ','), fmt.dataHora(l.dt), l.uf]);
        const url = URL.createObjectURL(new Blob(['﻿' + [cab, ...linhas].map(r => r.map(esc).join(';')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
        const a = h('a', { href: url, download: nome + '_' + new Date().toISOString().slice(0, 10) + '.csv' });
        document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        ui.toast(t(P('Arquivo gerado com ', 'File generated with ')) + ls.length + t(P(' linha(s).', ' row(s).')), 'ok');
      }

      /* status ao vivo nas ações das abas de canal */
      const statusEl = h('span', { class: 's-vivo', role: 'status' });
      function pintarStatus() {
        const con = E.canal !== 'sem', s = STATUS[con ? 'con' : 'sem'];
        const mini = (rot, v) => h('span', { class: 's-mini' }, h('b', null, v == null ? '-' : String(v)), ' ', rot);
        statusEl.replaceChildren(mini(P('última exec.', 'last run'), fmt.hora(new Date(Date.now() - s.min * 6e4))), mini(P('criados', 'created'), s.n[0]),
          mini(con ? P('acompanhados', 'followed up') : P('pulados', 'skipped'), s.n[1]), mini(P('ignorados', 'ignored'), s.n[2]),
          pill(s.ativo ? P('NO AR', 'ON AIR') : P('FORA DO AR', 'OFF AIR'), s.ativo ? 'ok' : 'neutro'), barras(s.ativo ? 4 : 1, s.ativo ? 'var(--a)' : 'var(--ph-text-dim)'));
      }

      /* ---------- Contatados · Fila (a tela principal) ---------- */
      let abasCon = null;
      const refazer = () => abasCon && abasCon.recarregar();
      function conFila(p) {
        const sinc = btn(P('Sincronizar com o Atendimento com IA', 'Sync with AI customer service'), 'secundario', sincronizar, 'sync');
        if (!E.carregada) {   // a fila carrega sozinha ao abrir
          p.append(h('div', { class: 's-row' }, btn(P('Carregando...', 'Loading...'), 'primario', null, null, true), sinc));
          api.depois(() => { E.carregada = true; refazer(); }, 650);
          return;
        }
        const F = E.f, S = E.sel, todas = db.fila;
        const passa = l => (!F.faixa || l.faixa === F.faixa) && (!F.prio || l.prio === F.prio) && (!F.etapa || l.etapa === F.etapa)
          && (!F.vend || (F.vend === '-' ? !l.vend : l.vend === F.vend)) && (!F.q || norm(l.nome + ' ' + l.fantasia + ' ' + l.cd).includes(norm(F.q)));
        let fil = [];
        const conta = h('span', { class: 's-txt' }), barraSel = h('div'), corpo = h('tbody');
        const vazio = h('div', { class: 's-vz' }, P('Fila vazia: nada pendente. Quando o Atendimento com IA chamar novos clientes, eles aparecem aqui.', 'Queue empty: nothing pending. When AI customer service contacts new customers, they show up here.'));
        const rotTodos = P('Selecionar todos os filtrados', 'Select all filtered');
        const todos = caixa({ 'aria-label': t(rotTodos), title: t(rotTodos), onchange: ev => { S.clear(); if (ev.target.checked) fil.forEach(l => S.add(l.id)); pintarLinhas(); } });
        function pintarSel() {
          const ls = todas.filter(l => S.has(l.id));
          todos.checked = fil.length > 0 && fil.every(l => S.has(l.id));
          conta.textContent = fil.length + t(P(' de ', ' of ')) + todas.length + t(P(' na fila', ' in the queue'));
          barraSel.replaceChildren(...(ls.length ? [h('div', { class: 's-selbar' }, barras(4, 'var(--a)'),
            h('span', { class: 'n' }, ls.length + t(P(' selecionado(s)', ' selected'))),
            h('span', { class: 'd' }, P('Envia só os marcados: eles saem da fila ao enviar.', 'Sends only the ticked ones: they leave the queue when sent.')),
            h('div', { class: 'bts' }, btn(P('Enviar selecionados', 'Send selected'), 'primario', () => enviar(ls), 'enviar'),
              btn('CSV', 'secundario', () => baixarCsv('contatados_sel', ls), 'download'), btn(P('Limpar', 'Clear'), 'fantasma', () => { S.clear(); pintarLinhas(); })))] : []));
        }
        const tr = l => {
          const r = h('tr', { class: S.has(l.id) ? 'sel' : null },
            h('td', { class: 'c' }, caixa({ checked: S.has(l.id), 'aria-label': t(P('Selecionar ', 'Select ')) + l.nome,
              onchange: ev => { if (ev.target.checked) S.add(l.id); else S.delete(l.id); r.className = ev.target.checked ? 'sel' : ''; pintarSel(); } })),
            h('td', { class: 'f' }, l.cd), h('td', null, l.nome, l.fantasia && h('span', { class: 'f' }, ' · ' + l.fantasia)),
            h('td', null, l.vend ? nomeV(l) : pill(P('SEM BASE', 'NO REP'), 'erro')), h('td', null, pEtapa(l.etapa)), h('td', null, l.faixa), h('td', null, pPrio(l.prio)),
            h('td', null, fmt.moeda(l.fat)), h('td', { class: 's' }, dIso(l.dt)), h('td', { class: 's' }, l.uf));
          return r;
        };
        function pintarLinhas() {
          fil = todas.filter(passa);
          corpo.replaceChildren(...fil.map(tr));
          vazio.hidden = fil.length > 0;
          pintarSel();
        }
        const muda = k => v => { F[k] = v; pintarLinhas(); };
        const vends = [...new Set(todas.map(l => l.vend))].map(v => (v ? [v, VEND[v]] : ['-', P('SEM BASE (sem vendedor)', 'NO REP (no sales rep)')]));
        const r = E.res;
        p.append(...[
          h('div', { class: 's-row' }, btn(P('Carregar fila', 'Load queue'), 'primario', carregar, 'fone'), sinc, conta, btn('CSV', 'secundario', () => baixarCsv('contatados_fila', fil), 'download')),
          nota(h('b', null, P('Fila de contatados.', 'Contacted queue.')), P(' Cada cliente contatado vira uma oportunidade no funil do vendedor responsável. O sistema não duplica cards nem mexe em negociação em andamento. Ao enviar, o cliente sai da fila.',
            ' Every contacted customer becomes an opportunity in the funnel of the responsible sales rep. The system does not duplicate cards or touch ongoing negotiations. Once sent, the customer leaves the queue.')),
          h('div', { class: 's-row', style: 'margin-bottom:12px', 'data-f': 'filtros' },
            ui.busca({ placeholder: P('Buscar nome / código', 'Search name / code'), rotulo: P('Buscar nome / código', 'Search name / code'), valor: F.q, aoDigitar: muda('q') }),
            sel(P('Faixa (todas)', 'Tier (all)'), F.faixa, ['A', 'B', 'C'].map(x => [x, x]), muda('faixa')),
            sel(P('Prioridade (todas)', 'Priority (all)'), F.prio, ['P1', 'P2', 'P3'].map(x => [x, x]), muda('prio')),
            sel(P('Etapa (todas)', 'Stage (all)'), F.etapa, [['K1', P('K1 LINHA 1', 'K1 LINE 1')], ['K2', P('K2 LINHA 2', 'K2 LINE 2')], ['K3', P('K3 LINHA 3', 'K3 LINE 3')]], muda('etapa')),
            sel(P('Vendedor (todos)', 'Sales rep (all)'), F.vend, vends, muda('vend'))),
          barraSel,
          r && ui.cartao({ classe: 's-resultado', conteudo: [h('div', { class: 's-resmsg' }, r.msg),
            h('div', { class: 's-pills' }, pill(r.criado + t(P(' criados', ' created')), 'ok'), pill(r.atualizado + t(P(' atualizados', ' updated')), 'var(--ph-cor-azul)'), pill(r.ignorado + t(P(' ignorados', ' ignored')), 'neutro'))] }),
          h('div', { class: 'ph-tabela-wrap s-tw', style: '--ph-tabela-max:520px' },
            h('table', { class: TB }, h('thead', null, h('tr', null, h('th', { class: 'c', style: 'width:36px' }, h('span', null, todos)),
              [P('Código', 'Code'), P('Cliente', 'Customer'), P('Vendedor', 'Sales rep'), P('Etapa', 'Stage'), P('Faixa', 'Tier'), 'Prio', P('Fat. médio', 'Avg. sales'), P('Disparo', 'Contacted'), P('UF', 'State')]
                .map(c => h('th', { scope: 'col' }, h('span', null, c))))), corpo),
            vazio)].filter(Boolean));
        pintarLinhas();
      }

      const passo = (tipo, titulo, ms) => ({ tipo, titulo, ms });
      function carregar() {
        ui.backend({ titulo: P('Carregar a fila de contatados', 'Load the contacted queue'), passos: [
          passo('api', P('A tela pede a fila', 'The screen requests the queue'), 80), passo('sql', P('Lê os disparos pendentes', 'Reads the pending contacts'), 140),
          passo('erp', P('Completa com o cadastro de cada cliente', 'Adds each customer record'), 820), passo('api', P('Devolve a fila', 'Returns the queue'), 30)],
        aoConcluir: () => { refazer(); ui.toast(t(P('Fila carregada: ', 'Queue loaded: ')) + db.fila.length + t(P(' pendente(s).', ' pending.')), 'ok'); } });
      }
      function sincronizar() {
        ui.backend({ titulo: P('Sincronizar a fila com os disparos', 'Sync the queue with campaign contacts'), escrita: 'create', passos: [
          passo('api', P('A tela pede a sincronização', 'The screen requests the sync'), 70), passo('whatsapp', P('Busca os disparos da campanha', 'Fetches the campaign contacts'), 90),
          passo('sql', P('Acrescenta à fila o que ainda não está nela', 'Adds to the queue what is not there yet'), 130), passo('api', P('Confirma para a tela', 'Confirms to the screen'), 20)],
        aoConcluir: () => {
          const n = db.reserva.length;
          db.fila = db.fila.concat(db.reserva.splice(0)).sort(ordem);
          E.carregada = true; refazer();
          ui.toast(P('Fila sincronizada: ' + n + ' novo(s) disparo(s) adicionado(s).', 'Queue synced: ' + n + ' new contact(s) added.'), n ? 'ok' : 'info');
        } });
      }
      function enviar(ls) {
        const env = ls.filter(l => l.vend), ign = ls.length - env.length, n = k => env.filter(l => l.etapa === k).length;
        if (!env.length) return ui.toast(P('Nenhum cliente enviável (todos SEM BASE). Use o CSV.', 'No customer can be sent (all of them NO REP). Use the CSV.'), 'alerta');
        ui.modal({ titulo: P('Enviar para o funil do CRM', 'Send to the CRM funnel'), classe: 'sint verde', largura: 520,
          corpo: h('div', { class: 's-dlg' },
            h('p', { class: 's-p i' }, P('Enviar ' + env.length + ' contatado(s) para o funil CRM (CONTATADO IA):', 'Send ' + env.length + ' contacted customer(s) to the CRM funnel (AI CONTACTED):')),
            h('ul', { class: 's-dl' }, [[P('K1 (LINHA 1/REVENDA)', 'K1 (LINE 1/RESALE)'), 'K1'], [P('K2 (LINHA 2)', 'K2 (LINE 2)'), 'K2'], [P('K3 (LINHA 3)', 'K3 (LINE 3)'), 'K3']]
              .map(([rot, k]) => h('li', null, h('span', null, rot), h('b', null, String(n(k)))))),
            ign > 0 && ui.aviso(P(ign + ' ignorados (SEM BASE).', ign + ' ignored (NO REP).'), 'erro'),
            h('p', { class: 's-p' }, P('O card é criado para o vendedor ver que já chamamos. Depois de enviado, o cliente sai da fila.', 'The card is created so the sales rep sees we have already made contact. Once sent, the customer leaves the queue.'))),
          acoes: ctl => [btn(P('Cancelar', 'Cancel'), 'secundario', () => ctl.fechar()), btn(P('Enviar', 'Send'), 'primario', () => { ctl.fechar(); rodarEnvio(env); }, 'enviar')] });
      }
      function rodarEnvio(env) {
        const c = { criado: 0, atualizado: 0, ignorado: 0 };
        env.forEach(l => { c[l.fim]++; });
        const msg = P('Processados ' + env.length + ': ' + c.criado + ' criados, ' + c.atualizado + ' atualizados, ' + c.ignorado + ' ignorados.', 'Processed ' + env.length + ': ' + c.criado + ' created, ' + c.atualizado + ' updated, ' + c.ignorado + ' ignored.');
        ui.backend({ titulo: P('Enviar contatados para o funil do CRM', 'Send contacted customers to the CRM funnel'), escrita: 'create', passos: [
          passo('api', P('Recebe o pedido', 'Receives the request'), 110), passo('sql', P('Confere a fila', 'Checks the queue'), 40),
          passo('erp', P('Registra as oportunidades no CRM do ERP', 'Records the opportunities in the ERP CRM'), 420), passo('api', P('Responde com o resumo', 'Replies with the summary'), 25)],
        resumo: msg,
        aoConcluir: () => {
          const ids = new Set(env.map(l => l.id));
          db.fila = db.fila.filter(l => !ids.has(l.id));
          E.sel.clear(); E.res = { ...c, msg };
          refazer();
          ui.toast(msg, 'ok');
          const k = env.find(l => l.fim === 'criado');
          if (k) erpOportunidade(k, ++db.num);
        } });
      }
      /* a única janela do ERP: a oportunidade pronta, como o vendedor a encontra no CRM */
      function erpOportunidade(l, num) {
        const C = (rotulo, valor, largura, destaque) => ({ rotulo, valor, largura, destaque }), agora = new Date();
        ui.erp({ programa: P('Oportunidade de venda', 'Sales opportunity'), codigo: 'ERP-0310', largura: 900, colunas: 6, consulta: true,
          campos: [C(P('Oportunidade', 'Opportunity'), String(num), 1, true), C(P('Situação', 'Status'), P('Aberta', 'Open'), 1), C(P('Cliente', 'Customer'), l.cd + ' · ' + l.nome, 4),
            C(P('Vendedor responsável', 'Owner'), l.vend + ' · ' + nomeV(l), 2), C(P('Etapa', 'Stage'), l.etapa + ' · ' + t(P('Contatado pela automação', 'Contacted by automation')), 2),
            C(P('Abertura', 'Opened'), fmt.dataHora(agora), 1), C(P('Criado por', 'Created by'), P('Automação', 'Automation'), 1)],
          grade: { colunas: [P('Data', 'Date'), P('Usuário', 'User'), P('Assunto', 'Subject'), P('Histórico', 'History')],
            linhas: [[fmt.dataHora(agora), t(P('Automação', 'Automation')), t(P('CONTATO IA', 'AI CONTACT')), t(P('Cliente contatado pela automação e enviado ao funil do vendedor.', 'Customer contacted by the automation and sent to the rep funnel.'))]] },
          rodape: P('Oportunidade criada pelo hub', 'Opportunity created by the hub'),
          acoes: [{ texto: 'OK', tom: 'primario' }] });
      }

      /* ---------- canais (abas do kit) e seções de cada canal ---------- */
      const secoes = (chave, rotulo, lista) => {
        const a = ui.abas({ chave, rotulo, abas: lista.map(([id, rot, icone, montar]) => ({ id, rotulo: rot, icone: icone && ic(icone), montar: montar || (p => p.append(fora(rot))),
          contador: id === 'fila' ? () => (E.carregada ? db.fila.length : 0) : null })) });
        Array.from(a.querySelector('.ph-abas-lista').children).forEach((b, i) => b.setAttribute('data-f', chave.slice(3).toLowerCase() + '-' + lista[i][0]));
        return a;
      };
      const CANAIS = [
        ['con', P('Contatados', 'Contacted'), 'fone', c => { abasCon = secoes('abaCon', P('Seções do canal Contatados', 'Contacted channel sections'), [
          ['fila', P('Fila', 'Queue'), null, conFila], ['ajustar', P('Ajustar por vendedor', 'Adjust by sales rep')], ['historico', P('Histórico', 'History')], ['automacao', P('Automação', 'Automation'), 'settings']]); c.append(abasCon); }],
        ['sem', P('Sem WhatsApp', 'No WhatsApp'), 'antena', c => c.append(secoes('abaSem', P('Seções do canal Sem WhatsApp', 'No WhatsApp channel sections'), [
          ['lista', P('Lista', 'List')], ['ajustar', P('Ajustar funil', 'Adjust funnel')], ['ciclos', P('Ciclos', 'Cycles')], ['comofunciona', P('Como funciona', 'How it works'), 'lampada'], ['automacao', P('Automação', 'Automation'), 'settings']]))],
      ];
      const canais = ui.abas({ chave: 'canal', rotulo: P('Canal', 'Channel'), acoes: statusEl, aoTrocar: pintarStatus,
        abas: CANAIS.map(([id, rotulo, icone, fn]) => ({ id, rotulo, icone: ic(icone), montar: p => { const c = h('div', { class: 's-canal ' + (id === 'con' ? 'verde' : 'amb') }); p.append(c); fn(c); } })) });
      canais.querySelector('.ph-abas-lista').classList.add('s-seg');
      canais.querySelector('.ph-abas-lista').querySelectorAll('.ph-aba').forEach((b, i) => {
        const s = STATUS[CANAIS[i][0]], rot = t(s.ativo ? P('job no ar', 'job on air') : P('job fora do ar', 'job off air'));
        b.setAttribute('data-f', 'canal-' + CANAIS[i][0]);
        b.append(h('i', { class: 's-dot' + (s.ativo ? ' on' : ''), role: 'img', 'aria-label': rot, title: rot }));
      });
      pintarStatus();
      el.append(h('div', { class: 'sint s-raiz' }, canais));
    },
  });
})();
