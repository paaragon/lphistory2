import { TAB } from '../utils/constants';
import { ConversationHistoryInfo, ConversationHistoryTransfer } from './liveperson/SearchConversationResponse';

const participants: { [key: string]: { id: string, loginName: string } } = {};

export const enum EVENT_TYPE {
    DAEMON = 'daemon',
    TRANSFER = 'transfer',
    MESSAGE = 'message',
    START = 'start',
    END = 'end',
    PARTICIPANT = 'participant',
}

export const enum ALIGNMENT {
    LEFT = 'left',
    CENTER = 'center',
}

export default interface EventI {
    date: Date;
    eventType: EVENT_TYPE;
    getPrintStr: (machine: boolean) => string;
    getFillCharacter: () => string;
    alignment: ALIGNMENT,
}

export class DaemonEvent implements EventI {
    date: Date;
    eventType: EVENT_TYPE;
    sentTo: string;
    errorMsg: string;
    errorCode: string;
    alignment = ALIGNMENT.LEFT;

    constructor(date: Date, sentTo: string, errorMsg: string, errorCode: string) {
        this.date = date;
        this.sentTo = sentTo;
        this.eventType = EVENT_TYPE.DAEMON;
        this.errorMsg = errorMsg;
        this.errorCode = errorCode;
    }

    getPrintStr(machine: boolean) {
        const info = machine ? this.errorCode : this.errorMsg;
        return `${TAB}` + `[Daemon Check]`.magenta + ` ${this.sentTo} - ${info}`.grey;
    }

    getFillCharacter() {
        return '-'.grey;
    }
}

export class TransferEvent implements EventI {
    date: Date;
    by: string;
    from: string;
    fromId: string;
    to: string;
    toId: string;
    reason: string;
    eventType: EVENT_TYPE;
    alignment = ALIGNMENT.LEFT;

    constructor(date: Date, by: string, from: string, fromId: string, to: string, toId: string, reason: string) {
        this.date = date;
        this.by = by;
        this.from = from;
        this.fromId = fromId;
        this.to = to;
        this.toId = toId;
        this.reason = reason;
        this.eventType = EVENT_TYPE.TRANSFER;
    }

    getPrintStr(machine: boolean) {
        let participant: string;
        let from: string;
        let to: string;
        if (machine) {
            participant = this.by;
            from = this.fromId;
            to = this.toId;
        } else {
            participant = participants[this.by] ? participants[this.by].loginName : this.by;
            from = this.from;
            to = this.to;
        }

        return `❯ ` + `[${participant}]`.yellow + ` ${from} ` + `→`.yellow + ` ${this.reason} `.grey + `→`.yellow + ` ${to}`;
    }

    getFillCharacter() {
        return '-'.grey;
    }
}

export class MessageEvent implements EventI {
    date: Date;
    from: string;
    fromType: 'Consumer' | 'Agent';
    message: string;
    eventType: EVENT_TYPE;
    alignment = ALIGNMENT.LEFT;

    constructor(date: Date, from: string, fromType: 'Consumer' | 'Agent', message: {
        msg: { text: string; }, file: { fileType: string },
    }) {
        this.date = date;
        this.from = from;
        this.fromType = fromType;
        if (message.file) {
            this.message = `[${message.file.fileType} ADJUNTO]`;
        } else {
            this.message = message.msg.text;
        }
        this.eventType = EVENT_TYPE.MESSAGE;
    }

    getPrintStr(machine: boolean) {
        const msg = this.message.replace(/\r?\n|\r|\t/g, ' ');
        let participant: string;
        if (machine) {
            participant = `[${this.from}]`;
        } else {
            if (this.fromType === 'Agent') {
                participant = `[${participants[this.from] ? participants[this.from].loginName : this.from}]`;
            } else {
                participant = '[Consumer]';
            }
        }

        participant = this.fromType === 'Agent' ? participant.blue : participant.green;

        return `${TAB}` + `${participant}` + ` ${msg}`;
    }

    getFillCharacter() {
        return '-'.grey;
    }
}

export class StartEvent implements EventI {
    date: Date;
    conversationId: string;
    initialSkillId: string;
    initialSkillName: string;
    eventType: EVENT_TYPE;
    alignment = ALIGNMENT.CENTER;

    constructor(date: Date, info: ConversationHistoryInfo, transfers: ConversationHistoryTransfer[]) {
        this.date = date;
        this.conversationId = info.conversationId;
        this.eventType = EVENT_TYPE.START;
        this.initialSkillId = transfers && transfers.length > 0 ? transfers[0].sourceSkillId.toString() : info.latestSkillId.toString();
        this.initialSkillName = transfers && transfers.length > 0 ? transfers[0].sourceSkillName : info.latestSkillName;
    }

    getPrintStr(machine?: boolean) {
        const skill = machine ? this.initialSkillId : this.initialSkillName;
        return `❯❯❯ Start`.green + ` → `.yellow + `${skill}`;
    }

    getFillCharacter() {
        return '❯'.green;
    }
}

export class EndEvent implements EventI {
    date: Date;
    conversationId: string;
    eventType: EVENT_TYPE;
    reason: string;
    reasonDescription: string;
    alignment = ALIGNMENT.CENTER;

    constructor(date: Date, conversationId: string, reason: string, reasonDescription: string) {
        this.date = date;
        this.conversationId = conversationId;
        this.eventType = EVENT_TYPE.END;
        this.reason = reason;
        this.reasonDescription = reasonDescription;
    }

    getPrintStr() {
        return `❮❮❮ End by: ${this.reason}/${this.reasonDescription}`.red;
    }

    getFillCharacter() {
        return '❮'.red;
    }
}

export class ParticipantEvent implements EventI {
    date: Date;
    participantId: string;
    participantLoginName: string;
    permission: string;
    eventType: EVENT_TYPE;
    alignment = ALIGNMENT.LEFT;

    constructor(date: Date, participantId: string, participantLoginName: string, permission: string) {
        this.date = date;
        this.participantId = participantId;
        this.participantLoginName = participantLoginName;
        this.permission = permission;
        this.eventType = EVENT_TYPE.PARTICIPANT;
        participants[participantId] = { id: participantId, loginName: participantLoginName };
    }

    getPrintStr(machine: boolean) {
        const participant = machine ? this.participantId : this.participantLoginName;
        return `${TAB}❯ ${participant}: ${this.permission}`.grey;
    }

    getFillCharacter() {
        return '-'.grey;
    }
}