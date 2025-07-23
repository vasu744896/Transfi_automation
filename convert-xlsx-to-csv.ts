import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Input XLSX file path
const inputFilePath = path.resolve(__dirname, 'sell.xlsx');
const outputFilePath = path.resolve(__dirname, 'sell.csv');

// Read the workbook
const workbook = XLSX.readFile(inputFilePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert sheet to raw 2D array
const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, {
  header: 1,
  defval: '',
});

// Find "estimate" column index
const estimateColumnIndex = rawData[0].findIndex(col => col.toString().toLowerCase() === 'estimate');

// Filter: remove header row and rows without estimate
const cleanedData = rawData.filter((row, index) => {
  if (index === 0) return false; // ❌ Skip header row
  return row[estimateColumnIndex] !== '';
});

// Convert to sheet & then to CSV
const newSheet = XLSX.utils.aoa_to_sheet(cleanedData);
const csvData = XLSX.utils.sheet_to_csv(newSheet); // ✅ No `skipHeader` here

// Write CSV
fs.writeFileSync(outputFilePath, csvData);
console.log('✅ CSV written without header:', outputFilePath);
