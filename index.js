const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys")
const P = require("pino")

async function startRanBot() {
    const { state, saveCreds } = await useMultiFileAuthState("auth")
    const { version } = await fetchLatestBaileysVersion()

    const sock = makeWASocket({
        version,
        logger: P({ level: "silent" }),
        auth: state
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
        const { connection, qr } = update

        if (qr) console.log("Escanea el QR en WhatsApp")

        if (connection === "open") {
            console.log("🔥 RanBot conectado correctamente")
        }
    })

    sock.ev.on("messages.upsert", async ({ messages }) => {
        const m = messages[0]
        if (!m.message || m.key.fromMe) return

        const text = m.message.conversation || m.message.extendedTextMessage?.text
        if (!text) return

        if (text.startsWith(".ping")) {
            await sock.sendMessage(m.key.remoteJid, { text: "🏓 Pong! RanBot activo." })
        }
    })
}

startRanBot()
