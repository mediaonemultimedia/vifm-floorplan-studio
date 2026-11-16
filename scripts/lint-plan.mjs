// node scripts/lint-plan.mjs <revision.json> [brief.json]
import {readFileSync} from 'node:fs';
import {lintProject,lintReport} from '../plan-lint.js';
const [asset,briefPath]=process.argv.slice(2);
const p=JSON.parse(readFileSync(asset,'utf8'));
const brief=briefPath?JSON.parse(readFileSync(briefPath,'utf8')):null;
const issues=lintProject(p,brief);
console.log(lintReport(issues));
console.log(`\n${issues.filter(i=>i.severity==='error').length} errors, ${issues.filter(i=>i.severity==='check').length} checks`);
