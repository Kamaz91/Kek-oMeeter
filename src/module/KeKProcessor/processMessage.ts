import { EmbedBuilder, Message, OmitPartialGroupDMChannel } from "discord.js";
import { md5 } from "js-md5";
import sharp from "sharp";

import { CursedUsersId, ALLOWED_CONTENT_TYPES, ALLOWED_CHANNELS, BlessedUsersId } from "./data.js";
import { addRating, addRatingDailyChange, getRating, addFileHash, getfileHash } from "./database.js";
import { random } from "../../includes/utils/random.js";
import { isToxic } from "./toxicity.js";
import { downloadFile, bufferToUint8Array, getHighestProbability } from "./utils.js";
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
        if (!ALLOWED_CHANNELS.includes(message.channelId)) {
            console.log("Not allowed channel:", message.channelId);
            return;
        }
        console.log(`Message from ${message.author.username}:`, message.content);

        // Check if message has attachments
        if (message.attachments.size > 0) {
            console.log("Message has attachments:", message.attachments.size);
            score += random(0, 10);

            let grinder = scoreGrindingPrevent.get(message.author.id);
            if (!grinder) {
                let template = { lastPostTime: new Date().getTime(), postCount: 1 };
                scoreGrindingPrevent.set(message.author.id, template);
                grinder = scoreGrindingPrevent.get(message.author.id) || template;
            }

            console.log("Grinder:", grinder);
            console.log("Grinder lastPostTime:", grinder?.lastPostTime);

            // Score grind detected
            let isGrinding = new Date().getTime() - grinder.lastPostTime < 4000 ? true : false;
            console.log("Is grinding:", isGrinding, new Date().getTime() - grinder.lastPostTime);

            if (isGrinding) {
                grinder.lastPostTime = new Date().getTime();
                grinder.postCount++;
                scoreGrindingPrevent.set(message.author.id, grinder);
            } else {
                console.log("Reset grinder post count");
                grinder.lastPostTime = new Date().getTime();
                grinder.postCount = 0;
                scoreGrindingPrevent.set(message.author.id, grinder);
            }
            if (grinder && grinder.postCount > 2) {
                grinder.postCount = 0;
                score = -100;
                let userRating = await getRating(message.guildId, message.author.id);
                let embed = new EmbedBuilder();
                embed.setTitle("Mem Score Grinding Detected!");
                embed.setDescription(`**${message.author.username}** has been detected for score grinding. Your score has been reduced by 100 points. ${userRating} - 100`);
                embed.setColor(0xFF0000);
                embed.setFooter({ text: "Please do not spam messages to gain points." });
                message.channel.send({ content: " ", embeds: [embed] });
                addRating(message.guildId, message.author.id, score);
                addRatingDailyChange(message.guildId, message.author.id, score);
                return;
            }

            let answer = await message.reply({ embeds: [{ title: "Processing your image...", color: 0xbbbbbb }] });

            let img = message.attachments.first();

            console.log("Image URL:", img?.url);
            console.log("Type:", img?.contentType);

            if (img && ALLOWED_CONTENT_TYPES.includes(img.contentType || "")) {
                let imageBuffer = await downloadFile(img.url);

                if(img.contentType?.includes("webp")) {
                    console.log("Image is webp, converting to png...");
                    imageBuffer = await sharp(imageBuffer).png().toBuffer();
                }

                let imageData = await bufferToUint8Array(imageBuffer);

                let hash = md5(imageBuffer.toString());


                // Classify the image using the classifyImage function
                console.log("Classifying image...");
                if (imageData) {
                    let result = await classifyImage(imageData);
                    for (const element of result) {
                        element.className.includes("cat") ? score += 10 : score += 0;
                        element.probability > 0.5;
                    }
                    let highest = getHighestProbability(result);
                    console.log("Highest: ", highest);
                    console.log("Highest: ", highest * 100);
                    console.log("Highest: ", Math.round(highest * 100));
                    score += Math.round(highest * 100);

                    let embed = new EmbedBuilder();
                    embed.setColor(0x00FF00);

                    if (await getfileHash(hash)) {
                        score = Math.ceil(score * 0.1);
                        embed.setFields({ name: "Duplicate Image", value: `This image has already been processed. Your score has been reduced by 90%.` });
                        embed.setColor(0xFFFF00);
                    } else {
                        await addFileHash(hash, img.name);
                    }

                    let userRating = await getRating(message.guildId, message.author.id);

                    if (CursedUsersId.includes(message.author.id)) {
                        score = Math.ceil(score * 0.05);
                        score += -random(0, 10);
                    }

                    if (BlessedUsersId.includes(message.author.id)) {
                        score = Math.ceil(score * 1.1);
                    }

                    embed.setTitle("Mem Score Updated");
                    embed.setDescription(`**${message.author.username}** has been awarded ${score} points. ${userRating} + ${score}`);
                    embed.setFooter({ text: "You can earn points by sending memes!" });

                    answer.edit({ embeds: [embed] });
                    addRating(message.guildId, message.author.id, score);
                    addRatingDailyChange(message.guildId, message.author.id, score);
                } else {
                    console.error("ImageData is undefined. Skipping classification.");
                }
            }
        }

        if (message.content.length > 0 && await isToxic(message.content)) {
            let embed = new EmbedBuilder();
            embed.setTitle("Toxicity Detected!");
            embed.setDescription(`**${message.author.username}** has been detected for toxicity. Your score has been reduced by 100 points.`);
            embed.setColor(0xFF0000);
            embed.setFooter({ text: "Please do not use toxic language." });
            message.reply({ embeds: [embed] });
            addRating(message.guildId, message.author.id, -100);
            addRatingDailyChange(message.guildId, message.author.id, -100);
            console.log("Toxicity detected in message:", message.content);
        }
    } catch (error) {
        console.error("Error processing message:", error);
        // Handle the error appropriately, e.g., log it or send a message to the channel
    }
}