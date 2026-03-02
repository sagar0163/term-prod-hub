import chalk from 'chalk';
import clipboard from 'clipboardy';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const CLIPBOARD_FILE = path.join(DATA_DIR, 'clipboard.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadHistory() {
  ensureDataDir();
  if (!fs.existsSync(CLIPBOARD_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(CLIPBOARD_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveHistory(history) {
  fs.writeFileSync(CLIPBOARD_FILE, JSON.stringify(history, null, 2));
}

export async function clipboardManager(action, text) {
  const history = loadHistory();
  
  switch (action) {
    case 'copy':
    case 'c':
      if (!text) {
        console.log(chalk.red('Please provide text to copy'));
        return;
      }
      clipboard.writeSync(text);
      history.unshift({ text, timestamp: new Date().toISOString() });
      saveHistory(history.slice(0, 50)); // Keep last 50
      console.log(chalk.green('✓ Copied to clipboard'));
      break;
      
    case 'list':
    case 'ls':
      if (history.length === 0) {
        console.log(chalk.yellow('No clipboard history'));
        return;
      }
      console.log(chalk.cyan('\nClipboard History:\n'));
      history.slice(0, 10).forEach((item, i) => {
        const preview = item.text.length > 50 ? item.text.substring(0, 50) + '...' : item.text;
        console.log(chalk.gray(`${i + 1}.`) + ' ' + chalk.white(preview));
        console.log(chalk.gray(`   ${new Date(item.timestamp).toLocaleString()}\n`));
      });
      break;
      
    case 'clear':
      saveHistory([]);
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
