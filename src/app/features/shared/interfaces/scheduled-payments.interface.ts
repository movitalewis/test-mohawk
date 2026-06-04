export interface SchedulePayment {
  amount: number;
  bankAccountNumber: string;
  entries: Entries[];
  pk?: number;
  scheduledDate: string;
}
interface Entries {
  checked: boolean;
  company: string;
  customerNumber: string;
  deductionEntries: DeductionEntries[];
  discountAmount: number;
  documentDate: string;
  documentNumber: string;
  finalDueAmount: number;
  finalDueDate: string;
  freightAmount: number;
  hasDeductionFlag: boolean;
  netAmount: number;
  openAmount: number;
  otherAmount: number;
  pk: string;
  poNumber: string;
  scheduledAmount: number;
  showPdfURL: boolean;
  status: string;
  taxAmount: number;
  totalAmount: number;
  type: string;
}
interface DeductionEntries {
  comment: string;
  comments: string;
  deductionAmount: number;
  deductionDescription: string;
  index: number;
  netChargeAmount: number;
  openAmount: number;
  pk: number;
  selectedPayment: number;
}
