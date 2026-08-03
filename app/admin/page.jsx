"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabase";

const COUNTRIES = [
  { v: "in", l: "India" }, { v: "tr", l: "Turkey" }, { v: "ae", l: "UAE" },
  { v: "th", l: "Thailand" }, { v: "de", l: "Germany" }, { v: "eg", l: "Egypt" },
];

// Field schema per table. type: text | number | select | array | checkbox
const SCHEMA = {
  doctors: {
    label: "Doctors",
    columns: ["name", "specialty", "hospital", "country", "experience"],
    fields: [
      { k: "name", l: "Full name", t: "text", full: true, req: true },
      { k: "designation", l: "Designation", t: "text", ph: "e.g. Senior Consultant" },
      { k: "specialty", l: "Specialty", t: "text", ph: "e.g. Cardiology", req: true },
      { k: "experience", l: "Experience (years)", t: "number" },
      { k: "hospital", l: "Hospital", t: "text" },
      { k: "city", l: "City", t: "text" },
      { k: "country", l: "Country", t: "select" },
      { k: "photo_url", l: "Photo (optional)", t: "image", full: true, hint: "Upload an image or paste a URL. Leave blank to show an initials avatar." },
      { k: "sort_order", l: "Sort order", t: "number" },
      { k: "is_active", l: "Visible on site", t: "checkbox" },
    ],
  },
  hospitals: {
    label: "Hospitals",
    columns: ["name", "city", "country", "accreditation", "beds"],
    fields: [
      { k: "name", l: "Hospital name", t: "text", full: true, req: true },
      { k: "city", l: "City", t: "text" },
      { k: "country", l: "Country", t: "select" },
      { k: "image_url", l: "Hospital image", t: "image", full: true, hint: "Upload a hospital photo or paste a direct image URL." },
      { k: "accreditation", l: "Accreditation", t: "array", ph: "JCI, NABH", hint: "Comma-separated." },
      { k: "specialties", l: "Specialties", t: "array", ph: "Cardiology, Oncology", hint: "Comma-separated.", full: true },
      { k: "beds", l: "Beds", t: "number" },
      { k: "established", l: "Established (year)", t: "number" },
      { k: "sort_order", l: "Sort order", t: "number" },
      { k: "is_active", l: "Visible on site", t: "checkbox" },
    ],
  },
};

const ARRAY_KEYS = { doctors: [], hospitals: ["accreditation", "specialties"] };

function blankRecord(tab) {
  const r = {};
  SCHEMA[tab].fields.forEach((f) => {
    r[f.k] = f.t === "checkbox" ? true : f.t === "array" ? [] : "";
  });
  return r;
}

