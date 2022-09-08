import isElectron from "is-electron";
import { useRouter } from "next/router";
import React, { ReactNode, useContext, useState } from "react";
import { MainContext } from "../api_context/api_based";
import { useDebugAudioStore } from "../global-stores/useDebugAudio";
import {
    DeveloperIcon,
    OutlineGlobe,
    SolidBug,
    SolidCaretRight,
    SolidUser,
    SolidVolume,
} from "../icons";
import SvgSolidDiscord from "../icons/SolidDiscord";
import SvgSolidDownload from "../icons/SolidDownload";
import { ApiPreloadLink } from "../shared-components/ApiPreloadLink";
import { useTypeSafeTranslation } from "../shared-hooks/useTypeSafeTranslation";
import { BaseOverlay } from "../ui/BaseOverlay";
import { SettingsIcon } from "../ui/SettingsIcon";
import { LanguageSelector } from "./LanguageSelector";

export const SettingsDropdown: React.FC<{
    onCloseDropdown: () => void;
    onActionButtonClicked: () => void;
}> = ({ onCloseDropdown, onActionButtonClicked }) => {
    const [currentOverlay, setCurrentOverlay] = useState<ReactNode>(null);
    const { t } = useTypeSafeTranslation();
    const { debugAudio, setDebugAudio } = useDebugAudioStore();
    const { user } = useContext(MainContext);
    const { push } = useRouter();

    return (
        <div
            className="flex whitespace-nowrap overflow-ellipsis"
            style={{ width: 200 }}
        >
            <BaseOverlay
                onActionButtonClicked={onActionButtonClicked}
                actionButton={t("components.settingsDropdown.logOut.button")}
                overlay={currentOverlay}
            >
                <div className="flex flex-col">
                    <SettingsIcon
                        onClick={() => {
                            push(`../u/${user!!.user_id}`);
                        }}
                        icon={<SolidUser />}
                        label={t("components.settingsDropdown.profile")}
                        transition
                    />
                    <SettingsIcon
                        icon={<OutlineGlobe />}
                        label={t("components.settingsDropdown.language")}
                        trailingIcon={<SolidCaretRight />}
                        transition
                        onClick={() =>
                            setCurrentOverlay(
                                <LanguageSelector
                                    onClose={() => setCurrentOverlay(null)}
                                />
                            )
                        }
                    />
                    <SettingsIcon
                        label={
                            !debugAudio
                                ? t(
                                      "components.settingsDropdown.debugAudio.debugAudio"
                                  )
                                : t(
                                      "components.settingsDropdown.debugAudio.stopDebugger"
                                  )
                        }
                        icon={<SolidVolume />}
                        transition
                        onClick={() => setDebugAudio(!debugAudio)}
                    />
                    {!isElectron() ? (
                        <SettingsIcon
                            onClick={() => push("/download")}
                            icon={<SvgSolidDownload />}
                            label={t("components.settingsDropdown.downloadApp")}
                            transition
                        />
                    ) : null}

                    <SettingsIcon
                        onClick={() => push("/developer/bots")}
                        icon={<DeveloperIcon />}
                        label={t("components.settingsDropdown.developer")}
                        transition
                    />

                    <a href="" target="_blank" rel="noreferrer">
                        <SettingsIcon
                            onClick={onCloseDropdown}
                            icon={<SvgSolidDiscord />}
                            label={"Discord"}
                            transition
                        />
                    </a>
                </div>
            </BaseOverlay>
        </div>
    );
};
