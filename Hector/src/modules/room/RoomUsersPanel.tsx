import { JoinRoomAndGetInfoResponse } from "../ws/entities";
import isElectron from "is-electron";
import React, { useEffect, useContext } from "react";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { RoomSectionHeader } from "../../ui/RoomSectionHeader";
import { useSplitUsersIntoSections } from "./useSplitUsersIntoSections";
import { useSplitPassiveData } from "./useSplitPassiveData";
import { useScreenType } from "../../shared-hooks/useScreenType";
import { useMediaQuery } from "react-responsive";
import { AudioDebugPanel } from "../debugging/AudioDebugPanel";
import { useDebugAudioStore } from "../../global-stores/useDebugAudio";
import { useMuteStore } from "../../global-stores/useMuteStore";
import { useDeafStore } from "../../global-stores/useDeafStore";
import { isWebRTCEnabled } from "../../lib/isWebRTCEnabled";
import { useIsElectronMobile } from "../../global-stores/useElectronMobileStore";
import { MainContext } from "../../api_context/api_based";
import {
    InitRoomData,
    RoomUpdate,
    SingleUserDataResults,
    SingleUserPermissionResults,
    User,
} from "@collaborative/arthur";
import { fail } from "assert";
import { ModeContext } from "../../mode_context/room_mode";

interface RoomUsersPanelProps extends JoinRoomAndGetInfoResponse {}

let ipcRenderer: any = undefined;
if (isElectron()) {
    ipcRenderer = window.require("electron").ipcRenderer;
}

