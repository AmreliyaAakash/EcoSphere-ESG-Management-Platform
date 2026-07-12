import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const mapId = (id: string | null | undefined): string | null => {
  if (!id) return null;
  
  const match = id.match(/^([a-z]+)([0-9]+)$/i);
  if (!match) return id; 
  
  const [_, prefix, numStr] = match;
  const num = parseInt(numStr, 10);
  const hexNum = num.toString(16).padStart(4, '0');
  
  let typeCode = '00';
  switch (prefix.toLowerCase()) {
    case 'd': typeCode = '01'; break;
    case 'c': typeCode = '02'; break;
    case 'ef': typeCode = '03'; break;
    case 'g': typeCode = '04'; break;
    case 'p': typeCode = '05'; break;
    case 'b': typeCode = '06'; break;
    case 'r': typeCode = '07'; break;
    case 'ct': typeCode = '08'; break;
    case 'a': typeCode = '09'; break;
    case 'e': typeCode = '10'; break;
    case 'ep': typeCode = '11'; break;
    case 'ch': typeCode = '12'; break;
    case 'cp': typeCode = '13'; break;
    case 'pa': typeCode = '14'; break;
    case 'au': typeCode = '15'; break;
    case 'ci': typeCode = '16'; break;
  }
  
  return `60d5ec4f1f1f1f1f1f${typeCode}${hexNum}`;
};

// Data arrays from the user request
const departments = [
  { id: 'd1', name: 'Engineering', code: 'ENG', headEmployeeId: 'e1', parentDepartmentId: null, employeeCount: 48, status: 'ACTIVE' },
  { id: 'd2', name: 'Operations', code: 'OPS', headEmployeeId: 'e2', parentDepartmentId: null, employeeCount: 32, status: 'ACTIVE' },
  { id: 'd3', name: 'Sales & Marketing', code: 'SML', headEmployeeId: 'e3', parentDepartmentId: null, employeeCount: 24, status: 'ACTIVE' },
  { id: 'd4', name: 'Human Resources', code: 'HR', headEmployeeId: 'e4', parentDepartmentId: null, employeeCount: 12, status: 'ACTIVE' },
  { id: 'd5', name: 'Finance', code: 'FIN', headEmployeeId: 'e5', parentDepartmentId: null, employeeCount: 16, status: 'ACTIVE' },
  { id: 'd6', name: 'Frontend Team', code: 'FE', headEmployeeId: 'e1', parentDepartmentId: 'd1', employeeCount: 18, status: 'ACTIVE' },
  { id: 'd7', name: 'Backend Team', code: 'BE', headEmployeeId: 'e6', parentDepartmentId: 'd1', employeeCount: 20, status: 'ACTIVE' },
];

const categories = [
  { id: 'c1', name: 'Tree Planting', type: 'CSR_ACTIVITY', status: 'ACTIVE' },
  { id: 'c2', name: 'Community Volunteering', type: 'CSR_ACTIVITY', status: 'ACTIVE' },
  { id: 'c3', name: 'Education Drive', type: 'CSR_ACTIVITY', status: 'ACTIVE' },
  { id: 'c4', name: 'Carbon Reduction', type: 'CHALLENGE', status: 'ACTIVE' },
  { id: 'c5', name: 'Energy Saving', type: 'CHALLENGE', status: 'ACTIVE' },
  { id: 'c6', name: 'Wellness', type: 'CHALLENGE', status: 'ACTIVE' },
];

const emissionFactors = [
  { id: 'ef1', activityType: 'Electricity — Grid', unit: 'kWh', co2ePerUnit: 0.42, source: 'DEFRA 2024' },
  { id: 'ef2', activityType: 'Natural Gas', unit: 'm³', co2ePerUnit: 2.02, source: 'DEFRA 2024' },
  { id: 'ef3', activityType: 'Diesel — Fleet', unit: 'L', co2ePerUnit: 2.68, source: 'EPA 2024' },
  { id: 'ef4', activityType: 'Air Travel — Short Haul', unit: 'passenger-km', co2ePerUnit: 0.16, source: 'DEFRA 2024' },
  { id: 'ef5', activityType: 'Air Travel — Long Haul', unit: 'passenger-km', co2ePerUnit: 0.19, source: 'DEFRA 2024' },
  { id: 'ef6', activityType: 'Office Paper', unit: 'kg', co2ePerUnit: 1.24, source: 'EPA 2024' },
  { id: 'ef7', activityType: 'Water Supply', unit: 'm³', co2ePerUnit: 0.15, source: 'DEFRA 2024' },
  { id: 'ef8', activityType: 'Waste — Landfill', unit: 'kg', co2ePerUnit: 0.45, source: 'EPA 2024' },
];

