const { GEMINI_MODEL, GOOGLE_API_KEY } =
  PropertiesService.getScriptProperties().getProperties();

function gemini(request: string, responseSchema: any): any {
  if (!GEMINI_MODEL || !GOOGLE_API_KEY) {
    return null;
  }
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/` +
    `${GEMINI_MODEL}:generateContent?key=${GOOGLE_API_KEY}`;
  const payload = JSON.stringify({
    contents: [{ parts: [{ text: request }] }],
    generationConfig: { responseMimeType: "application/json", responseSchema },
  });
  const response = JSON.parse(
    UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      payload,
    }).getContentText(),
  )["candidates"][0]["content"]["parts"][0]["text"];
  return JSON.parse(response);
}

interface MerchantCategory {
  merchant: string;
  category: string;
}

// @ts-ignore
function merchantCategories(expenses: Expense[]): MerchantCategory[] {
  const request = expenses
    .map((expense) => `${expense.merchant}: ₹ ${expense.amount}`)
    .join("\n");
  const category = {
    type: "STRING",
    enum: [
      // keep-sorted start
      "Entertainment",
      "Food",
      "Groceries",
      "Jewelry",
      "Medical",
      "Others",
      "Personal",
      "Shopping",
      "Transportation",
      "Travel",
      "Utilities",
      "Vouchers",
      // keep-sorted end
    ],
  };
  const responseSchema = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: { merchant: { type: "STRING" }, category },
      required: ["merchant", "category"],
    },
  };
  return (gemini(request, responseSchema) ?? []) as MerchantCategory[];
}

// @ts-ignore
function categorize(expenses: Expense[]) {
  const categories = {};
  for (const { merchant, category } of merchantCategories(expenses)) {
    categories[merchant] = category;
  }
  expenses.forEach((expense) => {
    expense.category = categories[expense.merchant];
  });
}
