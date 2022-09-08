import isElectron from "is-electron";
import { useContext } from "react";
import { useCurrentRoomFromCache } from "./useCurrentRoomFromCache";

let roomModData: { [id: string]: boolean } = {};
let ipcRenderer: any = undefined;

export const useCurrentRoomInfo = () => {
    const data = useCurrentRoomFromCache();

    if (!data) {
        return {
            isMod: false,
            isCreator: false,
            isSpeaker: false,
            canSpeak: false,
        };
    }

    let isMod = false;
    let isSpeaker = false;
    let canIAskToSpeak = false;
    const isCreator = true;

    if (isElectron()) {
        const currentRoomId = data.room.id;
        if (!roomModData) {
            roomModData = { [currentRoomId]: false };
        }
        if (!roomModData[currentRoomId]) {
            roomModData[currentRoomId] = false;
        }
        if (roomModData[currentRoomId] !== isMod) {
            roomModData[currentRoomId] = isMod;
            ipcRenderer = window.require("electron").ipcRenderer;
            ipcRenderer.send("@notification/mod", isMod);
        }
    }
    return {
        isCreator,
        isMod,
        isSpeaker,
        canIAskToSpeak,
        canSpeak: isCreator || isSpeaker,
    };
};
