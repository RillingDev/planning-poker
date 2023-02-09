package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.data.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
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
	ExtensionRepository extensionRepository;

	@Autowired
	MockMvc mockMvc;

	@Test
	@DisplayName("GET `/api/rooms` loads rooms")
	@WithMockUser
	void loadRooms() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Room room1 = new Room("Room #1", cardSet);
		room1.setTopic("Foo!");
		room1.getMembers().add(new RoomMember("John Doe"));
		final Room room2 = new Room("Room #2", cardSet);
		given(roomRepository.findAll()).willReturn(List.of(room1, room2));

		mockMvc.perform(get("/api/rooms"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0].name").value("Room #1"))
				.andExpect(jsonPath("$[0].topic").value("Foo!"))
				.andExpect(jsonPath("$[0].cardSetName").value("My Set 1"))
				.andExpect(jsonPath("$[0].members.length()").value(1))
				.andExpect(jsonPath("$[0].members[0].username").value("John Doe"))
				.andExpect(jsonPath("$[0].members[0].role").value("VOTER"))
				.andExpect(jsonPath("$[1].name").value("Room #2"))
				.andExpect(jsonPath("$[1].topic").value((String) null))
				.andExpect(jsonPath("$[1].cardSetName").value("My Set 1"))
				.andExpect(jsonPath("$[1].members.length()").value(0));
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}` throws for duplicate name")
	@WithMockUser
	void createRoomDuplicateName() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(new Room("my-room", cardSet)));
		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.of(cardSet));

		mockMvc.perform(post("/api/rooms/my-room").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""
				{
					"cardSetName": "My Set 1"
				}
				""")).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}` throws for unknown card set")
	@WithMockUser
	void createRoomUnknownCardSet() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());
		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.empty());

		mockMvc.perform(post("/api/rooms/my-room").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""
				{
					"cardSetName": "My Set 1"
				}
				""")).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}` creates room")
	@WithMockUser("John Doe")
	void createRoomCreatesRoom() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());
		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.of(cardSet));

		mockMvc.perform(post("/api/rooms/my-room").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""
				{
					"cardSetName": "My Set 1"
				}
				""")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getName()).isEqualTo("my-room");
		assertThat(captor.getValue().getTopic()).isNull();
		assertThat(captor.getValue().getCardSet()).isEqualTo(cardSet);
		final Set<RoomMember> members = captor.getValue().getMembers();
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}` throws for unknown name")
	@WithMockUser
	void deleteRoomUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(delete("/api/rooms/my-room").with(csrf())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}` deletes")
	@WithMockUser
	void deleteRoomDeletes() throws Exception {
		final Room room = new Room("my-room", new CardSet("Card Set"));
		room.getMembers().add(new RoomMember("Alice"));
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(delete("/api/rooms/my-room").with(csrf())).andExpect(status().isOk());

		verify(roomRepository).delete(room);
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}` throws for unknown name")
	@WithMockUser
	void editRoomUnknownName() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.of(cardSet));

		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(patch("/api/rooms/my-room").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""
				{
					"cardSetName": "My Set 1"
				}
				""")).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}` throws for unknown card set")
	@WithMockUser
	void editRoomUnknownCardSet() throws Exception {
		final Room room = new Room("my-room", new CardSet("My Set 2"));
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.empty());

		mockMvc.perform(patch("/api/rooms/my-room").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""
				{
					"cardSetName": "My Set 1"
				}
				""")).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}` edits card-set")
	@WithMockUser
	void editRoomEditsCardSet() throws Exception {
		final CardSet originalCardSet = new CardSet("My Set 2");
		final Room room = new Room("my-room", originalCardSet);
		room.setTopic("Foo!");
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final CardSet newCardSet = new CardSet("My Set 1");
		given(cardSetRepository.findByName("My Set 1")).willReturn(Optional.of(newCardSet));

		mockMvc.perform(patch("/api/rooms/my-room").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""
				{
					"cardSetName": "My Set 1"
				}
				""")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getCardSet()).isEqualTo(newCardSet);
		assertThat(captor.getValue().getTopic()).isEqualTo("Foo!");
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}` edits topic")
	@WithMockUser
	void editRoomEditsTopic() throws Exception {
		final CardSet cardSet = new CardSet("My Set 2");
		final Room room = new Room("my-room", cardSet);
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(patch("/api/rooms/my-room").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""
				{
					"topic": "Foo!"
				}
				""")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getTopic()).isEqualTo("Foo!");
		assertThat(captor.getValue().getCardSet()).isEqualTo(cardSet);
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}` throws for unknown extension")
	@WithMockUser
	void editRoomChecksExtension() throws Exception {
		final CardSet cardSet = new CardSet("My Set 2");
		final Room room = new Room("my-room", cardSet);
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		given(extensionRepository.findByKeyAndEnabledIsTrue("bar")).willReturn(Optional.empty());

		mockMvc.perform(patch("/api/rooms/my-room").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""
				{
					"extensions": ["bar"]
				}
				""")).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}` adds extension")
	@WithMockUser
	void editRoomAddsExtension() throws Exception {
		final CardSet cardSet = new CardSet("My Set 2");
		final Room room = new Room("my-room", cardSet);
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final Extension someExtension = new Extension("someExtension");
		given(extensionRepository.findByKeyAndEnabledIsTrue("someExtension")).willReturn(Optional.of(someExtension));

		mockMvc.perform(patch("/api/rooms/my-room").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""
				{
					"extensions": ["someExtension"]
				}
				""")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getExtensionConfigs()).hasSize(1);
		final RoomExtensionConfig roomExtensionConfig = captor.getValue().getExtensionConfigs().iterator().next();
		assertThat(roomExtensionConfig.getExtension()).isEqualTo(someExtension);
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}` removes extension")
	@WithMockUser
	void editRoomRemovesExtension() throws Exception {
		final CardSet cardSet = new CardSet("My Set 2");
		final Room room = new Room("my-room", cardSet);
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final Extension someExtension = new Extension("someExtension");
		room.getExtensionConfigs().add(new RoomExtensionConfig(someExtension));
		given(extensionRepository.findByKeyAndEnabledIsTrue("someExtension")).willReturn(Optional.of(someExtension));

		mockMvc.perform(patch("/api/rooms/my-room").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""
				{
					"extensions": []
				}
				""")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getExtensionConfigs()).isEmpty();
	}

	@Test
	@DisplayName("PATCH `/api/rooms/{room-name}` handles mixed extension changes")
	@WithMockUser
	void editRoomMixedExtension() throws Exception {
		final CardSet cardSet = new CardSet("My Set 2");
		final Room room = new Room("my-room", cardSet);
		room.getMembers().add(new RoomMember("John Doe"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final Extension someExtension = new Extension("someExtension");
		room.getExtensionConfigs().add(new RoomExtensionConfig(someExtension));
		given(extensionRepository.findByKeyAndEnabledIsTrue("someExtension")).willReturn(Optional.of(someExtension));
		final Extension otherExtension = new Extension("otherExtension");
		given(extensionRepository.findByKeyAndEnabledIsTrue("otherExtension")).willReturn(Optional.of(otherExtension));

		mockMvc.perform(patch("/api/rooms/my-room").with(csrf()).contentType(MediaType.APPLICATION_JSON).content("""
				{
					"extensions": ["otherExtension"]
				}
				""")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getExtensionConfigs()).hasSize(1);
		final RoomExtensionConfig roomExtensionConfig = captor.getValue().getExtensionConfigs().iterator().next();
		assertThat(roomExtensionConfig.getExtension()).isEqualTo(otherExtension);
	}
}
