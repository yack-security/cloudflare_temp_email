import { Hono } from 'hono'

import { getDomains, getPasswords, getBooleanValue, getIntValue, getStringArray, getDefaultDomains, getStringValue, getUserRoles } from './utils';
import { CONSTANTS } from './constants';
import { HonoCustomType, UserRole } from './types';
import { isS3Enabled } from './mails_api/s3_attachment';
import { Jwt } from 'hono/utils/jwt'
import { commonGetUserRole } from './common';

interface UserPayload {
    user_id: number;
    exp: number;
}

const api = new Hono<HonoCustomType>

api.get('/open_api/settings', async (c) => {
    // check header x-custom-auth
    let needAuth = false;
    let addressRegex = null;
    let domains = getDefaultDomains(c);
    let enableAutoReply = null;
    let enableUserCreateEmail = null;
    let enableUserDeleteEmail = null;
    let s3Enabled = null;
    const noLimitSendRole = getStringValue(c.env.NO_LIMIT_SEND_ROLE);
    // check if user has one of the no limit send role. if not, set the domains to the default domains.
    try {
        const token = c.req.raw.headers.get("x-user-token");
        if (token) {
            const rawPayload = await Jwt.verify(token, c.env.JWT_SECRET, "HS256");
            const payload = rawPayload as unknown as UserPayload;
            if (payload.exp && payload.exp > Math.floor(Date.now() / 1000)) {
                const userRole = await commonGetUserRole(c, payload.user_id);
                if (userRole && noLimitSendRole.includes(userRole.role)) {
                    domains = getDomains(c);
                }
                enableAutoReply = getBooleanValue(c.env.ENABLE_AUTO_REPLY);
                enableUserCreateEmail = getBooleanValue(c.env.ENABLE_USER_CREATE_EMAIL);
                enableUserDeleteEmail = getBooleanValue(c.env.ENABLE_USER_DELETE_EMAIL);
                s3Enabled = isS3Enabled(c);
                addressRegex = getStringValue(c.env.ADDRESS_REGEX);
            }
        }
    } catch (e) {
        console.error(e);
    }

    const passwords = getPasswords(c);
    if (passwords && passwords.length > 0) {
        const auth = c.req.raw.headers.get("x-custom-auth");
        needAuth = !auth || !passwords.includes(auth);
    }
    return c.json({
        "title": c.env.TITLE,
        "announcement": getStringValue(c.env.ANNOUNCEMENT),
        "prefix": getStringValue(c.env.PREFIX),
        "addressRegex": addressRegex,
        "minAddressLen": getIntValue(c.env.MIN_ADDRESS_LEN, 1),
        "maxAddressLen": getIntValue(c.env.MAX_ADDRESS_LEN, 30),
        "defaultDomains": getDefaultDomains(c),
        "domains": domains,
        "domainLabels": getStringArray(c.env.DOMAIN_LABELS),
        "needAuth": needAuth,
        "adminContact": c.env.ADMIN_CONTACT,
        "enableUserCreateEmail": enableUserCreateEmail,
        "enableUserDeleteEmail": enableUserDeleteEmail,
        "disableAnonymousUserCreateEmail": getBooleanValue(c.env.DISABLE_ANONYMOUS_USER_CREATE_EMAIL),
        "enableAutoReply": enableAutoReply,
        "enableIndexAbout": getBooleanValue(c.env.ENABLE_INDEX_ABOUT),
        "copyright": c.env.COPYRIGHT,
        "cfTurnstileSiteKey": c.env.CF_TURNSTILE_SITE_KEY,
        "enableWebhook": getBooleanValue(c.env.ENABLE_WEBHOOK),
        "isS3Enabled": s3Enabled,
        "version": CONSTANTS.VERSION,
        "showGithub": !getBooleanValue(c.env.DISABLE_SHOW_GITHUB),
        "disableAdminPasswordCheck": getBooleanValue(c.env.DISABLE_ADMIN_PASSWORD_CHECK)
    });
})

export { api }
