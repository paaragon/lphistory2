import Table from 'cli-table';
import * as colors from 'colors';
import fs from 'fs';
import ConfigI from '../interfaces/ConfigI';
import question from '../utils/question';
colors.enable();

const configFolder = `${__dirname}/../../config`;
const configPath = (env: string) => `${configFolder}/${env}.json`;
if (!checkPath(configFolder, true)) {
    console.log('No config folder. Creating it');
    fs.mkdirSync(configFolder);
}

export function listConfig(env?: string | null) {
    const envs = getExistentEnvs(env);
    if (envs.length === 0 && env) {
        console.log('\n    NO CONFIGURATION FOUND FOR ENVIRONMENT'.red, `${env}`.green);
        return;
    } if (envs.length === 0 && !env) {
        console.log('\n    NO ENVIRONMENT FOUND'.red);
        return;
    }

    for (const environment of envs) {
        const config = getConfig(environment);
        const table = new Table();
        console.log('\nEnvironment ' + environment.green);
        table.push({ 'Live Person': ['Account id', config.accountId.yellow] });
        table.push(['', 'Consumer key', config.consumerKey.yellow]);
        table.push(['', 'Consumer secret', config.consumerSecret.yellow]);
        table.push(['', 'Token', config.token.yellow]);
        table.push(['', 'Token secret', config.tokenSecret.yellow]);
        table.push({ 'Database': ['Host', config.pg.host.yellow] });
        table.push(['', 'Port', config.pg.port.yellow]);
        table.push(['', 'DB name', config.pg.database.yellow]);
        table.push(['', 'User', config.pg.user.yellow]);
        table.push(['', 'Password', config.pg.password.yellow]);
        console.log(table.toString());
    }

    return;
}

export async function createConfig() {
    const environment: string = await question('Enter the new environment name: ');
    await configProcess(environment);
}

export async function removeConfig(environment?: string | null) {
    let env = environment;
    if (!env) {
        const envs = getExistentEnvs();
        if (!envs || envs.length === 0) {
            console.log(`\n    Cannot find any configured environment.`.red);
            console.log(`\n    You can list all configured environments with `.white + `lphistory2 environment list`.yellow);
            return;
        }
        env = await question(`What environment do you want to remove:`, envs);
    }
    if (!checkConfig(env)) {
        console.log('\n    Cannot find environment '.red + 'env'.green);
        console.log(`\n    You can list all configured environments with `.white + `lphistory2 config list`.yellow);
        return;
    }

    const confirmation: string = await question(`Are you shure you want to remove the environment ${env.green}:`, ['Yes', 'No']);
    if (confirmation.toLowerCase() === 'n') {
        console.log('\n    Remove canceled'.red);
        return;
    }

    const path = configPath(env);
    fs.unlinkSync(path);

    console.log(`\n    ENVIRONMENT ${env} DELETED SUCCESSFULLY`.green);
}

export function getConfig(env: string): ConfigI {
    const cPath = configPath(env);
    const configStr = fs.readFileSync(cPath).toString();

    return JSON.parse(configStr);

}

export function checkPath(path: string, folder?: boolean): boolean {
    try {
        if (folder) {
            fs.readdirSync(path);
        } else {
            fs.readFileSync(path);
        }
        return true;
    } catch (e) {
        return false;
    }
}

export function checkConfig(env: string): boolean {
    const cPath = configPath(env);
    return checkPath(cPath);
}

export async function configProcess(env: string): Promise<void> {

    console.log('\nLive Person API Credentials for environment', `${env}`.green, '\n');
    const accountId: string = await question('Enter your LP account Id: ');
    const consumerKey: string = await question('Enter your LP API Consumer Key: ');
    const consumerSecret: string = await question('Enter your LP API Consumer Secret: ');
    const token: string = await question('Enter your LP API token: ');
    const tokenSecret: string = await question('Enter your LP API Token Secret: ');

    console.log('\n\nDatabase Credentials for environment', `${env}`.green, '\n');
    const pgHost: string = await question('Enter your PostgreSQL host: ');
    const pgPort: string = await question('Enter your PostgreSQL port: ');
    const pgDb: string = await question('Enter your PostgreSQL database: ');
    const pgUSer: string = await question('Enter your PostgreSQL user: ');
    const pgPss: string = await question('Enter your PostgreSQL password: ');
    const pgSchema: string = await question('Enter your PostgreSQL schema: ');


    console.log(`\nEnvironment ${env.green} created`);

    const config: ConfigI = {
        accountId: accountId.trim(),
        consumerKey: consumerKey.trim(),
        consumerSecret: consumerSecret.trim(),
        token: token.trim(),
        tokenSecret: tokenSecret.trim(),
        pg: {
            host: pgHost,
            port: pgPort,
            database: pgDb,
            user: pgUSer,
            password: pgPss,
            schema: pgSchema
        }
    }

    const cPath = configPath(env);
    fs.writeFileSync(cPath, JSON.stringify(config));
}

function getExistentEnvs(env?: string | null) {
    const fileRegex = env ? new RegExp(`(${env})\\.json`) : new RegExp('(.*)\\.json');
    const dir = fs.readdirSync(configFolder);
    const envs = [];
    for (const file of dir) {
        const extracted = fileRegex.exec(file);
        if (extracted && extracted[1] !== 'options') {
            envs.push(extracted[1]);
        }
    }

    return envs;
}