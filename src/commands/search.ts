import DaemonRecordI from '../interfaces/daemon/daemon-record';
import EventI from '../interfaces/EventI';
import { ConversationHistoryRecord } from '../interfaces/liveperson/SearchConversationResponse';
import daemonService from '../services/daemon.service';
import livepersonService from '../services/liveperson.service';
import buildEvents from '../utils/events';
import { printBody, printHeader } from '../utils/printer';
import { checkConfig, configProcess, getConfig } from './config';

export default async function search(conversationId: string, environment: string, tShift: number, daemonVerbose: 'off' | 'summary' | 'full', lineLength: number, machine: boolean, fullMsg: boolean) {
    if (!checkConfig(environment)) {
        await configProcess(environment);
    }

    const config = getConfig(environment);

    console.log('\nSearch conversation\n');
    const lpConversation: ConversationHistoryRecord = await livepersonService.getConversationHistory(conversationId, config, tShift);

    if (!lpConversation) {
        console.log('\tNO CONVERSATION FOUND'.red);
        return;
    }

    const daemonRecords: DaemonRecordI[] = await daemonService.getDaemonInfo(conversationId, config, daemonVerbose);
    const user = livepersonService.getUserInfo(lpConversation);

    if (user) {
        printHeader(user, config, lineLength);
    }

    const events: EventI[] = buildEvents(lpConversation, daemonRecords);
    printBody(events, lineLength, machine, fullMsg);

    return;
}