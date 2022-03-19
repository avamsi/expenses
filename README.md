# expenses

## Aggregate View
![](https://github.com/avamsi/import-expenses/blob/main/screenshots/aggregate-view.png?raw=true)

## Monthly View
![](https://github.com/avamsi/import-expenses/blob/main/screenshots/monthly-view.png?raw=true)

## Usage
1. Make your own copy of the Google Sheet at https://bit.ly/avamsi-expenses-sheet.
   * Click on "File" and then "Make a copy".
2. Click on "Extensions" from the menu bar and then "Apps Script".
3. Select "main.gs" from the side bar and then click on "Run" ("importExpenses").
4. Apps Script will ask you to review permissions at this point.
   * Click on "Review permissions" and select your Google account.
   * Google correctly warns you that this is an unverified app (I'm not really sure how to "verify" it TBH).
     * The script has no interaction with the outside world other than to download a library called "dayjs" and the only changes it does make are to the Google Sheet you just created.
     * To proceed, click on "Advanced" and then "Go to expenses (unsafe)".
   * I'm not sure why Google defaults to scary sounding "Read, compose, send, and permanently delete all your email from Gmail" when the script just reads email (similarly, the script doesn't change any Google Sheets other than the one you just created).
     * To proceed, click on "Allow".
5. Your expenses from the last 5 days should've been populated in the Google Sheet at this point.
   * If you'd like to import all your expenses to this point, open "main.gs", search for "newer_than", temporarily remove it and run "importExpenses" again.
     * Add back the "newer_than" argument (it's just an optimization to avoid scanning all mails again and again).
     * You'll likely want to open "sheets.gs" and run "sortSheets" (click on the dropdown saying "sheetName" and select "sortSheets").
6. To generate the aggregate view, open "aggregate.gs" and run "refreshAggregate".
7. To schedule the script to run daily, open "triggers.gs" and run "schedule".
