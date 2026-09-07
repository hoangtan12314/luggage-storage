export type ChargeResult =
  | { ok: true; transactionId: string }
  | { ok: false; error: string };

export interface PaymentProvider {
  charge(amount: number, currency: string, ref: string): Promise<ChargeResult>;
}
