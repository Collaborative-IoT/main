import React, { useContext, useEffect, useState } from "react";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileAbout } from "./ProfileAbout";
import { ProfileTabs } from "./ProfileTabs";
import { badge } from "./UserSummaryCard";
import { useTypeSafeTranslation } from "../shared-hooks/useTypeSafeTranslation";
import { UserBadgeLgProps } from "./UserBadgeLg";
import { ContributorBadge, StaffBadge } from "../icons/badges";
import { MainContext } from "../api_context/api_based";
import { useRouter } from "next/router";
import { User } from "@collaborative/arthur";

interface UserProfileProps {
    user: User;
    isCurrentUser?: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({
    isCurrentUser,
    user,
}) => {
    const { t } = useTypeSafeTranslation();
    const badges: badge[] = [];
    const tags: UserBadgeLgProps[] = [];
    const truncateString = (str: string, num: number) => {
        if (str.length <= num) {
            return str;
        }
        return str.slice(0, num) + "...";
    };
    if (user.user_id == 1 && user.user_id == 2) {
        badges.push({
            content: <StaffBadge />,
            variant: "primary",
            color: "white",
            title: t("components.userBadges.dhStaff"),
            naked: true,
        });
        tags.push({
            icon: "dogeStaff",
            children: t("components.userBadges.dhStaff"),
        });
    }

    if (user.contributions > 0) {
        badges.push({
            content: <ContributorBadge contributions={user.contributions} />,
            variant: "primary",
            color: "white",
            title: `${t("components.userBadges.dhContributor")} (${40} ${t(
                "pages.admin.contributions"
            )})`,
            naked: true,
        });
        tags.push({
            icon: "dogeContributor",
            contributions: 40,
            children: t("components.userBadges.dhContributor"),
        });
    }

    return (
        <>
            <ProfileHeader
                user_data={user}
                pfp={user!!.avatar_url}
                displayName={truncateString(user?.display_name, 12)}
                isCurrentUser={isCurrentUser}
                username={truncateString(user.username, 12)}
                badges={badges}
            />
            <ProfileTabs user={user} className="mt-4" aboutTags={tags} />
        </>
    );
};
