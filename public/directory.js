/* ===== Global Mediicare — Doctors & Hospitals directory engine =====
   Shared by /doctors and /hospitals. Renders the listing that matches whichever
   grid container is present, wires client-side search + filters, and handles the
   shared chrome (mobile drawer, sticky-header state, scroll progress, reveals).

   NOTE: DOCTORS is curated SAMPLE data (fictional specialists) and the hospital
   accreditation / beds / established / specialties values are ILLUSTRATIVE —
   replace with verified data (or a real API/DB) before publishing. */
(function () {
"use strict";

/* --- flags (six operating countries) --- */
var FLAGS = {
  in:'<rect width="30" height="20" fill="#fff"/><rect width="30" height="6.7" fill="#FF9933"/><rect y="13.3" width="30" height="6.7" fill="#138808"/><circle cx="15" cy="10" r="2.6" fill="none" stroke="#000080" stroke-width=".8"/><circle cx="15" cy="10" r=".7" fill="#000080"/>',
  tr:'<rect width="30" height="20" fill="#E30A17"/><circle cx="12" cy="10" r="5.2" fill="#fff"/><circle cx="13.4" cy="10" r="4.2" fill="#E30A17"/><path d="M19.5 10l-3.2 1.05 2-2.75v3.4l-2-2.75z" fill="#fff"/>',
  ae:'<rect width="30" height="20" fill="#00732F"/><rect y="6.7" width="30" height="6.6" fill="#fff"/><rect y="13.3" width="30" height="6.7" fill="#000"/><rect width="8" height="20" fill="#FF0000"/>',
  th:'<rect width="30" height="20" fill="#A51931"/><rect y="3.3" width="30" height="13.4" fill="#F4F5F8"/><rect y="6.7" width="30" height="6.6" fill="#2D2A4A"/>',
  de:'<rect width="30" height="20" fill="#000"/><rect y="6.7" width="30" height="6.6" fill="#DD0000"/><rect y="13.3" width="30" height="6.7" fill="#FFCE00"/>',
  eg:'<rect width="30" height="20" fill="#CE1126"/><rect y="6.7" width="30" height="6.6" fill="#fff"/><rect y="13.3" width="30" height="6.7" fill="#000"/><path d="M15 8.2l1.6 1 -.4 1.9h-2.4l-.4-1.9z" fill="#C09300"/>'
};
var COUNTRY = { in:"India", tr:"Turkey", ae:"UAE", th:"Thailand", de:"Germany", eg:"Egypt" };
function flag(c, w) { return '<span class="fl" style="width:' + (w || 20) + 'px"><svg viewBox="0 0 30 20" width="100%" xmlns="http://www.w3.org/2000/svg">' + (FLAGS[c] || "") + "</svg></span>"; }

/* small inline icons */
var I = {
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  hosp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 8h1m4 0h1M9 12h1m4 0h1M11 21v-4h2v4"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.4-8 12-8 12s-8-7.6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  steth:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3v6a5 5 0 0 0 10 0V3M4 3H2m2 0h2m6 0h2m-2 0h-2m3 16a3 3 0 1 0 6 0c0-2-1-3-1-6"/><circle cx="20" cy="10" r="1"/></svg>'
};
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function initials(name){ return name.replace(/^Dr\.?\s+/i,"").split(/\s+/).slice(0,2).map(function(w){return w[0];}).join("").toUpperCase(); }
function uniq(arr){ return arr.filter(function(v,i){return arr.indexOf(v)===i;}); }

/* ===== DATA ===== */
/* Doctors — [name, designation, specialty, yearsExp, hospital, city, countryISO] */
var DOCTORS = [
 ["Dr. Rajesh Menon","Senior Consultant","Cardiology",24,"Medanta","Gurgaon","in"],
 ["Dr. Ananya Sharma","Director","Oncology",19,"Indraprastha Apollo","New Delhi","in"],
 ["Dr. Vikram Rao","Head of Department","Neurosurgery",22,"Kokilaben","Mumbai","in"],
 ["Dr. Priya Nair","Senior Consultant","IVF & Fertility",16,"Apollo","Chennai","in"],
 ["Dr. Arjun Kapoor","Consultant","Orthopedics",15,"Medanta","Gurgaon","in"],
 ["Dr. Mehmet Yilmaz","Professor","Oncology",21,"Medical Park","Istanbul","tr"],
 ["Dr. Elif Demir","Senior Consultant","Cardiology",18,"Memorial Hospitals","Istanbul","tr"],
 ["Dr. Khalid Al Mansoori","Consultant","Orthopedics",17,"Burjeel","Abu Dhabi","ae"],
 ["Dr. Sara Haddad","Senior Consultant","Gynecology",14,"Saudi German","Dubai","ae"],
 ["Dr. Somchai Prasert","Director","Bariatric",20,"Bumrungrad","Bangkok","th"],
 ["Dr. Kanya Srisai","Consultant","Cosmetic & Hair",13,"Bangkok Hospital","Bangkok","th"],
 ["Dr. Hans Weber","Professor","Spine Surgery",26,"Charité","Berlin","de"],
 ["Dr. Lena Schmidt","Senior Consultant","Organ Transplant",23,"Heidelberg University","Heidelberg","de"],
 ["Dr. Omar Fahmy","Consultant","Cardiology",18,"As-Salam International","Cairo","eg"],
 ["Dr. Nadia Mostafa","Senior Consultant","Oncology",15,"Cleopatra Hospital","Cairo","eg"]
];

/* Hospitals — [name, city, countryISO, image, accreditation[], beds, established, specialties[]] */
var HOSPITALS = [
 ["Medanta - The Medicity","Gurgaon","in","https://en.wikipedia.org/wiki/Special:FilePath/Medanta_the_medicity_hospital.jpg",["JCI","NABH"],1250,2009,["Cardiology","Oncology","Neurosurgery","Organ Transplant"]],
 ["Indraprastha Apollo","New Delhi","in","https://commons.wikimedia.org/wiki/Special:FilePath/Apollo_Hospital_Indraprastha.jpg",["JCI","NABH"],710,1996,["Oncology","Cardiology","Orthopedics","Organ Transplant"]],
 ["Kokilaben Dhirubhai Ambani","Mumbai","in","https://commons.wikimedia.org/wiki/Special:FilePath/Lilavati_Hospital,_Bandra.jpg",["NABH","NABL"],750,2009,["Neurosurgery","Oncology","Cardiology","IVF & Fertility"]],
 ["Apollo Hospitals","Chennai","in","https://commons.wikimedia.org/wiki/Special:FilePath/Apollo_Enterns_001.jpg",["JCI","NABH"],560,1983,["Cardiology","Orthopedics","IVF & Fertility","Bariatric"]],
 ["Medical Park","Istanbul","tr","https://commons.wikimedia.org/wiki/Special:FilePath/Acibadem_Atasehir.jpg",["JCI","ISO"],400,1995,["Oncology","Cardiology","Organ Transplant","Cosmetic & Hair"]],
 ["Memorial Hospitals","Istanbul","tr","https://commons.wikimedia.org/wiki/Special:FilePath/2021-03-14_Acibadem_Uskudar.jpg",["JCI"],450,2000,["Cardiology","Oncology","IVF & Fertility","Bariatric"]],
 ["Burjeel Hospital","Abu Dhabi","ae","https://commons.wikimedia.org/wiki/Special:FilePath/Shaikh_Khalifa_Medical_City.jpg",["JCI","ISO"],400,2012,["Orthopedics","Cardiology","Oncology","Cosmetic & Hair"]],
 ["Saudi German Hospital","Dubai","ae","https://commons.wikimedia.org/wiki/Special:FilePath/Iranian_Hospital,_Dubai.jpg",["JCI"],300,2012,["Gynecology","Orthopedics","Bariatric","Cardiology"]],
 ["Bumrungrad International","Bangkok","th","https://commons.wikimedia.org/wiki/Special:FilePath/Thailand_Bangkok_Bumrungrad_International_Hospital_entrance-building.jpg",["JCI","GHA"],580,1980,["Bariatric","Oncology","Cardiology","Orthopedics"]],
 ["Bangkok Hospital","Bangkok","th","https://commons.wikimedia.org/wiki/Special:FilePath/Bangkok_hospital_building01.jpg",["JCI","GHA"],650,1972,["Cardiology","Cosmetic & Hair","Neurosurgery","Oncology"]],
 ["Charité","Berlin","de","https://commons.wikimedia.org/wiki/Special:FilePath/2016_Charite_Hospital.jpg",["ISO"],3000,1710,["Spine Surgery","Oncology","Neurosurgery","Organ Transplant"]],
 ["Heidelberg University Hospital","Heidelberg","de","https://commons.wikimedia.org/wiki/Special:FilePath/Neue_Chirurgische_Klinik_Heidelberg.jpg",["ISO"],1900,1388,["Organ Transplant","Oncology","Cardiology","Spine Surgery"]],
 ["As-Salam International","Cairo","eg","https://commons.wikimedia.org/wiki/Special:FilePath/New_Cairo_hospital.jpg",["ISO"],350,1982,["Cardiology","Oncology","Orthopedics","Gynecology"]],
 ["Cleopatra Hospital","Cairo","eg","https://commons.wikimedia.org/wiki/Special:FilePath/Cairouniversityhospital.JPG",["ISO"],220,1979,["Gynecology","Cardiology","IVF & Fertility","Bariatric"]]
];

var GRADS = ["linear-gradient(135deg,#1A5F57,#0D3B36)","linear-gradient(135deg,#C89B3C,#A87C29)","linear-gradient(135deg,#1B5691,#123F6D)","linear-gradient(135deg,#124A44,#082722)"];

/* ===== helpers to build <select> options ===== */
function fillSelect(sel, values) {
  if (!sel) return;
  sel.insertAdjacentHTML("beforeend", values.map(function (v) {
    return '<option value="' + esc(v.val) + '">' + esc(v.label) + "</option>";
  }).join(""));
}
function reveal(scope) {
  var els = (scope || document).querySelectorAll(".rv,.rv-l,.rv-r");
  if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
  var io = new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
  }, { rootMargin: "-40px" });
  els.forEach(function (e) { io.observe(e); });
}

