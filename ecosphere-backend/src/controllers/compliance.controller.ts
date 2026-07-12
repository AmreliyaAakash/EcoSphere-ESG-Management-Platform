import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { Audit } from '../models/Audit';
import { ComplianceIssue } from '../models/ComplianceIssue';
import { ApiError } from '../utils/ApiError';
import { checkComplianceOverdue } from '../jobs/complianceOverdue.job';
import { sendChallengeReminders } from '../jobs/challengeReminder.job';

export const getAudits = asyncHandler(async (req: Request, res: Response) => {
  const audits = await Audit.find().populate('auditorId');
  return res.status(200).json(new ApiResponse(200, audits, 'Audits fetched successfully'));
});

export const getComplianceIssues = asyncHandler(async (req: Request, res: Response) => {
  const { status, severity } = req.query;
  const query: any = {};

  if (status) {
    query.status = status;
  }
  if (severity) {
    query.severity = severity;
  }

  const issues = await ComplianceIssue.find(query)
    .populate('auditId')
    .populate('ownerId');
  return res.status(200).json(new ApiResponse(200, issues, 'Compliance issues fetched successfully'));
});

export const createComplianceIssue = asyncHandler(async (req: Request, res: Response) => {
  const { auditId, severity, description, ownerId, owner, dueDate } = req.body;
  const finalOwnerId = ownerId || owner;

  const issue = await ComplianceIssue.create({
    auditId,
    severity,
    description,
    ownerId: finalOwnerId,
    dueDate: new Date(dueDate),
    status: 'OPEN'
  });

  return res.status(201).json(new ApiResponse(201, issue, 'Compliance issue created successfully'));
});

export const updateComplianceIssue = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  if (updateData.owner && !updateData.ownerId) {
    updateData.ownerId = updateData.owner;
  }

  const issue = await ComplianceIssue.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!issue) {
    throw new ApiError(404, 'Compliance issue not found');
  }

  return res.status(200).json(new ApiResponse(200, issue, 'Compliance issue updated successfully'));
});

export const runComplianceCheckJob = asyncHandler(async (req: Request, res: Response) => {
  await checkComplianceOverdue();
  return res.status(200).json(new ApiResponse(200, null, 'Compliance overdue job executed manually'));
});

export const runChallengeRemindersJob = asyncHandler(async (req: Request, res: Response) => {
  await sendChallengeReminders();
  return res.status(200).json(new ApiResponse(200, null, 'Challenge reminder job executed manually'));
});
