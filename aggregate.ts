function refreshAggregate() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const monthlyExpenseSheets = spreadsheet
    .getSheets()
    .filter((sheet) => sheet.getName().startsWith("20"));
  const rows: any[][] = [];
  for (const monthlyExpenseSheet of monthlyExpenseSheets) {
    rows.push(
      [
        monthlyExpenseSheet.getName(),
        monthlyExpenseSheet.getRange("C1").getValue(),
      ].concat(monthlyExpenseSheet.getRange("E2:G2").getValues().flat()),
    );
  }
  spreadsheet
    .getSheetByName("Aggregate")!
    .getRange(
      /* row= */ 5,
      /* column= */ 1,
      /* numRows= */ rows.length,
      /* numColumns= */ rows[0].length,
    )
    .setValues(rows);
}
