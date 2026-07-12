import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, FileText } from 'lucide-react';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

export function AcknowledgementsPage() {
  const { data: policies, isLoading } = useQuery({ queryKey: ['policies'], queryFn: api.getPolicies });
  const { data: acks, isLoading: ackLoading } = useQuery({ queryKey: ['policyAcks'], queryFn: api.getPolicyAcknowledgements });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: api.getEmployees });

  if (isLoading || ackLoading) return <PageSkeleton />;


  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Policy Acknowledgements" description="Track who has and hasn't acknowledged each policy" />

      <div className="space-y-4">
        {policies?.map((policy, pi) => {
          const policyAcks = acks?.filter((a) => a.policyId === policy.id) ?? [];
          const acknowledgedIds = new Set(policyAcks.map((a) => a.employeeId));
          const ackCount = acknowledgedIds.size;
          const totalCount = employees?.length ?? 0;
          const pct = totalCount > 0 ? (ackCount / totalCount) * 100 : 0;

          return (
            <motion.div
              key={policy.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pi * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{policy.title}</CardTitle>
                        <CardDescription>v{policy.version} · {policy.category}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={pct === 100 ? 'secondary' : 'outline'} className="gap-1">
                      {ackCount}/{totalCount} acknowledged
                    </Badge>
                  </div>
                  <Progress value={pct} className="h-1.5 mt-3" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                    {employees?.map((emp, ei) => {
                      const hasAck = acknowledgedIds.has(emp.id);
                      const ack = policyAcks.find((a) => a.employeeId === emp.id);
                      return (
                        <motion.div
                          key={emp.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: ei * 0.02 }}
                          className={`flex items-center gap-2 p-2 rounded-lg border ${hasAck ? 'border-success/30 bg-success/5' : 'border-destructive/20 bg-destructive/5'}`}
                        >
                          <Avatar className="w-7 h-7">
                            <AvatarImage src={emp.avatarUrl} />
                            <AvatarFallback className="text-[10px]">{emp.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{emp.name}</p>
                            {hasAck && ack && (
                              <p className="text-[10px] text-muted-foreground">
                                {new Date(ack.acknowledgedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                          {hasAck ? (
                            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-destructive/60 shrink-0" />
                          )}
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
    </div>
  );
}
