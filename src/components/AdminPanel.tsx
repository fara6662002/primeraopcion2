import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAllProfiles, fetchAlerts, fetchAllResults, fetchNews, fetchSuggestions,
  fetchMiniExamResults, approveUser, blockUser, unblockUser, resetDevice, deleteUser,
  clearAlert, addNews, deleteNews, deleteSuggestion, setExpiration,
  exportUsersCSV, fetchAvatarCatalog, fetchAllDbQuestions, fetchPausedQuestions,
  createQuestion, updateQuestion, toggleQuestionPause, deleteQuestion,
  extendLicense, createUserManual, sendPasswordResetEmail,
  uploadAvatarFile, removeAvatarCatalogWithFile,
  type Profile, type AdminAlertRow, type ExamResult, type NewsRow, type SuggestionRow,
  type AvatarCatalogRow, type DbQuestion,
} from '@/lib/store';
import { SUBJECTS, SUBJECT_NAMES } from '@/data/questionBank';
import type { SubjectId } from '@/data/questionBank';
import MathText from '@/components/MathText';
import { generateDiagnosticReport, buildWhatsAppReportLink } from '@/lib/pdfUtils';
import ToastContainer, { type Toast, type ToastType } from '@/components/Toast';
import {
  ShieldCheck, Check, Ban, RefreshCw, Trash2, Bell, Users, AlertTriangle, Clock,
  Monitor, Search, XCircle, Image as ImageIcon, Newspaper, MessageSquare, FileSpreadsheet,
  Edit3, Save, X, Plus, Upload, KeyRound, CalendarPlus, UserPlus, Play, Pause,
  MessageCircle, TrendingDown, AlertCircle, FileText, BarChart3, BookOpen, Award,
} from 'lucide-react';

type Tab = 'users' | 'alerts' | 'avatars' | 'news' | 'suggestions' | 'questions' | 'activity';

type FilterStatus = 'all' | 'active' | 'expired' | 'suspended' | 'pending';

export default function AdminPanel() {
  const { signOut } = useAuth();
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<Profile[]>([]);
  const [alerts, setAlerts] = useState<AdminAlertRow[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refresh = async () => {
    try {
      const [u, a, r] = await Promise.all([fetchAllProfiles(), fetchAlerts(), fetchAllResults()]);
      setUsers(u);
      setAlerts(a);
      setResults(r);
    } catch (err) {
      console.error('Admin refresh error:', err);
      showToast('error', 'Error al cargar datos del panel.');
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, []);

  const inactiveCount = users.filter((u) => {
    if (!u.approved || u.blocked) return false;
    if (!u.last_login_at) return true;
    const days = (Date.now() - new Date(u.last_login_at).getTime()) / 86400000;
    return days > 3;
  }).length;

  const pendingCount = users.filter((u) => !u.approved && !u.blocked).length;
  const activeCount = users.filter((u) => u.approved && !u.blocked).length;
  const blockedCount = users.filter((u) => u.blocked).length;

  const tabs: { id: Tab; label: string; icon: typeof Users; badge?: number }[] = [
    { id: 'users', label: 'Alumnos', icon: Users },
    { id: 'activity', label: 'Inactividad', icon: TrendingDown, badge: inactiveCount || undefined },
    { id: 'questions', label: 'Auditoría', icon: Edit3 },
    { id: 'avatars', label: 'Avatares', icon: ImageIcon },
    { id: 'alerts', label: 'Alertas', icon: Bell, badge: alerts.length || undefined },
    { id: 'news', label: 'Noticias', icon: Newspaper },
    { id: 'suggestions', label: 'Sugerencias', icon: MessageSquare },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-academic-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <header className="bg-slate-900 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-academic-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold">Panel de Administración</span>
                <span className="text-slate-400 text-sm ml-2 hidden sm:inline">· Plataforma de Preparación Académica</span>
              </div>
            </div>
            <button onClick={() => signOut()} className="text-sm text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors">
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Pendientes" value={pendingCount} icon={Clock} color="bg-amber-500" />
          <StatCard label="Activos" value={activeCount} icon={Users} color="bg-emerald-500" />
          <StatCard label="Bloqueados" value={blockedCount} icon={Ban} color="bg-red-500" />
          <StatCard label="Inactivos (3 días)" value={inactiveCount} icon={TrendingDown} color="bg-orange-500" />
        </div>

        {/* Global academic metrics */}
        <GlobalMetrics results={results} users={users} />

        <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  tab === t.id ? 'border-academic-600 text-academic-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}>
                <Icon className="w-4 h-4" />
                {t.label}
                {t.badge ? <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-amber-100 text-amber-700">{t.badge}</span> : null}
              </button>
            );
          })}
        </div>

        {tab === 'users' && <UsersTab users={users} results={results} onRefresh={refresh} showToast={showToast} />}
        {tab === 'activity' && <InactivityTab users={users} results={results} onRefresh={refresh} showToast={showToast} />}
        {tab === 'questions' && <QuestionsTab showToast={showToast} />}
        {tab === 'avatars' && <AvatarsTab onRefresh={refresh} showToast={showToast} />}
        {tab === 'alerts' && <AlertsTab alerts={alerts} onRefresh={refresh} showToast={showToast} />}
        {tab === 'news' && <NewsManager onRefresh={refresh} showToast={showToast} />}
        {tab === 'suggestions' && <SuggestionsManager onRefresh={refresh} showToast={showToast} />}
      </main>
    </div>
  );
}

