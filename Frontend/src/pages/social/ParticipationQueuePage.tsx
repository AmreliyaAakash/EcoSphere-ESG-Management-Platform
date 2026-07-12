import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check, X, FileText, FileX, AlertCircle, ClipboardCheck } from 'lucide-react';
import { api } from '@/services/api';
import { useUI } from '@/context/UIContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const STATUS_CONFIG: Record<string, { label: string; variant: string }> = {
  PENDING: { label: 'Pending', variant: 'bg-warning/15 text-warning border-warning/30' },
  APPROVED: { label: 'Approved', variant: 'bg-success/15 text-success border-success/30' },
  REJECTED: { label: 'Rejected', variant: 'bg-destructive/15 text-destructive border-destructive/30' },
};

export function ParticipationQueuePage() {
  const { config } = useUI();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: participations, isLoading } = useQuery({ queryKey: ['employeeParticipations'], queryFn: api.getEmployeeParticipations });
  const { data: activities } = useQuery({ queryKey: ['csrActivities'], queryFn: api.getCSRActivities });
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: api.getEmployees });

  const approveMut = useMutation({
    mutationFn: ({ id, points }: { id: string; points: number }) => api.approveParticipation(id, points),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeParticipations'] });
      toast({ title: 'Participation Approved', description: 'Points have been awarded.' });
    },
    onError: (error: any) => {
      toast({ title: 'Approval failed', description: error?.response?.data?.message || error?.message || 'Could not approve participation.', variant: 'destructive' });
    },
  });

  const rejectMut = useMutation({
    mutationFn: (id: string) => api.rejectParticipation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeParticipations'] });
      toast({ title: 'Participation Rejected', description: 'The submission has been rejected.' });
    },
    onError: (error: any) => {
      toast({ title: 'Rejection failed', description: error?.response?.data?.message || error?.message || 'Could not reject participation.', variant: 'destructive' });
    },
  });

  if (isLoading) return <PageSkeleton />;

  const empName = (eid: string) => employees?.find((e) => e.id === eid);
  const activityName = (aid: string) => activities?.find((a) => a.id === aid)?.title ?? 'Unknown';

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Participation Queue" description="Review and approve employee CSR activity submissions">
        {config.evidenceRequired && (
          <Badge variant="outline" className="gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-warning" />
            Evidence Required
          </Badge>
        )}
      </PageHeader>

      <div className="space-y-3">
        {participations?.map((p, i) => {
          const emp = empName(p.employeeId);
          const status = STATUS_CONFIG[p.approvalStatus];
          const hasProof = !!p.proofUrl;
          const isPending = p.approvalStatus === 'PENDING';
          const blockedByEvidence = config.evidenceRequired && !hasProof && isPending;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Employee */}
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={emp?.avatarUrl} />
                        <AvatarFallback className="text-xs">{emp?.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{emp?.name}</p>
                        <p className="text-xs text-muted-foreground">{emp?.role}</p>
                      </div>
                    </div>

                    {/* Activity */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activityName(p.activityId)}</p>
                      <p className="text-xs text-muted-foreground">
                        Completed {new Date(p.completionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>

                    {/* Proof indicator */}
                    <div className="flex items-center gap-2">
                      {hasProof ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1"
                          onClick={() => {
                            if (p.proofUrl) {
                              window.open(api.resolveUploadUrl(p.proofUrl), '_blank', 'noopener,noreferrer');
                            }
                          }}
                        >
                          <FileText className="w-3.5 h-3.5 text-primary" /> View Proof
                        </Button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileX className="w-3.5 h-3.5" /> No proof
                        </span>
                      )}
                    </div>

                    {/* Points */}
                    <div className="text-center min-w-[60px]">
                      <p className="font-mono font-bold text-sm">{p.pointsEarned || 50}</p>
                      <p className="text-[10px] text-muted-foreground">points</p>
                    </div>

                    {/* Status */}
                    <Badge variant="outline" className={`text-[10px] ${status.variant}`}>
                      {status.label}
                    </Badge>

                    {/* Actions */}
                    {isPending && (
                      <div className="flex gap-2">
                        {blockedByEvidence ? (
                          <div className="flex items-center gap-1.5 text-xs text-destructive">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Evidence required</span>
                          </div>
                        ) : (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" className="gap-1">
                                <Check className="w-3.5 h-3.5" /> Approve
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Approve participation?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will award {p.pointsEarned || 50} points to {emp?.name} for "{activityName(p.activityId)}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => approveMut.mutate({ id: p.id, points: p.pointsEarned || 50 })}>
                                  Confirm Approve
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-1 text-destructive">
                              <X className="w-3.5 h-3.5" /> Reject
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject participation?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will reject {emp?.name}'s submission for "{activityName(p.activityId)}". No points will be awarded.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => rejectMut.mutate(p.id)}>
                                  Confirm Reject
                                </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
        {participations?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ClipboardCheck className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No participation submissions to review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
