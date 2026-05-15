import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';

interface Props {
  title: string;
}

export function Header({ title }: Props) {
  const { user } = useAuthStore();
  const { notifCount } = useUiStore();
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-header-bg border-b border-border flex items-center justify-between px-6 flex-shrink-0">
      <div>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground">{user?.restaurante?.nombre ?? 'RestaurantOS'}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/notificaciones')}
          className="relative w-9 h-9 flex items-center justify-center rounded-m text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Bell size={18} />
          {notifCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-pill text-[10px] text-white flex items-center justify-center font-bold">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
