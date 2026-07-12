import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Zap, Filter } from 'lucide-react';
import { api } from '@/services/api';
import { useUI } from '@/context/UIContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { PageSkeleton } from '@/components/shared/PageSkeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ENV_COLOR } from '@/components/esg/ESGScoreRing';

export function CarbonTransactionsPage() {
  const { config } = useUI();
  const { data: transactions, isLoading } = useQuery({ queryKey: ['carbonTransactions'], queryFn: api.getCarbonTransactions });
  const { data: factors } = useQuery({ queryKey: ['emissionFactors'], queryFn: api.getEmissionFactors });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: api.getDepartments });

  const [deptFilter, setDeptFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const deptName = (id: string) => departments?.find((d) => d.id === id)?.name ?? 'Unknown';
  const factorName = (id: string) => factors?.find((f) => f.id === id)?.activityType ?? 'Unknown';

  const filtered = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((t) => {
      if (deptFilter !== 'all' && t.departmentId !== deptFilter) return false;
      if (moduleFilter !== 'all' && t.sourceModule !== moduleFilter) return false;
      return true;
    });
  }, [transactions, deptFilter, moduleFilter]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const byDept = useMemo(() => {
    if (!transactions || !departments) return [];
    const map = new Map<string, number>();
    transactions.forEach((t) => {
      map.set(t.departmentId, (map.get(t.departmentId) ?? 0) + t.co2eCalculated);
    });
    return Array.from(map.entries()).map(([id, value]) => ({
      name: departments.find((d) => d.id === id)?.name ?? 'Unknown',
      co2e: Math.round(value),
    })).sort((a, b) => b.co2e - a.co2e);
  }, [transactions, departments]);

  const totalCO2e = filtered.reduce((sum, t) => sum + t.co2eCalculated, 0);

  const modules = useMemo(() => [...new Set(transactions?.map((t) => t.sourceModule) ?? [])], [transactions]);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Carbon Transactions" description="Log of all carbon-emitting activities across the organization">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${config.autoEmissionCalc ? 'border-success/30 bg-success/10' : 'border-muted bg-muted'}`}>
            <Zap className={`w-3.5 h-3.5 ${config.autoEmissionCalc ? 'text-success' : 'text-muted-foreground'}`} />
            <span className="text-xs font-medium">Auto Emission Calc: {config.autoEmissionCalc ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </PageHeader>

      {/* Summary + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total CO2e (filtered)</p>
            <p className="font-mono font-bold text-3xl">{totalCO2e.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p className="text-xs text-muted-foreground mt-1">tonnes CO2e</p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Emissions by Department</CardTitle>
            <CardDescription>Total CO2e per department (tonnes)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={byDept} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="co2e" radius={[4, 4, 0, 0]}>
                  {byDept.map((_, i) => (
                    <Cell key={i} fill={ENV_COLOR} fillOpacity={1 - i * 0.12} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" /> Filters:
        </div>
        <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments?.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={moduleFilter} onValueChange={(v) => { setModuleFilter(v); setPage(0); }}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Source Module" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            {modules.map((m) => (
              <SelectItem key={m} value={m}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline" className="ml-auto">{filtered.length} records</Badge>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source Module</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">CO2e (t)</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-muted/30"
                >
                  <TableCell>
                    <Badge variant="outline">{t.sourceModule}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{factorName(t.emissionFactorId)}</TableCell>
                  <TableCell className="text-right font-mono">{t.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">{t.co2eCalculated.toLocaleString(undefined, { maximumFractionDigits: 1 })}</TableCell>
                  <TableCell className="text-sm">{deptName(t.departmentId)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground font-mono">{new Date(t.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-muted-foreground">
          Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)} of {filtered.length}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={(page + 1) * pageSize >= filtered.length} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
