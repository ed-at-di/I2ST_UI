import { LogOut } from "lucide-react";
import logo from "../images/EOCo-logo-black.png";
import { DUMMY_USER } from "../data/dummyHomeData.js";

export function AppHeader() {
  return (
    <header className="appHeader">
      <div className="appHeaderLogo">
        <span className="appHeaderMark">
          <img src={logo} alt="EOCo" />
        </span>
      </div>

      <div className="appHeaderUser">
        <span className="appHeaderUserName">{DUMMY_USER.name}</span>
        <button className="appHeaderLogout" type="button">
          <LogOut size={15} />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
}
