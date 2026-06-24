import { useState, useEffect, useRef } from "react";
// ── Contact info detection ───────────────────────────────────────────────────
const CONTACT_PATTERNS = [
  /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  /\d{1,5}\s+[\w\s]{1,40}(street|st|avenue|ave|road|rd|blvd|boulevard|drive|dr|lane|ln|way|court|ct|place|pl)/gi,
  /whatsapp|telegram|signal|wechat|line/gi,
];
function containsContactInfo(text) {
  return CONTACT_PATTERNS.some(p => { p.lastIndex = 0; return p.test(text); });
}

const CONVERSATIONS = [
  {
    id: 1,
    name: "Dawa Sherpa",
    location: "Kathmandu, Nepal",
    avatar: "🧗",
    verified: true,
    online: true,
    specialty: "High-altitude trekking",
    rating: 4.97,
    trips: 86,
    bio: "Born and raised in the Khumbu Valley. I've summited Island Peak 40+ times and guided the EBC route for 12 years. I speak fluent English and Nepali, and I believe the best treks are built around the traveler's pace — not the agency's schedule.",
    tags: ["Solo-traveler friendly", "Photography pace", "Quiet & mindful", "Flexible daily rhythm"],
    booking: { status: "booked", dates: "Jun 3 – Jun 16" },
    lastMsg: "See you at Lukla — I'll have the permits ready!",
    time: "2m ago",
    unread: 2,
    messages: [
      { id: 1, from: "them", text: "Hello! I saw you're interested in the Everest Base Camp route.", time: "Mon 9:14 AM" },
      { id: 2, from: "me", text: "Yes! I've been researching it for months. Do you do solo traveler pacing?", time: "Mon 9:22 AM" },
      { id: 3, from: "them", text: "Absolutely — most of my guests are solo. I adjust pace day by day based on how you're feeling. No rush, no pressure.", time: "Mon 9:25 AM" },
      { id: 4, from: "me", text: "That's exactly what I was hoping to hear. How early do you usually start each day?", time: "Mon 9:31 AM" },
      { id: 5, from: "them", text: "Typically 6–7am to beat the afternoon clouds. But we can talk through a full day structure before we go.", time: "Mon 9:35 AM" },
      { id: 6, from: "them", text: "See you at Lukla — I'll have the permits ready!", time: "Today 8:02 AM" },
    ],
  },
  {
    id: 2,
    name: "Linh Nguyen",
    location: "Ha Giang, Vietnam",
    avatar: "🏍️",
    verified: true,
    online: false,
    specialty: "Ha Giang Loop",
    rating: 4.91,
    trips: 54,
    bio: "Ha Giang local, been riding the Loop since I was a teenager. I know every hidden viewpoint, every family homestay, every side road worth taking. I love travelers who want to slow down and actually connect with the place.",
    tags: ["Local knowledge", "Homestay network", "Photography stops", "Small groups only"],
    booking: { status: "cancelled", dates: "Oct 4 – Oct 8" },
    lastMsg: "The north loop takes about 4 days if you want real stops.",
    time: "1h ago",
    unread: 0,
    messages: [
      { id: 1, from: "me", text: "Hi Linh! I'm planning Ha Giang for late October. Is that a good time?", time: "Yesterday 3:10 PM" },
      { id: 2, from: "them", text: "October is honestly one of the best — harvest season, golden rice terraces, fewer tourists than November.", time: "Yesterday 3:18 PM" },
      { id: 3, from: "me", text: "Amazing. How long do you recommend for someone who wants photography stops?", time: "Yesterday 3:24 PM" },
      { id: 4, from: "them", text: "The north loop takes about 4 days if you want real stops.", time: "Yesterday 4:01 PM" },
    ],
  },
  {
    id: 3,
    name: "Carlos Mendoza",
    location: "Cusco, Peru",
    avatar: "🏔️",
    verified: false,
    online: true,
    specialty: "Inca Trail & Sacred Valley",
    rating: 4.83,
    trips: 31,
    bio: "Third-generation Cusqueño. I grew up listening to my grandfather's stories about the Inca road system. Now I guide the same paths he described. I cap my groups at 4 people — the Inca Trail isn't meant to be a parade.",
    tags: ["Max 4 guests", "Cultural depth", "Spanish & English", "Quechua speaker"],
    lastMsg: "I can send you my route overview if you want to compare.",
    time: "3h ago",
    unread: 1,
    messages: [
      { id: 1, from: "them", text: "Hi! I noticed you viewed my profile. Happy to answer any questions about the Inca Trail.", time: "Today 7:00 AM" },
      { id: 2, from: "me", text: "Thanks Carlos! What's your group size limit? I really want something intimate.", time: "Today 7:45 AM" },
      { id: 3, from: "them", text: "I cap at 4 people maximum. Usually do 2–3. I don't believe in large group trekking.", time: "Today 7:51 AM" },
      { id: 4, from: "them", text: "I can send you my route overview if you want to compare.", time: "Today 9:12 AM" },
    ],
  },
];

// ── Messaging components ─────────────────────────────────────────────────────

const MsgAvatar = ({ emoji, size = 44, online = false }) => (
  <div style={{ position: "relative", flexShrink: 0 }}>
    <div style={{ width: size, height: size, borderRadius: "50%", background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.45 }}>{emoji}</div>
    {online && <div style={{ position: "absolute", bottom: 1, right: 1, width: 10, height: 10, borderRadius: "50%", background: C.green, border: `2px solid ${C.white}` }} />}
  </div>
);

const MsgVerifiedBadge = () => (
  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 15, height: 15, borderRadius: "50%", background: C.green, marginLeft: 4, flexShrink: 0 }}>
    <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
  </span>
);

const BlockedBubble = () => (
  <div style={{ alignSelf: "flex-end", background: "#FFF3CD", border: "1px solid #F0C040", borderRadius: "18px 18px 4px 18px", padding: "10px 14px", maxWidth: "80%", display: "flex", alignItems: "flex-start", gap: 8 }}>
    <span style={{ fontSize: 16 }}>🔒</span>
    <div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#92600A" }}>Message blocked</p>
      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#A0700C", lineHeight: 1.4 }}>Contact info isn't allowed here — keep your conversation in GuideMatch until you're ready to book.</p>
    </div>
  </div>
);

const ProfileSheet = ({ convo, onClose }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 10); }, []);
  const close = () => { setVisible(false); setTimeout(onClose, 280); };
  return (
    <div onClick={close} style={{ position: "absolute", inset: 0, zIndex: 200, background: `rgba(27,27,27,${visible ? 0.45 : 0})`, transition: "background 0.28s", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.bg, borderRadius: "24px 24px 0 0", maxHeight: "88%", overflowY: "auto", transform: visible ? "translateY(0)" : "translateY(100%)", transition: "transform 0.28s cubic-bezier(0.32,0.72,0,1)" }}>
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 4px" }}>
          <div style={{ width: 36, height: 4, borderRadius: 999, background: C.surface }} />
        </div>
        <div style={{ padding: "16px 20px 20px", textAlign: "center", background: C.white, margin: "0 0 8px" }}>
          <div style={{ fontSize: 60, marginBottom: 10 }}>{convo.avatar}</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginBottom: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, fontFamily: F.display }}>{convo.name}</span>
            {convo.verified && <MsgVerifiedBadge />}
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 14, color: C.textMuted, fontFamily: F.body }}>📍 {convo.location}</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 12 }}>
            {[["⭐ " + convo.rating, "Rating"], [convo.trips, "Trips guided"], [convo.online ? "Now" : "Away", "Status"]].map(([val, label], i) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: label === "Status" && convo.online ? C.green : C.textPrimary, fontFamily: F.body }}>{val}</div>
                <div style={{ fontSize: 11, color: C.textMuted, fontFamily: F.body }}>{label}</div>
              </div>
            ))}
          </div>
          {convo.verified && <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: C.greenTint, borderRadius: 999, padding: "5px 12px" }}><span style={{ fontSize: 12, color: C.green, fontWeight: 600, fontFamily: F.body }}>✓ Identity Verified</span></div>}
        </div>
        {[{ title: "About", content: <p style={{ margin: 0, fontSize: 14, color: C.textPrimary, lineHeight: 1.6, fontFamily: F.body }}>{convo.bio}</p> },
          { title: "Specialty", content: <p style={{ margin: 0, fontSize: 15, color: C.textPrimary, fontWeight: 600, fontFamily: F.body }}>{convo.specialty}</p> },
          { title: "Guide style", content: <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{convo.tags.map(tag => <span key={tag} style={{ background: C.surface, borderRadius: 999, padding: "6px 13px", fontSize: 13, color: C.textPrimary, fontFamily: F.body }}>{tag}</span>)}</div> },
        ].map(({ title, content }) => (
          <div key={title} style={{ background: C.white, padding: "16px 20px", marginBottom: 8 }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: F.body }}>{title}</h3>
            {content}
          </div>
        ))}
        <div style={{ padding: "4px 20px 32px" }}>
          <button style={{ width: "100%", background: C.green, color: C.white, border: "none", borderRadius: 16, padding: "15px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: F.body }}>Book with {convo.name.split(" ")[0]}</button>
        </div>
      </div>
    </div>
  );
};

