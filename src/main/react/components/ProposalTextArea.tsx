import { ChangeEvent, FC, useId, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useDebounce, useErrorHandler } from "../hooks";
import { ErrorPanel } from "./ErrorPanel";

export interface Suggestion {
	readonly content: string;
	readonly key: string;
}

export const ProposalTextArea: FC<{
	value: string;
	loadProposals: (value: string) => Promise<Suggestion[]>;
	onChange: (value: string) => void;
}> = ({value, loadProposals, onChange}) => {
	const [error, handleError, resetError] = useErrorHandler();

	const [currentValue, setCurrentValue] = useState(value);

	const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

	const suggestionsId = useId();

	const updateSuggestions = useDebounce((newValue: string) => {
		loadProposals(newValue).then(setSuggestions).catch(handleError);
	}, 500);
	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value;
		setCurrentValue(newValue);
		onChange(newValue);
		updateSuggestions(newValue);
	};

	function handleSuggestionClick(suggestion: Suggestion) {
		const newValue = suggestion.content;
		setCurrentValue(newValue);
		onChange(newValue);
		setSuggestions([]);
	}

	return (<>
		<Form.Control as="textarea" value={currentValue} onChange={handleChange} aria-autocomplete="list" role="textbox" aria-controls={suggestionsId}/>

		<div className="mt-3" hidden={suggestions.length == 0} aria-live="polite">
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