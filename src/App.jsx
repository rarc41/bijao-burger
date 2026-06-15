import { useState, useEffect, useCallback } from "react";
import { loadData, saveData, emptyData, isShared } from "./storage.js";

// ---------------------------------------------------------------
// BIJAO BURGER — Demo / Prueba de concepto
// Fichas de participantes, votación con código de compra,
// ranking en vivo y panel privado del organizador.
// ---------------------------------------------------------------

const PALETTE = {
  verde: "#1F5233",
  verdeOscuro: "#143823",
  carbon: "#221B14",
  pan: "#E8A33D",
  crema: "#FBF5EA",
  tomate: "#C8442C",
  humo: "#6E665B",
};

const BURGERS = [
  {
    id: "fogon",
    local: "El Fogón de la 10",
    burger: "La Montañera",
    desc: "Carne madurada 180 g, chicharrón crocante, hogao de la casa y queso costeño fundido. Servida sobre hoja de bijao.",
    precio: 22000,
    zona: "Parque principal",
    emoji: "🔥",
  },
  {
    id: "brasas",
    local: "Brasas del Río",
    burger: "Bijao Ahumada",
    desc: "Carne ahumada en leña de guayabo, tocineta, suero costeño y tajadas de maduro caramelizado.",
    precio: 24000,
    zona: "Malecón",
    emoji: "🌊",
  },
  {
    id: "nelly",
    local: "Donde Nelly",
    burger: "La Patrona",
    desc: "Doble carne artesanal, queso doble crema, cebolla encurtida en panela y salsa secreta de la casa.",
    precio: 21000,
    zona: "Calle del comercio",
    emoji: "👑",
  },
  {
    id: "chamba",
    local: "La Chamba Burger",
    burger: "Verde Monte",
    desc: "Carne de res y cerdo, guacamole rústico, queso campesino a la plancha y crocante de plátano verde.",
    precio: 19000,
    zona: "Barrio Obrero",
    emoji: "🌿",
  },
  {
    id: "tunel",
    local: "Asados El Túnel",
    burger: "La Trasnochadora",
    desc: "Carne a la parrilla, huevo de campo, papitas ripio dentro de la burger y mayonesa de ají dulce.",
    precio: 18000,
    zona: "Salida vía principal",
    emoji: "🌙",
  },
  {
    id: "munchies",
    local: "Munchies Parrilla",
    burger: "Tropical Smash",
    desc: "Smash doble, piña asada al carbón, tocineta, queso cheddar y reducción de borojó.",
    precio: 23000,
    zona: "Centro comercial",
    emoji: "🍍",
  },
];

const formatCOP = (n) =>
  "$" + n.toLocaleString("es-CO", { maximumFractionDigits: 0 });

// --------------------------- UI ---------------------------------

function LeafPattern() {
  return (
    <svg
      viewBox="0 0 400 90"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.16 }}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {[0, 90, 180, 270, 360].map((x, i) => (
        <g key={i} transform={`translate(${x} ${i % 2 ? 10 : 35}) rotate(${i % 2 ? -18 : 14})`}>
          <ellipse cx="40" cy="28" rx="44" ry="20" fill="#FBF5EA" />
          <line x1="-4" y1="28" x2="84" y2="28" stroke={PALETTE.verde} strokeWidth="2" />
          {[-30, -15, 0, 15, 30].map((dx) => (
            <line
              key={dx}
              x1={40 + dx}
              y1="28"
              x2={40 + dx + 10}
              y2={dx % 2 ? 10 : 46}
              stroke={PALETTE.verde}
              strokeWidth="1.4"
            />
          ))}
        </g>
      ))}
    </svg>
  );
}

function Header({ totalVotes }) {
  return (
    <header
      style={{ background: PALETTE.verde, color: PALETTE.crema, position: "relative", overflow: "hidden" }}
      className="px-5 pt-6 pb-5"
    >
      <LeafPattern />
      <div style={{ position: "relative" }}>
        <p
          className="bb-body"
          style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: PALETTE.pan, fontWeight: 700, margin: 0 }}
        >
          Festival gastronómico · 1.ª edición
        </p>
        <h1 className="bb-display" style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.02, marginTop: 4, marginBottom: 0 }}>
          Bijao
          <br />
          Burger
        </h1>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: PALETTE.verdeOscuro }}>
          <span style={{ width: 8, height: 8, borderRadius: 99, background: PALETTE.pan, display: "inline-block" }} />
          <span className="bb-body" style={{ fontSize: 13, fontWeight: 600 }}>
            {totalVotes} {totalVotes === 1 ? "voto registrado" : "votos registrados"} en vivo
          </span>
        </div>
      </div>
    </header>
  );
}

