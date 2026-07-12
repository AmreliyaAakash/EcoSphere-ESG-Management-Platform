import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { Audit } from '../models/Audit';
import { ComplianceIssue } from '../models/ComplianceIssue';
import { Employee } from '../models/Employee';
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
  let { auditId, severity, description, ownerId, owner, dueDate } = req.body;
  let finalOwnerId = ownerId || owner;

  if (!description) description = 'General compliance checking';
  if (!severity) severity = 'MEDIUM';

  if (!finalOwnerId) {
    const emp = await Employee.findOne();
    finalOwnerId = emp ? emp._id : '60d5ec4f1f1f1f1f1f000001';
  }

  if (!auditId) {
    const aud = await Audit.findOne();
    auditId = aud ? aud._id : '60d5ec4f1f1f1f1f1f050001';
  }

  const finalDueDate = dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const issue = await ComplianceIssue.create({
    auditId,
    severity,
    description,
    ownerId: finalOwnerId,
    dueDate: finalDueDate,
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

  // Support empty inputs safely by keeping existing values
  const issue = await ComplianceIssue.findById(id);
  if (!issue) {
    throw new ApiError(404, 'Compliance issue not found');
  }

  if (updateData.description !== undefined) issue.description = updateData.description || issue.description;
  if (updateData.severity !== undefined) issue.severity = updateData.severity || issue.severity;
  if (updateData.ownerId !== undefined && updateData.ownerId !== '') issue.ownerId = updateData.ownerId;
  if (updateData.dueDate !== undefined) issue.dueDate = updateData.dueDate ? new Date(updateData.dueDate) : issue.dueDate;
  if (updateData.auditId !== undefined && updateData.auditId !== '') issue.auditId = updateData.auditId;
  if (updateData.status !== undefined) issue.status = updateData.status || issue.status;

  await issue.save();

  return res.status(200).json(new ApiResponse(200, issue, 'Compliance issue updated successfully'));
});

export const deleteComplianceIssue = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const issue = await ComplianceIssue.findByIdAndDelete(id);
  if (!issue) {
    throw new ApiError(404, 'Compliance issue not found');
  }
  return res.status(200).json(new ApiResponse(200, null, 'Compliance issue deleted successfully'));
});

export const createAudit = asyncHandler(async (req: Request, res: Response) => {
  let { scope, date, findings, auditorId } = req.body;

  if (!scope) scope = 'General ESG Audit';
  if (!findings) findings = 'No major findings recorded yet.';
  
  if (!auditorId) {
    const emp = await Employee.findOne();
    auditorId = emp ? emp._id : '60d5ec4f1f1f1f1f1f000001';
  }

  const finalDate = date ? new Date(date) : new Date();

  const audit = await Audit.create({
    scope,
    date: finalDate,
    findings,
    auditorId
  });

  return res.status(201).json(new ApiResponse(201, audit, 'Audit created successfully'));
});

export const updateAudit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { scope, date, findings, auditorId } = req.body;

  const audit = await Audit.findById(id);
  if (!audit) {
    throw new ApiError(404, 'Audit not found');
  }

  if (scope !== undefined) audit.scope = scope || 'General ESG Audit';
  if (date !== undefined) audit.date = date ? new Date(date) : audit.date;
  if (findings !== undefined) audit.findings = findings || 'No major findings recorded yet.';
  if (auditorId !== undefined && auditorId !== '') audit.auditorId = auditorId;

  await audit.save();

  return res.status(200).json(new ApiResponse(200, audit, 'Audit updated successfully'));
});

export const deleteAudit = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const audit = await Audit.findByIdAndDelete(id);
  if (!audit) {
    throw new ApiError(404, 'Audit not found');
  }
  return res.status(200).json(new ApiResponse(200, null, 'Audit deleted successfully'));
});

export const runComplianceCheckJob = asyncHandler(async (req: Request, res: Response) => {
  await checkComplianceOverdue();
  return res.status(200).json(new ApiResponse(200, null, 'Compliance overdue job executed manually'));
});

export const runChallengeRemindersJob = asyncHandler(async (req: Request, res: Response) => {
  await sendChallengeReminders();
  return res.status(200).json(new ApiResponse(200, null, 'Challenge reminder job executed manually'));
});
