function fetchDayjs() {
  eval(UrlFetchApp.fetch("https://unpkg.com/dayjs").getContentText());
  eval(
    UrlFetchApp.fetch(
      "https://unpkg.com/dayjs/plugin/customParseFormat",
    ).getContentText(),
  );
  // @ts-ignore
  dayjs.extend(dayjs_plugin_customParseFormat);
}
