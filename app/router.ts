function doGet(
  request: GoogleAppsScript.Events.DoGet,
): GoogleAppsScript.HTML.HtmlOutput {
  // @ts-ignore
  fetchDayjs();
  if (request.parameter["refresh"] === "true") {
    // @ts-ignore
    incrementalRefresh();
  }
  // TODO: is it possible to automatically create an Expenses sheet?
  const output = request.parameter["month"]
    ? monthlyView_(request.parameter["month"])
    : aggregateView_();
  output.addMetaTag("viewport", "width=device-width, initial-scale=1");
  output.addMetaTag("mobile-web-app-capable", "yes");
  output.addMetaTag("apple-mobile-web-app-capable", "yes");
  // output.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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

function externalLinkSvg_() {
  return `
<svg class="external-link" width="15px" height="15px" viewBox="0 0 24 24">
  <g
    stroke-width="2"
    stroke="#0047AB"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <polyline points="17 13.5 17 19.5 5 19.5 5 7.5 11 7.5"></polyline>
    <path d="M14,4.5 L20,4.5 L20,10.5 M20,4.5 L11,13.5"></path>
  </g>
</svg>`;
}

function formatCellAsMonth_(month: string) {
  return `<td><a href="?month=${month}">${month}${externalLinkSvg_()}</a></td>`;
}

function formatCell(value: any) {
  if (typeof value === "number") {
    return formatCellAsCurrency_(value);
  }
  // @ts-ignore
  if (dayjs(value, "YYYY MMMM", true).isValid()) {
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
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Aggregate")!;
  // FIXME: hard-coding.
  const ranges = sanitizeRange_(
    transpose_(sheet.getRange("B1:E4").getValues()),
  );
  // FIXME: hard-coding.
  const months = sanitizeRange_(sheet.getRange("A5:B").getValues());
  const template = HtmlService.createTemplateFromFile("app/template.html");
  template.tables = [ranges, months];
  return template.evaluate();
}

function monthlyView_(month: string): GoogleAppsScript.HTML.HtmlOutput {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(month)!;
  // TODO: make the month cell here a dropdown?
  // FIXME: hard-coding.
  const totals = sanitizeRange_(sheet.getRange("A1:C1").getValues()).concat(
    sanitizeRange_(transpose_(sheet.getRange("E1:G2").getValues())),
  );
  // TODO: make these sortable?
  // FIXME: hard-coding.
  const expenses = sanitizeRange_(sheet.getRange("A5:E").getValues().reverse());
  const template = HtmlService.createTemplateFromFile("app/template.html");
  template.tables = [totals, expenses];
  return template.evaluate();
}
