import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Custom404() {
    const router = useRouter();
    useEffect(() => {
        console.log("redirecting from empty page");
        router.replace("/dash");
    });
    return null;
}
