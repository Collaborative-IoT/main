import { useDeafStore } from "../global-stores/useDeafStore";
import { useMuteStore } from "../global-stores/useMuteStore";
import { useWrappedConn } from "./useConn";

export const setMute = (conn: any, value: boolean) => {
    const { setInternalDeaf, deafened } = useDeafStore.getState();
    // auto undeafen on unmute
    if (deafened) {
        setInternalDeaf(false);
    } else {
        useMuteStore.getState().setInternalMute(value);
    }
};

export const useSetMute = () => {
    const conn = useWrappedConn();
    return (value: boolean) => {
        setMute(conn, value);
    };
};
