import {
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
} from "discord.js";
import { glob } from "glob";
import { promisify } from "util";
import { CommandType } from "../typings/Command";
import { Event } from "./Event";

const globPromise = promisify(glob);

export class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection();
  voiceChannels: Collection<string, string> = new Collection();

  constructor() {
    super({
      intents: 32767,
    });
  }

  public start() {
    this.registerEvents();
    this.registerCommands();

    this.login(process.env.botToken);
  }

  public async importFile(filePath: string) {
    return (await import(filePath))?.default;
  }

  private async registerEvents() {
    const eventFiles = await globPromise(
      `${__dirname}/../events/**/*{.ts,.js}`
    );

    eventFiles.forEach(async (filePath) => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath);
      this.on(event.event, event.run);
    });
  }

  private async registerCommands() {
    const slashCommands: ApplicationCommandDataResolvable[] = [];
    const commandFiles = await globPromise(
      `${__dirname}/../commands/*/*{.ts,.js}`
    );
    commandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath);
      if (!command.name) return;

      this.commands.set(command.name, command);
      slashCommands.push(command);
    });

    this.on("ready", () => {
      this.guilds.cache.get(process.env.guildId).commands.set(slashCommands);
    });
  }
}
