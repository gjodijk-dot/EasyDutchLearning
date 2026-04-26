import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

/*
 * Voegwoorden A1–A2 met betaalmuur
 * Flow: landingspagina → Stripe betaling → account aanmaken → app
 *
 * Supabase project: nmehrffvmsudlyoutbia (eu-north-1)
 */

// ─── CONFIGURATIE ────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://nmehrffvmsudlyoutbia.supabase.co";
const SUPABASE_ANON_KEY = "JOUW_SUPABASE_ANON_KEY"; // ← plak hier je anon key uit Supabase dashboard → Settings → API
const STRIPE_CHECKOUT_URL = "https://buy.stripe.com/test_aFa6oI6PGbvh0AA4nY0Fi00";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── KLEUREN (zelfde als bestaande apps) ────────────────────────────────────
const C = {
  bg: "#f7f5f0",
  card: "#ffffff",
  accent: "#2d6a4f",
  accentSoft: "#d8f0e3",
  accentDark: "#1b4332",
  orange: "#e67e22",
  orangeSoft: "#fef3e2",
  text: "#2c3e50",
  textLight: "#7f8c8d",
  border: "#e8e4dd",
  correct: "#27ae60",
  correctBg: "#e8f8f0",
  wrong: "#c0392b",
  wrongBg: "#fdedec",
  warm: "#fdf6e3",
};

// ─── DEMO DATA (subset voegwoorden) ─────────────────────────────────────────
const DEMO_EXERCISES = [
  {
    sentence: "Ik ben moe, ___ ik ga toch werken.",
    answer: "maar",
    options: ["maar", "want", "en", "of"],
    explNl: "'Maar' geeft een tegenstelling aan: je verwacht iets anders dan wat er volgt.",
    explEn: "'Maar' shows contrast: you expect something different from what follows.",
  },
  {
    sentence: "Wil je thee ___ koffie?",
    answer: "of",
    options: ["of", "en", "maar", "want"],
    explNl: "'Of' geeft een keuze aan tussen twee mogelijkheden.",
    explEn: "'Of' (or) presents a choice between two options.",
  },
  {
    sentence: "Ik ga niet mee ___ ik ben ziek.",
    answer: "want",
    options: ["want", "maar", "dat", "of"],
    explNl: "'Want' geeft de reden aan. Let op: na 'want' blijft de woordvolgorde normaal.",
    explEn: "'Want' (because/for) gives the reason. Note: word order stays normal after 'want'.",
  },
];

// ─── HULP-COMPONENTEN ────────────────────────────────────────────────────────

function LangToggle({ lang, setLang }) {
  return (
    <button
      onClick={() => setLang(lang === "nl" ? "en" : "nl")}
      style={{
        padding: "6px 14px", borderRadius: 20,
        border: `1.5px solid rgba(255,255,255,0.5)`,
        background: "rgba(255,255,255,0.15)",
        color: "#fff", fontWeight: 700, fontSize: 13,
        cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.2s",
      }}
    >
      {lang === "nl" ? "🇬🇧 English" : "🇳🇱 Nederlands"}
    </button>
  );
}

