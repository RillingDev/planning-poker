import { FC } from "react";
import { EditAction, RoomMember } from "../api";
import "./MemberList.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { ButtonGroup, Dropdown } from "react-bootstrap";

export const MemberList: FC<{
	members: ReadonlyArray<RoomMember>, onAction: (member: RoomMember, action: EditAction) => void
}> = ({members, onAction}) => {
	return (
		<ul className="member-list">
			{members.map((member, i) => <li key={member.username} className={`member member--${member.role}`}>
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
				<span hidden={member.vote == null}>{member.vote?.name}</span>
			</li>)}
		</ul>
	);
};
