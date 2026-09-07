export type CreateBookingState = {
  errors: Record<string, string[]>;
  message: string;
};

export const initialCreateBookingState: CreateBookingState = {
  errors: {},
  message: "",
};
