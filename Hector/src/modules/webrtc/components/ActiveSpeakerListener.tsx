import hark from "hark";
import React, { useContext, useEffect } from "react";
import { useCurrentRoomIdStore } from "../../../global-stores/useCurrentRoomIdStore";
import { useDebugAudioStore } from "../../../global-stores/useDebugAudio";
import { useConn } from "../../../shared-hooks/useConn";
import { useVoiceStore } from "../stores/useVoiceStore";

interface ActiveSpeakerListenerProps {}

export const ActiveSpeakerListener: React.FC<
    ActiveSpeakerListenerProps
> = ({}) => {
    const { micStream } = useVoiceStore();
    const { currentRoomId } = useCurrentRoomIdStore();
    const { debugAudio } = useDebugAudioStore();
    useEffect(() => {
        if (!currentRoomId || !micStream) {
            return;
        }

        const harker = hark(micStream, { threshold: -65, interval: 75 });

        harker.on("speaking", () => {});

        harker.on("stopped_speaking", () => {});

        return () => {
            harker.stop();
        };
    }, [micStream, currentRoomId]);

    return null;
};
