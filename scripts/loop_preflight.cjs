/**
 * Multi-Iteration Preflight Loop Stress-Runner (10x Consecutive Execution)
 */

const { execSync } = require('child_process');

const totalRuns = 10;
console.log(`\n========================================================================`);
console.log(`   EXECUTING 10 CONSECUTIVE PREFLIGHT VERIFICATION PASSES`);
console.log(`========================================================================\n`);

let passedCount = 0;
for (let i = 1; i <= totalRuns; i++) {
  process.stdout.write(`  [Iteration ${String(i).padStart(2)}/${totalRuns}] Executing npm run preflight... `);
  const t0 = Date.now();
  try {
    const rawOut = execSync('npm run preflight', { encoding: 'utf8' });
    const cleanOut = rawOut.replace(/\x1b\[[0-9;]*m/g, '');
    const duration = ((Date.now() - t0) / 1000).toFixed(2);
    if (cleanOut.includes('VERIFIED PASS') && cleanOut.includes('Failed Checks:             0')) {
      passedCount++;
      console.log(`\x1b[32m✓ 100% PASS\x1b[0m (${duration}s)`);
    } else {
      console.log(`\x1b[31m✗ FAILED\x1b[0m (${duration}s)`);
      console.error(cleanOut);
      process.exit(1);
    }
  } catch (err) {
    console.log(`\x1b[31m✗ ERROR\x1b[0m`);
    console.error(err.stdout || err.message);
    process.exit(1);
  }
}

console.log(`\n========================================================================`);
console.log(`  STRESS LOOP COMPLETE: ${passedCount}/${totalRuns} PASSES 100% SUCCESSFUL`);
console.log(`========================================================================\n`);
