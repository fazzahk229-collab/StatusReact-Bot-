const http = require("http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("StatusReact Bot fonctionne !");
});

server.listen(PORT, async () => {
  console.log(`StatusReact Bot est démarré sur le port ${PORT}`);

  try {
    const {
      default: makeWASocket,
      useMultiFileAuthState
    } = await import("@whiskeysockets/baileys");

    const { state, saveCreds } =
      await useMultiFileAuthState("auth_info");

    const sock = makeWASocket({
      auth: state,
      browser: ["Ubuntu", "Chrome", "22.04.4"]
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect }) => {
      if (connection === "open") {
        console.log("WhatsApp connecté !");
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        console.log("Connexion WhatsApp fermée. Code :", code);
      }
    });

    if (!state.creds.registered) {
      const phoneNumber = process.env.WA_PHONE_NUMBER;

      if (!phoneNumber) {
        console.log("WA_PHONE_NUMBER n'est pas configuré.");
        return;
      }

      const cleanNumber = phoneNumber.replace(/\D/g, "");

      console.log("Demande du code d'association...");
      const code = await sock.requestPairingCode(cleanNumber);

      console.log("================================");
      console.log("CODE D'ASSOCIATION :", code);
      console.log("================================");
    }

  } catch (error) {
    console.error("Erreur Baileys :", error);
  }
});
