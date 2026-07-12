import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, Clock, PlayCircle } from 'lucide-react';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  COMPLETED: { label: 'Completed', icon: CheckCircle2, color: 'text-success' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'text-warning' },
  NOT_STARTED: { label: 'Not Started', icon: PlayCircle, color: 'text-muted-foreground' },
};

export function TrainingPage() {
  const { data: records, isLoading } = useQuery({ queryKey: ['trainingRecords'], queryFn: api.getTrainingRecords });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: api.getEmployees });

  if (isLoading) return <PageSkeleton />;

  const empName = (eid: string) => employees?.find((e) => e.id === eid);

  const courses = [...new Set(records?.map((r) => r.courseName) ?? [])];
  const completedCount = records?.filter((r) => r.status === 'COMPLETED').length ?? 0;
  const totalRecords = records?.length ?? 0;
  const completionRate = totalRecords > 0 ? (completedCount / totalRecords) * 100 : 0;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Training Tracker" description="Monitor employee training completion across ESG-related courses" />

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-primary" />
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </div>
            <p className="font-mono font-bold text-2xl">{completionRate.toFixed(0)}%</p>
            <Progress value={completionRate} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <p className="font-mono font-bold text-2xl">{completedCount}</p>
            <p className="text-xs text-muted-foreground mt-0.5">of {totalRecords} total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-warning" />
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            <p className="font-mono font-bold text-2xl">{records?.filter((r) => r.status === 'IN_PROGRESS').length ?? 0}</p>
            <p className="text-xs text-muted-foreground mt-0.5">active enrollments</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-course breakdown */}
      {courses.map((course, ci) => {
        const courseRecords = records?.filter((r) => r.courseName === course) ?? [];
        const courseCompleted = courseRecords.filter((r) => r.status === 'COMPLETED').length;
        const coursePct = courseRecords.length > 0 ? (courseCompleted / courseRecords.length) * 100 : 0;

        return (
          <motion.div
            key={course}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.05 }}
          >
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{course}</CardTitle>
                  <Badge variant="secondary" className="gap-1">
                    {courseCompleted}/{courseRecords.length} completed
                  </Badge>
                </div>
                <CardDescription>{coursePct.toFixed(0)}% completion rate</CardDescription>
                <Progress value={coursePct} className="h-1.5 mt-2" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {courseRecords.map((r, i) => {
                    const emp = empName(r.employeeId);
                    const status = STATUS_CONFIG[r.status];
                    const StatusIcon = status.icon;
                    return (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={emp?.avatarUrl} />
                          <AvatarFallback className="text-xs">{emp?.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium flex-1">{emp?.name}</span>
                        {r.status !== 'NOT_STARTED' && (
                          <Progress value={r.progress} className="h-1.5 w-24" />
                        )}
                        <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