export const RoomUsersPanel: React.FC<{}> = (props) => {
    const { askingToSpeak, listeners, speakers, canIAskToSpeak } =
        useSplitUsersIntoSections({});
    const { bots, number_of_bots } = useSplitPassiveData();
    const { t } = useTypeSafeTranslation();
    const me = {};
    const {
        user,
        client,
        all_users_in_room,
        set_all_room_permissions,
        set_all_users_in_room,
        current_room_base_data,
        current_room_id,
        set_base_room_data,
    } = useContext(MainContext);
    const { integration_mode_activated } = useContext(ModeContext);

    const muted = useMuteStore().muted;
    const deafened = useDeafStore().deafened;
    let gridTemplateColumns = "repeat(3, minmax(0, 1fr))";

    if (!integration_mode_activated) {
        gridTemplateColumns = "repeat(5, minmax(0, 1fr))";
    }
    const screenType = useScreenType();
    const isBigFullscreen = useMediaQuery({ minWidth: 640 });

    const omit = (obj: any, omitKey: any) => {
        return Object.keys(obj).reduce((result, key) => {
            if (key !== omitKey) {
                result[key] = obj[key];
            }
            return result;
        }, {});
    };

    if (isBigFullscreen && screenType === "fullscreen") {
        gridTemplateColumns = "repeat(4, minmax(0, 1fr))";
    } else if (screenType === "fullscreen") {
        gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
    }
    // we need smaller rows(less items in each row)
    // because we will be rendering larger components
    if (
        isBigFullscreen &&
        screenType === "fullscreen" &&
        integration_mode_activated == true
    ) {
        gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
    } else if (
        screenType === "fullscreen" &&
        integration_mode_activated == true
    ) {
        gridTemplateColumns = "repeat(2, minmax(0, 1fr))";
    }
    useEffect(() => {
        if (isElectron()) {
            ipcRenderer.send("@room/data", {
                currentRoom: props,
                muted,
                deafened,
                me: me || {},
            });
        }
    }, [props, muted, deafened, me]);
    useEffect(() => {
        client!!.client_sub.new_user_joined = (user_id: string) => {
            if (current_room_id && user) {
                let user_id_num: number = +user_id;
                client!!.send("single_user_data", { user_id: user_id_num });
                client!!.send("single_user_permissions", {
                    roomId: current_room_id,
                    peerId: user_id_num,
                });
            }
        };

        client!!.client_sub.single_user_data = (
            data: SingleUserDataResults
        ) => {
            if (set_all_users_in_room && data.user_id != user!!.user_id) {
                set_all_users_in_room((prev: Map<String, User>) => {
                    prev.set(data.user_id.toString(), data.data);
                    return prev;
                });
            }
        };

        client!!.client_sub.single_user_permissions = (
            data: SingleUserPermissionResults
        ) => {
            if (set_all_room_permissions) {
                set_all_room_permissions((prev: any) => {
                    let new_data = { ...prev };
                    new_data[data.user_id.toString()] = data.data;
                    return new_data;
                });
            }
        };

        client!!.client_sub.user_left_room = (user_id: String) => {
            if (set_all_room_permissions && set_all_users_in_room) {
                set_all_room_permissions((prev: any) => {
                    return omit(prev, user_id);
                });

                set_all_users_in_room((prev: Map<String, User>) => {
                    prev.delete(user_id);
                    return prev;
                });
            }
        };

        client!!.client_sub.room_update = (data: RoomUpdate) => {
            if (current_room_base_data && set_base_room_data) {
                set_base_room_data((prev: InitRoomData) => {
                    prev.details.chat_throttle = data.chat_throttle;
                    prev.details.description = data.description;
                    prev.details.is_private = !data.public;
                    prev.details.name = data.name;
                    return prev;
                });
            }
        };
        client!!.client_sub.new_owner = (user_id: String) => {
            if (set_base_room_data) {
                set_base_room_data((prev: InitRoomData) => {
                    //should be owner_id but fine now as creator id
                    prev.creator_id = +user_id;
                    return prev;
                });
            }
        };

        client!!.client_sub.new_mod = (user_id: String) => {
            if (set_all_room_permissions) {
                set_all_room_permissions((prev: any) => {
                    let new_data = { ...prev };
                    new_data[user_id].is_mod = true;
                    return new_data;
                });
            }
        };
        client!!.client_sub.removed_mod = (user_id: String) => {
            if (set_all_room_permissions) {
                set_all_room_permissions((prev: any) => {
                    let new_data = { ...prev };
                    new_data[user_id].is_mod = false;
                    return new_data;
                });
            }
        };

        client!!.client_sub.speaker_removed = (user_id: String) => {
            if (set_all_room_permissions) {
                set_all_room_permissions((prev: any) => {
                    let new_data = { ...prev };
                    new_data[user_id].is_speaker = false;
                    //the server doesn't broadcast this update
                    //so we need to handle it on the FE automatically.
                    new_data[user_id].asked_to_speak = false;
                    return new_data;
                });
            }
        };

        client!!.client_sub.user_hand_raised = (user_id: String) => {
            if (set_all_room_permissions) {
                set_all_room_permissions((prev: any) => {
                    let new_data = { ...prev };
                    new_data[user_id].asked_to_speak = true;
                    return new_data;
                });
            }
        };

        client!!.client_sub.user_hand_lowered = (user_id: String) => {
            if (set_all_room_permissions) {
                set_all_room_permissions((prev: any) => {
                    let new_data = { ...prev };
                    new_data[user_id].asked_to_speak = false;
                    return new_data;
                });
            }
        };

        client!!.client_sub.new_speaker = (user_id: String) => {
            if (set_all_room_permissions) {
                set_all_room_permissions((prev: any) => {
                    let new_data = { ...prev };
                    new_data[user_id].is_speaker = true;
                    return new_data;
                });
            }
        };
    }, [client, current_room_id]);

    const { debugAudio } = useDebugAudioStore();

    return (
        <div
            className={`flex pt-4 px-4 flex-1 ${
                screenType !== "fullscreen"
                    ? "bg-primary-800"
                    : "bg-primary-900"
            }`}
            id={"public-room"}
            style={
                useIsElectronMobile() ? { marginTop: "38px" } : { top: "0px" }
            }
        >
            <div className="w-full block">
                {!isWebRTCEnabled() ? (
                    <div className="text-accent bg-primary-600 p-1 mb-2">
                        Your browser does not support WebRTC or it is disabled.
                    </div>
                ) : null}
                {debugAudio ? <AudioDebugPanel /> : null}
                <div
                    style={{
                        gridTemplateColumns,
                    }}
                    className={`w-full grid gap-5`}
                >
                    <RoomSectionHeader
                        title={
                            integration_mode_activated
                                ? "Bots"
                                : t("pages.room.speakers")
                        }
                        tagText={
                            integration_mode_activated
                                ? number_of_bots
                                : "" +
                                  (canIAskToSpeak
                                      ? speakers.length - 1
                                      : speakers.length)
                        }
                    />
                    {integration_mode_activated ? bots : speakers}
                    {askingToSpeak.length && !integration_mode_activated ? (
                        <RoomSectionHeader
                            title={t("pages.room.requestingToSpeak")}
                            tagText={"" + askingToSpeak.length}
                        />
                    ) : null}
                    {!integration_mode_activated ? askingToSpeak : null}
                    {listeners.length && !integration_mode_activated ? (
                        <RoomSectionHeader
                            title={t("pages.room.listeners")}
                            tagText={"" + listeners.length}
                        />
                    ) : null}
                    {integration_mode_activated ? null : listeners}
                    <div className={`flex h-3 w-full col-span-full`}></div>
                </div>
            </div>
        </div>
    );
};
