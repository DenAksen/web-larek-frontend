import { Component } from '../base/component';
import { createElement, ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';
import { IBasketView } from '../../types/index';

export class Basket extends Component<IBasketView> {
	private _list: HTMLElement;
	private readonly _total: HTMLElement | null;
	private readonly _button: HTMLElement | null;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		// Инициализация элементов корзины
		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		// Привязка события к кнопке оформления заказа
		this._button?.addEventListener('click', this.handleOrderOpen);

		// Устанавливаем начальное состояние
		this.clear();
	}

	// Обработчик клика по кнопке оформления заказа
	private handleOrderOpen = (): void => {
		this.events.emit('order:open');
	};

	// Устанавливает элементы корзины и обновляет отображение
	set items(items: HTMLElement[]) {
		if (items.length > 0) {
			this._renderItems(items);
			this.setDisabled(this._button, false);
		} else {
			this.clear();
		}
	}

	// Отображает корзину с товарами и общей суммой
	render(state: IBasketView): HTMLElement {
		if (state.items.length > 0) {
			this._renderItems(state.items);
			this.setText(this._total, `${state.total} синапсов`);
			this.setDisabled(this._button, false);
		} else {
			this.clear();
		}
		return this.container;
	}

	// Отображает список товаров в корзине
	private _renderItems(items: HTMLElement[]): void {
		this._list.replaceChildren(...items);
	}

	// Очищает корзину и устанавливает пустое состояние
	private clear(): void {
		this._renderEmptyState();
		this.setDisabled(this._button, true);
		this.setText(this._total, `0 синапсов`);
	}

	// Отображает состояние пустой корзины
	private _renderEmptyState(): void {
		this._list.replaceChildren(
			createElement<HTMLParagraphElement>('p', {
				textContent: 'Корзина пуста',
			})
		);
	}

	// Сбрасывает состояние корзины в начальное (пустое)
	reset(): void {
		this.clear();
	}
}
