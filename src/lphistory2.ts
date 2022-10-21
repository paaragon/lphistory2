#!/usr/bin/env node

import { binary, boolean, command, flag, number, oneOf, option, positional, restPositionals, run, string, subcommands } from "cmd-ts";
import { createConfig, listConfig, removeConfig } from './commands/config';
import { editOptions, getOptions, showOptions } from './commands/options';
import search from './commands/search';
import OptionsI from './interfaces/OptionsI';

const defaultOptions: OptionsI = getOptions();
const searchCmd = command(
    {
        name: "search",
        args: {
            id: positional({ displayName: 'conversation id', type: string }),
            environment: option({
                long: 'environment',
                short: 'e',
                defaultValue: () => defaultOptions.environment,
                type: string,
                description: 'Environment to search'
            }),
            timestampShift: option({
                long: 'timestamp-shift',
                short: 't',
                defaultValue: () => defaultOptions['timestamp-shift'],
                type: number,
                description: 'Historical request require an OAuth timestamp. Sometimes, default timestamp could be wrong. You can shift the timestamp with this option.'
            }),
            daemonInfo: option({
                long: 'daemon-info',
                short: 'd',
                defaultValue: () => defaultOptions['daemon-info'],
                type: oneOf(['off', 'summary', 'full']),
                description: 'off | summary | full - if off, no daemon info will be shown. If summary, only not unsent records wil be shown. If full, all daemon records will be shown.'
            }),
            lineLength: option({
                long: 'length',
                short: 'l',
                defaultValue: () => defaultOptions.length,
                type: number,
                description: 'Line length'
            }),
            machine: flag({
                long: 'machine',
                short: 'm',
                defaultValue: () => defaultOptions.machine,
                type: boolean,
                description: 'If specified, ids will be shown instead of names. Also, timestamps will be shown instead of formatted dates'
            }),
            fullMsg: flag({
                long: 'full-msg',
                short: 'f',
                defaultValue: () => defaultOptions['full-msg'],
                type: boolean,
                description: 'If specified, the messages will not be cutted.'
            }),
        },
        async handler({ id, environment, timestampShift, daemonInfo, lineLength, machine, fullMsg }) {
            if (daemonInfo && daemonInfo !== 'off' && daemonInfo !== 'summary' && daemonInfo !== 'full') {
                console.log('--daemon-info (-d) option should be off, resume or full'.red);
                process.exit(1);
            }

            if (lineLength < 50) {
                console.log('--length (-l) option should greater than 50'.red);
                process.exit(1);
            }

            try {
                await search(id, environment, timestampShift, daemonInfo as 'off' | 'summary' | 'full', lineLength, machine || defaultOptions.machine, fullMsg || defaultOptions['full-msg']);
                process.exit(0);
            } catch (e) {
                console.log(e);
                process.exit(1);
            }
        },
    }
);

const listConfigCmd = command(
    {
        name: "list environments",
        args: {
        },
        async handler() {
            try {
                listConfig();
                process.exit(0);
            } catch (e) {
                console.log(e);
                process.exit(1);
            }
        },
    }
);

const createConfigCmd = command(
    {
        name: "create environments",
        args: {
        },
        async handler() {
            try {
                await createConfig();
                process.exit(0);
            } catch (e) {
                console.log(e);
                process.exit(1);
            }
        },
    }
);

const removeConfigCmd = command(
    {
        name: "remove environment",
        args: {
            restPositionalArgs: restPositionals({
                type: string,
                displayName: 'environment',
                description: 'Environment to configure'
            }),
        },
        async handler({ restPositionalArgs }) {
            try {
                const env = restPositionalArgs && restPositionalArgs.length > 0 ? restPositionalArgs[0] : null;
                await removeConfig(env);
                process.exit(0);
            } catch (e) {
                console.log(e);
                process.exit(1);
            }
        },
    }
);

const listOptionsCmd = command(
    {
        name: "list options",
        args: {
        },
        async handler({ }) {
            try {
                showOptions();
                process.exit(0);
            } catch (e) {
                console.log(e);
                process.exit(1);
            }
        },
    }
);

const editOptionsCmd = command(
    {
        name: "edit options",
        args: {
        },
        async handler({ }) {
            try {
                await editOptions();
                process.exit(0);
            } catch (e) {
                console.log(e);
                process.exit(1);
            }
        },
    }
);

const optionsCmd = subcommands({
    name: 'options',
    cmds: {
        'list': listOptionsCmd,
        'edit': editOptionsCmd,
    },
});

const configCmd = subcommands({
    name: 'environment',
    cmds: {
        'list': listConfigCmd,
        'create': createConfigCmd,
        'remove': removeConfigCmd,
    },
});


const lpHistorySubcommands = subcommands({
    name: 'lphistory2',
    cmds: {
        'environment': configCmd,
        'search': searchCmd,
        'options': optionsCmd,
    }
});

run(binary(lpHistorySubcommands), process.argv);