import { UserWithFollowInfo } from "../modules/ws/entities";
import Link from "next/link";
import React, { MouseEventHandler } from "react";
import { useTypeSafeTranslation } from "../shared-hooks/useTypeSafeTranslation";
import { SingleUser } from "./UserAvatar/SingleUser";
import { FollowInfo } from "@collaborative/arthur";

export interface FriendOnlineType {
    username: string;
    avatarUrl: string;
    isOnline: boolean;
    activeRoom?: {
        name: string;
        link?: string;
    };
}

export interface FriendsOnlineProps {
    onlineFriendList: UserWithFollowInfo[];
    onlineFriendCount?: number;
    showMoreAction?: MouseEventHandler<HTMLDivElement>;
}

export const FollowerOnline: React.FC<FollowInfo> = ({
    username,
    avatar_url: avatar,
    online,
    room_id,
}) => {
    const truncateString = (str: string, num: number) => {
        if (str.length <= num) {
            return str;
        }
        return str.slice(0, num) + "...";
    };

    return (
        <div className="flex py-3 w-full">
            <SingleUser
                size="sm"
                isOnline={online}
                src={avatar}
                username={truncateString(username, 12)}
            />
            <div className="flex ml-3 flex-col overflow-hidden justify-center">
                <h5 className="text-primary-100 font-bold">
                    {truncateString(username, 12)}
                </h5>
                {room_id && room_id != -1 ? (
                    <Link href={`/room/[id]`} as={`/room/${room_id}`}>
                        <a
                            className={`hover:underline text-primary-300 truncate block`}
                        >
                            {room_id}
                        </a>
                    </Link>
                ) : null}
            </div>
        </div>
    );
};

export const FollowersOnlineWrapper: React.FC<{
    onlineFriendCount?: number;
}> = ({ onlineFriendCount, children }) => {
    const { t } = useTypeSafeTranslation();
    return (
        <div
            className="pb-5 w-full flex flex-col flex-1 overflow-y-auto"
            data-testid="friends-online"
        >
            <h4 className="text-primary-100">Your People</h4>
            <h6 className="text-primary-300 mt-3 text-sm font-bold uppercase">
                You Follow{" "}
                {onlineFriendCount !== undefined
                    ? `(${onlineFriendCount})`
                    : null}
            </h6>
            <div className="flex flex-col mt-3 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-700 overflow-x-hidden">
                {children}
            </div>
        </div>
    );
};

export const FollowersOnlineShowMore: React.FC<{ onClick?: () => void }> = ({
    onClick,
}) => {
    const { t } = useTypeSafeTranslation();
    return (
        <button
            className="underline text-primary-300 font-bold mt-4 cursor-pointer"
            onClick={onClick}
            data-testid="show-more-btn"
        >
            {t("components.followingOnline.showMore")}
        </button>
    );
};
