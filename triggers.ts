function schedule() {
  ScriptApp.newTrigger("importExpenses")
    .timeBased()
    .atHour(8)
    .everyDays(1)
    .create();
  ScriptApp.newTrigger("importExpenses")
    .timeBased()
    .atHour(16)
    .everyDays(1)
    .create();
}
