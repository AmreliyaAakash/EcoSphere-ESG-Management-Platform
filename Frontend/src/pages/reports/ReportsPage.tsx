import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileBarChart, Leaf, Users, Shield, BarChart3, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const REPORT_TYPES = [
  { type: 'Environmental', icon: Leaf, color: 'text-primary', bgColor: 'bg-primary/10', description: 'Emissions, goals, and environmental performance metrics' },
  { type: 'Social', icon: Users, color: 'text-secondary', bgColor: 'bg-secondary/10', description: 'CSR activities, diversity, training, and participation data' },
  { type: 'Governance', icon: Shield, color: 'text-governance', bgColor: 'bg-governance/10', description: 'Policies, audits, compliance, and acknowledgement summaries' },
  { type: 'ESG Summary', icon: BarChart3, color: 'text-primary', bgColor: 'bg-primary/10', description: 'Combined ESG score across all three categories' },
  { type: 'Custom Report', icon: FileBarChart, color: 'text-secondary', bgColor: 'bg-secondary/10', description: 'Build a custom report with your own filters and criteria' },
];

export function ReportsPage() {
  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <PageHeader title="Reports" description="Generate and export ESG reports for stakeholders" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_TYPES.map((report, i) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={report.type}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Link to={report.type === 'Custom Report' ? '/reports/builder' : '/reports/builder'}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow h-full">
                  <CardContent className="pt-6 flex flex-col h-full">
                    <div className={`w-12 h-12 rounded-xl ${report.bgColor} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${report.color}`} />
                    </div>
                    <h3 className="text-base font-semibold mb-1">{report.type}</h3>
                    <p className="text-sm text-muted-foreground leading-snug mb-4 flex-1">{report.description}</p>
                    <Button variant="ghost" size="sm" className="justify-start p-0 h-auto text-primary">
                      Get started <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
