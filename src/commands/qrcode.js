import chalk from 'chalk';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../data');

export async function qrGenerator(text, outputFile = null) {
  if (!text) {
    console.log(chalk.yellow('Usage: tph qr "text or url" [output-file]'));
    return;
  }

  console.log(chalk.cyan('\n📱 Generating QR Code...\n'));
  
  try {
    // Generate QR code as ASCII art
    const qrAscii = await QRCode.toString(text, {
      type: 'terminal',
      margin: 2,
      width: 20
    });
    
    console.log(qrAscii);
    console.log(chalk.gray(`\nContent: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\n`));
    
    // Optionally save as image
    if (outputFile) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      
      const sanitizedFile = path.basename(outputFile);
      const filePath = path.join(DATA_DIR, sanitizedFile || 'qrcode.png');
      await QRCode.toFile(filePath, text, {
        width: 300,
        margin: 2
      });
      
      console.log(chalk.green(`✓ Saved to: ${filePath}`));
    }
    
    console.log(chalk.gray('Tip: Scan with any QR code reader app\n'));
    
  } catch (error) {
    console.error(chalk.red('Error generating QR code:'), error.message);
  }
}
