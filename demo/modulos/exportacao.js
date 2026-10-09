/* AUTO CRM · versão pública curta do módulo do ProjectHub de demonstração (id exportacao).
   Só o Painel navega (priorização do dia, recompra e indicadores da carteira); as outras nove áreas aparecem na navegação
   e abrem o cartão "fora da demonstração". Visual do kit do hub; o bloco de estilo #acrm-css só usa tokens --ph-*.
   Dados fictícios e prontos, nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });

  /* traços que o conjunto de ícones do núcleo não tem (grade 24x24) */
  const IK = {
    fone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
    ciclo: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    sacola: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    maleta: '<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="14" x="2" y="6" rx="2"/>',
    bussola: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    medidor: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    tabela: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
    prancheta: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    ajustes: '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
    novoLead: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
    alvo: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
    tendencia: '<path d="M22 7 13.5 15.5 8.5 10.5 2 17"/><path d="M16 7h6v6"/>',
    quadro: '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    barras: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  };
  const ic = n => (n && IK[n]) || n;
  const BANDEIRA = {
    pt: '<svg viewBox="0 0 20 14" focusable="false"><rect width="20" height="14" rx="2" fill="#009b3a"/><path d="M10 1.8 18 7l-8 5.2L2 7z" fill="#fedf00"/><circle cx="10" cy="7" r="3" fill="#002776"/></svg>',
    es: '<svg viewBox="0 0 20 14" focusable="false"><rect width="20" height="14" rx="2" fill="#aa151b"/><rect y="3.5" width="20" height="7" fill="#f1bf00"/></svg>',
    en: '<svg viewBox="0 0 20 14" focusable="false"><rect width="20" height="14" rx="2" fill="#fff"/><path d="M0 1h20M0 3h20M0 5h20M0 7h20M0 9h20M0 11h20M0 13h20" stroke="#b22234" stroke-width="1"/><rect width="9" height="7.5" rx="1" fill="#3c3b6e"/></svg>',
  };

  /* ---------- dados prontos ---------- */
  const COLUNAS = [[P('minha base', 'my base'), 'neutro'], [P('Contato Feito', 'Contact Made'), 'info'], [P('Orçamento', 'Quote'), 'alerta'],
    [P('Pedido Fechado', 'Order Closed'), 'ok'], [P('Perdido', 'Lost'), 'erro'], [P('Clientes Inativos', 'Inactive Customers'), 'text-dim']];
  const PAIS = { AR: ['Argentina', 'Argentina'], US: ['Estados Unidos', 'United States'], CL: ['Chile', 'Chile'], MX: ['México', 'Mexico'], ZA: ['África do Sul', 'South Africa'],
    PT: ['Portugal', 'Portugal'], VN: ['Vietnã', 'Vietnam'], EC: ['Equador', 'Ecuador'], CA: ['Canadá', 'Canada'] };
  const nunca = P('nunca contatado', 'never contacted'), orc = P('aguardando fechamento de orçamento', 'waiting for the quote to close');
  const atraso = n => P('contato atrasado há ' + n + ' dias', 'contact overdue by ' + n + ' days');
  const semContato = n => P(n + ' dias sem contato', n + ' days without contact');
  const manual = n => P('cadência manual de ' + n + ' dias', 'manual cadence of ' + n + ' days');
  const VENDEDORES = [[12, 'Marcos Vidal'], [13, 'Lívia Moura'], [11, 'Helena Prado']];
  /* por vendedor: indicadores [carteira, conversão %, contato efetivo %, pedidos, atrasados, próximos 7 dias], clientes por coluna, priorização e recompra */
  const BASE = {
    geral: { k: [105, 20, 64, 14, 13, 19], d: [35, 27, 14, 14, 7, 8] },
    12: { k: [46, 18, 61, 5, 7, 9], d: [17, 12, 6, 5, 3, 3],
      prio: [['Importadora Aurora S.A.', 'AR', nunca], ['Boreal Trading LLC', 'US', atraso(12)], ['Distribuidora Sigma S.R.L.', 'CL', orc], ['Meridiano Handel GmbH', 'DE', semContato(41)],
        ['Comercial Delta SAS', 'CO', manual(60)], ['Horizonte Farm Equipment Ltd', 'AU', atraso(5)], ['Agroindustrial Zênite S.A.', 'PY', semContato(34)], ['Vértice Makina A.S.', 'TR', atraso(2)]],
      rec: [['Agroindustrial Sigma S.A.', 'ligacao', P('Ligar para confirmar a reposição do trimestre', 'Call to confirm the quarterly restock'), -2],
        ['Cardeal Supply Inc.', 'whatsapp', P('Enviar a tabela de preços atualizada', 'Send the updated price list'), 0],
        ['Importadora Kapa S.A.', 'email', P('Enviar proposta de recompra', 'Send a repeat-order proposal'), 0]] },
    13: { k: [38, 22, 66, 6, 4, 6], d: [12, 10, 5, 6, 2, 3],
      prio: [['Implementos Cardeal S.A. de C.V.', 'MX', nunca], ['Austral Supply Inc.', 'ZA', atraso(9)], ['Comércio Litoral Lda.', 'PT', orc], ['Maquinaria Gama Ltda.', 'PE', semContato(38)],
        ['Kapa Trading S.r.l.', 'IT', manual(90)], ['Importadora Teta S.A.', 'UY', atraso(3)]],
      rec: [['Distribuidora Boreal S.R.L.', 'ligacao', P('Ligar para revisar o pedido anual', 'Call to review the yearly order'), -1],
        ['Zeta Industries Ltd', 'email', P('Enviar proposta de recompra', 'Send a repeat-order proposal'), 0]] },
    11: { k: [21, 25, 71, 3, 2, 4], d: [6, 5, 3, 3, 2, 2],
      prio: [['Planalto Trading Co. Ltd', 'VN', nunca], ['Ferretería Lambda S.R.L.', 'EC', atraso(6)], ['Ômega Machinery Co.', 'CA', orc], ['Importadora Beta Lda.', 'AO', semContato(31)]],
      rec: [['Comercial Horizonte SAS', 'whatsapp', P('Confirmar a data da próxima compra', 'Confirm the date of the next purchase'), 0]] },
  };
  const CANAL = { ligacao: [P('Ligação', 'Call'), 'info'], whatsapp: ['WhatsApp', 'ok'], email: [P('E-mail', 'Email'), 'alerta'] };
  let db = null;
  const semear = () => {
    const d = { briefing: {} };
    VENDEDORES.forEach(([id]) => { d[id] = { prio: BASE[id].prio.slice(), rec: BASE[id].rec.slice() }; });
    return d;
  };

  const MANUAL = {
    pt: {
      destaque: 'AUTO CRM é o CRM comercial do hub: reúne a carteira, a prospecção e as metas de cada setor de vendas num só lugar, ligado ao ERP, ao e-mail e ao WhatsApp. Cada vendedor tem o seu quadro, o sistema mostra quem contatar hoje e por quê, e a gestão acompanha o trabalho da equipe ao lado dos números oficiais do ERP.\n\nProjetado e construído por Ruan Siqueira.',
      oque: 'São dez áreas: Painel, Kanban, Carteira, Mapa de mercados, Ponto de Atenção, Leads, Relatórios, Gerencial, Config e Setores. Nesta demonstração pública o Painel é a tela navegável: a priorização do dia com resumo escrito por IA, as tarefas de recompra e os indicadores da carteira, por vendedor ou do setor inteiro.',
      finalidade: 'Antes do sistema, a carteira, o histórico de contatos e as observações dos clientes viviam em planilhas, uma por vendedor. O cliente parado não voltava para a fila de ninguém, o disparo de e-mail e de WhatsApp era feito um a um e os números da equipe só existiam no ERP, longe de quem vende.\n\nHoje cada contato fica registrado, quem precisa de atenção aparece na lista do dia e a gestão lê, lado a lado, o que a equipe fez no hub e os números oficiais sincronizados do ERP (somente leitura).',
      alcance: [
        'Quadro kanban pessoal de cada vendedor e a carteira em tabela, com etiquetas',
        'Priorização do dia com resumo escrito por IA, em português, espanhol e inglês',
        'Prospecção de leads e disparo de e-mail e WhatsApp para vários clientes de uma vez',
        'Mapa de mercados em 3D e relatório gerencial com os números oficiais do ERP',
        'Setores com gestor e vendedores. Tamanho: 137 rotas de API e 32 tabelas',
      ],
      tecnologias: ['Next.js', 'React', 'TypeScript', '.NET', 'SQL Server', 'Tailwind CSS', 'MapLibre GL', 'API de WhatsApp', 'IA generativa'],
    },
    en: {
      destaque: 'AUTO CRM is the hub\'s sales CRM: it brings the portfolio, the prospecting and the goals of each sales sector into one place, connected to the ERP, to email and to WhatsApp. Each seller has their own board, the system shows who to contact today and why, and management follows the team\'s work next to the official ERP numbers.\n\nDesigned and built by Ruan Siqueira.',
      oque: 'There are ten areas: Dashboard, Kanban, Portfolio, Market map, Attention Point, Leads, Reports, Management, Config and Sectors. In this public demo the Dashboard is the screen you can use: today\'s priorities with an AI-written briefing, the repeat-order tasks and the portfolio indicators, per seller or for the whole sector.',
      finalidade: 'Before the system, the portfolio, the contact history and the customer notes lived in spreadsheets, one per seller. An idle customer never came back to anyone\'s queue, email and WhatsApp were sent one by one and the team\'s numbers only existed in the ERP, far from the people who sell.\n\nNow every contact is recorded, whoever needs attention shows up on today\'s list and management reads, side by side, what the team did in the hub and the official numbers synced from the ERP (read only).',
      alcance: [
        'Personal kanban board for each seller and the portfolio as a table, with tags',
        'Today\'s priorities with an AI-written briefing, in Portuguese, Spanish and English',
        'Lead prospecting and email and WhatsApp sending to many customers at once',
        '3D market map and a management report with the official ERP numbers',
        'Sectors with a manager and sellers. Size: 137 API routes and 32 tables',
      ],
      tecnologias: ['Next.js', 'React', 'TypeScript', '.NET', 'SQL Server', 'Tailwind CSS', 'MapLibre GL', 'WhatsApp API', 'Generative AI'],
    },
  };

  /* bloco de estilo: só a disposição das peças próprias, com os tokens do tema */
  const CSS = [
    '.acrm.ac-raiz{display:flex;flex-direction:column;min-width:0}',
    '.acrm .ac-link{background:none;border:0;padding:0;font:inherit;color:inherit;text-align:left;cursor:pointer;min-width:0}.acrm .ac-link:hover{color:var(--ph-accent-light);text-decoration:underline;text-underline-offset:3px}',
    '.acrm .ac-head{display:flex;flex-direction:column;gap:10px;padding:12px clamp(12px,2vw,16px);border-bottom:1px solid var(--ph-border)}.acrm .ac-head-top{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 16px}',
    '.acrm .ac-ctx{min-width:0;flex:1 1 16rem}.acrm .ac-ctx .ph-kicker{margin-bottom:2px}.acrm .ac-sub{font-size:13px;color:var(--ph-text-muted);overflow-wrap:anywhere}',
    '.acrm .ac-hacoes{display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0}.acrm .ac-hsel{display:flex;align-items:center;gap:6px;min-width:0;color:var(--ph-text-muted)}.acrm .ac-hsel .ph-input{width:auto;max-width:min(240px,62vw)}',
    '.acrm .ac-flag{display:inline-flex;width:18px;height:13px;flex:none;margin-right:6px;vertical-align:-2px}.acrm .ac-flag svg{display:block;width:100%;height:100%;border-radius:2px}',
    '.acrm .ac-setores{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.acrm .ac-setores .r{font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch);color:var(--ph-text-dim)}',
    '.acrm .ac-cont{display:flex;flex-direction:column;gap:20px}',
    '.acrm .ac-ia-tt{display:flex;align-items:center;gap:8px;font-weight:650;font-size:15px;color:var(--ph-text)}.acrm .ac-ia-tt .ph-ico{width:18px;height:18px;color:var(--ph-cor-violeta)}.acrm .ac-ia-tt small{font-size:12px;font-weight:600;color:var(--ph-cor-violeta)}.acrm .ac-ia-tt em{font-style:normal;font-size:12px;font-weight:400;color:var(--ph-text-dim)}.acrm .ac-ia .tx{font-size:13px;font-weight:400;color:var(--ph-text-muted)}',
    '.acrm .ac-brief{font-size:13.5px;color:var(--ph-text-2);background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio);padding:12px;white-space:pre-wrap}.acrm .ac-brief.dica{background:none;border:0;padding:0;color:var(--ph-text-dim)}',
    '.acrm .ac-prio{display:flex;flex-direction:column;gap:6px;max-height:520px;overflow-y:auto;padding-right:4px;min-height:0}.acrm .ac-prio .it{display:flex;align-items:center;gap:12px;background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio);padding:8px 12px;min-width:0}',
    '.acrm .ac-prio .n{height:24px;width:24px;border-radius:50%;background:var(--ph-accent-soft);color:var(--ph-accent-light);font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none}',
    '.acrm .ac-prio .tx{flex:1;min-width:0;background:none;border:0;padding:0;text-align:left;cursor:pointer;font:inherit;color:inherit;display:grid}.acrm .ac-prio .tx:hover .e{color:var(--ph-accent-light)}',
    '.acrm .ac-prio .e{font-size:14px;font-weight:600;color:var(--ph-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.acrm .ac-prio .e small{font-size:12px;color:var(--ph-text-dim);font-weight:400}.acrm .ac-prio .m{font-size:12px;color:var(--ph-text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.acrm .ac-k6.ph-kpis{grid-template-columns:repeat(6,minmax(0,1fr))}',
    '.acrm .ac-card--c.ph-card{padding:0;gap:0}.acrm .ac-card--c>.ph-card-topo{padding:12px 16px;border-bottom:1px solid var(--ph-border)}.acrm .ac-card--c .ph-tabela-wrap{border:0;border-radius:0;background:none}',
    '.acrm .ph-card .ph-barras{justify-content:stretch}',
    '.acrm .ac-tb{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;color:var(--ph-text-2);font-variant-numeric:tabular-nums lining-nums}.acrm .ac-tb td .ph-ico{width:14px;height:14px;vertical-align:-2px}',
    '.acrm .ac-tb td.vd{color:var(--ph-ok);font-weight:600}.acrm .ac-tb td.az{color:var(--ph-info)}.acrm .ac-tb td.vm{color:var(--ph-erro)}.acrm .ac-tb td.cz{color:var(--ph-text-dim)}.acrm .ac-tb td.fw{font-weight:600;color:var(--ph-text)}',
    '@media (max-width:1280px){.acrm .ac-k6.ph-kpis{grid-template-columns:repeat(3,minmax(0,1fr))}}',
    '@media (max-width:640px){.acrm .ac-prio .it{flex-wrap:wrap;row-gap:6px}.acrm .ac-prio .tx{flex:1 1 calc(100% - 36px)}.acrm .ac-prio .it>.ph-btn{margin-left:auto}.acrm .ac-k6.ph-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}',
  ].join('\n');
  function injetarCss() {
    if (document.getElementById('acrm-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'acrm-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  Hub.registrar({
    id: 'exportacao',
    icone: 'globo',
    nome: P('AUTO CRM', 'AUTO CRM'),
    resumo: P('CRM comercial por setor: funil de cada vendedor, leads com cadência, mapa de mercados e gerencial que une ERP e hub.', 'Sales CRM by sector: each seller\'s funnel, leads with a cadence, market map and a management report joining ERP and hub.'),
    manual: MANUAL,
    /* mini tour: só ganchos do módulo (data-f, .ac-*), nada que dependa do idioma */
    tour: [
      { alvo: '.acrm [data-f="aba-painel"]', acao: 'clicar', titulo: P('O CRM de quem vende', 'The CRM of the people who sell'),
        texto: P('Carteira, prospecção e metas de cada setor de vendas num lugar só. O dia começa aqui, no Painel.',
          'Portfolio, prospecting and goals of each sales sector in one place. The day starts here, on the Dashboard.') },
      { alvo: '.acrm [data-f="dono"]', titulo: P('Cada vendedor com o seu dia', 'Each seller with their own day'),
        texto: P('Escolha um vendedor para ver a carteira dele, ou a visão geral para comparar a equipe inteira.',
          'Pick a seller to see their portfolio, or the overview to compare the whole team.') },
      { alvo: '.acrm .ac-ia', titulo: P('Quem contatar hoje, e por quê', 'Who to contact today, and why'),
        texto: P('A IA aponta os clientes que pedem atenção, com o motivo de cada um, e escreve o resumo do dia em português, espanhol ou inglês. Contatei tira o cliente da lista.',
          'The AI points out the customers who need attention, with the reason for each one, and writes the daily briefing in Portuguese, Spanish or English. Contacted takes the customer off the list.') },
      { alvo: '.acrm .ac-k6', titulo: P('A carteira em seis números', 'The portfolio in six numbers'),
        texto: P('Carteira, conversão, contato efetivo, pedidos, atrasados e o que vence nos próximos sete dias, sem abrir planilha.',
          'Portfolio, conversion, effective contact, orders, overdue and what is due in the next seven days, with no spreadsheet.') },
      { alvo: '.acrm [data-f="aba-mapa"]', acao: 'clicar', titulo: P('Kanban, carteira e mapa de mercados', 'Kanban, portfolio and market map'),
        texto: P('Nas outras áreas moram o quadro kanban de cada vendedor, a carteira em tabela, os leads, o gerencial e o mapa de mercados em 3D.',
          'The other areas hold each seller\'s kanban board, the portfolio as a table, the leads, the management report and the 3D market map.') },
      { alvo: '.acrm .ph-fora', titulo: P('Veja o AUTO CRM completo em ação', 'See the full AUTO CRM in action'),
        texto: P('A demonstração pública mostra o Painel. Aqui está o vídeo do sistema inteiro e, se quiser vê-lo funcionando, é só me chamar.',
          'The public demo shows the Dashboard. Here is the video of the whole system and, if you want to see it running, just reach me.') },
    ],
    montar(el, api) {
      if (!db) db = semear();
      const { t, h, fmt } = api;
      const kit = api.ui;
      const E = api.estado;
      if (!E.pronto) Object.assign(E, { pronto: true, aba: 'painel', ownerId: 12, idiomaIa: api.lang });
      const icone = n => api.icone(ic(n));
      const comF = (e, f) => { e.setAttribute('data-f', f); return e; };
      const botao = o => { const b = kit.botao({ ...o, icone: ic(o.icone) }); if (o.foco) b.setAttribute('data-f', o.foco); return b; };
      const fora = titulo => (kit.foraDaDemo ? kit.foraDaDemo({ titulo })
        : kit.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is outside the public demo.') }));
      const nomeU = id => (VENDEDORES.find(v => v[0] === id) || [0, ''])[1];
      const corVar = c => 'var(--ph-' + c + ')';
      /* escrita: 'create' nos gestos que gravam (a auditoria do hub registra); consulta fica sem */
      const rastro = (titulo, subtitulo, passos, aoOk, escrita) => kit.backend({ titulo, subtitulo, velocidade: 1.7, escrita,
        passos: passos.map(([tipo, tt, ms]) => ({ tipo, titulo: tt, ms, estado: 'ok' })), aoConcluir: r => { if (r.ok && aoOk) aoOk(); } });
      const PERMISSAO = ['regra', P('Confere a permissão', 'Checks the permission'), 10];
      const AUDITORIA = ['sql', P('Registra a auditoria', 'Writes the audit trail'), 11];
      const fichaCliente = () => kit.modal({ titulo: P('Ficha do cliente', 'Customer record'), corpo: fora(P('Ficha do cliente', 'Customer record')) });

      injetarCss();
      const raiz = h('div', { class: 'acrm ac-raiz' });
      el.append(raiz);
      let tela = null, subEl = null, acoesEl = null;
      const recarregar = () => { if (tela) tela.recarregar(); };

      const ABAS = [['painel', P('Painel', 'Dashboard'), 'barras', P('Indicadores', 'Indicators')], ['kanban', 'Kanban', 'quadro', P('Acompanhamento de clientes', 'Customer follow-up')],
        ['carteira', P('Carteira', 'Portfolio'), 'tabela', P('Carteira de clientes', 'Customer portfolio')], ['mapa', P('Mapa', 'Map'), 'bussola', P('Mapa de mercados', 'Market map')],
        ['observacoes', P('Ponto de Atenção', 'Attention Point'), 'mensagem', P('Pontos de Atenção', 'Attention Points')], ['leads', 'Leads', 'novoLead', P('Base de leads', 'Lead base')],
        ['relatorios', P('Relatórios', 'Reports'), 'prancheta', P('Desempenho no período', 'Performance in the period')], ['gerencial', P('Gerencial', 'Management'), 'medidor', P('Relatório gerencial', 'Management report')],
        ['config', 'Config', 'ajustes', P('Configuração de disparo', 'Sending setup')], ['setores', P('Setores', 'Sectors'), 'maleta', P('Configuração de setores', 'Sector setup')]];
      const nomeDono = () => (E.ownerId ? nomeU(E.ownerId) : t(P('Visão geral', 'Overview')));
      function pintarSub() {
        const a = ABAS.find(x => x[0] === E.aba) || ABAS[0];
        subEl.textContent = t(P('Exportação', 'Export')) + ' · ' + t(a[3]) + (['painel', 'kanban', 'carteira', 'observacoes', 'relatorios'].includes(a[0]) ? ' · ' + nomeDono() : '');
      }
      function acoesCab() {
        const painel = E.aba === 'painel';
        return [
          h('label', { class: 'ac-hsel' }, icone('pessoas'), h('span', { class: 'vh' }, P('Vendedor em exibição', 'Seller on display')),
            comF(kit.select({ ariaLabel: P('Vendedor em exibição', 'Seller on display'), valor: E.ownerId ? String(E.ownerId) : '',
              opcoes: [{ valor: '', texto: P('Visão geral (consolidado)', 'Overview (consolidated)') }].concat(VENDEDORES.map(([id, nome]) => ({ valor: id, texto: nome }))),
              aoMudar: v => { E.ownerId = v === '' ? null : +v; pintar('dono'); } }), 'dono')),
          h('div', { class: 'ph-chips', role: 'group', 'aria-label': t(P('Idioma da IA', 'AI language')) }, ['pt', 'es', 'en'].map(v => {
            const b = botao({ texto: [h('span', { class: 'ac-flag', 'aria-hidden': 'true', html: BANDEIRA[v] }), v.toUpperCase()], tamanho: 'p', classe: 'ph-chip', foco: 'ia-' + v,
              titulo: P('Idioma da IA: ' + v.toUpperCase(), 'AI language: ' + v.toUpperCase()), aoClicar: () => { E.idiomaIa = v; pintar('ia-' + v); } });
            b.setAttribute('aria-pressed', String(E.idiomaIa === v));
            return b;
          })),
          painel && botao({ icone: 'retorno', titulo: P('Atualizar', 'Refresh'), foco: 'atualizar', aoClicar: () => rastro(P('Atualizar a aba Indicadores', 'Refresh the Indicators tab'), nomeDono(), [
            ['api', P('Pede os indicadores do painel', 'Requests the dashboard indicators'), 50], PERMISSAO,
            ['sql', P('Lê a carteira e os pedidos', 'Reads the portfolio and the orders'), 90], ['api', P('Devolve os indicadores', 'Returns the indicators'), 20]], recarregar) }),
        ].filter(Boolean);
      }
      const pintarAcoes = () => acoesEl.replaceChildren(...acoesCab());

      /* ---------- Painel ---------- */
      function kpi(rotulo, valor, icn, cor) {
        const e = kit.kpis([{ rotulo, valor, icone: ic(icn) }]).firstElementChild;
        e.classList.add('ac-metric');
        e.style.setProperty('--tom', corVar(cor));
        return e;
      }
      function chipRecompra(dono) {
        const b = kit.botao({ texto: P('Recompra hoje', 'Repeat orders today'), icone: ic('ciclo'), tom: 'primario', aoClicar: () => painelRecompra(dono) });
        b.append(h('span', { class: 'ph-chip-n' }, String(db[dono].rec.length)));
        return h('div', { class: 'ph-linha' }, b);
      }
      function painelRecompra(dono) {
        const pn = kit.painel({ titulo: P('Recompra (carteira)', 'Repeat orders (portfolio)'), conteudo: corpo => {
          const pintarR = () => {
            const lista = db[dono].rec;
            corpo.replaceChildren(h('div', { class: 'ph-pilha' },
              !lista.length && kit.vazio({ icone: 'check', titulo: P('Nada de recompra vencendo hoje.', 'No repeat-order task due today.') }),
              h('div', { class: 'ph-lista' }, lista.map(tk => {
                const [empresa, canal, acao, dias] = tk, venc = dias < 0, cn = CANAL[canal];
                return h('div', { class: 'ph-lista-item ac-lista-item' + (venc ? ' tom-erro' : '') },
                  h('div', { class: 'ph-linha' }, h('span', { class: 'ph-texto-p' + (venc ? '' : ' ph-texto-mudo') }, fmt.data(api.data(dias)) + (venc ? t(P(' · vencida', ' · overdue')) : '')), kit.badge(cn[0], cn[1])),
                  h('button', { type: 'button', class: 'ac-link', onclick: () => { pn.fechar(); fichaCliente(); } }, h('strong', null, empresa)),
                  h('span', { class: 'ph-texto-mudo ph-texto-p' }, acao),
                  h('div', { class: 'ph-linha' }, kit.botao({ texto: P('registrar', 'log'), tom: 'primario', tamanho: 'p', aoClicar: () => rastro(P('Registrar tarefa de recompra', 'Log a repeat-order task'), empresa, [
                    ['api', P('Recebe o registro', 'Receives the log'), 30], PERMISSAO, ['sql', P('Conclui a tarefa e grava o contato', 'Closes the task and records the contact'), 40], AUDITORIA],
                  () => { db[dono].rec = db[dono].rec.filter(x => x !== tk); pintarR(); recarregar(); kit.toast(P('Tarefa registrada.', 'Task logged.'), 'ok'); }, 'create') })));
              }))));
          };
          pintarR();
        } });
      }
      function cartaoPrioridades(dono) {
        const lista = db[dono].prio, top = lista.slice(0, 3);
        const pais = iso => (PAIS[iso] || [iso, iso])[E.idiomaIa === 'en' ? 1 : 0];
        const nomes = top.map(x => x[0] + ' (' + pais(x[1]) + ')').join(', ');
        const briefing = !lista.length ? null : {
          pt: 'Hoje há ' + lista.length + ' cliente(s) para contatar. Comece por ' + nomes + ': são os que estão há mais tempo sem contato. Quem tem orçamento aberto merece uma ligação antes de uma mensagem.',
          es: 'Hoy hay ' + lista.length + ' cliente(s) para contactar. Empiece por ' + nomes + ': son los que llevan más tiempo sin contacto. Quien tiene presupuesto abierto merece una llamada antes que un mensaje.',
          en: 'There are ' + lista.length + ' customer(s) to contact today. Start with ' + nomes + ': they have gone the longest without contact. Anyone with an open quote deserves a call before a message.',
        }[E.idiomaIa];
        const atualizar = () => rastro(P('Priorização do dia', 'Today\'s priorities'), nomeU(dono), [
          ['api', P('Pede a priorização do dia', 'Requests today\'s priorities'), 35], PERMISSAO, ['sql', P('Lê a carteira do vendedor', 'Reads the seller\'s portfolio'), 60],
          ['ia', P('Gera o texto com IA (se falhar, a tela segue sem o resumo)', 'Writes the text with AI (if it fails, the screen goes on without the briefing)'), 2300]],
        () => { db.briefing[dono] = true; recarregar(); });
        const enviarTodos = () => kit.modal({ titulo: P('Enviar todos', 'Send to all'), largura: 'p',
          corpo: h('p', null, P('Enviar e-mail e WhatsApp para os ' + lista.length + ' clientes da priorização de hoje?', 'Send email and WhatsApp to the ' + lista.length + ' customers on today\'s priorities?')),
          acoes: ctl => [kit.botao({ texto: P('Cancelar', 'Cancel'), aoClicar: () => ctl.fechar() }), kit.botao({ texto: P('Enviar', 'Send'), tom: 'primario', aoClicar: () => {
            ctl.fechar();
            const n = lista.length;
            rastro(P('Enviar todos', 'Send to all'), nomeU(dono), [['api', P('Recebe o disparo', 'Receives the sending'), 40], PERMISSAO,
              ['email', P('Envia os e-mails', 'Sends the emails'), 900], ['whatsapp', P('Envia as mensagens de WhatsApp', 'Sends the WhatsApp messages'), 700], ['sql', P('Registra os contatos', 'Records the contacts'), 60]],
            () => { db[dono].prio = []; recarregar(); kit.toast(P(n + ' clientes contatados.', n + ' customers contacted.'), 'ok'); }, 'create');
          } })] });
        return kit.cartao({ classe: 'ac-card ac-ia', conteudo: h('div', { class: 'ph-pilha' },
          h('div', { class: 'ph-linha ph-entre' },
            h('div', { class: 'ac-ia-tt' }, icone('ia'), h('span', null, P('Priorização do dia', 'Today\'s priorities'), ' ', h('small', null, P('IA', 'AI')), lista.length > 0 && h('em', null, ' · ' + lista.length))),
            h('div', { class: 'ph-linha' },
              lista.length > 0 && botao({ texto: P('Enviar todos', 'Send to all'), icone: 'enviar', tom: 'ok', titulo: P('Disparar e-mail/WhatsApp para todos da lista', 'Send email/WhatsApp to everyone on the list'), aoClicar: enviarTodos }),
              botao({ texto: P('Atualizar', 'Refresh'), icone: 'retorno', aoClicar: atualizar }))),
          db.briefing[dono] && briefing ? h('p', { class: 'ac-brief' }, briefing) : lista.length > 0 && h('p', { class: 'ac-brief dica' }, P('Use Atualizar para a IA redigir o resumo do dia.', 'Use Refresh for the AI to write today\'s briefing.')),
          lista.length ? h('div', { class: 'ac-prio' }, lista.map((x, i) => h('div', { class: 'it' }, h('span', { class: 'n' }, String(i + 1)),
            h('button', { type: 'button', class: 'tx', onclick: fichaCliente }, h('span', { class: 'e' }, x[0], h('small', null, ' · ' + x[1])), h('span', { class: 'm' }, x[2])),
            botao({ texto: P('Contatei', 'Contacted'), icone: 'fone', tom: 'ok', tamanho: 'p', titulo: P('Marcar como contatado e remover da lista', 'Mark as contacted and remove from the list'),
              aoClicar: () => rastro(P('Registrar contato', 'Log a contact'), x[0] + ' · ' + t(P('Telefone', 'Phone')), [['api', P('Recebe o contato', 'Receives the contact'), 32], PERMISSAO,
                ['sql', P('Grava o contato no histórico', 'Appends the contact to the history'), 22], AUDITORIA],
              () => { db[dono].prio = db[dono].prio.filter(y => y !== x); recarregar(); kit.toast(P('Contato registrado.', 'Contact logged.'), 'ok'); }, 'create') }))))
            : h('p', { class: 'ac-brief dica' }, P('Nenhum cliente pendente de contato.', 'No customers pending contact.'))) });
      }
      function abaPainel(p) {
        const dono = E.ownerId, base = BASE[dono || 'geral'], k = base.k;
        if (dono) p.append(chipRecompra(dono), cartaoPrioridades(dono));
        else p.append(kit.cartao({ classe: 'ac-card ac-ia', conteudo: h('div', { class: 'ac-ia-tt' }, icone('ia'), h('div', null, h('div', null, P('Priorização do dia', 'Today\'s priorities'), ' ', h('small', null, P('IA', 'AI'))),
          h('div', { class: 'tx' }, P('A priorização é por vendedor. Selecione um vendedor no seletor do topo para ver quem ele deve contatar hoje e por quê.', 'Prioritization is per seller. Pick a seller in the top selector to see who they should contact today and why.')))) }));
        p.append(h('div', { class: 'ph-kpis ac-k6' },
          kpi(P('Carteira', 'Portfolio'), fmt.num(k[0]), 'pessoas', 'neutro'), kpi(P('Conversão', 'Conversion'), k[1] + '%', 'tendencia', 'ok'),
          kpi(P('Contato efetivo', 'Effective contact'), k[2] + '%', 'alvo', 'info'), kpi(P('Pedidos', 'Orders'), fmt.num(k[3]), 'sacola', 'ok'),
          kpi(P('Atrasados', 'Overdue'), fmt.num(k[4]), 'alerta', 'erro'), kpi(P('Próx. 7 dias', 'Next 7 days'), fmt.num(k[5]), 'relogio', 'alerta')));
        const dist = COLUNAS.map((c, i) => ({ rotulo: c[0], valor: base.d[i], cor: c[1] }));
        const barras = kit.barras({ dados: dist.map(d => ({ rotulo: d.rotulo, valor: d.valor })) });
        barras.querySelectorAll('.ph-barras-item').forEach((li, i) => li.style.setProperty('--tom', corVar(dist[i].cor)));
        p.append(kit.cartao({ titulo: P('Distribuição por coluna', 'Distribution by column'), icone: ic('barras'), classe: 'ac-card ac-dist', conteudo: barras }));
        if (!dono) {
          const th = (r, num) => h('th', { scope: 'col', class: num ? 'is-num' : null }, h('span', null, r));
          const linhas = VENDEDORES.map(([id, nome]) => {
            const m = BASE[id].k;
            const tr = h('tr', { class: 'is-clicavel', tabindex: '0' }, h('td', { class: 'fw' }, nome), h('td', null, fmt.num(m[0])), h('td', { class: 'vd' }, m[1] + '%'),
              h('td', { class: 'az' }, m[2] + '%'), h('td', { class: 'vm' }, fmt.num(m[4])), h('td', { class: 'cz' }, icone('avancar')));
            const abrir = () => { E.ownerId = id; pintar('dono'); };
            tr.addEventListener('click', abrir);
            tr.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target === tr) abrir(); });
            return tr;
          });
          p.append(kit.cartao({ titulo: P('Comparativo por vendedor', 'By seller'), icone: ic('pessoas'), classe: 'ac-card ac-card--c', conteudo:
            h('div', { class: 'ph-tabela-wrap ac-tb-w', style: { maxHeight: '46vh' } }, h('table', { class: 'ph-tabela ac-tb', 'aria-label': t(P('Comparativo por vendedor', 'By seller')) },
              h('thead', null, h('tr', null, th(P('Vendedor', 'Seller')), th(P('Carteira', 'Portfolio')), th(P('Conversão', 'Conversion')), th(P('Contato ef.', 'Eff. contact')), th(P('Atrasados', 'Overdue')), th(''))),
              h('tbody', null, linhas))) }));
        }
      }

      /* ---------- casca: barra do sistema e as dez áreas; só o Painel navega ---------- */
      function pintar(foco) {
        subEl = h('p', { class: 'ac-sub' });
        acoesEl = h('div', { class: 'ac-hacoes' });
        const areas = kit.abas({ chave: 'aba', rotulo: P('Áreas do AUTO CRM', 'AUTO CRM areas'),
          abas: ABAS.map(([id, rot, ico]) => ({ id, rotulo: rot, icone: ic(ico), contador: id === 'leads' ? 3 : undefined,
            montar: pn => { pn.setAttribute('data-aba', id); if (id === 'painel') abaPainel(pn); else pn.append(fora(rot)); } })),
          aoTrocar: () => { pintarSub(); pintarAcoes(); } });
        areas.querySelector('[role="tablist"]').classList.add('ac-tabs');
        areas.querySelectorAll('[role="tab"]').forEach((b, i) => b.setAttribute('data-f', 'aba-' + ABAS[i][0]));
        areas.painel.classList.add('ac-cont');
        tela = areas;
        raiz.replaceChildren(
          h('header', { class: 'ac-head' },
            h('div', { class: 'ac-head-top' }, h('div', { class: 'ac-ctx' }, h('p', { class: 'ph-kicker' }, P('EMPRESA DEMO', 'DEMO COMPANY')), subEl), acoesEl),
            h('div', { class: 'ac-setores' }, h('span', { class: 'r' }, P('Setor', 'Sector')), kit.badge(P('Exportação', 'Export'), 'info'))),
          areas);
        pintarSub(); pintarAcoes();
        if (foco) { const alvo = raiz.querySelector('[data-f="' + foco + '"]'); if (alvo) alvo.focus(); }
      }
      pintar();
    },
  });
})();
