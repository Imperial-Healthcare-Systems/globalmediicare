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
