import { FC, useContext } from "react";
import { Badge, ButtonGroup, Dropdown } from "react-bootstrap";
import { Color } from "react-bootstrap/types";
import { EditAction, Role, RoomMember } from "../api";
import { AppContext } from "../AppContext";
import "./MemberList.css";
import { PokerCard } from "./PokerCard";


const mapRoleToColor = (role: Role): Color => {
	switch (role) {
		case Role.VOTER:
			return "dark";
		default:
			return "secondary";
	}
};

export const MemberList: FC<{
	members: ReadonlyArray<RoomMember>, onAction: (member: RoomMember, action: EditAction) => void
}> = ({members, onAction}) => {
	const {user} = useContext(AppContext);

	return (
		<ul className="member-list">
			{members.map((member, i) => <li key={member.username} className={`card member member--${member.role}`}>
				<span>{member.username} <Badge bg="light" text={mapRoleToColor(member.role)}>{member.role}</Badge></span>
				<Dropdown size="sm" as={ButtonGroup}>
					<Dropdown.Toggle variant="secondary" id={`options-dropdown-${i}`} aria-label="Edit member"/>

					<Dropdown.Menu>
						<Dropdown.Item onClick={() => onAction(member, EditAction.SET_OBSERVER)} disabled={member.role == Role.OBSERVER}>
							Set To Observer
						</Dropdown.Item>
						<Dropdown.Item onClick={() => onAction(member, EditAction.SET_VOTER)} disabled={member.role == Role.VOTER}>
							Set To Voter
						</Dropdown.Item>
						<Dropdown.Divider/>
						<Dropdown.Item onClick={() => onAction(member, EditAction.KICK)} disabled={member.username == user.username}>
							Kick
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
				{member.vote != null && <PokerCard card={member.vote} disabled={true} size="sm"/>}
			</li>)}
		</ul>
	);
};
