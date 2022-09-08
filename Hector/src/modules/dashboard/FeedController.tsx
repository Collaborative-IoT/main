import { Room, ScheduledRoom, User, UserPreview } from "../ws/entities";
import isElectron from "is-electron";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { useCurrentRoomIdStore } from "../../global-stores/useCurrentRoomIdStore";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { FeedHeader } from "../../ui/FeedHeader";
import { RoomCard } from "../../ui/RoomCard";
import { MiddlePanel } from "../layouts/GridPanels";
import { EditScheduleRoomModalController } from "../scheduled-rooms/EditScheduleRoomModalController";
import { ScheduledRoomCard } from "../scheduled-rooms/ScheduledRoomCard";
import { CreateRoomModal } from "./CreateRoomModal";
import { MainContext } from "../../api_context/api_based";
import { CommunicationRoom } from "@collaborative/arthur";
import { Look } from "./no_rooms.svg";
import { InfoText } from "../../ui/InfoText";
import SvgOutlineGlobe from "../../icons/NewIcon";
import { BubbleText } from "../../ui/BubbleText";
import { Tag } from "../../ui/Tag";

interface FeedControllerProps {}

const EmptyRoomsPlaceHolders = (
    info: string,
    tags: [string[]],
    openRoomModal: any
) => {
    return (
        <button
            className="flex flex-col w-full p-4 rounded-lg transition duration-200 ease-in-out bg-primary-800 hover:bg-primary-700"
            onClick={() => {
                openRoomModal(true);
            }}
        >
            <div className="flex justify-between w-full space-x-4">
                <div className="flex flex-shrink-0">
                    <BubbleText live={true}>{info}</BubbleText>
                </div>
            </div>
            <div className="flex mt-4 space-x-2">
                {tags.map((tag: string[]) => {
                    return <Tag key={tag[0]}>{tag[1]}</Tag>;
                })}
            </div>
        </button>
    );
};

const Page = ({
    cursor,
    isLastPage,
    onLoadMore,
    openRoomModal,
}: {
    cursor: number;
    isLastPage: boolean;
    isOnlyPage: boolean;
    onLoadMore: (o: number) => void;
    openRoomModal: any;
}) => {
    const { dash_live_rooms, client } = useContext(MainContext);
    const rooms: CommunicationRoom[] = dash_live_rooms ? dash_live_rooms : [];
    if (!rooms) {
        return null;
    }
    if (rooms.length > 0) {
        return (
            <>
                {rooms.map((room: CommunicationRoom) => (
                    <RoomCard
                        onClick={() => {
                            console.log("clickeddd", client);
                            //we make this request that sends the join type
                            //once the join type is gathered, the defined callbacks
                            //sends the join request in api_based.tsx
                            client!!.send("join_type", {
                                room_id: room.room_id,
                            });
                        }}
                        key={room.room_id}
                        title={room.details.name}
                        subtitle={Array.from(
                            Object.values(room.people_preview_data)
                        )
                            .slice(0, 3)
                            .map((x: any) => x.display_name)
                            .join(", ")}
                        avatars={Array.from(
                            Object.values(room.people_preview_data)
                        )
                            .map((x: any) => x.avatar_url!)
                            .slice(0, 3)
                            .filter((x) => x !== null)}
                        listeners={room.num_of_people_in_room}
                        tags={[]}
                    />
                ))}
            </>
        );
    } else {
        return EmptyRoomsPlaceHolders(
            "No Rooms! Be the first to create one 😎",
            [
                ["2", "Safety"],
                ["23", "Clubhouse"],
                ["-", "Twitch"],
            ],
            openRoomModal
        );
    }
};

export const FeedController: React.FC<FeedControllerProps> = ({}) => {
    const [cursors, setCursors] = useState([0]);
    const [roomModal, setRoomModal] = useState(false);
    const currentRoomId = 20;
    const screenType = "fullscreen";
    let mb = "mb-7";
    if (screenType === "fullscreen") {
        if (currentRoomId) {
            mb = "mb-15";
        } else {
            mb = "mb-8";
        }
    }
    return (
        <MiddlePanel
            stickyChildren={
                <FeedHeader
                    actionTitle={"Create Room"}
                    onActionClicked={() => {
                        setRoomModal(true);
                    }}
                    title={"Current Rooms"}
                />
            }
        >
            <div className={`flex flex-1 flex-col ${mb}`} data-testid="feed">
                <div className="flex flex-col space-y-4">
                    {
                        ///scheduled rooms go here
                    }
                    {cursors.map((cursor, i) => (
                        <Page
                            key={cursor}
                            cursor={cursor}
                            isOnlyPage={cursors.length === 1}
                            onLoadMore={(c) => setCursors([...cursors, c])}
                            isLastPage={i === cursors.length - 1}
                            openRoomModal={setRoomModal}
                        />
                    ))}
                </div>
            </div>
            {roomModal && (
                <CreateRoomModal onRequestClose={() => setRoomModal(false)} />
            )}
        </MiddlePanel>
    );
};
