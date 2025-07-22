import { Component } from '../base/component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';
import { IModalData } from '../../types';

export class Modal extends Component<IModalData> {
	private readonly _closeButton: HTMLButtonElement;
	private readonly _content: HTMLElement;
	private _isOpen = false;

	constructor(container: HTMLElement, protected readonly events: IEvents) {
		super(container);

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this._content = ensureElement<HTMLElement>('.modal__content', container);

		// Привязка обработчиков событий
		this._closeButton.addEventListener('click', this.handleClose);
		this.container.addEventListener('click', this.handleClose);
		this._content.addEventListener('click', this.handleContentClick);
	}

	// Устанавливает содержимое модального окна
	set content(value: HTMLElement | null) {
		this._content.replaceChildren(value || '');
	}

	// Возвращает состояние открытия модального окна
	get isOpen(): boolean {
		return this._isOpen;
	}

	// Обработчик клика по кнопке закрытия или оверлею
	private handleClose = (): void => {
		this.close();
	};

	// Обработчик клика по содержимому модального окна
	private handleContentClick = (event: Event): void => {
		event.stopPropagation();
	};

	// Открывает модальное окно
	public open(): void {
		this.container.classList.add('modal_active');
		this._isOpen = true;
		this.events.emit('modal:open');
	}

	// Закрывает модальное окно и очищает его содержимое
	public close(): void {
		this.container.classList.remove('modal_active');
		this.content = null;
		this._isOpen = false;
		this.events.emit('modal:close');
	}

	// Рендерит модальное окно с заданными данными и открывает его
	render(data: IModalData): HTMLElement {
		super.render(data);
		this.open();
		return this.container;
	}
}
