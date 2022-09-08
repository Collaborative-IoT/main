import React, { useState, useContext } from "react";
import {
    SolidChatBubble,
    SolidDeafened,
    SolidDeafenedOff,
    SolidFriendsAdd,
    SolidMicrophone,
    SolidMicrophoneOff,
    SolidSettings,
    SolidNew,
    BotIcon,
    SolidCloud,
    SolidMoon,
    OutlineGlobe,
    ServerIcon,
} from "../icons";
import SvgSolidMoon from "../icons/SolidMoon";
import { useScreenType } from "../shared-hooks/useScreenType";
import { useTypeSafeTranslation } from "../shared-hooks/useTypeSafeTranslation";
import { BoxedIcon } from "./BoxedIcon";
import { Button } from "./Button";
import { ModeContext } from "../mode_context/room_mode";
interface RoomPanelIconBarProps {
    mute?: {
        isMuted: boolean;
        onMute: () => void;
    };
    deaf?: {
        isDeaf: boolean;
        onDeaf: () => void;
    };
    onInvitePeopleToRoom?: () => void;
    onRoomSettings?: () => void;
    onLeaveRoom(): void;
    onToggleChat(): void;
}

export const RoomPanelIconBar: React.FC<RoomPanelIconBarProps> = ({
    mute,
    deaf,
    onInvitePeopleToRoom,
    onRoomSettings,
    onLeaveRoom,
    onToggleChat,
}) => {
    const { t } = useTypeSafeTranslation();
    const screenType = useScreenType();
    const {
        integration_mode_activated,
        set_integration_mode,
        integration_add_open,
        set_integration_add,
        set_integration_server_select_open,
    } = useContext(ModeContext);
    return (
        <div className="flex flex-wrap justify-center bg-primary-700 rounded-b-8 py-3 px-4 w-full sm:justify-between">
            <div className="flex my-1 justify-between w-full sm:my-0 sm:w-auto">
                {mute ? (
                    <BoxedIcon
                        transition
                        hover={!mute.isMuted}
                        className={`mx-1 w-11 h-6.5 ${
                            !mute.isMuted && !deaf?.isDeaf
                                ? `bg-accent hover:bg-accent-hover text-button`
                                : ``
                        }`}
                        color="800"
                        title={t(
                            "components.bottomVoiceControl.toggleMuteMicBtn"
                        )}
                        onClick={() => mute.onMute()}
                        data-testid="mute"
                    >
                        {mute.isMuted || deaf?.isDeaf ? (
                            <SolidMicrophoneOff width="20" height="20" />
                        ) : (
                            <SolidMicrophone width="20" height="20" />
                        )}
                    </BoxedIcon>
                ) : null}
                {deaf ? (
                    <BoxedIcon
                        transition
                        hover={deaf.isDeaf}
                        className={`mx-1 h-6.5 w-6.5 ${
                            deaf.isDeaf
                                ? `bg-accent hover:bg-accent-hover text-button`
                                : ``
                        }`}
                        color="800"
                        title={t(
                            "components.bottomVoiceControl.toggleDeafMicBtn"
                        )}
                        onClick={() => deaf.onDeaf()}
                        data-testid="deafen"
                    >
                        {deaf.isDeaf ? (
                            <SolidDeafenedOff width="20" height="20" />
                        ) : (
                            <SolidDeafened width="20" height="20" />
                        )}
                    </BoxedIcon>
                ) : null}

                {screenType === "1-cols" ? (
                    <BoxedIcon
                        transition
                        className="mx-1 h-6.5 w-6.5"
                        color="800"
                        onClick={onToggleChat}
                        data-testid="chat"
                    >
                        <SolidChatBubble />
                    </BoxedIcon>
                ) : null}
                {onRoomSettings ? (
                    <BoxedIcon
                        transition
                        className="mx-1 h-6.5 w-6.5"
                        color="800"
                        title={t("components.bottomVoiceControl.settings")}
                        onClick={onRoomSettings}
                        data-testid="room-settings"
                    >
                        <SolidSettings width="20" height="20" />
                    </BoxedIcon>
                ) : null}

                <BoxedIcon
                    transition
                    className={`mx-1 h-6.5 w-6.5 ${
                        integration_mode_activated
                            ? `bg-accent hover:bg-accent-hover text-button`
                            : ``
                    }`}
                    color="800"
                    title={t("components.bottomVoiceControl.settings")}
                    onClick={() => {
                        if (integration_mode_activated) {
                            set_integration_mode(false);
                        } else {
                            set_integration_mode(true);
                        }
                    }}
                    data-testid="room-settings"
                >
                    <SolidCloud width="26" height="26"></SolidCloud>
                </BoxedIcon>
                {integration_mode_activated ? (
                    <BoxedIcon
                        transition
                        className="mx-1 h-6.5 w-6.5"
                        color="800"
                        title={t("components.bottomVoiceControl.settings")}
                        onClick={() => {
                            set_integration_add(true);
                        }}
                        data-testid="room-settings"
                    >
                        <SolidNew width="40" height="20"></SolidNew>
                    </BoxedIcon>
                ) : null}

                {integration_mode_activated ? (
                    <BoxedIcon
                        transition
                        className="mx-1 h-6.5 w-6.5"
                        color="800"
                        title={t("components.bottomVoiceControl.settings")}
                        onClick={() => {
                            set_integration_server_select_open(true);
                        }}
                        data-testid="room-settings"
                    >
                        <ServerIcon width="40" height="20"></ServerIcon>
                    </BoxedIcon>
                ) : null}
            </div>

            <Button
                transition
                className={`my-1 mx-1 w-full text-base sm:my-0 sm:mx-0 sm:w-1`}
                color="secondary-800"
                onClick={() => {
                    onLeaveRoom();
                }}
                data-testid="leave-room"
            >
                {t("components.bottomVoiceControl.leave")}
            </Button>
        </div>
    );
};
