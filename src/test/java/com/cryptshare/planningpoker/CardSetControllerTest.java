package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.entities.Card;
import com.cryptshare.planningpoker.entities.CardSet;
import com.cryptshare.planningpoker.entities.CardSetRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = CardSetController.class, excludeAutoConfiguration = { SecurityAutoConfiguration.class })
class CardSetControllerTest {

	@MockBean
	CardSetRepository cardSetRepository;

	@Autowired
	MockMvc mockMvc;

	@Test
	void getReturnsCardSets() throws Exception {
		final CardSet cardSet1 = new CardSet("My Set 1");
		cardSet1.getCards().add(new Card("Coffee", 0.0));
		cardSet1.getCards().add(new Card("1", 1.0));
		cardSet1.getCards().add(new Card("?", null));
		final CardSet cardSet2 = new CardSet("My Set 2");
		given(cardSetRepository.findAll()).willReturn(List.of(cardSet1, cardSet2));

		mockMvc.perform(get("/api/card-sets"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0].name").value("My Set 1"))
				.andExpect(jsonPath("$[0].cards.length()").value(3))
				.andExpect(jsonPath("$[0].cards[0].name").value("Coffee"))
				.andExpect(jsonPath("$[0].cards[0].value").value(0.0))
				.andExpect(jsonPath("$[0].cards[1].name").value("1"))
				.andExpect(jsonPath("$[0].cards[1].value").value(1.0))
				.andExpect(jsonPath("$[0].cards[2].name").value("?"))
				.andExpect(jsonPath("$[0].cards[2].value").value((Double) null))
				.andExpect(jsonPath("$[1].name").value("My Set 2"))
				.andExpect(jsonPath("$[1].cards.length()").value(0));
	}
}