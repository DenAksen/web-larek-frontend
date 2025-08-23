export type ProductCategory =
	| 'другое'
	| 'софт-скил'
	| 'хард-скил'
	| 'кнопка'
	| 'дополнительное';

export interface IProduct {
	id: string;
	title: string;
	description: string;
	price: number;
	category: ProductCategory;
	image: string;
}

export interface IOrderResult {
	id: string | string[];
	total: number;
}

export type OrderPayment = "card" | "cash";

export interface IOrder {
    payment: OrderPayment,
    email: string,
    phone: string,
    address: string,
    total: number,
    items: string[]
}

export enum AppEvents {
  BasketOpen = 'modal:open-basket',
  CardSelect = 'card:select',
  CardAddBasket = 'card:add-basket',
  BasketChanged = 'basket:changed',
  BasketDeleteItem = 'basket:delete-item',
  BasketSubmit = 'basket:order',
  FormOrderSubmit = 'formOrder:submit',
  FormContactSubmit = 'formContact:submit',
  OrderSuccessSubmit = 'orderSuccess:submit',
  ModalOpen = 'modal:open',
  ModalClose = 'modal:close',
  ButtonChoosing = 'form:buttonPayment-choosing',
  FormOrderIsValid = 'valid:formOrder-isValid',
  FormOrderIsNoValid = 'valid:formOrder-noValid',
  FormOrderInputAddressToValidation = 'form:inputAddressValue-validation',
  FormContactInputsToValidation = 'form:inputsValue-validation',
  FormContactIsValid = 'valid:formOrder-isValid',
  FormContactIsNoValid = 'valid:formOrder-noValid'
}