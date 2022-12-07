import { FC, useContext } from "react";
import { Form, Modal } from "react-bootstrap";
import { Room } from "../../api";
import { AppContext } from "../../AppContext";
import { useErrorHandler } from "../../hooks";
import { ErrorPanel } from "../ErrorPanel";


export const ExtensionRoomModal: FC<{
	room: Room;
	show: boolean;
	onHide: () => void;
	onChange: () => void;
}> = ({room, show, onHide, onChange}) => {
	const [error, handleError, resetError] = useErrorHandler();

	const {extensions} = useContext(AppContext);

	const roomExtensions = room.extensions;

	return (
		<Modal show={show} onHide={onHide}>
			<Modal.Header closeButton>
				<Modal.Title>Room &apos;{room.name}&apos; Extensions</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<ErrorPanel error={error} onClose={resetError}></ErrorPanel>
				<Form.Group className="mb-3">
					<fieldset>
						<legend className="h6">Extensions</legend>
						{extensions.map(extension =>
							<Form.Check inline key={extension.key} id={`extension-${extension.key}`} label={extension.label}/>
						)}
					</fieldset>
				</Form.Group>
			</Modal.Body>
		</Modal>
	);
};
