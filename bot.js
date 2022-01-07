// BASE //
const { Client, Collection, MessageEmbed, Intents } = require('discord.js');
const Discord = require('discord.js');
const bot = new Client({ intents: ["DIRECT_MESSAGES", "DIRECT_MESSAGE_REACTIONS", "DIRECT_MESSAGE_TYPING", "GUILDS", "GUILD_BANS", "GUILD_EMOJIS_AND_STICKERS", "GUILD_INTEGRATIONS", "GUILD_INVITES", "GUILD_MEMBERS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGE_TYPING", "GUILD_PRESENCES", "GUILD_VOICE_STATES", "GUILD_WEBHOOKS"], partials: ['MESSAGE', 'CHANNEL', 'REACTION']});
const config = require('./config.json');
const { joinVoiceChannel, createAudioPlayer, NoSubscriberBehavior, createAudioResource } = require('@discordjs/voice');
// BASE //

// LIBRARY //
const fs = require('fs');
// LIBRARY //

// CORE //
function timeConverter(timestamp){
  var a = new Date(timestamp);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getUTCFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}
// CORE //

// INFO-START //
var now = new Date();
var hour = now.getHours();
var minute = now.getMinutes();
var second = now.getSeconds();
var times = (`[${hour}:${minute}:${second}]/`);

bot.once('ready', () => {
	console.log(times + `\x1b[35m%s\x1b[0m`, '[API-INFO]', '\x1b[0m', 'Connecting...');
  console.log(times + `\x1b[35m%s\x1b[0m`, '[API-INFO]', '\x1b[0m', 'Connecting to Discord.js API...');
  console.log(times + `\x1b[32m%s\x1b[0m`, '[OK]', '\x1b[0m', 'Connetion to Discord.js API completed');
  console.log(times + `\x1b[32m%s\x1b[0m`, '[OK]', '\x1b[0m', 'Loading completed');
  console.log(times + `\x1b[32m%s\x1b[0m`, '[OK]', '\x1b[0m', 'Ready and connected');
  console.log(times + `\x1b[36m%s\x1b[0m`, '[INFO]', '\x1b[0m', `Ready to work!`);
  console.log("===========================================");

  /*ACTIVITY*/
  bot.user.setPresence({ activities: [{ name: config.activity }] });
  /*ACTIVITY*/
});
// INFO-START //

// COMMANDES //
bot.commands = new Discord.Collection();
bot.cooldowns = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
  console.log("===========================================");
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
    console.log(times + `\x1b[36m%s\x1b[0m`, '[INFO]', '\x1b[0m', `${file} loaded!`);
		bot.commands.set(command.help.name, command);
	}
}

const { cooldowns } = bot;
bot.on("messageCreate", async (message) => {
    if(message.channel.type == "DM") return;
    if(message.author.bot) return;
    let prefix = config.prefix;

    if(message.content.indexOf(prefix) !== 0) return;
  
    /*SET COMMAND ARGS, MESSAGE, PREFIX, ETC..*/
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);
    let commandfile = bot.commands.get(cmd.slice(prefix.length)) || bot.commands.find(cmd2 => cmd2.help.aliases && cmd2.help.aliases.includes(cmd.slice(prefix.length)));
    /*SET COMMAND ARGS, MESSAGE, PREFIX, ETC..*/

    if(!commandfile) return

    /*PERMISSIONS*/
    if (commandfile.help.permissions) {
      const authorPerms = message.channel.permissionsFor(message.author);
      if (!authorPerms || !authorPerms.has(commandfile.help.permissions)) {
        return message.reply("You do not have the necessary permissions to execute this command!");
      }
    }
    /*PERMISSIONS*/

    /*COOLDOWNS*/
    if (!cooldowns.has(commandfile.help.name)) {
      cooldowns.set(commandfile.help.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(commandfile.help.name);
    const cooldownAmount = (commandfile.help.cooldown || 2) * 1000;
    if (timestamps.has(message.author.id)) {
      const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

      if (now < expirationTime) {
        const timeLeft = (expirationTime - now) / 1000;
        return message.reply(`Please wait **${timeLeft.toFixed(1)} second(s)** before reusing the \`${commandfile.help.name}\` command.`);
        
      }
    }
    /*COOLDOWNS*/

    /*RUN COMMAND*/
    try {
      commandfile.run(bot,message,args,config,prefix);

      /*COOLDOWNS*/
      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
      /*COOLDOWNS*/
    } catch {}
    /*RUN COMMAND*/

});
// COMMANDES //


bot.login(config.token);