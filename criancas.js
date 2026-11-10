// ============================================================
// FAMÍLIA SAUDÁVEL — área das crianças (missões e joguinhos)
// ============================================================
(() => {
  const { Store, ACOES, TELAS, esc, iso, toast, falar, N } = App;
  const AVATAR = { c1: "🦁", c2: "🐻" };
  const LIMITE_JOGO = 10; // estrelas de jogos por dia, por criança
  let kid = "c1";
  let jogo = null;

  const pequeno = () => (CONFIG.IDADES[kid] || 9) < 7;
  const embaralhar = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

  function estrelasTotal(k) {
    let t = 0;
    Object.keys(Store.cache).forEach((key) => {
      if (key.startsWith("missoes:" + k + ":")) t += (Store.cache[key] || []).filter((id) => MISSOES.some((m) => m[0] === id)).length;
      if (key.startsWith("ativ:" + k + ":")) t += (Store.cache[key] || []).length * 2;
      if (key.startsWith("arco:" + k + ":")) t += (Store.cache[key] || []).length;
    });
    const j = Store.get("jogos:" + k, {});
    Object.values(j).forEach((v) => { t += v; });
    return t;
  }
  function ganharEstrela() {
    const k = "jogos:" + kid, j = Store.get(k, {}), hoje = iso();
    if ((j[hoje] || 0) >= LIMITE_JOGO) return false;
    j[hoje] = (j[hoje] || 0) + 1; Store.set(k, { ...j });
    atualizarPlacar(); return true;
  }
  function atualizarPlacar() {
    const el = document.getElementById("placar"); if (el) el.textContent = estrelasTotal(kid);
  }

  function extras() {
    const hoje = iso(); const arco = Store.get("arco:" + kid + ":" + hoje, []); const fz = Store.get("ativ:" + kid + ":" + hoje, []);
    const tipos = [...new Set(ATIVIDADES.map((a) => a.tipo))];
    return `
      <section class="cartao">
        <h2>🌈 Arco-íris no prato <button class="falar" data-acao="falar" data-t="Arco-íris no prato. Toque em cada cor que você comeu hoje.">🔊</button></h2>
        <p class="mudo">Toque em cada cor que você comeu hoje. Cada cor vale ⭐.</p>
        <div class="arco">${ARCO_IRIS.map(([id, cor, nome, ex]) => `<button class="arco-cor ${arco.includes(id) ? "feita" : ""}" style="--c:${cor}" data-acao="arco" data-id="${id}" data-t="${esc(nome)}"><b>${esc(nome)}</b><small>${esc(ex)}</small></button>`).join("")}</div>
        <div class="festa">${arco.length === ARCO_IRIS.length ? "🌈 Arco-íris completo!" : ""}</div>
      </section>
      <section class="cartao">
        <h2>🎲 Atividades em família ${App.edBtn("ed-atividades")}</h2>
        <p class="mudo">Fez a atividade? Toque em "Fiz!" e ganhe ⭐⭐.</p>
        ${tipos.map((t) => `<h3 style="margin-top:.7rem">${esc(t)}</h3><div class="ativs">${ATIVIDADES.filter((a) => a.tipo === t).map((a) => { const ok = fz.includes(a.id); return `
          <div class="ativ ${ok ? "feita" : ""}"><span class="em">${esc(a.em)}</span><div class="ativ-txt"><b>${esc(a.nome)}</b><small>${esc(a.desc)}</small></div>
          <button class="btn pequeno ${ok ? "" : "primario"}" data-acao="ativ" data-id="${a.id}" data-t="${esc(a.nome)}">${ok ? "✅ Feita" : "Fiz!"}</button></div>`; }).join("")}</div>`).join("")}
      </section>`;
  }
  function premios(total) {
    const lista = RECOMPENSAS.slice().sort((a, b) => a.estrelas - b.estrelas);
    return `
      <section class="cartao">
        <h2>🎁 Prêmios ${App.edBtn("ed-recompensas")}</h2>
        ${lista.map((r) => { const ok = total >= r.estrelas; return `
          <div class="premio ${ok ? "ok" : ""}"><div><b>${ok ? "🎉 " : ""}${esc(r.premio)}</b><div class="barra"><span style="width:${Math.min(100, Math.round(total / r.estrelas * 100))}%"></span></div></div>
          <span class="premio-n">${ok ? "Conquistado!" : `faltam ${r.estrelas - total} ⭐`}</span></div>`; }).join("") || `<p class="mudo">Nenhum prêmio cadastrado.</p>`}
      </section>`;
  }
  ACOES.arco = (el) => {
    const k = "arco:" + kid + ":" + iso(), id = el.dataset.id; let a = Store.get(k, []);
    const marcou = !a.includes(id); a = marcou ? [...a, id] : a.filter((x) => x !== id); Store.set(k, a);
    if (marcou) { falar(a.length === ARCO_IRIS.length ? "Parabéns! Arco-íris completo!" : el.dataset.t + "! Mais uma cor!"); toast("⭐ +1 estrela!"); }
    App.render();
  };
  ACOES.ativ = (el) => {
    const k = "ativ:" + kid + ":" + iso(), id = el.dataset.id; let a = Store.get(k, []);
    const marcou = !a.includes(id); a = marcou ? [...a, id] : a.filter((x) => x !== id); Store.set(k, a);
    if (marcou) { falar("Muito bem! " + el.dataset.t + ". Ganhou duas estrelas!"); toast("⭐⭐ +2 estrelas!"); }
    App.render();
  };

  TELAS.criancas = () => {
    const hoje = iso();
    const feitas = Store.get("missoes:" + kid + ":" + hoje, []);
    const total = estrelasTotal(kid);
    const escolha = Store.get("escolha:" + kid, "");
    return `
    <div class="kids">
      <div class="kids-perfis">
        ${["c1", "c2"].map((k) => `<button class="kids-perfil ${k === kid ? "ativo" : ""}" data-acao="kid" data-k="${k}"><span class="av">${AVATAR[k]}</span>${esc(N[k])}<br><span class="mudo">${CONFIG.IDADES[k]} anos</span></button>`).join("")}
      </div>
      <section class="cartao estrelas-total">
        <div>${AVATAR[kid]} ${esc(N[kid])} tem</div>
        <div class="estrelas-num">⭐ <span id="placar">${total}</span></div>
        <div class="medalhas">${MEDALHAS.map(([n, em, nome]) => `<div class="medalha ${total >= n ? "ok" : ""}"><span class="em">${em}</span>${nome}<br>${n} ⭐</div>`).join("")}</div>
      </section>

      <section class="cartao">
        <h2>Missões de hoje ${App.edBtn("ed-missoes")} <button class="falar" data-acao="falar" data-t="Missões de hoje. Toque na missão quando conseguir fazer.">🔊</button></h2>
        <div class="missoes">
          ${MISSOES.map(([id, em, txt]) => `<button class="missao ${feitas.includes(id) ? "feita" : ""}" data-acao="missao" data-id="${id}" data-t="${esc(txt)}"><span class="em">${em}</span>${esc(txt)}</button>`).join("")}
        </div>
      </section>

      ${extras()}
      <section class="cartao">
        <h2>Joguinhos ${App.edBtn("ed-quiz", "", "✏️ Perguntas do quiz")} <button class="falar" data-acao="falar" data-t="Escolha um joguinho. Cada acerto vale uma estrela.">🔊</button></h2>
        <p class="mudo">Cada acerto vale ⭐ (até ${LIMITE_JOGO} estrelas de jogo por dia).</p>
        <div class="jogos">
          <button class="jogo-btn" style="background:#16a34a" data-acao="jogo" data-j="prato"><span class="em">🍽️</span>Monte o prato</button>
          <button class="jogo-btn" style="background:#dc2626" data-acao="jogo" data-j="semaforo"><span class="em">🚦</span>Semáforo da comida</button>
          <button class="jogo-btn" style="background:#ea580c" data-acao="jogo" data-j="memoria"><span class="em">🃏</span>Jogo da memória</button>
          <button class="jogo-btn" style="background:#2563eb" data-acao="jogo" data-j="quiz"><span class="em">❓</span>Quiz da saúde</button>
          <button class="jogo-btn" style="background:#7c3aed" data-acao="jogo" data-j="escolha"><span class="em">👩‍🍳</span>Escolha o almoço de domingo</button>
        </div>
      </section>

      ${premios(total)}
      <section class="cartao jogo-area" id="jogo">
        <p class="mudo">Escolha um joguinho acima.</p>
        ${escolha ? `<p>Seu prato escolhido para domingo: <strong>${esc(App.receitaPorId(escolha)?.nome || "")}</strong></p>` : ""}
      </section>
    </div>`;
  };

  ACOES.kid = (el) => { kid = el.dataset.k; jogo = null; App.render(); };
  ACOES.falar = (el) => falar(el.dataset.t);
  ACOES.missao = (el) => {
    const k = "missoes:" + kid + ":" + iso(), id = el.dataset.id; let f = Store.get(k, []);
    const marcou = !f.includes(id);
    f = marcou ? [...f, id] : f.filter((x) => x !== id);
    Store.set(k, f);
    el.classList.toggle("feita", marcou); atualizarPlacar();
    if (marcou) { falar("Muito bem! " + el.dataset.t + ". Ganhou uma estrela!"); toast("⭐ +1 estrela!"); }
  };
  ACOES.jogo = (el) => {
    const j = el.dataset.j;
    if (j === "prato") iniciarPrato();
    else if (j === "semaforo") iniciarSemaforo();
    else if (j === "memoria") iniciarMemoria();
    else if (j === "quiz") iniciarQuiz();
    else if (j === "escolha") mostrarEscolha();
    document.getElementById("jogo").scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const area = () => document.getElementById("jogo");

  // ---------- Monte o prato ----------
  const GRUPOS = [
    ["legume", "🥦 Legumes (metade do prato)"],
    ["proteina", "🍗 Proteína (força)"],
    ["carbo", "🍚 Energia"],
    ["fruta", "🍎 Fruta (sobremesa)"],
    ["doce", "🍬 Só de vez em quando"]
  ];
  function iniciarPrato() {
    const pool = ALIMENTOS_JOGO.filter((a) => a[3] === "verde" || a[2] === "doce");
    jogo = { tipo: "prato", fila: embaralhar(pool).slice(0, 8), i: 0, acertos: 0 };
    rodadaPrato();
  }
  function rodadaPrato() {
    const a = jogo.fila[jogo.i];
    if (!a) return fimJogo("Você montou o prato!", "Metade do prato é legume, um pedaço é proteína e outro é energia. A fruta é a sobremesa!");
    area().innerHTML = `
      <h2>🍽️ Onde vai este alimento?</h2>
      <div class="prato"><span style="top:45%;right:12%">Legumes</span><span style="bottom:18%;left:14%">Proteína</span><span style="top:18%;left:16%">Energia</span></div>
      <div class="alimento-grande">${a[0]}</div>
      <div class="alimento-nome">${esc(a[1])} <button class="falar" data-acao="falar" data-t="${esc(a[1])}">🔊</button></div>
      <div class="opcoes">${GRUPOS.map(([g, t]) => `<button class="opcao" data-acao="resp-prato" data-g="${g}">${t}</button>`).join("")}</div>
      <div class="festa" id="festa"></div>
      <p class="mudo">${jogo.i + 1} de ${jogo.fila.length}</p>`;
    if (pequeno()) falar("Onde vai " + a[1] + "?");
  }
  ACOES["resp-prato"] = (el) => responder(el, el.dataset.g === jogo.fila[jogo.i][2], () => { jogo.i++; rodadaPrato(); },
    () => { const g = GRUPOS.find((x) => x[0] === jogo.fila[jogo.i][2]); return "Vai em: " + g[1]; });

  // ---------- Semáforo ----------
  const SEM = [["verde", "🟢 Todo dia"], ["amarelo", "🟡 Às vezes"], ["vermelho", "🔴 Raramente"]];
  function iniciarSemaforo() { jogo = { tipo: "semaforo", fila: embaralhar(ALIMENTOS_JOGO).slice(0, 8), i: 0, acertos: 0 }; rodadaSemaforo(); }
  function rodadaSemaforo() {
    const a = jogo.fila[jogo.i];
    if (!a) return fimJogo("Semáforo completo!", "Verde: pode comer todo dia. Amarelo: às vezes. Vermelho: só de vez em quando.");
    area().innerHTML = `
      <h2>🚦 Quando a gente pode comer?</h2>
      <div class="alimento-grande">${a[0]}</div>
      <div class="alimento-nome">${esc(a[1])} <button class="falar" data-acao="falar" data-t="${esc(a[1])}">🔊</button></div>
      <div class="opcoes">${SEM.map(([s, t]) => `<button class="opcao" data-acao="resp-sem" data-s="${s}">${t}</button>`).join("")}</div>
      <div class="festa" id="festa"></div>
      <p class="mudo">${jogo.i + 1} de ${jogo.fila.length}</p>`;
    if (pequeno()) falar(a[1] + ". Todo dia, às vezes ou raramente?");
  }
  ACOES["resp-sem"] = (el) => responder(el, el.dataset.s === jogo.fila[jogo.i][3], () => { jogo.i++; rodadaSemaforo(); },
    () => "Resposta: " + SEM.find((x) => x[0] === jogo.fila[jogo.i][3])[1]);

  // ---------- Quiz ----------
  function iniciarQuiz() { jogo = { tipo: "quiz", fila: embaralhar(QUIZ).slice(0, 5), i: 0, acertos: 0 }; rodadaQuiz(); }
  function rodadaQuiz() {
    const q = jogo.fila[jogo.i];
    if (!q) return fimJogo("Quiz terminado!", "Você sabe muito sobre saúde!");
    area().innerHTML = `
      <h2>❓ Pergunta ${jogo.i + 1} de ${jogo.fila.length}</h2>
      <p style="font-size:1.25rem;font-weight:650">${esc(q.p)} <button class="falar" data-acao="falar" data-t="${esc(q.p + " " + q.o.join(", ou "))}">🔊</button></p>
      <div class="opcoes">${q.o.map((o, i) => `<button class="opcao" data-acao="resp-quiz" data-i="${i}">${esc(o)}</button>`).join("")}</div>
      <div class="festa" id="festa"></div>`;
    if (pequeno()) falar(q.p + " " + q.o.join(", ou "));
  }
  ACOES["resp-quiz"] = (el) => {
    const q = jogo.fila[jogo.i];
    responder(el, Number(el.dataset.i) === q.c, () => { jogo.i++; rodadaQuiz(); }, () => q.e, q.e);
  };

  // resposta comum aos jogos
  function responder(el, certo, proxima, explicacao, extraCerto) {
    if (jogo.travado) return; jogo.travado = true;
    const festa = document.getElementById("festa");
    if (certo) {
      el.classList.add("certa"); jogo.acertos++;
      const ganhou = ganharEstrela();
      festa.style.color = "#16a34a";
      festa.textContent = ganhou ? "Acertou! ⭐ +1" : "Acertou! 🎉";
      falar("Acertou! " + (extraCerto || ""));
    } else {
      el.classList.add("errada");
      festa.style.color = "#b91c1c";
      const ex = explicacao(); festa.textContent = ex;
      falar("Quase! " + ex);
    }
    setTimeout(() => { jogo.travado = false; proxima(); }, certo ? 1300 : 2600);
  }
  function fimJogo(titulo, msg) {
    const total = jogo.fila ? jogo.fila.length : 0;
    area().innerHTML = `<h2>🎉 ${esc(titulo)}</h2>
      ${total ? `<p style="font-size:1.3rem">Você acertou <strong>${jogo.acertos}</strong> de ${total}!</p>` : ""}
      <p>${esc(msg)}</p>
      <button class="btn primario" data-acao="jogo" data-j="${jogo.tipo}">Jogar de novo</button>`;
    falar(titulo + " " + (total ? "Você acertou " + jogo.acertos + " de " + total + "." : "") + " " + msg);
  }

  // ---------- Memória ----------
  function iniciarMemoria() {
    const base = embaralhar(ALIMENTOS_JOGO.filter((a) => a[3] === "verde")).slice(0, pequeno() ? 4 : 6);
    const cartas = embaralhar([...base, ...base].map((a, i) => ({ id: i, em: a[0], nome: a[1], virada: false, par: false })));
    jogo = { tipo: "memoria", cartas, abertas: [], jogadas: 0, acertos: 0 };
    desenharMemoria();
  }
  function desenharMemoria() {
    const fim = jogo.cartas.every((c) => c.par);
    area().innerHTML = `
      <h2>🃏 Jogo da memória</h2>
      <p class="mudo">Ache os pares de alimentos. Jogadas: ${jogo.jogadas}</p>
      <div class="memoria">${jogo.cartas.map((c, i) => `<button class="carta ${c.virada ? "virada" : ""} ${c.par ? "par" : ""}" data-acao="carta" data-i="${i}" aria-label="Carta">${c.virada || c.par ? c.em : "?"}</button>`).join("")}</div>
      <div class="festa" id="festa">${fim ? "Você achou todos! ⭐" : ""}</div>
      ${fim ? `<button class="btn primario" data-acao="jogo" data-j="memoria">Jogar de novo</button>` : ""}`;
  }
  ACOES.carta = (el) => {
    const c = jogo.cartas[Number(el.dataset.i)];
    if (jogo.travado || c.virada || c.par) return;
    c.virada = true; jogo.abertas.push(c); falar(c.nome); desenharMemoria();
    if (jogo.abertas.length === 2) {
      jogo.jogadas++; jogo.travado = true;
      const [a, b] = jogo.abertas;
      setTimeout(() => {
        if (a.em === b.em) {
          a.par = b.par = true; ganharEstrela();
          if (jogo.cartas.every((x) => x.par)) falar("Parabéns! Você achou todos os pares!");
        }
        a.virada = b.virada = false; jogo.abertas = []; jogo.travado = false; desenharMemoria();
      }, 900);
    }
  };

  // ---------- Escolha do domingo ----------
  const OPCOES_DOMINGO = ["nuggets", "hamburguer", "escondidinho", "strogonoff", "almondegas", "frango-xadrez", "assadeira-frango", "iscas-peixe"];
  function mostrarEscolha() {
    const minha = Store.get("escolha:" + kid, "");
    const outro = kid === "c1" ? "c2" : "c1";
    const doOutro = Store.get("escolha:" + outro, "");
    area().innerHTML = `
      <h2>👩‍🍳 Escolha o almoço de domingo</h2>
      <p>Toque no prato que você quer ajudar a fazer no domingo.</p>
      <div class="opcoes">${OPCOES_DOMINGO.map((id) => { const r = App.receitaPorId(id); return `<button class="opcao ${minha === id ? "certa" : ""}" data-acao="escolher" data-id="${id}">${esc(r.nome)}</button>`; }).join("")}</div>
      ${doOutro ? `<p class="mudo" style="margin-top:.8rem">${esc(N[outro])} escolheu: ${esc(App.receitaPorId(doOutro).nome)}</p>` : ""}`;
    if (pequeno()) falar("Escolha o almoço de domingo");
  }
  ACOES.escolher = (el) => {
    Store.set("escolha:" + kid, el.dataset.id);
    const r = App.receitaPorId(el.dataset.id);
    falar("Oba! Domingo tem " + r.nome); toast("Escolhido: " + r.nome);
    mostrarEscolha();
  };
})();
