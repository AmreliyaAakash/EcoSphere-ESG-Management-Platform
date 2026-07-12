import {
  LayoutDashboard, Leaf, Users, Shield, Trophy, FileBarChart,
  Settings, Factory, Target, ListTree, HeartHandshake, ClipboardCheck,
  Award, Gift, Crown, FileText, CheckCircle, AlertTriangle, User,
  Building2, Tags, SlidersHorizontal, Bell,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavSection {
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    items: [{ label: 'Overview', path: '/dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'Environmental',
    icon: Leaf,
    items: [
      { label: 'Emission Factors', path: '/environmental/emission-factors', icon: Factory },
      { label: 'Carbon Transactions', path: '/environmental/transactions', icon: ListTree },
      { label: 'Sustainability Goals', path: '/environmental/goals', icon: Target },
      { label: 'Environmental Dashboard', path: '/environmental/dashboard', icon: Leaf },
    ],
  },
  {
    label: 'Social',
    icon: Users,
    items: [
      { label: 'CSR Activities', path: '/social/csr-activities', icon: HeartHandshake },
      { label: 'Participation Queue', path: '/social/participation', icon: ClipboardCheck },
      { label: 'Diversity Metrics', path: '/social/diversity', icon: Users },
      { label: 'Training Tracker', path: '/social/training', icon: Award },
    ],
  },
  {
    label: 'Governance',
    icon: Shield,
    items: [
      { label: 'Policy Library', path: '/governance/policies', icon: FileText },
      { label: 'Acknowledgements', path: '/governance/acknowledgements', icon: CheckCircle },
      { label: 'Audits', path: '/governance/audits', icon: Shield },
      { label: 'Compliance Issues', path: '/governance/compliance-issues', icon: AlertTriangle },
    ],
  },
  {
    label: 'Gamification',
    icon: Trophy,
    items: [
      { label: 'Challenges', path: '/gamification/challenges', icon: Trophy },
      { label: 'Badges', path: '/gamification/badges', icon: Award },
      { label: 'Rewards', path: '/gamification/rewards', icon: Gift },
      { label: 'Leaderboard', path: '/gamification/leaderboard', icon: Crown },
    ],
  },
  {
    label: 'Reports',
    icon: FileBarChart,
    items: [
      { label: 'Report Types', path: '/reports', icon: FileBarChart },
      { label: 'Custom Builder', path: '/reports/builder', icon: FileBarChart },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    items: [
      { label: 'Departments', path: '/settings/departments', icon: Building2 },
      { label: 'Categories', path: '/settings/categories', icon: Tags },
      { label: 'ESG Configuration', path: '/settings/esg-config', icon: SlidersHorizontal },
      { label: 'Notifications', path: '/settings/notifications', icon: Bell },
    ],
  },
  {
    label: 'Profile',
    icon: User,
    items: [{ label: 'My Profile', path: '/profile', icon: User }],
  },
];
