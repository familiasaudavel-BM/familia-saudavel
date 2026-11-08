// ============================================================
// FAMÍLIA SAUDÁVEL — conteúdo da plataforma
// Para mudar textos, cardápio, receitas ou treinos, edite este arquivo.
// ============================================================

// ---------- ROTINA ----------
const ROTINA = {
  semana: [
    { h: "6:00", quem: "Adultos", txt: "Shot matinal em jejum" },
    { h: "6:20", quem: "Todos", txt: "Café da manhã em família · adultos: whey + creatina" },
    { h: "9:30", quem: "Adultos", txt: "Lanche da manhã (fruta, iogurte ou ovo cozido)" },
    { h: "12:00", quem: "Adultos", txt: "Almoço · ômega-3 antes (pai: marmita no trabalho)" },
    { h: "16:00", quem: "Mãe e crianças", txt: "Lanche da tarde juntos" },
    { h: "17:30", quem: "Adultos", txt: "Pré-treino" },
    { h: "19:00", quem: "Adultos", txt: "Treino (ver aba Treinos)" },
    { h: "20:20", quem: "Todos", txt: "Jantar em família (é o pós-treino)" },
    { h: "21:20", quem: "Adultos", txt: "Chá noturno" },
    { h: "22:00", quem: "Todos", txt: "Dormir" }
  ],
  quarta: [
    { h: "6:00", quem: "Adultos", txt: "Shot matinal em jejum" },
    { h: "6:20", quem: "Todos", txt: "Café da manhã em família · adultos: whey + creatina" },
    { h: "9:30", quem: "Adultos", txt: "Lanche da manhã" },
    { h: "12:00", quem: "Adultos", txt: "Almoço · ômega-3 antes" },
    { h: "16:00", quem: "Mãe e crianças", txt: "Lanche da tarde juntos" },
    { h: "17:15", quem: "Adultos", txt: "Lanche reforçado antes do balé" },
    { h: "18:00", quem: "Adultos", txt: "Balé: pai dá a aula, mãe faz a aula (treino dela)" },
    { h: "20:00", quem: "Pai", txt: "Treino curto: puxar + core (25 min)" },
    { h: "20:40", quem: "Todos", txt: "Jantar rápido em família (marmita pronta)" },
    { h: "21:30", quem: "Adultos", txt: "Chá noturno" },
    { h: "22:00", quem: "Todos", txt: "Dormir" }
  ],
  sabado: [
    { h: "6:00", quem: "Adultos", txt: "Shot matinal em jejum" },
    { h: "7:30", quem: "Todos", txt: "Café reforçado em família" },
    { h: "8:30", quem: "Todos", txt: "Manhã ativa: caminhada, quadra ou trilha (ritmo leve)" },
    { h: "12:30", quem: "Todos", txt: "Almoço em família e descanso" },
    { h: "16:00", quem: "Todos", txt: "Lanche da tarde" },
    { h: "17:30", quem: "Adultos", txt: "Pré-treino com suco de beterraba" },
    { h: "19:00", quem: "Adultos", txt: "Treino de pernas + corrida mais longa da semana" },
    { h: "20:20", quem: "Todos", txt: "Jantar em família" },
    { h: "22:00", quem: "Todos", txt: "Dormir" }
  ],
  domingo: [
    { h: "6:00", quem: "Adultos", txt: "Shot matinal em jejum" },
    { h: "7:30", quem: "Todos", txt: "Café da manhã em família" },
    { h: "9:00", quem: "Todos", txt: "Preparo da semana em família (2 h) — ver aba Compras" },
    { h: "12:30", quem: "Todos", txt: "Almoço em família" },
    { h: "16:00", quem: "Adultos", txt: "Recuperação ativa: alongamento e mobilidade" },
    { h: "19:30", quem: "Todos", txt: "Jantar em família" },
    { h: "22:00", quem: "Todos", txt: "Dormir" }
  ]
};

