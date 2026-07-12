import axios from 'axios';
import type {
  Department, Category, EmissionFactor, EnvironmentalGoal, ESGPolicy,
  Badge, Reward, CarbonTransaction, CSRActivity, EmployeeParticipation,
  Challenge, ChallengeParticipation, PolicyAcknowledgement, Audit,
  ComplianceIssue, DepartmentScore, Employee, Notification, ESGConfig,
  ScoreTrendPoint, LeaderboardEntry, DiversityMetric, TrainingRecord,
} from '@/types';

// Read API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create a configured Axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Export the instance so AxiosTokenInjector (inside ClerkProvider) can attach a live token
export { axiosInstance };

// Response interceptor — surface errors clearly for debugging
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API] 401 Unauthorized. URL:', error.config?.url);
    }
    if (error.response?.status === 400) {
      console.error('[API] 400 Bad Request:', error.config?.url, error.response?.data);
    }
    if (error.response?.status === 500) {
      console.error('[API] 500 Server Error:', error.config?.url, error.response?.data);
    }
    return Promise.reject(error);
  }
);


// Response mapping helper
function unwrap<T>(response: any): T {
  return response.data.data;
}

// Utility to normalize Mongoose ObjectIds or populated objects back to string IDs
function normalizeId(field: any): string {
  if (typeof field === 'object' && field !== null) {
    return field.id || field._id || '';
  }
  return field || '';
}

