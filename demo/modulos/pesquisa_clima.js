/* Pesquisa de clima e RH · versão pública curta do módulo do ProjectHub de demonstração (id pesquisa_clima).
   Só a lista de Pesquisas navega (indicadores do setor, filtro, link de convite, ativar, encerrar, duplicar e excluir);
   as outras cinco áreas aparecem na navegação e abrem o cartão "fora da demonstração". Visual do kit do hub; o bloco
   de estilo #pcl-real-css só usa tokens --ph-*. Dados fictícios e prontos, nenhuma chamada de rede. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const L = (x, l) => (x && typeof x === 'object' ? x[l] : x);
  const RAIZ = 'pcl-real';
  const LINK = 'https://hub.exemplo.com/participar/';

  /* ícones de traço (grade 24x24) */
  const IC = {
    clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    bar: '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="m4.9 4.9 2.1 2.1"/><path d="m17 17 2.1 2.1"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="m4.9 19.1 2.1-2.1"/><path d="m17 7 2.1-2.1"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    okc: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    link: '<path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/>',
    edit: '<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>',
    files: '<path d="M20 7h-3a2 2 0 0 1-2-2V2"/><path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z"/><path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  };
  const ABAS = [
    ['pesquisas', P('Pesquisas', 'Surveys'), 'clipboard'], ['resultados', P('Resultados', 'Results'), 'bar'], ['apresentacao', P('Apresentação', 'Presentation'), 'monitor'],
    ['destinatarios', P('Destinatários', 'Recipients'), 'users'], ['rh', P('RH', 'HR'), 'briefcase'], ['configuracoes', P('Configurações', 'Settings'), 'settings'],
  ];
  const SETORES = [[1, P('RH', 'HR')], [2, 'Marketing']];
  const ST = { rascunho: ['neutro', P('Rascunho', 'Draft')], ativa: ['ok', P('Ativa', 'Active')], encerrada: ['info', P('Encerrada', 'Closed')] };
  const ORDEM = { ativa: 0, rascunho: 1, encerrada: 2 };

  /* ---------- dados prontos ---------- */
  let db = null;
  function semear(api) {
    const ano = new Date().getFullYear();
    const tpl = P('Convite para pesquisa', 'Survey invitation');
    const anual = P('Edição anual. Leva cerca de 8 minutos e as respostas são anônimas.', 'Annual edition. It takes about 8 minutes and answers are anonymous.');
    const d = { seq: 10, pesquisas: [] };
    const pq = (setorId, titulo, link, status, ini, fim, perg, dest, resp, o = {}) =>
      d.pesquisas.push({ id: ++d.seq, setorId, titulo, link, status, ini: api.data(ini, '08:00'), fim: api.data(fim, '18:00'), perg, dest, resp, template: o.tpl ? tpl : null, descricao: o.desc || null });
    pq(1, P('Pesquisa de Clima ' + (ano - 1), 'Climate Survey ' + (ano - 1)), 'pesquisa-de-clima-' + (ano - 1), 'encerrada', -392, -364, 26, 268, 186, { tpl: 1, desc: anual });
    pq(1, P('Pesquisa de Clima ' + ano, 'Climate Survey ' + ano), 'pesquisa-de-clima-' + ano, 'ativa', -19, 11, 27, 324, 231, { tpl: 1, desc: anual });
    pq(1, P('Pulso de integração', 'Onboarding pulse'), 'pulso-de-integracao', 'rascunho', 14, 28, 6, 0, 0);
    pq(2, P('Satisfação com o evento de lançamento', 'Launch event satisfaction'), 'satisfacao-com-o-evento-de-lancamento', 'encerrada', -58, -44, 8, 82, 64, { tpl: 1 });
    pq(2, P('Percepção da marca interna', 'Internal brand perception'), 'percepcao-da-marca-interna', 'rascunho', 20, 40, 2, 0, 0);
    return d;
  }

  /* ---------- bloco de estilo: só a disposição das peças, com os tokens do tema ---------- */
  const ROTULO = 'font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const CSS = [
    ['&', 'min-width:0;color:var(--ph-text);font-size:13px;line-height:1.5'], ['&.p-raiz', 'display:flex;flex-direction:column;min-width:0'], ['p,h2,h3,h4', 'margin:0'],
    ['.ic', 'display:inline-flex;flex:none'], ['.ic svg', 'display:block;width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round'],
    ['.p-ctx', 'display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px 16px;padding:12px clamp(16px,3vw,32px)'],
    ['.p-setor', 'display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0'], ['.p-setor .k', 'color:var(--ph-text-dim);' + ROTULO], ['.p-cam', 'font-size:12px;color:var(--ph-text-dim)'],
    ['.p-tit', 'margin-bottom:18px'], ['.p-tit .ph-sub', 'margin-top:4px'], ['.h14', 'font-size:14px;font-weight:700;color:var(--ph-text)'],
    ['.kpis3', 'grid-template-columns:repeat(3,minmax(0,1fr));margin-bottom:20px'], ['.b-pri.sm', 'margin-top:14px'], ['p.cf', 'white-space:pre-line;font-size:13.5px;color:var(--ph-text-2);line-height:1.6'],
    ['.ph-lista-item', 'grid-template-columns:minmax(0,1fr)'],
    ['article.pq', 'padding:12px 14px'], ['.pq-top', 'display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap'], ['.pq-top>.f1', 'flex:1 1 260px'],
    ['.pq-tit', 'display:flex;align-items:center;gap:9px;margin-bottom:4px;min-width:0'], ['.pq-tit p', 'font-size:14px;font-weight:650;color:var(--ph-text)'], ['.pq-ds', 'font-size:12.5px;color:var(--ph-text-muted);margin:0 0 8px;line-height:1.4'],
    ['.pq-meta', 'display:flex;gap:6px 14px;flex-wrap:wrap;align-items:center;font-size:12px;color:var(--ph-text-dim)'], ['.pq-meta b', 'color:var(--ph-text);font-weight:700'], ['.pq-meta .rasc', 'color:var(--ph-alerta)'],
    ['.pq-meta .per,.pq-meta .tpl', 'display:inline-flex;align-items:center;gap:5px'],
    ['.pq-ac', 'display:flex;gap:6px;flex-wrap:wrap'], ['.pq-lk', 'margin-top:12px;padding-top:12px;border-top:1px solid var(--ph-border)'],
    ['.lk', 'display:flex;align-items:flex-start;gap:10px;background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio-lg);padding:12px 14px'], ['.lk>.ic', 'margin-top:2px;color:var(--ph-accent-light)'],
    ['.lk-t', 'margin:0 0 6px;font-size:12.5px;font-weight:700;color:var(--ph-text)'],
    ['.lk-u', 'font-size:13px;font-family:var(--ph-font-mono);color:var(--ph-accent-light);word-break:break-all;background:var(--ph-campo-bg);padding:8px 10px;border-radius:var(--ph-raio);border:1px solid var(--ph-border)'],
    ['.lk-d', 'margin:8px 0 10px;font-size:12px;color:var(--ph-text-muted);line-height:1.5'],
    ['.row', 'display:flex;align-items:center;gap:8px;flex-wrap:wrap;min-width:0'], ['.row.entre', 'justify-content:space-between'], ['.col', 'display:flex;flex-direction:column;gap:12px;min-width:0'],
    ['.f1', 'flex:1;min-width:0'], ['.el', 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0'], ['.g8', 'gap:8px'], ['.g12', 'gap:12px'], ['.mb14', 'margin-bottom:14px'],
  ];
  const CSS_640 = [['.kpis3', 'grid-template-columns:minmax(0,1fr)'], ['.p-cam', 'width:100%']];
  const cssDe = lista => lista.map(([s, d]) => s.split(',').map(x => (x[0] === '&' ? '.' + RAIZ + x.slice(1) : '.' + RAIZ + ' ' + x)).join(',') + '{' + d + '}').join('\n');
  function injetarCss() {
    if (document.getElementById('pcl-real-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'pcl-real-css');
    st.textContent = cssDe(CSS) + '\n@media (max-width:640px){' + cssDe(CSS_640) + '}';
    (document.head || document.documentElement).appendChild(st);
  }

  const MANUAL = {
    pt: {
      destaque: 'Pesquisas internas do começo ao fim no mesmo lugar: o setor monta o questionário, distribui pela plataforma de WhatsApp ou por um link público, lê o relatório pronto e apresenta à diretoria sem sair do portal. Ao lado, uma área própria do RH para as entrevistas de desligamento, assinadas na tela.',
      oque: 'É um módulo do hub com duas metades. A primeira é anônima: pesquisas respondidas por um link, que viram relatório e apresentação. A segunda é identificada: entrevistas do RH registradas por pessoa, com assinatura na tela e trilha de auditoria.'
        + '\n\nSão seis áreas: Pesquisas, Resultados, Apresentação, Destinatários, RH e Configurações. Nesta demonstração pública a lista de Pesquisas é a tela navegável: indicadores do setor, filtro, link de convite e as ações de ativar, encerrar, duplicar e excluir, sobre dados fictícios.',
      finalidade: 'Antes, a pesquisa de clima vivia em formulário externo e planilha, o resultado era difícil de ler, a apresentação para a diretoria era montada à mão e a entrevista de desligamento ficava em papel, digitada depois numa planilha que não virava indicador.'
        + '\n\nHoje a empresa mede com a mesma régua a cada edição, enxerga a evolução, leva o resultado pronto para a reunião e mantém as entrevistas do RH como registro pesquisável, cruzado com a folha de pagamento do ERP.'
        + '\n\nProjetado e construído por Ruan Siqueira. O conteúdo das perguntas e o modelo da entrevista vieram da área de RH.',
      alcance: [
        'Pesquisas por setor, com questionário em sessões: escala, matriz, múltipla escolha e texto livre.',
        'Convite pela plataforma de WhatsApp ou por link público, com respostas anônimas.',
        'Relatório com favorabilidade, eNPS, comparação entre edições e análise com IA.',
        'Apresentação em slides a partir do resultado, com link público somente de leitura.',
        'Área do RH com entrevistas de desligamento assinadas na tela e painel de indicadores. Tamanho: 57 rotas de API nas pesquisas e 20 no RH.',
      ],
      tecnologias: ['Next.js', 'React', 'TypeScript', 'ASP.NET Core', 'SQL Server', 'ECharts', 'IA generativa', 'API de WhatsApp'],
    },
    en: {
      destaque: 'Internal surveys from start to finish in one place: the sector builds the questionnaire, distributes it through the WhatsApp platform or a public link, reads the finished report and presents it to the board without leaving the portal. Next to it, a dedicated HR area for exit interviews, signed on screen.',
      oque: 'It is a hub module with two halves. The first is anonymous: surveys answered through a link, which become a report and a presentation. The second is identified: HR interviews recorded per person, with an on-screen signature and an audit trail.'
        + '\n\nThere are six areas: Surveys, Results, Presentation, Recipients, HR and Settings. In this public demo the Surveys list is the screen you can use: sector indicators, filter, invitation link and the activate, close, duplicate and delete actions, on fictitious data.',
      finalidade: 'Before, the climate survey lived in an external form and a spreadsheet, the result was hard to read, the board presentation was assembled by hand and the exit interview stayed on paper, typed later into a spreadsheet that never became an indicator.'
        + '\n\nNow the company measures with the same ruler every edition, sees the trend, takes a finished result to the meeting and keeps HR interviews as a searchable record, cross-checked against the ERP payroll.'
        + '\n\nDesigned and built by Ruan Siqueira. The question content and the interview template came from the HR team.',
      alcance: [
        'Surveys per sector, with a questionnaire in sections: scale, matrix, multiple choice and open text.',
        'Invitation through the WhatsApp platform or a public link, with anonymous answers.',
        'Report with favorability, eNPS, comparison between editions and AI analysis.',
        'Slide presentation built from the result, with a read-only public link.',
        'HR area with exit interviews signed on screen and an indicator dashboard. Size: 57 API routes for surveys and 20 for HR.',
      ],
      tecnologias: ['Next.js', 'React', 'TypeScript', 'ASP.NET Core', 'SQL Server', 'ECharts', 'Generative AI', 'WhatsApp API'],
    },
  };

  Hub.registrar({
    id: 'pesquisa_clima',
    icone: 'pessoas',
    nome: P('Pesquisa de clima e RH', 'Climate survey and HR'),
    resumo: P('Pesquisas internas por setor, respondidas de forma anônima por link, com relatório, comparativo, análise por IA e apresentação em slides. Ao lado, a área do RH com entrevistas de desligamento assinadas na tela.',
      'Internal surveys per sector, answered anonymously through a link, with a report, comparison, AI analysis and slide presentation. Next to it, the HR area with exit interviews signed on screen.'),
    manual: MANUAL,
    /* mini tour: só ganchos do módulo (data-f, .kpis3, article.pq), nada que dependa do idioma */
    tour: [
      { alvo: '.pcl-real [data-f="aba-pesquisas"]', acao: 'clicar', titulo: P('Pesquisas do começo ao fim', 'Surveys from start to finish'),
        texto: P('O setor monta o questionário, convida a equipe e lê o resultado pronto, tudo no hub. Cada setor cuida das suas pesquisas.',
          'The sector builds the questionnaire, invites the team and reads the finished result, all in the hub. Each sector looks after its own surveys.') },
      { alvo: '.pcl-real .kpis3', titulo: P('O setor num olhar', 'The sector at a glance'),
        texto: P('Quantas pesquisas existem, quantas estão no ar agora e quantas respostas já chegaram.',
          'How many surveys there are, how many are live right now and how many answers have come in.') },
      { alvo: '.pcl-real article.pq', titulo: P('Cada pesquisa no seu cartão', 'Each survey on its own card'),
        texto: P('Perguntas, destinatários, respostas e período à vista. Resultados, edição e uma cópia para a próxima edição ficam a um clique.',
          'Questions, recipients, answers and dates in plain sight. Results, editing and a copy for the next edition are one click away.') },
      /* fechar-dialogos: uma janela aberta por um clique no cartão (Editar, Duplicar, Excluir) não fica por cima do holofote */
      { alvo: '.pcl-real [data-f="links"]', antes: 'fechar-dialogos', acao: 'clicar', titulo: P('Um link para todos', 'One link for everyone'),
        texto: P('Com a pesquisa no ar, o mesmo link vai pelo WhatsApp, por e-mail ou num QR. As respostas são anônimas.',
          'Once the survey is live, the same link goes out on WhatsApp, by email or as a QR code. Answers are anonymous.') },
      { alvo: '.pcl-real [data-f="aba-resultados"]', antes: 'fechar-dialogos', acao: 'clicar', titulo: P('Resultado pronto para a reunião', 'Results ready for the meeting'),
        texto: P('Favorabilidade, eNPS e a comparação entre edições saem prontos, e a Apresentação vira slides para a diretoria. O RH ainda tem a sua área para as entrevistas de desligamento.',
          'Favorability, eNPS and the comparison between editions come out ready, and the Presentation turns into slides for the board. HR also has its own area for exit interviews.') },
      { alvo: '.pcl-real .ph-fora', antes: 'fechar-dialogos', titulo: P('Veja o sistema completo em ação', 'See the full system in action'),
        texto: P('Esta tela fica na versão completa. O vídeo mostra o sistema inteiro funcionando. Quer ver ao vivo? É só me chamar por aqui.',
          'This screen is in the full version. The video shows the whole system running. Want to see it live? Just reach me from here.') },
    ],
    montar(el, api) {
      const { h, t, fmt, ui } = api;
      const E = api.estado;
      if (!db) db = semear(api);
      if (!E.setorId) Object.assign(E, { setorId: 1, filtro: 'ativa', linkAberto: null });
      injetarCss();
      const raiz = h('div', { class: RAIZ + ' p-raiz' });
      el.append(raiz);
      let nav = null;

      const ic = (n, tam) => h('span', { class: 'ic', 'aria-hidden': 'true', style: 'width:' + tam + 'px;height:' + tam + 'px', html: '<svg viewBox="0 0 24 24" focusable="false">' + IC[n] + '</svg>' });
      const btn = (texto, aoClicar, o = {}) => {
        const b = ui.botao({ texto, aoClicar, icone: o.ic && IC[o.ic], tom: o.tom || 'secundario', tamanho: o.grande ? null : 'p', titulo: o.titulo, classe: 'b' + (o.classe ? ' ' + o.classe : '') });
        if (o.press != null) { b.classList.add('ph-chip'); b.setAttribute('aria-pressed', String(!!o.press)); }
        if (o.f) b.setAttribute('data-f', o.f);
        return b;
      };
      const fora = titulo => (ui.foraDaDemo ? ui.foraDaDemo({ titulo })
        : ui.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is outside the public demo.') }));
      const foraModal = titulo => ui.modal({ titulo, classe: RAIZ, corpo: fora(titulo) });
      const rastro = (titulo, sub, passos, aoOk, escrita) => ui.backend({ titulo, subtitulo: sub, velocidade: 1.6, escrita,
        passos: passos.map(([tipo, tt, ms]) => ({ tipo, titulo: tt, ms, estado: 'ok' })), aoConcluir: r => { if (r.ok && aoOk) aoOk(); } });
      const RECEBE = ['api', P('Recebe o pedido', 'Receives the request'), 60];
      const PORTAO = ['regra', P('Confere no servidor o papel e o setor de quem chamou', 'Checks on the server the role and sector of the caller'), 90];
      const AUDIT = ['sql', P('Registra na trilha de auditoria', 'Writes the audit trail'), 70];
      const confirmar = (texto, ok, rotulo, perigo) => ui.modal({ titulo: P('Confirmação', 'Confirmation'), largura: 'p', classe: RAIZ, corpo: h('p', { class: 'cf' }, texto),
        acoes: ctl => [btn(P('Cancelar', 'Cancel'), () => ctl.fechar(), { grande: 1 }), btn(rotulo, () => { ctl.fechar(); ok(); }, { grande: 1, tom: perigo ? 'perigo' : 'primario' })] });
      const copiar = txt => { try { if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(() => {}); } catch (x) { /* sem área de transferência */ } ui.toast(P('Link copiado', 'Link copied'), 'ok'); };
      const periodo = p => p.ini && p.fim && fmt.data(p.ini) + ' ' + t(P('a', 'to')) + ' ' + fmt.data(p.fim);
      const irAba = id => { nav.ir(id); const b = raiz.querySelector('[role="tab"][aria-selected="true"]'); if (b) b.focus(); };

      /* ---------- ações encenadas ---------- */
      function mudarStatus(p, status) {
        const titulo = status === 'encerrada' ? P('Encerrar pesquisa', 'Close survey') : p.status === 'encerrada' ? P('Reativar pesquisa', 'Reactivate survey') : P('Ativar pesquisa', 'Activate survey');
        rastro(titulo, t(p.titulo), [RECEBE, PORTAO, ['sql', P('Grava o novo status', 'Saves the new status'), 80], AUDIT], () => {
          p.status = status; pintar();
          ui.toast(status === 'ativa' ? P('Pesquisa ativa: link liberado', 'Survey active: link released') : P('Pesquisa encerrada', 'Survey closed'), 'ok');
        }, 'update');
      }
      function duplicar(p) {
        confirmar(P('Duplicar "' + L(p.titulo, 'pt') + '"?\n\nSerão copiadas apenas as perguntas. A nova pesquisa virá como rascunho, sem respostas, destinatários ou link ativo.',
          'Duplicate "' + L(p.titulo, 'en') + '"?\n\nOnly the questions are copied. The new survey starts as a draft, with no answers, recipients or active link.'), () =>
          rastro(P('Duplicar pesquisa', 'Duplicate survey'), t(p.titulo), [RECEBE, PORTAO, ['sql', P('Copia só as perguntas para um rascunho novo', 'Copies only the questions into a new draft'), 160], AUDIT], () => {
            db.pesquisas.push({ ...p, id: ++db.seq, titulo: P(L(p.titulo, 'pt') + ' (cópia)', L(p.titulo, 'en') + ' (copy)'), link: p.link + '-' + db.seq, status: 'rascunho', ini: null, fim: null, dest: 0, resp: 0 });
            E.filtro = 'todas'; pintar(); ui.toast(P('Pesquisa duplicada como rascunho', 'Survey duplicated as a draft'), 'ok');
          }, 'create'), P('Duplicar', 'Duplicate'));
      }
      function excluir(p) {
        confirmar(P('Excluir esta pesquisa permanentemente?', 'Delete this survey permanently?'), () =>
          rastro(P('Excluir pesquisa', 'Delete survey'), t(p.titulo), [RECEBE, PORTAO, ['sql', P('Remove a pesquisa e tudo o que depende dela', 'Removes the survey and everything that depends on it'), 220], AUDIT], () => {
            db.pesquisas.splice(db.pesquisas.indexOf(p), 1); pintar(); ui.toast(P('Pesquisa excluída', 'Survey deleted'), 'ok');
          }, 'delete'), P('Excluir', 'Delete'), true);
      }

      /* ---------- tela principal: Pesquisas ---------- */
      function caixaLink(p) {
        return h('div', { class: 'lk' }, ic('link', 18), h('div', { class: 'f1' },
          h('p', { class: 'lk-t' }, P('Link de convite', 'Invitation link')),
          h('p', { class: 'lk-u' }, LINK + p.link),
          h('p', { class: 'lk-d' }, P('O mesmo link para todos: WhatsApp, e-mail ou QR. Respostas anônimas.', 'The same link for everyone: WhatsApp, email or QR. Anonymous answers.')),
          h('div', { class: 'row' }, btn(P('Copiar link', 'Copy link'), () => copiar(LINK + p.link), { ic: 'copy' }))));
      }
      function cartao(p) {
        const cont = (n, rot) => h('span', null, h('b', null, fmt.num(n)), ' ', rot);
        const [tom, rot] = ST[p.status];
        return h('article', { class: 'pq ph-lista-item' },
          h('div', { class: 'pq-top' },
            h('div', { class: 'f1' },
              h('div', { class: 'pq-tit' }, h('p', { class: 'el', title: t(p.titulo) }, p.titulo), ui.badge(rot, tom)),
              p.descricao && h('p', { class: 'pq-ds el', title: t(p.descricao) }, p.descricao),
              h('div', { class: 'pq-meta' },
                cont(p.perg, P('perguntas', 'questions')), cont(p.dest, P('destinatários', 'recipients')), cont(p.resp, P('respostas', 'answers')),
                periodo(p) && h('span', { class: 'per' }, ic('calendar', 12), periodo(p)),
                p.status === 'rascunho' && h('span', { class: 'rasc' }, P('Ative para liberar o link público', 'Activate to release the public link')),
                p.template && h('span', { class: 'tpl', title: t(P('Template de disparo do convite', 'Invitation template')) }, ic('send', 12), p.template))),
            h('div', { class: 'pq-ac' },
              btn(P('Resultados', 'Results'), () => irAba('resultados'), { ic: 'bar' }),
              btn(P('Destinatários', 'Recipients'), () => irAba('destinatarios'), { ic: 'users' }),
              p.status === 'ativa' && btn(P('Links', 'Links'), () => { E.linkAberto = E.linkAberto === p.id ? null : p.id; pintar(); }, { ic: 'link', press: E.linkAberto === p.id, f: 'links' }),
              btn(P('Editar', 'Edit'), () => foraModal(P('Editor de perguntas', 'Question editor')), { ic: 'edit' }),
              btn(P('Duplicar', 'Duplicate'), () => duplicar(p), { ic: 'files', titulo: P('Duplicar perguntas em nova pesquisa (rascunho)', 'Duplicate the questions into a new survey (draft)') }),
              p.status === 'rascunho' && btn(P('Ativar', 'Activate'), () => mudarStatus(p, 'ativa'), { tom: 'ok' }),
              p.status === 'ativa' && btn(P('Encerrar', 'Close'), () => mudarStatus(p, 'encerrada')),
              p.status === 'encerrada' && btn(P('Reativar', 'Reactivate'), () => mudarStatus(p, 'ativa'), { tom: 'ok' }),
              btn('', () => excluir(p), { ic: 'trash', tom: 'perigo', titulo: P('Excluir pesquisa', 'Delete survey') }))),
          E.linkAberto === p.id && p.status === 'ativa' && h('div', { class: 'pq-lk' }, caixaLink(p)));
      }
      function telaPesquisas(painel) {
        const todas = db.pesquisas.filter(p => p.setorId === E.setorId);
        const ativas = todas.filter(p => p.status === 'ativa').length;
        const vis = todas.filter(p => E.filtro === 'todas' || p.status === 'ativa').sort((a, b) => ORDEM[a.status] - ORDEM[b.status]);
        const nova = () => foraModal(P('Nova pesquisa', 'New survey'));
        const kpis = ui.kpis([
          { rotulo: P('Total de pesquisas', 'Total surveys'), valor: todas.length, icone: IC.clipboard },
          { rotulo: P('Ativas agora', 'Active now'), valor: ativas, icone: IC.clock },
          { rotulo: P('Respostas coletadas', 'Answers collected'), valor: fmt.num(todas.reduce((s, p) => s + p.resp, 0)), icone: IC.okc }]);
        kpis.classList.add('kpis3');
        ['var(--ph-accent)', 'var(--ph-ok)', 'var(--ph-cor-ambar)'].forEach((cor, i) => { kpis.children[i].classList.add('kpi'); kpis.children[i].style.setProperty('--tom', cor); });
        const filtro = ui.chips({ rotulo: P('Filtrar pesquisas', 'Filter surveys'), valor: E.filtro, aoMudar: v => { E.filtro = v; pintar(); },
          opcoes: [{ valor: 'ativa', texto: P('Ativas (' + ativas + ')', 'Active (' + ativas + ')') }, { valor: 'todas', texto: P('Todas (' + todas.length + ')', 'All (' + todas.length + ')') }] });
        const corpo = !todas.length ? ui.vazio({ icone: IC.clipboard, titulo: P('Nenhuma pesquisa criada ainda', 'No surveys created yet'), acao: btn(P('+ Criar primeira pesquisa', '+ Create the first survey'), nova, { tom: 'primario', classe: 'b-pri sm' }) })
          : !vis.length ? ui.vazio({ icone: IC.clipboard, titulo: P('Nenhuma pesquisa ativa no momento.', 'No active surveys right now.'), acao: btn(P('Ver todas as ' + todas.length, 'See all ' + todas.length), () => { E.filtro = 'todas'; pintar(); }) })
            : h('div', { class: 'col g8' }, vis.map(cartao));
        painel.append(h('div', { class: 'pg' },
          h('div', { class: 'p-tit' }, h('h2', { class: 'ph-h1' }, P('Pesquisas', 'Surveys')), h('p', { class: 'ph-sub' }, P('Gestão de pesquisas, destinatários e resultados', 'Survey, recipient and results management'))),
          kpis,
          h('div', { class: 'row entre mb14' },
            h('div', { class: 'row g12' }, h('p', { class: 'h14' }, P('Suas pesquisas', 'Your surveys')), filtro),
            btn(P('Nova pesquisa', 'New survey'), nova, { ic: 'plus', tom: 'primario', grande: 1 })),
          corpo));
      }

      /* ---------- casca: setor, caminho e as seis áreas; só Pesquisas navega ---------- */
      function pintar() {
        const setor = SETORES.find(s => s[0] === E.setorId);
        const abas = ABAS.filter(a => a[0] !== 'rh' || E.setorId === 1);
        const chips = ui.chips({ rotulo: P('Setor', 'Sector'), valor: E.setorId, opcoes: SETORES.map(([valor, texto]) => ({ valor, texto })),
          aoMudar: v => { E.setorId = v; E.linkAberto = null; if (E.aba === 'rh') E.aba = 'pesquisas'; pintar(); } });
        nav = ui.abas({ chave: 'aba', rotulo: P('Seções da pesquisa', 'Survey sections'),
          abas: abas.map(([id, rotulo, icn]) => ({ id, rotulo, icone: IC[icn], montar: pn => (id === 'pesquisas' ? telaPesquisas(pn) : pn.append(fora(rotulo))) })) });
        nav.querySelectorAll('[role="tab"]').forEach((b, i) => b.setAttribute('data-f', 'aba-' + abas[i][0]));
        raiz.replaceChildren(
          h('div', { class: 'p-ctx' },
            h('div', { class: 'p-setor' }, h('span', { class: 'k' }, P('Setor', 'Sector')), chips),
            h('p', { class: 'p-cam' }, 'EMPRESA DEMO · ', setor[1], ' · ', P('Pesquisas · Administração', 'Surveys · Administration'))),
          nav);
      }
      pintar();
    },
  });
})();
