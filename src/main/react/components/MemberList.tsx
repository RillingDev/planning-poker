import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FC } from "react";
import { ButtonGroup, Dropdown } from "react-bootstrap";
import { EditAction, RoomMember } from "../api";
import "./MemberList.css";
import { PokerCard } from "./PokerCard";

export const MemberList: FC<{
	members: ReadonlyArray<RoomMember>, onAction: (member: RoomMember, action: EditAction) => void
}> = ({members, onAction}) => {
	return (
		<ul className="member-list">
			{members.map((member, i) => <li key={member.username} className={`card member member--${member.role}`}>
				<span>{member.username} ({member.role})</span>
				<Dropdown size="sm" as={ButtonGroup}>
					<Dropdown.Toggle variant="secondary" id={`options-dropdown-${i}`}>
						<FontAwesomeIcon icon={faEdit} title="Edit Member"/>
					</Dropdown.Toggle>

					<Dropdown.Menu>
						<Dropdown.Item onClick={() => onAction(member, EditAction.SET_OBSERVER)}>Set To Observer</Dropdown.Item>
						<Dropdown.Item onClick={() => onAction(member, EditAction.SET_VOTER)}>Set To Voter</Dropdown.Item>
						<Dropdown.Divider/>
						<Dropdown.Item onClick={() => onAction(member, EditAction.KICK)}>Kick</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
				{member.vote != null ? <PokerCard card={member.vote} disabled={true} size="sm"/> : <></>}
			</li>)}
		</ul>
	);
};
