import { z } from "zod";

export const paymentSchema = z.object({
  reservationId: z.string().min(1, "Please select a reservation"),
  paymentMethod: z.enum(["credit_card", "debit_card", "cash", "upi", "wallet"]),
});
