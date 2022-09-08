import React, { useContext } from "react";
import { NativeSelect } from "../../ui/NativeSelect";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";

interface PrivacySettingFormProps {}

export const PrivacySettingForm: React.FC<PrivacySettingFormProps> = ({}) => {
    const { t } = useTypeSafeTranslation();
    return (
        <div>
            <div className="text-primary-100 mb-2">
                {t("pages.privacySettings.whispers.label")}:
            </div>
            <div>
                <NativeSelect value={"test"} onChange={(e) => {}}>
                    {[
                        t("pages.privacySettings.whispers.on"),
                        t("pages.privacySettings.whispers.off"),
                    ].map((v) => (
                        <option value={v} key={v}>
                            {v}&nbsp;&nbsp;&nbsp;
                        </option>
                    ))}
                </NativeSelect>
            </div>
        </div>
    );
};
