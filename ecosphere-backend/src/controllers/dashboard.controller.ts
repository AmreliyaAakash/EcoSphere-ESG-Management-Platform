import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ComplianceIssue } from '../models/ComplianceIssue';
import { Employee } from '../models/Employee';

export const getScoreTrend = asyncHandler(async (req: Request, res: Response) => {
  // Return trend data structure matching mockData
  const trend = [
    { period: 'Q1 2025', environmental: 65, social: 70, governance: 75, total: 69.5 },
    { period: 'Q2 2025', environmental: 68, social: 72, governance: 77, total: 71.9 },
    { period: 'Q3 2025', environmental: 72, social: 75, governance: 79, total: 75.0 },
    { period: 'Q4 2025', environmental: 75, social: 78, governance: 82, total: 77.8 },
    { period: 'Q1 2026', environmental: 78, social: 80, governance: 85, total: 80.6 },
    { period: 'Q2 2026', environmental: 82, social: 82, governance: 88, total: 83.6 },
  ];
  return res.status(200).json(new ApiResponse(200, trend, 'Score trend fetched successfully'));
});

export const getDepartmentScores = asyncHandler(async (req: Request, res: Response) => {
  // Since we don't have a DepartmentScore collection, return matches to mockData
  const scores = [
    { departmentId: 'd1', environmentalScore: 82, socialScore: 74, governanceScore: 88, totalScore: 81.2, period: 'Q2 2026' },
    { departmentId: 'd2', environmentalScore: 76, socialScore: 80, governanceScore: 72, totalScore: 76.0, period: 'Q2 2026' },
    { departmentId: 'd3', environmentalScore: 68, socialScore: 85, governanceScore: 78, totalScore: 76.5, period: 'Q2 2026' },
    { departmentId: 'd4', environmentalScore: 71, socialScore: 90, governanceScore: 84, totalScore: 81.4, period: 'Q2 2026' },
    { departmentId: 'd5', environmentalScore: 65, socialScore: 70, governanceScore: 92, totalScore: 74.0, period: 'Q2 2026' },
  ];
  return res.status(200).json(new ApiResponse(200, scores, 'Department scores fetched successfully'));
});

export const getOverallScore = asyncHandler(async (req: Request, res: Response) => {
  // Overall company ESG score
  const overall = {
    environmental: 82,
    social: 82,
    governance: 88,
    total: 83.6
  };
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
  return res.status(200).json(new ApiResponse(200, topEmployees, 'Top leaderboard fetched successfully'));
});