// ---- Shared components ----

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: typeof Users; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}><Icon className="w-5 h-5 text-white" /></div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function GlobalMetrics({ results, users }: { results: ExamResult[]; users: Profile[] }) {
  const totalExams = results.length;
  const avgScore = totalExams > 0
    ? results.reduce((sum, r) => sum + (r.percentage ?? 0), 0) / totalExams
    : 0;
  const activeUsers = users.filter((u) => u.approved && !u.blocked).length;

  // Find subject with highest error rate
  const subjectStats: Record<string, { correct: number; total: number }> = {};
  results.forEach((r) => {
    const bd = r.breakdown_by_subject ?? r.subject_breakdown ?? [];
    bd.forEach((s) => {
      const key = SUBJECT_NAMES[s.subject as SubjectId] ?? s.subject;
      if (!subjectStats[key]) subjectStats[key] = { correct: 0, total: 0 };
      subjectStats[key].correct += s.correct;
      subjectStats[key].total += s.total;
    });
  });
  const subjectRates = Object.entries(subjectStats).map(([name, v]) => ({
    name,
    errorRate: v.total > 0 ? ((v.total - v.correct) / v.total) * 100 : 0,
  }));
  const worstSubject = subjectRates.sort((a, b) => b.errorRate - a.errorRate)[0];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center mb-3">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <p className="text-2xl font-bold text-slate-800">{avgScore.toFixed(1)}%</p>
        <p className="text-sm text-slate-500 mt-0.5">Promedio plataforma</p>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-academic-600 flex items-center justify-center mb-3">
          <FileText className="w-5 h-5 text-white" />
        </div>
        <p className="text-2xl font-bold text-slate-800">{totalExams}</p>
        <p className="text-sm text-slate-500 mt-0.5">Exámenes realizados</p>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center mb-3">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <p className="text-lg font-bold text-slate-800 truncate">{worstSubject?.name ?? '—'}</p>
        <p className="text-sm text-slate-500 mt-0.5">Mayor tasa de error{worstSubject ? ` (${worstSubject.errorRate.toFixed(0)}%)` : ''}</p>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center mb-3">
          <Users className="w-5 h-5 text-white" />
        </div>
        <p className="text-2xl font-bold text-slate-800">{activeUsers}</p>
        <p className="text-sm text-slate-500 mt-0.5">Usuarios activos</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: 'Activo', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    pending: { label: 'Pendiente', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    blocked: { label: 'Bloqueado', cls: 'bg-red-50 text-red-700 border-red-200' },
    suspended: { label: 'Suspendido', cls: 'bg-red-50 text-red-700 border-red-200' },
    expired: { label: 'Vencido', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  };
  const s = map[status] ?? map.pending;
  return <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${s.cls}`}>{s.label}</span>;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---- 1. Users Tab ----

type UsersTabProps = {
  users: Profile[];
  results: ExamResult[];
  onRefresh: () => Promise<void>;
  showToast: (type: ToastType, msg: string) => void;
};

function UsersTab({ users, results, onRefresh, showToast }: UsersTabProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [extendUser, setExtendUser] = useState<Profile | null>(null);

  const computeStatus = (u: Profile): string => {
    if (u.blocked) return 'suspended';
    if (!u.approved) return 'pending';
    if (u.expires_at && new Date(u.expires_at) < new Date()) return 'expired';
    return 'active';
  };

  const filtered = users.filter((u) => {
    const matchesSearch = (u.email ?? '').toLowerCase().includes(search.toLowerCase()) || u.full_name.toLowerCase().includes(search.toLowerCase());
    const status = computeStatus(u);
    const matchesFilter = filter === 'all' || status === filter;
    return matchesSearch && matchesFilter;
  });

  const filterButtons: { id: FilterStatus; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'active', label: 'Activos' },
    { id: 'expired', label: 'Vencidos' },
    { id: 'suspended', label: 'Suspendidos' },
    { id: 'pending', label: 'Pendientes' },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o correo…"
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20 outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 text-sm text-white bg-academic-600 hover:bg-academic-700 px-3 py-2 rounded-lg transition-colors font-medium">
                <UserPlus className="w-4 h-4" /> Alta manual
              </button>
              <button onClick={() => exportUsersCSV(users, results)} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors">
                <FileSpreadsheet className="w-4 h-4" /> CSV
              </button>
              <button onClick={onRefresh} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-academic-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {filterButtons.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.id ? 'bg-academic-100 text-academic-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">{users.length === 0 ? 'No hay alumnos registrados.' : 'Sin resultados para tu búsqueda.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold">Alumno</th>
                  <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Registro</th>
                  <th className="text-left py-3 px-4 font-semibold">Vigencia</th>
                  <th className="text-left py-3 px-4 font-semibold hidden md:table-cell">Dispositivo</th>
                  <th className="text-left py-3 px-4 font-semibold">Estado</th>
                  <th className="text-right py-3 px-4 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => {
                  const status = computeStatus(u);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {u.avatar && <img src={u.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />}
                          <div>
                            <p className="font-medium text-slate-800">{u.full_name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell text-xs text-slate-500">{fmtDate(u.created_at)}</td>
                      <td className="py-3 px-4">
                        <ExpirationCell user={u} onRefresh={onRefresh} showToast={showToast} onExtend={() => setExtendUser(u)} />
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        {u.bound_device_id || u.device_fingerprint ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600"><Monitor className="w-3.5 h-3.5 text-emerald-500" /> Sí</span>
                        ) : <span className="text-xs text-slate-400">Sin registrar</span>}
                      </td>
                      <td className="py-3 px-4"><StatusBadge status={status} /></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {!u.approved && !u.blocked && (
                            <ActionBtn onClick={async () => { await approveUser(u.id); await onRefresh(); showToast('success', 'Alumno aprobado.'); }} color="emerald" icon={Check} label="Aprobar" />
                          )}
                          {u.approved && !u.blocked && (
                            <ActionBtn onClick={async () => { await blockUser(u.id); await onRefresh(); showToast('info', 'Alumno suspendido.'); }} color="red" icon={Ban} label="Suspender" />
                          )}
                          {u.blocked && (
                            <ActionBtn onClick={async () => { await unblockUser(u.id); await onRefresh(); showToast('success', 'Alumno reactivado.'); }} color="academic" icon={Check} label="Reactivar" />
                          )}
                          <ActionBtn onClick={() => setExtendUser(u)} color="academic" icon={CalendarPlus} label="Extender" />
                          {(u.bound_device_id || u.device_fingerprint) && (
                            <ActionBtn onClick={async () => { await resetDevice(u.id); await onRefresh(); showToast('success', 'Dispositivo liberado.'); }} color="amber" icon={RefreshCw} label="Liberar" />
                          )}
                          <ActionBtn onClick={async () => {
                            if (!u.email) { showToast('error', 'El alumno no tiene correo.'); return; }
                            const { error } = await sendPasswordResetEmail(u.email);
                            if (error) showToast('error', 'Error: ' + error);
                            else showToast('success', 'Enlace de reseteo enviado a ' + u.email);
                          }} color="slate" icon={KeyRound} label="Contraseña" />
                          <ActionBtn onClick={async () => {
                            if (!confirm(`¿Eliminar a ${u.full_name}? Esta acción no se puede deshacer.`)) return;
                            await deleteUser(u.id); await onRefresh(); showToast('success', 'Alumno eliminado.');
                          }} color="slate" icon={Trash2} label="" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} onRefresh={onRefresh} showToast={showToast} />}
      {extendUser && <ExtendLicenseModal user={extendUser} onClose={() => setExtendUser(null)} onRefresh={onRefresh} showToast={showToast} />}
    </div>
  );
}

function ExpirationCell({ user, onRefresh, showToast, onExtend }: { user: Profile; onRefresh: () => Promise<void>; showToast: (t: ToastType, m: string) => void; onExtend: () => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(user.expires_at ? user.expires_at.split('T')[0] : '');

  if (!editing) {
    const expired = user.expires_at && new Date(user.expires_at) < new Date();
    return (
      <div className="flex items-center gap-2">
        <button onClick={() => setEditing(true)} className={`text-xs hover:text-academic-600 transition-colors ${expired ? 'text-orange-600 font-medium' : 'text-slate-500'}`}>
          {user.expires_at ? fmtDate(user.expires_at) : 'Sin límite'}
        </button>
        <button onClick={onExtend} title="Extender licencia" className="text-academic-500 hover:bg-academic-50 rounded p-0.5 transition-colors">
          <CalendarPlus className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <input type="date" value={val} onChange={(e) => setVal(e.target.value)} className="text-xs border border-slate-200 rounded px-1.5 py-1" />
      <button onClick={async () => {
        await setExpiration(user.id, val ? new Date(val + 'T23:59:59').toISOString() : null);
        await onRefresh(); setEditing(false); showToast('success', 'Vigencia actualizada.');
      }} className="text-emerald-600 hover:bg-emerald-50 rounded p-1"><Save className="w-3.5 h-3.5" /></button>
      <button onClick={() => setEditing(false)} className="text-slate-400 hover:bg-slate-100 rounded p-1"><X className="w-3.5 h-3.5" /></button>
    </div>
  );
}

function CreateUserModal({ onClose, onRefresh, showToast }: { onClose: () => void; onRefresh: () => Promise<void>; showToast: (t: ToastType, m: string) => void }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [days, setDays] = useState(30);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) { showToast('error', 'Completa todos los campos.'); return; }
    setBusy(true);
    const { error } = await createUserManual({ email, password, fullName, days });
    setBusy(false);
    if (error) showToast('error', error);
    else {
      showToast('success', `Alumno creado. Licencia de ${days} días.`);
      await onRefresh();
      onClose();
    }
  };

  return (
    <Modal title="Alta manual de alumno" subtitle="Registro de alumno cobrado en efectivo" onClose={onClose} icon={UserPlus}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre completo">
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Nombre del alumno" required />
        </Field>
        <Field label="Correo electrónico">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="alumno@correo.com" required />
        </Field>
        <Field label="Contraseña temporal">
          <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} placeholder="Contraseña inicial" required />
        </Field>
        <Field label="Días de vigencia">
          <div className="flex items-center gap-2 flex-wrap">
            {[30, 60, 90, 180].map((d) => (
              <button key={d} type="button" onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${days === d ? 'bg-academic-100 text-academic-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                {d} días
              </button>
            ))}
            <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value) || 0)} className="w-20 text-sm border border-slate-200 rounded-lg px-2 py-1.5" min={1} />
          </div>
        </Field>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors">Cancelar</button>
          <button type="submit" disabled={busy} className="flex-1 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors disabled:opacity-60">
            {busy ? 'Creando…' : 'Crear alumno'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ExtendLicenseModal({ user, onClose, onRefresh, showToast }: { user: Profile; onClose: () => void; onRefresh: () => Promise<void>; showToast: (t: ToastType, m: string) => void }) {
  const [busy, setBusy] = useState(false);
  const current = user.expires_at ? fmtDate(user.expires_at) : 'Sin límite';
  const expired = user.expires_at && new Date(user.expires_at) < new Date();

  const handleExtend = async (days: number) => {
    setBusy(true);
    await extendLicense(user.id, days);
    setBusy(false);
    await onRefresh();
    showToast('success', `Licencia extendida ${days} días.`);
    onClose();
  };

  return (
    <Modal title="Extender licencia" subtitle={`${user.full_name} · ${user.email}`} onClose={onClose} icon={CalendarPlus}>
      <div className="space-y-4">
        <div className={`rounded-xl p-3 text-sm ${expired ? 'bg-orange-50 text-orange-700' : 'bg-slate-50 text-slate-600'}`}>
          Vigencia actual: <strong>{current}</strong>{expired && ' (Vencida)'}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[30, 60, 90, 180].map((d) => (
            <button key={d} disabled={busy} onClick={() => handleExtend(d)}
              className="py-4 rounded-xl border-2 border-slate-200 hover:border-academic-400 hover:bg-academic-50/50 transition-all text-center disabled:opacity-50">
              <p className="text-2xl font-bold text-academic-600">+{d}</p>
              <p className="text-xs text-slate-500">días</p>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ---- 2. Avatars Tab ----

function AvatarsTab({ onRefresh, showToast }: { onRefresh: () => Promise<void>; showToast: (t: ToastType, m: string) => void }) {
  const [avatars, setAvatars] = useState<AvatarCatalogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<FileInputRef>(null);

  useEffect(() => {
    (async () => {
      try { setAvatars(await fetchAvatarCatalog()); } catch { setAvatars([]); }
      setLoading(false);
    })();
  }, []);

  const refreshAvatars = async () => {
    try { setAvatars(await fetchAvatarCatalog()); } catch { setAvatars([]); }
    await onRefresh();
  };

  const handleFile = async (file: File) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('error', 'Formato no permitido. Solo PNG, JPEG o WebP.');
      return;
    }
    if (file.size > 1024 * 1024) {
      showToast('error', 'La imagen supera 1 MB. Reduce el tamaño.');
      return;
    }
    setUploading(true);
    const name = file.name.replace(/\.[^.]+$/, '').slice(0, 40);
    const { error } = await uploadAvatarFile(file, name);
    setUploading(false);
    if (error) showToast('error', 'Error al subir: ' + error);
    else {
      showToast('success', 'Avatar subido correctamente.');
      await refreshAvatars();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDelete = async (av: AvatarCatalogRow) => {
    if (!confirm(`¿Eliminar el avatar "${av.avatar_name}"?`)) return;
    try {
      await removeAvatarCatalogWithFile(av);
      showToast('success', 'Avatar eliminado.');
      await refreshAvatars();
    } catch {
      showToast('error', 'Error al eliminar el avatar.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-2">Subir nuevo avatar</h2>
        <p className="text-sm text-slate-500 mb-4">Formatos: PNG, JPEG, WebP · Máximo 1 MB · Recomendado: 512×512 px cuadrada</p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver ? 'border-academic-400 bg-academic-50' : 'border-slate-300 hover:border-academic-300 hover:bg-slate-50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-8 h-8 text-academic-500 animate-spin" />
              <p className="text-sm text-slate-500">Subiendo…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-academic-50 flex items-center justify-center">
                <Upload className="w-6 h-6 text-academic-500" />
              </div>
              <p className="text-sm font-medium text-slate-600">Arrastra una imagen aquí o haz clic para seleccionar</p>
              <p className="text-xs text-slate-400">PNG · JPEG · WebP · máx 1 MB</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Catálogo de avatares ({avatars.length})</h2>
        {loading ? (
          <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 text-slate-300 animate-spin" /></div>
        ) : avatars.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No hay avatares en el catálogo. Sube una imagen para comenzar.</p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
            {avatars.map((av) => (
              <div key={av.id} className="relative group">
                <img src={av.image_url} alt={av.avatar_name} className="w-full aspect-square rounded-xl border border-slate-200 object-cover" />
                <p className="text-xs text-slate-400 text-center mt-1 truncate">{av.avatar_name}</p>
                <button onClick={() => handleDelete(av)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- 3. Questions Tab ----

function QuestionsTab({ showToast }: { showToast: (t: ToastType, m: string) => void }) {
  const [questions, setQuestions] = useState<DbQuestion[]>([]);
  const [view, setView] = useState<'all' | 'paused'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editQuestion, setEditQuestion] = useState<DbQuestion | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      setQuestions(view === 'paused' ? await fetchPausedQuestions() : await fetchAllDbQuestions());
    } catch { setQuestions([]); }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [view]);

  const filtered = questions.filter((q) =>
    q.question_text.toLowerCase().includes(search.toLowerCase()) ||
    q.subject.toLowerCase().includes(search.toLowerCase()) ||
    q.topic.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 100);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
              <button onClick={() => setView('all')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'all' ? 'bg-white text-academic-600 shadow-sm' : 'text-slate-500'}`}>
                Todas
              </button>
              <button onClick={() => setView('paused')} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'paused' ? 'bg-white text-academic-600 shadow-sm' : 'text-slate-500'}`}>
                Pausadas / Reportadas
              </button>
            </div>
            <button onClick={() => { setEditQuestion(null); setShowEditor(true); }}
              className="flex items-center gap-1.5 text-sm text-white bg-academic-600 hover:bg-academic-700 px-3 py-2 rounded-lg transition-colors font-medium">
              <Plus className="w-4 h-4" /> Nueva pregunta
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por texto, materia o tema…"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20 outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center"><RefreshCw className="w-6 h-6 text-slate-300 mx-auto animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center"><Edit3 className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-slate-500 text-sm">Sin resultados.</p></div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
            {filtered.map((q) => (
              <div key={q.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-academic-600 bg-academic-50 px-2 py-0.5 rounded font-medium">{q.subject}</span>
                    <span className="text-xs text-slate-400">{q.topic}</span>
                    {q.is_paused && <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-medium">PAUSADA</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <ActionBtn onClick={async () => {
                      await toggleQuestionPause(q.id, !q.is_paused);
                      await refresh();
                      showToast('success', q.is_paused ? 'Pregunta despausada.' : 'Pregunta pausada.');
                    }} color="academic" icon={q.is_paused ? Play : Pause} label={q.is_paused ? 'Activar' : 'Pausar'} />
                    <ActionBtn onClick={() => { setEditQuestion(q); setShowEditor(true); }} color="academic" icon={Edit3} label="Editar" />
                    <ActionBtn onClick={async () => {
                      if (!confirm('¿Eliminar este reactivo?')) return;
                      await deleteQuestion(q.id); await refresh(); showToast('success', 'Reactivo eliminado.');
                    }} color="slate" icon={Trash2} label="" />
                  </div>
                </div>
                <MathText text={q.question_text} className="text-sm text-slate-700 font-medium block mb-2" />
                <div className="ml-2 space-y-0.5">
                  {q.options.map((o, i) => (
                    <div key={i} className={`text-xs flex items-start gap-1.5 ${i === q.correct_option ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                      <span>{String.fromCharCode(65 + i)}.</span>
                      <MathText text={o} />
                      {i === q.correct_option && <Check className="w-3 h-3 text-emerald-500 flex-shrink-0 mt-0.5" />}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400 font-medium mb-0.5">Explicación:</p>
                    <MathText text={q.explanation} className="text-xs text-slate-600 italic" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditor && <QuestionEditorModal question={editQuestion} onClose={() => { setShowEditor(false); setEditQuestion(null); }} onSaved={async () => { setShowEditor(false); setEditQuestion(null); await refresh(); }} showToast={showToast} />}
    </div>
  );
}

