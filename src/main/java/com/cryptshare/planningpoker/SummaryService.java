package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.data.Card;
import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
import com.cryptshare.planningpoker.data.VoteSummary;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SummaryService {

	private static final Card NOOP_CARD = new Card("0", 0.0);

	public VoteSummary getVoteSummary(Room room) {
		final List<RoomMember> membersWithCardValues = room.getMembers()
				.stream()
				.filter(roomMember -> roomMember.hasVote() && roomMember.getVote().getCard().getValue() != null)
				// Sort from highest to lowest vote
				.sorted((o1, o2) -> Card.COMPARATOR.reversed().compare(o1.getVote().getCard(), o2.getVote().getCard()))
				.toList();

		if (membersWithCardValues.isEmpty()) {
			return new VoteSummary(0.0, 0.0, NOOP_CARD, NOOP_CARD, Set.of(), NOOP_CARD, Set.of());
		}

		double total = 0;

		Card max = null;
		Card min = null;

		for (RoomMember member : membersWithCardValues) {
			final Card card = member.getVote().getCard();
			total += card.getValue();

			if (max == null || card.getValue() > max.getValue()) {
				max = card;
			}
			if (min == null || card.getValue() < min.getValue()) {
				min = card;
			}
		}

		double averageValue = total / membersWithCardValues.size();

		double varianceSum = 0;

		final Set<RoomMember> minVoters = new HashSet<>(room.getMembers().size());
		final Set<RoomMember> maxVoters = new HashSet<>(room.getMembers().size());

		Card nearestCard = null;
		double nearestCardDiff = Double.MAX_VALUE;

		for (RoomMember member : membersWithCardValues) {
			final Card card = member.getVote().getCard();
			if (card.equals(max)) {
				maxVoters.add(member);
			}
			if (card.equals(min)) {
				minVoters.add(member);
			}

			double diff = Math.abs(card.getValue() - averageValue);
			if (diff < nearestCardDiff) {
				nearestCardDiff = diff;
				nearestCard = card;
			}

			// https://stackoverflow.com/a/43675683
			varianceSum += Math.pow(card.getValue() - averageValue, 2);
		}

		double variance = varianceSum / membersWithCardValues.size();

		return new VoteSummary(averageValue, variance, nearestCard, max, maxVoters, min, minVoters);
	}
}
