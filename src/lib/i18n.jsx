import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/**
 * Single dictionary for the interface. IDs, numbers and units stay untouched;
 * only labels are translated. The product name is never translated.
 */
export const LANGS = [
  { key: "en", short: "EN", name: "English" },
  { key: "hi", short: "हिं", name: "हिन्दी" },
  { key: "mr", short: "मरा", name: "मराठी" },
];

const EN = {
  "nav.monitor": "Monitor",
  "nav.analyse": "Analyse",
  "nav.system": "System",
  "nav.command": "Command Center",
  "nav.consumers": "Consumers & Risk",
  "nav.grid": "3D Grid",
  "nav.live": "Live Monitor",
  "nav.transformers": "Transformer Analysis",
  "nav.cases": "Case Management",
  "nav.scenarios": "Scenario Lab",
  "nav.model": "Model Performance",
  "nav.settings": "Settings",
  "nav.field": "Field Inspections",
  "nav.home": "Home",
  "nav.risk": "Risk",
  "nav.casesShort": "Cases",
  "nav.fieldShort": "Field",

  "page.command": "Command Center",
  "page.consumers": "Consumers & Risk",
  "page.grid": "3D Grid Explorer",
  "page.live": "Live IoT Monitor",
  "page.transformers": "Transformer Analysis",
  "page.cases": "Case Management",
  "page.scenarios": "Scenario Lab",
  "page.model": "Model Performance",
  "page.settings": "Settings",
  "page.field": "Field Inspector",
  "page.report": "Investigation Report",

  "kpi.consumers": "Consumers monitored",
  "kpi.highRisk": "High-risk meters",
  "kpi.openCases": "Open cases",
  "kpi.loss": "Est. loss",
  "kpi.alerts": "Active alerts",
  "kpi.latency": "Detection latency",

  "cause.Normal": "Normal",
  "cause.Theft/Tampering": "Theft / Tampering",
  "cause.Meter Fault": "Meter Fault",
  "cause.Communication Failure": "Communication Failure",
  "cause.Legit Abnormal": "Legit Abnormal",
  "cause.Requires Review": "Requires Review",

  "sev.critical": "Critical",
  "sev.high": "High",
  "sev.medium": "Medium",
  "sev.low": "Low",

  "top.search": "Search or jump to…",
  "top.notifications": "Notifications",
  "top.settings": "Settings",
  "top.myQueue": "My risk queue",
  "top.signOut": "Sign out",
  "top.signIn": "Sign in",
  "top.guest": "guest analyst",
  "top.openQueue": "Open risk queue →",
  "top.language": "Language",
  "top.noAlerts": "No alerts right now.",

  "act.export": "Export",
  "act.import": "Import data",
  "act.run": "Run detection",
  "act.sample": "Download sample CSV",
  "act.cancel": "Cancel",
  "act.close": "Close",
  "act.viewAll": "View all",
  "act.open": "Open",

  "imp.title": "Import meter readings",
  "imp.desc": "Drop a CSV with consumer_id, month and kwh — every meter is re-profiled, scored and explained.",
  "imp.drop": "Drop CSV here or",
  "imp.browse": "browse",
  "imp.accept": "consumer_id, month, kwh · max 5,000 rows",
  "imp.preview": "Preview",
  "imp.errors": "Issues found",
  "imp.ready": "rows ready",
  "imp.meters": "meters matched",
  "imp.profiling": "Profiling",
  "imp.scoring": "Scoring",
  "imp.explaining": "Explaining",
  "imp.done": "Detection complete",
  "imp.empty": "No file yet",
  "imp.tooMany": "Too many rows — trim to 5,000.",

  "field.title": "Field Inspector",
  "field.sub": "Today's route, ranked by recoverable loss. Open a stop for evidence and outcome.",
  "field.stops": "stops",
  "field.distance": "Route distance",
  "field.eta": "Est. time",
  "field.stop": "Stop",
  "field.evidence": "Evidence summary",
  "field.checklist": "On-site checklist",
  "field.seal": "Seal intact",
  "field.bypass": "Meter bypass found",
  "field.illegal": "Illegal connection",
  "field.reading": "Meter reading (kWh)",
  "field.photo": "Photo",
  "field.notes": "Notes",
  "field.confirmed": "Confirmed Theft",
  "field.falsePositive": "False Positive",
  "field.revisit": "Needs Revisit",
  "field.recorded": "Inspection recorded",
  "field.modelUpdated": "Model updated",
  "field.loading": "Loading route…",
  "field.none": "No inspections scheduled today.",
  "field.min": "min",

  "impact.title": "Recovery calculator",
  "impact.tariff": "Tariff per kWh",
  "impact.meters": "Meters covered",
  "impact.inspection": "Inspection cost",
  "impact.theft": "Avg theft per case (kWh)",
  "impact.monthly": "Monthly recovery",
  "impact.annual": "Annual recovery",
  "impact.payback": "Payback period",
  "impact.net": "Net monthly",
  "impact.months": "months",
  "impact.assumption": "Assumes 12% of meters carry recoverable loss.",
  "impact.cumulative": "Cumulative recovery",
};

