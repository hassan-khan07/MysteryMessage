import { z } from "zod";

export const verifySchema = z.object({
  // HTML input fields always produce strings, even if the input looks like a number.
  // It looks numeric, but the value is "123456" (string), not number.
  code: z.string().length(6, "Verification code must be 6 digits"),
});
