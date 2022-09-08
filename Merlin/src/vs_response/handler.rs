use crate::communication::types::BasicResponse;
use crate::logging;
use crate::state::state::ServerState;
use crate::vs_response::types::VoiceServerResponse;
use crate::ws_fan::fan;

//used for basic events where
//the user_id is the only containing data
//needed for the other users in the room
//but the main details is needed to be sent
//to the user themselves.
pub async fn notify_user_and_room(
    response: VoiceServerResponse,
    state: &mut ServerState,
    op_code_for_other_users: String,
) {
    logging::console::log_event(&format!(
        "VoiceServer triggered op code:{}",
        op_code_for_other_users
    ));
    let room_id: i32 = grab_room_id(response.d["roomId"].to_string());
    let user_id: i32 = response.uid.parse().unwrap();
    let basic_response_for_user = BasicResponse {
        response_op_code: response.op,
        response_containing_data: response.d.to_string(),
    };
    let basic_response_for_room = BasicResponse {
        response_op_code: op_code_for_other_users,
        response_containing_data: user_id.to_string(),
    };
    fan::broadcast_message_to_single_user(
        serde_json::to_string(&basic_response_for_user).unwrap(),
        state,
        &user_id,
    )
    .await;
    fan::broadcast_message_to_room_excluding_user(
        serde_json::to_string(&basic_response_for_room).unwrap(),
        state,
        room_id,
        user_id,
    )
    .await;
}

pub async fn notify_user_only(response: VoiceServerResponse, state: &mut ServerState) {
    let basic_response_for_user = BasicResponse {
        response_op_code: response.op,
        response_containing_data: response.d.to_string(),
    };
    let user_id: i32 = response.uid.parse().unwrap();
    fan::broadcast_message_to_single_user(
        serde_json::to_string(&basic_response_for_user).unwrap(),
        state,
        &user_id,
    )
    .await;
}

pub async fn notify_entire_room(response: serde_json::Value, state: &mut ServerState) {
    let basic_response_for_user = BasicResponse {
        response_op_code: response["op"].to_string(),
        response_containing_data: response["d"].to_string(),
    };
    let room_id: i32 = response["rid"].to_string().parse().unwrap();

    fan::broadcast_message_to_room(
        serde_json::to_string(&basic_response_for_user).unwrap(),
        state,
        room_id,
    )
    .await;
}

/// Simply remove the wrapping double quotes
/// from the roomId if it exists
fn grab_room_id(mut data: String) -> i32 {
    if data.contains(r#"""#) {
        data = data[1..data.len() - 1].to_string();
    }
    data.parse().unwrap()
}
