import ConsumerInfoI from '../interfaces/ConsumerInfoI';
import { TAB } from '../utils/constants';
import { dateLength, padCenterAlign } from '../utils/printer';

export default function (consumerInfo: ConsumerInfoI, lineLength: number) {

    let title = ' CONSUMER INFO';
    title = padCenterAlign(title, title.length, lineLength + dateLength, '-');
    let ret = title + '\n';
    let somethingShown = false;

    if (consumerInfo.firstName && consumerInfo.firstName !== 'undefined') {
        ret += `${TAB}${'First Name:'.yellow} ${consumerInfo.firstName}\n`;
        somethingShown = true;
    }
    if (consumerInfo.lastName && consumerInfo.lastName !== 'undefined') {
        ret += `${TAB}${'Last name:'.yellow} ${consumerInfo.lastName}\n`;
        somethingShown = true;
    }
    if (consumerInfo.email && consumerInfo.email !== 'undefined') {
        ret += `${TAB}${'Email:'.yellow} ${consumerInfo.email}\n`;
        somethingShown = true;
    }
    if (consumerInfo.phone && consumerInfo.phone !== 'undefined') {
        ret += `${TAB}${'Phone:'.yellow} ${consumerInfo.phone}\n`;
        somethingShown = true;
    }

    if (!somethingShown) {
        ret += `\n${TAB}NO CONSUMER INFO  FOUND\n`.red;
    }

    return `${ret}\n`;
}