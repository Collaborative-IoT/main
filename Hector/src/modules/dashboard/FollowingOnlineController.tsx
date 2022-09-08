import { Room, UserPreview, UserWithFollowInfo } from "../ws/entities";
import React, { useContext, useState } from "react";
import { useConn } from "../../shared-hooks/useConn";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import {
    FollowerOnline,
    FollowersOnlineShowMore,
    FollowersOnlineWrapper,
} from "../../ui/FollowersOnline";
import { InfoText } from "../../ui/InfoText";
import { MainContext } from "../../api_context/api_based";
import { FollowInfo } from "@collaborative/arthur";

interface FriendsOnlineControllerProps {}

const Page: React.FC<{
    cursor: number;
    onLoadMore: (cursor: number) => void;
    isLastPage: boolean;
    isOnlyPage: boolean;
}> = ({ cursor, isLastPage, isOnlyPage, onLoadMore }) => {
    const { t } = useTypeSafeTranslation();
    const { im_following } = useContext(MainContext);
    if (im_following && im_following.length == 0) {
        return <h5 className={`text-primary-100`}>You don't follow anyone</h5>;
    }

    return (
        <>
            {im_following
                ? im_following.map((follow_info: FollowInfo) => {
                      return <FollowerOnline {...follow_info} />;
                  })
                : null}
            {isLastPage ? <FollowersOnlineShowMore onClick={() => {}} /> : null}
        </>
    );
};

export const FollowingOnlineController: React.FC<
    FriendsOnlineControllerProps
> = ({}) => {
    const [cursors, setCursors] = useState<number[]>([0]);

    return (
        <FollowersOnlineWrapper>
            {cursors.map((c, i) => (
                <Page
                    key={c}
                    cursor={c}
                    onLoadMore={(nc) => setCursors([...cursors, nc])}
                    isLastPage={false}
                    isOnlyPage={cursors.length === 1}
                />
            ))}
        </FollowersOnlineWrapper>
    );
};
