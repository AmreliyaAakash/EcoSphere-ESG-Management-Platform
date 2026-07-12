import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { CSRActivity } from '../models/CSRActivity';
import { CSRCategory } from '../models/CSRCategory';
import { Department } from '../models/Department';
import { ApiError } from '../utils/ApiError';

export const getCSRActivities = asyncHandler(async (req: Request, res: Response) => {
  const { departmentId, dateFrom, dateTo } = req.query;
  const query: any = {};

  if (departmentId) {
    query.departmentId = departmentId;
  }

  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) {
      query.date.$gte = new Date(dateFrom as string);
    }
    if (dateTo) {
      query.date.$lte = new Date(dateTo as string);
    }
  }

  const activities = await CSRActivity.find(query)
    .populate('categoryId')
    .populate('departmentId');
    
  return res.status(200).json(new ApiResponse(200, activities, 'CSR activities fetched successfully'));
});

export const createCSRActivity = asyncHandler(async (req: Request, res: Response) => {
  let { title, description, categoryId, departmentId, date } = req.body;

  if (!title) title = 'CSR Initiative';
  if (!description) description = 'CSR Community Engagement activity';

  if (!categoryId) {
    const cat = await CSRCategory.findOne();
    categoryId = cat ? cat._id : '60d5ec4f1f1f1f1f1f020001';
  }

  if (!departmentId) {
    const dept = await Department.findOne();
    departmentId = dept ? dept._id : '60d5ec4f1f1f1f1f1f010001';
  }

  const finalDate = date ? new Date(date) : new Date();

  const activity = await CSRActivity.create({
    title,
    description,
    categoryId,
    departmentId,
    date: finalDate
  });

  return res.status(201).json(new ApiResponse(201, activity, 'CSR activity created successfully'));
});

export const updateCSRActivity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, categoryId, departmentId, date } = req.body;

  const activity = await CSRActivity.findById(id);
  if (!activity) {
    throw new ApiError(404, 'CSR Activity not found');
  }

  if (title !== undefined) activity.title = title || 'CSR Initiative';
  if (description !== undefined) activity.description = description || 'CSR Community Engagement activity';
  if (categoryId !== undefined && categoryId !== '') activity.categoryId = categoryId;
  if (departmentId !== undefined && departmentId !== '') activity.departmentId = departmentId;
  if (date !== undefined) activity.date = date ? new Date(date) : activity.date;

  await activity.save();

  return res.status(200).json(new ApiResponse(200, activity, 'CSR activity updated successfully'));
});

export const deleteCSRActivity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const activity = await CSRActivity.findByIdAndDelete(id);
  if (!activity) {
    throw new ApiError(404, 'CSR Activity not found');
  }
  return res.status(200).json(new ApiResponse(200, null, 'CSR activity deleted successfully'));
});