/* ===== DOCTORS PAGE ===== */
function initDoctors() {
  var grid = document.getElementById("docGrid");
  if (!grid) return;
  var search = document.getElementById("docSearch"),
      fSpec = document.getElementById("fSpec"),
      fCountry = document.getElementById("fCountry"),
      count = document.getElementById("docCount"),
      empty = document.getElementById("docEmpty"),
      resetBtn = document.getElementById("docReset");

  fillSelect(fSpec, uniq(DOCTORS.map(function (d) { return d[2]; })).sort().map(function (s) { return { val: s, label: s }; }));
  fillSelect(fCountry, uniq(DOCTORS.map(function (d) { return d[6]; })).map(function (c) { return { val: c, label: COUNTRY[c] }; }));

  function card(d, i) {
    return '<article class="doccard rv">' +
      '<div class="doccard-top"><span class="docav" style="background:' + GRADS[i % GRADS.length] + '">' + esc(initials(d[0])) + "</span>" +
        '<div class="docwho"><h3>' + esc(d[0]) + '</h3><span class="docdesig">' + esc(d[1]) + "</span></div></div>" +
      '<span class="docspec">' + I.steth + esc(d[2]) + "</span>" +
      '<ul class="docmeta">' +
        "<li>" + I.clock + "<span>" + d[3] + "+ years experience</span></li>" +
        "<li>" + I.hosp + "<span>" + esc(d[4]) + "</span></li>" +
        "<li>" + flag(d[6], 20) + "<span>" + esc(d[5]) + ", " + COUNTRY[d[6]] + "</span></li>" +
      "</ul>" +
      '<a href="/#consult" class="btn btn-gold docbtn">Free Opinion</a></article>';
  }
  function render() {
    var q = (search.value || "").trim().toLowerCase(), sp = fSpec.value, co = fCountry.value;
    var list = DOCTORS.filter(function (d) {
      if (sp && d[2] !== sp) return false;
      if (co && d[6] !== co) return false;
      if (q && (d[0] + " " + d[2] + " " + d[4] + " " + d[5]).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    grid.innerHTML = list.map(card).join("");
    count.textContent = list.length + (list.length === 1 ? " doctor" : " doctors") + " found";
    empty.hidden = list.length !== 0;
    grid.hidden = list.length === 0;
    reveal(grid);
  }
  search.addEventListener("input", render);
  fSpec.addEventListener("change", render);
  fCountry.addEventListener("change", render);
  if (resetBtn) resetBtn.addEventListener("click", function () { search.value = ""; fSpec.value = ""; fCountry.value = ""; render(); });
  render();
}

/* ===== HOSPITALS PAGE ===== */
function initHospitals() {
  var grid = document.getElementById("hospGrid");
  if (!grid) return;
  var search = document.getElementById("hospSearch"),
      hCountry = document.getElementById("hCountry"),
      hSpec = document.getElementById("hSpec"),
      hAccred = document.getElementById("hAccred"),
      count = document.getElementById("hospCount"),
      empty = document.getElementById("hospEmpty"),
      resetBtn = document.getElementById("hospReset");

  fillSelect(hCountry, uniq(HOSPITALS.map(function (h) { return h[2]; })).map(function (c) { return { val: c, label: COUNTRY[c] }; }));
  var allSpecs = uniq([].concat.apply([], HOSPITALS.map(function (h) { return h[7]; }))).sort();
  fillSelect(hSpec, allSpecs.map(function (s) { return { val: s, label: s }; }));
  var allAccred = uniq([].concat.apply([], HOSPITALS.map(function (h) { return h[4]; }))).sort();
  fillSelect(hAccred, allAccred.map(function (a) { return { val: a, label: a }; }));

  function card(h) {
    return '<article class="hospcard rv">' +
      '<div class="hospcard-img"><img src="' + h[3] + '" alt="' + esc(h[0]) + '" loading="lazy" referrerpolicy="no-referrer">' +
        '<span class="hospflag">' + flag(h[2], 30) + "</span></div>" +
      '<div class="hospcard-b">' +
        "<h3>" + esc(h[0]) + "</h3>" +
        '<p class="hosploc">' + I.pin + esc(h[1]) + ", " + COUNTRY[h[2]] + "</p>" +
        '<div class="hospaccred">' + h[4].map(function (a) { return '<span class="accbadge">' + esc(a) + "</span>"; }).join("") + "</div>" +
        '<ul class="hospstats"><li><b>' + h[5].toLocaleString() + "</b><span>Beds</span></li>" +
          "<li><b>" + h[6] + "</b><span>Established</span></li>" +
          "<li><b>" + h[7].length + "+</b><span>Specialties</span></li></ul>" +
        '<div class="hospspecs">' + h[7].slice(0, 4).map(function (s) { return '<span class="sptag">' + esc(s) + "</span>"; }).join("") + "</div>" +
        '<a href="/#consult" class="btn btn-gold hospbtn">Get Free Quote</a>' +
      "</div></article>";
  }
  function render() {
    var q = (search.value || "").trim().toLowerCase(), co = hCountry.value, sp = hSpec.value, ac = hAccred.value;
    var list = HOSPITALS.filter(function (h) {
      if (co && h[2] !== co) return false;
      if (sp && h[7].indexOf(sp) === -1) return false;
      if (ac && h[4].indexOf(ac) === -1) return false;
      if (q && (h[0] + " " + h[1] + " " + h[7].join(" ")).toLowerCase().indexOf(q) === -1) return false;
      return true;
    });
    grid.innerHTML = list.map(card).join("");
    count.textContent = list.length + (list.length === 1 ? " hospital" : " hospitals") + " found";
    empty.hidden = list.length !== 0;
    grid.hidden = list.length === 0;
    reveal(grid);
  }
  search.addEventListener("input", render);
  [hCountry, hSpec, hAccred].forEach(function (s) { s.addEventListener("change", render); });
  if (resetBtn) resetBtn.addEventListener("click", function () { search.value = ""; hCountry.value = ""; hSpec.value = ""; hAccred.value = ""; render(); });
  render();
}

/* ===== SHARED CHROME (drawer + sticky header + progress) ===== */
function initChrome() {
  var hdr = document.getElementById("hdr"), progress = document.getElementById("progress"),
      ov = document.getElementById("ov"), dw = document.getElementById("dw"),
      mbtn = document.getElementById("mbtn"), dwc = document.getElementById("dwc");
  if (mbtn && ov && dw) {
    var openD = function () { ov.classList.add("open"); dw.classList.add("open"); document.body.style.overflow = "hidden"; };
    var closeD = function () { ov.classList.remove("open"); dw.classList.remove("open"); document.body.style.overflow = ""; };
    mbtn.onclick = openD;
    if (dwc) dwc.onclick = closeD;
    ov.addEventListener("click", function (e) { if (e.target === ov) closeD(); });
    dw.querySelectorAll(".dw-n>a,.dw-f a").forEach(function (a) { a.addEventListener("click", closeD); });
  }
  function onScroll() {
    var y = window.scrollY, dh = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (dh > 0 ? (y / dh * 100) : 0) + "%";
    if (hdr) hdr.classList.toggle("scr", y > 10);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}

function boot() { initChrome(); initDoctors(); initHospitals(); reveal(document); }
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
else boot();
})();
