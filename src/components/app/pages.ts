import { Component } from "../base/component";
import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";
import { IPage } from "../../types";


export class Page extends Component<IPage> {
	protected _counter: HTMLElement;
	protected _catalog: HTMLElement;
	protected _wrapper: HTMLElement;
	protected _basket: HTMLButtonElement;
	private _basketClickHandler: () => void;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		// Hеобходимые элементы страницы
		this._counter = ensureElement<HTMLElement>('.header__basket-counter');
		this._catalog = ensureElement<HTMLElement>('.gallery');
		this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
		this._basket = ensureElement<HTMLButtonElement>('.header__basket');

		this._basketClickHandler = this._handleBasketClick.bind(this);

		this._basket.addEventListener('click', this._basketClickHandler);
	}

	
	// Обработчик клика по кнопке корзины
	private _handleBasketClick(): void {
		this.events.emit('basket:open');
	}

	set counter(value: number) {
		this.setText(this._counter, String(value));
	}

	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}

	set locked(value: boolean) {
		this._wrapper.classList.toggle('page__wrapper_locked', value);
	}

	public destroy(): void {
		// Удаляем обработчик события при уничтожении компонента
		this._basket.removeEventListener('click', this._basketClickHandler);
	}
}