const HI = {
  "nav.monitor": "निगरानी",
  "nav.analyse": "विश्लेषण",
  "nav.system": "सिस्टम",
  "nav.command": "कमांड सेंटर",
  "nav.consumers": "उपभोक्ता और जोखिम",
  "nav.grid": "3D ग्रिड",
  "nav.live": "लाइव मॉनिटर",
  "nav.transformers": "ट्रांसफार्मर विश्लेषण",
  "nav.cases": "केस प्रबंधन",
  "nav.scenarios": "परिदृश्य लैब",
  "nav.model": "मॉडल प्रदर्शन",
  "nav.settings": "सेटिंग्स",
  "nav.field": "फील्ड निरीक्षण",
  "nav.home": "होम",
  "nav.risk": "जोखिम",
  "nav.casesShort": "केस",
  "nav.fieldShort": "फील्ड",

  "page.command": "कमांड सेंटर",
  "page.consumers": "उपभोक्ता और जोखिम",
  "page.grid": "3D ग्रिड एक्सप्लोरर",
  "page.live": "लाइव IoT मॉनिटर",
  "page.transformers": "ट्रांसफार्मर विश्लेषण",
  "page.cases": "केस प्रबंधन",
  "page.scenarios": "परिदृश्य लैब",
  "page.model": "मॉडल प्रदर्शन",
  "page.settings": "सेटिंग्स",
  "page.field": "फील्ड इंस्पेक्टर",
  "page.report": "जाँच रिपोर्ट",

  "kpi.consumers": "निगरानी में मीटर",
  "kpi.highRisk": "उच्च जोखिम मीटर",
  "kpi.openCases": "खुले केस",
  "kpi.loss": "अनुमानित हानि",
  "kpi.alerts": "सक्रिय अलर्ट",
  "kpi.latency": "पहचान विलंब",

  "cause.Normal": "सामान्य",
  "cause.Theft/Tampering": "चोरी / छेड़छाड़",
  "cause.Meter Fault": "मीटर खराबी",
  "cause.Communication Failure": "संचार विफलता",
  "cause.Legit Abnormal": "वैध असामान्य",
  "cause.Requires Review": "समीक्षा आवश्यक",

  "sev.critical": "गंभीर",
  "sev.high": "उच्च",
  "sev.medium": "मध्यम",
  "sev.low": "निम्न",

  "top.search": "खोजें या जाएँ…",
  "top.notifications": "सूचनाएँ",
  "top.settings": "सेटिंग्स",
  "top.myQueue": "मेरी जोखिम सूची",
  "top.signOut": "साइन आउट",
  "top.signIn": "साइन इन",
  "top.guest": "अतिथि विश्लेषक",
  "top.openQueue": "जोखिम सूची खोलें →",
  "top.language": "भाषा",
  "top.noAlerts": "अभी कोई अलर्ट नहीं।",

  "act.export": "निर्यात",
  "act.import": "डेटा आयात करें",
  "act.run": "पहचान चलाएँ",
  "act.sample": "नमूना CSV डाउनलोड करें",
  "act.cancel": "रद्द करें",
  "act.close": "बंद करें",
  "act.viewAll": "सभी देखें",
  "act.open": "खोलें",

  "imp.title": "मीटर रीडिंग आयात करें",
  "imp.desc": "consumer_id, month और kwh वाली CSV डालें — हर मीटर फिर से प्रोफ़ाइल, स्कोर और व्याख्या होगा।",
  "imp.drop": "CSV यहाँ छोड़ें या",
  "imp.browse": "ब्राउज़ करें",
  "imp.accept": "consumer_id, month, kwh · अधिकतम 5,000 पंक्तियाँ",
  "imp.preview": "पूर्वावलोकन",
  "imp.errors": "समस्याएँ मिलीं",
  "imp.ready": "पंक्तियाँ तैयार",
  "imp.meters": "मीटर मिले",
  "imp.profiling": "प्रोफ़ाइलिंग",
  "imp.scoring": "स्कोरिंग",
  "imp.explaining": "व्याख्या",
  "imp.done": "पहचान पूर्ण",
  "imp.empty": "अभी कोई फ़ाइल नहीं",
  "imp.tooMany": "बहुत अधिक पंक्तियाँ — 5,000 तक करें।",

  "field.title": "फील्ड इंस्पेक्टर",
  "field.sub": "आज का रूट, वसूली योग्य हानि के क्रम में। साक्ष्य और परिणाम के लिए स्टॉप खोलें।",
  "field.stops": "स्टॉप",
  "field.distance": "रूट दूरी",
  "field.eta": "अनुमानित समय",
  "field.stop": "स्टॉप",
  "field.evidence": "साक्ष्य सारांश",
  "field.checklist": "साइट चेकलिस्ट",
  "field.seal": "सील सही है",
  "field.bypass": "मीटर बायपास मिला",
  "field.illegal": "अवैध कनेक्शन",
  "field.reading": "मीटर रीडिंग (kWh)",
  "field.photo": "फ़ोटो",
  "field.notes": "टिप्पणियाँ",
  "field.confirmed": "चोरी की पुष्टि",
  "field.falsePositive": "गलत अलर्ट",
  "field.revisit": "फिर जाना है",
  "field.recorded": "निरीक्षण दर्ज हुआ",
  "field.modelUpdated": "मॉडल अद्यतन हुआ",
  "field.loading": "रूट लोड हो रहा है…",
  "field.none": "आज कोई निरीक्षण निर्धारित नहीं है।",
  "field.min": "मिनट",

  "impact.title": "वसूली कैलकुलेटर",
  "impact.tariff": "प्रति kWh टैरिफ",
  "impact.meters": "मीटर संख्या",
  "impact.inspection": "निरीक्षण लागत",
  "impact.theft": "प्रति केस औसत चोरी (kWh)",
  "impact.monthly": "मासिक वसूली",
  "impact.annual": "वार्षिक वसूली",
  "impact.payback": "लागत वसूली अवधि",
  "impact.net": "शुद्ध मासिक",
  "impact.months": "महीने",
  "impact.assumption": "मान लिया गया है कि 12% मीटरों में वसूली योग्य हानि है।",
  "impact.cumulative": "संचयी वसूली",
};

