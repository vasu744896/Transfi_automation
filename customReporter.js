// excelReporter.js
const fs = require('fs-extra');
const xlsx = require('xlsx');

class ExcelTestCaseReporter {
  constructor() {
    this.testResults = [];
  }

  onTestBegin(test) {
    this.startTime = Date.now();
  }

  onTestEnd(test, result) {
    const timeTaken = (Date.now() - this.startTime) / 1000;

    const testCase = {
      'Test Case ID': `TC-${Math.floor(Math.random() * 10000)}`,
      'Reference': '',
      'Purpose': 'Automated test for feature flow',
      'Description': test.title,
      'Pre-conditions': 'Environment Ready',
      'Test Steps': 'Playwright automated script',
      'Test Data': '',
      'Expected Result': 'Should work as expected',
      'Actual Result': result.status.toUpperCase(),
      'Comments': result.error?.message || '',
    };

    this.testResults.push(testCase);
  }

  onEnd() {
    const sheet = xlsx.utils.json_to_sheet(this.testResults);
    const book = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(book, sheet, 'Test Results');

    fs.ensureDirSync('report');
    const filename = `report/Test_Report_${new Date().toISOString().replace(/[:.]/g, '-')}.xlsx`;
    xlsx.writeFile(book, filename);

    console.log(`✅ Excel report saved to: ${filename}`);
  }
}

module.exports = ExcelTestCaseReporter;
