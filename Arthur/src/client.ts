import WebSocket from "isomorphic-ws";
import {
  BaseUser,
  GetFollowListResponse,
  InitRoomData,
  SingleUserDataResults,
  SingleUserPermissionResults,
  UserPreview,
} from ".";
import {
  AuthResponse,
  AllUsersInRoomResponse,
  AuthCredentials,
  BasicRequest,
  BasicResponse,
  CommunicationRoom,
  DeafAndMuteStatusUpdate,
  RoomPermissions,
  RoomUpdate,
  JoinTypeInfo,
  NewIoTController,
  RemovedIoTController,
  ExistingIotServer,
  PassiveData,
  NewIoTServer,
  User,
  BlockedUsersForRoom,
} from "./entities";
type StringifiedUserId = string;
type Handler<Data> = (data: Data) => void;
type Nullable<T> = T | null;

/**
 * The main client for the Collaborative-IoT server.
 *
 * The user of this class needs to define an instance of
 * the client subscriber and the client publisher
 *
 */
export class Client {
  socket: WebSocket;
  auth: AuthCredentials;
  public client_sub: ClientSubscriber;

  constructor(
    address: string,
    client_sub: ClientSubscriber,
    auth_credentials: AuthCredentials
  ) {
    this.socket = new WebSocket(address, undefined);
    this.client_sub = client_sub;
    this.auth = auth_credentials;
  }

  /**
   * Starts the client
   */
  public begin() {
    let string_auth = JSON.stringify(this.auth);
    this.socket.onopen = (e: any) => {
      this.socket.send(string_auth);
    };
    this.socket.onmessage = async (e: any) => {
      try {
        await this.route(e);
      } catch (error) {
        console.log(e);
      }
    };
    this.socket.onerror = (e: any) => {
      console.log(e);
    };
  }

  /**
   * Sends a "Basic Request" to the server
   * @param op
   * @param data
   */
  public send(op: string, data: any) {
    let basic_request: BasicRequest = {
      request_op_code: op,
      request_containing_data: JSON.stringify(data),
    };
    this.socket.send(JSON.stringify(basic_request));
  }

