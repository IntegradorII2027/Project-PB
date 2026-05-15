import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../utils/cn';

const STEPS = ['Restaurante', 'Mesas', 'Administrador'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="flex items-center gap-2 mb-8">
        <Utensils size={20} className="text-primary" />
        <span className="font-bold text-foreground">RestaurantOS</span>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-pill flex items-center justify-center text-sm font-bold transition-colors',
              i < step ? 'bg-success text-white' : i === step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
            )}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            <span className={cn('text-sm', i === step ? 'text-foreground font-medium' : 'text-muted-foreground')}>{s}</span>
            {i < STEPS.length - 1 && <div className="w-12 h-px bg-border mx-1" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-l p-8 w-full max-w-md">
        {step === 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Datos del restaurante</h2>
            {['Nombre del restaurante', 'Dirección', 'Teléfono'].map((label) => (
              <div key={label}>
                <label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>
                <input className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Configurar mesas</h2>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Número de mesas</label>
              <input type="number" defaultValue={10} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Capacidad por defecto</label>
              <input type="number" defaultValue={4} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Crear administrador</h2>
            {['Nombre completo', 'Email', 'Contraseña'].map((label) => (
              <div key={label}>
                <label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>
                <input type={label === 'Contraseña' ? 'password' : 'text'} className="w-full bg-muted border border-border rounded-m px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary" />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 0 && <Button variant="secondary" className="flex-1" onClick={() => setStep(s => s - 1)}>Atrás</Button>}
          <Button className="flex-1" onClick={() => step < 2 ? setStep(s => s + 1) : navigate('/dashboard')}>
            {step < 2 ? 'Siguiente' : 'Finalizar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
