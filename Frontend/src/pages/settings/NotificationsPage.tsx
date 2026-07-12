import { motion } from 'framer-motion';
import { Bell, Mail } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

import { useState } from 'react';

const NOTIFICATION_TYPES = [
  { key: 'XP_AWARDED', label: 'XP Awarded', description: 'When you earn XP from challenge approvals' },
  { key: 'BADGE_UNLOCKED', label: 'Badge Unlocked', description: 'When you unlock a new badge' },
  { key: 'COMPLIANCE_OVERDUE', label: 'Compliance Overdue', description: 'When a compliance issue becomes overdue' },
  { key: 'CHALLENGE_DEADLINE', label: 'Challenge Deadline', description: 'When a challenge deadline is approaching' },
  { key: 'PARTICIPATION_PENDING', label: 'Participation Pending', description: 'When there are pending approvals to review' },
  { key: 'REWARD_REDEEMED', label: 'Reward Redeemed', description: 'When you successfully redeem a reward' },
];

export function NotificationsPage() {
  const [prefs, setPrefs] = useState<Record<string, { inApp: boolean; email: boolean }>>(() => {
    const saved = localStorage.getItem('ecosphere_notification_prefs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return Object.fromEntries(NOTIFICATION_TYPES.map((t) => [t.key, { inApp: true, email: false }]));
  });

  function toggle(key: string, channel: 'inApp' | 'email') {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: { ...prev[key], [channel]: !prev[key][channel] } };
      localStorage.setItem('ecosphere_notification_prefs', JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <div className="p-6 max-w-[1000px] mx-auto">
      <PageHeader title="Notification Preferences" description="Choose how you want to be notified about events" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event Notifications</CardTitle>
          <CardDescription>Toggle in-app and email notifications per event type</CardDescription>
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><Bell className="w-3.5 h-3.5" /> In-App</span>
            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {NOTIFICATION_TYPES.map((type, i) => (
            <motion.div
              key={type.key}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{type.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={prefs[type.key].inApp} onCheckedChange={() => toggle(type.key, 'inApp')} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={prefs[type.key].email} onCheckedChange={() => toggle(type.key, 'email')} />
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
