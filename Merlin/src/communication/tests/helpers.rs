// These are helpers of the communication handler
// tests, these helper methods handle queue message
// gathering, server state manipulation(we use one global singleton),
// request struct creation that will be serialized into json
// and much more. None of the helpers deal with the test logic directly

pub mod helpers {
    use crate::communication::helpers;
    use crate::communication::types::{
        AllUsersInRoomResponse, BasicRequest, BasicResponse, BasicRoomCreation, CommunicationRoom,
        GenericRoomIdAndPeerId, GenericUserId, User, UserPreview, VoiceServerClosePeer,
        VoiceServerCreateRoom, VoiceServerRequest,
    };
    use crate::communication::{data_capturer, router};
    use crate::data_store::db_models::DBUser;
    use crate::data_store::sql_execution_handler::ExecutionHandler;
    use crate::rabbitmq::rabbit;
    use crate::state::state::ServerState;
    use crate::state::types;
    use futures::lock::Mutex;
    #[allow(unused_imports)]
    use futures_util::{stream::SplitSink, SinkExt, StreamExt, TryFutureExt};
    use lapin::{options::*, types::FieldTable, Channel, Connection, Consumer};
    use serde::Serialize;
    use std::collections::HashMap;
    use std::sync::Arc;
    use tokio::sync::mpsc;
    use tokio::sync::RwLock;
    use tokio_stream::wrappers::UnboundedReceiverStream;
    use warp::ws::Message;
    //All users must be present in memory before operation
    //unless they are spawned apart of a test
    pub async fn spawn_new_user_and_join_room(
        publish_channel: &Arc<Mutex<lapin::Channel>>,
        execution_handler: &Arc<Mutex<ExecutionHandler>>,
        state: &Arc<RwLock<ServerState>>,
        user_id: i32,
        consume_channel: &mut Consumer,
    ) -> UnboundedReceiverStream<Message> {
        let mock_temp_user = create_and_add_new_user_channel_to_peer_map(user_id, state).await;
        insert_user_state(state, user_id).await;
        let create_room_msg = basic_request(
            "join-as-new-peer".to_owned(),
            generic_room_and_peer_id(user_id, 3),
        );
        send_create_or_join_room_request(
            state,
            create_room_msg.clone(),
            publish_channel,
            execution_handler,
            -1,
            &user_id,
        )
        .await;
        //we need to consume the message
        //so the queue can be clear
        //since we don't need to check
        //the publish to the queue.
        //
        //Because the tests ran before
        //this method's first call
        //already confirmed this
        //functionality is correct.
        consume_message(consume_channel).await;
        return mock_temp_user;
    }

    pub async fn insert_starting_user_state(server_state: &Arc<RwLock<ServerState>>) {
        insert_user_state(server_state, 33).await;
        insert_user_state(server_state, 34).await;
    }

    pub async fn insert_user_state(server_state: &Arc<RwLock<ServerState>>, user_id: i32) {
        let mut state = server_state.write().await;
        let user = types::User {
            muted: true,
            deaf: true,
            ip: "test".to_string(),
            current_room_id: -1,
        };
        state.active_users.insert(user_id, user);
    }

    //starts rabbitmq connection channel
    pub async fn setup_channel(conn: &Connection) -> Channel {
        let publish_channel = conn.create_channel().await.unwrap();
        publish_channel
            .queue_declare(
                "voice_server_consume",
                QueueDeclareOptions::default(),
                FieldTable::default(),
            )
            .await
            .unwrap();
        return publish_channel;
    }

    pub async fn consume_message(consumer: &mut Consumer) -> String {
        let delivery = consumer.next().await.unwrap().unwrap().1;
        delivery.ack(BasicAckOptions::default()).await.expect("ack");
        let parsed_msg = rabbit::parse_message(delivery);
        return parsed_msg;
    }

    pub async fn create_and_add_new_user_channel_to_peer_map(
        mock_id: i32,
        mock_state: &Arc<RwLock<ServerState>>,
    ) -> UnboundedReceiverStream<Message> {
        let (tx, rx) = mpsc::unbounded_channel();
        let rx = UnboundedReceiverStream::new(rx);
        //add initial peer state to state
        //we will use th
        mock_state.write().await.peer_map.insert(mock_id, tx);
        return rx;
    }

