const TelegramBot = require("node-telegram-bot-api");
// Version support database
const tools = require("./tools");
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
    // TODO: smarter triggering
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
    const version = match[0];

    const toolsFiltered = tools.filter(tool => {
        for (const versionRange of tool.versions) {
            if ((versionRange.from || '') <= version && version <= (versionRange.to || '99.99.99'))
                return true
        }
        return false
    });
    const toolsFormatted = toolsFiltered.map(tool =>
        `- [${tool.name}](${tool.website})${tool.note ? ' - ' + tool.note : ''}`
    );

    const resultText = ''
        + (toolsFiltered.length > 0
            ? `There ${toolsFiltered.length === 1 ? 'is' : 'are'} ${toolsFiltered.length} jailbreak tool${toolsFiltered.length === 1 ? '' : 's'} suggested for IOS ${version}:`
            : `Unfortunately, your IOS version ${version} is not supported. Please stay tuned with us for future updates!`)
        + '\n'
        + toolsFormatted.reduce((accumulator, toolFormatted) => accumulator + '\n' + toolFormatted)

    await bot.sendMessage(chatId, resultText, {
        reply_to_message_id: msgId,
        disable_web_page_preview: true,
        parse_mode: 'Markdown'
    });
});
// Error handler
bot.on("error", err => {
    error("Error: ", err);
})