const environmentalGoals = [
  { id: 'g1', metric: 'Reduce Scope 1 Emissions (tCO2e)', targetValue: 120, currentValue: 78, deadline: '2026-12-31', departmentId: 'd1' },
  { id: 'g2', metric: 'Reduce Scope 2 Emissions (tCO2e)', targetValue: 300, currentValue: 245, deadline: '2026-12-31', departmentId: 'd2' },
  { id: 'g3', metric: 'Increase Renewable Energy %', targetValue: 80, currentValue: 52, deadline: '2026-06-30', departmentId: 'd2' },
  { id: 'g4', metric: 'Reduce Fleet Emissions (tCO2e)', targetValue: 90, currentValue: 61, deadline: '2026-09-30', departmentId: 'd3' },
  { id: 'g5', metric: 'Zero Waste to Landfill %', targetValue: 100, currentValue: 74, deadline: '2026-12-31', departmentId: 'd4' },
];

const policies = [
  { id: 'p1', title: 'Code of Conduct', description: 'Ethical standards for all employees.', category: 'Governance', version: '3.2', fileUrl: '/docs/coc-v3.2.pdf' },
  { id: 'p2', title: 'Anti-Bribery & Corruption', description: 'Zero-tolerance policy on bribery.', category: 'Governance', version: '2.0', fileUrl: '/docs/abc-v2.pdf' },
  { id: 'p3', title: 'Environmental Policy', description: 'Commitment to reducing environmental impact.', category: 'Environmental', version: '4.1', fileUrl: '/docs/env-v4.1.pdf' },
  { id: 'p4', title: 'Diversity & Inclusion', description: 'Fostering an inclusive workplace.', category: 'Social', version: '1.5', fileUrl: '/docs/di-v1.5.pdf' },
  { id: 'p5', title: 'Data Protection & Privacy', description: 'GDPR-compliant data handling.', category: 'Governance', version: '2.3', fileUrl: '/docs/dp-v2.3.pdf' },
  { id: 'p6', title: 'Whistleblower Protection', description: 'Reporting channels and protections.', category: 'Governance', version: '1.8', fileUrl: '/docs/wb-v1.8.pdf' },
];

const badges = [
  { id: 'b1', name: 'Eco Rookie', description: 'Complete your first environmental activity', unlockRule: { type: 'CHALLENGES_COMPLETED', threshold: 1 }, iconUrl: '🌱' },
  { id: 'b2', name: 'Carbon Crusher', description: 'Reach 500 XP', unlockRule: { type: 'XP', threshold: 500 }, iconUrl: '🌿' },
  { id: 'b3', name: 'Sustainability Star', description: 'Complete 5 challenges', unlockRule: { type: 'CHALLENGES_COMPLETED', threshold: 5 }, iconUrl: '⭐' },
  { id: 'b4', name: 'Green Champion', description: 'Reach 1,500 XP', unlockRule: { type: 'XP', threshold: 1500 }, iconUrl: '🏆' },
  { id: 'b5', name: 'Earth Guardian', description: 'Complete 10 challenges', unlockRule: { type: 'CHALLENGES_COMPLETED', threshold: 10 }, iconUrl: '🌍' },
  { id: 'b6', name: 'Eco Legend', description: 'Reach 5,000 XP', unlockRule: { type: 'XP', threshold: 5000 }, iconUrl: '👑' },
  { id: 'b7', name: 'Team Player', description: 'Complete 3 CSR activities', unlockRule: { type: 'CHALLENGES_COMPLETED', threshold: 3 }, iconUrl: '🤝' },
  { id: 'b8', name: 'Impact Maker', description: 'Reach 3,000 XP', unlockRule: { type: 'XP', threshold: 3000 }, iconUrl: '💎' },
];

