class Expense {
  constructor(
    // @ts-ignore
    private readonly date: dayjs.Dayjs,
    private readonly category: string,
    private readonly merchant: string,
    private readonly amount: number,
    private readonly means: string,
    readonly identifier: string
  ) {}

  dateFormattedAs(format: string): string {
    return this.date.format(format);
  }

  asArray() {
    return [
      this.dateFormattedAs("DD-MM-YYYY"),
      this.category,
      this.merchant,
      this.amount,
      this.means,
      /* notes= */ null,
      this.identifier,
    ];
  }
}

abstract class GmailMessageToExpense {
  private readonly identifier: string;
  protected readonly rawExtract: { [key: string]: string };

  constructor(message: GoogleAppsScript.Gmail.GmailMessage) {
    this.identifier = message.getHeader("Message-ID");
    this.rawExtract = this.pattern().exec(
      message.getPlainBody().split(/\s+/).join(" ")
    )?.groups;
  }

  ok(): boolean {
    return this.rawExtract != null;
  }

  toExpense(): Expense {
    // @ts-ignore
    let date = dayjs(this.rawExtract["date"], this.dateFormat(), true);
    return new Expense(
      date,
      this.category(),
      this.rawExtract["merchant"].toUpperCase(),
      this.parsedAmount(),
      this.means(),
      this.identifier
    );
  }

  protected abstract pattern(): RegExp;
  protected abstract dateFormat(): string;

  protected means(): string {
    return this.rawExtract["means"];
  }

  private category(): string {
    return null;
  }

  private parsedAmount(): number {
    let amount = parseFloat(this.rawExtract["amount"].replace(",", ""));
    if (this.rawExtract["reversal"] != null) {
      amount *= -1;
    }
    return amount;
  }
}

class AxisCreditCard extends GmailMessageToExpense {
  protected static readonly cardPattern = "Card no. XX(?<card>\\d{4})";
  protected static readonly amountPattern = "for INR (?<amount>[\\d,.]+)";
  protected static readonly merchantPattern = "at (?<merchant>.+)";
  protected static readonly datePattern =
    "on (?<date>\\d{2}-\\d{2}-\\d{2}) \\d{2}:\\d{2}:\\d{2}";

  protected pattern(): RegExp {
    return new RegExp(
      `${AxisCreditCard.cardPattern} ${AxisCreditCard.amountPattern} ` +
        `${AxisCreditCard.merchantPattern} ${AxisCreditCard.datePattern}`
    );
  }

  protected dateFormat(): string {
    return "DD-MM-YY";
  }

  protected means(): string {
    return `Axis Credit Card ${this.rawExtract["card"]}`;
  }
}

class AxisCreditCardOld extends GmailMessageToExpense {
  protected static readonly cardPattern =
    "Axis Bank Credit Card xx(?<card>\\d{4})";
  protected static readonly amountPattern = "Rs.(?<amount>[\\d,.]+) was spent";
  protected static readonly merchantPattern =
    "at (?<merchant>.+). Your available Credit Limit";
  protected static readonly datePattern =
    "on (?<date>\\d{2}-\\w{3}-\\d{2}) \\d{2}:\\d{2}:\\d{2} \\w{2}";

  protected pattern(): RegExp {
    return new RegExp(
      `${AxisCreditCardOld.amountPattern} on your ${AxisCreditCardOld.cardPattern} ` +
        `${AxisCreditCardOld.datePattern} ${AxisCreditCardOld.merchantPattern}`
    );
  }

  protected dateFormat(): string {
    return "DD-MMM-YY";
  }

  protected means(): string {
    return `Axis Credit Card ${this.rawExtract["card"]}`;
  }
}

abstract class HdfcCreditCard extends GmailMessageToExpense {
  protected static readonly cardPattern =
    "HDFC Bank Credit Card ending (?<card>\\d{4})";
  protected static readonly amountPattern = "Rs (?<amount>[\\d,.]+)";
  protected static readonly merchantPattern = "at (?<merchant>.+)";
  protected static readonly datePattern =
    "on (?<date>\\d{2}-\\d{2}-\\d{4}) \\d{2}:\\d{2}:\\d{2}";

  protected dateFormat(): string {
    return "DD-MM-YYYY";
  }

  protected means(): string {
    return `HDFC Credit Card ${this.rawExtract["card"]}`;
  }
}

class HdfcCreditCardDebit extends HdfcCreditCard {
  protected pattern(): RegExp {
    return new RegExp(
      `${HdfcCreditCard.cardPattern} for ${HdfcCreditCard.amountPattern} ` +
        `${HdfcCreditCard.merchantPattern} ${HdfcCreditCard.datePattern}`
    );
  }
}

class HdfcCreditCardDebitReversal extends HdfcCreditCard {
  protected pattern(): RegExp {
    return new RegExp(
      `${HdfcCreditCard.amountPattern}, on your ${HdfcCreditCard.cardPattern} ` +
        `${HdfcCreditCard.merchantPattern} ${HdfcCreditCard.datePattern} ` +
        `(?:is|(?:has been)) (?<reversal>reversed)`
    );
  }
}

