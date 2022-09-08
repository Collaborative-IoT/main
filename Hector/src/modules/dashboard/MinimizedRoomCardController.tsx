import { useRouter } from "next/router";
import React, { useContext } from "react";
import { Room, UserPreview, UserWithFollowInfo } from "../ws/entities";
import { useDeafStore } from "../../global-stores/useDeafStore";
import { useMuteStore } from "../../global-stores/useMuteStore";
import { useCurrentRoomInfo } from "../../shared-hooks/useCurrentRoomInfo";
import { useLeaveRoom } from "../../shared-hooks/useLeaveRoom";
import { useSetDeaf } from "../../shared-hooks/useSetDeaf";
import { useSetMute } from "../../shared-hooks/useSetMute";
import { MinimizedRoomCard } from "../../ui/MinimizedRoomCard";
import { MainContext } from "../../api_context/api_based";

export const MinimizedRoomCardController: React.FC = ({}) => {
    const { canSpeak } = useCurrentRoomInfo();
    const { muted } = useMuteStore();
    const { deafened } = useDeafStore();
    const setMute = useSetMute();
    const setDeaf = useSetDeaf();
    const router = useRouter();

    const { current_room_base_data, current_room_id, all_users_in_room } =
        useContext(MainContext);

    if (!current_room_base_data || !current_room_id || !all_users_in_room) {
        return null;
    }
    const dt = new Date(
        current_room_base_data.created_at
            .slice(0, current_room_base_data.created_at.length - 4)
            .concat("Z")
    );
    console.log(dt);

    return (
        <MinimizedRoomCard
            onFullscreenClick={() => router.push(`/room/${current_room_id}`)}
            leaveLoading={false}
            room={{
                name: current_room_base_data.details.name,
                speakers: [],
                roomStartedAt: dt,
                myself: {
                    isDeafened: deafened,
                    isSpeaker: canSpeak,
                    isMuted: muted,
                    leave: () => {},
                    switchDeafened: () => {
                        setDeaf(!deafened);
                    },
                    switchMuted: () => {
                        setMute(!muted);
                    },
                },
            }}
        />
    );
};
