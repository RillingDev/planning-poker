package dev.rilling.planningpoker.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import dev.rilling.planningpoker.data.Room;
import dev.rilling.planningpoker.data.RoomExtensionConfig;
import dev.rilling.planningpoker.data.RoomMember;

import java.util.List;
import java.util.Set;
import java.util.function.Function;
import java.util.function.Predicate;

/**
 * Model for {@link Room}.
 */
public record RoomJson(@JsonProperty("name") String name, @JsonProperty("topic") String topic, @JsonProperty("cardSetName") String cardSetName,
					   @JsonProperty("members") List<RoomMemberJson> members, @JsonProperty("votingClosed") boolean votingClosed,
					   @JsonProperty("extensions") List<String> extensions) {

	public static RoomJson convertToBasic(Room room) {
		return convert(room, RoomMemberJson::convertToBasic);
	}

	public static RoomJson convertToDetailed(Room room, Predicate<RoomMember> showVotes) {
		return convert(room, roomMember -> RoomMemberJson.convertToDetailed(roomMember, showVotes.test(roomMember)));
	}

	private static RoomJson convert(Room room, Function<RoomMember, RoomMemberJson> roomMemberMapper) {
		return new RoomJson(
				room.getName(),
				room.getTopic(),
				room.getCardSet().getName(),
				room.getMembers().stream().sorted(RoomMember.ALPHABETIC_COMPARATOR).map(roomMemberMapper).toList(),
				room.getVotingState() == Room.VotingState.CLOSED,
				convertExtensionConfigs(room.getExtensionConfigs()));
	}

	private static List<String> convertExtensionConfigs(Set<RoomExtensionConfig> extensionConfigs) {
		return extensionConfigs.stream()
				.filter(roomExtensionConfig -> roomExtensionConfig.getExtension().isEnabled())
				.sorted(RoomExtensionConfig.ALPHABETIC_COMPARATOR)
				.map(roomExtensionConfig -> roomExtensionConfig.getExtension().getKey())
				.toList();
	}
}
