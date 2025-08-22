import { AppEvents } from '../../types';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';

export class Modal {
	modal: HTMLElement;
	modalButtonClose: HTMLButtonElement;
	modalContainer: HTMLElement;
	modalContent: HTMLElement;
	public modalOpen: boolean = false;
	constructor(protected events: IEvents) {
		this.modal = ensureElement('#modal-container');
		this.modalContainer = ensureElement('.modal__container', this.modal);
		this.modalButtonClose = ensureElement<HTMLButtonElement>(
			'.modal__close',
			this.modal
		);
		this.modalContent = ensureElement('.modal__content', this.modal);

		this.modal.addEventListener('click', this.handleClose);
		this.modalContent.addEventListener('click', this.handlePropagation);
		this.modalButtonClose.addEventListener('click', this.handleClose);
	}

	clearModal(): void {
		this.modalContent.replaceChildren();
	}

	private handlePropagation = (event: Event): void => {
		event.stopPropagation();
	};

	private handleClose = (): void => {
		this.close();
	};

	close(): void {
		this.modal.classList.remove('modal_active');
		this.clearModal();
		this.events.emit(AppEvents.ModalClose);
		this.modalOpen = false;
	}

	open(): void {
		this.modal.classList.add('modal_active');
		this.events.emit(AppEvents.ModalOpen);
		this.modalOpen = true;
	}

	render(content: HTMLElement): HTMLElement {
		this.modalContent.replaceChildren(content);
		if (!this.modalOpen) {
			this.open();
		}
		return this.modal;
	}
}
