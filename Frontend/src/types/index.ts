// EcoSphere domain types — mirrors backend data shapes

export type ID = string;

export interface Department {
  id: ID;
  name: string;
  code: string;
  headEmployeeId: ID | null;
  parentDepartmentId: ID | null;
  employeeCount: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Category {
  id: ID;
  name: string;
  type: 'CSR_ACTIVITY' | 'CHALLENGE';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface EmissionFactor {
  id: ID;
  activityType: string;
  unit: string;
  co2ePerUnit: number;
  source: string;
}

export interface EnvironmentalGoal {
  id: ID;
  metric: string;
  targetValue: number;
  currentValue: number;
  deadline: string;
  departmentId: ID;
}

export interface ESGPolicy {
  id: ID;
  title: string;
  description: string;
  category: string;
  version: string;
  fileUrl: string;
}

export interface Badge {
  id: ID;
  name: string;
  description: string;
  unlockRule: { type: 'XP' | 'CHALLENGES_COMPLETED'; threshold: number };
  iconUrl: string;
}

export interface Reward {
  id: ID;
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
  status: 'AVAILABLE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
}

export interface CarbonTransaction {
  id: ID;
  sourceModule: string;
  quantity: number;
  emissionFactorId: ID;
  co2eCalculated: number;
  departmentId: ID;
  date: string;
}

export interface CSRActivity {
  id: ID;
  title: string;
  categoryId: ID;
  description: string;
  date: string;
  departmentId: ID;
}

export interface EmployeeParticipation {
  id: ID;
  employeeId: ID;
  activityId: ID;
  proofUrl: string | null;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  pointsEarned: number;
  completionDate: string;
}

export interface Challenge {
  id: ID;
  title: string;
  categoryId: ID;
  description: string;
  xp: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  evidenceRequired: boolean;
  deadline: string;
  status: 'DRAFT' | 'ACTIVE' | 'UNDER_REVIEW' | 'COMPLETED' | 'ARCHIVED';
}

export interface ChallengeParticipation {
  id: ID;
  challengeId: ID;
  employeeId: ID;
  progress: number;
  proofUrl: string | null;
  approval: 'PENDING' | 'APPROVED' | 'REJECTED';
  xpAwarded: number;
}

export interface PolicyAcknowledgement {
  id: ID;
  employeeId: ID;
  policyId: ID;
  acknowledgedAt: string;
}

export interface Audit {
  id: ID;
  scope: string;
  auditorId: ID;
  date: string;
  findings: string;
}

export interface ComplianceIssue {
  id: ID;
  auditId: ID;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  ownerId: ID;
  dueDate: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'OVERDUE';
}

export interface DepartmentScore {
  departmentId: ID;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  totalScore: number;
  period: string;
}

export interface Employee {
  id: ID;
  name: string;
  email: string;
  role: string;
  departmentId: ID;
  xpBalance: number;
  pointsBalance: number;
  avatarUrl: string;
}

export interface Notification {
  id: ID;
  recipientId: ID;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ESGConfig {
  envWeight: number;
  socialWeight: number;
  govWeight: number;
  autoEmissionCalc: boolean;
  evidenceRequired: boolean;
  badgeAutoAward: boolean;
}

export interface ScoreTrendPoint {
  period: string;
  environmental: number;
  social: number;
  governance: number;
  total: number;
}

export interface LeaderboardEntry {
  employeeId: ID;
  name: string;
  avatarUrl: string;
  departmentName: string;
  xp: number;
  points: number;
  rank: number;
  previousRank: number;
}

export interface DiversityMetric {
  category: string;
  value: number;
  label: string;
}

export interface TrainingRecord {
  id: ID;
  employeeId: ID;
  courseName: string;
  completionDate: string | null;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progress: number;
}
