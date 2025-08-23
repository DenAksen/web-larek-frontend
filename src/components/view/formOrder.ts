import { AppEvents } from '../../types';
import { cloneTemplate, ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';
import { Form } from '../base/form';

type PayMethod = 'cash' | 'card' | undefined;

interface IOrderAddress {
	payment: PayMethod;
	address: string;
}

export class FormOrder extends Form {
	protected formElement: HTMLFormElement;
	protected buttonSubmit: HTMLButtonElement;
	protected errorValidationText: HTMLSpanElement;
	private buttonPayOnline: HTMLButtonElement;
	private buttonPayOffline: HTMLButtonElement;
	protected inputAddress: HTMLInputElement;
	protected paymentButtonContainer: HTMLElement;

	constructor(events: IEvents) {
		super(events);
		this.formElement = cloneTemplate(
			ensureElement<HTMLTemplateElement>('#order')
		);
		this.buttonSubmit = ensureElement<HTMLButtonElement>(
			'.order__button',
			this.formElement
		);
		this.buttonSubmit.addEventListener('click', (e) => {
			e.preventDefault();
			this.events.emit(AppEvents.FormOrderSubmit);
		});
		this.errorValidationText = ensureElement<HTMLSpanElement>(
			'.form__errors',
			this.formElement
		);
		this.inputAddress = ensureElement<HTMLInputElement>(
			'.form__input',
			this.formElement
		);
		this.inputAddress.minLength = 10;
		this.inputAddress.addEventListener('input', () =>
			this.validateEmitInputAddress(this.inputAddress.value)
		);
		this.inputAddress.addEventListener('blur', () =>
			this.validateEmitInputAddress(this.inputAddress.value)
		);

		this.buttonPayOnline = ensureElement<HTMLButtonElement>(
			'button[name="card"]',
			this.formElement
		);
		this.buttonPayOnline.addEventListener('click', () => {
			this.events.emit(AppEvents.ButtonChoosing, {
				payment: this.buttonPayOnline.getAttribute('name'),
			});
		});
		this.buttonPayOffline = ensureElement<HTMLButtonElement>(
			'button[name="cash"]',
			this.formElement
		);
		this.buttonPayOffline.addEventListener('click', (e: Event) => {
			this.events.emit(AppEvents.ButtonChoosing, {
				payment: this.buttonPayOffline.getAttribute('name'),
			});
		});
	}

	handleButtonPayChangeActive(nameButton: string): void {
		this.buttonPayOnline.classList.remove('button_alt-active');
		this.buttonPayOffline.classList.remove('button_alt-active');
		if (nameButton === 'card') {
			this.buttonPayOnline.classList.add('button_alt-active');
		} else if (nameButton === 'cash') {
			this.buttonPayOffline.classList.add('button_alt-active');
		} else {
			throw new Error('Непредвиденный тип оплаты');
		}
	}

	buttonSubmitChangeState(disable: boolean): void {
		this.buttonSubmit.disabled = disable;
	}

	private validateEmitInputAddress(valueInput: string): void {
		this.events.emit(AppEvents.FormOrderInputAddressToValidation, {
			value: valueInput,
		});
	}

	clearForm(): void {
		this.buttonPayOnline.classList.remove('button_alt-active');
		this.buttonPayOffline.classList.remove('button_alt-active');
		this.inputAddress.value = '';
		this.errorValidationClear();
		this.buttonSubmit.disabled = true;
	}

	render(): HTMLElement {
		this.clearForm();
		return this.formElement;
	}
}