function Input({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6 }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "12px 14px", borderRadius: 10,
          border: `1.5px solid ${C.border}`, background: "#fff",
          fontSize: 15, color: C.text, fontFamily: "inherit",
          outline: "none", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

function PrimaryBtn({ onClick, children, disabled, fullWidth }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: fullWidth ? "100%" : "auto",
        padding: "14px 24px", borderRadius: 12,
        background: disabled ? C.border : `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
        color: disabled ? C.textLight : "#fff",
        border: "none", fontWeight: 800, fontSize: 16,
        cursor: disabled ? "default" : "pointer", fontFamily: "inherit",
        transition: "all 0.2s",
      }}
    >
      {children}
    </button>
  );
}

// ─── SCHERM 1: LANDINGSPAGINA ────────────────────────────────────────────────

function LandingScreen({ lang, setLang, onBuy, onLogin }) {
  const nl = lang === "nl";
  const features = nl
    ? ["📚 Alle voegwoorden A1 & A2", "✏️ Oefeningen met directe feedback", "💡 Uitleg bij elk antwoord", "🌍 Nederlands & Engels", "♾️ Levenslang toegang"]
    : ["📚 All conjunctions A1 & A2", "✏️ Exercises with instant feedback", "💡 Explanation for every answer", "🌍 Dutch & English", "♾️ Lifetime access"];

  return (
    <div>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
        padding: "40px 20px 36px", color: "#fff", textAlign: "center",
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.65, marginBottom: 12 }}>
            {nl ? "Leer Nederlands" : "Learn Dutch"}
          </div>
          <div style={{ fontSize: 32, fontWeight: 900, lineHeight: 1.2, marginBottom: 10 }}>
            {nl ? "Voegwoorden A1–A2" : "Dutch Conjunctions A1–A2"}
          </div>
          <div style={{ fontSize: 16, opacity: 0.8, lineHeight: 1.6, marginBottom: 28 }}>
            {nl
              ? "Leer alle voegwoorden die je nodig hebt voor het inburgeringsexamen."
              : "Master all conjunctions you need for the Dutch integration exam."}
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            <PrimaryBtn onClick={onBuy}>
              {nl ? "Kopen — €4,99" : "Buy — €4.99"}
            </PrimaryBtn>
            <button
              onClick={onLogin}
              style={{
                padding: "14px 20px", borderRadius: 12,
                border: "1.5px solid rgba(255,255,255,0.5)",
                background: "transparent", color: "#fff",
                fontWeight: 700, fontSize: 15,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {nl ? "Inloggen" : "Log in"}
            </button>
          </div>
          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.6 }}>
            {nl ? "Eenmalige betaling · geen abonnement" : "One-time payment · no subscription"}
          </div>
        </div>
        <div style={{ position: "absolute", top: 16, right: 20 }}>
          <LangToggle lang={lang} setLang={setLang} />
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px 0" }}>
        <div style={{
          background: C.card, borderRadius: 16, border: `1px solid ${C.border}`,
          padding: "24px 20px", marginBottom: 20,
        }}>
          <div style={{ fontWeight: 800, fontSize: 16, color: C.accent, marginBottom: 16 }}>
            {nl ? "Wat krijg je?" : "What's included?"}
          </div>
          {features.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 0",
              borderBottom: i < features.length - 1 ? `1px solid ${C.border}` : "none",
              fontSize: 14, color: C.text,
            }}>
              {f}
            </div>
          ))}
        </div>

        {/* Preview card */}
        <div style={{
          background: C.warm, borderRadius: 16, border: `1px solid ${C.border}`,
          padding: "20px", marginBottom: 20,
        }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: C.textLight, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {nl ? "Voorbeeld oefening" : "Example exercise"}
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, color: C.text, lineHeight: 1.7 }}>
            Ik ben moe,{" "}
            <span style={{
              color: C.accent, fontWeight: 800,
              borderBottom: `2px solid ${C.accent}`,
              padding: "0 4px",
            }}>maar</span>
            {" "}ik ga toch werken.
          </div>
          <div style={{ fontSize: 13, color: C.textLight, marginTop: 8 }}>
            {nl ? "✓ Met uitleg bij elk antwoord" : "✓ With explanation for every answer"}
          </div>
        </div>

        <PrimaryBtn onClick={onBuy} fullWidth>
          {nl ? "Nu kopen — €4,99 →" : "Buy now — €4.99 →"}
        </PrimaryBtn>
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 13, color: C.textLight }}>
          {nl ? "Al een account?" : "Already have an account?"}{" "}
          <span onClick={onLogin} style={{ color: C.accent, fontWeight: 700, cursor: "pointer" }}>
            {nl ? "Inloggen" : "Log in"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── SCHERM 2: STRIPE CHECKOUT ──────────────────────────────────────────────
// Stripe doet alles zelf — wij sturen de gebruiker direct door.
// Na betaling stuurt Stripe terug naar jouw URL + ?success=true
// Stel dit in via: Stripe Dashboard → Betaallinks → Bewerken → Bevestigingspagina → Doorsturen naar URL

function CheckoutScreen({ lang, onBack }) {
  const nl = lang === "nl";

  return (
    <div style={{ maxWidth: 420, margin: "0 auto", padding: "40px 20px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
      <div style={{ fontWeight: 900, fontSize: 20, color: C.text, marginBottom: 10 }}>
        {nl ? "Veilig betalen via Stripe" : "Secure payment via Stripe"}
      </div>
      <div style={{ color: C.textLight, fontSize: 14, marginBottom: 28, lineHeight: 1.7 }}>
        {nl
          ? "Je wordt doorgestuurd naar de beveiligde betaalpagina van Stripe. Na betaling keer je automatisch terug om je account aan te maken."
          : "You'll be redirected to Stripe's secure payment page. After payment you'll return here to create your account."}
      </div>
      <PrimaryBtn onClick={() => { window.location.href = STRIPE_CHECKOUT_URL; }} fullWidth>
        {nl ? "Naar betaalpagina — €4,99 →" : "Go to payment — €4.99 →"}
      </PrimaryBtn>
      <button onClick={onBack} style={{
        width: "100%", marginTop: 10, padding: "10px",
        background: "transparent", border: "none",
        color: C.textLight, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
      }}>
        ← {nl ? "Terug" : "Back"}
      </button>
    </div>
  );
}

// ─── SCHERM 3: REGISTREER / LOGIN ────────────────────────────────────────────

function AuthScreen({ lang, mode, onSuccess, onBack, onToggleMode }) {
  const nl = lang === "nl";
  const isRegister = mode === "register";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit() {
    if (!email || !password) { setError(nl ? "Vul alle velden in." : "Please fill in all fields."); return; }
    if (password.length < 6) { setError(nl ? "Wachtwoord minimaal 6 tekens." : "Password must be at least 6 characters."); return; }
    setLoading(true);
    setError("");

    if (isRegister) {
      // Nieuw account aanmaken via Supabase Auth
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
    } else {
      // Inloggen met bestaand account
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(nl ? "E-mail of wachtwoord klopt niet." : "Incorrect email or password.");
        setLoading(false);
        return;
      }
    }

    // Controleer of deze gebruiker een aankoop heeft
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: purchases } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (!purchases || purchases.length === 0) {
        // Geen aankoop gevonden → toon betaalmuur
        setError(nl
          ? "Geen aankoop gevonden. Koop de app eerst via de betaalpagina."
          : "No purchase found. Please buy the app first.");
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onSuccess();
  }

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", padding: "24px 20px" }}>
      <div style={{
        background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, padding: "28px 24px",
      }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🌿</div>
          <div style={{ fontWeight: 900, fontSize: 20, color: C.text }}>
            {isRegister ? (nl ? "Account aanmaken" : "Create account") : (nl ? "Inloggen" : "Log in")}
          </div>
          <div style={{ fontSize: 13, color: C.textLight, marginTop: 4 }}>
            {nl ? "Voegwoorden A1–A2" : "Dutch Conjunctions A1–A2"}
          </div>
        </div>

        <Input label="E-mail" type="email" value={email} onChange={setEmail} placeholder="jan@example.com" />
        <Input
          label={nl ? "Wachtwoord" : "Password"}
          type="password"
          value={password}
          onChange={setPassword}
          placeholder={isRegister ? (nl ? "Minimaal 6 tekens" : "At least 6 characters") : "••••••••"}
        />

        {error && (
          <div style={{
            background: C.wrongBg, borderLeft: `3px solid ${C.wrong}`,
            borderRadius: "0 8px 8px 0", padding: "10px 12px",
            fontSize: 13, color: C.wrong, marginBottom: 14,
          }}>
            {error}
          </div>
        )}

        <PrimaryBtn onClick={submit} fullWidth disabled={loading}>
          {loading
            ? (nl ? "Bezig..." : "Loading...")
            : isRegister
              ? (nl ? "Account aanmaken →" : "Create account →")
              : (nl ? "Inloggen →" : "Log in →")}
        </PrimaryBtn>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: C.textLight }}>
          {isRegister
            ? (nl ? "Al een account?" : "Already have an account?")
            : (nl ? "Nog geen account?" : "No account yet?")}
          {" "}
          <span onClick={onToggleMode} style={{ color: C.accent, fontWeight: 700, cursor: "pointer" }}>
            {isRegister ? (nl ? "Inloggen" : "Log in") : (nl ? "Registreren" : "Sign up")}
          </span>
        </div>

        <button onClick={onBack} style={{
          width: "100%", marginTop: 8, padding: "10px",
          background: "transparent", border: "none",
          color: C.textLight, fontSize: 13, cursor: "pointer", fontFamily: "inherit",
        }}>
          ← {nl ? "Terug" : "Back"}
        </button>
      </div>


    </div>
  );
}

// ─── SCHERM 4: DE ECHTE APP (achter de betaalmuur) ──────────────────────────

function AppScreen({ lang, setLang, onLogout }) {
  const nl = lang === "nl";
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const ex = DEMO_EXERCISES[current];

  function pick(opt) {
    if (selected) return;
    setSelected(opt);
    if (opt === ex.answer) setScore(s => s + 1);
  }

  function next() {
    if (current + 1 >= DEMO_EXERCISES.length) { setDone(true); return; }
    setCurrent(c => c + 1);
    setSelected(null);
  }

  function restart() {
    setCurrent(0); setSelected(null); setScore(0); setDone(false);
  }

  return (
    <div style={{ fontFamily: "inherit" }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
        padding: "20px 20px 16px", color: "#fff",
      }}>
        <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.6, marginBottom: 2 }}>
              {nl ? "Ingelogd" : "Logged in"} · 🔓
            </div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>
              {nl ? "Voegwoorden A1–A2" : "Conjunctions A1–A2"}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <LangToggle lang={lang} setLang={setLang} />
            <button onClick={onLogout} style={{
              padding: "6px 12px", borderRadius: 20,
              border: "1.5px solid rgba(255,255,255,0.3)",
              background: "transparent", color: "rgba(255,255,255,0.7)",
              fontSize: 12, cursor: "pointer", fontFamily: "inherit",
            }}>
              {nl ? "Uitloggen" : "Log out"}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 16px 60px" }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {score === DEMO_EXERCISES.length ? "🏆" : score >= 2 ? "⭐" : "📚"}
            </div>
            <div style={{ fontWeight: 900, fontSize: 22, color: C.text, marginBottom: 8 }}>
              {score}/{DEMO_EXERCISES.length} {nl ? "goed" : "correct"}
            </div>
            <div style={{ color: C.textLight, fontSize: 14, marginBottom: 24 }}>
              {score === DEMO_EXERCISES.length
                ? (nl ? "Uitstekend! Je kent deze voegwoorden goed." : "Excellent! You know these conjunctions well.")
                : (nl ? "Goed geprobeerd! Oefen nog een keer." : "Good try! Practice once more.")}
            </div>
            <PrimaryBtn onClick={restart} fullWidth>
              {nl ? "Opnieuw oefenen →" : "Practice again →"}
            </PrimaryBtn>
            <div style={{ marginTop: 12, fontSize: 13, color: C.textLight }}>
              {nl ? "Dit is een demo met 3 vragen. De volledige app heeft 50+ oefeningen." : "This is a demo with 3 questions. The full app has 50+ exercises."}
            </div>
          </div>
        ) : (
          <div>
            {/* Progress */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20, justifyContent: "center" }}>
              {DEMO_EXERCISES.map((_, i) => (
                <div key={i} style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: i < current ? C.correct : i === current ? C.accent : C.border,
                  transition: "all 0.3s",
                }} />
              ))}
            </div>

            {/* Zin */}
            <div style={{
              background: C.warm, border: `1px solid ${C.border}`, borderRadius: 14,
              padding: "24px 20px", marginBottom: 20, textAlign: "center",
              fontSize: 19, fontWeight: 600, lineHeight: 1.6, color: C.text,
            }}>
              {ex.sentence.split("___").map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && (
                    <span style={{
                      display: "inline-block", minWidth: 80, padding: "2px 6px", margin: "0 3px",
                      borderBottom: `3px solid ${selected ? (selected === ex.answer ? C.correct : C.wrong) : C.orange}`,
                      color: selected ? (selected === ex.answer ? C.correct : C.wrong) : C.orange,
                      fontWeight: 800, transition: "all 0.3s",
                    }}>
                      {selected || "..."}
                    </span>
                  )}
                </span>
              ))}
            </div>

            {/* Knoppen */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {ex.options.map(opt => {
                let bg = C.card, border = C.border, col = C.text;
                if (selected) {
                  if (opt === ex.answer) { bg = C.correctBg; border = C.correct; col = C.correct; }
                  else if (opt === selected) { bg = C.wrongBg; border = C.wrong; col = C.wrong; }
                }
                return (
                  <button key={opt} onClick={() => pick(opt)} disabled={!!selected} style={{
                    padding: "14px", borderRadius: 10, border: `2px solid ${border}`,
                    background: bg, color: col, fontWeight: 700, fontSize: 16,
                    cursor: selected ? "default" : "pointer", fontFamily: "inherit",
                    opacity: selected && opt !== ex.answer && opt !== selected ? 0.4 : 1,
                    transition: "all 0.2s",
                  }}>
                    {opt}{selected && opt === ex.answer && " ✓"}{selected && opt === selected && opt !== ex.answer && " ✗"}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {selected && (
              <div style={{
                background: selected === ex.answer ? C.correctBg : C.wrongBg,
                borderLeft: `3px solid ${selected === ex.answer ? C.correct : C.wrong}`,
                borderRadius: "0 12px 12px 0", padding: "14px 16px", marginBottom: 16,
                animation: "fadeSlide 0.3s ease",
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: selected === ex.answer ? C.correct : C.wrong, marginBottom: 4 }}>
                  {selected === ex.answer
                    ? (nl ? "✓ Goed zo!" : "✓ Correct!")
                    : (nl ? `✗ Het goede antwoord is: ${ex.answer}` : `✗ The correct answer is: ${ex.answer}`)}
                </div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>
                  {nl ? ex.explNl : ex.explEn}
                </div>
              </div>
            )}

            {selected && (
              <button onClick={next} style={{
                width: "100%", padding: "14px", borderRadius: 12,
                background: `linear-gradient(135deg, ${C.accentDark}, ${C.accent})`,
                color: "#fff", border: "none", fontWeight: 800, fontSize: 16,
                cursor: "pointer", fontFamily: "inherit",
              }}>
                {current + 1 >= DEMO_EXERCISES.length
                  ? (nl ? "Bekijk resultaat →" : "See results →")
                  : (nl ? "Volgende →" : "Next →")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── HOOFD APP ───────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState("loading"); // loading | landing | checkout | auth | app
  const [authMode, setAuthMode] = useState("register");
  const [lang, setLang] = useState("nl");

  // Bij opstarten: check of gebruiker al is ingelogd én betaald heeft
  useEffect(() => {
    async function checkSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setScreen("landing"); return; }

      const { data: purchases } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      setScreen(purchases && purchases.length > 0 ? "app" : "landing");
    }
    checkSession();

    // Luister naar auth wijzigingen (bv. na e-mailbevestiging)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => checkSession());
    return () => subscription.unsubscribe();
  }, []);

  // Stripe stuurt gebruiker terug met ?success=true in de URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      window.history.replaceState({}, "", window.location.pathname);
      setAuthMode("register");
      setScreen("auth");
    }
  }, []);

  function handleBuy() { setScreen("checkout"); }
  function handleCheckoutSuccess() { setAuthMode("register"); setScreen("auth"); }
  function handleLoginClick() { setAuthMode("login"); setScreen("auth"); }
  function handleAuthSuccess() { setScreen("app"); }
  async function handleLogout() {
    await supabase.auth.signOut();
    setScreen("landing");
  }

  if (screen === "loading") {
    return (
      <div style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif", background: C.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: C.textLight }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌿</div>
          <div style={{ fontSize: 14 }}>Laden...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Nunito', 'Segoe UI', sans-serif", background: C.bg, minHeight: "100vh", position: "relative" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeSlide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; margin: 0; }
        button:hover { filter: brightness(0.96); }
        input:focus { border-color: #2d6a4f !important; box-shadow: 0 0 0 3px #d8f0e3; }
      `}</style>

      {screen === "landing" && (
        <LandingScreen lang={lang} setLang={setLang} onBuy={handleBuy} onLogin={handleLoginClick} />
      )}
      {screen === "checkout" && (
        <CheckoutScreen lang={lang} onSuccess={handleCheckoutSuccess} onBack={() => setScreen("landing")} />
      )}
      {screen === "auth" && (
        <AuthScreen
          lang={lang}
          mode={authMode}
          onSuccess={handleAuthSuccess}
          onBack={() => setScreen(authMode === "login" ? "landing" : "checkout")}
          onToggleMode={() => setAuthMode(m => m === "register" ? "login" : "register")}
        />
      )}
      {screen === "app" && (
        <AppScreen lang={lang} setLang={setLang} onLogout={handleLogout} />
      )}
    </div>
  );
}
