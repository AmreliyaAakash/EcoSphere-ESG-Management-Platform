import { checkAndAwardBadges } from '../src/services/badge.service';
import { Employee } from '../src/models/Employee';
import { Badge } from '../src/models/Badge';
import { EmployeeBadge } from '../src/models/EmployeeBadge';
import { ChallengeParticipation } from '../src/models/ChallengeParticipation';
import { ESGConfig } from '../src/models/ESGConfig';
import { createNotification } from '../src/services/notification.service';

jest.mock('../src/models/Employee');
jest.mock('../src/models/Badge');
jest.mock('../src/models/EmployeeBadge');
jest.mock('../src/models/ChallengeParticipation');
jest.mock('../src/models/ESGConfig');
jest.mock('../src/services/notification.service');

describe('Badge Auto Award Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not award any badges if badgeAutoAward is false', async () => {
    (ESGConfig.findOne as jest.Mock).mockResolvedValue({
      badgeAutoAward: false
    });

    await checkAndAwardBadges('employee123');

    expect(Employee.findById).not.toHaveBeenCalled();
    expect(EmployeeBadge.create).not.toHaveBeenCalled();
    expect(createNotification).not.toHaveBeenCalled();
  });

  it('should award exactly one badge + one notification when employee crosses threshold', async () => {
    // 1. Mock ESGConfig to return badgeAutoAward: true
    (ESGConfig.findOne as jest.Mock).mockResolvedValue({
      badgeAutoAward: true
    });

    // 2. Mock Employee
    (Employee.findById as jest.Mock).mockResolvedValue({
      _id: 'employee123',
      xpBalance: 120, // Crossed threshold for XP badge (threshold 100)
    });

    // 3. Mock completed challenge participations count
    (ChallengeParticipation.countDocuments as jest.Mock).mockResolvedValue(0);

    // 4. Mock EmployeeBadge to say they have no badges currently
    (EmployeeBadge.find as jest.Mock).mockResolvedValue([]);
    (EmployeeBadge.findOne as jest.Mock).mockResolvedValue(null);

    // 5. Mock Badges: one XP badge (threshold 100) and one Challenges completed badge (threshold 5)
    const mockBadges = [
      {
        _id: 'badgeXP100',
        name: 'XP Master',
        description: 'Earn 100 XP',
        unlockRule: { type: 'XP', threshold: 100 }
      },
      {
        _id: 'badgeChallenges5',
        name: 'Challenge Champion',
        description: 'Complete 5 challenges',
        unlockRule: { type: 'CHALLENGES_COMPLETED', threshold: 5 }
      }
    ];
    (Badge.find as jest.Mock).mockResolvedValue(mockBadges);

    // 6. Call the checkAndAwardBadges function
    await checkAndAwardBadges('employee123');

    // 7. Verify exactly one badge created and one notification called
    expect(EmployeeBadge.create).toHaveBeenCalledTimes(1);
    expect(EmployeeBadge.create).toHaveBeenCalledWith({
      employeeId: 'employee123',
      badgeId: 'badgeXP100',
      awardedAt: expect.any(Date)
    });

    expect(createNotification).toHaveBeenCalledTimes(1);
    expect(createNotification).toHaveBeenCalledWith(
      'employee123',
      'BADGE_UNLOCKED',
      'Badge unlocked: XP Master — Earn 100 XP'
    );
  });
});
