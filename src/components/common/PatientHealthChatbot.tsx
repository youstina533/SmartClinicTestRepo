import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  ChevronDown,
  Stethoscope,
  Heart,
  Activity,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    tab: string;
  };
}

interface PatientHealthChatbotProps {
  onNavigate?: (tab: string, context?: any) => void;
}

const CANNED_KNOWLEDGE_BASE: Record<
  string,
  { reply: string; action?: { label: string; tab: string } }
> = {
  diabetes: {
    reply: `Diabetes is a metabolic condition where your body either cannot produce enough insulin (Type 1) or cannot effectively utilize insulin (Type 2), leading to elevated blood glucose.

Key Insights:
• Normal Fasting Glucose: Under 100 mg/dL.
• Elevated / Prediabetes: 100 – 125 mg/dL.
• High Risk / Diabetes: 126 mg/dL or higher on fasting blood work.
• Key Risk Factors: High BMI (>30 kg/m²), elevated blood pressure, physical inactivity, and family pedigree.

Management Tips: Prioritize fiber-rich whole foods, limit refined sugars, engage in regular aerobic movement, and consult our endocrinologists for personalized care.`,
    action: { label: 'Calculate Diabetes Risk', tab: 'enter-health-data' },
  },

  'blood pressure': {
    reply: `Blood pressure measures the hydrostatic force of circulating blood against your arterial walls. High blood pressure (hypertension) places excess workload on the heart.

Evidence-Based Strategies to Lower Blood Pressure:
1. Reduce Dietary Sodium: Keep daily sodium intake under 2,000–2,300 mg (DASH diet).
2. Exercise Consistently: Aim for at least 150 minutes of moderate aerobic activity weekly (e.g., brisk walking, cycling).
3. Weight Management: Maintaining a BMI between 18.5 and 24.9 significantly lowers resting systolic/diastolic pressure.
4. Potassium-Rich Foods: Leafy greens, avocados, and bananas help balance sodium levels.
5. Stress Management & Sleep: Prioritize 7–9 hours of sleep and regular relaxation techniques.`,
    action: { label: 'Consult a Heart Specialist', tab: 'doctors-directory' },
  },

  report: {
    reply: `Reading your SmartClinic Health Risk Report:

Our AI simulation classifies your overall disease likelihood into three clinical risk tiers:
• 🟢 Low Risk (< 40%): Your biometric markers are within healthy standard limits. Continue routine checkups and balanced wellness.
• 🟠 Medium Risk (40% - 70%): Moderate risk detected. Lifestyle interventions (diet, weight loss, salt reduction) are strongly advised to prevent disease onset.
• 🔴 High Risk (> 70%): High probability of metabolic or cardiovascular disease. Immediate clinical consultation with an endocrinologist or cardiologist is recommended.

Each report also highlights your specific Biomarker Drivers (such as elevated Glucose > 140 or BMI > 30) and tailored clinical advice.`,
    action: { label: 'View All Reports', tab: 'all-reports' },
  },

  heart: {
    reply: `Cardiovascular disease refers to conditions affecting the heart and blood vessels, including coronary artery disease, arrhythmias, and hypertension.

Key Biomarkers in our Assessment:
• Resting Blood Pressure: Target < 120/80 mmHg.
• Serum Cholesterol: Total target ideally < 200 mg/dL.
• Maximum Heart Rate (MaxHR): Measured during peak exertion.
• Exercise Angina: Chest pain or constriction during physical activity.
• ST Slope & Resting ECG: Electrocardiogram metrics indicating myocardial blood flow.`,
    action: { label: 'Check Cardiovascular Risk', tab: 'enter-health-data' },
  },

  doctor: {
    reply: `When to See a Specialist:
• If your SmartClinic AI Risk Score is High (>70%).
• Fasting glucose consistently above 140 mg/dL or blood pressure above 140/90 mmHg.
• Experiencing shortness of breath, unexplained chest tightness, or chronic fatigue.

You can book directly with approved Diabetes and Heart specialists on our platform with zero booking fees!`,
    action: { label: 'Browse Clinic Doctors', tab: 'doctors-directory' },
  },
};

