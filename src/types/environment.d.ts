declare global {
    namespace NodeJS {
        interface ProcessEnv {
            // Database
            DB_FILENAME: string;

            // API keys
            DISCORD_KEY: string;
        }
    }
}

export { }