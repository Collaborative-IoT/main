import { JoinRoomAndGetInfoResponse } from "../ws/entities";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useCurrentRoomIdStore } from "../../global-stores/useCurrentRoomIdStore";
import { isServer } from "../../lib/isServer";
import { validate as uuidValidate } from "uuid";
import { showErrorToast } from "../../lib/showErrorToast";
import isElectron from "is-electron";
import { useRoomChatStore } from "./chat/useRoomChatStore";

let ipcRenderer: any = null;
if (isElectron()) {
    ipcRenderer = window.require("electron").ipcRenderer;
}
export const useGetRoomByQueryParam = () => {
    const { setCurrentRoomId } = useCurrentRoomIdStore();
    const { query } = useRouter();
    const roomId = typeof query.id === "string" ? query.id : "";
    const { push } = useRouter();
    return { test: { test: "t" }, data: true };
};
