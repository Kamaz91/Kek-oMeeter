import { MessageReaction, PartialMessageReaction, PartialUser, User } from "discord.js";
import { CursedUsersId, ReactionPoints } from "./data.js";
import { random, random4 } from "../../includes/utils/random.js";
import { addRating, addRatingDailyChange } from "./database.js";

export default function process(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
    try {
        let score = random(0, random4());
        let reactionAuthor = reaction.message.author?.id;

        if (!reaction.message.inGuild() || !reactionAuthor) {
            return;
        }

        if (user.bot || reaction.message.author.id == user.id) {
            score -= 10;
            addRating(reaction.message.guildId, reactionAuthor, score);
            addRatingDailyChange(reaction.message.guildId, reactionAuthor, score);
            return;
        }

        if (CursedUsersId.includes(reactionAuthor)) {
            // if cursed author gets reaction do nothing xD
            return;
        }

        if (CursedUsersId.includes(user.id)) {
            // if cursed author gives reaction
        }

        if (ReactionPoints.has(reaction.emoji.id || "")) {
            let reactionPoint = ReactionPoints.get(reaction.emoji.id || "");
            score += reactionPoint || 0;
        }

        addRating(reaction.message.guildId, reactionAuthor, score);
        addRatingDailyChange(reaction.message.guildId, reactionAuthor, score);

        console.log("Reaction name:", reaction.emoji.name);
        console.log("Reaction id:", reaction.emoji.id);
        console.log("Score:", score);
    } catch (error) {

    }
}