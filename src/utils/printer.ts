import moment from 'moment';
import 'moment-duration-format';
import ConfigI from '../interfaces/ConfigI';
import ConsumerInfoI from '../interfaces/ConsumerInfoI';
import EventI, { EVENT_TYPE } from '../interfaces/EventI';
import headerTpl from '../templates/header.tpl';

export function printHeader(user: ConsumerInfoI, config: ConfigI, lineLength: number) {
    const tpl = headerTpl(user, lineLength);
    console.log(tpl);
}

export function printBody(events: EventI[], lineLength: number, machine: boolean, fullMsg: boolean) {
    if (!events || events.length === 0) {
        return;
    }

    const maxLineLength = events.reduce((prev, curr) => curr.getPrintStr(machine).length > prev ? curr.getPrintStr(machine).length : prev, 0);
    const length = maxLineLength < lineLength ? maxLineLength : lineLength;

    console.log('================================== CONVERSATION INFO ==================================>\n');

    const firstDate = events[0].date;

    for (const event of events) {
        const durFormatted = moment.duration(event.date.getTime() - firstDate.getTime(), 'milliseconds').format('Y[y] M[m] D[d] H[h] m[m] s[s]');
        let date: string;
        if (machine) {
            date = event.date.getTime().toString();
        } else {
            date = moment(event.date).format('YYYY MM DD HH:mm:ssZ');
        }

        if (event.eventType === EVENT_TYPE.TRANSFER) {
            console.log('\n');
        }

        if (event.eventType === EVENT_TYPE.MESSAGE) {
            const lines = getLinesFixedToLength(event.getPrintStr(machine), length, fullMsg);
            for (let i = 0; i < lines.length; i++) {
                if (i === 0) {
                    console.log(`${date.grey} ${lines[i]}` + ` [${durFormatted}]`.grey);
                } else {
                    console.log(`${date.split('').map(() => '-'.grey).join('')} ${lines[i]} ${durFormatted.split('').map(() => '-'.grey).join('')}`);
                }
            }
        } else {
            console.log(`${date.grey} ${getLinesFixedToLength(event.getPrintStr(machine), length, fullMsg)}` + ` [${durFormatted}]`.grey);
        }

        if (event.eventType === EVENT_TYPE.END) {
            console.log('\n');
        }
    }
}

function getLinesFixedToLength(str: string, maxLength: number, fullMsg: boolean): string[] {
    const lines: string[] = [];

    if (!fullMsg) {
        lines.push(getLineFixedToLength(str, maxLength, true));
    } else {
        const chunks = chunkWords(str, maxLength);
        for (const line of chunks) {
            lines.push(getLineFixedToLength(line, maxLength, false));
        }
    }

    return lines;
}

function getLineFixedToLength(str: string, maxLength: number, trunc?: boolean): string {
    let line = '';
    if (trunc) {
        line = truncLine(str, maxLength);
    } else {
        line = str;
    }
    line = padLine(line, maxLength);

    return line;
}

function truncLine(str: string, maxLength: number): string {
    const lineLength = getRealLineLength(str);
    if (lineLength > maxLength) {
        return str.substring(0, maxLength + (str.length - lineLength) - 3) + '...';
    }

    return str;
}


function padLine(str: string, maxLength: number): string {
    const lineLength = getRealLineLength(str);
    if (lineLength < maxLength) {
        let endLines = '';
        const nEndLineChars = maxLength + (str.length - lineLength) - str.length;
        for (let i = 0; i < nEndLineChars - 1; i++) {
            endLines += '-';
        }
        return str + ' ' + endLines.grey;
        // return (str + ' ').padEnd(maxLength + (str.length - lineLength), '-');
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