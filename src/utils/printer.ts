import moment from 'moment';
import 'moment-duration-format';
import ConfigI from '../interfaces/ConfigI';
import ConsumerInfoI from '../interfaces/ConsumerInfoI';
import EventI, { ALIGNMENT, EVENT_TYPE } from '../interfaces/EventI';
import headerTpl from '../templates/header.tpl';

export const dateFormat = 'YYYY MM DD HH:mm:ssZ';
export const dateLength = moment(new Date()).format(dateFormat).length;

export function printHeader(user: ConsumerInfoI, config: ConfigI, lineLength: number) {
    const tpl = headerTpl(user, lineLength);
    console.log(tpl);
}

export function printBody(events: EventI[], lineLength: number, machine: boolean, fullMsg: boolean) {
    if (!events || events.length === 0) {
        return;
    }

    const maxLineLength = events.reduce((prev, curr) => curr.getLineLength() > prev ? curr.getLineLength() : prev, 0);
    const length = maxLineLength < lineLength ? maxLineLength : lineLength;

    let title = ' CONVERSATION INFO';
    title = padCenterAlign(title, title.length, length + dateLength, '-');

    console.log(title + '\n');

    const firstDate = events[0].date;

    for (const event of events) {
        const durFormatted = moment.duration(event.date.getTime() - firstDate.getTime(), 'milliseconds').format('Y[y] M[m] D[d] H[h] m[m] s[s]');
        let date: string;
        if (machine) {
            date = event.date.getTime().toString();
        } else {
            date = moment(event.date).format(dateFormat);
        }

        if (event.eventType === EVENT_TYPE.TRANSFER) {
            console.log('\n');
        }

        const lines = getLinesFixedToLength(event.getPrintStr(machine), length, event.getFillCharacter(), event.alignment, fullMsg);
        for (let i = 0; i < lines.length; i++) {
            if (i === 0) {
                console.log(`${date.grey} ${lines[i]}` + ` [${durFormatted}]`.grey);
            } else {
                console.log(`${date.split('').map(() => event.getFillCharacter()).join('')} ${lines[i]} ${durFormatted.split('').map(() => event.getFillCharacter()).join('')}`);
            }
        }

        if (event.eventType === EVENT_TYPE.END) {
            console.log('\n');
        }
    }
}

function getLinesFixedToLength(str: string, maxLength: number, fillCharacter: string, alignment: ALIGNMENT, fullMsg: boolean): string[] {
    const lines: string[] = [];

    if (!fullMsg) {
        lines.push(getLineFixedToLength(str, maxLength, fillCharacter, alignment, true));
    } else {
        const chunks = chunkWords(str, maxLength);
        for (const line of chunks) {
            lines.push(getLineFixedToLength(line, maxLength, fillCharacter, alignment, false));
        }
    }

    return lines;
}

function getLineFixedToLength(str: string, maxLength: number, fillCharacter: string, alignment: ALIGNMENT, trunc?: boolean): string {
    let line = '';
    if (trunc) {
        line = truncLine(str, maxLength);
    } else {
        line = str;
    }
    line = padLine(line, maxLength, fillCharacter, alignment);

    return line;
}

function truncLine(str: string, maxLength: number): string {
    const lineLength = getRealLineLength(str);
    if (lineLength > maxLength) {
        return str.substring(0, maxLength + (str.length - lineLength) - 3) + '...';
    }

    return str;
}


function padLine(str: string, maxLength: number, fillCharacter: string, alignment: ALIGNMENT): string {
    const lineLength = getRealLineLength(str);
    switch (alignment) {
        case ALIGNMENT.LEFT:
            return padLeftAlign(str, lineLength, maxLength, fillCharacter);
        default:
            return padCenterAlign(str, lineLength, maxLength, fillCharacter);
    }
}

function padLeftAlign(str: string, lineLength: number, maxLength: number, fillCharacter: string) {
    if (lineLength < maxLength) {
        let endLines = '';
        const nEndLineChars = maxLength + (str.length - lineLength) - str.length;
        for (let i = 0; i < nEndLineChars - 1; i++) {
            endLines += fillCharacter;
        }
        return str + ' ' + endLines;
    }

    return str;
}

export function padCenterAlign(str: string, lineLength: number, maxLength: number, fillCharacter: string) {
    if (lineLength < maxLength) {
        let endChars = '';
        let startChars = '';
        const nPadChars = maxLength + (str.length - lineLength) - str.length;
        for (let i = 0; i < nPadChars / 2; i++) {
            endChars += fillCharacter;
        }
        for (let i = 0; i < nPadChars / 2 - 1; i++) {
            startChars += fillCharacter;
        }
        return startChars + str + ' ' + endChars;
    }

    return str;
}


function getRealLineLength(str: string): number {
    const colorCharLength = 5;
    const colorCharRegEx = /\x1B\[[0-9]{2}m/;
    const numberOfColorChars = (str.split(colorCharRegEx).length - 1);
    let colorCharsLength = numberOfColorChars * colorCharLength;

    if (str.indexOf('Daemon Check') !== -1) {
        colorCharsLength -= colorCharLength;
    }

    return str.length - colorCharsLength;
}

function chunkWords(str: string, size: number) {
    const words = str.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
        const realLineLength = getRealLineLength(currentLine);
        const realWordLength = getRealLineLength(word);
        if (realLineLength + realWordLength > size - 1) {
            lines.push(currentLine);
            currentLine = '';
        }
        currentLine += ` ${word}`;
    }
    lines.push(currentLine);

    return lines;
}