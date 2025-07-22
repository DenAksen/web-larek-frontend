import { Component } from '../base/component';
import { ensureElement } from '../../utils/utils';
import { IOrderSuccessState, ISuccessActions } from '../../types';

export class OrderSuccess extends Component<IOrderSuccessState> {
	private readonly _title: HTMLElement;
	private readonly _description: HTMLElement;
	private readonly _closeButton: HTMLButtonElement;

	constructor(
		container: HTMLElement,
		private readonly actions: ISuccessActions
	) {
		super(container);

		this._title = ensureElement<HTMLElement>(
			'.order-success__title',
			this.container
		);
		this._description = ensureElement<HTMLElement>(
			'.order-success__description',
			this.container
		);
		this._closeButton = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.container
		);

		// Привязываем обработчик к кнопке закрытия
		this._closeButton.addEventListener('click', this.handleCloseClick);
	}

	// Обработчик клика по кнопке закрытия
	private handleCloseClick = (): void => {
		this.actions.onClick();
	};

	// Отрисовывает компонент по переданному состоянию
	render(state: IOrderSuccessState): HTMLElement {
		this.setText(this._title, state.title);

		const amountText = `Списано ${state.amount} синапсов`;
		this.setText(this._description, amountText);

		return this.container;
	}
}
