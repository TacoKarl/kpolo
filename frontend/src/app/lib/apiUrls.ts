const graphQlUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3000/graphql";

export function getGraphqlUrl() {
    return graphQlUrl;
}

export function getApiBaseUrl() {
    try {
        const url = new URL(graphQlUrl);
        url.pathname = url.pathname.replace(/\/graphql\/?$/, "");
        return url.toString().replace(/\/$/, "");
    } catch {
        return graphQlUrl.replace(/\/graphql\/?$/, "");
    }
}

export function getRefreshCookieUrl() {
    return `${getApiBaseUrl()}/login`;
}

export function getRefreshUrl() {
    return `${getApiBaseUrl()}/refresh`;
}

export function getLogoutUrl() {
    return `${getApiBaseUrl()}/logout`;
}
