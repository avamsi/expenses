function doGet(
  request: GoogleAppsScript.Events.DoGet
): GoogleAppsScript.HTML.HtmlOutput {
  if (request.parameter["month"]) {
    return monthlyView_(request.parameter["month"]);
  }
  return aggregateView_();
}

function include(path: string) {
  return HtmlService.createHtmlOutputFromFile(path).getContent();
}

function aggregateView_(): GoogleAppsScript.HTML.HtmlOutput {
  const template = HtmlService.createTemplateFromFile(
    "app/aggregate-view.html"
  );
  template.baseUrl = ScriptApp.getService().getUrl();
  // FIXME: hard-coding.
  template.rows = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("Aggregate")
    .getRange("A2:B")
    .getValues()
    .filter((row) => row[0]);
  return template.evaluate();
}

function monthlyView_(month: string): GoogleAppsScript.HTML.HtmlOutput {
  const template = HtmlService.createTemplateFromFile("app/monthly-view.html");
  // FIXME: hard-coding.
  template.rows = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName(month)
    .getRange("A1:G")
    .getValues();
  return template.evaluate();
}
