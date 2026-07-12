import cron from 'node-cron';
import { ChallengeParticipation } from '../models/ChallengeParticipation';
import { Challenge } from '../models/Challenge';
import { createNotification } from '../services/notification.service';

export const sendChallengeReminders = async () => {
  const now = new Date();
  const fortyEightHoursFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Find all active challenges with a deadline within the next 48 hours
  const upcomingChallenges = await Challenge.find({
    deadline: { $gte: now, $lte: fortyEightHoursFromNow },
    status: 'ACTIVE'
  });

  if (upcomingChallenges.length === 0) {
    return;
  }

  const challengeIds = upcomingChallenges.map(c => c._id);

  // Find participations for those challenges that are not yet approved/completed
  const participations = await ChallengeParticipation.find({
    challengeId: { $in: challengeIds },
    approval: { $ne: 'APPROVED' }
  }).populate('challengeId');

  for (const part of participations) {
    const challenge = part.challengeId as any;
    if (challenge) {
      await createNotification(
        part.employeeId.toString(),
        'CHALLENGE_REMINDER',
        `The challenge "${challenge.title}" has a deadline in less than 48 hours (${challenge.deadline.toDateString()}). Complete it soon!`
      );
    }
  }
};

export const initChallengeReminderJob = () => {
  // Scheduled daily at 00:10 server time
  cron.schedule('10 0 * * *', async () => {
    console.log('Running daily challenge reminders job...');
    try {
      await sendChallengeReminders();
      console.log('Challenge reminders job completed successfully.');
    } catch (error) {
      console.error('Error running challenge reminders job:', error);
    }
  });
};
