// ============================================================
// FAMÍLIA SAUDÁVEL — lógica da plataforma
// ============================================================
const App = (() => {
  const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"];
  const ORDEM = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"];
  const DIA_NOME = { seg: "Segunda", ter: "Terça", qua: "Quarta", qui: "Quinta", sex: "Sexta", sab: "Sábado", dom: "Domingo" };
  const GRUPOS = [
    { id: "inicio", em: "🏠", nome: "Início", abas: [["inicio", "Início"], ["hoje", "Hoje"]] },
    { id: "comer", em: "🍽️", nome: "Comer", abas: [["cardapio", "Cardápio"], ["receitas", "Receitas"], ["compras", "Compras"], ["shot", "Shot e chás"]] },
    { id: "mover", em: "🏃", nome: "Mover", abas: [["treinos", "Treinos"], ["provas", "Corridas e provas"], ["relogio", "Relógio"]] },
    { id: "familia", em: "⭐", nome: "Família", abas: [["criancas", "Crianças"], ["acompanhar", "Acompanhar"]] },
    { id: "mais", em: "⚙️", nome: "Mais", abas: [["ajustes", "Ajustes"], ["orientacoes", "Orientações"]] }
  ];
  const ABAS = GRUPOS.flatMap((g) => g.abas);
  const N = CONFIG.NOMES;
  const ui = { editar: false, cardSemana: null, treinoSemana: null, treinoDia: null, cat: "todas", busca: "", pessoa: "pai" };
  const ACOES = {};
  const TELAS = {};
  const aoCarregar = [];
  const edBtn = (acao, attrs = "", txt = "✏️ Editar") => ui.editar ? `<button type="button" class="btn pequeno ed" data-acao="${acao}" ${attrs}>${txt}</button>` : "";
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
    aplicarPerfis();
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
    aplicarPerfis();
    render();
  }
  function montarAbas() {
    const aba = abaAtual(); const g = GRUPOS.find((x) => x.abas.some((a) => a[0] === aba));
    $("#abas").innerHTML = g.abas.map(([id, nome]) => `<button class="aba" data-acao="ir" data-aba="${id}">${nome}</button>`).join("");
    $("#nav").innerHTML = GRUPOS.map((x) => `<button class="nav-btn ${x === g ? "ativo" : ""}" data-acao="ir" data-aba="${x.abas[0][0]}"><span class="em">${x.em}</span>${x.nome}</button>`).join("");
    $("#btn-editar").classList.toggle("ligado", ui.editar);
    document.body.classList.toggle("editando", ui.editar);
  }
  function abaAtual() { const h = location.hash.slice(1); return ABAS.some((a) => a[0] === h) ? h : "inicio"; }
  function render() {
    const aba = abaAtual();
    montarAbas();
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
  ACOES["modo-editar"] = () => { ui.editar = !ui.editar; toast(ui.editar ? "Modo edição ligado: toque nos botões ✏️" : "Modo edição desligado"); render(); };


  // ---------- perfis da família ----------
  const MEMBROS = ["pai", "mae", "c1", "c2"];
  const ehCrianca = (p) => p === "c1" || p === "c2";
  function aplicarPerfis() {
    aoCarregar.forEach((f) => f());
    const pf = Store.get("perfis", {});
    MEMBROS.forEach((k) => {
      const x = pf[k] || {};
      if (x.nome) N[k] = x.nome;
      if (x.idade) CONFIG.IDADES[k] = Number(x.idade);
      if (x.agua && !ehCrianca(k)) CONFIG.AGUA[k] = Number(x.agua);
    });
  }
  function perfil(k) { return (Store.get("perfis", {})[k]) || {}; }
  function abrirPerfis() {
    const pf = Store.get("perfis", {});
    const campo = (k, nome, rot, tipo = "text", extra = "") => `<label>${rot}<input type="${tipo}" name="${k}_${nome}" value="${esc((pf[k] || {})[nome] || "")}" ${extra}></label>`;
    abrirModal(`
      <h2>👤 Perfis da família</h2>
      <p class="mudo">Estes dados ficam ${Store.user ? "na nuvem, protegidos pelo login" : "só neste aparelho"} — não vão para o GitHub.</p>
      <form data-acao="salvar-perfis">
        <label>Nome da família (aparece na abertura)<input name="familia" value="${esc(pf.familia || "")}" placeholder="Família Martins"></label>
        ${MEMBROS.map((k) => `
          <div class="cartao" style="padding:.8rem">
            <h3>${ehCrianca(k) ? "🧒" : "🧑"} ${esc(N[k])}</h3>
            <div class="grade-2">
              ${campo(k, "nome", "Nome ou apelido", "text", 'maxlength="20"')}
              ${campo(k, "idade", "Idade (anos)", "number", 'inputmode="numeric"')}
              ${campo(k, "altura", "Altura (cm)", "number", 'inputmode="numeric"')}
              ${ehCrianca(k) ? campo(k, "escola", "Série / turma") : campo(k, "agua", "Meta de água (copos)", "number", 'inputmode="numeric"')}
            </div>
            ${campo(k, "objetivo", ehCrianca(k) ? "Desafio do mês" : "Objetivo", "text", `placeholder="${ehCrianca(k) ? "Provar 3 legumes novos" : "Correr 5 km sem parar"}"`)}
            ${campo(k, "gosta", "Gosta muito de")}
            ${campo(k, "evita", "Não gosta / evita")}
            <label>Observações<textarea name="${k}_obs" placeholder="${ehCrianca(k) ? "Horário da escola, atividades…" : "Orientações do médico, cuidados…"}">${esc((pf[k] || {}).obs || "")}</textarea></label>
          </div>`).join("")}
        <button class="btn primario largo">Salvar perfis</button>
      </form>`);
  }
  ACOES.perfis = () => abrirPerfis();
  ACOES["salvar-perfis"] = (f) => {
    const fd = new FormData(f); const pf = { ...Store.get("perfis", {}) };
    pf.familia = (fd.get("familia") || "").trim();
    MEMBROS.forEach((k) => {
      const x = {};
      ["nome", "idade", "altura", "agua", "escola", "objetivo", "gosta", "evita", "obs"].forEach((c) => { const v = fd.get(k + "_" + c); if (v !== null && String(v).trim() !== "") x[c] = String(v).trim(); });
      pf[k] = x;
    });
    Store.set("perfis", pf); aplicarPerfis(); fecharModal(); toast("Perfis salvos"); render();
  };

  // ---------- fotos (Supabase Storage privado ou aparelho) ----------
  const BUCKET = "fotos-familia";
  const urlCache = {};
  const novoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const Fotos = {
    nuvem: () => !!(Store.sb && Store.user),
    novoId,
    carregar(file) {
      return new Promise((ok, erro) => {
        const url = URL.createObjectURL(file); const img = new Image();
        img.onload = () => { ok(img); URL.revokeObjectURL(url); };
        img.onerror = () => { erro(new Error("imagem")); URL.revokeObjectURL(url); };
        img.src = url;
      });
    },
    async comprimir(file, max, q) {
      const img = await this.carregar(file);
      const f = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * f); c.height = Math.round(img.height * f);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      return new Promise((ok) => c.toBlob(ok, "image/jpeg", q));
    },
    // salva uma foto e devolve {id, path} (nuvem) ou {id, local} (aparelho); null se falhar
    async salvar(file, pasta) {
      try {
        const id = novoId();
        if (this.nuvem()) {
          const blob = await this.comprimir(file, 1600, 0.8);
          const path = `${Store.user.id}/${pasta}/${id}.jpg`;
          const { error } = await Store.sb.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg" });
          if (error) throw error;
          return { id, path };
        }
        const blob = await this.comprimir(file, 1000, 0.7);
        const dados = await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(blob); });
        try { localStorage.setItem("teste-espaco", dados); localStorage.removeItem("teste-espaco"); }
        catch (e) { toast("Sem espaço no aparelho. Configure o Supabase para guardar mais fotos."); return null; }
        Store.set("foto:" + id, dados);
        return { id, local: true };
      } catch (e) { console.error(e); toast("Uma foto não foi enviada. Tente de novo."); return null; }
    },
    async url(f) {
      if (f.local) return Store.get("foto:" + f.id, "");
      if (urlCache[f.path]) return urlCache[f.path];
      if (!this.nuvem()) return "";
      const { data } = await Store.sb.storage.from(BUCKET).createSignedUrl(f.path, 3600);
      urlCache[f.path] = (data && data.signedUrl) || "";
      return urlCache[f.path];
    },
    async apagar(fotos) {
      const caminhos = fotos.filter((f) => f.path).map((f) => f.path);
      if (caminhos.length && this.nuvem()) await Store.sb.storage.from(BUCKET).remove(caminhos);
      fotos.filter((f) => f.local).forEach((f) => { delete Store.cache["foto:" + f.id]; Store.salvarLocal(); });
    },
    // preenche todas as <img data-foto-json> da tela
    preencher() {
      document.querySelectorAll("img[data-foto]").forEach(async (img) => {
        try { img.src = await Fotos.url(JSON.parse(img.dataset.foto)); } catch (e) { /* ignora */ }
      });
    }
  };
  const fotoAttr = (f) => esc(JSON.stringify(f));

  // ---------- INÍCIO (abertura) ----------
  const FRASES = [
    "Juntos, um passo de cada vez.",
    "Comida de verdade, família de verdade.",
    "Cada treino conta. Cada jantar juntos também.",
    "Hoje é dia de cuidar da gente.",
    "Devagar se vai longe — e em família, mais longe ainda.",
    "Saúde é o melhor presente que a gente dá um ao outro.",
    "Pequenas escolhas, todos os dias."
  ];
  TELAS.inicio = () => {
    const capa = Store.get("capa", []);
    const pf = Store.get("perfis", {});
    const d = diaKey(), sem = semanaCiclo();
    const frase = FRASES[(new Date().getDate()) % FRASES.length];
    const evs = Store.get("eventos", []).filter((e) => e.status === "inscrito" && e.data >= iso()).sort((a, b) => a.data.localeCompare(b.data));
    const prox = evs[0];
    const dias = prox ? Math.round((new Date(prox.data + "T00:00:00") - new Date(iso() + "T00:00:00")) / 86400000) : 0;
    const atalhos = [["hoje", "📅", "Hoje"], ["cardapio", "🍽️", "Cardápio"], ["treinos", "🏃", "Treinos"], ["provas", "🏅", "Corridas"], ["criancas", "⭐", "Crianças"], ["compras", "🛒", "Compras"]];
    return `
    <section class="capa">
      ${capa.length ? `<div class="capa-fotos n${Math.min(capa.length, 4)}">${capa.slice(0, 4).map((f) => `<button class="capa-foto" data-acao="ver-capa" data-id="${f.id}"><img alt="Foto da família" data-foto="${fotoAttr(f)}"></button>`).join("")}</div>`
        : `<div class="capa-vazia"><div style="font-size:3rem">📸</div><p>Coloque aqui as fotos da família</p></div>`}
      <div class="capa-texto">
        <h1>${esc(pf.familia || "Nossa família")}</h1>
        <p>${esc(frase)}</p>
      </div>
    </section>
    <div class="chips" style="margin:-.3rem 0 1rem">
      ${capa.length < 4 ? `<label class="btn pequeno" style="margin:0;color:var(--texto)">📷 ${capa.length ? "Adicionar foto" : "Escolher até 4 fotos"}<input type="file" accept="image/*" multiple class="oculto" data-acao="capa-add"></label>` : ""}
      <button class="btn pequeno" data-acao="perfis">👤 Perfis da família</button>
    </div>
    <div class="atalhos">${atalhos.map(([id, em, t]) => `<button class="atalho" data-acao="ir" data-aba="${id}"><span class="em">${em}</span>${t}</button>`).join("")}</div>
    <div class="grade" style="margin-top:1rem">
      <section class="cartao destaque">
        <h2>Hoje · ${DIA_NOME[d]}</h2>
        <div class="refeicao"><div class="refeicao-titulo">Treino</div>${esc(TREINOS[d].titulo)}</div>
        <div class="refeicao"><div class="refeicao-titulo">Jantar em família</div>${linksReceitas(CARDAPIO[sem][d].jantar)}</div>
        <div class="refeicao"><div class="refeicao-titulo">Shot</div>${esc(SHOT.rotacao[d][1])}</div>
      </section>
      <section class="cartao">
        <h2>🏅 Próxima prova</h2>
        ${prox ? `<p style="font-size:1.15rem"><strong>${esc(prox.nome)}</strong></p><p>${dataBR(prox.data)} · ${String(prox.km).replace(".", ",")} km</p><p class="tag roxo" style="font-size:1rem">${dias === 0 ? "É hoje! 🎉" : "Faltam " + dias + " dias"}</p>`
          : `<p class="mudo">Nenhuma inscrição ainda.</p><button class="btn pequeno" data-acao="ir" data-aba="provas">Registrar inscrição</button>`}
      </section>
      <section class="cartao">
        <h2>👨‍👩‍👦‍👦 A família</h2>
        ${MEMBROS.map((k) => { const x = pf[k] || {}; return `<div class="refeicao"><strong>${esc(N[k])}</strong>${x.idade ? ` · ${esc(x.idade)} anos` : ""}${x.objetivo ? `<div class="mudo">🎯 ${esc(x.objetivo)}</div>` : ""}</div>`; }).join("")}
        <button class="btn pequeno" style="margin-top:.6rem" data-acao="perfis">Editar perfis</button>
      </section>
    </div>`;
  };
  POS.inicio = () => Fotos.preencher();
  ACOES["capa-add"] = async (el) => {
    const arq = [...el.files]; el.value = "";
    const capa = Store.get("capa", []);
    const vagas = 4 - capa.length;
    if (arq.length > vagas) toast(`Cabem só mais ${vagas} foto(s). Usei as primeiras.`);
    toast("Enviando fotos…");
    const novas = [];
    for (const f of arq.slice(0, vagas)) { const r = await Fotos.salvar(f, "capa"); if (r) novas.push(r); }
    Store.set("capa", [...Store.get("capa", []), ...novas]);
    if (novas.length) toast("Fotos da família salvas 📸");
    render();
  };
  ACOES["ver-capa"] = async (el) => {
    const f = Store.get("capa", []).find((x) => x.id === el.dataset.id); if (!f) return;
    const url = await Fotos.url(f);
    abrirModal(`<img src="${url}" alt="Foto da família" style="width:100%;border-radius:12px;display:block">
      <div class="chips" style="margin-top:.8rem"><button class="btn pequeno perigo" data-acao="capa-remover" data-id="${f.id}">Tirar da abertura</button></div>`);
  };
  ACOES["capa-remover"] = async (el) => {
    if (!confirm("Tirar esta foto da abertura?")) return;
    const capa = Store.get("capa", []); const f = capa.find((x) => x.id === el.dataset.id);
    if (f) await Fotos.apagar([f]);
    Store.set("capa", capa.filter((x) => x.id !== el.dataset.id)); fecharModal(); render();
  };

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
      ${edBtn("ed-receita", `data-id="${r.id}"`, "✏️ Editar esta receita")} <button class="btn largo" data-acao="fav" data-id="${r.id}">${fav ? "★ Tirar das favoritas" : "☆ Marcar como favorita"}</button>`);
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
        <h2>Rotina de hoje ${edBtn("ed-rotina")}</h2>
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
          <div class="refeicao"><div class="refeicao-titulo">Café da manhã ${d === "sab" || d === "dom" ? "7:30" : "6:20"}</div>${linksReceitas(c.cafe)}${edBtn("ed-refeicao", `data-s="${sem}" data-d="${d}" data-r="cafe"`)}</div>
          <div class="refeicao"><div class="refeicao-titulo">Almoço${["sab", "dom"].includes(d) ? " em família" : " (crianças na escola)"}</div>${linksReceitas(c.almoco)}${edBtn("ed-refeicao", `data-s="${sem}" data-d="${d}" data-r="almoco"`)}</div>
          <div class="refeicao"><div class="refeicao-titulo">Lanche 16:00</div>${linksReceitas(c.lanche)}${edBtn("ed-refeicao", `data-s="${sem}" data-d="${d}" data-r="lanche"`)}</div>
          ${pre ? `<div class="refeicao"><div class="refeicao-titulo">Pré-treino (adultos)</div><div>${esc(pre)}</div></div>` : ""}
          <div class="refeicao"><div class="refeicao-titulo">Jantar em família</div>${linksReceitas(c.jantar)}${edBtn("ed-refeicao", `data-s="${sem}" data-d="${d}" data-r="jantar"`)}</div>
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
          <div class="refeicao"><div class="refeicao-titulo">Café da manhã</div>${linksReceitas(c.cafe)}${edBtn("ed-refeicao", `data-s="${sem}" data-d="${d}" data-r="cafe"`)}</div>
          <div class="refeicao"><div class="refeicao-titulo">Almoço</div>${linksReceitas(c.almoco)}${edBtn("ed-refeicao", `data-s="${sem}" data-d="${d}" data-r="almoco"`)}</div>
          <div class="refeicao"><div class="refeicao-titulo">Lanche 16:00</div>${linksReceitas(c.lanche)}${edBtn("ed-refeicao", `data-s="${sem}" data-d="${d}" data-r="lanche"`)}</div>
          <div class="refeicao"><div class="refeicao-titulo">Jantar</div>${linksReceitas(c.jantar)}${edBtn("ed-refeicao", `data-s="${sem}" data-d="${d}" data-r="jantar"`)}</div>
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
      <h2>Receitas (${RECEITAS.length}) ${edBtn("ed-receitas", "", "✏️ Gerenciar receitas")}</h2>
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
    const marc = Store.get("compras", []).filter((x) => typeof x === "string" && COMPRAS.some((c) => c[1] === x));
    const total = COMPRAS.reduce((a, c) => a + (Number(c[3]) || 0), 0);
    const marcado = COMPRAS.reduce((a, c, i) => a + (marc.includes(c[1]) ? Number(c[3]) || 0 : 0), 0);
    const pago = Store.get("pago", { c1: "", c2: "" });
    const totalPago = (Number(pago.c1) || 0) + (Number(pago.c2) || 0);
    const grupos = [...new Set(COMPRAS.map((c) => c[0]))];
    const seg = iso(segundaDaSemana());
    const prep = Store.get("preparo:" + seg, []);
    return `
    <section class="cartao destaque">
      <h2>Lista de 14 dias ${edBtn("ed-compras", "", "✏️ Editar lista")}</h2>
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
          <label class="check ${marc.includes(c[1]) ? "feito" : ""}">
            <input type="checkbox" data-acao="compra" data-n="${esc(c[1])}" ${marc.includes(c[1]) ? "checked" : ""}>
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
    const n = el.dataset.n; let m = Store.get("compras", []).filter((x) => typeof x === "string");
    m = el.checked ? [...new Set([...m, n])] : m.filter((x) => x !== n); Store.set("compras", m); render();
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
      <h2>Treinos em casa · 19:00</h2>
      <div class="chips">${[1, 2].map((s) => `<button class="chip ${s === sem ? "ativo" : ""}" data-acao="treino-semana" data-s="${s}">Semana ${s}${s === atual ? " (atual)" : ""}</button>`).join("")}</div>
      <div class="chips">${ORDEM.map((d) => `<button class="chip ${d === dia ? "ativo" : ""}" data-acao="treino-dia" data-d="${d}">${DIA_NOME[d].slice(0, 3)}${d === diaKey() ? " •" : ""}</button>`).join("")}</div>
    </section>
    <section class="cartao">
      <h2>${DIA_NOME[dia]} · ${esc(t.titulo)}</h2>
      ${t.equip ? `<p class="mudo">🧰 ${esc(t.equip)}</p>` : ""}
      ${t.nota ? `<p class="mudo">${esc(t.nota)}</p>` : ""}
      <div class="chips">${edBtn("ed-treino-dia", `data-d="${dia}"`, "✏️ Título, nota e corrida")}${edBtn("ed-blocos", `data-d="${dia}"`, "✏️ Blocos do treino")}</div>
      ${t.blocos.map((b, bi) => `
        <h3 style="margin-top:.9rem">${esc(b.nome)} ${edBtn("ed-exercicios", `data-d="${dia}" data-b="${bi}"`, "✏️ Exercícios")}</h3>
        ${b.itens.map((it) => { const i = n++; return `
          <label class="exercicio2">
            <input type="checkbox" data-acao="ex" data-k="${exKey}" data-i="${i}" ${exFeitos.includes(i) ? "checked" : ""}>
            <span class="exfig">${FIGURAS[it[3]] || ""}</span>
            <span class="extxt"><strong>${esc(it[0])}</strong>
              ${it[6] ? `<small>${esc(it[6])}</small>` : ""}
              <span>${it[4] ? `<span class="tag azul">${esc(N.pai)}: ${esc(it[4])}</span>` : ""}${it[5] ? `<span class="tag rosa">${esc(N.mae)}: ${esc(it[5])}</span>` : ""}</span>
            </span>
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
        <thead><tr><th>Dia</th><th>Treino</th><th>Corrida</th></tr></thead>
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
    const p = ui.pessoa; const kid = ehCrianca(p); const x = perfil(p);
    const med = Store.get("medidas:" + p, []).slice().sort((a, b) => a.d.localeCompare(b.d));
    const cor = Store.get("corridas:" + p, []).slice().sort((a, b) => a.d.localeCompare(b.d));
    let treinos7 = 0, agua7 = 0;
    for (let i = 0; i < 7; i++) {
      const dd = new Date(); dd.setDate(dd.getDate() - i); const k = iso(dd);
      if (Store.get("treino:" + k, {})[p]) treinos7++;
      agua7 += (Store.get("agua:" + k, {})[p] || 0);
    }
    const pesos = med.filter((m) => m.peso), alturas = med.filter((m) => m.altura);
    const ultimo = pesos[pesos.length - 1], primeiro = pesos[0];
    const variacao = ultimo && primeiro && ultimo !== primeiro ? (ultimo.peso - primeiro.peso) : null;
    const altAtual = alturas.length ? alturas[alturas.length - 1].altura : x.altura;
    const caixa = (cor_, rot, val) => `<div class="cartao" style="margin:0;background:var(--${cor_})"><div class="mudo">${rot}</div><div style="font-size:1.6rem;font-weight:700">${val}</div></div>`;
    const opcoes = (n) => `<option value="">—</option>${[1, 2, 3, 4, 5].map((v) => `<option>${v}</option>`).join("")}`;
    return `
    <section class="cartao destaque">
      <h2>Acompanhamento</h2>
      <div class="chips">${MEMBROS.map((k) => `<button class="chip ${k === p ? "ativo" : ""}" data-acao="pessoa" data-p="${k}">${ehCrianca(k) ? "🧒" : "🧑"} ${esc(N[k])}</button>`).join("")}</div>
      <div class="perfil-linha">
        <div><strong>${esc(N[p])}</strong>${x.idade ? ` · ${esc(x.idade)} anos` : ""}${altAtual ? ` · ${esc(altAtual)} cm` : ""}
          ${x.objetivo ? `<div class="mudo">🎯 ${esc(x.objetivo)}</div>` : ""}
          ${x.gosta ? `<div class="mudo">💚 Gosta: ${esc(x.gosta)}</div>` : ""}
          ${x.evita ? `<div class="mudo">🚫 Evita: ${esc(x.evita)}</div>` : ""}
          ${x.obs ? `<div class="mudo">📝 ${esc(x.obs)}</div>` : ""}</div>
        <button class="btn pequeno" data-acao="perfis">✏️ Editar perfil</button>
      </div>
      <div class="grade-2" style="margin-top:.8rem">
        ${kid ? caixa("verde-claro", "Peso atual", ultimo ? String(ultimo.peso).replace(".", ",") + " kg" : "—") + caixa("azul-claro", "Altura atual", altAtual ? altAtual + " cm" : "—")
          : caixa("verde-claro", "Treinos (7 dias)", treinos7) + caixa("azul-claro", "Água média/dia", (agua7 / 7).toFixed(1).replace(".", ",") + ' <span style="font-size:.9rem">copos</span>')
            + caixa("laranja-claro", "Peso atual", ultimo ? String(ultimo.peso).replace(".", ",") + " kg" : "—")
            + caixa("roxo-claro", "Desde o início", variacao === null ? "—" : (variacao > 0 ? "+" : "") + variacao.toFixed(1).replace(".", ",") + " kg")}
      </div>
    </section>
    <div class="grade">
      <section class="cartao">
        <h2>Registrar ${kid ? "crescimento" : "medidas"}</h2>
        <form data-acao="salvar-medida">
          <label>Data<input type="date" name="d" value="${iso()}" required></label>
          <div class="grade-2">
            <label>Peso (kg)<input type="number" name="peso" step="0.1" inputmode="decimal"></label>
            ${kid ? `<label>Altura (cm)<input type="number" name="altura" step="0.5" inputmode="decimal"></label>` : `
            <label>Cintura (cm)<input type="number" name="cintura" step="0.5" inputmode="decimal"></label>
            <label>Sono (horas)<input type="number" name="sono" step="0.5" inputmode="decimal"></label>
            <label>Energia (1 a 5)<select name="energia">${opcoes()}</select></label>
            <label>Apetite (1 a 5)<select name="apetite">${opcoes()}</select></label>
            <label>Intestino<select name="intestino"><option value="">—</option><option>Normal</option><option>Preso</option><option>Solto</option></select></label>`}
          </div>
          <label>Observação<textarea name="obs" placeholder="${kid ? "Consulta no pediatra, como está comendo…" : "Como se sentiu, dores, enjoo…"}"></textarea></label>
          <button class="btn primario largo">Salvar</button>
        </form>
      </section>
      <section class="cartao">
        <h2>Peso</h2>${grafico(pesos.map((m) => ({ d: m.d, y: Number(m.peso) })), "kg")}
        ${kid ? `<h2 style="margin-top:1rem">Altura</h2>${grafico(alturas.map((m) => ({ d: m.d, y: Number(m.altura) })), "cm")}`
          : `<h2 style="margin-top:1rem">Cintura</h2>${grafico(med.filter((m) => m.cintura).map((m) => ({ d: m.d, y: Number(m.cintura) })), "cm")}`}
      </section>
      <section class="cartao">
        <h2>Registrar corrida de treino</h2>
        <form data-acao="salvar-corrida">
          <label>Data<input type="date" name="d" value="${iso()}" required></label>
          <div class="grade-2">
            <label>Distância (km)<input type="number" name="km" step="0.01" inputmode="decimal" required></label>
            <label>Tempo (min)<input type="number" name="min" step="0.1" inputmode="decimal" required></label>
          </div>
          <button class="btn primario largo">Salvar corrida</button>
        </form>
        <p class="mudo" style="margin-top:.5rem">Provas e eventos oficiais ficam na aba 🏅 Provas.</p>
        <h3 style="margin-top:1rem">Ritmo (min/km — quanto menor, melhor)</h3>
        ${grafico(cor.map((c) => ({ d: c.d, y: c.min / c.km })), "min/km")}
        ${cor.length ? `<table class="tabela" style="margin-top:.6rem"><thead><tr><th>Data</th><th>km</th><th>Tempo</th><th>Ritmo</th><th></th></tr></thead><tbody>
          ${cor.slice().reverse().map((c) => `<tr><td>${dataBR(c.d)}</td><td>${String(c.km).replace(".", ",")}</td><td>${String(c.min).replace(".", ",")} min</td><td>${paceTxt(c.min, c.km)}</td><td><button class="btn pequeno perigo" data-acao="del" data-tipo="corridas" data-d="${c.d}" data-t="${c.t}" aria-label="Apagar">✕</button></td></tr>`).join("")}
        </tbody></table>` : ""}
      </section>
      <section class="cartao">
        <h2>Histórico</h2>
        ${med.length ? `<div class="rolar"><table class="tabela"><thead><tr><th>Data</th><th>Peso</th>${kid ? "<th>Altura</th>" : "<th>Cintura</th><th>Sono</th><th>Energia</th><th>Apetite</th><th>Intestino</th>"}<th></th></tr></thead><tbody>
          ${med.slice().reverse().map((m) => `<tr><td>${dataBR(m.d)}</td><td>${m.peso || "—"}</td>${kid ? `<td>${m.altura || "—"}</td>` : `<td>${m.cintura || "—"}</td><td>${m.sono || "—"}</td><td>${m.energia || "—"}</td><td>${m.apetite || "—"}</td><td>${esc(m.intestino || "—")}</td>`}<td><button class="btn pequeno perigo" data-acao="del" data-tipo="medidas" data-d="${m.d}" aria-label="Apagar">✕</button></td></tr>${m.obs ? `<tr><td></td><td colspan="${kid ? 3 : 7}" class="mudo">${esc(m.obs)}</td></tr>` : ""}`).join("")}
        </tbody></table></div>` : `<p class="mudo">Sem registros ainda. ${kid ? "Sugestão: medir peso e altura 1 vez por mês." : "Sugestão: pesar 1 vez por semana, no mesmo dia e horário, em jejum."}</p>`}
      </section>
    </div>`;
  };
  ACOES.pessoa = (el) => { ui.pessoa = el.dataset.p; render(); };
  ACOES["salvar-medida"] = (f) => {
    const v = Object.fromEntries(new FormData(f)); const k = "medidas:" + ui.pessoa;
    const reg = {}; Object.entries(v).forEach(([a, b]) => { if (b !== "") reg[a] = ["peso", "cintura", "sono", "altura"].includes(a) ? Number(b) : b; });
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

  return { iniciar, render, Store, ACOES, TELAS, POS, Fotos, ui, edBtn, aoCarregar, grafico, MEMBROS, ehCrianca, perfil, semanaCiclo, diaKey, abrirReceita, abrirPerfis, ORDEM, DIA_NOME, dataBR, esc, iso, toast, falar, abrirModal, fecharModal, receitaPorId, N };
})();
