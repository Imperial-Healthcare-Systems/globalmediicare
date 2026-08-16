// Consultation / enquiry endpoint.
// Validates the lead and emails it to the team inbox over SMTP (the
// info@globalmediicare.com mailbox). Configured in .env.local:
//   SMTP_HOST   mail server host (e.g. mail.globalmediicare.com / smtp.hostinger.com)
//   SMTP_PORT   465 (SSL) or 587 (STARTTLS)
//   SMTP_USER   the mailbox that authenticates + sends (info@globalmediicare.com)
//   SMTP_PASS   that mailbox's password
//   MAIL_TO     (optional) where leads land; defaults to SMTP_USER
//   MAIL_FROM   (optional) From address; defaults to SMTP_USER
// If SMTP is not configured the lead is still validated, logged and acknowledged
// (so the form never breaks) — it just isn't emailed until the vars are set.
import nodemailer from "nodemailer";
import { getSupabaseServer } from "../../../lib/supabase";

export const dynamic = "force-dynamic";

const LEAD_INBOX = process.env.MAIL_TO || process.env.SMTP_USER || "info@globalmediicare.com";

function esc(s) {
  return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function emailLead(lead) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return { sent: false, reason: "smtp-not-configured" };
  const port = Number(process.env.SMTP_PORT || 465);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
    auth: { user, pass },
  });

  const rows = [
    ["Source", lead.source],
    ["Name", lead.name],
    ["Country", lead.country],
    ["Phone", (lead.dialCode ? lead.dialCode + " " : "") + lead.phone],
    ["Email", lead.email],
    ["Hospital / destination", lead.destination],
    ["Treatment / condition", lead.treatment],
    ["Stage", lead.stage],
    ["Preferred date", lead.preferredDate],
    ["Preferred slot", lead.preferredSlot],
    ["Message", lead.message],
    ["Received", lead.receivedAt],
  ].filter(([, v]) => v);

  const html =
    `<h2 style="font-family:Arial,sans-serif;color:#0D3B36">New enquiry — Globalmediicare</h2>` +
    `<table style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">` +
    rows.map(([k, v]) => `<tr><td style="padding:6px 14px 6px 0;color:#8C918D;vertical-align:top"><b>${esc(k)}</b></td><td style="padding:6px 0">${esc(v)}</td></tr>`).join("") +
    `</table>`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  await transporter.sendMail({
    from: `"Globalmediicare Website" <${process.env.MAIL_FROM || user}>`,
    to: LEAD_INBOX,
    replyTo: lead.email || undefined,
    subject: `New enquiry: ${lead.name}${lead.destination ? " — " + lead.destination : lead.treatment ? " — " + lead.treatment : ""}`,
    text,
    html,
  });
  return { sent: true };
}

// Persist the lead to Supabase so it appears in the admin "Enquiries" tab.
// Best-effort: if Supabase isn't configured or the write fails, we log and
// continue (email + acknowledgement still happen).
async function storeLead(lead) {
  const sb = getSupabaseServer();
  if (!sb) return { stored: false, reason: "supabase-not-configured" };
  const { error } = await sb.from("leads").insert({
    source: lead.source,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    dial_code: lead.dialCode,
    country: lead.country,
    treatment: lead.treatment,
    stage: lead.stage,
    destination: lead.destination,
    preferred_date: lead.preferredDate,
    preferred_slot: lead.preferredSlot,
    message: lead.message,
  });
  if (error) return { stored: false, reason: error.message };
  return { stored: true };
}

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const name = (data?.name || "").trim();
  const country = (data?.country || "").trim();
  const phone = (data?.phone || "").trim();

  if (!name || !country || !phone) {
    return Response.json(
      { ok: false, error: "Please provide your name, country and phone number." },
      { status: 422 }
    );
  }

  const lead = {
    source: (data?.source || "inline").trim(),
    name,
    country,
    email: (data?.email || "").trim(),
    dialCode: (data?.dialCode || "").trim(),
    phone,
    destination: (data?.destination || "").trim(),
    treatment: (data?.treatment || "").trim(),
    stage: (data?.stage || "").trim(),
    preferredDate: (data?.preferredDate || "").trim(),
    preferredSlot: (data?.preferredSlot || "").trim(),
    message: (data?.message || "").trim(),
    receivedAt: new Date().toISOString(),
  };

  // Store in Supabase (admin panel) and email the team — both best-effort so a
  // hiccup in one never breaks the user's submission or blocks the other.
  try {
    const s = await storeLead(lead);
    if (!s.stored) console.log("[consult] lead not stored (" + s.reason + "):", lead);
  } catch (err) {
    console.error("[consult] store failed:", err?.message || err);
  }

  try {
    const res = await emailLead(lead);
    if (!res.sent) console.log("[consult] lead (email not configured):", lead);
  } catch (err) {
    // Never fail the user's submission because email delivery hiccupped.
    console.error("[consult] email delivery failed:", err?.message || err);
    console.log("[consult] lead (delivery failed):", lead);
  }

  return Response.json({ ok: true });
}
