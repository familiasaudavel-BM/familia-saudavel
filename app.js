// ============================================================
// FAMÍLIA SAUDÁVEL — lógica da plataforma
// ============================================================
const App = (() => {
  const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  const ORDEM = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
  const DIA_NOME = { seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta", sab: "Sábado", dom: "Domingo" };
  const ABAS = [
    ["hoje", "📅 Hoje"], ["cardapio", "🍽️ Cardápio"], ["receitas", "📖 Receitas"],
    ["compras", "🛒 Compras"], ["treinos", "🏃 Treinos"], ["shot", "🍋 Shot e chás"],
    ["acompanhar", "📈 Acompanhar"], ["provas", "🏅 Provas"], ["criancas", "⭐ Crianças"], ["orientacoes", "💡 Orientações"]
  ];
  const N = CONFIG.NOMES;
  const ui = { cardSemana: null, treinoSemana: null, treinoDia: null, cat: "todas", busca: "", pessoa: "pai" };
  const ACOES = {};
  const TELAS = {};
  const POS = {};

  // ---------- utilidades ----------
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const z = (n) => String(n).padStart(2, "0");
  const iso = (d = new Date()) => d.getFullYear() + "-" + z(d.getMonth() + 1) + "-" + z(d.getDate());
  const diaKey = (d = new Date()) => DIAS[d.getDay()];
  const dataBR = (s) => { const [a, m, d] = s.split("-"); return d + "/" + m; };
  function segundaDaSemana(d = new Date()) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const dow = (x.getDay() + 6) % 7; x.setDate(x.getDate() - dow); return x;
  }
  function dataDoDia(dia) { const s = segundaDaSemana(); s.setDate(s.getDate() + ORDEM.indexOf(dia)); return iso(s); }
  function semanaCiclo(d = new Date()) {
    const ini = new Date(CONFIG.DATA_INICIO + "T00:00:00");
    const diff = Math.floor((segundaDaSemana(d) - segundaDaSemana(ini)) / 86400000);
    if (diff < 0) return 1;
    return (Math.floor(diff / 7) % 2) + 1;
  }
  function minutos(h) { const [a, b] = h.split(":").map(Number); return a * 60 + (b || 0); }
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("ver"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("ver"), 2200); }
  function setSync(txt) { $("#sync").textContent = txt; }
  function falar(txt) {
    try {
      if (!("speechSynthesis" in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt); u.lang = "pt-BR"; u.rate = 0.95; speechSynthesis.speak(u);
    } catch (e) { /* sem voz */ }
  }

  // ---------- armazenamento (local + Supabase) ----------
  const Store = {
    cache: {}, sb: null, user: null, timers: {},
    lerLocal() { try { this.cache = JSON.parse(localStorage.getItem("familia-saudavel") || "{}"); } catch (e) { this.cache = {}; } },
    salvarLocal() { try { localStorage.setItem("familia-saudavel", JSON.stringify(this.cache)); } catch (e) { /* cheio ou bloqueado */ } },
    get(k, def) { return Object.prototype.hasOwnProperty.call(this.cache, k) ? this.cache[k] : def; },
    set(k, v) {
      this.cache[k] = v; this.salvarLocal();
      if (this.sb && this.user) { clearTimeout(this.timers[k]); this.timers[k] = setTimeout(() => this.enviar(k), 500); }
    },
    async enviar(k) {
      setSync("Salvando…");
      const { error } = await this.sb.from("registros").upsert(
        { owner: this.user.id, chave: k, valor: this.cache[k], atualizado_em: new Date().toISOString() },
        { onConflict: "owner,chave" });
      setSync(error ? "⚠️ Não salvou" : "☁️ Salvo");
      if (error) console.error(error);
    },
    async carregar() {
      setSync("Carregando…");
      const { data, error } = await this.sb.from("registros").select("chave,valor");
      if (error) { setSync("⚠️ Sem conexão"); console.error(error); return; }
      const remotas = new Set();
      data.forEach((r) => { this.cache[r.chave] = r.valor; remotas.add(r.chave); });
      // envia para a nuvem o que foi marcado antes, no modo local
      Object.keys(this.cache).filter((k) => !remotas.has(k)).forEach((k) => this.enviar(k));
      this.salvarLocal();
      setSync("☁️ Salvo");
    }
  };

  // ---------- início, login, abas ----------
  async function iniciar() {
    Store.lerLocal();
    const hoje = new Date();
    $("#topo-data").textContent = DIA_NOME[diaKey(hoje)] + ", " + hoje.toLocaleDateString("pt-BR", { day: "numeric", month: "long" }) + " · semana " + semanaCiclo() + " do ciclo";
    montarAbas();
    ligarEventos();
    const configurado = CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY;
    if (configurado && window.supabase) {
      Store.sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
      $("#form-login").onsubmit = async (e) => {
        e.preventDefault();
        $("#login-erro").textContent = "";
        const { data, error } = await Store.sb.auth.signInWithPassword({ email: $("#login-email").value.trim(), password: $("#login-senha").value });
        if (error) { $("#login-erro").textContent = "E-mail ou senha incorretos."; return; }
        await entrou(data.user);
      };
      $("#btn-sair").onclick = async () => {
        if (!confirm("Sair da plataforma neste aparelho?")) return;
        await Store.sb.auth.signOut(); localStorage.removeItem("familia-saudavel"); location.reload();
      };
      const { data: { session } } = await Store.sb.auth.getSession();
      if (session) await entrou(session.user); else $("#login").classList.remove("oculto");
    } else {
      setSync(configurado ? "⚠️ Sem conexão — modo local" : "📱 Modo local");
      render();
    }
  }
  async function entrou(user) {
    Store.user = user;
    $("#login").classList.add("oculto");
    $("#btn-sair").classList.remove("oculto");
    await Store.carregar();
    render();
  }
  function montarAbas() {
    $("#abas").innerHTML = ABAS.map(([id, nome]) => `<button class="aba" data-acao="ir" data-aba="${id}">${nome}</button>`).join("");
  }
  function abaAtual() { const h = location.hash.slice(1); return ABAS.some((a) => a[0] === h) ? h : "hoje"; }
  function render() {
    const aba = abaAtual();
    document.querySelectorAll(".aba").forEach((b) => b.classList.toggle("ativa", b.dataset.aba === aba));
    const ativa = document.querySelector(".aba.ativa"); if (ativa) ativa.scrollIntoView({ inline: "center", block: "nearest" });
    $("#conteudo").innerHTML = TELAS[aba]();
    if (aba === "receitas") renderListaReceitas();
    if (POS[aba]) POS[aba]();
  }
  function ligarEventos() {
    window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
    document.addEventListener("click", (e) => {
      const r = e.target.closest("[data-receita]");
      if (r) { abrirReceita(r.dataset.receita); return; }
      const a = e.target.closest("[data-acao]");
      if (a && !["INPUT", "SELECT", "FORM", "TEXTAREA"].includes(a.tagName) && ACOES[a.dataset.acao]) ACOES[a.dataset.acao](a, e);
    });
    document.addEventListener("change", (e) => {
      const a = e.target.closest("[data-acao]");
      if (a && (a.tagName === "INPUT" || a.tagName === "SELECT") && ACOES[a.dataset.acao]) ACOES[a.dataset.acao](a, e);
    });
    document.addEventListener("input", (e) => {
      if (e.target.id === "busca-receita") { ui.busca = e.target.value; renderListaReceitas(); }
    });
    document.addEventListener("submit", (e) => {
      const f = e.target.closest("form[data-acao]");
      if (f && ACOES[f.dataset.acao]) { e.preventDefault(); ACOES[f.dataset.acao](f, e); }
    });
    $("#modal-fechar").onclick = fecharModal;
    $("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") fecharModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") fecharModal(); });
  }
  ACOES.ir = (el) => { location.hash = el.dataset.aba; };

  // ---------- modal e receitas ----------
  function abrirModal(html) { $("#modal-corpo").innerHTML = html; $("#modal").classList.remove("oculto"); document.body.style.overflow = "hidden"; }
  function fecharModal() { $("#modal").classList.add("oculto"); document.body.style.overflow = ""; }
  const receitaPorId = (id) => RECEITAS.find((r) => r.id === id);
  function abrirReceita(id) {
    const r = receitaPorId(id); if (!r) return;
    const fav = Store.get("favoritas", []).includes(id);
    abrirModal(`
      <h2>${esc(r.nome)}</h2>
      <p><span class="tag">${CATEGORIAS[r.cat]}</span><span class="tag laranja">⏱ ${r.tempo} min</span><span class="tag azul">${esc(r.rende)}</span></p>
      <h3>Ingredientes</h3><ul>${r.ing.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      <h3>Modo de preparo</h3><ol>${r.passos.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
      ${r.dica ? `<p class="cartao" style="background:var(--amarelo-claro)">💡 ${esc(r.dica)}</p>` : ""}
      ${r.kids ? `<p class="cartao" style="background:var(--laranja-claro)">👧 Crianças ajudam: ${esc(r.kids)}</p>` : ""}
      <button class="btn largo" data-acao="fav" data-id="${r.id}">${fav ? "★ Tirar das favoritas" : "☆ Marcar como favorita"}</button>`);
  }
  ACOES.fav = (el) => {
    const id = el.dataset.id; let f = Store.get("favoritas", []);
    f = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
    Store.set("favoritas", f); abrirReceita(id); if (abaAtual() === "receitas") renderListaReceitas();
  };
  function linksReceitas(item) {
    if (!item) return "";
    const [txt, ...ids] = item;
    if (txt.includes("escolhido pelas crianças")) {
      ["c1", "c2"].forEach((k) => { const e = Store.get("escolha:" + k, ""); if (e && !ids.includes(e)) ids.push(e); });
    }
    const links = ids.filter(Boolean).map((id) => { const r = receitaPorId(id); return r ? `<button class="link-receita" data-receita="${id}">${esc(r.nome)}</button>` : ""; }).filter(Boolean);
    return `<div>${esc(txt)}</div>${links.length ? `<div class="mudo">📖 ${links.join(" · ")}</div>` : ""}`;
  }

  // ---------- HOJE ----------
  TELAS.hoje = () => {
    const d = diaKey(), data = iso(), sem = semanaCiclo();
    const rot = d === "qua" ? ROTINA.quarta : d === "sab" ? ROTINA.sabado : d === "dom" ? ROTINA.domingo : ROTINA.semana;
    const feitos = Store.get("rotina:" + data, []);
    const agora = new Date().getHours() * 60 + new Date().getMinutes();
    let atual = -1; rot.forEach((r, i) => { if (minutos(r.h) <= agora) atual = i; });
    const c = CARDAPIO[sem][d], t = TREINOS[d], s = SHOT.rotacao[d];
    const agua = Store.get("agua:" + data, { pai: 0, mae: 0 });
    const treinoFeito = Store.get("treino:" + data, {});
    const shotFeito = Store.get("shot:" + data, {});
    const pre = d === "qua" ? "17:15 · lanche reforçado antes do balé: tapioca com frango ou cuscuz com ovo + fruta." : d === "dom" ? "" : PRE_TREINO;
    return `
    <div class="grade">
      <section class="cartao destaque">
        <h2>Rotina de hoje</h2>
        <ul class="tempo">${rot.map((r, i) => `
          <li class="${i === atual ? "agora" : ""}">
            <span class="hora">${r.h}</span>
            <input type="checkbox" data-acao="rotina" data-i="${i}" ${feitos.includes(i) ? "checked" : ""} aria-label="Feito">
            <span>${esc(r.txt)}<span class="quem">${esc(r.quem)}</span></span>
          </li>`).join("")}</ul>
      </section>
      <div>
        <section class="cartao">
          <h2>Comida de hoje</h2>
          <div class="refeicao"><div class="refeicao-titulo">Café da manhã ${d === "sab" || d === "dom" ? "7:30" : "6:20"}</div>${linksReceitas(c.cafe)}</div>
          <div class="refeicao"><div class="refeicao-titulo">Almoço${["sab", "dom"].includes(d) ? " em família" : " (crianças na escola)"}</div>${linksReceitas(c.almoco)}</div>
          <div class="refeicao"><div class="refeicao-titulo">Lanche 16:00</div>${linksReceitas(c.lanche)}</div>
          ${pre ? `<div class="refeicao"><div class="refeicao-titulo">Pré-treino (adultos)</div><div>${esc(pre)}</div></div>` : ""}
          <div class="refeicao"><div class="refeicao-titulo">Jantar em família</div>${linksReceitas(c.jantar)}</div>
        </section>
        <section class="cartao">
          <h2>Treino · ${esc(t.titulo)}</h2>
          ${t.nota ? `<p class="mudo">${esc(t.nota)}</p>` : ""}
          <p>🏃 ${esc(t.corrida.tipo)} ${t.corrida["s" + sem] !== "—" ? "· " + esc(t.corrida["s" + sem]) : ""}</p>
          <div class="chips">
            ${["pai", "mae"].map((p) => `<button class="chip ${treinoFeito[p] ? "ativo" : ""}" data-acao="treino-feito" data-p="${p}" data-data="${data}">${treinoFeito[p] ? "✅" : "⬜"} ${esc(N[p])} treinou</button>`).join("")}
          </div>
          <button class="btn pequeno" data-acao="ir" data-aba="treinos">Ver exercícios →</button>
        </section>
        <section class="cartao">
          <h2>🍋 Shot de hoje</h2>
          <p><strong>${esc(s[0])}:</strong> ${esc(s[1])}</p>
          <div class="chips">
            ${["pai", "mae"].map((p) => `<button class="chip ${shotFeito[p] ? "ativo" : ""}" data-acao="shot-tomei" data-p="${p}">${shotFeito[p] ? "✅" : "⬜"} ${esc(N[p])}</button>`).join("")}
          </div>
        </section>
        <section class="cartao">
          <h2>💧 Água</h2>
          ${["pai", "mae"].map((p) => {
            const meta = CONFIG.AGUA[p], v = agua[p] || 0;
            return `<p style="margin-bottom:.2rem"><strong>${esc(N[p])}</strong> · ${v} de ${meta} copos</p>
              <div class="barra"><span style="width:${Math.min(100, Math.round(v / meta * 100))}%"></span></div>
              <div class="agua"><span class="agua-copos">${"💧".repeat(Math.min(v, meta))}</span>
              <button class="btn pequeno" data-acao="agua" data-p="${p}" data-d="-1" aria-label="Menos um copo">−</button>
              <button class="btn pequeno primario" data-acao="agua" data-p="${p}" data-d="1">+ copo</button></div>`;
          }).join("<hr style='border:0;border-top:1px solid var(--linha);margin:.8rem 0'>")}
        </section>
      </div>
    </div>`;
  };
  ACOES.rotina = (el) => {
    const k = "rotina:" + iso(), i = Number(el.dataset.i); let f = Store.get(k, []);
    f = el.checked ? [...new Set([...f, i])] : f.filter((x) => x !== i); Store.set(k, f);
  };
  ACOES.agua = (el) => {
    const k = "agua:" + iso(), a = Store.get(k, { pai: 0, mae: 0 }), p = el.dataset.p;
    a[p] = Math.max(0, (a[p] || 0) + Number(el.dataset.d)); Store.set(k, { ...a }); render();
  };
  ACOES["treino-feito"] = (el) => {
    const k = "treino:" + el.dataset.data, t = Store.get(k, {}); t[el.dataset.p] = !t[el.dataset.p];
    Store.set(k, { ...t }); if (t[el.dataset.p]) toast("Treino registrado! 💪"); render();
  };
  ACOES["shot-tomei"] = (el) => {
    const k = "shot:" + iso(), s = Store.get(k, {}); s[el.dataset.p] = !s[el.dataset.p]; Store.set(k, { ...s }); render();
  };

  // ---------- CARDÁPIO ----------
  TELAS.cardapio = () => {
    const atual = semanaCiclo(); const sem = ui.cardSemana || atual; const hoje = diaKey();
    return `
    <section class="cartao destaque">
      <h2>Cardápio de 2 semanas</h2>
      <p class="mudo">Almoço de segunda a sexta: só adultos (crianças almoçam na escola). O jantar das 20:20 é o pós-treino. Toque no nome da receita para ver o passo a passo. Pode trocar os dias à vontade.</p>
      <div class="chips">${[1, 2].map((s) => `<button class="chip ${s === sem ? "ativo" : ""}" data-acao="card-semana" data-s="${s}">Semana ${s}${s === atual ? " (atual)" : ""}</button>`).join("")}</div>
    </section>
    <div class="grade">
      ${ORDEM.map((d) => { const c = CARDAPIO[sem][d]; const eHoje = d === hoje && sem === atual; return `
        <section class="cartao ${eHoje ? "destaque" : ""}">
          <h3>${DIA_NOME[d]}${eHoje ? " · hoje" : ""}</h3>
          <div class="refeicao"><div class="refeicao-titulo">Café da manhã</div>${linksReceitas(c.cafe)}</div>
          <div class="refeicao"><div class="refeicao-titulo">Almoço</div>${linksReceitas(c.almoco)}</div>
          <div class="refeicao"><div class="refeicao-titulo">Lanche 16:00</div>${linksReceitas(c.lanche)}</div>
          <div class="refeicao"><div class="refeicao-titulo">Jantar</div>${linksReceitas(c.jantar)}</div>
        </section>`; }).join("")}
    </div>
    <section class="cartao">
      <h2>Tamanho do prato</h2>
      <table class="tabela"><tbody>${PORCOES.map(([q, t]) => `<tr><th>${esc(q.replace("Pai", N.pai).replace("Mãe", N.mae))}</th><td>${esc(t)}</td></tr>`).join("")}</tbody></table>
      <p class="mudo" style="margin-top:.6rem">Pré-treino: ${esc(PRE_TREINO)}</p>
    </section>`;
  };
  ACOES["card-semana"] = (el) => { ui.cardSemana = Number(el.dataset.s); render(); };

  // ---------- RECEITAS ----------
  TELAS.receitas = () => `
    <section class="cartao destaque">
      <h2>Receitas (${RECEITAS.length})</h2>
      <label>Buscar receita ou ingrediente<input id="busca-receita" type="search" placeholder="frango, batata-doce, air fryer…" value="${esc(ui.busca)}"></label>
      <div class="chips">
        ${[["todas", "Todas"], ["fav", "★ Favoritas"], ["kids", "👧 Com as crianças"], ...Object.entries(CATEGORIAS)].map(([k, v]) => `<button class="chip ${ui.cat === k ? "ativo" : ""}" data-acao="cat" data-k="${k}">${v}</button>`).join("")}
      </div>
    </section>
    <div id="lista-receitas" class="grade"></div>`;
  function renderListaReceitas() {
    const el = $("#lista-receitas"); if (!el) return;
    const favs = Store.get("favoritas", []);
    const q = ui.busca.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const lista = RECEITAS.filter((r) => {
      if (ui.cat === "fav" && !favs.includes(r.id)) return false;
      if (ui.cat === "kids" && !r.kids) return false;
      if (!["todas", "fav", "kids"].includes(ui.cat) && r.cat !== ui.cat) return false;
      if (q && !norm(r.nome + " " + r.ing.join(" ") + " " + r.passos.join(" ")).includes(q)) return false;
      return true;
    });
    el.innerHTML = lista.length ? lista.map((r) => `
      <button class="cartao" style="text-align:left;cursor:pointer;font:inherit;color:inherit" data-receita="${r.id}">
        <h3>${favs.includes(r.id) ? "★ " : ""}${esc(r.nome)}</h3>
        <span class="tag">${CATEGORIAS[r.cat]}</span><span class="tag laranja">⏱ ${r.tempo} min</span>${r.kids ? '<span class="tag roxo">👧 crianças ajudam</span>' : ""}
      </button>`).join("") : `<p class="mudo">Nenhuma receita encontrada.</p>`;
  }
  ACOES.cat = (el) => { ui.cat = el.dataset.k; render(); };

  // ---------- COMPRAS ----------
  TELAS.compras = () => {
    const marc = Store.get("compras", []);
    const total = COMPRAS.reduce((a, c) => a + c[3], 0);
    const marcado = COMPRAS.reduce((a, c, i) => a + (marc.includes(i) ? c[3] : 0), 0);
    const pago = Store.get("pago", { c1: "", c2: "" });
    const totalPago = (Number(pago.c1) || 0) + (Number(pago.c2) || 0);
    const grupos = [...new Set(COMPRAS.map((c) => c[0]))];
    const seg = iso(segundaDaSemana());
    const prep = Store.get("preparo:" + seg, []);
    return `
    <section class="cartao destaque">
      <h2>Lista de 14 dias</h2>
      <p>Estimado: <strong>R$ ${total}</strong> de R$ ${ORCAMENTO} · no carrinho: <strong>R$ ${marcado}</strong> (${marc.length} de ${COMPRAS.length} itens)</p>
      <div class="barra"><span style="width:${Math.round(marc.length / COMPRAS.length * 100)}%"></span></div>
      <p class="mudo">Compra 1 (dia 1): secos, proteínas e metade do hortifrúti. Compra 2 (dia 8): a outra metade do hortifrúti. Casa já tem: azeite, óleo, sal, café, temperos e suplementos.</p>
      <div class="grade-2">
        <label>Valor pago compra 1 (R$)<input type="number" inputmode="decimal" step="0.01" data-acao="pago" data-c="c1" value="${esc(pago.c1)}"></label>
        <label>Valor pago compra 2 (R$)<input type="number" inputmode="decimal" step="0.01" data-acao="pago" data-c="c2" value="${esc(pago.c2)}"></label>
      </div>
      <p>${totalPago ? `Gasto real: <strong>R$ ${totalPago.toFixed(2).replace(".", ",")}</strong> · ${totalPago <= ORCAMENTO ? "✅ dentro do orçamento" : "⚠️ R$ " + (totalPago - ORCAMENTO).toFixed(2).replace(".", ",") + " acima"}` : ""}</p>
      <button class="btn pequeno perigo" data-acao="compras-limpar">Começar nova lista (limpar marcações)</button>
    </section>
    <div class="grade">
      ${grupos.map((g) => `<section class="cartao"><h3>${esc(g)}</h3>
        ${COMPRAS.map((c, i) => c[0] !== g ? "" : `
          <label class="check ${marc.includes(i) ? "feito" : ""}">
            <input type="checkbox" data-acao="compra" data-i="${i}" ${marc.includes(i) ? "checked" : ""}>
            <span class="check-txt">${esc(c[1])}<br><span class="mudo">${esc(c[2])}</span></span>
            <span class="check-dir">R$ ${c[3]}</span>
          </label>`).join("")}
      </section>`).join("")}
    </div>
    <h2 style="margin-top:.5rem">Preparo da semana ("delivery caseiro")</h2>
    <div class="grade">
      ${[["domingo", "Domingo (2 h, em família)"], ["terca", "Terça à tarde (1 h, mãe e crianças)"]].map(([k, t]) => `
        <section class="cartao"><h3>${t}</h3>
          ${PREPARO[k].map((p, i) => { const id = k + i; return `<label class="check ${prep.includes(id) ? "feito" : ""}"><input type="checkbox" data-acao="preparo" data-id="${id}" ${prep.includes(id) ? "checked" : ""}><span class="check-txt">${esc(p)}</span></label>`; }).join("")}
        </section>`).join("")}
      <section class="cartao"><h3>👧 Crianças na cozinha</h3><ul>${PREPARO.criancas.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></section>
    </div>`;
  };
  ACOES.compra = (el) => {
    const i = Number(el.dataset.i); let m = Store.get("compras", []);
    m = el.checked ? [...new Set([...m, i])] : m.filter((x) => x !== i); Store.set("compras", m); render();
  };
  ACOES.pago = (el) => { const p = Store.get("pago", { c1: "", c2: "" }); p[el.dataset.c] = el.value; Store.set("pago", { ...p }); render(); };
  ACOES["compras-limpar"] = () => { if (confirm("Limpar todas as marcações e valores da lista?")) { Store.set("compras", []); Store.set("pago", { c1: "", c2: "" }); render(); } };
  ACOES.preparo = (el) => {
    const k = "preparo:" + iso(segundaDaSemana()), id = el.dataset.id; let p = Store.get(k, []);
    p = el.checked ? [...new Set([...p, id])] : p.filter((x) => x !== id); Store.set(k, p); render();
  };

  // ---------- TREINOS ----------
  TELAS.treinos = () => {
    const atual = semanaCiclo(); const sem = ui.treinoSemana || atual; const dia = ui.treinoDia || diaKey();
    const t = TREINOS[dia]; const data = dataDoDia(dia);
    const exKey = "ex:" + data;
    const exFeitos = Store.get(exKey, []);
    const feito = Store.get("treino:" + data, {});
    let n = 0;
    return `
    <section class="cartao destaque">
      <h2>Treinos · 19:00</h2>
      <div class="chips">${[1, 2].map((s) => `<button class="chip ${s === sem ? "ativo" : ""}" data-acao="treino-semana" data-s="${s}">Semana ${s}${s === atual ? " (atual)" : ""}</button>`).join("")}</div>
      <div class="chips">${ORDEM.map((d) => `<button class="chip ${d === dia ? "ativo" : ""}" data-acao="treino-dia" data-d="${d}">${DIA_NOME[d].slice(0, 3)}${d === diaKey() ? " •" : ""}</button>`).join("")}</div>
    </section>
    <section class="cartao">
      <h2>${DIA_NOME[dia]} · ${esc(t.titulo)}</h2>
      ${t.nota ? `<p class="mudo">${esc(t.nota)}</p>` : ""}
      ${t.blocos.map((b) => `
        <h3 style="margin-top:.8rem">${esc(b.nome)}</h3>
        ${b.itens.map((it) => { const i = n++; return `
          <label class="exercicio">
            <input type="checkbox" data-acao="ex" data-k="${exKey}" data-i="${i}" ${exFeitos.includes(i) ? "checked" : ""}>
            <span>${esc(it[0])}</span>
            <span class="series">${esc(sem === 1 ? it[1] : it[2])}</span>
          </label>`; }).join("")}`).join("")}
      <div class="corrida">
        <strong>🏃 ${esc(t.corrida.tipo)}</strong>${t.corrida["s" + sem] !== "—" ? ` · <strong>${esc(t.corrida["s" + sem])}</strong>` : ""}
        ${t.corrida.obs ? `<div class="mudo">${esc(t.corrida.obs)}</div>` : ""}
      </div>
      <div class="chips" style="margin-top:.9rem">
        ${["pai", "mae"].map((p) => `<button class="chip ${feito[p] ? "ativo" : ""}" data-acao="treino-feito" data-p="${p}" data-data="${data}">${feito[p] ? "✅" : "⬜"} ${esc(N[p])} treinou (${dataBR(data)})</button>`).join("")}
      </div>
    </section>
    <section class="cartao">
      <h2>Semana ${sem} de relance</h2>
      <div class="rolar"><table class="tabela">
        <thead><tr><th>Dia</th><th>Musculação</th><th>Corrida</th></tr></thead>
        <tbody>${ORDEM.map((d) => `<tr><td><strong>${DIA_NOME[d].slice(0, 3)}</strong></td><td>${esc(TREINOS[d].titulo)}</td><td>${esc(TREINOS[d].corrida.tipo)}${TREINOS[d].corrida["s" + sem] !== "—" ? " · " + esc(TREINOS[d].corrida["s" + sem]) : ""}</td></tr>`).join("")}</tbody>
      </table></div>
    </section>
    <section class="cartao">
      <h2>Como treinar</h2>
      <ul>${TREINO_ORIENTACOES.map((o) => `<li>${esc(o.replace(/^Mãe:/, N.mae + ":"))}</li>`).join("")}</ul>
    </section>`;
  };
  ACOES["treino-semana"] = (el) => { ui.treinoSemana = Number(el.dataset.s); render(); };
  ACOES["treino-dia"] = (el) => { ui.treinoDia = el.dataset.d; render(); };
  ACOES.ex = (el) => {
    const k = el.dataset.k, i = Number(el.dataset.i); let f = Store.get(k, []);
    f = el.checked ? [...new Set([...f, i])] : f.filter((x) => x !== i); Store.set(k, f);
  };

  // ---------- SHOT E CHÁS ----------
  TELAS.shot = () => {
    const d = diaKey(); const s = SHOT.rotacao[d];
    const shotFeito = Store.get("shot:" + iso(), {});
    const comp = Store.get("shotcompras", []);
    return `
    <section class="cartao destaque">
      <h2>🍋 Shot de hoje · ${DIA_NOME[d]}</h2>
      <p><strong>${esc(s[0])}:</strong> ${esc(s[1])}</p>
      <div class="chips">${["pai", "mae"].map((p) => `<button class="chip ${shotFeito[p] ? "ativo" : ""}" data-acao="shot-tomei" data-p="${p}">${shotFeito[p] ? "✅" : "⬜"} ${esc(N[p])} tomou</button>`).join("")}</div>
    </section>
    <div class="grade">
      <section class="cartao">
        <h2>Receita base (1 dose)</h2>
        <table class="tabela"><tbody>${SHOT.base.map(([a, b, c]) => `<tr><td><strong>${esc(a)}</strong><br><span class="mudo">${esc(c)}</span></td><td>${esc(b)}</td></tr>`).join("")}</tbody></table>
        <h3 style="margin-top:.8rem">Como preparar</h3>
        <ol>${SHOT.preparo.map((p) => `<li>${esc(p)}</li>`).join("")}</ol>
      </section>
      <section class="cartao">
        <h2>Rotação da semana</h2>
        <table class="tabela"><tbody>${ORDEM.map((k) => `<tr style="${k === d ? "background:var(--amarelo-claro)" : ""}"><td><strong>${DIA_NOME[k].slice(0, 3)}</strong></td><td><strong>${esc(SHOT.rotacao[k][0])}</strong><br><span class="mudo">${esc(SHOT.rotacao[k][1])}</span></td></tr>`).join("")}</tbody></table>
        <h3 style="margin-top:.8rem">Especiarias para variar</h3>
        <ul>${SHOT.especiarias.map(([a, b]) => `<li><strong>${esc(a)}:</strong> ${esc(b)}</li>`).join("")}</ul>
      </section>
      <section class="cartao">
        <h2>🍵 Chás do dia</h2>
        ${SHOT.chas.map(([h, c, o]) => `<div class="refeicao"><div class="refeicao-titulo">${esc(h)}</div><strong>${esc(c)}</strong><div class="mudo">${esc(o)}</div></div>`).join("")}
      </section>
      <section class="cartao">
        <h2>Suplementos (já comprados)</h2>
        <table class="tabela"><thead><tr><th>Item</th><th>Dose</th><th>Quando</th></tr></thead>
        <tbody>${SUPLEMENTOS.map(([a, b, c, o]) => `<tr><td><strong>${esc(a)}</strong><br><span class="mudo">${esc(o)}</span></td><td>${esc(b)}</td><td>${esc(c)}</td></tr>`).join("")}</tbody></table>
        <p class="mudo" style="margin-top:.5rem">Só para os adultos. Doses de referência: ajuste conforme o rótulo e o médico.</p>
      </section>
      <section class="cartao">
        <h2>⚠️ Cuidados</h2>
        <ul>${SHOT.cuidados.map((c) => `<li>${esc(c.replace(/^Mãe:/, N.mae + ":"))}</li>`).join("")}</ul>
      </section>
      <section class="cartao">
        <h2>Despensa do shot e chás</h2>
        ${SHOT.compras.map((c, i) => `<label class="check ${comp.includes(i) ? "feito" : ""}"><input type="checkbox" data-acao="shot-compra" data-i="${i}" ${comp.includes(i) ? "checked" : ""}><span class="check-txt">${esc(c)}</span></label>`).join("")}
        <p class="mudo">Marque o que já tem em casa.</p>
      </section>
    </div>`;
  };
  ACOES["shot-compra"] = (el) => {
    const i = Number(el.dataset.i); let m = Store.get("shotcompras", []);
    m = el.checked ? [...new Set([...m, i])] : m.filter((x) => x !== i); Store.set("shotcompras", m); render();
  };

  // ---------- ACOMPANHAR ----------
  function grafico(pontos, unidade, inverter) {
    if (pontos.length < 2) return `<p class="mudo">O gráfico aparece a partir do segundo registro.</p>`;
    const W = 320, H = 150, P = 28;
    const ys = pontos.map((p) => p.y); let min = Math.min(...ys), max = Math.max(...ys);
    if (min === max) { min -= 1; max += 1; }
    const x = (i) => P + (i * (W - P - 10)) / (pontos.length - 1);
    const y = (v) => 24 + ((max - v) / (max - min)) * (H - 56);
    const linha = pontos.map((p, i) => `${x(i).toFixed(1)},${y(p.y).toFixed(1)}`).join(" ");
    const fmt = (v) => (Math.round(v * 10) / 10).toString().replace(".", ",");
    return `<svg class="grafico" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução">
      <line x1="${P}" y1="${H - 30}" x2="${W - 10}" y2="${H - 30}" stroke="#e3e1da"/>
      <polyline points="${linha}" fill="none" stroke="#0f766e" stroke-width="2.5" stroke-linejoin="round"/>
      ${pontos.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.y)}" r="3.5" fill="#0f766e"/>`).join("")}
      <text x="${x(0)}" y="${y(pontos[0].y) - 8}" text-anchor="start">${fmt(pontos[0].y)}</text>
      <text x="${x(pontos.length - 1)}" y="${y(pontos[pontos.length - 1].y) - 8}" text-anchor="end">${fmt(pontos[pontos.length - 1].y)} ${unidade}</text>
      <text x="${x(0)}" y="${H - 12}" text-anchor="start">${dataBR(pontos[0].d)}</text>
      <text x="${x(pontos.length - 1)}" y="${H - 12}" text-anchor="end">${dataBR(pontos[pontos.length - 1].d)}</text>
    </svg>`;
  }
  const paceTxt = (min, km) => { if (!min || !km) return "—"; const p = min / km; const m = Math.floor(p); const s = Math.round((p - m) * 60); return `${m}:${z(s === 60 ? 0 : s)} /km`; };
  TELAS.acompanhar = () => {
    const p = ui.pessoa;
    const med = Store.get("medidas:" + p, []).slice().sort((a, b) => a.d.localeCompare(b.d));
    const cor = Store.get("corridas:" + p, []).slice().sort((a, b) => a.d.localeCompare(b.d));
    let treinos7 = 0, agua7 = 0;
    for (let i = 0; i < 7; i++) {
      const dd = new Date(); dd.setDate(dd.getDate() - i); const k = iso(dd);
      if (Store.get("treino:" + k, {})[p]) treinos7++;
      agua7 += (Store.get("agua:" + k, {})[p] || 0);
    }
    const pesos = med.filter((m) => m.peso);
    const ultimo = pesos[pesos.length - 1], primeiro = pesos[0];
    const variacao = ultimo && primeiro && ultimo !== primeiro ? (ultimo.peso - primeiro.peso) : null;
    return `
    <section class="cartao destaque">
      <h2>Acompanhamento</h2>
      <div class="chips">${["pai", "mae"].map((k) => `<button class="chip ${k === p ? "ativo" : ""}" data-acao="pessoa" data-p="${k}">${esc(N[k])}</button>`).join("")}</div>
      <div class="grade-2">
        <div class="cartao" style="margin:0;background:var(--verde-claro)"><div class="mudo">Treinos (7 dias)</div><div style="font-size:1.6rem;font-weight:700">${treinos7}</div></div>
        <div class="cartao" style="margin:0;background:var(--azul-claro)"><div class="mudo">Água média/dia</div><div style="font-size:1.6rem;font-weight:700">${(agua7 / 7).toFixed(1).replace(".", ",")} <span style="font-size:.9rem">copos</span></div></div>
        <div class="cartao" style="margin:0;background:var(--laranja-claro)"><div class="mudo">Peso atual</div><div style="font-size:1.6rem;font-weight:700">${ultimo ? String(ultimo.peso).replace(".", ",") + " kg" : "—"}</div></div>
        <div class="cartao" style="margin:0;background:var(--roxo-claro)"><div class="mudo">Desde o início</div><div style="font-size:1.6rem;font-weight:700">${variacao === null ? "—" : (variacao > 0 ? "+" : "") + variacao.toFixed(1).replace(".", ",") + " kg"}</div></div>
      </div>
    </section>
    <div class="grade">
      <section class="cartao">
        <h2>Registrar medidas</h2>
        <form data-acao="salvar-medida">
          <label>Data<input type="date" name="d" value="${iso()}" required></label>
          <div class="grade-2">
            <label>Peso (kg)<input type="number" name="peso" step="0.1" inputmode="decimal"></label>
            <label>Cintura (cm)<input type="number" name="cintura" step="0.5" inputmode="decimal"></label>
            <label>Sono (horas)<input type="number" name="sono" step="0.5" inputmode="decimal"></label>
            <label>Energia (1 a 5)<select name="energia"><option value="">—</option>${[1, 2, 3, 4, 5].map((v) => `<option>${v}</option>`).join("")}</select></label>
            <label>Apetite (1 a 5)<select name="apetite"><option value="">—</option>${[1, 2, 3, 4, 5].map((v) => `<option>${v}</option>`).join("")}</select></label>
            <label>Intestino<select name="intestino"><option value="">—</option><option>Normal</option><option>Preso</option><option>Solto</option></select></label>
          </div>
          <label>Observação<textarea name="obs" placeholder="Como se sentiu, dores, enjoo…"></textarea></label>
          <button class="btn primario largo">Salvar</button>
        </form>
      </section>
      <section class="cartao">
        <h2>Peso</h2>${grafico(pesos.map((m) => ({ d: m.d, y: Number(m.peso) })), "kg")}
        <h2 style="margin-top:1rem">Cintura</h2>${grafico(med.filter((m) => m.cintura).map((m) => ({ d: m.d, y: Number(m.cintura) })), "cm")}
      </section>
      <section class="cartao">
        <h2>Registrar corrida</h2>
        <form data-acao="salvar-corrida">
          <label>Data<input type="date" name="d" value="${iso()}" required></label>
          <div class="grade-2">
            <label>Distância (km)<input type="number" name="km" step="0.01" inputmode="decimal" required></label>
            <label>Tempo (min)<input type="number" name="min" step="0.1" inputmode="decimal" required></label>
          </div>
          <button class="btn primario largo">Salvar corrida</button>
        </form>
        <h3 style="margin-top:1rem">Ritmo (min/km — quanto menor, melhor)</h3>
        ${grafico(cor.map((c) => ({ d: c.d, y: c.min / c.km })), "min/km")}
        ${cor.length ? `<table class="tabela" style="margin-top:.6rem"><thead><tr><th>Data</th><th>km</th><th>Tempo</th><th>Ritmo</th><th></th></tr></thead><tbody>
          ${cor.slice().reverse().map((c) => `<tr><td>${dataBR(c.d)}</td><td>${String(c.km).replace(".", ",")}</td><td>${String(c.min).replace(".", ",")} min</td><td>${paceTxt(c.min, c.km)}</td><td><button class="btn pequeno perigo" data-acao="del" data-tipo="corridas" data-d="${c.d}" data-t="${c.t}" aria-label="Apagar">✕</button></td></tr>`).join("")}
        </tbody></table>` : ""}
      </section>
      <section class="cartao">
        <h2>Histórico</h2>
        ${med.length ? `<div class="rolar"><table class="tabela"><thead><tr><th>Data</th><th>Peso</th><th>Cintura</th><th>Sono</th><th>Energia</th><th>Apetite</th><th>Intestino</th><th></th></tr></thead><tbody>
          ${med.slice().reverse().map((m) => `<tr><td>${dataBR(m.d)}</td><td>${m.peso || "—"}</td><td>${m.cintura || "—"}</td><td>${m.sono || "—"}</td><td>${m.energia || "—"}</td><td>${m.apetite || "—"}</td><td>${esc(m.intestino || "—")}</td><td><button class="btn pequeno perigo" data-acao="del" data-tipo="medidas" data-d="${m.d}" aria-label="Apagar">✕</button></td></tr>${m.obs ? `<tr><td></td><td colspan="7" class="mudo">${esc(m.obs)}</td></tr>` : ""}`).join("")}
        </tbody></table></div>` : `<p class="mudo">Sem registros ainda. Sugestão: pesar 1 vez por semana, no mesmo dia e horário, em jejum.</p>`}
      </section>
    </div>`;
  };
  ACOES.pessoa = (el) => { ui.pessoa = el.dataset.p; render(); };
  ACOES["salvar-medida"] = (f) => {
    const v = Object.fromEntries(new FormData(f)); const k = "medidas:" + ui.pessoa;
    const reg = {}; Object.entries(v).forEach(([a, b]) => { if (b !== "") reg[a] = ["peso", "cintura", "sono"].includes(a) ? Number(b) : b; });
    if (Object.keys(reg).length < 2) { toast("Preencha pelo menos um campo."); return; }
    const lista = Store.get(k, []).filter((m) => m.d !== reg.d);
    Store.set(k, [...lista, reg]); toast("Medidas salvas"); render();
  };
  ACOES["salvar-corrida"] = (f) => {
    const v = Object.fromEntries(new FormData(f)); const k = "corridas:" + ui.pessoa;
    const reg = { d: v.d, km: Number(v.km), min: Number(v.min), t: Date.now() };
    if (!reg.km || !reg.min) { toast("Informe distância e tempo."); return; }
    Store.set(k, [...Store.get(k, []), reg]); toast("Corrida salva: " + paceTxt(reg.min, reg.km)); render();
  };
  ACOES.del = (el) => {
    if (!confirm("Apagar este registro?")) return;
    const k = el.dataset.tipo + ":" + ui.pessoa;
    const lista = Store.get(k, []).filter((m) => el.dataset.tipo === "corridas" ? String(m.t) !== el.dataset.t : m.d !== el.dataset.d);
    Store.set(k, lista); render();
  };

  // ---------- ORIENTAÇÕES ----------
  TELAS.orientacoes = () => `
    <div class="grade">
      ${ORIENTACOES.map((o) => `<section class="cartao"><h3>${esc(o.t.replace("Mãe", N.mae))}</h3><p>${esc(o.d)}</p></section>`).join("")}
      <section class="cartao">
        <h3>🔒 Sobre os dados</h3>
        <p>${Store.user ? "Os registros ficam na nuvem (Supabase), visíveis só com o login da família." : "Modo local: os registros ficam só neste aparelho. Configure o Supabase (veja o README) para usar em vários aparelhos."}</p>
        <p class="mudo">Este plano é educativo e não substitui médico ou nutricionista.</p>
      </section>
    </div>`;

  return { iniciar, render, Store, ACOES, TELAS, POS, dataBR, esc, iso, toast, falar, abrirModal, fecharModal, receitaPorId, N };
})();
