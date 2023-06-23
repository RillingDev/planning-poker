package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.data.Card;
import com.cryptshare.planningpoker.data.CardSet;
import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

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
				.sorted(Comparator.comparing(RoomMember::getVote, Card.NATURAL_COMPARATOR))
				.toList();

		if (membersWithCardValues.isEmpty()) {
			return Optional.empty();
		}

		double total = 0;
		Card highestCard = null;
		Card lowestCard = null;
		for (RoomMember member : membersWithCardValues) {
			final Card card = member.getVote();
			total += card.getValue();

			if (highestCard == null || card.getValue() > highestCard.getValue()) {
				highestCard = card;
			}
			if (lowestCard == null || card.getValue() < lowestCard.getValue()) {
				lowestCard = card;
			}
		}
		final double averageValue = total / membersWithCardValues.size();

		VoteExtreme highest = null;
		VoteExtreme lowest = null;
		// No need to show highest and lowest if they are the same
		if (lowestCard != highestCard) {
			highest = new VoteExtreme(highestCard, findMembersByCard(membersWithCardValues, highestCard));
			lowest = new VoteExtreme(lowestCard, findMembersByCard(membersWithCardValues, lowestCard));
		}

		final CardSet cardSet = room.getCardSet();

		final Double averageValueFormatted = cardSet.isShowAverageValue() ? roundToNDecimalPlaces(averageValue, cardSet.getRelevantDecimalPlaces()) : null;

		final Card nearestCard = cardSet.isShowNearestCard() ? findNearestCard(cardSet.getCards(), averageValue) : null;

		final int offset = getOffset(cardSet.getCards(), highestCard, lowestCard);

		return Optional.of(new VoteSummary(averageValueFormatted, nearestCard, highest, lowest, offset));
	}

	private static Set<RoomMember> findMembersByCard(Collection<RoomMember> membersWithCardValues, Card card) {
		return membersWithCardValues.stream().filter(roomMember -> roomMember.getVote().equals(card)).collect(Collectors.toUnmodifiableSet());
	}

	private double roundToNDecimalPlaces(double value, int n) {
		return BigDecimal.valueOf(value).setScale(n, RoundingMode.HALF_UP).doubleValue();
	}

	private static Card findNearestCard(Set<Card> cards, double averageValue) {
		Card nearestCard = null;
		double nearestCardDiff = Double.MAX_VALUE;

		// Due to the ordering, cards with the same difference will be 'rounded' up
		// E.g. a set of cards will end up as [<high basic numeric card>, <high non-basic numeric card>, <low basic numeric card>]
		Comparator<Card> descendingCardValuesComparator = Comparator.comparing(Card::getValue).thenComparing(Card::isBasicNumeric).reversed();
		for (Card card : cards.stream().filter(c -> c.getValue() != null).sorted(descendingCardValuesComparator).toList()) {
			double diff = Math.abs(card.getValue() - averageValue);
			if (diff < nearestCardDiff) {
				nearestCardDiff = diff;
				nearestCard = card;
			}
		}
		return nearestCard;
	}

	private static int getOffset(Set<Card> cards, Card highestCard, Card lowestCard) {
		final List<Double> ascendingDistinctValues = cards.stream().map(Card::getValue).filter(Objects::nonNull).distinct().sorted().toList();
		return ascendingDistinctValues.indexOf(highestCard.getValue()) - ascendingDistinctValues.indexOf(lowestCard.getValue());
	}

	public record VoteSummary(@Nullable Double average, @Nullable Card nearestCard, @Nullable VoteExtreme highest,
							  @Nullable VoteExtreme lowest, int offset) {
	}

	public record VoteExtreme(Card card, Set<RoomMember> members) {
	}
}
