import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Login from "./Login";

// ─── SUPABASE INIT ─────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const TARGET_DATE = new Date("2027-05-01");
const TARGET_SCORE = 80;

const SUBJECTS = [
  { id: "FR",    name: "Financial Reporting",          short: "FR",   group: 1, color: "#C9A84C", lecturesDone: 89 },
  { id: "Audit", name: "Advanced Auditing & PE",       short: "Audit",group: 1, color: "#7EB8A4", lecturesDone: 45 },
  { id: "AFM",   name: "Advanced Fin. Management",     short: "AFM",  group: 2, color: "#C47B5A", lecturesDone: 90 },
  { id: "DT",    name: "Direct Tax Laws",              short: "DT",   group: 2, color: "#6B9BC4", lecturesDone: 0  },
  { id: "IDT",   name: "Indirect Tax Laws",            short: "IDT",  group: 2, color: "#A07BC4", lecturesDone: 0  },
  { id: "IBS",   name: "Integrated Business Solutions",short: "IBS",  group: 2, color: "#C47B9B", lecturesDone: 0  },
];

const PHASES = [
  { label: "Articleship",      from: "2026-06-01", to: "2026-09-30", color: "#C27A7A", note: "DT live batch running" },
  { label: "Post-Articleship", from: "2026-10-01", to: "2026-12-31", color: "#C9A84C", note: "Audit + IBS sprint" },
  { label: "Revision Phase",   from: "2027-01-01", to: "2027-03-31", color: "#7EB8A4", note: "All subjects revision" },
  { label: "Mock & Final Prep",from: "2027-04-01", to: "2027-05-01", color: "#6B9BC4", note: "Mock tests only" },
];

const SUBJECT_PHASES = {
  FR:    { status: "Lectures 89% done · Revision pending", phase: "Revision", color: "#C9A84C" },
  AFM:   { status: "Lectures 90% done · Revision pending", phase: "Revision", color: "#C9A84C" },
  Audit: { status: "Lectures 45% · Paused till Oct 2026",  phase: "Paused",   color: "#C27A7A" },
  DT:    { status: "Live batch: Jun → Oct 15, 2026",        phase: "Active",   color: "#7EB8A4" },
  IDT:   { status: "Live batch: Jun 15 → Oct 31, 2026",     phase: "Active",   color: "#7EB8A4" },
  IBS:   { status: "Pending · MCS 15d + IT 15d first",     phase: "Pending",  color: "#6B6B5E" },
};

const TOPICS = {
  FR:    ["Ind AS Framework","Financial Statements","Revenue (Ind AS 115)","Leases (Ind AS 116)","Business Combinations","Financial Instruments","Consolidation","EPS & Share Capital","Government Grants","Impairment","Foreign Exchange","Employee Benefits","Taxation (Ind AS 12)","Cash Flow Statement","Disclosures & Presentation"],
  Audit: ["Standards on Auditing","Risk Assessment","Internal Controls","Audit Evidence","Group Audits","Bank Audits","Company Audit","Audit Report","Ethics & Independence","Quality Control","Forensic Audit","Due Diligence","CARO 2020","IT in Audit","Peer Review"],
  AFM:   ["Financial Policy","Capital Budgeting","Risk Management","Derivatives","Forex Management","Mergers & Acquisitions","Valuations","Portfolio Theory","Mutual Funds","Leasing & Hire Purchase","Interest Rate Risk","International Finance","Startup Financing","Bankruptcy & Restructuring","Ethics in Finance"],
  DT:    ["Basis of Charge","Residential Status","Salaries","PGBP","Capital Gains","Other Sources","Set Off & Carry Forward","Deductions","Return Filing","Assessment","TDS & TCS","Advance Tax","Transfer Pricing","International Tax","Search & Seizure"],
  IDT:   ["GST Basics & Supply","Time of Supply","Place of Supply","Valuation","Input Tax Credit","Registration","Returns","Refunds","Assessment & Audit","Demand & Recovery","Appeals","Customs Act","Import & Export","FTP","Anti-Dumping"],
  IBS:   ["Strategic Management","SFM Integration","Risk Framework","Corporate Governance","CSR","Ethics","Case Study Method","Industry Analysis","Business Valuation","Mergers (Applied)","Tax Planning Cases","Audit Cases","Financial Analysis","Regulatory Framework","Integrated Reporting"],
};

const STATUS_OPTS = ["not started","in progress","revision pending","done"];
const STATUS_META = {
  "not started":     { color: "#6B6B5E", bg: "rgba(107,107,94,0.15)",  dot: "#6B6B5E" },
  "in progress":     { color: "#6B9BC4", bg: "rgba(107,155,196,0.15)", dot: "#6B9BC4" },
  "revision pending":{ color: "#C9A84C", bg: "rgba(201,168,76,0.15)",  dot: "#C9A84C" },
  "done":            { color: "#7EB8A4", bg: "rgba(126,184,164,0.15)", dot: "#7EB8A4" },
};

// GYM
const GYM_SPLIT = [
  { day: 1, label: "Chest & Tricep",    muscles: ["Chest","Tricep"],          icon: "💪" },
  { day: 2, label: "Back & Bicep",      muscles: ["Back (4 exe)","Bicep"],    icon: "🏋️" },
  { day: 3, label: "Shoulders",         muscles: ["Shoulders"],               icon: "🔱" },
  { day: 4, label: "Back & Chest",      muscles: ["Back (4 exe)","Chest"],    icon: "🏋️" },
  { day: 5, label: "Bicep & Tricep",    muscles: ["Bicep","Tricep"],          icon: "💪" },
  { day: 6, label: "Legs",              muscles: ["Legs"],                    icon: "🦵" },
  { day: 7, label: "Rest Day",          muscles: [],                          icon: "😴" },
];

const MEAL_SLOTS = ["Breakfast","Lunch","Evening","Dinner"];

const today = new Date().toISOString().slice(0, 10);

function daysLeft() {
  return Math.max(0, Math.ceil((TARGET_DATE - new Date()) / 86400000));
}

function getWeekDates() {
  const d = new Date();
  const day = d.getDay() || 7;
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d);
    dd.setDate(d.getDate() - day + 1 + i);
    return dd.toISOString().slice(0, 10);
  });
}

