import chalk from 'chalk';
import inquirer from 'inquirer';
import db from '../db.js';

export async function notesManager(action, text) {
  if (!action) {
    let notes = db.prepare('SELECT * FROM notes ORDER BY created DESC').all();
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
        currentNotes = db.prepare('SELECT * FROM notes WHERE text LIKE ? ORDER BY created DESC').all(`%${query}%`);
        searching = true;
        continue;
      }
      
      if (selected === '__clear__') {
        currentNotes = db.prepare('SELECT * FROM notes ORDER BY created DESC').all();
        searching = false;
        continue;
      }
      
      // Selected a note
      const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(selected);
      if (!note) continue;
      
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
        db.prepare('DELETE FROM notes WHERE id = ?').run(selected);
        console.log(chalk.green('✓ Note deleted'));
        // Update current lists
        if (searching) {
          currentNotes = currentNotes.filter(n => n.id !== selected);
        } else {
          currentNotes = db.prepare('SELECT * FROM notes ORDER BY created DESC').all();
        }
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
      db.prepare('INSERT INTO notes (id, text, created) VALUES (?, ?, ?)').run(Date.now(), text, new Date().toISOString());
      console.log(chalk.green('✓ Note added'));
      break;
      
    case 'list':
    case 'ls':
      const notes = db.prepare('SELECT * FROM notes ORDER BY created DESC').all();
      if (notes.length === 0) {
        console.log(chalk.yellow('No notes yet'));
        return;
      }
      console.log(chalk.cyan('\n📝 Your Notes:\n'));
      notes.forEach((note) => {
        console.log(chalk.gray(`${note.id}: `) + chalk.white(note.text));
        console.log(chalk.gray(`  Created: ${new Date(note.created).toLocaleString()}\n`));
      });
      break;
      
    case 'delete':
    case 'd':
      const idToDelete = parseInt(text);
      const res = db.prepare('DELETE FROM notes WHERE id = ?').run(idToDelete);
      if (res.changes === 0) {
        console.log(chalk.red('Note not found'));
        return;
      }
      console.log(chalk.green('✓ Note deleted'));
      break;
      
    case 'search':
    case 's':
      if (!text) {
        console.log(chalk.red('Please provide search query'));
        return;
      }
      const results = db.prepare('SELECT * FROM notes WHERE text LIKE ? ORDER BY created DESC').all(`%${text}%`);
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
      db.prepare('DELETE FROM notes').run();
      console.log(chalk.green('✓ All notes cleared'));
      break;
      
    default:
      console.log(chalk.yellow('Usage: tph notes <add|list|delete|search|clear> [text|id]'));
  }
}
