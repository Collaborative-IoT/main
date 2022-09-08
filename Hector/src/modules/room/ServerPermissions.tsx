import React, { useContext } from "react";
import { MainContext } from "../../api_context/api_based";
import { ModeContext } from "../../mode_context/room_mode";
import { Button } from "../../ui/Button";
import { CenterLoader } from "../../ui/CenterLoader";
import { InfoText } from "../../ui/InfoText";
import { SingleUser } from "../../ui/UserAvatar";

interface ServerPermissionProps {}

const SelectButton: React.FC<{
    has_permission: boolean;
    user_id: number;
    selected_iot_server: number;
}> = ({ has_permission, user_id, selected_iot_server }) => {
    const { set_give_permissions_open } = useContext(ModeContext);
    const { client } = useContext(MainContext);
    return (
        <Button
            loading={false}
            onClick={() => {
                set_give_permissions_open(false);
                client?.send("give_or_revoke_controller_iot", {
                    external_id: selected_iot_server,
                    user_id,
                    now_has_permission: has_permission ? false : true,
                });
            }}
            size={`small`}
        >
            {has_permission ? "Revoke" : "Give"}
        </Button>
    );
};
export const ServerPermissionsPage: React.FC<{}> = () => {
    const { selected_iot_server, iot_server_controllers, all_users_in_room } =
        useContext(MainContext);
    if (selected_iot_server == null) {
        return <InfoText className={`mt-2`}>No Server Selected</InfoText>;
    }
    let data = [];

    for (let user_id of all_users_in_room!!.keys()) {
        let user = all_users_in_room.get(user_id);
        console.log(user);
        data.push({
            username: user!!.username,
            avatar_url: user!!.avatar_url,
            id: user!!.user_id,
            has_permission:
                iot_server_controllers!!.has(selected_iot_server.toString()) &&
                iot_server_controllers!!
                    .get(selected_iot_server.toString())
                    .has(user!!.user_id),
        });
    }

    return (
        <>
            {data.map(
                (user_data: {
                    username: String;
                    avatar_url: String;
                    id: number;
                    has_permission: boolean;
                }) => (
                    <div
                        className={`flex border-b border-solid w-full py-4 px-2 items-center`}
                        key={user_data.username}
                    >
                        <div className="flex">
                            <SingleUser size="md" src={user_data.avatar_url} />
                        </div>
                        <div className={`flex ml-4 flex-1 mr-4`}>
                            <div className={`flex text-lg font-bold`}>
                                {user_data.username}
                            </div>
                        </div>
                        <SelectButton
                            has_permission={user_data.has_permission}
                            user_id={user_data.id}
                            selected_iot_server={selected_iot_server}
                        />
                    </div>
                )
            )}
        </>
    );
};

export const ServerPermissions: React.FC<ServerPermissionProps> = ({}) => {
    return (
        <>
            <div className={`flex mt-4 flex-col text-primary-100 pt-3`}>
                <h1 className={`text-xl`}>Manage Permissions</h1>
                <div className="flex flex-col">{<ServerPermissionsPage />}</div>
            </div>
        </>
    );
};
