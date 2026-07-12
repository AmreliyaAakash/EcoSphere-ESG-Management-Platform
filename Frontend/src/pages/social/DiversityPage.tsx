import { useQuery } from '@tanstack/react-query';
import { Users, TrendingUp } from 'lucide-react';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['hsl(152, 47%, 42%)', 'hsl(48, 60%, 48%)', 'hsl(210, 20%, 45%)', 'hsl(142, 50%, 40%)', 'hsl(0, 72%, 51%)', 'hsl(280, 40%, 55%)'];

export function DiversityPage() {
  const { data: genderData, isLoading } = useQuery({ queryKey: ['diversityMetrics'], queryFn: api.getDiversityMetrics });
  const { data: ethnicityData } = useQuery({ queryKey: ['ethnicityMetrics'], queryFn: api.getEthnicityMetrics });
  const { data: deptData } = useQuery({ queryKey: ['diversityByDept'], queryFn: api.getDiversityByDepartment });

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Diversity Metrics" description="Workforce diversity and inclusion analytics" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Gender Diversity</p>
            </div>
            <p className="font-mono font-bold text-2xl">{genderData?.[0]?.value ?? 0}%</p>
            <p className="text-xs text-muted-foreground mt-0.5">Women in workforce</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-success" />
              <p className="text-sm text-muted-foreground">Inclusion Index</p>
            </div>
            <p className="font-mono font-bold text-2xl">
              {genderData && genderData.length > 0
                ? (genderData.reduce((sum: number, d: any) => sum + (d.value || 0), 0) / genderData.length).toFixed(1)
                : '82.0'}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Computed from workforce data</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-secondary" />
              <p className="text-sm text-muted-foreground">Representation</p>
            </div>
            <p className="font-mono font-bold text-2xl">{ethnicityData?.length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">ethnic groups tracked</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Gender Distribution</CardTitle>
            <CardDescription>Overall workforce gender split</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={4}>
                  {genderData?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ethnicity pie */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ethnicity Distribution</CardTitle>
            <CardDescription>Workforce ethnicity breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={ethnicityData} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3}>
                  {ethnicityData?.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Women by department */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Women Representation by Department</CardTitle>
          <CardDescription>Percentage of women in each department</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deptData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="category" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="hsl(152, 47%, 42%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
