import React, { useContext } from "react";
import { MainContext } from "../../api_context/api_based";
import { ModeContext } from "../../mode_context/room_mode";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { CenterLoader } from "../../ui/CenterLoader";
import { InfoText } from "../../ui/InfoText";
import { SingleUser } from "../../ui/UserAvatar";

interface ConnectedServersProps {}

const SelectButton: React.FC<{ server_id: String }> = ({ server_id }) => {
    const { t } = useTypeSafeTranslation();
    const {
        iot_server_outside_names,
        selected_iot_server,
        set_selected_iot_server,
    } = useContext(MainContext);
    return (
        <Button
            loading={false}
            onClick={() => {
                selected_iot_server && selected_iot_server == server_id
                    ? set_selected_iot_server(null)
                    : set_selected_iot_server(server_id);
            }}
            size={`small`}
        >
            {selected_iot_server && selected_iot_server == server_id
                ? "De-Select"
                : "Select"}
        </Button>
    );
};
export const ConnectedServersPage: React.FC<{}> = () => {
    const { t } = useTypeSafeTranslation();
    const {
        iot_server_outside_names,
        selected_iot_server,
        set_selected_iot_server,
    } = useContext(MainContext);
    const {
        set_selected_server_data_open,
        set_integration_server_select_open,
    } = useContext(ModeContext);
    if (
        iot_server_outside_names == null ||
        iot_server_outside_names!!.keys().length == 0
    ) {
        return <InfoText className={`mt-2`}>No Servers Connected</InfoText>;
    }
    let data = [];
    for (let server_id of iot_server_outside_names!!.keys()) {
        data.push({
            name: iot_server_outside_names!!.get(server_id),
            server_id,
        });
    }

    return (
        <>
            {data.map((server_data: { name: String; server_id: String }) => (
                <div
                    className={`flex border-b border-solid w-full py-4 px-2 items-center`}
                    key={server_data.server_id}
                >
                    <div className="flex">
                        <SingleUser
                            size="md"
                            src="https://github.com/House-of-IoT/HOI-WebClient/blob/8459cfee7970d53a916ce478a4f3acf4efc1e9ed/Frontend/src/Img/bot.png?raw=true"
                        />
                    </div>
                    <div className={`flex ml-4 flex-1 mr-4`}>
                        <div className={`flex text-lg font-bold`}>
                            {server_data.name}
                        </div>
                    </div>
                    <SelectButton server_id={server_data.server_id} />
                    <Button
                        onClick={() => {
                            set_selected_iot_server(server_data.server_id);
                            set_integration_server_select_open(false);
                            set_selected_server_data_open(true);
                        }}
                        className="ml-1"
                        size="small"
                    >
                        View Data
                    </Button>
                </div>
            ))}
        </>
    );
};

export const ConnectedServers: React.FC<ConnectedServersProps> = ({}) => {
    const { t } = useTypeSafeTranslation();
    return (
        <>
            <div className={`flex mt-4 flex-col text-primary-100 pt-3`}>
                <h1 className={`text-xl`}>Connected Servers</h1>
                <div className="flex flex-col">{<ConnectedServersPage />}</div>
            </div>
        </>
    );
};
