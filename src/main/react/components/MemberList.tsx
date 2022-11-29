import { FC } from "react";
import { RoomMember } from "../api";

export const MemberList: FC<{ members: ReadonlyArray<RoomMember> }> = ({members}) => {
	return (
		<>
			<h3>Members</h3>
			<ul>
				{members.map(member => <li key={member.username}>
					<span>{member.username}</span>
				</li>)}
			</ul>
		</>
	);
};
