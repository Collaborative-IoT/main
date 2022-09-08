import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { MainContext } from "../../api_context/api_based";
import { useCurrentRoomIdStore } from "../../global-stores/useCurrentRoomIdStore";
import { ContributorBadge, StaffBadge } from "../../icons/badges";
import { useWrappedConn } from "../../shared-hooks/useConn";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import useWindowSize from "../../shared-hooks/useWindowSize";
import { ProfileBlock } from "../../ui/ProfileBlock";
import { UpcomingRoomsCard } from "../../ui/UpcomingRoomsCard";
import { badge, UserSummaryCard } from "../../ui/UserSummaryCard";
import { CreateScheduleRoomModal } from "../scheduled-rooms/CreateScheduledRoomModal";
import { EditProfileModal } from "../user/EditProfileModal";
import { MinimizedRoomCardController } from "./MinimizedRoomCardController";

interface ProfileBlockControllerProps {}

export const ProfileBlockController: React.FC<
    ProfileBlockControllerProps
> = ({}) => {
    const [upcomingCount, setUpcomingCount] = useState(3);
    const { currentRoomId } = useCurrentRoomIdStore();
    const { user, client } = useContext(MainContext);
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [showCreateScheduleRoomModal, setShowCreateScheduleRoomModal] =
        useState(false);
    const { current_room_id } = useContext(MainContext);
    const { height } = useWindowSize();
    const badges: badge[] = [];

    useEffect(() => {
        if (height && height < 780) {
            setUpcomingCount(2);
        } else {
            setUpcomingCount(3);
        }
    }, [height]);

    return (
        <>
            <EditProfileModal
                isOpen={showEditProfileModal}
                onRequestClose={() => setShowEditProfileModal(false)}
            />
            {showCreateScheduleRoomModal ? (
                <CreateScheduleRoomModal
                    onScheduledRoom={() => {}}
                    onRequestClose={() => setShowCreateScheduleRoomModal(false)}
                />
            ) : null}
            <ProfileBlock
                top={
                    current_room_id ? (
                        <MinimizedRoomCardController />
                    ) : (
                        <UserSummaryCard
                            onClick={() => setShowEditProfileModal(true)}
                            badges={badges}
                            website=""
                            isOnline={false}
                            id={user ? user.user_id : 0}
                            username={user ? user.username : "Loading..."}
                            displayName={
                                user ? user.display_name : "Loading..."
                            }
                            numFollowers={user ? user.num_followers : 0}
                            numFollowing={user ? user.num_following : 0}
                            avatarUrl={
                                user
                                    ? user.avatar_url
                                    : "https://www.google.com/url?sa=i&url=https%3A%2F%2Fm.facebook.com%2Fpages%2FTeam-Placeholder%2F1880375082219980&psig=AOvVaw3PpBMJDXlMQnKfdUjMATuA&ust=1646110097717000&source=images&cd=vfe&ved=0CAsQjRxqFwoTCOCg557MofYCFQAAAAAdAAAAABAE"
                            }
                        />
                    )
                }
                bottom={
                    <UpcomingRoomsCard
                        onCreateScheduledRoom={() =>
                            setShowCreateScheduleRoomModal(true)
                        }
                        rooms={[]}
                    />
                }
            />
        </>
    );
};
