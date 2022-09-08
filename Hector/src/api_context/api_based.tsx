import {
    AuthResponse,
    CommunicationRoom,
    BaseUser,
    Client,
    AuthCredentials,
    ClientSubscriber,
    User,
    AllUsersInRoomResponse,
    GetFollowListResponse,
    FollowInfo,
    RoomPermissions,
    InitRoomData,
    JoinTypeInfo,
    NewIoTController,
    PassiveData,
    RemovedIoTController,
    ExistingIotServer,
    NewIoTServer,
    BlockedUsersForRoom,
} from "@collaborative/arthur";
import React, { useEffect, useState } from "react";
import { wsApiBaseUrl } from "../lib/constants";
import { useRouter } from "next/router";
import { useRoomChatStore } from "../modules/room/chat/useRoomChatStore";
import { v4 as uuidv4 } from "uuid";
type Nullable<T> = T | null;

export const MainContext = React.createContext<{
    //normal room data
    dash_live_rooms: Nullable<CommunicationRoom[]>;
    client: Nullable<Client>;
    user: Nullable<BaseUser>;
    all_users_in_room: Nullable<Map<string, User>>;
    im_following: Nullable<Array<FollowInfo>>;
    main_interval_handle: Nullable<NodeJS.Timeout>;
    current_room_permissions: Nullable<Map<number, RoomPermissions>>;
    current_room_id: Nullable<number>;
    current_room_blocked_users: Nullable<Array<User>>;
    create_client: () => void;
    set_current_room_id: any;
    set_all_users_in_room: any;
    set_all_room_permissions: any;
    set_base_room_data: any;
    current_room_base_data: Nullable<InitRoomData>;
    //iot integrations
    iot_server_passive_data: Nullable<Map<String, any>>;
    iot_server_owners: Nullable<Map<String, number>>;
    iot_server_controllers: Nullable<Map<String, Set<number>>>;
    iot_server_outside_names: Nullable<Map<String, String>>;
    selected_iot_server: Nullable<number>;
    set_selected_iot_server: any;
}>({
    dash_live_rooms: [],
    client: null,
    user: null,
    all_users_in_room: null,
    create_client: () => {},
    im_following: null,
    main_interval_handle: null,
    current_room_permissions: null,
    current_room_id: null,
    set_current_room_id: null,
    current_room_base_data: null,
    set_all_users_in_room: null,
    set_all_room_permissions: null,
    set_base_room_data: null,
    iot_server_passive_data: null,
    iot_server_owners: null,
    iot_server_controllers: null,
    iot_server_outside_names: null,
    selected_iot_server: null,
    set_selected_iot_server: null,
});

