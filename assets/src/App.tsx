import * as React from "react";
import OperationalUI, {
  Sidenav,
  Layout,
  HeaderBar,
  Logo,
  Page,
  Card,
  SidenavHeader,
  SidenavItem,
} from "@operational/components";

const App: React.SFC = () => (
  <OperationalUI>
    <Layout
      header={<HeaderBar logo={<Logo to="/" name="OperationalUI" />} />}
      main={
        <Page title="My Operational App">
          <Card title="Welcome to your App">Edit src/App.tsx to get started.</Card>
        </Page>
      }
      sidenav={
        <Sidenav>
          <SidenavHeader label="Menu" active>
            <SidenavItem label="Home" icon="Home" to="/" active />
          </SidenavHeader>
        </Sidenav>
      }
    />
  </OperationalUI>
);

export default App;
