import chalk from 'chalk';
import https from 'https';

export async function searchTool(query) {
  if (!query) {
    console.log(chalk.yellow('Usage: tph search "your search query"'));
    return;
  }

  console.log(chalk.cyan(`\n🔍 Searching for: "${query}"\n`));
  
  const results = await performSearch(query);
  
  if (!results || results.length === 0) {
    console.log(chalk.yellow('No results found'));
    return;
  }

  console.log(chalk.gray('━'.repeat(50)));
  
  for (const result of results) {
    console.log(chalk.cyan.bold(result.title));
    console.log(chalk.green(result.url));
    console.log(chalk.white(result.snippet || ''));
    console.log(chalk.gray('━'.repeat(50)) + '\n');
  }
}

function performSearch(query) {
  return new Promise((resolve) => {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.brave.com/res/v1/web/search?q=${encodedQuery}&count=5`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const results = json.results?.map(r => ({
            title: r.title || '',
            url: r.url || '',
            snippet: r.description || ''
          })) || [];
          resolve(results);
        } catch {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}
