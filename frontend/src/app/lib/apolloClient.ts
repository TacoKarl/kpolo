// Apollo client settings
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from "@apollo/client";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { SetContextLink } from "@apollo/client/link/context";
import { from, mergeMap } from "rxjs";
import { getAccessToken, refreshAccessToken } from "./auth";
import { getGraphqlUrl } from "./apiUrls";

export function makeApolloClient() {
    const authLink = new SetContextLink((prevContext) => {
        const token = getAccessToken();
        return {
            headers: {
                ...prevContext.headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        };
    });

    const errorLink = new ErrorLink(({ error, operation, forward }) => {
        const hasAuthError = CombinedGraphQLErrors.is(error)
            ? error.errors.some((err) => err.extensions?.code === "UNAUTHENTICATED")
            : false;

        if (!hasAuthError) return;

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
