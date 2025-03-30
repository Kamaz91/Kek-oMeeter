import { getConnection, connect, disconnect } from "./dbconnect.js";

connect().then((database) => {
    if (!database.status) {
        console.error(database.message);
        console.error("Database: ERROR while connecting to database");
    } else {
        console.info("Database: " + database.message);
    }
});

export const Database = getConnection;
export const Disconnect = disconnect;