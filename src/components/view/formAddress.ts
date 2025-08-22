import { AppEvents } from '../../types';
import { cloneTemplate, ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';
import { Form } from '../base/form';

interface IValidateContact {
	email: boolean;
	phone: boolean;
}

interface IOrderContact {
	email: string;
	phone: string;
}

export class FormContact extends Form {
	protected formElement: HTMLFormElement;
	protected buttonSubmit: HTMLButtonElement;
	protected errorValidationText: HTMLSpanElement;
	protected inputEmail: HTMLInputElement;
	protected inputPhone: HTMLInputElement;
	static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	static phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,20}$/;
	protected formIsValidate: IValidateContact = {
		email: false,
		phone: false,
	};

	constructor(events: IEvents) {
		super(events);
		this.formElement = cloneTemplate(
			ensureElement<HTMLTemplateElement>('#contacts')
		);
		this.buttonSubmit = ensureElement<HTMLButtonElement>(
			'.button',
			this.formElement
		);
		this.buttonSubmit.addEventListener('click', (e) => {
			e.preventDefault();
			this.events.emit(AppEvents.FormContactSubmit);
		});
		this.errorValidationText = ensureElement<HTMLSpanElement>(
			'.form__errors',
			this.formElement
		);

		this.inputEmail = ensureElement<HTMLInputElement>(
			'input[name="email"]',
			this.formElement
		);
		this.inputEmail.addEventListener('input', () => {
			this.validateEmail();
		});

		this.inputPhone = ensureElement<HTMLInputElement>(
			'input[name="phone"]',
			this.formElement
		);
		this.inputPhone.addEventListener('input', () => {
			this.validatePhone();
		});
	}

	validateEmail() {
		const email = this.inputEmail.value.trim();
		const isValidRegExp = FormContact.emailRegex.test(email);
		const isValidLength = this.inputEmail.value.length > 10;
		let errorMessage = '';
		this.formIsValidate.email = isValidRegExp && isValidLength;

		if (!isValidLength) {
			errorMessage = 'Email должен состоять не менее чем из 10 символов';
			this.inputEmail.style.outlineColor = '#ff0000ff';
		} else if (!isValidRegExp) {
			errorMessage = 'Введите корректный email';
			this.inputEmail.style.outlineColor = '#ff0000ff';
		} else {
			this.inputEmail.style.outlineColor = '';
		}

		this.errorValidationShow = errorMessage.trim();
		this.toggleButtonState();

		return isValidRegExp && isValidLength;
	}

	isAllFieldsTrue(): boolean {
		return Object.values(this.formIsValidate).every((value) => value === true);
	}

	toggleButtonState(): void {
		this.isAllFieldsTrue()
			? (this.buttonSubmit.disabled = false)
			: (this.buttonSubmit.disabled = true);
	}

	validatePhone() {
		const phone = this.inputPhone.value.trim();

		if (!phone) {
			this.errorValidationShow = 'Введите номер телефона';
			this.inputPhone.style.outlineColor = '#ff0000ff';
			return false;
		}

		const isValidRegExp = FormContact.phoneRegex.test(phone);
		let errorMessage = '';
		this.formIsValidate.phone = isValidRegExp;

		if (!isValidRegExp) {
			errorMessage = 'Введите корректный номер';
			this.inputPhone.style.outlineColor = '#ff0000ff';
		} else {
			this.inputPhone.style.outlineColor = '';
		}

		this.errorValidationShow = errorMessage.trim();
		this.toggleButtonState();

		return isValidRegExp;
	}

	getInputData(): IOrderContact {
		return {
			email: this.inputEmail.value,
			phone: this.inputPhone.value,
		};
	}

	render(): HTMLElement {
		return this.formElement;
	}
}
