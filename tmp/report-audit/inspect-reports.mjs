import fs from 'node:fs/promises';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const files = [
  'C:/Users/HP/Downloads/VAAK_Reporte PO Item Listing (1).xlsx',
  'C:/Users/HP/Downloads/VAAK_Reporte Invoice Details (1).xlsx',
];

for (const source of files) {
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
  const sheets = await workbook.inspect({ kind: 'workbook,sheet,table', range: 'A1:T18', maxChars: 8000, tableMaxRows: 18, tableMaxCols: 20, tableMaxCellChars: 120 });
  console.log(`\n=== ${source} ===\n${sheets.ndjson}`);
  const names = await workbook.inspect({ kind: 'sheet', include: 'id,name', maxChars: 2000 });
  const first = JSON.parse(names.ndjson.split('\n').find(Boolean));
  const preview = await workbook.render({ sheetName: first.name, range: 'A1:T18', scale: 1, format: 'png' });
  const name = source.includes('PO Item') ? 'po-item-listing.png' : 'invoice-details.png';
  await fs.writeFile(`./${name}`, new Uint8Array(await preview.arrayBuffer()));
}
