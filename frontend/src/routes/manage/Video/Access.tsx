import { useTranslation } from "react-i18next";
import { Breadcrumbs } from "../../../ui/Breadcrumbs";
import { AuthorizedEvent, makeManageVideoRoute } from "./Shared";
import { PageTitle } from "../../../layout/header/ui";
import { RefObject, useContext, useRef } from "react";
import { COLORS } from "../../../color";
import { FiInfo } from "react-icons/fi";
import { Button, Kind as ButtonKind } from "../../../ui/Button";
import { isRealUser, useUser } from "../../../User";
import { NotAuthorized } from "../../../ui/error";
import { WithTooltip } from "@opencast/appkit";
import { Modal, ModalHandle } from "../../../ui/Modal";
import { currentRef } from "../../../util";
import { COMMON_ROLES } from "../../../util/roles";
import { AclSelectorHandle, Acl, AclSelector, AclContext } from "../../../ui/Access";


export const ManageVideoAccessRoute = makeManageVideoRoute(
    "acl",
    "/access",
    event => <AclPage event={event} />,
);

type AclPageProps = {
    event: AuthorizedEvent;
};

const AclPage: React.FC<AclPageProps> = ({ event }) => {
    const { t } = useTranslation();
    const user = useUser();

    if (!isRealUser(user)) {
        return <NotAuthorized />;
    }

    const breadcrumbs = [
        { label: t("user.manage-content"), link: "/~manage" },
        { label: t("manage.my-videos.title"), link: "/~manage/videos" },
        { label: event.title, link: `/~manage/videos/${event.id.substring(2)}` },
    ];

    return <>
        <Breadcrumbs path={breadcrumbs} tail={t("manage.my-videos.acl.title")} />
        <PageTitle title={t("manage.my-videos.acl.title")} />
        {event.hostRealms.length < 1 && <UnlistedNote />}
        <AccessUI {...{ event }} />
    </>;
};


const UnlistedNote: React.FC = () => {
    const { t } = useTranslation();

    return (
        <WithTooltip
            tooltip={t("manage.access.unlisted.explanation")}
            placement="bottom"
            tooltipCss={{ width: 400 }}
            css={{ display: "inline-block" }}
        >
            <div css={{
                fontSize: 14,
                lineHeight: 1,
                color: COLORS.neutral60,
                display: "flex",
                gap: 4,
                marginBottom: 16,
            }}>
                <FiInfo />
                {t("manage.access.unlisted.note")}
            </div>
        </WithTooltip>
    );
};

type AccessUIProps = {
    event: AuthorizedEvent;
}

const AccessUI: React.FC<AccessUIProps> = ({ event }) => {
    const aclSelectRef = useRef<AclSelectorHandle>(null);

    const initialAcl: Acl = {
        readRoles: event.readRoles as string[],
        writeRoles: event.writeRoles as string[],
    };

    return (
        <div css={{ maxWidth: 1040 }}>
            <div css={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
            }}>
                <AclSelector ref={aclSelectRef} {...{ initialAcl }}>
                    <ButtonWrapper {...{ aclSelectRef, initialAcl }} />
                </AclSelector>
            </div>
        </div>
    );
};

type ButtonWrapperProps = {
    aclSelectRef: RefObject<AclSelectorHandle>;
    initialAcl: Acl;
}

const ButtonWrapper: React.FC<ButtonWrapperProps> = ({ aclSelectRef, initialAcl }) => {
    const { t } = useTranslation();
    const { roleSelections } = useContext(AclContext);
    const user = useUser();
    const saveModalRef = useRef<ModalHandle>(null);
    const resetModalRef = useRef<ModalHandle>(null);

    const containsUser = (acl: Acl) => {
        if (!isRealUser(user)) {
            return false;
        }

        return user.roles.includes(COMMON_ROLES.ROLE_ADMIN)
            || acl.writeRoles.some(role => user.roles.includes(role));
    };

    const submit = async (acl: Acl) => {
        // TODO: Actually save new ACL.
        // eslint-disable-next-line no-console
        console.log(acl);
    };

    return <div css={{ display: "flex", gap: 8, alignSelf: "flex-start", marginTop: 40 }}>
        {/* Reset button */}
        <ButtonWithModal
            buttonKind="danger"
            modalRef={resetModalRef}
            label={t("manage.access.reset-modal.label")}
            title={t("manage.access.reset-modal.title")}
            body={t("manage.access.reset-modal.body")}
            confirmationLabel={t("manage.access.reset-modal.label")}
            handleClick={() => currentRef(resetModalRef).open()}
            onConfirm={() => aclSelectRef.current?.reset?.()}
        />
        {/* Save button */}
        <ButtonWithModal
            buttonKind="happy"
            modalRef={saveModalRef}
            label={t("general.action.save")}
            title={t("manage.access.save-modal.title")}
            body={t("manage.access.save-modal.body")}
            confirmationLabel={t("manage.access.save-modal.confirm")}
            handleClick={() => {
                const newAcl = currentRef(aclSelectRef).selections;
                return !containsUser(newAcl) ? currentRef(saveModalRef).open() : submit(newAcl);
            }}
            onConfirm={() => submit(currentRef(aclSelectRef).selections)}
            disabled={JSON.stringify(initialAcl) === JSON.stringify(roleSelections)}
        />
    </div>;
};

type ButtonWithModalProps = {
    buttonKind: ButtonKind;
    modalRef: RefObject<ModalHandle>;
    label: string;
    title: string;
    body: string;
    confirmationLabel: string;
    handleClick: () => void;
    onConfirm: () => void;
    disabled?: boolean;
}

const ButtonWithModal: React.FC<ButtonWithModalProps> = ({ ...props }) => {
    const { t } = useTranslation();
    return <>
        <Button
            kind={props.buttonKind}
            onClick={props.handleClick}
            disabled={props.disabled}
        >{props.label}</Button>
        <Modal ref={props.modalRef} title={props.title}>
            <p>{props.body}</p>
            <div css={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
                marginTop: 32,
            }}>
                <Button onClick={() => currentRef(props.modalRef).close?.()}>
                    {t("general.action.cancel")}
                </Button>
                <Button kind="danger" onClick={() => {
                    props.onConfirm();
                    currentRef(props.modalRef).close?.();
                }}>{props.confirmationLabel}</Button>
            </div>
        </Modal>
    </>;
};

