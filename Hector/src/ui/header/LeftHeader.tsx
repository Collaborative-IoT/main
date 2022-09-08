import Link from "next/link";
import React from "react";
import { LgLogo, LogoIcon, BotIcon } from "../../icons";
import { useScreenType } from "../../shared-hooks/useScreenType";

export interface LeftHeaderProps {}

const LeftHeader: React.FC<LeftHeaderProps> = ({}) => {
    const screenType = useScreenType();
    return (
        <Link href="/dash">
            <a data-testid="logo-link" className="w-full">
                <LgLogo></LgLogo>
            </a>
        </Link>
    );
};

export default LeftHeader;
