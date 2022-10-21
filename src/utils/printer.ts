import moment from 'moment';
import 'moment-duration-format';
import ConfigI from '../interfaces/ConfigI';
import ConsumerInfoI from '../interfaces/ConsumerInfoI';
import EventI, { ALIGNMENT, EVENT_TYPE } from '../interfaces/EventI';
import headerTpl from '../templates/header.tpl';
import colors from 'colors';

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

    const length = events.reduce((prev, curr) => {
        const realLine = getRealLine(curr.getPrintStr(machine));
        const currMaxLength: number = realLine.length <= lineLength && realLine.length > prev ? realLine.length : prev;
        return currMaxLength;
    }, 0);

    let title = ' CONVERSATION INFO';
    title = padCenterAlign(title, title.length, length + dateLength, '-');

    console.log(title + '\n');

    const firstDate = events[0].date;

    for (const event of events) {
        const durFormatted = moment.duration(event.date.getTime() - firstDate.getTime(), 'milliseconds').format('Y[y] M[m] D[d] H[h] m[m] s[s]');
        let date: string = machine ? event.date.getTime().toString() : moment(event.date).format(dateFormat);

        if (event.eventType === EVENT_TYPE.TRANSFER) {
            console.log('\n');
        }

        const lines = getLinesFixedToLength(event.getPrintStr(machine), length, event.getFillCharacter(), event.alignment, fullMsg);
        for (let i = 0; i < lines.length; i++) {
            const coloredLine = replaceColors(lines[i]);
            if (i === 0) {
                console.log(`${date.grey} ${coloredLine}` + ` [${durFormatted}]`.grey);
            } else {
                console.log(`${date.split('').map(() => event.getFillCharacter()).join('')} ${coloredLine} ${durFormatted.split('').map(() => event.getFillCharacter()).join('')}`);
            }
        }

        if (event.eventType === EVENT_TYPE.END) {
            console.log('\n');
        }
    }
}

function replaceColors(line: string) {
    const splitted = line.split(/<color:(.*?)>/);
    let coloredLine = '';
    for (let i = 0; i < splitted.length - 1; i += 2) {
        coloredLine += (colors as any)[splitted[i + 1]](splitted[i]);
    }
    coloredLine += splitted[splitted.length - 1];
    return coloredLine
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
    const realLine = getRealLine(str);
    if (realLine.length > maxLength) {
        return str.substring(0, maxLength - 3) + '...';
    }

    return str;
}

function padLine(str: string, maxLength: number, fillCharacter: string, alignment: ALIGNMENT): string {
    const realLine = getRealLine(str);
    switch (alignment) {
        case ALIGNMENT.LEFT:
            return padLeftAlign(str, realLine.length, maxLength, fillCharacter);
        default:
            return padCenterAlign(str, realLine.length, maxLength, fillCharacter);
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
        const charsToSubtractIfEvenLine = lineLength % 2 === 0 ? 1 : 0;
        for (let i = 0; i < nPadChars / 2 - charsToSubtractIfEvenLine; i++) {
            endChars += fillCharacter;
        }
        for (let i = 0; i < nPadChars / 2 - 1; i++) {
            startChars += fillCharacter;
        }
        
        return startChars + str + ' ' + endChars;
    }

    return str;
}


function getRealLine(str: string): string {
    return str.replace(/<color:(.*?)>/g, '');
}

function chunkWords(str: string, size: number) {
    const words = str.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
        const realLine = getRealLine(currentLine);
        const realWord = getRealLine(word);
        if (realLine.length + realWord.length > size - 1) {
            lines.push(currentLine);
            currentLine = '';
        }
        currentLine += ` ${word}`;
    }
    lines.push(currentLine);

    return lines;
}