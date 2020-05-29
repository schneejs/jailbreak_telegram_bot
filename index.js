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
// Main bot instance
const bot = new TelegramBot(token, { webHook: { port: process.env.PORT } });
const url = `https://jailbreak-telegram-bot.herokuapp.com:443`;
bot.setWebHook(`${url}/bot${token}`);
// IOS version mentioned
bot.onText(/(1\d\.\d(\.\d)?)/, async (msg, match) => {
    const t = msg.text;
    const triggerWords = [
        "jailbreak",
        "jail break",
        "jb",
        "phone",
    ]
    let has_any_of_these_strings = false;
    triggerWords.forEach(trig => {
        if (t.toLowerCase().includes(trig))
            has_any_of_these_strings = true;
    })
    if (!has_any_of_these_strings)
        return;
    const chatId = msg.chat.id;
    const msgId = msg.message_id;
    const full = match[0];
    const examinateVersion = full => {
        for (const version of versup) {
            if (full >= version.from && full <= version.to) {
                switch (version.state) {
                case "full":
                    return `Yes, your IOS version ${full} is fully supported! You can use both checkra.in (iPhone X and lower) and unc0ver.dev.`
                case "a11":
                    return `Your IOS version ${full} is supported on iPhone X and lower. XR and 11 aren't supported. You can use checkra.in.`;
                }
            }
        }
        return `Unfortunately, your IOS version ${full} is not supported.`;
    }
    const resultText =
        examinateVersion(full)
        + " Other sites can be fake!";

    await bot.sendMessage(chatId, resultText, { reply_to_message_id: msgId });
    /* const message = */ 
    // const deleteMessage = () => bot.deleteMessage(message.chat.id, message.message_id);
    // setTimeout(deleteMessage, 3600000);
});
// Error handler
bot.on("error", err => {
    error("Error: ", err);
})