const rewards = [
  { id: 'r1', name: 'EcoSphere Tote Bag', description: 'Organic cotton tote bag', pointsRequired: 200, stock: 45, status: 'ACTIVE' },
  { id: 'r2', name: 'Reusable Water Bottle', description: 'Insulated stainless steel bottle', pointsRequired: 350, stock: 28, status: 'ACTIVE' },
  { id: 'r3', name: 'Extra Day Off', description: 'One additional PTO day', pointsRequired: 1200, stock: 10, status: 'ACTIVE' },
  { id: 'r4', name: 'Bamboo Desk Organizer', description: 'Sustainable desk accessory', pointsRequired: 500, stock: 15, status: 'ACTIVE' },
  { id: 'r5', name: 'Solar Power Bank', description: '10,000mAh solar charger', pointsRequired: 800, stock: 0, status: 'INACTIVE' },
  { id: 'r6', name: 'Tree Planted in Your Name', description: 'A tree planted via One Tree Planted', pointsRequired: 150, stock: 999, status: 'ACTIVE' },
  { id: 'r7', name: 'EcoSphere Hoodie', description: 'Recycled material hoodie', pointsRequired: 1000, stock: 8, status: 'ACTIVE' },
  { id: 'r8', name: 'Lunch with CEO', description: 'Lunch with leadership to discuss ESG', pointsRequired: 2500, stock: 4, status: 'ACTIVE' },
];

const carbonTransactions = [
  { id: 'ct1', sourceModule: 'Energy', quantity: 4500, emissionFactorId: 'ef1', co2eCalculated: 1890, departmentId: 'd1', date: '2026-01-15' },
  { id: 'ct2', sourceModule: 'Transport', quantity: 320, emissionFactorId: 'ef3', co2eCalculated: 857.6, departmentId: 'd3', date: '2026-01-18' },
  { id: 'ct3', sourceModule: 'Travel', quantity: 5400, emissionFactorId: 'ef5', co2eCalculated: 1026, departmentId: 'd5', date: '2026-01-22' },
  { id: 'ct4', sourceModule: 'Energy', quantity: 2800, emissionFactorId: 'ef2', co2eCalculated: 5656, departmentId: 'd2', date: '2026-01-25' },
  { id: 'ct5', sourceModule: 'Waste', quantity: 180, emissionFactorId: 'ef8', co2eCalculated: 81, departmentId: 'd4', date: '2026-02-01' },
  { id: 'ct6', sourceModule: 'Energy', quantity: 6200, emissionFactorId: 'ef1', co2eCalculated: 2604, departmentId: 'd1', date: '2026-02-05' },
  { id: 'ct7', sourceModule: 'Transport', quantity: 450, emissionFactorId: 'ef3', co2eCalculated: 1206, departmentId: 'd3', date: '2026-02-08' },
  { id: 'ct8', sourceModule: 'Travel', quantity: 2200, emissionFactorId: 'ef4', co2eCalculated: 352, departmentId: 'd5', date: '2026-02-10' },
  { id: 'ct9', sourceModule: 'Water', quantity: 340, emissionFactorId: 'ef7', co2eCalculated: 51, departmentId: 'd2', date: '2026-02-12' },
  { id: 'ct10', sourceModule: 'Energy', quantity: 3900, emissionFactorId: 'ef1', co2eCalculated: 1638, departmentId: 'd2', date: '2026-02-15' },
  { id: 'ct11', sourceModule: 'Waste', quantity: 95, emissionFactorId: 'ef8', co2eCalculated: 42.75, departmentId: 'd1', date: '2026-02-18' },
  { id: 'ct12', sourceModule: 'Transport', quantity: 610, emissionFactorId: 'ef3', co2eCalculated: 1634.8, departmentId: 'd3', date: '2026-02-20' },
  { id: 'ct13', sourceModule: 'Travel', quantity: 8800, emissionFactorId: 'ef5', co2eCalculated: 1672, departmentId: 'd5', date: '2026-02-22' },
  { id: 'ct14', sourceModule: 'Energy', quantity: 5100, emissionFactorId: 'ef2', co2eCalculated: 10302, departmentId: 'd1', date: '2026-02-25' },
  { id: 'ct15', sourceModule: 'Energy', quantity: 2300, emissionFactorId: 'ef1', co2eCalculated: 966, departmentId: 'd4', date: '2026-03-01' },
];

