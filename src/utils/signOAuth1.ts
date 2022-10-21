import * as crypt from 'crypto';
import * as OAuth from 'oauth-1.0a';

export default function (request: { url: string, method: string, body?: any }, credentials: { consumerKey: string, consumerSecret: string, tokenKey: string, tokenSecret: string }) {
    const oauth = new OAuth.default({
        consumer: { key: credentials.consumerKey, secret: credentials.consumerSecret },
        signature_method: 'HMAC-SHA1',
        hash_function(baseString: string, key: string) {
            return crypt
                .createHmac('sha1', key)
                .update(baseString)
                .digest('base64')
        },
    })

    const authorization = oauth.authorize(request, {
        key: credentials.tokenKey,
        secret: credentials.tokenSecret,
    });

    return JSON.parse(JSON.stringify(oauth.toHeader(authorization)));
}