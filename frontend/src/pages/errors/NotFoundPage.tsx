import { useNavigate } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center gap-4">
      <div className="w-20 h-20 rounded-pill bg-muted flex items-center justify-center">
        <UtensilsCrossed size={36} className="text-primary" />
      </div>
      <h1 className="text-8xl font-bold text-primary">404</h1>
      <h2 className="text-xl font-semibold text-foreground">Mesa no encontrada</h2>
      <p className="text-muted-foreground max-w-sm">La página que buscas no está en nuestra carta.</p>
      <Button onClick={() => navigate('/dashboard')} className="mt-2">Volver al inicio</Button>
    </div>
  );
}
