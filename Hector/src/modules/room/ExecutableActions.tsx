import React, { useContext } from "react";
import { MainContext } from "../../api_context/api_based";
import { ModeContext } from "../../mode_context/room_mode";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { CenterLoader } from "../../ui/CenterLoader";
import { InfoText } from "../../ui/InfoText";
import { SingleUser } from "../../ui/UserAvatar";

interface ExecutableActionsProps {}

const ExecuteButton: React.FC<{
    action_opcode: String;
    device_name: String;
    server: String;
}> = ({ action_opcode, device_name, server }) => {
    const { t } = useTypeSafeTranslation();
    const { client } = useContext(MainContext);
    const {
        set_current_action_for_relation,
        set_current_device_name_for_relation,
        set_relation_builder_open,
    } = useContext(ModeContext);
    return (
        <>
            <Button
                loading={false}
                onClick={() => {
                    client!!.send("request_hoi_action", {
                        server_id: server,
                        bot_name: device_name,
                        action: action_opcode,
                    });
                }}
                size={`small`}
            >
                Execute Action
            </Button>

            <Button
                loading={false}
                className={"ml-1"}
                onClick={() => {
                    set_current_action_for_relation(action_opcode);
                    set_current_device_name_for_relation(device_name);
                    set_relation_builder_open(true);
                }}
                size={`small`}
            >
                Relate
            </Button>
        </>
    );
};

export const ExecutableActionsPage: React.FC<{}> = () => {
    const { t } = useTypeSafeTranslation();
    const { selected_iot_server, iot_server_passive_data } =
        useContext(MainContext);
    const { selected_bot_name, selected_bot_type } = useContext(ModeContext);
    if (!selected_bot_name || !selected_bot_type) {
        return <InfoText className={`mt-2`}>No Servers Connected</InfoText>;
    }
    let data = [];
    if (iot_server_passive_data?.get(selected_iot_server)) {
        let passive_obj = JSON.parse(
            iot_server_passive_data.get(selected_iot_server)
        );
        let accepted_op_codes = JSON.parse(passive_obj)["type_op_codes"];
        let current_type_op_codes = accepted_op_codes[selected_bot_type];
        if (current_type_op_codes) {
            data = current_type_op_codes;
        }
    }

    return (
        <>
            {data.map((accepted_op: string) => (
                <div
                    className={`flex border-b border-solid w-full py-4 px-2 items-center`}
                    key={accepted_op}
                >
                    <div className="flex">
                        <SingleUser
                            size="md"
                            src="https://github.com/House-of-IoT/HOI-WebClient/blob/8459cfee7970d53a916ce478a4f3acf4efc1e9ed/Frontend/src/Img/bot.png?raw=true"
                        />
                    </div>
                    <div className={`flex ml-4 flex-1 mr-4`}>
                        <div className={`flex text-lg font-bold`}>
                            {accepted_op}
                        </div>
                    </div>
                    <ExecuteButton
                        action_opcode={accepted_op}
                        device_name={selected_bot_name}
                        server={selected_iot_server}
                    />
                </div>
            ))}
        </>
    );
};

export const ExecutableActions: React.FC<ExecutableActionsProps> = ({}) => {
    const { t } = useTypeSafeTranslation();
    return (
        <>
            <div className={`flex mt-4 flex-col text-primary-100 pt-3`}>
                <h1 className={`text-xl`}>Available Actions</h1>
                <div className="flex flex-col">{<ExecutableActionsPage />}</div>
            </div>
        </>
    );
};
