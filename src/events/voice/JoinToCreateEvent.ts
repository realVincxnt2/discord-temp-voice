import { MessageEmbed, VoiceChannel, VoiceState } from "discord.js";
import { client } from "../..";
import VoiceConfig from "../../models/VoiceConfig";
import { Event } from "../../structures/Event";

export default new Event(
  "voiceStateUpdate",
  async (oldState: VoiceState, newState: VoiceState) => {
    const { member, guild } = newState;
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    if (
      oldChannel !== newChannel &&
      newChannel &&
      newChannel.id === process.env.joinToCreateChannel
    ) {
      const voiceChannel = await guild.channels.create(`${member.user.tag}`, {
        type: "GUILD_VOICE",
        parent: newChannel.parent,
        permissionOverwrites: [
          { id: member.id, allow: ["CONNECT"] },
          { id: guild.id, deny: ["CONNECT"] },
        ],
      });

      const databaseUser = await VoiceConfig.findOne({ memberId: member.id });
      if (databaseUser === null) {
        const newDbUser = await VoiceConfig.create({
          memberId: member.id,
          getInvites: true,
        });
        await newDbUser.save();
      }

      client.voiceChannels.set(member.id, voiceChannel.id);
      await newChannel.permissionOverwrites.edit(member, { CONNECT: false });
      setTimeout(
        () => newChannel.permissionOverwrites.delete(member),
        30 * 1000
      );

      return setTimeout(() => member.voice.setChannel(voiceChannel), 500);
    }

    const ownedChannel = client.voiceChannels.get(member.id);
    const guildOwnedChannel = <VoiceChannel>(
      guild.channels.cache.get(ownedChannel)
    );

    if (
      ownedChannel &&
      oldChannel.id === ownedChannel &&
      (!newChannel || newChannel.id !== ownedChannel)
    ) {
      if (guildOwnedChannel.members.size === 0) {
        client.voiceChannels.set(member.id, null);
        return oldChannel.delete().catch(() => {});
      }

      const newVoiceOwner = guildOwnedChannel.members.random();

      client.voiceChannels.set(member.id, null);
      client.voiceChannels.set(newVoiceOwner.id, guildOwnedChannel.id);

      await newVoiceOwner.send({
        embeds: [
          new MessageEmbed()
            .setColor("GREEN")
            .setTimestamp()
            .setDescription(
              `You're the new voice channel owner of <#${guildOwnedChannel.id}>`
            ),
        ],
      });
    }
  }
);
