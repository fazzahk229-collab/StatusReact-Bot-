const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("StatusReact Bot fonctionne !");
});

server.listen(PORT, () => {
  console.log(`StatusReact Bot est démarré sur le port ${PORT}`);
});
