// ---------------------------------------------------------------
// Capa de almacenamiento de votos.
//
// MODO COMPARTIDO (recomendado): si defines las variables de entorno
//   VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
// los votos se guardan en Supabase y todos los visitantes ven el
// mismo ranking en tiempo real.
//
// MODO LOCAL (respaldo): si no hay variables, los votos se guardan
// solo en el navegador de cada persona (localStorage). Útil para
// probar, pero el ranking no es compartido.
// ---------------------------------------------------------------

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isShared = Boolean(SUPABASE_URL && SUPABASE_KEY);

const ROW_ID = "bijao-burger-v1";
const LOCAL_KEY = "bijao-burger:data-v1";

export const emptyData = () => ({ votes: {}, phones: [] });

const headers = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
});

export async function loadData() {
  if (!isShared) {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      /* sin datos locales todavía */
    }
    return emptyData();
  }

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/bijao_data?id=eq.${ROW_ID}&select=data`,
      { headers: headers() }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rows = await res.json();
    if (rows.length > 0 && rows[0].data) return rows[0].data;
  } catch (e) {
    console.error("No se pudo leer de Supabase:", e);
  }
  return emptyData();
}

export async function saveData(data) {
  if (!isShared) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/bijao_data`, {
      method: "POST",
      headers: { ...headers(), Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify([{ id: ROW_ID, data }]),
    });
    return res.ok;
  } catch (e) {
    console.error("No se pudo guardar en Supabase:", e);
    return false;
  }
}
