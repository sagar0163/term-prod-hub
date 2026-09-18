#!/usr/bin/env node

import chalk from 'chalk';
import { parseArgs } from 'util';

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
      case 'cb': {
        const { clipboardManager } = await import('./commands/clipboard.js');
        await clipboardManager(subCommand, payload);
        break;
      }
        
      case 'notes':
      case 'n': {
        const { notesManager } = await import('./commands/notes.js');
        await notesManager(subCommand, payload);
        break;
      }
        
      case 'search':
      case 's': {
        const { searchTool } = await import('./commands/search.js');
        await searchTool(payload);
        break;
      }
        
      case 'sys': {
        const { systemInfo } = await import('./commands/system.js');
        await systemInfo(subCommand);
        break;
      }
        
      case 'qr': {
        const { qrGenerator } = await import('./commands/qrcode.js');
        await qrGenerator(payload);
        break;
      }
        
      case 'shortcuts':
      case 'sh': {
        const { shortcutManager } = await import('./commands/shortcuts.js');
        await shortcutManager(subCommand, rest[1], rest.slice(2).join(' '));
        break;
      }
        
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
