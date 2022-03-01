import {
  ChatInputApplicationCommandData,
  CommandInteraction,
} from "discord.js";
import { ExtendedClient } from "../structures/Client";

export type CommandType = {
  run(client: ExtendedClient, interaction: CommandInteraction): any;
} & ChatInputApplicationCommandData;
