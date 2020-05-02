import React, { Suspense, useEffect } from "react";
import { LoadingComponent } from "../components/extras/Loading";
import { Redirect } from "react-router-dom";
import { useStoreActions, useStoreState } from "../hooks";

const NavBarContainer = React.lazy(() =>
  import("./common/NavigationBar").then((module) => ({
    default: module.NavigationBarContainer,
  }))
);

const SendContainer = React.lazy(() =>
  import("./transaction/Send").then((module) => ({
    default: module.SendContainer,
  }))
);

const StatusBarContainer = React.lazy(() =>
  import("./common/StatusBar").then((module) => ({
    default: module.StatusBarContainer,
  }))
);

const renderLoader = () => <LoadingComponent />;

export const SendGrinContainer = () => {
  const { token, isLoggedIn } = useStoreState((state) => state.session);
  const { updateSummaryInterval } = useStoreState(
    (state) => state.walletSummary
  );

  const { updateWalletSummary } = useStoreActions(
    (actions) => actions.walletSummary
  );
  const { setInitialValues } = useStoreActions(
    (actions) => actions.sendCoinsModel
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await updateWalletSummary(token);
      } catch (error) {
        require("electron-log").info(
          `Error trying to get Wallet Summary: ${error.message}`
        );
      }
    }, updateSummaryInterval);
    return () => clearInterval(interval);
  });

  return (
    <Suspense fallback={renderLoader()}>
      {!isLoggedIn ? <Redirect to="/login" /> : null}
      <NavBarContainer
        title={"Send Grins ツ"}
        onExit={() => setInitialValues()}
      />
      <div className="content">
        <SendContainer />
      </div>
      <div className="footer">
        <StatusBarContainer />
      </div>
    </Suspense>
  );
};
