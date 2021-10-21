import DaemonRecordI from '../interfaces/daemon/daemon-record';
import EventI, { DaemonEvent, EndEvent, MessageEvent, ParticipantEvent, StartEvent, TransferEvent } from '../interfaces/EventI';
import { ConversationHistoryRecord } from '../interfaces/liveperson/SearchConversationResponse';


export default function buildEvents(conversation: ConversationHistoryRecord, daemonRecords: DaemonRecordI[],): EventI[] {
    const events: EventI[] = [];
    events.push(new StartEvent(new Date(conversation.info.startTimeL), conversation.info.conversationId));

    if (conversation.info.endTimeL !== -1) {
        events.push(new EndEvent(new Date(conversation.info.endTimeL), conversation.info.conversationId));
    }

    for (const msg of conversation.messageRecords) {
        events.push(new MessageEvent(new Date(msg.timeL), msg.participantId, msg.sentBy, msg.messageData));
    }

    for (const transfer of conversation.transfers) {
        events.push(new TransferEvent(new Date(transfer.timeL), transfer.by, transfer.sourceSkillName, transfer.sourceSkillId.toString(), transfer.targetSkillName, transfer.targetSkillId.toString(), transfer.reason));
    }

    for (const participant of conversation.agentParticipants) {
        events.push(new ParticipantEvent(new Date(participant.timeL), participant.agentId, participant.agentLoginName, participant.permission));
    }

    for (const daemon of daemonRecords) {
        events.push(new DaemonEvent(new Date(daemon.task_date), daemon.sent_to, daemon.sent_err_msg, daemon.sent_err_code));
    }

    events.sort((a, b) => a.date > b.date ? 1 : -1);

    return events;
}