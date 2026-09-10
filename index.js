const http = require("http");
const QRCode = require("qrcode");

const PORT = process.env.PORT || 3000;

let currentQR = null;

const server = http.createServer(async (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });

  if (currentQR) {
    const qrImage = await QRCode.toDataURL(currentQR);

    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>StatusReact Bot</title>
      </head>
      <body style="text-align:center;font-family:Arial;padding:20px">
        <h2>StatusReact Bot</h2>
        <p>Scanne ce QR code avec WhatsApp</p>
        <img src="${qrImage}" style="width:300px;max-width:90%">
        <p>Actualise la page si le QR expire.</p>
      </body>
      </html>
    `);
  } else {
    res.end(`
      <h2 style="text-align:center;font-family:Arial">
        StatusReact Bot<br><br>
        En attente du QR code...
      </h2>
    `);
  }
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
      auth: state
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        currentQR = qr;
        console.log("NOUVEAU QR CODE DISPONIBLE");
      }

      if (connection === "open") {
        currentQR = null;
        console.log("WhatsApp connecté !");
      }

      if (connection === "close") {
        const code = lastDisconnect?.error?.output?.statusCode;
        console.log("Connexion WhatsApp fermée. Code :", code);
      }
    });

  } catch (error) {
    console.error("Erreur Baileys :", error);
  }
});
