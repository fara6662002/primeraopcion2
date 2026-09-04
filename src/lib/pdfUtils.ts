import { jsPDF } from 'jspdf';
import { SUBJECT_NAMES, type SubjectId } from '@/data/questionBank';
import type { ExamResult } from '@/lib/store';

type ReportData = {
  fullName: string;
  email: string;
  examDate: string;
  correctAnswers: number;
  totalQuestions: number;
  percentage: number;
  subjectBreakdown: { subject: string; total: number; correct: number }[];
  rank: string;
};

export function generateDiagnosticReport(data: ReportData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 15;
  let y = 0;

  // Header band
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('ECOEMS — Reporte Diagnostico del Alumno', margin, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Plataforma de Preparacion Academica', margin, 22);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`Fecha de evaluacion: ${data.examDate}`, pageWidth - margin, 22, { align: 'right' });

  y = 40;
  doc.setTextColor(30, 41, 59);

  // Student data section
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del estudiante', margin, y);
  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${data.fullName}`, margin, y);
  y += 5;
  doc.text(`Correo: ${data.email}`, margin, y);
  y += 5;
  doc.text(`Rango actual: ${data.rank}`, margin, y);
  y += 10;

  // Global score
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultado global', margin, y);
  y += 6;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Aciertos: ${data.correctAnswers}/${data.totalQuestions}`, margin, y);
  y += 5;
  doc.text(`Calificacion: ${data.percentage.toFixed(1)}%`, margin, y);
  y += 10;

  // Subject breakdown
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Rendimiento por materia', margin, y);
  y += 6;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');

  const colX = [margin, margin + 80, margin + 130, margin + 165];
  doc.setFont('helvetica', 'bold');
  doc.text('Materia', colX[0], y);
  doc.text('Aciertos', colX[1], y);
  doc.text('Total', colX[2], y);
  doc.text('%', colX[3], y);
  y += 5;
  doc.setFont('helvetica', 'normal');

  const sorted = [...data.subjectBreakdown].sort((a, b) => (a.correct / a.total) - (b.correct / b.total));
  const mastered: string[] = [];
  const needsWork: string[] = [];

  sorted.forEach((s) => {
    const name = SUBJECT_NAMES[s.subject as SubjectId] ?? s.subject;
    const pct = (s.correct / s.total) * 100;
    doc.text(name.length > 40 ? name.slice(0, 37) + '...' : name, colX[0], y);
    doc.text(String(s.correct), colX[1], y);
    doc.text(String(s.total), colX[2], y);
    doc.text(`${pct.toFixed(0)}%`, colX[3], y);

    // Bar
    const barX = margin + 180;
    const barW = 15;
    doc.setFillColor(226, 232, 240);
    doc.rect(barX, y - 3, barW, 3.5, 'F');
    const r = pct >= 70 ? 16 : pct >= 50 ? 245 : 239;
    const g = pct >= 70 ? 185 : pct >= 50 ? 158 : 68;
    const b = pct >= 70 ? 129 : pct >= 50 ? 11 : 68;
    doc.setFillColor(r, g, b);
    doc.rect(barX, y - 3, (barW * pct) / 100, 3.5, 'F');

    if (pct >= 70) mastered.push(name);
    else if (pct < 50) needsWork.push(name);
    y += 5;
  });

  y += 8;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumen del Temario Maestro', margin, y);
  y += 6;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('Temas dominados (>=70%):', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  if (mastered.length === 0) {
    doc.text('Sin temas dominados aun. Sigue practicando.', margin, y);
    y += 5;
  } else {
    mastered.forEach((t) => {
      doc.text(`  • ${t}`, margin, y);
      y += 5;
    });
  }

  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(239, 68, 68);
  doc.text('Temas a reforzar (<50%):', margin, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  if (needsWork.length === 0) {
    doc.text('No hay areas criticas. ¡Excelente trabajo!', margin, y);
    y += 5;
  } else {
    needsWork.forEach((t) => {
      doc.text(`  • ${t}`, margin, y);
      y += 5;
    });
  }

  // Observations
  y += 8;
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Observaciones del sistema', margin, y);
  y += 6;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const observations: string[] = [];
  if (data.percentage >= 85) observations.push('El alumno demuestra dominio sobresaliente. Listo para el examen.');
  else if (data.percentage >= 70) observations.push('El alumno muestra buen desempeno. Reforzar areas debiles.');
  else if (data.percentage >= 50) observations.push('El alumno requiere practica adicional en areas prioritarias.');
  else observations.push('El alumno necesita atencion urgente. Se recomienda plan de estudio intensivo.');
  if (needsWork.length > 3) observations.push(`Se detectaron ${needsWork.length} areas criticas que requieren atencion inmediata.`);
  observations.forEach((o) => {
    const lines = doc.splitTextToSize(o, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 2;
  });

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, 285, pageWidth - margin, 285);
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('ECOEMS — Reporte generado automaticamente', margin, 290);
  doc.text(`Pagina 1 de 1`, pageWidth - margin, 290, { align: 'right' });

  doc.save(`diagnostico_${data.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

export function generateSuccessCard(data: {
  fullName: string;
  correctAnswers: number;
  totalQuestions: number;
  rank: string;
  targetSchool?: string;
}): void {
  const doc = new jsPDF({ unit: 'mm', format: [150, 150] });
  const w = 150;
  const h = 150;

  // Background gradient (simulated with rectangles)
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, w, h, 'F');
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, w, 8, 'F');

  // Logo text
  doc.setTextColor(148, 163, 184);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ECOEMS', w / 2, 20, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Preparacion Academica', w / 2, 25, { align: 'center' });

  // Big score
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(48);
  doc.setFont('helvetica', 'bold');
  doc.text(String(data.correctAnswers), w / 2, 55, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`aciertos de ${data.totalQuestions}`, w / 2, 62, { align: 'center' });

  // Rank badge
  doc.setFillColor(37, 99, 235);
  doc.roundedRect(w / 2 - 40, 70, 80, 10, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(data.rank, w / 2, 76, { align: 'center' });

  // Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(data.fullName, w / 2, 92, { align: 'center' });

  // School
  if (data.targetSchool) {
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text('Asignacion proyectada:', w / 2, 100, { align: 'center' });
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text(data.targetSchool, w / 2, 106, { align: 'center' });
  }

  // Bottom bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, h - 12, w, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('es-MX'), w / 2, h - 5, { align: 'center' });

  doc.save(`caso_exito_${data.fullName.replace(/\s+/g, '_')}.pdf`);
}

export function generateOMRSheet(data: {
  fullName: string;
  examDate: string;
}): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const margin = 15;
  let y = 15;

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('ECOEMS — Hoja de Respuestas OMR', margin, 12);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Simulacro Oficial — 128 Reactivos', margin, 18);
  doc.text(`Fecha: ${data.examDate}`, pageWidth - margin, 18, { align: 'right' });

  y = 30;
  doc.setTextColor(30, 41, 59);

  // Student data
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Nombre:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.setDrawColor(180, 180, 180);
  doc.line(margin + 18, y, pageWidth - margin, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Grupo:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.line(margin + 15, y, margin + 70, y);
  doc.setFont('helvetica', 'bold');
  doc.text('Folio:', margin + 80, y);
  doc.setFont('helvetica', 'normal');
  doc.line(margin + 97, y, pageWidth - margin, y);

  y += 10;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // OMR bubbles - 128 questions in 2 columns of 64
  const col1X = margin + 5;
  const col2X = pageWidth / 2 + 10;
  const letterX = [0, 12, 24, 36];
  const letters = ['A', 'B', 'C', 'D'];
  const rowH = 6.5;

  doc.setFontSize(7);
  for (let i = 0; i < 64; i++) {
    const qNum1 = i + 1;
    const qNum2 = i + 65;

    // Column 1
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(String(qNum1).padStart(3, '0'), col1X - 2, y + 3.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    letters.forEach((letter, j) => {
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.circle(col1X + 6 + letterX[j] + 1.5, y + 2.5, 1.8, 'S');
      doc.setTextColor(120, 120, 120);
      doc.setFontSize(5);
      doc.text(letter, col1X + 6 + letterX[j] + 1.5, y + 3.8, { align: 'center' });
    });

    // Column 2
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(String(qNum2).padStart(3, '0'), col2X - 2, y + 3.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    letters.forEach((letter, j) => {
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.3);
      doc.circle(col2X + 6 + letterX[j] + 1.5, y + 2.5, 1.8, 'S');
      doc.setFontSize(5);
      doc.text(letter, col2X + 6 + letterX[j] + 1.5, y + 3.8, { align: 'center' });
    });

    y += rowH;
    if (y > 275) break;
  }

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(margin, 282, pageWidth - margin, 282);
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  doc.text('ECOEMS — Hoja OMR oficial · Llena los ovalos con lapiz del 2 1/2', margin, 287);
  doc.text(`Alumno: ${data.fullName}`, pageWidth - margin, 287, { align: 'right' });

  doc.save(`hoja_omr_${data.fullName.replace(/\s+/g, '_')}.pdf`);
}

export function generateDiploma(data: {
  fullName: string;
  folio: string;
  date: string;
  averageScore: number;
  totalQuestions: number;
}): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const w = 297;
  const h = 210;
  const cx = w / 2;

  // Outer decorative border
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, w, h, 'F');

  // Inner gold border
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.5);
  doc.rect(10, 10, w - 20, h - 20);
  doc.setLineWidth(0.5);
  doc.rect(13, 13, w - 26, h - 26);

  // Header
  doc.setTextColor(212, 175, 55);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('RECONOCIMIENTO OFICIAL', cx, 38, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Plataforma de Preparacion Academica ECOEMS / COMIPEMS', cx, 47, { align: 'center' });

  // Divider
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(60, 53, w - 60, 53);

  // Body
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.text('Se otorga el presente reconocimiento a:', cx, 68, { align: 'center' });

  // Student name
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(data.fullName, cx, 85, { align: 'center' });

  // Achievement text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const achievementLines = doc.splitTextToSize(
    `Por haber completado la preparacion para el examen de admision ECOEMS/COMIPEMS con un promedio de ${data.averageScore.toFixed(1)}% de aciertos (${data.averageScore > 0 ? Math.round((data.averageScore / 100) * data.totalQuestions) : 0}/${data.totalQuestions} reactivos), demostrando dedicacion y compromiso con su formacion academica.`,
    w - 80,
  );
  doc.text(achievementLines, cx, 100, { align: 'center' });

  // Seal area
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.circle(w / 4, 150, 18, 'S');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(212, 175, 55);
  doc.text('ECOEMS', w / 4, 148, { align: 'center' });
  doc.text('SELLO OFICIAL', w / 4, 154, { align: 'center' });

  // Signature line
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.line(w - 90, 155, w - 35, 155);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Coordinador Academico', (w - 90 + w - 35) / 2, 162, { align: 'center' });

  // Folio and date
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(`Folio: ${data.folio}`, 30, h - 25);
  doc.text(`Fecha: ${data.date}`, w - 30 - doc.getTextWidth(`Fecha: ${data.date}`), h - 25);

  // Bottom bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, h - 12, w, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('primeraopcion.mx · Plataforma de Preparacion ECOEMS/COMIPEMS', cx, h - 5, { align: 'center' });

  doc.save(`diploma_${data.fullName.replace(/\s+/g, '_')}.pdf`);
}

export function buildWhatsAppReportLink(phone: string, data: {
  studentName: string;
  correctAnswers: number;
  totalQuestions: number;
  reportUrl?: string;
}): string {
  const msg = `Hola, te compartimos el avance de ${data.studentName} en su preparacion ECOEMS. Puntaje en el ultimo simulacro: ${data.correctAnswers}/${data.totalQuestions} aciertos.${data.reportUrl ? ` Consulta su reporte completo aqui: ${data.reportUrl}` : ''}`;
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

export function getWhatsAppInactiveLink(studentName: string, daysInactive: number): string {
  const msg = `Hola ${studentName}, notamos que no has ingresado a la plataforma ECOEMS${daysInactive > 0 ? ` en ${daysInactive} dias` : ''}. Tu preparacion para el examen es importante. ¡Ingresa hoy y continua practicando!`;
  return `https://wa.me/?text=${encodeURIComponent(msg)}`;
}
