// Fallback sample data — served by the API routes when Supabase is not
// configured (or unreachable), so the public /doctors and /hospitals pages
// always render. Mirrors db/schema.sql seed. Replace via the admin panel once
// Supabase is connected.
//
// NOTE: doctors are fictional; hospital accreditation/beds/established are
// illustrative — verify before publishing.

export const SEED_HOSPITALS = [
  { name: "Medanta - The Medicity", city: "Gurgaon", country: "in", image_url: "/assets/hospitals/medanta-the-medicity.jpg", accreditation: ["JCI", "NABH"], beds: 1250, established: 2009, specialties: ["Cardiology", "Oncology", "Neurosurgery", "Organ Transplant"] },
  { name: "Indraprastha Apollo", city: "New Delhi", country: "in", image_url: "/assets/hospitals/indraprastha-apollo.jpg", accreditation: ["JCI", "NABH"], beds: 710, established: 1996, specialties: ["Oncology", "Cardiology", "Orthopedics", "Organ Transplant"] },
  { name: "Kokilaben Dhirubhai Ambani", city: "Mumbai", country: "in", image_url: "/assets/hospitals/kokilaben-dhirubhai-ambani.jpg", accreditation: ["NABH", "NABL"], beds: 750, established: 2009, specialties: ["Neurosurgery", "Oncology", "Cardiology", "IVF & Fertility"] },
  { name: "Apollo Hospitals", city: "Chennai", country: "in", image_url: "/assets/hospitals/apollo-hospitals.jpg", accreditation: ["JCI", "NABH"], beds: 560, established: 1983, specialties: ["Cardiology", "Orthopedics", "IVF & Fertility", "Bariatric"] },
  { name: "Erdem Hospital", city: "Istanbul", country: "tr", image_url: "/assets/hospitals/erdem-hospital.webp", accreditation: ["ISO"], beds: 200, established: 1988, specialties: ["Bariatric", "Cosmetic & Hair", "Orthopedics", "Cardiology"] },
  { name: "Burjeel Hospital", city: "Abu Dhabi", country: "ae", image_url: "/assets/hospitals/burjeel-hospital.jpg", accreditation: ["JCI", "ISO"], beds: 400, established: 2012, specialties: ["Orthopedics", "Cardiology", "Oncology", "Cosmetic & Hair"] },
  { name: "Saudi German Hospital", city: "Dubai", country: "ae", image_url: "/assets/hospitals/saudi-german-hospital.jpg", accreditation: ["JCI"], beds: 300, established: 2012, specialties: ["Gynecology", "Orthopedics", "Bariatric", "Cardiology"] },
  { name: "Bumrungrad International", city: "Bangkok", country: "th", image_url: "/assets/hospitals/bumrungrad-international.jpg", accreditation: ["JCI", "GHA"], beds: 580, established: 1980, specialties: ["Bariatric", "Oncology", "Cardiology", "Orthopedics"] },
  { name: "Bangkok Hospital", city: "Bangkok", country: "th", image_url: "/assets/hospitals/bangkok-hospital.jpg", accreditation: ["JCI", "GHA"], beds: 650, established: 1972, specialties: ["Cardiology", "Cosmetic & Hair", "Neurosurgery", "Oncology"] },
  { name: "Charité", city: "Berlin", country: "de", image_url: "/assets/hospitals/charite.jpg", accreditation: ["ISO"], beds: 3000, established: 1710, specialties: ["Spine Surgery", "Oncology", "Neurosurgery", "Organ Transplant"] },
  { name: "Heidelberg University Hospital", city: "Heidelberg", country: "de", image_url: "/assets/hospitals/heidelberg-university-hospital.jpg", accreditation: ["ISO"], beds: 1900, established: 1388, specialties: ["Organ Transplant", "Oncology", "Cardiology", "Spine Surgery"] },
  { name: "As-Salam International", city: "Cairo", country: "eg", image_url: "/assets/hospitals/as-salam-international.jpg", accreditation: ["ISO"], beds: 350, established: 1982, specialties: ["Cardiology", "Oncology", "Orthopedics", "Gynecology"] },
  { name: "Cleopatra Hospital", city: "Cairo", country: "eg", image_url: "/assets/hospitals/cleopatra-hospital.jpg", accreditation: ["ISO"], beds: 220, established: 1979, specialties: ["Gynecology", "Cardiology", "IVF & Fertility", "Bariatric"] },
];

