import { AppEvents, IProduct } from '../../types';
import { ensureElement, cloneTemplate } from '../../utils/utils';
import { IEvents } from '../base/events';

export class CardPreview {
	templatePreview: HTMLTemplateElement;
	buttonBuyText: string = 'В корзину';

	constructor(protected events: IEvents) {
		this.templatePreview = ensureElement<HTMLTemplateElement>('#card-preview');
	}

	toggleButtonBuyText(): void {
		this.buttonBuyText === 'В корзину'
			? (this.buttonBuyText = 'Убрать из корзины')
			: (this.buttonBuyText = 'В корзину');
	}

	renderPreviewCardItem(
		data: IProduct,
		isInBasket: boolean = false
	): HTMLElement {
		const template: HTMLTemplateElement = cloneTemplate(this.templatePreview);
		const cardCategory: HTMLElement = template.querySelector('.card__category');
		const cardTitle: HTMLElement = template.querySelector('.card__title');
		const cardImage: HTMLImageElement = template.querySelector('.card__image');
		const cardPrice: HTMLElement = template.querySelector('.card__price');
		const cardText: HTMLElement = template.querySelector('.card__text');
		const cardButtonAddBasket: HTMLButtonElement =
			template.querySelector('.card__button');
		isInBasket
			? (this.buttonBuyText = 'Убрать из корзины')
			: (this.buttonBuyText = 'В корзину');

		cardCategory.textContent = data.category;
		cardTitle.textContent = data.title;
		cardPrice.textContent =
			data.price === null ? 'Бесценно' : `${String(data.price)} синапсов`;
		cardImage.src = data.image;
		cardImage.alt = data.title;
		cardText.textContent = data.description;
		cardButtonAddBasket.textContent = this.buttonBuyText;
		if (!(data.price === null)) {
			cardButtonAddBasket.addEventListener('click', () => {
				this.toggleButtonBuyText();
				cardButtonAddBasket.textContent = this.buttonBuyText;
				this.events.emit(AppEvents.CardAddBasket, {
					id: data.id,
				});
			});
		} else {
			cardButtonAddBasket.disabled = true;
		}

		return template;
	}
}
