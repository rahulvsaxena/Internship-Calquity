// Write script to delete all json files ending with today's date
import fs from 'fs';
const date = new Date(Date.now());
const formattedDate = date.toISOString().split('T')[0];
const files = fs.readdirSync('./');
files.forEach(file => {
  if (file.endsWith(`-${formattedDate}.json`)) {
    fs.unlinkSync(`./${file}`);
  }
});