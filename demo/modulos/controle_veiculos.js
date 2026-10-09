/* Controle de veículos · versão pública curta do módulo (id controle_veiculos) para o site.
   Só a tela principal (Dashboard) é navegável, com dados fictícios já prontos; as outras abas mostram o cartão
   "fora da demonstração". Visual do kit do hub, nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const p2 = n => String(n).padStart(2, '0');

  /* frota: placa, modelo, marca, km atual, km até a revisão (null = sem intervalo), alerta, km rodados [ano anterior, ano atual] */
  const FROTA = [
    ['DEM-1A01', P('Picape cabine dupla', 'Double-cab pickup'), P('Marca A', 'Make A'), 48200, 1800, false, [12310, 9840], true],
    ['DEM-3C03', P('Sedã médio', 'Mid-size sedan'), P('Marca C', 'Make C'), 79650, 350, true, [11060, 8420], true],
    ['DEM-2B02', P('Hatch compacto', 'Compact hatchback'), P('Marca B', 'Make B'), 31500, 8500, false, [9180, 6950], false],
    ['DEM-5E05', P('SUV compacto', 'Compact SUV'), P('Marca D', 'Make D'), 9800, 200, true, [2750, 4310], true],
    ['DEM-6F06', P('Minivan de sete lugares', 'Seven-seat minivan'), P('Marca B', 'Make B'), 22300, 7700, false, [6240, 3980], true],
    ['DEM-4D04', P('Furgão de carga', 'Cargo van'), P('Marca A', 'Make A'), 112000, 8000, false, [7890, 1120], false],
    ['DEM-7G07', P('Utilitário leve', 'Light utility vehicle'), P('Marca C', 'Make C'), 186400, null, false, [0, 0], false],
  ];
  /* viagens encerradas por mês: [ano anterior, ano atual] */
  const GIRO = [[6, 7, 5, 8, 7, 6, 9, 8, 7, 8, 6, 5], [7, 6, 8, 7, 9, 8, 7, 8, 7, 6, 7, 6]];
  /* horas por motorista no mês atual (0) e nos dois anteriores: nome, viagens, horas, km */
  const HORAS = [
    [['Carla Mendes', 1, 8.5, 310], ['Diego Rocha', 1, 6, 240]],
    [['Elisa Prado', 3, 21.5, 1160], ['Ana Souza', 2, 15, 820], ['Bruno Lima', 2, 11.5, 560], ['Felipe Costa', 1, 7, 390], ['Isabela Nunes', 1, 4.5, 170]],
    [['Bruno Lima', 3, 19, 930], ['Carla Mendes', 2, 14.5, 610], ['Diego Rocha', 2, 9, 420], ['Ana Souza', 1, 5.5, 260]],
  ];
  const APROVADORES = ['Fernanda Alves', 'Gustavo Reis'];
  /* pedidos feitos nesta visita: somam nos pendentes e no contador da aba Reservas */
  let solicitadas = 0;

  Hub.registrar({
    id: 'controle_veiculos',
    ordem: 12,
    grupo: P('Operação', 'Operations'),
    icone: '<path d="M3.5 16.5v-4.2L5.6 7h12.8l2.1 5.3v4.2zM3.5 16.5V19h3v-2.5M17.5 16.5V19h3v-2.5M7 13h2M15 13h2"/>',
    nome: P('Controle de veículos', 'Fleet control'),
    resumo: P(
      'Reserva, aprovação, chave, retorno e manutenção da frota da empresa, com quilometragem registrada em cada viagem e alerta de revisão.',
      'Booking, approval, key handover, return and maintenance of the company fleet, with the odometer logged on every trip and service alerts.'
    ),
    manual: {
      pt: {
        destaque: 'O Controle de Veículos organiza a frota de uso compartilhado da empresa: pedido de reserva, aprovação, entrega da chave, retorno e manutenção, com a quilometragem registrada em cada viagem e o aviso de revisão no tempo certo.',
        oque: 'O que é. Um sistema web do ProjectHub para os carros de uso comum da empresa. Cada veículo tem cadastro, situação e quilometragem, e cada viagem segue o mesmo caminho: alguém pede, um responsável aprova, a chave é entregue e o retorno encerra a viagem, tudo com data, hora e autor.\n\nO problema. O carro da empresa era combinado por planilha, caderno na portaria e mensagem. Ninguém sabia ao certo qual veículo estava livre, quem estava com ele e quando voltava, duas pessoas contavam com o mesmo carro no mesmo horário e a revisão passava do ponto.\n\nNesta demonstração. O Dashboard funciona com dados fictícios e o botão Solicitar Reserva mostra o pedido de ponta a ponta; as outras abas ficam fora da demonstração pública.',
        finalidade: 'Trocar a planilha e o caderno da portaria por um processo único e rastreável: a qualquer momento se sabe qual carro está livre, quem está com ele e quando volta, o mesmo carro não é reservado duas vezes para o mesmo horário e a revisão aparece antes de vencer. Usa o mesmo login, os mesmos papéis e a mesma central de avisos dos outros sistemas do hub.\n\nProjetado e construído por Ruan Siqueira.',
        alcance: [
          'Pedido de reserva com a disponibilidade do período à vista e a escolha de quem aprova',
          'Aprovação por um responsável, com aviso no hub e por e-mail',
          'Entrega da chave e retorno com a quilometragem de cada viagem',
          'Frota com alerta de revisão e registro de manutenção',
          'Dashboard da frota e histórico de viagens com exportação em planilha',
        ],
        tecnologias: ['Next.js', 'React', 'TypeScript', '.NET', 'Entity Framework Core', 'SQL Server'],
      },
      en: {
        destaque: 'Fleet Control organizes the company shared fleet: booking request, approval, key handover, return and maintenance, with the mileage logged on every trip and the service notice at the right time.',
        oque: 'What it is. A ProjectHub web system for the company shared cars. Every vehicle has a record, a status and a mileage, and every trip follows the same path: someone requests, a person in charge approves, the key is handed over and the return closes the trip, all with date, time and author.\n\nThe problem. The company car was arranged through a spreadsheet, a notebook at the front desk and messages. Nobody knew for sure which vehicle was free, who had it and when it would come back, two people counted on the same car for the same time slot and the scheduled service slipped past due.\n\nIn this demo. The Dashboard runs on fictitious data and the Request a booking button shows the request end to end; the other tabs are not part of the public demo.',
        finalidade: 'Replace the spreadsheet and the front-desk notebook with a single, traceable process: at any moment you know which car is free, who has it and when it comes back, the same car is never booked twice for the same time slot and the service shows up before it is due. It uses the same login, the same roles and the same notification center as the other hub systems.\n\nDesigned and built by Ruan Siqueira.',
        alcance: [
          'Booking requests with the availability of the period in view and a chosen approver',
          'Approval by a person in charge, with a hub notice and an email',
          'Key handover and return with the mileage of every trip',
          'Fleet with service alerts and maintenance records',
          'Fleet dashboard and trip history with spreadsheet export',
        ],
        tecnologias: ['Next.js', 'React', 'TypeScript', '.NET', 'Entity Framework Core', 'SQL Server'],
      },
    },
    /* mini tour: só ganchos do módulo (.cv-raiz, data-f, .cv-*), nada que dependa do idioma */
    tour: [
      { alvo: '.cv-raiz [data-f="aba-dashboard"]', acao: 'clicar', titulo: P('Bem-vindo à frota', 'Welcome to the fleet'),
        texto: P('Os carros de uso comum da empresa, do pedido até a chave voltar para a portaria. O Dashboard mostra tudo de relance.',
          'The company shared cars, from the request until the key is back at the front desk. The Dashboard shows it all at a glance.') },
      { alvo: '.cv-raiz .cv-kpi-grid', titulo: P('A frota em oito números', 'The fleet in eight numbers'),
        texto: P('Quantos carros estão livres, quantos estão rodando, quantos esperam aprovação e quantos pedem revisão. O que precisa de atenção vem em vermelho.',
          'How many cars are free, how many are on the road, how many await approval and how many need service. Whatever needs attention shows in red.') },
      { alvo: '.cv-raiz .cv-frota', titulo: P('Revisão antes de vencer', 'Service before it is due'),
        texto: P('Cada carro com a quilometragem atual e quanto falta para a revisão. Quando ela chega perto, o carro ganha o alerta e a revisão não passa do ponto.',
          'Every car with its current mileage and how far it is from the next service. When it gets close, the car gets an alert and the service never slips past due.') },
      { alvo: '.cv-raiz .cv-ta', titulo: P('Pedir um carro leva um minuto', 'Booking a car takes a minute'),
        texto: P('Escolha o carro, quem aprova, a saída e o retorno. Dois pedidos nunca ficam com o mesmo carro no mesmo horário, e quem aprova recebe o aviso na hora.',
          'Pick the car, the approver, departure and return. Two bookings never get the same car for the same time slot, and the approver is notified right away.') },
      /* fechar-dialogos: o pedido aberto por um clique em Solicitar Reserva no passo anterior não fica por cima do holofote */
      { alvo: '.cv-raiz [data-f="aba-reservas"]', antes: 'fechar-dialogos', acao: 'clicar', titulo: P('Aprovação, chave e volta', 'Approval, key and return'),
        texto: P('Cada reserva segue o mesmo caminho: alguém pede, o responsável aprova, a chave é entregue e o retorno registra a quilometragem. O número na aba mostra o que está em andamento.',
          'Every booking follows the same path: someone asks, the person in charge approves, the key is handed over and the return logs the mileage. The number on the tab shows what is in progress.') },
      { alvo: '.cv-raiz .ph-fora', antes: 'fechar-dialogos', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('Reservas, histórico, veículos e manutenções ficam na versão completa. O vídeo deste cartão mostra a frota inteira em ação; para ver de perto, é só me chamar por aqui.',
          'Bookings, history, vehicles and maintenance are in the full version. The video in this card shows the whole fleet in action; to see it up close, just reach me from here.') },
    ],

    montar(el, api) {
      const { t, h, ui, fmt, estado } = api;
      injetarCss();
      const hoje = new Date();
      const anoAtual = hoje.getFullYear(), mesAtual = hoje.getMonth() + 1;
      if (!estado.anoDash) estado.anoDash = anoAtual;
      if (!estado.mesHoras) { estado.mesHoras = mesAtual; estado.anoHoras = anoAtual; }
      const loc = api.lang === 'en' ? 'en-US' : 'pt-BR';
      const km = n => fmt.num(n) + ' km';
      const iniciais = n => n.split(/\s+/).slice(0, 2).map(x => x.charAt(0)).join('').toUpperCase();
      const ic = (nome, tam = 14) => { const s = api.icone(IC[nome], 'cv-ic'); s.style.cssText = 'width:' + tam + 'px;height:' + tam + 'px'; return s; };
      const e = (tag, classe, ...filhos) => h(tag, classe ? { class: classe } : null, ...filhos);
      const btn = (texto, aoClicar, o = {}) => ui.botao({ texto, aoClicar, icone: o.ic && IC[o.ic], tom: o.tom || 'secundario', tamanho: 'p', classe: o.classe });
      const foraDaDemo = titulo => (ui.foraDaDemo ? ui.foraDaDemo({ titulo })
        : ui.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is not part of the public demo.') }));

      const ABAS = [
        ['dashboard', P('Dashboard', 'Dashboard'), 'chart'],
        ['reservas', P('Reservas', 'Bookings'), 'calendar'],
        ['historico', P('Histórico', 'History'), 'history'],
        ['veiculos', P('Veículos', 'Vehicles'), 'car'],
        ['manutencoes', P('Manutenções', 'Maintenance'), 'wrench'],
      ];
      const raiz = h('div', { class: 'cv-real cv-raiz' });
      el.append(raiz);

      function pintar(foco) {
        const nav = ui.abas({
          chave: 'aba', rotulo: P('Seções do controle de veículos', 'Fleet control sections'),
          abas: ABAS.map(([id, rotulo, icn]) => ({ id, rotulo, icone: IC[icn], contador: id === 'reservas' ? 5 + solicitadas : 0,
            montar: pn => pn.append(id === 'dashboard' ? dashboard() : foraDaDemo(rotulo)) })),
          acoes: [btn(P('Solicitar Reserva', 'Request a booking'), abrirSolicitacao, { ic: 'plus', tom: 'primario', classe: 'cv-ta azul' })],
        });
        nav.querySelector('[role="tablist"]').classList.add('cv-tabs');
        nav.querySelectorAll('[role="tab"]').forEach((b, i) => {
          b.setAttribute('data-f', 'aba-' + ABAS[i][0]);
          if (ABAS[i][0] === 'reservas') { const c = b.querySelector('.ph-aba-contador'); if (c) { c.classList.add('cv-tab-badge'); c.setAttribute('title', t(P('Pendentes e reservadas', 'Pending and booked'))); } }
        });
        raiz.replaceChildren(nav);
        const alvo = foco && raiz.querySelector('[data-f="' + foco + '"]');
        if (alvo) alvo.focus();
      }

      /* ---------- Dashboard ---------- */
      function dashboard() {
        const ano = estado.anoDash;
        const anos = [anoAtual - 1, anoAtual, anoAtual + 1];
        const i = ano === anoAtual ? 1 : ano === anoAtual - 1 ? 0 : -1;
        const giro = Array.from({ length: 12 }, (_, m) => (i < 0 || (i === 1 && m + 1 > mesAtual) ? 0 : i === 1 && m + 1 === mesAtual ? HORAS[0].reduce((s, x) => s + x[1], 0) : GIRO[i][m]));
        const maxGiro = Math.max(1, ...giro);
        const frota = FROTA.map(f => ({ f, kmAno: i < 0 ? 0 : f[6][i] })).sort((a, b) => b.kmAno - a.kmAno);
        const kmAno = frota.reduce((s, x) => s + x.kmAno, 0);
        const desloc = (estado.anoHoras - anoAtual) * 12 + (estado.mesHoras - mesAtual);
        const motoristas = (desloc <= 0 && HORAS[-desloc]) || [];
        const maxHoras = Math.max(1, ...motoristas.map(m => m[2]));
        const nomeMes = new Date(estado.anoHoras, estado.mesHoras - 1, 1).toLocaleDateString(loc, { month: 'long' }) + '/' + estado.anoHoras;
        const mesCurto = m => { const s = fmt.mes(new Date(2000, m, 1)); return api.lang === 'en' ? s : s.toLowerCase(); };
        const pendentes = 3 + solicitadas;

        const COR = { slate: 'var(--ph-neutro)', green: 'var(--ph-cor-verde)', blue: 'var(--ph-cor-azul)', amber: 'var(--ph-cor-ambar)', violet: 'var(--ph-cor-violeta)', red: 'var(--ph-cor-vermelho)' };
        const KPIS = [
          [P('Total de Veículos', 'Total vehicles'), FROTA.length, 'slate', 'car'],
          [P('Disponíveis', 'Available'), 4, 'green', 'checkc'],
          [P('Em Uso', 'In use'), 1, 'blue', 'car'],
          [P('Pendentes Aprovação', 'Awaiting approval'), pendentes, 'amber', 'clock', true],
          [P('Reservas Hoje', 'Bookings today'), 2, 'violet', 'calendar'],
          [P('Em Manutenção', 'In maintenance'), 1, 'amber', 'wrench'],
          [P('KM Rodados no Ano', 'Km driven this year'), kmAno, 'blue', 'chart'],
          [P('Alertas de Revisão', 'Service alerts'), FROTA.filter(f => f[5]).length, 'red', 'alert', true],
        ];
        const indicadores = ui.kpis(KPIS.map(([rotulo, valor, , icone]) => ({ rotulo, valor, icone: IC[icone] })));
        indicadores.classList.add('cv-kpi-grid');
        [...indicadores.children].forEach((c, k) => {
          const [, , cor, , alerta] = KPIS[k];
          c.classList.add('cv-kpi');
          if (alerta) c.classList.add('alerta');
          c.style.setProperty('--tom', alerta ? COR.red : COR[cor]);
        });
        const seletor = (rotulo, foco, valor, opcoes, aoMudar) => {
          const s = ui.select({ ariaLabel: rotulo, opcoes: opcoes.map(([v, texto]) => ({ valor: String(v), texto })), valor: String(valor), aoMudar: v => aoMudar(Number(v)) });
          s.classList.add('cv-sel');
          s.setAttribute('data-f', foco);
          return s;
        };

        return h('div', { class: 'ph-pilha' },
          indicadores,
          h('div', { class: 'cv-charts-grid ph-grade-2' },
            ui.cartao({
              classe: 'cv-card', titulo: P('Viagens por Mês', 'Trips per month'), icone: IC.chart,
              acoes: seletor(P('Ano do dashboard', 'Dashboard year'), 'anoDash', ano, anos.map(a => [a, String(a)]), v => { estado.anoDash = v; pintar('anoDash'); }),
              conteudo: h('div', { class: 'cv-giro' }, giro.map((n, m) => h('div', { class: 'cv-giro-l' },
                e('span', 'm', mesCurto(m)),
                h('div', { class: 't' }, h('i', { style: 'width:' + (n / maxGiro * 100).toFixed(1) + '%' + (n > 0 ? ';min-width:4px' : '') })),
                e('span', 'n', P(n + ' viag.', n + (n === 1 ? ' trip' : ' trips')))))),
            }),
            ui.cartao({
              classe: 'cv-card', titulo: P('Status da Frota', 'Fleet status'), icone: IC.car,
              conteudo: h('div', { class: 'cv-frota ph-rola', style: '--ph-rola-max:420px', tabindex: '0', role: 'region', 'aria-label': P('Status da frota', 'Fleet status') }, frota.map(({ f, kmAno: kv }) => {
                const [placa, modelo, , kmAtual, falta, alerta] = f;
                return h('div', { class: 'cv-frota-l ph-lista-item' + (alerta ? ' alerta tom-erro' : '') },
                  h('div', { class: 'a' },
                    h('div', { class: 'p' },
                      alerta && h('span', { class: 'al', role: 'img', 'aria-label': P('Revisão próxima', 'Service due soon'), title: P('Revisão próxima', 'Service due soon') }, ic('alert', 13)),
                      e('span', 'pl', placa), e('span', 'mo', modelo)),
                    h('div', { class: 'k' }, P('KM atual: ', 'Current km: '), h('b', null, fmt.num(kmAtual)),
                      falta != null && e('span', 'rv', ' · ' + t(P('Revisão em: ', 'Service in: ')) + km(falta)))),
                  e('span', 'r', km(kv)));
              })),
            })),
          ui.cartao({
            classe: 'cv-card', titulo: P('Horas por Motorista', 'Driver hours'), icone: IC.timer,
            acoes: [
              seletor(P('Mês', 'Month'), 'mesHoras', estado.mesHoras, Array.from({ length: 12 }, (_, k) => [k + 1, fmt.mes(new Date(2000, k, 1))]), v => { estado.mesHoras = v; pintar('mesHoras'); }),
              seletor(P('Ano', 'Year'), 'anoHoras', estado.anoHoras, anos.map(a => [a, String(a)]), v => { estado.anoHoras = v; pintar('anoHoras'); }),
            ],
            conteudo: motoristas.length
              ? h('div', { class: 'cv-horas' }, motoristas.map(([nome, viagens, horas, kmM], k) => h('div', { class: 'cv-hora ph-lista-item h' + (k % 6) },
                h('div', { class: 'cv-av', 'aria-hidden': 'true' }, iniciais(nome)),
                h('div', { class: 'b' },
                  h('div', { class: 't' }, e('span', 'nm', nome), e('span', 'hs', fmt.num(horas, Number.isInteger(horas) ? 0 : 1) + 'h')),
                  h('div', { class: 'tr' }, h('i', { style: 'width:' + (horas / maxHoras * 100).toFixed(1) + '%' })),
                  h('div', { class: 'f' },
                    e('span', null, viagens === 1 ? P('1 viagem', '1 trip') : P(viagens + ' viagens', viagens + ' trips')),
                    e('span', null, km(kmM)))))))
              : e('p', 'cv-vazio', t(P('Nenhuma viagem encerrada em ', 'No closed trips in ')) + nomeMes + '.'),
          }));
      }

      /* ---------- Solicitar Reserva: formulário do kit e pedido encenado ---------- */
      function abrirSolicitacao() {
        const amanha = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
        const em = hh => amanha.getFullYear() + '-' + p2(amanha.getMonth() + 1) + '-' + p2(amanha.getDate()) + 'T' + p2(hh) + ':00';
        const livres = FROTA.filter(f => f[7]);
        const F = {
          veiculo: ui.select({ rotulo: P('Veículo', 'Vehicle'), obrigatorio: true, valor: livres[0][0], opcoes: livres.map(([placa, modelo, marca, kmAtual]) => ({ valor: placa, texto: placa + ' · ' + t(modelo) + ' (' + t(marca) + ') · ' + km(kmAtual) })) }),
          aprovador: ui.select({ rotulo: P('Quem vai aprovar?', 'Who will approve?'), obrigatorio: true, valor: APROVADORES[0], opcoes: APROVADORES.map(n => ({ valor: n, texto: n })) }),
          saida: ui.campo({ tipo: 'datahora', rotulo: P('Data/Hora Saída', 'Departure date and time'), obrigatorio: true, valor: em(8) }),
          retorno: ui.campo({ tipo: 'datahora', rotulo: P('Retorno Previsto', 'Expected return'), obrigatorio: true, valor: em(12) }),
          destino: ui.campo({ rotulo: P('Destino', 'Destination'), obrigatorio: true, placeholder: P('Ex.: Aeroporto, reunião na matriz...', 'E.g. airport, meeting at head office...') }),
          motivo: ui.campo({ tipo: 'area', linhas: 2, rotulo: P('Motivo / Observações', 'Reason / Notes') }),
        };
        ui.modal({
          titulo: P('Solicitar Reserva', 'Request a booking'), icone: IC.car, largura: 520,
          corpo: [F.veiculo, F.aprovador, h('div', { class: 'ph-form' }, F.saida, F.retorno), F.destino, F.motivo],
          acoes: ctl => [
            { texto: P('Cancelar', 'Cancel'), tom: 'secundario' },
            { texto: P('Solicitar', 'Request'), tom: 'primario', aoClicar: () => {
              const ok = Object.values(F).map(c => c.validar()).every(Boolean);
              if (ok && F.retorno.valor() <= F.saida.valor()) F.retorno.erro(P('Data de retorno deve ser após a saída', 'The return date must be after the departure'));
              const invalido = ctl.corpo.querySelector('[aria-invalid="true"]');
              if (invalido) { invalido.focus(); return; }
              const aprovador = F.aprovador.valor();
              ui.backend({
                titulo: P('Solicitar reserva', 'Request a booking'), subtitulo: F.veiculo.valor() + ' · ' + F.destino.valor(), escrita: 'create',
                passos: [
                  { tipo: 'api', ms: 90, titulo: P('Recebe o pedido da tela', 'Receives the request from the screen') },
                  { tipo: 'regra', ms: 35, titulo: P('Confere no servidor o papel e o setor de quem pediu', 'Checks the requester role and department on the server') },
                  { tipo: 'regra', ms: 85, titulo: P('Confere conflito de horário no servidor', 'Checks for a schedule conflict on the server') },
                  { tipo: 'sql', ms: 70, titulo: P('Grava a reserva como pendente', 'Saves the booking as pending') },
                  { tipo: 'email', ms: 480, titulo: P('Avisa o aprovador no hub e por e-mail', 'Notifies the approver in the hub and by email') },
                ],
                resumo: P('Reserva criada como Pendente. O aprovador recebeu o aviso no hub e o e-mail.', 'Booking created as Pending. The approver got the hub notice and the email.'),
                aoConcluir: r => {
                  if (!r.ok) return;
                  solicitadas++;
                  ctl.fechar(); pintar();
                  ui.toast(t(P('Reserva solicitada. Aguardando aprovação de ', 'Booking requested. Awaiting approval from ')) + aprovador + '.', 'ok');
                },
              });
            } },
          ],
        });
      }

      pintar();
    },
  });

  /* ícones de traço único (grade 24x24) */
  const IC = {
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    checkc: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    calendar: '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    timer: '<line x1="10" x2="14" y1="2" y2="2"/><line x1="12" x2="15" y1="14" y2="11"/><circle cx="12" cy="14" r="8"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  };

  /* só layout e as peças sem equivalente no kit, com tokens --ph-* (nenhuma cor, fonte ou regra por tema) */
  const R = '.cv-real ';
  const CSS = [
    '.cv-real{min-width:0;color:var(--ph-text)}' + R + 'p{margin:0}' + R + '.cv-ic{flex:none}',
    R + '.pl{font-family:var(--ph-font-mono);font-weight:700;color:var(--ph-text)}',
    R + '.cv-sel.ph-input{width:auto;height:2rem;min-height:2rem;font-size:13px}',
    R + '.cv-giro{display:flex;flex-direction:column;gap:6px}' + R + '.cv-giro-l{display:flex;align-items:center;gap:10px}',
    R + '.cv-giro-l .m{font-size:12px;color:var(--ph-text-dim);width:32px;flex:none}',
    R + '.cv-giro-l .t{flex:1;height:14px;background:var(--ph-card-2);border-radius:var(--ph-raio);overflow:hidden}' + R + '.cv-giro-l .t i{display:block;height:100%;background:var(--ph-vivo-azul);border-radius:inherit}',
    R + '.cv-giro-l .n{font-size:12px;color:var(--ph-text-muted);width:58px;text-align:right;flex:none;font-variant-numeric:tabular-nums}',
    R + '.cv-frota{display:flex;flex-direction:column;gap:8px}' + R + '.cv-frota-l{display:flex;align-items:center;gap:10px;flex:none}',
    R + '.cv-frota-l .a{flex:1;min-width:0}' + R + '.cv-frota-l .p{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px}',
    R + '.cv-frota-l .al{color:var(--ph-erro);display:inline-flex}' + R + '.cv-frota-l .pl{font-size:13px}' + R + '.cv-frota-l .mo{font-size:12px;color:var(--ph-text-dim)}',
    R + '.cv-frota-l .k{font-size:12px;color:var(--ph-text-dim);margin-top:2px}' + R + '.cv-frota-l .k b{color:var(--ph-text-muted);font-weight:600}' + R + '.cv-frota-l.alerta .rv{color:var(--ph-erro)}',
    R + '.cv-frota-l .r{font-size:13px;font-weight:700;color:var(--ph-cor-azul);flex:none;font-variant-numeric:tabular-nums}',
    R + '.cv-horas{display:flex;flex-direction:column;gap:8px}' + R + '.cv-hora{display:flex;align-items:center;gap:12px;flex:none}',
    R + '.h0{--c:var(--ph-cor-azul)}' + R + '.h1{--c:var(--ph-cor-violeta)}' + R + '.h2{--c:var(--ph-cor-verde)}' + R + '.h3{--c:var(--ph-cor-ambar)}' + R + '.h4{--c:var(--ph-cor-vermelho)}' + R + '.h5{--c:var(--ph-cor-rosa)}',
    R + '.cv-av{width:32px;height:32px;border-radius:50%;background:color-mix(in srgb,var(--c) 16%,transparent);border:1px solid color-mix(in srgb,var(--c) 40%,transparent);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--c);flex:none}',
    R + '.cv-hora .b{flex:1;min-width:0}' + R + '.cv-hora .t{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:4px}',
    R + '.cv-hora .nm{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' + R + '.cv-hora .hs{font-size:13px;font-weight:700;color:var(--c);flex:none;font-variant-numeric:tabular-nums}',
    R + '.cv-hora .tr{height:6px;background:var(--ph-card-2);border-radius:999px;overflow:hidden}' + R + '.cv-hora .tr i{display:block;height:100%;background:var(--c);border-radius:inherit}',
    R + '.cv-hora .f{display:flex;gap:12px;margin-top:4px;font-size:12px;color:var(--ph-text-dim)}' + R + '.cv-vazio{font-size:13px;color:var(--ph-text-dim);text-align:center;padding:20px 0}',
  ].join('\n');
  function injetarCss() {
    if (document.getElementById('cv-real-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'cv-real-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
})();
