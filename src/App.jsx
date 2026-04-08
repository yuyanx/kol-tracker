import { useState, useCallback, useEffect } from "react";

const DEFAULT_KOLS = [
  { name: "Andrew Ng", handle: "@AndrewYNg", field: "AI", avatar: "🧠", color: "#FF6B35", default: true },
  { name: "Yann LeCun", handle: "@ylecun", field: "AI", avatar: "🔬", color: "#4ECDC4", default: true },
  { name: "Fei-Fei Li", handle: "@drfeifei", field: "AI", avatar: "👁️", color: "#A855F7", default: true },
  { name: "Andrej Karpathy", handle: "@karpathy", field: "AI", avatar: "⚡", color: "#F43F5E", default: true },
  { name: "Sam Altman", handle: "@sama", field: "AI", avatar: "🚀", color: "#3B82F6", default: true },
  { name: "Demis Hassabis", handle: "@demishassabis", field: "AI", avatar: "🎯", color: "#10B981", default: true },
  { name: "Ethan Mollick", handle: "@emollick", field: "AI", avatar: "📚", color: "#F59E0B", default: true },
  { name: "Jim Fan", handle: "@DrJimFan", field: "AI", avatar: "🤖", color: "#8B5CF6", default: true },
  { name: "Marty Cagan", handle: "@caborez", field: "PM", avatar: "📋", color: "#EC4899", default: true },
  { name: "Lenny Rachitsky", handle: "@lennysan", field: "PM", avatar: "📰", color: "#06B6D4", default: true },
  { name: "Shreyas Doshi", handle: "@shreyas", field: "PM", avatar: "🎯", color: "#EF4444", default: true },
  { name: "Teresa Torres", handle: "@ttorres", field: "PM", avatar: "🔍", color: "#84CC16", default: true },
  { name: "Melissa Perri", handle: "@lissijean", field: "PM", avatar: "🏗️", color: "#F97316", default: true },
  { name: "John Cutler", handle: "@johncutlefish", field: "PM", avatar: "🐟", color: "#14B8A6", default: true },
];

const RECOMMENDED_KOLS = [
  { name: "Dario Amodei", handle: "@DarioAmodei", field: "AI", avatar: "🛡️", color: "#6366F1" },
  { name: "Geoffrey Hinton", handle: "@geoffreyhinton", field: "AI", avatar: "🏆", color: "#D946EF" },
  { name: "Ilya Sutskever", handle: "@ilyasut", field: "AI", avatar: "🔮", color: "#0EA5E9" },
  { name: "François Chollet", handle: "@fchollet", field: "AI", avatar: "🐍", color: "#F472B6" },
  { name: "Elvis Saravia", handle: "@oaborin", field: "AI", avatar: "📝", color: "#34D399" },
  { name: "Swyx", handle: "@swyx", field: "AI", avatar: "🌀", color: "#FB923C" },
  { name: "Harrison Chase", handle: "@hwchase17", field: "AI", avatar: "🔗", color: "#22D3EE" },
  { name: "Logan Kilpatrick", handle: "@OfficialLoganK", field: "AI", avatar: "🟢", color: "#A3E635" },
  { name: "Marily Nika", handle: "@marilynika", field: "AI", avatar: "💡", color: "#C084FC" },
  { name: "Simon Willison", handle: "@simonw", field: "AI", avatar: "🛠️", color: "#FB7185" },
  { name: "Gibson Biddle", handle: "@gibsonbiddle", field: "PM", avatar: "🎬", color: "#E11D48" },
  { name: "Ken Norton", handle: "@kennethn", field: "PM", avatar: "📐", color: "#0D9488" },
  { name: "Jackie Bavaro", handle: "@jackiebo", field: "PM", avatar: "✏️", color: "#7C3AED" },
  { name: "Sachin Rekhi", handle: "@sachinrekhi", field: "PM", avatar: "🧩", color: "#2563EB" },
  { name: "Paul Adams", handle: "@Padday", field: "PM", avatar: "💬", color: "#DC2626" },
  { name: "Gergely Orosz", handle: "@GergelyOrosz", field: "PM", avatar: "🔧", color: "#EA580C" },
  { name: "Julie Zhuo", handle: "@joulee", field: "PM", avatar: "🎨", color: "#DB2777" },
  { name: "Wes Kao", handle: "@wes_kao", field: "PM", avatar: "🎤", color: "#059669" },
  { name: "Paul Graham", handle: "@paulg", field: "Tech", avatar: "🟧", color: "#F97316" },
  { name: "Benedict Evans", handle: "@benedictevans", field: "Tech", avatar: "📊", color: "#6D28D9" },
  { name: "Ben Thompson", handle: "@benthompson", field: "Tech", avatar: "📈", color: "#0284C7" },
  { name: "Elad Gil", handle: "@eladgil", field: "Tech", avatar: "💰", color: "#15803D" },
  { name: "Packy McCormick", handle: "@packym", field: "Tech", avatar: "🧪", color: "#E879F9" },
];

