import { JoinRoomAndGetInfoResponse, RoomUser } from "../ws/entities";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useCurrentRoomIdStore } from "../../global-stores/useCurrentRoomIdStore";
import { useDeafStore } from "../../global-stores/useDeafStore";
import { useMuteStore } from "../../global-stores/useMuteStore";
import { SolidPlus } from "../../icons";
import { useConn } from "../../shared-hooks/useConn";
import { useCurrentRoomInfo } from "../../shared-hooks/useCurrentRoomInfo";
import { useLeaveRoom } from "../../shared-hooks/useLeaveRoom";
import { useScreenType } from "../../shared-hooks/useScreenType";
import { useSetDeaf } from "../../shared-hooks/useSetDeaf";
import { useSetMute } from "../../shared-hooks/useSetMute";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { RoomPanelIconBar } from "../../ui/RoomPanelIconBar";
import { RoomChatInput } from "./chat/RoomChatInput";
import { RoomChatList } from "./chat/RoomChatList";
import { RoomChatMentions } from "./chat/RoomChatMentions";
import { useRoomChatStore } from "./chat/useRoomChatStore";
import RoomOverlay from "./mobile/RoomOverlay";
import { RoomSettingsModal } from "./RoomSettingModal";
import { MainContext } from "../../api_context/api_based";
import { useContext } from "react";

export const RoomPanelIconBarController: React.FC<{ users: [] }> = ({
    users,
}) => {
    const { t } = useTypeSafeTranslation();
    const { muted } = useMuteStore();
    const setMute = useSetMute();
    const { deafened } = useDeafStore();
    const setDeaf = useSetDeaf();
    const { canSpeak, isCreator, canIAskToSpeak } = useCurrentRoomInfo();
    const { push } = useRouter();
    const { currentRoomId } = useCurrentRoomIdStore();
    const [settings_open, set_settings_open] = useState(false);
    const [open, toggleOpen] = useRoomChatStore((s) => [s.open, s.toggleOpen]);
    const screenType = useScreenType();
    const { set_current_room_id, current_room_id, client } =
        useContext(MainContext);

    useEffect(() => {
        if (settings_open) {
            client?.send("get_room_blocked", {});
        }
    }, [settings_open]);
    return (
        <div className="flex flex-col w-full">
            <RoomSettingsModal
                open={settings_open}
                onRequestClose={() => set_settings_open(false)}
            />
            {screenType === "fullscreen" ? (
                <RoomOverlay
                    mute={
                        canSpeak
                            ? { isMuted: muted, onMute: () => setMute(!muted) }
                            : undefined
                    }
                    canSpeak={canSpeak}
                    deaf={{
                        isDeaf: deafened,
                        onDeaf: () => setDeaf(!deafened),
                    }}
                    onInvitePeopleToRoom={() => {
                        push(
                            `/room/[id]/invite`,
                            `/room/${currentRoomId}/invite`
                        );
                    }}
                    onRoomSettings={() => {}}
                    askToSpeak={() => {}}
                    setListener={() => {}}
                />
            ) : (
                <RoomPanelIconBar
                    onToggleChat={() => toggleOpen()}
                    mute={
                        canSpeak
                            ? { isMuted: muted, onMute: () => setMute(!muted) }
                            : undefined
                    }
                    deaf={{
                        isDeaf: deafened,
                        onDeaf: () => setDeaf(!deafened),
                    }}
                    onLeaveRoom={() => {
                        client?.send("leave_room", {
                            room_id: current_room_id,
                        });
                        set_current_room_id(null);
                    }}
                    onInvitePeopleToRoom={() => {
                        push(
                            `/room/[id]/invite`,
                            `/room/${currentRoomId}/invite`
                        );
                    }}
                    onRoomSettings={
                        isCreator
                            ? () => {
                                  set_settings_open(true);
                              }
                            : undefined
                    }
                />
            )}
            {screenType === "1-cols" && open
                ? createPortal(
                      // this is kind of hard to embed in the page
                      // so tmp solution of portaling this and absolute positioning for fullscreen
                      <div
                          className={`flex absolute flex-col w-full z-30 bg-primary-800 h-full rounded-8`}
                      >
                          <button
                              onClick={() => toggleOpen()}
                              className="flex justify-between items-center w-full text-primary-100 p-4 text-2xl"
                          >
                              <span>{t("modules.roomChat.title")}</span>
                              {/* Just a temporary solution to make close chat ux better, until we have the design in figma */}
                              <SolidPlus className={`transform rotate-45`} />
                          </button>
                          <div className="flex overflow-y-auto flex-1">
                              <div
                                  className={`flex flex-1 w-full flex-col mt-4`}
                              >
                                  <RoomChatList />
                                  <RoomChatMentions users={users} />
                                  <RoomChatInput />
                              </div>
                          </div>
                      </div>,
                      document.querySelector("#__next")!
                  )
                : null}
        </div>
    );
};
