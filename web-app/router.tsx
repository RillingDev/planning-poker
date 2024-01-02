import { createBrowserRouter } from "react-router-dom";
import { RoomListView } from "./routes/RoomListView.tsx";
import { RoomView } from "./routes/RoomView.tsx";
import { roomLoader } from "./routes/RoomView.loader.ts";
import { roomListLoader } from "./routes/RoomListView.loader.ts";
import { RouterErrorElement } from "./components/RouterErrorElement.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RoomListView />,
    loader: roomListLoader,
    errorElement: <RouterErrorElement />,
  },
  {
    path: "/rooms/:roomName",
    element: <RoomView />,
    loader: roomLoader,
    errorElement: <RouterErrorElement />,
  },
]);
