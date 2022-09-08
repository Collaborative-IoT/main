import { ScheduledRoom, UserWithFollowInfo } from "../modules/ws/entities";
import React, { useState } from "react";
import { useTypeSafeTranslation } from "../shared-hooks/useTypeSafeTranslation";
import { ScheduledRoomCard } from "../modules/scheduled-rooms/ScheduledRoomCard";
import { Button } from "./Button";
import { CenterLoader } from "./CenterLoader";
import { EditScheduleRoomModalController } from "../modules/scheduled-rooms/EditScheduleRoomModalController";
import { BaseUser } from "@collaborative/arthur";

export interface ProfileScheduledProps
    extends React.HTMLAttributes<HTMLDivElement> {
    user: BaseUser;
}

const List = ({
    onLoadMore,
    cursor,
    isLastPage,
    isOnlyPage,
    userId,
    onEdit,
}: {
    onEdit: (sr: { scheduleRoomToEdit: ScheduledRoom; cursor: string }) => void;
    userId: string;
    cursor: string;
    isLastPage: boolean;
    isOnlyPage: boolean;
    onLoadMore: (o: string) => void;
}) => {
    const { t } = useTypeSafeTranslation();

    if (isOnlyPage) {
        return (
            <div
                className={`mt-2 bg-primary-800 p-4 rounded-8 w-full leading-8 text-primary-100`}
            >
                {t("modules.scheduledRooms.noneFound")}
            </div>
        );
    }

    return (
        <div className={`${isLastPage ? "mb-24" : ""}`}>
            {null}
            {null}
        </div>
    );
};

export const ProfileScheduled: React.FC<ProfileScheduledProps> = ({
    user,
    className = "",
}) => {
    const [{ cursors, userId }, setQueryState] = useState<{
        cursors: string[];
        userId: string;
    }>({ cursors: [""], userId: user.user_id.toString() });

    return (
        <div
            className={`mt-2 rounded-8 w-full leading-8 ${className}`}
            style={{ maxWidth: 640 }}
        >
            <EditScheduleRoomModalController
                onScheduledRoom={(editInfo, data, _resp) => {}}
            >
                {({ onEdit }) =>
                    cursors.map((cursor, i) => (
                        <List
                            userId={userId}
                            onLoadMore={(o) =>
                                setQueryState({
                                    cursors: [...cursors, o],
                                    userId,
                                })
                            }
                            onEdit={onEdit}
                            isOnlyPage={cursors.length === 1}
                            isLastPage={cursors.length - 1 === i}
                            key={cursor}
                            cursor={cursor}
                        />
                    ))
                }
            </EditScheduleRoomModalController>
        </div>
    );
};
