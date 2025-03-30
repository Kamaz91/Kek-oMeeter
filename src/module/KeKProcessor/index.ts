import Client from "../../core/Connection.js";
import messageHandler from "./processMessage.js";
import reactionHandler from "./processReactions.js";

export function init() {
    Client.on("messageCreate", messageHandler);
    Client.on("messageReactionAdd", reactionHandler);
};