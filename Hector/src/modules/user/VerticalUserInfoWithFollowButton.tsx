import { UserWithFollowInfo } from "../ws/entities";
import React, { useContext } from "react";
import { SolidFriends, SolidFriendsAdd } from "../../icons";
import { useConn } from "../../shared-hooks/useConn";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { VerticalUserInfo } from "../../ui/VerticalUserInfo";
import { UserPreviewModalContext } from "../room/UserPreviewModalProvider";
import { MainContext } from "../../api_context/api_based";
import { BaseUser } from "@collaborative/arthur";

interface VerticalUserInfoControllerProps {
    idOrUsernameUsedForQuery: string;
}

export const VerticalUserInfoWithFollowButton: React.FC<
    VerticalUserInfoControllerProps
> = ({}) => {
    const { t } = useTypeSafeTranslation();
    const { user, all_users_in_room, client } = useContext(MainContext);
    const { data, setData } = useContext(UserPreviewModalContext);

    const convert_base_to_normal = (data: BaseUser) => {
        return {
            ...data,
        };
    };
    return (
        <>
            {user!!.user_id == +data!!.userId ? (
                <VerticalUserInfo user={convert_base_to_normal(user)} />
            ) : (
                <VerticalUserInfo
                    user={all_users_in_room!!.get(data!!.userId)}
                />
            )}

            <div className={`flex mb-5 items-center w-full justify-center`}>
                {/* @todo add real icon */}
                {user!!.user_id == +data!!.userId ? null : (
                    <Button
                        loading={false}
                        onClick={() => {
                            if (client) {
                                if (
                                    all_users_in_room!!.get(data!!.userId)!!
                                        .you_are_following
                                ) {
                                    client!!.send("unfollow_user", {
                                        user_id: +data!!.userId,
                                    });
                                } else {
                                    client!!.send("follow_user", {
                                        user_id: +data!!.userId,
                                    });
                                }
                                setData(null);
                            }
                        }}
                        size="small"
                        color={true ? "secondary" : "primary"}
                        icon={true ? null : <SolidFriendsAdd />}
                    >
                        {all_users_in_room!!.get(data!!.userId)!!
                            .you_are_following
                            ? t("pages.viewUser.unfollow")
                            : t("pages.viewUser.followHim")}
                    </Button>
                )}
            </div>
        </>
    );
};
