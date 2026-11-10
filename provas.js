// ============================================================
// FAMÍLIA SAUDÁVEL — provas e eventos de corrida (com fotos)
// ============================================================
(() => {
  const { Store, ACOES, TELAS, POS, Fotos, esc, iso, toast, abrirModal, fecharModal, dataBR, N } = App;
  const PESSOAS = ["pai", "mae", "c1", "c2"];
  const DISTANCIAS = [["1", "1 km (infantil)"], ["3", "3 km"], ["5", "5 km"], ["10", "10 km"], ["21.1", "21,1 km (meia)"], ["42.2", "42,2 km (maratona)"]];

  const novoId = Fotos.novoId;
  const nuvem = () => Fotos.nuvem();
  const eventos = () => Store.get("eventos", []);
  const salvar = (lista) => Store.set("eventos", lista);
  const kmTxt = (km) => String(km).replace(".", ",") + " km";

  // tempo "mm:ss" ou "h:mm:ss" -> segundos
  function segundos(t) {
    if (!t) return null;
    const p = String(t).trim().replace(",", ":").split(":").map((x) => Number(x));
    if (!p.length || p.some((x) => isNaN(x))) return null;
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
    if (p.length === 2) return p[0] * 60 + p[1];
    return p[0] * 60;
  }
  function formatar(s) {
    if (s == null) return "—";
    s = Math.round(s);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    const z = (n) => String(n).padStart(2, "0");
    return h ? `${h}:${z(m)}:${z(x)}` : `${m}:${z(x)}`;
  }
  const ritmo = (t, km) => { const s = segundos(t); return s && km ? formatar(s / km) + " /km" : "—"; };
  function diasAte(d) {
    const hoje = new Date(iso() + "T00:00:00"), alvo = new Date(d + "T00:00:00");
    return Math.round((alvo - hoje) / 86400000);
  }

  // ---------- fotos (usa App.Fotos) ----------
  async function enviarFotos(eventoId, arquivos) {
    if (!arquivos || !arquivos.length) return;
    toast(`Enviando ${arquivos.length} foto(s)…`);
    const novas = [];
    for (const f of arquivos) { const r = await Fotos.salvar(f, eventoId); if (r) novas.push(r); else if (!Fotos.nuvem()) break; }
    const lista = eventos(); const ev = lista.find((x) => x.id === eventoId);
    if (ev) { ev.fotos = [...(ev.fotos || []), ...novas]; salvar([...lista]); }
    if (novas.length) toast(`${novas.length} foto(s) salva(s) 📷`);
    App.render();
  }
  const urlFoto = (f) => Fotos.url(f);
  const apagarArquivos = (fotos) => Fotos.apagar(fotos);

  // ---------- tela ----------
  function recordes(lista) {
    const concl = lista.filter((e) => e.status === "concluido");
    const kms = [...new Set(concl.map((e) => Number(e.km)))].sort((a, b) => a - b);
    if (!kms.length) return `<p class="mudo">Os recordes aparecem quando houver provas concluídas com tempo.</p>`;
    const melhor = (p, km) => {
      let best = null;
      concl.filter((e) => Number(e.km) === km).forEach((e) => (e.resultados || []).forEach((r) => {
        const s = segundos(r.tempo); if (r.p === p && s && (best === null || s < best.s)) best = { s, ev: e };
      }));
      return best;
    };
    const quem = PESSOAS.filter((p) => kms.some((km) => melhor(p, km)));
    return `<div class="rolar"><table class="tabela"><thead><tr><th></th>${kms.map((k) => `<th>${kmTxt(k)}</th>`).join("")}</tr></thead><tbody>
      ${quem.map((p) => `<tr><th>${esc(N[p])}</th>${kms.map((k) => { const b = melhor(p, k); return `<td>${b ? `<strong>${formatar(b.s)}</strong><br><span class="mudo">${formatar(b.s / k)} /km · ${dataBR(b.ev.data)}</span>` : "—"}</td>`; }).join("")}</tr>`).join("")}
    </tbody></table></div>`;
  }
  function cartaoEvento(e) {
    const fotos = e.fotos || [];
    const res = e.resultados || [];
    const futuro = e.status === "inscrito";
    const d = diasAte(e.data);
    return `
    <section class="cartao ${futuro ? "destaque" : ""}">
      <h3>${futuro ? "🎯" : "🏅"} ${esc(e.nome)}</h3>
      <p><span class="tag">${dataBR(e.data)}/${e.data.slice(0, 4)}</span><span class="tag laranja">${kmTxt(e.km)}</span>${e.local ? `<span class="tag azul">${esc(e.local)}</span>` : ""}
        ${futuro ? `<span class="tag roxo">${d > 0 ? "faltam " + d + " dias" : d === 0 ? "é hoje!" : "inscrito"}</span>` : ""}</p>
      ${res.length ? `<table class="tabela"><thead><tr><th>Quem</th><th>${futuro ? "Meta" : "Tempo"}</th><th>Ritmo</th>${futuro ? "" : "<th>Colocação</th>"}</tr></thead><tbody>
        ${res.map((r) => `<tr><td><strong>${esc(N[r.p] || r.p)}</strong></td><td>${esc(r.tempo || "—")}</td><td>${ritmo(r.tempo, Number(e.km))}</td>${futuro ? "" : `<td>${[r.geral ? r.geral + "º geral" : "", r.cat ? r.cat + "º categoria" : ""].filter(Boolean).join("<br>") || "—"}</td>`}</tr>`).join("")}
      </tbody></table>` : ""}
      ${e.obs ? `<p class="mudo" style="margin-top:.5rem">${esc(e.obs)}</p>` : ""}
      ${fotos.length ? `<div class="galeria">${fotos.map((f) => `<button class="foto" data-acao="ver-foto" data-ev="${e.id}" data-f="${f.id}"><img alt="Foto da prova" data-ev="${e.id}" data-f="${f.id}"></button>`).join("")}</div>` : ""}
      <div class="chips" style="margin:.8rem 0 0">
        <label class="btn pequeno" style="margin:0;color:var(--texto)">📷 Adicionar fotos<input type="file" accept="image/*" multiple class="oculto" data-acao="add-fotos" data-id="${e.id}"></label>
        <button class="btn pequeno" data-acao="editar-prova" data-id="${e.id}">✏️ Editar${futuro ? " / lançar resultado" : ""}</button>
      </div>
    </section>`;
  }

  function planoHtml() {
    const semanaAtual = Math.floor((new Date(iso() + "T00:00:00") - new Date(CONFIG.DATA_INICIO + "T00:00:00")) / 6048e5) + 1;
    return `<section class="cartao"><h2>🗓️ Plano de corrida ${App.edBtn("ed-plano")}</h2>
      <p class="mudo">Progressão para os 5 km e, depois, os 10 km. Estamos na semana ${Math.max(1, semanaAtual)} do plano.</p>
      <div class="rolar"><table class="tabela"><thead><tr><th>Sem.</th><th>${esc(N.pai)}</th><th>${esc(N.mae)}</th></tr></thead><tbody>
      ${PLANO_CORRIDA.map((x) => `<tr style="${String(x.sem) === String(semanaAtual) ? "background:var(--amarelo-claro)" : ""}"><td><strong>${esc(x.sem)}</strong></td><td>${esc(x.pai)}</td><td>${esc(x.mae)}</td></tr>`).join("")}
      </tbody></table></div>
      <p class="mudo" style="margin-top:.5rem">${esc(N.mae)}: o trote só entra com a liberação do médico. Os treinos de corrida do dia a dia são anotados em Família → Acompanhar.</p></section>`;
  }
  TELAS.provas = () => {
    const lista = eventos().slice().sort((a, b) => b.data.localeCompare(a.data));
    const proximas = lista.filter((e) => e.status === "inscrito").sort((a, b) => a.data.localeCompare(b.data));
    const feitas = lista.filter((e) => e.status === "concluido");
    const totalKm = feitas.reduce((a, e) => a + Number(e.km) * (e.resultados || []).length, 0);
    return `
    <section class="cartao destaque">
      <h2>🏅 Provas e eventos</h2>
      <p class="mudo">Registre cada corrida da família: tempo, ritmo, colocação e fotos. ${nuvem() ? "As fotos ficam guardadas de forma privada no Supabase." : "Modo local: as fotos ficam só neste aparelho e cabem poucas. Configure o Supabase para guardar todas."}</p>
      <div class="grade-2" style="margin-bottom:.8rem">
        <div class="cartao" style="margin:0;background:var(--verde-claro)"><div class="mudo">Provas concluídas</div><div style="font-size:1.6rem;font-weight:700">${feitas.length}</div></div>
        <div class="cartao" style="margin:0;background:var(--laranja-claro)"><div class="mudo">Km somados em provas</div><div style="font-size:1.6rem;font-weight:700">${String(Math.round(totalKm * 10) / 10).replace(".", ",")}</div></div>
      </div>
      <button class="btn primario largo" data-acao="nova-prova">+ Registrar prova ou inscrição</button>
    </section>
    ${planoHtml()}
    <section class="cartao"><h2>🏆 Recordes pessoais</h2>${recordes(lista)}</section>
    ${proximas.length ? `<h2>Próximas provas</h2><div class="grade">${proximas.map(cartaoEvento).join("")}</div>` : ""}
    <h2 style="margin-top:.5rem">Histórico</h2>
    ${feitas.length ? `<div class="grade">${feitas.map(cartaoEvento).join("")}</div>` : `<p class="mudo">Nenhuma prova concluída ainda. A primeira 5 km vem aí!</p>`}`;
  };
  POS.provas = () => {
    document.querySelectorAll(".galeria img[data-f]").forEach(async (img) => {
      const ev = eventos().find((e) => e.id === img.dataset.ev);
      const f = ev && (ev.fotos || []).find((x) => x.id === img.dataset.f);
      if (f) img.src = await urlFoto(f);
    });
  };

  // ---------- formulário ----------
  function formulario(e) {
    const ed = !!e; e = e || { id: "", nome: "", data: iso(), local: "", km: "5", status: "concluido", resultados: [], obs: "" };
    const padrao = DISTANCIAS.some((d) => Number(d[0]) === Number(e.km));
    const r = (p) => (e.resultados || []).find((x) => x.p === p) || {};
    abrirModal(`
      <h2>${ed ? "Editar prova" : "Registrar prova"}</h2>
      <form data-acao="salvar-prova" data-id="${e.id}">
        <label>Nome do evento<input name="nome" required value="${esc(e.nome)}" placeholder="Corrida de Caxias 2026"></label>
        <div class="grade-2">
          <label>Data<input type="date" name="data" required value="${esc(e.data)}"></label>
          <label>Situação<select name="status"><option value="concluido" ${e.status === "concluido" ? "selected" : ""}>Concluída</option><option value="inscrito" ${e.status === "inscrito" ? "selected" : ""}>Inscritos (ainda vai acontecer)</option></select></label>
          <label>Distância<select name="km">${DISTANCIAS.map(([v, t]) => `<option value="${v}" ${padrao && Number(v) === Number(e.km) ? "selected" : ""}>${t}</option>`).join("")}<option value="outra" ${padrao ? "" : "selected"}>Outra</option></select></label>
          <label>Outra distância (km)<input type="number" step="0.1" inputmode="decimal" name="km_outra" value="${padrao ? "" : esc(e.km)}"></label>
        </div>
        <label>Local<input name="local" value="${esc(e.local)}" placeholder="Cidade ou bairro"></label>
        <h3>Quem participou</h3>
        <p class="mudo">Tempo como mm:ss (ex.: 32:15) ou h:mm:ss. Para prova futura, use como meta.</p>
        ${PESSOAS.map((p) => { const x = r(p); return `
          <div class="cartao" style="padding:.7rem .8rem;margin-bottom:.6rem">
            <label class="check" style="border:0;padding:0 0 .4rem"><input type="checkbox" name="part_${p}" ${x.p ? "checked" : ""}><span class="check-txt"><strong>${esc(N[p])}</strong></span></label>
            <div class="grade-2">
              <label>Tempo<input name="tempo_${p}" value="${esc(x.tempo || "")}" placeholder="32:15" inputmode="numeric"></label>
              <label>Colocação geral<input name="geral_${p}" type="number" value="${esc(x.geral || "")}"></label>
              <label>Colocação categoria<input name="cat_${p}" type="number" value="${esc(x.cat || "")}"></label>
            </div>
          </div>`; }).join("")}
        <label>Observações<textarea name="obs" placeholder="Clima, como se sentiu, quem foi torcer…">${esc(e.obs || "")}</textarea></label>
        ${ed ? "" : `<label>Fotos (pode escolher várias)<input type="file" name="fotos" accept="image/*" multiple></label>`}
        <button class="btn primario largo">Salvar</button>
        ${ed ? `<button type="button" class="btn largo perigo" style="margin-top:.6rem" data-acao="apagar-prova" data-id="${e.id}">Apagar prova</button>` : ""}
      </form>`);
  }
  ACOES["nova-prova"] = () => formulario(null);
  ACOES["editar-prova"] = (el) => formulario(eventos().find((e) => e.id === el.dataset.id));
  ACOES["salvar-prova"] = async (form) => {
    const fd = new FormData(form);
    const km = fd.get("km") === "outra" ? Number(fd.get("km_outra")) : Number(fd.get("km"));
    if (!km) { toast("Informe a distância."); return; }
    const resultados = PESSOAS.filter((p) => fd.get("part_" + p)).map((p) => ({
      p, tempo: (fd.get("tempo_" + p) || "").trim(), geral: fd.get("geral_" + p) || "", cat: fd.get("cat_" + p) || ""
    }));
    const invalido = resultados.find((r) => r.tempo && !segundos(r.tempo));
    if (invalido) { toast("Tempo de " + N[invalido.p] + " está em formato estranho. Use 32:15."); return; }
    const lista = eventos();
    const id = form.dataset.id || novoId();
    const antigo = lista.find((e) => e.id === id) || {};
    const ev = { ...antigo, id, nome: fd.get("nome").trim(), data: fd.get("data"), local: (fd.get("local") || "").trim(), km, status: fd.get("status"), resultados, obs: (fd.get("obs") || "").trim(), fotos: antigo.fotos || [] };
    salvar([...lista.filter((e) => e.id !== id), ev]);
    const arquivos = form.querySelector('input[type="file"]') ? [...form.querySelector('input[type="file"]').files] : [];
    fecharModal();
    toast(ev.status === "concluido" ? "Prova registrada! 🏅" : "Inscrição registrada! 🎯");
    if (location.hash !== "#provas") location.hash = "provas"; else App.render();
    if (arquivos.length) await enviarFotos(id, arquivos);
  };
  ACOES["apagar-prova"] = async (el) => {
    if (!confirm("Apagar esta prova e todas as fotos dela?")) return;
    const lista = eventos(); const ev = lista.find((e) => e.id === el.dataset.id);
    if (ev) await apagarArquivos(ev.fotos || []);
    salvar(lista.filter((e) => e.id !== el.dataset.id));
    fecharModal(); App.render();
  };
  ACOES["add-fotos"] = (el) => { const arq = [...el.files]; el.value = ""; enviarFotos(el.dataset.id, arq); };
  ACOES["ver-foto"] = async (el) => {
    const ev = eventos().find((e) => e.id === el.dataset.ev);
    const f = ev && (ev.fotos || []).find((x) => x.id === el.dataset.f);
    if (!f) return;
    const url = await urlFoto(f);
    abrirModal(`<h3>${esc(ev.nome)}</h3><img src="${url}" alt="Foto da prova" style="width:100%;border-radius:12px;display:block">
      <div class="chips" style="margin-top:.8rem">
        <a class="btn pequeno" href="${url}" download="prova.jpg" target="_blank" rel="noopener">⬇️ Baixar</a>
        <button class="btn pequeno perigo" data-acao="apagar-foto" data-ev="${ev.id}" data-f="${f.id}">Apagar foto</button>
      </div>`);
  };
  ACOES["apagar-foto"] = async (el) => {
    if (!confirm("Apagar esta foto?")) return;
    const lista = eventos(); const ev = lista.find((e) => e.id === el.dataset.ev); if (!ev) return;
    const f = (ev.fotos || []).find((x) => x.id === el.dataset.f);
    if (f) await apagarArquivos([f]);
    ev.fotos = (ev.fotos || []).filter((x) => x.id !== el.dataset.f);
    salvar([...lista]); fecharModal(); App.render();
  };
})();
