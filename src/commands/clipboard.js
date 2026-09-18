import chalk from 'chalk';
import clipboard from 'clipboardy';
import db from '../db.js';

export async function clipboardManager(action, text) {
  switch (action) {
    case 'copy':
    case 'c':
      if (!text) {
        console.log(chalk.red('Please provide text to copy'));
        return;
      }
      clipboard.writeSync(text);
      db.prepare('INSERT INTO clipboard (text, timestamp) VALUES (?, ?)').run(text, new Date().toISOString());
      
      // Keep last 50
      const count = db.prepare('SELECT COUNT(*) as count FROM clipboard').get().count;
      if (count > 50) {
        db.prepare('DELETE FROM clipboard WHERE id NOT IN (SELECT id FROM clipboard ORDER BY id DESC LIMIT 50)').run();
      }
      console.log(chalk.green('✓ Copied to clipboard'));
      break;
      
    case 'list':
    case 'ls':
      const history = db.prepare('SELECT * FROM clipboard ORDER BY id DESC LIMIT 10').all();
      if (history.length === 0) {
        console.log(chalk.yellow('No clipboard history'));
        return;
      }
      console.log(chalk.cyan('\nClipboard History:\n'));
      history.forEach((item, i) => {
        const preview = item.text.length > 50 ? item.text.substring(0, 50) + '...' : item.text;
        console.log(chalk.gray(`${i + 1}.`) + ' ' + chalk.white(preview));
        console.log(chalk.gray(`   ${new Date(item.timestamp).toLocaleString()}\n`));
      });
      break;
      
    case 'clear':
      db.prepare('DELETE FROM clipboard').run();
      console.log(chalk.green('✓ Clipboard history cleared'));
      break;
      
    case 'paste':
    case 'p':
      const current = clipboard.readSync();
      console.log(chalk.white(current));
      break;
      
    default:
      console.log(chalk.yellow('Usage: tph clipboard <copy|list|clear|paste> [text]'));
  }
}
