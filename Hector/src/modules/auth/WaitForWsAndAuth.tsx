import React, { useContext } from "react";
import { useVerifyLoggedIn } from "./useVerifyLoggedIn";

interface WaitForWsAndAuthProps {}

export const WaitForWsAndAuth: React.FC<WaitForWsAndAuthProps> = ({
    children,
}) => {
    if (!useVerifyLoggedIn()) {
        return null;
    }

    return <>{children}</>;
};
