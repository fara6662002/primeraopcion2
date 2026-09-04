import { supabase } from '@/lib/supabase';
import type {
  Profile, ExamResult, SubjectBreakdownEntry, AvatarRow, AvatarCatalogRow, NewsRow,
  SuggestionRow, AdminAlertRow, QuestionOverride, ErrorBankEntry,
  DailyStreak, RankingRow, MiniExamResult, DbQuestion,
} from '@/lib/supabase';
import type { Question, SubjectId } from '@/data/questionBank';

export const ADMIN_EMAIL = 'fararuiz64@gmail.com';

export type { Profile, ExamResult, AvatarRow, AvatarCatalogRow, NewsRow, SuggestionRow, AdminAlertRow, QuestionOverride, ErrorBankEntry, DailyStreak, RankingRow, MiniExamResult, SubjectBreakdownEntry, DbQuestion };

// ---- Device fingerprint ----

export function getDeviceFingerprint(): string {
  const parts = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    String(navigator.hardwareConcurrency ?? ''),
    String(navigator.maxTouchPoints ?? ''),
    screen.width + 'x' + screen.height,
    String(screen.colorDepth ?? ''),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(new Date().getTimezoneOffset()),
  ];
  const str = parts.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'dev_' + Math.abs(hash).toString(36) + '_' + str.length.toString(36);
}

// ---- Question bank ----

export async function fetchAllDbQuestions(): Promise<DbQuestion[]> {
  const { data, error } = await supabase.from('question_bank').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbQuestion[];
}

export async function fetchPausedQuestions(): Promise<DbQuestion[]> {
  const { data, error } = await supabase.from('question_bank').select('*').eq('is_paused', true).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbQuestion[];
}

export async function createQuestion(q: {
  subject: string;
  topic: string;
  question_text: string;
  options: string[];
  correct_option: number;
  explanation: string;
  question_type: string;
}): Promise<void> {
  const { error } = await supabase.from('question_bank').insert({
    ...q,
    is_paused: false,
  });
  if (error) throw error;
}

export async function updateQuestion(id: string, updates: Partial<DbQuestion>): Promise<void> {
  const { error } = await supabase.from('question_bank').update(updates).eq('id', id);
  if (error) throw error;
}

export async function toggleQuestionPause(id: string, paused: boolean): Promise<void> {
  await updateQuestion(id, { is_paused: paused });
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from('question_bank').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchQuestions(subject?: string): Promise<DbQuestion[]> {
  let query = supabase.from('question_bank').select('*').eq('is_paused', false);
  if (subject) query = query.eq('subject', subject);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as DbQuestion[];
}

export function dbQuestionToQuestion(dbq: DbQuestion): Question {
  return {
    id: dbq.id,
    subject: dbq.subject as SubjectId,
    topic: dbq.topic,
    question: dbq.question_text,
    options: dbq.options,
    correctIndex: dbq.correct_option,
    explanation: dbq.explanation,
  };
}

// ---- Profiles ----

export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Profile[];
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
  const { error } = await supabase.from('profiles').update(updates).eq('id', userId);
  if (error) throw error;
}

export async function approveUser(userId: string): Promise<void> {
  await updateProfile(userId, { approved: true, blocked: false, status: 'active' });
}

export async function blockUser(userId: string): Promise<void> {
  await updateProfile(userId, { blocked: true, status: 'suspended' });
}

export async function unblockUser(userId: string): Promise<void> {
  await updateProfile(userId, { blocked: false, status: 'active' });
}

export async function resetDevice(userId: string): Promise<void> {
  await updateProfile(userId, { bound_device_id: null, device_fingerprint: null });
}

export async function deleteUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_user_completely', { target_user_id: userId });
  if (error) {
    // Fallback: at least delete the profile row
    const { error: fbError } = await supabase.from('profiles').delete().eq('id', userId);
    if (fbError) throw fbError;
  }
}

export async function setExpiration(userId: string, expiresAt: string | null): Promise<void> {
  await updateProfile(userId, { expires_at: expiresAt });
}

export async function extendLicense(userId: string, days: number): Promise<void> {
  const profile = await fetchProfile(userId);
  const base = profile?.expires_at ? new Date(profile.expires_at) : new Date();
  if (profile?.expires_at && new Date(profile.expires_at) < new Date()) {
    // If expired, extend from today
  }
  const newDate = new Date(base.getTime() + days * 86400000);
  await updateProfile(userId, { expires_at: newDate.toISOString(), status: 'active', blocked: false, approved: true });
}

