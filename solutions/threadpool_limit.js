const http = require('http');
const crypto = require('crypto');

const port = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/threadpool-limit') {
    const TASKS = 8;
    const start = Date.now();

    const tasks = Array.from({ length: TASKS }, () =>
      new Promise((resolve, reject) => {
        crypto.pbkdf2('secret', 'salt', 100000, 64, 'sha512', (err) => {
          if (err) reject(err);
          else resolve();
        });
      })
    );

    Promise.all(tasks).then(() => {
      const durationMs = Date.now() - start;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ tasks: TASKS, durationMs }));
    }).catch(() => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Task failed' }));
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
