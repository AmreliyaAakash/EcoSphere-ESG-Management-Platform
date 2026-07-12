import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ComplianceIssue } from '../models/ComplianceIssue';
import { Employee } from '../models/Employee';
import { CarbonTransaction } from '../models/CarbonTransaction';
import { EmployeeParticipation } from '../models/EmployeeParticipation';
import { Department } from '../models/Department';
import { ESGConfig } from '../models/ESGConfig';

// Helper to compute ESG scores for a specific timeframe
async function calculateESGForPeriod(startDate?: Date, endDate?: Date) {
  let envWeight = 40, socialWeight = 30, govWeight = 30;
  try {
    const config = await ESGConfig.findOne();
    if (config) {
      envWeight = config.envWeight;
      socialWeight = config.socialWeight;
      govWeight = config.govWeight;
    }
  } catch (e) {
    console.error('Failed to get ESG config, using defaults:', e);
  }

  // 1. Environmental Score: derived from carbon emissions
  const carbonQuery: any = {};
  if (startDate || endDate) {
    carbonQuery.date = {};
    if (startDate) carbonQuery.date.$gte = startDate;
    if (endDate) carbonQuery.date.$lte = endDate;
  }
  const txs = await CarbonTransaction.find(carbonQuery);
  const totalCo2 = txs.reduce((sum, t) => sum + (t.co2eCalculated || t.quantity || 0), 0);
  // Benchmark logic: higher carbon emissions reduce the environmental score from a baseline of 95
  const envScore = Math.max(50, Math.min(100, 95 - (totalCo2 / 100)));

  // 2. Social Score: derived from approved employee CSR participations
  const socialQuery: any = { approvalStatus: 'APPROVED' };
  if (startDate || endDate) {
    socialQuery.completionDate = {};
    if (startDate) socialQuery.completionDate.$gte = startDate;
    if (endDate) socialQuery.completionDate.$lte = endDate;
  }
  const participationsCount = await EmployeeParticipation.countDocuments(socialQuery);
  // Benchmark logic: each approved activity increases the social score from a baseline of 70
  const socialScore = Math.max(50, Math.min(100, 70 + (participationsCount * 2)));

  // 3. Governance Score: derived from compliance issues status
  const govQuery: any = {};
  if (startDate || endDate) {
    govQuery.createdAt = {};
    if (startDate) govQuery.createdAt.$gte = startDate;
    if (endDate) govQuery.createdAt.$lte = endDate;
  }
  const issues = await ComplianceIssue.find(govQuery);
  const openCount = issues.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;
  const overdueCount = issues.filter(i => i.status === 'OVERDUE').length;
  // Benchmark logic: open and overdue issues deduct from a baseline of 98
  const govScore = Math.max(40, Math.min(100, 98 - (openCount * 2) - (overdueCount * 6)));

  const total = Math.round((envScore * envWeight + socialScore * socialWeight + govScore * govWeight) / 100 * 10) / 10;

  return {
    environmental: Math.round(envScore * 10) / 10,
    social: Math.round(socialScore * 10) / 10,
    governance: Math.round(govScore * 10) / 10,
    total
  };
}

// Helper to compute ESG scores for a specific department
async function calculateDepartmentESG(depId: string, startDate?: Date, endDate?: Date) {
  let envWeight = 40, socialWeight = 30, govWeight = 30;
  try {
    const config = await ESGConfig.findOne();
    if (config) {
      envWeight = config.envWeight;
      socialWeight = config.socialWeight;
      govWeight = config.govWeight;
    }
  } catch (e) {}

  // Find all employees belonging to this department
  const emps = await Employee.find({ departmentId: depId });
  const empIds = emps.map(e => e._id);

  // 1. Environmental: Carbon transactions tagged to this department
  const carbonQuery: any = { departmentId: depId };
  if (startDate || endDate) {
    carbonQuery.date = {};
    if (startDate) carbonQuery.date.$gte = startDate;
    if (endDate) carbonQuery.date.$lte = endDate;
  }
  const txs = await CarbonTransaction.find(carbonQuery);
  const totalCo2 = txs.reduce((sum, t) => sum + (t.co2eCalculated || t.quantity || 0), 0);
  const envScore = Math.max(50, Math.min(100, 95 - (totalCo2 / 30)));

  // 2. Social: Approved CSR participations by employees of this department
  const socialQuery: any = { employeeId: { $in: empIds }, approvalStatus: 'APPROVED' };
  if (startDate || endDate) {
    socialQuery.completionDate = {};
    if (startDate) socialQuery.completionDate.$gte = startDate;
    if (endDate) socialQuery.completionDate.$lte = endDate;
  }
  const participationsCount = await EmployeeParticipation.countDocuments(socialQuery);
  const socialScore = Math.max(50, Math.min(100, 70 + (participationsCount * 4)));

  // 3. Governance: Compliance issues owned by employees of this department
  const govQuery: any = { ownerId: { $in: empIds } };
  if (startDate || endDate) {
    govQuery.createdAt = {};
    if (startDate) govQuery.createdAt.$gte = startDate;
    if (endDate) govQuery.createdAt.$lte = endDate;
  }
  const issues = await ComplianceIssue.find(govQuery);
  const openCount = issues.filter(i => i.status === 'OPEN' || i.status === 'IN_PROGRESS').length;
  const overdueCount = issues.filter(i => i.status === 'OVERDUE').length;
  const govScore = Math.max(40, Math.min(100, 98 - (openCount * 4) - (overdueCount * 10)));

  const totalScore = Math.round((envScore * envWeight + socialScore * socialWeight + govScore * govWeight) / 100 * 10) / 10;

  return {
    environmentalScore: Math.round(envScore * 10) / 10,
    socialScore: Math.round(socialScore * 10) / 10,
    governanceScore: Math.round(govScore * 10) / 10,
    totalScore
  };
}

