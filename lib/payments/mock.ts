import type { ChargeResult, PaymentProvider } from "./provider";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Always "succeeds" after a short artificial delay so pending UI states are
 * actually visible. As a way to exercise the failure branch without a real
 * payment gateway, any amount ending in .13 is declined.
 */
export const mockPaymentProvider: PaymentProvider = {
  async charge(amount, _currency, ref): Promise<ChargeResult> {
    await delay(600);

    if (Math.round(amount * 100) % 100 === 13) {
      return { ok: false, error: "Card declined. Please try another card." };
    }

    return { ok: true, transactionId: `mock_${ref}_${Date.now()}` };
  },
};
