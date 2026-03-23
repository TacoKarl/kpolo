const graphQlUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    "/graphql";

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

export function getRefreshUrl() {
    return `${getApiBaseUrl()}/refresh`;
}

export function getLogoutUrl() {
    return `${getApiBaseUrl()}/logout`;
}

export function getLoginUrl() {
    return `${getApiBaseUrl()}/auth/login`;
}

export function getRegisterUrl() {
    return `${getApiBaseUrl()}/auth/register`;
}
