export default interface ConfigI {
    accountId: string;
    consumerKey: string;
    consumerSecret: string;
    token: string;
    tokenSecret: string;
    pg: {
        host: string;
        port: string;
        database: string;
        user: string;
        password: string;
        schema: string
    }
}