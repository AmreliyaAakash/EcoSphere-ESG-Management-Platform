import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { Notification } from '../models/Notification';
import { ApiError } from '../utils/ApiError';

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const { read } = req.query;
  const query: any = { recipientId: req.user._id };

  if (read !== undefined) {
    query.read = read === 'true';
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(query);

  const unreadCount = await Notification.countDocuments({
    recipientId: req.user._id,
    read: false
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      'Notifications fetched successfully'
    )
  );
});

export const readNotification = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const notification = await Notification.findOneAndUpdate(
    { _id: id, recipientId: req.user._id },
    { $set: { read: true } },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  return res.status(200).json(new ApiResponse(200, notification, 'Notification marked as read successfully'));
});

export const readAllNotifications = asyncHandler(async (req: Request, res: Response) => {
  const result = await Notification.updateMany(
    { recipientId: req.user._id, read: false },
    { $set: { read: true } }
  );

  return res.status(200).json(new ApiResponse(200, { modifiedCount: result.modifiedCount }, 'All notifications marked as read successfully'));
});
