export declare const API_BASE_URL = "/api/v1";
export declare const ARTICLE_STATUS: {
    readonly DRAFT: 0;
    readonly PUBLISHED: 1;
};
export declare const USER_STATUS: {
    readonly DISABLED: 0;
    readonly ACTIVE: 1;
};
export declare const QRCODE_STATUS: {
    readonly PENDING: "pending";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
    readonly PUBLISHED: "published";
};
export declare const PERMISSION_MODULES: readonly ["article", "category", "tag", "media", "user", "role", "qrcode", "dashboard"];
export declare const PERMISSION_ACTIONS: readonly ["create", "read", "update", "delete"];
//# sourceMappingURL=constants.d.ts.map