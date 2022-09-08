import { SingleUserDataResults } from "@collaborative/arthur";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "../../api_context/api_based";
import { apiBaseUrl } from "../../lib/constants";
import { PageComponent } from "../../types/PageComponent";
import { HeaderController } from "../display/HeaderController";
import { DefaultDesktopLayout } from "../layouts/DefaultDesktopLayout";
import { MiddlePanel } from "../layouts/GridPanels";
import { UserProfileController } from "./UserProfileController";

interface UserPageProps {}

export const UserPage: PageComponent<UserPageProps> = ({}) => {
    const router = useRouter();
    const { userId } = router.query;
    const [user_data, set_user_data] = useState<User | null>(null);
    const { client, user } = useContext(MainContext);

    useEffect(() => {
        if (!client) {
            console.log("no client", client);
        } else {
            if (user && user.user_id != userId) {
                client!!.client_sub.single_user_data = (
                    data: SingleUserDataResults
                ) => {
                    set_user_data(data.data);
                };
                client!!.send("single_user_data", { user_id: +userId });
            }
        }
    }, [client]);
    if (user_data) {
        return (
            <>
                <HeaderController
                    title={user_data.display_name}
                    embed={{ image: user_data.avatar_url }}
                    description={user_data.bio}
                />
                <DefaultDesktopLayout>
                    <MiddlePanel>
                        <UserProfileController user_data={user_data} />
                    </MiddlePanel>
                </DefaultDesktopLayout>
            </>
        );
    } else if (user) {
        return (
            <>
                <HeaderController
                    title={user.display_name}
                    embed={{ image: user.avatar_url }}
                    description={user.bio}
                />
                <DefaultDesktopLayout>
                    <MiddlePanel>
                        <UserProfileController
                            user_data={{
                                ...user!!,
                                i_blocked_them: false,
                                they_blocked_you: false,
                                follows_you: false,
                                you_are_following: false,
                            }}
                        />
                    </MiddlePanel>
                </DefaultDesktopLayout>
            </>
        );
    } else {
        return (
            <>
                <HeaderController />
                <DefaultDesktopLayout>
                    <MiddlePanel>
                        <UserProfileController user_data={null} />
                    </MiddlePanel>
                </DefaultDesktopLayout>
            </>
        );
    }
};
