import { AppEvents, IProduct } from '../../types';
import { cloneTemplate, ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';

export class Basket {
	protected _totalPrice: number = 0;
	protected basketTemplate: HTMLTemplateElement;
	protected basketTemplateItem: HTMLTemplateElement;
	protected basketElement: HTMLElement;
	protected list: HTMLUListElement;
	protected button: HTMLButtonElement;
	protected price: HTMLSpanElement;

	constructor(protected events: IEvents) {
		this.basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
		this.basketTemplateItem =
			ensureElement<HTMLTemplateElement>('#card-basket');
		this.basketElement = cloneTemplate(this.basketTemplate);

		this.list = ensureElement<HTMLUListElement>(
			'.basket__list',
			this.basketElement
		);
		this.button = ensureElement<HTMLButtonElement>(
			'.button',
			this.basketElement
		);
		this.button.addEventListener('click', () => {
			this.events.emit(AppEvents.BasketSubmit);
		});

		this.price = ensureElement<HTMLSpanElement>(
			'.basket__price',
			this.basketElement
		);
		this.price.textContent = `${this.formatPrice(this._totalPrice)} синапсов`;
	}

	get totalPrice(): number {
		return this._totalPrice;
	}

	public createBasketItem(index: number, data: IProduct): HTMLLIElement {
		const basketItem: HTMLLIElement = cloneTemplate(this.basketTemplateItem);

		//порядковый номер
		const indexSpan = ensureElement<HTMLSpanElement>(
			'.basket__item-index',
			basketItem
		);
		indexSpan.textContent = String(index);

		// Название товара
		const titleSpan = ensureElement<HTMLSpanElement>(
			'.card__title',
			basketItem
		);
		titleSpan.textContent = data.title;

		// Цена
		const priceSpan = ensureElement<HTMLSpanElement>(
			'.card__price',
			basketItem
		);
		priceSpan.textContent = `${data.price} синапсов`;

		// Кнопка удаления
		const deleteButton = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			basketItem
		);
		deleteButton.addEventListener('click', () => {
			this.events.emit('basket:delete-item', {
				id: data.id,
			});
		});

		return basketItem;
	}

	protected formatPrice(price: number): string {
		return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	}

	clearBasketItems(): void {
		this.list.replaceChildren();
		this._totalPrice = 0;
		this.events.emit(AppEvents.BasketChanged);
	}

	BasketButtonDisabled(): void {
		this.button.disabled = true;
	}

	BasketButtonEnable(): void {
		this.button.disabled = false;
	}

	updateTotalPrice(newPrice: number): void {
		this.price.textContent = `${this.formatPrice(newPrice)} синапсов`;
	}

	render(data: IProduct[]): HTMLElement {
		this.clearBasketItems();
		data.forEach((item) => {
			this.list.append(this.createBasketItem(data.indexOf(item) + 1, item));
			this._totalPrice += item.price;
		});
		this.updateTotalPrice(this._totalPrice);
		return this.basketElement;
	}
}
