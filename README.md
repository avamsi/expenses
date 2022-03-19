# expenses

Import expenses from Gmail to a Google Sheet and track everything in a single place without the data ever leaving your Google acccount.

## Aggregate View

![](https://github.com/avamsi/import-expenses/blob/main/screenshots/aggregate-view.png?raw=true)

## Monthly View

![](https://github.com/avamsi/import-expenses/blob/main/screenshots/monthly-view.png?raw=true)

## Usage

1. Make your own copy of the Google Sheet at https://bit.ly/avamsi-expenses-sheet.
   - Click on "File" and then "Make a copy".
2. Click on "Extensions" from the menu bar and then "Apps Script".
3. To regularly populate the Google Sheet you just created with recent expenses, select "triggers.gs" from the side bar and then click on "Run" ("schedule" should be selected on the dropdown by default). This will let the script run on a daily basis.
   - If you also want to import all your previous expenses, select and run "onInstall" from the dropdown.
4. Apps Script will ask you to review permissions at this point.
   - Click on "Review permissions" and select your Google account.
   - Google correctly warns you that this is an unverified app (I'm not really sure how to "verify" it TBH).
     - The script has no interaction with the outside world other than to download a library called "dayjs" and the only changes it does make are to the Google Sheet you just created.
     - To proceed, click on "Advanced" and then "Go to expenses (unsafe)".
   - I'm not sure why Google defaults to scary sounding "Read, compose, send, and permanently delete all your email from Gmail" when the script just reads email.
     - Similarly, the script doesn't change any Google Sheets other than the one you just created.
     - To proceed, click on "Allow".

## Known Issues

- Only Axis, HDFC and ICICI credit card expenses are supported.
  - Debit reversals are supported on HDFC and ICICI but not Axis (yet).
- I just have couple years of expenses, so I didn't implement any paging. You may face issues if you have a lot of data to sift through.
