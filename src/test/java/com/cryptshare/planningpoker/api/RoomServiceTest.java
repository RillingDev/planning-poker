package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.data.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

	@InjectMocks
	RoomService roomService;

	@Test
	@DisplayName("edits card set")
	void editCardSet() {
		final CardSet originalCardSet = new CardSet("My Set 1");
		final Room room = new Room("My Room", originalCardSet);

		final CardSet newCardSet = new CardSet("My Set 2");

		roomService.editCardSet(room, newCardSet);

		assertThat(room.getCardSet()).isEqualTo(newCardSet);
	}

	@Test
	@DisplayName("editing card set removes votes")
	void editCardSetRemovesVotes() {
		final CardSet originalCardSet = new CardSet("My Set");
		final Card card1 = new Card("1", 1.0);
		originalCardSet.getCards().add(card1);
		final Room room = new Room("My Room", originalCardSet);
		room.setVotingState(Room.VotingState.CLOSED);

		final RoomMember roomMember = new RoomMember("Bob");
		roomMember.setVote(card1);
		room.getMembers().add(roomMember);

		final CardSet newCardSet = new CardSet("My Set 2");

		roomService.editCardSet(room, newCardSet);

		assertThat(room.getVotingState()).isEqualTo(Room.VotingState.OPEN);
		assertThat(roomMember.getVote()).isNull();
	}

	@Test
	@DisplayName("edits topic")
	void editTopic() {
		final Room room = new Room("My Room", new CardSet("My Set"));

		roomService.editTopic(room, "Foo!");

		assertThat(room.getTopic()).isEqualTo("Foo!");
	}

	@Test
	@DisplayName("adds extension")
	void editExtensionsAddsExtension() {
		final Room room = new Room("My Room", new CardSet("My Set"));

		final Extension someExtension = new Extension("someExtension");

		roomService.editExtensions(room, Set.of(someExtension));

		assertThat(room.getExtensionConfigs()).extracting(RoomExtensionConfig::getExtension).containsExactly(someExtension);
	}

	@Test
	@DisplayName("removes extension")
	void editExtensionsRemovesExtension() {
		final Room room = new Room("My Room", new CardSet("My Set"));

		final Extension someExtension = new Extension("someExtension");
		room.getExtensionConfigs().add(new RoomExtensionConfig(someExtension));

		roomService.editExtensions(room, Set.of());

		assertThat(room.getExtensionConfigs()).isEmpty();
	}

	@Test
	@DisplayName("handles mixed extension changes")
	void editExtensionsMixedExtensionChanges() {
		final Room room = new Room("My Room", new CardSet("My Set"));

		final Extension someExtension = new Extension("someExtension");
		final Extension otherExtension = new Extension("otherExtension");

		room.getExtensionConfigs().add(new RoomExtensionConfig(someExtension));

		roomService.editExtensions(room, Set.of(otherExtension));

		assertThat(room.getExtensionConfigs()).extracting(RoomExtensionConfig::getExtension).containsExactly(otherExtension);
	}

	@Test
	@DisplayName("adds member to room")
	void addMemberAdds() {
		final Room room = new Room("My Room", new CardSet("My Set"));

		roomService.addMember(room, new RoomMember("Bob"));

		assertThat(room.getMembers()).extracting(RoomMember::getUsername).containsExactly("Bob");
	}

	@Test
	@DisplayName("adding member to room keeps voting closed")
	void addMemberKeepsVotingClosed() {
		final Room room = new Room("My Room", new CardSet("My Set"));
		room.setVotingState(Room.VotingState.CLOSED);

		roomService.addMember(room, new RoomMember("Bob"));

		assertThat(room.getMembers()).extracting(RoomMember::getUsername).containsExactly("Bob");
		assertThat(room.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}

	@Test
	@DisplayName("removes member from room")
	void removeMemberRemoves() {
		final Room room = new Room("My Room", new CardSet("My Set"));
		final RoomMember roomMember = new RoomMember("Bob");
		room.getMembers().add(roomMember);

		roomService.removeMember(room, roomMember);

		assertThat(room.getMembers()).isEmpty();
	}

	@Test
	@DisplayName("removing member from room closes voting")
	void removeMemberClosesVoting() {
		final CardSet cardSet = new CardSet("My Set");
		final Card card1 = new Card("1", 1.0);
		cardSet.getCards().add(card1);
		final Room room = new Room("My Room", cardSet);
		room.setVotingState(Room.VotingState.OPEN);

		final RoomMember roomMember1 = new RoomMember("Bob");
		room.getMembers().add(roomMember1);

		final RoomMember roomMember2 = new RoomMember("Alice");
		roomMember2.setVote(card1);
		room.getMembers().add(roomMember2);

		roomService.removeMember(room, roomMember1);

		assertThat(room.getMembers()).containsExactly(roomMember2);
		assertThat(room.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}

	@Test
	@DisplayName("removing member from room keeps voting open if no voters remain")
	void removeMemberKeepsVotingOpenIfNoVotersRemain() {
		final Room room = new Room("My Room", new CardSet("My Set"));
		room.setVotingState(Room.VotingState.OPEN);

		final RoomMember roomMember1 = new RoomMember("Bob");
		room.getMembers().add(roomMember1);

		final RoomMember roomMember2 = new RoomMember("Alice");
		roomMember2.setRole(RoomMember.Role.OBSERVER);
		room.getMembers().add(roomMember2);

		roomService.removeMember(room, roomMember1);

		assertThat(room.getMembers()).containsExactly(roomMember2);
		assertThat(room.getVotingState()).isEqualTo(Room.VotingState.OPEN);
	}

	@Test
	@DisplayName("sets role to observer")
	void setRoleSetsObserver() {
		final Room room = new Room("My Room", new CardSet("My Set"));

		final RoomMember roomMember = new RoomMember("Bob");
		roomMember.setRole(RoomMember.Role.VOTER);
		room.getMembers().add(roomMember);

		roomService.setRole(room, roomMember, RoomMember.Role.OBSERVER);

		assertThat(roomMember.getRole()).isEqualTo(RoomMember.Role.OBSERVER);
	}

	@Test
	@DisplayName("setting role to observer closes voting")
	void setRoleSetsObserverClosesVoting() {
		final CardSet cardSet = new CardSet("My Set");
		final Card card1 = new Card("1", 1.0);
		cardSet.getCards().add(card1);
		final Room room = new Room("My Room", cardSet);
		room.setVotingState(Room.VotingState.OPEN);

		final RoomMember roomMember1 = new RoomMember("Bob");
		roomMember1.setRole(RoomMember.Role.VOTER);
		room.getMembers().add(roomMember1);

		final RoomMember roomMember2 = new RoomMember("Alice");
		roomMember2.setRole(RoomMember.Role.VOTER);
		roomMember2.setVote(card1);
		room.getMembers().add(roomMember2);

		roomService.setRole(room, roomMember1, RoomMember.Role.OBSERVER);

		assertThat(roomMember1.getRole()).isEqualTo(RoomMember.Role.OBSERVER);
		assertThat(room.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}

	@Test
	@DisplayName("setting role to observer keeps voting open if no voters remain")
	void setRoleSetsObserverKeepsVotingOpenIfNoVotersRemain() {
		final Room room = new Room("My Room", new CardSet("My Set"));
		room.setVotingState(Room.VotingState.OPEN);

		final RoomMember roomMember1 = new RoomMember("Bob");
		roomMember1.setRole(RoomMember.Role.VOTER);
		room.getMembers().add(roomMember1);

		final RoomMember roomMember2 = new RoomMember("Alice");
		roomMember2.setRole(RoomMember.Role.OBSERVER);
		room.getMembers().add(roomMember2);

		roomService.setRole(room, roomMember1, RoomMember.Role.OBSERVER);

		assertThat(roomMember1.getRole()).isEqualTo(RoomMember.Role.OBSERVER);
		assertThat(room.getVotingState()).isEqualTo(Room.VotingState.OPEN);
	}

	@Test
	@DisplayName("sets role to voter")
	void setRoleSetsVoter() {
		final Room room = new Room("My Room", new CardSet("My Set"));

		final RoomMember roomMember = new RoomMember("Bob");
		roomMember.setRole(RoomMember.Role.OBSERVER);
		room.getMembers().add(roomMember);

		roomService.setRole(room, roomMember, RoomMember.Role.VOTER);

		assertThat(roomMember.getRole()).isEqualTo(RoomMember.Role.VOTER);
	}

	@Test
	@DisplayName("setting to voter keeps voting closed")
	void setRoleSetsVoterVotingClosed() {
		final Room room = new Room("My Room", new CardSet("My Set"));
		room.setVotingState(Room.VotingState.CLOSED);

		final RoomMember roomMember = new RoomMember("Bob");
		roomMember.setRole(RoomMember.Role.OBSERVER);
		room.getMembers().add(roomMember);

		roomService.setRole(room, roomMember, RoomMember.Role.OBSERVER);

		assertThat(roomMember.getRole()).isEqualTo(RoomMember.Role.OBSERVER);
		assertThat(room.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}

	@Test
	@DisplayName("sets vote")
	void setVotePutsVote() {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("My Room", cardSet);

		final RoomMember roomMember = new RoomMember("Bob");
		room.getMembers().add(roomMember);

		roomService.setVote(room, roomMember, card);

		assertThat(room.findMemberByUser("Bob").orElseThrow().getVote()).isNotNull().isEqualTo(card);
		assertThat(room.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}

	@Test
	@DisplayName("setting vote keeps room open if others still have to vote")
	void setVoteKeepsVotingOpenIfNotAllVoted() {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("My Room", cardSet);

		final RoomMember roomMember1 = new RoomMember("Bob");
		room.getMembers().add(roomMember1);

		final RoomMember roomMember2 = new RoomMember("Alice");
		room.getMembers().add(roomMember2);

		roomService.setVote(room, roomMember1, card);

		assertThat(room.getVotingState()).isEqualTo(Room.VotingState.OPEN);
	}

	@Test
	@DisplayName("updates vote")
	void setVoteUpdateVote() {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		cardSet.getCards().add(card1);
		cardSet.getCards().add(card2);
		final Room room = new Room("My Room", cardSet);

		final RoomMember roomMember1 = new RoomMember("Bob");
		roomMember1.setVote(card1);
		room.getMembers().add(roomMember1);

		final RoomMember roomMember2 = new RoomMember("Alice");
		room.getMembers().add(roomMember2);

		roomService.setVote(room, roomMember1, card2);

		assertThat(room.findMemberByUser("Bob").orElseThrow().getVote()).isNotNull().isEqualTo(card2);
	}

	@Test
	@DisplayName("clears votes")
	void clearVotesUpdateVote() {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		cardSet.getCards().add(card1);
		cardSet.getCards().add(card2);
		final Room room = new Room("My Room", cardSet);

		final RoomMember roomMember1 = new RoomMember("Bob");
		roomMember1.setVote(card1);
		room.getMembers().add(roomMember1);

		final RoomMember roomMember2 = new RoomMember("Alice");
		roomMember2.setVote(card2);
		room.getMembers().add(roomMember2);
		room.setVotingState(Room.VotingState.CLOSED);

		roomService.clearVotes(room);

		assertThat(room.getMembers()).hasSize(2).allMatch(rm -> rm.getVote() == null);
		assertThat(room.getVotingState()).isEqualTo(Room.VotingState.OPEN);
	}
}