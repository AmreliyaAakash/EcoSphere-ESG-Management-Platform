import { Employee } from '../models/Employee';
import { Badge } from '../models/Badge';
import { EmployeeBadge } from '../models/EmployeeBadge';
import { ChallengeParticipation } from '../models/ChallengeParticipation';
import { ESGConfig } from '../models/ESGConfig';
import { createNotification } from './notification.service';

export const checkAndAwardBadges = async (employeeId: string): Promise<void> => {
  // 1. If ESGConfig.badgeAutoAward is false, return early.
  const config = await ESGConfig.findOne();
  if (!config || !config.badgeAutoAward) {
    return;
  }

  // Load the employee
  const employee = await Employee.findById(employeeId);
  if (!employee) return;

  // 2. Load the employee's current XP and count of completed challenge participations (status = APPROVED).
  // Note: the schema field for status is 'approval', which defaults to 'PENDING'.
  const completedChallengesCount = await ChallengeParticipation.countDocuments({
    employeeId,
    approval: 'APPROVED'
  });

  // 3. Find all Badge documents not already present in EmployeeBadge for this employee.
  const awardedBadges = await EmployeeBadge.find({ employeeId });
  const awardedBadgeIds = awardedBadges.map(eb => eb.badgeId.toString());

  const candidateBadges = await Badge.find({ _id: { $nin: awardedBadgeIds } });

  // 4. For each candidate badge, evaluate unlockRule and award it if eligible
  for (const badge of candidateBadges) {
    let eligible = false;

    if (badge.unlockRule.type === 'XP') {
      eligible = employee.xpBalance >= badge.unlockRule.threshold;
    } else if (badge.unlockRule.type === 'CHALLENGES_COMPLETED') {
      eligible = completedChallengesCount >= badge.unlockRule.threshold;
    }

    if (eligible) {
      // 5. Make this function idempotent and safe to call repeatedly (never double-award).
      // Double check check to ensure no concurrent or duplicate insertion happens
      const alreadyAwarded = await EmployeeBadge.findOne({
        employeeId,
        badgeId: badge._id
      });

      if (!alreadyAwarded) {
        await EmployeeBadge.create({
          employeeId,
          badgeId: badge._id,
          awardedAt: new Date()
        });

        // call notification.service.createNotification
        await createNotification(
          employeeId,
          'BADGE_UNLOCKED',
          `Badge unlocked: ${badge.name} — ${badge.description}`
        );
      }
    }
  }
};
