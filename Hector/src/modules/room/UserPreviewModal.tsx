import {
    JoinRoomAndGetInfoResponse,
    RoomUser,
    UserWithFollowInfo,
} from "../ws/entities";
import React, { useContext, useEffect } from "react";
import { useDebugAudioStore } from "../../global-stores/useDebugAudio";
import { useConn } from "../../shared-hooks/useConn";
import { useCurrentRoomInfo } from "../../shared-hooks/useCurrentRoomInfo";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { Modal } from "../../ui/Modal";
import { Spinner } from "../../ui/Spinner";
import { VerticalUserInfoWithFollowButton } from "../user/VerticalUserInfoWithFollowButton";
import { AudioDebugConsumerSection } from "./AudioDebugConsumerSection";
import { RoomChatMessage, useRoomChatStore } from "./chat/useRoomChatStore";
import { UserPreviewModalContext } from "./UserPreviewModalProvider";
import { VolumeSliderController } from "./VolumeSliderController";
import { MainContext } from "../../api_context/api_based";

const UserPreview: React.FC<{
    message?: RoomChatMessage;
    id: string;
    isMe: boolean;
    iAmCreator: boolean;
    iAmMod: boolean;
    isCreator: boolean;
    roomPermissions?: RoomUser["roomPermissions"];
    onClose: () => void;
}> = ({
    id,
    isCreator,
    isMe,
    iAmCreator,
    iAmMod,
    message,
    roomPermissions,
    onClose,
}) => {
    const {
        user,
        all_users_in_room,
        client,
        current_room_id,
        current_room_permissions,
    } = useContext(MainContext);
    const { t } = useTypeSafeTranslation();
    const bannedUserIdMap = useRoomChatStore((s) => s.bannedUserIdMap);
    const { debugAudio } = useDebugAudioStore();
    const curr_permissions = current_room_permissions!![id]!!;
    const canDoModStuffOnThisUser =
        !isMe &&
        (iAmCreator || iAmMod) &&
        !isCreator &&
        (curr_permissions.is_mod || iAmCreator);
    console.log("can do", canDoModStuffOnThisUser);

    // [shouldShow, key, onClick, text]
    const buttonData = [
        [
            iAmCreator && !isMe,
            "changeRoomCreator",
            () => {
                client!!.send("give_owner", {
                    roomId: current_room_id!!,
                    peerId: +id,
                });
                onClose();
            },
            t("components.modals.profileModal.makeRoomCreator"),
        ],
        [
            !isMe && iAmCreator,
            "makeMod",
            () => {
                client!!.send("change_user_mod_status", {
                    new_status: curr_permissions.is_mod ? false : true,
                    user_id: +id,
                });
                onClose();
            },
            curr_permissions.is_mod
                ? t("components.modals.profileModal.unmod")
                : t("components.modals.profileModal.makeMod"),
        ],
        [
            canDoModStuffOnThisUser &&
                !curr_permissions.is_speaker &&
                curr_permissions.asked_to_speak,
            "addSpeakerButton",
            () => {
                client!!.send("add_speaker", {
                    roomId: current_room_id!!,
                    peerId: +id,
                });
                onClose();
            },
            t("components.modals.profileModal.addAsSpeaker"),
        ],
        [
            canDoModStuffOnThisUser && curr_permissions.is_speaker,
            "moveToListenerButton",
            () => {
                client!!.send("remove_speaker", {
                    roomId: current_room_id!!,
                    peerId: +id,
                });
                onClose();
            },
            t("components.modals.profileModal.moveToListener"),
        ],
        [
            canDoModStuffOnThisUser &&
                !(id in bannedUserIdMap) &&
                (iAmCreator || !curr_permissions.is_mod),
            "banFromChat",
            () => {
                onClose();
            },
            t("components.modals.profileModal.banFromChat"),
        ],
        [
            canDoModStuffOnThisUser &&
                id in bannedUserIdMap &&
                (iAmCreator || !curr_permissions.is_mod),
            "unbanFromChat",
            () => {
                onClose();
            },
            t("components.modals.profileModal.unBanFromChat"),
        ],
        [
            canDoModStuffOnThisUser && (iAmCreator || !curr_permissions.is_mod),
            "banFromRoom",
            () => {
                client!!.send("block_user_from_room", {
                    user_id: +id,
                    room_id: current_room_id!!,
                });
                onClose();
            },
            t("components.modals.profileModal.banFromRoom"),
        ],
        [
            isMe &&
                !iAmCreator &&
                (curr_permissions.asked_to_speak ||
                    curr_permissions.is_speaker),
            "goBackToListener",
            () => {
                if (curr_permissions.asked_to_speak) {
                    client!!.send("lower_hand", {
                        roomId: current_room_id!!,
                        peerId: +id,
                    });
                } else {
                    client!!.send("remove_speaker", {
                        roomId: current_room_id!!,
                        peerId: +id,
                    });
                }

                onClose();
            },
            t("components.modals.profileModal.goBackToListener"),
        ],
        [
            !!message,
            "deleteMessage",
            () => {
                if (message?.id) {
                    onClose();
                }
            },
            t("components.modals.profileModal.deleteMessage"),
        ],
    ] as const;

    return (
        <div className={`flex flex-col w-full`}>
            <div className={`flex bg-primary-900 flex-col`}>
                <VerticalUserInfoWithFollowButton
                    idOrUsernameUsedForQuery={id}
                />
            </div>
            {!isMe && (isCreator || curr_permissions.is_speaker) ? (
                <div className={`flex pb-3 bg-primary-800`}>
                    <VolumeSliderController userId={id} />
                </div>
            ) : null}
            <div className="flex px-6 flex-col bg-primary-800">
                {debugAudio ? <AudioDebugConsumerSection userId={id} /> : null}
                {buttonData.map(([shouldShow, key, onClick, text]) => {
                    return shouldShow ? (
                        <Button
                            color="secondary"
                            className={`my-1 text-base`}
                            key={key}
                            onClick={onClick}
                        >
                            {text}
                        </Button>
                    ) : null;
                })}
            </div>
        </div>
    );
};

export const UserPreviewModal: React.FC<{}> = ({}) => {
    const { isCreator: iAmCreator, isMod } = useCurrentRoomInfo();
    const { data, setData } = useContext(UserPreviewModalContext);
    const {
        user,
        all_users_in_room,
        current_room_permissions,
        current_room_base_data,
        client,
    } = useContext(MainContext);
    useEffect(() => {
        if (data && client) {
            client.send("single_user_data", { user_id: +data.userId });
        }
    }, [data]);
    return (
        <Modal
            variant="userPreview"
            onRequestClose={() => setData(null)}
            isOpen={!!data}
        >
            {
                // make sure our data exists
                // we need the user to have permissions and
                // we need to have their data along with our data
                !data ? null : (
                    <UserPreview
                        id={data.userId}
                        isCreator={
                            current_room_base_data!!.creator_id === +data.userId
                        }
                        roomPermissions={null}
                        iAmCreator={
                            user!!.user_id ===
                            current_room_base_data!!.creator_id
                        }
                        isMe={user!!.user_id === +data.userId}
                        iAmMod={
                            current_room_permissions!![user!!.user_id].is_mod
                        }
                        message={data.message}
                        onClose={() => setData(null)}
                    />
                )
            }
        </Modal>
    );
};
