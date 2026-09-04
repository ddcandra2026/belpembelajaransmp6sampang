// Editorial Control Room: dashboard asimetris dengan numeralia waktu besar, timeline sinyal, dan kontrol operator yang cepat dipindai.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BellRing,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Download,
  LayoutDashboard,
  Mic2,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { toast } from "sonner";

type Day = "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu";
type BellType = "Bel" | "MBG" | "Istirahat" | "SAS" | "Agenda" | "Pulang";
type Section = "dashboard" | "schedule" | "voice" | "settings";

type BellItem = {
  id: string;
  day: Day;
  time: string;
  title: string;
  type: BellType;
  detail: string;
  enabled: boolean;
  message: string;
};

type InstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

type SpecialEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: "SAS" | "Agenda";
  note: string;
};

const DAYS: Day[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const STORAGE_KEY = "bel-smpn6-sampang-v1";

const messageDefaults: Record<BellType, string> = {
  Bel: "Perhatian. Waktu pembelajaran berikutnya telah dimulai.",
  MBG: "Waktunya pembiasaan dan makan bergizi gratis. Silakan menuju area yang telah ditentukan.",
  Istirahat: "Waktu istirahat telah dimulai. Harap kembali ke kelas tepat waktu.",
  SAS: "Perhatian. Asesmen sumatif akhir sekolah akan segera dimulai.",
  Agenda: "Perhatian. Agenda sekolah akan segera dimulai.",
  Pulang: "Kegiatan pembelajaran hari ini telah selesai. Selamat beristirahat dan sampai jumpa.",
};

const makeBell = (day: Day, time: string, title: string, type: BellType, detail = "35 menit"): BellItem => ({
  id: `${day}-${time}-${title}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase(),
  day,
  time,
  title,
  type,
  detail,
  enabled: true,
  message: messageDefaults[type],
});

const createDefaultSchedule = (): BellItem[] => [
  ...[
    ["07:00", "Jam ke-1"], ["07:35", "Jam ke-2"], ["08:10", "Jam ke-3"], ["08:45", "MBG"], ["09:25", "Istirahat pertama"],
    ["09:45", "Jam ke-4"], ["10:20", "Jam ke-5"], ["10:55", "Jam ke-6"], ["11:30", "Istirahat kedua"], ["11:50", "Jam ke-7"], ["12:25", "Jam ke-8"],
  ].map(([time, title]) => makeBell("Senin", time, title, title.startsWith("Istirahat") ? "Istirahat" : title === "MBG" ? "MBG" : "Bel")),
  ...[
    ["07:00", "Jam ke-1"], ["07:35", "Jam ke-2"], ["08:10", "Jam ke-3"], ["08:45", "MBG"], ["09:25", "Istirahat pertama"],
    ["09:45", "Jam ke-4"], ["10:20", "Jam ke-5"], ["10:55", "Jam ke-6"], ["11:30", "Istirahat kedua"], ["11:50", "Jam ke-7"], ["12:25", "Jam ke-8"],
  ].map(([time, title]) => makeBell("Selasa", time, title, title.startsWith("Istirahat") ? "Istirahat" : title === "MBG" ? "MBG" : "Bel")),
  ...[
    ["07:00", "Jam ke-1"], ["07:35", "Jam ke-2"], ["08:10", "Jam ke-3"], ["08:45", "MBG"], ["09:25", "Istirahat pertama"],
    ["09:45", "Jam ke-4"], ["10:20", "Jam ke-5"], ["10:55", "Jam ke-6"], ["11:30", "Istirahat kedua"], ["11:50", "Jam ke-7"], ["12:25", "Jam ke-8"],
  ].map(([time, title]) => makeBell("Rabu", time, title, title.startsWith("Istirahat") ? "Istirahat" : title === "MBG" ? "MBG" : "Bel")),
  ...[
    ["07:00", "Jam ke-1"], ["07:35", "Jam ke-2"], ["08:10", "Jam ke-3"], ["08:45", "MBG"], ["09:25", "Istirahat pertama"],
    ["09:45", "Jam ke-4"], ["10:20", "Jam ke-5"], ["10:55", "Jam ke-6"], ["11:30", "Istirahat kedua"], ["11:50", "Jam ke-7"], ["12:25", "Jam ke-8"],
  ].map(([time, title]) => makeBell("Kamis", time, title, title.startsWith("Istirahat") ? "Istirahat" : title === "MBG" ? "MBG" : "Bel")),
  ...[
    ["07:00", "Jam ke-1 dan ke-2", "90 menit"], ["08:30", "Istirahat", "20 menit"], ["08:50", "Jam ke-3"], ["09:25", "Jam ke-4"], ["10:00", "Jam ke-5"], ["10:35", "Pulang", "Selesai"],
  ].map(([time, title, detail = "35 menit"]) => makeBell("Jumat", time, title, title === "Istirahat" ? "Istirahat" : title === "Pulang" ? "Pulang" : "Bel", detail)),
  ...[
    ["07:00", "Jam ke-1"], ["07:35", "Jam ke-2"], ["08:10", "Jam ke-3"], ["08:45", "Istirahat pertama", "15 menit"], ["09:00", "Jam ke-4"], ["09:35", "Jam ke-5"], ["10:10", "Jam ke-6"], ["10:45", "Istirahat kedua", "15 menit"], ["11:00", "Jam ke-7"], ["11:35", "Jam ke-8"], ["12:10", "Pulang", "Selesai"],
  ].map(([time, title, detail = "35 menit"]) => makeBell("Sabtu", time, title, title.startsWith("Istirahat") ? "Istirahat" : title === "Pulang" ? "Pulang" : "Bel", detail)),
];

const defaultSpecialEvents: SpecialEvent[] = [
  { id: "sas-1", title: "SAS Bahasa Indonesia", date: "2026-09-08", time: "07:00", type: "SAS", note: "Ruang kelas masing-masing" },
  { id: "agenda-1", title: "Upacara bendera", date: "2026-09-07", time: "06:45", type: "Agenda", note: "Lapangan utama" },
];

const getInitialDay = (): Day => {
  const dayIndex = new Date().getDay();
  return DAYS[Math.max(0, Math.min(5, dayIndex === 0 ? 0 : dayIndex - 1))];
};

const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fall through to defaults when storage is unavailable or invalid
  }
  return { schedule: createDefaultSchedule(), events: defaultSpecialEvents, messages: messageDefaults };
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatTime = (date: Date, withSeconds = false) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}${withSeconds ? `:${pad(date.getSeconds())}` : ""}`;
};

const formatCountdown = (value: number) => {
  if (value <= 0) return "sekarang";
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return hours > 0 ? `${hours}j ${minutes}m` : `${minutes} menit`;
};

const typeClass = (type: BellType) => type.toLowerCase().replace(" ", "-");
const bellTypes: BellType[] = ["Bel", "MBG", "Istirahat", "SAS", "Agenda", "Pulang"];
const isBellDay = (value: unknown): value is Day => typeof value === "string" && DAYS.includes(value as Day);
const isBellType = (value: unknown): value is BellType => typeof value === "string" && bellTypes.includes(value as BellType);
const isClockTime = (value: unknown): value is string => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);

function IconMark({ size = "small" }: { size?: "small" | "large" }) {
  return <div className={`brand-mark ${size} brand-mark-fallback`}><BellRing size={size === "large" ? 28 : 16} /></div>;
}

export default function Home() {
  const initial = useMemo(loadState, []);
  const [schedule, setSchedule] = useState<BellItem[]>(initial.schedule);
  const [events, setEvents] = useState<SpecialEvent[]>(initial.events);
  const [messages, setMessages] = useState<Record<BellType, string>>(initial.messages ?? messageDefaults);
  const [selectedDay, setSelectedDay] = useState<Day>(getInitialDay());
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [now, setNow] = useState(new Date());
  const [isRunning, setIsRunning] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceName, setVoiceName] = useState(initial.voiceName ?? "");
  const [voiceRate, setVoiceRate] = useState(initial.voiceRate ?? 0.92);
  const [voicePitch, setVoicePitch] = useState(initial.voicePitch ?? 1);
  const [lastBackupAt, setLastBackupAt] = useState<string | null>(initial.lastBackupAt ?? null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [draft, setDraft] = useState({ time: "13:00", title: "Agenda baru", type: "Agenda" as BellType, detail: "Keterangan tambahan", message: messageDefaults.Agenda });
  const [eventDraft, setEventDraft] = useState({ title: "SAS baru", date: "2026-09-10", time: "07:00", type: "SAS" as "SAS" | "Agenda", note: "" });
  const lastTriggeredRef = useRef("");

  const todayName = DAYS[Math.max(0, Math.min(5, now.getDay() === 0 ? 0 : now.getDay() - 1))];
  const selectedDayItems = useMemo(() => schedule.filter((item) => item.day === selectedDay).sort((a, b) => toMinutes(a.time) - toMinutes(b.time)), [schedule, selectedDay]);
  const todayItems = useMemo(() => schedule.filter((item) => item.day === todayName && item.enabled).sort((a, b) => toMinutes(a.time) - toMinutes(b.time)), [schedule, todayName]);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nextItem = useMemo(() => {
    const source = selectedDay === todayName ? todayItems : selectedDayItems.filter((item) => item.enabled);
    return source.find((item) => toMinutes(item.time) >= nowMinutes) ?? source[0] ?? null;
  }, [nowMinutes, selectedDay, selectedDayItems, todayItems, todayName]);
  const nextIndex = nextItem ? selectedDayItems.findIndex((item) => item.id === nextItem.id) : 0;
  const minutesToNext = nextItem && selectedDay === todayName ? Math.max(0, toMinutes(nextItem.time) - nowMinutes) : 0;
  const completion = todayItems.length ? Math.min(100, Math.round((todayItems.filter((item) => toMinutes(item.time) < nowMinutes).length / todayItems.length) * 100)) : 0;
  const upcomingItems = selectedDayItems.slice(Math.max(0, nextIndex), Math.max(0, nextIndex) + 4);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);
    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", () => { setIsInstalled(true); setInstallPrompt(null); });
    return () => window.removeEventListener("beforeinstallprompt", onInstallPrompt);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schedule, events, messages, voiceName, voiceRate, voicePitch, lastBackupAt }));
  }, [events, lastBackupAt, messages, schedule, voiceName, voicePitch, voiceRate]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const updateVoices = () => setVoices(window.speechSynthesis.getVoices());
    updateVoices();
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    const currentTime = formatTime(now);
    const matchingItem = schedule.find((item) => item.day === todayName && item.time === currentTime && item.enabled);
    const triggerKey = `${now.toISOString().slice(0, 10)}-${currentTime}-${matchingItem?.id ?? ""}`;
    if (matchingItem && triggerKey !== lastTriggeredRef.current) {
      lastTriggeredRef.current = triggerKey;
      if (soundEnabled) {
        playBellTone();
        window.setTimeout(() => speak(matchingItem.message || messages[matchingItem.type] || messageDefaults[matchingItem.type]), 500);
      }
      toast.success(`Bel otomatis: ${matchingItem.title}`, { description: matchingItem.time });
    }
  }, [isRunning, messages, now, schedule, soundEnabled, todayName]);

  const playBellTone = () => {
    try {
      const context = new AudioContext();
      [0, 0.22, 0.44].forEach((offset, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = index === 1 ? 880 : 660;
        gain.gain.setValueAtTime(0.0001, context.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(0.25, context.currentTime + offset + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + offset + 0.18);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(context.currentTime + offset);
        oscillator.stop(context.currentTime + offset + 0.2);
      });
      window.setTimeout(() => context.close(), 1100);
    } catch {
      toast.error("Browser belum mengizinkan audio. Klik halaman sekali, lalu coba lagi.");
    }
  };

  const speak = (text: string) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Speech Synthesis tidak tersedia di browser ini.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;
    const selectedVoice = voices.find((voice) => voice.name === voiceName) ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("id"));
    if (selectedVoice) utterance.voice = selectedVoice;
    window.speechSynthesis.speak(utterance);
  };

  const announce = (item: BellItem | null) => {
    if (!item) return;
    if (soundEnabled) playBellTone();
    window.setTimeout(() => speak(item.message || messages[item.type] || messageDefaults[item.type]), soundEnabled ? 500 : 0);
    toast.success(`Simulasi diputar: ${item.title}`, { description: item.time });
  };

  const installApp = async () => {
    if (!installPrompt) {
      toast.info(isInstalled ? "Aplikasi sudah terpasang sebagai jendela mandiri." : "Buka menu ⋮ browser, lalu pilih Install Bel Pembelajaran.");
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    toast(choice.outcome === "accepted" ? "Aplikasi berhasil dipasang." : "Pemasangan dibatalkan.");
    setInstallPrompt(null);
  };

  const navigate = (section: Section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const resetDefaults = () => {
    setSchedule(createDefaultSchedule());
    setEvents(defaultSpecialEvents);
    setMessages(messageDefaults);
    toast.success("Konfigurasi dikembalikan ke jadwal awal SMP Negeri 6 Sampang.");
  };

  const saveBell = () => {
    const normalized = { ...draft, message: draft.message.trim() || messageDefaults[draft.type] };
    if (!normalized.title.trim()) return toast.error("Nama kegiatan belum diisi.");
    if (editingId) {
      setSchedule((items) => items.map((item) => item.id === editingId ? { ...item, time: normalized.time, title: normalized.title, type: normalized.type, detail: normalized.detail, message: normalized.message } : item));
      toast.success("Jadwal bel diperbarui.");
    } else {
      const newItem = { ...makeBell(selectedDay, normalized.time, normalized.title, normalized.type, normalized.detail), message: normalized.message };
      setSchedule((items) => [...items, newItem]);
      toast.success("Jadwal bel ditambahkan.");
    }
    setEditingId(null);
    setDraft({ time: "13:00", title: "Agenda baru", type: "Agenda", detail: "Keterangan tambahan", message: messageDefaults.Agenda });
  };

  const editBell = (item: BellItem) => {
    setEditingId(item.id);
    setDraft({ time: item.time, title: item.title, type: item.type, detail: item.detail, message: item.message });
    navigate("schedule");
  };

  const deleteBell = (id: string) => {
    setSchedule((items) => items.filter((item) => item.id !== id));
    toast.success("Jadwal dihapus dari hari ini.");
  };

  const addEvent = () => {
    if (!eventDraft.title.trim()) return toast.error("Nama agenda belum diisi.");
    setEvents((items) => [...items, { ...eventDraft, id: `event-${Date.now()}` }]);
    setShowAddEvent(false);
    toast.success(`${eventDraft.type} berhasil ditambahkan.`);
  };

  const exportConfig = () => {
    const exportedAt = new Date().toISOString();
    const payload = {
      format: "bel-pembelajaran-backup",
      version: 2,
      exportedAt,
      school: "SMP Negeri 6 Sampang",
      schedule,
      events,
      messages,
      voice: { voiceName, voiceRate, voicePitch },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `jadwal-bel-smpn6-sampang-${formatTime(new Date()).replace(":", "-")}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setLastBackupAt(exportedAt);
    toast.success(`Backup berhasil dibuat: ${schedule.length} jadwal, ${events.length} agenda.`);
  };

  const importConfig = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const value = JSON.parse(String(reader.result));
        const incoming = Array.isArray(value) ? value : value?.schedule;
        if (!Array.isArray(incoming) || !incoming.length) throw new Error("schedule_missing");
        const invalid = incoming.some((item) => !item || !isBellDay(item.day) || !isClockTime(item.time) || typeof item.title !== "string" || !item.title.trim() || !isBellType(item.type));
        if (invalid) throw new Error("schedule_invalid");
        const normalized: BellItem[] = incoming.map((item, index) => ({
          id: typeof item.id === "string" && item.id ? item.id : `import-${item.day}-${item.time}-${index}`.replace(/[^a-z0-9]+/gi, "-").toLowerCase(),
          day: item.day,
          time: item.time,
          title: item.title.trim(),
          type: item.type as BellType,
          detail: typeof item.detail === "string" ? item.detail : "35 menit",
          enabled: item.enabled !== false,
          message: typeof item.message === "string" && item.message.trim() ? item.message : messageDefaults[item.type as BellType],
        }));
        const incomingEvents = Array.isArray(value?.events) ? value.events.filter((event: SpecialEvent) => typeof event?.title === "string" && typeof event?.date === "string" && typeof event?.time === "string" && (event.type === "SAS" || event.type === "Agenda")) : null;
        if (value?.events && !incomingEvents) throw new Error("events_invalid");
        if (!window.confirm(`Pulihkan backup ini dan ganti ${schedule.length} jadwal aktif dengan ${normalized.length} momen?`)) return;
        setSchedule(normalized);
        if (incomingEvents) setEvents(incomingEvents);
        if (value?.messages && typeof value.messages === "object") setMessages((current) => ({ ...current, ...value.messages }));
        if (value?.voice && typeof value.voice === "object") {
          if (typeof value.voice.voiceName === "string") setVoiceName(value.voice.voiceName);
          if (typeof value.voice.voiceRate === "number") setVoiceRate(value.voice.voiceRate);
          if (typeof value.voice.voicePitch === "number") setVoicePitch(value.voice.voicePitch);
        }
        setLastBackupAt(typeof value?.exportedAt === "string" ? value.exportedAt : new Date().toISOString());
        toast.success(`Restore berhasil: ${normalized.length} jadwal${incomingEvents ? ` dan ${incomingEvents.length} agenda` : ""}.`);
      } catch (error) {
        toast.error(error instanceof Error && error.message === "schedule_invalid" ? "Format jadwal tidak valid. Periksa hari, waktu, jenis, dan nama momen." : error instanceof Error && error.message === "events_invalid" ? "Data agenda pada backup tidak valid." : "File backup tidak dapat dibaca.");
      }
    };
    reader.readAsText(file);
  };

  const navItems: { id: Section; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Ringkasan", icon: LayoutDashboard },
    { id: "schedule", label: "Jadwal Bel", icon: CalendarDays },
    { id: "voice", label: "Suara AI", icon: Mic2 },
    { id: "settings", label: "Pengaturan", icon: Settings2 },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <IconMark size="small" />
          <div><strong>BEL</strong><span>Pembelajaran</span></div>
        </div>
        <div className="sidebar-kicker">PANEL OPERATOR</div>
        <nav className="nav-list" aria-label="Navigasi utama">
          {navItems.map(({ id, label, icon: NavIcon }) => (
            <button key={id} className={`nav-item ${activeSection === id ? "active" : ""}`} onClick={() => navigate(id)}>
              <NavIcon size={17} strokeWidth={1.8} /><span>{label}</span>{activeSection === id && <ChevronRight className="nav-arrow" size={15} />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-status"><span className="status-dot" /> Sistem lokal aktif</div>
          <p>Konfigurasi tersimpan otomatis di browser ini.</p>
          <button className="sidebar-reset" onClick={resetDefaults}><RotateCcw size={14} /> Kembalikan awal</button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb"><span>APEL JUMBO</span><ChevronRight size={14} /><strong>Bel Pembelajaran</strong></div>
          <div className="topbar-actions">
            <button className={`install-button ${isInstalled ? "installed" : ""}`} onClick={installApp}><Download size={14} /> {isInstalled ? "Terpasang" : "Pasang aplikasi"}</button>
            <div className="live-pill"><span className="status-dot" /> LIVE <small>lokal</small></div>
            <button className={`icon-button ${soundEnabled ? "" : "muted"}`} onClick={() => setSoundEnabled((value) => !value)} aria-label={soundEnabled ? "Matikan suara" : "Nyalakan suara"}>{soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}</button>
            <button className="operator-chip" onClick={() => navigate("settings")}><span>OP</span><div><strong>Operator</strong><small>Admin sekolah</small></div><MoreHorizontal size={16} /></button>
          </div>
        </header>

        <div className="page-wrap">
          <section className="intro-row" id="dashboard">
            <div>
              <div className="eyebrow"><Sparkles size={14} /> CONTROL ROOM · {todayName.toUpperCase()}</div>
              <h1>Ritme sekolah,<br /><em>siap dipantau.</em></h1>
              <p className="intro-copy">Satu panel untuk menjaga setiap pergantian jam, waktu istirahat, MBG, dan agenda khusus tetap terdengar tepat waktu.</p>
            </div>
            <div className="date-lockup"><span>{now.toLocaleDateString("id-ID", { weekday: "long" })}</span><strong>{now.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</strong><div className="date-rule" /></div>
          </section>

          <section className="hero-grid">
            <div className="time-card">
              <div className="time-card-head"><span className="overline">WAKTU SEKARANG</span><span className="timezone"><Clock3 size={13} /> WIB · UTC+7</span></div>
              <div className="digital-time">{formatTime(now)}<span>:{String(now.getSeconds()).padStart(2, "0")}</span></div>
              <div className="time-card-footer"><span><span className="status-dot" /> Penjagaan jadwal aktif</span><span>{completion}% hari berjalan</span></div>
              <div className="progress-line"><span style={{ width: `${completion}%` }} /></div>
            </div>
            <div className="next-card">
              <div className="next-overlay" />
              <div className="next-content">
                <div className="next-label"><span className="pulse-dot" /> AGENDA BERIKUTNYA</div>
                <strong>{nextItem?.title ?? "Belum ada agenda"}</strong>
                <div className="next-meta"><span>{nextItem?.time ?? "--:--"}</span><i>•</i><span>{nextItem?.detail ?? "Tambahkan jadwal"}</span></div>
                <div className="countdown">{selectedDay === todayName ? <>dalam <b>{formatCountdown(minutesToNext)}</b></> : <>jadwal <b>{selectedDay}</b></>}</div>
              </div>
              <button className="play-round" onClick={() => announce(nextItem)} aria-label="Putar agenda berikutnya"><Play size={17} fill="currentColor" /></button>
            </div>
          </section>

          <section className="quick-row">
            <button className={`quick-toggle ${isRunning ? "on" : ""}`} onClick={() => setIsRunning((value) => !value)}><span className="toggle-icon">{isRunning ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}</span><span><strong>{isRunning ? "Penjadwalan aktif" : "Penjadwalan dijeda"}</strong><small>{isRunning ? "Bel akan mengikuti waktu" : "Tidak ada suara otomatis"}</small></span><span className={`switch ${isRunning ? "checked" : ""}`}><i /></span></button>
            <div className="quick-stat"><div className="stat-symbol teal"><BellRing size={17} /></div><span><small>JADWAL HARI INI</small><strong>{todayItems.length} <em>momen</em></strong></span></div>
            <div className="quick-stat"><div className="stat-symbol amber"><CalendarClock size={17} /></div><span><small>AGENDA KHUSUS</small><strong>{events.length} <em>tersimpan</em></strong></span></div>
            <div className="quick-stat"><div className="stat-symbol navy"><ShieldCheck size={17} /></div><span><small>MODE OPERASI</small><strong>Lokal <em>aman</em></strong></span></div>
          </section>

          <section className="content-grid">
            <div className="panel schedule-panel" id="schedule">
              <div className="panel-head"><div><div className="eyebrow">TIMELINE HARIAN</div><h2>Jadwal bel</h2></div><div className="panel-head-actions"><select className="day-select" value={selectedDay} onChange={(event) => setSelectedDay(event.target.value as Day)} aria-label="Pilih hari">{DAYS.map((day) => <option key={day} value={day}>{day}{day === todayName ? " · hari ini" : ""}</option>)}</select><button className="button-primary compact" onClick={() => { setEditingId(null); setDraft({ time: "13:00", title: "Agenda baru", type: "Agenda", detail: "Keterangan tambahan", message: messageDefaults.Agenda }); navigate("schedule"); }}><Plus size={15} /> Tambah bel</button></div></div>
              <div className="timeline-list">
                {selectedDayItems.map((item, index) => (
                  <div className={`timeline-item ${item.id === nextItem?.id && selectedDay === todayName ? "next" : ""} ${!item.enabled ? "disabled" : ""}`} key={item.id}>
                    <div className={`timeline-node ${typeClass(item.type)}`}><span /></div>
                    <div className="timeline-time">{item.time}<small>{index === 0 ? "mulai" : item.detail}</small></div>
                    <div className="timeline-body"><div className="timeline-title"><strong>{item.title}</strong><span className={`type-tag ${typeClass(item.type)}`}>{item.type}</span>{item.id === nextItem?.id && selectedDay === todayName && <span className="next-tag">NEXT</span>}</div><p>{item.message}</p></div>
                    <div className="timeline-actions"><button onClick={() => announce(item)} aria-label={`Putar ${item.title}`}><Volume2 size={15} /></button><button onClick={() => editBell(item)} aria-label={`Edit ${item.title}`}><Pencil size={15} /></button><button onClick={() => deleteBell(item.id)} aria-label={`Hapus ${item.title}`}><Trash2 size={15} /></button></div>
                  </div>
                ))}
                {!selectedDayItems.length && <div className="empty-state"><CalendarDays size={22} /><strong>Belum ada jadwal untuk {selectedDay}.</strong><span>Tambahkan momen pertama untuk hari ini.</span></div>}
              </div>
              <div className="timeline-foot"><span><span className="legend-dot teal" /> Bel pembelajaran</span><span><span className="legend-dot amber" /> Istirahat / MBG</span><span><span className="legend-dot navy" /> Agenda khusus</span></div>
            </div>

            <aside className="side-stack">
              <div className="panel voice-panel" id="voice">
                <div className="panel-head"><div><div className="eyebrow">PENGUMUMAN</div><h2>Suara AI</h2></div><div className="voice-badge"><Mic2 size={14} /> TTS</div></div>
                <div className="voice-preview"><div className="voice-orb"><Volume2 size={18} /></div><div><strong>Suara custom aktif</strong><span>Ketik kalimat, lalu simpan.</span></div><button onClick={() => speak(messages.Bel)} aria-label="Uji suara pengumuman"><Play size={14} fill="currentColor" /></button></div>
                <label className="field-label">Pesan pergantian jam</label>
                <textarea className="message-box" value={messages.Bel} onChange={(event) => setMessages((value) => ({ ...value, Bel: event.target.value }))} rows={3} />
                <button className="button-secondary full" onClick={() => { speak(messages.Bel); toast.success("Preview suara sedang diputar."); }}><Volume2 size={15} /> Preview suara</button>
                <button className="button-primary full voice-save" onClick={() => toast.success("Kalimat pengumuman tersimpan otomatis di perangkat ini.")}><Save size={15} /> Simpan kalimat</button>
                <div className="browser-note"><CheckCircle2 size={14} /><span>Audio siap setelah tombol preview dijalankan sekali.</span></div>
                <button className="text-link" onClick={() => navigate("settings")}>Buka pengaturan suara <ChevronRight size={14} /></button>
              </div>

              <div className="panel events-panel">
                <div className="panel-head"><div><div className="eyebrow">KALENDER OPERASIONAL</div><h2>SAS & agenda lain</h2></div><button className="icon-button pale" onClick={() => setShowAddEvent((value) => !value)} aria-label="Tambah agenda"><Plus size={16} /></button></div>
                {showAddEvent && <div className="mini-form"><input value={eventDraft.title} onChange={(event) => setEventDraft((value) => ({ ...value, title: event.target.value }))} placeholder="Nama agenda" /><div className="form-row"><select value={eventDraft.type} onChange={(event) => setEventDraft((value) => ({ ...value, type: event.target.value as "SAS" | "Agenda" }))}><option value="SAS">SAS</option><option value="Agenda">Agenda</option></select><input type="date" value={eventDraft.date} onChange={(event) => setEventDraft((value) => ({ ...value, date: event.target.value }))} /><input type="time" value={eventDraft.time} onChange={(event) => setEventDraft((value) => ({ ...value, time: event.target.value }))} /></div><input value={eventDraft.note} onChange={(event) => setEventDraft((value) => ({ ...value, note: event.target.value }))} placeholder="Catatan / lokasi" /><button className="button-primary compact full" onClick={addEvent}><Save size={14} /> Simpan agenda</button></div>}
                <div className="event-list">{events.slice(0, 3).map((event) => <div className="event-row" key={event.id}><div className={`event-date ${event.type.toLowerCase()}`}><strong>{new Date(`${event.date}T00:00:00`).toLocaleDateString("id-ID", { day: "2-digit" })}</strong><span>{new Date(`${event.date}T00:00:00`).toLocaleDateString("id-ID", { month: "short" }).toUpperCase()}</span></div><div className="event-copy"><strong>{event.title}</strong><span>{event.time} · {event.note || "Agenda sekolah"}</span></div><span className={`event-label ${event.type.toLowerCase()}`}>{event.type}</span></div>)}{!events.length && <div className="empty-state compact-empty">Belum ada agenda khusus.</div>}</div>
                <button className="text-link" onClick={() => navigate("settings")}>Kelola semua agenda <ChevronRight size={14} /></button>
              </div>
            </aside>
          </section>

          <section className="operator-section" id="settings">
            <div className="section-heading"><div><div className="eyebrow">WORKSPACE OPERATOR</div><h2>Kelola sistem dengan tenang.</h2></div><p>Semua perubahan disimpan di perangkat ini. Ekspor cadangan sebelum pindah komputer.</p></div>
            <div className="operator-grid">
              <div className="operator-card visual-card"><div className="visual-card-copy"><span>RAPIKAN HARI ANDA</span><strong>Jadwal yang jelas<br />membuat langkah ringan.</strong></div></div>
              <div className="operator-card settings-card"><div className="card-title-row"><div><div className="eyebrow">PENGATURAN BEL {selectedDay.toUpperCase()}</div><h3>{editingId ? "Edit momen bel" : "Tambah momen baru"}</h3></div>{editingId && <button className="close-edit" onClick={() => setEditingId(null)}><X size={15} /></button>}</div><div className="form-grid"><label><span>Waktu</span><input type="time" value={draft.time} onChange={(event) => setDraft((value) => ({ ...value, time: event.target.value }))} /></label><label><span>Jenis</span><select value={draft.type} onChange={(event) => { const type = event.target.value as BellType; setDraft((value) => ({ ...value, type, message: messages[type] || messageDefaults[type] })); }}><option value="Bel">Bel pembelajaran</option><option value="MBG">MBG</option><option value="Istirahat">Istirahat</option><option value="SAS">SAS</option><option value="Agenda">Agenda</option><option value="Pulang">Pulang</option></select></label><label className="wide"><span>Nama momen</span><input value={draft.title} onChange={(event) => setDraft((value) => ({ ...value, title: event.target.value }))} /></label><label><span>Durasi / detail</span><input value={draft.detail} onChange={(event) => setDraft((value) => ({ ...value, detail: event.target.value }))} /></label></div><label className="field-label below">Kalimat pengisi suara</label><textarea className="message-box" value={draft.message} onChange={(event) => setDraft((value) => ({ ...value, message: event.target.value }))} rows={2} /><div className="form-actions"><button className="button-primary" onClick={saveBell}><Save size={15} /> {editingId ? "Simpan perubahan" : "Tambah ke jadwal"}</button><button className="button-secondary" onClick={() => { setDraft((value) => ({ ...value, message: messages[value.type] || messageDefaults[value.type] })); toast.success("Kalimat dikembalikan ke template."); }}><RotateCcw size={15} /> Template suara</button></div></div>
              <div className="operator-card tool-card"><div className="eyebrow">DATA & PERANGKAT</div><h3>Jaga konfigurasi tetap aman.</h3><p>Buat backup lengkap sebelum membersihkan browser atau memindahkan aplikasi ke komputer lain.</p><div className="tool-actions"><button className="button-secondary full" onClick={exportConfig}><Download size={15} /> Backup sekarang</button><label className="button-secondary full file-button"><Upload size={15} /> Restore dari file<input type="file" accept="application/json,.json" onChange={(event) => { importConfig(event.target.files?.[0]); event.currentTarget.value = ""; }} /></label></div><div className="backup-last"><CheckCircle2 size={15} /><span><strong>{lastBackupAt ? `Backup terakhir ${new Date(lastBackupAt).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}` : "Belum ada backup file"}</strong><br />Backup berisi jadwal, agenda, pesan suara, dan preferensi suara.</span></div><div className="safe-note"><ShieldCheck size={16} /><span><strong>Local-first</strong><br />Data tidak dikirim ke server.</span></div></div>
            </div>
          </section>

          <footer className="app-footer"><div className="footer-brand"><IconMark size="small" /><span><strong>Bel Pembelajaran</strong><small>SMP Negeri 6 Sampang</small></span></div><span className="watermark">© Developed by TIM APEL JUMBO <b>2026</b></span><div className="footer-meta"><span><span className="status-dot" /> Sistem siap</span><span>v1.0 · single HTML</span></div></footer>
        </div>
      </main>
    </div>
  );
}
