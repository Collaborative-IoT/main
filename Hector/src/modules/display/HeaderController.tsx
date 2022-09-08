import React from "react";
import Header from "next/head";
import { NextPage } from "next";
import { baseUrl } from "../../lib/constants";
export interface HeaderControllerProps {
    title?: string;
    embed?: { hexColor?: string; image?: string };
    owner?: string;
    additionalKeywords?: string[];
    description?: string;
}

export const HeaderController: NextPage<HeaderControllerProps> = ({
    title,
    description = "Collaborative IoT🚀",
    owner,
    additionalKeywords = [],
    embed,
}) => {
    return (
        <Header>
            {title ? (
                <title>{title} | Collaborative-IoT</title>
            ) : (
                <title>Collaborative</title>
            )}
            <meta name="description" content={description} />
            {owner ? <meta name="author" content={owner} /> : ""}
            <meta name="keywords" content={``} />
            <meta name="theme-color" content={embed?.hexColor || "#EFE7DD"} />
            {embed ? (
                <>
                    <meta name="og:title" content={title || "Collab-IoT"} />
                    <meta
                        name="og:type"
                        content={owner ? "music.radio_station" : "website"}
                    />
                    {owner ? <meta name="music:creator" content={owner} /> : ""}
                    <meta name="og:description" content={description} />
                    <meta name="og:site_name" content="Collab-IoT" />
                    <meta name="og:image" content={``} />
                </>
            ) : (
                ""
            )}
        </Header>
    );
};