export const SEED_DOCTORS = [
  { name: "Dr. Rajesh Menon", designation: "Senior Consultant", specialty: "Cardiology", experience: 24, hospital: "Medanta", city: "Gurgaon", country: "in", photo_url: null },
  { name: "Dr. Ananya Sharma", designation: "Director", specialty: "Oncology", experience: 19, hospital: "Indraprastha Apollo", city: "New Delhi", country: "in", photo_url: null },
  { name: "Dr. Vikram Rao", designation: "Head of Department", specialty: "Neurosurgery", experience: 22, hospital: "Kokilaben", city: "Mumbai", country: "in", photo_url: null },
  { name: "Dr. Priya Nair", designation: "Senior Consultant", specialty: "IVF & Fertility", experience: 16, hospital: "Apollo", city: "Chennai", country: "in", photo_url: null },
  { name: "Dr. Arjun Kapoor", designation: "Consultant", specialty: "Orthopedics", experience: 15, hospital: "Medanta", city: "Gurgaon", country: "in", photo_url: null },
  { name: "Dr. Mehmet Yilmaz", designation: "Professor", specialty: "Oncology", experience: 21, hospital: "Medical Park", city: "Istanbul", country: "tr", photo_url: null },
  { name: "Dr. Elif Demir", designation: "Senior Consultant", specialty: "Cardiology", experience: 18, hospital: "Memorial Hospitals", city: "Istanbul", country: "tr", photo_url: null },
  { name: "Dr. Khalid Al Mansoori", designation: "Consultant", specialty: "Orthopedics", experience: 17, hospital: "Burjeel", city: "Abu Dhabi", country: "ae", photo_url: null },
  { name: "Dr. Sara Haddad", designation: "Senior Consultant", specialty: "Gynecology", experience: 14, hospital: "Saudi German", city: "Dubai", country: "ae", photo_url: null },
  { name: "Dr. Somchai Prasert", designation: "Director", specialty: "Bariatric", experience: 20, hospital: "Bumrungrad", city: "Bangkok", country: "th", photo_url: null },
  { name: "Dr. Kanya Srisai", designation: "Consultant", specialty: "Cosmetic & Hair", experience: 13, hospital: "Bangkok Hospital", city: "Bangkok", country: "th", photo_url: null },
  { name: "Dr. Hans Weber", designation: "Professor", specialty: "Spine Surgery", experience: 26, hospital: "Charité", city: "Berlin", country: "de", photo_url: null },
  { name: "Dr. Lena Schmidt", designation: "Senior Consultant", specialty: "Organ Transplant", experience: 23, hospital: "Heidelberg University", city: "Heidelberg", country: "de", photo_url: null },
  { name: "Dr. Omar Fahmy", designation: "Consultant", specialty: "Cardiology", experience: 18, hospital: "As-Salam International", city: "Cairo", country: "eg", photo_url: null },
  { name: "Dr. Nadia Mostafa", designation: "Senior Consultant", specialty: "Oncology", experience: 15, hospital: "Cleopatra Hospital", city: "Cairo", country: "eg", photo_url: null },
];

// News & Blogs fallback — served by /news + /api/posts when Supabase is not
// configured. Mirrors db/blog.sql seed. Bodies are Markdown. Manage via /admin.
export const SEED_POSTS = [
  {
    title: "What to Prepare Before Travelling to India for Treatment",
    slug: "prepare-before-travelling-to-india-for-treatment",
    category: "Guide",
    excerpt: "A practical checklist for international patients — documents, medical records, visa steps and what to pack for a smooth medical journey.",
    body: "Planning treatment abroad can feel overwhelming. A little preparation goes a long way toward a calm, well-organised journey.\n\n## Gather your medical records\n\nCollect recent reports, scans and prescriptions in one folder — digital copies are ideal. Sharing these early lets the treating hospital give an accurate opinion and estimate before you travel.\n\n## Documents and visa\n\n- A passport valid for at least six months\n- Your medical visa invitation letter from the hospital\n- Copies of prior diagnoses and discharge summaries\n\nOur care team helps arrange the invitation letter and guides you through the medical visa application.\n\n## What to pack\n\nBring comfortable clothing, a list of current medications, and any assistive devices you use daily. Keep essentials and documents in your cabin bag.\n\n> Tip: share your reports with us before booking flights — an early opinion helps you plan dates around the recommended treatment.",
    cover_url: null,
    author: "Globalmediicare Care Team",
    tags: ["travel", "planning", "medical visa"],
    published: true,
    published_at: "2026-08-05T09:00:00Z",
  },
  {
    title: "Understanding the Cost of Cancer Care Abroad",
    slug: "understanding-the-cost-of-cancer-care-abroad",
    category: "Blog",
    excerpt: "How oncology treatment estimates are built, what affects the final figure, and why an itemised quote matters for international patients.",
    body: "Cost is one of the first questions patients ask — and one of the most important to get right.\n\n## Why estimates vary\n\nEvery cancer case is different. The final figure depends on the stage, the recommended protocol, the length of stay and the specific hospital. That is why a genuine estimate always follows a review of your medical reports.\n\n## What a good estimate includes\n\n- Consultation and diagnostic workup\n- The core treatment (surgery, chemotherapy, radiation or a combination)\n- Hospital stay and supportive care\n- A clear note of what is **not** included\n\n## Ask for it in writing\n\nAn itemised, written estimate lets you compare options with confidence and avoid surprises. Our team helps you obtain and understand these estimates at no charge.",
    cover_url: null,
    author: "Globalmediicare Editorial",
    tags: ["oncology", "cost", "estimates"],
    published: true,
    published_at: "2026-07-22T09:00:00Z",
  },
  {
    title: "Globalmediicare Expands Its International Hospital Network",
    slug: "globalmediicare-expands-international-hospital-network",
    category: "News",
    excerpt: "We continue to grow our network of accredited hospitals across India, Turkey, the UAE, Thailand, Germany and Egypt to give patients more choice.",
    body: "We are pleased to share that our network of accredited partner hospitals continues to grow across six countries.\n\nThis means more choice for international patients — a wider range of specialists, destinations and price points, all coordinated through a single care team.\n\n## More choice, same support\n\nEvery hospital in our network is selected for accreditation, clinical outcomes and international patient experience. Whichever destination you choose, our coordination — from first opinion to recovery — stays free of charge.\n\nExplore the [hospitals directory](/hospitals) or [request a free medical opinion](/#consult) to get started.",
    cover_url: null,
    author: "Globalmediicare",
    tags: ["announcement", "network"],
    published: true,
    published_at: "2026-07-10T09:00:00Z",
  },
];
