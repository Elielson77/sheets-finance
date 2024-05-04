import { SheetsController } from "@/controllers/Sheets";
import express from "express";

const sheetsRouter = express.Router();

sheetsRouter.get("/", SheetsController.getAll);
sheetsRouter.get("/:sheet/transactions", SheetsController.getTransactions);

sheetsRouter.post("/", SheetsController.createSheet);
sheetsRouter.post("/:sheet/transactions", SheetsController.createTransaction);

sheetsRouter.put(
  "/:sheet/transactions/:transaction_row",
  SheetsController.updateTransaction
);

sheetsRouter.delete(
  "/:sheet/transactions/:transaction_row",
  SheetsController.deleteTransaction
);

export default sheetsRouter;
