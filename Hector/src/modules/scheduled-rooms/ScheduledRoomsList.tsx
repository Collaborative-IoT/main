import { ScheduledRoom } from "../ws/entities";
import React, { useState } from "react";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { CenterLoader } from "../../ui/CenterLoader";
import { FeedHeader } from "../../ui/FeedHeader";
import { MiddlePanel } from "../layouts/GridPanels";
import { CreateScheduleRoomModal } from "./CreateScheduledRoomModal";
import { EditScheduleRoomModalController } from "./EditScheduleRoomModalController";
import { ScheduledRoomCard } from "./ScheduledRoomCard";

interface ScheduledRoomsListProps {}

const Page = ({
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

    return (
        <div className={`mt-8 text-xl ml-4`}>
            {t("modules.scheduledRooms.noneFound")}
        </div>
    );

    return <div className={"mb-24"}></div>;
};

export const ScheduledRoomsList: React.FC<ScheduledRoomsListProps> = ({}) => {
    const { t } = useTypeSafeTranslation();
    const [open, setOpen] = useState(false);
    const [{ cursors, userId }, setQueryState] = useState<{
        cursors: string[];
        userId: string;
    }>({ cursors: [""], userId: "" });

    return (
        <>
            {open ? (
                <CreateScheduleRoomModal
                    onScheduledRoom={(data, resp) => {}}
                    onRequestClose={() => setOpen(false)}
                />
            ) : null}
            <MiddlePanel
                stickyChildren={
                    <FeedHeader
                        actionTitle={t(
                            "modules.scheduledRooms.scheduleRoomHeader"
                        )}
                        onActionClicked={() => {
                            setOpen(true);
                        }}
                        title={t("modules.scheduledRooms.title")}
                    />
                }
            >
                <EditScheduleRoomModalController
                    onScheduledRoom={(editInfo, data, _resp) => {}}
                >
                    {({ onEdit }) =>
                        cursors.map((cursor, i) => (
                            <Page
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
            </MiddlePanel>
        </>
    );
};
