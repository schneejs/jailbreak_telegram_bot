const TelegramBot = require("node-telegram-bot-api");
// Version support database
const versup = require("./version_support");
// Simple logging
const info = (...msgs) => msgs.forEach(msg => console.log(msg));
const error = (...msgs) => msgs.forEach(msg => console.error(msg));
// Main configuration variables
try {
    require("dotenv").config();
    info("Dotenv loaded");
} catch (_) {
    info("Dotenv not found, avoiding");
}
if (!("TOKEN" in process.env)) {
    error("Telegram token not found!");
    process.exit(1);
}
const token = process.env.TOKEN;
const port = process.env.PORT || 3000;
// Main bot instance
const bot = new TelegramBot(token, { webHook: { port: port } });
const url = `https://jailbreak-telegram-bot.herokuapp.com:${port}`;
bot.setWebHook(`${url}/bot${token}`);
// IOS version mentioned
bot.onText(/(1\d\.\d\.?\d?)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const full = match[0];
    const examinateVersion = full => {
        for (const version of versup) {
            if (full >= version.from && full <= version.to) {
                switch (version.state) {
                case "full":
                    return `Yes, your IOS version ${full} is fully supported!`
                case "a11":
                    return `Your IOS version ${full} is supported on iPhone X and lower. XR and 11 aren't supported.`;
                }
            }
        }
        return "Unfortunately, your IOS version is not supported.";
    }
    const resultText =
        examinateVersion(full)
        + " Trusted jailbreaks today are checkra.in and unc0ver.dev, other sites can be fake!";
    const message = await bot.sendMessage(chatId, resultText);
    const deleteMessage = () => bot.deleteMessage(message.chat.id, message.message_id);
    setTimeout(deleteMessage, 120000);
});
// Error handler
bot.on("error", err => {
    error("Error: ", err);
})