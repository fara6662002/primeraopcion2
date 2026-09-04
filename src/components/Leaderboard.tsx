import { useEffect, useState } from 'react';
import { fetchRanking, type RankingRow } from '@/lib/store';
import { Trophy, Medal, Crown, Loader2 } from 'lucide-react';

export default function Leaderboard({ currentUserId }: { currentUserId?: string }) {
  const [rankings, setRankings] = useState<RankingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchRanking();
        setRankings(data.slice(0, 10));
      } catch {
        /* ignore */
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-academic-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" /> Tabla de clasificación
        </h2>
        <p className="text-sm text-slate-400 text-center py-6">Aún no hay datos suficientes para el ranking.</p>
      </div>
    );
  }

  const medalColors = [
    { bg: 'from-amber-400 to-yellow-500', text: 'text-amber-600', icon: Crown },
    { bg: 'from-slate-300 to-slate-400', text: 'text-slate-600', icon: Medal },
    { bg: 'from-orange-400 to-amber-600', text: 'text-orange-600', icon: Medal },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-amber-500" /> Tabla de clasificación
      </h2>
      <div className="space-y-2">
        {rankings.map((r, i) => {
          const medal = medalColors[i];
          const isMe = r.user_id === currentUserId;
          return (
            <div
              key={r.user_id}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                isMe
                  ? 'bg-academic-50 dark:bg-academic-900/20 border border-academic-200 dark:border-academic-700'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div className="flex-shrink-0 w-8 text-center">
                {i < 3 ? (
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${medal.bg} flex items-center justify-center`}>
                    <medal.icon className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <span className="text-sm font-bold text-slate-400">{i + 1}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                  {r.nickname || 'Anónimo'}
                  {isMe && <span className="ml-2 text-xs text-academic-600 font-medium">(Tú)</span>}
                </p>
                <p className="text-xs text-slate-400">{r.total_exams} simulacros</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className={`text-lg font-bold ${medal?.text ?? 'text-slate-600'}`}>
                  {r.best_score.toFixed(1)}%
                </p>
                <p className="text-xs text-slate-400">mejor</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
