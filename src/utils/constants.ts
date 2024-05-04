import { ITransaction } from "@/types/transactions";

export const headerValues: (keyof ITransaction)[] = [
  "name",
  "date",
  "source",
  "payment_method",
  "type",
  "value",
];