const ConversationList = ({ onOpen }) => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const filtered = CONVERSATIONS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = activeFilter === "All" || (activeFilter === "Unread" && c.unread > 0);
    return matchSearch && matchFilter;
  });
  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ padding: "20px 20px 12px", background: C.white }}>
        <h1 style={{ margin: "0 0 14px", fontSize: 24, fontWeight: 700, color: C.textPrimary, letterSpacing: "-0.5px", fontFamily: F.display }}>Messages</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface, borderRadius: 999, padding: "10px 16px" }}>
          <svg width="15" height="15" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5" stroke={C.textMuted} strokeWidth="1.8"/><path d="M13 13l3.5 3.5" stroke={C.textMuted} strokeWidth="1.8" strokeLinecap="round"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guides…" style={{ border: "none", background: "none", outline: "none", fontSize: 15, color: C.textPrimary, width: "100%", fontFamily: F.body }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, padding: "8px 20px 12px", background: C.white, overflowX: "auto" }}>
        {["All", "Unread"].map(label => (
          <button key={label} onClick={() => setActiveFilter(label)} style={{ padding: "6px 14px", borderRadius: 999, border: "none", background: activeFilter === label ? C.green : C.surface, color: activeFilter === label ? C.white : C.textPrimary, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: F.body }}>{label}</button>
        ))}
      </div>
      <div style={{ background: C.bg }}>
        {filtered.map((convo, idx) => (
          <div key={convo.id}>
            <button onClick={() => onOpen(convo)} style={{ width: "100%", background: C.white, border: "none", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", textAlign: "left" }}>
              <MsgAvatar emoji={convo.avatar} size={50} online={convo.online} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, fontFamily: F.body }}>{convo.name}</span>
                    {convo.verified && <MsgVerifiedBadge />}
                  </div>
                  <span style={{ fontSize: 11, color: C.textMuted, fontFamily: F.body }}>{convo.time}</span>
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5, fontFamily: F.body }}>📍 {convo.location} · {convo.specialty}</div>
                {convo.booking && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 999, padding: "2px 9px", background: convo.booking.status === "booked" ? C.greenTint : "#FEF0E7", color: convo.booking.status === "booked" ? C.green : "#B85C1A", fontFamily: F.body }}>
                      {convo.booking.status === "booked" ? "Booked" : "Cancelled"}
                    </span>
                    <span style={{ fontSize: 12, color: C.textMuted, fontFamily: F.body }}>{convo.booking.dates}</span>
                  </div>
                )}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: convo.unread > 0 ? C.textPrimary : C.textMuted, fontWeight: convo.unread > 0 ? 500 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%", fontFamily: F.body }}>{convo.lastMsg}</span>
                  {convo.unread > 0 && <span style={{ background: C.green, color: C.white, borderRadius: 999, fontSize: 11, fontWeight: 700, padding: "2px 7px", minWidth: 20, textAlign: "center", fontFamily: F.body }}>{convo.unread}</span>}
                </div>
              </div>
            </button>
            {idx < filtered.length - 1 && <div style={{ height: 1, background: C.border, marginLeft: 82 }} />}
          </div>
        ))}
        <div style={{ margin: "16px 20px 20px", background: C.greenTint, borderRadius: 16, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18 }}>🔒</span>
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.green, fontFamily: F.body }}>Safe messaging</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "#2d6e3e", lineHeight: 1.5, fontFamily: F.body }}>Keep conversations here until you book. We protect both guides and travelers by keeping contact info private.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatView = ({ convo, onBack }) => {
  const [messages, setMessages] = useState(convo.messages);
  const [draft, setDraft] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const showWarning = draft.trim() && containsContactInfo(draft);
  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: Date.now(), from: "me", text, time: "Just now", blocked: containsContactInfo(text) }]);
    setDraft("");
  };
  const handleKeyDown = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } };
  const grouped = [];
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    if (!prev || prev.time !== msg.time) grouped.push({ type: "time", label: msg.time });
    grouped.push({ type: "msg", msg });
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", position: "relative", background: C.bg }}>
      {/* Header */}
      <div style={{ background: C.white, padding: "12px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", alignItems: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <button onClick={() => setShowProfile(true)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}>
          <MsgAvatar emoji={convo.avatar} size={38} online={convo.online} />
          <div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary, fontFamily: F.body }}>{convo.name}</span>
              {convo.verified && <MsgVerifiedBadge />}
            </div>
            <span style={{ fontSize: 12, color: convo.online ? C.green : C.textMuted, fontFamily: F.body }}>{convo.online ? "Online now" : convo.location} · <span style={{ textDecoration: "underline", textDecorationColor: C.surface }}>View profile</span></span>
          </div>
        </button>
        <button style={{ background: C.green, color: C.white, border: "none", borderRadius: 10, padding: "7px 13px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F.body, flexShrink: 0 }}>Book</button>
      </div>
      {/* Messages */}
      <div style={{ padding: "12px 16px 100px", display: "flex", flexDirection: "column", gap: 4 }}>
        {grouped.map((item, i) => {
          if (item.type === "time") return <div key={`t-${i}`} style={{ textAlign: "center", margin: "10px 0 6px" }}><span style={{ fontSize: 11, color: C.textMuted, fontFamily: F.body }}>{item.label}</span></div>;
          const { msg } = item;
          const isMe = msg.from === "me";
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 7 }}>
              {!isMe && <MsgAvatar emoji={convo.avatar} size={26} />}
              {msg.blocked ? <BlockedBubble /> : (
                <div style={{ maxWidth: "78%", background: isMe ? C.green : C.white, color: isMe ? C.white : C.textPrimary, borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px", padding: "10px 14px", fontSize: 15, lineHeight: 1.45, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", fontFamily: F.body }}>{msg.text}</div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} style={{ height: 8 }} />
      </div>
      {/* Input */}
      <div style={{ position: "fixed", bottom: 70, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.white, borderTop: `1px solid ${C.border}`, padding: "10px 12px 14px", zIndex: 50, boxSizing: "border-box" }}>
        {showWarning && (
          <div style={{ background: "#FFF3CD", border: "1px solid #F0C040", borderRadius: 10, padding: "8px 12px", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>⚠️</span>
            <p style={{ margin: 0, fontSize: 12, color: "#92600A", fontWeight: 500, lineHeight: 1.4, fontFamily: F.body }}>Contact info detected — this message can't be sent.</p>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <div style={{ flex: 1, background: C.surface, borderRadius: 22, padding: "10px 16px", display: "flex", alignItems: "center" }}>
            <textarea value={draft} onChange={e => { setDraft(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }} onKeyDown={handleKeyDown} placeholder="Message…" rows={1} style={{ flex: 1, border: "none", background: "none", outline: "none", resize: "none", fontSize: 15, color: C.textPrimary, fontFamily: F.body, lineHeight: 1.4, maxHeight: 100, overflow: "auto" }} />
          </div>
          <button onClick={handleSend} disabled={!draft.trim() || showWarning} style={{ width: 42, height: 42, borderRadius: "50%", background: draft.trim() && !showWarning ? C.green : C.surface, border: "none", cursor: draft.trim() && !showWarning ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke={draft.trim() && !showWarning ? C.white : C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={draft.trim() && !showWarning ? C.white : C.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
      {showProfile && <ProfileSheet convo={convo} onClose={() => setShowProfile(false)} />}
    </div>
  );
};

// ── MessagesScreen ────────────────────────────────────────────────────────────
const MessagesScreen = ({ setScreen }) => {
  const [openChat, setOpenChat] = useState(null);
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      {openChat
        ? <ChatView convo={openChat} onBack={() => setOpenChat(null)} />
        : <ConversationList onOpen={c => setOpenChat(c)} />
      }
      {!openChat && <BottomNav active="messages" setScreen={setScreen} />}
    </div>
  );
};



// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  green: "#02661A",
  greenTint: "#EAF2EB",
  greenMid: "#C8DFC9",
  orange: "#D98C3F",
  orangeTint: "#FBF2E8",
  bg: "#F7F3EA",
  surface: "#E7DED0",
  surfaceLight: "#EDE8DE",
  white: "#FFFFFF",
  textPrimary: "#1B1B1B",
  textMid: "#5A5650",
  textMuted: "#9A938A",
  border: "rgba(27,27,27,0.09)",
};

const F = {
  display: "'Playfair Display', Georgia, serif",
  body: "'Outfit', system-ui, sans-serif",
};

const shadow = "0 6px 28px rgba(27,27,27,0.09)";
const shadowSm = "0 2px 12px rgba(27,27,27,0.07)";

// ─── DATA ────────────────────────────────────────────────────────────────────
const GUIDES = [
  {
    id: 1, name: "Pemba", emoji: "🧑‍🦱", gender: "♂",
    bg: "linear-gradient(145deg, #2D5016 0%, #4A7C30 50%, #6B9E4A 100%)",
    match: 97, rating: "4.97", treks: 312, yrs: 11,
    vibe: "\"I treat every trek as a story worth telling.\"",
    bio: "I've guided over 300 treks on the EBC route and I still stop at the same ridge every time — not because I have to, but because it never gets old. I'll match your pace, read your energy, and help you find the silence that makes these mountains worth the climb.",
    tags: ["Calm & quiet", "Photography focus", "EBC specialist"],
    cert: "EBC certified", certs: ["Nepal Trekking Guide Licence", "EBC Certified", "Wilderness First Aid", "High Altitude Training"],
    soloRate: 65, groupRate: 38, minGroup: 3, location: "Namche Bazaar",
    specialtyRoutes: ["Everest Base Camp", "Three Passes Trek", "Gokyo Lakes"],
    paceLabel: "Reflective", paceColor: "#02661A",
    languages: ["English", "Nepali", "Tibetan"],
    personality: { social: 2, pace: 2, cultural: 4, photography: 5, adventure: 4 },
    reviewSnippets: [
      { author: "Sofia M.", text: "Pemba read exactly what kind of trip I needed. Quiet, thoughtful, and he has an eye for light that most photographers would envy." },
      { author: "James K.", text: "Best guide I've ever had. He knew when to talk and when to let the mountains do the work." },
    ],
  },
  {
    id: 2, name: "Dawa", emoji: "👩", gender: "♀",
    bg: "linear-gradient(145deg, #5C3D1E 0%, #8B6535 50%, #C4914A 100%)",
    match: 91, rating: "4.94", treks: 187, yrs: 7,
    vibe: "\"Slow travel reveals what rushing hides.\"",
    bio: "I grew up in Pokhara and have spent the last seven years helping travelers fall in love with the Annapurna region. I believe the best moments on any trek aren't at the summit — they're at the teahouse table, or watching cloud shadows move across a valley.",
    tags: ["Chatty & warm", "Culture-first", "Solo traveler friendly"],
    cert: "Annapurna certified", certs: ["Nepal Trekking Guide Licence", "Annapurna Certified", "Basic First Aid", "Wilderness First Aid"],
    soloRate: 58, groupRate: 32, minGroup: 2, location: "Pokhara",
    specialtyRoutes: ["Annapurna Circuit", "Poon Hill", "Mardi Himal"],
    paceLabel: "Adaptive", paceColor: "#D98C3F",
    languages: ["English", "Nepali", "Hindi"],
    personality: { social: 4, pace: 2, cultural: 5, photography: 3, adventure: 3 },
    reviewSnippets: [
      { author: "Camille D.", text: "Dawa took us to places I'd never have found alone. She adjusted the pace perfectly — never rushed, never bored." },
      { author: "Ravi S.", text: "Felt like traveling with a friend, not a guide. She genuinely cared about whether we were having a good time." },
    ],
  },
  {
    id: 3, name: "Norbu", emoji: "🧔", gender: "♂",
    bg: "linear-gradient(145deg, #1A3A4A 0%, #2E6080 50%, #4A8FA8 100%)",
    match: 84, rating: "4.89", treks: 241, yrs: 9,
    vibe: "\"The mountain teaches patience. I just translate.\"",
    bio: "I know every stone on the Langtang trail — the ones that shift in October, the ones that ice over at night. I guide with humor and deep respect for the mountain and the person next to me. My stories will make the altitude feel a little lighter.",
    tags: ["Storyteller", "Wildlife expert", "Family friendly"],
    cert: "Langtang certified", certs: ["Nepal Trekking Guide Licence", "Langtang Certified", "Avalanche Safety", "Wilderness First Aid"],
    soloRate: 60, groupRate: 35, minGroup: 2, location: "Kathmandu",
    specialtyRoutes: ["Langtang Valley", "Gosaikunda", "Helambu Circuit"],
    paceLabel: "Energetic", paceColor: "#2E6080",
    languages: ["English", "Nepali", "Tibetan"],
    personality: { social: 5, pace: 4, cultural: 5, photography: 2, adventure: 5 },
    reviewSnippets: [
      { author: "Lena R.", text: "Norbu kept our group laughing at 4,800m. His stories about the valley's history gave me chills." },
      { author: "Tom H.", text: "Tough but caring. He pushed me past what I thought was my limit. I'm so glad he did." },
    ],
  },
  {
    id: 4, name: "Sita", emoji: "👩‍🦰", gender: "♀",
    bg: "linear-gradient(145deg, #4A1A2E 0%, #803050 50%, #B05070 100%)",
    match: 79, rating: "4.92", treks: 156, yrs: 6,
    vibe: "\"Every traveler deserves to feel truly seen.\"",
    bio: "I specialize in helping solo travelers — especially women — feel completely safe and at ease on multi-day treks. I pay close attention to energy, pace, and what you actually need from a day in the mountains, not just what the itinerary says.",
    tags: ["Mindful pace", "Spiritual sites", "Female guide"],
    cert: "EBC certified", certs: ["Nepal Trekking Guide Licence", "EBC Certified", "Basic First Aid", "High Altitude Training"],
    soloRate: 55, groupRate: 30, minGroup: 2, location: "Lukla",
    specialtyRoutes: ["Everest Base Camp", "Namche Bazaar", "Tengboche Monastery"],
    paceLabel: "Steady & Calm", paceColor: "#803050",
    languages: ["English", "Nepali"],
    personality: { social: 3, pace: 2, cultural: 4, photography: 3, adventure: 3 },
    reviewSnippets: [
      { author: "Anna T.", text: "Sita's calm energy got me through the hardest morning of the trek. I wouldn't have made it without her." },
      { author: "Derek F.", text: "She was kind, knowledgeable, and genuinely present. The kind of guide you stay in touch with after." },
    ],
  },
];

const GROUP_TRIPS = [
  { id: 1, route: "Everest Base Camp", dates: "Mar 15 – Mar 27", joined: 4, min: 3, max: 8, price: 38, status: "open", emoji: "🏔️", bg: "linear-gradient(135deg, #2D5016, #4A7C30)", guide: "Pemba" },
  { id: 2, route: "Annapurna Circuit", dates: "Apr 2 – Apr 18", joined: 2, min: 3, max: 6, price: 32, status: "below_min", emoji: "🌄", bg: "linear-gradient(135deg, #5C3D1E, #8B6535)", guide: "Dawa" },
  { id: 3, route: "Langtang Valley", dates: "Apr 10 – Apr 19", joined: 6, min: 3, max: 6, price: 35, status: "full", emoji: "🌿", bg: "linear-gradient(135deg, #1A3A4A, #2E6080)", guide: "Norbu" },
  { id: 4, route: "Manaslu Circuit", dates: "May 5 – May 19", joined: 1, min: 4, max: 8, price: 42, status: "below_min", emoji: "🧭", bg: "linear-gradient(135deg, #3A2A10, #6B5020)", guide: "Pemba" },
];

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const Wordmark = ({ light }) => (
  <span style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px", color: light ? C.white : C.textPrimary }}>
    Guide<span style={{ color: light ? "#7BC67E" : C.green }}>Match</span>
  </span>
);

const StatusBar = ({ light }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 28px 6px", fontSize: 12, fontWeight: 600, color: light ? "rgba(255,255,255,0.9)" : C.textPrimary, fontFamily: F.body }}>
    <span>9:41</span>
    <div style={{ width: 120, height: 14, background: light ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.1)", borderRadius: 20 }} />
    <span>◼◼◼</span>
  </div>
);

const Btn = ({ children, onClick, ghost, small, disabled, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{
    width: ghost ? "auto" : "100%",
    padding: small ? "10px 20px" : "16px",
    background: ghost ? "transparent" : disabled ? "#ccc" : C.green,
    color: ghost ? C.textMid : C.white,
    border: ghost ? `1.5px solid ${C.surface}` : "none",
    borderRadius: ghost ? 999 : 16,
    fontSize: small ? 14 : 16,
    fontWeight: 600,
    fontFamily: F.body,
    cursor: disabled ? "not-allowed" : "pointer",
    letterSpacing: "0.1px",
    ...style,
  }}>
    {children}
  </button>
);

const Chip = ({ label, selected, onSelect, accent }) => (
  <button onClick={onSelect} style={{
    padding: "9px 16px",
    borderRadius: 999,
    background: selected ? (accent ? C.orange : C.green) : C.surface,
    color: selected ? C.white : C.textPrimary,
    border: "none",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: F.body,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.18s",
  }}>
    {label}
  </button>
);

const GInput = ({ label, value, onChange, placeholder, multiline }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ fontSize: 12, fontWeight: 600, color: C.textMid, marginBottom: 6, fontFamily: F.body, textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
    {multiline
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.surface}`, background: C.white, fontSize: 14, fontFamily: F.body, resize: "none", outline: "none", color: C.textPrimary, boxSizing: "border-box" }} />
      : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.surface}`, background: C.white, fontSize: 14, fontFamily: F.body, outline: "none", color: C.textPrimary, boxSizing: "border-box" }} />
    }
  </div>
);

const UploadTile = ({ icon, label, sublabel, uploaded }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: C.white, borderRadius: 14, border: `1.5px solid ${uploaded ? C.greenMid : C.surface}`, marginBottom: 10 }}>
    <span style={{ fontSize: 22 }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, fontFamily: F.body }}>{label}</div>
      <div style={{ fontSize: 12, color: C.textMuted, fontFamily: F.body }}>{sublabel}</div>
    </div>
    <div style={{ width: 28, height: 28, borderRadius: 999, background: uploaded ? C.green : C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
      {uploaded ? "✓" : "+"}
    </div>
  </div>
);

const ProgressDots = ({ total, current }) => (
  <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{ height: 6, width: i === current ? 20 : 6, borderRadius: 999, background: i <= current ? C.green : C.surface, transition: "all 0.3s" }} />
    ))}
  </div>
);

const TopBar = ({ onBack, light, setScreen }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 20px 12px", position: "relative" }}>
      <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 999, background: light ? "rgba(255,255,255,0.2)" : C.surface, border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
        ←
      </button>
      <Wordmark light={light} />
      <button onClick={() => setMenuOpen(o => !o)} style={{ width: 36, height: 36, borderRadius: 999, background: light ? "rgba(255,255,255,0.2)" : C.surface, border: "none", cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" }}>
        ···
      </button>
      {menuOpen && (
        <div style={{ position: "absolute", top: 52, right: 16, background: C.white, borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 200, minWidth: 180, overflow: "hidden" }}>
          {[
            { icon: "🧭", label: "Become a guide", action: () => { setMenuOpen(false); setScreen && setScreen("waitlist"); } },
            { icon: "❓", label: "Help & support", action: () => setMenuOpen(false) },
            { icon: "🔒", label: "Privacy", action: () => setMenuOpen(false) },
            { icon: "🚪", label: "Log out", action: () => setMenuOpen(false) },
          ].map((item, i, arr) => (
            <button key={item.label} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 18px", background: "none", border: "none", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer", fontFamily: F.body, fontSize: 14, color: item.label === "Log out" ? "#e05252" : C.textPrimary, textAlign: "left" }}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const BottomNav = ({ active, setScreen }) => {
  const tabs = [
    { key: "home",      icon: "🏠", label: "Home" },
    { key: "swipe",     icon: "🔍", label: "Browse" },
    { key: "messages",  icon: "💬", label: "Messages" },
    { key: "favorites", icon: "🤍", label: "Favorites" },
    { key: "profile",   icon: "👤", label: "Profile" },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", zIndex: 100 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => setScreen(t.key)} style={{ flex: 1, padding: "10px 0 14px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <span style={{ fontSize: 20, filter: active === t.key ? "none" : "grayscale(1) opacity(0.4)" }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: 600, fontFamily: F.body, color: active === t.key ? C.green : C.textMuted }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

const VerifiedBadge = () => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: C.greenTint, color: C.green, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, fontFamily: F.body }}>
    ✓ Verified
  </span>
);

// ─── SCREENS ─────────────────────────────────────────────────────────────────

// S1: Welcome
const S1Welcome = ({ setScreen }) => {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: C.green, position: "relative", overflow: "hidden" }}>

      {/* Mountain illustration */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", overflow: "hidden" }}>
        <svg viewBox="0 0 390 480" style={{ width: "100%", height: "100%", display: "block" }}>
          <polygon points="0,480 80,180 160,320 240,80 320,260 390,140 390,480" fill="rgba(0,0,0,0.15)" />
          <polygon points="0,480 60,260 130,360 200,140 280,300 350,200 390,240 390,480" fill="rgba(0,0,0,0.12)" />
          <polygon points="0,480 40,320 100,420 180,240 250,360 320,280 390,320 390,480" fill="rgba(255,255,255,0.04)" />
          <polygon points="0,480 200,200 390,350 390,480" fill="rgba(0,0,0,0.25)" />
          {/* Snow caps */}
          <polygon points="200,200 185,230 215,230" fill="rgba(255,255,255,0.5)" />
          <polygon points="80,180 68,205 92,205" fill="rgba(255,255,255,0.35)" />
          <polygon points="320,260 308,285 332,285" fill="rgba(255,255,255,0.3)" />
        </svg>
      </div>
      {/* Stars */}
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{ position: "absolute", width: 2, height: 2, borderRadius: "50%", background: "rgba(255,255,255,0.6)", top: `${8 + Math.random() * 30}%`, left: `${Math.random() * 100}%` }} />
      ))}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 32px", position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 8 }}>
          <Wordmark light />
        </div>
        <h1 style={{ fontFamily: F.display, fontSize: 34, fontWeight: 700, color: C.white, lineHeight: 1.2, margin: "16px 0 12px" }}>
          Find your guide. Find your way.
        </h1>
        <p style={{ fontFamily: F.body, fontSize: 15, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
          Verified local guides matched to your travel style, pace, and adventure.
        </p>
      </div>
      <div style={{ padding: "0 24px 48px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <Btn onClick={() => setScreen("destination")}>Start Matching</Btn>
        <Btn ghost onClick={() => setScreen("waitlist")} style={{ color: "rgba(255,255,255,0.8)", border: "1.5px solid rgba(255,255,255,0.25)" }}>I'm a guide — apply here</Btn>
      </div>
    </div>
  );
};

// S4: Destination
const S4Destination = ({ setScreen }) => {
  const destinations = [
    { name: "Nepal", emoji: "🏔️", available: true, subtitle: "Himalayan treks & cultural journeys" },
    { name: "Peru", emoji: "🦙", available: false, subtitle: "Inca Trail & Machu Picchu" },
    { name: "Guatemala", emoji: "🌋", available: false, subtitle: "Volcanos, jungle & Mayan ruins" },
    { name: "Vietnam", emoji: "🛵", available: false, subtitle: "Ha Giang Loop & mountain passes" },
    { name: "Kyrgyzstan", emoji: "🏕️", available: false, subtitle: "Nomadic routes & Tian Shan peaks" },
    { name: "Tanzania", emoji: "🦁", available: false, subtitle: "Kilimanjaro & safari routes" },
    { name: "Indonesia", emoji: "🌴", available: false, subtitle: "Volcanoes, rice terraces & islands" },
  ];
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <TopBar onBack={() => setScreen("welcome")} setScreen={setScreen} />
      <div style={{ padding: "0 24px 80px" }}>
        <h2 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.textPrimary, margin: "8px 0 4px" }}>Where are you headed?</h2>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.textMuted, marginBottom: 24 }}>We'll match you with verified local guides</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {destinations.map(d => (
            <button key={d.name} onClick={() => d.available && setScreen("preferences")} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
              background: d.available ? C.white : C.surfaceLight,
              borderRadius: 20, border: `1.5px solid ${d.available ? C.greenMid : C.border}`,
              cursor: d.available ? "pointer" : "default", textAlign: "left", boxShadow: d.available ? shadowSm : "none"
            }}>
              <span style={{ fontSize: 32 }}>{d.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 16, color: d.available ? C.textPrimary : C.textMuted }}>{d.name}</div>
                <div style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted, marginTop: 2 }}>{d.subtitle}</div>
              </div>
              {d.available
                ? <span style={{ background: C.green, color: C.white, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999, fontFamily: F.body }}>Available</span>
                : <span style={{ background: C.surface, color: C.textMuted, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999, fontFamily: F.body }}>Coming soon</span>
              }
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// S_Dates: Onboarding date picker (between destination and preferences)
const SDates = ({ setScreen }) => {
  const [dateMode, setDateMode] = useState("dates");
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [hover, setHover] = useState(null);
  const [flexDuration, setFlexDuration] = useState(null);
  const [flexMonth, setFlexMonth] = useState(null);
  const [flexYear, setFlexYear] = useState(2026);
  const today = new Date(2026, 4, 16);
  const [m, setM] = useState({ y: 2026, mo: 5 });
  const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const flexDurations = ["Any dates", "Weekend", "1 week", "2 weeks", "1 month"];
  const flexMonths = ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan"];

  const handleDayClick = (y, mo, d) => {
    const k = dateKey(y, mo, d);
    if (!start || (start && end)) { setStart(k); setEnd(null); setHover(null); }
    else { const s = keyToDate(start), e = keyToDate(k); if (e < s) { setStart(k); setEnd(null); } else { setEnd(k); setHover(null); } }
  };
  const inRange = (y, mo, d) => { if (!start) return false; const endKey = end || hover; if (!endKey) return false; const s = keyToDate(start), e = keyToDate(endKey), cur = toDateObj(y, mo, d); const [lo, hi] = s <= e ? [s,e] : [e,s]; return cur > lo && cur < hi; };
  const isStart = (y, mo, d) => start && dateKey(y, mo, d) === start;
  const isEnd   = (y, mo, d) => end && dateKey(y, mo, d) === end;
  const isEndHov = (y, mo, d) => !end && hover && dateKey(y, mo, d) === hover && hover !== start;
  const nights = (!start || !end) ? 0 : Math.round((keyToDate(end) - keyToDate(start)) / 86400000);
  const fmt = k => { const d = keyToDate(k); return `${MN[d.getMonth()]} ${d.getDate()}`; };
  const dim = new Date(m.y, m.mo + 1, 0).getDate();
  const fd  = new Date(m.y, m.mo, 1).getDay();

  const dayStyle = (y, mo, d) => {
    const past = toDateObj(y, mo, d) < today;
    const iS = isStart(y,mo,d), iE = isEnd(y,mo,d), iEH = isEndHov(y,mo,d), iR = inRange(y,mo,d), cap = iS||iE||iEH;
    return { background: cap ? C.green : iR ? C.greenTint : "transparent", color: past ? C.surface : cap ? "white" : C.textPrimary, border: "none", borderRadius: iS ? "99px 0 0 99px" : (iE||iEH) ? "0 99px 99px 0" : iR ? "0" : "99px", width: "100%", aspectRatio: "1", cursor: past ? "default" : "pointer", fontSize: 13, fontWeight: cap ? 700 : 400 };
  };

  const canContinue = dateMode === "dates" ? (start && end) : (flexDuration === "Any dates" || (flexDuration && flexMonth));

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <TopBar onBack={() => setScreen("destination")} setScreen={setScreen} />
      <div style={{ padding: "0 24px 120px" }}>
        <h2 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.textPrimary, margin: "8px 0 4px" }}>When are you going?</h2>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.textMuted, marginBottom: 20 }}>Pick exact dates or stay flexible</p>

        {/* Toggle */}
        <div style={{ display:"flex", background:C.surface, borderRadius:999, padding:3, marginBottom:24 }}>
          {["dates","flexible"].map(mode => (
            <button key={mode} onClick={()=>setDateMode(mode)} style={{ flex:1, padding:"10px 0", borderRadius:999, border:"none", background:dateMode===mode?C.white:"transparent", color:dateMode===mode?C.textPrimary:C.textMuted, fontFamily:F.body, fontSize:14, fontWeight:dateMode===mode?700:500, cursor:"pointer", boxShadow:dateMode===mode?shadowSm:"none", transition:"all 0.2s" }}>
              {mode === "dates" ? "Exact dates" : "Flexible"}
            </button>
          ))}
        </div>

        {dateMode === "dates" ? (
          <div style={{ background: C.white, borderRadius: 20, padding: "20px", boxShadow: shadowSm }}>
            {/* Check in / out pills */}
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              {[{label:"Check in",val:start?fmt(start):null},{label:"Check out",val:end?fmt(end):null}].map((item,i)=>(
                <div key={i} style={{ flex:1, background:item.val?C.greenTint:C.surface, borderRadius:12, padding:"10px 14px", border:`1.5px solid ${item.val?C.green:C.surface}` }}>
                  <div style={{ fontSize:10, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:3, fontFamily:F.body }}>{item.label}</div>
                  <div style={{ fontSize:15, fontWeight:item.val?700:400, color:item.val?C.green:C.textMuted, fontFamily:F.body }}>{item.val||"—"}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize:12, color:C.textMuted, marginBottom:14, textAlign:"center", fontFamily:F.body }}>
              {!start?"Tap a start date":!end?"Now tap an end date":`${nights} night${nights!==1?"s":""} · ${fmt(start)} → ${fmt(end)}`}
            </div>
            {/* Month nav */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <button onClick={()=>setM(v=>({...v,mo:v.mo===0?11:v.mo-1}))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:C.green, padding:"0 8px" }}>‹</button>
              <span style={{ fontWeight:600, fontSize:15, color:C.textPrimary, fontFamily:F.body }}>{MN[m.mo]} {m.y}</span>
              <button onClick={()=>setM(v=>({...v,mo:v.mo===11?0:v.mo+1}))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:C.green, padding:"0 8px" }}>›</button>
            </div>
            {/* Calendar grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:0 }}>
              {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{ textAlign:"center", fontSize:11, color:C.textMuted, paddingBottom:8, fontFamily:F.body }}>{d}</div>)}
              {Array(fd).fill(null).map((_,i)=><div key={`e${i}`}/>)}
              {Array(dim).fill(null).map((_,i)=>{ const d=i+1, past=toDateObj(m.y,m.mo,d)<today; return <button key={d} disabled={past} onClick={()=>!past&&handleDayClick(m.y,m.mo,d)} onMouseEnter={()=>{if(start&&!end)setHover(dateKey(m.y,m.mo,d));}} onMouseLeave={()=>setHover(null)} style={dayStyle(m.y,m.mo,d)}>{d}</button>; })}
            </div>
            {/* Reset */}
            {(start||end) && <button onClick={()=>{setStart(null);setEnd(null);}} style={{ marginTop:14, background:"none", border:"none", cursor:"pointer", fontFamily:F.body, fontSize:13, color:C.textMuted, textDecoration:"underline", display:"block", margin:"14px auto 0" }}>Reset</button>}
          </div>
        ) : (
          <div style={{ background: C.white, borderRadius: 20, padding: 20, boxShadow: shadowSm }}>
            <div style={{ fontFamily:F.body, fontSize:12, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:12 }}>How long?</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:24 }}>
              {flexDurations.map(d => (
                <button key={d} onClick={()=>setFlexDuration(d)} style={{ padding:"10px 18px", borderRadius:999, border:`1.5px solid ${flexDuration===d?C.green:C.surface}`, background:flexDuration===d?C.greenTint:C.bg, color:flexDuration===d?C.green:C.textPrimary, fontFamily:F.body, fontSize:14, fontWeight:flexDuration===d?700:400, cursor:"pointer", transition:"all 0.18s" }}>{d}</button>
              ))}
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontFamily:F.body, fontSize:12, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.5px" }}>Which month?</div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <button onClick={()=>setFlexYear(y=>y-1)} style={{ background:C.surface, border:"none", borderRadius:999, width:28, height:28, cursor:"pointer", fontSize:14, color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
                <span style={{ fontFamily:F.body, fontSize:13, fontWeight:700, color:C.textPrimary, minWidth:36, textAlign:"center" }}>{flexYear}</span>
                <button onClick={()=>setFlexYear(y=>y+1)} style={{ background:C.surface, border:"none", borderRadius:999, width:28, height:28, cursor:"pointer", fontSize:14, color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {flexMonths.map(mo => (
                <button key={mo} onClick={()=>setFlexMonth(mo)} style={{ padding:"12px 0", borderRadius:14, border:`1.5px solid ${flexMonth===mo?C.green:C.surface}`, background:flexMonth===mo?C.greenTint:C.bg, color:flexMonth===mo?C.green:C.textPrimary, fontFamily:F.body, fontSize:14, fontWeight:flexMonth===mo?700:400, cursor:"pointer", transition:"all 0.18s", textAlign:"center" }}>{mo}</button>
              ))}
            </div>
            {flexDuration && flexMonth && (
              <div style={{ marginTop:16, background:C.greenTint, borderRadius:12, padding:"10px 14px", textAlign:"center" }}>
                <span style={{ fontFamily:F.body, fontSize:13, fontWeight:600, color:C.green }}>{flexDuration} in {flexMonth} {flexYear}</span>
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 24 }}>
          <Btn onClick={() => setScreen("preferences")} disabled={!canContinue}>
            {canContinue ? "Set my preferences →" : "Select dates to continue"}
          </Btn>
        </div>
      </div>
    </div>
  );
};

