// Apollo client settings
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { setContext } from "@apollo/client/link/context";
import { from, mergeMap } from "rxjs";
import { getAccessToken, refreshAccessToken } from "./auth";
import { getGraphqlUrl } from "./apiUrls";

export function makeApolloClient() {
    const authLink = setContext((_, { headers }) => {
        const token = getAccessToken();
        return {
            headers: {
                ...headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        };
    });

    const errorLink = onError(({ graphQLErrors, operation, forward }) => {
        const hasAuthError = graphQLErrors?.some(
            (err) => err.extensions?.code === "UNAUTHENTICATED"
        );

        if (!hasAuthError || !forward) return;

        const { refreshAttempted } = operation.getContext();
        if (refreshAttempted) return;

        operation.setContext({ refreshAttempted: true });

        return from(refreshAccessToken()).pipe(
            mergeMap((token) => {
                if (token) {
                    operation.setContext(({ headers = {} }) => ({
                        headers: {
                            ...headers,
                            Authorization: `Bearer ${token}`,
                        },
                    }));
                }
                return forward(operation);
            })
        );
    });

    return new ApolloClient({
        link: ApolloLink.from([
            errorLink,
            authLink,
            new HttpLink({
                uri: getGraphqlUrl(),
                // If your backend uses cookies/session auth, you probably want this:
                credentials: "include",
            }),
        ]),
        cache: new InMemoryCache(),
    });
}
