import { EmbedBuilder, Message, OmitPartialGroupDMChannel } from "discord.js";

import { CursedUsersId, ALLOWED_CONTENT_TYPES } from "./data.js";
import { addRating, addRatingDailyChange } from "./database.js";
import { random } from "../../includes/utils/random.js";
import { isToxic } from "./toxicity.js";
import { downloadFile, bufferToUint8Array } from "./utils.js";
import { classifyImage } from "./imageProcessor.js";

var scoreGrindingPrevent: Map<string, { lastPostTime: number, postCount: number }> = new Map();

export default async function process(message: OmitPartialGroupDMChannel<Message>) {
    try {
        let score = 0;
        if (!message.inGuild()) {
            return;
        }
        if (message.author.bot) {
            console.log("Bot message detected");
            return;
        }
        // temporary test for one channel
        // if (message.channelId != "647947021646430208") {
        //     return;
        // }

        if (CursedUsersId.includes(message.author.id) && message.attachments.size > 0) {
            score += -10;
            addRating(message.guildId, message.author.id, score);
            addRatingDailyChange(message.guildId, message.author.id, score);
        }
        console.log(`Message from ${message.author.username}:`, message.content);

        // Check if message has attachments
        if (message.attachments.size > 0) {
            console.log("Message has attachments:", message.attachments.size);
            score += random(0, 10);
            let embed = new EmbedBuilder();
            embed.setTitle("Mem Score Updated");
            embed.setDescription(`**${message.author.username}** has been awarded ${score} points.`);
            embed.setColor(0x00FF00);
            embed.setFooter({ text: "You can earn points by sending memes!" });
            //message.channel.send({ embeds: [embed] });

            let img = message.attachments.first();
            console.log("Image URL:", img?.url);

            if (img && ALLOWED_CONTENT_TYPES.includes(img.contentType || "")) {
                let imageBuffer = await downloadFile(img.url);
                let imageData = await bufferToUint8Array(imageBuffer);
                // Classify the image using the classifyImage function
                console.log("Classifying image...");
                if (imageData) {
                    let result = await classifyImage(imageData);
                    for (const element of result) {
                        element.className.includes("cat")? score += 10 : score += 0;
                        element.probability > 0.5;
                    }
                } else {
                    console.error("ImageData is undefined. Skipping classification.");
                }
            }
        }

        let grinder = scoreGrindingPrevent.get(message.author.id);
        if (grinder == undefined) {
            let template = { lastPostTime: new Date().getTime(), postCount: 1 };
            scoreGrindingPrevent.set(message.author.id, template);
            grinder = scoreGrindingPrevent.get(message.author.id);
        }

        // Score grind detected
        let isGrinding = grinder && new Date().getTime() - grinder.lastPostTime > 3000 ? true : false;
        if (isGrinding && grinder && message.attachments.size > 0 && grinder.postCount > 2) {
            grinder.postCount = 0;
            score = -100;
            let embed = new EmbedBuilder();
            embed.setTitle("Score Grinding Detected!");
            embed.setDescription(`**${message.author.username}** has been detected for score grinding. Your score has been reduced by 100 points.`);
            embed.setColor(0xFF0000);
            embed.setFooter({ text: "Please do not spam messages to gain points." });
            //message.channel.send({ embeds: [embed] });
            addRating(message.guildId, message.author.id, score);
            addRatingDailyChange(message.guildId, message.author.id, score);
            return;
        } else {
            grinder!.lastPostTime = new Date().getTime();
            grinder!.postCount++;
        }
        addRating(message.guildId, message.author.id, score);
        addRatingDailyChange(message.guildId, message.author.id, score);

        if (message.content.length > 0 && await isToxic(message.content)) {
            let embed = new EmbedBuilder();
            embed.setTitle("Toxicity Detected!");
            embed.setDescription(`**${message.author.username}** has been detected for toxicity. Your score has been reduced by 100 points.`);
            embed.setColor(0xFF0000);
            embed.setFooter({ text: "Please do not use toxic language." });
            //message.channel.send({ embeds: [embed] });
            addRating(message.guildId, message.author.id, -100);
            addRatingDailyChange(message.guildId, message.author.id, -100);
            console.log("Toxicity detected in message:", message.content);
        }
    } catch (error) {
        console.error("Error processing message:", error);
        // Handle the error appropriately, e.g., log it or send a message to the channel
    }
}