import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { GraduationCap, LayoutDashboard, BookOpen, Timer, UserCircle, LogOut, Library, BookText, Zap, AlertCircle, Sun, Moon, Target, type LucideIcon } from 'lucide-react';

export type Page = 'dashboard' | 'study' | 'simulacro' | 'profile' | 'theory' | 'glossary' | 'marathon' | 'errorbank' | 'certainty';

type Props = {
  current: Page;
  onNavigate: (page: Page) => void;
};

const NAV_ITEMS: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'study', label: 'Estudio', icon: BookOpen },
  { id: 'simulacro', label: 'Simulacro', icon: Timer },
  { id: 'marathon', label: 'Maratón', icon: Zap },
  { id: 'errorbank', label: 'Errores', icon: AlertCircle },
  { id: 'certainty', label: 'Certeza', icon: Target },
  { id: 'theory', label: 'Teoría', icon: Library },
  { id: 'glossary', label: 'Glosario', icon: BookText },
  { id: 'profile', label: 'Perfil', icon: UserCircle },
];

export default function Navbar({ current, onNavigate }: Props) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-academic-500 flex items-center justify-center shadow-md shadow-academic-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-100 hidden sm:block">PrepaExamen</span>
          </div>

          <nav className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = current === item.id;
              return (
                <button key={item.id} onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    active ? 'bg-academic-50 dark:bg-academic-900/30 text-academic-600 dark:text-academic-400' : 'text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={theme === 'light' ? 'Modo oscuro' : 'Modo claro'}>
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            {user?.avatar && <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-lg object-cover hidden sm:block" />}
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-tight max-w-[120px] truncate">{user?.full_name}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Estudiante</p>
            </div>
            <button onClick={() => signOut()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>

        <nav className="lg:hidden flex items-center gap-1 overflow-x-auto pb-2 -mx-1 px-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  active ? 'bg-academic-50 dark:bg-academic-900/30 text-academic-600 dark:text-academic-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
