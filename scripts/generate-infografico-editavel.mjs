import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const artifactToolUrl = pathToFileURL(
  path.join(
    process.env.NODE_PATH || "",
    "@oai",
    "artifact-tool",
    "dist",
    "artifact_tool.mjs",
  ),
).href;
const { Presentation, PresentationFile } = await import(artifactToolUrl);

const repoRoot = process.cwd();
const finalPptx = path.join(
  repoRoot,
  "outputs",
  "infografico-a3-ppgef-apcn-2026-editavel.pptx",
);

const threadId = process.env.CODEX_THREAD_ID || "manual-infografico-editavel";
const workspace = path.join(
  os.tmpdir(),
  "codex-presentations",
  threadId,
  "infografico-a3-ppgef-apcn-2026-editavel",
);
const tmpDir = path.join(workspace, "tmp");
const previewDir = path.join(tmpDir, "preview");
const layoutDir = path.join(tmpDir, "layout");
const qaDir = path.join(tmpDir, "qa");

const slideWidth = 1123;
const slideHeight = 1588;
const scale = 0.32;

const colors = {
  bg: "#f5eee4",
  card: "#fffaf3",
  line: "#eadccb",
  maroon: "#8c1538",
  maroonDark: "#7b1633",
  gold: "#d4a017",
  goldSoft: "#f0d489",
  text: "#24303d",
  body: "#5f6672",
  muted: "#7f8570",
  footer: "#6b6f78",
  offWhite: "#f5d8b2",
};

function px(value) {
  return Math.round(value * scale);
}

function pos(x, y, w, h) {
  return { left: px(x), top: px(y), width: px(w), height: px(h) };
}

function addBox(slide, cfg) {
  const shape = slide.shapes.add({
    geometry: cfg.geometry || "roundRect",
    name: cfg.name,
    position: cfg.position,
    fill: cfg.fill || colors.card,
    line: cfg.line || { style: "solid", fill: "none", width: 0 },
    borderRadius: cfg.borderRadius || "rounded-2xl",
    shadow: cfg.shadow || undefined,
  });
  return shape;
}

function addText(slide, cfg) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    name: cfg.name,
    position: cfg.position,
    fill: "none",
    line: { style: "solid", fill: "none", width: 0 },
  });
  shape.text = cfg.text;
  shape.text.style = {
    typeface: cfg.typeface || "Aptos",
    fontSize: cfg.fontSize,
    bold: cfg.bold || false,
    color: cfg.color || colors.text,
    alignment: cfg.alignment || "left",
    valign: cfg.valign || "top",
  };
  return shape;
}

