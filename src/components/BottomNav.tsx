'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', path: '/home', icon: 'medical_services' },
    { label: 'Safety', path: '/safety', icon: 'security' },
    { label: 'Web', path: '/web', icon: 'language' },
    { label: 'Finance', path: '/finance', icon: 'payments' },
    { label: 'Map', path: '/map', icon: 'map' },
  ];

  return (
    <div className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none">
      <nav className="pointer-events-auto flex items-center justify-around w-full max-w-lg glass rounded-[2.5rem] px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex flex-col items-center justify-center min-w-[64px] transition-all duration-300 ${
                isActive ? 'text-emerald-400 scale-110' : 'text-gray-400 hover:text-white hover:scale-105'
              }`}
            >
              <div className="relative">
                <span 
                  className={`material-symbols-outlined text-[24px] transition-all duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-70'
                  }`}
                  style={{ 
                    fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    textShadow: isActive ? '0 0 15px rgba(52, 211, 153, 0.4)' : 'none'
                  }}
                >
                  {item.icon}
                </span>
                
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                )}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 transition-all duration-300 ${
                isActive ? 'opacity-100' : 'opacity-0 h-0 scale-50'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
