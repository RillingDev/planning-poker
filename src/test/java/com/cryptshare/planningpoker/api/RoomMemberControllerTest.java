package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.UserService;
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
import static org.mockito.ArgumentMatchers.any;
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

	@MockBean
	UserService userService;

	@Autowired
	MockMvc mockMvc;

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/session` throws for unknown name")
	@WithMockUser
	void joinRoomUnknownName() throws Exception {
		given(userService.getUser(any())).willReturn(new User("John Doe"));

		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(post("/api/rooms/my-room/session").with(csrf())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/session` joins room")
	@WithMockUser
	void joinRoomJoins() throws Exception {
		final User user = new User("John Doe");
		given(userService.getUser(any())).willReturn(user);

		final Room room = new Room("my-room", new CardSet("My Set 2"));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/session").with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getMembers()).extracting(RoomMember::getUser).containsExactly(user);
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/session` throws for unknown name")
	@WithMockUser
	void leaveRoomUnknownName() throws Exception {
		given(userService.getUser(any())).willReturn(new User("John Doe"));

		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(delete("/api/rooms/my-room/session").with(csrf())).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/session` joins room")
	@WithMockUser
	void leaveRoomLeaves() throws Exception {
		final User user = new User("John Doe");
		given(userService.getUser(any())).willReturn(user);

		final Room room = new Room("my-room", new CardSet("My Set 2"));
		room.getMembers().add(new RoomMember(user, RoomMember.Role.VOTER));
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(delete("/api/rooms/my-room/session").with(csrf())).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		assertThat(captor.getValue().getMembers()).isEmpty();
	}

	@Test
	@DisplayName("DELETE `/api/rooms/{room-name}/session` throws for unknown name")
	@WithMockUser
	void loadRoomsUnknownName() throws Exception {
		given(userService.getUser(any())).willReturn(new User("John Doe"));

		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(get("/api/rooms/my-room/session")).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/session` throws when not a member")
	@WithMockUser
	void loadRoomsNotMember() throws Exception {
		final User johnDoe = new User("John Doe");
		given(userService.getUser(any())).willReturn(johnDoe);

		final CardSet cardSet = new CardSet("My Set 1");
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember(new User("Alice"), RoomMember.Role.VOTER);
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(get("/api/rooms/my-room/session")).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("GET `/api/rooms/{room-name}/session` loads room")
	@WithMockUser
	void loadRoomsLoads() throws Exception {
		final User alice = new User("Alice");
		final User johnDoe = new User("John Doe");
		given(userService.getUser(any())).willReturn(johnDoe);

		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember1 = new RoomMember(johnDoe, RoomMember.Role.VOTER);
		roomMember1.setVote(new Vote(roomMember1, card));
		final RoomMember roomMember2 = new RoomMember(alice, RoomMember.Role.VOTER);
		room.getMembers().add(roomMember1);
		room.getMembers().add(roomMember2);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(get("/api/rooms/my-room/session"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("my-room"))
				.andExpect(jsonPath("$.cardSetName").value("My Set 1"))
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
	@WithMockUser
	void loadRoomsShowsVotes() throws Exception {
		final User alice = new User("Alice");
		final User johnDoe = new User("John Doe");
		given(userService.getUser(any())).willReturn(johnDoe);

		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember1 = new RoomMember(johnDoe, RoomMember.Role.VOTER);
		roomMember1.setVote(new Vote(roomMember1, card));
		final RoomMember roomMember2 = new RoomMember(alice, RoomMember.Role.VOTER);
		roomMember2.setVote(new Vote(roomMember2, card));
		room.getMembers().add(roomMember1);
		room.getMembers().add(roomMember2);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(get("/api/rooms/my-room/session"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.name").value("my-room"))
				.andExpect(jsonPath("$.cardSetName").value("My Set 1"))
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
		given(userService.getUser(any())).willReturn(new User("John Doe"));

		given(roomRepository.findByName("my-room")).willReturn(Optional.empty());

		mockMvc.perform(post("/api/rooms/my-room/session/vote").with(csrf()).queryParam("card-name", "1")).andExpect(status().isNotFound());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/session/vote` throws when not a member")
	@WithMockUser
	void createVoteNotMember() throws Exception {
		final User johnDoe = new User("John Doe");
		given(userService.getUser(any())).willReturn(johnDoe);

		final CardSet cardSet = new CardSet("My Set 1");
		cardSet.getCards().add(new Card("1", 1.0));
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember(new User("Alice"), RoomMember.Role.VOTER);
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/session/vote").with(csrf()).queryParam("card-name", "1")).andExpect(status().isForbidden());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/session/vote` throws when an illegal card is specified")
	@WithMockUser
	void createVoteWrongCard() throws Exception {
		final User johnDoe = new User("John Doe");
		given(userService.getUser(any())).willReturn(johnDoe);

		final CardSet cardSet = new CardSet("My Set 1");
		cardSet.getCards().add(new Card("1", 1.0));
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember(johnDoe, RoomMember.Role.VOTER);
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/session/vote").with(csrf()).queryParam("card-name", "99")).andExpect(status().isBadRequest());
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/session/vote` sets vote")
	@WithMockUser
	void createVotePutsVote() throws Exception {
		final User johnDoe = new User("John Doe");
		given(userService.getUser(any())).willReturn(johnDoe);

		final CardSet cardSet = new CardSet("My Set 1");
		final Card card = new Card("1", 1.0);
		cardSet.getCards().add(card);
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember(johnDoe, RoomMember.Role.VOTER);
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/session/vote").with(csrf()).queryParam("card-name", "1")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Vote vote = captor.getValue().findMemberByUser(johnDoe).orElseThrow().getVote();
		assertThat(vote).isNotNull().extracting(Vote::getCard).isEqualTo(card);
	}

	@Test
	@DisplayName("POST `/api/rooms/{room-name}/session/vote` updates vote")
	@WithMockUser
	void createVoteUpdateVote() throws Exception {
		final User johnDoe = new User("John Doe");
		given(userService.getUser(any())).willReturn(johnDoe);

		final CardSet cardSet = new CardSet("My Set 1");
		final Card card1 = new Card("1", 1.0);
		final Card card2 = new Card("2", 2.0);
		cardSet.getCards().add(card1);
		cardSet.getCards().add(card2);
		final Room room = new Room("my-room", cardSet);
		final RoomMember roomMember = new RoomMember(johnDoe, RoomMember.Role.VOTER);
		roomMember.setVote(new Vote(roomMember, card1));
		room.getMembers().add(roomMember);
		given(roomRepository.findByName("my-room")).willReturn(Optional.of(room));

		mockMvc.perform(post("/api/rooms/my-room/session/vote").with(csrf()).queryParam("card-name", "2")).andExpect(status().isOk());

		final ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
		verify(roomRepository).save(captor.capture());
		final Vote vote = captor.getValue().findMemberByUser(johnDoe).orElseThrow().getVote();
		assertThat(vote).isNotNull().extracting(Vote::getCard).isEqualTo(card2);
	}
}
