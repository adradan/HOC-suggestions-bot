const process = require('process');
const TOKEN = process.env.suggestions_bot;
const Discord = require('discord.js');
const { suggest } = require('./lib/commands');
const { handleReactions } = require('./lib');
const { commandChannelId, suggestionsChannelId } = require('./config');

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.commands.set(suggest.name, suggest);

client.on('message', (message) => {
  try {
    if (
      !message.content.startsWith('-') ||
      message.author.bot ||
      message.channel.id !== commandChannelId
    )
      return;

    const args = message.content.slice('-'.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    console.log(args);

    try {
      client.commands
        .get(command)
        .execute(message, { args: args, client: client });
    } catch (err) {
      message.channel.send('No Command');
    }
  } catch (err) {
    console.log(err);
  }
});

// Raw listener in order to listen to Old Messages as well, in case bot ever goes down
client.on('raw', async (packet) => {
  try {
    if (!['MESSAGE_REACTION_ADD'].includes(packet.t)) return;
    if (packet.d.channel_id !== suggestionsChannelId) return;

    const channel = await client.channels.fetch(packet.d.channel_id);
    // If already cached, normal event listener will notice it.
    if (await channel.messages.cache.get(packet.d.message_id)) return;
    console.log('not cached');
    const message = await channel.messages.fetch(packet.d.message_id);
    const emoji = packet.d.emoji.id
      ? `${packet.d.emoji.name}:${packet.d.emoji.id}`
      : packet.d.emoji.name;
    // This gives us the reaction we need to emit the event properly, in top of the message object
    const reaction = message.reactions.resolve(emoji);
    // Check which type of event it is before emitting
    if (packet.t === 'MESSAGE_REACTION_ADD') {
      client.emit(
        'messageReactionAdd',
        reaction,
        await client.users.fetch(packet.d.user_id)
      );
    }
  } catch (err) {
    console.log(err);
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  try {
    handleReactions(reaction, user);
  } catch (err) {
    console.log(err);
  }
});

client.once('ready', () => {
  console.log('Logged in.');
});

client.login(TOKEN);
