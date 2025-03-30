import { Database } from "../../services/database/index.js";
import { DateTime } from "luxon";

// add the rating to existing user in base, change positive or negative
export async function addRating(guild_id: string, user_id: string, score: number) {
    // Structure:
    //  guild_id : string
    //  user_id  : string   
    //  score    : number
    let time = DateTime.now().toFormat('yyyyLLdd HH:mm:ss');
    console.log(`[${time}]`, "addRating", user_id, score);

    if (await isUserExist(user_id, guild_id)) {
        const db = Database();
        await db.table("user_ratings")
            .where({ guild_id, user_id })
            .update({
                score: db.raw('?? + ?', ['score', score])
            });
    } else {
        createUser(user_id, guild_id);
    }
}

// add the daily change rating to existing user in base, change positive or negative
export async function addRatingDailyChange(guild_id: string, user_id: string, change: number) {
    // Structure:
    //  guild_id : string
    //  user_id  : string   
    //  change    : number
    //  day      : YYYYMMDD

    if (await isUserExist(user_id, guild_id)) {
        const ymd = DateTime.now().toFormat('yyyyLLdd');
        const db = Database();
        db.table("user_ratings_daily")
            .where({ guild_id, user_id, day: ymd })
            .update({
                change: db.raw('?? + ?', ['change', change])
            });
    } else {
        createUserDaily(user_id, guild_id);
    }
}

export async function isUserExist(guild_id: string, user_id: string) {
    const db = Database();
    const user = await db.table("user_ratings")
        .where({ guild_id, user_id })
        .first();
    return user ? true : false;
}

export async function isUserDailyExist(guild_id: string, user_id: string, ymd: string) {
    const db = Database();
    const user = await db.table("user_ratings_daily")
        .where({ guild_id, user_id, "day": ymd })
        .first();
    return user ? true : false;
}

function createUser(user_id: string, guild_id: string) {
    const db = Database();
    return db.table("user_ratings")
        .insert({
            guild_id,
            user_id,
            score: 2137
        });
}

function createUserDaily(user_id: string, guild_id: string) {
    const db = Database();
    const ymd = DateTime.now().toFormat('yyyyLLdd');
    return db.table("user_ratings_daily")
        .insert({
            guild_id,
            user_id,
            change: 0,
            day: ymd
        });
}