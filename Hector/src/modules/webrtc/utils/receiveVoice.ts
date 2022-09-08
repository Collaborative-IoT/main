import { Client } from "@collaborative/arthur";
import { RoomPeer } from "../../ws/entities";
import { useVoiceStore } from "../stores/useVoiceStore";
import { consumeAudio } from "./consumeAudio";

export const receiveVoice = (conn: Client, flushQueue: () => void) => {
    conn!!.client_sub.get_recv_tracks_done = (params: {
        consumerParametersArr: RoomPeer[];
    }) => {
        try {
            for (const {
                peerId,
                consumerParameters,
            } of params.consumerParametersArr) {
                consumeAudio(consumerParameters, peerId);
            }
        } catch (err) {
            console.log(err);
        } finally {
            flushQueue();
        }
    };
    conn!!.send("@get-recv-tracks", {
        rtpCapabilities: useVoiceStore.getState().device!.rtpCapabilities,
    });
};
