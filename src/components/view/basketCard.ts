import { AppEvents, IProduct } from '../../types';
import { cloneTemplate, ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';

export class BasketItem {
	protected basketTemplateItem: HTMLTemplateElement;
	constructor(protected events: IEvents) {
		this.basketTemplateItem =
			ensureElement<HTMLTemplateElement>('#card-basket');
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
}