const csrActivities = [
  { id: 'a1', title: 'Community Tree Planting Drive', categoryId: 'c1', description: 'Plant 500 native trees in the local community.', date: '2026-02-14', departmentId: 'd1' },
  { id: 'a2', title: 'Beach Cleanup Initiative', categoryId: 'c2', description: 'Coastal cleanup with 30 volunteers.', date: '2026-02-20', departmentId: 'd3' },
  { id: 'a3', title: 'STEM Workshop for Students', categoryId: 'c3', description: 'Mentoring local high school students in STEM.', date: '2026-03-05', departmentId: 'd1' },
  { id: 'a4', title: 'Food Bank Volunteering', categoryId: 'c2', description: 'Sort and pack meals at the regional food bank.', date: '2026-03-12', departmentId: 'd4' },
  { id: 'a5', title: 'E-Waste Collection Drive', categoryId: 'c2', description: 'Collect and recycle electronic waste.', date: '2026-03-18', departmentId: 'd2' },
];

const employees = [
  { id: 'e1', name: 'Alex Chen', email: 'alex.chen@ecosphere.io', role: 'ADMIN', departmentId: 'd1', xpBalance: 3200, pointsBalance: 1850, avatarUrl: 'https://i.pravatar.cc/100?img=12' },
  { id: 'e2', name: 'Priya Patel', email: 'priya.patel@ecosphere.io', role: 'EMPLOYEE', departmentId: 'd2', xpBalance: 2850, pointsBalance: 1420, avatarUrl: 'https://i.pravatar.cc/100?img=45' },
  { id: 'e3', name: 'Marcus Johnson', email: 'marcus.j@ecosphere.io', role: 'EMPLOYEE', departmentId: 'd3', xpBalance: 4100, pointsBalance: 2100, avatarUrl: 'https://i.pravatar.cc/100?img=33' },
  { id: 'e4', name: 'Sofia Rodriguez', email: 'sofia.r@ecosphere.io', role: 'EMPLOYEE', departmentId: 'd4', xpBalance: 1950, pointsBalance: 980, avatarUrl: 'https://i.pravatar.cc/100?img=47' },
  { id: 'e5', name: 'David Kim', email: 'david.kim@ecosphere.io', role: 'EMPLOYEE', departmentId: 'd5', xpBalance: 1500, pointsBalance: 760, avatarUrl: 'https://i.pravatar.cc/100?img=15' },
  { id: 'e6', name: 'Emma Wilson', email: 'emma.w@ecosphere.io', role: 'EMPLOYEE', departmentId: 'd7', xpBalance: 3650, pointsBalance: 1600, avatarUrl: 'https://i.pravatar.cc/100?img=20' },
  { id: 'e7', name: 'Liam O\'Brien', email: 'liam.o@ecosphere.io', role: 'EMPLOYEE', departmentId: 'd6', xpBalance: 2200, pointsBalance: 1150, avatarUrl: 'https://i.pravatar.cc/100?img=68' },
  { id: 'e8', name: 'Aisha Mohammed', email: 'aisha.m@ecosphere.io', role: 'EMPLOYEE', departmentId: 'd2', xpBalance: 2800, pointsBalance: 1320, avatarUrl: 'https://i.pravatar.cc/100?img=49' },
  { id: 'e9', name: 'Yuki Tanaka', email: 'yuki.t@ecosphere.io', role: 'EMPLOYEE', departmentId: 'd3', xpBalance: 3400, pointsBalance: 1750, avatarUrl: 'https://i.pravatar.cc/100?img=23' },
  { id: 'e10', name: 'Olivia Brown', email: 'olivia.b@ecosphere.io', role: 'EMPLOYEE', departmentId: 'd5', xpBalance: 1750, pointsBalance: 890, avatarUrl: 'https://i.pravatar.cc/100?img=31' },
];

