// ============================================================
// FAMÍLIA SAUDÁVEL — monitoramento pelo relógio e celular
// (Xiaomi Smart Band + app Mi Fitness; os dados são digitados aqui)
// ============================================================
(() => {
  const { Store, ACOES, TELAS, Fotos, esc, iso, toast, dataBR, N, grafico, abrirModal } = App;
  let quem = "pai";
  const CAMPOS = [
    ["passos", "Passos", "1"], ["km", "Distância (km)", "0.01"], ["kcal", "Calorias ativas (kcal)", "1"], ["ativo", "Minutos de atividade", "1"],
    ["sono", "Sono (horas)", "0.1"], ["sonoPts", "Pontuação do sono (0–100)", "1"], ["fc", "FC de repouso (bpm)", "1"],
    ["spo2", "SpO₂ (%)", "1"], ["estresse", "Estresse (0–100)", "1"]
  ];
  const num = (v, d = 0) => (v == null ? "—" : Number(v).toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d }));
  const registros = () => Store.get("relogio:" + quem, []).slice().sort((a, b) => a.d.localeCompare(b.d));

  TELAS.relogio = () => {
    const reg = registros();
    const desde = new Date(); desde.setDate(desde.getDate() - 6);
    const ult7 = reg.filter((r) => r.d >= iso(desde));
    const media = (k) => { const v = ult7.map((r) => r[k]).filter((x) => x != null && x !== ""); return v.length ? v.reduce((a, b) => a + Number(b), 0) / v.length : null; };
    const mp = media("passos"), ms = media("sono"), mf = media("fc");
    const pct = (v, meta) => Math.min(100, Math.round(((v || 0) / meta) * 100));
    const serie = (k) => reg.filter((r) => r[k] != null && r[k] !== "").slice(-14).map((r) => ({ d: r.d, y: Number(r[k]) }));
    const caixa = (cor, rot, val, extra = "") => `<div class="cartao" style="margin:0;background:var(--${cor})"><div class="mudo">${rot}</div><div style="font-size:1.5rem;font-weight:700">${val}</div>${extra}</div>`;
    return `
    <section class="cartao destaque">
      <h2>⌚ Relógio e celular</h2>
      <p class="mudo">Dados da pulseira Xiaomi Smart Band 9 Active, vistos no app Mi Fitness do celular. A plataforma não consegue ler o relógio sozinha: vocês anotam aqui os números do dia.</p>
      <div class="chips">${["pai", "mae"].map((k) => `<button class="chip ${k === quem ? "ativo" : ""}" data-acao="rel-quem" data-p="${k}">${esc(N[k])}</button>`).join("")}</div>
      <div class="grade-2">
        ${caixa("verde-claro", "Passos · média de 7 dias", num(mp), `<div class="barra"><span style="width:${pct(mp, RELOGIO_METAS.passos)}%"></span></div><div class="mudo">meta ${num(RELOGIO_METAS.passos)}</div>`)}
        ${caixa("azul-claro", "Sono · média de 7 dias", ms == null ? "—" : num(ms, 1) + " h", `<div class="barra"><span style="width:${pct(ms, RELOGIO_METAS.sono)}%"></span></div><div class="mudo">meta ${RELOGIO_METAS.sono} h (dormir às 22h)</div>`)}
        ${caixa("laranja-claro", "FC de repouso · média", mf == null ? "—" : num(mf) + " bpm")}
        ${caixa("roxo-claro", "Dias anotados (7 dias)", ult7.length)}
      </div>
    </section>
    <div class="grade">
      <section class="cartao">
        <h2>Anotar o dia</h2>
        <form data-acao="rel-salvar">
          <label>Data<input type="date" name="d" value="${iso()}" required></label>
          <div class="grade-2">${CAMPOS.map(([k, rot, passo]) => `<label>${rot}<input type="number" name="${k}" step="${passo}" inputmode="decimal"></label>`).join("")}</div>
          <label>Observação<input type="text" name="obs" placeholder="Dormi mal, dia de prova…"></label>
          <label>Print do Mi Fitness (opcional)<input type="file" name="print" accept="image/*"></label>
          <button class="btn primario largo">Salvar</button>
        </form>
        <p class="mudo" style="margin-top:.5rem">Não precisa preencher tudo. Salvar de novo na mesma data atualiza o registro.</p>
      </section>
      <section class="cartao">
        <h2>Passos</h2>${grafico(serie("passos"), "passos")}
        <h2 style="margin-top:1rem">Sono</h2>${grafico(serie("sono"), "h")}
        <h2 style="margin-top:1rem">FC de repouso</h2>${grafico(serie("fc"), "bpm")}
      </section>
      <section class="cartao">
        <h2>Onde achar os números</h2>
        <ol>${RELOGIO_GUIA.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
        <h3 style="margin-top:.8rem">Ajustes recomendados</h3>
        <ul>${RELOGIO_CONFIG.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      </section>
      <section class="cartao">
        <h2>Histórico</h2>
        ${reg.length ? `<div class="rolar"><table class="tabela"><thead><tr><th>Data</th><th>Passos</th><th>km</th><th>Sono</th><th>FC</th><th>SpO₂</th><th>Estresse</th><th></th></tr></thead><tbody>
          ${reg.slice().reverse().map((r) => `<tr><td>${dataBR(r.d)}</td><td>${num(r.passos)}</td><td>${r.km == null ? "—" : num(r.km, 1)}</td><td>${r.sono == null ? "—" : num(r.sono, 1) + " h"}</td><td>${num(r.fc)}</td><td>${num(r.spo2)}</td><td>${num(r.estresse)}</td>
            <td style="white-space:nowrap">${r.print ? `<button class="btn pequeno" data-acao="rel-print" data-d="${r.d}" aria-label="Ver print">🖼</button> ` : ""}<button class="btn pequeno perigo" data-acao="rel-apagar" data-d="${r.d}" aria-label="Apagar">✕</button></td></tr>
            ${r.obs ? `<tr><td></td><td colspan="7" class="mudo">${esc(r.obs)}</td></tr>` : ""}`).join("")}
        </tbody></table></div>` : `<p class="mudo">Nenhum dia anotado ainda.</p>`}
      </section>
    </div>`;
  };
  ACOES["rel-quem"] = (el) => { quem = el.dataset.p; App.render(); };
  ACOES["rel-salvar"] = async (form) => {
    const fd = new FormData(form); const r = { d: fd.get("d") };
    CAMPOS.forEach(([k]) => { const v = fd.get(k); if (v !== "" && v != null) r[k] = Number(v); });
    const obs = (fd.get("obs") || "").trim(); if (obs) r.obs = obs;
    const arq = form.querySelector('input[type="file"]').files[0];
    if (Object.keys(r).length < 2 && !arq) { toast("Preencha pelo menos um campo."); return; }
    const k = "relogio:" + quem; const lista = Store.get(k, []); const antigo = lista.find((x) => x.d === r.d) || {};
    const novo = { ...antigo, ...r };
    if (arq) { toast("Enviando print…"); const f = await Fotos.salvar(arq, "relogio"); if (f) { if (antigo.print) await Fotos.apagar([antigo.print]); novo.print = f; } }
    Store.set(k, [...lista.filter((x) => x.d !== r.d), novo]); toast("Dia anotado ⌚"); App.render();
  };
  ACOES["rel-apagar"] = async (el) => {
    if (!confirm("Apagar este dia?")) return;
    const k = "relogio:" + quem; const lista = Store.get(k, []); const r = lista.find((x) => x.d === el.dataset.d);
    if (r && r.print) await Fotos.apagar([r.print]);
    Store.set(k, lista.filter((x) => x.d !== el.dataset.d)); App.render();
  };
  ACOES["rel-print"] = async (el) => {
    const r = Store.get("relogio:" + quem, []).find((x) => x.d === el.dataset.d); if (!r || !r.print) return;
    abrirModal(`<h3>Mi Fitness · ${dataBR(r.d)}</h3><img src="${await Fotos.url(r.print)}" alt="Print do Mi Fitness" style="width:100%;border-radius:12px">`);
  };
})();
