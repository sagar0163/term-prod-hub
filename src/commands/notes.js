import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadNotes() {
  ensureDataDir();
  if (!fs.existsSync(NOTES_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(NOTES_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveNotes(notes) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

export async function notesManager(action, text) {
  const notes = loadNotes();
  
  switch (action) {
    case 'add':
    case 'a':
      if (!text) {
        console.log(chalk.red('Please provide note text'));
        return;
      }
      notes.unshift({ 
        id: Date.now(), 
        text, 
        created: new Date().toISOString() 
      });
      saveNotes(notes);
      console.log(chalk.green('✓ Note added'));
      break;
      
    case 'list':
    case 'ls':
      if (notes.length === 0) {
        console.log(chalk.yellow('No notes yet'));
        return;
      }
      console.log(chalk.cyan('\n📝 Your Notes:\n'));
      notes.forEach((note, i) => {
        console.log(chalk.gray(`${note.id}: `) + chalk.white(note.text));
        console.log(chalk.gray(`  Created: ${new Date(note.created).toLocaleString()}\n`));
      });
      break;
      
    case 'delete':
    case 'd':
      const idToDelete = parseInt(text);
      const filtered = notes.filter(n => n.id !== idToDelete);
      if (filtered.length === notes.length) {
        console.log(chalk.red('Note not found'));
        return;
      }
      saveNotes(filtered);
      console.log(chalk.green('✓ Note deleted'));
      break;
      
    case 'search':
    case 's':
      if (!text) {
        console.log(chalk.red('Please provide search query'));
        return;
      }
      const results = notes.filter(n => n.text.toLowerCase().includes(text.toLowerCase()));
      if (results.length === 0) {
        console.log(chalk.yellow('No matching notes found'));
        return;
      }
      console.log(chalk.cyan(`\nFound ${results.length} matching notes:\n`));
      results.forEach(note => {
        console.log(chalk.white(note.text));
        console.log(chalk.gray(`  ID: ${note.id}\n`));
      });
      break;
      
    case 'clear':
      saveNotes([]);
      console.log(chalk.green('✓ All notes cleared'));
      break;
      
    default:
      console.log(chalk.yellow('Usage: tph notes <add|list|delete|search|clear> [text|id]'));
  }
}
