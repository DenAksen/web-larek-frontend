import { Component } from '../base/component';
import { ensureElement } from '../../utils/utils';
import { IBasketCardData, ICard } from '../../types';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

interface IBasketCardActions {
	onRemove: (event: MouseEvent) => void;
}

// Базовый класс для карточек товаров с основными свойствами
export class BaseCard extends Component<ICard> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;

	constructor(container: HTMLElement) {
		super(container);
		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set price(value: number | null) {
		this.setText(
			this._price,
			value === null ? 'бесценно' : `${value} синапсов`
		);
	}

	render(data: ICard): HTMLElement {
		this.id = data.id;
		this.title = data.title;
		this.price = data.price;
		return this.container;
	}
}

// Карточка с детальной информацией о товаре
export class DetailCard extends BaseCard {
	protected _image: HTMLImageElement;
	protected _category: HTMLElement;
	protected _description: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);
		this._image = ensureElement<HTMLImageElement>('.card__image', container);
		this._category = ensureElement<HTMLElement>('.card__category', container);

		try {
			this._description = ensureElement<HTMLElement>('.card__text', container);
		} catch (e) {
			this._description = document.createElement('p');
			this._description.className = 'card__text';
		}

		this._button = ensureElement<HTMLButtonElement>('.card__button', container);

		if (actions?.onClick) {
			this._button.addEventListener('click', actions.onClick);
		}
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set category(value: string) {
		this.setText(this._category, value);
	}

	set description(value: string | string[]) {
		if (!this._description) return;

		if (Array.isArray(value)) {
			const newDescriptions = value.map((str) => {
				const descTemplate = this._description.cloneNode() as HTMLElement;
				this.setText(descTemplate, str);
				return descTemplate;
			});
			this._description.replaceWith(...newDescriptions);
		} else {
			this.setText(this._description, value);
		}
	}

	updateButton(isInCart: boolean) {
		if (this._button) {
			this._button.textContent = isInCart ? 'Убрать из корзины' : 'В корзину';
		}
	}

	render(data: ICard): HTMLElement {
		super.render(data);

		if (data.image) this.image = data.image;
		if (data.category) this.category = data.category;
		if (data.description) this.description = data.description;

		// Установка текста кнопки в зависимости от статуса корзины
		if (data.price === null) {
			this.setDisabled(this._button, true);
		} else if (data.isInCart !== undefined) {
			this.setText(
				this._button,
				data.isInCart ? 'Убрать из корзины' : 'В корзину'
			);
		}

		return this.container;
	}
}

// Карточка товара для каталога
export class CatalogItemCard extends BaseCard {
	protected _image: HTMLImageElement;
	protected _category: HTMLElement;
	protected _button?: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);
		this._image = ensureElement<HTMLImageElement>('.card__image', container);
		this._category = ensureElement<HTMLElement>('.card__category', container);

		try {
			this._button = ensureElement<HTMLButtonElement>(
				'.card__button',
				container
			);
			if (actions?.onClick) {
				this._button.addEventListener('click', actions.onClick);
			}
		} catch (e) {
			// Если кнопка не найдена, добавляем обработчик на весь контейнер
			if (actions?.onClick) {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set category(value: string) {
		this.setText(this._category, value);
	}

	render(data: ICard): HTMLElement {
		super.render(data);

		if (data.image) this.image = data.image;
		if (data.category) this.category = data.category;

		return this.container;
	}
}

// Карточка товара в корзине
export class BasketCard extends BaseCard {
	protected _index: HTMLElement;
	protected _deleteButton: HTMLButtonElement;

	constructor(container: HTMLElement, actions?: IBasketCardActions) {
		super(container);

		this._index = ensureElement<HTMLElement>('.basket__item-index', container);
		this._deleteButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			container
		);

		if (actions?.onRemove) {
			this._deleteButton.addEventListener('click', actions.onRemove);
		}
	}

	set index(value: number) {
		this.setText(this._index, value.toString());
	}

	set price(value: number | null) {
		this.setText(
			this._price,
			value === null ? 'бесценно' : `${value} синапсов`
		);
	}

	render(data: IBasketCardData): HTMLElement {
		super.render(data);
		this.index = data.index;
		return this.container;
	}
}
