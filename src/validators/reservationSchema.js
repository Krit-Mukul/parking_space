import { z } from "zod";

export const reservationSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  slotNumber: z.string().min(1, "Slot number is required"),
  startAt: z.string().min(1, "Start time is required"),
  duration: z.number().min(1, "Duration must be at least 1 hour"),
});
