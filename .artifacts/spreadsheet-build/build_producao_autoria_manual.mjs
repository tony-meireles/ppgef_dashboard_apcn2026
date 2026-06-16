import fs from "node:fs/promises";
import vm from "node:vm";
import { Workbook, SpreadsheetFile } from "@oai/artifact-tool";

const workspaceRoot = "C:/Users/tonym/OneDrive/Documentos/PPGEF - DashBorad";
const sourceFile = `${workspaceRoot}/dashboard/producao-cientifica-data.js`;
const outputDir = `${workspaceRoot}/outputs`;
const outputFile = `${outputDir}/producao_cientifica_preenchimento_autoria_manual.xlsx`;

const sourceText = await fs.readFile(sourceFile, "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(sourceText, context);
const data = context.window.PRODUCAO_CIENTIFICA || [];

const workbook = Workbook.create();
const instrucao = workbook.worksheets.add("Instrucoes");
const planilha = workbook.worksheets.add("Preenchimento");

const instructionRows = [
  ["Planilha de preenchimento manual da autoria"],
  [""],
  ["Objetivo", "Registrar manualmente o numero total de autores e a posicao do docente em cada produto."],
  ["Como preencher", "Preencha apenas as colunas numero_autores e posicao_docente na aba Preenchimento."],
  ["Regra basica", "posicao_docente deve ser menor ou igual a numero_autores."],
  ["Identificador principal", "Use id e source_row para rastrear o registro original."],
  ["Observacao", "Os demais campos foram levados da base cientifica atual apenas para referencia e auditoria."],
];

const columns = [
  "id",
  "source_row",
  "docente",
  "ano",
  "tipo_producao",
  "titulo",
  "revista_ou_veiculo",
  "editora",
  "cidade",
  "isbn_issn",
  "doi",
  "url",
  "indexacao",
  "jif_jcr_2025",
  "quartil_jcr_2025",
  "pontuacao",
  "autor_principal",
  "autores",
  "produto_referencia",
  "observacoes",
  "numero_autores",
  "posicao_docente",
];

const rows = data.map((item) => ([
  item.id ?? "",
  item.source_row ?? "",
  item.docente ?? "",
  item.ano ?? "",
  item.tipo_producao ?? "",
  item.titulo ?? "",
  item.revista_ou_veiculo ?? "",
  item.editora ?? "",
  item.cidade ?? "",
  item.isbn_issn ?? "",
  item.doi ?? "",
  item.url ?? "",
  item.indexacao ?? "",
  item.jif_jcr_2025 ?? "",
  item.quartil_jcr_2025 ?? "",
  item.pontuacao ?? "",
  item.autor_principal ?? "",
  item.autores ?? "",
  item.produto_referencia ?? "",
  item.observacoes ?? "",
  "",
  "",
]));

instrucao.getRange(`A1:B${instructionRows.length}`).values = instructionRows;
instrucao.getRange("A1").format.font.bold = true;
instrucao.getRange("A1").format.font.size = 16;
instrucao.getRange("A3:A7").format.font.bold = true;
instrucao.getRange("A1:B7").format.wrapText = true;
instrucao.getRange("A1:B7").format.verticalAlignment = "middle";
instrucao.getUsedRange().format.autofitColumns();
instrucao.getUsedRange().format.autofitRows();

planilha.getRange(`A1:V${rows.length + 1}`).values = [columns, ...rows];
planilha.freezePanes.freezeRows(1);
planilha.getRange("A1:V1").format.font = { bold: true, color: "#ffffff" };
planilha.getRange("A1:V1").format.fill.color = "#8c1538";
planilha.getRange("U:V").format.fill.color = "#fff6d8";
planilha.getRange("A:V").format.verticalAlignment = "middle";
planilha.getRange("F:F").format.wrapText = true;
planilha.getRange("R:R").format.wrapText = true;
planilha.getRange("S:S").format.wrapText = true;
planilha.getUsedRange().format.autofitRows();

const widthSpecs = [
  ["A", 80], ["B", 80], ["C", 220], ["D", 70], ["E", 110], ["F", 380],
  ["G", 220], ["H", 140], ["I", 120], ["J", 120], ["K", 150], ["L", 180],
  ["M", 170], ["N", 90], ["O", 90], ["P", 80], ["Q", 180], ["R", 340],
  ["S", 420], ["T", 260], ["U", 120], ["V", 120],
];

for (const [col, width] of widthSpecs) {
  planilha.getRange(`${col}:${col}`).format.columnWidthPx = width;
}

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputFile);

console.log(JSON.stringify({
  outputFile,
  records: rows.length,
  columns: columns.length,
}, null, 2));