// ---------- TREINOS (2 semanas) ----------
// s1 = semana 1 (adaptação) · s2 = semana 2 (progressão)
const TREINOS = {
  seg: {
    titulo: "Membros superiores — empurrar", cor: "azul",
    blocos: [
      { nome: "Aquecimento (8 min)", itens: [
        ["Polichinelo leve ou bicicleta", "5 min", "5 min"],
        ["Rotação de ombros e braços", "1 x 15", "1 x 15"] ] },
      { nome: "Musculação", itens: [
        ["Supino reto (máquina ou halteres)", "3 x 12", "3 x 10 (+carga)"],
        ["Desenvolvimento com halteres sentado", "3 x 12", "3 x 10 (+carga)"],
        ["Supino inclinado com halteres", "3 x 12", "3 x 10"],
        ["Elevação lateral", "3 x 15", "3 x 12"],
        ["Tríceps na polia", "3 x 12", "3 x 12 (+carga)"],
        ["Tríceps francês com halter", "2 x 12", "3 x 12"] ] },
      { nome: "Core + isometria", itens: [
        ["Prancha frontal", "3 x 30 s", "3 x 40 s"],
        ["Dead bug (inseto morto)", "3 x 10", "3 x 12"],
        ["Prancha lateral", "2 x 20 s cada lado", "2 x 30 s cada lado"] ] }
    ],
    corrida: { tipo: "Trote leve contínuo", s1: "15 min", s2: "18 min",
      obs: "Ritmo de conversa: dá para falar frases inteiras." }
  },
  ter: {
    titulo: "Membros inferiores — foco anterior", cor: "verde",
    blocos: [
      { nome: "Aquecimento (8 min)", itens: [
        ["Bicicleta ou caminhada rápida", "5 min", "5 min"],
        ["Agachamento livre sem peso", "2 x 10", "2 x 10"] ] },
      { nome: "Musculação", itens: [
        ["Agachamento goblet (halter no peito) ou no banco", "3 x 12", "3 x 10 (+carga)"],
        ["Leg press", "3 x 12", "4 x 10"],
        ["Cadeira extensora", "3 x 15", "3 x 12 (+carga)"],
        ["Afundo parado (ou subida no step baixo)", "2 x 10 cada perna", "3 x 10 cada perna"],
        ["Panturrilha em pé", "3 x 15", "3 x 20"] ] },
      { nome: "Flexibilidade e mobilidade (10 min)", itens: [
        ["Mobilidade de tornozelo na parede", "2 x 10 cada", "2 x 10 cada"],
        ["Quadril 90/90", "2 x 8 cada lado", "2 x 8 cada lado"],
        ["Gato-camelo", "2 x 10", "2 x 10"] ] }
    ],
    corrida: { tipo: "Descanso de corrida", s1: "—", s2: "—", obs: "Foco total na perna e na recuperação." }
  },
  qua: {
    titulo: "Membros superiores — puxar (curto, pós-balé)", cor: "roxo",
    nota: "Mãe: a aula de balé é o treino do dia. Pai: treino curto depois de dar a aula (20:00–20:25).",
    blocos: [
      { nome: "Musculação (em circuito, 1 min de descanso)", itens: [
        ["Puxada frontal (ou remada com elástico em casa)", "3 x 12", "3 x 10 (+carga)"],
        ["Remada baixa ou remada curvada com halter", "3 x 12", "3 x 10"],
        ["Face pull ou crucifixo inverso", "2 x 15", "3 x 15"],
        ["Rosca direta", "2 x 12", "3 x 12"] ] },
      { nome: "Core + isometria", itens: [
        ["Prancha frontal", "2 x 30 s", "3 x 30 s"],
        ["Perdigueiro (4 apoios, braço e perna opostos)", "2 x 10 cada lado", "2 x 12 cada lado"] ] }
    ],
    corrida: { tipo: "Intervalado leve (opcional)", s1: "6 x (1 min trote + 1 min caminhada)", s2: "8 x (1 min trote + 1 min caminhada)",
      obs: "Só se sobrar energia depois da aula. Se encurtar o sono, pule." }
  },
  qui: {
    titulo: "Membros inferiores — foco posterior", cor: "verde",
    blocos: [
      { nome: "Aquecimento (8 min)", itens: [
        ["Bicicleta ou caminhada rápida", "5 min", "5 min"],
        ["Ponte de glúteo sem peso", "2 x 12", "2 x 12"] ] },
      { nome: "Musculação", itens: [
        ["Levantamento terra romeno (stiff) com halteres", "3 x 12", "3 x 10 (+carga)"],
        ["Mesa ou cadeira flexora", "3 x 12", "3 x 12 (+carga)"],
        ["Elevação pélvica", "3 x 12", "4 x 10"],
        ["Abdução de quadril (máquina ou elástico)", "3 x 15", "3 x 15"] ] },
      { nome: "Isometria + alongamento profundo (10 min)", itens: [
        ["Ponte isométrica", "3 x 30 s", "3 x 40 s"],
        ["Alongamento de posteriores (sentado)", "2 x 40 s", "2 x 40 s"],
        ["Alongamento de glúteo (figura 4)", "2 x 40 s cada", "2 x 40 s cada"] ] }
    ],
    corrida: { tipo: "Descanso de corrida", s1: "—", s2: "—", obs: "Protege posteriores e glúteos." }
  },
  sex: {
    titulo: "Membros superiores — completo", cor: "azul",
    blocos: [
      { nome: "Aquecimento (8 min)", itens: [["Bicicleta ou polichinelo leve", "5 min", "5 min"]] },
      { nome: "Musculação", itens: [
        ["Supino máquina ou flexão inclinada", "3 x 10", "3 x 10 (+carga)"],
        ["Remada curvada com halter", "3 x 10", "3 x 10 (+carga)"],
        ["Desenvolvimento com halteres", "3 x 10", "3 x 10"],
        ["Puxada frontal", "3 x 10", "3 x 10"],
        ["Bíceps + tríceps em sequência (bi-set)", "2 x 12", "3 x 12"] ] },
      { nome: "Isometria intensa de tronco", itens: [
        ["Prancha frontal", "3 x 45 s", "3 x 50 s"],
        ["Canoa (hollow hold) — joelhos dobrados se precisar", "3 x 20 s", "3 x 25 s"],
        ["Pallof isométrico (elástico)", "2 x 20 s cada lado", "3 x 20 s cada lado"] ] }
    ],
    corrida: { tipo: "Trote leve contínuo", s1: "15 min", s2: "18 min", obs: "Mesmo ritmo de segunda." }
  },
  sab: {
    titulo: "Membros inferiores global + escápulas", cor: "laranja",
    nota: "De manhã: atividade leve com as crianças. Treino às 19:00.",
    blocos: [
      { nome: "Musculação", itens: [
        ["Agachamento goblet", "3 x 10", "3 x 10 (+carga)"],
        ["Leg press", "3 x 10", "3 x 10"],
        ["Stiff com halteres", "3 x 10", "3 x 10"],
        ["Afundo caminhando (ou parado)", "2 x 8 cada perna", "2 x 10 cada perna"],
        ["Y-T-W de bruços (escápulas)", "2 x 8 cada letra", "2 x 10 cada letra"] ] },
      { nome: "Mobilidade torácica", itens: [
        ["Rotação torácica em 4 apoios", "2 x 10 cada lado", "2 x 10 cada lado"],
        ["Livro aberto deitado de lado", "2 x 8 cada lado", "2 x 8 cada lado"] ] }
    ],
    corrida: { tipo: "Corrida contínua moderada (maior volume)", s1: "25 min", s2: "30 min",
      obs: "Ritmo confortável, um pouco mais firme que o trote. É o treino-chave para os 5 km." }
  },
  dom: {
    titulo: "Recuperação ativa", cor: "cinza",
    blocos: [
      { nome: "Movimento leve", itens: [["Caminhada leve (pode ser em família)", "20–30 min", "20–30 min"]] },
      { nome: "Flexibilidade e mobilidade (15 min)", itens: [
        ["Alongamento geral de pernas", "2 x 40 s cada", "2 x 40 s cada"],
        ["Mobilidade de quadril e ombros", "2 x 10", "2 x 10"],
        ["Respiração lenta deitado", "3 min", "3 min"] ] }
    ],
    corrida: { tipo: "Sem corrida", s1: "—", s2: "—", obs: "" }
  }
};

const TREINO_ORIENTACOES = [
  "Carga: escolha um peso em que as 2 últimas repetições fiquem difíceis, mas com boa postura.",
  "Descanso entre séries: 60 a 90 segundos.",
  "Semana 2: aumente um pouco a carga ou as repetições, só se a semana 1 foi bem.",
  "Mãe: troque o trote por caminhada rápida ou por 2 min de caminhada + 1 min de trote, até liberação médica. Se o joelho incomodar, troque o afundo pelo leg press.",
  "Mãe: beba água antes, durante e depois. Tontura ou fraqueza = parar e comer algo.",
  "Dor articular aguda, dor no peito ou falta de ar fora do normal: pare o treino."
];

