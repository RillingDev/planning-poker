import { FC, useContext } from "react";
import { AppContext } from "../AppContext";
import "./Header.css";

export const Header: FC = () => {
  const { user } = useContext(AppContext);

  return (
    <header className="header">
      <h1 className="mb-0">Planning Poker</h1>
      <span>
        Signed in as <strong>{user.username}</strong> (
        <a href="/logout">Log out</a>)
      </span>
    </header>
  );
};