export async function createUserManual(data: {
  email: string;
  password: string;
  fullName: string;
  days: number;
}): Promise<{ error: string | null }> {
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: data.email.trim(),
    password: data.password,
    email_confirm: true,
    user_metadata: { full_name: data.fullName.trim() },
  });
  if (authError) return { error: authError.message };
  if (!authData.user) return { error: 'No se pudo crear el usuario.' };

  const expiresAt = new Date(Date.now() + data.days * 86400000).toISOString();
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: authData.user.id,
    email: data.email.trim(),
    full_name: data.fullName.trim(),
    role: 'student',
    approved: true,
    blocked: false,
    status: 'active',
    expires_at: expiresAt,
    target_schools: [],
  });
  if (profileError) return { error: 'Usuario creado pero falló el perfil: ' + profileError.message };
  return { error: null };
}

export async function resetUserPassword(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.admin.updateUserById(
    email,
    { password: undefined }
  );
  if (error) {
    // Fallback: send reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    return { error: resetError?.message ?? error.message };
  }
  return { error: null };
}

export async function sendPasswordResetEmail(email: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error: error?.message ?? null };
}

export async function updateUserAvatar(userId: string, avatar: string): Promise<void> {
  await updateProfile(userId, { avatar });
}

export async function updateTargetSchools(userId: string, schools: string[]): Promise<void> {
  await updateProfile(userId, { target_schools: schools as unknown as string[] });
}

export async function updateParentEmail(userId: string, parentEmail: string): Promise<void> {
  await updateProfile(userId, { parent_email: parentEmail });
}

// ---- Exam results ----

