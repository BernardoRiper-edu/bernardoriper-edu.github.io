// Materiais por ano: lista os arquivos de cada pasta e abre PDFs num visualizador (PDF.js).
// Os arquivos vêm do JSON gerado pelo Jekyll em escola.html (#materiais-arquivos).

const root = document.getElementById("materiais");
const dialog = document.getElementById("mat-dialog");

if (root && dialog) {
  const BASE = root.dataset.base;          // ex.: /assets/materiais/
  const PDFJS = root.dataset.pdfjs;        // ex.: /assets/vendor/pdfjs/
  let arquivos = [];
  try { arquivos = JSON.parse(document.getElementById("materiais-arquivos").textContent); } catch (e) { arquivos = []; }

  // ---------- agrupa por ano / tipo ----------
  const grupos = {};
  for (const f of arquivos) {
    const resto = f.path.startsWith(BASE) ? f.path.slice(BASE.length) : null;
    if (!resto) continue;
    const [ano, tipo, ...nome] = resto.split("/");
    if (!ano || !tipo || !nome.length) continue;
    (grupos[`${ano}/${tipo}`] ||= []).push(f);
  }
  const collator = new Intl.Collator("pt-BR", { numeric: true, sensitivity: "base" });
  Object.values(grupos).forEach((lista) => lista.sort((a, b) => collator.compare(a.nome, b.nome)));

  // ---------- quadrados: contagem e botões ----------
  root.querySelectorAll(".year-row").forEach((btn) => {
    const lista = grupos[`${btn.dataset.ano}/${btn.dataset.tipo}`] || [];
    const count = btn.querySelector(".yr-count");
    if (lista.length) {
      btn.disabled = false;
      count.textContent = lista.length === 1 ? "1 arquivo" : `${lista.length} arquivos`;
      btn.addEventListener("click", () => abrirLista(btn.dataset.ano, btn.dataset.titulo, lista));
    }
  });

  // ---------- elementos do diálogo ----------
  const $ = (id) => document.getElementById(id);
  const elKicker = $("mat-kicker"), elTitle = $("mat-title"), elList = $("mat-list");
  const elViewer = $("mat-viewer"), elPages = $("mat-pages"), elZoom = $("mat-zoom"), elInfo = $("mat-pageinfo");
  const elDownload = $("mat-download");
  const btnBack = dialog.querySelector(".mat-back");
  const btnClose = dialog.querySelector(".mat-close");

  const bonito = (nome) => nome.replace(/_+/g, " ").replace(/\s{2,}/g, " ").trim();
  const tipoArquivo = (ext) => ({ ".pdf": "PDF", ".png": "Imagem", ".jpg": "Imagem", ".jpeg": "Imagem", ".gif": "Imagem", ".webp": "Imagem", ".docx": "Word", ".doc": "Word", ".pptx": "PowerPoint", ".xlsx": "Excel" }[ext] || ext.replace(".", "").toUpperCase());

  let atual = null; // { ano, titulo, lista }

  function abrirLista(ano, titulo, lista) {
    atual = { ano, titulo, lista };
    mostrarLista();
    if (!dialog.open) dialog.showModal();
  }

  function mostrarLista() {
    fecharPdf();
    elKicker.textContent = atual.ano;
    elTitle.textContent = atual.titulo;
    btnBack.hidden = true;
    elDownload.hidden = true;
    elViewer.hidden = true;
    elList.hidden = false;
    elList.replaceChildren(...atual.lista.map((f) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "mat-item";
      const nome = document.createElement("span"); nome.className = "mat-item-name"; nome.textContent = bonito(f.nome);
      const meta = document.createElement("span"); meta.className = "mat-item-meta"; meta.textContent = tipoArquivo(f.ext);
      b.append(nome, meta);
      b.addEventListener("click", () => abrirArquivo(f));
      const li = document.createElement("li"); li.append(b);
      return li;
    }));
    const primeiro = elList.querySelector("button");
    if (primeiro) primeiro.focus();
  }

  function abrirArquivo(f) {
    elKicker.textContent = `${atual.ano} · ${atual.titulo}`;
    elTitle.textContent = bonito(f.nome);
    btnBack.hidden = false;
    elDownload.hidden = false;
    elDownload.href = encodeURI(f.url);
    elDownload.setAttribute("download", f.nome + f.ext);
    elList.hidden = true;
    elViewer.hidden = false;
    elPages.replaceChildren();
    elPages.scrollTop = 0;
    btnBack.focus();

    if (f.ext === ".pdf") return abrirPdf(encodeURI(f.url));
    elViewer.querySelector(".mat-toolbar").hidden = true;
    if ([".png", ".jpg", ".jpeg", ".gif", ".webp"].includes(f.ext)) {
      const img = document.createElement("img");
      img.src = encodeURI(f.url); img.alt = bonito(f.nome); img.className = "mat-img";
      elPages.append(img);
    } else {
      elPages.append(aviso("Este tipo de arquivo não abre aqui. Use o botão Baixar."));
    }
  }

  function aviso(texto, link) {
    const d = document.createElement("div");
    d.className = "mat-msg";
    d.textContent = texto;
    if (link) { const a = document.createElement("a"); a.href = link; a.textContent = "Abrir o arquivo"; a.target = "_blank"; a.rel = "noopener"; d.append(" ", a); }
    return d;
  }

  // ---------- PDF.js ----------
  let pdfjs = null, doc = null, loading = null, observer = null, zoom = 1, paginas = [], tarefa = 0;

  async function carregarPdfjs() {
    if (pdfjs) return pdfjs;
    pdfjs = await import(PDFJS + "pdf.min.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = PDFJS + "pdf.worker.min.mjs";
    return pdfjs;
  }

  async function abrirPdf(url) {
    const minha = ++tarefa;
    elViewer.querySelector(".mat-toolbar").hidden = false;
    zoom = 1; elZoom.textContent = "100%"; elInfo.textContent = "";
    const carregando = aviso("Carregando…");
    elPages.append(carregando);
    try {
      const lib = await carregarPdfjs();
      loading = lib.getDocument({
        url,
        cMapUrl: PDFJS + "cmaps/", cMapPacked: true,
        standardFontDataUrl: PDFJS + "standard_fonts/",
        wasmUrl: PDFJS + "wasm/",
        iccUrl: PDFJS + "iccs/",
      });
      const d = await loading.promise;
      if (minha !== tarefa) return;
      doc = d;
      carregando.remove();
      elInfo.textContent = doc.numPages === 1 ? "1 página" : `${doc.numPages} páginas`;
      const p1 = await doc.getPage(1);
      const vp1 = p1.getViewport({ scale: 1 });
      paginas = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const box = document.createElement("div");
        box.className = "mat-page";
        box.dataset.page = i;
        box.style.aspectRatio = `${vp1.width} / ${vp1.height}`;
        box.setAttribute("aria-label", `Página ${i}`);
        elPages.append(box);
        paginas.push({ box, rendered: 0, task: null });
      }
      aplicarZoom();
      observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) renderizar(Number(e.target.dataset.page)); });
      }, { root: elPages, rootMargin: "600px 0px" });
      paginas.forEach((p) => observer.observe(p.box));
    } catch (err) {
      if (minha !== tarefa) return;
      carregando.remove();
      elPages.append(aviso("Não foi possível mostrar este PDF aqui.", url));
      console.error(err);
    }
  }

  async function renderizar(n) {
    const p = paginas[n - 1];
    if (!doc || !p || p.rendered === zoom) return;
    const meuZoom = zoom;
    if (p.task) { try { p.task.cancel(); } catch (_) {} }
    const page = await doc.getPage(n);
    const base = page.getViewport({ scale: 1 });
    const largura = p.box.clientWidth || elPages.clientWidth;
    const escala = largura / base.width;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const vp = page.getViewport({ scale: escala * dpr });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(vp.width);
    canvas.height = Math.floor(vp.height);
    p.box.style.aspectRatio = `${base.width} / ${base.height}`;
    p.task = page.render({ canvasContext: canvas.getContext("2d"), viewport: vp });
    try {
      await p.task.promise;
      if (meuZoom !== zoom) return;
      p.box.replaceChildren(canvas);
      p.rendered = meuZoom;
    } catch (e) {
      if (e && e.name !== "RenderingCancelledException") console.error(e);
    }
  }

  function aplicarZoom() {
    elZoom.textContent = Math.round(zoom * 100) + "%";
    elPages.style.setProperty("--zoom", zoom);
    paginas.forEach((p) => { p.rendered = 0; });
    // re-renderiza as páginas visíveis
    const r = elPages.getBoundingClientRect();
    paginas.forEach((p, i) => {
      const b = p.box.getBoundingClientRect();
      if (b.bottom > r.top - 600 && b.top < r.bottom + 600) renderizar(i + 1);
    });
  }

  dialog.querySelectorAll("[data-zoom]").forEach((b) => b.addEventListener("click", () => {
    const passos = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
    const i = passos.findIndex((z) => z >= zoom - 0.001);
    const j = Math.max(0, Math.min(passos.length - 1, i + Number(b.dataset.zoom)));
    if (passos[j] === zoom) return;
    zoom = passos[j];
    aplicarZoom();
  }));

  function fecharPdf() {
    tarefa++;
    if (observer) { observer.disconnect(); observer = null; }
    paginas.forEach((p) => { if (p.task) try { p.task.cancel(); } catch (_) {} });
    paginas = [];
    if (loading) { loading.destroy(); loading = null; }
    doc = null;
    elPages.replaceChildren();
  }

  btnBack.addEventListener("click", mostrarLista);
  btnClose.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", fecharPdf);
}
