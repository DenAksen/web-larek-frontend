import { AppEvents } from '../../types';
import { createElement, ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';

export class Page {
	rootElement: HTMLElement;
	galleryContainer: HTMLElement;
	basketButton: HTMLButtonElement;
	basketCount: HTMLElement;
	galleryList: HTMLElement;
	constructor(protected events: IEvents) {
		this.rootElement = document.body;
		this.galleryContainer = ensureElement('.gallery', this.rootElement);
		// this.galleryList = this.galleryContainer.appendChild(createElement('ul'));
		this.basketButton = ensureElement<HTMLButtonElement>(
			'.header__basket',
			this.rootElement
		);
		this.basketCount = ensureElement(
			'.header__basket-counter',
			this.rootElement
		);
	}

	render(
		basketCount: number,
		elementOrElements: HTMLElement | HTMLElement[]
	): void {
		if (Array.isArray(elementOrElements)) {
			// Обработка массива элементов
			elementOrElements.forEach((element) => {
				this.renderSingle(element);
			});
		} else {
			// Обработка одиночного элемента
			this.renderSingle(elementOrElements);
		}
		this.renderBasketCount(basketCount);
		this.basketButton.addEventListener('click', () => {
			this.events.emit(AppEvents.BasketOpen);
		});
	}

	renderSingle(element: HTMLElement): void {
		this.galleryContainer.appendChild(element);
	}

	renderBasketCount(count: number): void {
		this.basketCount.textContent = String(count);
	}
}
