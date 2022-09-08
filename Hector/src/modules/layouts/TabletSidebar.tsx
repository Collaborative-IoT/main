import React, { useState } from "react";
import { SolidPlus } from "../../icons";
import { ApiPreloadLink } from "../../shared-components/ApiPreloadLink";
import { BoxedIcon } from "../../ui/BoxedIcon";
import { SingleUser } from "../../ui/UserAvatar";

interface FriendsOnlineControllerProps {}

const Page: React.FC<{
    cursor: number;
    onLoadMore: (cursor: number) => void;
    isLastPage: boolean;
    isOnlyPage: boolean;
}> = ({ cursor, isLastPage, isOnlyPage, onLoadMore }) => {
    return <></>;
};

export const TabletSidebar: React.FC<FriendsOnlineControllerProps> = ({}) => {
    const [cursors, setCursors] = useState<number[]>([0]);

    return (
        <div
            data-testid="tablet-sidebar-container"
            className="pb-5 w-full flex flex-col flex-1 overflow-y-auto text-primary-100"
        >
            {cursors.map((c, i) => (
                <Page
                    key={c}
                    cursor={c}
                    onLoadMore={(nc) => setCursors([...cursors, nc])}
                    isLastPage={i === cursors.length - 1}
                    isOnlyPage={cursors.length === 1}
                />
            ))}
        </div>
    );
};
