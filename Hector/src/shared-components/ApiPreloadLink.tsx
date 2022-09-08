import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";

const handlers = {
    following: ({ username }: { username: string }) => ({
        href: "/u/[username]/following",
        as: `/u/${username}/following`,
        onClick: () => {},
    }),
    followers: ({ username }: { username: string }) => ({
        href: "/u/[username]/followers",
        as: `/u/${username}/followers`,
        onClick: () => {},
    }),
    profile: ({ username }: { username: string }) => ({
        href: "/u/[username]",
        as: `/u/${username}`,
        onClick: () => {},
    }),
    room: ({ id }: { id: string }) => ({
        href: "/room/[id]",
        as: `/room/${id}`,
        onClick: () => {},
    }),
};

type Handler = typeof handlers;

type ValueOf<T> = T[keyof T];
type DifferentProps = {
    [K in keyof Handler]: {
        route: K;
        data: Parameters<Handler[K]>[0];
    };
};

// the purpose of this component is to start the query to the api before navigating to the page
// this will result in less loading time for the user
export const ApiPreloadLink: React.FC<ValueOf<DifferentProps>> = ({
    children,
    route,
    data,
    ...props
}) => {
    return <></>;
};

export const usePreloadPush = () => {};
