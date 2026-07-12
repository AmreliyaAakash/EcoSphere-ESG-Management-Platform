import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Menu, LogOut, User as UserIcon, Settings, ChevronDown, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notifications as mockNotifications } from '@/mockData';
import { cn } from '@/lib/utils';

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-card/80 backdrop-blur-sm border-b border-border shrink-0 z-30">
      {/* Left: mobile menu */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">EcoSphere Inc.</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Right: notifications, XP pill, avatar */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* XP/Points pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/15 border border-secondary/30">
          <Zap className="w-3.5 h-3.5 text-secondary" fill="currentColor" />
          <span className="text-xs font-mono font-semibold text-secondary">{user?.xpBalance?.toLocaleString() ?? 0} XP</span>
          <span className="text-xs text-muted-foreground mx-0.5">·</span>
          <span className="text-xs font-mono font-semibold">{user?.pointsBalance?.toLocaleString() ?? 0} pts</span>
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <Button variant="ghost" size="icon" onClick={() => setNotifOpen((o) => !o)} className="relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-sm">Notifications</span>
                  <Badge variant="secondary" className="text-[10px]">{unreadCount} new</Badge>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {mockNotifications.map((n) => (
                    <div
                      key={n.id}
                      className={cn(
                        'px-4 py-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer',
                        !n.read && 'bg-primary/5'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-0.5">{n.type.replace(/_/g, ' ')}</p>
                          <p className="text-sm leading-snug">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-muted transition-colors"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                {user?.name?.split(' ').map((n) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold leading-none">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden md:block" />
          </button>
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-56 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50"
              >
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <UserIcon className="w-4 h-4" /> My Profile
                  </button>
                  <button
                    onClick={() => { setUserMenuOpen(false); navigate('/settings/esg-config'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Settings className="w-4 h-4" /> Settings
                  </button>
                  <div className="h-px bg-border my-1" />
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
