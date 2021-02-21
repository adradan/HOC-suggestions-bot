const { suggestionsChannelId } = require('../../config');

function createID() {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 7; i++) {
    id += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return id;
}

function createEmbed(message, suggestion) {
  return {
    color: 0x7ad0f5,
    thumbnail: {
      url: message.author.avatarURL(),
    },
    fields: [
      {
        name: 'Suggested By',
        value: message.author.tag,
      },
      {
        name: 'Suggestion',
        value: `\`${suggestion}\``,
      },
    ],
    footer: {
      text: `User ID: ${message.author.id}`,
    },
  };
}

async function sendSuggest(message, options) {
  const { args, client } = options;
  const suggestion = args.join(' ');

  if (suggestion.length > 1024) {
    message.channel.send('Suggestions are limited to 1024 characters.');
    return;
  }

  const suggestionsChannel = client.channels.cache.get(suggestionsChannelId);
  suggestionsChannel
    .send({ embed: createEmbed(message, suggestion) })
    .then((embedMessage) => {
      embedMessage.react('✅');
      embedMessage.react('❎');
      embedMessage.react('🗑️');
    });
}

module.exports = {
  name: 'suggest',
  description: 'Suggest a server idea',
  execute: sendSuggest,
};