export async function fetchResultsByUser(userId: string): Promise<ExamResult[]> {
  const { data, error } = await supabase.from('exam_results').select('*').eq('user_id', userId).order('completed_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ExamResult[];
}

export async function fetchAllResults(): Promise<ExamResult[]> {
  const { data, error } = await supabase.from('exam_results').select('*').order('completed_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ExamResult[];
}

export async function addResult(r: {
  userId: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  durationSeconds: number;
  subjectBreakdown: { subject: string; total: number; correct: number }[];
  examType?: string;
}): Promise<void> {
  const { error } = await supabase.from('exam_results').insert({
    user_id: r.userId,
    total_questions: r.totalQuestions,
    correct_answers: r.correctAnswers,
    score: r.correctAnswers,
    percentage: r.percentage,
    duration_seconds: r.durationSeconds,
    time_spent_seconds: r.durationSeconds,
    breakdown_by_subject: r.subjectBreakdown,
    exam_type: r.examType ?? 'simulacro_128',
  });
  if (error) throw error;
}

export async function deleteResult(id: string): Promise<void> {
  const { error } = await supabase.from('exam_results').delete().eq('id', id);
  if (error) throw error;
}

// ---- Mini exam results ----

export async function fetchMiniExamResults(userId: string): Promise<MiniExamResult[]> {
  const { data, error } = await supabase.from('mini_exam_results').select('*').eq('user_id', userId).order('completed_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as MiniExamResult[];
}

export async function addMiniExamResult(r: {
  userId: string;
  subject: string;
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
}): Promise<void> {
  const { error } = await supabase.from('mini_exam_results').insert({
    user_id: r.userId,
    subject: r.subject,
    topic: r.topic,
    total_questions: r.totalQuestions,
    correct_answers: r.correctAnswers,
    percentage: r.percentage,
  });
  if (error) throw error;
}

// ---- Avatars (legacy table) ----

const DEFAULT_AVATARS = [
  'https://api.dicebear.com/7.x/initials/svg?seed=AA&backgroundColor=2563eb',
  'https://api.dicebear.com/7.x/initials/svg?seed=BB&backgroundColor=059669',
  'https://api.dicebear.com/7.x/initials/svg?seed=CC&backgroundColor=d97706',
  'https://api.dicebear.com/7.x/initials/svg?seed=DD&backgroundColor=dc2626',
  'https://api.dicebear.com/7.x/initials/svg?seed=EE&backgroundColor=7c3aed',
  'https://api.dicebear.com/7.x/initials/svg?seed=FF&backgroundColor=0891b2',
  'https://api.dicebear.com/7.x/initials/svg?seed=GG&backgroundColor=db2777',
  'https://api.dicebear.com/7.x/initials/svg?seed=HH&backgroundColor=65a30d',
];

export function getDefaultAvatars(): string[] {
  return DEFAULT_AVATARS;
}

export async function fetchAvatars(): Promise<AvatarRow[]> {
  const { data, error } = await supabase.from('avatars').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AvatarRow[];
}

export async function fetchAvatarUrls(): Promise<string[]> {
  const rows = await fetchAvatars();
  if (rows.length === 0) return DEFAULT_AVATARS;
  return rows.map((r) => r.url);
}

export async function addAvatar(url: string): Promise<void> {
  const { error } = await supabase.from('avatars').insert({ url });
  if (error) throw error;
}

export async function removeAvatar(id: string): Promise<void> {
  const { error } = await supabase.from('avatars').delete().eq('id', id);
  if (error) throw error;
}

// ---- Avatars catalog ----

export async function fetchAvatarCatalog(): Promise<AvatarCatalogRow[]> {
  const { data, error } = await supabase.from('avatars_catalog').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AvatarCatalogRow[];
}

export async function fetchAvatarCatalogUrls(): Promise<string[]> {
  const rows = await fetchAvatarCatalog();
  if (rows.length === 0) {
    const legacy = await fetchAvatarUrls();
    return legacy;
  }
  return rows.map((r) => r.image_url);
}

export async function addAvatarCatalog(name: string, imageUrl: string): Promise<void> {
  const { error } = await supabase.from('avatars_catalog').insert({ avatar_name: name, image_url: imageUrl });
  if (error) throw error;
}

export async function removeAvatarCatalog(id: string): Promise<void> {
  const { error } = await supabase.from('avatars_catalog').delete().eq('id', id);
  if (error) throw error;
}

export async function removeAvatarCatalogWithFile(row: AvatarCatalogRow): Promise<void> {
  // Try to remove from storage if it's a storage URL
  if (row.image_url.includes('/storage/v1/object/public/avatars/')) {
    const path = row.image_url.split('/avatars/').pop();
    if (path) {
      await supabase.storage.from('avatars').remove([path]);
    }
  }
  await removeAvatarCatalog(row.id);
}

export async function uploadAvatarFile(file: File, name: string): Promise<{ url: string; error: string | null }> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
  const fileName = `avatar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, { contentType: file.type, upsert: false });
  if (uploadError) return { url: '', error: uploadError.message };

  const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
  const url = urlData.publicUrl;

  const { error: dbError } = await supabase
    .from('avatars_catalog')
    .insert({ avatar_name: name, image_url: url });
  if (dbError) return { url: '', error: dbError.message };

  return { url, error: null };
}

// ---- News ----

export async function fetchNews(): Promise<NewsRow[]> {
  const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as NewsRow[];
}

export async function addNews(title: string, body: string): Promise<void> {
  const { error } = await supabase.from('news').insert({ title, body });
  if (error) throw error;
}

export async function deleteNews(id: string): Promise<void> {
  const { error } = await supabase.from('news').delete().eq('id', id);
  if (error) throw error;
}

// ---- Suggestions ----

export async function fetchSuggestions(): Promise<SuggestionRow[]> {
  const { data, error } = await supabase.from('suggestions').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SuggestionRow[];
}

export async function addSuggestion(userId: string, userName: string, message: string): Promise<void> {
  const { error } = await supabase.from('suggestions').insert({ user_id: userId, user_name: userName, message });
  if (error) throw error;
}

export async function deleteSuggestion(id: string): Promise<void> {
  const { error } = await supabase.from('suggestions').delete().eq('id', id);
  if (error) throw error;
}

// ---- Admin alerts ----

export async function fetchAlerts(): Promise<AdminAlertRow[]> {
  const { data, error } = await supabase.from('admin_alerts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AdminAlertRow[];
}

export async function addAlert(a: {
  userId: string;
  userName: string;
  email: string;
  deviceFingerprint: string;
  userAgent: string;
  message: string;
}): Promise<void> {
  const { error } = await supabase.from('admin_alerts').insert({
    user_id: a.userId,
    user_name: a.userName,
    email: a.email,
    device_fingerprint: a.deviceFingerprint,
    user_agent: a.userAgent,
    message: a.message,
  });
  if (error) throw error;
}

export async function clearAlert(id: string): Promise<void> {
  const { error } = await supabase.from('admin_alerts').delete().eq('id', id);
  if (error) throw error;
}

export async function clearAllAlerts(): Promise<void> {
  const { error } = await supabase.from('admin_alerts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) throw error;
}

// ---- Error bank ----

export async function fetchErrorBank(userId: string): Promise<ErrorBankEntry[]> {
  const { data, error } = await supabase.from('error_bank').select('*').eq('user_id', userId).order('added_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ErrorBankEntry[];
}

export async function addToErrorBank(userId: string, questionId: string, questionData: Question): Promise<void> {
  const { error } = await supabase.from('error_bank').insert({
    user_id: userId,
    question_id: questionId,
    question_data: questionData as unknown as Record<string, unknown>,
    subject: questionData.subject,
    topic: questionData.topic,
  });
  if (error) throw error;
}

export async function removeFromErrorBank(id: string): Promise<void> {
  const { error } = await supabase.from('error_bank').delete().eq('id', id);
  if (error) throw error;
}

// ---- Daily streak ----

export async function fetchStreak(userId: string): Promise<DailyStreak | null> {
  const { data, error } = await supabase.from('daily_streak').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data as DailyStreak | null;
}

export async function updateStreakOnActivity(userId: string): Promise<DailyStreak | null> {
  const existing = await fetchStreak(userId);
  const today = new Date().toISOString().split('T')[0];

  if (!existing) {
    const { data, error } = await supabase.from('daily_streak').insert({
      user_id: userId,
      streak_count: 1,
      last_study_date: today,
    }).select().maybeSingle();
    if (error) throw error;
    return data as DailyStreak | null;
  }

  if (existing.last_study_date === today) return existing;

  let count = 1;
  if (existing.last_study_date) {
    const last = new Date(existing.last_study_date + 'T00:00:00');
    const now = new Date(today + 'T00:00:00');
    if (Math.round((now.getTime() - last.getTime()) / 86400000) === 1) count = existing.streak_count + 1;
  }

  const { data, error } = await supabase.from('daily_streak').update({
    streak_count: count,
    last_study_date: today,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId).select().maybeSingle();
  if (error) throw error;
  return data as DailyStreak | null;
}

// ---- Ranking ----

export async function fetchRanking(): Promise<RankingRow[]> {
  const { data, error } = await supabase.from('ranking').select('*').order('best_score', { ascending: false });
  if (error) throw error;
  return (data ?? []) as RankingRow[];
}

export async function updateRanking(userId: string, nickname: string, score: number): Promise<void> {
  const existing = await supabase.from('ranking').select('*').eq('user_id', userId).maybeSingle();
  if (existing.data) {
    const best = Math.max(existing.data.best_score, score);
    await supabase.from('ranking').update({
      best_score: best,
      total_exams: existing.data.total_exams + 1,
      nickname,
      updated_at: new Date().toISOString(),
    }).eq('user_id', userId);
  } else {
    await supabase.from('ranking').insert({
      user_id: userId,
      nickname,
      best_score: score,
      total_exams: 1,
    });
  }
}

// ---- Mini exam daily limit ----

export async function getMiniExamAttemptsToday(userId: string, subject: string, topic: string): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('mini_exam_results')
    .select('id')
    .eq('user_id', userId)
    .eq('subject', subject)
    .eq('topic', topic)
    .gte('completed_at', todayStart.toISOString());
  if (error) return 0;
  return data?.length ?? 0;
}

export const MINI_EXAM_DAILY_LIMIT = 5;

// ---- Report question (pause) ----

export async function reportQuestion(questionId: string): Promise<void> {
  await toggleQuestionPause(questionId, true);
}

// ---- Rank calculation ----

export type RankInfo = { label: string; color: string; minScore: number };

export const RANKS: RankInfo[] = [
  { label: 'Imparable UNAM/IPN', color: 'from-emerald-500 to-teal-600', minScore: 85 },
  { label: 'Candidato Apto', color: 'from-academic-500 to-academic-700', minScore: 70 },
  { label: 'Estudiante Promesa', color: 'from-amber-500 to-orange-500', minScore: 50 },
  { label: 'Aspirante', color: 'from-slate-400 to-slate-500', minScore: 0 },
];

export function getRank(bestScore: number): RankInfo {
  return RANKS.find((r) => bestScore >= r.minScore) ?? RANKS[RANKS.length - 1];
}

// ---- CSV export (client-side from fetched data) ----

export function exportUsersCSV(users: Profile[], results: ExamResult[]): void {
  const headers = ['Nombre', 'Correo', 'Estado', 'Aprobado', 'Bloqueado', 'Fecha Registro', 'Vigencia', 'Simulacros', 'Mejor Puntaje'];
  const rows = users.map((u) => {
    const userResults = results.filter((r) => r.user_id === u.id);
    const best = userResults.length > 0 ? Math.max(...userResults.map((r) => Number(r.percentage))).toFixed(1) : 'N/A';
    const status = u.blocked ? 'Bloqueado' : u.approved ? 'Activo' : 'Pendiente';
    return [
      u.full_name,
      u.email ?? '',
      status,
      u.approved ? 'Sí' : 'No',
      u.blocked ? 'Sí' : 'No',
      new Date(u.created_at).toLocaleDateString('es-MX'),
      u.expires_at ? new Date(u.expires_at).toLocaleDateString('es-MX') : 'Sin límite',
      String(userResults.length),
      best,
    ];
  });
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `alumnos_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
