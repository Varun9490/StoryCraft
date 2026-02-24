import mongoSanitize from 'mongo-sanitize';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

export function sanitizeBody(body) {
    if (!body || typeof body !== 'object') return body;
    const sanitized = mongoSanitize(body);
    return deepSanitize(sanitized);
}

function deepSanitize(obj) {
    if (typeof obj === 'string') return DOMPurify.sanitize(obj, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
    if (Array.isArray(obj)) return obj.map(deepSanitize);
    if (obj && typeof obj === 'object') {
        return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, deepSanitize(v)]));
    }
    return obj;
}

export function isValidMongoId(id) {
    return validator.isMongoId(String(id));
}

export function isValidEmail(email) {
    return validator.isEmail(String(email));
}

export function isValidURL(url) {
    return validator.isURL(String(url), { protocols: ['http', 'https'], require_protocol: true });
}

export function sanitizeSearchQuery(query) {
    if (!query) return '';
    return String(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);
}
