import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { SolidFriends } from "../../icons";
import { isServer } from "../../lib/isServer";
import { ApiPreloadLink } from "../../shared-components/ApiPreloadLink";
import { useConn } from "../../shared-hooks/useConn";
import { useIntersectionObserver } from "../../shared-hooks/useIntersectionObserver";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { CenterLoader } from "../../ui/CenterLoader";
import { Spinner } from "../../ui/Spinner";
import { SingleUser } from "../../ui/UserAvatar";
import { MiddlePanel } from "../layouts/GridPanels";

interface FollowingControllerProps {}

const Page = ({
    cursor,
    isLastPage,
    onLoadMore,
    username,
    isFollowing,
}: {
    isFollowing: boolean;
    username: string;
    cursor: number;
    isLastPage: boolean;
    isOnlyPage: boolean;
    onLoadMore: (o: number) => void;
}) => {
    const conn = useConn();
    const { setNode, entry } = useIntersectionObserver({});
    const { t } = useTypeSafeTranslation();
    const vars: [string, boolean, number] = [username, isFollowing, cursor];
    const [shouldLoadMore, setShouldLoadMore] = useState(false);

    const styles = "text-primary-200 text-center";
    if (true)
        return (
            <div className={styles}>{t("pages.followList.followingNone")}</div>
        );
    else
        return (
            <div className={styles}>{t("pages.followList.noFollowers")}</div>
        );

    return <></>;
};

export const FollowingController: React.FC<FollowingControllerProps> = ({}) => {
    const { pathname, query } = useRouter();
    const isFollowing = pathname.includes("/following");
    const username = typeof query.username === "string" ? query.username : "";
    const [cursors, setCursors] = useState([0]);

    return (
        <MiddlePanel>
            <div className="flex flex-col mb-6">
                {cursors.map((cursor, i) => (
                    <Page
                        username={username}
                        isFollowing={isFollowing}
                        key={cursor}
                        cursor={cursor}
                        isOnlyPage={cursors.length === 1}
                        onLoadMore={(c) => setCursors([...cursors, c])}
                        isLastPage={i === cursors.length - 1}
                    />
                ))}
            </div>
        </MiddlePanel>
    );
};
