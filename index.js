const Discord = require("discord.js")
const intents = new Discord.IntentsBitField(3276799)
const bot = new Discord.Client({intents})
const commands = require('./Handlers/Commands')
const events = require('./Handlers/Events')
bot.commands = new Discord.Collection()




const fs = require('fs');
const path = require('path');
const { Client, Collection } = require('discord.js-selfbot-v13');
const config = require("./config.json")

const clients = [];
const users = config.user || {};

function saveconfig() {
  fs.writeFile("./config.json", JSON.stringify(config, null, 2), err => err ? console.log(err) : "");
}


for (const [userId, userData] of Object.entries(users)) {
  const token = userData.token;
  
  if (typeof token === 'string' && token.trim() !== '') {
    let user = new Client({ checkUpdate: false, autoRedeemNitro: false, ws: { properties: { os: 'Linux', browser: 'Discord Client', release_channel: 'stable', client_version: '1.0.9011', os_version: '10.0.22621', os_arch: 'x64', system_locale: 'en-US', client_build_number: 175517, native_build_number: 29584, client_event_source: null, design_id: 0, } } });
    user.login(token).catch(() => saveconfig());
    clients.push(user);
  }
}

clients.forEach((client) => {
  client.snipe = new Map()
  client.commands = new Collection();

  fs.readdirSync("./commands/").forEach(dirs => {
    const commands = fs.readdirSync(`./commands/${dirs}/`).filter(files => files.endsWith(".js"));

    for (const file of commands) {
      const commandname = require(`./commands/${dirs}/${file}`);
      client.commands.set(commandname.name, commandname);
      console.log(`> commande charger avec succès ${commandname.name} ${dirs}`);
    }
  });

  fs.readdirSync("./events/").forEach(dirs => {
    const eventFolders = fs.readdirSync(`./events/${dirs}/`).filter(files => files.endsWith(".js"));

    for (const event of eventFolders) {
      const eventname = require(`./events/${dirs}/${event}`);
      if (eventname.once) {
        client.once(eventname.name, (...args) => eventname.run(...args, client));
        console.log(`> event charger avec succès ${eventname.name}`);
      } else {
        client.on(eventname.name, (...args) => eventname.run(...args, client));
        console.log(`> event charger avec succès ${eventname.name}`);
      }
    }
  });
});

bot.login(config.manager)
commands(bot)
events(bot)
process.on('unhandledRejection', (reason, promise) => {
  console.log('----- Unhandled Rejection at -----');
  console.log(promise);
  console.log('----- Reason -----');
  console.log(reason);
});