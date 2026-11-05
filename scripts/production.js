const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const steps = [
  { label: 'Pulling origin/main', command: 'git', args: ['pull', '--ff-only', 'origin', 'main'] },
  { label: 'Installing dependencies', command: 'npm', args: ['install', '--include=dev'] },
  { label: 'Building production assets', command: 'npm', args: ['run', 'build'] },
  { label: 'Starting production server', command: 'npm', args: ['run', 'start:prod'] },
];

function runProduction(runCommand = spawnSync) {
  for (const step of steps) {
    console.info(`[Production] ${step.label}`);
    const result = runCommand(step.command, step.args, {
      cwd: projectRoot,
      stdio: 'inherit',
      // Windows distributes npm as a command script. All arguments are fixed.
      shell: process.platform === 'win32' && step.command === 'npm',
    });

    if (result.error || result.status !== 0) {
      console.error(`[Production] Stopped: ${step.label.toLowerCase()} did not complete`);
      return result.status || 1;
    }
  }
  return 0;
}

if (require.main === module) process.exitCode = runProduction();
module.exports = { runProduction };
