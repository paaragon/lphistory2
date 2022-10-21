import axios, { AxiosResponse } from 'axios';
import ConfigI from '../interfaces/ConfigI';
import ConsumerInfoI from '../interfaces/ConsumerInfoI';
import { SearchConversationRequest } from '../interfaces/liveperson/SearchConversationRequest';
import { ConversationHistoryRecord, ConversationHistorySdesEvent, SearchConversationResponse } from '../interfaces/liveperson/SearchConversationResponse';
import signOAuth1 from '../utils/signOAuth1';

export default {
    getConversationHistory,
    getUserInfo,
}

function getUserInfo(conv: ConversationHistoryRecord): ConsumerInfoI | null {
    const consumer = conv.consumerParticipants[0];

    const ret: ConsumerInfoI = {
        firstName: consumer.firstName,
        lastName: consumer.lastName,
        email: consumer.email,
        phone: consumer.phone,
    };

    const personalInfo: ConversationHistorySdesEvent | undefined = conv.sdes.events.find((e) => e.sdeType === 'PERSONAL_INFO');

    if (!personalInfo) {
        return null;
    }

    if (personalInfo.personalInfo?.contacts) {
        const personalContact = personalInfo.personalInfo.contacts
            .find((c) => c.personalContact)?.personalContact;

        if (personalContact) {
            if (!ret.phone && personalContact.phone) {
                ret.phone = personalContact.phone;
            }

            if (!ret.email && personalContact.email) {
                ret.email = personalContact.email;
            }
        }
    }

    return ret;
}

async function getConversationHistory(conversationId: string, config: ConfigI, tShift: number): Promise<ConversationHistoryRecord> {
    const url = `https://lo.msghist.liveperson.net/messaging_history/api/account/${config.accountId}/conversations/conversation/search`;
    const body = { conversationId };
    const request = {
        url,
        method: 'POST',
        body,
    }

    const authorizationHeader = signOAuth1(request, {
        consumerKey: config.consumerKey,
        consumerSecret: config.consumerSecret,
        tokenKey: config.token,
        tokenSecret: config.tokenSecret,
    });

    if (tShift) {
        authorizationHeader.Authorization = replaceTimestamp(authorizationHeader.Authorization, tShift);
    }

    try {
        const response = await axios.post<SearchConversationRequest, AxiosResponse<SearchConversationResponse>>(url, body, { headers: authorizationHeader });

        return response.data.conversationHistoryRecords[0];
    } catch (e: any) {
        if (e?.response?.headers['www-authenticate']?.indexOf('oauth_timestamp value is unacceptable to the Service Provider') !== -1) {
            return retryWithCorrectTimestamp(conversationId, config, tShift, e.response.headers['www-authenticate']);
        }

        throw e;
    }
}

async function retryWithCorrectTimestamp(conversationId: string, config: ConfigI, tShift: number, wwwAuthenticate: string): Promise<ConversationHistoryRecord> {
    const regex = /oauth_acceptable_timestamps=[0-9]{10}-([0-9]{10})/;
    const m = regex.exec(wwwAuthenticate);
    if (m === null) {
        throw new Error('Imposible to retry Live Person request');
    }

    const maxAcceptableTimestamp = parseInt(m[1], 10);
    const newTshift = Math.trunc((new Date()).getTime() / 1000) - maxAcceptableTimestamp;
    console.log('\nLive Person request failed because unnacceptable timestamp. Recommended --timestamp-shift (-t) param: '.red + newTshift.toString().green);
    console.log('Retrying with --timestamp-shift (-t) '.red + newTshift.toString().green + '\n');
    return getConversationHistory(conversationId, config, newTshift);
}

function replaceTimestamp(oauthHeader: string, tShift: number): string {
    const regex = /oauth_timestamp=\"([0-9]{10})\"/;
    const m = regex.exec(oauthHeader);
    if (m === null) {
        return oauthHeader;
    }
    const newTimestamp = parseInt(m[1], 10) + tShift;

    const newOauthHeader = oauthHeader.replace(regex, `oauth_timestamp="${newTimestamp}"`);

    return newOauthHeader;
}