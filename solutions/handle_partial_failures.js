const http = require('http');
const fs = require('fs');

const port = process.argv[2] || 3000;

function readFile(name) {
  return new Promise((resolve, reject) => {
    fs.readFile(name, 'utf8', (err, data) => {
      if (err) reject(err);
      else resolve(data.trim());
    });
  });
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/error-handling') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      let files;
      try {
        files = JSON.parse(body);
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }

      if (!Array.isArray(files)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Body must be an array' }));
      }

      const results = await Promise.allSettled(files.map(f => readFile(f)));

      const successes = [];
      const failures = [];

      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          successes.push({ file: files[i], content: result.value });
        } else {
          failures.push({ file: files[i], error: result.reason.message });
        }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ successes, failures, total: files.length }));
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
