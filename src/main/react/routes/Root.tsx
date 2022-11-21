import { Link } from "react-router-dom";
import type { FC } from "react";

export const Root: FC = () => {
	return (
		<Link to={"rooms/some-room"}>Some Room</Link>
	);
};