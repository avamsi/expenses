function doGet(
  request: GoogleAppsScript.Events.DoGet
): GoogleAppsScript.HTML.HtmlOutput {
  const output = request.parameter["month"]
    ? monthlyView_(request.parameter["month"])
    : aggregateView_();
  output.addMetaTag("viewport", "width=device-width, initial-scale=1");
  output.addMetaTag("mobile-web-app-capable", "yes");
  output.addMetaTag("apple-mobile-web-app-capable", "yes");
  return output;
}

function baseUrl() {
  return ScriptApp.getService().getUrl();
}

function include(path: string) {
  return HtmlService.createHtmlOutputFromFile(path).getContent();
}

function formatCellAsCurrency_(amount: number) {
  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
  return `<td class="currency">${currency}</td>`;
}

function formatCellAsMonth_(month: string) {
  return `<td><a href="?month=${month}">${month}</a></td>`;
}

function formatCell(value: any) {
  if (typeof value === "number") {
    return formatCellAsCurrency_(value);
  }
  if (typeof value === "string" && value.startsWith("20")) {
    return formatCellAsMonth_(value);
  }
  return `<td>${value}</td>`;
}

function transpose_(m: any[][]) {
  return m[0].map((x, i) => m.map((x) => x[i]));
}

function removeEmptyRows_(range: any[][]) {
  return range.filter((row) => row.some((cell) => cell));
}

function sanitizeRange_(range: any[][]) {
  // Remove empty rows and empty columns (by transposing, removing rows and transposing back).
  return transpose_(removeEmptyRows_(transpose_(removeEmptyRows_(range))));
}

function aggregateView_(): GoogleAppsScript.HTML.HtmlOutput {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Aggregate");
  // FIXME: hard-coding.
  const ranges = sanitizeRange_(sheet.getRange("A1:E4").getValues());
  // FIXME: hard-coding.
  const months = sanitizeRange_(sheet.getRange("A5:B").getValues());
  const template = HtmlService.createTemplateFromFile("app/template.html");
  template.tables = [ranges, months];
  return template.evaluate();
}

function monthlyView_(month: string): GoogleAppsScript.HTML.HtmlOutput {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(month);
  // FIXME: hard-coding.
  const totals = sanitizeRange_(sheet.getRange("A1:C1").getValues()).concat(
    sanitizeRange_(transpose_(sheet.getRange("E1:G2").getValues()))
  );
  // FIXME: hard-coding.
  const expenses = sanitizeRange_(sheet.getRange("A5:E").getValues().reverse());
  const template = HtmlService.createTemplateFromFile("app/template.html");
  template.tables = [totals, expenses];
  return template.evaluate();
}
