import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { useCurrentRoomIdStore } from "../../global-stores/useCurrentRoomIdStore";
import { SolidFriends } from "../../icons";
import { isServer } from "../../lib/isServer";
import { ApiPreloadLink } from "../../shared-components/ApiPreloadLink";
import { useWrappedConn } from "../../shared-hooks/useConn";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { PageComponent } from "../../types/PageComponent";
import { Button } from "../../ui/Button";
import { CenterLoader } from "../../ui/CenterLoader";
import { InfoText } from "../../ui/InfoText";
import { Input } from "../../ui/Input";
import { RoomCard } from "../../ui/RoomCard";
import { SingleUser } from "../../ui/UserAvatar";
import { DefaultDesktopLayout } from "../layouts/DefaultDesktopLayout";
import { MiddlePanel } from "../layouts/GridPanels";
import { useGetRoomByQueryParam } from "./useGetRoomByQueryParam";
import { HeaderController } from "../display/HeaderController";
import { FeedHeader } from "../../ui/FeedHeader";

interface InviteRoomPageProps {}

const InviteButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const [invited, setInvited] = useState(false);
    const { t } = useTypeSafeTranslation();
    return (
        <Button
            size="small"
            disabled={invited}
            onClick={() => {
                onClick();
                setInvited(true);
            }}
        >
            {invited
                ? t("components.inviteButton.invited")
                : t("components.inviteButton.inviteToRoom")}
        </Button>
    );
};

const Page = ({
    cursor,
    isLastPage,
    onLoadMore,
}: {
    cursor: number;
    isLastPage: boolean;
    isOnlyPage: boolean;
    onLoadMore: (o: number) => void;
}) => {
    const conn = useWrappedConn();
    const { t } = useTypeSafeTranslation();

    return (
        <>
            <HeaderController embed={{}} title="Invite" />
        </>
    );
};

export const InviteRoomPage: PageComponent<InviteRoomPageProps> = ({}) => {
    const { t } = useTypeSafeTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState(false);
    const [cursors, setCursors] = useState([0]);

    return (
        <DefaultDesktopLayout>
            <MiddlePanel>
                <CenterLoader />
            </MiddlePanel>
        </DefaultDesktopLayout>
    );
};

InviteRoomPage.ws = true;
