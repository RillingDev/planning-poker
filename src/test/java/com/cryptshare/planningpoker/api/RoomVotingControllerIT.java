package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.SummaryService;
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
import java.util.Set;

import static com.cryptshare.planningpoker.SummaryService.VoteSummary;
import static com.cryptshare.planningpoker.api.MockOidcLogins.bobOidcLogin;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = RoomVotingController.class)
class RoomVotingControllerIT {

	@MockBean
	RoomRepository roomRepository;

	@MockBean
	SummaryService summaryService;

	@Autowired
	MockMvc mockMvc;

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/votes` throws for unknown name")
	void createVoteUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(post("/api/rooms/my-room/votes").with(bobOidcLogin()).with(csrf()).queryParam("card-name", "1")).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/votes` throws when not a member")
	void createVoteNotMember() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		cardSet.getCards().add(new Card("1", 1.0));
		final Room room = new Room("my-room", cardSet);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember = new RoomMember("Alice");
		room.getMembers().add(roomMember);

		mockMvc.perform(post("/api/rooms/my-room/votes").with(bobOidcLogin()).with(csrf()).queryParam("card-name", "1")).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/votes` throws when an illegal card is specified")
	void createVoteWrongCard() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		cardSet.getCards().add(new Card("1", 1.0));
		final Room room = new Room("my-room", cardSet);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember = new RoomMember("Bob");
		room.getMembers().add(roomMember);

		mockMvc.perform(post("/api/rooms/my-room/votes").with(bobOidcLogin()).with(csrf()).queryParam("card-name", "99")).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/votes` blocks observers")
	void createVoteBlocksObserver() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("my-room", cardSet);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember = new RoomMember("Bob");
		roomMember.setRole(RoomMember.Role.OBSERVER);
		room.getMembers().add(roomMember);

		mockMvc.perform(post("/api/rooms/my-room/votes").with(bobOidcLogin()).with(csrf()).queryParam("card-name", "99")).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/votes` ignores if voting is complete")
	void createVoteClosed() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		cardSet.getCards().add(card1);
		cardSet.getCards().add(card2);
		final Room room = new Room("my-room", cardSet);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember1 = new RoomMember("Bob");
		roomMember1.setVote(card1);
		room.getMembers().add(roomMember1);

		final RoomMember roomMember2 = new RoomMember("Alice");
		roomMember2.setVote(card1);
		room.getMembers().add(roomMember2);
		room.setVotingState(Room.VotingState.CLOSED);

		mockMvc.perform(post("/api/rooms/my-room/votes").with(bobOidcLogin()).with(csrf()).queryParam("card-name", "2")).andExpect(status().isOk());

		verify(roomRepository, never()).save(any());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/votes` sets vote")
	void createVotePutsVote() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("my-room", cardSet);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember = new RoomMember("Bob");
		room.getMembers().add(roomMember);

