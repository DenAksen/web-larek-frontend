import './scss/styles.scss';

import { API_URL, CDN_URL, settings } from './utils/constants';
import { AppEvents, IOrder, IProduct, OrderPayment } from './types';
import { AppApi } from './components/model/appApi';
import { Page } from './components/view/page';
import { AppModel } from './components/model/appModel';
import { EventEmitter } from './components/base/events';
import { CardCatalog } from './components/view/cardCatalog';

import { Modal } from './components/view/modal';
import { Basket } from './components/view/basket';
import { FormOrder } from './components/view/formOrder';
import { FormContact } from './components/view/formAddress';
import { OrderSuccess } from './components/view/orderSuccess';
import { CardPreview } from './components/view/cardPreview';

const api = new AppApi(API_URL, CDN_URL);
const event = new EventEmitter();
const page = new Page(event);
const model = new AppModel(event);
const modal = new Modal(event);
const basket = new Basket(event);
const formOrder = new FormOrder(event);
const formContact = new FormContact(event);
const orderSuccess = new OrderSuccess(event);
const cardCatalog = new CardCatalog(event);
const cardPreview = new CardPreview(event);


async function init() {
	model.itemList = await api.getItemList().then((products) => {
		return products;
	});
	page.render(
		model.basketCount(),
		model.itemList.map((item) => {
			return cardCatalog.renderCatalogCardItem(item);
		})
	);
}
init();

event.on(AppEvents.BasketOpen, (): void => {
	modal.render(basket.render(model.getBasketItems()));
});

event.on(AppEvents.CardSelect, (payload: { id: string}) => {
	const { id } = payload;
	modal.render(
		cardPreview.renderPreviewCardItem(
			model.getItemById(payload.id),
			model.avilabilityInBasket(payload.id)
		)
	);
});

event.on(AppEvents.CardAddBasket, (payload: { id: string}) => {
	const { id} = payload;
	model.avilabilityInBasket(payload.id)
		? model.basketRemove(payload.id)
		: (model.basketAdd = payload.id);
});

event.on(AppEvents.BasketChanged, () => {
	page.renderBasketCount(model.basketCount());
	if (modal.modalOpen && modal.modal.querySelector('.basket')) {
		event.emit(AppEvents.BasketOpen);
	}
	model.basketCount() === 0
		? basket.BasketButtonDisabled()
		: basket.BasketButtonEnable();
});

event.on(AppEvents.BasketDeleteItem, (payload: { id: string }) => {
	const { id } = payload;
	model.basketRemove(payload.id);
	event.emit(AppEvents.BasketChanged);
});

event.on(AppEvents.BasketSubmit, () => {
	model.totalPrice = basket.totalPrice;
	modal.render(formOrder.render());
});

event.on(AppEvents.FormOrderSubmit, () => {
	modal.render(formContact.render());
	console.log(model.order) //Delete
});

event.on(AppEvents.FormContactSubmit, async () => {

	try {
		// Отправляем заказ
		const isSuccess = await handlePostOrder(model.getOrderData());

		if (isSuccess) {
			modal.render(orderSuccess.render());
		}
	} catch (error) {
		console.error('Ошибка при обработке заказа:', error);
	}
});

async function handlePostOrder(order: IOrder): Promise<boolean> {
	try {
		const result = await api.postOrder(order);
		orderSuccess.totalPrice = result.total;
		console.log('Заказ успешно создан:', result);
		return true;
	} catch (error) {
		console.error('Ошибка при создании заказа:', error);
		return false;
	}
}

event.on(AppEvents.OrderSuccessSubmit, () => {
	modal.close();
	model.clearBasket();
	basket.clearBasketItems();
});

event.on(AppEvents.ButtonChoosing, (payload: {payment: OrderPayment}) => {
	const { payment } = payload;
	model.orderPaymentType = payload.payment;
	formOrder.handleButtonPayChangeActive(payload.payment);
})

event.on(AppEvents.FormOrderIsValid, () => {
	formOrder.buttonSubmitChangeState(false);
})

event.on(AppEvents.FormOrderIsNoValid, () => {
	formOrder.buttonSubmitChangeState(true);
})

event.on(AppEvents.FormOrderInputAddressToValidation, (payload: {value: string}) => {
	const { value } = payload;
	formOrder.errorValidationShow = model.validateFormOrder(payload.value);
	model.validateCheckFormOrder();
});

event.on(AppEvents.ModalClose, () => {
	model.clearValidateFormCheck();
})

event.on(AppEvents.FormContactInputsToValidation, (payload: {valueInputEmail: string, valueInputPhone: string}) => {
	const { valueInputEmail, valueInputPhone} = payload;
	formContact.errorValidationShow = model.validateContact(payload.valueInputEmail, payload.valueInputPhone);
	formContact.toggleValidationStyle(model.validateFormCheck.email, model.validateFormCheck.phone);
});