function initTopics() {
  const topics = {};
  Object.keys(TOPICS).forEach(sid => {
    topics[sid] = TOPICS[sid].map(t => ({ name: t, status: "not started", confidence: 3 }));
  });
  return topics;
}

function initData() {
  return {
    sessions: {},
    topics: initTopics(),
    streak: { lastDate: null, count: 0 },
    mockScores: {},
    aiHistory: [],
    gym: {},        // date → { done: bool, dayNum: 1-7, skipped: bool }
    gymDayPtr: 1,   // which split day is today (user-managed)
    gymStreak: { lastDate: null, count: 0 },
    food: {},       // date → { meals: [{slot, type:"clean"|"cheat", note}], waterOk: bool }
    foodStreak: { lastDate: null, count: 0 },
  };
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#0E0E0B;color:#D4C9A8;font-family:'JetBrains Mono',monospace;min-height:100vh;}
.app{max-width:720px;margin:0 auto;padding:2rem 1.25rem 5rem;position:relative;}
.app::before{content:'';position:fixed;top:0;left:0;right:0;bottom:0;background:radial-gradient(ellipse 60% 40% at 15% 10%,rgba(201,168,76,0.055) 0%,transparent 60%),radial-gradient(ellipse 40% 50% at 85% 85%,rgba(107,155,196,0.045) 0%,transparent 60%);pointer-events:none;z-index:0;}
.z1{position:relative;z-index:1;}

/* HEADER */
.hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.75rem;}
.hdr-title{font-family:'Cormorant Garamond',serif;font-size:26px;font-weight:300;color:#E8DFC0;line-height:1.1;}
.hdr-sub{font-size:10px;letter-spacing:.15em;color:#5A5A4E;margin-top:4px;text-transform:uppercase;}
.badges{display:flex;flex-direction:column;gap:4px;align-items:flex-end;}
.badge{font-size:10px;letter-spacing:.1em;padding:3px 10px;border-radius:2px;text-transform:uppercase;}
.b-red{background:rgba(194,74,74,.14);color:#C27A7A;border:.5px solid rgba(194,74,74,.28);}
.b-grn{background:rgba(126,184,164,.12);color:#7EB8A4;border:.5px solid rgba(126,184,164,.24);}
.b-gold{background:rgba(201,168,76,.12);color:#C9A84C;border:.5px solid rgba(201,168,76,.24);}

/* NAV */
.nav{display:flex;gap:0;margin-bottom:2rem;border-bottom:.5px solid rgba(212,201,168,.1);overflow-x:auto;}
.nav::-webkit-scrollbar{display:none;}
.nb{background:none;border:none;cursor:pointer;padding:8px 0;margin-right:20px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;color:#5A5A4E;border-bottom:1px solid transparent;margin-bottom:-.5px;transition:color .2s;text-transform:uppercase;white-space:nowrap;}
.nb.active{color:#C9A84C;border-bottom-color:#C9A84C;}
.nb:hover:not(.active){color:#9A8A60;}

/* CARDS */
.card{background:rgba(18,18,13,.85);border:.5px solid rgba(212,201,168,.09);border-radius:3px;padding:1.1rem 1.2rem;margin-bottom:.85rem;}
.card-title{font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:#5A5A4E;margin-bottom:.9rem;}

/* STAT GRID */
.sg{display:grid;gap:1px;background:rgba(212,201,168,.09);border-radius:3px;overflow:hidden;margin-bottom:.85rem;}
.sg-4{grid-template-columns:repeat(4,1fr);}
.sg-3{grid-template-columns:repeat(3,1fr);}
.sc{background:#0E0E0B;padding:.9rem .6rem;text-align:center;}
.sv{font-family:'Cormorant Garamond',serif;font-size:24px;font-weight:300;color:#E8DFC0;line-height:1;margin-bottom:3px;}
.sl{font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:#4A4A3E;}

/* BARS */
.bw{height:3px;background:rgba(212,201,168,.1);border-radius:1px;overflow:hidden;}
.bf{height:100%;border-radius:1px;transition:width .5s ease;}

/* TAGS */
.tag{font-size:9px;letter-spacing:.08em;padding:2px 8px;border-radius:2px;text-transform:uppercase;flex-shrink:0;}
.tg{background:rgba(126,184,164,.14);color:#7EB8A4;}
.tw{background:rgba(201,168,76,.14);color:#C9A84C;}
.tr{background:rgba(194,74,74,.14);color:#C27A7A;}
.tb{background:rgba(107,155,196,.14);color:#6B9BC4;}
.tp{background:rgba(107,107,94,.14);color:#7A7A6E;}

/* FORMS */
.fl{font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#5A5A4E;display:block;margin-bottom:5px;}
select,input[type=range]{background:rgba(212,201,168,.06);border:.5px solid rgba(212,201,168,.14);border-radius:2px;color:#C4B990;font-family:'JetBrains Mono',monospace;font-size:11px;padding:7px 10px;width:100%;outline:none;appearance:none;-webkit-appearance:none;}
select:focus{border-color:rgba(201,168,76,.38);}
input[type=range]{padding:0;height:3px;cursor:pointer;accent-color:#C9A84C;background:rgba(212,201,168,.1);margin-top:10px;}
.btn{background:rgba(201,168,76,.11);border:.5px solid rgba(201,168,76,.28);color:#C9A84C;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.08em;padding:8px 16px;border-radius:2px;cursor:pointer;transition:background .2s;white-space:nowrap;}
.btn:hover{background:rgba(201,168,76,.2);}
.btn:disabled{opacity:.35;cursor:not-allowed;}
.btn-sm{padding:5px 10px;font-size:10px;}
.btn-grn{background:rgba(126,184,164,.12);border-color:rgba(126,184,164,.28);color:#7EB8A4;}
.btn-grn:hover{background:rgba(126,184,164,.22);}
.btn-red{background:rgba(194,74,74,.1);border-color:rgba(194,74,74,.25);color:#C27A7A;}
.btn-red:hover{background:rgba(194,74,74,.18);}
.btn-ghost{background:rgba(212,201,168,.05);border-color:rgba(212,201,168,.12);color:#6B6B5E;}
.btn-ghost:hover{background:rgba(212,201,168,.1);}
option{background:#1A1A14;color:#C4B990;}

/* READINESS ROW */
.rr{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:.5px solid rgba(212,201,168,.07);}
.rr:last-child{border-bottom:none;}
.si{border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:9px;letter-spacing:.07em;font-weight:500;flex-shrink:0;}

/* SUBJECT TABS */
.st-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:1.1rem;}
.st{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;padding:5px 12px;border-radius:2px;cursor:pointer;border:.5px solid rgba(212,201,168,.14);background:transparent;color:#6B6B5E;transition:all .2s;}
.st.active{color:#0E0E0B;border-color:transparent;}
.st:hover:not(.active){color:#A09070;}

/* TOPIC */
.ti{background:rgba(18,18,13,.55);border:.5px solid rgba(212,201,168,.07);border-radius:2px;padding:9px 11px;margin-bottom:4px;}
.ti:hover{border-color:rgba(212,201,168,.16);}
.th{display:flex;align-items:center;gap:9px;margin-bottom:7px;}
.tn{flex:1;font-size:11px;color:#C4B990;}
.cr{display:flex;align-items:center;gap:7px;}
.cb{width:22px;height:22px;border-radius:2px;border:none;cursor:pointer;font-size:10px;font-weight:500;font-family:'JetBrains Mono',monospace;transition:all .15s;}

/* GYM */
.split-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;margin-bottom:1rem;}
.split-cell{border-radius:2px;padding:8px 4px;text-align:center;cursor:pointer;border:.5px solid rgba(212,201,168,.1);transition:all .2s;position:relative;}
.split-cell.today-cell{border-color:rgba(201,168,76,.5);}
.split-cell.done-cell{background:rgba(126,184,164,.12);border-color:rgba(126,184,164,.3);}
.split-cell.skip-cell{background:rgba(194,74,74,.08);border-color:rgba(194,74,74,.2);}
.split-cell.rest-cell{background:rgba(107,107,94,.1);}
.sc-day{font-size:9px;color:#5A5A4E;letter-spacing:.08em;margin-bottom:4px;}
.sc-icon{font-size:16px;line-height:1;margin-bottom:3px;}
.sc-label{font-size:8px;color:#8A8070;letter-spacing:.05em;line-height:1.3;}
.sc-tick{position:absolute;top:3px;right:4px;font-size:9px;}

.gym-today{border:.5px solid rgba(201,168,76,.25);border-radius:3px;padding:1rem 1.1rem;margin-bottom:.85rem;background:rgba(201,168,76,.04);}
.gym-today-label{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:300;color:#E8DFC0;margin-bottom:4px;}
.gym-today-sub{font-size:10px;color:#7A7060;letter-spacing:.08em;margin-bottom:1rem;}
.gym-btn-row{display:flex;gap:8px;}

.gym-week{display:flex;flex-direction:column;gap:4px;}
.gym-week-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:.5px solid rgba(212,201,168,.06);}
.gym-week-row:last-child{border-bottom:none;}
.gym-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}

/* FOOD */
.food-streak-bar{display:flex;gap:3px;margin-bottom:1rem;flex-wrap:wrap;}
.food-day{width:28px;height:28px;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:10px;cursor:default;border:.5px solid transparent;}

.meal-log{display:flex;flex-direction:column;gap:6px;margin-bottom:.85rem;}
.meal-row{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:2px;border:.5px solid rgba(212,201,168,.09);background:rgba(18,18,13,.5);}
.meal-slot{font-size:10px;letter-spacing:.08em;color:#7A7060;width:70px;flex-shrink:0;}
.meal-btn-row{display:flex;gap:5px;margin-left:auto;}

.week-disc{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;}
.wd-cell{text-align:center;padding:6px 2px;}
.wd-date{font-size:8px;color:#5A5A4E;margin-bottom:3px;}
.wd-bar{height:32px;border-radius:1px;background:rgba(212,201,168,.08);position:relative;overflow:hidden;}
.wd-fill{position:absolute;bottom:0;left:0;right:0;border-radius:1px;transition:height .4s;}
.wd-pct{font-size:9px;color:#6B6B5E;margin-top:3px;}

/* SESSION LOG */
.srow{display:flex;align-items:center;gap:9px;padding:8px 0;border-bottom:.5px solid rgba(212,201,168,.06);font-size:12px;}
.srow:last-child{border-bottom:none;}
.dot6{width:6px;height:6px;border-radius:50%;flex-shrink:0;}

/* MOCK */
.mock-s{background:rgba(18,18,13,.6);border:.5px solid rgba(212,201,168,.09);border-radius:3px;padding:.9rem;margin-bottom:7px;}
.mock-bars{display:flex;align-items:flex-end;gap:4px;height:60px;margin-top:8px;}
.mb-wrap{text-align:center;}
.mb-bar{border-radius:1px 1px 0 0;width:24px;}
.mb-val{font-size:9px;margin-top:2px;}
.mb-idx{font-size:8px;color:#4A4A3E;}

/* AI */
.chat-area{min-height:360px;max-height:400px;overflow-y:auto;margin-bottom:.85rem;display:flex;flex-direction:column;gap:9px;padding:2px 0;}
.chat-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:280px;color:#3A3A2E;}
.ce-title{font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:300;color:#5A5A4E;margin-bottom:3px;}
.ce-sub{font-size:10px;letter-spacing:.1em;color:#3A3A2E;}
.msg{display:flex;padding:0 3px;}
.msg-u{justify-content:flex-end;}
.bbl{max-width:84%;padding:9px 13px;border-radius:3px;font-size:11px;line-height:1.65;white-space:pre-wrap;}
.bbl-u{background:rgba(201,168,76,.13);border:.5px solid rgba(201,168,76,.22);color:#D4C090;}
.bbl-a{background:rgba(18,18,13,.85);border:.5px solid rgba(212,201,168,.11);color:#C4B990;}
.ci{flex:1;background:rgba(212,201,168,.06);border:.5px solid rgba(212,201,168,.14);border-radius:2px;color:#C4B990;font-family:'JetBrains Mono',monospace;font-size:11px;padding:8px 11px;outline:none;}
.ci:focus{border-color:rgba(201,168,76,.32);}
.ci::placeholder{color:#3A3A2E;}
.qb{font-family:'JetBrains Mono',monospace;font-size:9px;padding:5px 9px;background:rgba(212,201,168,.05);border:.5px solid rgba(212,201,168,.11);border-radius:2px;color:#5A5A4E;cursor:pointer;transition:all .2s;letter-spacing:.04em;}
.qb:hover{background:rgba(212,201,168,.1);color:#9A8A60;}

/* PHASE TIMELINE */
.phase-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:.5px solid rgba(212,201,168,.06);}
.phase-row:last-child{border-bottom:none;}
.phase-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.phase-label{font-size:11px;color:#C4B990;width:120px;flex-shrink:0;}
.phase-range{font-size:10px;color:#5A5A4E;flex:1;}
.phase-note{font-size:10px;color:#7A7060;}

::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(212,201,168,.13);border-radius:2px;}
`;

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(initData);
  const [selSub, setSelSub] = useState("FR");
  const [logSub, setLogSub] = useState("FR");
  const [logHrs, setLogHrs] = useState(2);
  const [aiMsg, setAiMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [mockSub, setMockSub] = useState("FR");
  const [mockScore, setMockScore] = useState(50);
  const chatEnd = useRef(null);

  // ── Load data from Supabase on mount ──
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        const { data: dbData, error } = await supabase
          .from('tracker_data')
          .select('data')
          .eq('user_id', user)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          console.error('Load error:', error);
          return;
        }
        
        if (dbData && dbData.data) {
          setData(dbData.data);
        }
      } catch (err) {
        console.error('Unexpected load error:', err);
      }
    };
    loadData();
  }, [user]);

  // ── Auto-save to Supabase when data changes ──
  useEffect(() => {
    if (!user || !data) return;
    
    const saveData = async () => {
      try {
        const { error } = await supabase
          .from('tracker_data')
          .upsert(
            { user_id: user, data },
            { onConflict: 'user_id' }
          );
        
        if (error) console.error('Save error:', error);
      } catch (err) {
        console.error('Unexpected save error:', err);
      }
    };

    const timer = setTimeout(saveData, 500); // Debounce saves
    return () => clearTimeout(timer);
  }, [data, user]);

  // Show login screen if not authenticated
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  useEffect(() => {
    let el = document.getElementById("ca-styles");
    if (!el) {
      el = document.createElement("style");
      el.id = "ca-styles";
      document.head.appendChild(el);
    }
    el.textContent = css;
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [data.aiHistory]);

  // ── helpers ──
  const totalHrs = (sid) => Object.values(data.sessions).flatMap(d => d).filter(s => s.sid === sid).reduce((a, b) => a + b.hrs, 0);
  const todayHrs = () => (data.sessions[today] || []).reduce((a, b) => a + b.hrs, 0);
  const totalAllHrs = () => SUBJECTS.reduce((a, s) => a + totalHrs(s.id), 0);
  const topicsDone = (sid) => data.topics[sid].filter(t => t.status === "done").length;
  const topicsTotal = (sid) => data.topics[sid].length;
  const subjectPct = (sid) => Math.round((topicsDone(sid) / topicsTotal(sid)) * 100);
  const latestMock = (sid) => { const a = data.mockScores[sid] || []; return a.length ? a[a.length - 1] : null; };
  const overallReadiness = () => Math.round(SUBJECTS.reduce((a, s) => a + subjectPct(s.id), 0) / SUBJECTS.length);

  const logSession = () => {
    if (logHrs <= 0) return;
    setData(prev => {
      const day = [...(prev.sessions[today] || []), { sid: logSub, hrs: logHrs }];
      const sessions = { ...prev.sessions, [today]: day };
      let streak = { ...prev.streak };
      const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (streak.lastDate !== today) {
        streak = streak.lastDate === yest ? { lastDate: today, count: streak.count + 1 } : { lastDate: today, count: 1 };
      }
      return { ...prev, sessions, streak };
    });
  };

  const updateTopic = (sid, idx, field, val) => {
    setData(prev => {
      const topics = { ...prev.topics, [sid]: prev.topics[sid].map((t, i) => i === idx ? { ...t, [field]: val } : t) };
      return { ...prev, topics };
    });
  };

  const addMock = () => {
    setData(prev => {
      const arr = [...(prev.mockScores[mockSub] || []), { date: today, score: mockScore }];
      return { ...prev, mockScores: { ...prev.mockScores, [mockSub]: arr } };
    });
  };

  // ── GYM ──
  const todayGym = () => data.gym[today];
  const currentSplit = () => GYM_SPLIT[((data.gymDayPtr - 1) % 7)];

  const logGym = (done) => {
    setData(prev => {
      const entry = { done, skipped: !done, dayNum: prev.gymDayPtr, label: GYM_SPLIT[(prev.gymDayPtr - 1) % 7].label };
      const gym = { ...prev.gym, [today]: entry };
      let gs = { ...prev.gymStreak };
      const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (done) {
        if (gs.lastDate !== today) {
          gs = gs.lastDate === yest ? { lastDate: today, count: gs.count + 1 } : { lastDate: today, count: 1 };
        }
      } else {
        gs = { lastDate: gs.lastDate, count: 0 };
      }
      const nextDay = done ? (prev.gymDayPtr % 7) + 1 : prev.gymDayPtr;
      return { ...prev, gym, gymStreak: gs, gymDayPtr: nextDay };
    });
  };

  const getWeekGym = () => {
    return getWeekDates().map(d => ({ date: d, entry: data.gym[d] || null }));
  };

  // ── FOOD ──
  const todayFood = () => data.food[today] || { meals: [], waterOk: false };

  const logMeal = (slot, type) => {
    setData(prev => {
      const fd = prev.food[today] || { meals: [], waterOk: false };
      const meals = fd.meals.filter(m => m.slot !== slot);
      meals.push({ slot, type });
      const updated = { ...fd, meals };
      const food = { ...prev.food, [today]: updated };

      // streak: all meals clean today
      const allClean = updated.meals.length > 0 && updated.meals.every(m => m.type === "clean");
      let fs = { ...prev.foodStreak };
      const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (allClean) {
        if (fs.lastDate !== today) {
          fs = fs.lastDate === yest ? { lastDate: today, count: fs.count + 1 } : { lastDate: today, count: 1 };
        }
      } else if (type === "cheat") {
        fs = { lastDate: null, count: 0 };
      }
      return { ...prev, food, foodStreak: fs };
    });
  };

  const weekFoodDisc = () => {
    return getWeekDates().map(d => {
      const fd = data.food[d];
      if (!fd || fd.meals.length === 0) return { date: d, pct: null };
      const clean = fd.meals.filter(m => m.type === "clean").length;
      return { date: d, pct: Math.round((clean / fd.meals.length) * 100) };
    });
  };

  const getMealStatus = (slot) => {
    const fd = todayFood();
    const m = fd.meals.find(m => m.slot === slot);
    return m ? m.type : null;
  };

  const weeklyDisciplinePct = () => {
    const all = getWeekDates().flatMap(d => (data.food[d]?.meals || []));
    if (!all.length) return null;
    return Math.round((all.filter(m => m.type === "clean").length / all.length) * 100);
  };

  // ── AI ──
  const sendAI = async () => {
    if (!aiMsg.trim() || aiLoading) return;
    const msg = aiMsg.trim();
    setAiMsg("");
    setAiLoading(true);
    const ctx = `You are a CA Final expert coach for a student who is also a working professional (articleship until Sep 2026). Schedule: gym 5:50–6:45am, morning study 7–10am, office ~10:45am–6:15pm (sometimes 7pm, peak tax season till midnight), evening study 6:45–10pm on normal days. Subjects: FR (lectures 89% done), AFM (lectures 90% done), Audit (lectures 45%, paused till Oct 2026), DT (live batch Jun–Oct 2026), IDT (live batch Jun 15–Oct 2026), IBS (pending, needs MCS 15d + IT 15d first). Target: 80% in all subjects, May 2027. Total study hours: ${totalAllHrs().toFixed(1)}h. Study streak: ${data.streak.count} days. Gym streak: ${data.gymStreak.count} days. Be concise, strategic and realistic given the time constraints.`;
    const msgs = [...data.aiHistory.map(m => ({ role: m.role, content: m.content })), { role: "user", content: msg }];
    setData(prev => ({ ...prev, aiHistory: [...prev.aiHistory, { role: "user", content: msg }] }));
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, system: ctx, messages: msgs })
      });
      const d = await res.json();
      const reply = d.content?.[0]?.text || "Sorry, couldn't respond.";
      setData(prev => ({ ...prev, aiHistory: [...prev.aiHistory, { role: "assistant", content: reply }] }));
    } catch {
      setData(prev => ({ ...prev, aiHistory: [...prev.aiHistory, { role: "assistant", content: "Network error. Try again." }] }));
    }
    setAiLoading(false);
  };

  const days = daysLeft();
  const weeks = Math.floor(days / 7);
  const todayGymEntry = todayGym();
  const split = currentSplit();

  const TABS = [
    { id: "dashboard", label: "Overview" },
    { id: "gym",       label: "Gym" },
    { id: "food",      label: "Food" },
    { id: "tracker",   label: "Study Log" },
    { id: "subjects",  label: "Subjects" },
    { id: "mock",      label: "Mocks" },
    { id: "ai",        label: "AI Coach" },
  ];

  return (
    <div className="app">
      <div className="z1">

        {/* HEADER */}
        <div className="hdr">
          <div>
            <div className="hdr-title">CA Final</div>
            <div className="hdr-sub">Both Groups · May 2027 · Target 80%</div>
          </div>
          <div className="badges">
            <span className="badge b-red">{days}d left</span>
            <span className="badge b-grn">{weeks}w</span>
            <span className="badge b-gold">🔥 {data.streak.count} streak</span>
            <button onClick={() => setUser(null)} style={{
              background: 'rgba(194,74,74,.12)',
              border: '.5px solid rgba(194,74,74,.28)',
              color: '#C27A7A',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px',
              letterSpacing: '.08em',
              padding: '3px 8px',
              borderRadius: '2px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              marginTop: '4px'
            }}>Logout</button>
          </div>
        </div>

        {/* NAV */}
        <nav className="nav">
          {TABS.map(t => (
            <button key={t.id} className={`nb ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </nav>

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <div>
            <div className="sg sg-4" style={{ marginBottom: ".85rem" }}>
              {[
                { l: "Readiness", v: `${overallReadiness()}%` },
                { l: "Study Hrs", v: totalAllHrs().toFixed(1) },
                { l: "Gym Streak", v: `${data.gymStreak.count}d` },
                { l: "Food Score", v: weeklyDisciplinePct() !== null ? `${weeklyDisciplinePct()}%` : "—" },
              ].map(c => (
                <div key={c.l} className="sc">
                  <div className="sv">{c.v}</div>
                  <div className="sl">{c.l}</div>
                </div>
              ))}
            </div>

            {/* Gym & Food summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: ".85rem" }}>
              <div className="card" style={{ padding: ".9rem" }}>
                <div className="card-title">Today · Gym</div>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{split.icon}</div>
                <div style={{ fontSize: 12, color: "#C4B990", marginBottom: 4 }}>{split.label}</div>
                {todayGymEntry
                  ? <span className={`tag ${todayGymEntry.done ? "tg" : "tr"}`}>{todayGymEntry.done ? "✓ Done" : "✗ Skipped"}</span>
                  : <span className="tag tp">Not logged</span>
                }
              </div>
              <div className="card" style={{ padding: ".9rem" }}>
                <div className="card-title">Today · Food</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {MEAL_SLOTS.map(slot => {
                    const s = getMealStatus(slot);
                    return (
                      <div key={slot} style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                        <span style={{ color: "#5A5A4E" }}>{slot}</span>
                        {s === "clean" && <span style={{ color: "#7EB8A4" }}>✓</span>}
                        {s === "cheat" && <span style={{ color: "#C27A7A" }}>✗</span>}
                        {!s && <span style={{ color: "#3A3A2E" }}>—</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Subject progress */}
            <div className="card">
              <div className="card-title">Subject overview</div>
              {SUBJECTS.map((s, i) => {
                const pct = subjectPct(s.id);
                const sp = SUBJECT_PHASES[s.id];
                const mock = latestMock(s.id);
                return (
                  <div key={s.id} className="rr">
                    <div className="si" style={{ background: s.color + "18", color: s.color, width: 38, height: 38 }}>{s.short}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: "#C4B990" }}>{s.name}</span>
                        <span style={{ fontSize: 10, color: "#5A5A4E" }}>{mock ? `mock ${mock.score}%` : ""}</span>
                      </div>
                      <div className="bw"><div className="bf" style={{ width: `${pct}%`, background: s.color, opacity: .65 }} /></div>
                      <div style={{ fontSize: 9, color: sp.color, letterSpacing: ".07em", marginTop: 3 }}>{sp.status}</div>
                    </div>
                    <span className={`tag ${sp.phase === "Active" ? "tg" : sp.phase === "Revision" ? "tw" : sp.phase === "Paused" ? "tr" : "tp"}`}>{sp.phase}</span>
                  </div>
                );
              })}
            </div>

            {/* Phase timeline */}
            <div className="card">
              <div className="card-title">Roadmap</div>
              {PHASES.map(p => (
                <div key={p.label} className="phase-row">
                  <div className="phase-dot" style={{ background: p.color }} />
                  <div className="phase-label" style={{ color: "#C4B990" }}>{p.label}</div>
                  <div className="phase-range">{p.from.slice(0,7)} → {p.to.slice(0,7)}</div>
                  <div className="phase-note">{p.note}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GYM ── */}
        {tab === "gym" && (
          <div>
            {/* Today's workout */}
            <div className="gym-today">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 10, letterSpacing: ".15em", textTransform: "uppercase", color: "#5A5A4E", marginBottom: 6 }}>Today · Day {data.gymDayPtr % 7 || 7}</div>
                  <div className="gym-today-label">{split.icon} {split.label}</div>
                  <div className="gym-today-sub">{split.muscles.join(" · ")} · 5:50 – 6:45 AM</div>
                </div>
                <div className="sg sg-3" style={{ margin: 0, width: 160 }}>
                  <div className="sc"><div className="sv" style={{ fontSize: 18 }}>{data.gymStreak.count}</div><div className="sl">streak</div></div>
                  <div className="sc"><div className="sv" style={{ fontSize: 18 }}>{Object.values(data.gym).filter(g => g.done).length}</div><div className="sl">done</div></div>
                  <div className="sc"><div className="sv" style={{ fontSize: 18 }}>{Object.values(data.gym).filter(g => g.skipped).length}</div><div className="sl">skip</div></div>
                </div>
              </div>
              {!todayGymEntry ? (
                <div className="gym-btn-row" style={{ marginTop: "1rem" }}>
                  <button className="btn btn-grn" onClick={() => logGym(true)}>✓ Mark Done</button>
                  <button className="btn btn-red btn-sm" onClick={() => logGym(false)}>✗ Skipped Today</button>
                </div>
              ) : (
                <div style={{ marginTop: "1rem" }}>
                  <span className={`tag ${todayGymEntry.done ? "tg" : "tr"}`} style={{ fontSize: 11 }}>
                    {todayGymEntry.done ? "✓ Logged as done" : "✗ Logged as skipped"} · Next: Day {(data.gymDayPtr % 7) + 1 > 7 ? 1 : (data.gymDayPtr % 7) + 1}
                  </span>
                </div>
              )}
            </div>

            {/* 7-day split overview */}
            <div className="card">
              <div className="card-title">6-Day Split</div>
              <div className="split-grid">
                {GYM_SPLIT.map(g => {
                  const isToday = (data.gymDayPtr - 1) % 7 === g.day - 1;
                  const isRest = g.day === 7;
                  return (
                    <div
                      key={g.day}
                      className={`split-cell ${isToday ? "today-cell" : ""} ${isRest ? "rest-cell" : ""}`}
                      style={{ background: isToday ? "rgba(201,168,76,.08)" : "" }}
                    >
                      <div className="sc-day">D{g.day}</div>
                      <div className="sc-icon">{g.icon}</div>
                      <div className="sc-label">{g.label.split(" ").map((w, i) => <div key={i}>{w}</div>)}</div>
                      {isToday && <div className="sc-tick">●</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* This week */}
            <div className="card">
              <div className="card-title">This week</div>
              <div className="gym-week">
                {getWeekGym().map(({ date, entry }) => {
                  const d = new Date(date);
                  const dayName = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][d.getDay() === 0 ? 6 : d.getDay() - 1];
                  const isToday = date === today;
                  return (
                    <div key={date} className="gym-week-row">
                      <div className="gym-dot" style={{
                        background: entry?.done ? "#7EB8A4" : entry?.skipped ? "#C27A7A" : "rgba(212,201,168,.15)"
                      }} />
                      <span style={{ fontSize: 10, color: isToday ? "#C9A84C" : "#7A7060", width: 30 }}>{dayName}</span>
                      <span style={{ fontSize: 10, color: "#5A5A4E", flex: 1 }}>{date}</span>
                      {entry ? (
                        <span className={`tag ${entry.done ? "tg" : "tr"}`}>{entry.done ? `✓ ${entry.label}` : "skipped"}</span>
                      ) : (
                        <span className="tag tp">{isToday ? "today" : "—"}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── FOOD ── */}
        {tab === "food" && (
          <div>
            {/* Streak & score */}
            <div className="sg sg-3" style={{ marginBottom: ".85rem" }}>
              <div className="sc">
                <div className="sv">{data.foodStreak.count}</div>
                <div className="sl">clean streak</div>
              </div>
              <div className="sc">
                <div className="sv" style={{ color: weeklyDisciplinePct() >= 80 ? "#7EB8A4" : weeklyDisciplinePct() >= 60 ? "#C9A84C" : "#C27A7A" }}>
                  {weeklyDisciplinePct() !== null ? `${weeklyDisciplinePct()}%` : "—"}
                </div>
                <div className="sl">week discipline</div>
              </div>
              <div className="sc">
                <div className="sv" style={{ color: "#C27A7A" }}>
                  {Object.values(data.food).flatMap(f => f.meals).filter(m => m.type === "cheat").length}
                </div>
                <div className="sl">total cheats</div>
              </div>
            </div>

            {/* Cheat warning */}
            {data.foodStreak.count === 0 && Object.values(data.food).flatMap(f => f.meals).some(m => m.type === "cheat") && (
              <div style={{ background: "rgba(194,74,74,.08)", border: ".5px solid rgba(194,74,74,.22)", borderRadius: 3, padding: "10px 14px", marginBottom: ".85rem", fontSize: 11, color: "#C27A7A", lineHeight: 1.6 }}>
                🍔 Clean streak broken. Don't spiral — one cheat doesn't ruin the week. Log clean meals now and restart the streak today.
              </div>
            )}

            {data.foodStreak.count >= 3 && (
              <div style={{ background: "rgba(126,184,164,.07)", border: ".5px solid rgba(126,184,164,.2)", borderRadius: 3, padding: "10px 14px", marginBottom: ".85rem", fontSize: 11, color: "#7EB8A4", lineHeight: 1.6 }}>
                🥗 {data.foodStreak.count} day clean streak! Discipline in the kitchen = discipline in the books.
              </div>
            )}

            {/* Today's meals */}
            <div className="card">
              <div className="card-title">Today's meals — {today}</div>
              <div className="meal-log">
                {MEAL_SLOTS.map(slot => {
                  const status = getMealStatus(slot);
                  return (
                    <div key={slot} className="meal-row" style={{
                      borderColor: status === "clean" ? "rgba(126,184,164,.2)" : status === "cheat" ? "rgba(194,74,74,.2)" : "rgba(212,201,168,.09)",
                      background: status === "clean" ? "rgba(126,184,164,.05)" : status === "cheat" ? "rgba(194,74,74,.05)" : "rgba(18,18,13,.5)"
                    }}>
                      <span className="meal-slot">{slot}</span>
                      <span style={{ flex: 1, fontSize: 11, color: status === "clean" ? "#7EB8A4" : status === "cheat" ? "#C27A7A" : "#3A3A2E" }}>
                        {status === "clean" ? "✓ Clean meal" : status === "cheat" ? "✗ Cheat / Junk" : "not logged"}
                      </span>
                      <div className="meal-btn-row">
                        <button
                          className={`btn btn-sm ${status === "clean" ? "btn-grn" : "btn-ghost"}`}
                          onClick={() => logMeal(slot, "clean")}
                        >Clean</button>
                        <button
                          className={`btn btn-sm ${status === "cheat" ? "btn-red" : "btn-ghost"}`}
                          onClick={() => logMeal(slot, "cheat")}
                        >Cheat</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly discipline chart */}
            <div className="card">
              <div className="card-title">This week · discipline</div>
              <div className="week-disc">
                {weekFoodDisc().map(({ date, pct }) => {
                  const d = new Date(date);
                  const dayName = ["M","T","W","T","F","S","S"][d.getDay() === 0 ? 6 : d.getDay() - 1];
                  const isToday = date === today;
                  const fillColor = pct === null ? "transparent" : pct === 100 ? "#7EB8A4" : pct >= 75 ? "#C9A84C" : "#C27A7A";
                  return (
                    <div key={date} className="wd-cell">
                      <div className="wd-date" style={{ color: isToday ? "#C9A84C" : "#5A5A4E" }}>{dayName}</div>
                      <div className="wd-bar">
                        {pct !== null && (
                          <div className="wd-fill" style={{ height: `${pct}%`, background: fillColor, opacity: .7 }} />
                        )}
                      </div>
                      <div className="wd-pct" style={{ color: fillColor !== "transparent" ? fillColor : "#3A3A2E" }}>
                        {pct !== null ? `${pct}%` : "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── STUDY LOG ── */}
        {tab === "tracker" && (
          <div>
            <div className="card">
              <div className="card-title">Log study session</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
                <div>
                  <label className="fl">Subject</label>
                  <select value={logSub} onChange={e => setLogSub(e.target.value)}>
                    {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.short} — {s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fl">Hours — {logHrs}h</label>
                  <input type="range" min="0.5" max="10" step="0.5" value={logHrs} onChange={e => setLogHrs(Number(e.target.value))} />
                </div>
                <button className="btn" onClick={logSession}>+ Log</button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: ".85rem" }}>
              {SUBJECTS.map(s => (
                <div key={s.id} style={{ background: "rgba(18,18,13,.6)", border: ".5px solid rgba(212,201,168,.08)", borderRadius: 2, padding: "9px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 300, color: s.color }}>{totalHrs(s.id).toFixed(1)}h</div>
                  <div style={{ fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", color: "#4A4A3E", marginTop: 2 }}>{s.short}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title">Today — {today} · {todayHrs().toFixed(1)}h</div>
              {(data.sessions[today] || []).length === 0
                ? <div style={{ fontSize: 11, color: "#4A4A3E", padding: "6px 0" }}>No sessions logged yet.</div>
                : (data.sessions[today] || []).map((s, i) => {
                    const sub = SUBJECTS.find(x => x.id === s.sid);
                    return (
                      <div key={i} className="srow">
                        <div className="dot6" style={{ background: sub?.color }} />
                        <span style={{ flex: 1 }}>{sub?.name}</span>
                        <span style={{ color: "#5A5A4E" }}>{s.hrs}h</span>
                      </div>
                    );
                  })
              }
            </div>
          </div>
        )}

        {/* ── SUBJECTS ── */}
        {tab === "subjects" && (
          <div>
            <div className="st-row">
              {SUBJECTS.map(s => (
                <button key={s.id} className={`st ${selSub === s.id ? "active" : ""}`} onClick={() => setSelSub(s.id)}
                  style={selSub === s.id ? { background: s.color } : {}}>{s.short}</button>
              ))}
            </div>

            {(() => {
              const sub = SUBJECTS.find(s => s.id === selSub);
              const sp = SUBJECT_PHASES[selSub];
              const done = topicsDone(selSub), total = topicsTotal(selSub);
              const mock = latestMock(selSub);
              return (
                <div>
                  <div className="card">
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                      <div className="si" style={{ background: sub.color + "20", color: sub.color, width: 42, height: 42 }}>{sub.short}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 300, color: "#E8DFC0" }}>{sub.name}</div>
                        <div style={{ fontSize: 9, color: sp.color, letterSpacing: ".08em", marginTop: 3 }}>{sp.status}</div>
                      </div>
                    </div>
                    <div className="sg sg-4" style={{ margin: 0 }}>
                      {[
                        { l: "Done", v: `${done}/${total}` },
                        { l: "Complete", v: `${subjectPct(selSub)}%` },
                        { l: "Hours", v: `${totalHrs(selSub).toFixed(1)}h` },
                        { l: "Last Mock", v: mock ? `${mock.score}%` : "—" },
                      ].map(c => (
                        <div key={c.l} className="sc">
                          <div className="sv" style={{ fontSize: 18 }}>{c.v}</div>
                          <div className="sl">{c.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                    {STATUS_OPTS.map(st => (
                      <div key={st} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", color: STATUS_META[st].color }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_META[st].dot }} />
                        {st} ({data.topics[selSub].filter(t => t.status === st).length})
                      </div>
                    ))}
                  </div>

                  {data.topics[selSub].map((t, i) => (
                    <div key={i} className="ti">
                      <div className="th">
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_META[t.status].dot, flexShrink: 0 }} />
                        <span className="tn">{t.name}</span>
                        <select
                          value={t.status}
                          onChange={e => updateTopic(selSub, i, "status", e.target.value)}
                          style={{ fontSize: "10px", padding: "3px 8px", background: STATUS_META[t.status].bg, color: STATUS_META[t.status].color, border: `.5px solid ${STATUS_META[t.status].color}44`, borderRadius: 2, width: "auto" }}
                        >
                          {STATUS_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                      <div className="cr">
                        <span style={{ fontSize: 10, color: "#4A4A3E", letterSpacing: ".08em" }}>conf</span>
                        {[1, 2, 3, 4, 5].map(n => (
                          <button key={n} className="cb" onClick={() => updateTopic(selSub, i, "confidence", n)}
                            style={{
                              background: t.confidence >= n ? sub.color + "2A" : "rgba(212,201,168,.05)",
                              color: t.confidence >= n ? sub.color : "#3A3A2E",
                              border: `.5px solid ${t.confidence >= n ? sub.color + "55" : "rgba(212,201,168,.09)"}`,
                            }}>{n}</button>
                        ))}
                        <span style={{ fontSize: 9, color: "#4A4A3E", marginLeft: "auto" }}>{["","very low","low","medium","high","very high"][t.confidence]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── MOCK ── */}
        {tab === "mock" && (
          <div>
            <div className="card">
              <div className="card-title">Record mock score</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, alignItems: "end" }}>
                <div>
                  <label className="fl">Subject</label>
                  <select value={mockSub} onChange={e => setMockSub(e.target.value)}>
                    {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.short}</option>)}
                  </select>
                </div>
                <div>
                  <label className="fl">Score — {mockScore}%</label>
                  <input type="range" min="0" max="100" value={mockScore} onChange={e => setMockScore(Number(e.target.value))} />
                </div>
                <button className="btn" onClick={addMock}>+ Add</button>
              </div>
            </div>

            {SUBJECTS.map(sub => {
              const scores = data.mockScores[sub.id] || [];
              const avg = scores.length ? Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length) : null;
              const best = scores.length ? Math.max(...scores.map(s => s.score)) : null;
              const trend = scores.length >= 2 ? scores[scores.length - 1].score - scores[scores.length - 2].score : null;
              return (
                <div key={sub.id} className="mock-s">
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div className="si" style={{ background: sub.color + "18", color: sub.color, width: 30, height: 30, fontSize: 9 }}>{sub.short}</div>
                    <span style={{ flex: 1, fontSize: 12, color: "#C4B990" }}>{sub.name}</span>
                    {avg !== null && <span className={`tag ${avg >= TARGET_SCORE ? "tg" : "tw"}`}>avg {avg}%</span>}
                    {best !== null && <span className="tag tb">best {best}%</span>}
                    {trend !== null && <span className={`tag ${trend >= 0 ? "tg" : "tr"}`}>{trend >= 0 ? "+" : ""}{trend}%</span>}
                  </div>
                  {scores.length > 0 ? (
                    <div className="mock-bars">
                      {scores.map((sc, i) => {
                        const h = Math.round(sc.score / 100 * 50);
                        const col = sc.score >= TARGET_SCORE ? "#7EB8A4" : sc.score >= 40 ? "#C9A84C" : "#C27A7A";
                        return (
                          <div key={i} className="mb-wrap">
                            <div style={{ height: 50, display: "flex", alignItems: "flex-end" }}>
                              <div className="mb-bar" style={{ height: h, background: col, opacity: .7 }} />
                            </div>
                            <div className="mb-val" style={{ color: col }}>{sc.score}</div>
                            <div className="mb-idx">#{i + 1}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: 10, color: "#3A3A2E", letterSpacing: ".06em", marginTop: 8 }}>No mocks recorded yet.</div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── AI COACH ── */}
        {tab === "ai" && (
          <div>
            <div className="chat-area">
              {data.aiHistory.length === 0 && (
                <div className="chat-empty">
                  <div style={{ fontSize: 28, marginBottom: 12 }}>◈</div>
                  <div className="ce-title">Your CA Coach</div>
                  <div className="ce-sub">Knows your schedule, subjects & phase plan</div>
                </div>
              )}
              {data.aiHistory.map((m, i) => (
                <div key={i} className={`msg ${m.role === "user" ? "msg-u" : ""}`}>
                  <div className={`bbl ${m.role === "user" ? "bbl-u" : "bbl-a"}`}>{m.content}</div>
                </div>
              ))}
              {aiLoading && (
                <div className="msg">
                  <div className="bbl bbl-a" style={{ color: "#4A4A3E", fontStyle: "italic" }}>Thinking…</div>
                </div>
              )}
              <div ref={chatEnd} />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <input className="ci" value={aiMsg} onChange={e => setAiMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendAI()} placeholder="Ask your CA coach anything…" />
              <button className="btn" onClick={sendAI} disabled={aiLoading}>Send</button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                "What should I study this week?",
                "How to manage DT + IDT live batch?",
                "Study plan after articleship ends",
                "How to score 80+ in FR & AFM?",
                "How do I fit IBS prep in?",
                "ITR season is killing my study time",
              ].map(q => (
                <button key={q} className="qb" onClick={() => setAiMsg(q)}>{q}</button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
