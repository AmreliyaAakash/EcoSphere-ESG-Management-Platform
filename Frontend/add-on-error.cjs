/**
 * Script to add onError handlers to all useMutation blocks across page files.
 * Run with: node add-on-error.cjs
 */
const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/environmental/EnvironmentalGoalsPage.tsx',
  'src/pages/environmental/EmissionFactorsPage.tsx',
  'src/pages/social/CSRActivitiesPage.tsx',
  'src/pages/social/ParticipationQueuePage.tsx',
  'src/pages/governance/PoliciesPage.tsx',
  'src/pages/governance/AuditsPage.tsx',
  'src/pages/governance/ComplianceIssuesPage.tsx',
  'src/pages/gamification/ChallengesPage.tsx',
  'src/pages/gamification/RewardsPage.tsx',
  'src/pages/settings/DepartmentsPage.tsx',
  'src/pages/settings/CategoriesPage.tsx',
];

const onErrorBlock = `    onError: (error: any) => {
      toast({
        title: 'Operation failed',
        description: error?.response?.data?.message || error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },`;

let totalFixed = 0;

for (const relFile of files) {
  const filePath = path.join(__dirname, relFile);
  if (!fs.existsSync(filePath)) {
    console.warn('SKIP (not found):', filePath);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Find all useMutation blocks and add onError after onSuccess if not already present
  // We look for patterns: "onSuccess: () => {" ... closing "  });" where onError is missing
  const mutationRegex = /useMutation\(\{([\s\S]*?)\n  \}\)/g;
  
  content = content.replace(mutationRegex, (fullMatch, inner) => {
    // If onError already exists in this mutation, skip
    if (inner.includes('onError')) return fullMatch;
    // If onSuccess exists, add onError after its closing brace
    if (inner.includes('onSuccess')) {
      // Find the last occurrence of closing of onSuccess block (    },) 
      // and add onError after it
      const fixed = inner.replace(
        /(\s+onSuccess:\s*\(\)\s*=>\s*\{[\s\S]*?\n\s+\},)\s*(\n\s*\}\))/g,
        (m, onSuccessPart, closing) => {
          return `${onSuccessPart}\n${onErrorBlock}${closing}`;
        }
      );
      if (fixed !== inner) {
        changed = true;
        totalFixed++;
        return `useMutation({${fixed}\n  })`;
      }
    }
    return fullMatch;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ Updated:', relFile);
  } else {
    console.log('⏭️  No changes needed:', relFile);
  }
}

console.log(`\nDone. Fixed ${totalFixed} mutations.`);