const MR = {
  "nav.monitor": "निरीक्षण",
  "nav.analyse": "विश्लेषण",
  "nav.system": "सिस्टम",
  "nav.command": "कमांड सेंटर",
  "nav.consumers": "ग्राहक आणि जोखीम",
  "nav.grid": "3D ग्रिड",
  "nav.live": "लाइव्ह मॉनिटर",
  "nav.transformers": "ट्रान्सफॉर्मर विश्लेषण",
  "nav.cases": "केस व्यवस्थापन",
  "nav.scenarios": "परिस्थिती लॅब",
  "nav.model": "मॉडेल कामगिरी",
  "nav.settings": "सेटिंग्ज",
  "nav.field": "फील्ड तपासणी",
  "nav.home": "होम",
  "nav.risk": "जोखीम",
  "nav.casesShort": "केस",
  "nav.fieldShort": "फील्ड",

  "page.command": "कमांड सेंटर",
  "page.consumers": "ग्राहक आणि जोखीम",
  "page.grid": "3D ग्रिड एक्सप्लोरर",
  "page.live": "लाइव्ह IoT मॉनिटर",
  "page.transformers": "ट्रान्सफॉर्मर विश्लेषण",
  "page.cases": "केस व्यवस्थापन",
  "page.scenarios": "परिस्थिती लॅब",
  "page.model": "मॉडेल कामगिरी",
  "page.settings": "सेटिंग्ज",
  "page.field": "फील्ड इन्स्पेक्टर",
  "page.report": "तपासणी अहवाल",

  "kpi.consumers": "निगराणीत मीटर",
  "kpi.highRisk": "उच्च जोखीम मीटर",
  "kpi.openCases": "खुली केस",
  "kpi.loss": "अंदाजे हानी",
  "kpi.alerts": "सक्रिय अलर्ट",
  "kpi.latency": "ओळख विलंब",

  "cause.Normal": "सामान्य",
  "cause.Theft/Tampering": "चोरी / छेडछाड",
  "cause.Meter Fault": "मीटर बिघाड",
  "cause.Communication Failure": "दळणवळण बिघाड",
  "cause.Legit Abnormal": "वैध असामान्य",
  "cause.Requires Review": "पुनरावलोकन आवश्यक",

  "sev.critical": "गंभीर",
  "sev.high": "उच्च",
  "sev.medium": "मध्यम",
  "sev.low": "कमी",

  "top.search": "शोधा किंवा जा…",
  "top.notifications": "सूचना",
  "top.settings": "सेटिंग्ज",
  "top.myQueue": "माझी जोखीम यादी",
  "top.signOut": "साइन आउट",
  "top.signIn": "साइन इन",
  "top.guest": "पाहुणे विश्लेषक",
  "top.openQueue": "जोखीम यादी उघडा →",
  "top.language": "भाषा",
  "top.noAlerts": "सध्या कोणतेही अलर्ट नाहीत.",

  "act.export": "निर्यात",
  "act.import": "डेटा आयात करा",
  "act.run": "ओळख चालवा",
  "act.sample": "नमुना CSV डाउनलोड करा",
  "act.cancel": "रद्द करा",
  "act.close": "बंद करा",
  "act.viewAll": "सर्व पहा",
  "act.open": "उघडा",

  "imp.title": "मीटर रीडिंग आयात करा",
  "imp.desc": "consumer_id, month आणि kwh असलेली CSV टाका — प्रत्येक मीटर पुन्हा प्रोफाइल, स्कोअर आणि स्पष्टीकरण होईल.",
  "imp.drop": "CSV येथे टाका किंवा",
  "imp.browse": "ब्राउझ करा",
  "imp.accept": "consumer_id, month, kwh · कमाल 5,000 ओळी",
  "imp.preview": "पूर्वावलोकन",
  "imp.errors": "अडचणी आढळल्या",
  "imp.ready": "ओळी तयार",
  "imp.meters": "मीटर जुळले",
  "imp.profiling": "प्रोफाइलिंग",
  "imp.scoring": "स्कोअरिंग",
  "imp.explaining": "स्पष्टीकरण",
  "imp.done": "ओळख पूर्ण",
  "imp.empty": "अजून फाइल नाही",
  "imp.tooMany": "खूप ओळी — 5,000 पर्यंत करा.",

  "field.title": "फील्ड इन्स्पेक्टर",
  "field.sub": "आजचा मार्ग, वसुलीयोग्य हानीच्या क्रमाने. पुरावा आणि निकालासाठी स्टॉप उघडा.",
  "field.stops": "स्टॉप",
  "field.distance": "मार्ग अंतर",
  "field.eta": "अंदाजे वेळ",
  "field.stop": "स्टॉप",
  "field.evidence": "पुरावा सारांश",
  "field.checklist": "साइट चेकलिस्ट",
  "field.seal": "सील ठीक आहे",
  "field.bypass": "मीटर बायपास आढळला",
  "field.illegal": "बेकायदेशीर जोडणी",
  "field.reading": "मीटर रीडिंग (kWh)",
  "field.photo": "फोटो",
  "field.notes": "टिपा",
  "field.confirmed": "चोरीची खात्री",
  "field.falsePositive": "खोटा अलर्ट",
  "field.revisit": "पुन्हा भेट",
  "field.recorded": "तपासणी नोंदवली",
  "field.modelUpdated": "मॉडेल अद्ययावत झाले",
  "field.loading": "मार्ग लोड होत आहे…",
  "field.none": "आज कोणतीही तपासणी नियोजित नाही.",
  "field.min": "मिनिटे",

  "impact.title": "वसुली कॅल्क्युलेटर",
  "impact.tariff": "प्रति kWh दर",
  "impact.meters": "मीटर संख्या",
  "impact.inspection": "तपासणी खर्च",
  "impact.theft": "प्रति केस सरासरी चोरी (kWh)",
  "impact.monthly": "मासिक वसुली",
  "impact.annual": "वार्षिक वसुली",
  "impact.payback": "खर्च वसुली कालावधी",
  "impact.net": "निव्वळ मासिक",
  "impact.months": "महिने",
  "impact.assumption": "12% मीटरमध्ये वसुलीयोग्य हानी आहे असे गृहीत धरले आहे.",
  "impact.cumulative": "एकत्रित वसुली",
};

const DICT = { en: EN, hi: HI, mr: MR };
const STORAGE_KEY = "volsentra-lang";

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && DICT[saved]) setLangState(saved);
    } catch {
      /* storage blocked — English is fine */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next) => {
    if (!DICT[next]) return;
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({ lang, setLang, t: (key) => DICT[lang]?.[key] ?? EN[key] ?? key }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useI18n must be used inside LangProvider");
  return ctx;
}