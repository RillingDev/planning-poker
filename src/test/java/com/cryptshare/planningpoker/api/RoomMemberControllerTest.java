package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.data.CardSet;
import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
import com.cryptshare.planningpoker.data.RoomRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = RoomMemberController.class)
class RoomMemberControllerTest {

	@MockBean
	RoomRepository roomRepository;

	@Autowired
	MockMvc mockMvc;

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/members` throws for unknown name")
	@WithMockUser
	void joinRoomUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(post("/api/rooms/my-room/members").with(csrf())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/members` joins room")
	@WithMockUser("John Doe")
	void joinRoomJoins() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/members").with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getMembers()).extracting(RoomMember::getUsername).containsExactly("John Doe");
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/members` throws for unknown name")
	@WithMockUser
	void leaveRoomUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(delete("/api/rooms/my-room/members").with(csrf())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/members` leaves room")
	@WithMockUser("John Doe")
	void leaveRoomLeaves() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(delete("/api/rooms/my-room/members").with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getMembers()).isEmpty();
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` throws for unknown room name")
	@WithMockUser
	void editMemberUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(patch("/api/rooms/my-room/members/JohnDoe").queryParam("action", "SET_OBSERVER").with(csrf()))
				.andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` throws when not a member")
	@WithMockUser("JohnDoe")
	void editMemberNotMember() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 1"));
		room.getMembers().add(new RoomMember("Alice"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(patch("/api/rooms/my-room/members/JohnDoe").queryParam("action", "SET_OBSERVER").with(csrf()))
				.andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` throws for unknown username")
	@WithMockUser("JohnDoe")
	void editMemberUnknownUsername() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		room.getMembers().add(new RoomMember("JohnDoe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(patch("/api/rooms/my-room/members/Alice").queryParam("action", "SET_OBSERVER").with(csrf()))
				.andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` sets to observer")
	@WithMockUser("JohnDoe")
	void editMemberSetsObserver() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		final RoomMember roomMember = new RoomMember("JohnDoe");
		roomMember.setRole(RoomMember.Role.VOTER);
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(patch("/api/rooms/my-room/members/JohnDoe").queryParam("action", "SET_OBSERVER").with(csrf()))
				.andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().findMemberByUser("JohnDoe")).isPresent()
				.get()
				.extracting(RoomMember::getRole)
				.isEqualTo(RoomMember.Role.OBSERVER);
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` sets to voter")
	@WithMockUser("JohnDoe")
	void editMemberSetsVoter() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		final RoomMember roomMember = new RoomMember("JohnDoe");
		roomMember.setRole(RoomMember.Role.OBSERVER);
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(patch("/api/rooms/my-room/members/JohnDoe").queryParam("action", "SET_VOTER").with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().findMemberByUser("JohnDoe")).isPresent()
				.get()
				.extracting(RoomMember::getRole)
				.isEqualTo(RoomMember.Role.VOTER);
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}/members/{member-username}` kicks")
	@WithMockUser("John Doe")
	void editMemberKicks() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		final RoomMember alice = new RoomMember("Alice");
		final RoomMember johnDoe = new RoomMember("John Doe");
		room.getMembers().add(alice);
		room.getMembers().add(johnDoe);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(patch("/api/rooms/my-room/members/Alice").queryParam("action", "KICK").with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().findMemberByUser("Alice")).isNotPresent();
		assertThat(captor.getValue().findMemberByUser("John Doe")).isPresent();
	}

}
