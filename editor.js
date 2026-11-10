// ============================================================
// FAMÍLIA SAUDÁVEL — edição dentro da plataforma
// Tudo que a família altera fica salvo junto com os dados (chaves "ed:...").
// ============================================================
(() => {
  const { Store, ACOES, TELAS, esc, toast, abrirModal, fecharModal, N, ui, aoCarregar, DIA_NOME, diaKey } = App;
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const DADOS = { cardapio: CARDAPIO, treinos: TREINOS, receitas: RECEITAS, compras: COMPRAS, rotina: ROTINA,
    plano: PLANO_CORRIDA, missoes: MISSOES, quiz: QUIZ, atividades: ATIVIDADES, recompensas: RECOMPENSAS };
  const ROTULOS = { cardapio: "Cardápio", treinos: "Treinos", receitas: "Receitas", compras: "Lista de compras", rotina: "Rotina do dia",
    plano: "Plano de corrida", missoes: "Missões das crianças", quiz: "Perguntas do quiz", atividades: "Atividades em família", recompensas: "Prêmios" };
  const PADRAO = clone(DADOS);

  function substituir(alvo, novo) {
    if (Array.isArray(alvo)) { alvo.length = 0; novo.forEach((x) => alvo.push(x)); }
    else { Object.keys(alvo).forEach((k) => delete alvo[k]); Object.assign(alvo, novo); }
  }
  function aplicar() {
    Object.keys(DADOS).forEach((k) => {
      const e = Store.get("ed:" + k, null);
      const ok = e && typeof e === "object" && Array.isArray(e) === Array.isArray(PADRAO[k]);
      substituir(DADOS[k], clone(ok ? e : PADRAO[k]));
    });
  }
  aoCarregar.push(aplicar);
  const gravar = (k) => Store.set("ed:" + k, clone(DADOS[k]));

  // ---------- editor genérico de listas ----------
  let ctx = null;
  function lista(cfg) { ctx = cfg; desenhar(); }
  function objeto(cfg) { ctx = { ...cfg, unico: true, obter: () => [cfg.alvo] }; formItem(0); }
  function desenhar() {
    const arr = ctx.obter();
    abrirModal(`
      <h2>${esc(ctx.titulo)}</h2>
      ${ctx.ajuda ? `<p class="mudo">${esc(ctx.ajuda)}</p>` : ""}
      <div class="ed-lista">${arr.map((it, i) => `
        <div class="ed-linha"><span class="ed-res">${esc(ctx.resumo(it))}</span>
          <button class="btn pequeno" data-acao="ed-item" data-i="${i}" aria-label="Editar">✏️</button>
          <button class="btn pequeno" data-acao="ed-mover" data-i="${i}" data-s="-1" aria-label="Subir">↑</button>
          <button class="btn pequeno" data-acao="ed-mover" data-i="${i}" data-s="1" aria-label="Descer">↓</button>
          <button class="btn pequeno perigo" data-acao="ed-apagar" data-i="${i}" aria-label="Apagar">🗑</button>
        </div>`).join("") || `<p class="mudo">Lista vazia.</p>`}</div>
      <button class="btn primario largo" data-acao="ed-item" data-i="-1">+ Adicionar</button>
      <div class="chips" style="margin-top:.8rem">
        <button class="btn pequeno" data-acao="ed-concluir">✓ Concluir</button>
        <button class="btn pequeno perigo" data-acao="ed-restaurar" data-k="${ctx.k}">Restaurar o padrão de ${esc(ROTULOS[ctx.k])}</button>
      </div>`);
  }
  const valor = (c, it) => (c.get ? c.get(it) : it[c.k]);
  function formItem(i) {
    const arr = ctx.obter(); const it = i >= 0 ? arr[i] : ctx.novo();
    const campos = ctx.campos.map((c, j) => {
      const v = valor(c, it) ?? ""; const nm = "c" + j;
      if (c.tipo === "area") return `<label>${esc(c.rot)}<textarea name="${nm}" rows="5">${esc(v)}</textarea></label>`;
      if (c.tipo === "sel") return `<label>${esc(c.rot)}<select name="${nm}">${c.op().map(([a, b]) => `<option value="${esc(a)}" ${String(a) === String(v) ? "selected" : ""}>${esc(b)}</option>`).join("")}</select></label>`;
      return `<label>${esc(c.rot)}<input name="${nm}" ${c.tipo === "num" ? 'type="number" step="any" inputmode="decimal"' : 'type="text"'} value="${esc(v)}" placeholder="${esc(c.ph || "")}"></label>`;
    }).join("");
    abrirModal(`
      <h2>${ctx.unico ? esc(ctx.titulo) : (i >= 0 ? "Editar" : "Adicionar")}</h2>
      <form data-acao="ed-salvar" data-i="${i}">${campos}
        <button class="btn primario largo">Salvar</button>
        <button type="button" class="btn largo" style="margin-top:.5rem" data-acao="ed-voltar">${ctx.unico ? "Cancelar" : "Voltar para a lista"}</button>
      </form>`);
  }
  ACOES["ed-item"] = (el) => formItem(Number(el.dataset.i));
  ACOES["ed-voltar"] = () => (ctx.unico ? fecharModal() : desenhar());
  ACOES["ed-salvar"] = (form) => {
    const arr = ctx.obter(); const i = Number(form.dataset.i);
    const it = i >= 0 ? arr[i] : ctx.novo();
    const fd = new FormData(form);
    ctx.campos.forEach((c, j) => {
      let v = fd.get("c" + j); v = v == null ? "" : String(v).trim();
      if (c.tipo === "num") v = v === "" ? "" : Number(v);
      if (c.set) c.set(it, v); else it[c.k] = v;
    });
    if (i < 0) arr.push(it);
    if (ctx.fim) ctx.fim(it);
    gravar(ctx.k); toast("Salvo");
    if (ctx.unico) { fecharModal(); App.render(); } else desenhar();
  };
  ACOES["ed-mover"] = (el) => {
    const arr = ctx.obter(); const i = Number(el.dataset.i), j = i + Number(el.dataset.s);
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]]; gravar(ctx.k); desenhar();
  };
  ACOES["ed-apagar"] = (el) => {
    if (!confirm("Apagar este item?")) return;
    ctx.obter().splice(Number(el.dataset.i), 1); gravar(ctx.k); desenhar();
  };
  ACOES["ed-concluir"] = () => { fecharModal(); App.render(); };
  ACOES["ed-restaurar"] = (el) => {
    const k = el.dataset.k;
    if (!confirm(`Voltar "${ROTULOS[k]}" ao plano original? As alterações de vocês nessa parte serão apagadas.`)) return;
    Store.set("ed:" + k, null); aplicar(); fecharModal(); toast("Padrão restaurado"); App.render();
  };

  // ---------- rotina ----------
  const TIPOS_ROTINA = { semana: "Seg, ter, qui e sex", quarta: "Quarta (balé)", sabado: "Sábado", domingo: "Domingo" };
  function edRotina(tipo) {
    lista({ k: "rotina", titulo: "Rotina · " + TIPOS_ROTINA[tipo], obter: () => ROTINA[tipo],
      resumo: (it) => it.h + " · " + it.txt, novo: () => ({ h: "", quem: "Todos", txt: "" }),
      campos: [{ k: "h", rot: "Horário", ph: "6:20" }, { k: "quem", rot: "Quem", ph: "Todos, Adultos, Crianças…" }, { k: "txt", rot: "O que acontece" }] });
  }
  ACOES["ed-rotina"] = (el) => {
    const d = diaKey();
    edRotina(el.dataset.tipo || (d === "qua" ? "quarta" : d === "sab" ? "sabado" : d === "dom" ? "domingo" : "semana"));
  };

  // ---------- cardápio ----------
  const REFEICAO = { cafe: "Café da manhã", almoco: "Almoço", lanche: "Lanche", jantar: "Jantar" };
  const opReceitas = () => [["", "— nenhuma —"], ...RECEITAS.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map((x) => [x.id, x.nome])];
  ACOES["ed-refeicao"] = (el) => {
    const { s, d, r } = el.dataset; const alvo = CARDAPIO[s][d];
    objeto({ k: "cardapio", titulo: `${DIA_NOME[d]} · ${REFEICAO[r]} (semana ${s})`, alvo,
      campos: [{ rot: "O que vai ter", get: (o) => o[r][0], set: (o, v) => { o[r][0] = v; } },
        ...[1, 2, 3].map((n) => ({ rot: `Receita ${n} (opcional)`, tipo: "sel", op: opReceitas, get: (o) => o[r][n] || "", set: (o, v) => { o[r][n] = v; } }))],
      fim: (o) => { o[r] = [o[r][0], ...o[r].slice(1).filter(Boolean)]; } });
  };

  // ---------- receitas ----------
  const cfgReceitas = () => ({ k: "receitas", titulo: "Receitas", obter: () => RECEITAS, resumo: (r) => r.nome,
    novo: () => ({ id: "r" + Date.now().toString(36), nome: "", cat: "frango", tempo: 20, rende: "4 porções", ing: [], passos: [], dica: "", kids: "" }),
    campos: [{ k: "nome", rot: "Nome da receita" },
      { k: "cat", rot: "Categoria", tipo: "sel", op: () => Object.entries(CATEGORIAS) },
      { k: "tempo", rot: "Tempo (minutos)", tipo: "num" }, { k: "rende", rot: "Rende", ph: "4 porções" },
      { rot: "Ingredientes (um por linha)", tipo: "area", get: (r) => (r.ing || []).join("\n"), set: (r, v) => { r.ing = v.split("\n").map((x) => x.trim()).filter(Boolean); } },
      { rot: "Modo de preparo (um passo por linha)", tipo: "area", get: (r) => (r.passos || []).join("\n"), set: (r, v) => { r.passos = v.split("\n").map((x) => x.trim()).filter(Boolean); } },
      { k: "dica", rot: "Dica (opcional)" }, { k: "kids", rot: "Como as crianças ajudam (opcional)" }] });
  ACOES["ed-receitas"] = () => lista(cfgReceitas());
  ACOES["ed-receita"] = (el) => { ctx = cfgReceitas(); formItem(RECEITAS.findIndex((r) => r.id === el.dataset.id)); };

  // ---------- compras ----------
  ACOES["ed-compras"] = () => lista({ k: "compras", titulo: "Lista de compras", obter: () => COMPRAS,
    resumo: (c) => `${c[1]} · ${c[2]} · R$ ${c[3]}`, novo: () => ["Outros", "", "", 0],
    campos: [{ k: 1, rot: "Item" }, { k: 2, rot: "Quantidade", ph: "2 kg" }, { k: 3, rot: "Preço estimado (R$)", tipo: "num" },
      { k: 0, rot: "Grupo", ph: "Proteínas, Legumes, Frutas, Outros…" }] });

  // ---------- treinos ----------
  ACOES["ed-treino-dia"] = (el) => {
    const d = el.dataset.d;
    const cor = (k, rot) => ({ rot, get: (t) => t.corrida[k], set: (t, v) => { t.corrida[k] = v || (k === "s1" || k === "s2" ? "—" : ""); } });
    objeto({ k: "treinos", titulo: "Treino de " + DIA_NOME[d], alvo: TREINOS[d],
      campos: [{ k: "titulo", rot: "Título do treino" }, { k: "equip", rot: "Equipamentos" }, { k: "nota", rot: "Observação (opcional)" },
        cor("tipo", "Corrida: tipo"), cor("s1", "Corrida na semana 1 (ou —)"), cor("s2", "Corrida na semana 2 (ou —)"), cor("obs", "Corrida: observação")] });
  };
  ACOES["ed-blocos"] = (el) => {
    const d = el.dataset.d;
    lista({ k: "treinos", titulo: "Blocos · " + DIA_NOME[d], obter: () => TREINOS[d].blocos,
      ajuda: "Blocos são as partes do treino: aquecimento, musculação, core…",
      resumo: (b) => `${b.nome} (${b.itens.length} exercícios)`, novo: () => ({ nome: "Novo bloco", itens: [] }),
      campos: [{ k: "nome", rot: "Nome do bloco" }] });
  };
  const opFiguras = () => [["", "— sem figura —"], ...Object.entries(FIG_NOMES).sort((a, b) => a[1].localeCompare(b[1]))];
  ACOES["ed-exercicios"] = (el) => {
    const d = el.dataset.d, b = Number(el.dataset.b);
    lista({ k: "treinos", titulo: `${DIA_NOME[d]} · ${TREINOS[d].blocos[b].nome}`, obter: () => TREINOS[d].blocos[b].itens,
      resumo: (it) => `${it[0]} · ${it[1]}`, novo: () => ["", "3 x 12", "3 x 12", "", "", "", ""],
      campos: [{ k: 0, rot: "Exercício" }, { k: 6, rot: "Como fazer (opcional)" },
        { k: 1, rot: "Séries na semana 1", ph: "3 x 12" }, { k: 2, rot: "Séries na semana 2", ph: "3 x 15" },
        { k: 4, rot: "Carga · " + N.pai }, { k: 5, rot: "Carga · " + N.mae },
        { k: 3, rot: "Figura", tipo: "sel", op: opFiguras }] });
  };

  // ---------- corrida ----------
  ACOES["ed-plano"] = () => lista({ k: "plano", titulo: "Plano de corrida", obter: () => PLANO_CORRIDA,
    resumo: (p) => `Semana ${p.sem}: ${p.pai}`, novo: () => ({ sem: String(PLANO_CORRIDA.length + 1), pai: "", mae: "" }),
    campos: [{ k: "sem", rot: "Semana" }, { k: "pai", rot: N.pai }, { k: "mae", rot: N.mae }] });

  // ---------- crianças ----------
  const idNovo = (p) => p + Date.now().toString(36);
  ACOES["ed-missoes"] = () => lista({ k: "missoes", titulo: "Missões do dia", obter: () => MISSOES,
    resumo: (m) => `${m[1]} ${m[2]}`, novo: () => [idNovo("m"), "⭐", ""],
    campos: [{ k: 1, rot: "Emoji", ph: "🍌" }, { k: 2, rot: "Missão (frase curta)", ph: "Comi uma fruta" }] });
  ACOES["ed-quiz"] = () => lista({ k: "quiz", titulo: "Perguntas do quiz", obter: () => QUIZ,
    resumo: (q) => q.p, novo: () => ({ p: "", o: ["", "", ""], c: 0, e: "" }),
    campos: [{ k: "p", rot: "Pergunta" },
      ...[0, 1, 2].map((n) => ({ rot: `Resposta ${n + 1}`, get: (q) => q.o[n], set: (q, v) => { q.o[n] = v; } })),
      { rot: "Qual é a certa?", tipo: "sel", op: () => [[0, "Resposta 1"], [1, "Resposta 2"], [2, "Resposta 3"]], get: (q) => q.c, set: (q, v) => { q.c = Number(v); } },
      { k: "e", rot: "Explicação (aparece depois de responder)" }] });
  const TIPOS_ATIV = ["Brincadeira ativa", "Cozinha", "Desafio", "Calma"];
  ACOES["ed-atividades"] = () => lista({ k: "atividades", titulo: "Atividades em família", obter: () => ATIVIDADES,
    resumo: (a) => `${a.em} ${a.nome} · ${a.tipo}`, novo: () => ({ id: idNovo("a"), em: "🎲", nome: "", tipo: TIPOS_ATIV[0], desc: "" }),
    campos: [{ k: "em", rot: "Emoji" }, { k: "nome", rot: "Nome da atividade" },
      { k: "tipo", rot: "Tipo", tipo: "sel", op: () => TIPOS_ATIV.map((t) => [t, t]) }, { k: "desc", rot: "Como é" }] });
  ACOES["ed-recompensas"] = () => lista({ k: "recompensas", titulo: "Prêmios", obter: () => RECOMPENSAS,
    ajuda: "Prefiram prêmios que não sejam comida: passeio, brincadeira, escolher o filme.",
    resumo: (r) => `${r.estrelas} ⭐ · ${r.premio}`, novo: () => ({ id: idNovo("p"), estrelas: 20, premio: "" }),
    campos: [{ k: "estrelas", rot: "Quantas estrelas", tipo: "num" }, { k: "premio", rot: "Prêmio" }] });

  // ---------- tela Ajustes ----------
  TELAS.ajustes = () => {
    const b = (acao, txt, attrs = "") => `<button class="btn" data-acao="${acao}" ${attrs}>${txt}</button>`;
    const alterados = Object.keys(DADOS).filter((k) => Store.get("ed:" + k, null));
    return `
    <section class="cartao destaque">
      <h2>✏️ Modo edição</h2>
      <p>Com o modo edição ligado, aparecem botões <strong>✏️</strong> em cada parte da plataforma: refeições do cardápio, exercícios, rotina, lista de compras e área das crianças.</p>
      <button class="btn ${ui.editar ? "" : "primario"} largo" data-acao="modo-editar">${ui.editar ? "Desligar o modo edição" : "Ligar o modo edição"}</button>
      <p class="mudo" style="margin-top:.6rem">Desliguem antes de entregar o aparelho para as crianças.</p>
    </section>
    <div class="grade">
      <section class="cartao"><h3>👨‍👩‍👦‍👦 Família</h3><div class="pilha">${b("perfis", "Perfis, nomes e objetivos")}</div></section>
      <section class="cartao"><h3>🕒 Rotina do dia</h3><div class="pilha">${Object.entries(TIPOS_ROTINA).map(([k, v]) => b("ed-rotina", v, `data-tipo="${k}"`)).join("")}</div></section>
      <section class="cartao"><h3>🍽️ Alimentação</h3><div class="pilha">
        ${b("ir", "Cardápio (toque em ✏️ na refeição)", 'data-aba="cardapio"')}${b("ed-receitas", "Receitas: criar, editar, apagar")}${b("ed-compras", "Lista de compras")}</div></section>
      <section class="cartao"><h3>🏃 Treinos e corridas</h3><div class="pilha">
        ${b("ir", "Treinos (toque em ✏️ no dia)", 'data-aba="treinos"')}${b("ed-plano", "Plano de corrida")}${b("ir", "Provas e inscrições", 'data-aba="provas"')}</div></section>
      <section class="cartao"><h3>⭐ Crianças</h3><div class="pilha">
        ${b("ed-missoes", "Missões do dia")}${b("ed-atividades", "Atividades em família")}${b("ed-recompensas", "Prêmios")}${b("ed-quiz", "Perguntas do quiz")}</div></section>
      <section class="cartao"><h3>↩️ Voltar ao plano original</h3>
        ${alterados.length ? `<p class="mudo">Partes que vocês já alteraram:</p><div class="pilha">${alterados.map((k) => `<button class="btn perigo" data-acao="ed-restaurar" data-k="${k}">Restaurar ${esc(ROTULOS[k])}</button>`).join("")}</div>`
          : `<p class="mudo">Nada foi alterado ainda. Tudo está como no plano original.</p>`}</section>
      <section class="cartao"><h3>🔒 Dados</h3>
        <p>${Store.user ? "Tudo fica salvo na nuvem, com o login da família, e aparece em todos os aparelhos." : "Modo local: tudo fica salvo só neste aparelho."}</p>
        <p class="mudo">O shot, os chás e as orientações são fixos por enquanto.</p></section>
    </div>`;
  };
  ACOES.perfis = ACOES.perfis || (() => App.abrirPerfis());
})();
