package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.data.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static com.cryptshare.planningpoker.api.MockOidcLogins.bobOidcLogin;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = RoomMemberController.class)
class RoomMemberControllerIT {

	@MockBean
	RoomRepository roomRepository;

	@Autowired
	MockMvc mockMvc;

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/members` throws for unknown name")
	void joinRoomUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(post("/api/rooms/my-room/members").with(bobOidcLogin()).with(csrf())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/members` joins room")
	void joinRoomJoins() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/members").with(bobOidcLogin()).with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getMembers()).extracting(RoomMember::getUsername).containsExactly("Bob");
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/members` keeps voting closed")
	void joinRoomKeepsVotingClosed() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		room.setVotingState(Room.VotingState.CLOSED);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/members").with(bobOidcLogin()).with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Room actual = captor.getValue();
		assertThat(actual.getMembers()).extracting(RoomMember::getUsername).containsExactly("Bob");
		assertThat(actual.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/members` does not throw when already in room")
	void joinRoomAlreadyJoined() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		room.getMembers().add(new RoomMember("Bob"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/members").with(bobOidcLogin()).with(csrf())).andExpect(status().isOk());

		verify(roomRepository, never()).save(any());
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/members` throws for unknown name")
	void leaveRoomUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(delete("/api/rooms/my-room/members").with(bobOidcLogin()).with(csrf())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/members` leaves room")
	void leaveRoomLeaves() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		room.getMembers().add(new RoomMember("Bob"));

		mockMvc.perform(delete("/api/rooms/my-room/members").with(bobOidcLogin()).with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getMembers()).isEmpty();
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/members` closes voting")
	void leaveRoomClosesVoting() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		room.setVotingState(Room.VotingState.OPEN);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		room.getMembers().add(new RoomMember("Bob"));

		mockMvc.perform(delete("/api/rooms/my-room/members").with(bobOidcLogin()).with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Room actual = captor.getValue();
		assertThat(actual.getMembers()).isEmpty();
		assertThat(actual.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/members` does not throw when not joined")
	void leaveRoomNotJoined() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(delete("/api/rooms/my-room/members").with(bobOidcLogin()).with(csrf())).andExpect(status().isOk());

		verify(roomRepository, never()).save(any());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` throws for unknown room name")
	void editMemberUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(patch("/api/rooms/my-room/members/Bob").with(bobOidcLogin()).queryParam("action", "SET_OBSERVER").with(csrf()))
				.andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` throws when not a member")
	void editMemberNotMember() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 1"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		room.getMembers().add(new RoomMember("Alice"));

		mockMvc.perform(patch("/api/rooms/my-room/members/Bob").with(bobOidcLogin()).queryParam("action", "SET_OBSERVER").with(csrf()))
				.andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` throws for unknown username")
	void editMemberUnknownUsername() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		room.getMembers().add(new RoomMember("Bob"));

		mockMvc.perform(patch("/api/rooms/my-room/members/Alice").with(bobOidcLogin()).queryParam("action", "SET_OBSERVER").with(csrf()))
				.andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` sets to observer")
	void editMemberSetsObserver() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember = new RoomMember("Bob");
		roomMember.setRole(RoomMember.Role.VOTER);
		room.getMembers().add(roomMember);

		mockMvc.perform(patch("/api/rooms/my-room/members/Bob").with(bobOidcLogin()).with(bobOidcLogin()).queryParam("action", "SET_OBSERVER").with(csrf()))
				.andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().findMemberByUser("Bob")).isPresent()
				.get()
				.extracting(RoomMember::getRole)
				.isEqualTo(RoomMember.Role.OBSERVER);
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` sets to observer closes voting")
	void editMemberSetsObserverClosesVoting() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));
		room.setVotingState(Room.VotingState.OPEN);

		final RoomMember roomMember = new RoomMember("Bob");
		roomMember.setRole(RoomMember.Role.VOTER);
		room.getMembers().add(roomMember);

		mockMvc.perform(patch("/api/rooms/my-room/members/Bob").with(bobOidcLogin()).queryParam("action", "SET_OBSERVER").with(csrf()))
				.andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Room actual = captor.getValue();
		assertThat(actual.findMemberByUser("Bob")).isPresent().get().extracting(RoomMember::getRole).isEqualTo(RoomMember.Role.OBSERVER);
		assertThat(actual.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` sets to voter")
	void editMemberSetsVoter() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember = new RoomMember("Bob");
		roomMember.setRole(RoomMember.Role.OBSERVER);
		room.getMembers().add(roomMember);

		mockMvc.perform(patch("/api/rooms/my-room/members/Bob").with(bobOidcLogin()).queryParam("action", "SET_VOTER").with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().findMemberByUser("Bob")).isPresent()
				.get()
				.extracting(RoomMember::getRole)
				.isEqualTo(RoomMember.Role.VOTER);
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` sets to voter keeps voting closed")
	void editMemberSetsVoterVotingClosed() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));
		room.setVotingState(Room.VotingState.CLOSED);

		final RoomMember roomMember = new RoomMember("Bob");
		roomMember.setRole(RoomMember.Role.OBSERVER);
		room.getMembers().add(roomMember);

		mockMvc.perform(patch("/api/rooms/my-room/members/Bob").with(bobOidcLogin()).queryParam("action", "SET_VOTER").with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Room actual = captor.getValue();
		assertThat(actual.findMemberByUser("Bob")).isPresent().get().extracting(RoomMember::getRole).isEqualTo(RoomMember.Role.VOTER);
		assertThat(actual.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` kicks")
	void editMemberKicks() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember alice = new RoomMember("Alice");
		room.getMembers().add(alice);
		final RoomMember bob = new RoomMember("Bob");
		room.getMembers().add(bob);

		mockMvc.perform(patch("/api/rooms/my-room/members/Alice").with(bobOidcLogin()).queryParam("action", "KICK").with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().findMemberByUser("Alice")).isNotPresent();
		assertThat(captor.getValue().findMemberByUser("Bob")).isPresent();
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` kicks voting closed")
	void editMemberKicksVotingClosed() throws Exception {
		final CardSet cardSet = new CardSet("My Set 2");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("my-room", cardSet);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));
		room.setVotingState(Room.VotingState.OPEN);

		final RoomMember alice = new RoomMember("Alice");
		room.getMembers().add(alice);
		final RoomMember bob = new RoomMember("Bob");
		bob.setVote(card);
		room.getMembers().add(bob);

		mockMvc.perform(patch("/api/rooms/my-room/members/Alice").with(bobOidcLogin()).queryParam("action", "KICK").with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Room actual = captor.getValue();
		assertThat(actual.findMemberByUser("Alice")).isNotPresent();
		assertThat(actual.findMemberByUser("Bob")).isPresent();
		assertThat(actual.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}
}