const employeeParticipations = [
  { id: 'ep1', employeeId: 'e7', activityId: 'a1', proofUrl: '/proof/ep1.jpg', approvalStatus: 'PENDING', pointsEarned: 0, completionDate: '2026-02-14' },
  { id: 'ep2', employeeId: 'e8', activityId: 'a1', proofUrl: '/proof/ep2.jpg', approvalStatus: 'PENDING', pointsEarned: 0, completionDate: '2026-02-14' },
  { id: 'ep3', employeeId: 'e3', activityId: 'a2', proofUrl: null, approvalStatus: 'PENDING', pointsEarned: 0, completionDate: '2026-02-20' },
  { id: 'ep4', employeeId: 'e6', activityId: 'a3', proofUrl: '/proof/ep4.jpg', approvalStatus: 'APPROVED', pointsEarned: 50, completionDate: '2026-03-05' },
  { id: 'ep5', employeeId: 'e1', activityId: 'a4', proofUrl: '/proof/ep5.jpg', approvalStatus: 'APPROVED', pointsEarned: 75, completionDate: '2026-03-12' },
  { id: 'ep6', employeeId: 'e4', activityId: 'a5', proofUrl: null, approvalStatus: 'REJECTED', pointsEarned: 0, completionDate: '2026-03-18' },
  { id: 'ep7', employeeId: 'e2', activityId: 'a2', proofUrl: '/proof/ep7.jpg', approvalStatus: 'PENDING', pointsEarned: 0, completionDate: '2026-02-20' },
  { id: 'ep8', employeeId: 'e9', activityId: 'a1', proofUrl: '/proof/ep8.jpg', approvalStatus: 'PENDING', pointsEarned: 0, completionDate: '2026-02-14' },
];

const challenges = [
  { id: 'ch1', title: 'Commute Carbon-Free for a Week', categoryId: 'c4', description: 'Bike, walk, or take public transit for 5 consecutive workdays.', xp: 250, difficulty: 'MEDIUM', evidenceRequired: true, deadline: '2026-07-31', status: 'ACTIVE' },
  { id: 'ch2', title: 'Reduce Desk Energy Use', categoryId: 'c5', description: 'Unplug devices after work for 10 days.', xp: 150, difficulty: 'EASY', evidenceRequired: false, deadline: '2026-07-15', status: 'ACTIVE' },
  { id: 'ch3', title: 'Zero Single-Use Plastics Month', categoryId: 'c4', description: 'No single-use plastic for 30 days.', xp: 400, difficulty: 'HARD', evidenceRequired: true, deadline: '2026-08-31', status: 'ACTIVE' },
  { id: 'ch4', title: '10K Steps Daily Challenge', categoryId: 'c6', description: 'Walk 10,000 steps every day for 2 weeks.', xp: 200, difficulty: 'MEDIUM', evidenceRequired: false, deadline: '2026-07-20', status: 'UNDER_REVIEW' },
  { id: 'ch5', title: 'Mentor a Junior Colleague', categoryId: 'c6', description: 'Complete 4 mentoring sessions.', xp: 300, difficulty: 'MEDIUM', evidenceRequired: true, deadline: '2026-09-30', status: 'DRAFT' },
  { id: 'ch6', title: 'Paperless Office Sprint', categoryId: 'c5', description: 'Go fully paperless for 2 weeks.', xp: 180, difficulty: 'EASY', evidenceRequired: false, deadline: '2026-06-30', status: 'COMPLETED' },
  { id: 'ch7', title: 'Community Garden Project', categoryId: 'c4', description: 'Volunteer 8 hours at a community garden.', xp: 350, difficulty: 'HARD', evidenceRequired: true, deadline: '2026-08-15', status: 'ACTIVE' },
  { id: 'ch8', title: 'Meatless Monday', categoryId: 'c6', description: 'No meat on Mondays for 8 weeks.', xp: 120, difficulty: 'EASY', evidenceRequired: false, deadline: '2026-09-01', status: 'DRAFT' },
];

