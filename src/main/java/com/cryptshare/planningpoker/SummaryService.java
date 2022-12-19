package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.data.Card;
import com.cryptshare.planningpoker.data.CardSet;
import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SummaryService {

	/**
	 * Calculates a rooms voting statistic.
	 *
	 * @param room Room to check.
	 * @return Summary, or empty if not applicable (e.g. because no votes with value were made).
	 */
	public Optional<VoteSummary> summarize(Room room) {
		if (room.getVotingState() == Room.VotingState.OPEN) {
			return Optional.empty();
		}

		// Keep only members with votes that have values to it.
		// Subsequent IDE warnings regarding null-pointers are not valid due to this.
		final List<RoomMember> membersWithCardValues = room.getMembers()
				.stream()
				.filter(roomMember -> roomMember.getVote() != null && roomMember.getVote().getValue() != null)
				.sorted(Comparator.comparing(RoomMember::getVote))
				.toList();

		if (membersWithCardValues.isEmpty()) {
			return Optional.empty();
		}

		double total = 0;
		Card max = null;
		Card min = null;
		for (RoomMember member : membersWithCardValues) {
			final Card card = member.getVote();
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
			final Card card = member.getVote();
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

		return Optional.of(new VoteSummary(averageValue, offset, nearestCard, max, maxVoters, min, minVoters));
	}

	private static List<Card> getOrderedCardsWithValues(CardSet cardSet, boolean asc) {
		Comparator<Card> comparator = Comparator.comparing(Card::getValue);
		if (asc) {
			comparator = comparator.reversed();
		}
		comparator = comparator.thenComparing(Card::isBasicNumeric).reversed();
		return cardSet.getCards().stream().filter(card -> card.getValue() != null).sorted(comparator).toList();
	}

	public record VoteSummary(double average, int offset, Card nearestCard, Card highestVote,
							  Set<RoomMember> highestVoters, Card lowestVote, Set<RoomMember> lowestVoters) {
	}
}
