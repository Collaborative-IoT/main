import { User } from "@collaborative/arthur";
import React, { useContext } from "react";
import { MainContext } from "../../api_context/api_based";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { CenterLoader } from "../../ui/CenterLoader";
import { InfoText } from "../../ui/InfoText";
import { SingleUser } from "../../ui/UserAvatar";

interface BlockedFromRoomUsersProps {}

export const GET_BLOCKED_FROM_ROOM_USERS = "get_blocked_from_room_users";

const UnbanButton = ({ user_id }: { user_id: number }) => {
    const { t } = useTypeSafeTranslation();
    const { client, current_room_id } = useContext(MainContext);
    return (
        <Button
            loading={false}
            onClick={() => {
                client?.send("unblock_user_from_room", {
                    user_id,
                    room_id: current_room_id,
                });
                client?.send("get_room_blocked", {});
            }}
            size={`small`}
        >
            {t("components.blockedFromRoomUsers.unban")}
        </Button>
    );
};

export const BlockedFromRoomUsersPage = () => {
    const { t } = useTypeSafeTranslation();
    const { current_room_blocked_users } = useContext(MainContext);
    if (
        current_room_blocked_users == null ||
        current_room_blocked_users.length == 0
    ) {
        return (
            <InfoText className={`mt-2`}>
                {t("components.blockedFromRoomUsers.noBans")}
            </InfoText>
        );
    }

    return (
        <>
            {current_room_blocked_users?.map((data: User) => (
                <div
                    className={`flex border-b border-solid w-full py-4 px-2 items-center`}
                    key={data.user_id}
                >
                    <div className="flex">
                        <SingleUser size="md" src={data.avatar_url} />
                    </div>
                    <div className={`flex ml-4 flex-1 mr-4`}>
                        <div className={`flex text-lg font-bold`}>
                            {data.display_name}
                        </div>
                        <div
                            style={{ color: "" }}
                            className={`flex font-mono font-light`}
                        >
                            &nbsp;(@{data.username})
                        </div>
                    </div>
                    <UnbanButton user_id={data.user_id} />
                </div>
            ))}
        </>
    );
};

export const BlockedFromRoomUsers: React.FC<
    BlockedFromRoomUsersProps
> = ({}) => {
    const { t } = useTypeSafeTranslation();

    return (
        <>
            <div className={`flex mt-4 flex-col text-primary-100 pt-3`}>
                <h1 className={`text-xl`}>
                    {t("components.blockedFromRoomUsers.header")}
                </h1>
                <div className="flex flex-col">
                    <BlockedFromRoomUsersPage />
                </div>
            </div>
        </>
    );
};