// ---------- RECEITAS ----------
// cat: cafe | frango | carne | peixe | ovos | acomp | sopa | lanche
// kids: tarefa que as crianças podem fazer
const RECEITAS = [
  // CAFÉ DA MANHÃ
  { id: "tapioca-ovo", nome: "Tapioca com ovo", cat: "cafe", tempo: 10, rende: "1 tapioca",
    ing: ["3 col. (sopa) de goma de tapioca", "1 ovo", "Sal, orégano"],
    passos: ["Aqueça a frigideira antiaderente sem óleo.", "Espalhe a goma peneirada até formar um disco.", "Quando soltar, vire. Recheie com o ovo mexido e dobre."],
    kids: "Peneirar a goma (9 anos)" },
  { id: "tapioca-frango", nome: "Tapioca de frango com tomate", cat: "cafe", tempo: 10, rende: "1 tapioca",
    ing: ["3 col. de goma", "3 col. de frango desfiado", "Tomate picado, orégano"],
    passos: ["Faça o disco de tapioca.", "Recheie com frango e tomate.", "Dobre e deixe 1 min para aquecer o recheio."],
    kids: "Montar o recheio" },
  { id: "crepioca", nome: "Crepioca", cat: "cafe", tempo: 8, rende: "1 unidade",
    ing: ["1 ovo", "2 col. de goma de tapioca", "Pitada de sal"],
    passos: ["Bata o ovo com a goma e o sal.", "Despeje na frigideira quente untada.", "Doure dos dois lados. Recheie com frango, queijo ou tomate."],
    kids: "Bater o ovo com o garfo" },
  { id: "cuscuz-ovo", nome: "Cuscuz com ovo", cat: "cafe", tempo: 15, rende: "4 porções",
    ing: ["2 xíc. de flocão de milho", "1 xíc. de água com sal", "Ovos (1 a 2 por pessoa)"],
    passos: ["Hidrate o flocão com a água por 5 min.", "Coloque na cuscuzeira e cozinhe 10 min no vapor.", "Sirva com ovo frito na água, mexido ou cozido."],
    kids: "Misturar a água no flocão" },
  { id: "cuscuz-legumes", nome: "Cuscuz recheado de legumes", cat: "cafe", tempo: 20, rende: "4 porções",
    ing: ["2 xíc. de flocão", "1 cenoura ralada", "1/2 abobrinha ralada", "1 tomate picado", "Sal, cúrcuma"],
    passos: ["Misture o flocão hidratado com os legumes e temperos.", "Cozinhe na cuscuzeira por 12 min.", "Sirva com ovo ou frango desfiado."],
    kids: "Ralar a cenoura com supervisão (9 anos)" },
  { id: "panqueca-aveia", nome: "Panqueca de aveia e banana", cat: "cafe", tempo: 10, rende: "2 panquecas",
    ing: ["1 banana madura", "2 ovos", "3 col. de aveia", "Canela"],
    passos: ["Amasse a banana e misture os ovos e a aveia.", "Despeje porções na frigideira untada em fogo baixo.", "Vire quando firmar. Sirva com canela."],
    kids: "Amassar a banana (5 anos)" },
  { id: "ovos-cremosos", nome: "Ovos mexidos cremosos com tomate", cat: "cafe", tempo: 8, rende: "2 porções",
    ing: ["4 ovos", "1 tomate picado", "Sal, cebolinha (se tiver)"],
    passos: ["Refogue o tomate 1 min.", "Junte os ovos batidos em fogo baixo.", "Mexa devagar e desligue ainda cremoso."],
    kids: "Quebrar os ovos numa tigela (5 anos)" },
  { id: "iogurte-aveia", nome: "Iogurte com aveia, banana e canela", cat: "cafe", tempo: 3, rende: "1 pote",
    ing: ["1/2 xíc. de iogurte natural", "2 col. de aveia", "1/2 banana", "Canela (ou cacau)"],
    passos: ["Coloque o iogurte no pote.", "Cubra com aveia, banana em rodelas e canela."],
    kids: "Montar o próprio pote" },

  // FRANGO
  { id: "frango-desfiado", nome: "Frango desfiado na pressão", cat: "frango", tempo: 35, rende: "base para 3 refeições",
    ing: ["1 kg de peito de frango", "1 cebola", "3 dentes de alho", "2 tomates", "Sal, cúrcuma, colorau"],
    passos: ["Refogue cebola e alho, doure o frango.", "Junte tomate, temperos e água até a metade.", "20 min após pegar pressão. Desfie com dois garfos.", "Guarde em potes: serve para tapioca, sopa, escondidinho e salada."],
    kids: "Desfiar o frango morno com garfo (9 anos)" },
  { id: "coxa-airfryer", nome: "Coxa e sobrecoxa na air fryer", cat: "frango", tempo: 35, rende: "4 porções",
    ing: ["1 kg de coxa e sobrecoxa", "Suco de 1 limão", "Alho, sal, cúrcuma, páprica"],
    passos: ["Tempere e deixe 15 min (ou de véspera).", "Air fryer a 200 °C por 30 min, virando na metade.", "Retire a pele no prato para menos gordura."] },
  { id: "frango-quiabo", nome: "Frango com quiabo", cat: "frango", tempo: 35, rende: "4 porções",
    ing: ["600 g de frango em cubos", "400 g de quiabo", "Cebola, alho, tomate", "Sal, cúrcuma"],
    passos: ["Lave e seque bem o quiabo. Corte em rodelas grossas.", "Refogue o frango até dourar.", "Junte o quiabo e o tomate, mexa pouco e cozinhe tampado 15 min."],
    dica: "Quiabo seco e pouca mexida = sem baba." },
  { id: "frango-acebolado", nome: "Frango acebolado", cat: "frango", tempo: 20, rende: "4 porções",
    ing: ["600 g de peito em tiras", "2 cebolas em rodelas", "Alho, limão, sal"],
    passos: ["Tempere o frango com limão, alho e sal.", "Doure em frigideira quente com pouco óleo.", "Junte a cebola e refogue até murchar."] },
  { id: "frango-grelhado", nome: "Frango grelhado com limão e cúrcuma", cat: "frango", tempo: 20, rende: "4 porções",
    ing: ["600 g de filé de peito", "Limão, alho, cúrcuma, pimenta-do-reino", "Sal"],
    passos: ["Abra os filés finos e tempere.", "Grelhe em frigideira bem quente 4 min de cada lado (ou air fryer 200 °C, 15 min)."],
    dica: "A pimenta-do-reino ajuda a absorver a cúrcuma." },
  { id: "strogonoff", nome: "Strogonoff de frango com iogurte", cat: "frango", tempo: 25, rende: "4 porções",
    ing: ["600 g de frango em cubos", "1 cebola, alho", "3 tomates batidos (ou extrato)", "1 pote de iogurte natural", "Sal, mostarda (opcional)"],
    passos: ["Doure o frango, junte cebola e alho.", "Adicione o tomate batido e cozinhe 10 min.", "Desligue o fogo e misture o iogurte (não ferver)."],
    dica: "Mais leve que com creme de leite e com mais proteína." },
  { id: "frango-xadrez", nome: "Frango xadrez caseiro", cat: "frango", tempo: 25, rende: "4 porções",
    ing: ["600 g de frango em cubos", "1 cenoura em cubos", "1 abobrinha em cubos", "1 cebola em pétalas", "Shoyu (opcional), alho, gengibre"],
    passos: ["Doure o frango em fogo alto.", "Junte cenoura, depois abobrinha e cebola (ficam crocantes).", "Tempere com alho, gengibre e um fio de shoyu."],
    kids: "Separar os legumes por cor" },
  { id: "escondidinho", nome: "Escondidinho de batata com frango", cat: "frango", tempo: 40, rende: "4 porções",
    ing: ["2 xíc. de frango desfiado", "800 g de batata (ou batata-doce)", "Leite (um pouco)", "Tomate, cebola"],
    passos: ["Cozinhe e amasse a batata com um pouco de leite e sal.", "Refogue o frango com tomate e cebola.", "Monte: frango embaixo, purê em cima. Forno 200 °C por 20 min."],
    kids: "Espalhar o purê na travessa" },
  { id: "assadeira-frango", nome: "Assadeira de frango com batata e cenoura", cat: "frango", tempo: 50, rende: "4 porções",
    ing: ["800 g de frango (coxa ou peito em cubos)", "3 batatas", "2 cenouras", "Cebola, alho, azeite, alecrim ou orégano"],
    passos: ["Corte tudo em pedaços parecidos.", "Tempere na própria assadeira com azeite e temperos.", "Forno 200 °C por 40 min, mexendo na metade."],
    kids: "Misturar os temperos com a mão limpa" },
  { id: "frango-ensopado", nome: "Frango ensopado com batata", cat: "frango", tempo: 35, rende: "4 porções",
    ing: ["700 g de frango em pedaços", "3 batatas em cubos", "Cebola, alho, tomate", "Sal, colorau"],
    passos: ["Refogue o frango.", "Junte batata, tomate e água para cobrir.", "Panela de pressão 12 min (ou panela comum 30 min)."] },
  { id: "nuggets", nome: "Nuggets caseiros com aveia (air fryer)", cat: "frango", tempo: 30, rende: "20 unidades",
    ing: ["500 g de peito de frango moído ou bem picado", "1 ovo", "1/2 xíc. de aveia para empanar", "Sal, alho, cúrcuma"],
    passos: ["Misture frango, ovo e temperos.", "Modele os nuggets e passe na aveia.", "Air fryer a 200 °C por 15 min, virando na metade."],
    kids: "Empanar na aveia (as duas crianças)" },

  // CARNE BOVINA
  { id: "carne-abobrinha", nome: "Carne moída com abobrinha", cat: "carne", tempo: 20, rende: "4 porções",
    ing: ["400 g de carne moída", "2 abobrinhas em cubos", "Cebola, alho, tomate"],
    passos: ["Doure a carne até secar a água.", "Junte cebola, alho e tomate.", "Acrescente a abobrinha e cozinhe 5 min (fica al dente)."] },
  { id: "picadinho", nome: "Picadinho com cenoura e batata", cat: "carne", tempo: 30, rende: "4 porções",
    ing: ["400 g de carne moída", "2 batatas em cubos", "1 cenoura em cubos", "Cebola, alho, tomate"],
    passos: ["Doure a carne.", "Junte os temperos, batata, cenoura e 1 xíc. de água.", "Tampe e cozinhe até os legumes ficarem macios (15 min)."] },
  { id: "hamburguer", nome: "Hambúrguer caseiro", cat: "carne", tempo: 20, rende: "6 unidades",
    ing: ["500 g de carne moída", "1 cebola ralada", "1 ovo", "Sal, alho"],
    passos: ["Misture tudo sem amassar demais.", "Faça discos de 1,5 cm.", "Air fryer a 200 °C por 12 min."],
    kids: "Modelar os discos (as duas crianças)" },
  { id: "almondegas", nome: "Almôndegas ao molho de tomate", cat: "carne", tempo: 35, rende: "4 porções",
    ing: ["400 g de carne moída", "1 ovo, 2 col. de aveia", "4 tomates batidos", "Cebola, alho, manjericão"],
    passos: ["Misture carne, ovo, aveia e sal. Faça bolinhas.", "Asse na air fryer 180 °C por 10 min.", "Termine 10 min no molho de tomate refogado."],
    kids: "Enrolar as bolinhas" },
  { id: "abobrinha-recheada", nome: "Abobrinha recheada com carne", cat: "carne", tempo: 35, rende: "4 porções",
    ing: ["2 abobrinhas", "300 g de carne moída refogada", "Tomate picado"],
    passos: ["Corte as abobrinhas ao meio no comprimento e retire o miolo.", "Recheie com a carne misturada ao miolo picado e tomate.", "Forno 200 °C por 25 min."] },

  // PEIXE
  { id: "merluza-airfryer", nome: "Merluza na air fryer", cat: "peixe", tempo: 15, rende: "4 porções",
    ing: ["600 g de filé de merluza", "Limão, alho, sal, páprica"],
    passos: ["Descongele na geladeira de véspera e seque com papel.", "Tempere.", "Air fryer a 180 °C por 12 min, sem empanar."] },
  { id: "merluza-forno", nome: "Merluza ao forno com tomate e cebola", cat: "peixe", tempo: 30, rende: "4 porções",
    ing: ["600 g de merluza", "2 tomates e 1 cebola em rodelas", "Azeite, limão, sal, orégano"],
    passos: ["Tempere o peixe e coloque na travessa.", "Cubra com tomate e cebola, fio de azeite.", "Forno 200 °C por 20–25 min."] },
  { id: "iscas-peixe", nome: "Iscas de peixe com crosta de aveia", cat: "peixe", tempo: 20, rende: "4 porções",
    ing: ["500 g de merluza em tiras", "1 ovo batido", "1/2 xíc. de aveia", "Sal, limão, páprica"],
    passos: ["Tempere as tiras.", "Passe no ovo e depois na aveia.", "Air fryer 200 °C por 12 min."],
    kids: "Empanar as iscas" },
  { id: "peixe-papelote", nome: "Peixe no papelote com legumes", cat: "peixe", tempo: 30, rende: "4 porções",
    ing: ["600 g de merluza", "1 abobrinha e 1 cenoura em fatias finas", "Tomate, limão, azeite, sal"],
    passos: ["Monte em papel-alumínio: legumes embaixo, peixe e tomate por cima.", "Feche bem os pacotes.", "Forno 200 °C por 20 min."],
    kids: "Montar o próprio pacotinho" },

  // OVOS
  { id: "omelete-abobrinha", nome: "Omelete de abobrinha e tomate", cat: "ovos", tempo: 12, rende: "2 porções",
    ing: ["4 ovos", "1/2 abobrinha ralada", "1 tomate picado", "Sal, orégano"],
    passos: ["Bata os ovos com sal.", "Refogue a abobrinha 2 min, junte os ovos e o tomate.", "Tampe em fogo baixo até firmar."] },
  { id: "omelete-forno", nome: "Omelete de forno com legumes", cat: "ovos", tempo: 30, rende: "4 porções",
    ing: ["8 ovos", "Brócolis picado, cenoura ralada, tomate", "Sal, cúrcuma"],
    passos: ["Bata os ovos e misture os legumes.", "Despeje em forma untada.", "Forno 180 °C por 25 min."],
    kids: "Picar o brócolis com a mão" },
  { id: "shakshuka", nome: "Ovos no molho de tomate (shakshuka)", cat: "ovos", tempo: 20, rende: "4 porções",
    ing: ["6 tomates picados", "1 cebola, alho", "6 ovos", "Sal, páprica, cominho"],
    passos: ["Faça um molho de tomate grosso com cebola e alho.", "Abra covinhas e quebre os ovos dentro.", "Tampe e cozinhe até as claras firmarem."] },
  { id: "ovo-cozido", nome: "Ovos cozidos para a semana", cat: "ovos", tempo: 15, rende: "10 ovos",
    ing: ["10 ovos", "Água"],
    passos: ["Coloque os ovos em água fervente.", "10 min para gema firme.", "Esfrie na água fria e guarde na geladeira (até 5 dias)."],
    kids: "Descascar os ovos (9 anos)" },

  // ACOMPANHAMENTOS
  { id: "arroz", nome: "Arroz soltinho", cat: "acomp", tempo: 25, rende: "8 porções",
    ing: ["2 xíc. de arroz", "4 xíc. de água fervente", "Alho, sal, fio de óleo"],
    passos: ["Doure o alho, refogue o arroz 2 min.", "Junte a água fervente e o sal.", "Tampe em fogo baixo até secar (15 min)."] },
  { id: "feijao", nome: "Feijão na pressão", cat: "acomp", tempo: 50, rende: "10 porções",
    ing: ["500 g de feijão (de molho por 8 h)", "Cebola, alho, louro", "Sal"],
    passos: ["Descarte a água do molho.", "Pressão com água nova por 25–30 min.", "Tempere com refogado de cebola e alho. Porcione e congele parte."],
    dica: "O molho de 8 h reduz gases — bom para o intestino." },
  { id: "pure-batata", nome: "Purê de batata", cat: "acomp", tempo: 25, rende: "4 porções",
    ing: ["600 g de batata", "1/2 xíc. de leite", "Sal, noz-moscada (pitada)"],
    passos: ["Cozinhe a batata até desmanchar.", "Amasse quente com o leite e o sal."] },
  { id: "pure-batata-doce", nome: "Purê de batata-doce", cat: "acomp", tempo: 25, rende: "4 porções",
    ing: ["600 g de batata-doce", "Sal, canela ou alecrim"],
    passos: ["Cozinhe na pressão 8 min.", "Amasse e tempere."] },
  { id: "batata-rustica", nome: "Batata-doce rústica na air fryer", cat: "acomp", tempo: 25, rende: "4 porções",
    ing: ["600 g de batata-doce com casca", "1 col. de azeite", "Sal, páprica, alecrim"],
    passos: ["Corte em gomos e tempere.", "Air fryer 200 °C por 20 min, sacudindo na metade."],
    kids: "Temperar no saco fechado e chacoalhar" },
  { id: "legumes-assados", nome: "Legumes assados", cat: "acomp", tempo: 35, rende: "para 2 dias",
    ing: ["Cenoura, abobrinha, brócolis, batata-doce, cebola", "Azeite, sal, cúrcuma, pimenta"],
    passos: ["Corte em pedaços parecidos.", "Tempere na assadeira.", "Forno 200 °C por 30 min (brócolis entra nos últimos 10 min)."] },
  { id: "brocolis-alho", nome: "Brócolis no vapor com alho", cat: "acomp", tempo: 12, rende: "4 porções",
    ing: ["1 maço de brócolis", "2 dentes de alho", "Azeite, sal"],
    passos: ["Cozinhe no vapor 5 min (fica verde vivo).", "Doure o alho no azeite e misture."] },
  { id: "quiabo-refogado", nome: "Quiabo refogado sem baba", cat: "acomp", tempo: 20, rende: "4 porções",
    ing: ["400 g de quiabo", "Cebola, alho, tomate", "Limão, sal"],
    passos: ["Lave, seque e corte o quiabo.", "Refogue em fogo alto com gotas de limão, mexendo pouco.", "Junte tomate no final."] },
  { id: "salada-tomate", nome: "Salada de tomate e pepino", cat: "acomp", tempo: 5, rende: "4 porções",
    ing: ["2 tomates", "1 pepino", "Cebola roxa ou comum", "Limão, azeite, sal"],
    passos: ["Corte tudo em cubos.", "Tempere na hora de servir."],
    kids: "Misturar a salada" },
  { id: "cenoura-cozida", nome: "Cenoura cozida com ervas", cat: "acomp", tempo: 15, rende: "4 porções",
    ing: ["3 cenouras", "Sal, orégano, fio de azeite"],
    passos: ["Corte em rodelas e cozinhe no vapor 8 min.", "Tempere."] },

  // SOPAS
  { id: "sopa-legumes", nome: "Sopa de legumes com frango", cat: "sopa", tempo: 35, rende: "6 porções",
    ing: ["2 xíc. de frango desfiado", "2 batatas, 1 cenoura, 1 abobrinha", "Cebola, alho, tomate", "Sal, cúrcuma"],
    passos: ["Refogue cebola e alho.", "Junte legumes em cubos e água para cobrir.", "Pressão 8 min. Junte o frango e ferva mais 5 min."] },
  { id: "caldo-feijao", nome: "Caldo de feijão com frango", cat: "sopa", tempo: 20, rende: "4 porções",
    ing: ["3 conchas de feijão pronto", "1 xíc. de frango desfiado", "Alho, cebola"],
    passos: ["Bata o feijão com o caldo no liquidificador.", "Refogue alho e cebola, junte o feijão batido e o frango.", "Ferva 5 min."] },
  { id: "canja", nome: "Canja", cat: "sopa", tempo: 35, rende: "6 porções",
    ing: ["400 g de peito em cubos", "1/2 xíc. de arroz", "1 cenoura", "Cebola, alho, sal"],
    passos: ["Refogue o frango com cebola e alho.", "Junte água, arroz e cenoura picada.", "Cozinhe até o arroz abrir (25 min)."] },

  // LANCHES
  { id: "bolinho-banana", nome: "Bolinho de banana e aveia (air fryer)", cat: "lanche", tempo: 20, rende: "8 bolinhos",
    ing: ["2 bananas maduras", "1 ovo", "1 xíc. de aveia", "Canela"],
    passos: ["Amasse as bananas e misture tudo.", "Coloque em forminhas de silicone.", "Air fryer 170 °C por 12 min."],
    kids: "Amassar e colocar nas forminhas" },
  { id: "chips-batata-doce", nome: "Chips de batata-doce", cat: "lanche", tempo: 20, rende: "2 porções",
    ing: ["1 batata-doce em fatias bem finas", "Sal, páprica, fio de azeite"],
    passos: ["Seque as fatias.", "Tempere e espalhe sem sobrepor.", "Air fryer 180 °C por 12–15 min, sacudindo."] },
  { id: "espetinho-frutas", nome: "Espetinho de frutas", cat: "lanche", tempo: 10, rende: "4 espetinhos",
    ing: ["Banana, maçã, laranja em gomos", "Palitos de churrasco (sem ponta para os pequenos)"],
    passos: ["Corte as frutas em pedaços.", "Monte os espetinhos alternando cores."],
    kids: "Montar o arco-íris de frutas" },
  { id: "suco-beterraba", nome: "Suco de beterraba com laranja e gengibre", cat: "lanche", tempo: 5, rende: "2 copos",
    ing: ["1 beterraba pequena crua", "Suco de 3 laranjas", "1 pedaço de gengibre", "Água"],
    passos: ["Bata tudo.", "Coe se preferir. Tome 60–90 min antes da corrida."] },
  { id: "picole-iogurte", nome: "Picolé de iogurte com banana", cat: "lanche", tempo: 10, rende: "6 picolés",
    ing: ["1 pote de iogurte natural", "2 bananas", "Canela"],
    passos: ["Bata o iogurte com as bananas.", "Coloque em forminhas de picolé ou copinhos.", "Congele por 4 h."],
    kids: "Encher as forminhas" }
];

