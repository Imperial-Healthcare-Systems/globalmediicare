/* ===== Global Mediicare — Doctors & Hospitals directory engine =====
   Shared by /doctors and /hospitals. Fetches data from /api/doctors and
   /api/hospitals (Supabase-backed, with a seed fallback), renders the listing
   that matches whichever grid container is present, wires client-side search +
   filters, and handles the shared chrome (mobile drawer, sticky-header state,
   scroll progress, reveals). Content is managed from /admin. */
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
function cname(c){ return COUNTRY[c] || (c ? c.toUpperCase() : ""); }
function flag(c, w) { return '<span class="fl" style="width:' + (w || 20) + 'px"><svg viewBox="0 0 30 20" width="100%" xmlns="http://www.w3.org/2000/svg">' + (FLAGS[c] || "") + "</svg></span>"; }

/* small inline icons */
var I = {
  clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  hosp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 8h1m4 0h1M9 12h1m4 0h1M11 21v-4h2v4"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.4-8 12-8 12s-8-7.6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  steth:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 3v6a5 5 0 0 0 10 0V3M4 3H2m2 0h2m6 0h2m-2 0h-2m3 16a3 3 0 1 0 6 0c0-2-1-3-1-6"/><circle cx="20" cy="10" r="1"/></svg>'
};
function esc(s){ return String(s == null ? "" : s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
function initials(name){ return String(name).replace(/^Dr\.?\s+/i,"").split(/\s+/).slice(0,2).map(function(w){return w[0]||"";}).join("").toUpperCase(); }
function uniq(arr){ return arr.filter(function(v,i){return v && arr.indexOf(v)===i;}); }
function arr(v){ return Array.isArray(v) ? v : (v == null ? [] : [v]); }

var GRADS = ["linear-gradient(135deg,#1A5F57,#0D3B36)","linear-gradient(135deg,#C89B3C,#A87C29)","linear-gradient(135deg,#1B5691,#123F6D)","linear-gradient(135deg,#124A44,#082722)"];

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
function fetchJson(url) {
  return fetch(url, { headers: { accept: "application/json" } }).then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  });
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
  var DATA = [];

  count.textContent = "Loading doctors…";

  function avatar(d, i) {
    if (d.photo_url) return '<span class="docav docav-img"><img src="' + esc(d.photo_url) + '" alt="' + esc(d.name) + '" loading="lazy" referrerpolicy="no-referrer"></span>';
    return '<span class="docav" style="background:' + GRADS[i % GRADS.length] + '">' + esc(initials(d.name)) + "</span>";
  }
  function card(d, i) {
    return '<article class="doccard rv">' +
      '<div class="doccard-top">' + avatar(d, i) +
        '<div class="docwho"><h3>' + esc(d.name) + '</h3><span class="docdesig">' + esc(d.designation) + "</span></div></div>" +
      (d.specialty ? '<span class="docspec">' + I.steth + esc(d.specialty) + "</span>" : "") +
      '<ul class="docmeta">' +
        (d.experience ? "<li>" + I.clock + "<span>" + esc(d.experience) + "+ years experience</span></li>" : "") +
        (d.hospital ? "<li>" + I.hosp + "<span>" + esc(d.hospital) + "</span></li>" : "") +
        (d.city || d.country ? "<li>" + flag(d.country, 20) + "<span>" + esc(d.city) + (d.city && d.country ? ", " : "") + cname(d.country) + "</span></li>" : "") +
      "</ul>" +
      '<a href="/#consult" class="btn btn-gold docbtn">Free Opinion</a></article>';
  }
  function render() {
    var q = (search.value || "").trim().toLowerCase(), sp = fSpec.value, co = fCountry.value;
    var list = DATA.filter(function (d) {
      if (sp && d.specialty !== sp) return false;
      if (co && d.country !== co) return false;
      if (q && ((d.name || "") + " " + (d.specialty || "") + " " + (d.hospital || "") + " " + (d.city || "")).toLowerCase().indexOf(q) === -1) return false;
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

  fetchJson("/api/doctors").then(function (j) {
    DATA = (j.doctors || []).filter(Boolean);
    fillSelect(fSpec, uniq(DATA.map(function (d) { return d.specialty; })).sort().map(function (s) { return { val: s, label: s }; }));
    fillSelect(fCountry, uniq(DATA.map(function (d) { return d.country; })).map(function (c) { return { val: c, label: cname(c) }; }));
    render();
  }).catch(function () { count.textContent = "Could not load doctors. Please refresh."; });
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
  var DATA = [];

  count.textContent = "Loading hospitals…";

  function card(h) {
    var accred = arr(h.accreditation), specs = arr(h.specialties);
    return '<article class="hospcard rv">' +
      '<div class="hospcard-img">' + (h.image_url ? '<img src="' + esc(h.image_url) + '" alt="' + esc(h.name) + '" loading="lazy" referrerpolicy="no-referrer">' : "") +
        '<span class="hospflag">' + flag(h.country, 30) + "</span></div>" +
      '<div class="hospcard-b">' +
        "<h3>" + esc(h.name) + "</h3>" +
        '<p class="hosploc">' + I.pin + esc(h.city) + (h.city && h.country ? ", " : "") + cname(h.country) + "</p>" +
        (accred.length ? '<div class="hospaccred">' + accred.map(function (a) { return '<span class="accbadge">' + esc(a) + "</span>"; }).join("") + "</div>" : "") +
        '<ul class="hospstats">' +
          (h.beds ? "<li><b>" + Number(h.beds).toLocaleString() + "</b><span>Beds</span></li>" : "") +
          (h.established ? "<li><b>" + esc(h.established) + "</b><span>Established</span></li>" : "") +
          (specs.length ? "<li><b>" + specs.length + "+</b><span>Specialties</span></li>" : "") +
        "</ul>" +
        (specs.length ? '<div class="hospspecs">' + specs.slice(0, 4).map(function (s) { return '<span class="sptag">' + esc(s) + "</span>"; }).join("") + "</div>" : "") +
        '<a href="/#consult" class="btn btn-gold hospbtn">Get Free Quote</a>' +
      "</div></article>";
  }
  function render() {
    var q = (search.value || "").trim().toLowerCase(), co = hCountry.value, sp = hSpec.value, ac = hAccred.value;
    var list = DATA.filter(function (h) {
      if (co && h.country !== co) return false;
      if (sp && arr(h.specialties).indexOf(sp) === -1) return false;
      if (ac && arr(h.accreditation).indexOf(ac) === -1) return false;
      if (q && ((h.name || "") + " " + (h.city || "") + " " + arr(h.specialties).join(" ")).toLowerCase().indexOf(q) === -1) return false;
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

  fetchJson("/api/hospitals").then(function (j) {
    DATA = (j.hospitals || []).filter(Boolean);
    fillSelect(hCountry, uniq(DATA.map(function (h) { return h.country; })).map(function (c) { return { val: c, label: cname(c) }; }));
    fillSelect(hSpec, uniq([].concat.apply([], DATA.map(function (h) { return arr(h.specialties); }))).sort().map(function (s) { return { val: s, label: s }; }));
    fillSelect(hAccred, uniq([].concat.apply([], DATA.map(function (h) { return arr(h.accreditation); }))).sort().map(function (a) { return { val: a, label: a }; }));
    render();
  }).catch(function () { count.textContent = "Could not load hospitals. Please refresh."; });
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
