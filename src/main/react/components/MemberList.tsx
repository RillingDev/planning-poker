import { FC } from "react";
import { RoomMember } from "../api";
import "./MemberList.css";

export const MemberList: FC<{ members: ReadonlyArray<RoomMember> }> = ({members}) => {
	return (
		<ul className="member-list">
			{members.map(member => <li key={member.user.username} className={`member member--${member.role}`}>
				<span>{member.user.username}</span>
				<span hidden={member.vote == null}>{member.vote?.name}</span>
			</li>)}
		</ul>
	);
};