const CATEGORIAS = {
  cafe: "Café da manhã", frango: "Frango", carne: "Carne bovina", peixe: "Peixe",
  ovos: "Ovos", acomp: "Acompanhamentos", sopa: "Sopas", lanche: "Lanches"
};

// ---------- CARDÁPIO (2 semanas) ----------
// Cada item: texto e, quando houver, ids de receitas entre colchetes.
// Almoço seg–sex: adultos (crianças na escola). Jantar 20:20 = pós-treino.
const CARDAPIO = {
  1: {
    seg: { cafe: ["Tapioca com ovo + banana", "tapioca-ovo"], almoco: ["Arroz, feijão, frango desfiado e legumes assados", "frango-desfiado", "legumes-assados"], lanche: ["Iogurte com aveia e banana", "iogurte-aveia"], jantar: ["Omelete de abobrinha + salada de tomate e pepino + arroz", "omelete-abobrinha", "salada-tomate"] },
    ter: { cafe: ["Panqueca de aveia e banana", "panqueca-aveia"], almoco: ["Arroz, feijão, coxa na air fryer, quiabo refogado", "coxa-airfryer", "quiabo-refogado"], lanche: ["Bolinho de banana e aveia + laranja", "bolinho-banana"], jantar: ["Sopa de legumes com frango", "sopa-legumes"] },
    qua: { cafe: ["Cuscuz com ovo + laranja", "cuscuz-ovo"], almoco: ["Carne moída com abobrinha, arroz, feijão, salada", "carne-abobrinha", "salada-tomate"], lanche: ["Espetinho de frutas + ovo cozido", "espetinho-frutas"], jantar: ["Marmita rápida: frango desfiado, arroz, brócolis", "brocolis-alho"] },
    qui: { cafe: ["Ovos mexidos cremosos + batata-doce", "ovos-cremosos"], almoco: ["Merluza na air fryer, purê de batata, brócolis", "merluza-airfryer", "pure-batata", "brocolis-alho"], lanche: ["Iogurte + maçã", ""], jantar: ["Frango acebolado, arroz, feijão, cenoura", "frango-acebolado", "cenoura-cozida"] },
    sex: { cafe: ["Tapioca de frango com tomate", "tapioca-frango"], almoco: ["Frango grelhado, arroz, feijão, legumes", "frango-grelhado", "legumes-assados"], lanche: ["Chips de batata-doce + laranja", "chips-batata-doce"], jantar: ["Hambúrguer caseiro + batata-doce rústica + salada", "hamburguer", "batata-rustica", "salada-tomate"] },
    sab: { cafe: ["Café reforçado: cuscuz recheado + ovos + banana", "cuscuz-legumes"], almoco: ["Frango com quiabo, arroz, feijão", "frango-quiabo"], lanche: ["Picolé de iogurte · pré-treino: suco de beterraba", "picole-iogurte", "suco-beterraba"], jantar: ["Escondidinho de batata com frango + salada", "escondidinho", "salada-tomate"] },
    dom: { cafe: ["Crepioca + maçã", "crepioca"], almoco: ["Assadeira de frango com batata e cenoura + feijão", "assadeira-frango"], lanche: ["Bolinho de banana e aveia", "bolinho-banana"], jantar: ["Canja", "canja"] }
  },
  2: {
    seg: { cafe: ["Cuscuz com ovo + banana", "cuscuz-ovo"], almoco: ["Strogonoff de frango, arroz, brócolis", "strogonoff", "brocolis-alho"], lanche: ["Iogurte com aveia", "iogurte-aveia"], jantar: ["Omelete de forno com legumes + arroz e feijão", "omelete-forno"] },
    ter: { cafe: ["Tapioca com ovo + laranja", "tapioca-ovo"], almoco: ["Picadinho com cenoura e batata, arroz, feijão", "picadinho"], lanche: ["Espetinho de frutas", "espetinho-frutas"], jantar: ["Caldo de feijão com frango", "caldo-feijao"] },
    qua: { cafe: ["Panqueca de aveia e banana", "panqueca-aveia"], almoco: ["Merluza ao forno com tomate, arroz, abobrinha", "merluza-forno"], lanche: ["Ovo cozido + maçã", "ovo-cozido"], jantar: ["Marmita rápida: frango xadrez + arroz", "frango-xadrez"] },
    qui: { cafe: ["Ovos mexidos + cuscuz", "ovos-cremosos"], almoco: ["Frango ensopado com batata, arroz, salada", "frango-ensopado", "salada-tomate"], lanche: ["Bolinho de banana e aveia", "bolinho-banana"], jantar: ["Almôndegas ao molho + purê de batata-doce + brócolis", "almondegas", "pure-batata-doce"] },
    sex: { cafe: ["Crepioca com frango", "crepioca"], almoco: ["Frango grelhado, purê de batata-doce, quiabo", "frango-grelhado", "pure-batata-doce", "quiabo-refogado"], lanche: ["Iogurte + banana", ""], jantar: ["Nuggets caseiros + batata-doce rústica + salada (noite das crianças)", "nuggets", "batata-rustica", "salada-tomate"] },
    sab: { cafe: ["Café reforçado: tapioca, ovos, banana", "tapioca-ovo"], almoco: ["Abobrinha recheada com carne, arroz, feijão", "abobrinha-recheada"], lanche: ["Chips de batata-doce · pré-treino: suco de beterraba", "chips-batata-doce", "suco-beterraba"], jantar: ["Iscas de peixe com aveia + purê + salada", "iscas-peixe", "pure-batata", "salada-tomate"] },
    dom: { cafe: ["Iogurte com aveia + ovos", "iogurte-aveia"], almoco: ["Prato escolhido pelas crianças (ver aba Crianças)", ""], lanche: ["Picolé de iogurte", "picole-iogurte"], jantar: ["Peixe no papelote com legumes + arroz", "peixe-papelote"] }
  }
};

