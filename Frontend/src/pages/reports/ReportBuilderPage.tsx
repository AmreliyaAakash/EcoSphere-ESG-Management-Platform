import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Calendar, Building2, Leaf } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

export function ReportBuilderPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [department, setDepartment] = useState('all');
  const [module, setModule] = useState('all');
  const [category, setCategory] = useState('all');

  const { data: departments, isLoading } = useQuery({ queryKey: ['departments'], queryFn: api.getDepartments });
  const { data: transactions } = useQuery({ queryKey: ['carbonTransactions'], queryFn: api.getCarbonTransactions });


  if (isLoading) return <PageSkeleton />;

  // Build preview data based on filters
  const previewData = transactions?.filter((t) => {
    if (department !== 'all' && t.departmentId !== department) return false;
    if (module !== 'all' && t.sourceModule !== module) return false;
    if (dateRange.from) {
      const tDate = new Date(t.date);
      if (tDate < dateRange.from) return false;
    }
    if (dateRange.to) {
      const tDate = new Date(t.date);
      if (tDate > dateRange.to) return false;
    }
    return true;
  }) ?? [];

  const deptName = (id: string) => departments?.find((d) => d.id === id)?.name ?? 'Unknown';

  async function handleExport(formatType: string) {
    try {
      toast({ title: `Generating ${formatType}...`, description: 'Preparing report data for download.' });
      const paramFormat = formatType === 'Excel' ? 'xlsx' : formatType.toLowerCase();
      const blob = await api.exportReport('carbon-transactions', paramFormat);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `custom-report-${Date.now()}.${paramFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast({ title: 'Export Complete', description: `Your ${formatType} report was generated successfully.` });
    } catch (err) {
      console.error(err);
      toast({ variant: 'destructive', title: 'Export Failed', description: 'There was an issue generating the report file.' });
    }
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Custom Report Builder" description="Filter, preview, and export ESG data" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filter panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters
            </CardTitle>
            <CardDescription>Refine your report data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Department */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-sm font-normal">
                    {dateRange.from ? (
                      dateRange.to ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}` : format(dateRange.from, 'MMM d, yyyy')
                    ) : 'Select date range'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="range"
                    selected={dateRange as any}
                    onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Module */}
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5" /> Source Module</Label>
              <Select value={module} onValueChange={setModule}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {[...new Set(transactions?.map((t) => t.sourceModule) ?? [])].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ESG Category */}
            <div className="space-y-2">
              <Label className="text-xs">ESG Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="environmental">Environmental</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="governance">Governance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Export</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleExport('PDF')}>PDF</Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleExport('Excel')}>Excel</Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleExport('CSV')}>CSV</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Preview</CardTitle>
              <Badge variant="secondary">{previewData.length} records</Badge>
            </div>
            <CardDescription>Filtered data ready for export</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">CO2e (t)</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.slice(0, 15).map((t, i) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <TableCell><Badge variant="outline" className="text-[10px]">{t.sourceModule}</Badge></TableCell>
                    <TableCell className="text-sm">{deptName(t.departmentId)}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{t.quantity.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-mono font-semibold text-sm">{t.co2eCalculated.toLocaleString(undefined, { maximumFractionDigits: 1 })}</TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">{new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
            {previewData.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">No data matches the current filters.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
