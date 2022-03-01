import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  PermissionResolvable,
} from "discord.js";
import { ExtendedClient } from "../structures/Client";

export type CommandType = {
  userPermissions?: PermissionResolvable[];
  run(client: ExtendedClient, interaction: CommandInteraction): any;
} & ChatInputApplicationCommandData;
