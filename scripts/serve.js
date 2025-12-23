const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'www');
const port = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function safePath(requestUrl) {
  const cleanPath = decodeURIComponent(requestUrl.split('?')[0].split('#')[0]);
  const target = path.normalize(path.join(root, cleanPath));
  if (!target.startsWith(root)) {
    return null;
  }
  return target;
}

const server = http.createServer((req, res) => {
  const requested = safePath(req.url || '/');
  if (!requested) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  let filePath = requested;
  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (readErr, data) => {
      if (readErr) {
        res.writeHead(readErr.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain' });
        res.end(readErr.code === 'ENOENT' ? 'Not found' : 'Server error');
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      const type = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': type,
        'Cache-Control': 'no-cache'
      });
      res.end(data);
    });
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving \"www\" at http://localhost:${port}`);
});
