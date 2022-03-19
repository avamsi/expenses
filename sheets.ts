function sheetName() {
  return SpreadsheetApp.getActiveSheet().getName();
}

function fetchDayjs_() {
  eval(UrlFetchApp.fetch("https://unpkg.com/dayjs").getContentText());
  eval(
    UrlFetchApp.fetch(
      "https://unpkg.com/dayjs/plugin/customParseFormat"
    ).getContentText()
  );
  // @ts-ignore
  dayjs.extend(dayjs_plugin_customParseFormat);
}

function sortSheets() {
  fetchDayjs_();
  const monthNameToNumber = (name: string) => {
    // @ts-ignore
    const date = dayjs(name, "YYYY MMMM", true);
    if (date.isValid()) {
      return date.format("YYYY-MM");
    }
    return name;
  };
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = spreadsheet.getSheets();
  sheets.sort((a, b) =>
    monthNameToNumber(a.getName()) > monthNameToNumber(b.getName()) ? -1 : 1
  );
  for (let i = 0; i < sheets.length; i++) {
    spreadsheet.setActiveSheet(sheets[i]);
    spreadsheet.moveActiveSheet(i + 1);
  }
}

function deleteSheets() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  for (const sheet of spreadsheet.getSheets()) {
    if (sheet.getName().startsWith("20")) {
      spreadsheet.deleteSheet(sheet);
    }
  }
}