const initClient = (
    set_base_room_data: React.Dispatch<
        React.SetStateAction<InitRoomData | null>
    >,
    set_all_room_permissions: React.Dispatch<
        React.SetStateAction<Map<number, RoomPermissions> | null>
    >,
    set_interval_handle: React.Dispatch<
        React.SetStateAction<NodeJS.Timeout | null>
    >,
    set_error: any,
    set_user: React.Dispatch<React.SetStateAction<BaseUser | null>>,
    set_dash_live_rooms: React.Dispatch<
        React.SetStateAction<CommunicationRoom[] | null>
    >,
    set_all_users_in_room: React.Dispatch<
        React.SetStateAction<Map<string, User> | null>
    >,
    set_my_following: React.Dispatch<
        React.SetStateAction<Array<FollowInfo> | null>
    >,
    set_iot_server_controllers: React.Dispatch<
        React.SetStateAction<Map<String, Set<number>> | null>
    >,
    set_iot_server_owners: React.Dispatch<
        React.SetStateAction<Map<String, number> | null>
    >,
    set_iot_server_passive_data: React.Dispatch<
        React.SetStateAction<Map<String, any> | null>
    >,
    set_iot_server_outside_names: React.Dispatch<
        React.SetStateAction<Map<String, String> | null>
    >,
    set_current_room_blocked_users: React.Dispatch<
        React.SetStateAction<Array<User> | null>
    >,
    push: any,
    add_server_log: any
) => {
    if (typeof window !== "undefined") {
        // connect to the server and authenticate
        try {
            const type_of_auth = localStorage.getItem("t-ciot") as string;
            const auth_access = localStorage.getItem("a-ciot") as string;
            const auth_refresh = localStorage.getItem("r-ciot") as string;
            let auth_credentials: AuthCredentials = {
                access: auth_access,
                refresh: auth_refresh,
                oauth_type: type_of_auth,
            };

            // setup the subscriber
            let subscriber = new ClientSubscriber();
            let client = new Client(wsApiBaseUrl, subscriber, auth_credentials);
            let my_id: number | null = null;
            let my_data: BaseUser | null = null;
            let initial_setup = true;
            subscriber.good_auth = (data: AuthResponse) => {
                if (data.new_access) {
                    localStorage.setItem("a-ciot", data.new_access);
                    localStorage.setItem("r-ciot", data.new_refresh);
                }
                client.send("my_data", {});
            };
            subscriber.your_data = (user_data: BaseUser) => {
                set_user(user_data);
                my_data = user_data;
                my_id = user_data.user_id;
                if (initial_setup) {
                    let handle = setInterval(() => {
                        client.send("get_top_rooms", {});
                        client.send("get_following", {
                            user_id: user_data.user_id,
                        });
                    }, 5000);
                    set_interval_handle(handle);
                    initial_setup = false;
                }
            };
            subscriber.all_users_in_room = (
                room_data: AllUsersInRoomResponse
            ) => {
                let new_map = new Map();
                for (var user of room_data.users) {
                    new_map.set(user.user_id.toString(), user);
                }
                set_all_users_in_room(new_map);
            };
            subscriber.bad_auth = () => {
                localStorage.setItem("ciot_auth_status", "bad");
                set_error(true);
            };
            subscriber.followers = (data: GetFollowListResponse) => {
                set_my_following(data.user_ids);
            };
            subscriber.top_rooms = (data: CommunicationRoom[]) => {
                set_dash_live_rooms!!(data);
            };
            subscriber.room_created = (room_number: number) => {
                let request = { roomId: +room_number, peerId: my_id };
                client.send("join-as-speaker", request);
                push(`room/${room_number}`);
            };
            subscriber.all_room_permissions = (
                data: Map<number, RoomPermissions>
            ) => {
                set_all_room_permissions(data);
            };
            subscriber.initial_room_data = (data: InitRoomData) => {
                set_base_room_data(data);
            };
            subscriber.profile_updated = (data: any) => {
                client.send("my_data", {});
            };
            subscriber.join_type_info = (data: JoinTypeInfo) => {
                let request = { roomId: data.room_id, peerId: my_id };
                if (data.as_speaker == true) {
                    client.send("join-as-speaker", request);
                } else {
                    client.send("join-as-new-peer", request);
                }
                client.send("get_iot_passive", {});
                push(`room/${data.room_id}`);
            };
            subscriber.new_hoi_controller = (data: NewIoTController) => {
                let log = {
                    tokens: [
                        {
                            t: "text",
                            v: `New Server Controller:${data.user_id}`,
                        },
                    ],
                    id: uuidv4(),
                    avatarUrl: "",
                    username: data.outside_name,
                    displayName: data.outside_name,
                    deleted: false,
                    deleterId: "",
                    sentAt: Date.now(),
                    isWhisper: false,
                };
                add_server_log(log);
                set_iot_server_controllers((prev) => {
                    if (prev.has(data.external_id)) {
                        prev.get(data.external_id).add(data.user_id);
                    } else {
                        prev.set(data.external_id, new Set());
                        prev.get(data.external_id).add(data.user_id);
                    }
                    console.log("after_new", data);
                    return prev;
                });
            };
            subscriber.new_iot_server = (data: NewIoTServer) => {
                set_iot_server_owners((prev) => {
                    prev?.set(data.external_id, data.owner_id);
                    return prev;
                });
                set_iot_server_outside_names((prev) => {
                    prev?.set(data.external_id, data.outside_name);
                    return prev;
                });
            };
            subscriber.passive_data = (data: PassiveData) => {
                set_iot_server_passive_data((prev) => {
                    prev?.set(data.external_id, data.passive_data);
                    return prev;
                });
            };
            subscriber.removed_hoi_controller = (
                data: RemovedIoTController
            ) => {
                let log = {
                    tokens: [
                        {
                            t: "text",
                            v: `Removed Controller:${data.user_id}`,
                        },
                    ],
                    id: uuidv4(),
                    avatarUrl: "",
                    username: data.outside_name,
                    displayName: data.outside_name,
                    deleted: false,
                    deleterId: "",
                    sentAt: Date.now(),
                    isWhisper: false,
                };
                add_server_log(log);
                set_iot_server_controllers((prev) => {
                    prev?.get(data.external_id)?.delete(data.user_id);
                    return prev;
                });
            };
            subscriber.hoi_server_disconnected = (external_id: String) => {
                console.log("server disconnected:", external_id);
                set_iot_server_passive_data((prev) => {
                    prev?.delete(external_id);
                    return prev;
                });
                set_iot_server_controllers((prev) => {
                    prev?.delete(external_id);
                    return prev;
                });
                set_iot_server_owners((prev) => {
                    prev?.delete(external_id);
                    return prev;
                });
                set_iot_server_outside_names((prev) => {
                    prev?.delete(external_id);
                    return prev;
                });
            };
            subscriber.users_blocked_from_room = (
                data: BlockedUsersForRoom
            ) => {
                set_current_room_blocked_users((prev) => {
                    return data.users;
                });
            };
            subscriber.existing_iot_data = (data: Array<ExistingIotServer>) => {
                for (var entry of data) {
                    set_iot_server_passive_data((prev) => {
                        prev?.set(
                            entry.external_id,
                            entry.passive_data_snap_shot
                        );
                        return prev;
                    });
                    set_iot_server_controllers((prev) => {
                        for (controller of entry.controllers_of_room) {
                            if (!prev?.has(entry.external_id)) {
                                prev?.set(entry.external_id, new Set());
                            }
                            prev.get(entry.external_id)?.add(controller);
                        }
                        return prev;
                    });
                    set_iot_server_owners((prev) => {
                        prev?.set(entry.external_id, entry.owner_id);
                        return prev;
                    });
                    set_iot_server_outside_names((prev) => {
                        prev?.set(entry.external_id, entry.outside_name);
                        return prev;
                    });
                }
            };
            // begin routing incoming data + auth
            client.begin();
            return client;
        } catch (e) {
            console.log("error");
            console.log(e);
        }
    }
};

