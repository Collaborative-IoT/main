import { Message, Room, RoomUser } from "../../ws/entities";
import normalizeUrl from "normalize-url";
import React, { useContext, useEffect, useRef } from "react";
import { useVirtual, VirtualItem } from "react-virtual";
import { useTypeSafeTranslation } from "../../../shared-hooks/useTypeSafeTranslation";
import { ParseTextToTwemoji, StaticTwemoji } from "../../../ui/Twemoji";
import { Emote } from "./Emote";
import { EmoteKeys } from "./EmoteData";
import { useRoomChatMentionStore } from "./useRoomChatMentionStore";
import { useRoomChatStore } from "./useRoomChatStore";
import { useResize } from "../useResize";
import { MainContext } from "../../../api_context/api_based";
import { RoomChatMessageToken, RoomChatMessage } from "./useRoomChatStore";
import { v4 as uuidv4 } from "uuid";
import { SingleUserDataResults, User } from "@collaborative/arthur";
import { ModeContext } from "../../../mode_context/room_mode";
import { useRouter } from "next/router";
interface ChatListProps {}

interface BadgeIconData {
    emoji: string;
    title: string;
}

export const RoomChatList: React.FC<ChatListProps> = () => {
    let { messages, current_server_logs, toggleFrozen } = useRoomChatStore();
    const bottomRef = useRef<null | HTMLDivElement>(null);
    const chatListRef = useRef<null | HTMLDivElement>(null);
    const {
        isRoomChatScrolledToTop,
        setIsRoomChatScrolledToTop,
        message,
        setMessage,
    } = useRoomChatStore();
    const { t } = useTypeSafeTranslation();
    const { push } = useRouter();
    const {
        user,
        client,
        all_users_in_room,
        set_all_room_permissions,
        set_all_users_in_room,
        current_room_id,
        current_room_permissions,
        current_room_base_data,
    } = useContext(MainContext);
    const { integration_mode_activated, set_selected_server_data_open } =
        useContext(ModeContext);

    //just swap messages for current server logs when
    //we are in integration mode viewing the different
    //server logs
    if (integration_mode_activated) {
        messages = current_server_logs;
    }

    // Only scroll into view if not manually scrolled to top
    useEffect(() => {
        if (!isRoomChatScrolledToTop) {
            chatListRef.current?.scrollTo(0, chatListRef.current.scrollHeight);
        }
    });

    useEffect(() => {
        if (client) {
            client!!.client_sub.new_chat_msg = (data: any) => {
                if (user && all_users_in_room) {
                    try {
                        const { open } = useRoomChatStore.getState();
                        //if me
                        if (data["userId"] == user!!.user_id.toString()) {
                            data["id"] = uuidv4();
                            data["avatarUrl"] = user.avatar_url;
                            data["username"] = user.username;
                            data["displayName"] = user.display_name;
                            data["deleted"] = false;
                            data["deleterId"] = "";
                            data["sentAt"] = Date.now();
                            data["isWhisper"] = false;
                        } else {
                            const this_user: User = all_users_in_room!!.get(
                                data["userId"]
                            )!!;
                            data["id"] = uuidv4();
                            data["avatarUrl"] = this_user.avatar_url;
                            data["username"] = this_user.username;
                            data["displayName"] = this_user.display_name;
                            data["deleted"] = false;
                            data["deleterId"] = "";
                            data["sentAt"] = Date.now();
                            data["isWhisper"] = false;
                        }
                        useRoomChatStore.getState().addMessage(data);
                        const { isRoomChatScrolledToTop } =
                            useRoomChatStore.getState();
                        if (
                            (!open ||
                                !document.hasFocus() ||
                                isRoomChatScrolledToTop) &&
                            !!data.tokens.filter(
                                (t: RoomChatMessageToken) =>
                                    t.t === "mention" &&
                                    t.v?.toLowerCase() ===
                                        user!!.username.toLowerCase()
                            ).length
                        ) {
                            useRoomChatMentionStore
                                .getState()
                                .incrementIAmMentioned();
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
            };
            client!!.client_sub.action_response_iot = (data: String) => {
                let data_obj = JSON.parse(data);
                data_obj = JSON.parse(data_obj["data"]);
                if (
                    data_obj["action"] &&
                    data_obj["bot_name"] &&
                    data_obj["status"] &&
                    data_obj["server_name"]
                ) {
                    //logs take the form of a chat message and integrates seamlessly with
                    //the user chat when integration mode is activated.
                    let log: RoomChatMessage = {
                        tokens: [
                            {
                                t: "text",
                                v: `Bot(${data_obj["bot_name"]}) responded with "${data_obj["status"]}"-> ${data_obj["action"]}`,
                            },
                        ],
                        id: uuidv4(),
                        avatarUrl: "",
                        username: `${data_obj["server_name"]}`,
                        displayName: `${data_obj["server_name"]}`,
                        deleted: false,
                        deleterId: "",
                        sentAt: Date.now(),
                        isWhisper: false,
                    };
                    useRoomChatStore.getState().addServerLog(log);
                }
            };
        }
    }, [client]);
    const windowSize = useResize();
    const truncateString = (str: string, num: number) => {
        if (str.length <= num) {
            return str;
        }
        return str.slice(0, num) + "...";
    };
    const rowVirtualizer = useVirtual({
        overscan: 10,
        size: messages.length,
        parentRef: chatListRef,
        estimateSize: React.useCallback(() => windowSize.y * 0.2, [windowSize]),
    });

    const getBadgeIcon = (m: Message) => {
        let badge: React.ReactNode | null = null;
        let permissions = current_room_permissions[m.userId];
        if (permissions && permissions.is_mod) {
            badge = <Emote title="Admin" alt="admin" size="small" emote="ez" />;
        }

        if (current_room_base_data!!.creator_id.toString() == m.userId) {
            badge = (
                <Emote
                    title="Admin"
                    alt="admin"
                    size="small"
                    emote="dogecool"
                />
            );
        }
        return <span style={{ marginRight: 4 }}>{badge}</span>;
    };

    return (
        <div
            className={`flex px-5 flex-1 overflow-y-auto chat-message-container scrollbar-thin scrollbar-thumb-primary-700`}
            ref={chatListRef}
            onScroll={() => {
                if (!chatListRef.current) return;
                const { scrollTop, offsetHeight, scrollHeight } =
                    chatListRef.current;
                const isOnBottom =
                    Math.abs(scrollTop + offsetHeight - scrollHeight) <= 1;

                setIsRoomChatScrolledToTop(!isOnBottom);
                if (isOnBottom) {
                    useRoomChatMentionStore.getState().resetIAmMentioned();
                }
            }}
            onMouseEnter={toggleFrozen}
            onMouseLeave={toggleFrozen}
        >
            <div
                className="w-full h-full mt-auto"
                style={{
                    height: `${rowVirtualizer.totalSize}px`,
                    width: "100%",
                    position: "relative",
                }}
            >
                {rowVirtualizer.virtualItems.map(
                    ({ index: idx, start, measureRef, size }: VirtualItem) => {
                        const index = messages.length - idx - 1;
                        const badgeIcon = getBadgeIcon(messages[index]);
                        return (
                            <div
                                ref={measureRef}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    width: "100%",
                                    transform: `translateY(${
                                        messages[index].isWhisper
                                            ? start
                                            : start
                                    }px)`,
                                }}
                                key={messages[index].id}
                                className="py-1"
                            >
                                <div
                                    className={`flex flex-col flex-shrink-0 w-full ${
                                        messages[index].isWhisper
                                            ? "bg-primary-700 rounded p-1 pt-0"
                                            : ""
                                    }`}
                                >
                                    {/* Whisper label */}
                                    {messages[index].isWhisper ? (
                                        <div className="flex mb-1 text-sm text-primary-300 px-1 w-16 mt-1 text-center">
                                            {t("modules.roomChat.whisper")}
                                        </div>
                                    ) : null}
                                    <div className={`flex items-center px-1`}>
                                        <div
                                            className={`block break-words overflow-hidden max-w-full items-start flex-1 text-primary-100`}
                                            key={messages[index].id}
                                        >
                                            {badgeIcon}
                                            <button
                                                onClick={(e) => {
                                                    if (
                                                        integration_mode_activated
                                                    ) {
                                                        set_selected_server_data_open(
                                                            true
                                                        );
                                                    } else {
                                                        push(
                                                            `../u/${messages[index].userId}`
                                                        );
                                                    }
                                                }}
                                                // DO NOT CHANGE FONT ON THIS BUTTON, IT CRASHES FIREFOX
                                                className={`inline hover:underline font-bold focus:outline-none`}
                                                style={{
                                                    textDecorationColor:
                                                        messages[index].color,
                                                    color: messages[index]
                                                        .color,
                                                }}
                                            >
                                                {truncateString(
                                                    messages[index].username,
                                                    8
                                                )}
                                            </button>
                                            <span className={`inline`}>: </span>
                                            <div className={`inline`}>
                                                {messages[index].deleted ? (
                                                    <span className="inline text-primary-300 italic">
                                                        {t(
                                                            "modules.roomChat.messageDeletion.message"
                                                        ) + ""}
                                                        {messages[index]
                                                            .deleterId ===
                                                        messages[index].userId
                                                            ? t(
                                                                  "modules.roomChat.messageDeletion.retracted"
                                                              )
                                                            : t(
                                                                  "modules.roomChat.messageDeletion.deleted"
                                                              )}
                                                    </span>
                                                ) : (
                                                    messages[index].tokens.map(
                                                        (
                                                            { t: token, v },
                                                            i
                                                        ) => {
                                                            switch (token) {
                                                                case "text":
                                                                    return (
                                                                        <React.Fragment
                                                                            key={
                                                                                i
                                                                            }
                                                                        >{`${v} `}</React.Fragment>
                                                                    );
                                                                case "emote":
                                                                    return (
                                                                        <Emote
                                                                            emote={
                                                                                v as EmoteKeys
                                                                            }
                                                                            key={
                                                                                i
                                                                            }
                                                                        />
                                                                    );

                                                                case "mention":
                                                                    return (
                                                                        <React.Fragment
                                                                            key={
                                                                                i
                                                                            }
                                                                        >
                                                                            <button
                                                                                onClick={() => {}}
                                                                                className={`inline flex-1 focus:outline-none ${
                                                                                    v ===
                                                                                    user?.username
                                                                                        ? "bg-accent text-button px-1 rounded text-md"
                                                                                        : ""
                                                                                }`}
                                                                                style={{
                                                                                    textDecorationColor:
                                                                                        v ===
                                                                                        user?.username
                                                                                            ? ""
                                                                                            : messages[
                                                                                                  index
                                                                                              ]
                                                                                                  .color,
                                                                                    color:
                                                                                        v ===
                                                                                        user?.username
                                                                                            ? ""
                                                                                            : messages[
                                                                                                  index
                                                                                              ]
                                                                                                  .color,
                                                                                }}
                                                                            >
                                                                                @
                                                                                {
                                                                                    v
                                                                                }
                                                                            </button>
                                                                            {""}
                                                                        </React.Fragment>
                                                                    );
                                                                case "link":
                                                                    try {
                                                                        return (
                                                                            <a
                                                                                target="_blank"
                                                                                rel="noreferrer noopener"
                                                                                href={
                                                                                    v
                                                                                }
                                                                                className={`inline flex-1 hover:underline text-accent`}
                                                                                key={
                                                                                    i
                                                                                }
                                                                            >
                                                                                {normalizeUrl(
                                                                                    v,
                                                                                    {
                                                                                        stripProtocol:
                                                                                            true,
                                                                                    }
                                                                                )}
                                                                                {
                                                                                    ""
                                                                                }
                                                                            </a>
                                                                        );
                                                                    } catch {
                                                                        return null;
                                                                    }
                                                                case "block":
                                                                    return (
                                                                        <React.Fragment
                                                                            key={
                                                                                i
                                                                            }
                                                                        >
                                                                            <span
                                                                                className={
                                                                                    "inline bg-primary-600 px-1 rounded whitespace-pre-wrap font-mono"
                                                                                }
                                                                            >
                                                                                {
                                                                                    v
                                                                                }
                                                                            </span>
                                                                            {""}
                                                                        </React.Fragment>
                                                                    );
                                                                case "emoji":
                                                                    return (
                                                                        <>
                                                                            <ParseTextToTwemoji
                                                                                text={
                                                                                    v
                                                                                }
                                                                            ></ParseTextToTwemoji>
                                                                        </>
                                                                    );
                                                                default:
                                                                    return null;
                                                            }
                                                        }
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }
                )}
                {/* {messages.length === 0 ? (
        <div className="flex">{t("modules.roomChat.welcomeMessage")}</div>
      ) : null} */}
            </div>
            <div ref={bottomRef} />
        </div>
    );
};