function QuestionEditorModal({ question, onClose, onSaved, showToast }: { question: DbQuestion | null; onClose: () => void; onSaved: () => void; showToast: (t: ToastType, m: string) => void }) {
  const [subject, setSubject] = useState(question?.subject ?? SUBJECTS[0].id);
  const [topic, setTopic] = useState(question?.topic ?? SUBJECTS[0].topics[0]);
  const [text, setText] = useState(question?.question_text ?? '');
  const [options, setOptions] = useState<string[]>(question?.options ?? ['', '', '', '']);
  const [correct, setCorrect] = useState(question?.correct_option ?? 0);
  const [explanation, setExplanation] = useState(question?.explanation ?? '');
  const [qType, setQType] = useState(question?.question_type ?? 'direct');
  const [busy, setBusy] = useState(false);

  const topics = SUBJECTS.find((s) => s.id === subject)?.topics ?? [];
  const qTypes = ['direct', 'reading_comprehension', 'analogy', 'sequence', 'problem_solving', 'column_matching'];

  const handleSave = async () => {
    if (!text.trim() || options.some((o) => !o.trim())) { showToast('error', 'Completa el enunciado y las 4 opciones.'); return; }
    setBusy(true);
    try {
      if (question) {
        await updateQuestion(question.id, { subject, topic, question_text: text, options, correct_option: correct, explanation, question_type: qType });
        showToast('success', 'Pregunta actualizada.');
      } else {
        await createQuestion({ subject, topic, question_text: text, options, correct_option: correct, explanation, question_type: qType });
        showToast('success', 'Pregunta creada.');
      }
      onSaved();
    } catch (err) {
      showToast('error', 'Error al guardar: ' + (err as Error).message);
    }
    setBusy(false);
  };

  return (
    <Modal title={question ? 'Editar pregunta' : 'Nueva pregunta'} subtitle="Soporta notación LaTeX con $...$" onClose={onClose} icon={Edit3}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Materia">
            <select value={subject} onChange={(e) => { setSubject(e.target.value); const t = SUBJECTS.find((s) => s.id === e.target.value)?.topics[0] ?? ''; setTopic(t); }} className={inputCls}>
              {SUBJECTS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </Field>
          <Field label="Subtema">
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className={inputCls}>
              {topics.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Tipo de pregunta">
          <select value={qType} onChange={(e) => setQType(e.target.value)} className={inputCls}>
            {qTypes.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </Field>
        <Field label="Enunciado">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Escribe el enunciado. Usa $...$ para matemáticas." />
        </Field>
        {text && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Vista previa:</p>
            <MathText text={text} className="text-sm text-slate-700" />
          </div>
        )}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-700">Opciones (selecciona la correcta)</p>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button type="button" onClick={() => setCorrect(i)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  correct === i ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}>
                {String.fromCharCode(65 + i)}
              </button>
              <input value={opt} onChange={(e) => { const o = [...options]; o[i] = e.target.value; setOptions(o); }}
                className={inputCls} placeholder={`Opción ${String.fromCharCode(65 + i)}`} />
              {correct === i && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
            </div>
          ))}
        </div>
        <Field label="Explicación paso a paso">
          <textarea value={explanation} onChange={(e) => setExplanation(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Explicación. Usa $...$ para matemáticas." />
        </Field>
        {explanation && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-xs text-slate-400 mb-1">Vista previa:</p>
            <MathText text={explanation} className="text-xs text-slate-600 italic" />
          </div>
        )}
        <div className="flex gap-3 pt-2 sticky bottom-0 bg-white pb-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={busy} className="flex-1 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors disabled:opacity-60">
            {busy ? 'Guardando…' : question ? 'Guardar cambios' : 'Crear pregunta'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ---- 4. Inactivity Tab ----

function InactivityTab({ users, results, onRefresh, showToast }: { users: Profile[]; results: ExamResult[]; onRefresh: () => Promise<void>; showToast: (t: ToastType, m: string) => void }) {
  const [miniCounts, setMiniCounts] = useState<Record<string, number>>({});

  const inactiveUsers = users.filter((u) => {
    if (!u.approved || u.blocked) return false;
    if (!u.last_login_at) return true;
    const days = (Date.now() - new Date(u.last_login_at).getTime()) / 86400000;
    return days > 3;
  });

  useEffect(() => {
    (async () => {
      const counts: Record<string, number> = {};
      for (const u of inactiveUsers) {
        try { counts[u.id] = (await fetchMiniExamResults(u.id)).length; } catch { counts[u.id] = 0; }
      }
      setMiniCounts(counts);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users.length]);

  const getDaysInactive = (u: Profile): number => {
    if (!u.last_login_at) return -1;
    return Math.floor((Date.now() - new Date(u.last_login_at).getTime()) / 86400000);
  };

  const getTrafficLight = (days: number): { color: string; label: string } => {
    if (days < 0) return { color: 'bg-red-500', label: 'Nunca' };
    if (days <= 7) return { color: 'bg-amber-500', label: `${days} días` };
    return { color: 'bg-red-500', label: `${days} días` };
  };

  const handleNotifyTutor = (u: Profile) => {
    const days = getDaysInactive(u);
    const msg = `Hola ${u.full_name}, notamos que no has ingresado a la plataforma${days > 0 ? ` en ${days} días` : ''}. Tu preparación para el examen es importante. ¡Ingresa hoy y continúa practicando!`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
    showToast('info', 'Abriendo WhatsApp con mensaje preconfigurado…');
  };

  const handleSendReportWhatsApp = (u: Profile) => {
    const userResults = results.filter((r) => r.user_id === u.id);
    const lastExam = userResults[0];
    const correct = lastExam ? lastExam.correct_answers : 0;
    const link = buildWhatsAppReportLink('', {
      studentName: u.full_name,
      correctAnswers: correct,
      totalQuestions: lastExam ? lastExam.total_questions : 128,
    });
    window.open(link, '_blank');
    showToast('info', 'Abriendo WhatsApp con reporte del alumno…');
  };

  if (inactiveUsers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
        <Check className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
        <p className="text-slate-600 font-medium">No hay alumnos inactivos.</p>
        <p className="text-sm text-slate-400 mt-1">Todos los alumnos activos han ingresado en los últimos 3 días.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-orange-500" />
          <span className="font-bold text-slate-800">Alumnos inactivos (más de 3 días sin actividad)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-orange-100 text-orange-700 font-semibold">{inactiveUsers.length}</span>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {inactiveUsers.map((u) => {
          const days = getDaysInactive(u);
          const light = getTrafficLight(days);
          return (
            <div key={u.id} className="p-4 flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <div className={`w-3 h-3 rounded-full ${light.color} flex-shrink-0`} />
                {u.avatar && <img src={u.avatar} alt="" className="w-9 h-9 rounded-full" />}
                <div>
                  <p className="font-medium text-slate-800 text-sm">{u.full_name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="text-center">
                  <p className="text-slate-400">Último acceso</p>
                  <p className="font-medium text-slate-700">{u.last_login_at ? fmtDate(u.last_login_at) : 'Nunca'}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">Mini-exámenes</p>
                  <p className="font-medium text-slate-700">{miniCounts[u.id] ?? 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400">Inactividad</p>
                  <p className={`font-bold ${light.color === 'bg-red-500' ? 'text-red-600' : 'text-amber-600'}`}>{light.label}</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleNotifyTutor(u)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-sm font-medium transition-colors">
                  <MessageCircle className="w-4 h-4" /> Notificar
                </button>
                <button onClick={() => handleSendReportWhatsApp(u)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-academic-50 hover:bg-academic-100 text-academic-700 text-sm font-medium transition-colors">
                  <FileText className="w-4 h-4" /> Reporte
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Alerts Tab ----

function AlertsTab({ alerts, onRefresh, showToast }: { alerts: AdminAlertRow[]; onRefresh: () => Promise<void>; showToast: (t: ToastType, m: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /><span className="font-bold text-slate-800">Intentos de acceso no autorizados</span></div>
      </div>
      {alerts.length === 0 ? (
        <div className="p-12 text-center"><Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" /><p className="text-slate-500 text-sm">No hay alertas. Todo está en orden.</p></div>
      ) : (
        <div className="divide-y divide-slate-100">
          {alerts.map((a) => (
            <div key={a.id} className="p-4 hover:bg-slate-50/50 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0"><AlertTriangle className="w-4 h-4 text-amber-600" /></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{a.user_name} <span className="text-slate-400 font-normal">· {a.email}</span></p>
                <p className="text-sm text-slate-600 mt-0.5">{a.message}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(a.created_at).toLocaleString('es-MX')}</p>
              </div>
              <button onClick={async () => { await clearAlert(a.id); await onRefresh(); showToast('success', 'Alerta eliminada.'); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"><XCircle className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- News Manager ----

function NewsManager({ onRefresh, showToast }: { onRefresh: () => Promise<void>; showToast: (t: ToastType, m: string) => void }) {
  const [news, setNews] = useState<NewsRow[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => { (async () => { try { setNews(await fetchNews()); } catch { setNews([]); } })(); }, []);
  const refresh = async () => { setNews(await fetchNews()); await onRefresh(); };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Publicar noticia o actividad</h2>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título del anuncio"
          className={`${inputCls} mb-3`} />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Contenido del anuncio…" rows={3}
          className={`${inputCls} mb-3 resize-none`} />
        <button onClick={async () => {
          if (!title.trim() || !body.trim()) { showToast('error', 'Completa título y contenido.'); return; }
          try { await addNews(title.trim(), body.trim()); setTitle(''); setBody(''); await refresh(); showToast('success', 'Noticia publicada.'); }
          catch { showToast('error', 'Error al publicar.'); }
        }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-all">
          <Plus className="w-4 h-4" /> Publicar
        </button>
      </div>
      {news.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
          {news.map((n) => (
            <div key={n.id} className="p-4 flex items-start gap-3">
              <Newspaper className="w-5 h-5 text-academic-500 flex-shrink-0 mt-1" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{n.title}</p>
                <p className="text-sm text-slate-600 mt-1">{n.body}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(n.created_at).toLocaleString('es-MX')}</p>
              </div>
              <button onClick={async () => { await deleteNews(n.id); await refresh(); showToast('success', 'Noticia eliminada.'); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Suggestions Manager ----

function SuggestionsManager({ onRefresh, showToast }: { onRefresh: () => Promise<void>; showToast: (t: ToastType, m: string) => void }) {
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  useEffect(() => { (async () => { try { setSuggestions(await fetchSuggestions()); } catch { setSuggestions([]); } })(); }, []);
  const refresh = async () => { setSuggestions(await fetchSuggestions()); await onRefresh(); };

  if (suggestions.length === 0)
    return <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center"><MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-2" /><p className="text-slate-500 text-sm">No hay sugerencias de los alumnos.</p></div>;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100">
      {suggestions.map((s) => (
        <div key={s.id} className="p-4 flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-academic-500 flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-800 text-sm">{s.user_name}</p>
            <p className="text-sm text-slate-600 mt-1">{s.message}</p>
            <p className="text-xs text-slate-400 mt-1">{new Date(s.created_at).toLocaleString('es-MX')}</p>
          </div>
          <button onClick={async () => { await deleteSuggestion(s.id); await refresh(); showToast('success', 'Sugerencia eliminada.'); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
        </div>
      ))}
    </div>
  );
}

// ---- UI Helpers ----

const inputCls = 'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20 outline-none transition-all';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Modal({ title, subtitle, onClose, icon: Icon, children }: { title: string; subtitle?: string; onClose: () => void; icon: typeof Plus; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-academic-50 flex items-center justify-center">
              <Icon className="w-5 h-5 text-academic-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">{title}</h2>
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function ActionBtn({ onClick, color, icon: Icon, label }: { onClick: () => void; color: 'emerald' | 'red' | 'academic' | 'amber' | 'slate'; icon: typeof Check; label: string }) {
  const colors = { emerald: 'text-emerald-600 hover:bg-emerald-50', red: 'text-red-600 hover:bg-red-50', academic: 'text-academic-600 hover:bg-academic-50', amber: 'text-amber-600 hover:bg-amber-50', slate: 'text-slate-500 hover:bg-slate-100' };
  return <button onClick={onClick} title={label} className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${colors[color]}`}><Icon className="w-3.5 h-3.5" />{label && <span className="hidden xl:inline">{label}</span>}</button>;
}

// ---- Type for file input ref ----
type FileInputRef = HTMLInputElement & { click: () => void };
