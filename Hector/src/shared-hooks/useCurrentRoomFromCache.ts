import { useCurrentRoomId } from "./useCurrentRoomId";
import { Room, UserPreview, UserWithFollowInfo } from "../modules/ws/entities";
export const useCurrentRoomFromCache = () => {
    const roomId = useCurrentRoomId();
    // this should read from the cache

    const userPreview: UserPreview = {
        id: "222",
        displayName: "tester",
        numFollowers: 2,
        avatarUrl: "",
    };
    const room: Room = {
        id: "222",
        numPeopleInside: 2,
        voiceServerId: "222",
        creatorId: "23423",
        peoplePreviewList: [userPreview],
        autoSpeaker: false,
        inserted_at: "2",
        chatMode: "default",
        name: "test room 445",
        chatThrottle: 2000,
        isPrivate: false,
        description: "test desc",
    };
    return { room };
};