export default function AdminPage() {
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("doctors");
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(false);
  const [editing, setEditing] = useState(null); // record being edited/created
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState(null); // {kind,msg}

  // --- auth bootstrap ---
  useEffect(() => {
    if (!configured) { setReady(true); return; }
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, [configured]);

  const loadRows = useCallback(async (which) => {
    const sb = getSupabase();
    if (!sb) return;
    setLoadingRows(true);
    const { data, error } = await sb.from(which).select("*")
      .order("sort_order", { ascending: true }).order("name", { ascending: true });
    setLoadingRows(false);
    if (error) { setNote({ kind: "err", msg: error.message }); return; }
    setRows(data || []);
  }, []);

  useEffect(() => { if (session) loadRows(tab); }, [session, tab, loadRows]);

  async function signIn(e) {
    e.preventDefault();
    setNote(null);
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) setNote({ kind: "err", msg: error.message });
  }
  async function signOut() { await getSupabase().auth.signOut(); setRows([]); }

  async function save() {
    const sb = getSupabase();
    setSaving(true); setNote(null);
    const payload = { ...editing };
    // normalise numbers + arrays
    SCHEMA[tab].fields.forEach((f) => {
      if (f.t === "number") {
        const empty = payload[f.k] === "" || payload[f.k] == null;
        // sort_order is NOT NULL (default 0); other numerics are nullable.
        payload[f.k] = empty ? (f.k === "sort_order" ? 0 : null) : Number(payload[f.k]);
      }
      if (f.t === "array") payload[f.k] = toArray(payload[f.k]);
    });
    let res;
    if (payload.id) res = await sb.from(tab).update(payload).eq("id", payload.id);
    else { delete payload.id; res = await sb.from(tab).insert(payload); }
    setSaving(false);
    if (res.error) { setNote({ kind: "err", msg: res.error.message }); return; }
    setEditing(null);
    setNote({ kind: "ok", msg: "Saved." });
    loadRows(tab);
  }

  async function remove(row) {
    if (!window.confirm("Delete “" + row.name + "”? This cannot be undone.")) return;
    const { error } = await getSupabase().from(tab).delete().eq("id", row.id);
    if (error) { setNote({ kind: "err", msg: error.message }); return; }
    setNote({ kind: "ok", msg: "Deleted." });
    loadRows(tab);
  }

  function openEdit(row) {
    // hydrate arrays into comma strings handled at render; keep arrays as arrays
    const base = blankRecord(tab);
    setEditing({ ...base, ...row });
  }

  if (!ready) return <div className="adm"><div className="adm-wrap">Loading…</div></div>;

  if (!configured) return <NotConfigured />;
  if (!session) return <Login onSubmit={signIn} note={note} />;

  const schema = SCHEMA[tab];
  return (
    <div className="adm">
      <div className="adm-top">
        <div className="adm-brand">Globalmediicare <small>Admin</small></div>
        <button className="adm-btn ghost" onClick={signOut}>Sign out</button>
      </div>
      <div className="adm-wrap">
        <div className="adm-tabs">
          {Object.keys(SCHEMA).map((k) => (
            <button key={k} className={"adm-tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>{SCHEMA[k].label}</button>
          ))}
        </div>

        {note && <div className={"adm-note " + (note.kind === "ok" ? "ok" : "err")}>{note.msg}</div>}

        <div className="adm-bar">
          <h2>{schema.label}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span className="adm-count">{rows.length} record{rows.length === 1 ? "" : "s"}</span>
            <button className="adm-btn primary" onClick={() => openEdit(blankRecord(tab))}>+ Add {schema.label.slice(0, -1)}</button>
          </div>
        </div>

        <div className="adm-tablewrap">
          <table className="adm-table">
            <thead>
              <tr>{schema.columns.map((c) => <th key={c}>{c.replace(/_/g, " ")}</th>)}<th></th></tr>
            </thead>
            <tbody>
              {loadingRows ? (
                <tr><td colSpan={schema.columns.length + 1} className="adm-empty">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={schema.columns.length + 1} className="adm-empty">No records yet. Click “Add” to create one.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} style={{ opacity: row.is_active ? 1 : 0.5 }}>
                  {schema.columns.map((c) => <td key={c} className={c === "name" ? "adm-name" : ""}>{cell(row[c], c)}</td>)}
                  <td>
                    <div className="adm-rowbtns">
                      <button className="adm-btn ghost" onClick={() => openEdit(row)}>Edit</button>
                      <button className="adm-btn danger" onClick={() => remove(row)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <Editor
          tab={tab} record={editing} setRecord={setEditing}
          onClose={() => setEditing(null)} onSave={save} saving={saving}
        />
      )}
    </div>
  );
}

function cell(v, c) {
  if (Array.isArray(v)) return v.map((x, i) => <span key={i} className="adm-pill">{x}</span>);
  if (c === "country") { const m = COUNTRIES.find((x) => x.v === v); return m ? m.l : v; }
  return v == null || v === "" ? "—" : String(v);
}
function toArray(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  return String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
}

function Editor({ tab, record, setRecord, onClose, onSave, saving }) {
  const fields = SCHEMA[tab].fields;
  const set = (k, val) => setRecord((r) => ({ ...r, [k]: val }));
  const isNew = !record.id;
  const [uploading, setUploading] = useState("");
  const [upErr, setUpErr] = useState("");

  async function handleFile(fieldKey, file) {
    if (!file) return;
    setUpErr("");
    if (!file.type.startsWith("image/")) { setUpErr("Please choose an image file."); return; }
    if (file.size > 8 * 1024 * 1024) { setUpErr("Image is larger than 8 MB — please use a smaller file."); return; }
    setUploading(fieldKey);
    try {
      const sb = getSupabase();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${tab}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await sb.storage.from("media").upload(path, file, { upsert: true, contentType: file.type, cacheControl: "31536000" });
      if (error) throw error;
      const { data } = sb.storage.from("media").getPublicUrl(path);
      set(fieldKey, data.publicUrl);
    } catch (e) {
      setUpErr((e?.message || "Upload failed") + " — ensure the 'media' storage bucket exists (run db/storage.sql).");
    } finally {
      setUploading("");
    }
  }
  return (
    <div className="adm-ov" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="adm-modal">
        <div className="adm-modal-h">
          <h3>{isNew ? "Add" : "Edit"} {SCHEMA[tab].label.slice(0, -1)}</h3>
          <button className="adm-x" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form className="adm-form" onSubmit={(e) => { e.preventDefault(); onSave(); }}>
          {fields.map((f) => {
            const val = record[f.k];
            if (f.t === "checkbox") return (
              <div key={f.k} className="adm-field adm-check full">
                <input id={f.k} type="checkbox" checked={!!val} onChange={(e) => set(f.k, e.target.checked)} />
                <label htmlFor={f.k} style={{ textTransform: "none", letterSpacing: 0, fontSize: ".9rem" }}>{f.l}</label>
              </div>
            );
            if (f.t === "image") return (
              <div key={f.k} className="adm-field full">
                <label htmlFor={f.k}>{f.l}</label>
                <div className="adm-imgrow">
                  {val ? <img className="adm-imgprev" src={val} alt="" /> : <span className="adm-imgph">No image</span>}
                  <div className="adm-imgctl">
                    <label className={"adm-btn ghost adm-uplbl" + (uploading === f.k ? " busy" : "")}>
                      {uploading === f.k ? "Uploading…" : val ? "Replace image" : "Upload image"}
                      <input type="file" accept="image/*" hidden disabled={uploading === f.k}
                        onChange={(e) => { handleFile(f.k, e.target.files[0]); e.target.value = ""; }} />
                    </label>
                    {val ? <button type="button" className="adm-btn danger" onClick={() => set(f.k, "")}>Remove</button> : null}
                  </div>
                </div>
                <input id={f.k} type="text" placeholder="…or paste an image URL" value={val ?? ""} onChange={(e) => set(f.k, e.target.value)} />
                {upErr && <span className="hint" style={{ color: "#b23b3b" }}>{upErr}</span>}
                {f.hint && <span className="hint">{f.hint}</span>}
              </div>
            );
            return (
              <div key={f.k} className={"adm-field" + (f.full ? " full" : "")}>
                <label htmlFor={f.k}>{f.l}{f.req ? " *" : ""}</label>
                {f.t === "select" ? (
                  <select id={f.k} value={val || ""} onChange={(e) => set(f.k, e.target.value)}>
                    <option value="">—</option>
                    {COUNTRIES.map((c) => <option key={c.v} value={c.v}>{c.l}</option>)}
                  </select>
                ) : (
                  <input
                    id={f.k}
                    type={f.t === "number" ? "number" : "text"}
                    required={f.req}
                    placeholder={f.ph || ""}
                    value={f.t === "array" ? (Array.isArray(val) ? val.join(", ") : val || "") : (val ?? "")}
                    onChange={(e) => set(f.k, e.target.value)}
                  />
                )}
                {f.hint && <span className="hint">{f.hint}</span>}
              </div>
            );
          })}
          <div className="adm-modal-f full" style={{ margin: "0 -1.4rem -1.3rem", gridColumn: "1/-1" }}>
            <button type="button" className="adm-btn ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="adm-btn primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Login({ onSubmit, note }) {
  return (
    <div className="adm-login">
      <div className="adm-login-card">
        <h1>Admin</h1>
        <p>Sign in to manage doctors &amp; hospitals.</p>
        {note && <div className={"adm-note " + (note.kind === "ok" ? "ok" : "err")}>{note.msg}</div>}
        <form onSubmit={onSubmit}>
          <div className="adm-field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="username" /></div>
          <div className="adm-field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" required autoComplete="current-password" /></div>
          <button className="adm-btn primary" type="submit">Sign in</button>
        </form>
      </div>
    </div>
  );
}

function NotConfigured() {
  return (
    <div className="adm-login">
      <div className="adm-login-card" style={{ maxWidth: 520 }}>
        <h1>Admin</h1>
        <p>Supabase isn’t configured yet.</p>
        <div className="adm-note err" style={{ textAlign: "left", lineHeight: 1.6 }}>
          Add these to <b>.env.local</b> and restart the server:
          <pre style={{ margin: ".6rem 0 0", whiteSpace: "pre-wrap", fontSize: ".8rem" }}>
NEXT_PUBLIC_SUPABASE_URL=…{"\n"}NEXT_PUBLIC_SUPABASE_ANON_KEY=…</pre>
        </div>
        <p style={{ marginTop: "1rem", fontSize: ".82rem" }}>
          Then run <b>db/schema.sql</b> in the Supabase SQL editor and create an admin user under
          Authentication → Users. Until then the public pages run on bundled sample data.
        </p>
      </div>
    </div>
  );
}
