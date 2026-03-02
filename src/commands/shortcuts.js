import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const SHORTCUTS_FILE = path.join(DATA_DIR, 'shortcuts.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadShortcuts() {
  ensureDataDir();
  if (!fs.existsSync(SHORTCUTS_FILE)) {
    return {};
  }
  try {
    return JSON.parse(fs.readFileSync(SHORTCUTS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveShortcuts(shortcuts) {
  fs.writeFileSync(SHORTCUTS_FILE, JSON.stringify(shortcuts, null, 2));
}

export async function shortcutManager(action, alias, command) {
  const shortcuts = loadShortcuts();
  
  switch (action) {
    case 'add':
    case 'a':
      if (!alias || !command) {
        console.log(chalk.red('Usage: tph shortcuts add <alias> <command>'));
        return;
      }
      shortcuts[alias] = command;
      saveShortcuts(shortcuts);
      console.log(chalk.green(`✓ Shortcut added: ${alias} -> ${command}`));
      break;
      
    case 'list':
    case 'ls':
      const entries = Object.entries(shortcuts);
      if (entries.length === 0) {
        console.log(chalk.yellow('No shortcuts defined'));
        return;
      }
      console.log(chalk.cyan('\n⚡ Command Shortcuts:\n'));
      for (const [alias, cmd] of entries) {
        console.log(chalk.green(`  ${alias.padEnd(15)}`) + chalk.gray('→ ') + chalk.white(cmd));
      }
      console.log('');
      break;
      
    case 'delete':
    case 'd':
    case 'remove':
    case 'rm':
      if (!alias) {
        console.log(chalk.red('Usage: tph shortcuts delete <alias>'));
        return;
      }
      if (!shortcuts[alias]) {
        console.log(chalk.red(`Shortcut "${alias}" not found`));
        return;
      }
      delete shortcuts[alias];
      saveShortcuts(shortcuts);
      console.log(chalk.green(`✓ Shortcut "${alias}" deleted`));
      break;
      
    case 'run':
    case 'r':
      if (!alias) {
        console.log(chalk.red('Usage: tph shortcuts run <alias>'));
        return;
      }
      if (!shortcuts[alias]) {
        console.log(chalk.red(`Shortcut "${alias}" not found`));
        return;
      }
      console.log(chalk.cyan(`Running: ${shortcuts[alias]}`));
      const { exec: execCmd } = await import('child_process');
      execCmd(shortcuts[alias], (error, stdout, stderr) => {
        if (stdout) console.log(chalk.white(stdout));
        if (stderr) console.log(chalk.yellow(stderr));
        if (error) console.log(chalk.red(error.message));
      });
      break;
      
    case 'clear':
      saveShortcuts({});
      console.log(chalk.green('✓ All shortcuts cleared'));
      break;
      
    default:
      console.log(chalk.yellow('Usage: tph shortcuts <add|list|delete|run|clear> [alias] [command]'));
      console.log(chalk.gray('\nExamples:'));
      console.log(chalk.gray('  tph shortcuts add g git'));
      console.log(chalk.gray('  tph shortcuts add ll "ls -lah"'));
      console.log(chalk.gray('  tph shortcuts list'));
      console.log(chalk.gray('  tph shortcuts run g'));
  }
}
