import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReportData {
  studentName: string;
  studentEmail: string;
  parentEmail: string;
  averageScore: number;
  totalExams: number;
  totalQuestions: number;
  subjectBreakdown: { subject: string; correct: number; total: number }[];
  weakestAreas: string[];
}

function buildHtmlEmail(data: ReportData): string {
  const subjectRows = data.subjectBreakdown
    .map((s) => {
      const pct = Math.round((s.correct / s.total) * 100);
      const barColor = pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;color:#334155;">${s.subject}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:14px;color:#334155;">${s.correct}/${s.total}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">
            <span style="display:inline-block;width:80px;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;">
              <span style="display:block;height:100%;width:${pct}%;background:${barColor};"></span>
            </span>
            <span style="font-size:13px;color:#64748b;margin-left:6px;">${pct}%</span>
          </td>
        </tr>`;
    })
    .join("");

  const weakest = data.weakestAreas.length > 0
    ? data.weakestAreas.map((w) => `<li style="margin-bottom:4px;color:#475569;">${w}</li>`).join("")
    : "<li style='color:#475569;'>El estudiante va mejorando en todas las áreas.</li>";

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:linear-gradient(135deg,#1e3a5f,#0f172a);border-radius:16px 16px 0 0;padding:28px 24px;text-align:center;">
      <h1 style="color:#fff;font-size:22px;margin:0;font-weight:700;">Primera Opción</h1>
      <p style="color:#94a3b8;font-size:13px;margin:4px 0 0;">Plataforma de Preparación ECOEMS</p>
    </div>
    <div style="background:#fff;border-radius:0 0 16px 16px;padding:28px 24px;border:1px solid #e2e8f0;border-top:none;">
      <h2 style="color:#1e293b;font-size:18px;margin:0 0 4px;">Reporte de Avances</h2>
      <p style="color:#64748b;font-size:14px;margin:0 0 20px;">Estimado padre/tutor, le compartimos el progreso académico de <strong style="color:#1e293b;">${data.studentName}</strong>.</p>

      <div style="display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap;">
        <div style="flex:1;min-width:120px;background:#f8fafc;border-radius:12px;padding:16px;text-align:center;">
          <p style="font-size:28px;font-weight:700;color:#1e3a5f;margin:0;">${data.averageScore.toFixed(1)}%</p>
          <p style="font-size:12px;color:#64748b;margin:4px 0 0;">Promedio general</p>
        </div>
        <div style="flex:1;min-width:120px;background:#f8fafc;border-radius:12px;padding:16px;text-align:center;">
          <p style="font-size:28px;font-weight:700;color:#1e3a5f;margin:0;">${data.totalExams}</p>
          <p style="font-size:12px;color:#64748b;margin:4px 0 0;">Simulacros completados</p>
        </div>
        <div style="flex:1;min-width:120px;background:#f8fafc;border-radius:12px;padding:16px;text-align:center;">
          <p style="font-size:28px;font-weight:700;color:#1e3a5f;margin:0;">${data.totalQuestions}</p>
          <p style="font-size:12px;color:#64748b;margin:4px 0 0;">Preguntas respondidas</p>
        </div>
      </div>

      <h3 style="color:#1e293b;font-size:15px;margin:0 0 12px;">Desglose por materia</h3>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:10px 12px;text-align:left;font-size:13px;color:#64748b;border-bottom:2px solid #e2e8f0;">Materia</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#64748b;border-bottom:2px solid #e2e8f0;">Aciertos</th>
            <th style="padding:10px 12px;text-align:center;font-size:13px;color:#64748b;border-bottom:2px solid #e2e8f0;">Rendimiento</th>
          </tr>
        </thead>
        <tbody>${subjectRows}</tbody>
      </table>

      <h3 style="color:#1e293b;font-size:15px;margin:0 0 8px;">Áreas a reforzar</h3>
      <ul style="margin:0 0 24px;padding-left:20px;">${weakest}</ul>

      <div style="text-align:center;padding-top:16px;border-top:1px solid #e2e8f0;">
        <p style="color:#64748b;font-size:13px;margin:0 0 16px;">Si desea más información sobre el progreso de su hijo/a, contáctenos:</p>
        <a href="mailto:administracion@primeraopcion.mx" style="display:inline-block;background:#1e3a5f;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:600;">Contactar a Primera Opción</a>
      </div>
    </div>
    <p style="text-align:center;color:#94a3b8;font-size:11px;margin:16px 0 0;">Este reporte fue generado automáticamente por la Plataforma Primera Opción ECOEMS.</p>
  </div>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData.user) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: ReportData = await req.json();

    if (!body.parentEmail || !body.studentName) {
      return new Response(JSON.stringify({ error: "Faltan datos del reporte" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL") ?? "administracion@primeraopcion.mx";
    const fromName = Deno.env.get("FROM_NAME") ?? "Primera Opción - Plataforma ECOEMS";

    const html = buildHtmlEmail(body);

    let emailSent = false;

    if (resendApiKey) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: body.parentEmail,
          subject: `Reporte de avances - ${body.studentName}`,
          html,
        }),
      });
      emailSent = res.ok;
      if (!res.ok) {
        const errText = await res.text();
        console.error("Resend error:", errText);
      }
    } else {
      console.warn("RESEND_API_KEY not configured — email not sent");
    }

    return new Response(
      JSON.stringify({ success: emailSent, message: emailSent ? "Reporte enviado" : "Correo no configurado" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
