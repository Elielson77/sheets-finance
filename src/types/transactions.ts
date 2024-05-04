export interface ITransaction {
  row_number: number;
  name: string;
  source: string;
  date: string;
  payment_method: PaymentMethod;
  type: string;
  value: number;
}

export type PaymentMethod = "credit" | "debit" | "pix";
