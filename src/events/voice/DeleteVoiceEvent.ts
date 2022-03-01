import { CategoryChannel, VoiceChannel } from "discord.js";
import { client } from "../..";
import { Event } from "../../structures/Event";

export default new Event("ready", () => {
  try {
    const jtcChannel = <VoiceChannel>(
      client.channels.cache.get(process.env.joinToCreateChannel)
    );
    const jtcCategory = <CategoryChannel>jtcChannel.parent;

    jtcCategory.children
      .filter((c) => c.id !== jtcChannel.id)
      .forEach(async (c) => await c.delete());

    console.log("Deleted all voice channels in the jtc category");
  } catch (err) {
    console.log("Couldn't delete all voice channels in the jtc category");
  }
});
