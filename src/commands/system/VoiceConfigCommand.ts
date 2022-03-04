import { CommandInteraction, MessageEmbed } from "discord.js";
import VoiceConfig from "../../models/VoiceConfig";
import { ExtendedClient } from "../../structures/Client";
import { Command } from "../../structures/Command";

export default new Command({
  name: "voiceconfig",
  description: "Configure your own voice config",
  options: [
    {
      name: "getinvites",
      type: "SUB_COMMAND",
      description: "Set if you want to get invites",
      options: [
        {
          name: "value",
          type: "STRING",
          required: true,
          description: "Turn on or off",
          choices: [
            { name: "on", value: "on" },
            { name: "off", value: "off" },
          ],
        },
      ],
    },
  ],
  async run(client: ExtendedClient, interaction: CommandInteraction) {
    const { options, member: m, guild } = interaction;
    const member = guild.members.cache.get(m.user.id);

    const subCommand = options.getSubcommand();
    const embed = new MessageEmbed().setColor("GREEN").setFooter({
      text: "Developed by Vincxnt2",
      iconURL: member.user.displayAvatarURL({ dynamic: true }),
    });

    switch (subCommand) {
      case "getinvites":
        {
          const turnChoice = options.getString("value");
          switch (turnChoice) {
            case "on":
              {
                await VoiceConfig.findOneAndUpdate(
                  {
                    memberId: member.id,
                  },
                  { getInvites: true }
                ).catch((err) => {
                  console.log(err);
                  interaction.reply({
                    embeds: [
                      embed
                        .setDescription("Couldn't update the database")
                        .setColor("RED"),
                    ],
                    ephemeral: true,
                  });
                });

                interaction.reply({
                  embeds: [
                    embed.setDescription("Set the `getInvites` value to on"),
                  ],
                  ephemeral: true,
                });
              }
              break;
            case "off":
              {
                await VoiceConfig.findOneAndUpdate(
                  {
                    memberId: member.id,
                  },
                  { getInvites: false }
                ).catch((err) => {
                  console.log(err);
                  interaction.reply({
                    embeds: [
                      embed
                        .setDescription("Couldn't update the database")
                        .setColor("RED"),
                    ],
                    ephemeral: true,
                  });
                });

                interaction.reply({
                  embeds: [
                    embed.setDescription("Set the `getInvites` value to off"),
                  ],
                  ephemeral: true,
                });
              }
              break;
          }
        }
        break;
    }
  },
});