const challengeParticipations = [
  { id: 'cp1', challengeId: 'ch1', employeeId: 'e7', progress: 60, proofUrl: '/proof/cp1.jpg', approval: 'PENDING', xpAwarded: 0 },
  { id: 'cp2', challengeId: 'ch1', employeeId: 'e8', progress: 100, proofUrl: '/proof/cp2.jpg', approval: 'PENDING', xpAwarded: 0 },
  { id: 'cp3', challengeId: 'ch1', employeeId: 'e3', progress: 40, proofUrl: null, approval: 'PENDING', xpAwarded: 0 },
  { id: 'cp4', challengeId: 'ch2', employeeId: 'e6', progress: 100, proofUrl: null, approval: 'APPROVED', xpAwarded: 150 },
  { id: 'cp5', challengeId: 'ch2', employeeId: 'e1', progress: 80, proofUrl: null, approval: 'PENDING', xpAwarded: 0 },
  { id: 'cp6', challengeId: 'ch3', employeeId: 'e9', progress: 25, proofUrl: '/proof/cp6.jpg', approval: 'PENDING', xpAwarded: 0 },
  { id: 'cp7', challengeId: 'ch3', employeeId: 'e4', progress: 50, proofUrl: '/proof/cp7.jpg', approval: 'PENDING', xpAwarded: 0 },
  { id: 'cp8', challengeId: 'ch4', employeeId: 'e2', progress: 100, proofUrl: null, approval: 'PENDING', xpAwarded: 0 },
  { id: 'cp9', challengeId: 'ch4', employeeId: 'e10', progress: 70, proofUrl: null, approval: 'PENDING', xpAwarded: 0 },
  { id: 'cp10', challengeId: 'ch7', employeeId: 'e7', progress: 35, proofUrl: '/proof/cp10.jpg', approval: 'PENDING', xpAwarded: 0 },
];

const policyAcknowledgements = [
  { id: 'pa1', employeeId: 'e1', policyId: 'p1', acknowledgedAt: '2026-01-10' },
  { id: 'pa2', employeeId: 'e2', policyId: 'p1', acknowledgedAt: '2026-01-12' },
  { id: 'pa3', employeeId: 'e3', policyId: 'p1', acknowledgedAt: '2026-01-15' },
  { id: 'pa4', employeeId: 'e1', policyId: 'p2', acknowledgedAt: '2026-01-10' },
  { id: 'pa5', employeeId: 'e3', policyId: 'p2', acknowledgedAt: '2026-01-20' },
  { id: 'pa6', employeeId: 'e4', policyId: 'p3', acknowledgedAt: '2026-02-01' },
  { id: 'pa7', employeeId: 'e6', policyId: 'p3', acknowledgedAt: '2026-02-05' },
  { id: 'pa8', employeeId: 'e7', policyId: 'p3', acknowledgedAt: '2026-02-10' },
  { id: 'pa9', employeeId: 'e1', policyId: 'p4', acknowledgedAt: '2026-01-10' },
  { id: 'pa10', employeeId: 'e8', policyId: 'p4', acknowledgedAt: '2026-02-15' },
];

const audits = [
  { id: 'au1', scope: 'Q1 2026 — Environmental Compliance', auditorId: 'e5', date: '2026-03-15', findings: '2 minor non-conformities in waste disposal logging.' },
  { id: 'au2', scope: 'Q1 2026 — Data Security Audit', auditorId: 'e5', date: '2026-03-20', findings: 'Access controls compliant. 1 recommendation for MFA rollout.' },
  { id: 'au3', scope: 'Q2 2026 — Health & Safety', auditorId: 'e4', date: '2026-06-10', findings: 'All safety protocols met. Minor training gap identified.' },
  { id: 'au4', scope: 'Q2 2026 — Financial Controls', auditorId: 'e5', date: '2026-06-25', findings: 'Segregation of duties verified. No issues found.' },
];

const complianceIssues = [
  { id: 'ci1', auditId: 'au1', severity: 'HIGH', description: 'Waste disposal logs missing for March — Operations dept.', ownerId: 'e2', dueDate: '2026-04-15', status: 'OPEN' },
  { id: 'ci2', auditId: 'au1', severity: 'MEDIUM', description: 'Emission factor source documentation outdated.', ownerId: 'e1', dueDate: '2026-04-30', status: 'IN_PROGRESS' },
  { id: 'ci3', auditId: 'au2', severity: 'LOW', description: 'MFA not enforced for 3 admin accounts.', ownerId: 'e1', dueDate: '2026-05-10', status: 'OPEN' },
  { id: 'ci4', auditId: 'au3', severity: 'CRITICAL', description: 'Fire safety drill overdue by 45 days.', ownerId: 'e4', dueDate: '2026-05-01', status: 'OVERDUE' },
  { id: 'ci5', auditId: 'au2', severity: 'MEDIUM', description: 'Data retention policy not documented for new SaaS tool.', ownerId: 'e5', dueDate: '2026-05-20', status: 'OPEN' },
  { id: 'ci6', auditId: 'au1', severity: 'LOW', description: 'Minor signage missing in hazardous waste area.', ownerId: 'e2', dueDate: '2026-06-01', status: 'RESOLVED' },
  { id: 'ci7', auditId: 'au3', severity: 'HIGH', description: 'First aid kit inventory not updated quarterly.', ownerId: 'e4', dueDate: '2026-06-05', status: 'OVERDUE' },
  { id: 'ci8', auditId: 'au4', severity: 'LOW', description: 'Expense approval threshold needs review.', ownerId: 'e5', dueDate: '2026-07-15', status: 'IN_PROGRESS' },
];

