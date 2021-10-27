export interface SearchConversationResponse {
    _metadata: SearchConversationMetadata;
    conversationHistoryRecords: ConversationHistoryRecord[];
}

export interface ConversationHistoryRecord {
    info: ConversationHistoryInfo;
    campaign: ConversationHistoryCampaign;
    messageRecords: ConversationHistoryMessageRecord[];
    agentParticipants: ConversationHistoryAgentParticipant[];
    agentParticipantsActive: ConversationHistoryAgentParticipant[];
    consumerParticipants: ConversationHistoryConsumerParticipant[];
    transfers: ConversationHistoryTransfer[];
    interactions: ConversationHistoryInteraction[];
    messageScores: ConversationHistoryMessageScore[];
    messageStatuses: ConversationHistoryMessageStatus[];
    conversationSurveys: any[];
    sdes: ConversationHistorySdes;
}

export interface ConversationHistoryInfo {
    startTime: string;
    startTimeL: number;
    endTime: string;
    endTimeL: number;
    duration: number;
    conversationId: string;
    brandId: string;
    latestAgentId: string;
    latestAgentNickname: string;
    latestAgentFullName: string;
    latestAgentLoginName: string;
    agentDeleted: boolean;
    latestSkillId: number;
    latestSkillName: string;
    source: string;
    closeReason: string,
    closeReasonDescription: string,
    mcs: number;
    alertedMCS: number;
    status: string;
    fullDialogStatus: string;
    firstConversation: boolean;
    latestAgentGroupId: number;
    latestAgentGroupName: string;
    latestQueueState: string;
    isPartial: boolean;
    features: string[]
    appId: string;
    ipAddress: string;
    latestHandlerAccountId: string;
    latestHandlerSkillId: number;
}

export interface ConversationHistoryCampaign {
    campaignEngagementName: string;
    campaignName: string;
    goalName: string;
}

export interface ConversationHistoryMessageRecord {
    type: 'TEXT_PLAIN' | string;
    messageData: {
        msg: {
            text: string;
        },
        file: {
            fileType: string;
        },
    };
    messageId: string;
    audience: string;
    seq: number;
    dialogId: string;
    participantId: string;
    time: string;
    timeL: number;
    sentBy: 'Consumer' | 'Agent';
    contextData: {
        rawMetadata: string;
        structuredMetadata: any[];
    };
}

export interface ConversationHistoryAgentParticipant {
    agentFullName: string;
    agentNickname: string;
    agentLoginName: string;
    agentDeleted: boolean;
    agentId: string;
    agentPid: string;
    userType: string;
    userTypeName: string;
    role: string;
    agentGroupName: string;
    agentGroupId: number;
    time: string;
    timeL: number;
    permission: 'MANAGER' | 'ASSIGNED_AGENT' | 'READER' | string;
    dialogId: string;
}

export interface ConversationHistoryConsumerParticipant {
    participantId: string;
    firstName: string;
    lastName: string;
    token: string;
    email: string;
    phone: string;
    avatarURL: string;
    time: string;
    timeL: number;
    joinTime: string;
    joinTimeL: number;
    consumerName: string;
    dialogId: string;
}

export interface ConversationHistoryTransfer {
    timeL: number;
    time: string;
    assignedAgentId: string;
    targetSkillId: number;
    targetSkillName: string;
    reason: string;
    by: string;
    sourceSkillId: number;
    sourceSkillName: string;
    sourceAgentId: string;
    sourceAgentFullName: string;
    sourceAgentLoginName: string;
    sourceAgentNickname: string;
    dialogId: string;
}

export interface ConversationHistoryInteraction {
    assignedAgentId: string;
    assignedAgentFullName: string;
    assignedAgentLoginName: string;
    assignedAgentNickname: string;
    interactionTimeL: number;
    interactionTime: string;
    interactiveSequence: number;
    dialogId: string;
}

export interface ConversationHistoryMessageScore {
    messageId: string;
    messageRawScore: number;
    mcs: number;
    time: string;
    timeL: number;
}

export interface ConversationHistoryMessageStatus {
    messageId: string;
    seq: number;
    dialogId: string;
    time: string;
    timeL: number;
    participantId: string;
    participantType: 'Agent' | 'Consumer';
    messageDeliveryStatus: 'READ' | 'ACCEPT' | string;
}

export interface ConversationHistorySdes {
    events: ConversationHistorySdesEvent[];
}

export interface ConversationHistorySdesEvent {
    customerInfo?: ConversationHistorySdesEventCustomerInfo;
    personalInfo?: ConversationHistorySdesEventPersonalInfo;
    sdeType: 'CUSTOMER_INFO' | 'PERSONAL_INFO' | string;
    serverTimeStamp: string;
}

export interface ConversationHistorySdesEventCustomerInfo {
    serverTimeStamp: string;
    originalTimeStamp: number;
    customerInfo: {
        customerId: string;
        imei: string;
        companyBranch: string;
    }
}

export interface ConversationHistorySdesEventPersonalInfo {
    contacts: {
        personalContact: {
            email: string;
            phone: string;
            phoneType: string;
            address: string;
            preferredContactMethod: string;
        };
    }[];
}

export interface SearchConversationMetadata {
    count: number;
    self: {
        rel: string;
        href: string;
    };
    prev?: {
        rel: string;
        href: string;
    };
    next?: {
        rel: string;
        href: string;
    };
    shardsStatusResult: {
        partial: boolean;
    }
}