import { UserWithFollowInfo } from "../modules/ws/entities";
import normalizeUrl from "normalize-url";
import React from "react";
import { linkRegex } from "../lib/constants";
import { kFormatter } from "../lib/kFormatter";
import { ApiPreloadLink } from "../shared-components/ApiPreloadLink";
import { useTypeSafeTranslation } from "../shared-hooks/useTypeSafeTranslation";
import { SingleUser } from "./UserAvatar";
import { HeaderController } from "../modules/display/HeaderController";
import { UserBadge } from "./UserBadge";
import { badge, Badges } from "./UserSummaryCard";
import { ContributorBadge, StaffBadge } from "../icons/badges";
import { User } from "@collaborative/arthur";
import { useRouter } from "next/router";

interface VerticalUserInfoProps {
    user: User;
}

export const VerticalUserInfo: React.FC<VerticalUserInfoProps> = ({ user }) => {
    const { t } = useTypeSafeTranslation();
    const badges: badge[] = [];
    const { push } = useRouter();
    const truncateString = (str: string, num: number) => {
        if (str.length <= num) {
            return str;
        }
        return str.slice(0, num) + "...";
    };

    if (user.user_id == 1 || user.user_id == 2) {
        badges.push({
            content: <StaffBadge />,
            variant: "primary",
            color: "white",
            title: "Collaborative Staff",
            naked: true,
        });
    }
    if (user.contributions > 0) {
        badges.push({
            content: <ContributorBadge contributions={user.contributions} />,
            variant: "primary",
            color: "white",
            title: `${"Collaborative Contributor"} (${user.contributions} ${t(
                "pages.admin.contributions"
            )})`,
            naked: true,
        });
    }
    if (user.follows_you) {
        badges.push({
            content: t("pages.viewUser.followsYou"),
            variant: "primary-700",
            color: "grey",
            title: t("pages.viewUser.followsYou"),
            classname: "ml-1",
        });
    }
    return (
        <>
            <HeaderController
                embed={{}}
                title={`${user.display_name} (@${truncateString(
                    user.username,
                    12
                )})`}
            />
            <div className="flex flex-col rounded-8 pt-5 px-6 pb-4 w-full items-center">
                <SingleUser
                    size="default"
                    src={user.avatar_url}
                    username={truncateString(user.username, 12)}
                    hover={true}
                />
                <div className="flex mt-2 max-w-full">
                    <span className="flex text-primary-100 font-bold h-full break-all line-clamp-1 truncate">
                        {user.display_name}
                    </span>
                    <span
                        data-testid="profile-info-username"
                        className="flex text-primary-300 ml-1 hover:underline"
                        onClick={() => {
                            push(`../u/${user.user_id}`);
                        }}
                    >
                        @{truncateString(user.username, 12)}
                    </span>
                </div>
                <span className="flex justify-center mt-2">
                    <Badges badges={badges} />
                </span>

                <div className="flex mt-2">
                    <div className="flex">
                        <span className="text-primary-100 font-bold">
                            {kFormatter(user.num_followers)}
                        </span>
                        <span className="text-primary-300 lowercase ml-1.5">
                            {t("pages.viewUser.followers")}
                        </span>
                    </div>
                    <div className="flex ml-4">
                        <span className="text-primary-100 font-bold">
                            {kFormatter(user.num_following)}
                        </span>
                        <span className="text-primary-300 lowercase ml-1.5">
                            {t("pages.viewUser.following")}
                        </span>
                    </div>
                </div>
                <div className="flex w-full mt-2">
                    {/* Tailwind's max-height is not working, so I used style */}
                    <p
                        className="text-primary-300 mt-2 text-center w-full whitespace-pre-wrap break-words inline overflow-y-auto"
                        style={{ maxHeight: "300px" }}
                    >
                        {user.bio &&
                            user.bio.split(/\n/).map((line, i) => (
                                <React.Fragment key={i}>
                                    {i > 0 ? <br key={i} /> : null}
                                    {line.split(" ").map((chunk, j) => {
                                        try {
                                            return linkRegex.test(chunk) ? (
                                                <a
                                                    href={normalizeUrl(chunk)}
                                                    rel="noreferrer"
                                                    className="text-accent text-center hover:underline inline"
                                                    key={`${i}${j}`}
                                                    target="_blank"
                                                >
                                                    {chunk}&nbsp;
                                                </a>
                                            ) : (
                                                <React.Fragment
                                                    key={`${i}${j}`}
                                                >{`${chunk} `}</React.Fragment>
                                            );
                                        } catch (err) {}

                                        return null;
                                    })}
                                </React.Fragment>
                            ))}
                    </p>
                </div>
            </div>
        </>
    );
};
