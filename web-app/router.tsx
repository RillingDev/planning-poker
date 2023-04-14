import { ErrorResponse } from "@remix-run/router/utils";
import { FC } from "react";
import { Alert } from "react-bootstrap";
import {
  createBrowserRouter,
  isRouteErrorResponse,
  Link,
  useRouteError,
} from "react-router-dom";
import { loader as roomListLoader, RoomListView } from "./routes/RoomListView";
import { loader as roomLoader, RoomView } from "./routes/RoomView";

const ErrorPage: FC = () => {
  const routeError = useRouteError() as Error | ErrorResponse;
  console.error(routeError);
  const message = isRouteErrorResponse(routeError)
    ? routeError.error?.message
    : routeError.message;
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
    errorElement: <ErrorPage />,
  },
  {
    path: "/rooms/:roomName",
    element: <RoomView />,
    loader: roomLoader,
    errorElement: <ErrorPage />,
  },
]);
