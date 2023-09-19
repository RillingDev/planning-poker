import { FC } from "react";
import { Alert } from "react-bootstrap";
import { createBrowserRouter, Link, useRouteError } from "react-router-dom";
import { loader as roomListLoader, RoomListView } from "./routes/RoomListView";
import { loader as roomLoader, RoomView } from "./routes/RoomView";

export const ErrorElement: FC = () => {
  const error = useRouteError();
  console.error(error);
  const message =
    error instanceof Error
      ? error.message
      : "Something went wrong. Please check the browser console for errors.";
  return (
    <>
      <Alert variant="danger">{message}</Alert>
      <div className="text-center">
        <Link to={"/"}>Back to Room List</Link>
      </div>
    </>
  );
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RoomListView />,
    loader: roomListLoader,
    errorElement: <ErrorElement />,
  },
  {
    path: "/rooms/:roomName",
    element: <RoomView />,
    loader: roomLoader,
    errorElement: <ErrorElement />,
  },
]);
