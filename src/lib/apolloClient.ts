import React from "react";
import ReactDOM from "react-dom";
import { ApolloProvider } from "@apollo/react-hooks";
import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink, Observable } from "apollo-link";
import { TokenRefreshLink } from "apollo-link-token-refresh";
import jwtDecode from "jwt-decode";

const cache = new InMemoryCache({});

const requestLink = new ApolloLink(
  (operation, forward) =>
    new Observable(observer => {
      let handle: any;
      Promise.resolve(operation)
        .then(operation => {
          
        })
        .then(() => {
          handle = forward(operation).subscribe({
            next: observer.next.bind(observer),
            error: observer.error.bind(observer),
            complete: observer.complete.bind(observer)
          });
        })
        .catch(observer.error.bind(observer));

      return () => {
        if (handle) handle.unsubscribe();
      };
    })
);

export const client = new ApolloClient({
  link: ApolloLink.from([
    new TokenRefreshLink({
      accessTokenField: "accessToken",
      isTokenValidOrUndefined: () => {
        return true;
      },
      fetchAccessToken: () => {
        return fetch("http://localhost:4000/refresh_token", {
          method: "POST",
          credentials: "include"
        });
      },
      handleFetch: accessToken => {
      },
      handleError: err => {
        console.warn("Your refresh token is invalid. Try to relogin");
        console.error(err);
      }
    }),
    onError(({ graphQLErrors, networkError }) => {
      console.log(graphQLErrors);
      console.log(networkError);
    }),
    requestLink,
    new HttpLink({
      uri: "http://48:00:11:22:4000/graphql",
      credentials: "omit"
    })
  ]),
  cache
});