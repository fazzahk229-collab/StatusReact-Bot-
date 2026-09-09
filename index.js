const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("StatusReact Bot fonctionne !");
});

server.listen(PORT, async () => {
  console.log(`StatusReact Bot est démarré sur le port ${PORT}`);

  try {
    const {
      default: makeWASocket,
      useMultiFileAuthState,
      DisconnectReason
    } = await import("@whiskeysockets/baileys");

    const { state, saveCreds } = await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
      if (connection === "open") {
        console.log("WhatsApp connecté !");
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        console.log("Connexion WhatsApp fermée. Code :", code);

        if (code !== DisconnectReason.loggedOut) {
          console.log("Le bot pourra tenter une reconnexion.");
        }
      }
    });

  } catch (error) {
    console.error("Erreur Baileys :", error);
  }
});
