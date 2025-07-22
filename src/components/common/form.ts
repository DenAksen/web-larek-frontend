import { Component } from '../base/component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';
import { FormFields, IFormState } from '../../types';

export class Form<T extends FormFields> extends Component<IFormState> {
	// Кнопка отправки формы
	protected _submit: HTMLButtonElement;

	 // Элемент для отображения ошибок формы
	protected _errors: HTMLElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._submit = ensureElement<HTMLButtonElement>(
			'button[type=submit]',
			this.container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);

		this.container.addEventListener('input', this.handleInput);
		this.container.addEventListener('submit', this.handleSubmit);
	}

	// Обработчик события ввода в поля формы

	private handleInput = (e: Event): void => {
		const target = e.target as HTMLInputElement;
		if (target.name) {
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		}
	};

	// Обработчик события отправки формы
	private handleSubmit = (e: Event): void => {
		e.preventDefault();
		this.events.emit(`${this.container.name}:submit`);
	};

	// Метод, вызываемый при изменении значения в поле формы
	protected onInputChange(field: keyof T, value: string): void {
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	// Устанавливает состояние доступности кнопки отправки формы
	set valid(value: boolean) {
		this._submit.disabled = !value;
	}

	// Устанавливает текст сообщения об ошибках
	set errors(value: string) {
		this.setText(this._errors, value);
	}

	// Рендерит форму на основе переданного состояния
	render(state: Partial<T> & IFormState): HTMLFormElement {
		const { valid, errors, ...inputs } = state;

		if (valid !== undefined) {
			this.valid = valid;
		}

		if (errors !== undefined) {
			this.errors = errors.join(', ');
		}

		if (Object.keys(inputs).length > 0) {
			Object.assign(this, inputs);
		}

		return this.container;
	}
}