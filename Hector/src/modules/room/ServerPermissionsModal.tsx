import React, { useContext, useEffect } from "react";
import { useDebugAudioStore } from "../../global-stores/useDebugAudio";
import { useConn } from "../../shared-hooks/useConn";
import { useCurrentRoomInfo } from "../../shared-hooks/useCurrentRoomInfo";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { Modal } from "../../ui/Modal";
import { Form, Formik } from "formik";
import { ButtonLink } from "../../ui/ButtonLink";
import { InputField } from "../../form-fields/InputField";
import { ModeContext } from "../../mode_context/room_mode";
import { MainContext } from "../../api_context/api_based";
import { ServerPermissions } from "./ServerPermissions";

export const ServerPermissionsModal: React.FC<{}> = () => {
    const { give_permissions_open, set_give_permissions_open } =
        useContext(ModeContext);
    return (
        <Modal
            isOpen={give_permissions_open}
            onRequestClose={() => {
                set_give_permissions_open(false);
            }}
        >
            <ServerPermissions />
        </Modal>
    );
};
