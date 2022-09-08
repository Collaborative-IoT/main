export type User = {
  you_are_following: boolean;
  username: string;
  they_blocked_you: boolean;
  num_following: number;
  num_followers: number;
  last_online: string;
  user_id: number;
  follows_you: boolean;
  contributions: number;
  display_name: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  i_blocked_them: boolean;
};

export type AllUsersInRoomResponse = {
  room_id: number;
  users: Array<User>;
};

export type GetFollowListResponse = {
  user_ids: Array<FollowInfo>;
  for_user: Number;
};

export type RoomDetails = {
  name: string;
  chat_throttle: number;
  is_private: boolean;
  description: string;
};

export type UserPreview = {
  display_name: string;
  avatar_url: string;
};

export type CommunicationRoom = {
  details: RoomDetails;
  room_id: number;
  num_of_people_in_room: number;
  voice_server_id: string;
  creator_id: number;
  people_preview_data: Map<number, UserPreview>;
  auto_speaker_setting: boolean;
  created_at: string;
  chat_mode: string;
};

export type InitRoomData = {
  details: RoomDetails;
  creator_id: number;
  auto_speaker_setting: number;
  created_at: string;
  chat_mode: string;
};

export type BasicRoomCreation = {
  name: string;
  desc: string;
  public: boolean;
};

export type AuthCredentials = {
  access: string;
  refresh: string;
  oauth_type: string;
};

export type RoomPermissions = {
  asked_to_speak: boolean;
  is_speaker: boolean;
  is_mod: boolean;
};

export type DeafAndMuteStatus = {
  muted: boolean;
  deaf: boolean;
};

export type DeafAndMuteStatusUpdate = {
  muted: boolean;
  deaf: boolean;
  user_id: boolean;
};

export type BasicResponse = {
  response_op_code: string;
  response_containing_data: string;
};

export type BasicRequest = {
  request_op_code: string;
  request_containing_data: string;
};

export type RoomUpdate = {
  name: string;
  public: boolean;
  chat_throttle: number;
  description: string;
  auto_speaker: boolean;
};

export type AuthResponse = {
  new_access: string;
  new_refresh: string;
};

export type BaseUser = {
  username: string;
  last_online: string;
  user_id: number;
  bio: string;
  display_name: string;
  avatar_url: string;
  banner_url: string;
  num_following: number;
  num_followers: number;
  contributions: number;
};

export type FollowInfo = {
  user_id: number;
  username: string;
  avatar_url: string;
  online: boolean;
  room_id: number | null;
};

export type VoiceServerResponse = {
  op: string;
  d: any;
  uid: string | null;
  rid: string | null;
};

export type JoinTypeInfo = {
  as_speaker: boolean;
  as_listener: boolean;
  room_id: number;
};

export type SingleUserPermissionResults = {
  user_id: number;
  data: RoomPermissions;
};

export type SingleUserDataResults = {
  user_id: number;
  data: User;
};

export type NewIoTServer = {
  external_id: String;
  owner_id: number;
  outside_name: String;
};

export type NewIoTController = {
  external_id: String;
  user_id: number;
  outside_name: String;
};

export type RemovedIoTController = {
  external_id: String;
  user_id: number;
  outside_name:String
};

export type PassiveData = {
  external_id: String;
  passive_data: String;
};

export type ExistingIotServer = {
  owner_id: number;
  external_id: String;
  controllers_of_room: Array<number>;
  passive_data_snap_shot: String | null;
  outside_name: String;
};

export type BlockedUsersForRoom = {
  users: Array<User>;
};
