import React, { useContext, useEffect } from "react";
import { useDebugAudioStore } from "../../global-stores/useDebugAudio";
import { useCurrentRoomInfo } from "../../shared-hooks/useCurrentRoomInfo";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { Modal } from "../../ui/Modal";
import { Form, Formik } from "formik";
import { ButtonLink } from "../../ui/ButtonLink";
import { InputField } from "../../form-fields/InputField";
import { ModeContext } from "../../mode_context/room_mode";
import { MainContext } from "../../api_context/api_based";
export const CustomActionModal: React.FC<{}> = ({}) => {
    //const { isCreator: iAmCreator, isMod } = useCurrentRoomInfo();
    // const {user,all_users_in_room,current_room_permissions,current_room_base_data,client} = useContext(MainContext);
    const { custom_action_open, set_custom_action_open } =
        useContext(ModeContext);
    const { client, user, selected_iot_server } = useContext(MainContext);
    return (
        <Modal
            isOpen={custom_action_open}
            onRequestClose={() => {
                set_custom_action_open(false);
            }}
        >
            <Formik
                initialValues={{
                    name: "",
                    action_name: "",
                }}
                validateOnChange={false}
                validate={() => {}}
                onSubmit={(data) => {
                    client!!.send("request_hoi_action", {
                        server_id: selected_iot_server,
                        bot_name: data.name,
                        action: data.action_name,
                    });
                    set_custom_action_open(false);
                }}
            >
                {({ isSubmitting }) => (
                    <Form className={`flex-col w-full`}>
                        <h4 className={`mb-2 text-primary-100`}>
                            Send Action Request
                        </h4>
                        <InputField
                            className={`mb-4`}
                            errorMsg={"Issue with name"}
                            label={"Device Name"}
                            name="name"
                        />
                        <InputField
                            className={`mb-4`}
                            errorMsg={"Issue with action name"}
                            label={"Action Name"}
                            name="action_name"
                        />
                        <div className={`flex pt-2 items-center`}>
                            <Button
                                loading={isSubmitting}
                                type="submit"
                                className={`mr-3`}
                            >
                                {"Send Request"}
                            </Button>
                            <ButtonLink
                                type="button"
                                onClick={() => {
                                    set_custom_action_open(false);
                                }}
                            >
                                {"Cancel"}
                            </ButtonLink>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};
