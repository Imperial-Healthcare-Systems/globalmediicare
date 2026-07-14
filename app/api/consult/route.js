// Consultation enquiry endpoint.
// In the original single-file site the form faked success and discarded the
// lead. Here it POSTs to this handler, which validates and acknowledges the
// enquiry. Swap the console.log for email / Supabase / CRM when ready.

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
  const treatment = (data?.treatment || "").trim();

  if (!name || !country || !phone) {
    return Response.json(
      { ok: false, error: "Please provide your name, country and phone number." },
      { status: 422 }
    );
  }

  const lead = {
    name,
    country,
    dialCode: (data?.dialCode || "").trim(),
    phone,
    destination: (data?.destination || "").trim(),
    treatment,
    message: (data?.message || "").trim(),
    receivedAt: new Date().toISOString(),
  };

  // TODO: deliver the lead (email via Resend/SES, Supabase insert, WhatsApp, etc.)
  console.log("[consult] new enquiry:", lead);

  return Response.json({ ok: true });
}
