const { MessageEmbed } = require('discord.js');

module.exports.run = async (bot,message,args,config,prefix) => {
  let embed = new MessageEmbed()
    .setColor(config.color)
    .setDescription(`Pinging...`)

  message.channel.send({ embeds: [embed] }).then(m => {
    let ping = (m.createdTimestamp - message.createdTimestamp);
    let APIping = Math.round(bot.ws.ping);

    let embed = new MessageEmbed()
    .setTitle(":ping_pong: Pong!")
    .setColor(config.color)
    .setDescription(`Bot Latency: ${ping}, API Latency: ${APIping}`)
    .setFooter(message.member.displayName + "  •  " + config.footer,  message.author.displayAvatarURL({ dynamic: true }))
    .setTimestamp()
    m.delete();
    message.channel.send({ embeds: [embed] })
    
  })

};

module.exports.help = {
  name: "ping",
  permissions: '',
  cooldown: 2,
  aliases: [],
  usage: 'ping',
  description: 'Show bot ping.'
}
