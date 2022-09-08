import isElectron from "is-electron";
import { useCallback } from "react";
import { useCurrentRoomIdStore } from "../global-stores/useCurrentRoomIdStore";
import { useRoomChatStore } from "../modules/room/chat/useRoomChatStore";
import { closeVoiceConnections } from "../modules/webrtc/WebRtcApp";

export const useLeaveRoom = () => {
    return {
        leaveRoom: useCallback(() => {}, []),
    };
};
