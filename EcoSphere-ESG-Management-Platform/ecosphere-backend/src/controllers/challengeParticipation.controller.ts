import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ChallengeParticipation } from '../models/ChallengeParticipation';
import { Challenge } from '../models/Challenge';
import { Employee } from '../models/Employee';
import { ApiError } from '../utils/ApiError';
import { createNotification } from '../services/notification.service';
import { checkAndAwardBadges } from '../services/badge.service';

export const getChallengeParticipations = asyncHandler(async (req: Request, res: Response) => {
  const { challengeId, employeeId, approval } = req.query;
  const query: any = {};

  if (challengeId) {
    query.challengeId = challengeId;
  }
  if (employeeId) {
    query.employeeId = employeeId;
  }
  if (approval) {
    query.approval = approval;
  }

  const participations = await ChallengeParticipation.find(query)
    .populate('challengeId')
    .populate('employeeId');
  return res.status(200).json(new ApiResponse(200, participations, 'Challenge participations fetched successfully'));
});

export const approveChallengeParticipation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { xpAwarded } = req.body || {};

  const participation = await ChallengeParticipation.findById(id);
  if (!participation) {
    throw new ApiError(404, 'Challenge participation record not found');
  }

  if (participation.approval === 'APPROVED') {
    throw new ApiError(400, 'Participation is already approved');
  }

  const challenge = await Challenge.findById(participation.challengeId);
  if (!challenge) {
    throw new ApiError(404, 'Linked Challenge not found');
  }

  // Check evidence requirement
  if (challenge.evidenceRequired && !participation.proofUrl) {
    throw new ApiError(400, 'Proof is required before approval');
  }

  // Update XP earned if passed, otherwise use challenge's default xp
  const xpToAward = xpAwarded !== undefined ? xpAwarded : (challenge.xp || 50);

  // Update status
  participation.approval = 'APPROVED';
  participation.xpAwarded = xpToAward;
  await participation.save();

  // Award XP to employee
  const employee = await Employee.findById(participation.employeeId);
  if (employee) {
    employee.xpBalance += xpToAward;
    await employee.save();

    // notification
    await createNotification(
      employee._id.toString(),
      'CSR_APPROVED',
      `Your participation in "${challenge.title}" was approved! You earned ${xpToAward} XP.`
    );

    // Auto check badges
    await checkAndAwardBadges(employee._id.toString());
  }

  return res.status(200).json(new ApiResponse(200, participation, 'Challenge participation approved successfully'));
});

export const rejectChallengeParticipation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const participation = await ChallengeParticipation.findById(id);
  if (!participation) {
    throw new ApiError(404, 'Challenge participation record not found');
  }

  participation.approval = 'REJECTED';
  await participation.save();

  const challenge = await Challenge.findById(participation.challengeId);
  const title = challenge ? challenge.title : 'Challenge';

  await createNotification(
    participation.employeeId.toString(),
    'CSR_REJECTED',
    `Your participation in "${title}" was rejected.`
  );

  return res.status(200).json(new ApiResponse(200, participation, 'Challenge participation rejected successfully'));
});
