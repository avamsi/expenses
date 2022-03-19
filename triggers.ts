function schedule() {
  ScriptApp.newTrigger("daily").timeBased().atHour(8).everyDays(1).create();
}

function daily() {
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
