import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ESGScoreRingProps {
  total: number;
  environmental: number;
  social: number;
  governance: number;
  envWeight?: number;
  socialWeight?: number;
  govWeight?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

const ENV_COLOR = 'hsl(152, 47%, 42%)';
const SOCIAL_COLOR = 'hsl(48, 60%, 48%)';
const GOV_COLOR = 'hsl(210, 20%, 45%)';

export function ESGScoreRing({
  total,
  environmental,
  social,
  governance,
  envWeight = 40,
  socialWeight = 30,
  govWeight = 30,
  size = 240,
  strokeWidth = 16,
  label = 'Overall ESG Score',
  className,
}: ESGScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  // Each segment proportional to weight * score
  const envArc = (envWeight / 100) * (environmental / 100) * circumference;
  const socialArc = (socialWeight / 100) * (social / 100) * circumference;
  const govArc = (govWeight / 100) * (governance / 100) * circumference;

  // Gap between segments
  const gap = 6;
  const socialStart = envArc + gap;
  const govStart = envArc + socialArc + gap * 2;

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />

          {/* Environmental segment */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={ENV_COLOR}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0, envArc - gap)} ${circumference}`}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          />

          {/* Social segment */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={SOCIAL_COLOR}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0, socialArc - gap)} ${circumference}`}
            strokeDashoffset={-socialStart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          />

          {/* Governance segment */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={GOV_COLOR}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0, govArc - gap)} ${circumference}`}
            strokeDashoffset={-govStart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="font-mono font-bold text-4xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {total.toFixed(1)}
          </motion.span>
          <span className="text-xs text-muted-foreground mt-1">{label}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 flex-wrap justify-center">
        <LegendItem color={ENV_COLOR} label="Environmental" value={environmental} weight={envWeight} />
        <LegendItem color={SOCIAL_COLOR} label="Social" value={social} weight={socialWeight} />
        <LegendItem color={GOV_COLOR} label="Governance" value={governance} weight={govWeight} />
      </div>
    </div>
  );
}

function LegendItem({ color, label, value, weight }: { color: string; label: string; value: number; weight: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-mono font-semibold">{value}</span>
      <span className="text-[10px] text-muted-foreground">({weight}%)</span>
    </div>
  );
}

export { ENV_COLOR, SOCIAL_COLOR, GOV_COLOR };
