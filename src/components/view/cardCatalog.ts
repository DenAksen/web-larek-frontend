import { AppEvents, IProduct } from '../../types';
import { ensureElement, cloneTemplate } from '../../utils/utils';
import { IEvents } from '../base/events';

export class CardCatalog {
	templateGallery: HTMLTemplateElement;

	constructor(protected events: IEvents) {
		this.templateGallery = ensureElement<HTMLTemplateElement>('#card-catalog');
	}

	renderCatalogCardItem(data: IProduct): HTMLElement {
		const template: HTMLTemplateElement = cloneTemplate(this.templateGallery);
		const cardCategory: HTMLElement = template.querySelector('.card__category');
		const cardTitle: HTMLElement = template.querySelector('.card__title');
		const cardImage: HTMLImageElement = template.querySelector('.card__image');
		const cardPrice: HTMLElement = template.querySelector('.card__price');

		cardCategory.textContent = data.category;
		cardTitle.textContent = data.title;
		cardPrice.textContent =
			data.price === null ? 'Бесценно' : `${String(data.price)} синапсов`;
		cardImage.src = data.image;
		cardImage.alt = data.title;
		if (template) {
			template.addEventListener('click', () => {
				this.events.emit(AppEvents.CardSelect, {
					id: data.id,
				});
			});
		}
		return template;
	}
}
