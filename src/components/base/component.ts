// Базовый компонент

export abstract class Component<T> {
	protected constructor(protected readonly container: HTMLElement) {
	}

	// Переключить класс
	toggleClass(element: HTMLElement, className: string, force?: boolean) {
		element.classList.toggle(className, force);
	}

	// Установить текстовое содержимое
	protected setText(element: HTMLElement, value: string | undefined) {
		if (!value) return;
		element.textContent = value;
	}

	// Сменить статус блокировки
	setDisabled(element: HTMLElement, state: boolean) {
		if (element) {
			if (state) element.setAttribute('disabled', 'disabled');
			else element.removeAttribute('disabled');
		}
	}

	// Скрыть
	protected setHidden(element: HTMLElement) {
		element.style.display = 'none';
	}

	// Показать
	protected setVisible(element: HTMLElement) {
		element.style.removeProperty('display');
	}

	// Установить изображение с альтернативным текстом
	protected setImage(imageElement: HTMLImageElement, src: string | undefined, alt?: string) {
		if(!src) return;
		imageElement.src = src;
		imageElement.alt =  alt;
	}

	// Вернуть корневой DOM-элемент
	render(data?: Partial<T>): HTMLElement {
		Object.assign(this as object, data ?? {});
		return this.container;
	}
}