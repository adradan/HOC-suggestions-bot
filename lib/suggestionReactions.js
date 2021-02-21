const { adminRoleIds, suggestionsChannelId } = require('../config');

async function handleReactions(reaction, user) {
  if (user.bot) return;
  const emojiName = reaction.emoji.name;
  const message = reaction.message;
  const server = message.guild;
  if (emojiName !== '🗑️' || message.channel.id !== suggestionsChannelId) return;

  await server.members.fetch();
  const guildMember = await server.members.fetch(user.id);
  const memberRoles = guildMember.roles;

  const foundRoles = adminRoleIds.map((roleID) =>
    memberRoles.cache.get(roleID)
  );
  if (foundRoles.length === 0) return;

  await message.delete({ reason: 'Admin role deleted suggestion.' });
}

module.exports = handleReactions;