const esgConfig = {
  envWeight: 40,
  socialWeight: 30,
  govWeight: 30,
  autoEmissionCalc: true,
  evidenceRequired: true,
  badgeAutoAward: false,
};

// Map arrays
const mappedDepartments = departments.map(d => ({
  _id: mapId(d.id),
  name: d.name,
  code: d.code,
  headEmployeeId: mapId(d.headEmployeeId),
  parentDepartmentId: mapId(d.parentDepartmentId),
  employeeCount: d.employeeCount,
  status: d.status
}));

const mappedCSRCategories = categories
  .filter(c => c.type === 'CSR_ACTIVITY')
  .map(c => ({
    _id: mapId(c.id),
    name: c.name,
    status: c.status
  }));

const mappedChallengeCategories = categories
  .filter(c => c.type === 'CHALLENGE')
  .map(c => ({
    _id: mapId(c.id),
    name: c.name,
    status: c.status
  }));

const mappedEmissionFactors = emissionFactors.map(ef => ({
  _id: mapId(ef.id),
  activityType: ef.activityType,
  unit: ef.unit,
  co2ePerUnit: ef.co2ePerUnit,
  source: ef.source
}));

const mappedEnvironmentalGoals = environmentalGoals.map(g => ({
  _id: mapId(g.id),
  metric: g.metric,
  targetValue: g.targetValue,
  currentValue: g.currentValue,
  deadline: new Date(g.deadline),
  departmentId: mapId(g.departmentId)
}));

const mappedPolicies = policies.map(p => ({
  _id: mapId(p.id),
  title: p.title,
  description: p.description,
  category: p.category,
  version: p.version,
  fileUrl: p.fileUrl,
  signatureRequired: p.id === 'p1' || p.id === 'p2' // Code of Conduct and Anti-Bribery require signature
}));

const mappedBadges = badges.map(b => ({
  _id: mapId(b.id),
  name: b.name,
  description: b.description,
  unlockRule: b.unlockRule,
  iconUrl: b.iconUrl
}));

const mappedRewards = rewards.map(r => ({
  _id: mapId(r.id),
  name: r.name,
  description: r.description,
  pointsRequired: r.pointsRequired,
  stock: r.stock,
  status: r.status
}));

const mappedCarbonTransactions = carbonTransactions.map(ct => ({
  _id: mapId(ct.id),
  sourceModule: ct.sourceModule,
  quantity: ct.quantity,
  emissionFactorId: mapId(ct.emissionFactorId),
  co2eCalculated: ct.co2eCalculated,
  departmentId: mapId(ct.departmentId),
  date: new Date(ct.date)
}));

const mappedCSRActivities = csrActivities.map(a => ({
  _id: mapId(a.id),
  title: a.title,
  categoryId: mapId(a.categoryId),
  description: a.description,
  date: new Date(a.date),
  departmentId: mapId(a.departmentId)
}));

const mappedEmployees = employees.map(e => ({
  _id: mapId(e.id),
  name: e.name,
  email: e.email,
  role: e.role,
  departmentId: mapId(e.departmentId),
  xpBalance: e.xpBalance,
  pointsBalance: e.pointsBalance,
  avatarUrl: e.avatarUrl
}));

