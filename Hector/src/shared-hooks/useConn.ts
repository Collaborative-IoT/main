import { useContext } from "react";

export const useConn = () => {
    const conn = {
        user: {
            contributions: 40,
            username: "test",
            botOwnerId: 1,
            staff: true,
            avatarUrl: "",
            numFollowers: 10,
            numFollowing: 100,
            bio: "godlike",
            displayName: "RonTheGod",
            id: "",
            online: true,
            lastOnline: Date.now().toString(),
            bannerUrl: "test",
        },
    };
    return conn;
};

export const useWrappedConn = () => {};
