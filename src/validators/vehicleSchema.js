import { z } from "zod";

export const vehicleSchema = z.object({
  number: z.string().min(3, "Vehicle number must be at least 3 characters"),
  model: z.string().optional(),
});
