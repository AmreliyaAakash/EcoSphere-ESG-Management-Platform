import { useState, useEffect } from 'react';
import { Leaf, Users, Shield, Zap, FileText, Award } from 'lucide-react';
import { api } from '@/services/api';
import { useUI } from '@/context/UIContext';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ENV_COLOR, SOCIAL_COLOR, GOV_COLOR } from '@/components/esg/ESGScoreRing';

export function ESGConfigPage() {
  const { config, setConfig } = useUI();
  const { toast } = useToast();
  const [weights, setWeights] = useState({
    env: config.envWeight,
    social: config.socialWeight,
    gov: config.govWeight,
  });

  const sum = weights.env + weights.social + weights.gov;
  const isValid = sum === 100;

  // Sync weights local state when config is fetched/updated in context
  useEffect(() => {
    setWeights({
      env: config.envWeight,
      social: config.socialWeight,
      gov: config.govWeight,
    });
  }, [config]);

  function handleSliderChange(key: 'env' | 'social' | 'gov', value: number) {
    const newWeights = { ...weights, [key]: value };
    // Auto-adjust other sliders to maintain sum = 100
    const remaining = 100 - value;
    const otherKeys = Object.keys(newWeights).filter((k) => k !== key) as ('env' | 'social' | 'gov')[];
    const otherSum = newWeights[otherKeys[0]] + newWeights[otherKeys[1]];
    if (otherSum === 0) {
      newWeights[otherKeys[0]] = Math.floor(remaining / 2);
      newWeights[otherKeys[1]] = remaining - newWeights[otherKeys[0]];
    } else {
      newWeights[otherKeys[0]] = Math.round((newWeights[otherKeys[0]] / otherSum) * remaining);
      newWeights[otherKeys[1]] = remaining - newWeights[otherKeys[0]];
    }
    // Clamp
    newWeights[otherKeys[0]] = Math.max(0, Math.min(100, newWeights[otherKeys[0]]));
    newWeights[otherKeys[1]] = Math.max(0, Math.min(100, newWeights[otherKeys[1]]));
    setWeights(newWeights);
  }

  function handleSave() {
    if (!isValid) {
      toast({ title: 'Cannot save', description: 'Weights must sum to 100%', variant: 'destructive' });
      return;
    }
    setConfig({ envWeight: weights.env, socialWeight: weights.social, govWeight: weights.gov });
    api.updateESGConfig({ envWeight: weights.env, socialWeight: weights.social, govWeight: weights.gov });
    toast({ title: 'ESG configuration saved', description: 'Weight changes are now live across the dashboard.' });
  }

  function handleToggle(key: 'autoEmissionCalc' | 'evidenceRequired' | 'badgeAutoAward', value: boolean) {
    setConfig({ [key]: value });
    api.updateESGConfig({ [key]: value });
    toast({ title: 'Setting updated', description: `${key} is now ${value ? 'ON' : 'OFF'}.` });
  }

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      <PageHeader title="ESG Configuration" description="Configure score weighting and platform behavior" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight sliders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ESG Score Weights</CardTitle>
            <CardDescription>Adjust how each category contributes to the overall score</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Environmental */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4" style={{ color: ENV_COLOR }} />
                  <Label className="text-sm font-medium">Environmental</Label>
                </div>
                <span className="font-mono font-bold text-lg" style={{ color: ENV_COLOR }}>{weights.env}%</span>
              </div>
              <Slider
                value={[weights.env]}
                onValueChange={(v) => handleSliderChange('env', v[0])}
                max={100}
                step={5}
                className="[&_[role=slider]]:bg-primary"
              />
            </div>

            {/* Social */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" style={{ color: SOCIAL_COLOR }} />
                  <Label className="text-sm font-medium">Social</Label>
                </div>
                <span className="font-mono font-bold text-lg" style={{ color: SOCIAL_COLOR }}>{weights.social}%</span>
              </div>
              <Slider
                value={[weights.social]}
                onValueChange={(v) => handleSliderChange('social', v[0])}
                max={100}
                step={5}
                className="[&_[role=slider]]:bg-secondary"
              />
            </div>

            {/* Governance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" style={{ color: GOV_COLOR }} />
                  <Label className="text-sm font-medium">Governance</Label>
                </div>
                <span className="font-mono font-bold text-lg" style={{ color: GOV_COLOR }}>{weights.gov}%</span>
              </div>
              <Slider
                value={[weights.gov]}
                onValueChange={(v) => handleSliderChange('gov', v[0])}
                max={100}
                step={5}
                className="[&_[role=slider]]:bg-governance"
              />
            </div>

            {/* Sum indicator */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className={`font-mono font-bold text-xl ${isValid ? 'text-success' : 'text-destructive'}`}>{sum}%</span>
              </div>
              {isValid ? (
                <Badge className="bg-success text-success-foreground">Valid</Badge>
              ) : (
                <Badge variant="destructive">Must equal 100%</Badge>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={!isValid}
              className="w-full inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Save Weights
            </button>
          </CardContent>
        </Card>

        {/* Feature toggles */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Feature Toggles</CardTitle>
            <CardDescription>Control platform-wide behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow
              icon={Zap}
              iconColor="text-primary"
              label="Auto Emission Calculation"
              description="Automatically calculate CO2e from quantity and emission factors"
              checked={config.autoEmissionCalc}
              onChange={(v) => handleToggle('autoEmissionCalc', v)}
            />
            <ToggleRow
              icon={FileText}
              iconColor="text-secondary"
              label="Evidence Required"
              description="Require proof upload for CSR participation approvals"
              checked={config.evidenceRequired}
              onChange={(v) => handleToggle('evidenceRequired', v)}
            />
            <ToggleRow
              icon={Award}
              iconColor="text-governance"
              label="Badge Auto-Award"
              description="Automatically award badges when unlock criteria are met"
              checked={config.badgeAutoAward}
              onChange={(v) => handleToggle('badgeAutoAward', v)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ToggleRow({ icon: Icon, iconColor, label, description, checked, onChange }: {
  icon: any; iconColor: string; label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${iconColor} mt-0.5`} />
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
