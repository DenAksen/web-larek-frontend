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
	private payType: PayMethod = undefined;

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
		this.inputAddress.addEventListener('input', () => this.validateForm());
		this.inputAddress.addEventListener('blur', () => this.validateForm());

		this.buttonPayOnline = ensureElement<HTMLButtonElement>(
			'button[name="card"]',
			this.formElement
		);
		this.buttonPayOnline.addEventListener('click', () => {
			this.handleButtonPayClick(this.buttonPayOnline);
		});
		this.buttonPayOffline = ensureElement<HTMLButtonElement>(
			'button[name="cash"]',
			this.formElement
		);
		this.buttonPayOffline.addEventListener('click', () => {
			this.handleButtonPayClick(this.buttonPayOffline);
		});
	}

	protected handleButtonPayClick(button: HTMLButtonElement): void {
		this.buttonPayOnline.classList.remove('button_alt-active');
		this.buttonPayOffline.classList.remove('button_alt-active');
		if (button.getAttribute('name') === 'card') {
			this.buttonPayOnline.classList.add('button_alt-active');
			this.payType = 'card';
		} else {
			this.buttonPayOffline.classList.add('button_alt-active');
			this.payType = 'cash';
		}
		this.validateForm();
	}

	protected validateForm(): boolean {
		const isPaymentSelected = this.payType !== undefined;
		const isAddressValid = this.inputAddress.value.trim().length >= 10;

		let errorMessage = '';

		if (!isPaymentSelected) {
			errorMessage = 'Выберите способ оплаты.';
		}

		if (!isAddressValid) {
			errorMessage = 'Адрес должен содержать не менее 10 символов. ';
		}

		this.errorValidationShow = errorMessage.trim();

		this.buttonSubmit.disabled = !(isPaymentSelected && isAddressValid);

		return isPaymentSelected && isAddressValid;
	}

	getInputData(): IOrderAddress {
		return {
			payment: this.payType,
			address: this.inputAddress.value,
		};
	}

	clearForm(): void {
		this.payType = undefined;
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
