import { useRouter } from "next/router";
import React, { useContext, useEffect, useRef } from "react";
import { useMuteStore } from "../../global-stores/useMuteStore";
import { useDeafStore } from "../../global-stores/useDeafStore";
import { ActiveSpeakerListener } from "./components/ActiveSpeakerListener";
import { AudioRender } from "./components/AudioRender";
import { useMicIdStore } from "./stores/useMicIdStore";
import { useVoiceStore } from "./stores/useVoiceStore";
import { useRoomChatStore } from "../room/chat/useRoomChatStore";
import { consumeAudio } from "./utils/consumeAudio";
import { createTransport } from "./utils/createTransport";
import { joinRoom } from "./utils/joinRoom";
import { receiveVoice } from "./utils/receiveVoice";
import { sendVoice } from "./utils/sendVoice";
import { MainContext } from "../../api_context/api_based";

interface App2Props {}

export function closeVoiceConnections(_roomId: number | null) {
    const { roomId, mic, nullify } = useVoiceStore.getState();
    if (_roomId === null || _roomId === roomId) {
        if (mic) {
            console.log("stopping mic");
            mic.stop();
        }

        console.log("nulling transports");
        nullify();
    }
}

export const WebRtcApp: React.FC<App2Props> = () => {
    const {
        client,
        current_room_id,
        set_current_room_id,
        set_all_room_permissions,
        set_all_users_in_room,
        set_base_room_data,
    } = useContext(MainContext);
    const { mic } = useVoiceStore();
    const { micId } = useMicIdStore();
    const { muted } = useMuteStore();
    const { deafened } = useDeafStore();
    const initialLoad = useRef(true);
    const { push } = useRouter();

    useEffect(() => {
        if (micId && !initialLoad.current) {
            sendVoice();
        }
        initialLoad.current = false;
    }, [micId]);
    const consumerQueue = useRef<{ roomId: string; d: any }[]>([]);

    function flushConsumerQueue(_roomId: string) {
        try {
            for (const {
                roomId,
                d: { peerId, consumerParameters },
            } of consumerQueue.current) {
                if (_roomId === roomId) {
                    consumeAudio(consumerParameters, peerId);
                }
            }
        } catch (err) {
            console.log(err);
        } finally {
            consumerQueue.current = [];
        }
    }
    useEffect(() => {
        if (mic) {
            mic.enabled = !muted && !deafened;
        }
    }, [mic, muted, deafened]);
    useEffect(() => {
        if (!client) {
            return;
        }
        (client!!.client_sub.you_left_room = (data: any) => {
            useRoomChatStore.getState().clearChat();
            set_current_room_id(null);
            set_all_room_permissions(null);
            set_base_room_data(null);
            closeVoiceConnections(data.roomId);
            push("/dash");
        }),
            (client.client_sub.new_peer_speaker = async (data: any) => {
                const { roomId, recvTransport } = useVoiceStore.getState();
                if (recvTransport && roomId === data.roomId) {
                    await consumeAudio(data.consumerParameters, data.peerId);
                } else {
                    let id: string = roomId ? roomId.toString() : "";
                    consumerQueue.current = [
                        ...consumerQueue.current,
                        { roomId: id, d: data },
                    ];
                }
            }),
            (client.client_sub.you_are_now_a_speaker = async (data: any) => {
                if (data.roomId !== useVoiceStore.getState().toString()) {
                    return;
                }
                // setStatus("connected-speaker");
                try {
                    await createTransport(
                        client,
                        data.roomId,
                        "send",
                        data.sendTransportOptions
                    );
                } catch (err) {
                    console.log(err);
                    return;
                }
                console.log("sending voice");
                try {
                    await sendVoice();
                } catch (err) {
                    console.log(err);
                }
            }),
            (client.client_sub.you_joined_as_peer = async (data: any) => {
                closeVoiceConnections(null);
                useVoiceStore.getState().set({ roomId: data.roomId });
                // setStatus("connected-listener");
                consumerQueue.current = [];
                console.log("creating a device");
                try {
                    set_current_room_id(+data.roomId);
                    console.log("peeer id:", +data.roomId);
                    //request initial room information.
                    client.send("initial_room_data", { room_id: +data.roomId });
                    client.send("gather_all_users_in_room", {
                        room_id: +data.roomId,
                    });
                    client.send("all_room_permissions", {});
                    await joinRoom(data.routerRtpCapabilities);
                } catch (err) {
                    console.log("error creating a device | ", err);
                    return;
                }
                try {
                    await createTransport(
                        client,
                        data.roomId,
                        "recv",
                        data.recvTransportOptions
                    );
                } catch (err) {
                    console.log("error creating recv transport | ", err);
                    return;
                }
                receiveVoice(client, () => flushConsumerQueue(data.roomId));
            }),
            (client.client_sub.you_joined_as_speaker = async (data: any) => {
                closeVoiceConnections(null);
                useVoiceStore.getState().set({ roomId: data.roomId });
                // setStatus("connected-speaker");
                consumerQueue.current = [];
                console.log("creating a device");
                try {
                    set_current_room_id(+data.roomId);
                    //request initial room information.
                    client.send("initial_room_data", { room_id: +data.roomId });
                    client.send("gather_all_users_in_room", {
                        room_id: +data.roomId,
                    });
                    client.send("all_room_permissions", {});
                    await joinRoom(data.routerRtpCapabilities);
                } catch (err) {
                    console.log("error creating a device | ", err);
                    return;
                }
                try {
                    await createTransport(
                        client,
                        data.roomId,
                        "send",
                        data.sendTransportOptions
                    );
                } catch (err) {
                    console.log("error creating send transport | ", err);
                    return;
                }
                console.log("sending voice");
                try {
                    await sendVoice();
                } catch (err) {
                    console.log("error sending voice | ", err);
                    return;
                }
                await createTransport(
                    client,
                    data.roomId,
                    "recv",
                    data.recvTransportOptions
                );
                receiveVoice(client, () => flushConsumerQueue(data.roomId));
            });
    }, [client, push, current_room_id]);

    return (
        <>
            <AudioRender />
            <ActiveSpeakerListener />
        </>
    );
};
