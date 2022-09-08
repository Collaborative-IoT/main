import { User } from "@collaborative/arthur";
import isElectron from "is-electron";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "../../api_context/api_based";
import { isServer } from "../../lib/isServer";
import { usePreloadPush } from "../../shared-components/ApiPreloadLink";
import { useConn } from "../../shared-hooks/useConn";
import { useTypeSafeQuery } from "../../shared-hooks/useTypeSafeQuery";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { useTypeSafeUpdateQuery } from "../../shared-hooks/useTypeSafeUpdateQuery";
import { Button } from "../../ui/Button";
import { CenterLoader } from "../../ui/CenterLoader";
import { InfoText } from "../../ui/InfoText";
import { UserProfile } from "../../ui/UserProfile";
import { EditProfileModal } from "./EditProfileModal";
interface UserProfileControllerProps {
    user_data: User | null;
}

const isMac = process.platform === "darwin";

export const UserProfileController: React.FC<UserProfileControllerProps> = ({
    user_data,
}) => {
    const { t } = useTypeSafeTranslation();
    const { push } = useRouter();
    const { query } = useRouter();
    const { user } = useContext(MainContext);

    if (!user_data) {
        return <InfoText>{t("pages.myProfile.couldNotFindUser")}</InfoText>;
    } else if (user_data!!.they_blocked_you) {
        return <InfoText>You have been blocked by this user.</InfoText>;
    }

    if (!user) {
        return <InfoText>Fatal Error Encountered Try Again!</InfoText>;
    }

    return (
        <>
            <UserProfile
                user={user_data!!}
                isCurrentUser={user_data.user_id == user!!.user_id}
            />
            {user_data.user_id == user!!.user_id && (
                <div className={`pt-6 pb-6 flex`}>
                    <Button
                        style={{ marginRight: "10px" }}
                        size="small"
                        onClick={() => push(`/voice-settings`)}
                    >
                        {t("pages.myProfile.voiceSettings")}
                    </Button>
                    {isElectron() && !isMac ? (
                        <Button
                            style={{ marginRight: "10px" }}
                            size="small"
                            onClick={() => push(`/overlay-settings`)}
                        >
                            {t("pages.myProfile.overlaySettings")}
                        </Button>
                    ) : null}
                    <Button
                        style={{ marginRight: "10px" }}
                        size="small"
                        onClick={() => push(`/sound-effect-settings`)}
                    >
                        {t("pages.myProfile.soundSettings")}
                    </Button>
                    <Button
                        size="small"
                        onClick={() => push(`/privacy-settings`)}
                    >
                        {t("pages.myProfile.privacySettings")}
                    </Button>
                </div>
            )}
        </>
    );
};
