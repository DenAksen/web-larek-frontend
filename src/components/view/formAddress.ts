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
			this.validateEmitInputs(this.inputEmail.value, this.inputPhone.value);
		});

		this.inputPhone = ensureElement<HTMLInputElement>(
			'input[name="phone"]',
			this.formElement
		);
		this.inputPhone.addEventListener('input', () => {
			this.validateEmitInputs(this.inputEmail.value, this.inputPhone.value);
		});
	}

	private validateEmitInputs(
		valueInputEmail: string,
		valueInputPhone: string
	): void {
		this.events.emit(AppEvents.FormContactInputsToValidation, {
			valueInputEmail,
			valueInputPhone,
		});
	}

	toggleValidationStyle(emailCheck: boolean, phoneCheck: boolean): void {
		if (!emailCheck) {
			this.inputEmail.style.borderColor = '#ff0000ff';
		} else {
			this.inputEmail.style.borderColor = '';
		}

		if (!phoneCheck) {
			this.inputPhone.style.borderColor = '#ff0000ff';
		} else {
			this.inputPhone.style.borderColor = '';
		}

		emailCheck && phoneCheck
			? (this.buttonSubmit.disabled = false)
			: (this.buttonSubmit.disabled = true);
	}

	clearForm() {
		this.inputEmail.value = '';
		this.inputPhone.value = '';
		this.buttonSubmit.disabled = true;
	}

	render(): HTMLElement {
		this.clearForm();
		return this.formElement;
	}
}
