import { ChangeEvent, FC, useId, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { useDebounce, useErrorHandler } from "../hooks";
import { ErrorPanel } from "./ErrorPanel";

export interface Suggestion {
	readonly content: string;
	readonly key: string;
}

// TODO: integrate into new extension panel
export const ProposalTextArea: FC<{
	value: string;
	loadProposals: (value: string) => Promise<Suggestion[]>;
	onChange: (value: string) => void;
}> = ({value, loadProposals, onChange}) => {
	const [error, handleError, resetError] = useErrorHandler();

	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
	const [suggestionsLoading, setSuggestionsLoading] = useState(false);

	const suggestionsId = useId();

	const updateSuggestions = useDebounce((newValue: string) => {
		setSuggestionsLoading(true);
		loadProposals(newValue).then(setSuggestions).catch(handleError).finally(() => setSuggestionsLoading(false));
	}, 500);
	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		onChange(newValue);
		updateSuggestions(newValue);
	};

	function handleSuggestionClick(suggestion: Suggestion) {
		const newValue = suggestion.content;
		onChange(newValue);
		setSuggestions([]);
	}

	return (<>
		<Form.Control
			className="mb-3"
			as="textarea"
			value={value}
			onChange={handleChange}
			aria-autocomplete="list"
			role="textbox"
			aria-controls={suggestionsId}
		/>

		<Spinner
			hidden={!suggestionsLoading}
			animation="border"
			size="sm"
			role="status"
			aria-hidden="true">
			<span className="visually-hidden">Loading suggestions</span>
		</Spinner>

		<div hidden={suggestions.length == 0} aria-live="polite">
			<p className="mb-0">Suggestions:</p>
			<ul id={suggestionsId} role="listbox">
				{suggestions.map(suggestion => <li key={suggestion.key}>
					<Button type="button" variant="link" className="text-start" onClick={() => handleSuggestionClick(suggestion)}>
						{suggestion.content}
					</Button>
				</li>)}
			</ul>
		</div>

		<ErrorPanel error={error} onClose={resetError}/>
	</>);
};