export const getScoreTrend = asyncHandler(async (req: Request, res: Response) => {
  // Define timeframes matching quarters
  const quarters = [
    { period: 'Q1 2025', start: new Date('2025-01-01'), end: new Date('2025-03-31') },
    { period: 'Q2 2025', start: new Date('2025-04-01'), end: new Date('2025-06-30') },
    { period: 'Q3 2025', start: new Date('2025-07-01'), end: new Date('2025-09-30') },
    { period: 'Q4 2025', start: new Date('2025-10-01'), end: new Date('2025-12-31') },
    { period: 'Q1 2026', start: new Date('2026-01-01'), end: new Date('2026-03-31') },
    { period: 'Q2 2026', start: new Date('2026-04-01'), end: new Date('2026-06-30') },
  ];

  const trend = [];
  for (const q of quarters) {
    const scores = await calculateESGForPeriod(q.start, q.end);
    trend.push({
      period: q.period,
      environmental: scores.environmental,
      social: scores.social,
      governance: scores.governance,
      total: scores.total
    });
  }

  return res.status(200).json(new ApiResponse(200, trend, 'Score trend fetched successfully'));
});

export const getDepartmentScores = asyncHandler(async (req: Request, res: Response) => {
  const depts = await Department.find();
  const scores = [];

  // Compute scores for the latest active period (Q2 2026 / current)
  const q2Start = new Date('2026-04-01');
  const q2End = new Date('2026-06-30');

  for (const dept of depts) {
    const deptScores = await calculateDepartmentESG(dept._id.toString(), q2Start, q2End);
    scores.push({
      departmentId: dept._id,
      departmentName: dept.name,
      environmentalScore: deptScores.environmentalScore,
      socialScore: deptScores.socialScore,
      governanceScore: deptScores.governanceScore,
      totalScore: deptScores.totalScore,
      period: 'Q2 2026'
    });
  }

  return res.status(200).json(new ApiResponse(200, scores, 'Department scores fetched successfully'));
});

export const getOverallScore = asyncHandler(async (req: Request, res: Response) => {
  // Compute overall ESG score for the latest active quarter
  const q2Start = new Date('2026-04-01');
  const q2End = new Date('2026-06-30');
  const overall = await calculateESGForPeriod(q2Start, q2End);

  return res.status(200).json(new ApiResponse(200, overall, 'Overall score fetched successfully'));
});

export const getOverdueComplianceIssues = asyncHandler(async (req: Request, res: Response) => {
  const issues = await ComplianceIssue.find({ status: 'OVERDUE' })
    .populate('auditId')
    .populate('ownerId');
  return res.status(200).json(new ApiResponse(200, issues, 'Overdue compliance issues fetched successfully'));
});

export const getTopLeaderboard = asyncHandler(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const topEmployees = await Employee.find()
    .sort({ xpBalance: -1 })
    .limit(limit)
    .populate('departmentId');

  const leaderboard = topEmployees.map((emp, index) => ({
    employeeId: emp._id,
    name: emp.name,
    avatarUrl: emp.avatarUrl,
    departmentName: (emp.departmentId as any)?.name || 'Unassigned',
    xp: emp.xpBalance,
    points: emp.pointsBalance,
    rank: index + 1
  }));

  return res.status(200).json(new ApiResponse(200, leaderboard, 'Top leaderboard fetched successfully'));
});
