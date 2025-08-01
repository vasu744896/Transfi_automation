// reporters/excelReporter.js
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class ExcelTestCaseReporter {
  constructor() {
    this.testResults = [];
  }

  // Called when a test starts
  onTestBegin(test) {
    this.currentTest = {
      title: test.title,
      steps: [],
    };
  }

  // Capture each step inside the test
  async onStepEnd(step) {
    if (this.currentTest) {
      this.currentTest.steps.push(step.title);
    }
  }

  // Called when a test ends
  async onTestEnd(test, result) {
    if (this.currentTest) {
      this.currentTest.status = result.status;
      this.testResults.push(this.currentTest);
      this.currentTest = null;
    }
  }

  // Finalize and write to Excel file
  async onEnd() {
    const filePath = path.resolve(__dirname, '../Playwright-Test-Case-Report.xlsx');

    const workbook = fs.existsSync(filePath)
      ? await new ExcelJS.Workbook().xlsx.readFile(filePath)
      : new ExcelJS.Workbook();

    const sheet = workbook.getWorksheet('TestCases') || workbook.addWorksheet('TestCases');

    // Add header if sheet is empty
    if (sheet.actualRowCount === 0) {
      sheet.columns = [
        { header: 'Test Name', key: 'testName', width: 40 },
        { header: 'Step Description', key: 'stepDescription', width: 80 },
        { header: 'Status', key: 'status', width: 15 },
      ];
    }

    // Add test result rows
    for (const test of this.testResults) {
      const status = test.status.toUpperCase();
      if (test.steps.length === 0) {
        // If no steps captured, log only test name
        sheet.addRow({
          testName: test.title,
          stepDescription: 'No steps recorded',
          status: status,
        });
      } else {
        for (const step of test.steps) {
          sheet.addRow({
            testName: test.title,
            stepDescription: step,
            status: status,
          });
        }
      }
    }

    await workbook.xlsx.writeFile(filePath);
    console.log('✅ Excel report saved:', filePath);
  }
}

module.exports = ExcelTestCaseReporter;
