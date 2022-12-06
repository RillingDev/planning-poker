package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.data.*;
import org.springframework.stereotype.Service;

import java.util.Comparator;
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
				.sorted(Comparator.comparing(RoomMember::getVote))
				.toList();

		if (membersWithCardValues.isEmpty()) {
			return new VoteSummary(0.0, 0, NOOP_CARD, NOOP_CARD, Set.of(), NOOP_CARD, Set.of());
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

		final Set<RoomMember> minVoters = new HashSet<>(room.getMembers().size() / 2);
		final Set<RoomMember> maxVoters = new HashSet<>(room.getMembers().size() / 2);
		for (RoomMember member : membersWithCardValues) {
			final Card card = member.getVote().getCard();
			if (card.equals(max)) {
				maxVoters.add(member);
			}
			if (card.equals(min)) {
				minVoters.add(member);
			}
		}

		Card nearestCard = null;
		double nearestCardDiff = Double.MAX_VALUE;
		// Due to the ordering, cards with the same difference will be 'rounded' up
		for (Card card : getOrderedCardsWithValues(room.getCardSet(), false)) {
			double diff = Math.abs(card.getValue() - averageValue);
			if (diff < nearestCardDiff) {
				nearestCardDiff = diff;
				nearestCard = card;
			}
		}

		final List<Card> orderedCardsAsc = getOrderedCardsWithValues(room.getCardSet(), true);
		int offset = orderedCardsAsc.indexOf(max) - orderedCardsAsc.indexOf(min);

		return new VoteSummary(averageValue, offset, nearestCard, max, maxVoters, min, minVoters);
	}

	private static List<Card> getOrderedCardsWithValues(CardSet cardSet, boolean asc) {
		Comparator<Card> comparator = Comparator.comparing(Card::getValue);
		if (asc) {
			comparator = comparator.reversed();
		}
		comparator = comparator.thenComparing(Card::isBasicNumeric).reversed();
		return cardSet.getCards().stream().filter(card -> card.getValue() != null).sorted(comparator).toList();
	}
}
