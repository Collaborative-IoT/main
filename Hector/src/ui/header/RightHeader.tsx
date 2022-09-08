import { Room, User, UserPreview } from "../../modules/ws/entities";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { SolidMegaphone, SolidMessages, SolidNotification } from "../../icons";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { DropdownController } from "../DropdownController";
import { SingleUser } from "../UserAvatar";
import { MainContext } from "../../api_context/api_based";
import { SettingsDropdown } from "../SettingsDropdown";

export interface RightHeaderProps {
    onAnnouncementsClick?: (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => null;
    onMessagesClick?: (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => null;
    onNotificationsClick?: (
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => null;
    actionButton?: React.ReactNode;
}

const RightHeader: React.FC<RightHeaderProps> = ({
    actionButton,
    onAnnouncementsClick,
    onMessagesClick,
    onNotificationsClick,
}) => {
    const { push } = useRouter();
    const { t } = useTypeSafeTranslation();
    const { user } = useContext(MainContext);
    return (
        <div className="flex space-x-4 items-center justify-end focus:outline-no-chrome w-full">
            {onAnnouncementsClick && (
                <button onClick={onAnnouncementsClick}>
                    <SolidMegaphone
                        width={23}
                        height={23}
                        className="text-primary-200"
                    />
                </button>
            )}
            {onMessagesClick && (
                <button onClick={onMessagesClick}>
                    <SolidMessages
                        width={23}
                        height={23}
                        className="text-primary-200"
                    />
                </button>
            )}
            {onNotificationsClick && (
                <button onClick={onNotificationsClick}>
                    <SolidNotification
                        width={23}
                        height={23}
                        className="text-primary-200"
                    />
                </button>
            )}
            {actionButton}
            <DropdownController
                zIndex={20}
                className="top-9 right-3 md:right-0 fixed"
                innerClassName="fixed  transform -translate-x-full"
                overlay={(close) => (
                    <SettingsDropdown
                        onActionButtonClicked={() => {
                            modalConfirm(
                                t(
                                    "components.settingsDropdown.logOut.modalSubtitle"
                                ),
                                () => {}
                            );
                        }}
                        onCloseDropdown={close}
                    />
                )}
            >
                <SingleUser
                    className={"focus:outline-no-chrome"}
                    size="sm"
                    src={user?.avatar_url}
                />
            </DropdownController>
        </div>
    );
};

export default RightHeader;
