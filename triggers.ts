function schedule() {
  ScriptApp.newTrigger("incrementalRefresh")
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
}

function incrementalRefresh() {
  // @ts-ignore
  importOnlyRecentExpenses();
  // @ts-ignore
  refreshAggregate();
}

function onInstall() {
  // @ts-ignore
  importAllExpenses();
  // @ts-ignore
  sortSheets();
  // @ts-ignore
  refreshAggregate();
}
