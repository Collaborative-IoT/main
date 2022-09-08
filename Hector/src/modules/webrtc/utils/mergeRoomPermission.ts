import { RoomPermissions } from "../../ws/entities";

export const mergeRoomPermission = (
    currentRoomPermission: RoomPermissions | null | undefined,
    newRoomPermissions: Partial<RoomPermissions>
) => {
    return {
        ...(currentRoomPermission || {
            askedToSpeak: false,
            isMod: false,
            isSpeaker: false,
        }),
        ...newRoomPermissions,
    };
};
