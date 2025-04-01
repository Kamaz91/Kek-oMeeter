import { Database } from "../../services/database/index.js";
import { DateTime } from "luxon";

type UserRating = {
    guild_id: string;
    user_id: string;
    score: number;
    created_at: number; // Timestamp in milliseconds
};
type UserDailyRating = {
    guild_id: string;
    user_id: string;
    change: number;
    day: string; // YYYYMMDD format
    created_at: number; // Timestamp in milliseconds
};
type FileHash = {
    id: number;
    hash: string;
    filename: string;
    created_at: number; // Timestamp in milliseconds
};

export async function getRating(guild_id: string, user_id: string) {
    // Structure:
    //  guild_id : string
    //  user_id  : string   
    let time = DateTime.now().toFormat('yyyy/LL/dd HH:mm:ss');
    console.log(`[${time}]`, "getRating", user_id);

    if (await isUserExist(guild_id, user_id)) {
        const db = Database();
        const user = await db.table("user_ratings")
            .where({ guild_id, user_id })
            .first();

        if (user) {
            return user.score;
        } else {
            return 0;
        }
    } else {
        createUser(user_id, guild_id).then();
        createUserDaily(user_id, guild_id).then();
        return 2137;
    }
}

export async function getfileHash(hash: string): Promise<FileHash | null> {
    const db = Database();
    const file = await db.from<FileHash>("files_hash").where({ hash }).first();
    if (file) {
        return file;
    } else {
        return null;
    }
}

export async function addFileHash(hash: string, filename: string) {
    const db = Database();
    return db.table("files_hash")
        .insert({
            hash,
            filename,
            created_at: DateTime.now().toMillis()
        }).then();
}

// add the rating to existing user in base, change positive or negative
export async function addRating(guild_id: string, user_id: string, score: number) {
    // Structure:
    //  guild_id : string
    //  user_id  : string   
    //  score    : number
    let time = DateTime.now().toFormat('yyyy/LL/dd HH:mm:ss');
    console.log(`[${time}]`, "addRating", user_id, score);

    if (await isUserExist(guild_id, user_id)) {
        console.log("User exist, adding change", user_id);
        const db = Database();
        await db.table("user_ratings")
            .where({ guild_id: guild_id.toString(), user_id: user_id.toString() })
            .update({
                score: db.raw('?? + ?', ['score', score])
            })
            .then();
    } else {
        createUser(user_id, guild_id).then();
    }
}

// add the daily change rating to existing user in base, change positive or negative
export async function addRatingDailyChange(guild_id: string, user_id: string, change: number) {
    // Structure:
    //  guild_id : string
    //  user_id  : string   
    //  change    : number
    //  day      : YYYYMMDD

    if (await isUserExist(guild_id, user_id)) {
        const ymd = DateTime.now().toFormat('yyyyLLdd');
        const db = Database();
        db.table("user_changes")
            .where({ guild_id, user_id, day: ymd })
            .update({
                change: db.raw('?? + ?', ['change', change])
            })
            .then();
    } else {
        createUserDaily(user_id, guild_id).then();
    }
}

export async function isUserExist(guild_id: string, user_id: string) {
    const db = Database();
    let user = await db.from<UserRating>("user_ratings").where({ guild_id: guild_id.toString(), user_id: user_id.toString() }).first();

    console.log("isUserExist", user_id, guild_id, user ? true : false);
    return user ? true : false;
}

export async function isUserDailyExist(guild_id: string, user_id: string, ymd: string) {
    const db = Database();
    const user = await db.table("user_changes")
        .where({ guild_id, user_id, "day": ymd })
        .first();
    return user ? true : false;
}

function createUser(user_id: string, guild_id: string) {
    console.log("Creating user", user_id, guild_id);
    const db = Database();
    return db.table("user_ratings")
        .insert({
            guild_id,
            user_id,
            score: 2137,
            created_at: DateTime.now().toMillis()
        });
}

function createUserDaily(user_id: string, guild_id: string) {
    const db = Database();
    const ymd = DateTime.now().toFormat('yyyyLLdd');
    return db.table("user_changes")
        .insert({
            guild_id,
            user_id,
            change: 0,
            day: ymd,
            created_at: DateTime.now().toMillis()
        });
}