const FIELD_COLORS = {
  AI: { bg: "rgba(139,92,246,0.15)", text: "#A78BFA" },
  PM: { bg: "rgba(236,72,153,0.15)", text: "#F472B6" },
  Tech: { bg: "rgba(251,146,60,0.15)", text: "#FB923C" },
  Custom: { bg: "rgba(78,205,196,0.15)", text: "#4ECDC4" },
};
const AVATARS = ["🌟","🔥","💎","⭐","🎯","💫","🚀","⚡","🌊","🎭","🧭","🔱","🦾","🪐","✨"];
const COLORS = ["#F43F5E","#3B82F6","#10B981","#F59E0B","#8B5CF6","#EC4899","#06B6D4","#EF4444","#84CC16","#F97316","#14B8A6","#6366F1","#D946EF","#0EA5E9","#FB923C"];

const SYSTEM_PROMPT = `You are a KOL content analyst. Search the web for the most recent posts, tweets, articles, videos, or newsletters from the given person. Focus on content from the last 7 days if available, otherwise the most recent content you can find.

CRITICAL: Your ENTIRE response must be ONLY a valid JSON object. No text before it. No text after it. No markdown code fences. No explanation.

Schema:
{"items":[{"title":"string","summary":"string","platform":"twitter|youtube|newsletter|blog|linkedin","date":"string","url":"string"}],"themes":"string"}

- 3-5 items max. summary: 1-2 sentences. url: include if found, else empty string. themes: one sentence about their current focus.`;

function extractJSON(t) {
  if (!t?.trim()) return null;
  try { return JSON.parse(t.trim()); } catch {}
  const m = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (m) try { return JSON.parse(m[1].trim()); } catch {}
  const s = t.indexOf("{"), e = t.lastIndexOf("}");
  if (s !== -1 && e > s) try { return JSON.parse(t.slice(s, e + 1)); } catch {}
  return null;
}

function parseResponse(content, name) {
  const text = (content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
  const parsed = extractJSON(text);
  if (parsed?.items?.length > 0) return parsed;
  const sr = [];
  for (const b of (content || [])) {
    if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
      for (const i of b.content) if (i.type === "web_search_result") sr.push({ title: i.title || "", url: i.url || "", snippet: i.page_snippet || "" });
    }
  }
  if (sr.length > 0) {
    const low = name.toLowerCase().split(" ");
    const rel = sr.filter(r => low.some(p => (r.title + " " + r.url + " " + r.snippet).toLowerCase().includes(p))).slice(0, 5);
    const items = rel.length > 0 ? rel : sr.slice(0, 5);
    return {
      items: items.map(r => ({
        title: r.title, summary: r.snippet || "Click to read.", url: r.url, date: "recent",
        platform: r.url.includes("youtube") ? "youtube" : (r.url.includes("x.com") || r.url.includes("twitter")) ? "twitter" : r.url.includes("linkedin") ? "linkedin" : r.url.includes("substack") ? "newsletter" : "blog",
      })),
      themes: text ? text.slice(0, 150) : `Latest results for ${name}`,
    };
  }
  if (text.trim()) return { items: [{ title: `Latest from ${name}`, summary: text.slice(0, 500), platform: "web", date: "recent", url: "" }], themes: "" };
  return null;
}

