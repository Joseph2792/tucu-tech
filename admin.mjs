// Modo admin de Tucu Tech.
// Recibe el código de acceso, lo valida acá (en el servidor, nunca en la página) y, si es correcto,
// pide a Netlify las respuestas de los formularios "feedback" y "criterios" y las devuelve en JSON.
// Variables en Netlify: NETLIFY_API_TOKEN (obligatoria, token personal de Netlify) y
// ADMIN_CODE (opcional, el código de acceso; si no está, usa 2026).
const API = "https://api.netlify.com/api/v1";

export default async (req, context) => {
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405 });
  let body = {};
  try { body = await req.json(); } catch {}
  const code = String(body.code || "");
  const expected = process.env.ADMIN_CODE || "2026";
  if (!/^\d+$/.test(code) || code !== expected) {
    await new Promise(r => setTimeout(r, 800)); // frena a quien pruebe códigos al azar
    return Response.json({ error: "Código incorrecto" }, { status: 401 });
  }
  const token = process.env.NETLIFY_API_TOKEN;
  if (!token) return Response.json({ error: "Falta configurar NETLIFY_API_TOKEN en Netlify." }, { status: 503 });
  const siteId = context?.site?.id || process.env.SITE_ID;
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const fr = await fetch(`${API}/sites/${siteId}/forms`, { headers, signal: AbortSignal.timeout(8000) });
    if (!fr.ok) return Response.json({ error: "Netlify respondió " + fr.status + " al pedir los formularios." }, { status: 502 });
    const forms = await fr.json();
    // Trae todas las respuestas de un formulario (de a 100, hasta 5000)
    const todas = async nombre => {
      const form = forms.find(f => f.name === nombre);
      if (!form) return [];
      const subs = [];
      for (let page = 1; page <= 50; page++) {
        const r = await fetch(`${API}/forms/${form.id}/submissions?per_page=100&page=${page}`, { headers, signal: AbortSignal.timeout(8000) });
        if (!r.ok) throw new Error("Netlify respondió " + r.status + " al pedir las respuestas.");
        const arr = await r.json(); subs.push(...arr);
        if (arr.length < 100) break;
      }
      return subs;
    };
    const [fb, cr] = await Promise.all([todas("feedback"), todas("criterios")]);
    const items = fb.map(s => ({
      fecha: s.created_at,
      puntaje: Number(s.data?.puntaje) || 0,
      camino: s.data?.camino || "",
      practicadas: Number(s.data?.practicadas) || 0,
      comentario: String(s.data?.comentario || "").slice(0, 1000)
    }));
    // Encuesta de criterios: cada campo vale "si", "no" o "no_uso"
    const CLAVES = ["ia", "breves", "siguiente", "entendio", "devolucion", "tono"];
    // Los criterios vienen en la misma encuesta ("feedback"); "criterios" queda por las respuestas de una versión anterior.
    const criterios = [...fb, ...cr].map(s => {
      const o = { fecha: s.created_at, camino: s.data?.camino || "" };
      for (const k of CLAVES) { const v = String(s.data?.[k] || ""); o[k] = ["si", "no", "no_uso"].includes(v) ? v : ""; }
      return o;
    }).filter(o => CLAVES.some(k => o[k]));
    return Response.json({ items, criterios }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return Response.json({ error: e.message?.startsWith("Netlify") ? e.message : "No se pudo conectar con Netlify." }, { status: 502 });
  }
};
