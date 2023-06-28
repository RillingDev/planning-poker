package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.data.*;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Encapsulates mutations of rooms and members.
 */
@Service
class RoomService {

	public void editTopic(Room room, String newTopic) {
		room.setTopic(newTopic);
	}

	public void editCardSet(Room room, CardSet newCardSet) {
		room.setCardSet(newCardSet);

		clearVotes(room);
	}

	public void editExtensions(Room room, Set<Extension> newExtensions) {
		final Set<Extension> previousExtensions = room.getExtensionConfigs().stream().map(RoomExtensionConfig::getExtension).collect(Collectors.toCollection(HashSet::new));

		for (Extension newExtension : newExtensions) {
			if (previousExtensions.contains(newExtension)) {
				// Extension unchanged.
			} else {
				// Extension added.
				room.getExtensionConfigs().add(new RoomExtensionConfig(newExtension));
			}
			previousExtensions.remove(newExtension);
		}

		// Check values that were only in previous, not in new one.
		for (Extension previousExtension : previousExtensions) {
			// Extension removed.
			room.getExtensionConfigs().removeIf(roomExtensionConfig -> roomExtensionConfig.getExtension().equals(previousExtension));
		}
	}

	public void addMember(Room room, RoomMember roomMember) {
		room.getMembers().add(roomMember);
	}

	/**
	 * Contract: Room member must be part of room.
	 */
	public void removeMember(Room room, RoomMember roomMember) {
		room.getMembers().remove(roomMember);

		closeVotingIfNeeded(room);
	}

	/**
	 * Contract: Room member must be part of room.
	 */
	public void setRole(Room room, RoomMember roomMember, RoomMember.Role role) {
		roomMember.setRole(role);

		if (role == RoomMember.Role.OBSERVER) {
			roomMember.setVote(null);
		}

		closeVotingIfNeeded(room);
	}

	/**
	 * Contract: Room member must be part of room. Card must be part of room card set.
	 */
	public void setVote(Room room, RoomMember roomMember, Card card) {
		roomMember.setVote(card);

		closeVotingIfNeeded(room);
	}

	public void clearVotes(Room room) {
		room.getMembers().forEach(rm -> rm.setVote(null));

		room.setVotingState(Room.VotingState.OPEN);
	}

	private void closeVotingIfNeeded(Room room) {
		final Set<RoomMember> voters = room.getMembers().stream().filter(rm -> rm.getRole() == RoomMember.Role.VOTER).collect(Collectors.toSet());
		// No need to close the vote if no voters remain
		if (!voters.isEmpty() && voters.stream().allMatch(roomMember -> roomMember.getVote() != null)) {
			room.setVotingState(Room.VotingState.CLOSED);
		}
	}

}
