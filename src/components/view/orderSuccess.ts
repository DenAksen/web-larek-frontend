import { AppEvents } from '../../types';
import { cloneTemplate, ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';

export class OrderSuccess {
	protected templateOrderSuccess: HTMLTemplateElement;
	protected _totalPrice: number;

	constructor(protected events: IEvents) {
		this.templateOrderSuccess = ensureElement<HTMLTemplateElement>('#success');
	}

	set totalPrice(price: number) {
		this._totalPrice = price;
	}

	render(): HTMLElement {
		const template: HTMLTemplateElement = cloneTemplate(
			this.templateOrderSuccess
		);
		const priceContainer: HTMLSpanElement = ensureElement(
			'.order-success__description',
			template
		);
		const button: HTMLButtonElement = ensureElement<HTMLButtonElement>(
			'.button',
			template
		);
		button.addEventListener('click', (e) => {
			e.preventDefault();
			this.events.emit(AppEvents.OrderSuccessSubmit);
		});
		priceContainer.textContent = `${String(this._totalPrice)} синапсов`;
		return template;
	}
}
