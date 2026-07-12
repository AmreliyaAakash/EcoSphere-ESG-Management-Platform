import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { EmployeeParticipation } from '../models/EmployeeParticipation';
import { CSRActivity } from '../models/CSRActivity';
import { Employee } from '../models/Employee';
import { ApiError } from '../utils/ApiError';
import { createNotification } from '../services/notification.service';
import { checkAndAwardBadges } from '../services/badge.service';

export const getEmployeeParticipations = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const { approvalStatus, employeeId } = req.query;
  const query: any = {};

  if (approvalStatus) {
    query.approvalStatus = approvalStatus;
  }

  if (employeeId) {
    query.employeeId = employeeId;
  }

  const participations = await EmployeeParticipation.find(query)
    .populate('employeeId')
    .populate({
      path: 'activityId',
      populate: { path: 'categoryId' }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await EmployeeParticipation.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200, 
      {
        participations,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }, 
      'Employee participations fetched successfully'
    )
  );
});

export const approveParticipation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { pointsEarned } = req.body || {};

  const participation = await EmployeeParticipation.findById(id);
  if (!participation) {
    throw new ApiError(404, 'Employee participation record not found');
  }

  if (participation.approvalStatus === 'APPROVED') {
    throw new ApiError(400, 'Participation is already approved');
  }

  const activity = await CSRActivity.findById(participation.activityId);
  if (!activity) {
    throw new ApiError(404, 'Linked CSR Activity not found');
  }

  // Check evidence requirement
  if (activity.evidenceRequired && !participation.proofUrl) {
    throw new ApiError(400, 'Proof is required before approval');
  }

  // Update points earned if passed, otherwise use existing
  const pointsToAward = pointsEarned !== undefined ? pointsEarned : (participation.pointsEarned || 50);

  // Update status
  participation.approvalStatus = 'APPROVED';
  participation.pointsEarned = pointsToAward;
  await participation.save();

  // Award points to employee (and add to XP balance so badge milestones can trigger)
  const employee = await Employee.findById(participation.employeeId);
  if (employee) {
    employee.pointsBalance += pointsToAward;
    employee.xpBalance += pointsToAward; // Earning points also increases XP
    await employee.save();
    
    // central notification
    await createNotification(
      employee._id.toString(),
      'CSR_APPROVED',
      `Your participation in "${activity.title}" was approved! You earned ${pointsToAward} points and XP.`
    );

    // Auto check badges
    await checkAndAwardBadges(employee._id.toString());
  }

  return res.status(200).json(new ApiResponse(200, participation, 'Participation approved successfully'));
});

export const rejectParticipation = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const participation = await EmployeeParticipation.findById(id);
  if (!participation) {
    throw new ApiError(404, 'Employee participation record not found');
  }

  participation.approvalStatus = 'REJECTED';
  await participation.save();

  const activity = await CSRActivity.findById(participation.activityId);
  const title = activity ? activity.title : 'CSR Activity';

  await createNotification(
    participation.employeeId.toString(),
    'CSR_REJECTED',
    `Your participation in "${title}" was rejected.`
  );

  return res.status(200).json(new ApiResponse(200, participation, 'Participation rejected successfully'));
});
