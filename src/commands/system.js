import chalk from 'chalk';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function systemInfo(action = 'full') {
  console.log(chalk.cyan.bold('\n💻 System Information\n'));
  
  const info = {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    uptime: formatUptime(os.uptime()),
    cpu: os.cpus()[0]?.model || 'Unknown',
    cpuCores: os.cpus().length,
    memory: `${(os.totalmem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    freeMemory: `${(os.freemem() / 1024 / 1024 / 1024).toFixed(2)} GB`,
    loadAvg: os.loadavg().map(l => l.toFixed(2)).join(', ')
  };

  console.log(chalk.gray('━'.repeat(40)));
  
  if (action === 'full' || action === 'basic' || !action) {
    console.log(chalk.white('  Hostname:    ') + chalk.green(info.hostname));
    console.log(chalk.white('  Platform:    ') + chalk.green(info.platform));
    console.log(chalk.white('  Architecture: ') + chalk.green(info.arch));
    console.log(chalk.white('  Uptime:      ') + chalk.green(info.uptime));
    console.log(chalk.white('  CPU:         ') + chalk.green(info.cpu));
    console.log(chalk.white('  Cores:       ') + chalk.green(info.cpuCores.toString()));
    console.log(chalk.white('  Total RAM:   ') + chalk.green(info.memory));
    console.log(chalk.white('  Free RAM:    ') + chalk.green(info.freeMemory));
  }
  
  if (action === 'full') {
    console.log(chalk.white('  Load Avg:    ') + chalk.green(info.loadAvg));
    
    // Get IP address
    const networkInterfaces = os.networkInterfaces();
    for (const [name, addrs] of Object.entries(networkInterfaces)) {
      for (const addr of addrs) {
        if (addr.family === 'IPv4' && !addr.internal) {
          console.log(chalk.white('  IP Address:  ') + chalk.green(`${addr.address} (${name})`));
          break;
        }
      }
    }
    
    // Get disk usage (Linux)
    if (os.platform() === 'linux') {
      try {
        const { stdout } = await execAsync('df -h / | tail -1');
        const parts = stdout.trim().split(/\s+/);
        if (parts.length >= 4) {
          console.log(chalk.white('  Disk:        ') + chalk.green(`${parts[2]} used / ${parts[1]} total`));
        }
      } catch {
        // Ignore disk errors
      }
    }
  }
  
  console.log(chalk.gray('━'.repeat(40)) + '\n');
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}
