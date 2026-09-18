#!/usr/bin/env node

import chalk from 'chalk';
import { parseArgs } from 'util';
import { clipboardManager } from './commands/clipboard.js';
import { notesManager } from './commands/notes.js';
import { searchTool } from './commands/search.js';
import { systemInfo } from './commands/system.js';
import { qrGenerator } from './commands/qrcode.js';
import { shortcutManager } from './commands/shortcuts.js';

const commands = {
  clipboard: 'Manage clipboard history',
  notes: 'Quick notes management',
  search: 'Search the web from terminal',
  sys: 'System information',
  qr: 'Generate QR codes',
  shortcuts: 'Manage command shortcuts'
};

async function showHelp() {
  console.log(chalk.cyan.bold('\n📦 Terminal Productivity Hub'));
  console.log(chalk.gray('━'.repeat(40)));
  console.log(chalk.white('\nAvailable commands:\n'));
  
  for (const [cmd, desc] of Object.entries(commands)) {
    console.log(chalk.green(`  tph ${cmd.padEnd(12)}`) + chalk.gray('- ') + desc);
  }
  
  console.log(chalk.white('\nUsage:'));
  console.log(chalk.gray('  tph clipboard list      # List clipboard history'));
  console.log(chalk.gray('  tph notes add "text"     # Add a note'));
  console.log(chalk.gray('  tph search "query"       # Search the web'));
  console.log(chalk.gray('  tph sys                  # Show system info'));
  console.log(chalk.gray('  tph qr "text"            # Generate QR code'));
  console.log(chalk.gray('  tph shortcuts add "cmd" "alias"  # Add shortcut\n'));
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help') {
    await showHelp();
    return;
  }

  const [command, ...rest] = args;
  const subCommand = rest[0];
  const payload = rest.slice(1).join(' ');

  try {
    switch (command) {
      case 'clipboard':
      case 'cb':
        await clipboardManager(subCommand, payload);
        break;
        
      case 'notes':
      case 'n':
        await notesManager(subCommand, payload);
        break;
        
      case 'search':
      case 's':
        await searchTool(payload);
        break;
        
      case 'sys':
        await systemInfo(subCommand);
        break;
        
      case 'qr':
        await qrGenerator(payload);
        break;
        
      case 'shortcuts':
      case 'sh':
        await shortcutManager(subCommand, rest[1], rest.slice(2).join(' '));
        break;
        
      default:
        console.log(chalk.red(`Unknown command: ${command}`));
        console.log(chalk.yellow('Run "tph" to see available commands'));
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

main();
