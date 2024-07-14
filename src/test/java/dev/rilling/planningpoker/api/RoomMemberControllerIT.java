package dev.rilling.planningpoker.api;

import dev.rilling.planningpoker.data.CardSet;
import dev.rilling.planningpoker.data.Room;
import dev.rilling.planningpoker.data.RoomMember;
import dev.rilling.planningpoker.data.RoomRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
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

	@MockBean
	RoomService roomService;

	@Autowired
	MockMvc mockMvc;

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/members` throws for unknown name")
	void joinRoomUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(post("/api/rooms/my-room/members").with(MockOidcLogins.bobOidcLogin()).with(csrf())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/members` joins room")
	void joinRoomJoins() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/members").with(MockOidcLogins.bobOidcLogin()).with(csrf())).andExpect(status().isOk());

		verify(roomService).addMember(eq(room), argThat(roomMember -> roomMember.getUsername().equals("Bob")));
		verify(roomRepository).save(room);
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/members` does not throw when already in room")
	void joinRoomAlreadyJoined() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		room.getMembers().add(new RoomMember("Bob"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/members").with(MockOidcLogins.bobOidcLogin()).with(csrf())).andExpect(status().isOk());

		verify(roomRepository, never()).save(any());
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/members` throws for unknown name")
	void leaveRoomUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(delete("/api/rooms/my-room/members").with(MockOidcLogins.bobOidcLogin()).with(csrf())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/members` leaves room")
	void leaveRoomLeaves() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember = new RoomMember("Bob");
		room.getMembers().add(roomMember);

		mockMvc.perform(delete("/api/rooms/my-room/members").with(MockOidcLogins.bobOidcLogin()).with(csrf())).andExpect(status().isOk());

		verify(roomService).removeMember(room, roomMember);
		verify(roomRepository).save(room);
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/members` does not throw when not joined")
	void leaveRoomNotJoined() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(delete("/api/rooms/my-room/members").with(MockOidcLogins.bobOidcLogin()).with(csrf())).andExpect(status().isOk());

		verify(roomRepository, never()).save(any());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` throws for unknown room name")
	void editMemberUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(patch("/api/rooms/my-room/members/Bob").with(MockOidcLogins.bobOidcLogin()).queryParam("action", "SET_OBSERVER").with(csrf()))
				.andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` throws when not a member")
	void editMemberNotMember() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 1"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		room.getMembers().add(new RoomMember("Alice"));

		mockMvc.perform(patch("/api/rooms/my-room/members/Bob").with(MockOidcLogins.bobOidcLogin()).queryParam("action", "SET_OBSERVER").with(csrf()))
				.andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` throws for unknown username")
	void editMemberUnknownUsername() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		room.getMembers().add(new RoomMember("Bob"));

		mockMvc.perform(patch("/api/rooms/my-room/members/Alice").with(MockOidcLogins.bobOidcLogin()).queryParam("action", "SET_OBSERVER").with(csrf()))
				.andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` sets to observer")
	void editMemberSetsObserver() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember = new RoomMember("Bob");
		roomMember.setRole(RoomMember.Role.VOTER);
		room.getMembers().add(roomMember);

		mockMvc.perform(patch("/api/rooms/my-room/members/Bob").with(MockOidcLogins.bobOidcLogin())
				.with(MockOidcLogins.bobOidcLogin())
				.queryParam("action", "SET_OBSERVER")
				.with(csrf())).andExpect(status().isOk());

		verify(roomService).setRole(room, roomMember, RoomMember.Role.OBSERVER);
		verify(roomRepository).save(room);
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` sets to voter")
	void editMemberSetsVoter() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember = new RoomMember("Bob");
		roomMember.setRole(RoomMember.Role.OBSERVER);
		room.getMembers().add(roomMember);

		mockMvc.perform(patch("/api/rooms/my-room/members/Bob").with(MockOidcLogins.bobOidcLogin()).queryParam("action", "SET_VOTER").with(csrf()))
				.andExpect(status().isOk());

		verify(roomService).setRole(room, roomMember, RoomMember.Role.VOTER);
		verify(roomRepository).save(room);
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` kicks")
	void editMemberKicks() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember alice = new RoomMember("Alice");
		room.getMembers().add(alice);
		final RoomMember bob = new RoomMember("Bob");
		room.getMembers().add(bob);

		mockMvc.perform(patch("/api/rooms/my-room/members/Alice").with(MockOidcLogins.bobOidcLogin()).queryParam("action", "KICK").with(csrf()))
				.andExpect(status().isOk());

		verify(roomService).removeMember(room, alice);
		verify(roomRepository).save(room);
	}
}