export const MainContextProvider: React.FC<{ should_connect: boolean }> = ({
    should_connect,
    children,
}) => {
    const [dash_live_rooms, set_dash_live_rooms] = useState<
        CommunicationRoom[] | null
    >(null);
    const [client, set_client] = useState<Client | null>(null);
    const [user, set_user] = useState<BaseUser | null>(null);
    const [all_users_in_room, set_all_users_in_room] = useState<Map<
        string,
        User
    > | null>(null);
    const [im_following, set_my_following] = useState<Array<FollowInfo> | null>(
        null
    );
    const [error, set_error] = useState(false);
    const [current_room_permissions, set_current_permissions] = useState<Map<
        number,
        RoomPermissions
    > | null>(null);
    const [current_room_id, set_current_room_id] = useState<number | null>(
        null
    );
    const [current_room_base_data, set_current_room_base_data] =
        useState<InitRoomData | null>(null);
    const [iot_server_controllers, set_iot_server_controllers] = useState<Map<
        String,
        Set<number>
    > | null>(new Map());
    const [iot_server_owners, set_iot_server_owners] = useState<Map<
        String,
        number
    > | null>(new Map());
    const [iot_server_passive_data, set_iot_server_passive_data] = useState<Map<
        String,
        any
    > | null>(new Map());
    const [iot_server_outside_names, set_iot_server_outside_names] =
        useState<Map<String, any> | null>(new Map());
    const [selected_iot_server, set_selected_iot_server] = useState<
        number | null
    >(null);

    const [current_room_blocked_users, set_current_room_blocked_users] =
        useState<Array<User> | null>(null);

    // for the main interval triggered in the "my_data" callback of the subscriber above.
    // we need to clear it when needed.
    const [interval_handle, set_interval_handle] =
        useState<NodeJS.Timeout | null>(null);
    let { push } = useRouter();
    let { addServerLog } = useRoomChatStore();

    useEffect(() => {
        if (should_connect) {
            let temp_client: Client = initClient(
                set_current_room_base_data,
                set_current_permissions,
                set_interval_handle,
                set_error,
                set_user,
                set_dash_live_rooms,
                set_all_users_in_room,
                set_my_following,
                set_iot_server_controllers,
                set_iot_server_owners,
                set_iot_server_passive_data,
                set_iot_server_outside_names,
                set_current_room_blocked_users,
                push,
                addServerLog
            )!!;
            set_client((_prev: any) => {
                return temp_client;
            });
        }
    }, [should_connect]);
    useEffect(() => {
        if (error == true) {
            push("/");
        }
    }, [error]);
    return (
        <MainContext.Provider
            value={{
                dash_live_rooms: dash_live_rooms,
                client,
                user,
                all_users_in_room,
                im_following,
                create_client: () => {},
                main_interval_handle: interval_handle,
                current_room_permissions,
                current_room_id,
                set_current_room_id,
                current_room_base_data,
                set_all_users_in_room,
                set_all_room_permissions: set_current_permissions,
                set_base_room_data: set_current_room_base_data,
                iot_server_controllers,
                iot_server_outside_names,
                iot_server_passive_data,
                iot_server_owners,
                set_selected_iot_server,
                selected_iot_server,
                current_room_blocked_users,
            }}
        >
            {children}
        </MainContext.Provider>
    );
};