const PRE_TREINO = "17:30 · banana com aveia, tapioca com ovo ou cuscuz (porção pequena).";
const PORCOES = [
  ["Pai", "Prato cheio: 1/2 legumes, 1/4 proteína (palma), 1/4 carboidrato (5–6 col.). Mais carboidrato em dia de perna e sábado."],
  ["Mãe", "Comece pela proteína. Porções menores, guiadas pelo apetite e pelo médico. Coma devagar."],
  ["Criança 9 anos", "Cerca de 2/3 do prato de um adulto. Sem restrição: repetir se tiver fome."],
  ["Criança 5 anos", "Cerca de metade do prato de um adulto. Legume em pedaços pequenos."]
];

// ---------- COMPRAS (14 dias · ~R$ 598) ----------
const COMPRAS = [
  ["Proteínas", "Filé de peito de frango", "4 kg", 80],
  ["Proteínas", "Coxa e sobrecoxa", "3 kg", 39],
  ["Proteínas", "Ovos", "90 un. (3 bandejas)", 66],
  ["Proteínas", "Carne moída (patinho ou acém)", "1,2 kg", 43],
  ["Proteínas", "Filé de merluza congelado", "1,5 kg", 45],
  ["Grãos e tubérculos", "Arroz", "3 kg", 18],
  ["Grãos e tubérculos", "Feijão (carioca ou preto)", "2 kg", 16],
  ["Grãos e tubérculos", "Aveia em flocos", "500 g", 9],
  ["Grãos e tubérculos", "Flocão de milho", "3 pacotes de 500 g", 10],
  ["Grãos e tubérculos", "Goma de tapioca", "1,5 kg", 18],
  ["Grãos e tubérculos", "Batata-doce", "3 kg", 18],
  ["Grãos e tubérculos", "Batata inglesa", "3 kg", 18],
  ["Legumes", "Brócolis", "4 maços", 24],
  ["Legumes", "Cenoura", "2 kg", 10],
  ["Legumes", "Abobrinha", "2 kg", 12],
  ["Legumes", "Tomate", "2 kg", 14],
  ["Legumes", "Quiabo", "1 kg", 11],
  ["Legumes", "Pepino", "500 g", 3],
  ["Legumes", "Cebola", "1,5 kg", 9],
  ["Legumes", "Alho", "200 g", 6],
  ["Legumes", "Beterraba", "1 kg", 6],
  ["Frutas", "Banana-prata", "4 dúzias", 32],
  ["Frutas", "Laranja", "3 kg", 12],
  ["Frutas", "Maçã", "1,5 kg", 15],
  ["Outros", "Leite integral (crianças)", "5 L", 30],
  ["Outros", "Iogurte natural", "2 potes de 900 g", 28],
  ["Outros", "Limão (shot e temperos)", "1 kg", 6]
];
const ORCAMENTO = 600;

