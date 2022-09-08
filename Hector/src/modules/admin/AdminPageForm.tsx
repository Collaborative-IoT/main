import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { showErrorToast } from "../../lib/showErrorToast";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { MiddlePanel } from "../layouts/GridPanels";

interface SearchUsersProps {}

export const AdminPageForm: React.FC<SearchUsersProps> = ({}) => {
    const [username, setUsername] = useState("");
    const [reason, setReason] = useState("");
    const [contributions, setContributions] = useState(0);
    const [isStaff, setIsStaff] = useState(false);
    const { t } = useTypeSafeTranslation();
    const { replace } = useRouter();

    useEffect(() => {
        if (true) {
            showErrorToast("nice try");
            replace("/dash");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <MiddlePanel>
            <h3 className="text-primary-100">{t("pages.admin.username")}</h3>
            <div className="flex">
                <Input
                    autoFocus
                    placeholder={t("pages.admin.usernamePlaceholder")}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>
            <div className="mt-6">
                <h3 className="text-primary-100">{t("pages.admin.ban")}</h3>
                <Input
                    className={`mb-4`}
                    autoFocus
                    placeholder={t("pages.admin.reason")}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
                <Button
                    onClick={() => {
                        if (username && reason) {
                        }
                    }}
                >
                    {t("pages.admin.ban")}
                </Button>
            </div>
        </MiddlePanel>
    );
};
