import chalk from 'chalk';
import inquirer from 'inquirer';
import db from '../db.js';

export async function shortcutManager(action, alias, command) {
  if (action === 'run' || action === 'r') {
    if (!alias) {
      const shortcuts = db.prepare('SELECT * FROM shortcuts').all();
      if (shortcuts.length === 0) {
        console.log(chalk.yellow('No shortcuts defined'));
        return;
      }
      
      let currentEntries = shortcuts;
      let searching = false;
      
      while (true) {
        const choices = currentEntries.map((s) => ({
          name: `${s.alias.padEnd(15)} → ${s.command}`,
          value: s.alias
        }));
        
        choices.unshift(new inquirer.Separator());
        choices.unshift({ name: '🔍 Search shortcuts', value: '__search__' });
        if (searching) {
          choices.unshift({ name: '❌ Clear search', value: '__clear__' });
        }
        choices.push(new inquirer.Separator());
        choices.push({ name: '❌ Exit', value: '__exit__' });

        const { selected } = await inquirer.prompt([
          {
            type: 'list',
            name: 'selected',
            message: searching ? 'Search results:' : 'Select a shortcut to run:',
            choices,
            pageSize: 15
          }
        ]);
        
        if (selected === '__exit__') return;
        
        if (selected === '__search__') {
          const { query } = await inquirer.prompt([
            { type: 'input', name: 'query', message: 'Enter search term:' }
          ]);
          currentEntries = db.prepare('SELECT * FROM shortcuts WHERE alias LIKE ? OR command LIKE ?').all(`%${query}%`, `%${query}%`);
          searching = true;
          continue;
        }
        
        if (selected === '__clear__') {
          currentEntries = db.prepare('SELECT * FROM shortcuts').all();
          searching = false;
          continue;
        }
        
        // Run selected shortcut
        alias = selected;
        break; // break out of while loop to run it below
      }
    }
  }
  
  switch (action) {
    case 'add':
    case 'a':
      if (!alias || !command) {
        console.log(chalk.red('Usage: tph shortcuts add <alias> <command>'));
        return;
      }
      db.prepare('INSERT OR REPLACE INTO shortcuts (alias, command) VALUES (?, ?)').run(alias, command);
      console.log(chalk.green(`✓ Shortcut added: ${alias} -> ${command}`));
      break;
      
    case 'list':
    case 'ls':
      const shortcuts = db.prepare('SELECT * FROM shortcuts ORDER BY alias ASC').all();
      if (shortcuts.length === 0) {
        console.log(chalk.yellow('No shortcuts defined'));
        return;
      }
      console.log(chalk.cyan('\n⚡ Command Shortcuts:\n'));
      for (const s of shortcuts) {
        console.log(chalk.green(`  ${s.alias.padEnd(15)}`) + chalk.gray('→ ') + chalk.white(s.command));
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
      const res = db.prepare('DELETE FROM shortcuts WHERE alias = ?').run(alias);
      if (res.changes === 0) {
        console.log(chalk.red(`Shortcut "${alias}" not found`));
        return;
      }
      console.log(chalk.green(`✓ Shortcut "${alias}" deleted`));
      break;
      
    case 'run':
    case 'r':
      if (!alias) {
        console.log(chalk.red('Usage: tph shortcuts run <alias>'));
        return;
      }
      const shortcut = db.prepare('SELECT * FROM shortcuts WHERE alias = ?').get(alias);
      if (!shortcut) {
        console.log(chalk.red(`Shortcut "${alias}" not found`));
        return;
      }
      console.log(chalk.cyan(`Running: ${shortcut.command}`));
      const { exec: execCmd } = await import('child_process');
      execCmd(shortcut.command, (error, stdout, stderr) => {
        if (stdout) console.log(chalk.white(stdout));
        if (stderr) console.log(chalk.yellow(stderr));
        if (error) console.log(chalk.red(error.message));
      });
      break;
      
    case 'clear':
      db.prepare('DELETE FROM shortcuts').run();
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
