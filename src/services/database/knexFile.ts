export default {
    client: 'sqlite3',
    connection: {
        filename: process.env.DB_FILENAME || './data/db.sqlite3'
    },
    useNullAsDefault: true
}