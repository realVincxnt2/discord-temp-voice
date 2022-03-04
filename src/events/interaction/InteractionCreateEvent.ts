import { CommandInteraction } from "discord.js";
import { client } from "../..";
import { Event } from "../../structures/Event";

export default new Event("interactionCreate", async (interaction) => {
  try {
    if (interaction.isCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      const args = [];

      for (let option of interaction.options.data) {
        if (option.type === "SUB_COMMAND") {
          if (option.name) args.push(option.name);
          option.options?.forEach((x) => {
            if (x.value) args.push(x.value);
          });
        } else if (option.value) args.push(option.value);
      }

      command.run(client, interaction as CommandInteraction);
    }

    if (interaction.isContextMenu()) {
      const command = client.commands.get(interaction.commandName);
      if (command) command.run(client, interaction as CommandInteraction);
    }
  } catch (err) {
    console.log(err);
  }
});
