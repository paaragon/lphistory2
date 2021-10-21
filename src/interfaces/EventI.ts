import { TAB } from '../utils/constants';

const participants: { [key: string]: { id: string, loginName: string } } = {};

export const enum EVENT_TYPE {
    DAEMON = 'daemon',
    TRANSFER = 'transfer',
    MESSAGE = 'message',
    START = 'start',
    END = 'end',
    PARTICIPANT = 'participant',
}

export default interface EventI {
    date: Date;
    eventType: EVENT_TYPE;
    getPrintStr: (machine: boolean) => string;
}

export class DaemonEvent implements EventI {
    date: Date;
    eventType: EVENT_TYPE;
    sentTo: string;
    errorMsg: string;
    errorCode: string;

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

        return `> ` + `[${participant}]`.yellow + ` ${from} ` + `==`.yellow + ` ${this.reason} ` + `==>`.yellow + ` ${to}`;
    }
}

export class MessageEvent implements EventI {
    date: Date;
    from: string;
    fromType: 'Consumer' | 'Agent';
    message: string;
    eventType: EVENT_TYPE;

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
}

export class StartEvent implements EventI {
    date: Date;
    conversationId: string;
    eventType: EVENT_TYPE;

    constructor(date: Date, conversationId: string) {
        this.date = date;
        this.conversationId = conversationId;
        this.eventType = EVENT_TYPE.START;
    }

    getPrintStr() {
        return `>>> Start ${this.conversationId}`.green;
    }
}

export class EndEvent implements EventI {
    date: Date;
    conversationId: string;
    eventType: EVENT_TYPE;

    constructor(date: Date, conversationId: string) {
        this.date = date;
        this.conversationId = conversationId;
        this.eventType = EVENT_TYPE.END;
    }

    getPrintStr() {
        return `<<< End ${this.conversationId}`.red;
    }
}

export class ParticipantEvent implements EventI {
    date: Date;
    participantId: string;
    participantLoginName: string;
    permission: string;
    eventType: EVENT_TYPE;

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
        return `${TAB}> ${participant}: ${this.permission}`.grey;
    }
}