    pub async fn grab_and_assert_request_response(
        rx: &mut UnboundedReceiverStream<Message>,
        op_code: &str,
        containing_data: &str,
    ) {
        let message = rx.next().await.unwrap().to_str().unwrap().to_owned();
        let parsed_json: BasicResponse = serde_json::from_str(&message).unwrap();
        assert_eq!(parsed_json.response_op_code, op_code);
        assert_eq!(parsed_json.response_containing_data, containing_data);
    }

    pub async fn grab_and_assert_message_to_voice_server<
        T: serde::de::DeserializeOwned + Serialize,
    >(
        consume_channel: &mut Consumer,
        d: String,
        uid: String,
        op: String,
    ) {
        let message = consume_message(consume_channel).await;
        let vs_message: VoiceServerRequest<T> = serde_json::from_str(&message).unwrap();
        assert_eq!(serde_json::to_string(&vs_message.d).unwrap(), d);
        assert_eq!(op, vs_message.op);
        assert_eq!(uid, vs_message.uid);
    }

    pub fn basic_request(op: String, data: String) -> String {
        return serde_json::to_string(&BasicRequest {
            request_op_code: op,
            request_containing_data: data,
        })
        .unwrap();
    }

    pub fn basic_hand_raise_or_lower(room_id: i32, peer_id: i32) -> String {
        return serde_json::to_string(&GenericRoomIdAndPeerId {
            roomId: room_id,
            peerId: peer_id,
        })
        .unwrap();
    }

    pub fn basic_room_creation() -> String {
        return serde_json::to_string(&BasicRoomCreation {
            name: "test".to_owned(),
            desc: "test".to_owned(),
            public: true,
        })
        .unwrap();
    }

    pub fn basic_voice_server_creation() -> String {
        return serde_json::to_string(&VoiceServerCreateRoom {
            roomId: 3.to_string(),
        })
        .unwrap();
    }

    pub fn generic_room_and_peer_id(user_id: i32, room_id: i32) -> String {
        return serde_json::to_string(&GenericRoomIdAndPeerId {
            roomId: room_id,
            peerId: user_id,
        })
        .unwrap();
    }

    pub fn generic_close_peer(user_id: i32, room_id: i32) -> String {
        return serde_json::to_string(&VoiceServerClosePeer {
            roomId: room_id.to_string(),
            peerId: user_id.to_string(),
            kicked: true,
        })
        .unwrap();
    }

    pub async fn send_create_or_join_room_request(
        state: &Arc<RwLock<ServerState>>,
        msg: String,
        publish_channel: &Arc<Mutex<lapin::Channel>>,
        execution_handler: &Arc<Mutex<ExecutionHandler>>,
        curr_room: i32,
        user_id: &i32,
    ) {
        let mut server_state = state.write().await;
        server_state
            .active_users
            .get_mut(user_id)
            .unwrap()
            .current_room_id = curr_room;
        drop(server_state);
        router::route_msg(
            msg,
            user_id.clone(),
            state,
            publish_channel,
            None,
            execution_handler,
        )
        .await
        .unwrap();
    }

    //This is used to clear the messages that get fanned
    // to other mock users in a room for our tests.
    //
    //The way we do our tests, requires the user's
    //channel to be completely clear.
    pub async fn clear_message_that_was_fanned(rxs: Vec<&mut UnboundedReceiverStream<Message>>) {
        for rx in rxs {
            rx.next().await.unwrap();
        }
    }

    pub fn generate_user_struct(gh_id: String, dc_id: String) -> DBUser {
        let user: DBUser = DBUser {
            id: 0, //doesn't matter in insertion
            display_name: "teseeeet12".to_string(),
            avatar_url: "test.cxexeeom/avatar2".to_string(),
            user_name: "ultimatxeeexe_tester2".to_string(),
            last_online: "test".to_string(),
            github_id: gh_id,
            discord_id: dc_id,
            github_access_token: "23diudi2322".to_string(),
            discord_access_token: "2ejnedjn93202".to_string(),
            banned: false,
            banned_reason: "ban evaejkeouding2".to_string(),
            bio: "teldmdst2".to_string(),
            contributions: 40,
            banner_url: "test.doijeoocom/test_banner2".to_string(),
        };
        return user;
    }

