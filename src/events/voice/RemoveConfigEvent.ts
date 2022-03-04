import { GuildMember } from "discord.js";
import VoiceConfig from "../../models/VoiceConfig";
import { Event } from "../../structures/Event";

export default new Event("guildMemberRemove", async (member: GuildMember) => {
  VoiceConfig.findOneAndDelete({
    memberId: member.id,
  }).catch((err) => console.log(err));
});
