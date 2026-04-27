export const API_BASE_URL = '/api/v1';
export const ARTICLE_STATUS = {
    DRAFT: 0,
    PUBLISHED: 1
};
export const USER_STATUS = {
    DISABLED: 0,
    ACTIVE: 1
};
export const QRCODE_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    PUBLISHED: 'published'
};
export const PERMISSION_MODULES = [
    'article',
    'category',
    'tag',
    'media',
    'user',
    'role',
    'qrcode',
    'dashboard'
];
export const PERMISSION_ACTIONS = [
    'create',
    'read',
    'update',
    'delete'
];
//# sourceMappingURL=constants.js.map