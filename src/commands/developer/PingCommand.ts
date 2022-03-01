import { CommandInteraction } from "discord.js";
import { ExtendedClient } from "../../structures/Client";
import { Command } from "../../structures/Command";

export default new Command({
  name: "ping",
  description: "Gets the latency of the bot",
  type: "CHAT_INPUT",
  run: (client: ExtendedClient, interaction: CommandInteraction) => {
    interaction.followUp({ content: `My ping is \`${client.ws.ping}ms\`` });
  },
});
