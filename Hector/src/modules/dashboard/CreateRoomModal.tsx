import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { MainContext } from "../../api_context/api_based";
import { InputField } from "../../form-fields/InputField";
import { useCurrentRoomIdStore } from "../../global-stores/useCurrentRoomIdStore";
import { showErrorToast } from "../../lib/showErrorToast";
import { useWrappedConn } from "../../shared-hooks/useConn";
import { useTypeSafeTranslation } from "../../shared-hooks/useTypeSafeTranslation";
import { Button } from "../../ui/Button";
import { ButtonLink } from "../../ui/ButtonLink";
import { Modal } from "../../ui/Modal";
import { NativeSelect } from "../../ui/NativeSelect";
import { useRoomChatStore } from "../room/chat/useRoomChatStore";

interface CreateRoomModalProps {
    onRequestClose: () => void;
    data?: {
        name: string;
        description: string;
        privacy: string;
    };
    edit?: boolean;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
    onRequestClose,
    data,
    edit,
}) => {
    const conn = useWrappedConn();
    const { t } = useTypeSafeTranslation();
    const { push } = useRouter();
    const { client, current_room_base_data } = useContext(MainContext);

    return (
        <Modal isOpen onRequestClose={onRequestClose}>
            <Formik<{
                name: string;
                privacy: string;
                description: string;
            }>
                initialValues={
                    data
                        ? data
                        : {
                              name: "",
                              description: "",
                              privacy: "public",
                          }
                }
                validateOnChange={false}
                validateOnBlur={false}
                validate={({ name, description }) => {
                    const errors: Record<string, string> = {};

                    if (name.length < 2 || name.length > 60) {
                        return {
                            name: t(
                                "components.modals.createRoomModal.nameError"
                            ),
                        };
                    } else if (description.length > 500) {
                        return {
                            description: t(
                                "components.modals.createRoomModal.descriptionError"
                            ),
                        };
                    }
                    return errors;
                }}
                onSubmit={({ name, privacy, description }) => {
                    if (edit) {
                        if (current_room_base_data) {
                            console.log("updating room");
                            client?.send("update_room_meta", {
                                name: name,
                                public: !privacy,
                                description: description,
                                auto_speaker: false, //todo fix
                                chat_throttle:
                                    current_room_base_data!!.details
                                        .chat_throttle,
                            });
                        }
                    } else {
                        client?.send("create_room", {
                            name,
                            desc: description,
                            public: privacy == "public",
                        });
                    }
                    onRequestClose();
                }}
            >
                {({ setFieldValue, values }) => (
                    <Form
                        className={`grid grid-cols-3 gap-4 focus:outline-none w-full`}
                    >
                        <div className={`col-span-3 block`}>
                            <h4 className={`mb-2 text-primary-100`}>
                                {edit
                                    ? t("pages.home.editRoom")
                                    : t("pages.home.createRoom")}
                            </h4>
                            <div className={`text-primary-300`}>
                                {t(
                                    "components.modals.createRoomModal.subtitle"
                                )}
                            </div>
                        </div>
                        <div className={`flex h-full w-full col-span-2`}>
                            <InputField
                                className={`rounded-8 bg-primary-700 h-6`}
                                name="name"
                                maxLength={60}
                                placeholder={t(
                                    "components.modals.createRoomModal.roomName"
                                )}
                                autoFocus
                                autoComplete="off"
                            />
                        </div>
                        <div className={`grid items-start grid-cols-1 h-6`}>
                            <NativeSelect
                                value={values.privacy}
                                onChange={(e) => {
                                    setFieldValue("privacy", e.target.value);
                                }}
                            >
                                <option
                                    value="public"
                                    className={`hover:bg-primary-900`}
                                >
                                    {t(
                                        "components.modals.createRoomModal.public"
                                    )}
                                </option>
                                <option
                                    value="private"
                                    className={`hover:bg-primary-900`}
                                >
                                    {t(
                                        "components.modals.createRoomModal.private"
                                    )}
                                </option>
                            </NativeSelect>
                        </div>
                        <div
                            className={`flex col-span-3 bg-primary-700 rounded-8`}
                        >
                            <InputField
                                className={`h-11 col-span-3 w-full`}
                                name="description"
                                rows={3}
                                maxLength={500}
                                placeholder={t(
                                    "components.modals.createRoomModal.roomDescription"
                                )}
                                textarea
                            />
                        </div>

                        <div
                            className={`flex pt-2 space-x-3 col-span-full items-center`}
                        >
                            <Button
                                loading={false}
                                type="submit"
                                className={`mr-3`}
                            >
                                {edit
                                    ? t("common.save")
                                    : t("pages.home.createRoom")}
                            </Button>
                            <ButtonLink type="button" onClick={onRequestClose}>
                                {t("common.cancel")}
                            </ButtonLink>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};
