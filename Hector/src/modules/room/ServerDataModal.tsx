import React, { useContext, useEffect } from "react";
import { useCurrentRoomInfo } from "../../shared-hooks/useCurrentRoomInfo";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { Modal } from "../../ui/Modal";
import { RoomChatMessage, useRoomChatStore } from "./chat/useRoomChatStore";
import { MainContext } from "../../api_context/api_based";
import { ModeContext } from "../../mode_context/room_mode";

export const ServerDataModal: React.FC<{}> = ({}) => {
    const { selected_server_data_open, set_selected_server_data_open } =
        useContext(ModeContext);
    const { selected_iot_server, iot_server_passive_data } =
        useContext(MainContext);
    if (iot_server_passive_data?.get(selected_iot_server)) {
        let data = JSON.parse(iot_server_passive_data.get(selected_iot_server));
        data = JSON.parse(data);
        return (
            <Modal
                onRequestClose={() => {
                    set_selected_server_data_open(false);
                }}
                isOpen={selected_server_data_open}
            >
                {
                    <div className="flex px-6 flex-col bg-primary-800">
                        <h3 className="text-primary-300 ml-1.5">
                            Server Data:
                        </h3>
                        <h5 className="text-primary-100 font-bold">
                            {data["server_state_lens"]["clients"]}->Clients
                        </h5>

                        <h5 className="text-primary-100 font-bold">
                            {data["server_state_lens"]["deactivated"]}
                            ->Deactivated Devices
                        </h5>
                        <h5 className="text-primary-100 font-bold">
                            {data["server_state_lens"]["addresses_that_failed"]}
                            ->Failed Authers
                        </h5>

                        <h5 className="text-primary-100 font-bold">
                            {data["server_state_lens"]["devices"]}->Device Total
                        </h5>
                        <h5 className="text-primary-100 font-bold">
                            {data["server_state_lens"][
                                "alerts_active"
                            ].toString()}
                            ->Alerts Active
                        </h5>
                        <h5 className="text-primary-100 font-bold">
                            {
                                data["server_state_lens"][
                                    "in_memory_passive_data"
                                ]
                            }
                            ->Passive In Memory
                        </h5>
                    </div>
                }
            </Modal>
        );
    } else {
        return (
            <Modal
                onRequestClose={() => {
                    set_selected_server_data_open(false);
                }}
                isOpen={selected_server_data_open}
            >
                {
                    <div className="flex ml-4">
                        <h3>No Data</h3>
                    </div>
                }
            </Modal>
        );
    }
};
