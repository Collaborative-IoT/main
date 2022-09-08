import React, { useContext, useEffect } from "react";
import { Button } from "../../ui/Button";
import { Modal } from "../../ui/Modal";
import { ModeContext } from "../../mode_context/room_mode";
import { MainContext } from "../../api_context/api_based";
import { RelationsList } from "./RelationsList";

export const RelationListModal: React.FC<{}> = () => {
    const { relation_list_open, set_relation_list_open } =
        useContext(ModeContext);
    return (
        <Modal
            isOpen={relation_list_open}
            onRequestClose={() => {
                set_relation_list_open(false);
            }}
        >
            <RelationsList />
        </Modal>
    );
};
