import { AppEvents, IProduct } from '../../types';
import { cloneTemplate, ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';

export class Basket {
	protected _totalPrice: number = 0;
	protected basketTemplate: HTMLTemplateElement;
	protected basketElement: HTMLElement;
	protected list: HTMLUListElement;
	protected button: HTMLButtonElement;
	protected price: HTMLSpanElement;

	constructor(protected events: IEvents) {
		this.basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
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

	protected formatPrice(price: number): string {
		return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	}

	clearBasketItems(): void {
		this.list.replaceChildren();
		this._totalPrice = 0;
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

	render(elements: HTMLElement[]): HTMLElement {
		this.clearBasketItems();
		elements.forEach((item) => {
			this.list.append(item);
			const priceText = ensureElement<HTMLSpanElement>(
				'.card__price',
				item
			).textContent;
			this._totalPrice += parseInt(priceText.match(/\d+/)?.[0] || '0', 10);
		});
		this.updateTotalPrice(this._totalPrice);
		return this.basketElement;
	}
}