const PREPARO = {
  domingo: [
    "Feijão na pressão (metade do pacote) e porcionar.",
    "Arroz para 3 dias.",
    "Frango desfiado na pressão (1 kg).",
    "Assadeira de legumes no forno.",
    "10 ovos cozidos.",
    "Lavar e picar tomate, pepino e cebola."
  ],
  terca: [
    "Arroz para mais 3 dias.",
    "Segunda proteína (carne moída ou frango em cubos).",
    "Nova leva de legumes.",
    "Massa de bolinho de banana para os lanches."
  ],
  criancas: [
    "5 anos: lavar legumes, quebrar ovos, separar frutas dos lanches.",
    "9 anos: medir arroz e feijão, montar tapiocas (adulto no fogão), etiquetar marmitas."
  ]
};

// ---------- SHOT MATINAL E CHÁS (da conversa com o Gemini) ----------
const SHOT = {
  base: [
    ["Limão", "1/2 limão espremido", "Vitamina C e sabor"],
    ["Cúrcuma (açafrão-da-terra)", "1/2 col. (chá)", "Anti-inflamatório (curcumina)"],
    ["Canela em pó", "1/4 col. (chá)", "Ajuda na resposta à glicose"],
    ["Gengibre", "1 cm ralado ou 1/4 col. (chá) em pó", "Anti-inflamatório"],
    ["Feno-grego", "1/2 col. (chá) em pó", "Vitalidade"],
    ["Pimenta-do-reino moída na hora", "1 pitada", "Aumenta a absorção da cúrcuma"],
    ["Azeite extra virgem", "1 col. (chá)", "A cúrcuma é absorvida com gordura"],
    ["Própolis verde (se tiver)", "15 a 20 gotas", "Opcional — fora do orçamento atual"],
    ["Água morna", "50 a 100 ml", "Para diluir"]
  ],
  preparo: [
    "Esprema o limão num copo pequeno.",
    "Junte as especiarias e o azeite.",
    "Complete com a água morna (não quente) e mexa bem.",
    "Tome às 6:00, em jejum. O café da manhã em família vem às 6:20."
  ],
  rotacao: {
    seg: ["Foco e energia", "Base + 1 col. (chá) rasa de cacau 100% no café da manhã"],
    ter: ["Digestão e imunidade", "Base + 1 pitada de cardamomo"],
    qua: ["Foco e energia", "Base + cacau 100% no café da manhã"],
    qui: ["Digestão e imunidade", "Base + 1 pitada de cardamomo"],
    sex: ["Recuperação", "Base + meia pitada de cravo-da-índia em pó"],
    sab: ["Base", "Só a base (dia de mais treino: capriche na água)"],
    dom: ["Descanso do paladar", "Base, ou pule o shot no domingo"]
  },
  especiarias: [
    ["Cardamomo", "Digestão e frescor. Uma pitada leve; sabor forte."],
    ["Cravo-da-índia", "Antioxidante. Meia pitada; o sabor domina."],
    ["Cacau 100%", "Energia e foco. 1 col. (chá) rasa na aveia, iogurte ou vitamina."],
    ["Coentro em pó", "Digestão. Uma pitada em sopas e caldos à noite."],
    ["Noz-moscada", "Uma pitada mínima no purê ou à noite."]
  ],
  chas: [
    ["Manhã (até 15:00)", "Chá verde", "Energia e foco. Água a 80 °C, 3 a 5 min. Tem cafeína: nunca depois das 15:00."],
    ["Tarde", "Hibisco com gengibre ou hortelã", "Hidratação e refrescância. Pode ser gelado."],
    ["Noite (21:20)", "Passiflora + camomila + erva-doce", "Relaxa e ajuda o sono. Abafar 5 a 8 min."]
  ],
  cuidados: [
    "O shot, o chá verde e o hibisco são só para os adultos. Crianças: no máximo um chá fraco de camomila ou erva-doce.",
    "Mãe: feno-grego e canela também mexem com a glicose — o médico que acompanha a medicação precisa saber do shot.",
    "Azia ou estômago sensível: reduza o gengibre e a pimenta, ou tome o shot junto com o café da manhã.",
    "Shot não substitui refeição nem remédio."
  ],
  compras: [
    "Cúrcuma em pó", "Canela em pó", "Gengibre (raiz ou pó)", "Feno-grego",
    "Pimenta-do-reino em grãos + moedor", "Cardamomo", "Cravo-da-índia", "Cacau 100% em pó",
    "Chá verde", "Hibisco", "Passiflora", "Camomila", "Erva-doce ou capim-limão",
    "Própolis verde (opcional)"
  ]
};

