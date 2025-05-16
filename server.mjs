// server.mjs
import { createServer } from 'node:http';

const server = createServer((req, res) => {
  if (req.url === "/api/greeting") {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: "Hello from Node server!" }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(3000, '0.0.0.0', () => {
  console.log('✅ Server running at http://0.0.0.0:3000');
});