  /**
   * Route incomming messages to the client subscriber defined
   * functionality
   */
  public async route(e: WebSocket.MessageEvent) {
    let basic_response: BasicResponse = JSON.parse(e.data.toString());
    switch (basic_response.response_op_code) {
      case "room_permissions": {
        if (this.client_sub.all_room_permissions) {
          this.client_sub.all_room_permissions(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "user_mute_and_deaf_update": {
        if (this.client_sub.deaf_and_mute_update) {
          this.client_sub.deaf_and_mute_update(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "@send-track-recv-done": {
        if (this.client_sub.send_track_recv_done) {
          this.client_sub.send_track_recv_done(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "@send-track-send-done": {
        if (this.client_sub.send_track_send_done) {
          this.client_sub.send_track_send_done(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "@connect-transport-recv-done": {
        if (this.client_sub.connect_transport_recv_done) {
          this.client_sub.connect_transport_recv_done(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "@connect-transport-send-done": {
        if (this.client_sub.connect_transport_send_done) {
          this.client_sub.connect_transport_send_done(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "invalid_request": {
        if (this.client_sub.invalid_request) {
          this.client_sub.invalid_request(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "user_hand_lowered": {
        if (this.client_sub.user_hand_lowered) {
          this.client_sub.user_hand_lowered(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "user_asking_to_speak": {
        if (this.client_sub.user_hand_raised) {
          this.client_sub.user_hand_raised(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "issue_creating_room" ||
        "issue_blocking_user" ||
        "issue_adding_speaker": {
        if (this.client_sub.internal_error) {
          this.client_sub.internal_error(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "room_meta_update": {
        if (this.client_sub.room_update) {
          this.client_sub.room_update(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "auth-not-good": {
        if (this.client_sub.bad_auth) {
          this.client_sub.bad_auth(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "auth-good": {
        if (this.client_sub.good_auth) {
          this.client_sub.good_auth(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "top_rooms": {
        if (this.client_sub.top_rooms) {
          this.client_sub.top_rooms(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "you-joined-as-speaker": {
        if (this.client_sub.you_joined_as_speaker) {
          await this.client_sub.you_joined_as_speaker(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "you-are-now-a-speaker": {
        if (this.client_sub.you_are_now_a_speaker) {
          await this.client_sub.you_are_now_a_speaker(
            JSON.parse(basic_response.response_containing_data)
          );
        }
      }
      case "you-joined-as-peer": {
        if (this.client_sub.you_joined_as_peer) {
          await this.client_sub.you_joined_as_peer(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "you_left_room": {
        if (this.client_sub.you_left_room) {
          this.client_sub.you_left_room(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "new_user_joined": {
        if (this.client_sub.new_user_joined) {
          this.client_sub.new_user_joined(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "all_users_for_room": {
        if (this.client_sub.all_users_in_room) {
          this.client_sub.all_users_in_room(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "speaker_removed": {
        if (this.client_sub.speaker_removed) {
          this.client_sub.speaker_removed(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "new_speaker": {
        if (this.client_sub.new_speaker) {
          this.client_sub.new_speaker(basic_response.response_containing_data);
        }
        break;
      }
      case "new-peer-speaker": {
        if (this.client_sub.new_peer_speaker) {
          await this.client_sub.new_peer_speaker(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "@get-recv-tracks-done": {
        if (this.client_sub.get_recv_tracks_done) {
          this.client_sub.get_recv_tracks_done(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "your_data": {
        if (this.client_sub.your_data) {
          this.client_sub.your_data(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "follow_list_response": {
        if (this.client_sub.followers) {
          this.client_sub.followers(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "user_previews": {
        if (this.client_sub.user_previews) {
          this.client_sub.user_previews(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "room-created": {
        if (this.client_sub.room_created) {
          this.client_sub.room_created(
            JSON.parse(basic_response.response_containing_data).roomId
          );
        }
        break;
      }
      case "initial_room_data": {
        if (this.client_sub.initial_room_data) {
          this.client_sub.initial_room_data(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "new_chat_message": {
        if (this.client_sub.new_chat_msg) {
          this.client_sub.new_chat_msg(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "join_type_info": {
        if (this.client_sub.join_type_info) {
          this.client_sub.join_type_info(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "single_user_permissions": {
        if (this.client_sub.single_user_permissions) {
          this.client_sub.single_user_permissions(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "single_user_data": {
        if (this.client_sub.single_user_data) {
          this.client_sub.single_user_data(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "user_left_room": {
        if (this.client_sub.user_left_room) {
          this.client_sub.user_left_room(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "user_follow_successful": {
        if (this.client_sub.user_follow_successful) {
          this.client_sub.user_follow_successful(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "user_unfollow_successful": {
        if (this.client_sub.user_unfollow_successful) {
          this.client_sub.user_unfollow_successful(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "profile_updated": {
        if (this.client_sub.profile_updated) {
          this.client_sub.profile_updated(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "user_info_updated": {
        if (this.client_sub.user_info_updated) {
          this.client_sub.user_info_updated(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "new_mod": {
        if (this.client_sub.new_mod) {
          this.client_sub.new_mod(basic_response.response_containing_data);
        }
        break;
      }
      case "removed_mod": {
        if (this.client_sub.removed_mod) {
          this.client_sub.removed_mod(basic_response.response_containing_data);
        }
        break;
      }
      case "new_owner": {
        if (this.client_sub.new_owner) {
          this.client_sub.new_owner(basic_response.response_containing_data);
        }
        break;
      }
      case "new_iot_server": {
        if (this.client_sub.new_iot_server) {
          this.client_sub.new_iot_server(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "hoi_server_disconnected": {
        if (this.client_sub.hoi_server_disconnected) {
          this.client_sub.hoi_server_disconnected(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "new_hoi_controller": {
        if (this.client_sub.new_hoi_controller) {
          this.client_sub.new_hoi_controller(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "removed_hoi_controller": {
        if (this.client_sub.removed_hoi_controller) {
          this.client_sub.removed_hoi_controller(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "passive_data": {
        if (this.client_sub.passive_data) {
          this.client_sub.passive_data(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "existing_iot_data": {
        if (this.client_sub.existing_iot_data) {
          this.client_sub.existing_iot_data(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      case "action_response_iot": {
        if (this.client_sub.action_response_iot) {
          this.client_sub.action_response_iot(
            basic_response.response_containing_data
          );
        }
        break;
      }
      case "users_blocked_from_room": {
        if (this.client_sub.users_blocked_from_room) {
          this.client_sub.users_blocked_from_room(
            JSON.parse(basic_response.response_containing_data)
          );
        }
        break;
      }
      default:
        console.log(
          "general error:",
          basic_response,
          basic_response.response_op_code == "top_rooms" ||
            basic_response.response_containing_data == "your_data"
        );
        break;
    }
  }
}

/**
 * All of the possible subscriptions to server events
 * this class is suppose to be directly consumed by the Client
 */
export class ClientSubscriber {
  /**
   * When authentication succeeds
   */
  public good_auth: Nullable<Handler<AuthResponse>> = null;
  /**
   * When authentication fails
   */
  public bad_auth: Nullable<Handler<AuthResponse>> = null;
  /**
   * When a request isn't correctly formatted
   */
  public invalid_request: Nullable<Handler<string>> = null;
  /**
   * When the server sends a follow list
   */
  public followers: Nullable<Handler<GetFollowListResponse>> = null;
  /**
   * When a user raises their hand
   */
  public user_hand_raised: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * When a user lowers their hand
   */
  public user_hand_lowered: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * When the server sends you all of the users in a room
   */
  public all_users_in_room: Nullable<Handler<AllUsersInRoomResponse>> = null;
  /**
   * When the server notifies you that you are no longer a room
   */
  public you_left_room: Nullable<Handler<any>> = null;
  /**
   * When the server lets you know there is a new message
   */
  public new_chat_msg: Nullable<Handler<any>> = null;
  /**
   * When the server sends you the permissions of a single user
   */
  public single_user_permissions: Nullable<
    Handler<SingleUserPermissionResults>
  > = null;
  /**
   * When the server sends you a single user's data
   */
  public single_user_data: Nullable<Handler<SingleUserDataResults>> = null;
  /**
   * When the server notifies you that you joined a room as
   * a peer
   */
  public you_joined_as_peer: Nullable<Handler<any>> = null;
  /**
   * When the server notifies you that you joined a room as
   * a speaker
   */
  public you_joined_as_speaker: Nullable<Handler<any>> = null;
  /**
   * When you have been promoted in your room to be a speaker
   */
  public you_are_now_a_speaker: Nullable<Handler<any>> = null;
  /**
   * When the server notifies you that there is a room settings
   * update
   */
  public room_update: Nullable<Handler<RoomUpdate>> = null;
  /**
   * When the server notifies you that a user updated their
   * mute/deaf status
   */
  public deaf_and_mute_update: Nullable<Handler<DeafAndMuteStatusUpdate>> =
    null;
  /**
   * When the server sends you your data
   */
  public your_data: Nullable<Handler<BaseUser>> = null;
  /**
   * When the server notifies you that there is a new iot server
   * connection to your current room
   */
  public new_iot_server: Nullable<Handler<NewIoTServer>> = null;
  /**
   * When the server notifies you that an action has completeted
   * and has a response.
   */
  public action_response_iot: Nullable<Handler<String>> = null;
  /**
   * When the server sends you the existing IoT
   */
  public existing_iot_data: Nullable<Handler<Array<ExistingIotServer>>> = null;
  /**
   * When the server notifies you that a iot server has been
   * disconnected from the room
   */
  public hoi_server_disconnected: Nullable<Handler<String>> = null;
  /**
   * When the server notifies you that there is a new person
   * added to the controllers of an iot server connected to
   * your room
   */
  public new_hoi_controller: Nullable<Handler<NewIoTController>> = null;
  /**
   * When the server notifies you that a person's permission to
   * control an IoT server has been revoked.
   */
  public removed_hoi_controller: Nullable<Handler<RemovedIoTController>> = null;
  /**
   * When the server sends you passive data for an iot server
   */
  public passive_data: Nullable<Handler<PassiveData>> = null;
  /**
   * When the server sends you all of the permissions for the
   * users in your room
   */
  public all_room_permissions: Nullable<Handler<Map<number, RoomPermissions>>> =
    null;
  /**
   * When the server sends you all of the top rooms
   */
  public top_rooms: Nullable<Handler<Array<CommunicationRoom>>> = null;
  /**
   * When the server lets you know a user in the same room/other
   * as you updates their information
   */
  public user_info_updated: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * when the server notifies you that your profile was updated
   */
  public profile_updated: Nullable<Handler<any>> = null;
  /**
   * When the server sends you the blocked users for the room
   * you are currently in.
   */
  public users_blocked_from_room: Nullable<Handler<BlockedUsersForRoom>> = null;
  /**
   * When the server encounters an internal error
   */
  public internal_error: Nullable<Handler<any>> = null;
  /**
   * When the server notifies you that a speaker is removed
   */
  public speaker_removed: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * When the server notifies you that a new user was blocked
   */
  public new_blocked_user: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * When the server notifies you that a new user has joined your room
   */
  public new_user_joined: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * When the server sends you user previews
   */
  public user_previews: Nullable<Handler<Map<number, UserPreview>>> = null;
  /**
   * When the server notifies you that there is a new speaker
   */
  public new_speaker: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * The initial data that is sent when you join a room
   */
  public initial_room_data: Nullable<Handler<InitRoomData>> = null;
  /**
   * When the server sends join type info for joining a room initially
   * this is when you try to join an existing room
   */
  public join_type_info: Nullable<Handler<JoinTypeInfo>> = null;
  /**
   * When someone is demoted from mod status
   */
  public removed_mod: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * When a new owner is selected for a room
   */
  public new_owner: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * When a new person is promoted to mod
   */
  public new_mod: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * When the server notifies you that your request to create a room
   * was successful.
   */
  public room_created: Nullable<Handler<number>> = null;
  /**
   * When your follow user request was successful
   */
  public user_follow_successful: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * When your unfollow user request was successful
   */
  public user_unfollow_successful: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * When the server lets you know that a user left the room
   */
  public user_left_room: Nullable<Handler<StringifiedUserId>> = null;
  /**
   * When the server notifies you that there is a new peer speaker
   *
   */
  public new_peer_speaker: Nullable<Handler<any>> = null;
  /**
   * WEBRTC related
   *
   */
  public connect_transport_recv_done: Nullable<Handler<any>> = null;
  /**
   * WEBRTC related
   *
   */
  public connect_transport_send_done: Nullable<Handler<any>> = null;
  /**
   * WEBRTC related
   *
   */
  public send_track_recv_done: Nullable<Handler<any>> = null;
  /**
   * WEBRTC related
   *
   */
  public send_track_send_done: Nullable<Handler<any>> = null;
  /**
   * WEBRTC related
   */
  public get_recv_tracks_done: Nullable<Handler<any>> = null;
}
