"use client";

import { ApolloProvider } from "@apollo/client/react";
import { useMemo } from "react";
import { makeApolloClient } from "../lib/apolloClient";

export default function ApolloAppProvider({
                                              children,
                                          }: {
    children: React.ReactNode;
}) {
    const client = useMemo(() => makeApolloClient(), []);
    return <ApolloProvider client={client}>{children}</ApolloProvider>;
}