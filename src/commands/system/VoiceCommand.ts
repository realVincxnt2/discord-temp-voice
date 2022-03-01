import { CommandInteraction, GuildMember, MessageEmbed } from "discord.js";
import VoiceConfig from "../../models/VoiceConfig";
import { ExtendedClient } from "../../structures/Client";
import { Command } from "../../structures/Command";

export default new Command({
  name: "voice",
  description: "Configure your own voice channel",
  options: [
    {
      name: "invite",
      type: "SUB_COMMAND",
      description: "Invite a friend to your voice channel",
      options: [
        {
          name: "member",
          type: "USER",
          required: true,
          description: "Select the member",
        },
      ],
    },
    {
      name: "kick",
      type: "SUB_COMMAND",
      description: "Kick someone from the voice channel",
      options: [
        {
          name: "member",
          type: "USER",
          required: true,
          description: "Select the member",
        },
      ],
    },
    {
      name: "name",
      type: "SUB_COMMAND",
      description: "Change the name of your voice channel",
      options: [
        {
          name: "text",
          type: "STRING",
          required: true,
          description: "Provide the name",
        },
      ],
    },
    {
      name: "public",
      type: "SUB_COMMAND",
      description: "Make your voice channel public to everyone",
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
    {
      name: "limit",
      type: "SUB_COMMAND",
      description: "Set the member limit of the voice channel",
      options: [
        {
          name: "size",
          type: "NUMBER",
          required: true,
          description: "Limit Size",
        },
      ],
    },
  ],

  async run(client: ExtendedClient, interaction: CommandInteraction) {
    const { options, member: m, guild } = interaction;
    const member = guild.members.cache.get(m.user.id);

    const subCommand = options.getSubcommand();
    const voiceChannel = member.voice.channel;
    const embed = new MessageEmbed().setColor("GREEN").setFooter({
      text: "Developed by Vincxnt2",
      iconURL: member.user.displayAvatarURL({ dynamic: true }),
    });
    const ownedChannel = client.voiceChannels.get(member.id);

    if (!voiceChannel)
      return interaction.reply({
        embeds: [
          embed
            .setDescription("You are not in a voice channel")
            .setColor("RED"),
        ],
        ephemeral: true,
      });

    if (!ownedChannel || voiceChannel.id !== ownedChannel)
      return interaction.reply({
        embeds: [
          embed
            .setDescription(
              "You do not own this channel or its not a valid voice channel"
            )
            .setColor("RED"),
        ],
        ephemeral: true,
      });

    switch (subCommand) {
      case "name":
        {
          const name = options.getString("text");
          if (name.length > 22 || name.length < 1)
            return interaction.reply({
              embeds: [
                embed
                  .setDescription("Name cannot exceed the 22 character limit")
                  .setColor("RED"),
              ],
              ephemeral: true,
            });

          voiceChannel.edit({ name });
          await interaction.reply({
            embeds: [
              embed.setDescription(
                `Voicechannel name has been set to \`${name}\``
              ),
            ],
            ephemeral: true,
          });
        }
        break;
      case "invite":
        {
          const targetMember = <GuildMember>options.getMember("member");
          voiceChannel.permissionOverwrites.edit(targetMember, {
            CONNECT: true,
          });

          if (targetMember.id === member.id)
            return interaction.reply({
              embeds: [
                embed
                  .setColor("RED")
                  .setDescription(`You can't invite yourself`),
              ],
              ephemeral: true,
            });

          const databaseUser = await VoiceConfig.findOne({
            memberId: targetMember.id,
          });

          if (databaseUser && databaseUser.getInvites === false)
            return interaction.reply({
              embeds: [
                embed
                  .setDescription(`${targetMember} don't want to be invited`)
                  .setColor("RED"),
              ],
              ephemeral: true,
            });

          await targetMember
            .send({
              embeds: [
                embed.setDescription(
                  `${member} has invited you to join <#${voiceChannel.id}>`
                ),
              ],
            })
            .catch(() =>
              interaction.reply({
                embeds: [
                  embed
                    .setDescription(`Couldn't sent invite to ${targetMember}`)
                    .setColor("RED"),
                ],
                ephemeral: true,
              })
            );

          interaction.reply({
            embeds: [
              embed.setDescription(
                `\`${targetMember.user.tag}\` has been invited to join the voice channel`
              ),
            ],
            ephemeral: true,
          });
        }
        break;
      case "kick":
        {
          const targetMember = <GuildMember>options.getMember("member");
          voiceChannel.permissionOverwrites.edit(targetMember, {
            CONNECT: false,
          });

          if (targetMember.id === member.id)
            return interaction.reply({
              embeds: [
                embed.setColor("RED").setDescription(`You can't kick yourself`),
              ],
              ephemeral: true,
            });

          if (
            !targetMember.voice.channel ||
            targetMember.voice.channel.id !== voiceChannel.id
          )
            return interaction.reply({
              embeds: [
                embed
                  .setDescription(
                    `${targetMember} is not in your voice channel`
                  )
                  .setColor("RED"),
              ],
            });

          targetMember.voice.setChannel(null);
          interaction.reply({
            embeds: [
              embed
                .setDescription(
                  `${targetMember} has been kicked from your voice channel`
                )
                .setColor("RED"),
            ],
            ephemeral: true,
          });
        }
        break;
      case "public":
        {
          const turnChoice = options.getString("value");
          switch (turnChoice) {
            case "on":
              {
                voiceChannel.permissionOverwrites.edit(guild.id, {
                  CONNECT: null,
                });
                interaction.reply({
                  embeds: [
                    embed.setDescription("Your Voice Channel is now public"),
                  ],
                  ephemeral: true,
                });
              }
              break;
            case "off":
              {
                voiceChannel.permissionOverwrites.edit(guild.id, {
                  CONNECT: false,
                });
                interaction.reply({
                  embeds: [
                    embed.setDescription("Your Voice Channel is now closed"),
                  ],
                  ephemeral: true,
                });
              }
              break;
          }
        }
        break;
      case "limit":
        {
          const limit = options.getNumber("size");
          if (limit <= 0 || limit > 99)
            return interaction.reply({
              embeds: [
                embed
                  .setDescription("Member Limit needs to be between 1-99")
                  .setColor("RED"),
              ],
              ephemeral: true,
            });

          await voiceChannel.edit({ userLimit: limit });
          await interaction.reply({
            embeds: [
              embed.setDescription(
                `Voice Channel Limit has been set to \`${limit}\``
              ),
            ],
            ephemeral: true,
          });
        }
        break;
    }
  },
});
