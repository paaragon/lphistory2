interface CliArgsI {
    command: string;
}

interface CliSearchArgsI extends CliArgsI {
    id: string;
    tShift: number;
    environment: string;
    daemonInfo: boolean
}

interface CliConfigArgsI {
    action: string;
}