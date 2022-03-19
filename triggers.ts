function schedule() {
  ScriptApp.newTrigger("importExpenses")
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
  ScriptApp.newTrigger("refreshAggregate")
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
}
