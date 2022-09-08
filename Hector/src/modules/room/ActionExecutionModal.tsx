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
import { ExecutableActions } from "./ExecutableActions";

export const ExecutableActionsModal: React.FC<{}> = () => {
    const { set_execute_actions_open, execute_actions_open } =
        useContext(ModeContext);
    return (
        <Modal
            isOpen={execute_actions_open}
            onRequestClose={() => {
                set_execute_actions_open(false);
            }}
        >
            <ExecutableActions />
        </Modal>
    );
};
