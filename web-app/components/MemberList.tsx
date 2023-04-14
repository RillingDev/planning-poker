import { FC, useContext, useId } from "react";
import { ButtonGroup, Dropdown } from "react-bootstrap";
import { Color } from "react-bootstrap/types";
import { AppContext } from "../AppContext";
import { EditAction, Role, RoomMember } from "../model";
import "./MemberList.css";
import { PokerCard } from "./PokerCard";

function mapRoleToColor(role: Role): Color {
  if (role === Role.VOTER) {
    return "dark";
  } else {
    return "secondary";
  }
}

function mapRoleToName(role: Role): string {
  if (role === Role.VOTER) {
    return "Voter";
  } else {
    return "Observer";
  }
}

const Member: FC<{
  member: RoomMember;
  onAction: (action: EditAction) => void;
}> = ({ member, onAction }) => {
  const { user } = useContext(AppContext);

  const dropdownId = useId();

  return (
    <li className="card member">
      <span className="member__name">
        {member.username}&nbsp;
        <span className={`badge bg-light text-${mapRoleToColor(member.role)}`}>
          {mapRoleToName(member.role)}
        </span>
      </span>
      <Dropdown size="sm" as={ButtonGroup}>
        <Dropdown.Toggle
          variant="secondary"
          id={dropdownId}
          aria-label="Edit Member"
        />

        <Dropdown.Menu>
          <Dropdown.Item
            as="button"
            onClick={() => onAction(EditAction.SET_OBSERVER)}
            disabled={member.role == Role.OBSERVER}
          >
            Set to Observer
          </Dropdown.Item>
          <Dropdown.Item
            as="button"
            onClick={() => onAction(EditAction.SET_VOTER)}
            disabled={member.role == Role.VOTER}
          >
            Set to Voter
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            as="button"
            onClick={() => onAction(EditAction.KICK)}
            disabled={member.username == user.username}
          >
            Kick
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      {member.vote != null && (
        <PokerCard card={member.vote} disabled={true} size="sm" />
      )}
    </li>
  );
};

export const MemberList: FC<{
  members: ReadonlyArray<RoomMember>;
  onAction: (member: RoomMember, action: EditAction) => void;
}> = ({ members, onAction }) => {
  return (
    <ul className="member-list">
      {members.map((member) => (
        <Member
          key={member.username}
          member={member}
          onAction={(action) => onAction(member, action)}
        />
      ))}
    </ul>
  );
};
