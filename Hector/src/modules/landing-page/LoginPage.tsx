import isElectron from "is-electron";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { LgLogo } from "../../icons";
import SvgSolidBug from "../../icons/SolidBug";
import SvgSolidDiscord from "../../icons/SolidDiscord";
import SvgSolidGitHub from "../../icons/SolidGitHub";
import { apiBaseUrl } from "../../lib/constants";
import { Button } from "../../ui/Button";
import { useSaveTokensFromQueryParams } from "../auth/useSaveTokensFromQueryParams";
import { HeaderController } from "../display/HeaderController";
import { ElectronHeader } from "../layouts/ElectronHeader";

/*
i know this code is kinda garbage but that's because the mockup is garbage and doesn't use the design system
 */

interface LoginButtonProps {
    children: [React.ReactNode, React.ReactNode];
    dev?: true;
    onClick?: () => void;
    oauthUrl?: string; // React.FC didn't like & ({ onClick: () => void } | { oauthUrl: string }) so yeah
}

const LoginButton: React.FC<LoginButtonProps> = ({
    children,
    onClick,
    oauthUrl,
    dev,
    ...props
}) => {
    const { query } = useRouter();
    const { push } = useRouter();

    return (
        <Button
            className="justify-center text-base py-3 mt-2"
            color={dev ? "primary" : "secondary"}
            onClick={() => {
                console.log("pushing to ", oauthUrl);
                push("/redirect-discord");
            }}
            {...props}
        >
            <div
                className="grid gap-4"
                style={{
                    gridTemplateColumns: "1fr auto 1fr",
                }}
            >
                {children[0]}
                {children[1]}
                <div />
            </div>
        </Button>
    );
};

export const LoginPage: React.FC = () => {
    useSaveTokensFromQueryParams();
    const { push } = useRouter();

    return (
        <>
            <div className="flex">
                <ElectronHeader />
            </div>
            <div
                className="grid w-full h-full"
                style={{
                    gridTemplateRows: "1fr auto 1fr",
                }}
            >
                <HeaderController embed={{}} title="Login" />
                <div className="hidden sm:flex" />
                <div className="flex justify-self-center self-center sm:hidden">
                    <LgLogo />
                </div>
                <div className="flex m-auto flex-col p-6 gap-5 bg-primary-800 sm:rounded-8 z-10 sm:w-400 w-full">
                    <div className="flex gap-2 flex-col">
                        <span className="text-3xl text-primary-100 font-bold">
                            Welcome To Collaborative
                        </span>
                        <div className="text-primary-100 flex-wrap">
                            By logging in you accept our&nbsp;
                            <a className="text-accent hover:underline">
                                Privacy Policy
                            </a>
                            &nbsp;and&nbsp;
                            <a className="text-accent hover:underline">
                                Terms of Service
                            </a>
                            .
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <LoginButton oauthUrl={`${apiBaseUrl}/auth/discord`}>
                            <SvgSolidDiscord width={20} height={20} />
                            Log in with Discord
                        </LoginButton>
                    </div>
                </div>
                <div className="flex flex-row absolute bottom-0 w-full justify-between px-5 py-5 mt-auto items-center sm:px-7">
                    <div className="hidden sm:flex">
                        <LgLogo />
                    </div>
                    <div className="flex flex-row gap-6 text-primary-300">
                        <a
                            href="/privacy-policy.html"
                            className="hover:text-primary-200"
                        >
                            Privacy policy
                        </a>
                        <a
                            href="https://github.com/Collaborative-IoT/Hector/issues"
                            className="ml-2 hover:text-primary-200"
                        >
                            Report a bug
                        </a>
                        <div className="flex flex-row gap-6 sm:gap-4">
                            <a
                                href="https://github.com/Collaborative-IoT/Hector"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <SvgSolidGitHub
                                    width={20}
                                    height={20}
                                    className="ml-2 cursor-pointer hover:text-primary-200"
                                />
                            </a>
                            <a target="_blank" rel="noreferrer">
                                <SvgSolidDiscord
                                    width={20}
                                    height={20}
                                    className="ml-2 hover:text-primary-200"
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
