import { mockPaymentProvider } from "./mock";
import type { PaymentProvider } from "./provider";

// Swap this for a real provider (e.g. Stripe) when ready — everything
// upstream depends only on the PaymentProvider interface.
export const paymentProvider: PaymentProvider = mockPaymentProvider;

export type { ChargeResult, PaymentProvider } from "./provider";