export default function KOLTracker() {
  const [kols, setKols] = useState(DEFAULT_KOLS);
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [kolData, setKolData] = useState({});
  const [loading, setLoading] = useState(null);
  const [refreshed, setRefreshed] = useState({});
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState({ c: 0, t: 0 });
  const [loadTick, setLoadTick] = useState(0);
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customHandle, setCustomHandle] = useState("");
  const [customField, setCustomField] = useState("AI");
  const [recFilter, setRecFilter] = useState("All");
  const [addedFlash, setAddedFlash] = useState(null);
  
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("anthropic_api_key") || "");
  const [showApiInput, setShowApiInput] = useState(false);

  useEffect(() => { const id = setInterval(() => setLoadTick(p => p + 1), 2000); return () => clearInterval(id); }, []);

  const handleApiKeyChange = (e) => {
    const val = e.target.value;
    setApiKey(val);
    localStorage.setItem("anthropic_api_key", val);
  };

  const msgs = ["Searching the web…", "Reading recent posts…", "Analyzing content…", "Building summary…"];
  const allFields = ["All", ...new Set(kols.map(k => k.field))];
  const filtered = kols.filter(k => filter === "All" || k.field === filter);
  const availableRecs = RECOMMENDED_KOLS.filter(r => !kols.find(k => k.name === r.name));
  const filteredRecs = availableRecs.filter(r => recFilter === "All" || r.field === recFilter);

  const fetchKol = useCallback(async (kol) => {
    setLoading(kol.name);
    try {
      if (!apiKey) throw new Error("Please enter your Anthropic API Key (top right)");
      
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", 
        headers: { 
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerously-allow-browser": "true" 
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1500, system: SYSTEM_PROMPT,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: `Find the latest content from ${kol.name} (${kol.handle} on X/Twitter), a ${kol.field} thought leader. Search for their most recent tweets, articles, videos, or newsletters. Return ONLY valid JSON.` }],
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const result = parseResponse(data.content, kol.name);
      if (result) { setKolData(p => ({ ...p, [kol.name]: result })); setRefreshed(p => ({ ...p, [kol.name]: new Date() })); }
      else throw new Error("No results found");
    } catch (err) {
      setKolData(p => ({ ...p, [kol.name]: { items: [{ title: "Search failed", summary: err.message, platform: "error", date: "", url: "" }], themes: "" } }));
    }
    setLoading(null);
  }, [apiKey]);

  const scanAll = useCallback(async () => {
    setScanning(true);
    const targets = filtered.filter(k => !kolData[k.name]);
    if (!targets.length) { setScanning(false); return; }
    setProgress({ c: 0, t: targets.length });
    for (let i = 0; i < targets.length; i++) {
      setProgress({ c: i + 1, t: targets.length });
      await fetchKol(targets[i]);
      if (i < targets.length - 1) await new Promise(r => setTimeout(r, 800));
    }
    setScanning(false);
  }, [filtered, kolData, fetchKol]);

  const addKol = (rec) => {
    setKols(p => [...p, { ...rec, default: false }]);
    setAddedFlash(rec.name);
    setTimeout(() => setAddedFlash(null), 1500);
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    const i = kols.length;
    const newKol = {
      name: customName.trim(),
      handle: customHandle.trim() || `@${customName.trim().toLowerCase().replace(/\s+/g, "")}`,
      field: customField, avatar: AVATARS[i % AVATARS.length], color: COLORS[i % COLORS.length], default: false,
    };
    setKols(p => [...p, newKol]);
    setAddedFlash(newKol.name);
    setTimeout(() => setAddedFlash(null), 1500);
    setCustomName(""); setCustomHandle(""); setShowCustom(false);
  };

  const removeKol = (name) => {
    setKols(p => p.filter(k => k.name !== name));
    setKolData(p => { const n = { ...p }; delete n[name]; return n; });
    if (expanded === name) setExpanded(null);
  };

  const pIcon = p => ({ twitter: "𝕏", youtube: "▶", newsletter: "✉", blog: "✍", linkedin: "in", web: "🌐", error: "⚠" }[p] || "📄");
  const pLabel = p => ({ twitter: "X", youtube: "YT", newsletter: "NEWS", blog: "BLOG", linkedin: "LNKD", web: "WEB" }[p] || "");
  const ago = d => { if (!d) return ""; const s = Math.floor((Date.now() - d) / 1000); if (s < 60) return "just now"; if (s < 3600) return `${Math.floor(s / 60)}m`; if (s < 86400) return `${Math.floor(s / 3600)}h`; return `${Math.floor(s / 86400)}d`; };
  const M = { fontFamily: "'Space Mono', monospace" };

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A0F", color: "#E8E6E1", fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse at 20% 20%, rgba(139,92,246,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(244,63,94,0.06) 0%, transparent 50%)" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#4ECDC4", boxShadow: "0 0 12px #4ECDC4", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ ...M, fontSize: 11, color: "#4ECDC4", letterSpacing: 3, textTransform: "uppercase" }}>Live Intelligence Feed</span>
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 700, margin: 0, letterSpacing: -1.5, background: "linear-gradient(135deg, #E8E6E1 0%, #8B8B8B 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>KOL Radar</h1>
            <p style={{ color: "#6B6B76", fontSize: 14, marginTop: 6, ...M }}>Tracking {kols.length} thought leaders · AI · PM · Tech</p>
          </div>
          
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowApiInput(!showApiInput)} style={{
              padding: "7px 12px", borderRadius: 8, border: "1px solid #2A2A35", background: "rgba(255,255,255,0.03)", color: "#E8E6E1", ...M, fontSize: 11, cursor: "pointer"
            }}>🔑 API KEY {apiKey ? "✓" : ""}</button>
            {showApiInput && (
              <div style={{ marginTop: 8, padding: 12, borderRadius: 10, border: "1px solid #1A1A25", background: "rgba(255,255,255,0.02)", width: 250, position: "absolute", right: 0, zIndex: 10 }}>
                <label style={{ ...M, fontSize: 9, color: "#6B6B76", letterSpacing: 1, display: "block", marginBottom: 6 }}>ANTHROPIC API KEY</label>
                <input 
                  type="password" 
                  value={apiKey} 
                  onChange={handleApiKeyChange} 
                  placeholder="sk-ant-..." 
                  style={{ width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #2A2A35", background: "#0A0A0F", color: "#E8E6E1", ...M, fontSize: 11, outline: "none" }} 
                />
                <p style={{ ...M, fontSize: 9, color: "#4A4A55", marginTop: 6, marginBottom: 0 }}>Required to run Claude queries. Saved locally.</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
          {allFields.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 16px", borderRadius: 100, border: "1px solid",
              borderColor: filter === f ? "#4ECDC4" : "#2A2A35",
              background: filter === f ? "rgba(78,205,196,0.12)" : "transparent",
              color: filter === f ? "#4ECDC4" : "#6B6B76", ...M, fontSize: 12, cursor: "pointer", letterSpacing: 1,
            }}>{f === "All" ? "ALL" : f.toUpperCase()}</button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={scanAll} disabled={scanning || !!loading} style={{
            padding: "7px 16px", borderRadius: 100, border: "1px solid #F43F5E",
            background: scanning ? "rgba(244,63,94,0.2)" : "rgba(244,63,94,0.08)",
            color: "#F43F5E", ...M, fontSize: 12, cursor: (scanning || !!loading) ? "default" : "pointer",
            letterSpacing: 1, opacity: (scanning || !!loading) ? 0.6 : 1,
          }}>
            {scanning ? `SCANNING ${progress.c}/${progress.t}` : "⚡ SCAN ALL"}
          </button>
        </div>

        {/* ═══ TRACKED KOL GRID ═══ */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {filtered.map(kol => {
            const data = kolData[kol.name];
            const isLoad = loading === kol.name;
            const isExp = expanded === kol.name;
            const ref = refreshed[kol.name];
            const valid = data?.items?.length > 0 && data.items[0].platform !== "error";
            const fc = FIELD_COLORS[kol.field] || FIELD_COLORS.Custom;
            const justAdded = addedFlash === kol.name;

            return (
              <div key={kol.name} style={{
                background: justAdded ? "rgba(78,205,196,0.06)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${justAdded ? "#4ECDC440" : isExp ? kol.color + "60" : "#1A1A25"}`,
                borderRadius: 16, overflow: "hidden", transition: "all 0.4s ease",
                gridColumn: isExp ? "1 / -1" : "auto",
              }}>
                <div onClick={() => { if (!data && !isLoad) fetchKol(kol); setExpanded(isExp ? null : kol.name); }}
                  style={{ padding: "18px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14, background: isExp ? `linear-gradient(135deg, ${kol.color}08, transparent)` : "transparent" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${kol.color}18`, border: `1px solid ${kol.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{kol.avatar}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{kol.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                      <span style={{ ...M, fontSize: 11, color: "#6B6B76" }}>{kol.handle}</span>
                      <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 100, background: fc.bg, color: fc.text, ...M, letterSpacing: 1 }}>{kol.field}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {ref && <span style={{ ...M, fontSize: 10, color: "#4ECDC4" }}>{ago(ref)}</span>}
                    {data && !isLoad && <button onClick={e => { e.stopPropagation(); fetchKol(kol); }} title="Refresh" style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #2A2A35", background: "transparent", color: "#6B6B76", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>↻</button>}
                    {!kol.default && <button onClick={e => { e.stopPropagation(); removeKol(kol.name); }} title="Remove" style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #2A2A35", background: "transparent", color: "#6B6B76", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>✕</button>}
                    <div style={{ width: 28, height: 28, borderRadius: 8, border: `1px solid ${valid ? kol.color + "40" : "#2A2A35"}`, background: valid ? `${kol.color}15` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: valid ? kol.color : "#6B6B76" }}>{isExp ? "−" : "+"}</div>
                  </div>
                </div>

                {isLoad && (
                  <div style={{ padding: "16px 20px", borderTop: "1px solid #1A1A25" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 16, height: 16, border: `2px solid ${kol.color}40`, borderTopColor: kol.color, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      <span style={{ ...M, fontSize: 12, color: "#6B6B76" }}>{msgs[loadTick % msgs.length]}</span>
                    </div>
                    {[80, 65, 90].map((w, i) => (
                      <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.015)", border: "1px solid #151520", marginBottom: 8 }}>
                        <div style={{ height: 11, width: `${w}%`, background: "rgba(255,255,255,0.04)", borderRadius: 4, marginBottom: 8, animation: `shimmer 1.5s ${i * 0.2}s infinite` }} />
                        <div style={{ height: 9, width: "95%", background: "rgba(255,255,255,0.02)", borderRadius: 4 }} />
                      </div>
                    ))}
                  </div>
                )}

                {isExp && data && !isLoad && (
                  <div style={{ padding: "0 20px 20px", borderTop: "1px solid #1A1A25" }}>
                    {data.themes && !data.themes.startsWith("Latest results") && (
                      <div style={{ margin: "16px 0", padding: "12px 16px", background: `${kol.color}08`, border: `1px solid ${kol.color}20`, borderRadius: 10, ...M, fontSize: 12, color: kol.color, lineHeight: 1.6 }}>🎯 {data.themes}</div>
                    )}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {data.items?.map((item, i) => (
                        <div key={i} style={{ padding: "14px 16px", borderRadius: 10, background: item.platform === "error" ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.02)", border: `1px solid ${item.platform === "error" ? "rgba(239,68,68,0.2)" : "#1A1A25"}`, transition: "border-color 0.2s" }}
                          onMouseEnter={e => { if (item.platform !== "error") e.currentTarget.style.borderColor = "#2A2A35"; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = item.platform === "error" ? "rgba(239,68,68,0.2)" : "#1A1A25"; }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
                              <span style={{ fontSize: 16, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", borderRadius: 6 }}>{pIcon(item.platform)}</span>
                              <span style={{ ...M, fontSize: 8, color: "#3A3A45", letterSpacing: 0.5 }}>{pLabel(item.platform)}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5 }}>
                                {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "#E8E6E1", textDecoration: "none", borderBottom: `1px solid ${kol.color}40` }}>{item.title}</a> : item.title}
                              </div>
                              {item.summary && <div style={{ fontSize: 12, color: "#6B6B76", marginTop: 6, lineHeight: 1.6 }}>{item.summary}</div>}
                              {item.date && <div style={{ ...M, fontSize: 10, color: "#4A4A55", marginTop: 8 }}>{item.date}</div>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isExp && data && !isLoad && (
                  <div style={{ padding: "0 20px 14px", ...M, fontSize: 11, color: "#4A4A55", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {valid ? (data.themes || `${data.items?.length} items`) : `⚠ ${data.items?.[0]?.summary?.slice(0, 50) || "Error"}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ═══ DISCOVER MORE ═══ */}
        {availableRecs.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: "#E8E6E1" }}>Discover More KOLs</h2>
                <p style={{ ...M, fontSize: 12, color: "#4A4A55", marginTop: 4 }}>{availableRecs.length} recommended · Click + to add to your dashboard</p>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                {["All", "AI", "PM", "Tech"].map(f => (
                  <button key={f} onClick={() => setRecFilter(f)} style={{
                    padding: "5px 12px", borderRadius: 100, border: "1px solid",
                    borderColor: recFilter === f ? "#4ECDC440" : "#1A1A25",
                    background: recFilter === f ? "rgba(78,205,196,0.08)" : "transparent",
                    color: recFilter === f ? "#4ECDC4" : "#4A4A55", ...M, fontSize: 11, cursor: "pointer",
                  }}>{f}</button>
                ))}
                <div style={{ width: 1, height: 20, background: "#1A1A25", margin: "0 4px" }} />
                <button onClick={() => setShowCustom(!showCustom)} style={{
                  padding: "5px 12px", borderRadius: 100, border: "1px solid",
                  borderColor: showCustom ? "#4ECDC440" : "#1A1A25",
                  background: showCustom ? "rgba(78,205,196,0.08)" : "transparent",
                  color: showCustom ? "#4ECDC4" : "#4A4A55", ...M, fontSize: 11, cursor: "pointer",
                }}>{showCustom ? "✕ CLOSE" : "✎ CUSTOM"}</button>
              </div>
            </div>

            {/* Custom add form */}
            {showCustom && (
              <div style={{ marginBottom: 20, padding: "18px 20px", borderRadius: 14, border: "1px solid #4ECDC420", background: "rgba(78,205,196,0.03)" }}>
                <p style={{ ...M, fontSize: 11, color: "#6B6B76", marginBottom: 14 }}>Track anyone — enter their name and we'll search the web for their latest content.</p>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: 2, minWidth: 150 }}>
                    <label style={{ ...M, fontSize: 9, color: "#4A4A55", letterSpacing: 1.5, display: "block", marginBottom: 5 }}>NAME *</label>
                    <input value={customName} onChange={e => setCustomName(e.target.value)} placeholder="Jensen Huang"
                      onKeyDown={e => { if (e.key === "Enter") addCustom(); }}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #2A2A35", background: "rgba(255,255,255,0.03)", color: "#E8E6E1", ...M, fontSize: 12, outline: "none" }} />
                  </div>
                  <div style={{ flex: 2, minWidth: 150 }}>
                    <label style={{ ...M, fontSize: 9, color: "#4A4A55", letterSpacing: 1.5, display: "block", marginBottom: 5 }}>HANDLE</label>
                    <input value={customHandle} onChange={e => setCustomHandle(e.target.value)} placeholder="@jensenhuang"
                      onKeyDown={e => { if (e.key === "Enter") addCustom(); }}
                      style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #2A2A35", background: "rgba(255,255,255,0.03)", color: "#E8E6E1", ...M, fontSize: 12, outline: "none" }} />
                  </div>
                  <div>
                    <label style={{ ...M, fontSize: 9, color: "#4A4A55", letterSpacing: 1.5, display: "block", marginBottom: 5 }}>FIELD</label>
                    <div style={{ display: "flex", gap: 3 }}>
                      {["AI", "PM", "Tech", "Custom"].map(f => (
                        <button key={f} onClick={() => setCustomField(f)} style={{
                          padding: "7px 10px", borderRadius: 6, border: "1px solid",
                          borderColor: customField === f ? "#4ECDC430" : "#1A1A25",
                          background: customField === f ? "rgba(78,205,196,0.1)" : "transparent",
                          color: customField === f ? "#4ECDC4" : "#4A4A55", ...M, fontSize: 10, cursor: "pointer",
                        }}>{f}</button>
                      ))}
                    </div>
                  </div>
                  <button onClick={addCustom} disabled={!customName.trim()} style={{
                    padding: "9px 22px", borderRadius: 8, border: "1px solid #4ECDC4",
                    background: customName.trim() ? "rgba(78,205,196,0.15)" : "transparent",
                    color: customName.trim() ? "#4ECDC4" : "#3A3A45", ...M, fontSize: 12, cursor: customName.trim() ? "pointer" : "default",
                    letterSpacing: 1, whiteSpace: "nowrap",
                  }}>ADD</button>
                </div>
              </div>
            )}

            {/* Recommended grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 10 }}>
              {filteredRecs.map(rec => {
                const fc = FIELD_COLORS[rec.field] || FIELD_COLORS.Custom;
                return (
                  <div key={rec.name} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
                    borderRadius: 14, border: "1px solid #1A1A25", background: "rgba(255,255,255,0.02)",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = rec.color + "40"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#1A1A25"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                  >
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${rec.color}18`, border: `1px solid ${rec.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{rec.avatar}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{rec.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <span style={{ ...M, fontSize: 10, color: "#6B6B76" }}>{rec.handle}</span>
                        <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 100, background: fc.bg, color: fc.text, ...M }}>{rec.field}</span>
                      </div>
                    </div>
                    <button onClick={() => addKol(rec)} style={{
                      width: 32, height: 32, borderRadius: 8, border: "1px solid #4ECDC430",
                      background: "rgba(78,205,196,0.06)", color: "#4ECDC4", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, transition: "all 0.2s",
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(78,205,196,0.2)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(78,205,196,0.06)"; e.currentTarget.style.transform = "scale(1)"; }}
                    >+</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ marginTop: 48, padding: "20px 0", borderTop: "1px solid #1A1A25", ...M, fontSize: 11, color: "#3A3A45", textAlign: "center" }}>
          KOL Radar · {kols.length} tracked · Powered by Claude Web Search
        </div>
      </div>

      <style>{`
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{opacity:.3}50%{opacity:.6}100%{opacity:.3}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:#2A2A35;border-radius:3px}
        input::placeholder{color:#3A3A45}
      `}</style>
    </div>
  );
}
