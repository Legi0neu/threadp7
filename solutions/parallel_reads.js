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

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url === '/parallel') {
    const start = Date.now();
    try {
      const [a, b, c] = await Promise.all([
        readFile('a.txt'),
        readFile('b.txt'),
        readFile('c.txt'),
      ]);
      const elapsedMs = Date.now() - start;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ combined: a + b + c, elapsedMs }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port);