const QUICK_CHIPS = [
  'What is diabetes?',
  'How to lower blood pressure?',
  'How to read my report?',
  'What is cardiovascular risk?',
  'When should I see a doctor?',
];

export const PatientHealthChatbot: React.FC<PatientHealthChatbotProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: `Hello! I'm your SmartClinic AI Health Assistant. I can answer common questions about Diabetes, Blood Pressure, and how to read your diagnostic reports.

How can I help you today?`,
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = query.toLowerCase();
      let matchedResponse: { reply: string; action?: { label: string; tab: string } };

      if (lower.includes('diabet') || lower.includes('glucose') || lower.includes('sugar') || lower.includes('insulin')) {
        matchedResponse = CANNED_KNOWLEDGE_BASE['diabetes'];
      } else if (lower.includes('blood pressure') || lower.includes('hypertension') || lower.includes('bp') || lower.includes('lower')) {
        matchedResponse = CANNED_KNOWLEDGE_BASE['blood pressure'];
      } else if (lower.includes('report') || lower.includes('read') || lower.includes('score') || lower.includes('result') || lower.includes('gauge')) {
        matchedResponse = CANNED_KNOWLEDGE_BASE['report'];
      } else if (lower.includes('heart') || lower.includes('cardio') || lower.includes('cholesterol') || lower.includes('chest pain') || lower.includes('angina')) {
        matchedResponse = CANNED_KNOWLEDGE_BASE['heart'];
      } else if (lower.includes('doctor') || lower.includes('specialist') || lower.includes('appointment') || lower.includes('book') || lower.includes('when')) {
        matchedResponse = CANNED_KNOWLEDGE_BASE['doctor'];
      } else {
        matchedResponse = {
          reply: `Thank you for your question! Here are key areas I can guide you on:

• Diabetes risk factors and glucose targets
• Practical steps to lower resting blood pressure
• Interpreting your SmartClinic diagnostic risk scores
• Booking appointments with our approved specialists

Feel free to click one of the quick questions below or enter your biometrics in the Health Data form.`,
          action: { label: 'Take AI Health Assessment', tab: 'enter-health-data' },
        };
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: matchedResponse.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: matchedResponse.action,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-3.5 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white shadow-xl shadow-teal-700/30 transition-all duration-300 hover:scale-105 cursor-pointer"
          title="Ask SmartClinic Health Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-teal-600 rounded-full"></span>
          </div>
          <span className="text-xs font-bold tracking-wide pr-1 hidden sm:inline">
            SmartClinic Health Bot
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
            AI Help
          </span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-[92vw] sm:w-[410px] h-[580px] max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-teal-200">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold">SmartClinic Health Bot</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[10px] text-teal-200">Instant Automated Medical FAQs</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-teal-200 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mandatory Medical Disclaimer Banner */}
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-[11px] text-amber-900 flex items-start gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Medical Disclaimer:</strong> This chatbot provides general educational guidance only and is <u>not medical advice</u>. Consult a licensed physician for clinical decisions.
            </p>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-tr-xs font-medium'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  <p className="text-xs">{msg.text}</p>

                  {/* Optional Quick Call-to-action button inside reply */}
                  {msg.suggestedAction && onNavigate && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          onNavigate(msg.suggestedAction!.tab);
                          setIsOpen(false);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[11px] transition border border-teal-200 cursor-pointer"
                      >
                        <span>{msg.suggestedAction.label}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white px-3 py-2 rounded-2xl border border-slate-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 text-[10px] font-semibold transition border border-slate-200/60 cursor-pointer shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about diabetes, blood pressure, reports..."
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl transition disabled:opacity-40 cursor-pointer shrink-0 shadow-sm"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
