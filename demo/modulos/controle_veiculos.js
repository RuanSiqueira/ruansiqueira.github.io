/* Controle de veículos · versão pública curta do módulo (id controle_veiculos) para o site.
   Só a tela principal (o Início da gestão da frota) é navegável, com dados fictícios prontos: aprovar um pedido, entregar a
   chave (o carro sai andando) e receber a chave (o carro volta e estaciona) são encenados. As outras áreas mostram o cartão
   "fora da demonstração". Visual do kit do hub, nenhuma chamada de rede. Projetado e construído por Ruan Siqueira. */
(() => {
  'use strict';
  if (!window.Hub) return;

  const P = (pt, en) => ({ pt, en });
  const MIN = 60e3, HORA = 60 * MIN;

  /* ====================================================================
     AVATAR DO VEÍCULO (porte do veiculosAvatar.ts do sistema real, avatar realista aprovado em 21/10/2026)
     Vista lateral do carro desenhada pela descrição: o formato sai do tipo escrito no modelo (hatch, sedã, SUV, picape
     cabine simples ou dupla, furgão, van) e a pintura sai da cor do cadastro, com as proporções das medidas reais de cada
     formato. Só monta texto (o SVG); quem anima é animarAvatar(), pela Web Animations API, com os mesmos tempos e curvas
     do sistema real: o carro sai andando na entrega da chave e volta, freia e estaciona no retorno.
     No sistema real um catálogo de modelos escolhe também o desenho próprio de alguns carros; aqui as marcas são fictícias
     e ficam só os desenhos genéricos de cada formato.
     A pintura e as peças do carro são o conteúdo da ilustração (como uma foto), não cor de interface: ficam sem o "#" no
     fonte e ganham o "#" em hx(); a interface em volta só usa os tokens do tema.
     Segurança: o SVG entra como HTML. Nenhum texto digitado vai cru para a string: marca, modelo e cor só escolhem entradas
     das tabelas abaixo, a descrição acessível vai escapada e o prefixo dos ids é um contador.
     ==================================================================== */
  const hx = x => '#' + x;
  const DURACAO_EVENTO_MS = { saida: 2800, retorno: 2600 };
  /* status do cadastro (Disponivel, EmUso, Manutencao) -> desenho; o atraso tem prioridade */
  const statusAvatar = (v, atrasado) => (atrasado ? 'atrasada' : v.status === 'EmUso' ? 'emuso' : v.status === 'Manutencao' ? 'manutencao' : 'disponivel');
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ESC[c] || c);
  const normA = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const canais = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => { const y = canais(b); return '#' + canais(a).map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const lum = h => { const [r, g, b] = canais(h).map(v => { const x = v / 255; return x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };

  /* formato pela descrição (português ou inglês); a ordem importa: cabine dupla antes da picape, furgão antes da van */
  const FORMATOS = {
    hatch: P('hatch', 'hatchback'), seda: P('sedã', 'sedan'), suv: P('SUV', 'SUV'), pcs: P('picape cabine simples', 'single-cab pickup'),
    pcd: P('picape cabine dupla', 'double-cab pickup'), furgao: P('furgão', 'panel van'), van: P('van', 'van'),
  };
  const REGRAS_FORMATO = [
    ['pcd', /\b(cabine dupla|cab dupla|double cab|crew cab)\b/], ['pcs', /\b(picape|pickup|pick up|utilitario leve|light utility)\b/],
    ['furgao', /\b(furgao|panel van|cargo van|van de carga)\b/], ['van', /\b(van|minivan|micro onibus|minibus)\b/],
    ['suv', /\b(suv|crossover|utilitario esportivo)\b/], ['seda', /\b(seda|sedan)\b/],
  ];
  const formato = (marca, modelo) => { const t0 = ' ' + normA(marca + ' ' + modelo) + ' '; const r = REGRAS_FORMATO.find(([, re]) => re.test(t0)); return r ? r[0] : 'hatch'; };
  /* cor do cadastro -> tinta; aceita o nome em português ou em inglês */
  const CORES = [
    [P('Branco', 'White'), 'f1f3f5', 'branco branca white'], [P('Prata', 'Silver'), 'c4c9d0', 'prata prateado prateada silver'], [P('Cinza', 'Gray'), '7b828c', 'cinza cinzento gray'],
    [P('Grafite', 'Graphite'), '4b5058', 'grafite chumbo graphite'], [P('Preto', 'Black'), '1d1f23', 'preto preta black'], [P('Vermelho', 'Red'), 'c62830', 'vermelho vermelha red'],
    [P('Vinho', 'Wine'), '6e1c2b', 'vinho bordo wine burgundy'], [P('Azul', 'Blue'), '2256b5', 'azul blue'], [P('Verde', 'Green'), '2e7a4b', 'verde green'], [P('Amarelo', 'Yellow'), 'f1c232', 'amarelo amarela yellow'],
    [P('Laranja', 'Orange'), 'ef7a22', 'laranja orange'], [P('Bege', 'Beige'), 'd5c29f', 'bege beige'], [P('Marrom', 'Brown'), '6a4934', 'marrom brown'], [P('Dourado', 'Gold'), 'c7a34b', 'dourado dourada gold golden'],
  ];
  const corHex = cor => {
    for (const p of normA(cor).split(' ')) { const e = CORES.find(c => c[2].split(' ').includes(p)); if (e) return { nome: e[0], hex: hx(e[1]) }; }
    return { nome: P('cinza claro', 'light gray'), hex: hx('aeb4bd') };
  };

  /* Desenhos: vista lateral, frente para a direita, 1 unidade = 1 cm, x = 0 no para-choque traseiro. Pontos [x, altura do
     chão, raio do arredondamento]; top é o contorno de cima, fechado por baixo pelos arcos das rodas. */
  const G = 200;
  const D = {
   hatch:{L:410,xw:[72,327],wr:31,rim:.62,hc:31,hs:21,rs:'twin5',rt:'prata',lug:4,
    top:[[398,22,3],[407,33,8],[410,48,12],[408,62,10],[403,71,8],[396,76,6],[355,85,70],[298,94,3],[270,118,40],[240,142,16],[194,147,80],[124,145,60],[64,139.5,20],[36,137,3],[33,133.5,2],[14,110,6],[7,99,10],[3.5,78,10],[3,52,12],[7,30,6],[18,22,0]],
    dlo:[[292,97,1],[243,138,6],[196,143,50],[130,142,40],[96,139,4],[88,128,2],[100,108,1]],
    pil:[[[190,102],[193,145],[182,145],[179,102]]],
    belt:[[292,97],[100,108]],
    cuts:[[[290,97],[292,70,20],[291,21.5]],[[184,103],[186,60,30],[185,21.5]],[[96,108.5],[104,80,6],[110,56,10],[112,38,6],[111.5,21.5]]],
    hd:[[205,92],[115,97]],
    mir:[[289,98,1],[267,99,3],[264,107,4],[271,112,5],[285,110,3],[291,104,1]],
    head:[[403,71,2],[396,76,2],[364,84,3],[358,80,3],[378,73,3],[406,64,2]],drl:[[405,67],[378,75],[362,81]],
    tail:[[14,110,1],[48,113,3],[50,107,3],[22,103,2],[8,99,1]],tll:[[11,106],[48,110]],
    trim:[[[408.5,37,2],[405,28,2],[387,27,2],[393,33,2]]],
    crease:[[360,80],[293,87,60],[186,94,60],[100,101,40],[52,109]],
    lower:[[290,44],[186,47,40],[112,53]]},
   seda:{L:448,xw:[100,365],wr:31,rim:.62,hc:31,hs:21,rs:'single5',rt:'prata',lug:4,chrome:1,
    top:[[436,22,3],[445,33,8],[448,48,12],[446,62,10],[441,71,8],[434,76,6],[393,85,70],[335,94,3],[308,118,40],[276,142,16],[230,148,70],[165,146,50],[135,141,20],[106,123,40],[78,112,6],[22,110,40],[11,110,2],[8,105,3],[4,86,10],[2,60,12],[4,42,8],[11,30,6],[24,22,0]],
    dlo:[[328,97.5,1],[279,138,6],[230,144,50],[166,142.5,30],[145,139,4],[118,111,2],[124,110,0]],
    pil:[[[226,102],[229,146],[218,146],[215,102]],[[158,107],[160,144],[155,144],[153,107]]],
    belt:[[328,97.5],[124,110]],
    cuts:[[[329,97],[331,70,20],[329,21.5]],[[218,103.3],[220,60,30],[219,21.5]],[[153,108],[151,80,8],[148,50,10],[143,21.5]]],
    hd:[[236,92],[162,97]],
    mir:[[325,98.5,1],[303,99.5,3],[300,107.5,4],[307,112.5,5],[321,110.5,3],[327,104.5,1]],
    head:[[441,71,2],[434,76,2],[402,84,3],[396,80,3],[416,73,3],[444,64,2]],drl:[[443,67],[416,75],[400,81]],
    tail:[[11,109,1],[46,110.5,3],[50,105,3],[18,100,2],[7,98,1]],tll:[[9,103],[46,107]],
    trim:[[[446.5,37,2],[443,28,2],[425,27,2],[431,33,2]]],
    crease:[[398,80],[330,88,60],[220,95,60],[140,102,50],[50,107]],
    lower:[[326,44],[220,47,40],[150,53]]},
   suv:{L:425,xw:[85,350],wr:33.5,rim:.63,hc:33.5,hs:27,rs:'single5',rt:'diam',lug:5,flare:5,
    top:[[412,28,3],[422,39,6],[425,56,10],[423,80,8],[418,94,6],[411,99,6],[366,106,70],[308,112,3],[282,134,40],[256,154,14],[215,159,80],[120,158,70],[62,154,10],[38,151,3],[34,147,2],[26,122,5],[18,110,8],[12,80,10],[9,56,8],[11,40,6],[22,28,0]],
    dlo:[[302,114,1],[259,150.5,6],[216,155,60],[122,154,60],[72,151,4],[60,128,3],[72,120,1]],
    pil:[[[210,115],[213,157],[202,157],[199,115]],[[112,117],[110,156],[102,156],[104,117]]],
    belt:[[302,114],[72,120]],
    cuts:[[[302,113],[298,90,20],[296,60,10],[295,27.5]],[[204,116.3],[206,60,30],[205,27.5]],[[106,118.5],[112,95,6],[126,64,14],[130,40,6],[129,27.5]]],
    hd:[[226,103],[120,106]],
    mir:[[299,115,1],[276,116,3],[272,125,4],[280,131,5],[296,129,3],[302,122,1]],
    head:[[418,94,2],[411,99,2],[380,104,3],[375,98,3],[392,91,3],[421,86,2]],drl:[[420,89],[392,95],[378,101]],
    tail:[[18,110,1],[44,116,3],[46,108,3],[26,100,2],[14,98,1]],tll:[[16,105],[44,112]],
    trim:[[[424,52,3],[420,40,4],[412,28,2],[390,28,2],[394,36,2],[412,46,3]],[[9,56,2],[11,40,4],[22,28,2],[46,27.5,2],[40,36,2],[20,48,3]],[[292,27.5],[292,38,2],[130,40,2],[130,27.5]]],
    rail:[[66,158,1],[72,161.5,2],[236,162,2],[244,158.5,1]],
    crease:[[382,101],[312,106,60],[210,110,60],[110,114,40],[46,113]]},
   pcs:{L:445,xw:[88,360],wr:31.5,rim:.62,hc:31.5,hs:23,rs:'single5',rt:'prata',lug:4,
    top:[[434,24,3],[442,34,7],[445,52,10],[443,74,8],[438,84,6],[396,92,70],[335,100,3],[308,126,40],[284,148,14],[248,151,50],[202,150,6],[195,145,4],[193,106,1],[189,104.5,0],[5,103.5,2],[1.5,99,3],[1,56,4],[3,40,6],[10,25,0]],
    dlo:[[329,102,1],[286,144,6],[248,147,40],[212,146.5,4],[207,140,3],[206,106,1]],
    belt:[[329,102],[206,106]],
    cuts:[[[325,101],[322,70,20],[319,23.5]],[[209,106],[210,60,30],[209,23.5]],[[191,105],[191,23.5]]],
    hd:[[224,95]],
    mir:[[326,103,1],[303,104,3],[300,112,4],[307,117,5],[321,115,3],[328,109,1]],
    head:[[438,84,2],[432,88,2],[408,92,3],[404,86,3],[420,80,3],[443,76,2]],drl:[[441,79],[420,84],[408,89]],
    tail:[[1.5,99,1],[8,99,2],[8,68,2],[1.5,68,1]],tll:[[4.5,97],[4.5,70]],
    trim:[[[444,40,3],[438,29,3],[416,29,2],[424,39,2]],[[1,56,2],[1,44,3],[4,34,3],[12,25,2],[16,56,2]]],
    bed:[[5,103.8],[189,104.8]],
    crease:[[404,88],[329,95,60],[208,97,40],[8,97]],
    lower:[[318,48],[208,49],[100,50]]},
   pcd:{L:530,xw:[128,440],wr:38,rim:.6,hc:38,hs:40,rs:'six',rt:'prata',lug:6,flare:5,
    top:[[521,40,3],[529,52,6],[531,72,8],[530,98,8],[526,113,5],[519,118,5],[468,123,90],[383,128,3],[350,152,40],[318,178,12],[260,182,80],[205,180.5,5],[198,175,4],[196,131,1],[192,129,0],[6,128,2],[2,124,3],[1.5,64,4],[4,50,6],[14,41,0]],
    dlo:[[377,131,1],[320,174,6],[262,178,60],[210,177,4],[206,171,3],[204,133,1]],
    pil:[[[288,131],[291,179],[280,179],[277,131]]],
    belt:[[377,131],[204,133]],
    cuts:[[[373,130],[384,100,20],[389,60,10],[388,40.5]],[[282,132],[284,70,30],[283,40.5]],[[206,132.5],[204,60,30],[202,40.5]],[[194,129],[194,43]]],
    hd:[[296,119],[216,120]],
    mir:[[374,132,1],[348,133,3],[344,143,4],[353,149,5],[370,147,3],[377,139,1]],
    head:[[526,113,2],[519,118,2],[490,122,3],[486,113,3],[504,108,3],[530,102,2]],drl:[[529,105],[504,111],[490,117]],
    tail:[[2,123,1],[9,123,2],[9,84,2],[1.5,84,1]],tll:[[5.5,120],[5.5,87]],
    trim:[[[530,62,3],[529,52,4],[521,40,2],[488,40,2],[496,50,3],[518,58,3]],[[1.5,64,2],[1.5,54,2],[4,47,3],[14,41,2],[30,41,2],[30,64,2]]],
    step:[[384,34,2],[384,39,2],[208,39,2],[208,34,2]],
    bed:[[6,128.3],[192,129.3]],
    crease:[[486,116],[378,120,80],[204,121],[192,121],[10,120]],
    lower:[[383,62],[206,64]]},
   furgao:{L:440,xw:[90,365],wr:31,rim:.6,hc:31,hs:22,rs:'calota',lug:4,
    top:[[428,24,3],[437,34,6],[440,52,8],[438,76,8],[433,90,6],[425,95,6],[388,104,50],[350,112,3],[318,142,40],[290,176,20],[250,185,60],[40,186,30],[10,184,6],[4,178,4],[2,62,4],[4,52,5],[7,36,5],[16,24,0]],
    dlo:[[344,115,1],[300,163,8],[272,170,10],[250,170,3],[248,117,1]],
    belt:[[344,115],[248,117]],
    cuts:[[[340,114],[334,80,15],[329,22.5]],[[246,117],[246,22.5]],[[244,175],[150,176],[148,60,20],[146,22.5]],[[146,120],[14,121]]],
    hd:[[262,105],[160,105]],
    mir:[[341,116,1],[316,117,3],[312,127,4],[320,133,5],[336,131,3],[344,124,1]],
    head:[[433,90,2],[425,95,2],[396,102,3],[392,94,3],[410,88,3],[437,82,2]],drl:[[436,85],[410,91],[396,98]],
    tail:[[2,150,1],[8,150,2],[8,90,2],[2,90,1]],tll:[[5,147],[5,93]],
    trim:[[[438,44,3],[432,30,3],[414,30,2],[422,42,2]],[[2,62,2],[2,50,3],[6,36,3],[16,25,2],[18,40,2],[14,62,2]]],
    rib:[[[242,154],[14,154]]],
    crease:[[400,98],[344,108,40],[246,113,40],[10,116]],
    lower:[[328,48],[150,50],[124,50]]},
   van:{L:592,xw:[120,486],wr:35,rim:.6,hc:35,hs:28,rs:'aco',lug:6,
    top:[[578,30,3],[588,42,6],[592,60,8],[591,86,8],[587,102,6],[578,108,8],[540,120,40],[505,130,3],[478,168,40],[446,226,20],[420,248,30],[380,254,60],[40,255,30],[10,253,6],[3,246,4],[2,64,4],[4,52,5],[8,38,5],[20,30,0]],
    dlo:[[500,134,1],[470,186,8],[452,206,8],[420,208,3],[417,136,1]],
    belt:[[498,133],[418,136]],
    cuts:[[[492,132],[468,100,15],[448,62,10],[443,28.5]],[[416,136],[416,28.5]],[[412,240],[300,240],[300,28.5]],[[300,150],[12,150]]],
    hd:[[430,118],[318,118]],
    mir:[[490,140,1],[474,140,2],[470,165,4],[478,170,4],[488,165,2],[492,145,1]],
    head:[[587,102,2],[578,108,2],[548,118,3],[544,110,3],[560,102,3],[590,94,2]],drl:[[589,97],[560,105],[548,113]],
    tail:[[2,110,1],[8,110,2],[8,60,2],[2,60,1]],tll:[[5,107],[5,63]],
    trim:[[[591,70,3],[588,42,4],[578,30,2],[540,30,2],[546,44,3],[560,70,3]],[[2,64,2],[2,48,3],[8,38,3],[20,30,2],[30,46,2],[26,64,2]],[[438,40,2],[438,48,2],[160,48,2],[160,40,2]]],
    crease:[[560,110],[500,124,40],[416,128,40],[12,130]]}
  };
  // ─── Motor do desenho (puro: só monta texto) ─────────────────────────────────
  const f1 = (n) => Math.round(n * 10) / 10;
  // Polígono com cantos arredondados; ponto [x, h, r].
  function rp(pts, close = true) {
    const P = pts.map(p => [p[0], G - p[1], p[2] || 0]), n = P.length;
    let d = '';
    for (let i = 0; i < n; i++) {
      const [x, y, r] = P[i];
      if (!r || (!close && (i === 0 || i === n - 1))) { d += (d ? 'L' : 'M') + f1(x) + ' ' + f1(y); continue; }
      const a = P[(i + n - 1) % n], b = P[(i + 1) % n], la = Math.hypot(a[0] - x, a[1] - y), lb = Math.hypot(b[0] - x, b[1] - y);
      const ra = a[2] && (close || i > 1) ? .5 : .95, rb = b[2] && (close || i < n - 2) ? .5 : .95;
      const ta = Math.min(r, la * ra), tb = Math.min(r, lb * rb);
      d += (d ? 'L' : 'M') + f1(x + (a[0] - x) * ta / la) + ' ' + f1(y + (a[1] - y) * ta / la) + 'Q' + f1(x) + ' ' + f1(y) + ' ' + f1(x + (b[0] - x) * tb / lb) + ' ' + f1(y + (b[1] - y) * tb / lb);
    }
    return d + (close ? 'Z' : '');
  }
  // Altura de uma linha [[x,h]...] na posição x.
  function hAt(p, x) {
    const s = [...p].sort((a, b) => a[0] - b[0]);
    if (x <= s[0][0]) return s[0][1];
    for (let i = 1; i < s.length; i++) if (x <= s[i][0]) { const a = s[i - 1], b = s[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); }
    return s[s.length - 1][1];
  }

  const grad = (id, stops, attr) => `<linearGradient id="${id}" ${attr || 'x1="0" y1="0" x2="0" y2="1"'}>${stops.map(([o, c, a]) => `<stop offset="${f1(Math.max(0, Math.min(1, o)) * 1000) / 1000}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
  const rgrad = (id, stops, attr) => `<radialGradient id="${id}" ${attr || ''}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
  const CHAVE_INGLESA = 'M14.7 6.3a4 4 0 0 0-5.4 5.2L3.5 17.3a1.8 1.8 0 0 0 2.5 2.5l5.8-5.8a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.4-.4-2.4z';
  let AVN = 0;

  // Medidas reais aproximadas (cm): comprimento, entre-eixos, altura total, raio da roda.
  const MED = {
    hatch: [405, 254, 148, 31], seda: [448, 260, 148, 31], suv: [430, 261, 164, 35], pcs: [448, 274, 155, 32],
    pcd: [530, 309, 181, 39], furgao: [430, 272, 185, 31], van: [599, 345, 252, 35],
  };
  // Leva o desenho às medidas: entre-eixos exato, balanços na proporção do desenho, altura escalada acima do centro da roda.
  function ajusta(M, [L2, wb2, H2, wr2]) {
    const [a, b] = M.xw, fo = M.L - b, wb = b - a, ro2 = (L2 - wb2) * a / (a + fo);
    const X = (x) => (x <= a ? x * ro2 / a : x <= b ? ro2 + (x - a) * wb2 / wb : ro2 + wb2 + (x - b) * (L2 - ro2 - wb2) / fo);
    const Hm = Math.max(...M.top.map(p => p[1]), ...(M.rail || []).map(p => p[1])), k = (H2 - wr2) / (Hm - M.hc);
    const Y = (h) => (h <= M.hc ? h * wr2 / M.hc : wr2 + (h - M.hc) * k);
    const l = (v) => v.map(p => [X(p[0]), Y(p[1]), ...p.slice(2)]);
    const ll = (v) => v.map(l);
    return {
      ...M, L: L2, xw: [ro2, ro2 + wb2], wr: wr2, hc: wr2, hs: Y(M.hs),
      top: l(M.top), dlo: l(M.dlo), belt: l(M.belt), cuts: ll(M.cuts), hd: l(M.hd), mir: l(M.mir), head: l(M.head), tail: l(M.tail), crease: l(M.crease),
      pil: M.pil && ll(M.pil), drl: M.drl && l(M.drl), tll: M.tll && l(M.tll), trim: M.trim && ll(M.trim), skid: M.skid && ll(M.skid),
      rail: M.rail && l(M.rail), lower: M.lower && l(M.lower), rib: M.rib && ll(M.rib), step: M.step && l(M.step), bar: M.bar && l(M.bar),
      bed: M.bed && l(M.bed), grl: M.grl && l(M.grl),
    };
  }
  const DA = Object.fromEntries(Object.keys(D).map((k) => [k, ajusta(D[k], MED[k])]));

  const VEL = 220;
  const ST = { disponivel: 'disp', emuso: 'uso', atrasada: 'atr', manutencao: 'man' };

  /* Devolve { svg, anim }: o texto do <svg> e os números das animações (giro casado com a distância percorrida). */
  function avatarSvg({ marca, modelo, cor, ano, status, tamanho, lang }) {
    const tl = v => (v && typeof v === 'object' ? (v[lang] != null ? v[lang] : v.pt) : v || '');
    const f = formato(tl(marca), tl(modelo));
    const ns = ++AVN;
    const u = 'cvva' + ns + '-', U = (s) => `url(#${u}${s})`;
    const M = DA[f], co = corHex(cor && typeof cor === 'object' ? cor.pt : cor), c = co.hex;
    const st = ST[status] || 'disp', tam = tamanho === 'mini' || tamanho === 'grande' ? tamanho : 'medio';
    const mini = tam === 'mini', det = !mini;
    const RIM = M.rim + .04, { L, wr, hc, hs } = M, H = Math.max(...M.top.map(p => p[1]), ...(M.rail || []).map(p => p[1])), top = G - H, cyW = G - hc, ys = G - hs;
    const [xr, xf] = M.xw, wb = xf - xr, cx = (xr + xf) / 2, plast = /^(suv|pcs|pcd)$/.test(f);

    /* enquadramento com proporção fixa */
    const pad = mini ? L * .02 : L * .06, vb = G + (mini ? 6 : 26), asp = mini ? 2.2 : 2.3;
    let vx = -pad, vw = L + 2 * pad, vt = top - (mini ? 3 : 14), vh = vb - vt;
    if (vw / vh > asp) { vt -= vw / asp - vh; vh = vw / asp; } else { vx -= (vh * asp - vw) / 2; vw = vh * asp; }

    /* pintura: céu claro acima da cintura, vinco com brilho, horizonte no meio da porta e chão escuro embaixo */
    const Lm = lum(c), dark = Lm < .06, light = Lm > .45;
    const SKY = hx('e9f0f8'), DK = light ? hx('3a4452') : hx('05070a');
    const hi = (t) => mix(c, SKY, dark ? t * .62 : t), sd = (t) => mix(c, DK, t);
    const hb = hAt(M.belt, cx), hsh = hAt(M.crease, cx);
    const fb = (H - hb) / H, fs = (H - hsh) / H, fl = M.lower ? (H - hAt(M.lower, cx)) / H : .76, fh = fs + (fl - fs) * .52;
    const cr = M.crease, ang = (() => {
      let a = Math.atan2(cr[0][1] - cr[cr.length - 1][1], cr[cr.length - 1][0] - cr[0][0]) * 180 / Math.PI;
      if (a > 90) a -= 180;
      if (a < -90) a += 180;
      return f1(a);
    })();
    const K = light ? 1.45 : 1;
    const PS = [[0, hi(.64)], [fb - .07, hi(.42)], [fb - .006, hi(.26)], [fb + .004, hi(.52)], [fs - .03, hi(.36)], [fs - .006, hi(.74)], [fs + .005, sd(.3 * K)], [fs + .05, sd(.05 * K)], [fh - .012, hi(light ? .26 : .17)], [fh + .006, sd(.26 * K)], [fl - .012, sd(.12 * K)], [fl + .004, sd(.38 * K)], [fl + .07, sd(.22 * K)], [.9, sd(.5 * K)], [1, sd(.7 * K)]];
    /* contorno só no carro escuro: no sistema real o das outras cores sai com cor inválida e não aparece; o porte mantém o desenho aprovado */
    const ol = dark ? mix(c, hx('c9d3df'), .3) : 'none';

    /* carroceria fechada pelos arcos das rodas */
    const ra = wr + (M.gap || 3.6);
    const arco = (x, R) => { const dy = ys - cyW, dx = Math.sqrt(Math.max(0, R * R - dy * dy)); return { x0: f1(x - dx), x1: f1(x + dx), lg: dy > 0 ? 1 : 0 }; };
    const [wa, wb2] = M.xw.map(x => arco(x, ra));
    const body = rp(M.top, false) + `L${wa.x0} ${ys}A${ra} ${ra} 0 ${wa.lg} 1 ${wa.x1} ${ys}L${wb2.x0} ${ys}A${ra} ${ra} 0 ${wb2.lg} 1 ${wb2.x1} ${ys}Z`;
    const poco = (x) => { const a = arco(x, ra); return `<path d="M${a.x0} ${ys}A${ra} ${ra} 0 ${a.lg} 1 ${a.x1} ${ys}Z" fill="${U('ww')}"/>`; };
    const aro = (x, R) => { const a = arco(x, R); return `M${a.x0} ${ys}A${R} ${R} 0 ${a.lg} 1 ${a.x1} ${ys}`; };

    /* vidros */
    const dh = M.dlo.map(p => p[1]), dxs = M.dlo.map(p => p[0]), gMax = Math.max(...dh), gMin = Math.min(...dh), gx0 = Math.min(...dxs), gx1 = Math.max(...dxs), gw = gx1 - gx0;
    const dlo = rp(M.dlo);
    const band = (x, w, o) => `<path d="M${f1(x)} ${G - gMax - 2}h${w}l-${f1((gMax - gMin) * .55)} ${gMax - gMin + 4}h-${w}Z" fill="${hx('fff')}" opacity="${o}"/>`;

    /* roda: pneu com flanco e banda, bacia, disco e pinça fixos, raios girando com sombra e rastro */
    const LIP = { prata: [hx('f7f9fb'), hx('a3abb5'), hx('e6eaee')], graf: [hx('c5ccd3'), hx('5d646d'), hx('a6aeb7')], diam: [hx('f7f9fb'), hx('9aa2ac'), hx('e6eaee')] };
    const lip = LIP[M.rt || 'prata'];
    const liga = M.rs !== 'calota' && M.rs !== 'aco';
    const roda = (x) => {
      const cy = cyW, R = wr, rr = R * RIM, P = (a, r) => f1(x + Math.cos(a) * r) + ' ' + f1(cy + Math.sin(a) * r);
      const C = (r, at) => `<circle cx="${f1(x)}" cy="${f1(cy)}" r="${f1(r)}" ${at}/>`;
      const spk = (ah, ar, r0, r1, w0, w1) => `M${P(ah - w0, r0)}L${P(ar - w1, r1)}A${f1(r1)} ${f1(r1)} 0 0 1 ${P(ar + w1, r1)}L${P(ah + w0, r0)}Z`;
      const NR = { twin5: 5, single5: 5, six: 6, multi10: 10 };
      const raios = (fn) => { let d = ''; const n = NR[M.rs] || 5; for (let q = 0; q < n; q++) { const a = q * 2 * Math.PI / n - Math.PI / 2; d += fn(a); } return d; };
      const setor = (r0, r1, a0, a1) => `M${P(a0, r1)}A${f1(r1)} ${f1(r1)} 0 0 1 ${P(a1, r1)}L${P(a1, r0)}A${f1(r0)} ${f1(r0)} 0 0 0 ${P(a0, r0)}Z`;
      let s = C(R, `fill="${U('t')}"`);
      if (det) s += `<path d="M${P(-2.55, R * .86)}A${f1(R * .86)} ${f1(R * .86)} 0 0 1 ${P(-.75, R * .86)}" fill="none" stroke="${hx('fff')}" stroke-opacity=".08" stroke-width="${f1(R * .1)}" stroke-linecap="round"/>`;
      s += C(rr, `fill="${U('bz')}"`);
      if (liga && det) {
        s += C(rr * .8, `fill="${U('ds')}"`) + C(rr * .8, `fill="none" stroke="${hx('1b1e22')}" stroke-width="${f1(rr * .035)}"`) + C(rr * .6, `fill="none" stroke="${hx('24282d')}" stroke-opacity=".8" stroke-width="${f1(rr * .014)}"`) + C(rr * .38, `fill="${hx('24282e')}"`);
        s += `<path d="${setor(rr * .5, rr * .86, -2.8, -1.95)}" fill="${U('cp')}" stroke="${hx('0f1114')}" stroke-width="${f1(rr * .02)}"/><path d="M${P(-2.7, rr * .8)}A${f1(rr * .8)} ${f1(rr * .8)} 0 0 1 ${P(-2.05, rr * .8)}" fill="none" stroke="${hx('9aa1aa')}" stroke-opacity=".5" stroke-width="${f1(rr * .025)}"/>`;
      }
      let g = '';
      if (det) g += C(R * .986, `fill="none" stroke="${hx('1e2024')}" stroke-width="${f1(R * .026)}" stroke-dasharray="${f1(R * .06)} ${f1(R * .045)}"`);
      else g += C(R * .9, `fill="none" stroke="${hx('2c3036')}" stroke-width="${f1(R * .1)}" stroke-dasharray="${f1(R * .25)} ${f1(R * .2)}"`);
      if (M.rs === 'calota') {
        g += C(rr * 1.02, `fill="${U('cal')}" stroke="${hx('5d646d')}" stroke-width="${f1(rr * .03)}"`);
        let d = '';
        for (let q = 0; q < 8; q++) { const a = q * Math.PI / 4; d += spk(a, a, rr * .52, rr * .86, .11, .085); }
        g += `<path d="${d}" fill="${hx('22262b')}"/>` + C(rr * .36, `fill="none" stroke="${hx('9aa2ab')}" stroke-width="${f1(rr * .05)}"`) + C(rr * .16, `fill="${hx('c9cfd6')}" stroke="${hx('6b727b')}" stroke-width="${f1(rr * .03)}"`);
      } else if (M.rs === 'aco') {
        g += C(rr * .98, `fill="${hx('3b4047')}"`) + C(rr * .78, `fill="none" stroke="${hx('2a2e33')}" stroke-width="${f1(rr * .06)}"`);
        for (let q = 0; q < 6; q++) { const pp = P(q * Math.PI / 3 + .5, rr * .56).split(' '); g += `<circle cx="${pp[0]}" cy="${pp[1]}" r="${f1(rr * .11)}" fill="${hx('0b0c0f')}"/>`; }
        g += C(rr * .3, `fill="${hx('50565e')}"`);
      } else {
        const r0 = rr * .27, r1 = rr * .93, base = M.rt === 'diam' ? hx('30353c') : U('sk');
        const FN = {
          twin5: a => spk(a - .07, a - .17, r0, r1, .07, .055) + spk(a + .07, a + .17, r0, r1, .07, .055),
          single5: a => spk(a, a, r0, r1, .26, .17), six: a => spk(a, a, r0, r1, .21, .13), multi10: a => spk(a, a, r0, r1, .12, .065),
        };
        const rd = raios(FN[M.rs]);
        if (det) g += `<path d="${rd}" fill="${hx('000')}" opacity=".55" transform="translate(${f1(rr * .03)} ${f1(rr * .05)})"/>`;
        g += `<path d="${rd}" fill="${base}" stroke="${hx('15181c')}" stroke-width="${f1(rr * .014)}"/>`;
        if (M.rt === 'diam') {
          const FF = {
            twin5: a => spk(a - .07, a - .17, r0 * 1.15, r1 * .95, .035, .03) + spk(a + .07, a + .17, r0 * 1.15, r1 * .95, .035, .03),
            single5: a => spk(a, a, r0 * 1.15, r1 * .95, .15, .1), six: a => spk(a, a, r0 * 1.15, r1 * .95, .12, .07), multi10: a => spk(a, a, r0 * 1.15, r1 * .95, .06, .035),
          };
          g += `<path d="${raios(FF[M.rs])}" fill="${U('sk')}"/>`;
        }
        if (det) g += `<path class="cv-va-blur" d="${rd}" fill="${M.rt === 'diam' ? hx('8d949c') : hx('c3c9d0')}" opacity=".3" transform="rotate(-10 ${f1(x)} ${f1(cy)})"/>`;
        g += C(rr * .33, `fill="${M.rt === 'diam' ? hx('30353c') : U('sk')}"`);
        for (let q = 0; q < M.lug; q++) { const pp = P(q * 2 * Math.PI / M.lug, rr * .235).split(' '); g += `<circle cx="${pp[0]}" cy="${pp[1]}" r="${f1(rr * .036)}" fill="${hx('e9edf1')}" stroke="${hx('41464d')}" stroke-width="${f1(rr * .01)}"/>`; }
        g += C(rr * .14, `fill="${hx('1b1e23')}" stroke="${hx('cfd5dc')}" stroke-width="${f1(rr * .025)}"`) + (det ? `<path d="M${P(-2.4, rr * .07)}L${P(-.75, rr * .07)}L${P(1.57, rr * .07)}Z" fill="none" stroke="${hx('cfd5dc')}" stroke-width="${f1(rr * .016)}" stroke-linejoin="round"/>` : '');
      }
      s += `<g class="cv-va-spin" style="transform-origin:${f1(x)}px ${f1(cy)}px">${g}</g>`;
      if (M.rs !== 'calota') s += C(rr * .965, `fill="none" stroke="${U('lp')}" stroke-width="${f1(rr * .07)}"`);
      if (det) s += C(rr * .9, `class="cv-va-blur" fill="${U('mz')}"`);
      s += C(rr * 1.02, `fill="${U('rh')}"`);
      return s;
    };

    /* luzes: medidas do farol e da lanterna */
    const bx = (pp) => { const xs = pp.map(p => p[0]), hs2 = pp.map(p => p[1]); return { x0: Math.min(...xs), x1: Math.max(...xs), h0: Math.min(...hs2), h1: Math.max(...hs2) }; };
    const HB = bx(M.head), hw = HB.x1 - HB.x0, hm = (HB.h0 + HB.h1) / 2, hr = Math.min((HB.h1 - HB.h0) * .3, 3.4);
    const TB = bx(M.tail), tcx = (TB.x0 + TB.x1) / 2, tcm = (TB.h0 + TB.h1) / 2;
    const MB = bx(M.mir);
    const pj = [[HB.x1 - hw * .3, hm], [HB.x1 - hw * .56, hm - .4]];

    /* defs. 21/10: o filtro de manutenção é "dsf"; no protótipo ele repetia o id "ds" do gradiente do disco e o Chrome não o aplicava. */
    let df = grad(u + 'p', PS, `gradientUnits="userSpaceOnUse" x1="0" y1="${top}" x2="0" y2="${G}" gradientTransform="rotate(${ang} ${cx} ${G - hsh})"`) +
      grad(u + 'e', [[0, hx('000'), .45], [.08, hx('000'), 0], [.5, hx('fff'), .05], [.92, hx('000'), 0], [1, hx('000'), .45]], `gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${L}" y2="0"`) +
      grad(u + 'rl', [[0, hx('fff'), dark ? .6 : .45], [1, hx('fff'), 0]], `gradientUnits="userSpaceOnUse" x1="0" y1="${top}" x2="0" y2="${G - hb + 6}"`) +
      grad(u + 'gb', [[0, hx('0b0e12')], [.1, hx('2a3442')], [.34, hx('3a4657')], [.58, hx('252e3a')], [.8, hx('0e1218')], [1, hx('07090b')]], `gradientUnits="userSpaceOnUse" x1="0" y1="${G - gMax}" x2="0" y2="${G - gMin}"`) +
      grad(u + 'go', [[0, hx('e3ecf5'), .34], [.22, hx('a9b9cb'), .2], [.5, hx('5d6d80'), .07], [1, hx('000'), .12]], `gradientUnits="userSpaceOnUse" x1="0" y1="${G - gMax}" x2="0" y2="${G - gMin}"`) +
      grad(u + 'pb', [[0, hx('46505c')], [.3, hx('14181d')], [1, hx('07090b')]]) +
      grad(u + 'sb', [[0, hx('fff'), 0], [.5, hx('fff'), 1], [1, hx('fff'), 0]], 'x1="0" y1="0" x2="1" y2="0"') +
      grad(u + 'sn', [[0, hx('fff'), 0], [.5, hx('fff'), .6], [1, hx('fff'), 0]], 'x1="0" y1="0" x2="1" y2="0"') +
      grad(u + 'hd', [[0, hx('525d6b')], [.4, hx('1b212a')], [1, hx('0a0d11')]]) +
      grad(u + 'hg', [[0, hx('fff'), .7], [.35, hx('fff'), .08], [1, hx('fff'), 0]]) +
      grad(u + 'tl', [[0, hx('d42a36')], [.45, hx('83101a')], [1, hx('3a0408')]]) +
      grad(u + 'sv', [[0, hx('eef1f4')], [1, hx('8a929b')]]) +
      grad(u + 'cr', [[0, hx('f5f7f9')], [.42, hx('a7b0ba')], [.5, hx('39404a')], [.62, hx('8a939d')], [1, hx('e2e6ea')]]) +
      grad(u + 'ub', [[0, hx('000'), 0], [.45, hx('000'), .18], [1, hx('000'), .62]], `gradientUnits="userSpaceOnUse" x1="0" y1="${f1(ys - 11)}" x2="0" y2="${ys}"`) +
      grad(u + 'mb', [[0, hx('0b0d10'), 0], [.6, hx('0b0d10'), 0], [.64, hx('0b0d10'), .92], [1, hx('0b0d10'), .92]]) +
      grad(u + 'pl', [[0, hx('3a3d43')], [.35, hx('26282d')], [1, hx('17191c')]]) +
      grad(u + 'lp', lip.map((c2, i) => [i / 2, c2]), 'x1="0" y1="0" x2="1" y2="1"') +
      grad(u + 'ds', [[0, hx('9aa0a7')], [.45, hx('5b6168')], [1, hx('2c3035')]], 'x1="0" y1="0" x2="1" y2="1"') +
      grad(u + 'cp', [[0, hx('7d848c')], [.5, hx('4a5057')], [1, hx('25292e')]]) +
      grad(u + 'ao', [[0, hx('030405'), .9], [.3, hx('030405'), .45], [.75, hx('000'), .25], [1, hx('000'), .7]]) +
      grad(u + 'as', [[0, hx('24272d')], [.45, hx('17181c')], [1, hx('0f1013')]]) + grad(u + 'bm', [[0, hx('f4f8ff'), .32], [.5, hx('f4f8ff'), .1], [1, hx('f4f8ff'), 0]], 'x1="0" y1="0" x2="1" y2="0"') +
      rgrad(u + 't', [[RIM - .01, hx('2c2f34')], [RIM + .03, hx('131416')], [(RIM + 1) / 2, hx('222429')], [.93, hx('111214')], [.985, hx('1b1c1f')], [1, hx('0a0a0b')]]) +
      rgrad(u + 'bz', [[0, hx('1b1e22')], [.7, hx('0c0d10')], [1, hx('040506')]]) +
      rgrad(u + 'sk', M.rt === 'graf' ? [[0, hx('b9c0c8')], [.6, hx('737b84')], [1, hx('4a5058')]] : [[0, hx('fdfefe')], [.55, hx('d3d9df')], [1, hx('8a929c')]]) +
      rgrad(u + 'cal', [[0, hx('e3e7eb')], [.7, hx('b9c0c8')], [1, hx('7f8790')]], 'fx=".4" fy=".35"') +
      rgrad(u + 'rh', [[0, hx('fff'), .3], [.45, hx('fff'), .04], [1, hx('000'), .34]], 'fx=".32" fy=".26" r=".72"') +
      rgrad(u + 'mz', [[0, hx('000'), 0], [.3, hx('a7aeb6'), 0], [.62, hx('a7aeb6'), .14], [.9, hx('c4cad1'), .2], [1, hx('000'), 0]]) +
      rgrad(u + 'pj', [[0, hx('ffffff')], [.35, hx('cfe6ff')], [.7, hx('55606e')], [1, hx('1a1f26')]], 'fx=".4" fy=".4"') +
      rgrad(u + 'gw', [[0, hx('ffffff'), 1], [.25, hx('e8f3ff'), .75], [1, hx('cfe6ff'), 0]]) +
      rgrad(u + 'rg', [[0, hx('ffd0d0'), .95], [.3, hx('ff2a36'), .7], [1, hx('ff1020'), 0]]) +
      rgrad(u + 'am', [[0, hx('fff6d6'), 1], [.28, hx('ffb020'), .9], [1, hx('ff8a00'), 0]]) +
      rgrad(u + 'ss', [[0, hx('fff'), .9], [.4, hx('fff'), .35], [1, hx('fff'), 0]]) +
      rgrad(u + 'ww', [[0, hx('141619')], [.75, hx('08090b')], [1, hx('020203')]], 'cy=".9" r=".9"') +
      rgrad(u + 'sh', [[0, hx('000'), .8], [.55, hx('000'), .4], [1, hx('000'), 0]]) +
      rgrad(u + 'fg', [[0, hx('b8c6d8'), .12], [1, hx('b8c6d8'), 0]]) +
      rgrad(u + 'bg', [[0, hx('1c1d22')], [.6, hx('17181c')], [1, hx('141519')]], 'cx=".5" cy=".3" r=".8"') +
      `<clipPath id="${u}cb"><path d="${body}"/></clipPath><clipPath id="${u}cd"><path d="${dlo}"/></clipPath>` +
      `<filter id="${u}dsf" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values=".25"/><feComponentTransfer><feFuncR type="linear" slope=".8"/><feFuncG type="linear" slope=".8"/><feFuncB type="linear" slope=".84"/></feComponentTransfer></filter>`;
    if (det) df += grad(u + 'mg', [[0, hx('fff')], [1, hx('000')]], `gradientUnits="userSpaceOnUse" x1="0" y1="${G}" x2="0" y2="${G + 26}"`) +
      `<mask id="${u}mk" maskUnits="userSpaceOnUse" x="${f1(vx)}" y="${G}" width="${f1(vw)}" height="40"><rect x="${f1(vx)}" y="${G}" width="${f1(vw)}" height="40" fill="${U('mg')}"/></mask>`;
    if (det && plast) df += `<pattern id="${u}tx" width="2.6" height="2.6" patternUnits="userSpaceOnUse"><circle cx=".7" cy=".7" r=".42" fill="${hx('fff')}" fill-opacity=".04"/><circle cx="1.9" cy="1.8" r=".5" fill="${hx('000')}" fill-opacity=".2"/></pattern>`;

    /* carroceria */
    const sw = mini ? 1.6 : .7;
    let b = M.xw.map(poco).join('');
    b += `<path d="${body}" fill="${U('p')}" stroke="${ol}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    let ov = `<rect x="0" y="${top}" width="${L}" height="${H}" fill="${U('e')}"/><rect x="0" y="${f1(ys - 11)}" width="${L}" height="11.5" fill="${U('ub')}"/>`;
    const sbx = xr + wb * .64, sbx2 = xr + wb * .22;
    const hl = M.lower ? hAt(M.lower, cx) : hs + 30, sbh = hsh - hl;
    ov += `<path d="M${f1(sbx)} ${f1(G - hsh + 2)}h${f1(L * .07)}l-${f1(sbh * .5)} ${f1(sbh - 2)}h-${f1(L * .07)}Z" fill="${U('sb')}" opacity="${light ? .14 : .09}"/><path d="M${f1(sbx2)} ${f1(G - hsh + 2)}h${f1(L * .035)}l-${f1(sbh * .5)} ${f1(sbh - 2)}h-${f1(L * .035)}Z" fill="${U('sb')}" opacity="${light ? .09 : .06}"/>`;
    ov += M.xw.map(x => `<path d="${aro(x, ra + 1.4)}" fill="none" stroke="${hx('000')}" stroke-opacity=".32" stroke-width="1.8"/>` + (mini || light ? '' : `<path d="${aro(x, ra + 3.4)}" fill="none" stroke="${hx('fff')}" stroke-opacity=".12" stroke-width=".7"/>`)).join('');
    const cp = rp(M.crease, false);
    ov += `<path d="${cp}" fill="none" stroke="${sd(.45)}" stroke-opacity=".55" stroke-width="${mini ? 2 : 1.3}" transform="translate(0 1.2)"/><path d="${cp}" fill="none" stroke="${hi(.85)}" stroke-opacity="${light ? .95 : .65}" stroke-width="${mini ? 1.4 : .8}"/>`;
    if (det) {
      /* brilho especular do verniz: no ombro e no teto */
      const rx = M.top.reduce((a, p) => (p[1] > a[1] ? p : a))[0];
      ov += `<ellipse cx="${f1(cx + wb * .1)}" cy="${f1(G - hsh - 2.4)}" rx="${f1(L * .24)}" ry="2.2" fill="${U('ss')}" opacity="${light ? .55 : .7}" transform="rotate(${-ang} ${f1(cx)} ${f1(G - hsh)})"/>`;
      ov += `<ellipse cx="${f1(rx)}" cy="${f1(top + 2.2)}" rx="${f1(L * .15)}" ry="1.5" fill="${U('ss')}" opacity="${light ? .4 : .6}"/>`;
    }
    if (M.lower && det) { const lp = rp(M.lower, false); ov += `<path d="${lp}" fill="none" stroke="${sd(.4)}" stroke-opacity=".4" stroke-width="1.2" transform="translate(0 -1)"/><path d="${lp}" fill="none" stroke="${hi(.6)}" stroke-opacity="${light ? .7 : .35}" stroke-width=".7"/>`; }
    const topo = (x, R) => `M${f1(x + Math.cos(-2.5) * R)} ${f1(cyW + Math.sin(-2.5) * R)}A${f1(R)} ${f1(R)} 0 0 1 ${f1(x + Math.cos(-.64) * R)} ${f1(cyW + Math.sin(-.64) * R)}`;
    const flare = M.flare;
    if (flare && det) ov += M.xw.map(x => `<path d="${topo(x, ra + flare + 5)}" fill="none" stroke="${sd(.45)}" stroke-opacity=".22" stroke-width="3.5" stroke-linecap="round"/><path d="${topo(x, ra + flare + 7.5)}" fill="none" stroke="${hi(.75)}" stroke-opacity="${light ? .45 : .22}" stroke-width="1.2" stroke-linecap="round"/>`).join('');
    if (M.rib && det) for (const r of M.rib) { const rr = rp(r, false); ov += `<path d="${rr}" fill="none" stroke="${sd(.4)}" stroke-opacity=".13" stroke-width="5"/><path d="${rr}" fill="none" stroke="${sd(.4)}" stroke-opacity=".22" stroke-width=".7" transform="translate(0 -2.2)"/><path d="${rr}" fill="none" stroke="${hi(.9)}" stroke-opacity="${light ? .9 : .4}" stroke-width=".8" transform="translate(0 2.4)"/>`; }
    if (det) ov += `<path d="${M.cuts.map(p => rp(p, false)).join('')}" fill="none" stroke="${light ? sd(.6) : hx('030405')}" stroke-opacity=".85" stroke-width=".6"/><path d="${M.cuts.map(p => rp(p, false)).join('')}" fill="none" stroke="${hi(.8)}" stroke-opacity="${light ? .5 : .18}" stroke-width=".4" transform="translate(.7 0)"/>`;
    ov += `<g class="cv-va-shine"><path d="M${f1(-L * .3)} ${top}h${f1(L * .08)}l-40 ${H}h-${f1(L * .08)}Z" fill="${U('sn')}" opacity="${dark ? .4 : light ? .9 : .6}"/></g>`;
    b += `<g clip-path="${U('cb')}">${ov}</g>`;
    b += `<path d="${rp(M.top, false)}" fill="none" stroke="${U('rl')}" stroke-width="${mini ? 1.8 : .9}"/>`;

    /* vidros com o interior: encostos e volante contra a janela do outro lado */
    b += `<path d="${dlo}" fill="${U('gb')}"/>`;
    let gv = '';
    if (det) {
      const beltAt = (x) => hAt(M.belt, x), up = M.dlo.filter(p => p[1] > beltAt(p[0]) + 6), gTop = (x) => (up.length > 1 ? hAt(up, x) : gMax);
      const FR = { hatch: .44, seda: .44, suv: .43, pcs: .44, pcd: .41, furgao: .44, van: .3 };
      const fr = FR[f];
      const hip = Math.max(xf - fr * wb, gx0 + 32);
      const banco = (x) => { const t = gTop(x) - 7.5, bl = beltAt(x) - 3; return rp([[x - 8.5, t, 6], [x + 8, t - .6, 6], [x + 8.6, t - 14, 4], [x - 8, t - 13.4, 4]]) + rp([[x - 10.5, t - 16.5, 5], [x + 7, t - 16.5, 5], [x + 16, bl, 2], [x - 2, bl, 2]]); };
      let idb = banco(hip - 24);
      if (/^(hatch|seda|suv|pcd)$/.test(f)) idb += banco(Math.max(hip - 108, gx0 + 11));
      const sx = hip + 50, sy = G - beltAt(sx) - 1;
      gv += `<path d="${idb}" fill="${hx('07090c')}"/><ellipse cx="${f1(sx)}" cy="${f1(sy)}" rx="2.4" ry="15" transform="rotate(-24 ${f1(sx)} ${f1(sy)})" fill="none" stroke="${hx('07090c')}" stroke-width="3"/>`;
    }
    gv += `<rect x="${f1(gx0 - 5)}" y="${f1(G - gMax - 5)}" width="${f1(gw + 10)}" height="${f1(gMax - gMin + 10)}" fill="${U('go')}"/>`;
    gv += (M.pil || []).map(p => `<path d="${rp(p)}" fill="${U('pb')}"/>`).join('');
    if (det) gv += band(gx0 + gw * .6, f1(gw * .07), .1) + band(gx0 + gw * .3, f1(gw * .035), .07);
    b += `<g clip-path="${U('cd')}">${gv}</g><path d="${dlo}" fill="none" stroke="${hx('06080b')}" stroke-width="1.6" stroke-linejoin="round"/>`;
    if (M.chrome && det) b += `<path d="M${f1(M.belt[0][0])} ${f1(G - M.belt[0][1] + .6)}L${f1(M.belt[1][0])} ${f1(G - M.belt[1][1] + .6)}" stroke="${hx('d5dbe2')}" stroke-width="1.1" stroke-linecap="round"/>`;
    if (det) b += M.hd.map(([x, h]) => `<rect x="${f1(x - 6.5)}" y="${f1(G - h - 1.4)}" width="13" height="2.8" rx="1.4" fill="${M.hdc ? U('cr') : light ? sd(.32) : hi(.18)}"/><rect x="${f1(x - 5.5)}" y="${f1(G - h - 1.4)}" width="11" height=".7" rx=".35" fill="${hi(.7)}" opacity=".7"/><rect x="${f1(x - 6.5)}" y="${f1(G - h + 1.6)}" width="13" height=".8" rx=".4" fill="${hx('000')}" opacity=".35"/>`).join('');

    /* plásticos, frisos e acessórios */
    const preto = `fill="${U('pl')}" stroke="${hx('3a3e45')}" stroke-width=".5"`, tex = (p) => (det && plast ? `<path d="${p}" fill="${U('tx')}"/>` : '');
    if (flare) b += M.xw.map(x => { const a = arco(x, ra), o = arco(x, ra + flare), d = `M${o.x0} ${ys}A${ra + flare} ${ra + flare} 0 ${o.lg} 1 ${o.x1} ${ys}L${a.x1} ${ys}A${ra} ${ra} 0 ${a.lg} 0 ${a.x0} ${ys}Z`; return `<path d="${d}" ${preto}/>${tex(d)}<path d="${aro(x, ra + flare - .4)}" fill="none" stroke="${hx('454a52')}" stroke-width=".6"/>`; }).join('');
    b += (M.trim || []).map(p => { const d = rp(p); return `<path d="${d}" ${preto}/>${tex(d)}`; }).join('');
    b += (M.skid || []).map(p => `<path d="${rp(p)}" fill="${U(M.skc ? 'cr' : 'sv')}" stroke="${hx('5b626b')}" stroke-width=".4"/>`).join('');
    if (M.grl) b += `<path d="${rp(M.grl)}" fill="${U('cr')}" stroke="${hx('2a2f36')}" stroke-width=".4"/>`;
    if (M.step) b += `<path d="${rp(M.step)}" fill="${hx('17191d')}" stroke="${hx('3a3f46')}" stroke-width=".6"/>${tex(rp(M.step))}`;
    if (M.rail) b += `<path d="${rp(M.rail)}" fill="${U('sv')}" stroke="${hx('2a2e34')}" stroke-width=".5"/>`;
    if (M.bed) b += `<path d="${rp(M.bed, false)}" fill="none" stroke="${hx('0f1114')}" stroke-width="2.2" stroke-linecap="round"/>`;
    if (M.bar) { const bp = rp(M.bar, false), tb = 'fill="none" stroke-linecap="round" stroke-linejoin="round"'; b += `<path d="${bp}" ${tb} stroke="${hx('0a0b0d')}" stroke-width="5.5" transform="translate(4 -2)"/><path d="${bp}" ${tb} stroke="${hx('07080a')}" stroke-width="7"/><path d="${bp}" ${tb} stroke="${hx('2b3036')}" stroke-width="5"/><path d="${bp}" ${tb} stroke="${hx('9aa3ad')}" stroke-opacity=".8" stroke-width="1.2" transform="translate(0 -1.4)"/>`; }
    b += `<path d="${rp(M.mir)}" fill="${U('p')}" stroke="${ol}" stroke-width=".6"/><path d="${rp(M.mir)}" fill="${U('mb')}"/>`;
    if (det) b += `<ellipse cx="${f1(MB.x0 + (MB.x1 - MB.x0) * .55)}" cy="${f1(G - MB.h0 - 1.3)}" rx="${f1((MB.x1 - MB.x0) * .26)}" ry=".7" fill="${hx('b07a2a')}" opacity=".55"/>`;

    /* faróis: carcaça, refletor, lente, projetores e luz diurna; lanterna com lente e LED */
    const hp = rp(M.head), hcx = (HB.x0 + HB.x1) / 2;
    b += `<path d="${hp}" fill="${U('hd')}" stroke="${hx('0b0d10')}" stroke-width=".5"/>`;
    if (det) {
      b += `<path d="${hp}" fill="${U('cr')}" opacity=".2" transform="translate(${f1(hcx)} ${f1(G - hm)}) scale(.78) translate(${f1(-hcx)} ${f1(hm - G)})"/>`;
      b += pj.map(([x, h], i) => `<circle cx="${f1(x)}" cy="${f1(G - h)}" r="${f1(hr * (i ? .8 : 1))}" fill="${U('pj')}"${i ? ' opacity=".8"' : ''}/>`).join('');
      b += `<path d="${hp}" fill="none" stroke="${U('hg')}" stroke-width=".9"/>`;
    }
    if (M.drl) { const dp = rp(M.drl, false); b += `<path d="${dp}" fill="none" stroke="${hx('bfe3ff')}" stroke-opacity=".3" stroke-width="${mini ? 3.5 : 2.6}" stroke-linecap="round"/><path d="${dp}" fill="none" stroke="${hx('eef6fc')}" stroke-width="${mini ? 1.6 : .9}" stroke-linecap="round"/>`; }
    const tp = rp(M.tail);
    b += `<path d="${tp}" fill="${U('tl')}" stroke="${hx('3a0509')}" stroke-width=".5"/>`;
    if (M.tll) { const tl = rp(M.tll, false); b += `<path d="${tl}" fill="none" stroke="${hx('ff2a36')}" stroke-opacity=".45" stroke-width="${mini ? 3 : 2.4}" stroke-linecap="round"/><path d="${tl}" fill="none" stroke="${hx('ffc9c9')}" stroke-width="${mini ? 1.2 : .7}" stroke-linecap="round"/>`; }
    if (det) b += `<path d="${tp}" fill="none" stroke="${U('hg')}" stroke-width=".7"/>`;

    /* luz acesa (farol, diurna, lanterna), freio e pisca-alerta */
    const tw = TB.x1 - TB.x0, th = TB.h1 - TB.h0;
    let luz = pj.map(([x, h], i) => `<circle cx="${f1(x)}" cy="${f1(G - h)}" r="${f1(hr * (mini ? 4 : 3.4) * (i ? .8 : 1))}" fill="${U('gw')}"/>`).join('');
    if (det) luz = `<path d="M${f1(HB.x1 - 2)} ${f1(G - hm - 2.5)}L${f1(HB.x1 + 120)} ${f1(G - hm - 16)}L${f1(HB.x1 + 120)} ${G + 4}L${f1(HB.x1 - 2)} ${f1(G - hm + 3)}Z" fill="${U('bm')}"/>` + luz;
    if (M.drl) luz += `<path d="${rp(M.drl, false)}" fill="none" stroke="${hx('e6f4ff')}" stroke-opacity=".55" stroke-width="${mini ? 5 : 4.2}" stroke-linecap="round"/>`;
    luz += `<ellipse cx="${f1(tcx)}" cy="${f1(G - tcm)}" rx="${f1(Math.max(tw, 6) * .7)}" ry="${f1(Math.max(th, 6) * .6)}" fill="${U('rg')}" opacity=".32"/>`;
    const freio = `<ellipse cx="${f1(tcx)}" cy="${f1(G - tcm)}" rx="${f1(Math.max(tw, 8) * 1.4)}" ry="${f1(Math.max(th, 8) * 1.2)}" fill="${U('rg')}"/>`;
    const ar = mini ? 14 : 9;
    const pisca = `<circle cx="${f1(HB.x0 + hw * .14)}" cy="${f1(G - hm)}" r="${ar}" fill="${U('am')}"/><circle cx="${f1(HB.x1 - 1)}" cy="${f1(G - hm)}" r="${f1(ar * .8)}" fill="${U('am')}"/><circle cx="${f1(TB.x0 + tw * .5)}" cy="${f1(G - TB.h1 + th * .25)}" r="${ar}" fill="${U('am')}"/>` + (det ? `<ellipse cx="${f1(MB.x0 + (MB.x1 - MB.x0) * .55)}" cy="${f1(G - MB.h0 - 1.3)}" rx="7" ry="3.2" fill="${U('am')}"/>` : '');
    b += `<g class="cv-va-luz">${luz}</g><g class="cv-va-freio">${freio}</g><g class="cv-va-pisca">${pisca}</g>`;

    const car = `<g id="${u}car" class="cv-va-car"><g class="cv-va-pitch" style="transform-origin:${f1(xr)}px ${f1(cyW)}px"><g class="cv-va-bob">${b}</g></g>${M.xw.map(roda).join('')}</g>`;

    /* cenário: estúdio parado ou estrada com paisagem em paralaxe */
    /* fundo do palco (o estúdio escuro do sistema real, que lá vem do CSS) */
    let s = `<rect x="${f1(vx)}" y="${f1(vt)}" width="${f1(vw)}" height="${f1(vh)}" fill="${U('bg')}"/>`;
    if (det) s += `<ellipse class="cv-va-estudio" cx="${L / 2}" cy="${G}" rx="${f1(L * .62)}" ry="26" fill="${U('fg')}"/>`;
    let cena = '';
    if (det) {
      const x0 = vx, x1 = vx + vw + 600, pf = [];
      for (let x = Math.floor(x0 / 15) * 15; x <= x1 + 15; x += 15) { const t = x / 600 * 2 * Math.PI; pf.push(`${f1(x)} ${f1(G - 96 - 16 * Math.sin(t) - 9 * Math.sin(3 * t + 1.3) - 4 * Math.sin(9 * t + .4))}`); }
      cena += `<g class="cv-va-far"><path d="M${f1(x0)} ${G}L${pf.join('L')}L${f1(x1 + 15)} ${G}Z" fill="${hx('1f2228')}"/></g>`;
      /* pista em perspectiva: a margem de lá fica acima da linha de contato */
      cena += `<rect x="${f1(vx)}" y="${G - 26}" width="${f1(vw)}" height="${f1(vb - G + 26)}" fill="${U('as')}"/><path d="M${f1(vx)} ${G - 25.5}H${f1(vx + vw)}" stroke="${hx('3a3e46')}" stroke-width=".8"/>`;
      let m = '';
      for (let x = Math.floor(vx / 120) * 120; x <= vx + vw + 120; x += 120) m += `M${x} ${G - 58}v32`;
      cena += `<g class="cv-va-mid"><path d="${m}" stroke="${hx('2b2f36')}" stroke-width="2.6"/><rect x="${f1(vx)}" y="${G - 60}" width="${f1(vw + 240)}" height="6" fill="${hx('2b2f36')}"/><rect x="${f1(vx)}" y="${G - 60}" width="${f1(vw + 240)}" height=".8" fill="${hx('40454e')}"/></g>`;
    } else cena += `<rect x="${f1(vx)}" y="${G}" width="${f1(vw)}" height="${f1(vb - G)}" fill="${hx('121316')}"/>`;
    cena += `<path d="M${f1(vx)} ${G + .6}H${f1(vx + vw)}" stroke="${hx('30333a')}" stroke-width="${mini ? 1.4 : .9}"/><path class="cv-va-road" d="M${f1(vx)} ${G + (mini ? 3.6 : 13)}H${f1(vx + vw)}" stroke="${hx('5f6570')}" stroke-width="${mini ? 2.6 : 2}" stroke-dasharray="26 38"/>`;
    s += `<g class="cv-va-cena">${cena}</g>`;

    /* carro que se move: reflexo no piso, sombras de contato e o carro */
    let mv = '';
    if (det) mv += `<g class="cv-va-estudio"><g mask="${U('mk')}" opacity=".24"><use href="#${u}car" transform="matrix(1 0 0 -1 0 ${2 * G})"/></g></g>`;
    mv += `<rect x="${f1(xr)}" y="${f1(ys - 2)}" width="${f1(wb)}" height="${f1(hs + 2)}" fill="${U('ao')}"/>`;
    mv += `<ellipse cx="${f1(cx)}" cy="${G + 1}" rx="${f1(wb / 2 + wr + 34)}" ry="${mini ? 4 : 7}" fill="${U('sh')}"/>` + M.xw.map(x => `<ellipse cx="${f1(x)}" cy="${G}" rx="${f1(wr * .85)}" ry="2.6" fill="${U('sh')}"/><ellipse cx="${f1(x)}" cy="${G - .3}" rx="${f1(wr * .5)}" ry="1.2" fill="${hx('000')}" opacity=".85"/>`).join('');
    mv += car;
    s += `<g class="cv-va-move">${mv}</g>`;

    /* selo de manutenção */
    const br = vh * (mini ? .2 : .11), bxx = f1(vx + vw - br * 1.3), byy = f1(vt + br * 1.3);
    s += `<g class="cv-va-selo"><circle cx="${bxx}" cy="${byy}" r="${f1(br)}" fill="${hx('fbbf24')}" stroke="${hx('141519')}" stroke-width="${f1(br * .16)}"/><path transform="translate(${f1(bxx - br * .62)} ${f1(byy - br * .62)}) scale(${f1(br * 1.24 / 24 * 1000) / 1000})" d="${CHAVE_INGLESA}" fill="none" stroke="${hx('1c1c1c')}" stroke-width="2.4" stroke-linejoin="round"/></g>`;

    /* variáveis das animações: giro casado com a distância percorrida */
    const circ = 2 * Math.PI * wr, dg = (d) => d / wr * 180 / Math.PI, spin = circ / VEL;
    const fora = Math.ceil(vx + vw + 14), volta = Math.ceil((L + 135 - vx) / circ) * circ, a1 = dg(fora), a2 = Math.ceil((a1 + dg(volta + VEL * 1.12)) / 360) * 360, a3 = Math.round(dg(volta)), a0 = 360 * (.08 * DURACAO_EVENTO_MS.retorno / 1000) / spin;
    const anim = { spin: f1(spin * 100) / 100, fora, volta: f1(volta), a0: f1(a0), a1: f1(a1), a2, a3, d: f1(L * 1.5), atraso: f1((ns * 1.3) % 6.5) };

    const rot = (tl(marca) + ' ' + tl(modelo)).trim() || tl(P('Veículo', 'Vehicle'));
    const desc = tl(P('Ilustração: ', 'Illustration: ')) + rot + (ano ? ' ' + ano : '') + ', ' + tl(FORMATOS[f]) + ', ' + tl(P('cor ', '')) + tl(co.nome).toLowerCase();
    return { anim, svg: `<svg class="cv-va cv-va-${tam} cv-va-st-${st}" style="--dsat:url(#${u}dsf)" viewBox="${f1(vx)} ${f1(vt)} ${f1(vw)} ${f1(vh)}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(desc)}"><defs>${df}</defs>${s}</svg>` };
  }

  /* Animações pela Web Animations API, com os tempos e as curvas do CSS do sistema real (o estilo do módulo não tem @keyframes).
     Movimento reduzido ou alto contraste: nada se move e a transição não toca. As animações ficam no conjunto "vivas" de quem
     chamou, para serem canceladas quando o carro sai da tela. */
  const semMovimento = () => {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.getAttribute('data-visual') === 'contraste'; } catch (e) { return true; }
  };
  const E1 = 'cubic-bezier(.55,0,1,.65)', E2 = 'cubic-bezier(.15,.55,.35,1)', E3 = 'cubic-bezier(.33,.66,.66,1)', EB = 'cubic-bezier(.45,0,.3,1)';
  const tx = x => ({ transform: 'translateX(' + x + 'px)' }), rz = g => ({ transform: 'rotate(' + g + 'deg)' }), op = o => ({ opacity: o });
  const em = (offset, k, easing) => (easing ? { ...k, offset, easing } : { ...k, offset });
  /* laços contínuos: rodas, suspensão, estrada e paisagem (em uso e atrasado), pisca-alerta (atrasado) e brilho do verniz (disponível).
     Durante uma transição só a estrada e a paisagem seguem em laço; o resto é da transição. */
  function lacos(a, st, comEvento) {
    const l = [], andando = st === 'uso' || st === 'atr';
    if (andando || comEvento) l.push(['.cv-va-road', [{ strokeDashoffset: 0 }, { strokeDashoffset: 64 }], 290], ['.cv-va-mid', [tx(0), tx(-120)], 1200], ['.cv-va-far', [tx(0), tx(-600)], 22000]);
    if (comEvento) return l;
    if (andando) l.push(['.cv-va-spin', [rz(0), rz(360)], a.spin * 1000], ['.cv-va-bob', [{ transform: 'translateY(0)' }, { transform: 'translateY(-1.1px)' }], 460, { direction: 'alternate', easing: 'ease-in-out' }]);
    if (st === 'atr') l.push(['.cv-va-pisca', [op(1), em(.5, op(1)), em(.5, op(0)), op(0)], 900]);
    if (st === 'disp') l.push(['.cv-va-shine', [em(0, tx(0), EB), em(.34, tx(a.d), EB), tx(a.d)], 6500, { delay: -a.atraso * 1000 }]);
    return l;
  }
  /* saída: acelera, sai pela direita e volta pela esquerda já na estrada; retorno: some, entra pela esquerda, freia e estaciona */
  const EVENTOS = {
    saida: a => [
      ['.cv-va-move', [em(0, tx(0)), em(.22, tx(0), E1), em(.6, tx(a.fora)), em(.6001, tx(-a.volta), E2), em(1, tx(0))]],
      ['.cv-va-spin', [em(0, rz(0)), em(.22, rz(0), E1), em(.6, rz(a.a1)), em(1, rz(a.a2))]],
      ['.cv-va-pitch', [em(0, rz(0)), em(.14, rz(0)), em(.18, rz(-1.5)), em(.22, rz(-.4)), em(.28, rz(-1.1)), em(.48, rz(-.8)), em(.58, rz(0)), em(1, rz(0))]],
      ['.cv-va-luz', [em(0, op(0)), em(.05, op(1)), em(.07, op(.35)), em(.1, op(1)), em(1, op(1))]],
      ['.cv-va-estudio', [em(0, op(1)), em(.52, op(1)), em(.62, op(0)), em(1, op(0))]],
      ['.cv-va-cena', [em(0, op(0)), em(.56, op(0)), em(.66, op(1)), em(1, op(1))]],
      ['.cv-va-blur', [em(0, op(0)), em(.3, op(0)), em(.46, op(1)), em(1, op(1))]],
    ],
    retorno: a => [
      ['.cv-va-move', [em(0, { ...tx(0), opacity: 1 }), em(.08, { ...tx(0), opacity: 0 }), em(.0801, { ...tx(-a.volta), opacity: 1 }, E3), em(.72, { ...tx(0), opacity: 1 }), em(1, { ...tx(0), opacity: 1 })]],
      ['.cv-va-spin', [em(0, rz(0)), em(.08, rz(a.a0)), em(.0801, rz(0), E3), em(.72, rz(a.a3)), em(1, rz(a.a3))]],
      ['.cv-va-pitch', [em(0, rz(0)), em(.3, rz(0)), em(.46, rz(.55)), em(.7, rz(1)), em(.76, rz(-.4)), em(.82, rz(.18)), em(.88, rz(0)), em(1, rz(0))]],
      ['.cv-va-luz', [em(0, op(1)), em(.84, op(1)), em(.86, op(.3)), em(.88, op(.8)), em(.92, op(0)), em(1, op(0))]],
      ['.cv-va-freio', [em(0, op(0)), em(.26, op(0)), em(.32, op(1)), em(.74, op(1)), em(.8, op(0)), em(1, op(0))]],
      ['.cv-va-cena', [em(0, op(1)), em(.02, op(1)), em(.1, op(0)), em(1, op(0))]],
      ['.cv-va-estudio', [em(0, op(0)), em(.04, op(0)), em(.14, op(1)), em(1, op(1))]],
      ['.cv-va-blur', [em(0, op(1)), em(.4, op(1)), em(.62, op(0)), em(1, op(0))]],
    ],
  };
  function animarAvatar(palco, anim, status, evento, vivas) {
    const svg = palco.querySelector && palco.querySelector('svg');
    if (!svg || semMovimento()) return;
    const tocar = (sel, kf, duration, o) => svg.querySelectorAll(sel).forEach(n => { if (n.animate) vivas.add(n.animate(kf, { duration, ...o })); });
    lacos(anim, ST[status], !!evento).forEach(([sel, kf, d, o]) => tocar(sel, kf, d, { iterations: Infinity, ...o }));
    if (evento) EVENTOS[evento](anim).forEach(([sel, kf]) => tocar(sel, kf, DURACAO_EVENTO_MS[evento], { fill: 'forwards' }));
  }


  /* ====================================================================
     ÍCONES (traço único, grade 24x24) e ESTILO
     ==================================================================== */
  const IC = {
    car: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
    house: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    calplus: '<path d="M8 2v4"/><path d="M16 2v4"/><path d="M21 13V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8"/><path d="M3 10h18"/><path d="M16 19h6"/><path d="M19 16v6"/>',
    list: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
    clipcheck: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    userplus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
    pencil: '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    checkc: '<path d="M21.801 10A10 10 0 1 1 17 3.335"/><path d="m9 11 3 3L22 4"/>',
    xc: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
    key: '<path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4"/><path d="m21 2-9.6 9.6"/><circle cx="7.5" cy="15.5" r="5.5"/>',
    rotate: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    chart: '<path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
    pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    history: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    ban: '<circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/>',
    send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
    chevl: '<path d="m15 18-6-6 6-6"/>',
    chevr: '<path d="m9 18 6-6-6-6"/>',
    chevd: '<path d="m6 9 6 6 6-6"/>',
    sliders: '<path d="M4 21v-7"/><path d="M4 10V3"/><path d="M12 21v-9"/><path d="M12 8V3"/><path d="M20 21v-5"/><path d="M20 12V3"/><path d="M2 14h4"/><path d="M10 8h4"/><path d="M18 16h4"/>',
    server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
  };

  /* O único bloco de estilo do módulo. Todo seletor começa por .cv-real (a raiz da tela e o escopo do miolo dos diálogos).
     Só layout e peças próprias, com tokens --ph-*: nenhuma cor, fonte ou regra por tema. */
  const ROT = 'font:700 11px/1.4 var(--ph-font-mono);text-transform:var(--ph-rotulo-case);letter-spacing:max(.06em,var(--ph-rotulo-tracking));font-stretch:var(--ph-rotulo-stretch)';
  const R = '.cv-real ';
  const CSS = [
    '.cv-real{min-width:0;color:var(--ph-text)}' + R + 'p{margin:0}' + R + '.cv-ic{flex:none}' + R + 'dl,' + R + 'dd{margin:0}' + R + 'ul,' + R + 'ol{margin:0;padding:0;list-style:none}',
    R + '.cv-tela{display:flex;flex-direction:column;gap:18px;min-width:0}',
    /* faixa das ajudas que só existem na demonstração */
    R + '.cv-demo{border-bottom:1px dashed var(--ph-border-soft);background:var(--ph-surface);font-size:13px;color:var(--ph-text-muted)}',
    R + '.cv-demo summary{cursor:pointer;padding:8px 16px;display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;list-style:none;' + ROT + ';color:var(--ph-text-dim)}',
    R + '.cv-demo summary:focus-visible{outline-offset:-2px}' + R + '.cv-demo summary::-webkit-details-marker{display:none}',
    R + '.cv-demo summary .nota{font:400 12px/1.5 var(--ph-font);letter-spacing:0;text-transform:none;font-stretch:100%}' + R + '.cv-demo[open] summary .cv-ic:last-child{transform:rotate(180deg)}',
    R + '.cv-demo .corpo{display:flex;flex-wrap:wrap;align-items:center;gap:8px 16px;padding:2px 16px 12px}',
    R + '.cv-demo-item{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;min-width:0;max-width:100%}',
    R + '.cv-demo-tag{' + ROT + ';font-size:10px;color:var(--ph-text-dim);border:1px dashed var(--ph-border-soft);border-radius:var(--ph-raio);padding:0 6px;white-space:nowrap}',
    R + '.cv-demo .ph-input{width:auto;max-width:100%;height:2rem;min-height:2rem;font-size:13px}' + R + '.cv-demo .ph-btn{white-space:normal;height:auto;min-height:2rem;text-align:left}',
    R + '.cv-demo-pode{flex:1 1 240px;min-width:0}',
    /* faixa de devolução do próprio motorista */
    R + '.cv-bn{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:10px 16px;font-size:14px;border-bottom:1px solid color-mix(in srgb,var(--tom) 45%,var(--ph-border));background:color-mix(in srgb,var(--tom) 10%,var(--ph-card));color:var(--ph-text)}',
    R + '.cv-bn>.cv-ic{color:var(--tom)}' + R + '.cv-bn p{flex:1 1 220px;min-width:0}',
    /* cabeçalho de cada área e seções */
    R + '.cv-ph{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:8px 16px}' + R + '.cv-ph>div:first-child{min-width:0}' + R + '.cv-ph h2{margin:0}',
    R + '.cv-ph-a{display:flex;flex-wrap:wrap;gap:8px;align-items:center}',
    R + '.cv-sec{display:flex;flex-direction:column;gap:10px;min-width:0}' + R + '.cv-sec>h3{display:flex;align-items:center;gap:8px;margin:0}',
    R + '.cv-cnt{font:700 12px/1 var(--ph-font-mono);padding:3px 8px;border-radius:999px;background:var(--ph-card-2);color:var(--ph-text-muted)}',
    R + '.cv-vz{color:var(--ph-text-dim);font-size:13.5px;padding:6px 0}' + R + '.cv-hint{font-size:13px;color:var(--ph-text-muted)}' + R + '.cv-err{font-size:13px;color:var(--ph-erro);font-weight:600}',
    R + '.cv-grid{display:grid;gap:12px;grid-template-columns:minmax(0,1fr)}',
    '@media (min-width:700px){.cv-real .cv-g2,.cv-real .cv-g3{grid-template-columns:repeat(2,minmax(0,1fr))}.cv-real .cv-g4{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    '@media (min-width:1000px){.cv-real .cv-g3{grid-template-columns:repeat(3,minmax(0,1fr))}.cv-real .cv-g4{grid-template-columns:repeat(4,minmax(0,1fr))}}',
    /* placa Mercosul */
    R + '.cv-plate{display:inline-flex;flex-direction:column;background:var(--ph-card);color:var(--ph-text);border:2px solid var(--ph-text);border-radius:6px;overflow:hidden;flex:none;line-height:1}',
    R + '.cv-plate i{display:block;background:var(--ph-vivo-azul);color:var(--ph-card);font-style:normal;font-size:7px;font-weight:700;letter-spacing:.28em;text-align:center;padding:2px 0 1px}',
    R + '.cv-plate b{display:block;font-family:var(--ph-font-mono);font-size:15px;font-weight:800;letter-spacing:.06em;padding:3px 7px 4px}',
    R + '.cv-plate.cv-p i{font-size:6px;padding:1px 0}' + R + '.cv-plate.cv-p b{font-size:12px;padding:2px 5px 3px}',
    R + '.cv-plate.cv-g{border-width:3px;border-radius:9px}' + R + '.cv-plate.cv-g i{font-size:10px;padding:3px 0 2px}' + R + '.cv-plate.cv-g b{font-size:28px;padding:6px 14px 8px}',
    /* avatar do veículo (o desenho vem do SVG; aqui só o palco e os estados) e foto */
    R + '.cv-va-stage{display:block;flex:none;min-width:0;overflow:hidden;background:var(--ph-card-2);border:1px solid var(--ph-border);border-radius:var(--ph-raio-lg)}',
    R + '.cv-va-stage.cv-va-sz-mini{border-radius:var(--ph-raio)}' + R + '.cv-va-stage.cv-va-sz-medio{width:300px;max-width:100%}' + R + '.cv-va-stage.cv-va-sz-grande{width:100%}',
    R + '.cv-va{display:block;width:100%;height:auto;overflow:hidden}' + R + '.cv-va.cv-va-mini{width:97px;height:44px}',
    R + '.cv-va .cv-va-luz,' + R + '.cv-va .cv-va-pisca,' + R + '.cv-va .cv-va-freio,' + R + '.cv-va .cv-va-blur,' + R + '.cv-va .cv-va-cena{opacity:0}',
    R + '.cv-va .cv-va-selo{display:none}' + R + '.cv-va.cv-va-st-man .cv-va-selo{display:inline}' + R + '.cv-va.cv-va-st-man .cv-va-car{filter:var(--dsat)}',
    R + '.cv-va-st-uso .cv-va-luz,' + R + '.cv-va-st-atr .cv-va-luz,' + R + '.cv-va-st-uso .cv-va-cena,' + R + '.cv-va-st-atr .cv-va-cena,' + R + '.cv-va-st-uso .cv-va-blur,' + R + '.cv-va-st-atr .cv-va-blur{opacity:1}',
    R + '.cv-va-st-uso .cv-va-estudio,' + R + '.cv-va-st-atr .cv-va-estudio{opacity:0}' + R + '.cv-va-st-atr .cv-va-pisca{opacity:1}',
    R + '.cv-va-ev-saida .cv-va-shine,' + R + '.cv-va-ev-retorno .cv-va-pisca{opacity:0}',
    R + '.cv-foto{display:block;flex:none;object-fit:cover;background:var(--ph-card-2);border:1px solid var(--ph-border);border-radius:var(--ph-raio-lg)}' + R + '.cv-foto.cv-m{width:300px;max-width:100%;aspect-ratio:23/10}' + R + '.cv-foto.cv-g{width:100%;aspect-ratio:16/9}',
    /* cartão da reserva */
    R + '.cv-rc.ph-card{padding:14px 16px;gap:10px;border-left:4px solid var(--c,var(--ph-border));min-width:0}',
    R + '.cv-rc.s-Pendente{--c:var(--ph-alerta)}' + R + '.cv-rc.s-Reservada,' + R + '.cv-rc.s-Aprovada{--c:var(--ph-cor-violeta)}' + R + '.cv-rc.s-EmUso{--c:var(--ph-info)}' + R + '.cv-rc.s-Atrasada,' + R + '.cv-rc.s-NaoRetirada,' + R + '.cv-rc.s-Rejeitada{--c:var(--ph-erro)}',
    R + '.cv-rc-top{display:flex;align-items:center;gap:8px 12px;flex-wrap:wrap}' + R + '.cv-rc-veh{flex:1 1 120px;min-width:0}' + R + '.cv-rc-veh h3{font-size:15px;font-weight:700;margin:0}' + R + '.cv-rc-veh small{color:var(--ph-text-dim);font-size:12.5px}',
    R + '.cv-rc-when{font-weight:700;font-size:14.5px}' + R + '.cv-rc.s-Atrasada .cv-rc-when,' + R + '.cv-rc.s-NaoRetirada .cv-rc-when{color:var(--ph-erro)}',
    R + '.cv-meta{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px 16px}' + R + '.cv-meta dt{font-size:12px;color:var(--ph-text-dim)}' + R + '.cv-meta dd{font-size:14px;overflow-wrap:anywhere}',
    R + '.cv-nota{font-size:13.5px;color:var(--ph-text-2);display:flex;gap:6px;align-items:flex-start}' + R + '.cv-nota .cv-ic{margin-top:2px}' + R + '.cv-nota.er{color:var(--ph-erro)}' + R + '.cv-nota.am{color:var(--ph-cor-ambar)}',
    R + '.cv-passo{font-size:13.5px;background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio);padding:8px 12px}',
    R + '.cv-acoes{display:flex;gap:8px;flex-wrap:wrap}' + R + '.cv-acoes>.ph-btn{flex:1 1 150px}',
    /* viagem atual do motorista */
    R + '.cv-hero{display:flex;align-items:center;gap:12px 16px;flex-wrap:wrap}' + R + '.cv-hero>div{min-width:0}' + R + '.cv-xl{display:block;font-size:17px;font-weight:700;overflow-wrap:anywhere}',
    R + '.cv-viagem.ph-card{gap:14px;border-color:color-mix(in srgb,var(--ph-info) 45%,var(--ph-border))}' + R + '.cv-viagem.atrasada{border-color:color-mix(in srgb,var(--ph-erro) 60%,var(--ph-border))}',
    R + '.cv-eyebrow{' + ROT + ';color:var(--ph-text-dim)}' + R + '.cv-viagem .cab{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}',
    R + '.cv-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}' + R + '.cv-stats>div{background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio);padding:8px 10px;min-width:0}',
    R + '.cv-stats small{display:block;color:var(--ph-text-dim);font-size:12px}' + R + '.cv-stats b{font-size:17px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}' + R + '.cv-stats b.neg{color:var(--ph-erro)}',
    /* atalhos de reserva e contadores do dia */
    R + '.cv-qt{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px}',
    R + '.cv-tile.ph-btn{height:auto;min-height:84px;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:4px;padding:12px 14px;text-align:left;white-space:normal}',
    R + '.cv-tile small{color:var(--ph-text-dim);font-size:12.5px;font-weight:400}',
    R + '.cv-ctr{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}',
    R + '.cv-ct{display:flex;flex-direction:column;align-items:stretch;text-align:left;cursor:pointer;font:inherit;color:inherit;min-width:0}' + R + '.cv-ct .ph-kpi-detalhe{overflow-wrap:anywhere}',
    /* pedido em três passos */
    R + '.cv-num{display:inline-grid;place-items:center;width:24px;height:24px;border-radius:50%;background:var(--ph-primario-bg);color:var(--ph-primario-fg);font:700 12px/1 var(--ph-font-mono);flex:none}',
    R + '.cv-qchips{display:flex;flex-wrap:wrap;gap:8px}' + R + '.cv-qchip.ph-btn{height:auto;flex-direction:column;align-items:flex-start;gap:0;padding:6px 12px;white-space:normal;text-align:left}' + R + '.cv-qchip small{font-size:12px;font-weight:400;color:var(--ph-text-dim)}',
    R + '.cv-qchip[aria-pressed="true"]{border-color:var(--ph-accent);box-shadow:inset 0 0 0 1px var(--ph-accent)}',
    R + '.cv-vpick{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}',
    R + '.cv-vp{display:flex;align-items:center;gap:12px;min-height:66px;padding:10px 12px;border-radius:var(--ph-raio-lg);border:1px solid var(--ph-borda-campo);background:var(--ph-surface);color:var(--ph-text);text-align:left;width:100%;min-width:0;font:inherit;cursor:pointer}',
    R + '.cv-vp .vt{flex:1;min-width:0}' + R + '.cv-vp b{display:block}' + R + '.cv-vp small{display:block;font-size:12.5px;color:var(--ph-ok)}',
    R + '.cv-vp[disabled]{background:transparent;border-style:dashed;cursor:not-allowed}' + R + '.cv-vp[disabled] small{color:var(--ph-text-dim)}' + R + '.cv-vp[disabled] .cv-plate,' + R + '.cv-vp[disabled] .cv-va-stage{opacity:.55}',
    R + '.cv-vp .id{display:flex;align-items:center;gap:10px;flex:none;flex-wrap:wrap}' + R + '.cv-vp[aria-checked="true"]{border-color:var(--ph-accent);box-shadow:inset 0 0 0 1px var(--ph-accent)}',
    R + '.cv-vp .ck{width:24px;height:24px;border-radius:50%;border:2px solid var(--ph-borda-campo);display:grid;place-items:center;flex:none}' + R + '.cv-vp[aria-checked="true"] .ck{background:var(--ph-primario-bg);border-color:var(--ph-primario-bg);color:var(--ph-primario-fg)}',
    R + '.cv-resumo{position:sticky;bottom:0;z-index:2;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px 16px;background:var(--ph-card);border:1px solid var(--ph-border);border-radius:var(--ph-raio-lg);padding:12px 16px;box-shadow:var(--ph-sombra)}',
    R + '.cv-resumo .tt{min-width:0;flex:1 1 220px;font-weight:700}' + R + '.cv-resumo small{display:block;font-weight:400;font-size:12.5px;color:var(--ph-text-muted)}' + R + '.cv-resumo .cv-err{flex:1 1 100%}',
    /* fluxos de entrega e devolução */
    R + '.cv-passos{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}' + R + '.cv-passos li{display:flex;flex-direction:column;gap:6px;font-size:12px;color:var(--ph-text-dim);min-width:0}',
    R + '.cv-passos i{display:block;height:5px;border-radius:999px;background:var(--ph-card-2)}' + R + '.cv-passos li.feito i{background:color-mix(in srgb,var(--ph-accent) 55%,transparent)}' + R + '.cv-passos li[aria-current] i{background:var(--ph-accent)}' + R + '.cv-passos li[aria-current]{color:var(--ph-text);font-weight:700}',
    R + '.cv-quem{display:flex;align-items:center;gap:12px}' + R + '.cv-quem small{display:block;color:var(--ph-text-dim);font-size:12px}',
    R + '.cv-av{width:44px;height:44px;border-radius:50%;background:var(--ph-card-2);border:1px solid var(--ph-border);display:grid;place-items:center;font:700 14px/1 var(--ph-font-mono);color:var(--ph-accent-light);flex:none}',
    R + '.cv-kv{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px 16px}' + R + '.cv-kv dt{font-size:12px;color:var(--ph-text-dim)}' + R + '.cv-kv dd{font-size:14.5px;font-weight:600;overflow-wrap:anywhere}',
    R + '.cv-resumo-c{border:1px solid var(--ph-border);border-radius:var(--ph-raio-lg);padding:12px 14px;display:flex;flex-direction:column;gap:10px}' + R + '.cv-resumo-c h3{margin:0;font-size:15px}',
    R + '.cv-km .ph-input{font:700 24px/1.2 var(--ph-font-mono);height:auto;padding-block:8px;letter-spacing:.04em}',
    R + '.cv-seg{display:grid;grid-template-columns:repeat(auto-fit,minmax(64px,1fr));gap:8px;border:0;margin:0;padding:0;min-width:0}' + R + '.cv-seg legend{font-size:13px;font-weight:650;margin-bottom:6px;padding:0}',
    R + '.cv-seg label{position:relative;display:block;min-width:0}' + R + '.cv-seg input{position:absolute;opacity:0;width:1px;height:1px}',
    R + '.cv-seg label>span{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:64px;padding:8px;border-radius:var(--ph-raio-lg);border:1px solid var(--ph-borda-campo);background:var(--ph-surface);cursor:pointer;text-align:center;font-size:13px}',
    R + '.cv-seg input:checked+span{border-color:var(--ph-accent);box-shadow:inset 0 0 0 1px var(--ph-accent);font-weight:700}' + R + '.cv-seg input:focus-visible+span{outline:var(--ph-foco-largura,3px) solid var(--ph-focus);outline-offset:2px}',
    R + '.cv-seg.col{grid-template-columns:minmax(0,1fr)}' + R + '.cv-seg.col label>span{min-height:44px;flex-direction:row;justify-content:flex-start;padding:8px 12px;text-align:left}',
    R + '.cv-gauge{display:flex;gap:3px;align-items:flex-end;height:22px}' + R + '.cv-gauge i{width:7px;height:22px;border-radius:2px;background:var(--ph-card-2)}',
    R + '.cv-gauge i:nth-child(1){height:7px}' + R + '.cv-gauge i:nth-child(2){height:12px}' + R + '.cv-gauge i:nth-child(3){height:17px}' + R + '.cv-gauge i.on{background:var(--ph-accent)}',
    R + '.cv-ao-vivo{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}' + R + '.cv-ao-vivo>div{background:var(--ph-surface);border:1px solid var(--ph-border);border-radius:var(--ph-raio);padding:8px 10px;min-width:0}',
    R + '.cv-ao-vivo small{display:block;color:var(--ph-text-dim);font-size:12px}' + R + '.cv-ao-vivo b{font-size:17px;font-variant-numeric:tabular-nums}' + R + '.cv-ao-vivo b.neg{color:var(--ph-erro)}',
    R + '.cv-opc{border-top:1px solid var(--ph-border);padding-top:10px}' + R + '.cv-opc summary{cursor:pointer;font-weight:650}' + R + '.cv-opc>div{display:flex;flex-direction:column;gap:12px;margin-top:12px}',
    R + '.cv-lead{font-size:15px;font-weight:600}',
    /* frota */
    R + '.cv-vc.ph-card{display:flex;flex-direction:column;gap:10px;width:100%;padding:14px;text-align:left;cursor:pointer;font:inherit;color:inherit;min-width:0}',
    R + '.cv-vc>.cv-va-stage,' + R + '.cv-vc>.cv-foto{width:100%}' + R + '.cv-vc.venc{border-color:color-mix(in srgb,var(--ph-erro) 55%,var(--ph-border))}' + R + '.cv-vc.prox{border-color:color-mix(in srgb,var(--ph-alerta) 55%,var(--ph-border))}',
    R + '.cv-vc .top{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}' + R + '.cv-vc .mod{font-size:15.5px;font-weight:700}' + R + '.cv-vc .mod small{display:block;color:var(--ph-text-dim);font-weight:400;font-size:12.5px}',
    R + '.cv-vc .kma{display:flex;justify-content:space-between;align-items:baseline;gap:10px}' + R + '.cv-vc .kma span{color:var(--ph-text-dim);font-size:13px}' + R + '.cv-vc .kma b{font-size:18px;font-variant-numeric:tabular-nums}',
    R + '.cv-vc .nx{font-size:13px;color:var(--ph-text-2);border-top:1px solid var(--ph-border);padding-top:10px}',
    R + '.cv-rev{display:flex;flex-direction:column;gap:5px;font-size:13px}' + R + '.cv-rev .rt{display:flex;justify-content:space-between;gap:8px}' + R + '.cv-rev .rt b{color:var(--c,var(--ph-ok))}' + R + '.cv-rev small{color:var(--ph-text-dim)}',
    R + '.cv-rev.prox{--c:var(--ph-alerta)}' + R + '.cv-rev.venc{--c:var(--ph-erro)}' + R + '.cv-bar{height:8px;background:var(--ph-card-2);border-radius:999px;overflow:hidden}' + R + '.cv-bar i{display:block;height:100%;background:var(--c,var(--ph-ok));border-radius:inherit}',
    R + '.cv-mini{display:flex;flex-direction:column;gap:8px}' + R + '.cv-mini li{display:flex;align-items:center;gap:10px;flex-wrap:wrap}' + R + '.cv-mini li>span{min-width:0}' + R + '.cv-mini small{display:block;color:var(--ph-text-dim);font-size:12.5px}',
    R + '.cv-mcard.ph-card{gap:10px;padding:14px}' + R + '.cv-mcard .cab{display:flex;align-items:center;gap:10px;flex-wrap:wrap}',
    R + '.cv-mr.ph-card{gap:6px;padding:12px 14px}' + R + '.cv-mr .cab{display:flex;align-items:center;gap:10px;flex-wrap:wrap}' + R + '.cv-mr .cab b:last-child{margin-left:auto;font-variant-numeric:tabular-nums}' + R + '.cv-mr .mt{font-size:13px;color:var(--ph-text-muted)}',
    R + '.cv-tot{display:flex;flex-direction:column;justify-content:center;gap:2px;border:1px solid var(--ph-border);border-radius:var(--ph-raio);padding:8px 12px}' + R + '.cv-tot span,' + R + '.cv-tot small{font-size:12.5px;color:var(--ph-text-dim)}' + R + '.cv-tot b{font-size:18px;font-variant-numeric:tabular-nums}',
    /* histórico */
    R + '.cv-tsum{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:13.5px;color:var(--ph-text-muted)}' + R + '.cv-tsum b{color:var(--ph-text)}',
    R + '.cv-tb-x{--ph-tabela-max:60vh}' + R + '.cv-t{width:100%;font-size:13px;font-variant-numeric:tabular-nums lining-nums;min-width:1500px}' + R + '.cv-t td.n{text-align:right}' + R + '.cv-t td.pl{font-family:var(--ph-font-mono);font-weight:700}' + R + '.cv-t td.w{min-width:160px;white-space:normal}',
    /* painel */
    R + '.cv-sel.ph-input{width:auto;height:2rem;min-height:2rem;font-size:13px}',
    R + '.cv-frota{display:flex;flex-direction:column;gap:9px}' + R + '.cv-frota-l{display:grid;grid-template-columns:84px minmax(0,1fr) 84px;align-items:center;gap:10px;font-size:13px}',
    R + '.cv-frota-l .t,' + R + '.cv-giro-l .t{height:12px;background:var(--ph-card-2);border-radius:999px;overflow:hidden}' + R + '.cv-frota-l .t i{display:block;height:100%;background:var(--ph-vivo-azul);border-radius:inherit}' + R + '.cv-frota-l .r{text-align:right;color:var(--ph-text-2);font-variant-numeric:tabular-nums}',
    R + '.cv-giro{display:flex;flex-direction:column;gap:6px}' + R + '.cv-giro-l{display:flex;align-items:center;gap:10px}' + R + '.cv-giro-l .m{font-size:12px;color:var(--ph-text-dim);width:32px;flex:none}',
    R + '.cv-giro-l .t{flex:1}' + R + '.cv-giro-l .t i{display:block;height:100%;background:color-mix(in srgb,var(--ph-vivo-azul) 60%,transparent);border-radius:inherit}' + R + '.cv-giro-l.hoje .t i{background:var(--ph-vivo-azul)}',
    R + '.cv-giro-l .n{font-size:12px;color:var(--ph-text-muted);width:58px;text-align:right;flex:none;font-variant-numeric:tabular-nums}',
    R + '.cv-horas{display:flex;flex-direction:column;gap:10px}' + R + '.cv-hora{display:flex;flex-direction:column;gap:4px}' + R + '.cv-hora .t{display:flex;justify-content:space-between;gap:8px;font-size:13.5px}' + R + '.cv-hora .t b{font-variant-numeric:tabular-nums}' + R + '.cv-hora small{color:var(--ph-text-dim);font-size:12.5px}',
    R + '.cv-hora .tr{height:6px;background:var(--ph-card-2);border-radius:999px;overflow:hidden}' + R + '.cv-hora .tr i{display:block;height:100%;background:var(--ph-cor-violeta);border-radius:inherit}',
    /* aprovadores */
    R + '.cv-pessoas{display:flex;flex-wrap:wrap;gap:6px}' + R + '.cv-pessoa{display:inline-flex;align-items:center;gap:4px;max-width:100%;padding:2px 2px 2px 10px;border:1px solid var(--ph-border);border-radius:999px;background:var(--ph-surface);font-size:13px;overflow-wrap:anywhere}',
    R + '.cv-sem li{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:8px 0;border-bottom:1px solid var(--ph-border)}' + R + '.cv-sem li>span{flex:1 1 160px;min-width:0}' + R + '.cv-sem small{display:block;color:var(--ph-text-dim);font-size:12.5px}',
    R + '.cv-escolha{display:flex;flex-direction:column;gap:4px;max-height:320px;overflow:auto;border:1px solid var(--ph-border);border-radius:var(--ph-raio);padding:6px 10px}' + R + '.cv-escolha .ph-marca{min-height:40px}' + R + '.cv-escolha small{display:block;color:var(--ph-text-dim);font-size:12px}',
    /* telas estreitas */
    '@media (max-width:639.98px){.cv-real .cv-demo .corpo,.cv-real .cv-demo summary{padding-inline:12px}.cv-real .cv-stats,.cv-real .cv-ao-vivo{grid-template-columns:minmax(0,1fr) minmax(0,1fr)}.cv-real .cv-plate.cv-g b{font-size:22px}}',
  ].join('\n');
  function injetarCss() {
    if (document.getElementById('cv-real-css')) return;
    const st = document.createElement('style');
    st.setAttribute('id', 'cv-real-css');
    st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }


  const STATUS = {
    Pendente: [P('Pendente', 'Pending'), 'alerta'],
    Reservada: [P('Reservada', 'Booked'), 'info', 'var(--ph-cor-violeta)'],
    Aprovada: [P('Aprovada', 'Approved'), 'info', 'var(--ph-cor-violeta)'],
    EmUso: [P('Em uso', 'In use'), 'info'],
    Atrasada: [P('Atrasada', 'Overdue'), 'erro'],
    NaoRetirada: [P('Não retirada', 'Not picked up'), 'erro'],
    Encerrada: [P('Encerrada', 'Closed'), 'neutro'],
  };
  const COMBUSTIVEL = [P('Reserva', 'Reserve'), '1/4', '1/2', '3/4', P('Cheio', 'Full')];
  const EU = 'Helena Duarte';   // a demonstração pública abre como a gestora da frota

  /* frota e reservas abertas fictícias, relativas ao relógio de quem visita; ficam no escopo do módulo (sobrevivem ao idioma) */
  let db = null;
  function semear() {
    const agora = Date.now(), rel = x => new Date(agora + x);
    const em = (dias, hhmm) => { const d = new Date(agora + dias * 24 * HORA); const [hh, mm] = hhmm.split(':').map(Number); d.setHours(hh, mm, 0, 0); return d; };
    const veiculos = [
      { id: 1, placa: 'DEM1A01', marca: P('Marca A', 'Make A'), modelo: P('Picape cabine dupla', 'Double-cab pickup'), ano: 2024, cor: P('Prata', 'Silver'), km: 50120, proxima: 50000, status: 'Disponivel' },
      { id: 2, placa: 'DEM2B02', marca: P('Marca B', 'Make B'), modelo: P('Hatch compacto', 'Compact hatchback'), ano: 2023, cor: P('Branco', 'White'), km: 31500, proxima: 40000, status: 'EmUso' },
      { id: 3, placa: 'DEM3C03', marca: P('Marca C', 'Make C'), modelo: P('Sedã médio', 'Mid-size sedan'), ano: 2022, cor: P('Preto', 'Black'), km: 79650, proxima: 80000, status: 'Disponivel' },
      { id: 5, placa: 'DEM5E05', marca: P('Marca D', 'Make D'), modelo: P('SUV compacto', 'Compact SUV'), ano: 2025, cor: P('Cinza', 'Gray'), km: 9800, proxima: 10000, status: 'EmUso' },
      { id: 6, placa: 'DEM6F06', marca: P('Marca B', 'Make B'), modelo: P('Van de passageiros', 'Passenger van'), ano: 2024, cor: P('Azul', 'Blue'), km: 22300, proxima: 30000, status: 'Disponivel' },
      { id: 7, placa: 'DEM7G07', marca: P('Marca C', 'Make C'), modelo: P('Picape cabine simples', 'Single-cab pickup'), ano: 2020, cor: P('Vermelho', 'Red'), km: 86400, proxima: 90000, status: 'Disponivel' },
    ];
    const D = [P('Unidade filial', 'Branch site'), P('Fornecedor A', 'Supplier A'), P('Feira do setor', 'Industry trade fair'), P('Aeroporto', 'Airport'), P('Cliente da região norte', 'Customer, north region'), P('Fornecedor B', 'Supplier B'), P('Banco e cartório', 'Bank and notary office')];
    const r = (id, veiculoId, status, solicitante, aprovador, destino, saida, retornoPrev, extra) => ({ id, veiculoId, status, solicitante, aprovador, destino, saida, retornoPrev, saidaEm: null, kmSaida: null, ...extra });
    const reservas = [
      r(101, 3, 'Aprovada', 'Bruno Lima', 'Fernanda Alves', D[0], rel(15 * MIN), rel(5 * HORA)),
      r(102, 7, 'Aprovada', 'Isabela Nunes', null, D[1], rel(-3 * HORA), rel(4 * HORA)),
      r(103, 1, 'Aprovada', 'Diego Rocha', 'Gustavo Reis', D[2], rel(3 * HORA), rel(6 * HORA)),
      r(104, 2, 'EmUso', 'Carla Mendes', 'Fernanda Alves', D[3], rel(-2 * HORA), rel(40 * MIN), { saidaEm: rel(-115 * MIN), kmSaida: 31500 }),
      r(105, 5, 'EmUso', 'Elisa Prado', 'Gustavo Reis', D[4], rel(-5 * HORA), rel(-50 * MIN), { saidaEm: rel(-5 * HORA), kmSaida: 9800 }),
      r(106, 1, 'Pendente', 'Ana Souza', 'Fernanda Alves', D[4], em(1, '08:00'), em(1, '17:30')),
      r(107, 7, 'Pendente', 'Bruno Lima', 'Fernanda Alves', D[5], em(1, '13:00'), em(1, '18:00')),
      r(108, 6, 'Pendente', 'Isabela Nunes', null, D[6], em(2, '09:00'), em(2, '11:30')),
    ];
    return { veiculos, reservas };
  }

  Hub.registrar({
    id: 'controle_veiculos',
    ordem: 12,
    grupo: P('Operação', 'Operations'),
    icone: '<path d="M3.5 16.5v-4.2L5.6 7h12.8l2.1 5.3v4.2zM3.5 16.5V19h3v-2.5M17.5 16.5V19h3v-2.5M7 13h2M15 13h2"/>',
    nome: P('Controle de veículos', 'Fleet control'),
    resumo: P(
      'Reserva, aprovação pelo grupo, entrega e devolução da chave, frota e manutenção, com a ilustração animada de cada carro gerada pela descrição.',
      'Booking, group approval, key handover and return, fleet and maintenance, with an animated illustration of each car generated from its description.'
    ),
    manual: {
      pt: {
        destaque: 'O Controle de Veículos organiza a frota de uso compartilhado da empresa: pedido, aprovação pelo grupo de quem pede, entrega e devolução da chave, frota e manutenção, com a quilometragem de cada viagem e uma ilustração animada de cada carro, desenhada pela descrição do cadastro.',
        oque: 'O que é. Um sistema web do ProjectHub para os carros de uso comum da empresa. Cada viagem segue o mesmo caminho: alguém pede, o aprovador do grupo decide, a administração entrega a chave e o retorno encerra a viagem, tudo com data, hora e autor.\n\nO problema. O carro da empresa costuma ser combinado por planilha, caderno na portaria e mensagem: fica difícil saber qual veículo está livre, quem está com ele e quando volta, e a revisão passa do ponto.\n\nO que muda. Cada pessoa abre o sistema na própria tela inicial: quem pede vê a viagem em andamento e atalhos de período, o aprovador vê o que espera a decisão dele e a administração vê as saídas, devoluções, atrasos e chaves não retiradas do dia. Sem foto cadastrada, o carro aparece desenhado na cor e no formato do cadastro: sai andando na entrega da chave e volta e estaciona na devolução.\n\nNesta demonstração. O Início da gestão da frota funciona com dados fictícios: aprovar um pedido, entregar a chave e receber a chave mostram o fluxo de ponta a ponta. As outras áreas ficam fora da demonstração pública.',
        finalidade: 'Trocar a planilha e o caderno da portaria por um processo único e rastreável: a qualquer momento se sabe qual carro está livre, quem está com ele e quando volta, o mesmo carro não é reservado duas vezes para o mesmo horário e a revisão aparece antes de vencer. Os e-mails do módulo ficam atrás de uma chave que nasce desligada; o aviso no sino do hub sai sempre.\n\nProjetado e construído por Ruan Siqueira.',
        alcance: [
          'Tela inicial por papel: colaborador, aprovador e gestão da frota',
          'Pedido com os veículos livres no período e aprovação pelo grupo de quem pede',
          'Entrega e devolução da chave pela administração, com quilometragem e combustível',
          'Ilustração animada de cada carro gerada pela descrição, com placa Mercosul',
          'Frota, manutenção, painel e histórico com exportação em planilha',
        ],
        tecnologias: ['Next.js', 'React', 'TypeScript', '.NET', 'SQL Server', 'SVG'],
      },
      en: {
        destaque: 'Fleet Control organizes the company shared fleet: request, approval by the requester group, key handover and return, fleet and maintenance, with the mileage of every trip and an animated illustration of each car, drawn from its record description.',
        oque: 'What it is. A ProjectHub web system for the company shared cars. Every trip follows the same path: someone requests, the group approver decides, the administration hands over the key and the return closes the trip, all with date, time and author.\n\nThe problem. The company car is usually arranged through a spreadsheet, a notebook at the front desk and messages: it is hard to know which vehicle is free, who has it and when it comes back, and the scheduled service slips past due.\n\nWhat changes. Each person opens the system on their own home screen: requesters see the trip in progress and period shortcuts, approvers see what awaits their decision and the administration sees the departures, returns, delays and keys not picked up of the day. With no photo on file, the car shows up drawn in the color and shape of its record: it drives away at key handover and comes back and parks on return.\n\nIn this demo. The fleet management Home runs on fictitious data: approving a request, handing over a key and receiving a key show the flow end to end. The other areas are not part of the public demo.',
        finalidade: 'Replace the spreadsheet and the front-desk notebook with a single, traceable process: at any moment you know which car is free, who has it and when it comes back, the same car is never booked twice for the same time slot and the service shows up before it is due. The module emails sit behind a switch that starts off; the hub bell notice always goes out.\n\nDesigned and built by Ruan Siqueira.',
        alcance: [
          'Home screen by role: employee, approver and fleet management',
          'Requests showing the free vehicles in the period, approved by the requester group',
          'Key handover and return by the administration, with mileage and fuel',
          'Animated illustration of each car generated from its description, with Mercosur plates',
          'Fleet, maintenance, dashboard and history with spreadsheet export',
        ],
        tecnologias: ['Next.js', 'React', 'TypeScript', '.NET', 'SQL Server', 'SVG'],
      },
    },
    /* mini tour: só ganchos do módulo (.cv-raiz, data-f, .cv-*), nada que dependa do idioma */
    tour: [
      { alvo: '.cv-raiz [data-f="aba-inicio"]', acao: 'clicar', titulo: P('Cada um na sua tela', 'Everyone on their own screen'),
        texto: P('Quem pede, quem aprova e quem cuida da frota abrem o sistema em telas iniciais diferentes. Aqui, a da gestão da frota.',
          'Requesters, approvers and fleet management open the system on different home screens. This is the fleet management one.') },
      { alvo: '.cv-raiz .cv-ctr', titulo: P('O dia em quatro números', 'The day in four numbers'),
        texto: P('Saídas de hoje, devoluções esperadas, atrasadas e chaves não retiradas. O que precisa de atenção fica em vermelho.',
          'Departures today, expected returns, overdue trips and keys not picked up. Whatever needs attention shows in red.') },
      { alvo: '.cv-raiz .cv-aprovar', titulo: P('Aprovação pelo grupo', 'Approval by group'),
        texto: P('Cada pedido vai para o aprovador do grupo de quem pede; sem grupo, a gestão decide. Conflitos de horário aparecem antes da decisão.',
          'Each request goes to the approver of the requester group; without a group, management decides. Schedule conflicts show before the decision.') },
      { alvo: '.cv-raiz .cv-atencao', titulo: P('A chave e o carro', 'The key and the car'),
        texto: P('Entregar chave confere o odômetro e o combustível; ao confirmar, o carro, desenhado pela descrição do cadastro, sai andando. Na devolução ele volta, freia e estaciona.',
          'Hand over key checks the odometer and fuel; on confirming, the car, drawn from its record description, drives away. On return it comes back, brakes and parks.') },
      /* fechar-dialogos: uma janela aberta por um clique no passo anterior não fica por cima do holofote */
      { alvo: '.cv-raiz [data-f="aba-reservas"]', antes: 'fechar-dialogos', acao: 'clicar', titulo: P('Todas as reservas', 'All bookings'),
        texto: P('Pedidos, aprovações, chaves, frota, manutenção, painel e aprovadores têm áreas próprias.',
          'Requests, approvals, keys, fleet, maintenance, dashboard and approvers have their own areas.') },
      { alvo: '.cv-raiz .ph-fora', antes: 'fechar-dialogos', titulo: P('O resto está na versão completa', 'The rest is in the full version'),
        texto: P('O vídeo deste cartão mostra a frota inteira em ação; para ver de perto, é só me chamar por aqui.',
          'The video in this card shows the whole fleet in action; to see it up close, just reach me from here.') },
    ],

    montar(el, api) {
      if (!db) db = semear();
      const { t, h, ui, fmt } = api;
      injetarCss();
      const en = api.lang === 'en';
      const vivas = new Set();
      const podar = () => vivas.forEach(a => { const n = a.effect && a.effect.target; if (!n || !n.isConnected) { a.cancel(); vivas.delete(a); } });
      let AG = new Date();

      const veiculo = id => db.veiculos.find(v => v.id === id);
      const nomeV = v => t(v.marca) + ' ' + t(v.modelo);
      const porSaida = (a, b) => a.saida - b.saida, porRetorno = (a, b) => a.retornoPrev - b.retornoPrev;
      const sv = r => {
        if (r.status === 'Aprovada') { if (+AG < +r.saida) return 'Reservada'; return !r.saidaEm && AG - r.saida > 2 * HORA ? 'NaoRetirada' : 'Aprovada'; }
        if (r.status === 'EmUso') return +AG > +r.retornoPrev + 15 * MIN ? 'Atrasada' : 'EmUso';
        return r.status;
      };
      const p2 = n => String(n).padStart(2, '0');
      const hora = d => p2(d.getHours()) + ':' + p2(d.getMinutes());
      const dm = d => (en ? p2(d.getMonth() + 1) + '/' + p2(d.getDate()) : p2(d.getDate()) + '/' + p2(d.getMonth() + 1));
      const fDH = d => dm(d) + ' ' + hora(d);
      const mesmoDia = (a, b) => a.toDateString() === b.toDateString();
      const quando = d => (mesmoDia(d, AG) ? hora(d) : fDH(d));
      const periodo = r => fDH(r.saida) + t(P(' a ', ' to ')) + (mesmoDia(r.saida, r.retornoPrev) ? hora(r.retornoPrev) : fDH(r.retornoPrev));
      const fKm = n => (n == null || isNaN(n) ? '-' : fmt.num(n) + ' km');
      const fDur = x => { const tm = Math.max(0, Math.round(x / MIN)), hh = Math.floor(tm / 60), mm = tm % 60; return hh ? hh + ' h' + (mm ? ' ' + mm + ' min' : '') : mm + ' min'; };
      const so = v => String(v || '').replace(/\D/g, '');

      const ic = (n, tam = 16) => { const s = api.icone(IC[n], 'cv-ic'); s.style.cssText = 'width:' + tam + 'px;height:' + tam + 'px'; return s; };
      const e = (tag, classe, ...filhos) => h(tag, classe ? { class: classe } : null, ...filhos);
      const btn = (texto, aoClicar, o = {}) => { const b = ui.botao({ texto, aoClicar, icone: o.ic && IC[o.ic], tom: o.tom || 'secundario', tamanho: o.tamanho === undefined ? 'p' : o.tamanho, classe: o.classe, desabilitado: o.desabilitado }); if (o.foco) b.setAttribute('data-f', o.foco); return b; };
      const doKit = {};
      const clsCartao = () => doKit.cartao || (doKit.cartao = ui.cartao({}).className);
      const clsKpi = () => doKit.kpi || (doKit.kpi = ui.kpis([{ rotulo: '', valor: 0 }]).firstElementChild.className);
      const clsCampo = () => doKit.campo || (doKit.campo = ui.campo({}).input.className);
      const selo = s => { const b = ui.badge(STATUS[s][0], STATUS[s][1]); b.classList.add('cv-st', 's-' + s); if (STATUS[s][2]) b.style.setProperty('--tom', STATUS[s][2]); return b; };
      const placa = (pl, tam) => h('span', { class: 'cv-plate' + (tam ? ' cv-' + tam : ''), role: 'img', 'aria-label': t(P('Placa ', 'Plate ')) + pl }, h('i', { 'aria-hidden': 'true' }, 'BRASIL'), h('b', { 'aria-hidden': 'true' }, pl));
      const avatar = (v, o = {}) => {
        const tam = o.tamanho || 'medio', st = statusAvatar(v, !!o.atrasado);
        const { svg, anim } = avatarSvg({ marca: v.marca, modelo: v.modelo, cor: v.cor, ano: v.ano, status: st, tamanho: tam, lang: api.lang });
        const palco = h('span', { class: 'cv-va-stage cv-va-sz-' + tam + (o.evento ? ' cv-va-ev-' + o.evento : ''), html: svg });
        animarAvatar(palco, anim, st, o.evento, vivas);
        return palco;
      };
      const kv = (rot, val) => h('div', null, e('dt', null, rot), e('dd', null, val));
      const secao = (gancho, titulo, n, ...corpo) => h('section', { class: 'cv-sec ' + gancho }, h('h3', { class: 'ph-h3' }, titulo, e('span', 'cv-cnt', String(n))), corpo);
      const vz = texto => e('p', 'cv-vz', texto);
      let seq = 0;
      const entrada = attrs => h('input', { id: 'cv-p' + (++seq), ...attrs, class: clsCampo() });
      const campo = (rotulo, controle) => h('div', { class: 'ph-campo' }, h('label', { class: 'ph-campo-rotulo', for: controle.getAttribute('id') }, rotulo), controle);
      const foraDaDemo = titulo => (ui.foraDaDemo ? ui.foraDaDemo({ titulo }) : ui.vazio({ icone: 'info', titulo, texto: P('Esta tela fica fora da demonstração pública.', 'This screen is not part of the public demo.') }));
      /* rastro da versão pública: título, tipo, estado e tempo de cada passo */
      const passo = (tipo, titulo, ms, estado2) => ({ tipo, titulo, ms, estado: estado2 });
      const sino = passo('sql', P('Grava o aviso no sino do hub', 'Writes the notice to the hub bell'), 40);
      const semEmail = passo('email', P('E-mail: a chave do módulo nasce desligada, nenhum e-mail sai', 'Email: the module switch starts off, no email goes out'), 10, 'pulado');

      const AREAS = [
        ['inicio', P('Início', 'Home'), 'house'], ['reservar', P('Reservar', 'Book'), 'calplus'], ['chaves', P('Chaves de hoje', 'Keys today'), 'key'],
        ['frota', P('Frota', 'Fleet'), 'car'], ['viagens', P('Minhas viagens', 'My trips'), 'pin'], ['reservas', P('Reservas', 'Bookings'), 'list'],
        ['manutencoes', P('Manutenções', 'Maintenance'), 'wrench'], ['historico', P('Histórico', 'History'), 'history'], ['painel', P('Painel', 'Dashboard'), 'chart'],
        ['emails', P('Envio de e-mails', 'Email sending'), 'mail'], ['aprovadores', P('Aprovadores', 'Approvers'), 'users'],
      ];
      const raiz = h('div', { class: 'cv-real cv-raiz' });
      el.append(raiz);
      let nav = null;

      function pintar(foco) {
        AG = new Date();
        podar();
        const pend = db.reservas.filter(r => r.status === 'Pendente').length, atr = db.reservas.filter(r => sv(r) === 'Atrasada').length;
        nav = ui.abas({
          chave: 'aba', rotulo: P('Áreas do controle de veículos', 'Fleet control areas'),
          abas: AREAS.map(([id, rotulo, icn]) => ({ id, rotulo, icone: IC[icn], contador: id === 'inicio' ? pend : id === 'chaves' ? atr : 0,
            montar: pn => { AG = new Date(); podar(); pn.append(id === 'inicio' ? h('div', { class: 'cv-tela' }, inicio()) : foraDaDemo(rotulo)); } })),
        });
        nav.querySelector('[role="tablist"]').classList.add('cv-tabs');
        nav.querySelectorAll('[role="tab"]').forEach((b, i) => {
          b.setAttribute('data-f', 'aba-' + AREAS[i][0]);
          const c = b.querySelector('.ph-aba-contador');
          if (c && (AREAS[i][0] === 'inicio' || AREAS[i][0] === 'chaves')) { c.classList.add('cv-tab-badge'); c.setAttribute('title', t(AREAS[i][0] === 'inicio' ? P('aguardando aprovação', 'awaiting approval') : P('devoluções atrasadas', 'overdue returns'))); }
        });
        raiz.replaceChildren(nav);
        const alvo = foco && raiz.querySelector('[data-f="' + foco + '"]');
        if (alvo) alvo.focus();
      }

      /* ---------- cartão da reserva, como no sistema real ---------- */
      const complemento = (r, s) => ({
        Pendente: P('Saída em ' + fDH(r.saida), 'Departure on ' + fDH(r.saida)), Reservada: P('Saída em ' + fDH(r.saida), 'Departure on ' + fDH(r.saida)),
        Aprovada: P('Retirar até ' + hora(new Date(+r.saida + 2 * HORA)), 'Pick up by ' + hora(new Date(+r.saida + 2 * HORA))),
        EmUso: P('Retorno previsto em ' + quando(r.retornoPrev), 'Expected return at ' + quando(r.retornoPrev)),
        Atrasada: P('Atrasada há ' + fDur(AG - r.retornoPrev), 'Overdue by ' + fDur(AG - r.retornoPrev)),
        NaoRetirada: P('Saída prevista em ' + fDH(r.saida) + ', chave não retirada', 'Departure planned for ' + fDH(r.saida) + ', key not picked up'),
        Encerrada: P('Encerrada', 'Closed'),
      })[s];
      function cartao(r) {
        const v = veiculo(r.veiculoId), s = sv(r), acoes = [];
        if (r.status === 'Pendente') acoes.push(btn(P('Aprovar', 'Approve'), () => aprovar(r), { ic: 'checkc', tom: 'primario', foco: 'apr-' + r.id }));
        if (r.status === 'Aprovada') { const libera = +AG >= +r.saida - 30 * MIN; acoes.push(btn(P('Entregar chave', 'Hand over key'), () => entregar(r), { ic: 'key', tom: 'primario', classe: 'cv-entregar', desabilitado: !libera, foco: 'ent-' + r.id })); }
        if (r.status === 'EmUso') acoes.push(btn(P('Receber chave', 'Receive key'), () => receber(r), { ic: 'rotate', tom: s === 'Atrasada' ? 'primario' : 'ok', classe: 'cv-receber', foco: 'dev-' + r.id }));
        return h('article', { class: 'cv-res cv-rc s-' + s + ' ' + clsCartao() },
          h('div', { class: 'cv-rc-top' }, placa(v.placa), h('div', { class: 'cv-rc-veh' }, h('h3', null, nomeV(v)), e('small', null, t(P('Reserva nº ', 'Booking no. ')) + r.id)), selo(s)),
          e('p', 'cv-rc-when', complemento(r, s)),
          h('dl', { class: 'cv-meta' }, kv(P('Motorista', 'Driver'), r.solicitante), kv(P('Período', 'Period'), periodo(r)), kv(P('Destino', 'Destination'), t(r.destino)),
            r.kmSaida != null && kv(P('KM', 'Km'), fKm(r.kmSaida) + t(P(' na saída', ' at departure'))),
            r.status === 'Pendente' && kv(P('Aprovação', 'Approval'), r.aprovador || t(P('Administração', 'Administration')))),
          r.status === 'Pendente' && r.aprovador && e('p', 'cv-passo', P('Aprovador do grupo: ' + r.aprovador + '. A decisão do gestor da frota substitui a do aprovador.', 'Group approver: ' + r.aprovador + '. The fleet manager decision replaces the approver one.')),
          r.status === 'Aprovada' && +AG < +r.saida - 30 * MIN && h('p', { class: 'cv-nota am' }, ic('alert', 15), h('span', null, P('A entrega da chave é liberada a partir de ' + hora(new Date(+r.saida - 30 * MIN)) + ' (30 minutos antes da saída prevista).', 'Key handover opens at ' + hora(new Date(+r.saida - 30 * MIN)) + ' (30 minutes before the planned departure).'))),
          h('div', { class: 'cv-acoes' }, acoes));
      }
      const cartoes = l => h('div', { class: 'cv-grid cv-g2' }, l.map(cartao));

      /* ---------- Início da gestão da frota ---------- */
      function inicio() {
        const tt = +AG;
        const pend = db.reservas.filter(r => r.status === 'Pendente').sort(porSaida);
        const saidas = db.reservas.filter(r => r.status === 'Aprovada' && (mesmoDia(r.saida, AG) || +r.saida < tt)).sort(porSaida);
        const emUso = db.reservas.filter(r => r.status === 'EmUso').sort(porRetorno);
        const atrasadas = emUso.filter(r => sv(r) === 'Atrasada');
        const atencao = [...atrasadas, ...saidas.filter(r => tt >= +r.saida - 30 * MIN), ...emUso.filter(r => sv(r) === 'EmUso' && +r.retornoPrev - tt <= HORA)];
        const maisTarde = saidas.filter(r => tt < +r.saida - 30 * MIN);
        const CT = [[P('Saídas hoje', 'Departures today'), saidas, false], [P('Devoluções esperadas', 'Expected returns'), emUso, false], [P('Atrasadas', 'Overdue'), atrasadas, true], [P('Não retiradas', 'Not picked up'), saidas.filter(r => sv(r) === 'NaoRetirada'), true]];
        const dia = AG.toLocaleDateString(en ? 'en-US' : 'pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
        return [h('div', { class: 'cv-ph' }, h('div', null, h('h2', { class: 'ph-h2' }, P('Início', 'Home')), e('p', 'ph-texto-mudo', dia.charAt(0).toUpperCase() + dia.slice(1) + ' · ' + EU + ' · ' + t(P('Gestora da frota', 'Fleet manager'))))),
          secao('cv-aprovar', P('Aguardando sua aprovação', 'Awaiting your approval'), pend.length, pend.length ? cartoes(pend) : vz(P('Nenhuma solicitação aguardando aprovação.', 'No request awaiting approval.'))),
          h('div', { class: 'cv-ctr' }, CT.map(([rot, l, alerta], i) => h('button', { type: 'button', class: clsKpi() + ' cv-ct', 'data-f': 'ct-' + i, style: alerta && l.length ? '--tom:var(--ph-erro)' : null, onclick: () => nav.ir('chaves') },
            h('span', { class: 'ph-kpi-rotulo' }, rot), h('span', { class: 'ph-kpi-valor' }, String(l.length)), alerta && h('span', { class: 'ph-kpi-detalhe' }, l.length ? l.map(r => veiculo(r.veiculoId).placa).join(', ') : t(P('Nenhum caso', 'No cases')))))),
          secao('cv-atencao', P('Atenção agora', 'Needs attention now'), atencao.length, atencao.length ? cartoes(atencao) : vz(P('Nenhuma entrega ou devolução pendente neste momento.', 'No handover or return pending right now.'))),
          maisTarde.length > 0 && secao('cv-mais-tarde', P('Próximas saídas de hoje', 'Later departures today'), maisTarde.length, cartoes(maisTarde))];
      }

      /* ---------- encenações: aprovar, entregar a chave e receber a chave ---------- */
      function aprovar(r) {
        const v = veiculo(r.veiculoId);
        ui.backend({
          titulo: P('Aprovar reserva', 'Approve booking'), subtitulo: v.placa + ' · ' + r.solicitante, escrita: 'update',
          passos: [passo('api', P('Recebe o pedido da tela', 'Receives the request from the screen'), 90), passo('regra', P('Confere no servidor quem decide: o aprovador do grupo ou a gestão', 'Checks on the server who decides: the group approver or management'), 35),
            passo('regra', P('Confere conflito de horário, retorno vencido e manutenção', 'Checks schedule conflicts, past return and maintenance'), 40), passo('sql', P('Grava a aprovação', 'Saves the approval'), 55), sino, semEmail],
          resumo: P('Reserva aprovada. Até a hora da saída ela aparece como Reservada; a chave é liberada pela administração.', 'Booking approved. Until departure time it shows as Booked; the key is released by the administration.'),
          aoConcluir: res => { if (!res.ok) return; r.status = 'Aprovada'; pintar(); ui.toast(t(P('Reserva nº ', 'Booking no. ')) + r.id + t(P(' aprovada.', ' approved.')), 'ok'); },
        });
      }
      const combustivel = (aoMudar) => h('fieldset', { class: 'cv-seg cv-comb' }, h('legend', null, P('Nível de combustível', 'Fuel level')),
        COMBUSTIVEL.map((rot, i) => h('label', null, h('input', { type: 'radio', name: 'cv-comb', onchange: () => aoMudar(i) }), h('span', null, h('span', { class: 'cv-gauge', 'aria-hidden': 'true' }, [1, 2, 3, 4].map(n => h('i', { class: n <= i ? 'on' : null }))), e('b', null, rot)))));
      /* a janela mostra o carro no status anterior, toca a transição e fecha ao fim dela (sem movimento, fecha na hora) */
      function despedida(ctl, v, de, tipo, texto, atrasado) {
        ctl.el.querySelectorAll('.cv-pub-acao').forEach(b => { b.hidden = true; });
        if (semMovimento()) { ctl.fechar(); return; }
        ctl.corpo.replaceChildren(avatar({ ...v, status: de }, { tamanho: 'grande', evento: tipo, atrasado }), h('p', { class: 'cv-lead', role: 'status' }, texto));
        api.depois(() => ctl.fechar(), DURACAO_EVENTO_MS[tipo]);
      }
      function entregar(r) {
        const v = veiculo(r.veiculoId);
        let comb = null;
        const km = entrada({ type: 'text', inputmode: 'numeric', maxlength: '7', value: String(v.km), 'data-f': 'km' });
        ui.modal({
          titulo: P('Entrega da chave', 'Key handover'), icone: IC.key, largura: 560, classe: 'cv-real cv-entrega',
          corpo: [e('p', 'ph-texto-mudo', t(P('Reserva nº ', 'Booking no. ')) + r.id),
            h('div', { class: 'cv-hero' }, avatar(v), placa(v.placa, 'g'), h('div', null, e('b', 'cv-xl', nomeV(v)), selo(sv(r)))),
            h('dl', { class: 'cv-kv' }, kv(P('Motorista', 'Driver'), r.solicitante), kv(P('Retorno previsto', 'Expected return'), fDH(r.retornoPrev)), kv(P('Destino', 'Destination'), t(r.destino))),
            h('div', { class: 'cv-km' }, campo(P('KM de saída (odômetro)', 'Departure km (odometer)'), km)), combustivel(i => { comb = i; })],
          acoes: c => [btn(P('Cancelar', 'Cancel'), () => c.fechar(), { tamanho: null, classe: 'cv-pub-acao' }), btn(P('Confirmar entrega', 'Confirm handover'), () => {
            const n = so(km.value) === '' ? null : Number(so(km.value));
            if (n == null || n < v.km) { km.setAttribute('aria-invalid', 'true'); km.focus(); c.erro(P('Informe um KM igual ou maior que ' + fmt.num(v.km) + ' (KM atual do veículo).', 'Enter a km equal to or above ' + fmt.num(v.km) + ' (current vehicle km).')); return; }
            if (comb == null) { c.erro(P('Selecione o nível de combustível.', 'Choose the fuel level.')); return; }
            c.erro(null);
            ui.backend({
              titulo: P('Entregar a chave', 'Hand over the key'), subtitulo: v.placa + ' · ' + r.solicitante, escrita: 'update',
              passos: [passo('api', P('Recebe a entrega da tela', 'Receives the handover from the screen'), 90), passo('regra', P('Confere no servidor: só a gestão da frota entrega a chave', 'Checks on the server: only fleet management hands over keys'), 35),
                passo('regra', P('Confere a reserva aprovada, a janela de 30 minutos e a manutenção', 'Checks the approved booking, the 30-minute window and maintenance'), 40), passo('regra', P('Confere o KM de saída e o combustível', 'Checks the departure km and fuel'), 25),
                passo('sql', P('Marca a reserva e o veículo como em uso', 'Marks booking and vehicle as in use'), 70)],
              resumo: P('Chave entregue. O veículo fica em uso até a devolução.', 'Key handed over. The vehicle stays in use until the return.'),
              aoConcluir: res => {
                if (!res.ok) return;
                Object.assign(r, { status: 'EmUso', saidaEm: new Date(), kmSaida: n }); v.km = n; v.status = 'EmUso';
                pintar();
                ui.toast(t(P('Chave do veículo ', 'Key of vehicle ')) + v.placa + t(P(' entregue a ', ' handed over to ')) + r.solicitante + '.', 'ok');
                despedida(c, v, 'Disponivel', 'saida', t(P('Chave entregue a ', 'Key handed over to ')) + r.solicitante + t(P('. O veículo ', '. Vehicle ')) + v.placa + t(P(' está em uso.', ' is in use.')));
              },
            });
          }, { ic: 'check', tom: 'primario', tamanho: null, classe: 'cv-pub-acao' })],
        });
      }
      function receber(r) {
        const v = veiculo(r.veiculoId), atrasada = sv(r) === 'Atrasada';
        const km = entrada({ type: 'text', inputmode: 'numeric', maxlength: '7', placeholder: t(P('Informe o KM de retorno', 'Enter the arrival km')), 'data-f': 'km' });
        const rodado = e('b', null, '-');
        km.addEventListener('input', () => { const d = so(km.value); if (d !== km.value) km.value = d; rodado.textContent = d ? fKm(Number(d) - r.kmSaida) : '-'; });
        ui.modal({
          titulo: P('Devolução do veículo', 'Vehicle return'), icone: IC.rotate, largura: 560, classe: 'cv-real cv-devolucao',
          corpo: [e('p', 'ph-texto-mudo', t(P('Reserva nº ', 'Booking no. ')) + r.id + ' · ' + r.solicitante),
            h('div', { class: 'cv-hero' }, placa(v.placa, 'g'), h('div', null, e('b', 'cv-xl', nomeV(v)), selo(sv(r)))),
            atrasada && ui.aviso(t(P('Devolução atrasada há ', 'Return overdue by ')) + fDur(AG - r.retornoPrev) + '.', 'erro'),
            h('div', { class: 'cv-km' }, campo(P('KM de retorno (odômetro)', 'Arrival km (odometer)'), km)),
            h('div', { class: 'cv-ao-vivo' }, h('div', null, e('small', null, P('KM rodado', 'Km driven')), rodado), h('div', null, e('small', null, P('Horas de uso', 'Hours of use')), e('b', null, fDur(AG - r.saidaEm))), h('div', null, e('small', null, P('KM de saída', 'Departure km')), e('b', null, fmt.num(r.kmSaida))))],
          acoes: c => [btn(P('Cancelar', 'Cancel'), () => c.fechar(), { tamanho: null, classe: 'cv-pub-acao' }), btn(P('Confirmar devolução', 'Confirm return'), () => {
            const n = so(km.value) === '' ? null : Number(so(km.value));
            if (n == null || n < r.kmSaida) { km.setAttribute('aria-invalid', 'true'); km.focus(); c.erro(P('Informe um KM igual ou maior que ' + fmt.num(r.kmSaida) + ' (KM registrado na saída).', 'Enter a km equal to or above ' + fmt.num(r.kmSaida) + ' (km recorded at departure).')); return; }
            c.erro(null);
            ui.backend({
              titulo: P('Registrar devolução', 'Log return'), subtitulo: v.placa + ' · ' + r.solicitante, escrita: 'update',
              passos: [passo('api', P('Recebe a devolução da tela', 'Receives the return from the screen'), 90), passo('regra', P('Confere no servidor: o solicitante ou a gestão da frota', 'Checks on the server: the requester or fleet management'), 35),
                passo('regra', P('Confere o KM de retorno', 'Checks the arrival km'), 25), passo('sql', P('Encerra a viagem e devolve o veículo', 'Closes the trip and returns the vehicle'), 75)],
              resumo: P('Devolução registrada. O veículo está disponível e a viagem foi para o histórico.', 'Return logged. The vehicle is available and the trip went to the history.'),
              aoConcluir: res => {
                if (!res.ok) return;
                const perc = n - r.kmSaida;
                r.status = 'Encerrada'; v.km = n; v.status = 'Disponivel';
                pintar();
                ui.toast(t(P('Devolução do veículo ', 'Return of vehicle ')) + v.placa + t(P(' registrada. Percurso: ', ' logged. Distance: ')) + fKm(perc) + '.', 'ok');
                despedida(c, v, 'EmUso', 'retorno', t(P('Devolução registrada. O veículo ', 'Return logged. Vehicle ')) + v.placa + t(P(' está disponível.', ' is available.')), atrasada);
              },
            });
          }, { ic: 'check', tom: 'primario', tamanho: null, classe: 'cv-pub-acao' })],
        });
      }

      pintar();
      return () => { vivas.forEach(a => a.cancel()); vivas.clear(); };
    },
  });
})();
