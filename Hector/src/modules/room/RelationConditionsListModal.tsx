import React, { useContext, useEffect } from "react";
import { useDebugAudioStore } from "../../global-stores/useDebugAudio";
import { useCurrentRoomInfo } from "../../shared-hooks/useCurrentRoomInfo";
import { Modal } from "../../ui/Modal";
import { ModeContext } from "../../mode_context/room_mode";
import { MainContext } from "../../api_context/api_based";
import { ConditionsList } from "./RelationConditionsList";

export const RelationConditionsListModal: React.FC<{}> = () => {
    const {
        current_relation_for_modification,
        set_current_relation_for_modification,
    } = useContext(ModeContext);
    return (
        <Modal
            isOpen={current_relation_for_modification != null}
            onRequestClose={() => {
                set_current_relation_for_modification(null);
            }}
        >
            <ConditionsList />
        </Modal>
    );
};