		mockMvc.perform(post("/api/rooms/my-room/votes").with(bobOidcLogin()).with(csrf()).queryParam("card-name", "1")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Room actual = captor.getValue();
		assertThat(actual.findMemberByUser("Bob").orElseThrow().getVote()).isNotNull().isEqualTo(card);
		assertThat(actual.getVotingState()).isEqualTo(Room.VotingState.CLOSED);
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/votes` updates vote")
	void createVoteUpdateVote() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		cardSet.getCards().add(card1);
		cardSet.getCards().add(card2);
		final Room room = new Room("my-room", cardSet);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember1 = new RoomMember("Bob");
		roomMember1.setVote(card1);
		room.getMembers().add(roomMember1);

		final RoomMember roomMember2 = new RoomMember("Alice");
		room.getMembers().add(roomMember2);

		mockMvc.perform(post("/api/rooms/my-room/votes").with(bobOidcLogin()).with(csrf()).queryParam("card-name", "2")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Card vote = captor.getValue().findMemberByUser("Bob").orElseThrow().getVote();
		assertThat(vote).isEqualTo(card2);
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/votes` throws for unknown name")
	void clearVotesUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(delete("/api/rooms/my-room/votes").with(bobOidcLogin()).with(csrf())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/votes` throws when not a member")
	void clearVotesNotMember() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		cardSet.getCards().add(new Card("1", 1.0));
		final Room room = new Room("my-room", cardSet);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember = new RoomMember("Alice");
		room.getMembers().add(roomMember);

		mockMvc.perform(delete("/api/rooms/my-room/votes").with(bobOidcLogin()).with(csrf())).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/votes` clear vote")
	void clearVotesUpdateVote() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		cardSet.getCards().add(card1);
		cardSet.getCards().add(card2);
		final Room room = new Room("my-room", cardSet);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember1 = new RoomMember("Bob");
		roomMember1.setVote(card1);
		room.getMembers().add(roomMember1);

		final RoomMember roomMember2 = new RoomMember("Alice");
		roomMember2.setVote(card2);
		room.getMembers().add(roomMember2);
		room.setVotingState(Room.VotingState.CLOSED);

		mockMvc.perform(delete("/api/rooms/my-room/votes").with(bobOidcLogin()).with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getMembers()).hasSize(2).allMatch(rm -> rm.getVote() == null);
		assertThat(captor.getValue().getVotingState()).isEqualTo(Room.VotingState.OPEN);
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/votes/summary` throws for unknown name")
	@WithMockUser
	void getSummaryUnknownName() throws Exception {
		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(get("/api/rooms/my-room/votes/summary").with(bobOidcLogin()).with(csrf())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/votes/summary` throws when not a member")
	void getSummaryNotMember() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		cardSet.getCards().add(new Card("1", 1.0));
		final Room room = new Room("my-room", cardSet);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember = new RoomMember("Alice");
		room.getMembers().add(roomMember);

		mockMvc.perform(get("/api/rooms/my-room/votes/summary").with(bobOidcLogin()).with(csrf())).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/votes/summary` shows empty when not complete")
	void getSummaryShowsEmpty() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("my-room", cardSet);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember1 = new RoomMember("Bob");
		roomMember1.setVote(card);
		room.getMembers().add(roomMember1);

		final RoomMember roomMember2 = new RoomMember("Alice");
		roomMember2.setVote(card);
		room.getMembers().add(roomMember2);

		given(summaryService.summarize(room)).willReturn(Optional.empty());

		mockMvc.perform(get("/api/rooms/my-room/votes/summary").with(bobOidcLogin())).andExpect(status().isOk()).andExpect(jsonPath("$.votes").value((Object) null));
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/votes/summary` shows votes when complete")
	void getSummaryShowsSummary() throws Exception {
		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("my-room", cardSet);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		final RoomMember roomMember1 = new RoomMember("Bob");
		roomMember1.setVote(card);
		room.getMembers().add(roomMember1);

		final RoomMember roomMember2 = new RoomMember("Alice");
		roomMember2.setVote(card);
		room.getMembers().add(roomMember2);
		room.setVotingState(Room.VotingState.CLOSED);

		given(summaryService.summarize(room)).willReturn(Optional.of(new VoteSummary(1.0,
				card, new SummaryService.VoteExtreme(card, Set.of(roomMember1)), new SummaryService.VoteExtreme(card, Set.of(roomMember2)), 2
		)));

		mockMvc.perform(get("/api/rooms/my-room/votes/summary").with(bobOidcLogin()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.votes.average").value(1.0))
				.andExpect(jsonPath("$.votes.offset").value(2))
				.andExpect(jsonPath("$.votes.nearestCard.name").value("1"))
				.andExpect(jsonPath("$.votes.highest.card.name").value("1"))
				.andExpect(jsonPath("$.votes.highest.members.length()").value(1))
				.andExpect(jsonPath("$.votes.highest.members[0].username").value("Bob"))
				.andExpect(jsonPath("$.votes.lowest.card.name").value("1"))
				.andExpect(jsonPath("$.votes.lowest.members.length()").value(1))
				.andExpect(jsonPath("$.votes.lowest.members[0].username").value("Alice"));
	}
}