abstract class IciciCreditCard extends GmailMessageToExpense {
  protected static readonly cardPattern =
    "ICICI Bank Credit Card XX(?<card>\\d{4})";
  protected static readonly amountPattern = "INR (?<amount>[\\d,.]+)";
  protected static readonly datePattern = "on (?<date>\\w+ \\d{2}, \\d{4})";

  protected dateFormat(): string {
    return "MMMM DD, YYYY";
  }

  protected means(): string {
    return `ICICI Credit Card ${this.rawExtract["card"]}`;
  }
}

class IciciCreditCardDebit extends IciciCreditCard {
  protected static readonly merchantPattern =
    "Info: (?<merchant>.+?)(?: \\\\)?. The Available Credit Limit";

  protected pattern(): RegExp {
    return new RegExp(
      `${IciciCreditCard.cardPattern} has been used for ` +
        `a transaction of ${IciciCreditCard.amountPattern} ` +
        `${IciciCreditCard.datePattern}; \\d{2}:\\d{2}:\\d{2}. ` +
        IciciCreditCardDebit.merchantPattern
    );
  }
}

class IciciCreditCardDebitReversal extends IciciCreditCard {
  protected static readonly merchantPattern =
    "from (?<merchant>.+). We wish to inform you that this refund";

  protected pattern(): RegExp {
    return new RegExp(
      `(?<reversal>refund on your) ${IciciCreditCard.cardPattern} ` +
        `for ${IciciCreditCard.amountPattern} ${IciciCreditCard.datePattern} ` +
        IciciCreditCardDebitReversal.merchantPattern
    );
  }
}

function sheetName() {
  return SpreadsheetApp.getActiveSheet().getName();
}

function scheduleTriggers() {
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

function tryGmailMessageToExpense_(
  message: GoogleAppsScript.Gmail.GmailMessage,
  messageToExpenseClasses: (new (
    _: GoogleAppsScript.Gmail.GmailMessage
  ) => GmailMessageToExpense)[]
): Expense {
  for (const messageToExpenseClass of messageToExpenseClasses) {
    const messageToExpenseInstance = new messageToExpenseClass(message);
    if (messageToExpenseInstance.ok()) {
      return messageToExpenseInstance.toExpense();
    }
  }
  return null;
}

function getExpensesByMonth_(): Map<string, Expense[]> {
  const expensesByMonth = new Map();
  const sources = [
    {
      query: "alerts@axisbank.com",
      messageToExpenseClasses: [AxisCreditCard],
    },
    {
      query: "transaction.alert@axisbank.com",
      messageToExpenseClasses: [AxisCreditCardOld],
    },
    {
      query: "from:alerts@hdfcbank.net",
      messageToExpenseClasses: [
        HdfcCreditCardDebit,
        HdfcCreditCardDebitReversal,
      ],
    },
    {
      query: "credit_cards@icicibank.com",
      messageToExpenseClasses: [
        IciciCreditCardDebit,
        IciciCreditCardDebitReversal,
      ],
    },
  ];
  sources.forEach((source) => {
    for (const thread of GmailApp.search(`${source.query} newer_than:5d`)) {
      for (const message of thread.getMessages()) {
        const expense = tryGmailMessageToExpense_(
          message,
          source.messageToExpenseClasses
        );
        if (expense != null) {
          const month = expense.dateFormattedAs("YYYY MMMM");
          if (!expensesByMonth.has(month)) {
            expensesByMonth.set(month, []);
          }
          expensesByMonth.get(month).push(expense);
        }
      }
    }
  });
  return expensesByMonth;
}

function getOrCreateExpenseSheetByName_(
  name: string
): GoogleAppsScript.Spreadsheet.Sheet {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(name);
  if (sheet != null) {
    return sheet;
  }
  // FIXME: hard-coding.
  return spreadsheet.insertSheet(name, 3, {
    template: spreadsheet.getSheetByName("Template"),
  });
}

function importExpenses() {
  fetchDayjs_();
  const expensesByMonth = getExpensesByMonth_();
  // FIXME: hard-coding.
  const HEADER_SIZE = { rows: 4, columns: 7 };
  expensesByMonth.forEach((expenses, month) => {
    const sheet = getOrCreateExpenseSheetByName_(month);
    if (expenses.length > 0) {
      const lastRow = Math.max(HEADER_SIZE.rows, sheet.getLastRow());
      const existingExpenses = new Set(
        // FIXME: hard-coding. Column G has the identifiers.
        sheet
          .getRange(`G${HEADER_SIZE.rows + 1}:G`)
          .getValues()
          .flat()
      );
      const newExpenses = expenses.filter(
        (expense) => !existingExpenses.has(expense.identifier)
      );
      if (newExpenses.length > 0) {
        sheet
          .getRange(
            lastRow + 1,
            /* column= */ 1,
            /* numRows= */ newExpenses.length,
            /* numColumns= */ HEADER_SIZE.columns
          )
          .setValues(newExpenses.map((expense) => expense.asArray()));
        // FIXME: hard-coding.
        sheet.getRange(`A${HEADER_SIZE.rows + 1}:G`).sort(/* column */ 1);
      }
    }
  });
}
