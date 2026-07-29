// Treatment-cost catalogue — powers /treatment-cost and /treatment-cost/[slug].
// Procedure names and India cost ranges are generic medical-tourism facts;
// all surrounding copy is Global Mediicare's own. No third-party branding.
// Figures are indicative ranges in USD — refine anytime.

export const CATEGORIES = [
  "Oncology",
  "Cardiac Sciences",
  "Transplants",
  "Orthopedics",
  "Neurosurgery",
  "Fertility & Cosmetic",
];

export const TREATMENTS = [
  { slug: "bone-marrow-transplant", name: "Bone Marrow Transplant (BMT)", category: "Oncology", low: 18000, high: 55000,
    description: "Replaces damaged or diseased bone marrow with healthy blood-forming stem cells — used to treat leukaemia, lymphoma and other blood disorders, using the patient's own or a matched donor's cells.",
    variants: [ {name:"Autologous (patient's own cells)",low:14000,high:22000}, {name:"Allogeneic (matched donor)",low:22000,high:30000}, {name:"Unrelated / haploidentical donor",low:35000,high:55000} ],
    factors: ["Type of transplant (autologous vs allogeneic vs unrelated donor)","Donor matching and search costs","Hospital category and length of isolation stay","Post-transplant medication and immunosuppressants"],
    hospitalStay: "20–30 days (isolation)", totalDays: "60–90 days in country" },

  { slug: "chemotherapy", name: "Chemotherapy", category: "Oncology", low: 3500, high: 20000,
    description: "A drug-based cancer treatment using one or more anti-cancer agents to destroy or slow cancerous cells. Cost varies with the number of cycles and the specific regimen.",
    variants: [ {name:"Per cycle (standard agents)",low:400,high:1500}, {name:"Full course (multiple cycles)",low:3500,high:12000}, {name:"Targeted / immunotherapy regimen",low:8000,high:20000} ],
    factors: ["Number of cycles prescribed","Drug type (generic vs targeted/branded)","Cancer type and stage","Supportive care and day-care charges"],
    hospitalStay: "Day-care per cycle", totalDays: "Varies; 30–90 days in country" },

  { slug: "cancer-surgery", name: "Cancer Surgery (Oncosurgery)", category: "Oncology", low: 5000, high: 15000,
    description: "Surgical removal of a tumour or affected tissue, often alongside chemotherapy or radiation. Covers a broad range of solid-tumour procedures such as breast, colorectal and head-and-neck surgery.",
    variants: [ {name:"Breast cancer surgery (mastectomy)",low:5000,high:9000}, {name:"Colorectal cancer surgery",low:6000,high:12000}, {name:"Robotic / minimally invasive resection",low:8000,high:15000} ],
    factors: ["Tumour site, size and stage","Open vs laparoscopic vs robotic approach","Surgeon experience and hospital type","Need for reconstruction or adjuvant therapy"],
    hospitalStay: "4–8 days", totalDays: "15–25 days in country" },

  { slug: "coronary-bypass-cabg", name: "Coronary Artery Bypass (CABG)", category: "Cardiac Sciences", low: 5000, high: 9000,
    description: "Open-heart surgery that restores blood flow to the heart by grafting healthy vessels around blocked coronary arteries — a standard treatment for advanced coronary artery disease.",
    variants: [ {name:"Off-pump (beating heart) CABG",low:5500,high:8500}, {name:"Minimally invasive / robotic CABG",low:7000,high:9000} ],
    factors: ["Number of grafts required","On-pump vs off-pump technique","ICU duration and hospital category","Overall cardiac and health condition"],
    hospitalStay: "6–8 days", totalDays: "18–25 days in country" },

  { slug: "heart-valve-replacement", name: "Heart Valve Replacement", category: "Cardiac Sciences", low: 6000, high: 22000,
    description: "Replaces a diseased or damaged heart valve with a mechanical or tissue valve to restore normal blood flow — via open surgery or a catheter-based (TAVR) approach.",
    variants: [ {name:"Single valve replacement",low:6000,high:9000}, {name:"Double valve replacement",low:9000,high:13000}, {name:"TAVR / TAVI (transcatheter)",low:15000,high:22000} ],
    factors: ["Number of valves replaced","Mechanical vs tissue valve and brand","Surgical vs transcatheter approach","ICU stay and hospital category"],
    hospitalStay: "7–10 days", totalDays: "20–28 days in country" },

  { slug: "angioplasty-stent", name: "Coronary Angioplasty (Stent)", category: "Cardiac Sciences", low: 3000, high: 7000,
    description: "A minimally invasive procedure that opens narrowed coronary arteries with a balloon and usually a stent — commonly performed to treat blockages causing angina or a heart attack.",
    variants: [ {name:"Single stent",low:3000,high:5000}, {name:"Double / multiple stents",low:5000,high:7000} ],
    factors: ["Number and type of stents (drug-eluting vs bare-metal)","Complexity and number of blockages","Hospital category and cath-lab charges","Emergency vs elective procedure"],
    hospitalStay: "2–3 days", totalDays: "10–14 days in country" },

  { slug: "liver-transplant", name: "Liver Transplant", category: "Transplants", low: 28000, high: 42000,
    description: "Surgical replacement of a diseased liver with a healthy whole or partial liver from a living or deceased donor — used for end-stage liver disease, cirrhosis and certain liver cancers.",
    variants: [ {name:"Living-donor liver transplant",low:30000,high:42000}, {name:"Deceased (cadaveric) donor",low:28000,high:38000} ],
    factors: ["Living vs deceased donor procedure","Donor evaluation and surgery costs","Length of ICU and hospital stay","Post-transplant immunosuppressants"],
    hospitalStay: "18–25 days", totalDays: "45–60 days in country" },

  { slug: "kidney-transplant", name: "Kidney Transplant", category: "Transplants", low: 13000, high: 22000,
    description: "Surgical placement of a healthy donor kidney into a patient with end-stage kidney failure. Living-donor transplants are most common and offer strong long-term outcomes.",
    variants: [ {name:"Living-donor kidney transplant",low:13000,high:20000}, {name:"Deceased-donor kidney transplant",low:15000,high:22000} ],
    factors: ["Donor type and compatibility matching","Pre-transplant dialysis and workup","Hospital category and surgeon experience","Post-transplant immunosuppressants"],
    hospitalStay: "8–12 days", totalDays: "30–40 days in country" },

  { slug: "knee-replacement", name: "Knee Replacement", category: "Orthopedics", low: 4500, high: 11000,
    description: "Resurfaces or replaces a damaged knee joint with an artificial implant to relieve pain and restore mobility — commonly for advanced arthritis, as a partial, total or robotic-assisted procedure.",
    variants: [ {name:"Single (unilateral) knee",low:4500,high:7000}, {name:"Double (bilateral) knee",low:7500,high:11000}, {name:"Robotic-assisted knee",low:6500,high:9500} ],
    factors: ["Single vs bilateral procedure","Implant brand and material","Conventional vs robotic-assisted surgery","Physiotherapy and rehabilitation"],
    hospitalStay: "4–6 days", totalDays: "15–21 days in country" },

  { slug: "hip-replacement", name: "Hip Replacement", category: "Orthopedics", low: 5000, high: 12000,
    description: "Replaces a worn or damaged hip joint with a prosthetic implant to reduce pain and improve movement — offered as total, partial or resurfacing procedures.",
    variants: [ {name:"Total hip replacement (single)",low:5000,high:8000}, {name:"Bilateral hip replacement",low:8500,high:12000}, {name:"Hip resurfacing",low:6000,high:9000} ],
    factors: ["Single vs bilateral procedure","Implant type and brand","Surgical approach and hospital category","Rehabilitation and physiotherapy"],
    hospitalStay: "4–6 days", totalDays: "15–21 days in country" },

  { slug: "spinal-fusion", name: "Spinal Fusion Surgery", category: "Orthopedics", low: 5000, high: 12000,
    description: "Permanently joins two or more vertebrae to stabilise the spine and relieve pain from disc degeneration, spondylolisthesis or deformity — via open or minimally invasive techniques.",
    variants: [ {name:"Single-level fusion",low:5000,high:8000}, {name:"Multi-level fusion",low:8000,high:12000} ],
    factors: ["Number of spinal levels fused","Type and brand of implants","Open vs minimally invasive approach","Hospital category and length of stay"],
    hospitalStay: "5–7 days", totalDays: "18–25 days in country" },

  { slug: "knee-arthroscopy", name: "Knee Arthroscopy", category: "Orthopedics", low: 2000, high: 4500,
    description: "A minimally invasive keyhole procedure to diagnose and treat joint problems such as ligament tears, cartilage damage or meniscus injuries, with faster recovery than open surgery.",
    variants: [ {name:"Diagnostic / meniscus repair",low:2000,high:3000}, {name:"ACL reconstruction",low:3000,high:4500} ],
    factors: ["Type of repair or reconstruction","Graft and implant materials","Surgeon experience and hospital type","Post-operative rehabilitation"],
    hospitalStay: "1–2 days", totalDays: "10–14 days in country" },

  { slug: "brain-tumor-surgery", name: "Brain Tumour Surgery", category: "Neurosurgery", low: 5000, high: 9000,
    description: "Surgical removal of a benign or malignant brain tumour — via craniotomy or minimally invasive techniques — aiming to remove as much tumour as safely possible while preserving function.",
    variants: [ {name:"Craniotomy (open resection)",low:5000,high:8000}, {name:"Awake / neuronavigation-guided",low:6500,high:9000} ],
    factors: ["Tumour size, type and location","Technique and use of neuronavigation","ICU and hospital stay duration","Need for post-surgical radiation/chemo"],
    hospitalStay: "7–10 days", totalDays: "20–30 days in country" },

  { slug: "stereotactic-radiosurgery", name: "Stereotactic Radiosurgery", category: "Neurosurgery", low: 6000, high: 11000,
    description: "A non-invasive, highly focused radiation treatment for brain tumours, vascular malformations and functional disorders — delivering precise radiation while sparing surrounding tissue.",
    variants: [ {name:"Gamma Knife",low:6000,high:9000}, {name:"CyberKnife",low:8000,high:11000} ],
    factors: ["Lesion size and number of targets","Technology platform used","Number of sessions/fractions","Hospital category and planning complexity"],
    hospitalStay: "1–2 days (mostly outpatient)", totalDays: "10–15 days in country" },

  { slug: "spinal-decompression", name: "Spinal Decompression / Discectomy", category: "Neurosurgery", low: 4000, high: 8000,
    description: "Relieves pressure on the spinal cord or nerves caused by herniated discs, bone spurs or spinal stenosis — often via minimally invasive endoscopic or microsurgical methods.",
    variants: [ {name:"Microdiscectomy",low:4000,high:6000}, {name:"Endoscopic spine decompression",low:5500,high:8000} ],
    factors: ["Number of spinal levels involved","Open vs endoscopic approach","Surgeon experience and hospital category","Length of stay and rehabilitation"],
    hospitalStay: "3–5 days", totalDays: "12–18 days in country" },

  { slug: "ivf", name: "IVF (In Vitro Fertilisation)", category: "Fertility & Cosmetic", low: 2500, high: 6000,
    description: "An assisted-reproduction procedure in which eggs are fertilised with sperm in a laboratory and the resulting embryo transferred to the uterus. Multiple cycles or add-ons may be advised.",
    variants: [ {name:"Standard IVF (per cycle)",low:2500,high:4000}, {name:"IVF with ICSI",low:3000,high:5000}, {name:"IVF with donor egg/sperm",low:4000,high:6000} ],
    factors: ["Number of cycles required","Add-ons such as ICSI, PGT or donor gametes","Fertility medication dosage","Clinic reputation and success rates"],
    hospitalStay: "Outpatient (day procedures)", totalDays: "20–30 days per cycle" },

  { slug: "bariatric-surgery", name: "Bariatric (Weight-Loss) Surgery", category: "Fertility & Cosmetic", low: 5000, high: 9500,
    description: "Procedures that aid significant weight loss by reducing stomach size or altering digestion — used to treat severe obesity and related conditions, most performed laparoscopically.",
    variants: [ {name:"Gastric sleeve (sleeve gastrectomy)",low:5000,high:7500}, {name:"Gastric bypass",low:6500,high:9500}, {name:"Gastric banding",low:5000,high:7000} ],
    factors: ["Type of bariatric procedure","Patient BMI and comorbidities","Laparoscopic vs robotic approach","Hospital category and length of stay"],
    hospitalStay: "3–5 days", totalDays: "12–18 days in country" },

  { slug: "hair-transplant", name: "Hair Transplant", category: "Fertility & Cosmetic", low: 1200, high: 4000,
    description: "A cosmetic procedure that relocates hair follicles from a donor area to thinning or bald regions of the scalp — commonly done using FUE or FUT techniques as an outpatient treatment.",
    variants: [ {name:"FUE (follicular unit extraction)",low:1500,high:4000}, {name:"FUT (follicular unit transplantation)",low:1200,high:3000} ],
    factors: ["Number of grafts required","Technique (FUE vs FUT vs DHI)","Clinic and surgeon experience","Extent of the balding area"],
    hospitalStay: "Outpatient (day procedure)", totalDays: "5–10 days in country" },
];

// ----- helpers -----
export const usd = (n) => "$" + Number(n).toLocaleString("en-US");
export const range = (lo, hi) => usd(lo) + " – " + usd(hi);

export function getTreatment(slug) {
  return TREATMENTS.find((t) => t.slug === slug) || null;
}
export function byCategory() {
  return CATEGORIES.map((c) => ({ category: c, items: TREATMENTS.filter((t) => t.category === c) }))
    .filter((g) => g.items.length);
}
export function related(t, n = 3) {
  return TREATMENTS.filter((x) => x.category === t.category && x.slug !== t.slug).slice(0, n);
}
