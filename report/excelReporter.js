const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

class ExcelTestCaseReporter {
  constructor() {
    this.testResults = [];
  }

  onTestBegin(test) {
    this.currentTest = {
      title: test.title,
      steps: [],
    };
  }

  async onStepEnd(step) {
    // Optional if you want raw Playwright steps
  }

  async onTestEnd(test, result) {
    if (this.currentTest) {
      this.currentTest.status = result.status;
      this.testResults.push(this.currentTest);
      this.currentTest = null;
    }
  }

  async onEnd() {
    const filePath = path.resolve(__dirname, '../Playwright-Test-Case-Report.xlsx');
    const workbook = fs.existsSync(filePath)
      ? await new ExcelJS.Workbook().xlsx.readFile(filePath)
      : new ExcelJS.Workbook();

    const sheet = workbook.getWorksheet('TestCases') || workbook.addWorksheet('TestCases');

    if (sheet.actualRowCount === 0) {
      sheet.columns = [
        { header: 'Test Name', key: 'testName', width: 40 },
        { header: 'Step Description', key: 'stepDescription', width: 50 },
        { header: 'Result', key: 'result', width: 10 },
        { header: 'Pre-condition', key: 'precondition', width: 50 },
        { header: 'Comment', key: 'comment', width: 50 },
      ];
    }

    for (const test of this.testResults) {
      for (const step of test.steps) {
        sheet.addRow({
          testName: test.title,
          stepDescription: step.name,
          result: step.result,
          precondition: step.precondition || '',
          comment: step.comment || '',
        });
      }
    }

    await workbook.xlsx.writeFile(filePath);
    console.log('✅ Excel report saved:', filePath);
  }

  // Manual step logging
  logStep(stepName, description, comment = '', result = 'PASS', precondition = '') {
    if (this.currentTest) {
      this.currentTest.steps.push({
        name: stepName || description,
        result,
        comment,
        precondition,
      });
    }
  }
}

module.exports = ExcelTestCaseReporter;