export const api = {
  resolveUploadUrl(url: string | null): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace(/\/api\/v1\/?$/, '');
    return `${backendBase}${url}`;
  },

  // Authentication & Session
  async login(email: string, _password?: string): Promise<{ token: string; user: Employee }> {
    // For production Clerk signin, this is bypassed. For dev bypass mode, we return the profile
    const res = await axiosInstance.get(`/employees`);
    const employeesList = unwrap<Employee[]>(res);
    const matched = employeesList.find((e) => e.email === email);
    if (!matched) throw new Error(`User profile not found in database for email: ${email}`);
    
    // In dev bypass, we use the email directly as the token
    return { token: email, user: matched };
  },

  async getCurrentUser(): Promise<Employee> {
    const res = await axiosInstance.get('/auth/me');
    return res.data.data.user;
  },

  // Dashboard
  async getScoreTrend(): Promise<ScoreTrendPoint[]> {
    const res = await axiosInstance.get('/dashboard/score-trend');
    return unwrap(res);
  },

  async getDepartmentScores(): Promise<DepartmentScore[]> {
    const res = await axiosInstance.get('/dashboard/department-scores');
    const scores = unwrap<any[]>(res);
    return scores.map((s) => ({
      ...s,
      departmentId: normalizeId(s.departmentId),
    }));
  },

  async getOverallScore(): Promise<ScoreTrendPoint> {
    const res = await axiosInstance.get('/dashboard/overall-score');
    return unwrap(res);
  },

  async getOverdueComplianceIssues(): Promise<ComplianceIssue[]> {
    const res = await axiosInstance.get('/dashboard/overdue-compliance-issues');
    const issues = unwrap<any[]>(res);
    return issues.map((issue) => ({
      ...issue,
      id: issue.id || issue._id,
      auditId: normalizeId(issue.auditId),
      ownerId: normalizeId(issue.ownerId),
    }));
  },

  async getTopLeaderboard(limit = 5): Promise<LeaderboardEntry[]> {
    const res = await axiosInstance.get(`/dashboard/top-leaderboard?limit=${limit}`);
    return unwrap(res);
  },

  // Environmental
  async getEmissionFactors(): Promise<EmissionFactor[]> {
    const res = await axiosInstance.get('/emission-factors');
    return unwrap(res);
  },

  async createEmissionFactor(data: Omit<EmissionFactor, 'id'>): Promise<EmissionFactor> {
    const res = await axiosInstance.post('/emission-factors', data);
    return unwrap(res);
  },

  async updateEmissionFactor(id: string, data: Partial<EmissionFactor>): Promise<EmissionFactor> {
    const res = await axiosInstance.put(`/emission-factors/${id}`, data);
    return unwrap(res);
  },

  async deleteEmissionFactor(id: string): Promise<void> {
    await axiosInstance.delete(`/emission-factors/${id}`);
  },

  async getCarbonTransactions(): Promise<CarbonTransaction[]> {
    const res = await axiosInstance.get('/carbon-transactions');
    const transactions = unwrap<any[]>(res);
    return transactions.map((t) => ({
      ...t,
      id: t.id || t._id,
      emissionFactorId: normalizeId(t.emissionFactorId),
      departmentId: normalizeId(t.departmentId),
    }));
  },

  async getEnvironmentalGoals(): Promise<EnvironmentalGoal[]> {
    const res = await axiosInstance.get('/environmental-goals');
    const goals = unwrap<any[]>(res);
    return goals.map((g) => ({
      ...g,
      id: g.id || g._id,
      departmentId: normalizeId(g.departmentId),
    }));
  },

  // Social
  async getCSRActivities(): Promise<CSRActivity[]> {
    const res = await axiosInstance.get('/csr-activities');
    const activities = unwrap<any[]>(res);
    return activities.map((a) => ({
      ...a,
      id: a.id || a._id,
      categoryId: normalizeId(a.categoryId),
      departmentId: normalizeId(a.departmentId),
    }));
  },

  async getEmployeeParticipations(): Promise<EmployeeParticipation[]> {
    const res = await axiosInstance.get('/employee-participations?limit=100');
    // Extract array from the backend paginated envelope
    const data = res.data.data.participations || [];
    return data.map((p: any) => ({
      ...p,
      id: p.id || p._id,
      employeeId: normalizeId(p.employeeId),
      activityId: normalizeId(p.activityId),
    }));
  },

  async approveParticipation(id: string, points: number): Promise<EmployeeParticipation> {
    const res = await axiosInstance.patch(`/employee-participations/${id}/approve`, { pointsEarned: points });
    const p = unwrap<any>(res);
    return {
      ...p,
      id: p.id || p._id,
      employeeId: normalizeId(p.employeeId),
      activityId: normalizeId(p.activityId),
    };
  },

  async rejectParticipation(id: string): Promise<EmployeeParticipation> {
    const res = await axiosInstance.patch(`/employee-participations/${id}/reject`);
    const p = unwrap<any>(res);
    return {
      ...p,
      id: p.id || p._id,
      employeeId: normalizeId(p.employeeId),
      activityId: normalizeId(p.activityId),
    };
  },

  async getDiversityMetrics(): Promise<DiversityMetric[]> {
    const res = await axiosInstance.get('/reports/diversity-metrics');
    return unwrap(res);
  },

  async getDiversityByDepartment(): Promise<DiversityMetric[]> {
    const res = await axiosInstance.get('/reports/diversity-by-department');
    return unwrap(res);
  },

  async getEthnicityMetrics(): Promise<DiversityMetric[]> {
    const res = await axiosInstance.get('/reports/ethnicity-metrics');
    return unwrap(res);
  },

  async getTrainingRecords(): Promise<TrainingRecord[]> {
    const res = await axiosInstance.get('/reports/training-records');
    const records = unwrap<any[]>(res);
    return records.map((r) => ({
      ...r,
      id: r.id || r._id,
      employeeId: normalizeId(r.employeeId),
    }));
  },

  // Governance
  async getPolicies(): Promise<ESGPolicy[]> {
    const res = await axiosInstance.get('/policies');
    return unwrap(res);
  },

  async getPolicyAcknowledgements(): Promise<PolicyAcknowledgement[]> {
    const res = await axiosInstance.get('/policy-acknowledgements');
    const acks = unwrap<any[]>(res);
    return acks.map((a) => ({
      ...a,
      id: a.id || a._id,
      employeeId: normalizeId(a.employeeId),
      policyId: normalizeId(a.policyId),
    }));
  },

  async getAudits(): Promise<Audit[]> {
    const res = await axiosInstance.get('/audits');
    const audits = unwrap<any[]>(res);
    return audits.map((a) => ({
      ...a,
      id: a.id || a._id,
      auditorId: normalizeId(a.auditorId),
    }));
  },

  async getComplianceIssues(): Promise<ComplianceIssue[]> {
    const res = await axiosInstance.get('/compliance-issues');
    const issues = unwrap<any[]>(res);
    return issues.map((c) => ({
      ...c,
      id: c.id || c._id,
      auditId: normalizeId(c.auditId),
      ownerId: normalizeId(c.ownerId),
    }));
  },

  async createComplianceIssue(data: Omit<ComplianceIssue, 'id'>): Promise<ComplianceIssue> {
    const res = await axiosInstance.post('/compliance-issues', data);
    const c = unwrap<any>(res);
    return {
      ...c,
      id: c.id || c._id,
      auditId: normalizeId(c.auditId),
      ownerId: normalizeId(c.ownerId),
    };
  },

  async updateComplianceIssue(id: string, data: Partial<ComplianceIssue>): Promise<ComplianceIssue> {
    const res = await axiosInstance.patch(`/compliance-issues/${id}`, data);
    const c = unwrap<any>(res);
    return {
      ...c,
      id: c.id || c._id,
      auditId: normalizeId(c.auditId),
      ownerId: normalizeId(c.ownerId),
    };
  },

  // Gamification
  async getChallenges(): Promise<Challenge[]> {
    const res = await axiosInstance.get('/challenges');
    const challenges = unwrap<any[]>(res);
    return challenges.map((c) => ({
      ...c,
      id: c.id || c._id,
      categoryId: normalizeId(c.categoryId),
    }));
  },

  async getChallenge(id: string): Promise<Challenge | undefined> {
    const res = await axiosInstance.get(`/challenges/${id}`);
    const c = unwrap<any>(res);
    return {
      ...c,
      id: c.id || c._id,
      categoryId: normalizeId(c.categoryId),
    };
  },

  async getChallengeParticipations(challengeId?: string): Promise<ChallengeParticipation[]> {
    const url = challengeId 
      ? `/challenge-participations?challengeId=${challengeId}` 
      : '/challenge-participations';
    const res = await axiosInstance.get(url);
    const participations = unwrap<any[]>(res);
    return participations.map((p) => ({
      ...p,
      id: p.id || p._id,
      challengeId: normalizeId(p.challengeId),
      employeeId: normalizeId(p.employeeId),
    }));
  },

  async approveChallengeParticipation(id: string, xp: number): Promise<ChallengeParticipation> {
    const res = await axiosInstance.patch(`/challenge-participations/${id}/approve`, { xpAwarded: xp });
    const p = unwrap<any>(res);
    return {
      ...p,
      id: p.id || p._id,
      challengeId: normalizeId(p.challengeId),
      employeeId: normalizeId(p.employeeId),
    };
  },

  async getBadges(): Promise<Badge[]> {
    const res = await axiosInstance.get('/badges');
    return unwrap(res);
  },

  async getRewards(): Promise<Reward[]> {
    const res = await axiosInstance.get('/rewards');
    return unwrap(res);
  },

  async redeemReward(rewardId: string, _employeeId?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await axiosInstance.post(`/rewards/${rewardId}/redeem`);
      const body = res.data;
      if (body.success) {
        return { success: true, message: body.message || 'Reward redeemed successfully!' };
      }
      return { success: false, message: body.message || 'Redemption failed.' };
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Server error during redemption.';
      return { success: false, message: errMsg };
    }
  },

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const res = await axiosInstance.get('/leaderboard');
    return unwrap(res);
  },

  // Settings
  async getDepartments(): Promise<Department[]> {
    const res = await axiosInstance.get('/departments');
    const depts = unwrap<any[]>(res);
    return depts.map((d) => ({
      ...d,
      id: d.id || d._id,
      headEmployeeId: normalizeId(d.headEmployeeId),
      parentDepartmentId: normalizeId(d.parentDepartmentId),
    }));
  },

  async getCategories(): Promise<Category[]> {
    const res = await axiosInstance.get('/categories');
    const data = unwrap<any>(res);
    const csr = data.csrCategories || [];
    const challenge = data.challengeCategories || [];
    const mappedCsr = csr.map((c: any) => ({ ...c, id: c.id || c._id, type: 'CSR_ACTIVITY' }));
    const mappedChallenge = challenge.map((c: any) => ({ ...c, id: c.id || c._id, type: 'CHALLENGE' }));
    return [...mappedCsr, ...mappedChallenge];
  },

  async createCategory(data: { name: string; type: 'CSR_ACTIVITY' | 'CHALLENGE'; status?: string }): Promise<Category> {
    const res = await axiosInstance.post('/categories', data);
    const c = unwrap<any>(res);
    return { ...c, id: c.id || c._id };
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const res = await axiosInstance.patch(`/categories/${id}`, data);
    const c = unwrap<any>(res);
    return { ...c, id: c.id || c._id };
  },

  async deleteCategory(id: string): Promise<void> {
    await axiosInstance.delete(`/categories/${id}`);
  },

  async createDepartment(data: Omit<Department, 'id' | 'employeeCount'>): Promise<Department> {
    const res = await axiosInstance.post('/departments', data);
    const d = unwrap<any>(res);
    return {
      ...d,
      id: d.id || d._id,
      headEmployeeId: normalizeId(d.headEmployeeId),
      parentDepartmentId: normalizeId(d.parentDepartmentId),
    };
  },

  async updateDepartment(id: string, data: Partial<Department>): Promise<Department> {
    const res = await axiosInstance.patch(`/departments/${id}`, data);
    const d = unwrap<any>(res);
    return {
      ...d,
      id: d.id || d._id,
      headEmployeeId: normalizeId(d.headEmployeeId),
      parentDepartmentId: normalizeId(d.parentDepartmentId),
    };
  },

  async deleteDepartment(id: string): Promise<void> {
    await axiosInstance.delete(`/departments/${id}`);
  },

  async createEnvironmentalGoal(data: Omit<EnvironmentalGoal, 'id'>): Promise<EnvironmentalGoal> {
    const res = await axiosInstance.post('/environmental-goals', data);
    const g = unwrap<any>(res);
    return {
      ...g,
      id: g.id || g._id,
      departmentId: normalizeId(g.departmentId),
    };
  },

  async updateEnvironmentalGoal(id: string, data: Partial<EnvironmentalGoal>): Promise<EnvironmentalGoal> {
    const res = await axiosInstance.patch(`/environmental-goals/${id}`, data);
    const g = unwrap<any>(res);
    return {
      ...g,
      id: g.id || g._id,
      departmentId: normalizeId(g.departmentId),
    };
  },

  async deleteEnvironmentalGoal(id: string): Promise<void> {
    await axiosInstance.delete(`/environmental-goals/${id}`);
  },

  async createCSRActivity(data: Omit<CSRActivity, 'id'>): Promise<CSRActivity> {
    const res = await axiosInstance.post('/csr-activities', data);
    const a = unwrap<any>(res);
    return {
      ...a,
      id: a.id || a._id,
      categoryId: normalizeId(a.categoryId),
      departmentId: normalizeId(a.departmentId),
    };
  },

  async updateCSRActivity(id: string, data: Partial<CSRActivity>): Promise<CSRActivity> {
    const res = await axiosInstance.patch(`/csr-activities/${id}`, data);
    const a = unwrap<any>(res);
    return {
      ...a,
      id: a.id || a._id,
      categoryId: normalizeId(a.categoryId),
      departmentId: normalizeId(a.departmentId),
    };
  },

  async deleteCSRActivity(id: string): Promise<void> {
    await axiosInstance.delete(`/csr-activities/${id}`);
  },

  async createPolicy(data: Omit<ESGPolicy, 'id'>): Promise<ESGPolicy> {
    const res = await axiosInstance.post('/policies', data);
    return unwrap(res);
  },

  async updatePolicy(id: string, data: Partial<ESGPolicy>): Promise<ESGPolicy> {
    const res = await axiosInstance.patch(`/policies/${id}`, data);
    return unwrap(res);
  },

  async deletePolicy(id: string): Promise<void> {
    await axiosInstance.delete(`/policies/${id}`);
  },

  async createAudit(data: Omit<Audit, 'id'>): Promise<Audit> {
    const res = await axiosInstance.post('/audits', data);
    const a = unwrap<any>(res);
    return {
      ...a,
      id: a.id || a._id,
      auditorId: normalizeId(a.auditorId),
    };
  },

  async updateAudit(id: string, data: Partial<Audit>): Promise<Audit> {
    const res = await axiosInstance.patch(`/audits/${id}`, data);
    const a = unwrap<any>(res);
    return {
      ...a,
      id: a.id || a._id,
      auditorId: normalizeId(a.auditorId),
    };
  },

  async deleteAudit(id: string): Promise<void> {
    await axiosInstance.delete(`/audits/${id}`);
  },

  async deleteComplianceIssue(id: string): Promise<void> {
    await axiosInstance.delete(`/compliance-issues/${id}`);
  },

  async createChallenge(data: Omit<Challenge, 'id'>): Promise<Challenge> {
    const res = await axiosInstance.post('/challenges', data);
    const c = unwrap<any>(res);
    return {
      ...c,
      id: c.id || c._id,
      categoryId: normalizeId(c.categoryId),
    };
  },

  async updateChallenge(id: string, data: Partial<Challenge>): Promise<Challenge> {
    const res = await axiosInstance.patch(`/challenges/${id}`, data);
    const c = unwrap<any>(res);
    return {
      ...c,
      id: c.id || c._id,
      categoryId: normalizeId(c.categoryId),
    };
  },

  async deleteChallenge(id: string): Promise<void> {
    await axiosInstance.delete(`/challenges/${id}`);
  },

  async getESGConfig(): Promise<ESGConfig> {
    const res = await axiosInstance.get('/config/esg');
    return unwrap(res);
  },

  async updateESGConfig(data: Partial<ESGConfig>): Promise<ESGConfig> {
    const res = await axiosInstance.patch('/config/esg', data);
    return unwrap(res);
  },

  // Employees & Notifications
  async getEmployees(): Promise<Employee[]> {
    const res = await axiosInstance.get('/employees');
    const employees = unwrap<any[]>(res);
    return employees.map((e) => ({
      ...e,
      id: e.id || e._id,
      departmentId: normalizeId(e.departmentId),
    }));
  },

  async getEmployee(id: string): Promise<Employee | undefined> {
    const res = await axiosInstance.get(`/employees/${id}`);
    const e = unwrap<any>(res);
    return {
      ...e,
      id: e.id || e._id,
      departmentId: normalizeId(e.departmentId),
    };
  },

  async getNotifications(): Promise<Notification[]> {
    const res = await axiosInstance.get('/notifications?limit=100');
    // Extract array from the paginated envelope
    const data = res.data.data.notifications || [];
    return data.map((n: any) => ({
      ...n,
      id: n.id || n._id,
      recipientId: normalizeId(n.recipientId),
    }));
  },

  async markNotificationRead(id: string): Promise<void> {
    await axiosInstance.patch(`/notifications/${id}/read`);
  },

  async exportReport(type: string, format: string): Promise<Blob> {
    const res = await axiosInstance.get(`/reports/${type}/export?format=${format}`, {
      responseType: 'blob',
    });
    return res.data;
  },
};

export type Api = typeof api;
