import { Room, User } from "../ws/entities";
import router from "next/router";
import React, { useState } from "react";
import { useScreenType } from "../../shared-hooks/useScreenType";
import { PageComponent } from "../../types/PageComponent";
import { InfoText } from "../../ui/InfoText";
import { SearchHeader } from "../../ui/mobile/MobileHeader";
import {
    RoomSearchResult,
    UserSearchResult,
} from "../../ui/Search/SearchResult";
import { WaitForWsAndAuth } from "../auth/WaitForWsAndAuth";
import { HeaderController } from "../display/HeaderController";
import { DefaultDesktopLayout } from "../layouts/DefaultDesktopLayout";

interface LoungePageProps {}

export const SearchPage: PageComponent<LoungePageProps> = ({}) => {
    const screenType = useScreenType();
    if (screenType !== "fullscreen") router.push("/dash");

    const [results, setResults] = useState([] as (User | Room)[]);
    const [searchLoading, setSearchLoading] = useState(false);

    return (
        <WaitForWsAndAuth>
            <HeaderController embed={{}} title="Search" />
            <DefaultDesktopLayout
                mobileHeader={
                    <SearchHeader
                        onSearchChange={(e) => {}}
                        searchPlaceholder="Search"
                        onBackClick={() => router.back()}
                        searchLoading={searchLoading}
                    />
                }
            >
                <div className="h-full w-full">
                    {}
                    {!results?.length && (
                        <InfoText className="pr-4 pl-5 py-3">
                            no results
                        </InfoText>
                    )}
                </div>
            </DefaultDesktopLayout>
        </WaitForWsAndAuth>
    );
};

SearchPage.ws = true;
