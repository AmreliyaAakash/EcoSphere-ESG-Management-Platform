import { Link, useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { navSections } from '@/config/navigation';
import { cn } from '@/lib/utils';

export function MobileNav({ onNavigate }: { onNavigate: () => void }) {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
        <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
          <Leaf className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-display font-bold text-lg">EcoSphere</span>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {navSections.map((section) => (
          <div key={section.label} className="mb-1">
            {section.items.length > 1 && (
              <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </div>
  );
}
