import Client from "./core/Connection.js";
// Import the KeKProcessor module
import { init } from "./module/KeKProcessor/index.js";

// Import database services
import { Disconnect } from './services/database/index.js';
import process from "process";

// Event listener for when the client is ready
Client.on('ready', () => {
    console.info('Connected!');
});

// Event listener for when the client is reconnecting
Client.on('reconnecting', function () {
    console.info('reconnecting');
});

// Event listener for when the client is disconnected
Client.on('disconnect', closeEvent => {
    console.info('************');
    console.info('End of Session');
});

// Event listener for errors
Client.on('error', error => {
    console.log(error);
    console.error('Discord error');
    console.error(error);
});

// Event listener for debug messages
Client.on('debug', message => {
    console.debug(message);
});

// Handle SIGINT signal (e.g., Ctrl+C)
process.on("SIGINT", () => {
    console.info("Caught SIGINT.");
    Disconnect(); // Disconnect from the database
    Client.destroy(); // Destroy the client instance
    process.exit(1); // Exit the process
});

// Function to login the client
function login() {
    var token = GetToken(); // Get the token
    Client.login(token); // Login the client with the token
}

function GetToken() {

    if ("DISCORD_KEY" in process.env) {
        return process.env.DISCORD_KEY;
    }
    throw new Error("Discord key not found in .env.");
}
// Initialize the bot
login();
console.info("Discord bot logged in.");
init(); // Initialize the KeKProcessor module
console.info("KeKProcessor initialized");