import { IEvents } from '../base/events';

export abstract class Form {
	protected abstract formElement: HTMLFormElement;
	protected abstract buttonSubmit: HTMLButtonElement;
	protected abstract errorValidationText: HTMLSpanElement;

	constructor(protected events: IEvents) {}

	set errorValidationShow(text: string) {
		this.errorValidationText.textContent = text;
	}

	errorValidationClear(): void {
		this.errorValidationText.textContent = '';
	}

	toggleSubmith(): void {
		this.buttonSubmit.disabled === true
			? (this.buttonSubmit.disabled = false)
			: (this.buttonSubmit.disabled = true);
	}

	abstract clearForm(): void;

	abstract render(): HTMLElement;
}
