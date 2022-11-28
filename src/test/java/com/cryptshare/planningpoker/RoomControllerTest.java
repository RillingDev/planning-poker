package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.entities.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = RoomController.class)
class RoomControllerTest {

	@MockBean
	RoomRepository roomRepository;

	@MockBean
	CardSetRepository cardSetRepository;

	@MockBean
	UserService userService;

	@Autowired
	MockMvc mockMvc;

	@Test
	@DisplayName("GET `/api/rooms` loads rooms")
	@WithMockUser
	void loadRooms() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Room room1 = new Room("Room #1", cardSet);
		final Room room2 = new Room("Room #2", cardSet);
		given(roomRepository.findAll()).willReturn(List.of(room1, room2));

		mockMvc.perform(get("/api/rooms"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0].name").value("Room #1"))
				.andExpect(jsonPath("$[0].cardSetName").value("My Set 1"))
				.andExpect(jsonPath("$[1].name").value("Room #2"))
				.andExpect(jsonPath("$[1].cardSetName").value("My Set 1"));
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}` throws for duplicate name")
	@WithMockUser
	void createRoomDuplicateName() throws Exception {
		given(userService.getUser(any())).willReturn(new User("John Doe"));

		final CardSet cardSet = new CardSet("My Set 1");
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(new Room("my-room", cardSet)));
		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.of(cardSet));

		mockMvc.perform(post("/api/rooms/my-room").with(csrf()).queryParam("card-set-name", cardSet.getName()))
				.andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}` throws for unknown card set")
	@WithMockUser
	void createRoomUnknownCardSet() throws Exception {
		given(userService.getUser(any())).willReturn(new User("John Doe"));

		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());
		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.empty());

		mockMvc.perform(post("/api/rooms/my-room").with(csrf()).queryParam("card-set-name", "My Set 1")).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}` creates room")
	@WithMockUser
	void createRoomCreatesRoom() throws Exception {
		final User user = new User("John Doe");
		given(userService.getUser(any())).willReturn(user);

		final CardSet cardSet = new CardSet("My Set 1");
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());
		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.of(cardSet));

		mockMvc.perform(post("/api/rooms/my-room").with(csrf()).queryParam("card-set-name", cardSet.getName())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getName()).isEqualTo("my-room");
		assertThat(captor.getValue().getCardSet()).isEqualTo(cardSet);
		final Set<RoomMember> members = captor.getValue().getMembers();
		assertThat(members).extracting(RoomMember::getUser).containsExactly(user);
		assertThat(members).extracting(RoomMember::getRole).containsExactly(RoomMember.Role.MODERATOR);
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}` throws for unknown name")
	@WithMockUser
	void deleteRoomUnknownName() throws Exception {
		given(userService.getUser(any())).willReturn(new User("John Doe"));

		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(delete("/api/rooms/my-room").with(csrf())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}` throws for lacking permissions")
	@WithMockUser
	void deleteRoomPermissions() throws Exception {
		final User alice = new User("Alice");
		final User johnDoe = new User("John Doe");
		given(userService.getUser(any())).willReturn(johnDoe);

		final Room room = new Room("my-room", new CardSet("Card Set"));
		room.getMembers().add(new RoomMember(alice, RoomMember.Role.MODERATOR));
		room.getMembers().add(new RoomMember(johnDoe, RoomMember.Role.USER));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(delete("/api/rooms/my-room").with(csrf())).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}` deletes")
	@WithMockUser
	void deleteRoomDeletes() throws Exception {
		final User alice = new User("Alice");
		final User johnDoe = new User("John Doe");
		given(userService.getUser(any())).willReturn(johnDoe);

		final Room room = new Room("my-room", new CardSet("Card Set"));
		room.getMembers().add(new RoomMember(alice, RoomMember.Role.USER));
		room.getMembers().add(new RoomMember(johnDoe, RoomMember.Role.MODERATOR));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(delete("/api/rooms/my-room").with(csrf())).andExpect(status().isOk());

		verify(roomRepository).delete(room);
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}` throws for unknown name")
	@WithMockUser
	void editRoomUnknownName() throws Exception {
		given(userService.getUser(any())).willReturn(new User("John Doe"));

		final CardSet cardSet = new CardSet("My Set 1");
		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.of(cardSet));

		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(patch("/api/rooms/my-room").with(csrf()).queryParam("card-set-name", cardSet.getName()))
				.andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}` throws for lacking permissions")
	@WithMockUser
	void editRoomPermissions() throws Exception {
		final User alice = new User("Alice");
		final User johnDoe = new User("John Doe");
		given(userService.getUser(any())).willReturn(johnDoe);

		final Room room = new Room("my-room", new CardSet("My Set 2"));
		room.getMembers().add(new RoomMember(alice, RoomMember.Role.MODERATOR));
		room.getMembers().add(new RoomMember(johnDoe, RoomMember.Role.USER));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final CardSet cardSet = new CardSet("My Set 1");
		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.of(cardSet));

		mockMvc.perform(patch("/api/rooms/my-room").with(csrf()).queryParam("card-set-name", cardSet.getName()))
				.andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}` throws for unknown card set")
	@WithMockUser
	void editRoomUnknownCardSet() throws Exception {
		final User alice = new User("Alice");
		final User johnDoe = new User("John Doe");
		given(userService.getUser(any())).willReturn(johnDoe);

		final Room room = new Room("my-room", new CardSet("My Set 2"));
		room.getMembers().add(new RoomMember(alice, RoomMember.Role.MODERATOR));
		room.getMembers().add(new RoomMember(johnDoe, RoomMember.Role.USER));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.empty());

		mockMvc.perform(patch("/api/rooms/my-room").with(csrf()).queryParam("card-set-name", "My Set 1")).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}` edits")
	@WithMockUser
	void editRoomEdits() throws Exception {
		final User alice = new User("Alice");
		final User johnDoe = new User("John Doe");
		given(userService.getUser(any())).willReturn(johnDoe);

		final Room room = new Room("my-room", new CardSet("My Set 2"));
		room.getMembers().add(new RoomMember(alice, RoomMember.Role.USER));
		room.getMembers().add(new RoomMember(johnDoe, RoomMember.Role.MODERATOR));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final CardSet cardSet = new CardSet("My Set 1");
		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.of(cardSet));

		mockMvc.perform(patch("/api/rooms/my-room").with(csrf()).queryParam("card-set-name", cardSet.getName())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getCardSet()).isEqualTo(cardSet);
	}
}
