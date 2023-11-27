import { FC, useContext } from "react";
import { AppContext } from "../AppContext";

export const Header: FC = () => {
  const { user } = useContext(AppContext);

  return (
    <header className="mb-5 d-flex justify-content-between align-items-center">
      <h1 className="mb-0">Planning Poker</h1>
      <span>
        Signed in as <strong>{user.username}</strong> (
        <a href="/logout">Log out</a>)
      </span>
    </header>
  );
};
