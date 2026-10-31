import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BedDouble, UtensilsCrossed, Coffee, Sparkles, Trees } from 'lucide-react';

const SidebarNavigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/rooms', icon: BedDouble, label: 'Rooms' },
    { path: '/restaurant', icon: UtensilsCrossed, label: 'Dining' },
    { path: '/cafe', icon: Coffee, label: 'Cafe' },
    { path: '/wellness', icon: Sparkles, label: 'Wellness' },
    { path: '/garden', icon: Trees, label: 'Garden' }
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    /* Apple-style floating bottom pill for mobile only. Desktop relies on the sleek 56px Header */
    <div className="md:hidden fixed bottom-3 left-0 right-0 z-40 px-4 pointer-events-none pb-safe">
      <nav
        className="pointer-events-auto mx-auto max-w-sm flex items-center justify-around py-2 px-2 rounded-2xl bg-background/90 backdrop-blur-2xl border border-border/70 shadow-lg shadow-black/5"
        aria-label="Mobile navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                active
                  ? 'text-primary font-semibold'
                  : 'text-muted-foreground hover:text-foreground active:scale-95'
              }`}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                  active ? 'bg-primary/10 text-primary' : 'bg-transparent text-muted-foreground'
                }`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SidebarNavigation;
