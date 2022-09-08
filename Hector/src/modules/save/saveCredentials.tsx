import { useRouter } from "next/router";
import { useEffect } from "react";
import { Button } from "../../ui/Button";

interface Nothing {}

export const SaveCredentials: React.FC<Nothing> = () => {
    const { push, query } = useRouter();
    useEffect(() => {
        const { refresh, access } = query;
        console.log(query);
        console.log(access);
        if (typeof window !== "undefined") {
            if (refresh && access) {
                localStorage.setItem("r-ciot", refresh as string);
                localStorage.setItem("a-ciot", access as string);
                localStorage.setItem("ciot_auth_status", "good");
                console.log("redirecting from saving credentials");
                push("/dash");
            }
        } else {
            push("/");
        }
    });

    return <div></div>;
};
