import React, { Suspense } from "react";
import { Form, HorizontallyCenter } from "../components/styled";
import { LoadingComponent } from "../components/extras/Loading";
import { Button } from "@blueprintjs/core";
import { useHistory } from "react-router-dom";
import { useStoreActions } from "../hooks";

const LogoComponent = React.lazy(() =>
  import("../components/shared/Logo").then((module) => ({
    default: module.LogoComponent,
  }))
);

const NavigationBarContainer = React.lazy(() =>
  import("./common/NavigationBar").then((module) => ({
    default: module.NavigationBarContainer,
  }))
);

const CreateWalletContainer = React.lazy(() =>
  import("./wallet/Create").then((module) => ({
    default: module.CreateWalletContainer,
  }))
);

const StatusBarContainer = React.lazy(() =>
  import("./common/StatusBar").then((module) => ({
    default: module.StatusBarContainer,
  }))
);

const renderLoader = () => <LoadingComponent />;

export const SignUpContainer = () => {
  const { setInitialValues } = useStoreActions(
    (actions) => actions.createWallet
  );

  let history = useHistory();

  return (
    <Suspense fallback={renderLoader()}>
      <NavigationBarContainer
        title="Create Wallet"
        onExit={() => setInitialValues()}
      />
      <div className="content">
        <HorizontallyCenter>
          <LogoComponent />
        </HorizontallyCenter>
        <Form>
          <CreateWalletContainer />
        </Form>
        <HorizontallyCenter>
          <Button
            minimal={true}
            style={{ width: "200px" }}
            text="Cancel"
            onClick={() => {
              setInitialValues();
              history.push("/login");
            }}
          />
        </HorizontallyCenter>
      </div>
      <div className="footer">
        <StatusBarContainer />
      </div>
    </Suspense>
  );
};