function BurgerCard({ b, onVote, voted }) {
  return (
    <article
      className="bb-pop rounded-2xl overflow-hidden"
      style={{ background: "#fff", border: "1px solid #E7DFD2", boxShadow: "0 2px 10px rgba(34,27,20,0.06)" }}
    >
      <div className="flex items-stretch">
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 84, background: PALETTE.verde, fontSize: 36 }}
          aria-hidden="true"
        >
          {b.emoji}
        </div>
        <div className="p-4 flex-1 min-w-0">
          <p
            className="bb-body"
            style={{ fontSize: 11, color: PALETTE.humo, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, margin: 0 }}
          >
            {b.local} · {b.zona}
          </p>
          <h3 className="bb-display" style={{ fontSize: 20, fontWeight: 800, color: PALETTE.carbon, marginTop: 2, marginBottom: 0 }}>
            {b.burger}
          </h3>
          <p className="bb-body mt-1" style={{ fontSize: 13, color: "#4C453C", lineHeight: 1.45, marginBottom: 0 }}>
            {b.desc}
          </p>
          <div className="flex items-center justify-between mt-3 gap-2">
            <span className="bb-display" style={{ fontSize: 17, fontWeight: 800, color: PALETTE.verde }}>
              {formatCOP(b.precio)}
            </span>
            <button
              onClick={() => onVote(b)}
              disabled={voted}
              className="bb-body px-4 py-2 rounded-full"
              style={{
                background: voted ? "#E7DFD2" : PALETTE.tomate,
                color: voted ? PALETTE.humo : "#fff",
                fontSize: 13,
                fontWeight: 700,
                cursor: voted ? "default" : "pointer",
                border: "none",
              }}
            >
              {voted ? "Ya votaste" : "Votar"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function VoteModal({ burger, onClose, onConfirm, busy }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Escribe un celular de 10 dígitos para validar tu voto.");
      return;
    }
    if (code.trim().length < 4) {
      setError("El código de compra está en tu recibo: tiene 4 dígitos.");
      return;
    }
    setError("");
    onConfirm(cleanPhone);
  };

  return (
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{ background: "rgba(34,27,20,0.55)", zIndex: 50 }}
      role="dialog"
      aria-modal="true"
    >
      <div className="bb-pop w-full max-w-md rounded-t-3xl p-6" style={{ background: PALETTE.crema }}>
        <p
          className="bb-body"
          style={{ fontSize: 12, color: PALETTE.humo, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}
        >
          Confirmar voto
        </p>
        <h3 className="bb-display" style={{ fontSize: 24, fontWeight: 800, color: PALETTE.carbon, marginTop: 2, marginBottom: 0 }}>
          {burger.burger}
        </h3>
        <p className="bb-body" style={{ fontSize: 13, color: PALETTE.humo, marginTop: 2, marginBottom: 0 }}>
          de {burger.local}
        </p>

        <label className="bb-body block mt-5" style={{ fontSize: 13, fontWeight: 600, color: PALETTE.carbon }}>
          Tu celular
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            inputMode="numeric"
            placeholder="300 000 0000"
            className="bb-body w-full mt-1 px-4 py-3 rounded-xl"
            style={{ border: "1.5px solid #D8CFBF", background: "#fff", fontSize: 15, outline: "none" }}
          />
        </label>

        <label className="bb-body block mt-3" style={{ fontSize: 13, fontWeight: 600, color: PALETTE.carbon }}>
          Código de compra (en tu recibo)
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            inputMode="numeric"
            placeholder="Ej: 4821"
            className="bb-body w-full mt-1 px-4 py-3 rounded-xl"
            style={{ border: "1.5px solid #D8CFBF", background: "#fff", fontSize: 15, outline: "none" }}
          />
        </label>

        {error && (
          <p className="bb-body mt-3" style={{ fontSize: 13, color: PALETTE.tomate, fontWeight: 600, marginBottom: 0 }}>
            {error}
          </p>
        )}

        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="bb-body flex-1 py-3 rounded-full"
            style={{
              background: "transparent",
              border: `1.5px solid ${PALETTE.humo}`,
              color: PALETTE.carbon,
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={busy}
            className="bb-body flex-1 py-3 rounded-full"
            style={{
              background: PALETTE.verde,
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? "Registrando…" : "Confirmar voto"}
          </button>
        </div>
        <p className="bb-body mt-3" style={{ fontSize: 11, color: PALETTE.humo, textAlign: "center", marginBottom: 0 }}>
          Demo: el código no se valida contra ventas reales todavía. Un voto por celular.
        </p>
      </div>
    </div>
  );
}

function RankingView({ votes }) {
  const ranked = [...BURGERS]
    .map((b) => ({ ...b, count: votes[b.id] || 0 }))
    .sort((a, z) => z.count - a.count);
  const max = Math.max(1, ...ranked.map((r) => r.count));
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="px-5 py-5">
      <h2 className="bb-display" style={{ fontSize: 24, fontWeight: 800, color: PALETTE.carbon, margin: 0 }}>
        Ranking en vivo
      </h2>
      <p className="bb-body" style={{ fontSize: 13, color: PALETTE.humo, marginTop: 2, marginBottom: 0 }}>
        Se actualiza con cada voto del público.
      </p>
      <div className="mt-5 flex flex-col gap-4">
        {ranked.map((r, i) => (
          <div key={r.id}>
            <div className="flex items-baseline justify-between">
              <p className="bb-body" style={{ fontSize: 14, fontWeight: 700, color: PALETTE.carbon, margin: 0 }}>
                {medals[i] || `${i + 1}.`} {r.burger}
                <span style={{ color: PALETTE.humo, fontWeight: 400 }}> · {r.local}</span>
              </p>
              <span className="bb-display" style={{ fontSize: 16, fontWeight: 800, color: PALETTE.verde }}>
                {r.count}
              </span>
            </div>
            <div className="mt-1 rounded-full overflow-hidden" style={{ background: "#EDE5D6", height: 14 }}>
              <div
                className="bb-grow h-full rounded-full"
                style={{
                  width: `${(r.count / max) * 100}%`,
                  background: i === 0 ? PALETTE.tomate : PALETTE.verde,
                  minWidth: r.count > 0 ? 14 : 0,
                  transition: "width .5s ease",
                  height: "100%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardView({ votes, onReset }) {
  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  const ranked = [...BURGERS]
    .map((b) => ({ ...b, count: votes[b.id] || 0 }))
    .sort((a, z) => z.count - a.count);
  const ventasEstimadas = ranked.reduce((acc, r) => acc + r.count * r.precio, 0);
  const lider = ranked[0];

  const stat = (label, value) => (
    <div className="rounded-2xl p-4" style={{ background: "#fff", border: "1px solid #E7DFD2" }}>
      <p
        className="bb-body"
        style={{ fontSize: 11, color: PALETTE.humo, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}
      >
        {label}
      </p>
      <p className="bb-display" style={{ fontSize: 24, fontWeight: 800, color: PALETTE.carbon, marginTop: 2, marginBottom: 0 }}>
        {value}
      </p>
    </div>
  );

  return (
    <div className="px-5 py-5">
      <h2 className="bb-display" style={{ fontSize: 24, fontWeight: 800, color: PALETTE.carbon, margin: 0 }}>
        Panel del organizador
      </h2>
      <p className="bb-body" style={{ fontSize: 13, color: PALETTE.humo, marginTop: 2, marginBottom: 0 }}>
        Vista privada: métricas para la organización y patrocinadores.
      </p>

      <div className="grid grid-cols-2 gap-3 mt-5">
        {stat("Votos totales", total)}
        {stat("Locales activos", BURGERS.length)}
        {stat("Burger líder", lider.count > 0 ? lider.burger : "—")}
        {stat("Ventas asociadas*", formatCOP(ventasEstimadas))}
      </div>
      <p className="bb-body mt-2" style={{ fontSize: 11, color: PALETTE.humo, marginBottom: 0 }}>
        *Estimado: cada voto válido equivale a una compra verificada con código.
      </p>

      <div className="rounded-2xl p-4 mt-4" style={{ background: "#fff", border: "1px solid #E7DFD2" }}>
        <p className="bb-body" style={{ fontSize: 13, fontWeight: 700, color: PALETTE.carbon, margin: 0 }}>
          Participación por local
        </p>
        <div className="mt-3 flex flex-col gap-2">
          {ranked.map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <span className="bb-body" style={{ fontSize: 12, width: 120, color: PALETTE.humo }}>
                {r.local}
              </span>
              <div className="flex-1 rounded-full overflow-hidden" style={{ background: "#EDE5D6", height: 8 }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${total ? (r.count / total) * 100 : 0}%`,
                    background: PALETTE.verde,
                    transition: "width .5s ease",
                    height: "100%",
                  }}
                />
              </div>
              <span
                className="bb-body"
                style={{ fontSize: 12, fontWeight: 700, color: PALETTE.carbon, width: 26, textAlign: "right" }}
              >
                {r.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onReset}
        className="bb-body mt-5 w-full py-3 rounded-full"
        style={{
          background: "transparent",
          border: `1.5px solid ${PALETTE.tomate}`,
          color: PALETTE.tomate,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        Reiniciar datos del demo
      </button>
    </div>
  );
}

// --------------------------- App --------------------------------

export default function App() {
  const [tab, setTab] = useState("burgers");
  const [data, setData] = useState(emptyData());
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [votedLocal, setVotedLocal] = useState(false);

  const refresh = useCallback(async () => {
    const d = await loadData();
    setData(d);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 6000);
    return () => clearInterval(t);
  }, [refresh]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  };

  const confirmVote = async (phone) => {
    setBusy(true);
    const fresh = await loadData();
    if (fresh.phones.includes(phone)) {
      setBusy(false);
      setSelected(null);
      setVotedLocal(true);
      showToast("Ese celular ya registró un voto en esta edición.");
      return;
    }
    fresh.votes[selected.id] = (fresh.votes[selected.id] || 0) + 1;
    fresh.phones.push(phone);
    const ok = await saveData(fresh);
    setData(fresh);
    setBusy(false);
    const name = selected.burger;
    setSelected(null);
    setVotedLocal(true);
    showToast(ok ? `¡Voto registrado para ${name}! 🍔` : "No se pudo guardar el voto. Revisa la conexión.");
    setTab("ranking");
  };

  const resetAll = async () => {
    const blank = emptyData();
    await saveData(blank);
    setData(blank);
    setVotedLocal(false);
    showToast("Datos del demo reiniciados.");
  };

  const totalVotes = Object.values(data.votes).reduce((a, b) => a + b, 0);

  const tabs = [
    { id: "burgers", label: "Burgers", icon: "🍔" },
    { id: "ranking", label: "Ranking", icon: "🏆" },
    { id: "panel", label: "Panel", icon: "📊" },
  ];

  return (
    <div className="bb-body min-h-screen flex justify-center" style={{ background: PALETTE.carbon }}>
      <div className="w-full max-w-md min-h-screen flex flex-col" style={{ background: PALETTE.crema }}>
        <Header totalVotes={totalVotes} />

        {!isShared && (
          <div
            className="bb-body px-5 py-2"
            style={{ background: PALETTE.pan, color: PALETTE.carbon, fontSize: 12, fontWeight: 600 }}
          >
            Modo local: los votos solo se guardan en este dispositivo. Configura Supabase para el ranking compartido.
          </div>
        )}

        <main className="flex-1 pb-24">
          {tab === "burgers" && (
            <div className="px-5 py-5 flex flex-col gap-4">
              <p className="bb-body" style={{ fontSize: 13, color: PALETTE.humo, margin: 0 }}>
                Prueba las burgers participantes, pide tu código de compra en el local y vota por tu favorita. Un voto por
                persona.
              </p>
              {BURGERS.map((b) => (
                <BurgerCard key={b.id} b={b} onVote={setSelected} voted={votedLocal} />
              ))}
            </div>
          )}
          {tab === "ranking" && <RankingView votes={data.votes} />}
          {tab === "panel" && <DashboardView votes={data.votes} onReset={resetAll} />}
        </main>

        <nav
          className="fixed bottom-0 w-full max-w-md flex"
          style={{ background: "#fff", borderTop: "1px solid #E7DFD2", zIndex: 40 }}
        >
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex-1 py-3 flex flex-col items-center gap-0.5"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: tab === t.id ? PALETTE.verde : PALETTE.humo,
                borderTop: tab === t.id ? `3px solid ${PALETTE.verde}` : "3px solid transparent",
                marginTop: -1,
              }}
            >
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              <span className="bb-body" style={{ fontSize: 11, fontWeight: 700 }}>
                {t.label}
              </span>
            </button>
          ))}
        </nav>

        {toast && (
          <div
            className="bb-pop fixed bottom-20 left-1/2 px-5 py-3 rounded-full"
            style={{
              transform: "translateX(-50%)",
              background: PALETTE.carbon,
              color: PALETTE.crema,
              fontSize: 13,
              fontWeight: 600,
              zIndex: 60,
              maxWidth: "90%",
              textAlign: "center",
            }}
          >
            {toast}
          </div>
        )}

        {selected && <VoteModal burger={selected} onClose={() => setSelected(null)} onConfirm={confirmVote} busy={busy} />}
      </div>
    </div>
  );
}
