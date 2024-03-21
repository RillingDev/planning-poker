import { FC, useContext } from "react";
import { ButtonGroup, Dropdown } from "react-bootstrap";
import { Color } from "react-bootstrap/types";
import { AppContext } from "../AppContext.ts";
import { EditAction, Role, RoomMember } from "../model.ts";
import { PokerCard } from "./PokerCard.tsx";

function mapRoleToColor(role: Role): Color {
  if (role === Role.VOTER) {
    return "info";
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

  const currentUser = member.username == user.username;

  return (
    <li className="card p-2 d-flex flex-row align-items-center gap-2">
      <span className="flex-grow-1">
        <span className={currentUser ? "fw-bolder" : ""}>
          {member.username}
        </span>
        <span
          className={`badge rounded-pill text-bg-${mapRoleToColor(
            member.role,
          )} ms-1`}
        >
          {mapRoleToName(member.role)}
        </span>
      </span>
      {member.vote != null && (
        <PokerCard card={member.vote} disabled={true} size="sm" />
      )}
      <Dropdown size="sm" as={ButtonGroup}>
        <Dropdown.Toggle variant="secondary" aria-label="Edit Member" />

        <Dropdown.Menu role="menu">
          <Dropdown.Item
            role="menuitem"
            as="button"
            onClick={() => onAction(EditAction.SET_OBSERVER)}
            disabled={member.role == Role.OBSERVER}
          >
            Set to Observer
          </Dropdown.Item>
          <Dropdown.Item
            as="button"
            role="menuitem"
            onClick={() => onAction(EditAction.SET_VOTER)}
            disabled={member.role == Role.VOTER}
          >
            Set to Voter
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item
            as="button"
            role="menuitem"
            onClick={() => onAction(EditAction.KICK)}
            disabled={currentUser}
          >
            Kick
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </li>
  );
};

export const MemberList: FC<{
  members: readonly RoomMember[];
  onAction: (member: RoomMember, action: EditAction) => void;
}> = ({ members, onAction }) => {
  return (
    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
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