const mappedEmployeeParticipations = employeeParticipations.map(ep => ({
  _id: mapId(ep.id),
  employeeId: mapId(ep.employeeId),
  activityId: mapId(ep.activityId),
  proofUrl: ep.proofUrl,
  approvalStatus: ep.approvalStatus,
  pointsEarned: ep.pointsEarned,
  completionDate: new Date(ep.completionDate)
}));

const mappedChallenges = challenges.map(ch => ({
  _id: mapId(ch.id),
  title: ch.title,
  categoryId: mapId(ch.categoryId),
  description: ch.description,
  xp: ch.xp,
  difficulty: ch.difficulty,
  evidenceRequired: ch.evidenceRequired,
  deadline: new Date(ch.deadline),
  status: ch.status
}));

const mappedChallengeParticipations = challengeParticipations.map(cp => ({
  _id: mapId(cp.id),
  challengeId: mapId(cp.challengeId),
  employeeId: mapId(cp.employeeId),
  progress: cp.progress,
  proofUrl: cp.proofUrl,
  approval: cp.approval,
  xpAwarded: cp.xpAwarded
}));

const mappedPolicyAcknowledgements = policyAcknowledgements.map(pa => ({
  _id: mapId(pa.id),
  employeeId: mapId(pa.employeeId),
  policyId: mapId(pa.policyId),
  acknowledgedAt: new Date(pa.acknowledgedAt)
}));

const mappedAudits = audits.map(au => ({
  _id: mapId(au.id),
  scope: au.scope,
  auditorId: mapId(au.auditorId),
  date: new Date(au.date),
  findings: au.findings
}));

const mappedComplianceIssues = complianceIssues.map(ci => ({
  _id: mapId(ci.id),
  auditId: mapId(ci.auditId),
  severity: ci.severity,
  description: ci.description,
  ownerId: mapId(ci.ownerId),
  dueDate: new Date(ci.dueDate),
  status: ci.status
}));

// Write JSON files
fs.writeFileSync(path.join(dataDir, 'departments.json'), JSON.stringify(mappedDepartments, null, 2));
fs.writeFileSync(path.join(dataDir, 'csrCategories.json'), JSON.stringify(mappedCSRCategories, null, 2));
fs.writeFileSync(path.join(dataDir, 'challengeCategories.json'), JSON.stringify(mappedChallengeCategories, null, 2));
fs.writeFileSync(path.join(dataDir, 'emissionFactors.json'), JSON.stringify(mappedEmissionFactors, null, 2));
fs.writeFileSync(path.join(dataDir, 'environmentalGoals.json'), JSON.stringify(mappedEnvironmentalGoals, null, 2));
fs.writeFileSync(path.join(dataDir, 'policies.json'), JSON.stringify(mappedPolicies, null, 2));
fs.writeFileSync(path.join(dataDir, 'badges.json'), JSON.stringify(mappedBadges, null, 2));
fs.writeFileSync(path.join(dataDir, 'rewards.json'), JSON.stringify(mappedRewards, null, 2));
fs.writeFileSync(path.join(dataDir, 'carbonTransactions.json'), JSON.stringify(mappedCarbonTransactions, null, 2));
fs.writeFileSync(path.join(dataDir, 'csrActivities.json'), JSON.stringify(mappedCSRActivities, null, 2));
fs.writeFileSync(path.join(dataDir, 'employees.json'), JSON.stringify(mappedEmployees, null, 2));
fs.writeFileSync(path.join(dataDir, 'employeeParticipations.json'), JSON.stringify(mappedEmployeeParticipations, null, 2));
fs.writeFileSync(path.join(dataDir, 'challenges.json'), JSON.stringify(mappedChallenges, null, 2));
fs.writeFileSync(path.join(dataDir, 'challengeParticipations.json'), JSON.stringify(mappedChallengeParticipations, null, 2));
fs.writeFileSync(path.join(dataDir, 'policyAcknowledgements.json'), JSON.stringify(mappedPolicyAcknowledgements, null, 2));
fs.writeFileSync(path.join(dataDir, 'audits.json'), JSON.stringify(mappedAudits, null, 2));
fs.writeFileSync(path.join(dataDir, 'complianceIssues.json'), JSON.stringify(mappedComplianceIssues, null, 2));
fs.writeFileSync(path.join(dataDir, 'esgConfig.json'), JSON.stringify(esgConfig, null, 2));

console.log('JSON Seed files written successfully.');
