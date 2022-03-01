declare global {
  namespace NodeJS {
    interface ProcessEnv {
      botToken: string;
      mongoUri: string;
      guildId: string;
      joinToCreateChannel: string;
    }
  }
}

export {};
