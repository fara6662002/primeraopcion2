import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchResultsByUser, fetchAvatarCatalogUrls, updateUserAvatar, deleteResult, updateTargetSchools, updateParentEmail, getRank, type ExamResult } from '@/lib/store';
import { SUBJECT_NAMES, type SubjectId } from '@/data/questionBank';
import { Mail, Calendar, User, Award, Clock, TrendingUp, Trash2, Image as ImageIcon, Check, X, Trophy, Users } from 'lucide-react';

const SCHOOL_OPTIONS = [
  'ENP 1 - Gabino Barreda', 'ENP 2 - Erasmo Castellanos Quinto', 'ENP 3 - Justo Sierra',
  'ENP 4 - Gabriel Mancera', 'ENP 5 - José Vasconcelos', 'ENP 6 - Antonio Caso',
  'ENP 7 - Ramón G. Bonfil', 'ENP 8 - Miguel E. Schulz', 'ENP 9 - Pedro de Alba',
  'CCH Sur', 'CCH Norte', 'CCH Oriente', 'CCH Occidente', 'CCH Azcapotzalco', 'CCH Naucalpan', 'CCH Vallejo',
  'CECyT 1 - Wilfrido Massieu', 'CECyT 2 - Miguel Bernard', 'CECyT 3 - Estanislao Ramírez',
  'CECyT 4 - Lázaro Cárdenas', 'CECyT 5 - Benito Juárez', 'CECyT 6 - Wilfrido Massieu',
  'CECyT 7 - Cuauhtémoc', 'CECyT 8 - Luis Enrique Erro', 'CECyT 9 - Juan de Dios Bátiz',
  'CECyT 10 - Karl Marx', 'CECyT 11 - Wilfrido Massieu', 'CECyT 12 - José María Morelos',
  'CECyT 13 - Ricardo Flores Magón', 'CECyT 14 - Luis Enrique Erro', 'CECyT 15 - Diódoro J. Rueda',
  'Otra',
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [savedAvatar, setSavedAvatar] = useState(false);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [savedSchools, setSavedSchools] = useState(false);
  const [showSchoolsEditor, setShowSchoolsEditor] = useState(false);
  const [parentEmailValue, setParentEmailValue] = useState('');
  const [savedParentEmail, setSavedParentEmail] = useState(false);
  const [showParentEditor, setShowParentEditor] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [r, av] = await Promise.all([fetchResultsByUser(user.id), fetchAvatarCatalogUrls()]);
        setResults(r);
        setAvatars(av);
        setSelectedAvatar(user.avatar ?? null);
        setSelectedSchools(user.target_schools ?? []);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, [user]);

  const handleSaveAvatar = async () => {
    if (!user || !selectedAvatar) return;
    await updateUserAvatar(user.id, selectedAvatar);
    await refreshUser();
    setSavedAvatar(true);
    setTimeout(() => setSavedAvatar(false), 2000);
  };

  const handleSaveSchools = async () => {
    if (!user) return;
    await updateTargetSchools(user.id, selectedSchools);
    await refreshUser();
    setSavedSchools(true);
    setTimeout(() => { setSavedSchools(false); setShowSchoolsEditor(false); }, 1200);
  };

  const handleSaveParentEmail = async () => {
    if (!user) return;
    await updateParentEmail(user.id, parentEmailValue.trim());
    await refreshUser();
    setSavedParentEmail(true);
    setTimeout(() => { setSavedParentEmail(false); setShowParentEditor(false); }, 1200);
  };

  const handleDelete = async (id: string) => {
    await deleteResult(id);
    if (user) setResults(await fetchResultsByUser(user.id));
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec}s`;
  };

  if (!user) return null;

  const avgPct = results.length > 0 ? results.reduce((s, r) => s + Number(r.percentage), 0) / results.length : 0;
  const bestPct = results.length > 0 ? Math.max(...results.map((r) => Number(r.percentage))) : 0;
  const rank = getRank(bestPct);

  const toggleSchool = (school: string) => {
    setSelectedSchools((prev) => {
      if (prev.includes(school)) return prev.filter((s) => s !== school);
      if (prev.length >= 5) return prev;
      return [...prev, school];
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-[fadeIn_0.2s_ease-out]">
      {/* Profile header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-slate-800 to-academic-800 dark:from-slate-900 dark:to-academic-900 p-6 flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          )}
          <div className="text-white">
            <h1 className="text-xl font-bold">{user.full_name}</h1>
            <p className="text-sm text-white/70 flex items-center gap-1.5 mt-0.5"><Mail className="w-3.5 h-3.5" /> {user.email}</p>
            <p className="text-xs text-white/50 flex items-center gap-1.5 mt-0.5"><Calendar className="w-3.5 h-3.5" /> Miembro desde {new Date(user.created_at).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700">
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{results.length}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Simulacros</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{avgPct.toFixed(0)}%</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Promedio</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{bestPct.toFixed(0)}%</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Mejor</p>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-center">
          <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r ${rank.color} text-white`}>
            <Trophy className="w-4 h-4" /> {rank.label}
          </div>
        </div>
      </div>

      {/* Parent email */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-academic-500" /> Correo del padre, madre o tutor</h2>
        {showParentEditor ? (
          <>
            <div className="relative mb-4">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input type="email" value={parentEmailValue} onChange={(e) => setParentEmailValue(e.target.value)} placeholder="tutor@correo.mx" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 focus:border-academic-500 focus:ring-2 focus:ring-academic-500/20 outline-none transition-all" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setParentEmailValue(user.parent_email ?? ''); setShowParentEditor(false); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
              <button onClick={handleSaveParentEmail} className="flex-1 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5">
                {savedParentEmail ? <><Check className="w-4 h-4" /> Guardado</> : 'Guardar'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400" /> {user.parent_email ?? 'No configurado'}</p>
            <button onClick={() => setShowParentEditor(true)} className="px-5 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors">
              {user.parent_email ? 'Editar correo' : 'Agregar correo'}
            </button>
          </>
        )}
      </div>

      {/* Avatar selector */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-academic-500" /> Cambiar avatar</h2>
        {avatars.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 text-sm">No hay avatares disponibles aún.</p>
        ) : (
          <>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 mb-4">
              {avatars.map((av) => (
                <button key={av} onClick={() => setSelectedAvatar(av)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-square ${selectedAvatar === av ? 'border-academic-500 ring-2 ring-academic-500/30' : 'border-slate-200 hover:border-academic-300'}`}>
                  <img src={av} alt="avatar" className="w-full h-full object-cover" />
                  {selectedAvatar === av && <div className="absolute inset-0 bg-academic-500/20 flex items-center justify-center"><Check className="w-5 h-5 text-white drop-shadow" /></div>}
                </button>
              ))}
            </div>
            <button onClick={handleSaveAvatar} disabled={!selectedAvatar || selectedAvatar === user.avatar}
              className="px-5 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
              {savedAvatar ? <><Check className="w-4 h-4" /> ¡Avatar guardado!</> : 'Guardar avatar'}
            </button>
          </>
        )}
      </div>

      {/* School choices */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-academic-500" /> Opciones educativas</h2>
        {showSchoolsEditor ? (
          <>
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">Selecciona tus 5 escuelas de preferencia ({selectedSchools.length}/5)</p>
            <div className="max-h-60 overflow-y-auto space-y-1.5 mb-4">
              {SCHOOL_OPTIONS.map((school) => {
                const isSelected = selectedSchools.includes(school);
                const isDisabled = !isSelected && selectedSchools.length >= 5;
                return (
                  <button key={school} onClick={() => toggleSchool(school)} disabled={isDisabled}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border transition-all text-left text-sm ${isSelected ? 'border-academic-400 bg-academic-50 text-academic-700 dark:bg-academic-900/30 dark:text-academic-400 font-medium' : isDisabled ? 'border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-academic-200'}`}>
                    {school}
                    {isSelected && <Check className="w-4 h-4 text-academic-500 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSelectedSchools(user.target_schools ?? []); setShowSchoolsEditor(false); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700">Cancelar</button>
              <button onClick={handleSaveSchools} className="flex-1 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm flex items-center justify-center gap-1.5">
                {savedSchools ? <><Check className="w-4 h-4" /> Guardado</> : 'Guardar'}
              </button>
            </div>
          </>
        ) : (
          <>
            {selectedSchools.length > 0 ? (
              <div className="space-y-2 mb-4">
                {selectedSchools.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="w-7 h-7 rounded-lg bg-academic-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                    <span className="text-sm text-slate-700">{s}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">No has seleccionado tus opciones educativas.</p>
            )}
            <button onClick={() => setShowSchoolsEditor(true)} className="px-5 py-2.5 rounded-xl bg-academic-600 hover:bg-academic-700 text-white font-semibold text-sm transition-colors">
              {selectedSchools.length > 0 ? 'Editar opciones' : 'Seleccionar opciones'}
            </button>
          </>
        )}
      </div>

      {/* Exam history */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Historial de simulacros</h2>
        {loading ? (
          <p className="text-slate-400 dark:text-slate-500 text-sm">Cargando…</p>
        ) : results.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-10 h-10 text-slate-200 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 dark:text-slate-500 text-sm">Aún no has realizado simulacros.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {results.map((r) => {
              const pct = Number(r.percentage);
              const color = pct >= 70 ? 'text-emerald-600 bg-emerald-50' : pct >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50';
              const breakdown = r.breakdown_by_subject ?? r.subject_breakdown ?? [];
              const weakest = [...breakdown].sort((a, b) => (a.correct / a.total) - (b.correct / b.total)).slice(0, 2);
              return (
                <div key={r.id} className="group flex items-start justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-bold px-2.5 py-0.5 rounded-lg ${color}`}>{pct.toFixed(1)}%</span>
                      <span className="text-sm text-slate-600 dark:text-slate-300">{r.correct_answers}/{r.total_questions} aciertos</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{new Date(r.completed_at).toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} · {formatDuration(r.duration_seconds)}</p>
                    {weakest.length > 0 && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Áreas a mejorar: {weakest.map((w) => SUBJECT_NAMES[w.subject as SubjectId] ?? w.subject).join(', ')}</p>
                    )}
                  </div>
                  <button onClick={() => handleDelete(r.id)} className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