// ---------- SUPLEMENTOS (já comprados, fora do orçamento) ----------
const SUPLEMENTOS = [
  ["Whey protein", "30 g", "6:20, no café da manhã", "~24 g de proteína"],
  ["Creatina", "3 a 5 g", "6:20, no café da manhã", "Beber +500 ml de água no dia"],
  ["Ômega-3", "2 cápsulas", "Antes do almoço", "EPA/DHA conforme o rótulo"]
];

// ---------- ORIENTAÇÕES ----------
const ORIENTACOES = [
  { t: "O prato", d: "Metade legumes, um quarto proteína (palma da mão), um quarto carboidrato. A família come os mesmos pratos; muda a porção." },
  { t: "Intestino", d: "Fibras leves todo dia (legumes cozidos, quiabo, abobrinha, banana, laranja com bagaço, maçã com casca, aveia). Feijão de molho 8 h. Água ao longo do dia." },
  { t: "Água", d: "Pai ~2,8 L, mãe ~3,5 L, crianças 1 a 1,5 L. Mais em dia de treino e de creatina." },
  { t: "Treino e comida", d: "Pré-treino às 17:30 (pequeno). Jantar das 20:20 é o pós-treino: proteína + carboidrato. Dia de perna e sábado: mais carboidrato." },
  { t: "Mãe — medicação para apetite", d: "Comece pela proteína, faça porções menores e mais vezes, evite fritura e gordura (enjoo), beba água. Avise o médico se comer pouco por vários dias, se tiver tontura ou se começar a correr mais." },
  { t: "Crianças", d: "Mesma comida, sem restrição de calorias. Leite ou iogurte 1 a 2 vezes ao dia. Nada de shot, chá verde ou suplementos." },
  { t: "Sono", d: "Todos dormem às 22:00. Telas desligadas às 21:30. Chá verde só até 15:00." },
  { t: "Sinais para parar", d: "Dor no peito, falta de ar fora do normal, tontura, dor articular aguda. Procure atendimento." }
];

