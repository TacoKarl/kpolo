// Apollo client settings
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const uri =
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:3000/graphql"; // local fallback

export function makeApolloClient() {
    return new ApolloClient({
        link: new HttpLink({
            uri,
            // If your backend uses cookies/session auth, you probably want this:
            credentials: "include",
        }),
        cache: new InMemoryCache(),
    });
}