import { Notification } from '../models/Notification';

export const createNotification = async (
  recipientId: string,
  type: string,
  message: string
) => {
  const notification = await Notification.create({
    recipientId,
    type,
    message,
    read: false
  });
  return notification;
};
