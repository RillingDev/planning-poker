package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.data.*;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
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

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/session` throws for unknown name")
	@WithMockUser
	void loadRoomsUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(get("/api/rooms/my-room/session")).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/session` throws when not a member")
	@WithMockUser("John Doe")
	void loadRoomsNotMember() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember("Alice");
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(get("/api/rooms/my-room/session")).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/session` loads room")
	@WithMockUser("John Doe")
	void loadRoomsLoads() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember1 = new RoomMember("John Doe");
		roomMember1.setVote(new Vote(roomMember1, card));
		final RoomMember roomMember2 = new RoomMember("Alice");
		room.getMembers().add(roomMember1);
		room.getMembers().add(roomMember2);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(get("/api/rooms/my-room/session"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("my-room"))
				.andExpect(jsonPath("$.cardSet.name").value("My Set 1"))
				.andExpect(jsonPath("$.members.length()").value(2))
				.andExpect(jsonPath("$.members[0].username").value("Alice"))
				.andExpect(jsonPath("$.members[0].role").value("VOTER"))
				.andExpect(jsonPath("$.members[0].vote").value((Vote) null))
				.andExpect(jsonPath("$.members[1].username").value("John Doe"))
				.andExpect(jsonPath("$.members[1].role").value("VOTER"))
				.andExpect(jsonPath("$.members[1].vote.name").value("Voted"))
				.andExpect(jsonPath("$.members[1].vote.value").value((Double) null));
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/session` shows votes when complete")
	@WithMockUser("John Doe")
	void loadRoomsShowsVotes() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember1 = new RoomMember("John Doe");
		roomMember1.setVote(new Vote(roomMember1, card));
		final RoomMember roomMember2 = new RoomMember("Alice");
		roomMember2.setVote(new Vote(roomMember2, card));
		room.getMembers().add(roomMember1);
		room.getMembers().add(roomMember2);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(get("/api/rooms/my-room/session"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("my-room"))
				.andExpect(jsonPath("$.cardSet.name").value("My Set 1"))
				.andExpect(jsonPath("$.members.length()").value(2))
				.andExpect(jsonPath("$.members[0].username").value("Alice"))
				.andExpect(jsonPath("$.members[0].role").value("VOTER"))
				.andExpect(jsonPath("$.members[0].vote.name").value("1"))
				.andExpect(jsonPath("$.members[0].vote.value").value(1.0))
				.andExpect(jsonPath("$.members[1].username").value("John Doe"))
				.andExpect(jsonPath("$.members[1].role").value("VOTER"))
				.andExpect(jsonPath("$.members[1].vote.name").value("1"))
				.andExpect(jsonPath("$.members[1].vote.value").value(1.0));
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/session/vote` throws for unknown name")
	@WithMockUser
	void createVoteUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(post("/api/rooms/my-room/session/vote").with(csrf()).queryParam("card-name", "1")).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/session/vote` throws when not a member")
	@WithMockUser("John Doe")
	void createVoteNotMember() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		cardSet.getCards().add(new Card("1", 1.0));
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember("Alice");
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/session/vote").with(csrf()).queryParam("card-name", "1")).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/session/vote` throws when an illegal card is specified")
	@WithMockUser("John Doe")
	void createVoteWrongCard() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		cardSet.getCards().add(new Card("1", 1.0));
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember("John Doe");
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/session/vote").with(csrf()).queryParam("card-name", "99")).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/session/vote` sets vote")
	@WithMockUser("John Doe")
	void createVotePutsVote() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember("John Doe");
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/session/vote").with(csrf()).queryParam("card-name", "1")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Vote vote = captor.getValue().findMemberByUser("John Doe").orElseThrow().getVote();
		assertThat(vote).isNotNull().extracting(Vote::getCard).isEqualTo(card);
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/session/vote` updates vote")
	@WithMockUser("John Doe")
	void createVoteUpdateVote() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		cardSet.getCards().add(card1);
		cardSet.getCards().add(card2);
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember("John Doe");
		roomMember.setVote(new Vote(roomMember, card1));
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/session/vote").with(csrf()).queryParam("card-name", "2")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Vote vote = captor.getValue().findMemberByUser("John Doe").orElseThrow().getVote();
		assertThat(vote).isNotNull().extracting(Vote::getCard).isEqualTo(card2);
	}
}
