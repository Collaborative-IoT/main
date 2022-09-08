import { Room, ScheduledRoom, User, UserPreview } from "../ws/entities";
import router, { useRouter } from "next/router";
import { validate } from "uuid";
import React, { useState } from "react";
import { InfoText } from "../../ui/InfoText";
import { MainLayout } from "../layouts/MainLayout";
import { MiddlePanel } from "../layouts/GridPanels";
import { EditScheduleRoomModalController } from "../scheduled-rooms/EditScheduleRoomModalController";
import { ScheduledRoomCard } from "../scheduled-rooms/ScheduledRoomCard";
import { HeaderController } from "../display/HeaderController";
import { PageHeader } from "../../ui/mobile/MobileHeader";
interface ViewScheduledRoomPageProps {}

type GetScheduledRoomById = { room: ScheduledRoom | null };

export const ViewScheduledRoomPage: React.FC<
    ViewScheduledRoomPageProps
> = ({}) => {
    const [deleted, setDeleted] = useState(false);
    const { query } = useRouter();
    const id = typeof query.id === "string" ? query.id : "";
    const key = `/scheduled-room/${id}`;
    const userPreview: UserPreview = {
        id: "222",
        displayName: "tester",
        numFollowers: 2,
        avatarUrl: "",
    };

    const room: Room = {
        id: "222",
        numPeopleInside: 2,
        voiceServerId: "222",
        creatorId: "23423",
        peoplePreviewList: [userPreview],
        autoSpeaker: false,
        inserted_at: "2",
        chatMode: "default",
        name: "test room 445",
        chatThrottle: 2000,
        isPrivate: false,
        description: "test desc",
    };
    const user: User = {
        youAreFollowing: true,
        username: "test",
        online: true,
        numFollowing: 2,
        numFollowers: 2,
        lastOnline: "test",
        id: "223232",
        followsYou: true,
        botOwnerId: "test",
        contributions: 2,
        staff: true,
        displayName: "test",
        currentRoomId: "23323",
        currentRoom: room,
        bio: "test",
        avatarUrl: "test",
        bannerUrl: "test",
        whisperPrivacySetting: "on",
    };
    const data: ScheduledRoom = {
        roomId: "55",
        description: "test2",
        scheduledFor: new Date().toString(),
        numAttending: 2,
        name: "test",
        id: "321",
        creatorId: "34",
        creator: user,
    };

    return (
        <MainLayout
            mobileHeader={
                <PageHeader
                    title="Scheduled Room"
                    onBackClick={() => router.push("/dash")}
                />
            }
        >
            <HeaderController title={data.name} embed={{}} />
            <MiddlePanel>
                {deleted ? (
                    <InfoText>deleted</InfoText>
                ) : (
                    <EditScheduleRoomModalController onScheduledRoom={() => {}}>
                        {({ onEdit }) => (
                            <ScheduledRoomCard
                                info={data}
                                onDeleteComplete={() => setDeleted(true)}
                                noCopyLinkButton
                                onEdit={() =>
                                    onEdit({
                                        scheduleRoomToEdit: data!,
                                        cursor: "",
                                    })
                                }
                            />
                        )}
                    </EditScheduleRoomModalController>
                )}
            </MiddlePanel>
        </MainLayout>
    );
};
