package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.data.Card;
import com.cryptshare.planningpoker.data.CardSet;
import com.cryptshare.planningpoker.data.Room;
import com.cryptshare.planningpoker.data.RoomMember;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SummaryService {

	/**
	 * Comparator for the order that cards should be picked as the summary result.
	 * A set of cards will end up as {@code [<high basic numeric card>, <high non-basic numeric card>, <low basic numeric card>]}.
	 * <p>
	 * Should only be used on collections where every card has a value.
	 *
	 * @see Card#NATURAL_COMPARATOR for the preferred <b>display</b> order.
	 */
	private static final Comparator<Card> PREFERRED_SUMMARY_COMPARATOR = Comparator.comparing(Card::getValue)
			.thenComparing(Card::isBasicNumeric)
			.reversed()
			.thenComparing(Card::getName);

	/**
	 * Calculates a rooms voting statistic.
	 *
	 * @param room Room to check.
	 * @return Summary, or empty if not applicable (e.g., because no votes with value were made).
	 */
	public Optional<VoteSummary> summarize(Room room) {
		if (room.getVotingState() == Room.VotingState.OPEN) {
			return Optional.empty();
		}

		// Keep only members with votes that have values to it.
		// Subsequent IDE warnings regarding null-pointers are not valid due to this.
		final List< Card> votesWithValues = room.getMembers()
				.stream()
				.map(RoomMember::getVote).filter(Objects::nonNull)
				.filter(vote -> vote.getValue() != null)
				.sorted(PREFERRED_SUMMARY_COMPARATOR) // Sort to prefer basic numeric when calculating highest/lowest in case of value being the same.
				.toList();

		if (votesWithValues.isEmpty()) {
			return Optional.empty();
		}

		double total = 0;
		Card highestCard = null;
		Card lowestCard = null;
		for (Card card : votesWithValues) {
			total += card.getValue();

			if (highestCard == null || card.getValue() > highestCard.getValue()) {
				highestCard = card;
			}
			if (lowestCard == null || card.getValue() < lowestCard.getValue()) {
				lowestCard = card;
			}
		}
		final double averageValue = total / votesWithValues.size();

		VoteExtreme highest = null;
		VoteExtreme lowest = null;
		// No need to show highest and lowest if they are the same
		if (lowestCard != highestCard) {
			highest = new VoteExtreme(highestCard, findMembersByCard(room.getMembers(), highestCard));
			lowest = new VoteExtreme(lowestCard, findMembersByCard(room.getMembers(), lowestCard));
		}

		final CardSet cardSet = room.getCardSet();

		final Double averageValueFormatted = cardSet.isShowAverageValue() ?
				roundToNDecimalPlaces(averageValue, cardSet.getRelevantDecimalPlaces()) :
				null;

		final Card nearestCard = cardSet.isShowNearestCard() ? findNearestCard(cardSet.getCards(), averageValue) : null;

		final int offset = getOffset(cardSet.getCards(), highestCard, lowestCard);

		return Optional.of(new VoteSummary(averageValueFormatted, nearestCard, highest, lowest, offset));
	}

	private static Set<RoomMember> findMembersByCard(Collection<RoomMember> members, Card card) {
		return members.stream().filter(roomMember -> card.equals(roomMember.getVote())).collect(Collectors.toUnmodifiableSet());
	}

	private double roundToNDecimalPlaces(double value, int n) {
		return BigDecimal.valueOf(value).setScale(n, RoundingMode.HALF_UP).doubleValue();
	}

	private static @Nullable Card findNearestCard(Set<Card> cards, double averageValue) {
		Card nearestCard = null;
		double nearestCardDiff = Double.POSITIVE_INFINITY;

		// Due to the ordering, cards with the same difference will be 'rounded' up
		for (Card card : cards.stream().filter(c -> c.getValue() != null).sorted(PREFERRED_SUMMARY_COMPARATOR).toList()) {
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

	/**
	 * @param average     The average vote value.
	 * @param nearestCard The nearest card in the card set based on the {@link #average}.
	 * @param highest     The highest vote.
	 * @param lowest      The lowest vote.
	 * @param offset      The offset between the position of the {@link #highest} and the {@link #lowest} card in the card set.
	 */
	public record VoteSummary(@Nullable Double average, @Nullable Card nearestCard, @Nullable VoteExtreme highest, @Nullable VoteExtreme lowest,
							  int offset) {
	}

	/**
	 * @param card    The card that was voted on.
	 * @param members The members that voted for this card.
	 */
	public record VoteExtreme(Card card, Set<RoomMember> members) {
	}
}
