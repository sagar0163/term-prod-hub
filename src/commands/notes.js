import chalk from 'chalk';
import inquirer from 'inquirer';
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
  
  if (!action) {
    if (notes.length === 0) {
      console.log(chalk.yellow('No notes yet'));
      return;
    }
    
    // Interactive menu
    let currentNotes = notes;
    let searching = false;
    
    while (true) {
      const choices = currentNotes.map(n => ({
        name: `${n.text.length > 50 ? n.text.substring(0, 50) + '...' : n.text} (${new Date(n.created).toLocaleDateString()})`,
        value: n.id
      }));
      
      choices.unshift(new inquirer.Separator());
      choices.unshift({ name: '🔍 Search notes', value: '__search__' });
      if (searching) {
        choices.unshift({ name: '❌ Clear search', value: '__clear__' });
      }
      choices.push(new inquirer.Separator());
      choices.push({ name: '❌ Exit', value: '__exit__' });

      const { selected } = await inquirer.prompt([
        {
          type: 'list',
          name: 'selected',
          message: searching ? 'Search results:' : 'Select a note:',
          choices,
          pageSize: 15
        }
      ]);
      
      if (selected === '__exit__') return;
      
      if (selected === '__search__') {
        const { query } = await inquirer.prompt([
          { type: 'input', name: 'query', message: 'Enter search term:' }
        ]);
        currentNotes = notes.filter(n => n.text.toLowerCase().includes(query.toLowerCase()));
        searching = true;
        continue;
      }
      
      if (selected === '__clear__') {
        currentNotes = notes;
        searching = false;
        continue;
      }
      
      // Selected a note
      const note = notes.find(n => n.id === selected);
      const { noteAction } = await inquirer.prompt([
        {
          type: 'list',
          name: 'noteAction',
          message: 'Action:',
          choices: ['View', 'Delete', 'Back']
        }
      ]);
      
      if (noteAction === 'View') {
        console.log(chalk.cyan('\n📝 Note Details:'));
        console.log(chalk.gray(`ID: ${note.id}`));
        console.log(chalk.gray(`Created: ${new Date(note.created).toLocaleString()}`));
        console.log(chalk.white(`\n${note.text}\n`));
        
        await inquirer.prompt([{ type: 'input', name: 'continue', message: 'Press Enter to continue...' }]);
      } else if (noteAction === 'Delete') {
        const filtered = notes.filter(n => n.id !== selected);
        saveNotes(filtered);
        console.log(chalk.green('✓ Note deleted'));
        // Update current lists
        const idx = notes.findIndex(n => n.id === selected);
        if (idx !== -1) notes.splice(idx, 1);
        const currIdx = currentNotes.findIndex(n => n.id === selected);
        if (currIdx !== -1) currentNotes.splice(currIdx, 1);
      }
    }
    return;
  }
  
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