async function writeText(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function writeBlob(filePath, blob) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

function addSectionTitle(slide, text, y) {
  addText(slide, {
    name: `section-${text}`,
    position: pos(160, y, 2600, 80),
    text,
    fontSize: 16,
    bold: true,
    color: colors.maroonDark,
    typeface: "Aptos Display",
  });
}

async function main() {
  await fs.mkdir(previewDir, { recursive: true });
  await fs.mkdir(layoutDir, { recursive: true });
  await fs.mkdir(qaDir, { recursive: true });
  await fs.mkdir(path.dirname(finalPptx), { recursive: true });

  await writeText(
    path.join(tmpDir, "source-notes.txt"),
    [
      "Fonte principal: outputs/infografico-a3-ppgef-apcn-2026.svg",
      "Base factual: versão agregada do infográfico A3 do dashboard APCN 2026 do PPGEF/UFPE.",
      "Uso: conversão para uma lâmina PPTX editável, preservando blocos, indicadores e hierarquia visual.",
      "Acesso: 16 jun. 2026.",
    ].join("\n"),
  );

  await writeText(
    path.join(tmpDir, "slide-plan.txt"),
    [
      "Modo: create",
      "Saída: uma lâmina A3 retrato editável em PowerPoint.",
      "Paleta: maroon #8c1538, maroonDark #7b1633, gold #d4a017, ivory #fffaf3, background #f5eee4.",
      "Fontes: Aptos Display para títulos e Aptos para corpo e KPIs.",
      "Estratégia: recriar a peça como formas nativas, caixas de texto e um gráfico nativo editável do PowerPoint.",
      "Observação: o gradiente e sombras do SVG foram simplificados para manter editabilidade e estabilidade no PPTX.",
    ].join("\n"),
  );

  const presentation = Presentation.create({
    slideSize: { width: slideWidth, height: slideHeight },
  });

  const slide = presentation.slides.add();
  slide.background.fill = colors.bg;

  slide.shapes.add({
    geometry: "ellipse",
    name: "bg-circle-top-right",
    position: pos(2870, 300, 500, 500),
    fill: "#f1e4d7",
    line: { style: "solid", fill: "none", width: 0 },
  });

  slide.shapes.add({
    geometry: "ellipse",
    name: "bg-circle-bottom-left",
    position: pos(40, 4350, 520, 520),
    fill: "#efe1cf",
    line: { style: "solid", fill: "none", width: 0 },
  });

  addBox(slide, {
    name: "hero",
    position: pos(120, 120, 3268, 820),
    fill: colors.maroonDark,
    borderRadius: "rounded-3xl",
    shadow: "shadow-sm",
  });

  addText(slide, {
    name: "hero-kicker",
    position: pos(220, 210, 1180, 60),
    text: "PPGEF • UFPE • APCN 2026",
    fontSize: 11,
    bold: true,
    color: colors.offWhite,
    typeface: "Aptos",
  });
  addText(slide, {
    name: "hero-title",
    position: pos(220, 330, 1900, 140),
    text: "Painel Estratégico do Programa",
    fontSize: 38,
    bold: true,
    color: "#ffffff",
    typeface: "Aptos Display",
  });
  addText(slide, {
    name: "hero-subtitle",
    position: pos(220, 470, 2100, 120),
    text: "Indicadores-Chave para Consulta Acadêmica",
    fontSize: 28,
    bold: true,
    color: "#ffffff",
    typeface: "Aptos Display",
  });
  addText(slide, {
    name: "hero-desc",
    position: pos(220, 640, 2200, 120),
    text: "Síntese institucional do cenário do Programa de Pós-Graduação em Educação Física\npara apoio à proposta de Doutorado e leitura pública do desempenho agregado do PPG.",
    fontSize: 14,
    color: "#f4eef0",
    typeface: "Aptos",
  });

  addBox(slide, {
    name: "hero-reference-box",
    position: pos(2470, 230, 760, 520),
    fill: "#a03f58",
    borderRadius: "rounded-2xl",
  });
  addText(slide, {
    name: "hero-reference-title",
    position: pos(2550, 330, 520, 45),
    text: "Referenciais estruturantes",
    fontSize: 10,
    bold: true,
    color: "#ffffff",
  });
  addText(slide, {
    name: "hero-reference-list",
    position: pos(2550, 400, 560, 220),
    text: "• Documento de Área\n• Ficha/Caderno de Avaliação\n• Documento Norteador APCN\n• Resultado Quadrienal 2021–2024",
    fontSize: 10,
    color: "#ffffff",
  });
  addText(slide, {
    name: "hero-reference-foot",
    position: pos(2550, 660, 560, 40),
    text: "Peça preparada para impressão A3 • atualização 16 jun. 2026",
    fontSize: 7,
    color: "#f7e7eb",
  });

  addSectionTitle(slide, "1. Estrutura do Corpo Docente", 1020);
  [
    [160, 1125, 760, 510],
    [960, 1125, 760, 510],
    [1760, 1125, 760, 510],
    [2560, 1125, 788, 510],
  ].forEach(([x, y, w, h], index) => {
    addBox(slide, {
      name: `doc-card-${index + 1}`,
      position: pos(x, y, w, h),
      fill: colors.card,
      shadow: "shadow-sm",
    });
  });

  addText(slide, { position: pos(220, 1210, 420, 40), text: "DOCENTES CLASSIFICADOS 2026", fontSize: 9, bold: true, color: colors.muted });
  addText(slide, { position: pos(220, 1280, 280, 80), text: "20", fontSize: 28, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(220, 1390, 450, 50), text: "Base institucional considerada no cenário do APCN.", fontSize: 10, color: colors.body });
  addText(slide, { position: pos(220, 1490, 380, 40), text: "PERMANENTES EM 2026", fontSize: 9, bold: true, color: colors.muted });
  addText(slide, { position: pos(220, 1560, 240, 80), text: "16", fontSize: 28, bold: true, color: colors.maroon, typeface: "Aptos Display" });

  addText(slide, { position: pos(1020, 1210, 430, 40), text: "% PERMANENTES NO CORPO", fontSize: 9, bold: true, color: colors.muted });
  addText(slide, { position: pos(1020, 1280, 320, 80), text: "80%", fontSize: 28, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(1020, 1390, 490, 50), text: "Acima do piso crítico de 70% monitorado no painel.", fontSize: 10, color: colors.body });
  addText(slide, { position: pos(1020, 1490, 430, 40), text: "% PERMANENTES INTERNOS", fontSize: 9, bold: true, color: colors.muted });
  addText(slide, { position: pos(1020, 1560, 320, 80), text: "81%", fontSize: 28, bold: true, color: colors.maroon, typeface: "Aptos Display" });

  addText(slide, { position: pos(1820, 1210, 430, 40), text: "% EXCLUSIVOS AO PPG", fontSize: 9, bold: true, color: colors.muted });
  addText(slide, { position: pos(1820, 1280, 320, 80), text: "56%", fontSize: 28, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(1820, 1390, 520, 50), text: "Indicador estratégico de dedicação e estabilidade institucional.", fontSize: 10, color: colors.body });
  addText(slide, { position: pos(1820, 1490, 430, 40), text: "% PERMANENTES EXTERNOS", fontSize: 9, bold: true, color: colors.muted });
  addText(slide, { position: pos(1820, 1560, 320, 80), text: "19%", fontSize: 28, bold: true, color: colors.maroon, typeface: "Aptos Display" });

  addText(slide, { position: pos(2620, 1210, 420, 40), text: "DISTRIBUIÇÃO ENTRE LINHAS", fontSize: 9, bold: true, color: colors.muted });
  addText(slide, { position: pos(2620, 1320, 420, 50), text: "AMS 75% • DFE 55%", fontSize: 13, bold: true, color: colors.text, typeface: "Aptos Display" });
  addText(slide, { position: pos(2620, 1410, 530, 65), text: "Cobertura acadêmica equilibrada entre\nas duas frentes centrais do programa.", fontSize: 10, color: colors.body });
  addBox(slide, { name: "dist-bg-1", geometry: "roundRect", position: pos(2620, 1490, 620, 26), fill: colors.line, borderRadius: "rounded-full" });
  addBox(slide, { name: "dist-fill-1", geometry: "roundRect", position: pos(2620, 1490, 465, 26), fill: colors.maroon, borderRadius: "rounded-full" });
  addBox(slide, { name: "dist-bg-2", geometry: "roundRect", position: pos(2620, 1540, 620, 26), fill: colors.line, borderRadius: "rounded-full" });
  addBox(slide, { name: "dist-fill-2", geometry: "roundRect", position: pos(2620, 1540, 341, 26), fill: colors.gold, borderRadius: "rounded-full" });
  addText(slide, { position: pos(2620, 1610, 560, 45), text: "Leitura do painel: AMS com maior peso relativo;\nDFE com presença estrutural relevante.", fontSize: 7, color: colors.footer });

  addSectionTitle(slide, "2. Produção Intelectual e Impacto", 1730);
  [
    [160, 1830, 1100, 690],
    [1300, 1830, 990, 690],
    [2330, 1830, 1018, 690],
  ].forEach(([x, y, w, h], index) => {
    addBox(slide, {
      name: `prod-card-${index + 1}`,
      position: pos(x, y, w, h),
      fill: colors.card,
      shadow: "shadow-sm",
    });
  });
  addText(slide, { position: pos(220, 1920, 800, 80), text: "Massa crítica da\nprodução", fontSize: 15, bold: true, color: colors.text, typeface: "Aptos Display" });
  addText(slide, { position: pos(220, 2000, 420, 90), text: "38.145", fontSize: 34, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(220, 2100, 500, 55), text: "pontos APCN agregados na base\ncientífica publicada", fontSize: 9, color: colors.body });
  addText(slide, { position: pos(220, 2190, 360, 35), text: "REGISTROS CIENTÍFICOS", fontSize: 9, bold: true, color: colors.muted });
  addText(slide, { position: pos(220, 2255, 280, 70), text: "548", fontSize: 24, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(220, 2340, 460, 55), text: "artigos, livros e capítulos\nconsolidados no painel.", fontSize: 9, color: colors.body });

  addText(slide, { position: pos(1360, 1920, 720, 50), text: "Evolução produtiva por ano", fontSize: 15, bold: true, color: colors.text, typeface: "Aptos Display" });
  addText(slide, { position: pos(1360, 1990, 680, 40), text: "Pontos APCN agregados por ano de publicação.", fontSize: 9, color: colors.body });
  slide.charts.add("bar", {
    position: pos(1425, 2085, 720, 320),
    categories: ["2021", "2022", "2023", "2024", "2025", "2026"],
    series: [{ name: "Pontos APCN", values: [7515, 5760, 8085, 5910, 7470, 3405], fill: colors.maroon }],
    hasLegend: false,
    dataLabels: { showValue: true, position: "outEnd" },
    yAxis: {
      majorGridlines: { style: "solid", fill: "#e6d8c9", width: 1 },
    },
  });
  addText(slide, { position: pos(1360, 2480, 700, 35), text: "Pico em 2023: 8.085 pontos. Patamar sustentado entre 2021 e 2025.", fontSize: 7, color: colors.footer });

  addText(slide, { position: pos(2390, 1920, 760, 80), text: "Liderança coletiva da\nprodução", fontSize: 15, bold: true, color: colors.text, typeface: "Aptos Display" });
  addText(slide, { position: pos(2390, 2040, 500, 35), text: "DOCENTES COM PRODUÇÃO VINCULADA", fontSize: 8, bold: true, color: colors.muted });
  addText(slide, { position: pos(2390, 2095, 220, 60), text: "18", fontSize: 22, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(2390, 2180, 430, 35), text: "ÍNDICE COLETIVO DE LIDERANÇA", fontSize: 8, bold: true, color: colors.muted });
  addText(slide, { position: pos(2390, 2235, 250, 60), text: "43%", fontSize: 22, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(2390, 2310, 320, 35), text: "INDICADOR CORRIGIDO", fontSize: 8, bold: true, color: colors.muted });
  addText(slide, { position: pos(2390, 2365, 320, 60), text: "16.402", fontSize: 20, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(2390, 2450, 580, 55), text: "Liderança distribuída e sem\ndependência de um único nome.", fontSize: 7, color: colors.footer });

  addSectionTitle(slide, "3. Formação de Recursos Humanos, Ensino e Captação", 2615);
  [
    [160, 2715, 1045, 770],
    [1245, 2715, 1045, 770],
    [2330, 2715, 1018, 770],
  ].forEach(([x, y, w, h], index) => {
    addBox(slide, {
      name: `rh-card-${index + 1}`,
      position: pos(x, y, w, h),
      fill: colors.card,
      shadow: "shadow-sm",
    });
  });
  addText(slide, { position: pos(220, 2805, 860, 45), text: "Formação de recursos humanos", fontSize: 14, bold: true, color: colors.text, typeface: "Aptos Display" });
  addText(slide, { position: pos(220, 2890, 220, 70), text: "173", fontSize: 24, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(220, 3000, 360, 50), text: "mestrados concluídos", fontSize: 9, color: colors.body });
  addText(slide, { position: pos(220, 3110, 180, 70), text: "13", fontSize: 24, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(220, 3210, 360, 50), text: "doutorados concluídos", fontSize: 9, color: colors.body });
  addText(slide, { position: pos(220, 3310, 180, 70), text: "15", fontSize: 24, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(220, 3410, 400, 50), text: "doutorados em andamento", fontSize: 9, color: colors.body });
  addText(slide, { position: pos(220, 3495, 620, 40), text: "Leitura central: maturidade formativa em nível doutoral.", fontSize: 7, color: colors.footer });

  addText(slide, { position: pos(1305, 2805, 860, 45), text: "Ensino e oferta acadêmica", fontSize: 14, bold: true, color: colors.text, typeface: "Aptos Display" });
  addText(slide, { position: pos(1305, 2890, 180, 70), text: "34", fontSize: 24, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(1305, 3000, 260, 50), text: "ofertas 2025–2026", fontSize: 9, color: colors.body });
  addText(slide, { position: pos(1305, 3110, 260, 70), text: "885h", fontSize: 24, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(1305, 3210, 300, 50), text: "carga horária docente", fontSize: 9, color: colors.body });
  addText(slide, { position: pos(1305, 3310, 700, 160), text: "• leitura por período e núcleo didático\n• coerência entre linhas, projetos e disciplinas\n• atuação curricular do corpo docente", fontSize: 9, color: colors.text });

  addText(slide, { position: pos(2390, 2805, 840, 70), text: "Captação de recursos\n2022–2026", fontSize: 14, bold: true, color: colors.text, typeface: "Aptos Display" });
  addText(slide, { position: pos(2390, 2890, 320, 70), text: "R$ 7,69 mi", fontSize: 22, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(2390, 3000, 240, 50), text: "carteira publicada", fontSize: 9, color: colors.body });
  addText(slide, { position: pos(2390, 3110, 320, 70), text: "R$ 5,56 mi", fontSize: 22, bold: true, color: colors.maroon, typeface: "Aptos Display" });
  addText(slide, { position: pos(2390, 3210, 240, 40), text: "vigentes em 2026", fontSize: 9, color: colors.body });
  addText(slide, { position: pos(2390, 3280, 460, 180), text: "• 92 registros consolidados\n• 13 docentes com captação\n• 5 agências distintas\n• 3 registros PQ/DT", fontSize: 9, color: colors.text });

  addSectionTitle(slide, "4. Critérios APCN, Governança e Consulta Pública", 3590);
  [
    [160, 3690, 1530, 920],
    [1730, 3690, 1618, 920],
  ].forEach(([x, y, w, h], index) => {
    addBox(slide, {
      name: `gov-card-${index + 1}`,
      position: pos(x, y, w, h),
      fill: colors.card,
      shadow: "shadow-sm",
    });
  });
  addText(slide, { position: pos(220, 3780, 900, 60), text: "Critérios críticos monitorados no dashboard", fontSize: 14, bold: true, color: colors.text, typeface: "Aptos Display" });
  addText(slide, { position: pos(220, 3890, 1180, 340), text: "• estabilidade do corpo docente permanente\n• produção qualificada com pontuação APCN\n• experiência de orientação em mestrado e doutorado\n• captação e vigência ativa dos recursos\n• coerência entre linhas, disciplinas, projetos e oferta\n• liderança autoral e inserção institucional", fontSize: 9, color: colors.text });
  addBox(slide, {
    name: "sintese-pill",
    position: pos(220, 4215, 1380, 130),
    fill: colors.maroonDark,
  });
  addText(slide, { position: pos(270, 4260, 280, 35), text: "Síntese institucional", fontSize: 8, bold: true, color: colors.offWhite });
  addText(slide, { position: pos(270, 4310, 1120, 45), text: "O painel apoia decisões do programa e qualifica diagnósticos para a proposta de Doutorado.", fontSize: 8, bold: true, color: "#ffffff" });

  addText(slide, { position: pos(1790, 3780, 880, 60), text: "Acervo público e governança do PPG", fontSize: 14, bold: true, color: colors.text, typeface: "Aptos Display" });
  addText(slide, { position: pos(1790, 3890, 1220, 220), text: "• 10 documentos institucionais e CAPES no site\n• bases integradas: docentes, produção, orientações, disciplinas e captação\n• publicação pública para consulta ampla\n• leitura dirigida a estudantes, docentes, técnicos e parceiros", fontSize: 9, color: colors.text });
  addBox(slide, { name: "govern-box", position: pos(1790, 4140, 1460, 120), fill: "#f6ebdc" });
  addText(slide, { position: pos(1840, 4180, 1260, 55), text: "Sem exposição nominal, a peça privilegia a leitura global do desempenho do PPG.", fontSize: 9, color: colors.body });
  addBox(slide, { name: "prontidao-box", position: pos(1790, 4290, 1460, 120), fill: colors.gold });
  addText(slide, { position: pos(1840, 4330, 280, 35), text: "Indicador de prontidão", fontSize: 8, bold: true, color: "#ffffff" });
  addText(slide, { position: pos(1840, 4375, 1240, 45), text: "16 permanentes, 38.145 pontos APCN, 173 mestres orientados, 13 doutorados concluídos e R$ 5,56 mi vigentes.", fontSize: 8, bold: true, color: "#ffffff" });

  addText(slide, { position: pos(170, 4780, 3000, 35), text: "Fonte: Dashboard APCN 2026 do PPGEF/UFPE. Dados agregados das bases de corpo docente, produção científica, orientações, disciplinas, captação e documentos públicos.", fontSize: 7, color: colors.footer });
  addText(slide, { position: pos(170, 4835, 3000, 35), text: "Uso recomendado: consulta institucional e acadêmica. Impressão em papel A3, orientação retrato. Atualização de referência: 16 jun. 2026.", fontSize: 7, color: colors.footer });

  const png = await presentation.export({ slide, format: "png", scale: 1 });
  await writeBlob(path.join(previewDir, "slide-01.png"), png);
  const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
  await writeBlob(path.join(previewDir, "deck-montage.webp"), montage);
  const layout = await slide.export({ format: "layout" });
  await writeText(path.join(layoutDir, "slide-01.layout.json"), await layout.text());

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(finalPptx);

  await writeText(
    path.join(qaDir, "visual-qa.txt"),
    [
      "QA visual",
      "1. Deck exportado em uma lâmina retrato editável.",
      "2. Todas as áreas principais do SVG foram convertidas em formas e textos nativos.",
      "3. Gráfico de evolução anual convertido em chart nativo do PowerPoint.",
      "4. Gradientes e transparências foram simplificados para favorecer edição e estabilidade.",
      `5. Saída final: ${finalPptx}`,
    ].join("\n"),
  );

  console.log(JSON.stringify({ workspace, finalPptx }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
