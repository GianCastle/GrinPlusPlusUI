import { SettingsContainer } from "./Settings";
import { Drawer } from "@blueprintjs/core";
import { useStoreState, useStoreActions } from "../../hooks";
import React from "react";
import { useTranslation } from "react-i18next";

export const WalletDrawer = () => {
  const { t } = useTranslation();

  const { isLoggedIn } = useStoreState((state) => state.session);
  const { showSettings } = useStoreState((state) => state.ui);
  const { toggleSettings } = useStoreActions((actions) => actions.ui);

  return (
    <Drawer
      className="bp3-dark"
      transitionDuration={0}
      position={isLoggedIn ? "right" : "left"}
      icon="cog"
      onClose={() => {
        toggleSettings();
      }}
      title={t("settings")}
      isOpen={showSettings}
      size={Drawer.SIZE_SMALL}
      style={{ paddingTop: "32px" }}
    >
      <SettingsContainer />
    </Drawer>
  );
};
