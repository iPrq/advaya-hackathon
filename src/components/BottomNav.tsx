'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShieldHalf, Globe, CreditCard, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { id: "home", href: "/home", icon: Home },
    { id: "safety", href: "/safety", icon: ShieldHalf },
    { id: "web", href: "/web", icon: Globe },
    { id: "finance", href: "/finance", icon: CreditCard },
    { id: "map", href: "/map", icon: Compass },
  ];

  const activeIndex = tabs.findIndex((t) => t.id === pathname.split('/')[1] || t.href === pathname);
  const safeIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-6 pb-[env(safe-area-inset-bottom,0px)] pointer-events-none">
      <nav
        className="pointer-events-auto relative flex items-center w-full max-w-sm bg-black/25 border-t border-white/5 backdrop-blur-xl rounded-full p-2 shadow-2xl overflow-hidden"
        style={{ fontFamily: "var(--font-poppins), system-ui, sans-serif" }}
      >
        {/* Strictly Linear Sliding Indicator (No Spring/Bounce) */}
        <div className="absolute inset-0 flex items-center px-2 pointer-events-none">
           <motion.div
              animate={{ x: `${safeIndex * 100}%` }}
              transition={{
                type: "tween", // Switched from spring to tween for zero bounce
                ease: [0.2, 1, 0.3, 1], // Custom medical-grade glide ease
                duration: 0.35
              }}
              className="w-[20%] h-[80%] rounded-full border border-emerald-500/20 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
           />
        </div>

        {/* Action Tabs */}
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="group relative flex-1 flex items-center justify-center h-12 outline-none"
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  stroke={isActive ? "#34d399" : "rgba(255, 255, 255, 0.2)"}
                  fill="none"
                  className="transition-all duration-300"
                  style={{
                    filter: isActive
                      ? "drop-shadow(0 0 8px rgba(52, 211, 153, 0.5))"
                      : "none",
                  }}
                />
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
