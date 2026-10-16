import emailjs from "@emailjs/browser";

const service = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const template = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const key = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export const emailConfigured = Boolean(service && template && key);

export async function sendContactEmail(p: { name: string; email: string; message: string }) {
  if (!emailConfigured) throw new Error("not-configured");
  return emailjs.send(service!, template!, { from_name: p.name, reply_to: p.email, message: p.message }, { publicKey: key! });
}
