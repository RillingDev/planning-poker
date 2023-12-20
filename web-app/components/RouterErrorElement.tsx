import { FC } from "react";
import { Link, useRouteError } from "react-router-dom";
import { Alert } from "react-bootstrap";

export const RouterErrorElement: FC = () => {
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
