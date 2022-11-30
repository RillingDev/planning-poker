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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = RoomVotingController.class)
class RoomVotingControllerTest {

	@MockBean
	RoomRepository roomRepository;

	@Autowired
	MockMvc mockMvc;

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/` throws for unknown name")
	@WithMockUser
	void loadRoomUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(get("/api/rooms/my-room/")).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/` throws when not a member")
	@WithMockUser("John Doe")
	void loadRoomNotMember() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember("Alice");
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(get("/api/rooms/my-room/")).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/` loads room")
	@WithMockUser("John Doe")
	void loadRoomLoads() throws Exception {
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

		mockMvc.perform(get("/api/rooms/my-room/"))
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
	@DisplayName("GET `/api/rooms/{room-name}/` shows votes when complete")
	@WithMockUser("John Doe")
	void loadRoomShowsVotes() throws Exception {
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

		mockMvc.perform(get("/api/rooms/my-room/"))
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
	@DisplayName("POST `/api/rooms/{room-name}/votes` throws for unknown name")
	@WithMockUser
	void createVoteUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(post("/api/rooms/my-room/votes").with(csrf()).queryParam("card-name", "1")).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/votes` throws when not a member")
	@WithMockUser("John Doe")
	void createVoteNotMember() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		cardSet.getCards().add(new Card("1", 1.0));
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember("Alice");
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/votes").with(csrf()).queryParam("card-name", "1")).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/votes` throws when an illegal card is specified")
	@WithMockUser("John Doe")
	void createVoteWrongCard() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		cardSet.getCards().add(new Card("1", 1.0));
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember("John Doe");
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/votes").with(csrf()).queryParam("card-name", "99")).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/votes` sets vote")
	@WithMockUser("John Doe")
	void createVotePutsVote() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember("John Doe");
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/votes").with(csrf()).queryParam("card-name", "1")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Vote vote = captor.getValue().findMemberByUser("John Doe").orElseThrow().getVote();
		assertThat(vote).isNotNull().extracting(Vote::getCard).isEqualTo(card);
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/votes` updates vote")
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

		mockMvc.perform(post("/api/rooms/my-room/votes").with(csrf()).queryParam("card-name", "2")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Vote vote = captor.getValue().findMemberByUser("John Doe").orElseThrow().getVote();
		assertThat(vote).isNotNull().extracting(Vote::getCard).isEqualTo(card2);
	}
}
