import { z } from "zod";

export function contactSchema(msgs: { name: string; email: string; message: string }) {
  return z.object({
    name: z.string().trim().min(2, msgs.name).max(80, msgs.name),
    email: z.string().trim().email(msgs.email),
    message: z.string().trim().min(10, msgs.message).max(1000, msgs.message),
    website: z.string().max(0).optional(), // honeypot
  });
}
export type ContactValues = { name: string; email: string; message: string; website?: string };
