import { useRouter } from "next/router";
import React, { useRef, useContext } from "react";
import { useDeafStore } from "../../global-stores/useDeafStore";
import { SolidDeafened, SolidDeafenedOff, SolidMicrophone } from "../../icons";
import SvgSolidMicrophoneOff from "../../icons/SolidMicrophoneOff";
import { useCurrentRoomFromCache } from "../../shared-hooks/useCurrentRoomFromCache";
import { useCurrentRoomInfo } from "../../shared-hooks/useCurrentRoomInfo";
import { useSetDeaf } from "../../shared-hooks/useSetDeaf";
import { useSetMute } from "../../shared-hooks/useSetMute";
import { BoxedIcon } from "../../ui/BoxedIcon";
import { MultipleUsers } from "../../ui/UserAvatar";
import { a, useSpring, config } from "react-spring";
import { useDrag } from "react-use-gesture";
import { useBoundingClientRect } from "../../shared-hooks/useBoundingClientRect";
import { useLeaveRoom } from "../../shared-hooks/useLeaveRoom";
import { useMuteStore } from "../../global-stores/useMuteStore";
import { useMediaQuery } from "react-responsive";
import { MainContext } from "../../api_context/api_based";

export const FloatingRoomInfo: React.FC = () => {
    const { muted } = useMuteStore();
    const setMute = useSetMute();
    const { deafened } = useDeafStore();
    const setDeaf = useSetDeaf();
    const router = useRouter();
    const { leaveRoom } = useLeaveRoom();
    const is1Cols = useMediaQuery({ minWidth: 800 });

    const [{ y }, api] = useSpring(() => ({ y: 0 }));
    const floatingRef = useRef(null);
    const bbox = useBoundingClientRect(floatingRef);
    const { current_room_id, dash_live_rooms, current_room_base_data } =
        useContext(MainContext);
    const close = () => {
        api({
            y: bbox ? bbox.height : 60,
            immediate: false,
            config: { ...config.default },
            onRest: () => leaveRoom(),
        });
    };

    const bind = useDrag(
        ({ last, down, movement: [, my] }) => {
            api.start({
                y: down ? my : 0,
                config: { mass: 1, tension: 500, friction: 50 },
            });

            if (last && bbox) {
                if (y.get() > bbox.height / 3) {
                    close();
                }
            }
        },
        {
            axis: "y",
            bounds: {
                top: 0,
                left: 0,
                right: 0,
            },
            useTouch: true,
        }
    );

    if (current_room_id == null || current_room_base_data == null) {
        return null;
    }

    const gather_room_previews = () => {
        let previews = [];
        if (dash_live_rooms != null) {
            for (var room of dash_live_rooms) {
                if (room.room_id == current_room_id) {
                    previews = Array.from(
                        Object.values(room.people_preview_data)
                    )
                        .map((x: any) => x.avatar_url!)
                        .slice(0, 3)
                        .filter((x) => x !== null);
                }
            }
        }
        return previews;
    };

    const bgStyles = {
        opacity: y.to([0, bbox ? bbox.height : 60], [1, 0], "clamp"),
    };

    return (
        <a.div
            data-testid="floating-room-container"
            className="flex fixed left-0 bg-primary-900 items-center w-full border-t border-primary-700 px-3 justify-between animate-breathe-slow"
            style={{
                bottom: is1Cols ? 0 : 60,
                zIndex: 9,
                y,
                ...bgStyles,
            }}
            {...bind()}
            ref={floatingRef}
        >
            <div className="flex overflow-hidden">
                <div className="mr-2">
                    <MultipleUsers srcArray={gather_room_previews()} />
                </div>
                <button
                    onClick={() => {
                        router.push(`/room/${current_room_id}`);
                    }}
                    style={{ minWidth: 100 }}
                    className="truncate text-primary-100 text-left font-bold mr-3"
                >
                    {current_room_base_data!!.details.name}
                </button>
            </div>

            <div className="flex py-2 overflow-hidden">
                <BoxedIcon
                    data-testid="mute"
                    hover
                    onClick={() => {
                        setMute(!muted);
                    }}
                    className={`w-7 mr-2 ${
                        !muted && !deafened ? "bg-accent text-button" : ""
                    }`}
                >
                    {muted || deafened ? (
                        <SvgSolidMicrophoneOff />
                    ) : (
                        <SolidMicrophone />
                    )}
                </BoxedIcon>

                <BoxedIcon
                    data-testid="deafen"
                    hover
                    onClick={() => {
                        setDeaf(!deafened);
                    }}
                    className={`w-7 ${deafened ? "bg-accent" : ""}`}
                >
                    {deafened ? <SolidDeafenedOff /> : <SolidDeafened />}
                </BoxedIcon>
            </div>
        </a.div>
    );
};
