import { Request, Response } from "express";
import { getSpreadSheet } from "@/Spreadsheet";
import { ITransaction, PaymentMethod } from "@/types/transactions";
import { GoogleSpreadsheetRow } from "google-spreadsheet";
import { headerValues } from "@/utils/constants";

export class SheetsController {
  static async getAll(_: Request, res: Response) {
    try {
      const [spreadsheet, error] = await getSpreadSheet();
      if (error) throw error;
      const sheets = [];
      const sheetCount = spreadsheet.sheetCount;

      for (let i = 0; i < sheetCount; i++) {
        sheets.push(spreadsheet.sheetsByIndex[i].title);
      }

      res.send({ data: { results: sheets } });
    } catch (e) {
      res.send({ data: (e as Error).message }).status(400);
    }
  }

  static async createSheet(req: Request, res: Response) {
    try {
      const [spreadsheet, error] = await getSpreadSheet();
      if (error) throw error;

      const { sheet_name } = req.body;

      if (!sheet_name) throw Error("Sheet name must be in body.");

      const sheets = [];

      for (let i = 0; i < spreadsheet.sheetCount; i++) {
        sheets.push(spreadsheet.sheetsByIndex[i].title.toLowerCase());
      }

      if (sheets.includes(sheet_name.toLowerCase()))
        throw Error("A sheet with this name already exists");

      spreadsheet.addSheet({ title: sheet_name, headerValues });
      res.status(201).send();
    } catch (e) {
      res.status(400).send({ data: (e as Error).message });
    }
  }

  static async getTransactions(req: Request, res: Response) {
    try {
      const [spreadsheet, error] = await getSpreadSheet();
      if (error) throw error;

      const { sheet } = req.params;

      if (!sheet) throw Error("A sheet must be informed");

      const currentSheet = spreadsheet.sheetsByTitle[sheet];

      if (!currentSheet) throw Error(`The ${sheet} sheet not exists`);

      const rows = await currentSheet.getRows<ITransaction>();

      const parsedRows = rows.map(parseSheetRows);

      res.send({ results: parsedRows });
    } catch (error) {
      res.status(400).send({ data: (error as Error).message });
    }
  }

  static async createTransaction(req: Request, res: Response) {
    try {
      const [spreadsheet, error] = await getSpreadSheet();
      if (error) throw error;

      const { sheet } = req.params;
      if (!sheet) throw Error("A sheet must be informed");

      const currentSheet = spreadsheet.sheetsByTitle[sheet];

      if (!currentSheet) throw Error(`The ${sheet} sheet not exists`);

      const { name, date, payment_method, source, type, value } =
        validateHeaderValuesBody(req.body);

      const newRow = await currentSheet.addRow({
        name,
        value,
        payment_method,
        date: parseDate(date),
        source: source || "-",
        type: type || "-",
      });

      res.send({ data: newRow.toObject() });
    } catch (error) {
      res.status(404).send({ data: (error as Error).message });
    }
  }

  static async updateTransaction(req: Request, res: Response) {
    try {
      const [spreadsheet, error] = await getSpreadSheet();
      if (error) throw error;

      const { sheet, transaction_row } = req.params;
      if (!sheet) throw Error("A sheet must be informed");
      if (!transaction_row) throw Error("A transaction row must be informed");

      const currentSheet = spreadsheet.sheetsByTitle[sheet];

      if (!currentSheet) throw Error(`The ${sheet} sheet not exists`);

      const rows = await currentSheet.getRows<ITransaction>();

      const currentRow = rows[Number(transaction_row)];
      if (!currentRow) throw Error(`The ${transaction_row} row not exists`);

      const transactionValidated = validateHeaderValuesBody(req.body);
      const currentTransaction = currentRow.toObject() as ITransaction;
      const transactionUpdated = Object.assign(
        {},
        currentTransaction,
        transactionValidated
      );

      currentRow.assign(transactionUpdated);
      currentRow.save();

      res.send({ data: transactionUpdated });
    } catch (error) {
      res.status(400).send({ data: (error as Error).message });
    }
  }

  static async deleteTransaction(req: Request, res: Response) {
    try {
      const [spreadsheet, error] = await getSpreadSheet();
      if (error) throw error;

      const { sheet, transaction_row } = req.params;
      if (!sheet) throw Error("A sheet must be informed");
      if (!transaction_row) throw Error("A transaction row must be informed");

      const currentSheet = spreadsheet.sheetsByTitle[sheet];

      if (!currentSheet) throw Error(`The sheet ${sheet}  not exists`);

      const rows = await currentSheet.getRows<ITransaction>();

      const currentRow = rows[Number(transaction_row)];
      if (!currentRow) throw Error(`The row ${transaction_row} not exists`);

      currentRow.delete();

      res.sendStatus(204);
    } catch (error) {
      res.status(400).send({ data: (error as Error).message });
    }
  }
}

function parseSheetRows(row: GoogleSpreadsheetRow<ITransaction>): ITransaction {
  const currentRow = row.toObject() as ITransaction;

  return Object.assign({ row_number: row.rowNumber - 2 }, currentRow);
}

type ValidateBodyReturn = Omit<
  Partial<ITransaction>,
  "name" | "value" | "payment_method"
> & {
  name: string;
  value: number;
  payment_method: PaymentMethod;
};

function validateHeaderValuesBody(
  body: Record<string, string>
): ValidateBodyReturn {
  const validatedObj = {} as ITransaction;

  const headerKeys = Object.keys(body).filter((key) =>
    headerValues.includes(key as keyof ITransaction)
  ) as (keyof ITransaction)[];

  headerKeys.forEach((key) => {
    if (key === "name" && !body[key])
      throw Error("The body must have a name param.");

    if (key === "value" && !body[key])
      throw Error("The body must have a value param.");

    if (key === "payment_method" && !body[key])
      throw Error("The body must have a payment_method param.");

    validatedObj[key] = body[key] as never;
  });

  return validatedObj;
}

function parseDate(date?: string) {
  return new Date(date || new Date()).toLocaleDateString("en-US");
}
