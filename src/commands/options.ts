import Table from 'cli-table';
import * as colors from 'colors';
import fs from 'fs';
import OptionsI from '../interfaces/OptionsI';
import question from '../utils/question';
colors.enable();

const configFolder = `${__dirname}/../../config`;
const optionsPath = `${configFolder}/options.json`;

export function showOptions() {
    const options = getOptions();
    const table = new Table();
    console.log('Configured default options'.green);
    for (const key of Object.keys(options)) {
        table.push([key, (options as any)[key]]);
    }
    console.log(table.toString());
    return;
}

export async function editOptions() {
    await optionsProcess();
}

export function getOptions(): OptionsI {
    const optionsStr = fs.readFileSync(optionsPath).toString();

    return JSON.parse(optionsStr);
}

export async function optionsProcess(): Promise<void> {
    const currOptions = getOptions();
    const newEnvironment: string = await question(`Enter your new default environment: `, null, currOptions.environment.toString());
    const newTShift: string = await question(`Enter your new default timestamp-shift: `, null, currOptions['timestamp-shift'].toString(), (answer: string) => !isNaN(parseInt(answer, 10)));
    const newDaemonInfo: string = await question('Enter your new default daemon-info: ', ['off', 'summary', 'full'], currOptions['daemon-info'].toString());
    const newLength: string = await question('Enter your new default length: ', null, currOptions.length.toString(), (answer: string) => !isNaN(parseInt(answer, 10)) && parseInt(answer, 10) > 50);
    const newMachine: string = await question('Enter your new default machine: ', ['true', 'false'], currOptions.machine.toString());
    const newFullMsg: string = await question('Enter your new default full-msg: ', ['true', 'false'], currOptions['full-msg'].toString());

    const options: OptionsI = {
        environment: newEnvironment,
        "timestamp-shift": parseInt(newTShift, 10),
        "daemon-info": newDaemonInfo as 'off' | 'summary' | 'full',
        length: parseInt(newLength, 10),
        machine: JSON.parse(newMachine),
        "full-msg": JSON.parse(newFullMsg),
    };

    fs.writeFileSync(optionsPath, JSON.stringify(options));
}