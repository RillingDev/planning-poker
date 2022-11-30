package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.data.*;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SummaryService {
	public VoteSummary getVoteSummary(Room room) {
		final List<RoomMember> members = room.getMembers().stream().sorted(RoomMember.COMPARATOR).toList();

		double total = 0;
		int voteValueCount = 0;

		Card max = null;
		Card min = null;

		for (RoomMember member : members) {
			final Vote vote = member.getVote();
			if (vote != null && vote.getCard().getValue() != null) {
				final Card card = vote.getCard();
				voteValueCount++;
				total += card.getValue();

				if (max == null || card.getValue() > max.getValue()) {
					max = card;
				}
				if (min == null || card.getValue() < min.getValue()) {
					min = card;
				}
			}
		}

		double averageValue = total / voteValueCount;

		final Set<RoomMember> minVoters = new HashSet<>(room.getMembers().size());
		final Set<RoomMember> maxVoters = new HashSet<>(room.getMembers().size());

		Card nearestCard = null;
		double nearestCardDiff = Double.MAX_VALUE;

		for (RoomMember member : members) {
			final Vote vote = member.getVote();
			if (vote != null && vote.getCard().getValue() != null) {
				final Card card = vote.getCard();
				if (card.equals(max)) {
					maxVoters.add(member);
				}
				if (card.equals(min)) {
					minVoters.add(member);
				}

				// TODO: ensure consistent handling of cards with same diff
				double diff = Math.abs(card.getValue() - averageValue);
				if (diff < nearestCardDiff) {
					nearestCardDiff = diff;
					nearestCard = card;
				}
			}
		}
		// TODO: 'varianz'
		return new VoteSummary(averageValue, nearestCard, max, maxVoters, min, minVoters, null);
	}
}
