// Modo admin de Tucu Tech.
// Recibe el código de acceso, lo valida acá (en el servidor, nunca en la página) y, si es correcto,
// pide a Netlify las respuestas del formulario "feedback" y las devuelve en JSON.
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
    const form = (await fr.json()).find(f => f.name === "feedback");
    if (!form) return Response.json({ items: [] }, { headers: { "Cache-Control": "no-store" } });
    const subs = [];
    for (let page = 1; page <= 50; page++) { // hasta 5000 respuestas
      const r = await fetch(`${API}/forms/${form.id}/submissions?per_page=100&page=${page}`, { headers, signal: AbortSignal.timeout(8000) });
      if (!r.ok) return Response.json({ error: "Netlify respondió " + r.status + " al pedir las respuestas." }, { status: 502 });
      const arr = await r.json(); subs.push(...arr);
      if (arr.length < 100) break;
    }
    const items = subs.map(s => ({
      fecha: s.created_at,
      puntaje: Number(s.data?.puntaje) || 0,
      camino: s.data?.camino || "",
      practicadas: Number(s.data?.practicadas) || 0,
      comentario: String(s.data?.comentario || "").slice(0, 1000)
    }));
    return Response.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return Response.json({ error: "No se pudo conectar con Netlify." }, { status: 502 });
  }
};
