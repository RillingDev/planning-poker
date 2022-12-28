import type { Extension } from "../Extension";
import { AhaSubmitButton } from "./AhaSubmitButton";

export const ahaExtension: Extension = {
	id: "aha",
	SubmitComponent: AhaSubmitButton,
};
