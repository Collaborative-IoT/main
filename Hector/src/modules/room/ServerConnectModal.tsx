import React, { useContext, useEffect } from "react";
import { useDebugAudioStore } from "../../global-stores/useDebugAudio";
import { useConn } from "../../shared-hooks/useConn";
import { useCurrentRoomInfo } from "../../shared-hooks/useCurrentRoomInfo";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { Modal } from "../../ui/Modal";
import { Form, Formik } from "formik";
import { ButtonLink } from "../../ui/ButtonLink";
import { InputField } from "../../form-fields/InputField";
import { ModeContext } from "../../mode_context/room_mode";
import { MainContext } from "../../api_context/api_based";
export const ConnectModal: React.FC<{}> = ({}) => {
    //const { isCreator: iAmCreator, isMod } = useCurrentRoomInfo();
    // const {user,all_users_in_room,current_room_permissions,current_room_base_data,client} = useContext(MainContext);
    const { integration_add_open, set_integration_add } =
        useContext(ModeContext);
    const { client, user } = useContext(MainContext);
    return (
        <Modal
            isOpen={integration_add_open}
            onRequestClose={() => {
                set_integration_add(false);
            }}
        >
            <Formik
                initialValues={{
                    connection_string: "wss://",
                    name: "",
                    password: "",
                    admin_password: "",
                    outside_name: "",
                }}
                validateOnChange={false}
                validate={() => {}}
                onSubmit={(data) => {
                    client!!.send("connect_hoi", {
                        connection_str: data.connection_string,
                        name_and_type: JSON.stringify({
                            name: data.name,
                            type: "non-bot",
                        }),
                        password: data.password,
                        admin_password: data.admin_password,
                        outside_name: data.outside_name,
                        user_id: user!!.user_id,
                    });
                    set_integration_add(false);
                }}
            >
                {({ isSubmitting }) => (
                    <Form className={`flex-col w-full`}>
                        <h4 className={`mb-2 text-primary-100`}>
                            Connect to IoT
                        </h4>
                        <InputField
                            className={`mb-4`}
                            errorMsg={"Issue with connection string"}
                            label={"Connection URL"}
                            name="connection_string"
                        />
                        <InputField
                            className={`mb-4`}
                            errorMsg={"Issue with name"}
                            label={"Name"}
                            name="name"
                        />
                        <InputField
                            className={`mb-4`}
                            errorMsg={"Issue with password"}
                            label={"Password"}
                            name="password"
                        />
                        <InputField
                            className={`mb-4`}
                            errorMsg={"Issue with admin password"}
                            label={"Admin Password"}
                            name="admin_password"
                        />
                        <InputField
                            className={`mb-4`}
                            errorMsg={"Issue with outside name"}
                            label={"Outside Name"}
                            name="outside_name"
                        />
                        <div className={`flex pt-2 items-center`}>
                            <Button
                                loading={isSubmitting}
                                type="submit"
                                className={`mr-3`}
                            >
                                {"Connect"}
                            </Button>
                            <ButtonLink
                                type="button"
                                onClick={() => {
                                    set_integration_add(false);
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
