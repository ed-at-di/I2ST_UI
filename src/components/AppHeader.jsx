import { LogOut } from "lucide-react";
import logo from "../images/IIST-logo.png";
import { DUMMY_USER } from "../data/dummyHomeData.js";

export function AppHeader() {
  const initial = DUMMY_USER.name.trim().slice(0, 1).toUpperCase();

  return (
    <header className="appHeader">
      <div className="appHeaderLogo">
        <span className="appHeaderMark">
          <img src={logo} alt="I2ST" />
        </span>
      </div>

      <div className="appHeaderUser">
        <span className="appHeaderAvatar">{initial}</span>
        <span className="appHeaderUserName">{DUMMY_USER.name}</span>
        <button className="appHeaderLogout" type="button">
          <LogOut size={15} />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
}