// ---------- CRIANÇAS ----------
const MISSOES = [
  ["fruta", "🍌", "Comi uma fruta"],
  ["legume", "🥦", "Provei um legume"],
  ["agua", "💧", "Bebi água (4 copos)"],
  ["cozinha", "👩‍🍳", "Ajudei na cozinha"],
  ["brincar", "⚽", "Brinquei ao ar livre"],
  ["dentes", "🪥", "Escovei os dentes"],
  ["dormir", "🌙", "Dormi na hora"]
];

const ALIMENTOS_JOGO = [
  // [emoji, nome, grupo: legume|proteina|carbo|fruta, semaforo: verde|amarelo|vermelho]
  ["🥦", "Brócolis", "legume", "verde"],
  ["🥕", "Cenoura", "legume", "verde"],
  ["🍅", "Tomate", "legume", "verde"],
  ["🥒", "Pepino", "legume", "verde"],
  ["🫑", "Pimentão", "legume", "verde"],
  ["🍗", "Frango", "proteina", "verde"],
  ["🥚", "Ovo", "proteina", "verde"],
  ["🐟", "Peixe", "proteina", "verde"],
  ["🫘", "Feijão", "proteina", "verde"],
  ["🍚", "Arroz", "carbo", "verde"],
  ["🍠", "Batata-doce", "carbo", "verde"],
  ["🥔", "Batata", "carbo", "verde"],
  ["🍌", "Banana", "fruta", "verde"],
  ["🍎", "Maçã", "fruta", "verde"],
  ["🍊", "Laranja", "fruta", "verde"],
  ["🍞", "Pão", "carbo", "amarelo"],
  ["🧀", "Queijo", "proteina", "amarelo"],
  ["🍕", "Pizza", "carbo", "amarelo"],
  ["🍟", "Batata frita", "carbo", "vermelho"],
  ["🍬", "Bala", "doce", "vermelho"],
  ["🥤", "Refrigerante", "doce", "vermelho"],
  ["🍩", "Rosquinha", "doce", "vermelho"],
  ["🍫", "Chocolate", "doce", "amarelo"],
  ["🧃", "Suco de caixinha", "doce", "amarelo"]
];

const QUIZ = [
  { p: "Qual alimento ajuda os músculos a crescerem depois de brincar?", o: ["Ovo", "Bala", "Refrigerante"], c: 0, e: "O ovo tem proteína, que constrói os músculos." },
  { p: "O que dá energia para correr e brincar?", o: ["Arroz e batata-doce", "Só água", "Chiclete"], c: 0, e: "Arroz e batata-doce têm carboidrato, o combustível do corpo." },
  { p: "Quantos copos de água é bom beber por dia?", o: ["1 copo", "4 a 6 copos", "Nenhum"], c: 1, e: "Água o dia todo ajuda o corpo e o intestino." },
  { p: "Metade do prato deve ser de…", o: ["Doces", "Legumes e verduras", "Batata frita"], c: 1, e: "Metade do prato colorido de legumes!" },
  { p: "Qual fruta tem casca que a gente descasca?", o: ["Banana", "Uva", "Morango"], c: 0, e: "A banana tem casca grossa e protege a fruta." },
  { p: "O que acontece quando a gente dorme bem?", o: ["O corpo descansa e cresce", "Nada", "Fica com fome de doce"], c: 0, e: "É dormindo que o corpo cresce e se recupera." },
  { p: "O brócolis parece uma…", o: ["Arvorezinha", "Bola", "Estrela"], c: 0, e: "E tem ferro e vitaminas para ficar forte." },
  { p: "Qual destes é um alimento 'de vez em quando'?", o: ["Maçã", "Refrigerante", "Feijão"], c: 1, e: "Refrigerante tem muito açúcar: só de vez em quando." },
  { p: "De onde vem o ovo?", o: ["Da galinha", "Da vaca", "Da árvore"], c: 0, e: "A galinha bota o ovo!" },
  { p: "A cenoura é boa para…", o: ["Os olhos", "Ficar com sono", "Nada"], c: 0, e: "A cenoura tem vitamina A, amiga da visão." },
  { p: "Antes de comer, a gente deve…", o: ["Lavar as mãos", "Pular", "Ver TV"], c: 0, e: "Mãos limpas afastam os germes." },
  { p: "Qual destes tem fibra e ajuda o intestino?", o: ["Aveia", "Bala", "Salgadinho"], c: 0, e: "A aveia tem fibras que ajudam a fazer cocô direitinho." }
];

const MEDALHAS = [
  [10, "🥉", "Bronze"], [30, "🥈", "Prata"], [60, "🥇", "Ouro"], [100, "🏆", "Campeão da Saúde"]
];
