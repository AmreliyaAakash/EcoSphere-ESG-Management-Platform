import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ENV_COLOR } from '@/components/esg/ESGScoreRing';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const MODULE_COLORS = ['hsl(152, 47%, 42%)', 'hsl(48, 60%, 48%)', 'hsl(210, 20%, 45%)', 'hsl(142, 50%, 40%)', 'hsl(0, 72%, 51%)'];

export function EnvironmentalDashboardPage() {
  const { data: transactions, isLoading } = useQuery({ queryKey: ['carbonTransactions'], queryFn: api.getCarbonTransactions });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: api.getDepartments });
  const { data: deptScores } = useQuery({ queryKey: ['deptScores'], queryFn: api.getDepartmentScores });

  if (isLoading) return <PageSkeleton />;

  const deptName = (id: string) => departments?.find((d) => d.id === id)?.name ?? 'Unknown';

  const byDept = transactions && departments
    ? Array.from(
        transactions.reduce((map, t) => {
          map.set(t.departmentId, (map.get(t.departmentId) ?? 0) + t.co2eCalculated);
          return map;
        }, new Map<string, number>()).entries()
      ).map(([id, co2e]) => ({ name: deptName(id), co2e: Math.round(co2e) })).sort((a, b) => b.co2e - a.co2e)
    : [];

  const byModule = transactions
    ? Array.from(
        transactions.reduce((map, t) => {
          map.set(t.sourceModule, (map.get(t.sourceModule) ?? 0) + t.co2eCalculated);
          return map;
        }, new Map<string, number>()).entries()
      ).map(([name, co2e]) => ({ name, value: Math.round(co2e) }))
    : [];

  const totalCO2e = transactions?.reduce((s, t) => s + t.co2eCalculated, 0) ?? 0;
  const topDept = deptScores?.sort((a, b) => b.environmentalScore - a.environmentalScore)[0];

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Environmental Dashboard" description="Department carbon breakdown and emissions analysis" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground mb-1">Total Emissions</p>
            <p className="font-mono font-bold text-2xl">{totalCO2e.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-muted-foreground mt-0.5">tonnes CO2e</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground mb-1">Top Environmental Score</p>
            <p className="font-mono font-bold text-2xl">{topDept?.environmentalScore ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{topDept ? deptName(topDept.departmentId) : ''}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground mb-1">Transactions Logged</p>
            <p className="font-mono font-bold text-2xl">{transactions?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">carbon entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emissions by Department</CardTitle>
            <CardDescription>CO2e in tonnes per department</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byDept} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="co2e" radius={[4, 4, 0, 0]} fill={ENV_COLOR} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emissions by Source Module</CardTitle>
            <CardDescription>Breakdown of CO2e by emission source</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={byModule} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={3}>
                  {byModule.map((_, i) => (
                    <Cell key={i} fill={MODULE_COLORS[i % MODULE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Department environmental scores */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Department Environmental Scores</CardTitle>
          <CardDescription>Current period environmental performance by department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {deptScores?.sort((a, b) => b.environmentalScore - a.environmentalScore).map((score, i) => (
              <motion.div
                key={score.departmentId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4"
              >
                <span className="font-mono text-sm text-muted-foreground w-6">{i + 1}</span>
                <span className="text-sm font-medium w-40 truncate">{deptName(score.departmentId)}</span>
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: ENV_COLOR }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score.environmentalScore}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </div>
                <span className="font-mono font-semibold text-sm w-10 text-right">{score.environmentalScore}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