    //This helps clear all of the fluff from room state
    //one time users
    pub async fn clear_all_users_except_owner(server_state: &Arc<RwLock<ServerState>>) {
        let mut write_state = server_state.write().await;
        let room = write_state.rooms.get_mut(&3).unwrap();
        room.user_ids.remove(&34);
        room.user_ids.remove(&35);
        room.user_ids.remove(&36);
        room.user_ids.remove(&37);
        room.user_ids.remove(&38);
    }

    pub async fn spawn_new_real_user_and_join_room(
        publish_channel: &Arc<Mutex<lapin::Channel>>,
        execution_handler: &Arc<Mutex<ExecutionHandler>>,
        state: &Arc<RwLock<ServerState>>,
        consume_channel: &mut Consumer,
        gh_id: String,
        dc_id: String,
    ) -> (i32, UnboundedReceiverStream<Message>) {
        let mut handler = execution_handler.lock().await;
        let user_id =
            data_capturer::capture_new_user(&mut handler, &generate_user_struct(gh_id, dc_id))
                .await;
        drop(handler);
        let rx = spawn_new_user_and_join_room(
            publish_channel,
            execution_handler,
            state,
            user_id,
            consume_channel,
        )
        .await;
        return (user_id, rx);
    }

    pub async fn construct_top_room_response_for_test(
        user_id: i32,
        state: &Arc<RwLock<ServerState>>,
    ) -> Vec<CommunicationRoom> {
        //we know these values of the room construction
        //because we created the room/user manually
        let preview = UserPreview {
            display_name: "teseeeet12".to_string(),
            avatar_url: "test.cxexeeom/avatar2".to_string(),
        };
        let mut mock_previews: HashMap<i32, UserPreview> = HashMap::new();
        mock_previews.insert(user_id, preview);
        let read_state = state.read().await;
        let room_state = read_state.rooms.get(&3).unwrap();
        let mut holder: Vec<CommunicationRoom> = Vec::new();
        helpers::construct_communication_room(
            mock_previews,
            room_state,
            &mut holder,
            33,
            "fast".to_string(),
        );
        return holder;
    }

    pub fn construct_user_response_for_test(user_id: i32) -> String {
        let user = User {
            you_are_following: false,
            display_name: "teseeeet12".to_string(),
            avatar_url: "test.cxexeeom/avatar2".to_string(),
            they_blocked_you: false,
            i_blocked_them: false,
            username: "ultimatxeeexe_tester2".to_string(),
            num_followers: 0,
            num_following: 0,
            last_online: "test".to_string(),
            user_id: user_id,
            follows_you: false,
            contributions: 40,
            bio: "teldmdst2".to_string(),
            banner_url: "test.doijeoocom/test_banner2".to_string(),
        };
        let response = AllUsersInRoomResponse {
            room_id: 3,
            users: vec![user],
        };
        return serde_json::to_string(&response).unwrap();
    }

    pub async fn trigger_block_or_unblock(
        publish_channel: &Arc<Mutex<lapin::Channel>>,
        state: &Arc<RwLock<ServerState>>,
        execution_handler: &Arc<Mutex<ExecutionHandler>>,
        new_user: &mut (i32, UnboundedReceiverStream<Message>),
        new_second_user: &(i32, UnboundedReceiverStream<Message>),
        block_op_code: String,
        response_op_code: &str,
    ) {
        let block_request = basic_request(
            block_op_code,
            serde_json::to_string(&GenericUserId {
                user_id: new_second_user.0.clone(),
            })
            .unwrap(),
        );
        router::route_msg(
            block_request,
            new_user.0.to_owned(),
            state,
            publish_channel,
            None,
            execution_handler,
        )
        .await
        .unwrap();
        grab_and_assert_request_response(
            &mut new_user.1,
            response_op_code,
            &new_second_user.0.to_string(),
        )
        .await;
    }
}