// S5: Preferences
const S5Preferences = ({ setScreen }) => {
  const [focus, setFocus] = useState([]);
  const [activities, setActivities] = useState([]);
  const [style, setStyle] = useState(2);
  const [pace, setPace] = useState(2);
  const [as_, setAs] = useState(null);
  const [gender, setGender] = useState(null);
  const [familyModal, setFamilyModal] = useState(false);
  const [numKids, setNumKids] = useState(1);
  const [kidAges, setKidAges] = useState([]);

  const focusOpts = ["📸 Photography", "🏛️ Culture", "🍜 Food", "🌱 Botanical", "🦁 Wildlife", "🏛️ History"];
  const activityOpts = ["🏔️ Trekking", "⛰️ Mountaineering", "🏍️ Motorcycle tour", "🦁 Safari", "🪂 Paragliding"];
  const styleOpts = ["Talkative", "Quiet", "Mix of both"];
  const paceOpts = ["Slow & immersive", "Steady & focused", "Efficient & fast"];
  const asOpts = ["Solo", "Couple", "Friends", "Family"];
  const genderOpts = ["No preference", "Female guide", "Male guide"];
  const ageRanges = ["Under 5", "5–8", "9–12", "Teen (13–17)"];

  const toggleFocus = (v) => setFocus(f => f.includes(v) ? f.filter(x => x !== v) : [...f, v]);
  const toggleActivity = (v) => setActivities(a => a.includes(v) ? a.filter(x => x !== v) : [...a, v]);
  const canContinue = true;

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <TopBar onBack={() => setScreen("destination")} setScreen={setScreen} />
      <div style={{ padding: "0 24px 120px" }}>
        <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, margin: "8px 0 4px", color: C.textPrimary }}>Your travel style</h2>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.textMuted, marginBottom: 24 }}>Help us find your ideal match</p>

        {/* Travel focus */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Travel focus</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {focusOpts.map(o => (
              <Chip key={o} label={o} selected={focus.includes(o)} onSelect={() => toggleFocus(o)} />
            ))}
          </div>
        </div>

        {/* Activities */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Activities</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {activityOpts.map(o => (
              <Chip key={o} label={o} selected={activities.includes(o)} onSelect={() => toggleActivity(o)} />
            ))}
          </div>
        </div>

        {/* Guide style — sliding scale */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>Guide style</div>
          <div style={{ background: C.white, borderRadius: 16, padding: "18px 20px", boxShadow: shadowSm }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontFamily: F.body, fontSize: 13, color: C.textMid }}>🤫 Quiet</span>
              <span style={{ fontFamily: F.body, fontSize: 13, color: C.textMid }}>Talkative 💬</span>
            </div>
            <input type="range" min={0} max={4} value={style ?? 2} onChange={e => setStyle(Number(e.target.value))}
              style={{ width: "100%", accentColor: C.green, height: 4, cursor: "pointer" }} />
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.green }}>
                {["Peaceful presence", "Chat when it flows naturally", "Mix of both", "Pretty chatty", "Outgoing and social"][style ?? 2]}
              </span>
            </div>
          </div>
        </div>

        {/* Your pace — sliding scale */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.5px" }}>Your pace</div>
          <div style={{ background: C.white, borderRadius: 16, padding: "18px 20px", boxShadow: shadowSm }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontFamily: F.body, fontSize: 13, color: C.textMid }}>🐢 Slow</span>
              <span style={{ fontFamily: F.body, fontSize: 13, color: C.textMid }}>Fast 🏃</span>
            </div>
            <input type="range" min={0} max={4} value={pace ?? 2} onChange={e => setPace(Number(e.target.value))}
              style={{ width: "100%", accentColor: C.green, height: 4, cursor: "pointer" }} />
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <span style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.green }}>
                {["Very slow & immersive", "Relaxed pace", "Steady & focused", "Brisk pace", "Efficient & fast"][pace ?? 2]}
              </span>
            </div>
          </div>
        </div>

        {/* Travelling as */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Travelling as</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {asOpts.map(o => (
              <Chip key={o} label={o} selected={as_ === o} onSelect={() => {
                setAs(o);
                if (o === "Family") setFamilyModal(true);
              }} />
            ))}
          </div>
          {/* Family summary pill */}
          {as_ === "Family" && (
            <button onClick={() => setFamilyModal(true)} style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, background: C.greenTint, border: `1.5px solid ${C.green}`, borderRadius: 12, padding: "8px 14px", cursor: "pointer" }}>
              <span style={{ fontSize: 14 }}>👨‍👩‍👧</span>
              <span style={{ fontFamily: F.body, fontSize: 13, color: C.green, fontWeight: 600 }}>{numKids} child{numKids > 1 ? "ren" : ""}{kidAges.length > 0 ? " · " + kidAges.join(", ") : ""}</span>
              <span style={{ fontFamily: F.body, fontSize: 12, color: C.green }}>Edit →</span>
            </button>
          )}
        </div>

        {/* Guide gender preference */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.textMid, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>Guide gender preference</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {genderOpts.map(o => <Chip key={o} label={o} selected={gender === o} onSelect={() => setGender(o)} />)}
          </div>
        </div>

        <Btn onClick={() => setScreen("finding")}>Find My Match</Btn>
      </div>

      {/* Family modal */}
      {familyModal && (
        <div onClick={() => setFamilyModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(27,27,27,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.bg, borderRadius: "24px 24px 0 0", padding: "24px 24px 48px", width: "100%", maxWidth: 480, boxShadow: "0 -8px 40px rgba(0,0,0,0.14)" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, borderRadius: 999, background: C.surface }} />
            </div>
            <h3 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: "0 0 20px" }}>Travelling with kids</h3>

            {/* Number of children */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Number of children</div>
              <div style={{ display: "flex", alignItems: "center", gap: 20, background: C.white, borderRadius: 14, padding: "14px 18px" }}>
                <button onClick={() => setNumKids(n => Math.max(1, n - 1))} style={{ width: 34, height: 34, borderRadius: 999, background: C.surface, border: "none", cursor: "pointer", fontSize: 20, color: C.green, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.textPrimary, flex: 1, textAlign: "center" }}>{numKids}</span>
                <button onClick={() => setNumKids(n => Math.min(6, n + 1))} style={{ width: 34, height: 34, borderRadius: 999, background: C.surface, border: "none", cursor: "pointer", fontSize: 20, color: C.green, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
            </div>

            {/* Age range */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Age range</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {ageRanges.map(r => (
                  <button key={r} onClick={() => setKidAges(a => a.includes(r) ? a.filter(x => x !== r) : [...a, r])} style={{ padding: "9px 16px", borderRadius: 999, border: "none", background: kidAges.includes(r) ? C.green : C.surface, color: kidAges.includes(r) ? C.white : C.textPrimary, fontFamily: F.body, fontSize: 13, fontWeight: 500, cursor: "pointer" }}>{r}</button>
                ))}
              </div>
            </div>

            <Btn onClick={() => setFamilyModal(false)}>Save</Btn>
          </div>
        </div>
      )}
    </div>
  );
};

// S6: Finding
const S6Finding = ({ setScreen }) => {
  const [checkedCount, setCheckedCount] = useState(0);

  const steps = [
    "Finding guides nearby",
    "Checking certifications",
    "Comparing travel styles",
    "Looking for shared interests",
    "Calculating compatibility",
  ];

  useEffect(() => {
    // Check off one item every 900ms
    const iv = setInterval(() => {
      setCheckedCount(c => {
        if (c >= steps.length) {
          clearInterval(iv);
          setTimeout(() => setScreen("home"), 700);
          return c;
        }
        return c + 1;
      });
    }, 900);
    return () => clearInterval(iv);
  }, []);

  const progress = Math.round((checkedCount / steps.length) * 100);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.green, padding: "32px 40px" }}>
      <div style={{ width: "100%", maxWidth: 340 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>🧭</div>
          <h2 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.white, margin: "0 0 8px", lineHeight: 1.2 }}>Building your adventure…</h2>
          <p style={{ fontFamily: F.body, fontSize: 14, color: "rgba(255,255,255,0.65)", margin: 0 }}>Matching you with the right guide</p>
        </div>

        {/* Checklist */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
          {steps.map((step, i) => {
            const done = i < checkedCount;
            const active = i === checkedCount;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, opacity: done || active ? 1 : 0.35, transition: "opacity 0.4s" }}>
                {/* Checkbox */}
                <div style={{
                  width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                  background: done ? "rgba(255,255,255,0.95)" : "transparent",
                  border: `2px solid ${done ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.45)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: done ? "scale(1.05)" : "scale(1)",
                }}>
                  {done && <span style={{ fontSize: 13, color: C.green, fontWeight: 800, lineHeight: 1 }}>✓</span>}
                </div>
                {/* Label */}
                <span style={{
                  fontFamily: F.body, fontSize: 15,
                  fontWeight: done ? 600 : 400,
                  color: done ? "rgba(255,255,255,1)" : active ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.55)",
                  transition: "all 0.3s",
                }}>
                  {step}
                  {active && <span style={{ display: "inline-block", animation: "ellipsis 1.2s infinite", marginLeft: 2 }}>…</span>}
                </span>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", background: C.white, borderRadius: 999, width: `${progress}%`, transition: "width 0.6s ease" }} />
        </div>
      </div>
      <style>{`
        @keyframes ellipsis {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

// Home Screen

// ── SearchBar — Airbnb-style expandable search ───────────────────────────────
const SearchBar = ({ setScreen }) => {
  const [expanded, setExpanded] = useState(false);
  const [where, setWhere] = useState("");
  const [activeField, setActiveField] = useState("where"); // "where" | "when" | "who"
  const [guests, setGuests] = useState(1);
  const [selStart, setSelStart] = useState(null);
  const [selEnd, setSelEnd] = useState(null);
  const [calHover, setCalHover] = useState(null);
  const [calM, setCalM] = useState({ y: 2026, mo: 5 });
  const MN2 = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const recent = [
    { dest: "Kathmandu, Nepal", dates: "Jun 3 – Jun 18", guests: 1 },
    { dest: "Pokhara, Nepal", dates: "Jul 10 – Jul 24", guests: 2 },
  ];
  const today2 = new Date(2026, 4, 28);
  const fmt2 = k => { const d = keyToDate(k); return `${MN2[d.getMonth()]} ${d.getDate()}`; };
  const calDim = new Date(calM.y, calM.mo + 1, 0).getDate();
  const calFd = new Date(calM.y, calM.mo, 1).getDay();
  const handleCalDay = (y, mo, d) => {
    const k = dateKey(y, mo, d);
    if (!selStart || (selStart && selEnd)) { setSelStart(k); setSelEnd(null); setCalHover(null); }
    else { const s = keyToDate(selStart), e = keyToDate(k); if (e < s) { setSelStart(k); setSelEnd(null); } else { setSelEnd(k); setCalHover(null); } }
  };
  const calInRange = (y, mo, d) => { if (!selStart) return false; const ek = selEnd || calHover; if (!ek) return false; const s = keyToDate(selStart), e = keyToDate(ek), cur = toDateObj(y, mo, d); const [lo,hi] = s<=e?[s,e]:[e,s]; return cur>lo&&cur<hi; };
  const calIsStart = (y,mo,d) => selStart && dateKey(y,mo,d)===selStart;
  const calIsEnd   = (y,mo,d) => selEnd   && dateKey(y,mo,d)===selEnd;
  const calIsEH    = (y,mo,d) => !selEnd && calHover && dateKey(y,mo,d)===calHover && calHover!==selStart;
  const calDayStyle = (y,mo,d) => {
    const past = toDateObj(y,mo,d) < today2;
    const iS=calIsStart(y,mo,d), iE=calIsEnd(y,mo,d), iEH=calIsEH(y,mo,d), iR=calInRange(y,mo,d), cap=iS||iE||iEH;
    return { background: cap?C.green:iR?C.greenTint:"transparent", color: past?C.surface:cap?"white":C.textPrimary, border:"none", borderRadius: iS?"99px 0 0 99px":(iE||iEH)?"0 99px 99px 0":iR?"0":"99px", width:"100%", aspectRatio:"1", cursor:past?"default":"pointer", fontSize:12, fontWeight:cap?700:400 };
  };
  const calNights = (!selStart||!selEnd)?0:Math.round((keyToDate(selEnd)-keyToDate(selStart))/86400000);
  const shortcuts = [
    { label: "Today", sub: "May 28" },
    { label: "Tomorrow", sub: "May 29" },
    { label: "This weekend", sub: "May 29 – 31" },
  ];

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)} style={{
        display: "flex", alignItems: "center", gap: 12,
        background: C.white, borderRadius: 999,
        padding: "10px 16px",
        boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
        border: `1px solid ${C.border}`,
        cursor: "pointer", textAlign: "left", width: "100%",
      }}>
        <span style={{ fontSize: 16 }}>🔍</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.textPrimary }}>Nepal</div>
          <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted }}>Any dates · Any guide</div>
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={() => setExpanded(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }} />
      {/* Expanded panel */}
      <div style={{ position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: C.bg, zIndex: 201, borderRadius: "0 0 24px 24px", boxShadow: "0 8px 32px rgba(0,0,0,0.14)", paddingBottom: 24 }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px" }}>
          <button onClick={() => setExpanded(false)} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, color: C.textMid }}>← Back</button>
          <Wordmark />
          <button onClick={() => { setWhere(""); setGuests(1); }} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, color: C.textMuted }}>Clear all</button>
        </div>

        {/* Where field */}
        <div style={{ margin: "0 16px 8px" }}>
          <div onClick={() => setActiveField("where")} style={{ background: C.white, borderRadius: 16, padding: "14px 16px", boxShadow: activeField==="where" ? "0 4px 20px rgba(0,0,0,0.12)" : shadowSm, border: activeField==="where" ? `2px solid ${C.textPrimary}` : `1px solid ${C.border}`, cursor: "pointer" }}>
            <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>Where?</div>
            {activeField === "where" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span>🔍</span>
                <input autoFocus value={where} onChange={e => setWhere(e.target.value)} placeholder="Search destinations" style={{ border: "none", background: "none", outline: "none", fontFamily: F.body, fontSize: 15, color: C.textPrimary, flex: 1 }} />
                {where && <button onClick={() => setWhere("")} style={{ background: C.surface, border: "none", borderRadius: "50%", width: 22, height: 22, cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>}
              </div>
            ) : (
              <div style={{ fontFamily: F.body, fontSize: 15, color: where ? C.textPrimary : C.textMuted }}>{where || "Anywhere"}</div>
            )}
          </div>
        </div>

        {/* When + Who — collapsed row when not active */}
        {activeField !== "when" && (
          <div style={{ display: "flex", gap: 8, margin: "0 16px 16px" }}>
            <div onClick={() => setActiveField("when")} style={{ flex: 1, background: C.white, borderRadius: 16, padding: "14px 16px", boxShadow: shadowSm, border: `1px solid ${C.border}`, cursor: "pointer" }}>
              <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>When?</div>
              <div style={{ fontFamily: F.body, fontSize: 14, color: selStart && selEnd ? C.textPrimary : C.textMuted }}>
                {selStart && selEnd ? `${fmt2(selStart)} – ${fmt2(selEnd)}` : "Any dates"}
              </div>
            </div>
            <div onClick={() => setActiveField("who")} style={{ flex: 1, background: C.white, borderRadius: 16, padding: "14px 16px", boxShadow: shadowSm, border: activeField==="who" ? `2px solid ${C.textPrimary}` : `1px solid ${C.border}`, cursor: "pointer" }}>
              <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Who?</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: F.body, fontSize: 14, color: C.textPrimary }}>{guests} traveler{guests !== 1 ? "s" : ""}</span>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button onClick={e => { e.stopPropagation(); setGuests(g => Math.max(1,g-1)); }} style={{ width: 26, height: 26, borderRadius: "50%", border: `1.5px solid ${C.border}`, background: "none", cursor: "pointer", fontFamily: F.body, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                  <button onClick={e => { e.stopPropagation(); setGuests(g => g+1); }} style={{ width: 26, height: 26, borderRadius: "50%", border: `1.5px solid ${C.border}`, background: "none", cursor: "pointer", fontFamily: F.body, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* When — expanded calendar */}
        {activeField === "when" && (
          <div style={{ margin: "0 16px 16px", background: C.white, borderRadius: 20, border: `2px solid ${C.textPrimary}`, overflow: "hidden", boxShadow: shadowSm }}>
            <div style={{ padding: "16px 16px 0" }}>
              <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>When?</div>
              {/* Shortcut chips */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                {shortcuts.map(s => (
                  <button key={s.label} style={{ flex: 1, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 12, padding: "10px 8px", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontFamily: F.body, fontSize: 13, fontWeight: 700, color: C.textPrimary }}>{s.label}</div>
                    <div style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted, marginTop: 2 }}>{s.sub}</div>
                  </button>
                ))}
              </div>
              {/* Month nav */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <button onClick={() => setCalM(v=>({...v,mo:v.mo===0?11:v.mo-1}))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:C.green, padding:"0 4px" }}>‹</button>
                <span style={{ fontWeight:700, fontSize:14, color:C.textPrimary, fontFamily:F.body }}>{MN2[calM.mo]} {calM.y}</span>
                <button onClick={() => setCalM(v=>({...v,mo:v.mo===11?0:v.mo+1}))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:C.green, padding:"0 4px" }}>›</button>
              </div>
              {/* Calendar grid */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:0, marginBottom:14 }}>
                {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{ textAlign:"center", fontSize:11, color:C.textMuted, paddingBottom:6, fontFamily:F.body }}>{d}</div>)}
                {Array(calFd).fill(null).map((_,i)=><div key={`e${i}`}/>)}
                {Array(calDim).fill(null).map((_,i)=>{ const d=i+1, past=toDateObj(calM.y,calM.mo,d)<today2; return <button key={d} disabled={past} onClick={()=>!past&&handleCalDay(calM.y,calM.mo,d)} onMouseEnter={()=>{if(selStart&&!selEnd)setCalHover(dateKey(calM.y,calM.mo,d));}} onMouseLeave={()=>setCalHover(null)} style={calDayStyle(calM.y,calM.mo,d)}>{d}</button>; })}
              </div>
              {selStart && selEnd && (
                <div style={{ textAlign:"center", fontFamily:F.body, fontSize:13, color:C.green, fontWeight:600, marginBottom:10 }}>
                  {calNights} night{calNights!==1?"s":""} · {fmt2(selStart)} → {fmt2(selEnd)}
                </div>
              )}
            </div>
            {/* Reset / Next */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderTop:`1px solid ${C.border}` }}>
              <button onClick={() => { setSelStart(null); setSelEnd(null); }} style={{ fontFamily:F.body, fontSize:14, color:C.textMid, background:"none", border:"none", cursor:"pointer", textDecoration:"underline" }}>Reset</button>
              <button onClick={() => setActiveField("who")} style={{ background: selStart&&selEnd?C.green:"#C5BDB0", color:C.white, border:"none", borderRadius:12, padding:"10px 22px", fontFamily:F.body, fontSize:14, fontWeight:700, cursor:selStart&&selEnd?"pointer":"default" }}>Next</button>
            </div>
          </div>
        )}

        {/* Recent searches */}
        {activeField === "where" && (
          <div style={{ padding: "0 16px" }}>
            {/* Current location */}
            <button onClick={() => { setWhere("Current location"); setActiveField("when"); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 0", background: "none", border: "none", borderBottom: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>📍</div>
              <div>
                <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.textPrimary }}>Use current location</div>
                <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted }}>Find guides near you</div>
              </div>
            </button>
            <div style={{ fontFamily: F.body, fontSize: 13, fontWeight: 600, color: C.textPrimary, margin: "14px 0 10px" }}>Suggested destinations</div>
            {[
              { dest: "Kathmandu, Nepal", sub: "For Himalayan treks & culture", emoji: "🏔️" },
              { dest: "Pokhara, Nepal", sub: "Gateway to Annapurna", emoji: "🌄" },
              { dest: "Namche Bazaar, Nepal", sub: "EBC trekking hub", emoji: "⛺" },
              { dest: "Ha Giang, Vietnam", sub: "For the legendary Loop", emoji: "🛵" },
            ].filter(s => !where || s.dest.toLowerCase().includes(where.toLowerCase()))
             .map((s, i, arr) => (
              <button key={i} onClick={() => { setWhere(s.dest); setActiveField("when"); }} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 0", background: "none", border: "none", borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{s.emoji}</div>
                <div>
                  <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 14, color: C.textPrimary }}>{s.dest}</div>
                  <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted }}>{s.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Search button */}
        <div style={{ padding: "16px 16px 0", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => { setExpanded(false); }} style={{ background: C.green, color: C.white, border: "none", borderRadius: 14, padding: "14px 28px", fontFamily: F.body, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            🔍 Search
          </button>
        </div>
      </div>
    </>
  );
};

const HomeScreen = ({ setScreen, setActiveGuide }) => {
  const featured = GUIDES[0];
  const [settingsOpen, setSettingsOpen] = useState(false);

  const menuItems = [
    { icon: "🧭", label: "Apply as a guide", action: () => { setSettingsOpen(false); setScreen("waitlist"); } },
    { icon: "⚙️", label: "Settings", action: () => setSettingsOpen(false) },
    { icon: "❓", label: "Help & support", action: () => setSettingsOpen(false) },
    { icon: "📄", label: "Terms & conditions", action: () => setSettingsOpen(false) },
    { icon: "🚪", label: "Log out", action: () => setSettingsOpen(false), danger: true },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", position: "relative" }}>
      <div style={{ paddingBottom: 80 }}>
        {/* Header — search bar + settings */}
        <div style={{ padding: "12px 16px 8px", display: "flex", alignItems: "center", gap: 10, position: "relative" }}>
          <div style={{ flex: 1 }}>
            <SearchBar setScreen={setScreen} />
          </div>
          <button
            onClick={() => setSettingsOpen(o => !o)}
            style={{ width: 44, height: 44, borderRadius: "50%", background: settingsOpen ? C.green : C.white, border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, boxShadow: shadowSm, transition: "background 0.2s" }}
          >
            {settingsOpen ? <span style={{ color: C.white, fontSize: 15, fontWeight: 700 }}>✕</span> : "⚙️"}
          </button>
          {settingsOpen && (
            <>
              <div onClick={() => setSettingsOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 99 }} />
              <div style={{ position: "absolute", top: 56, right: 16, background: C.white, borderRadius: 18, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", zIndex: 200, minWidth: 220, overflow: "hidden", border: `1px solid ${C.border}` }}>
                {menuItems.map((item, i) => (
                  <button key={item.label} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 18px", background: "none", border: "none", borderBottom: i < menuItems.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer", fontFamily: F.body, fontSize: 14, color: item.danger ? "#e05252" : C.textPrimary, textAlign: "left" }}>
                    <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Featured match */}
        <div style={{ padding: "0 24px 20px" }}>
          <div style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Your Top Match</div>
          <div onClick={() => { setActiveGuide(featured); setScreen("profile"); }} style={{ borderRadius: 24, overflow: "hidden", boxShadow: shadow, cursor: "pointer" }}>
            <div style={{ background: featured.bg, height: 200, position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 20 }}>
              <div style={{ position: "absolute", top: 16, right: 16, background: C.orange, color: C.white, fontFamily: F.body, fontSize: 13, fontWeight: 700, padding: "4px 12px", borderRadius: 999 }}>
                {featured.match}% match
              </div>
              <div style={{ fontSize: 48, marginBottom: 4 }}>{featured.emoji}</div>
              <div style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.white }}>{featured.name}</div>
              <div style={{ fontFamily: F.body, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{featured.cert} · {featured.yrs} yrs exp</div>
            </div>
            <div style={{ background: C.white, padding: 16 }}>
              <p style={{ fontFamily: F.display, fontSize: 14, fontStyle: "italic", color: C.textMid, margin: "0 0 12px" }}>{featured.vibe}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                {featured.tags.map(t => <Chip key={t} label={t} />)}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <VerifiedBadge />
                <div style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.textPrimary }}>⭐ {featured.rating} · {featured.treks} treks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Other matches */}
        <div style={{ padding: "0 24px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.5px" }}>Other Matches</div>
            <button onClick={() => setScreen("swipe")} style={{ fontFamily: F.body, fontSize: 13, color: C.green, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>See all →</button>
          </div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
            {GUIDES.slice(1).map(g => (
              <div key={g.id} onClick={() => { setActiveGuide(g); setScreen("profile"); }} style={{ minWidth: 150, borderRadius: 20, overflow: "hidden", boxShadow: shadowSm, cursor: "pointer", flexShrink: 0 }}>
                <div style={{ background: g.bg, height: 110, position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "12px" }}>
                  <div style={{ position: "absolute", top: 10, right: 10, background: C.orange, color: C.white, fontFamily: F.body, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>{g.match}%</div>
                  <span style={{ fontSize: 28 }}>{g.emoji}</span>
                </div>
                <div style={{ background: C.white, padding: "10px 12px" }}>
                  <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.textPrimary }}>{g.name} {g.gender}</div>
                  <div style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>⭐ {g.rating}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group trips teaser */}
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontFamily: F.body, fontSize: 12, fontWeight: 700, color: C.textMid, textTransform: "uppercase", letterSpacing: "0.5px" }}>Open Group Trips</div>
            <button onClick={() => setScreen("groupTrips")} style={{ fontFamily: F.body, fontSize: 13, color: C.green, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>See all →</button>
          </div>
          {GROUP_TRIPS.filter(t => t.status === "open").slice(0, 1).map(t => (
            <div key={t.id} onClick={() => setScreen("groupTrips")} style={{ borderRadius: 20, overflow: "hidden", boxShadow: shadowSm, cursor: "pointer" }}>
              <div style={{ background: t.bg, height: 80, display: "flex", alignItems: "center", padding: "0 20px", gap: 12 }}>
                <span style={{ fontSize: 28 }}>{t.emoji}</span>
                <div>
                  <div style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: C.white }}>{t.route}</div>
                  <div style={{ fontFamily: F.body, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{t.dates}</div>
                </div>
              </div>
              <div style={{ background: C.white, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontFamily: F.body, fontSize: 13, color: C.textMid }}>{t.joined}/{t.max} joined · with {t.guide}</div>
                <div style={{ fontFamily: F.body, fontSize: 14, fontWeight: 700, color: C.textPrimary }}>${t.price}/day</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="home" setScreen={setScreen} />
    </div>
  );
};


// ── Rich Guide Card system ───────────────────────────────────────────────────

// Enrich GUIDES with full card data
const GUIDE_DETAILS = {
  1: {
    age: 34,
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80",
    certLabel: "NMA Certified",
    licenseId: "NMA-2019-04872",
    licenseBody: "Nepal Mountaineering Association",
    licenseYear: 2019,
    additionalCerts: ["NATHM Trekking Guide (2016)", "Wilderness First Responder", "High-Altitude Rescue Certified"],
    languages: ["English (Fluent)", "Nepali", "Tibetan"],
    registeredAgency: "Himalayan Spirit Treks (TAAN #T-2847)",
    statement: "I grew up watching clouds wrap around Ama Dablam from my village. Every trail I lead, I try to pass on what the mountains gave me — patience, silence, and the right moment to share a story.",
    privatePrice: 85, groupPrice: 45,
    chattiness: 2, speed: 2,
    englishLevel: "Fluent",
    specialty: ["High Altitude", "Photography Stops", "Buddhist Culture"],
    funQuestions: [
      { q: "Tea or coffee at 4,000m?", a: "Always butter tea. It keeps your soul warm." },
      { q: "Best thing you've seen on trail?", a: "A snow leopard, once. I still don't fully believe it." },
    ],
    reviews: [
      { name: "Claire M.", country: "🇫🇷", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80", rating: 5, trip: "Everest Base Camp", date: "Mar 2026", text: "Pemba is the kind of guide that changes how you travel. He knew when to talk and when to let the mountains speak. I felt completely safe the entire time, even at altitude." },
      { name: "James R.", country: "🇦🇺", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80", rating: 5, trip: "Gokyo Lakes", date: "Nov 2025", text: "Best decision I made was choosing Pemba. His photography knowledge alone is worth the price — he knew every golden hour spot on the route. Incredible human." },
      { name: "Tomas H.", country: "🇩🇪", photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80", rating: 5, trip: "EBC", date: "Oct 2025", text: "He spotted AMS symptoms in me before I even noticed. Got us to lower altitude and made sure I was safe. That experience showed me why certification really matters." },
    ],
    upcoming: [
      { name: "Everest Base Camp", dates: "Jun 3 – Jun 18", min: 3, max: 6, location: "Lukla → EBC", coverPhoto: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", members: [{ name: "Sophie", age: 28, photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80" }, { name: "Marcus", age: 32, photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80" }, { name: "Yuki", age: 25, photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80" }] },
      { name: "Gokyo Lakes Loop", dates: "Jun 25 – Jul 5", min: 3, max: 4, location: "Namche → Gokyo", coverPhoto: "https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=600&q=80", members: [{ name: "Lena", age: 30, photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80" }] },
    ],
  },
  2: {
    age: 29,
    photo: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=600&q=80",
    certLabel: "NATHM Licensed",
    licenseId: "NATHM-2021-11034",
    licenseBody: "Nepal Academy of Tourism & Hotel Management",
    licenseYear: 2021,
    additionalCerts: ["TAAN Registered Guide", "Mountain First Aid (Level II)", "Leave No Trace Trainer"],
    languages: ["English (Fluent)", "Nepali", "Hindi", "Basic German"],
    registeredAgency: "Summit Seekers Nepal (TAAN #T-3391)",
    statement: "I'm your hype person, your weather interpreter, your translator with the village aunties. I've done EBC 40+ times and I'm still obsessed with it. Let's go find your version of it.",
    privatePrice: 70, groupPrice: 38,
    chattiness: 5, speed: 3,
    englishLevel: "Fluent",
    specialty: ["Annapurna Routes", "Solo Traveler Friendly", "Acclimatization Strategy"],
    funQuestions: [
      { q: "Ideal rest day activity?", a: "Playing cards at a teahouse with strangers." },
      { q: "Worst trail condition you've guided in?", a: "Whiteout near Lobuche. We made it. Obviously." },
    ],
    reviews: [
      { name: "Priya K.", country: "🇸🇬", photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&q=80", rating: 5, trip: "Annapurna Circuit", date: "Apr 2026", text: "Dawa made every single day feel like an adventure. Her energy is contagious without being exhausting. Perfect for solo travelers — I never felt alone or unsafe." },
      { name: "Leo V.", country: "🇧🇷", photo: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&q=80", rating: 5, trip: "EBC Classic", date: "Feb 2026", text: "She's done this route 40+ times and it shows — but it never felt routine. She found something new to share every day. The teahouse card games were legendary." },
      { name: "Anna B.", country: "🇸🇪", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&q=80", rating: 4, trip: "Annapurna", date: "Dec 2025", text: "Great guide, very social — which I loved. Only thing: pace was slightly faster than I expected. Communicate your ideal pace upfront and it'll be perfect." },
    ],
    upcoming: [
      { name: "Annapurna Circuit", dates: "May 28 – Jun 12", min: 4, max: 8, location: "Besisahar → Jomsom", coverPhoto: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80", members: [{ name: "James", age: 35, photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80" }, { name: "Priya", age: 27, photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&q=80" }, { name: "Tom", age: 31, photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&q=80" }, { name: "Aiko", age: 24, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80" }, { name: "Carlos", age: 29, photo: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=120&q=80" }, { name: "Freya", age: 26, photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80" }, { name: "Ben", age: 33, photo: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=120&q=80" }] },
      { name: "EBC Classic", dates: "Jul 10 – Jul 24", min: 3, max: 6, location: "Lukla → Kala Patthar", coverPhoto: "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&q=80", members: [{ name: "Lena", age: 30, photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80" }] },
    ],
  },
  3: {
    age: 38,
    photo: "https://images.unsplash.com/photo-1542178243-bc20204b769f?w=600&q=80",
    certLabel: "NATHM Senior Guide",
    licenseId: "NATHM-2009-00341",
    licenseBody: "Nepal Academy of Tourism & Hotel Management",
    licenseYear: 2009,
    additionalCerts: ["Wilderness First Responder (WFR)", "NMA High-Altitude Certified", "Conservation & Ecology (NATHM Advanced)"],
    languages: ["English (Conversational)", "Nepali", "Sherpa", "Basic French"],
    registeredAgency: "Remote Trails Nepal (TAAN #T-1156)",
    statement: "I don't talk much on trail. I let the mountains speak. But if you want to know which plant that is, or which peak, or what that distant village is called — I'll always have the answer.",
    privatePrice: 95, groupPrice: 55,
    chattiness: 1, speed: 2,
    englishLevel: "Conversational",
    specialty: ["Remote Routes", "Flora & Fauna", "Altitude Medicine"],
    funQuestions: [
      { q: "One thing travelers always underestimate?", a: "How much silence changes you." },
      { q: "Favorite season to guide?", a: "Post-monsoon. The air is washed clean and the light is unreal." },
    ],
    reviews: [
      { name: "Sarah T.", country: "🇺🇸", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80", rating: 5, trip: "Langtang Valley", date: "Apr 2026", text: "Norbu is quietly extraordinary. He doesn't perform — he just guides. By day 3 I realized he'd been teaching me the entire time through small moments and silences." },
      { name: "Marc D.", country: "🇨🇭", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80", rating: 5, trip: "Langtang", date: "Mar 2026", text: "18 years of experience shows in everything. His plant and bird knowledge is encyclopedic. I came for a hike and left with a completely different relationship to nature." },
      { name: "Yuki N.", country: "🇯🇵", photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80", rating: 5, trip: "Langtang Circuit", date: "Nov 2025", text: "Exactly the right guide for someone who wants quiet reflection. He understood me without me having to explain myself. Rare quality." },
    ],
    upcoming: [
      { name: "Langtang Valley", dates: "Jun 8 – Jun 22", min: 3, max: 4, location: "Syabrubesi → Kyanjin", coverPhoto: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80", members: [{ name: "Ines", age: 29, photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=120&q=80" }, { name: "Noah", age: 36, photo: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=120&q=80" }] },
    ],
  },
  4: {
    age: 32,
    photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=80",
    certLabel: "NMA Certified",
    licenseId: "NMA-2020-07291",
    licenseBody: "Nepal Mountaineering Association",
    licenseYear: 2020,
    additionalCerts: ["NATHM Trekking Guide", "Basic First Aid Certified", "Women's Safety Training"],
    languages: ["English (Fluent)", "Nepali"],
    registeredAgency: "Everest Women Treks (TAAN #T-4012)",
    statement: "I specialize in helping solo travelers — especially women — feel completely safe and at ease on multi-day treks. I pay close attention to energy, pace, and what you actually need from a day in the mountains.",
    privatePrice: 55, groupPrice: 30,
    chattiness: 3, speed: 2,
    englishLevel: "Fluent",
    specialty: ["Solo Traveler Friendly", "Spiritual Sites", "Mindful Pacing"],
    funQuestions: [
      { q: "What do you wish more travelers knew?", a: "That rest days are part of the journey, not a waste of time." },
      { q: "Most unexpected place you've found beauty?", a: "A tiny shrine behind a teahouse in Lukla, lit by one butter lamp." },
    ],
    reviews: [
      { name: "Anna T.", country: "🇩🇪", photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&q=80", rating: 5, trip: "EBC Solo", date: "Mar 2026", text: "Sita's calm energy got me through the hardest morning of the trek. I wouldn't have made it without her. She knew exactly when to push and when to let me breathe." },
      { name: "Derek F.", country: "🇨🇦", photo: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=80&q=80", rating: 5, trip: "EBC", date: "Jan 2026", text: "She was kind, knowledgeable, and genuinely present. The kind of guide you stay in touch with after the trip ends." },
    ],
    upcoming: [
      { name: "Everest Base Camp", dates: "Jul 5 – Jul 20", min: 2, max: 4, location: "Lukla → EBC", coverPhoto: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", members: [{ name: "Mia", age: 26, photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80" }] },
    ],
  },
};

const LOCATIONS = [
  { name: "Annapurna Circuit", region: "Annapurna", days: "14–21 days", priceAdj: 0, emoji: "🏔", desc: "Classic high-altitude loop through diverse landscapes and villages." },
  { name: "Langtang Valley", region: "Langtang", days: "7–10 days", priceAdj: 0, emoji: "🌿", desc: "Lush valley trekking close to Kathmandu with glacier views." },
  { name: "Everest Base Camp", region: "Khumbu", days: "12–16 days", priceAdj: 5, emoji: "⛰️", desc: "The iconic route to 5,364m. Legendary for a reason." },
  { name: "Manaslu Circuit", region: "Gorkha", days: "14–18 days", priceAdj: 10, emoji: "🗻", desc: "Remote, restricted-area circuit around the world's 8th highest peak." },
];

const DotsBar = ({ level, color }) => (
  <div style={{ display: "flex", gap: 4 }}>
    {[1,2,3,4,5].map(i => (
      <div key={i} style={{ width: 22, height: 6, borderRadius: 99, background: i <= level ? color : C.surface, transition: "background 0.2s" }} />
    ))}
  </div>
);

const toDateObj = (y, mo, d) => new Date(y, mo, d);
const dateKey = (y, mo, d) => `${y}-${String(mo+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
const keyToDate = k => { const [y,mo,d] = k.split("-").map(Number); return new Date(y, mo-1, d); };

const CalendarModal = ({ guide, det, type, onClose }) => {
  const [step, setStep] = useState("dates");
  const [dateMode, setDateMode] = useState("dates"); // "dates" | "flexible"
  const [flexDuration, setFlexDuration] = useState(null); // e.g. "1 week"
  const [flexMonth, setFlexMonth] = useState(null);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [hover, setHover] = useState(null);
  const [guests, setGuests] = useState(1);
  const [selLoc, setSelLoc] = useState(null);
  const [message, setMessage] = useState("");
  const today = new Date(2026, 4, 16);
  const [m, setM] = useState({ y: 2026, mo: 5 });
  const MN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const basePrice = type === "private" ? det.privatePrice : det.groupPrice;
  const priceAdj = selLoc && selLoc !== "suggest" ? selLoc.priceAdj : 0;
  const price = basePrice + priceAdj;

  const handleDayClick = (y, mo, d) => {
    const k = dateKey(y, mo, d);
    if (!start || (start && end)) { setStart(k); setEnd(null); setHover(null); }
    else { const s = keyToDate(start), e = keyToDate(k); if (e < s) { setStart(k); setEnd(null); } else { setEnd(k); setHover(null); } }
  };
  const inRange = (y, mo, d) => { if (!start) return false; const endKey = end || hover; if (!endKey) return false; const s = keyToDate(start), e = keyToDate(endKey), cur = toDateObj(y, mo, d); const [lo, hi] = s <= e ? [s,e] : [e,s]; return cur > lo && cur < hi; };
  const isStart = (y, mo, d) => start && dateKey(y, mo, d) === start;
  const isEnd   = (y, mo, d) => end && dateKey(y, mo, d) === end;
  const isEndHov = (y, mo, d) => !end && hover && dateKey(y, mo, d) === hover && hover !== start;
  const nights = () => (!start || !end) ? 0 : Math.round((keyToDate(end) - keyToDate(start)) / 86400000);
  const n = nights();
  const totalPrice = type === "group" ? price * guests * n : price * n;
  const fmt = k => { const d = keyToDate(k); return `${MN[d.getMonth()]} ${d.getDate()}`; };
  const dim = new Date(m.y, m.mo + 1, 0).getDate();
  const fd  = new Date(m.y, m.mo, 1).getDay();

  const dayStyle = (y, mo, d) => {
    const past = toDateObj(y, mo, d) < today;
    const iS = isStart(y,mo,d), iE = isEnd(y,mo,d), iEH = isEndHov(y,mo,d), iR = inRange(y,mo,d), cap = iS||iE||iEH;
    return { background: cap ? C.green : iR ? C.greenTint : "transparent", color: past ? C.surface : cap ? "white" : C.textPrimary, border: "none", borderRadius: iS ? "99px 0 0 99px" : (iE||iEH) ? "0 99px 99px 0" : iR ? "0" : "99px", width: "100%", aspectRatio: "1", cursor: past ? "default" : "pointer", fontSize: 13, fontWeight: cap ? 700 : 400 };
  };

  const flexDurations = ["Any dates", "Weekend", "1 week", "2 weeks", "1 month"];
  const flexMonths = ["Jun","Jul","Aug","Sep","Oct","Nov","Dec","Jan"];
  const flexReady = flexDuration && flexMonth;
  const datesReady = start && end;
  const canProceed = dateMode === "dates" ? datesReady : flexReady;

  const StepDates = () => (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
        <div>
          <div style={{ fontSize:11, color: C.textMuted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:4, fontFamily: F.body }}>{type==="private"?"Private trip · Step 1 of 2":"Group tour · Step 1 of 2"}</div>
          <div style={{ fontSize:21, fontWeight:700, color: C.textPrimary, fontFamily: F.display }}>When?</div>
        </div>
        <button onClick={onClose} style={{ background: C.surface, border:"none", borderRadius:99, width:36, height:36, cursor:"pointer", fontSize:15, color: C.textPrimary, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
      </div>

      {/* Dates / Flexible toggle */}
      <div style={{ display:"flex", background:C.surface, borderRadius:999, padding:3, marginBottom:20 }}>
        {["dates","flexible"].map(mode => (
          <button key={mode} onClick={()=>setDateMode(mode)} style={{ flex:1, padding:"9px 0", borderRadius:999, border:"none", background:dateMode===mode?C.white:"transparent", color:dateMode===mode?C.textPrimary:C.textMuted, fontFamily:F.body, fontSize:14, fontWeight:dateMode===mode?700:500, cursor:"pointer", boxShadow:dateMode===mode?"0 2px 8px rgba(0,0,0,0.08)":"none", transition:"all 0.2s" }}>
            {mode === "dates" ? "Exact dates" : "Flexible"}
          </button>
        ))}
      </div>

      {dateMode === "dates" ? (
        <>
          <div style={{ display:"flex", gap:8, marginBottom:18 }}>
            {[{label:"Check in",val:start?fmt(start):null},{label:"Check out",val:end?fmt(end):null}].map((item,i)=>(
              <div key={i} style={{ flex:1, background:item.val?C.greenTint:C.surface, borderRadius:14, padding:"10px 14px", border:`1.5px solid ${item.val?C.green:C.surface}`, transition:"all 0.2s" }}>
                <div style={{ fontSize:10, color: C.textMuted, letterSpacing:"0.05em", textTransform:"uppercase", marginBottom:3, fontFamily: F.body }}>{item.label}</div>
                <div style={{ fontSize:15, fontWeight:item.val?700:400, color:item.val?C.green:C.textMuted, fontFamily: F.body }}>{item.val||"—"}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize:12, color: C.textMuted, marginBottom:12, textAlign:"center", fontFamily: F.body }}>
            {!start?"Tap your start date":!end?"Now tap your end date":`${n} night${n!==1?"s":""} · ${fmt(start)} → ${fmt(end)}`}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <button onClick={()=>setM(v=>({...v,mo:v.mo===0?11:v.mo-1}))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:C.green, padding:"0 8px" }}>‹</button>
            <span style={{ fontWeight:600, fontSize:15, color: C.textPrimary, fontFamily: F.body }}>{MN[m.mo]} {m.y}</span>
            <button onClick={()=>setM(v=>({...v,mo:v.mo===11?0:v.mo+1}))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:22, color:C.green, padding:"0 8px" }}>›</button>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:0, marginBottom:18 }}>
            {["S","M","T","W","T","F","S"].map((d,i)=><div key={i} style={{ textAlign:"center", fontSize:11, color:C.textMuted, paddingBottom:8, fontFamily: F.body }}>{d}</div>)}
            {Array(fd).fill(null).map((_,i)=><div key={`e${i}`}/>)}
            {Array(dim).fill(null).map((_,i)=>{ const d=i+1, past=toDateObj(m.y,m.mo,d)<today; return <button key={d} disabled={past} onClick={()=>!past&&handleDayClick(m.y,m.mo,d)} onMouseEnter={()=>{if(start&&!end)setHover(dateKey(m.y,m.mo,d));}} onMouseLeave={()=>setHover(null)} style={dayStyle(m.y,m.mo,d)}>{d}</button>; })}
          </div>
          {start && end && type !== "group" && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, background:C.greenTint, borderRadius:14, padding:"12px 16px", border:`1px solid ${C.greenMid}` }}>
              <span style={{ fontSize:13, color:C.textMuted, fontFamily:F.body }}>${basePrice}/day × {n} night{n!==1?"s":""}</span>
              <span style={{ fontWeight:700, fontSize:18, color:C.green, fontFamily:F.display }}>${totalPrice}</span>
            </div>
          )}
        </>
      ) : (
        <>
          {/* How long? */}
          <div style={{ marginBottom:24 }}>
            <div style={{ fontFamily:F.body, fontSize:12, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:12 }}>How long?</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {flexDurations.map(d => (
                <button key={d} onClick={()=>setFlexDuration(d)} style={{ padding:"10px 18px", borderRadius:999, border:`1.5px solid ${flexDuration===d?C.green:C.surface}`, background:flexDuration===d?C.greenTint:C.white, color:flexDuration===d?C.green:C.textPrimary, fontFamily:F.body, fontSize:14, fontWeight:flexDuration===d?700:400, cursor:"pointer", transition:"all 0.18s" }}>{d}</button>
              ))}
            </div>
          </div>
          {/* Which month? */}
          <div style={{ marginBottom:24 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <div style={{ fontFamily:F.body, fontSize:12, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.5px" }}>Which month?</div>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <button onClick={()=>setFlexYear(y=>y-1)} style={{ background:C.surface, border:"none", borderRadius:999, width:28, height:28, cursor:"pointer", fontSize:14, color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>‹</button>
                <span style={{ fontFamily:F.body, fontSize:13, fontWeight:700, color:C.textPrimary, minWidth:36, textAlign:"center" }}>{flexYear}</span>
                <button onClick={()=>setFlexYear(y=>y+1)} style={{ background:C.surface, border:"none", borderRadius:999, width:28, height:28, cursor:"pointer", fontSize:14, color:C.green, display:"flex", alignItems:"center", justifyContent:"center" }}>›</button>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
              {flexMonths.map(mo => (
                <button key={mo} onClick={()=>setFlexMonth(mo)} style={{ padding:"12px 0", borderRadius:14, border:`1.5px solid ${flexMonth===mo?C.green:C.surface}`, background:flexMonth===mo?C.greenTint:C.white, color:flexMonth===mo?C.green:C.textPrimary, fontFamily:F.body, fontSize:14, fontWeight:flexMonth===mo?700:400, cursor:"pointer", transition:"all 0.18s", textAlign:"center" }}>{mo}</button>
              ))}
            </div>
          </div>
          {flexReady && (
            <div style={{ background:C.greenTint, borderRadius:14, padding:"12px 16px", marginBottom:16, textAlign:"center" }}>
              <span style={{ fontFamily:F.body, fontSize:14, fontWeight:600, color:C.green }}>{flexDuration} in {flexMonth} {flexYear} · ${basePrice}/day</span>
            </div>
          )}
        </>
      )}

      {type==="group" && (
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:C.surface, borderRadius:14, padding:"12px 16px", marginBottom:14 }}>
          <span style={{ fontSize:14, color:C.textPrimary, fontFamily:F.body }}>Travelers</span>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <button onClick={()=>setGuests(g=>Math.max(1,g-1))} style={{ background:C.bg, border:"none", borderRadius:99, width:30, height:30, cursor:"pointer", fontSize:18, color:C.green, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
            <span style={{ fontWeight:600, minWidth:18, textAlign:"center", fontFamily:F.body }}>{guests}</span>
            <button onClick={()=>setGuests(g=>Math.min(8,g+1))} style={{ background:C.bg, border:"none", borderRadius:99, width:30, height:30, cursor:"pointer", fontSize:18, color:C.green, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
          </div>
        </div>
      )}
      <button onClick={()=>{ if(canProceed) setStep("location"); }} style={{ width:"100%", background:canProceed?C.green:"#C5BDB0", color:"white", border:"none", borderRadius:16, padding:"16px 0", fontSize:16, fontWeight:600, cursor:canProceed?"pointer":"default", transition:"background 0.25s", fontFamily:F.body }}>
        {canProceed ? "Choose destination →" : dateMode==="dates" ? (!start?"Select start date":"Select end date") : "Select duration & month"}
      </button>
    </>
  );

  const StepLocation = () => (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
        <div>
          <button onClick={()=>setStep("dates")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:C.green, fontWeight:600, padding:0, marginBottom:8, display:"flex", alignItems:"center", gap:4, fontFamily:F.body }}>← Back</button>
          <div style={{ fontSize:11, color:C.textMuted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:4, fontFamily:F.body }}>Group tour · Step 2 of 2</div>
          <div style={{ fontSize:21, fontWeight:700, color:C.textPrimary, fontFamily:F.display }}>Choose a destination</div>
        </div>
        <button onClick={onClose} style={{ background:C.surface, border:"none", borderRadius:99, width:36, height:36, cursor:"pointer", fontSize:15, color:C.textPrimary, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>✕</button>
      </div>
      <div style={{ fontSize:12, color:C.textMuted, marginBottom:16, fontFamily:F.body }}>{fmt(start)} – {fmt(end)} · {n} night{n!==1?"s":""} · {guests} traveler{guests>1?"s":""}</div>
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:12 }}>
        {LOCATIONS.map((loc,i)=>{ const sel=selLoc===loc; return (
          <button key={i} onClick={()=>setSelLoc(loc)} style={{ background:sel?C.greenTint:C.bg, border:`1.5px solid ${sel?C.green:C.surface}`, borderRadius:18, padding:"14px 16px", cursor:"pointer", textAlign:"left", transition:"all 0.18s" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22 }}>{loc.emoji}</span>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:sel?C.green:C.textPrimary, fontFamily:F.body }}>{loc.name}</div>
                  <div style={{ fontSize:11, color:C.textMuted, marginTop:2, fontFamily:F.body }}>{loc.region} · {loc.days}</div>
                </div>
              </div>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                {loc.priceAdj > 0 ? <div style={{ background:"#FFF3E0", borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:600, color:"#B46E14", fontFamily:F.body }}>+${loc.priceAdj}/day</div> : <div style={{ background:C.greenTint, borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:600, color:C.green, fontFamily:F.body }}>Included</div>}
                {sel && <span style={{ fontSize:16 }}>✓</span>}
              </div>
            </div>
            <div style={{ fontSize:12, color:C.textMuted, marginTop:8, marginLeft:32, fontFamily:F.body }}>{loc.desc}</div>
          </button>
        ); })}
        <button onClick={()=>{ setSelLoc("suggest"); setStep("suggest"); }} style={{ background:C.bg, border:`1.5px dashed ${C.textMuted}`, borderRadius:18, padding:"14px 16px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:22 }}>📍</span>
          <div>
            <div style={{ fontSize:14, fontWeight:600, color:C.textMuted, fontFamily:F.body }}>Suggest a location</div>
            <div style={{ fontSize:12, color:C.textMuted, marginTop:2, fontFamily:F.body }}>Have somewhere else in mind? Request approval.</div>
          </div>
        </button>
      </div>
      {selLoc && selLoc !== "suggest" && (
        <div style={{ background:C.greenTint, borderRadius:14, padding:"12px 16px", border:`1px solid ${C.greenMid}`, marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, color:C.textMuted, fontFamily:F.body }}>${price}/day × {n} nights × {guests} travelers</span>
          <span style={{ fontWeight:700, fontSize:18, color:C.green, fontFamily:F.display }}>${totalPrice}</span>
        </div>
      )}
      <button style={{ width:"100%", background:selLoc&&selLoc!=="suggest"?C.green:"#C5BDB0", color:"white", border:"none", borderRadius:16, padding:"16px 0", fontSize:16, fontWeight:600, cursor:selLoc&&selLoc!=="suggest"?"pointer":"default", fontFamily:F.body }}>
        {selLoc && selLoc!=="suggest" ? (type==="group" ? "Request group tour" : "Request tour") : "Select a destination"}
      </button>
    </>
  );

  const StepSuggest = () => (
    <>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <div>
          <button onClick={()=>{ setStep("location"); setSelLoc(null); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:C.green, fontWeight:600, padding:0, marginBottom:8, fontFamily:F.body }}>← Back</button>
          <div style={{ fontSize:21, fontWeight:700, color:C.textPrimary, fontFamily:F.display }}>Suggest a route</div>
        </div>
        <button onClick={onClose} style={{ background:C.surface, border:"none", borderRadius:99, width:36, height:36, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
      </div>
      <div style={{ marginBottom:14 }}>
        <div style={{ fontSize:12, color:C.textMuted, fontWeight:500, textTransform:"uppercase", marginBottom:8, fontFamily:F.body }}>Where do you want to go?</div>
        <input placeholder="e.g. Upper Mustang, Dolpo…" style={{ width:"100%", background:C.bg, border:`1.5px solid ${C.surface}`, borderRadius:14, padding:"13px 16px", fontSize:14, color:C.textPrimary, outline:"none", fontFamily:F.body, boxSizing:"border-box" }}/>
      </div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:12, color:C.textMuted, fontWeight:500, textTransform:"uppercase", marginBottom:8, fontFamily:F.body }}>Tell the group what you're looking for</div>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Describe your ideal experience…" rows={4} style={{ width:"100%", background:C.bg, border:`1.5px solid ${C.surface}`, borderRadius:14, padding:"13px 16px", fontSize:14, color:C.textPrimary, outline:"none", fontFamily:F.body, resize:"none", lineHeight:1.6, boxSizing:"border-box" }}/>
      </div>
      <div style={{ background:"#FFF3E0", borderRadius:14, padding:"12px 16px", border:"1px solid #F0D5A0", marginBottom:16, display:"flex", gap:10, alignItems:"flex-start" }}>
        <span style={{ fontSize:16, flexShrink:0 }}>ℹ️</span>
        <span style={{ fontSize:12, color:"#8B5E14", lineHeight:1.5, fontFamily:F.body }}>Alternative routes require guide approval. {guide.name.split(" ")[0]} will respond within 24 hours.</span>
      </div>
      <button style={{ width:"100%", background:C.orange, color:"white", border:"none", borderRadius:16, padding:"16px 0", fontSize:16, fontWeight:600, cursor:"pointer", fontFamily:F.body }}>Suggest tour</button>
    </>
  );

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(27,27,27,0.55)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.bg, borderRadius:"28px 28px 0 0", padding:"26px 22px 40px", width:"100%", maxWidth:480, boxShadow:"0 -8px 40px rgba(0,0,0,0.14)", maxHeight:"92vh", overflowY:"auto" }}>
        {step==="dates" && <StepDates/>}
        {step==="location" && <StepLocation/>}
        {step==="suggest" && <StepSuggest/>}
      </div>
    </div>
  );
};

const TourModal = ({ tour, guide, det, onClose }) => {
  const full = tour.members.length >= tour.max;
  const pending = tour.members.length < tour.min;
  const need = tour.min - tour.members.length;
  const spotsLeft = tour.max - tour.members.length;
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(27,27,27,0.6)", zIndex:300, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.bg, borderRadius:"28px 28px 0 0", width:"100%", maxWidth:480, maxHeight:"88vh", overflow:"hidden", boxShadow:"0 -8px 40px rgba(0,0,0,0.16)", display:"flex", flexDirection:"column" }}>
        <div style={{ position:"relative", height:200, flexShrink:0 }}>
          <img src={tour.coverPhoto} alt={tour.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(0,0,0,0.08),rgba(27,27,27,0.68))" }}/>
          <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.9)", border:"none", borderRadius:99, width:34, height:34, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          <div style={{ position:"absolute", bottom:16, left:20 }}>
            <div style={{ fontSize:20, fontWeight:700, color:"white", fontFamily:F.display }}>{tour.name}</div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.8)", marginTop:3, fontFamily:F.body }}>📍 {tour.location} · 🗓 {tour.dates}</div>
          </div>
        </div>
        <div style={{ overflowY:"auto", padding:"20px 20px 32px", flex:1 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <img src={det.photo} alt={guide.name} style={{ width:40, height:40, borderRadius:99, objectFit:"cover", border:`2.5px solid ${C.green}` }}/>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:C.textPrimary, fontFamily:F.body }}>Led by {guide.name}</div>
                <div style={{ fontSize:11, color:C.textMuted, fontFamily:F.body }}>{det.certLabel}</div>
              </div>
            </div>
            <div style={{ background:full?"#FFE8E8":pending?"#FFF3E0":C.greenTint, color:full?"#C0392B":pending?"#B46E14":C.green, borderRadius:99, padding:"6px 14px", fontSize:12, fontWeight:600, fontFamily:F.body }}>
              {full?"Fully booked":pending?`Needs ${need} more`:`${spotsLeft} spot${spotsLeft>1?"s":""} left`}
            </div>
          </div>
          <div style={{ marginBottom:22 }}>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:C.textMuted, marginBottom:6, fontFamily:F.body }}>
              <span>{tour.members.length} joined · min {tour.min}</span><span>{tour.max} max</span>
            </div>
            <div style={{ background:C.surface, borderRadius:99, height:6, position:"relative" }}>
              <div style={{ position:"absolute", left:`${(tour.min/tour.max)*100}%`, top:-3, width:2, height:12, background:"#B46E14", borderRadius:99, zIndex:1 }}/>
              <div style={{ width:`${(tour.members.length/tour.max)*100}%`, height:"100%", background:full?"#C0392B":pending?C.orange:C.green, borderRadius:99 }}/>
            </div>
          </div>
          <div style={{ marginBottom:24 }}>
            <div style={{ fontSize:12, color:C.textMuted, fontWeight:500, textTransform:"uppercase", marginBottom:14, fontFamily:F.body }}>Who's going · {tour.members.length}/{tour.max}</div>
            {tour.members.length === 0 ? (
              <div style={{ background:"#FFF3E0", borderRadius:16, padding:"20px", textAlign:"center", border:`1.5px dashed ${C.orange}` }}>
                <div style={{ fontSize:28, marginBottom:8 }}>⏳</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#B46E14", marginBottom:4, fontFamily:F.body }}>Pending confirmation</div>
                <div style={{ fontSize:13, color:C.textMuted, lineHeight:1.5, fontFamily:F.body }}>Needs {tour.min} travelers to run. Be first.</div>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                {tour.members.map((mem,i)=>(
                  <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    <img src={mem.photo} alt={mem.name} style={{ width:72, height:72, borderRadius:18, objectFit:"cover", border:`2px solid ${C.surface}` }}/>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:12, fontWeight:600, color:C.textPrimary, fontFamily:F.body }}>{mem.name}</div>
                      <div style={{ fontSize:11, color:C.textMuted, fontFamily:F.body }}>{mem.age} yrs</div>
                    </div>
                  </div>
                ))}
                {Array(tour.max-tour.members.length).fill(null).map((_,i)=>(
                  <div key={`e${i}`} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                    <div style={{ width:72, height:72, borderRadius:18, background:C.surface, border:`2px dashed ${C.textMuted}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:C.textMuted }}>+</div>
                    <div style={{ fontSize:11, color:C.textMuted, fontFamily:F.body }}>Open</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button style={{ flex:1, background:C.bg, border:`1.5px solid ${C.surface}`, borderRadius:16, padding:"14px 0", fontSize:14, fontWeight:600, color:C.textPrimary, cursor:"pointer", fontFamily:F.body }}>💬 Message {guide.name.split(" ")[0]}</button>
            {!full && <button style={{ flex:1, background:pending?C.orange:C.green, border:"none", borderRadius:16, padding:"14px 0", fontSize:14, fontWeight:600, color:"white", cursor:"pointer", fontFamily:F.body }}>{pending?"Join & Confirm →":"Join Trek →"}</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

const RichGuideCard = ({ guide, det, onMessage, onBookPrivate, onBookGroup, onBookTour }) => {
  const [liked, setLiked] = useState(false);
  const [modal, setModal] = useState(null);
  const openPrivate = onBookPrivate || (() => setModal("private"));
  const openGroup   = onBookGroup   || (() => setModal("group"));
  const openTour    = onBookTour    || ((t) => setModal({ tour: t }));

  return (
    <>
      {!onBookPrivate && modal === "private" && <CalendarModal guide={guide} det={det} type="private" onClose={()=>setModal(null)}/>}
      {!onBookGroup   && modal === "group"   && <CalendarModal guide={guide} det={det} type="group"   onClose={()=>setModal(null)}/>}
      {!onBookTour    && modal?.tour         && <TourModal tour={modal.tour} guide={guide} det={det}  onClose={()=>setModal(null)}/>}

      <div style={{ fontFamily: F.body }}>
        {/* Hero photo */}
        <div style={{ position:"relative", height:360, borderRadius:"20px 20px 0 0", overflow:"hidden" }}>
          <img src={det.photo} alt={guide.name} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", display:"block" }}/>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 40%,rgba(27,27,27,0.72))" }}/>
          <div style={{ position:"absolute", top:16, left:16, background:C.greenTint, borderRadius:99, padding:"6px 12px", display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ fontSize:11 }}>✓</span>
            <span style={{ fontSize:12, fontWeight:600, color:C.green }}>{det.certLabel}</span>
          </div>
          <button onClick={()=>setLiked(l=>!l)} style={{ position:"absolute", top:16, right:16, background:liked?C.green:"rgba(255,255,255,0.92)", border:"none", borderRadius:99, width:44, height:44, cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 12px rgba(0,0,0,0.12)", transition:"all 0.2s" }}>
            {liked?"💚":"🤍"}
          </button>
          <div style={{ position:"absolute", bottom:20, left:20, right:20 }}>
            <div style={{ fontSize:26, fontWeight:700, color:"white", fontFamily:F.display, lineHeight:1.1 }}>{guide.name}, <span style={{ fontWeight:400 }}>{det.age}</span></div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:6 }}>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.75)" }}>🇳🇵 {guide.location}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(0,0,0,0.35)", borderRadius:99, padding:"5px 12px" }}>
                <span style={{ color:C.orange, fontSize:14 }}>★</span>
                <span style={{ color:"white", fontWeight:700, fontSize:15 }}>{guide.rating}</span>
                <span style={{ color:"rgba(255,255,255,0.6)", fontSize:12 }}>({guide.treks} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statement */}
        <div style={{ padding:"22px 22px 0", background:C.white }}>
          <p style={{ fontSize:15, lineHeight:1.65, color:C.textPrimary, fontStyle:"italic", margin:0, borderLeft:`3px solid ${C.green}`, paddingLeft:16 }}>"{det.statement}"</p>
        </div>

        {/* Price buttons */}
        <div style={{ padding:"18px 22px 0", background:C.white, display:"flex", gap:12 }}>
          <button onClick={()=>openPrivate()} style={{ flex:1, background:C.bg, borderRadius:16, padding:"14px 16px", border:`1.5px solid ${C.green}`, cursor:"pointer", textAlign:"left" }}>
            <div style={{ fontSize:11, color:C.textMuted, marginBottom:4 }}>PRIVATE</div>
            <div style={{ fontSize:22, fontWeight:700, color:C.green, fontFamily:F.display }}>${det.privatePrice}<span style={{ fontSize:12, fontWeight:400, color:C.textMuted }}>/day</span></div>
            <div style={{ fontSize:11, color:C.green, marginTop:5, fontWeight:500 }}>Tap to book →</div>
          </button>
          <button onClick={()=>openGroup()} style={{ flex:1, background:C.bg, borderRadius:16, padding:"14px 16px", border:`1.5px solid ${C.orange}`, cursor:"pointer", textAlign:"left" }}>
            <div style={{ fontSize:11, color:C.textMuted, marginBottom:4 }}>GROUP</div>
            <div style={{ fontSize:22, fontWeight:700, color:C.orange, fontFamily:F.display }}>${det.groupPrice}<span style={{ fontSize:12, fontWeight:400, color:C.textMuted }}>/person/day</span></div>
            <div style={{ fontSize:11, color:C.orange, marginTop:5, fontWeight:500 }}>Tap to book →</div>
          </button>
        </div>

        {/* Vibe bars */}
        <div style={{ padding:"18px 22px 0", background:C.white, display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <div style={{ fontSize:12, color:C.textMuted, marginBottom:8, fontWeight:500, letterSpacing:"0.04em", textTransform:"uppercase" }}>Chattiness on trail</div>
            <DotsBar level={det.chattiness} color={C.green}/>
            <div style={{ fontSize:11, color:C.textMuted, marginTop:4 }}>{["","Quiet company","Mostly silent","Some chat","Good conversation","Never stops talking"][det.chattiness]}</div>
          </div>
          <div>
            <div style={{ fontSize:12, color:C.textMuted, marginBottom:8, fontWeight:500, letterSpacing:"0.04em", textTransform:"uppercase" }}>Hiking pace</div>
            <DotsBar level={det.speed} color={C.orange}/>
            <div style={{ fontSize:11, color:C.textMuted, marginTop:4 }}>{["","Slow & Steady","Moderate","Brisk","Power Hiker","Race Pace"][det.speed]}</div>
          </div>
        </div>

        {/* Specialty chips */}
        <div style={{ padding:"18px 22px 0", background:C.white }}>
          <div style={{ fontSize:12, color:C.textMuted, marginBottom:10, fontWeight:500, letterSpacing:"0.04em", textTransform:"uppercase" }}>Specialty</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {det.specialty.map(s=><div key={s} style={{ background:C.surface, borderRadius:99, padding:"6px 14px", fontSize:13, color:C.textPrimary, fontWeight:500 }}>{s}</div>)}
            <div style={{ background:C.greenTint, borderRadius:99, padding:"6px 14px", fontSize:13, color:C.green, fontWeight:500 }}>🗣 English: {det.englishLevel}</div>
          </div>
        </div>

        {/* Verified Credentials */}
        <div style={{ padding:"18px 22px 0", background:C.white }}>
          <div style={{ fontSize:12, color:C.textMuted, marginBottom:12, fontWeight:500, letterSpacing:"0.04em", textTransform:"uppercase" }}>Verified Credentials</div>
          <div style={{ background:C.greenTint, borderRadius:18, padding:"16px 18px", border:`1.5px solid ${C.greenMid}`, marginBottom:10 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <div style={{ width:32, height:32, borderRadius:10, background:C.green, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>🪪</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:C.green }}>Ministry of Tourism Licensed</div>
                  <div style={{ fontSize:11, color:"#3A7D52", marginTop:1 }}>{det.licenseBody}</div>
                </div>
              </div>
              <div style={{ background:C.green, borderRadius:8, padding:"3px 9px" }}><span style={{ fontSize:10, fontWeight:700, color:"white", letterSpacing:"0.04em" }}>VERIFIED</span></div>
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {[`ID: ${det.licenseId}`, `Licensed ${det.licenseYear}`, `${guide.yrs} yrs active`].map(t=>(
                <div key={t} style={{ background:"rgba(2,102,26,0.1)", borderRadius:8, padding:"5px 10px" }}><span style={{ fontSize:11, color:C.green, fontWeight:500 }}>{t}</span></div>
              ))}
            </div>
          </div>
          <div style={{ background:C.bg, borderRadius:14, padding:"12px 16px", border:`1px solid ${C.surface}`, marginBottom:10, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18 }}>🏢</span>
            <div>
              <div style={{ fontSize:11, color:C.textMuted, marginBottom:2 }}>REGISTERED AGENCY (TAAN)</div>
              <div style={{ fontSize:13, fontWeight:600, color:C.textPrimary }}>{det.registeredAgency}</div>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {det.additionalCerts.map((cert,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:C.bg, borderRadius:12, padding:"10px 14px", border:`1px solid ${C.surface}` }}>
                <span style={{ fontSize:14, flexShrink:0 }}>{i===0?"🩺":i===1?"🏔":"🌿"}</span>
                <span style={{ fontSize:13, color:C.textPrimary, fontWeight:500 }}>{cert}</span>
                <span style={{ marginLeft:"auto", fontSize:11, color:C.green, fontWeight:600 }}>✓</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop:10, background:C.bg, borderRadius:14, padding:"12px 16px", border:`1px solid ${C.surface}` }}>
            <div style={{ fontSize:11, color:C.textMuted, marginBottom:8, fontWeight:500, letterSpacing:"0.04em" }}>LANGUAGES</div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {det.languages.map((lang,i)=>(
                <div key={i} style={{ background:i===0?C.greenTint:C.surface, borderRadius:99, padding:"5px 12px", fontSize:12, color:i===0?C.green:C.textPrimary, fontWeight:i===0?600:400, border:i===0?`1px solid ${C.greenMid}`:"none" }}>{lang}</div>
              ))}
            </div>
          </div>
          <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:6, padding:"0 2px" }}>
            <span style={{ fontSize:11 }}>🔗</span>
            <span style={{ fontSize:11, color:C.textMuted }}>Verifiable via <span style={{ color:C.green, fontWeight:600 }}>Nepal Tourism Board</span> · TAAN registry</span>
          </div>
        </div>

        {/* Fun Q&A */}
        <div style={{ padding:"18px 22px 0", background:C.white }}>
          <div style={{ fontSize:12, color:C.textMuted, marginBottom:12, fontWeight:500, letterSpacing:"0.04em", textTransform:"uppercase" }}>Getting to know {guide.name.split(" ")[0]}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {det.funQuestions.map((fq,i)=>(
              <div key={i} style={{ background:C.bg, borderRadius:16, padding:"16px 18px", border:`1px solid ${C.surface}` }}>
                <div style={{ fontSize:12, color:C.textMuted, marginBottom:5 }}>{fq.q}</div>
                <div style={{ fontSize:14, color:C.textPrimary, fontWeight:500, lineHeight:1.5 }}>{fq.a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming tours */}
        <div style={{ padding:"18px 22px 0", background:C.white }}>
          <div style={{ fontSize:12, color:C.textMuted, marginBottom:12, fontWeight:500, letterSpacing:"0.04em", textTransform:"uppercase" }}>Upcoming tours</div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {det.upcoming.map((tour,i)=>{
              const pct=(tour.members.length/tour.max)*100, full=tour.members.length>=tour.max, pending=tour.members.length<tour.min, need=tour.min-tour.members.length;
              return (
                <button key={i} onClick={()=>openTour(tour)} style={{ background:C.bg, borderRadius:18, padding:0, border:`1px solid ${pending?"#E8D5B0":C.surface}`, cursor:"pointer", overflow:"hidden", textAlign:"left", width:"100%" }}>
                  <div style={{ position:"relative", height:90 }}>
                    <img src={tour.coverPhoto} alt={tour.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 15%,rgba(27,27,27,0.7))" }}/>
                    <div style={{ position:"absolute", bottom:10, left:12 }}>
                      <div style={{ fontSize:14, fontWeight:700, color:"white", fontFamily:F.display }}>{tour.name}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)" }}>📍 {tour.location}</div>
                    </div>
                    <div style={{ position:"absolute", top:10, right:10, background:full?"rgba(192,57,43,0.92)":pending?"rgba(180,110,20,0.92)":"rgba(2,102,26,0.92)", borderRadius:99, padding:"3px 10px", fontSize:11, fontWeight:600, color:"white" }}>
                      {full?"Full":pending?"Pending":`${tour.members.length}/${tour.max}`}
                    </div>
                  </div>
                  <div style={{ padding:"10px 14px 14px" }}>
                    <div style={{ fontSize:12, color:C.textMuted, marginBottom:8 }}>🗓 {tour.dates}</div>
                    <div style={{ display:"flex", alignItems:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", flex:1, gap:0 }}>
                        {tour.members.slice(0,5).map((mem,mi)=>(
                          <img key={mi} src={mem.photo} alt={mem.name} style={{ width:26, height:26, borderRadius:99, objectFit:"cover", border:"2px solid white", marginLeft:mi>0?-8:0 }}/>
                        ))}
                        {pending && <span style={{ fontSize:11, color:"#B46E14", fontWeight:500, marginLeft:tour.members.length>0?8:0 }}>⏳ Needs {need} more</span>}
                        {!pending && !full && <span style={{ fontSize:11, color:C.textMuted, marginLeft:8 }}>{tour.max-tour.members.length} spot{tour.max-tour.members.length>1?"s":""} left</span>}
                      </div>
                      <span style={{ fontSize:12, color:C.green, fontWeight:500 }}>See who's going →</span>
                    </div>
                    <div style={{ background:C.surface, borderRadius:99, height:4, marginTop:10 }}>
                      <div style={{ width:`${pct}%`, height:"100%", background:full?"#C0392B":pending?C.orange:C.green, borderRadius:99 }}/>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reviews */}
        <div style={{ padding:"18px 22px 0", background:C.white }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <div style={{ fontSize:12, color:C.textMuted, fontWeight:500, letterSpacing:"0.04em", textTransform:"uppercase" }}>Reviews</div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ color:C.orange, fontSize:16 }}>★</span>
              <span style={{ fontWeight:700, fontSize:18, color:C.textPrimary, fontFamily:F.display }}>{guide.rating}</span>
              <span style={{ fontSize:13, color:C.textMuted }}>· {guide.treks} total</span>
            </div>
          </div>
          <div style={{ background:C.bg, borderRadius:16, padding:"14px 16px", border:`1px solid ${C.surface}`, marginBottom:14, display:"flex", flexDirection:"column", gap:6 }}>
            {[5,4,3,2,1].map(star=>{
              const count=det.reviews.filter(r=>r.rating===star).length, pct=Math.round((count/det.reviews.length)*100);
              return (
                <div key={star} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, color:C.textMuted, width:14, textAlign:"right" }}>{star}</span>
                  <span style={{ color:C.orange, fontSize:11 }}>★</span>
                  <div style={{ flex:1, background:C.surface, borderRadius:99, height:5 }}>
                    <div style={{ width:`${pct}%`, height:"100%", background:C.orange, borderRadius:99 }}/>
                  </div>
                  <span style={{ fontSize:11, color:C.textMuted, width:20 }}>{count}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {det.reviews.map((rev,i)=>(
              <div key={i} style={{ background:C.bg, borderRadius:18, padding:"16px 18px", border:`1px solid ${C.surface}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <img src={rev.photo} alt={rev.name} style={{ width:36, height:36, borderRadius:99, objectFit:"cover", border:`2px solid ${C.surface}` }}/>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:C.textPrimary }}>{rev.name} {rev.country}</div>
                      <div style={{ fontSize:11, color:C.textMuted, marginTop:1 }}>{rev.trip} · {rev.date}</div>
                    </div>
                  </div>
                  <div style={{ display:"flex", gap:1 }}>{[1,2,3,4,5].map(s=><span key={s} style={{ color:s<=rev.rating?C.orange:C.surface, fontSize:12 }}>★</span>)}</div>
                </div>
                <p style={{ fontSize:13, lineHeight:1.65, color:C.textMid, margin:0 }}>{rev.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA bar */}
        <div style={{ padding:"16px 20px 24px", borderTop:`1px solid ${C.surface}`, background:C.white, display:"flex", gap:10, marginTop:18 }}>
          <button onClick={()=>setLiked(l=>!l)} style={{ flex:"0 0 auto", width:52, height:52, background:liked?C.greenTint:C.bg, border:`1.5px solid ${liked?C.green:C.surface}`, borderRadius:16, cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
            {liked?"💚":"🤍"}
          </button>
          <button onClick={onMessage} style={{ flex:1, background:C.green, border:"none", borderRadius:16, color:"white", fontSize:15, fontWeight:600, cursor:"pointer", padding:"14px 0", fontFamily:F.body }}>
            💬 Message {guide.name.split(" ")[0]}
          </button>
        </div>
      </div>
    </>
  );
};

// Swipe/Browse screen
const SwipeScreen = ({ setScreen, setActiveGuide }) => {
  const [idx, setIdx] = useState(0);
  const [activeFilter, setActiveFilter] = useState("All");
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [swipeModal, setSwipeModal] = useState(null); // lifted modal state
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const dragLocked = useRef(null); // "h" | "v" | null
  const filters = ["All", "Nepal", "Vietnam", "Africa", "Photography"];
  const guide = GUIDES[idx];
  const det = GUIDE_DETAILS[guide.id] || {};

  const goNext = () => { if (idx < GUIDES.length - 1) setIdx(i => i + 1); };
  const goPrev = () => { if (idx > 0) setIdx(i => i - 1); };

  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    dragLocked.current = null;
    setDragX(0);
  };

  const onTouchMove = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Lock direction on first significant movement
    if (!dragLocked.current) {
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 6) {
        dragLocked.current = "h";
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
        dragLocked.current = "v";
      }
    }

    if (dragLocked.current === "h") {
      e.preventDefault();
      setIsDragging(true);
      setDragX(dx);
    }
  };

  const onTouchEnd = () => {
    if (dragLocked.current === "h") {
      if (dragX < -60) goNext();
      else if (dragX > 60) goPrev();
    }
    setDragX(0);
    setIsDragging(false);
    touchStartX.current = null;
    dragLocked.current = null;
  };

  const rot = dragX * 0.03;
  const opacity = 1 - Math.abs(dragX) / 500;

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      {/* Sticky header — search bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: C.bg, boxShadow: shadowSm, padding: "12px 16px 10px" }}>
        <SearchBar setScreen={setScreen} />
        {/* Guide dot indicators */}
        <div style={{ display: "flex", gap: 5, alignItems: "center", justifyContent: "center", marginTop: 10 }}>
          {GUIDES.map((_,i) => (
            <div key={i} onClick={() => setIdx(i)} style={{ width: i===idx?22:7, height:7, borderRadius:99, background:i===idx?C.green:C.surface, transition:"all 0.3s", cursor:"pointer" }}/>
          ))}
        </div>
      </div>

      {/* Guide card — swipeable wrapper */}
      <div style={{ padding: "0 16px 100px" }}>
        {/* Swipe hint */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "0 4px" }}>
          <span style={{ fontFamily: F.body, fontSize: 12, color: idx === 0 ? "transparent" : C.textMuted }}>← {idx > 0 ? GUIDES[idx-1].name : ""}</span>
          <span style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>swipe to browse</span>
          <span style={{ fontFamily: F.body, fontSize: 12, color: idx === GUIDES.length-1 ? "transparent" : C.textMuted }}>{idx < GUIDES.length-1 ? GUIDES[idx+1].name : ""} →</span>
        </div>

        {/* Stamp overlays */}
        <div style={{ position: "relative" }}>
          {isDragging && dragLocked.current === "h" && dragX > 40 && (
            <div style={{ position: "absolute", top: 20, left: 20, zIndex: 20, background: C.greenTint, border: `2.5px solid ${C.green}`, borderRadius: 12, padding: "6px 16px", opacity: Math.min(1, (dragX-40)/60), pointerEvents: "none", transform: "rotate(-12deg)" }}>
              <span style={{ fontFamily: F.body, color: C.green, fontWeight: 700, fontSize: 15 }}>👈 Previous</span>
            </div>
          )}
          {isDragging && dragLocked.current === "h" && dragX < -40 && (
            <div style={{ position: "absolute", top: 20, right: 20, zIndex: 20, background: C.orangeTint, border: `2.5px solid ${C.orange}`, borderRadius: 12, padding: "6px 16px", opacity: Math.min(1, (-dragX-40)/60), pointerEvents: "none", transform: "rotate(12deg)" }}>
              <span style={{ fontFamily: F.body, color: C.orange, fontWeight: 700, fontSize: 15 }}>Next 👉</span>
            </div>
          )}

          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{
              background: C.white, borderRadius: 20, overflow: "hidden", boxShadow: shadow,
              transform: isDragging && dragLocked.current === "h" ? `translateX(${dragX}px) rotate(${rot}deg)` : "none",
              opacity: isDragging && dragLocked.current === "h" ? opacity : 1,
              transition: isDragging ? "none" : "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s",
              userSelect: "none",
              touchAction: "pan-y",
            }}
          >
            <RichGuideCard
              key={guide.id}
              guide={guide}
              det={det}
              onMessage={() => { setActiveGuide(guide); setScreen("profile"); }}
            />
          </div>
        </div>

        {/* Prev / Next buttons */}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button onClick={goPrev} disabled={idx===0} style={{ flex:1, padding:"14px", background:C.white, border:`1.5px solid ${C.surface}`, borderRadius:16, fontFamily:F.body, fontSize:14, cursor:idx===0?"default":"pointer", color:idx===0?C.textMuted:C.textPrimary, opacity:idx===0?0.5:1 }}>← Previous</button>
          <button onClick={goNext} disabled={idx===GUIDES.length-1} style={{ flex:1, padding:"14px", background:idx===GUIDES.length-1?C.white:C.green, border:"none", borderRadius:16, fontFamily:F.body, fontSize:14, cursor:idx===GUIDES.length-1?"default":"pointer", color:idx===GUIDES.length-1?C.textMuted:C.white, opacity:idx===GUIDES.length-1?0.5:1 }}>Next →</button>
        </div>
      </div>

      <BottomNav active="swipe" setScreen={setScreen} />

      {/* Modals lifted outside transform to avoid stacking context issues */}
      {swipeModal === "private" && <CalendarModal guide={guide} det={det} type="private" onClose={() => setSwipeModal(null)} />}
      {swipeModal === "group"   && <CalendarModal guide={guide} det={det} type="group"   onClose={() => setSwipeModal(null)} />}
      {swipeModal?.tour         && <TourModal tour={swipeModal.tour} guide={guide} det={det} onClose={() => setSwipeModal(null)} />}
    </div>
  );
};

// Guide Profile
const GuideProfile = ({ guide, setScreen }) => {
  if (!guide) return null;
  const det = GUIDE_DETAILS[guide.id] || {};
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      {/* Back button */}
      <div style={{ padding: "12px 16px 0", position: "sticky", top: 0, zIndex: 50, background: C.bg }}>
        <button onClick={() => setScreen("home")} style={{ width: 36, height: 36, borderRadius: 999, background: C.surface, border: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
      </div>
      <div style={{ padding: "0 16px 100px" }}>
        <div style={{ background: C.white, borderRadius: 20, overflow: "hidden", boxShadow: shadow }}>
          <RichGuideCard
            guide={guide}
            det={det}
            onMessage={() => setScreen("soloBooking")}
          />
        </div>
      </div>
    </div>
  );
};

// Solo Booking
const SoloBooking = ({ guide, setScreen }) => {
  const [startDay, setStartDay] = useState(null);
  const [endDay, setEndDay] = useState(null);
  const [step, setStep] = useState("calendar");

  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  const selectDay = (d) => {
    if (!startDay || (startDay && endDay)) { setStartDay(d); setEndDay(null); }
    else if (d > startDay) setEndDay(d);
    else { setStartDay(d); setEndDay(null); }
  };
  const inRange = (d) => startDay && endDay && d >= startDay && d <= endDay;
  const nights = startDay && endDay ? endDay - startDay : 0;
  const total = guide ? nights * guide.soloRate : 0;

  if (step === "confirm") return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <TopBar onBack={() => setStep("calendar")} setScreen={setScreen} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", minHeight: "70vh" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.textPrimary, marginBottom: 8 }}>Request Sent!</h2>
        <p style={{ fontFamily: F.body, fontSize: 15, color: C.textMid, marginBottom: 32, lineHeight: 1.6 }}>Your message and booking request has been sent to {guide?.name}. They'll usually respond within a few hours.</p>
        <Btn onClick={() => setScreen("home")}>Back to Home</Btn>
      </div>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      (<TopBar onBack={() => setScreen("profile")} setScreen={setScreen} />)
      <div style={{ padding: "0 20px 100px" }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: F.display, fontSize: 22, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>Choose your dates</h2>
          <p style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted }}>March 2025 · Nepal</p>
        </div>
        {/* Calendar */}
        <div style={{ background: C.white, borderRadius: 20, padding: 20, boxShadow: shadowSm, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 8 }}>
            {days.map(d => <div key={d} style={{ textAlign: "center", fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.textMuted, padding: "4px 0" }}>{d}</div>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {[...Array(2)].map((_, i) => <div key={`e${i}`} />)}
            {monthDays.map(d => {
              const isStart = d === startDay, isEnd = d === endDay;
              const inR = inRange(d);
              return (
                <button key={d} onClick={() => selectDay(d)} style={{
                  aspectRatio: "1", borderRadius: isStart || isEnd ? "50%" : inR ? 4 : "50%",
                  background: isStart || isEnd ? C.green : inR ? C.greenTint : "transparent",
                  color: isStart || isEnd ? C.white : inR ? C.green : C.textPrimary,
                  border: "none", cursor: "pointer", fontFamily: F.body, fontSize: 13, fontWeight: isStart || isEnd ? 700 : 400,
                }}>
                  {d}
                </button>
              );
            })}
          </div>
        </div>
        {nights > 0 && (
          <div style={{ background: C.white, borderRadius: 20, padding: 20, boxShadow: shadowSm, marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontFamily: F.body, fontSize: 14, color: C.textMid }}>{nights} nights × ${guide?.soloRate}/day</span>
              <span style={{ fontFamily: F.body, fontSize: 18, fontWeight: 700, color: C.textPrimary }}>${total}</span>
            </div>
            <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted }}>Payment made directly to {guide?.name}. No agency fee.</div>
          </div>
        )}
        <Btn onClick={() => setStep("confirm")} disabled={nights < 1}>
          {nights > 0 ? `Send Request · $${total}` : "Select dates to continue"}
        </Btn>
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
};

// Group Trips
const GroupTripsPage = ({ setScreen }) => {
  const [filter, setFilter] = useState("all");
  const filters = [
    { key: "all", label: "All" },
    { key: "open", label: "Open" },
    { key: "below_min", label: "Forming" },
  ];
  const filtered = filter === "all" ? GROUP_TRIPS : GROUP_TRIPS.filter(t => t.status === filter);
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <div style={{ padding: "12px 16px 0px" }}>
        <SearchBar setScreen={setScreen} />
      </div>
      <div style={{ padding: "12px 24px 16px" }}>
        <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: "0 0 4px" }}>Group Trips</h2>
        <p style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted, marginBottom: 16 }}>Join an existing group or form a new one</p>
        <div style={{ display: "flex", gap: 8 }}>
          {filters.map(f => <Chip key={f.key} label={f.label} selected={filter === f.key} onSelect={() => setFilter(f.key)} />)}
        </div>
      </div>
      <div style={{ padding: "0 20px 100px" }}>
        {filtered.map(t => {
          const statusColor = t.status === "open" ? C.green : t.status === "full" ? C.textMuted : C.orange;
          const statusLabel = t.status === "open" ? "Open" : t.status === "full" ? "Full" : "Forming";
          return (
            <div key={t.id} style={{ borderRadius: 22, overflow: "hidden", boxShadow: shadow, marginBottom: 16 }}>
              <div style={{ background: t.bg, height: 120, display: "flex", alignItems: "flex-end", padding: "0 20px 16px", position: "relative" }}>
                <div style={{ position: "absolute", top: 14, right: 14, background: statusColor, color: C.white, fontFamily: F.body, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999 }}>{statusLabel}</div>
                <div>
                  <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.white }}>{t.emoji} {t.route}</div>
                  <div style={{ fontFamily: F.body, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>{t.dates}</div>
                </div>
              </div>
              <div style={{ background: C.white, padding: "16px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontFamily: F.body, fontSize: 13, color: C.textMid }}>Guide: {t.guide}</div>
                  <div style={{ fontFamily: F.body, fontSize: 16, fontWeight: 700, color: C.textPrimary }}>${t.price}<span style={{ fontSize: 12, fontWeight: 400, color: C.textMuted }}>/day</span></div>
                </div>
                {/* Progress bar */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>{t.joined} joined · min {t.min}</span>
                    <span style={{ fontFamily: F.body, fontSize: 11, color: C.textMuted }}>max {t.max}</span>
                  </div>
                  <div style={{ height: 6, background: C.surface, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(t.joined / t.max) * 100}%`, background: t.status === "full" ? C.textMuted : C.green, borderRadius: 999 }} />
                  </div>
                </div>
                {t.status !== "full" && <Btn small onClick={() => {}} style={{ width: "100%" }}>Join This Trip</Btn>}
              </div>
            </div>
          );
        })}
        <div style={{ height: 20 }} />
      </div>
      <BottomNav active="groupTrips" setScreen={setScreen} />
    </div>
  );
};

// Reviews Sheet
const ReviewsSheet = ({ guide, setScreen }) => {
  const reviews = [
    { name: "Sarah M.", flag: "🇬🇧", rating: 5, date: "Jan 2025", text: "Pemba was extraordinary. He read the mountain and my energy simultaneously — knowing when to talk and when to let silence do the work. Best three weeks of my life." },
    { name: "Kenji T.", flag: "🇯🇵", rating: 5, date: "Dec 2024", text: "I was nervous about solo trekking at altitude. He made me feel completely safe and seen the whole time. His knowledge of the route was unbelievable." },
    { name: "Maria L.", flag: "🇧🇷", rating: 5, date: "Nov 2024", text: "A photographer's dream guide. He knew every golden hour spot on the EBC route. My photos from this trip are unreal." },
    { name: "Tom H.", flag: "🇺🇸", rating: 4, date: "Oct 2024", text: "Genuinely one of the best travel experiences I've had. Slightly rushed on day 5 but overall wonderful." },
  ];
  const dist = [5, 4, 3, 2, 1].map(s => ({ stars: s, count: reviews.filter(r => r.rating === s).length }));
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      (<TopBar onBack={() => setScreen("profile")} setScreen={setScreen} />)
      <div style={{ padding: "0 24px 80px" }}>
        <h2 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>Reviews</h2>
        <div style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted, marginBottom: 24 }}>{guide?.name} · {guide?.treks} completed treks</div>
        {/* Summary */}
        <div style={{ background: C.white, borderRadius: 20, padding: 20, boxShadow: shadowSm, marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: F.display, fontSize: 42, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>{guide?.rating}</div>
              <div style={{ color: C.orange, fontSize: 16 }}>★★★★★</div>
            </div>
            <div style={{ flex: 1 }}>
              {dist.map(({ stars, count }) => (
                <div key={stars} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, width: 10 }}>{stars}</span>
                  <div style={{ flex: 1, height: 4, background: C.surface, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${(count / reviews.length) * 100}%`, height: "100%", background: C.orange, borderRadius: 999 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Individual reviews */}
        {reviews.map((r, i) => (
          <div key={i} style={{ background: C.white, borderRadius: 18, padding: "16px 18px", boxShadow: shadowSm, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>{r.flag}</span>
                <span style={{ fontFamily: F.body, fontWeight: 600, fontSize: 14, color: C.textPrimary }}>{r.name}</span>
              </div>
              <span style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted }}>{r.date}</span>
            </div>
            <div style={{ color: C.orange, fontSize: 12, marginBottom: 6 }}>{"★".repeat(r.rating)}</div>
            <p style={{ fontFamily: F.body, fontSize: 13, color: C.textMid, lineHeight: 1.6, margin: 0 }}>{r.text}</p>
          </div>
        ))}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
};

// Guide Waitlist / Application
const SWaitlist = ({ setScreen }) => {
  const [step, setStep] = useState(0);
  const [country, setCountry] = useState(null);
  const [uploaded, setUploaded] = useState({});
  const [consent, setConsent] = useState(false);

  const countries = [
    { name: "Nepal", flag: "🇳🇵", certs: ["Trekking Guide Licence (NTB)", "NMA Certification"] },
    { name: "Peru", flag: "🇵🇪", certs: ["MINCETUR Guide Licence"] },
    { name: "Guatemala", flag: "🇬🇹", certs: ["INGUAT Guide Licence"] },
    { name: "Vietnam", flag: "🇻🇳", certs: ["Tourist Guide Card (VNAT)"] },
    { name: "Kyrgyzstan", flag: "🇰🇬", certs: ["National Tourism Guide Certificate"] },
    { name: "Tanzania", flag: "🇹🇿", certs: ["Tanzania Tourist Board Licence"] },
    { name: "Indonesia", flag: "🇮🇩", certs: ["Ministry of Tourism Guide Licence"] },
    { name: "Other", flag: "🌍", certs: ["National guide licence or equivalent"] },
  ];

  const selected = countries.find(c => c.name === country);
  const totalSteps = 4;

  // Step 0 — Intro / value prop
  const Step0 = () => (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🧭</div>
        <h1 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.textPrimary, margin: "0 0 12px", lineHeight: 1.2 }}>Guide with GuideMatch</h1>
        <p style={{ fontFamily: F.body, fontSize: 15, color: C.textMid, lineHeight: 1.6, margin: 0 }}>Set your own rates. Get matched, not assigned. Keep more of what you earn.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
        {[
          { icon: "💰", title: "No agency cut", desc: "Travelers pay you directly. No middleman taking 30–50%." },
          { icon: "🤝", title: "Matched by compatibility", desc: "Get paired with travelers who suit your style and pace." },
          { icon: "⭐", title: "Build your reputation", desc: "Your profile, your reviews, your brand — fully yours." },
          { icon: "✅", title: "Verified badge", desc: "Stand out with a GuideMatch verified guide badge." },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start", background: C.white, borderRadius: 16, padding: "14px 16px", boxShadow: shadowSm }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.textPrimary, marginBottom: 2 }}>{title}</div>
              <div style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted, lineHeight: 1.5 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <Btn onClick={() => setStep(1)}>Get started →</Btn>
      <p style={{ textAlign: "center", fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 12 }}>Takes about 3 minutes</p>
    </div>
  );

  // Step 1 — Choose country
  const Step1 = () => (
    <div>
      <h2 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.textPrimary, margin: "0 0 6px" }}>Where do you guide?</h2>
      <p style={{ fontFamily: F.body, fontSize: 14, color: C.textMuted, marginBottom: 24 }}>We'll show you exactly what documents are required.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {countries.map(c => {
          const sel = country === c.name;
          return (
            <button key={c.name} onClick={() => setCountry(c.name)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", background: sel ? C.greenTint : C.white, border: `1.5px solid ${sel ? C.green : C.border}`, borderRadius: 16, cursor: "pointer", textAlign: "left", transition: "all 0.18s" }}>
              <span style={{ fontSize: 26 }}>{c.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 15, color: sel ? C.green : C.textPrimary }}>{c.name}</div>
                <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 2 }}>Required: {c.certs.join(", ")}</div>
              </div>
              {sel && <span style={{ color: C.green, fontWeight: 700, fontSize: 18 }}>✓</span>}
            </button>
          );
        })}
      </div>
      <Btn onClick={() => setStep(2)} disabled={!country}>Continue →</Btn>
    </div>
  );

  // Step 2 — Upload certs + guide photo
  const Step2 = () => {
    const toggle = key => setUploaded(u => ({ ...u, [key]: !u[key] }));
    return (
      <div>
        <h2 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.textPrimary, margin: "0 0 6px" }}>Upload your documents</h2>
        <p style={{ fontFamily: F.body, fontSize: 14, color: C.textMuted, marginBottom: 8 }}>Required for {selected?.flag} {country}. All files are encrypted and never shared publicly.</p>

        {/* Required certs for selected country */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Required certifications</div>
          {selected?.certs.map((cert, i) => (
            <button key={cert} onClick={() => toggle(`cert_${i}`)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px", background: uploaded[`cert_${i}`] ? C.greenTint : C.white, border: `1.5px solid ${uploaded[`cert_${i}`] ? C.green : C.border}`, borderRadius: 14, marginBottom: 10, cursor: "pointer", textAlign: "left" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: uploaded[`cert_${i}`] ? C.green : C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                {uploaded[`cert_${i}`] ? <span style={{ color: C.white, fontWeight: 700 }}>✓</span> : "📋"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 14, color: C.textPrimary }}>{cert}</div>
                <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 2 }}>{uploaded[`cert_${i}`] ? "Uploaded" : "Tap to upload"}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Guide photo */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>Your guide photo</div>
          <button onClick={() => toggle("photo")} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px", background: uploaded.photo ? C.greenTint : C.white, border: `1.5px solid ${uploaded.photo ? C.green : C.border}`, borderRadius: 14, cursor: "pointer", textAlign: "left" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: uploaded.photo ? C.green : C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {uploaded.photo ? <span style={{ color: C.white, fontWeight: 700 }}>✓</span> : "🤳"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 14, color: C.textPrimary }}>Profile photo</div>
              <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 2 }}>{uploaded.photo ? "Uploaded" : "Clear face, good lighting"}</div>
            </div>
          </button>
        </div>

        <div style={{ background: C.greenTint, borderRadius: 14, padding: "12px 14px", marginBottom: 24, display: "flex", gap: 10 }}>
          <span>🔒</span>
          <span style={{ fontFamily: F.body, fontSize: 12, color: C.green, lineHeight: 1.5 }}>Documents are encrypted and only used for verification. They're never shared with travelers.</span>
        </div>

        <Btn onClick={() => setStep(3)}>Continue →</Btn>
      </div>
    );
  };

  // Step 3 — Background check consent + submit
  const Step3 = () => (
    <div>
      <h2 style={{ fontFamily: F.display, fontSize: 26, fontWeight: 700, color: C.textPrimary, margin: "0 0 6px" }}>Background check</h2>
      <p style={{ fontFamily: F.body, fontSize: 14, color: C.textMuted, marginBottom: 24 }}>To keep travelers safe, all guides go through a quick identity and background check.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {[
          { icon: "🪪", title: "Identity check", desc: "Confirms you are who you say you are." },
          { icon: "📋", title: "Background check", desc: "Standard criminal record check. Usually takes 1–2 days." },
          { icon: "🤳", title: "Selfie with ID", desc: "A quick photo holding your government ID." },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: C.white, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
            <div>
              <div style={{ fontFamily: F.body, fontWeight: 700, fontSize: 14, color: C.textPrimary }}>{title}</div>
              <div style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted, marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Selfie upload */}
      <button onClick={() => setUploaded(u => ({ ...u, selfie: !u.selfie }))} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px", background: uploaded.selfie ? C.greenTint : C.white, border: `1.5px solid ${uploaded.selfie ? C.green : C.border}`, borderRadius: 14, marginBottom: 16, cursor: "pointer", textAlign: "left" }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: uploaded.selfie ? C.green : C.surface, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
          {uploaded.selfie ? <span style={{ color: C.white, fontWeight: 700 }}>✓</span> : "📸"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: F.body, fontWeight: 600, fontSize: 14, color: C.textPrimary }}>Selfie holding government ID</div>
          <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 2 }}>{uploaded.selfie ? "Uploaded" : "Tap to upload"}</div>
        </div>
      </button>

      {/* Consent */}
      <button onClick={() => setConsent(c => !c)} style={{ display: "flex", alignItems: "flex-start", gap: 12, width: "100%", padding: "14px 16px", background: consent ? C.greenTint : C.white, border: `1.5px solid ${consent ? C.green : C.border}`, borderRadius: 14, marginBottom: 24, cursor: "pointer", textAlign: "left" }}>
        <div style={{ width: 22, height: 22, borderRadius: 6, background: consent ? C.green : C.surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
          {consent && <span style={{ color: C.white, fontWeight: 700, fontSize: 13 }}>✓</span>}
        </div>
        <span style={{ fontFamily: F.body, fontSize: 13, color: C.textPrimary, lineHeight: 1.5 }}>I consent to an identity and background check and confirm that all documents I've uploaded are genuine.</span>
      </button>

      <Btn onClick={() => setStep(4)} disabled={!consent || !uploaded.selfie}>Apply for waitlist</Btn>
      <p style={{ textAlign: "center", fontFamily: F.body, fontSize: 12, color: C.textMuted, marginTop: 10, lineHeight: 1.5 }}>We'll review your application and email you within 1–2 business days.</p>
    </div>
  );

  // Step 4 — Done
  const Step4 = () => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", paddingTop: 40 }}>
      <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
      <h2 style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.textPrimary, marginBottom: 10 }}>You're on the waitlist!</h2>
      <p style={{ fontFamily: F.body, fontSize: 15, color: C.textMid, lineHeight: 1.7, marginBottom: 10, maxWidth: 300 }}>We've received your application and started your background check.</p>
      <div style={{ background: C.greenTint, borderRadius: 16, padding: "14px 20px", marginBottom: 36, width: "100%" }}>
        <div style={{ fontFamily: F.body, fontSize: 13, color: C.green, fontWeight: 600, marginBottom: 6 }}>What happens next</div>
        {["Background check: 1–2 days", "Profile review by our team", "You'll get an email when you're approved", "Then complete your full profile"].map(t => (
          <div key={t} style={{ fontFamily: F.body, fontSize: 13, color: C.textMid, marginTop: 4 }}>· {t}</div>
        ))}
      </div>
      <Btn onClick={() => { setStep(0); setCountry(null); setUploaded({}); setConsent(false); setScreen("home"); }}>Back to home</Btn>
    </div>
  );

  const stepLabels = ["", "Location", "Documents", "Background check", ""];
  const showProgress = step > 0 && step < 4;

  return (
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <TopBar onBack={() => step > 0 ? setStep(s => s - 1) : setScreen("welcome")} setScreen={setScreen} />

      {showProgress && (
        <div style={{ padding: "0 24px 4px" }}>
          {/* Step dots */}
          <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: 6, width: i === step ? 24 : 6, borderRadius: 999, background: i <= step ? C.green : C.surface, transition: "all 0.3s" }} />
            ))}
          </div>
          <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, textAlign: "center", marginBottom: 20 }}>Step {step} of 3 — {stepLabels[step]}</div>
        </div>
      )}

      <div style={{ padding: "0 24px 120px" }}>
        {step === 0 && <Step0 />}
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
      </div>

      {step < 4 && <BottomNav active="waitlist" setScreen={setScreen} />}
    </div>
  );
};



// ── FavoritesScreen ───────────────────────────────────────────────────────────
const FavoritesScreen = ({ setScreen, setActiveGuide }) => {
  const saved = GUIDES.filter((_, i) => i === 0 || i === 2); // Pemba + Norbu as demo saves
  return (
    <div style={{ background: C.bg, minHeight: "100vh", paddingBottom: 80 }}>
      <div style={{ padding: "20px 24px 16px", background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <h1 style={{ fontFamily: F.display, fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: "0 0 4px" }}>Favorites</h1>
        <p style={{ fontFamily: F.body, fontSize: 13, color: C.textMuted, margin: 0 }}>Guides you've saved</p>
      </div>
      <div style={{ padding: "20px 20px" }}>
        {saved.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤍</div>
            <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 700, color: C.textPrimary, marginBottom: 8 }}>No favorites yet</div>
            <p style={{ fontFamily: F.body, fontSize: 14, color: C.textMuted, marginBottom: 24 }}>Tap the 🤍 on any guide card to save them here</p>
            <Btn onClick={() => setScreen("swipe")} style={{ maxWidth: 200, margin: "0 auto" }}>Browse guides</Btn>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {saved.map(g => (
              <button key={g.id} onClick={() => { setActiveGuide(g); setScreen("profile"); }} style={{ display: "flex", alignItems: "center", gap: 14, background: C.white, borderRadius: 20, padding: "14px 16px", border: `1px solid ${C.border}`, cursor: "pointer", textAlign: "left", boxShadow: shadowSm }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>{g.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                    <span style={{ fontFamily: F.display, fontSize: 17, fontWeight: 700, color: C.textPrimary }}>{g.name}</span>
                    <span style={{ background: C.greenTint, color: C.green, fontFamily: F.body, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>✓ Verified</span>
                  </div>
                  <div style={{ fontFamily: F.body, fontSize: 12, color: C.textMuted, marginBottom: 4 }}>{g.location} · {g.cert}</div>
                  <div style={{ display: "flex", gap: 12 }}>
                    <span style={{ fontFamily: F.body, fontSize: 12, color: C.textPrimary }}>⭐ {g.rating}</span>
                    <span style={{ fontFamily: F.body, fontSize: 12, color: C.orange, fontWeight: 700 }}>{g.match}% match</span>
                  </div>
                </div>
                <span style={{ color: C.green, fontSize: 20 }}>💚</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <BottomNav active="favorites" setScreen={setScreen} />
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [screen, setScreen] = useState("welcome");
  const [activeGuide, setActiveGuide] = useState(GUIDES[0]);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Outfit:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [screen]);

  const renderScreen = () => {
    switch (screen) {
      case "welcome": return <S1Welcome setScreen={setScreen} />;
      case "destination": return <S4Destination setScreen={setScreen} />;
      case "preferences": return <S5Preferences setScreen={setScreen} />;
      case "finding": return <S6Finding setScreen={setScreen} />;
      case "home": return <HomeScreen setScreen={setScreen} setActiveGuide={setActiveGuide} />;
      case "messages": return <MessagesScreen setScreen={setScreen} />;
      case "favorites": return <FavoritesScreen setScreen={setScreen} setActiveGuide={setActiveGuide} />;
      case "swipe": return <SwipeScreen setScreen={setScreen} setActiveGuide={setActiveGuide} />;
      case "profile": return <GuideProfile guide={activeGuide} setScreen={setScreen} />;
      case "soloBooking": return <SoloBooking guide={activeGuide} setScreen={setScreen} />;
      case "groupTrips": return <GroupTripsPage setScreen={setScreen} />;
      case "reviews": return <ReviewsSheet guide={activeGuide} setScreen={setScreen} />;
      case "waitlist": return <SWaitlist setScreen={setScreen} />;
      default: return <S1Welcome setScreen={setScreen} />;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.body, maxWidth: 480, margin: "0 auto" }}>
      {renderScreen()}
    </div>
  );
}

export default App;