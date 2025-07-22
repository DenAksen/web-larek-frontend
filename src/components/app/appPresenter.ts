import { IProduct, IOrderAddressFormState, IOrderContactFormState, ValidationResult, PaymentMethod, IAppTemplates } from "../../types";
import { CDN_URL, API_URL } from "../../utils/constants";
import { ensureElement, cloneTemplate } from "../../utils/utils";
import { EventEmitter } from "../base/events";
import { Basket } from "../common/basket";
import { Modal } from "../common/modal";
import { OrderSuccess } from "../common/orderSuccess";
import { OrderAddressForm } from "./addressForm";
import { CatalogItemCard, DetailCard, BasketCard } from "./card";
import { ClientAPI } from "./clientApi";
import { OrderContactForm } from "./contactForm";
import { AppModel } from "./modelData";
import { Page } from "./pages";

enum AppEvents {
    ItemsChanged = 'items:changed',
    CardSelect = 'card:select',
    BasketOpen = 'basket:open',
    BasketChanged = 'basket:changed',
    BasketClick = 'basket:click',
    BasketCheckout = 'basket:checkout',
    OrderOpen = 'order:open',
    OrderAddressSubmit = 'orderAddress:submit',
    OrderContactSubmit = 'orderContact:submit',
    OrderSubmit = 'order:submit',
    ModalOpen = 'modal:open',
    ModalClose = 'modal:close',
    OrderContactValidationResult = 'order:contact:validate',
    OrderAddressValidationErrors = 'order:address:validate',
}

export class AppPresenter {
    private events: EventEmitter;
    private api: ClientAPI;
    private appData: AppModel;
    private page: Page;
    private modal: Modal;
    private basket: Basket;
    private orderContactForm: OrderContactForm;
    private orderAddressForm: OrderAddressForm;

    private templates: IAppTemplates;

    constructor(templates: IAppTemplates) {
        this.templates = templates;
        this.events = new EventEmitter();
        this.api = new ClientAPI(CDN_URL, API_URL);
        this.appData = new AppModel({}, this.events);
        
    }

    init() {
        this.page = new Page(document.body, this.events);
        this.modal = new Modal(ensureElement<HTMLElement>('#modal-container'), this.events);
        this.basket = new Basket(cloneTemplate(this.templates.basket), this.events);
        
        this.orderContactForm = new OrderContactForm(cloneTemplate(this.templates.orderContact), this.events);
        this.orderContactForm.init();
        
        this.orderAddressForm = new OrderAddressForm(cloneTemplate(this.templates.orderAddress), this.events);
        this.orderAddressForm.init();
        
        this.registerEventHandlers();
        this.initApp();
    }

    private registerEventHandlers(): void {
        this.events.on('order:reset', () => {
            this.orderAddressForm.reset();
            this.orderContactForm.reset();
        });
        
        this.events.on<IProduct[]>(AppEvents.ItemsChanged, () => this.handleItemsChanged());
        this.events.on<IProduct>(AppEvents.CardSelect, (item) => this.handleCardSelect(item));
        this.events.on(AppEvents.BasketOpen, () => this.handleBasketOpen());
        this.events.on(AppEvents.BasketChanged, () => this.handleBasketChanged());
        
        this.events.on(AppEvents.OrderOpen, () => {
            const currentPayment = this.appData.order?.payment || '';
            const currentAddress = this.appData.order?.address || '';

            if (currentPayment) this.appData.setOrderField('payment', currentPayment);
            if (currentAddress) this.appData.setOrderField('address', currentAddress);

            const isValid = this.appData.validateOrderAddress();
            const addressErrors = [
                this.appData.formErrors.address, 
                this.appData.formErrors.payment
            ].filter(Boolean) as string[];

            this.orderAddressForm.reset();

            this.modal.render({
                content: this.orderAddressForm.render({
                    payment: currentPayment,
                    address: currentAddress,
                    valid: isValid,
                    errors: addressErrors
                }),
            });
        });

        this.events.on<IOrderAddressFormState>(AppEvents.OrderAddressSubmit, (formData) => 
            this.handleOrderAddressSubmit(formData));
        
        this.events.on<IOrderContactFormState>(AppEvents.OrderContactSubmit, (formData) => 
            this.handleOrderContactSubmit(formData));
        
        this.events.on<ValidationResult>(AppEvents.OrderAddressValidationErrors, (validationResult) => {
            if (!validationResult.valid && validationResult.errors.length > 0) {
                this.orderAddressForm.showErrors(validationResult.errors);
            }
        });
        
        this.events.on<ValidationResult>(AppEvents.OrderContactValidationResult, (validationResult) => {
            if (!validationResult.valid && validationResult.errors.length > 0) {
                this.orderContactForm.showErrors(validationResult.errors);
            }
        });

        this.events.on(AppEvents.ModalOpen, () => (this.page.locked = true));
        this.events.on(AppEvents.ModalClose, () => {
            this.page.locked = false;
            this.orderAddressForm.reset();
            this.orderContactForm.reset();
        });
    }

    private handleItemsChanged(): void {
        try {
            if (!this.appData.catalog || this.appData.catalog.length === 0) {
                console.log('Каталог пуст или не загружен');
                this.page.catalog = [];
                return;
            }
            
            const catalogItems = this.appData.catalog.map((item) => {
                try {
                    const card = new CatalogItemCard(cloneTemplate(this.templates.cardCatalog), {
                        onClick: () => this.events.emit(AppEvents.CardSelect, item),
                    });
                    
                    let isInCart = false;
                    try {
                        isInCart = this.appData.isInBasket(item.id);
                    } catch (e) {
                        console.error(`Ошибка при проверке товара ${item.id} в корзине:`, e);
                    }
                    
                    return card.render({
                        id: item.id,
                        title: item.title,
                        image: item.image,
                        description: item.description,
                        price: item.price,
                        category: item.category,
                        isInCart: isInCart,
                    });
                } catch (cardError) {
                    console.error(`Ошибка при создании карточки для товара ${item.id}:`, cardError);
                    return null;
                }
            }).filter(item => item !== null) as HTMLElement[];
            
            this.page.catalog = catalogItems;
        } catch (error) {
            console.error('Критическая ошибка при обновлении каталога:', error);
            this.page.catalog = [];
        }
    }

private handleCardSelect(item: IProduct): void {
    const card = new DetailCard(cloneTemplate(this.templates.cardPreview), {
        onClick: () => {
            this.appData.toggleBasketItem(item.id);
            this.events.emit(AppEvents.BasketChanged);
            card.updateButton(this.appData.isInBasket(item.id));
        },
    });
    
    this.modal.render({
        content: card.render({
            id: item.id,
            title: item.title,
            image: item.image,
            description: item.description,
            price: item.price,
            category: item.category,
            isInCart: this.appData.isInBasket(item.id),
        }),
    });
}

    private handleBasketOpen(): void {
        const basketItems = this.appData.getBasketItems();
        
        if (!this.appData.order) {
            this.appData.order = {
                payment: '',
                address: '',
                email: '',
                phone: '',
                items: basketItems.map(item => item.id),
            };
        } else {
            this.appData.order.items = basketItems.map(item => item.id);
        }
        
        console.log('Заказ после открытия корзины:', {...this.appData.order});

        this.modal.render({
            content: this.basket.render({
                items: basketItems.map((item, index) =>
                    new BasketCard(cloneTemplate(this.templates.cardBasket), {
                        onRemove: () => {
                            this.appData.toggleBasketItem(item.id);
                            this.events.emit(AppEvents.BasketChanged);
                                    if (this.modal.isOpen) {
            this.events.emit(AppEvents.BasketOpen);
        }
                        },
                    }).render({
                        id: item.id,
                        title: item.title,
                        image: item.image,
                        description: item.description,
                        price: item.price,
                        category: item.category,
                        isInCart: true,
                        index: index + 1,
                    })
                ),
                total: this.appData.getTotal(),
            }),
        });
    }

    private handleBasketChanged(): void {
        this.page.counter = this.appData.getBasketItems().length;
        this.events.emit(AppEvents.ItemsChanged);
    }

    private handleOrderAddressSubmit(formData: IOrderAddressFormState): void {
        this.appData.setOrderField('payment', formData.payment);
        this.appData.setOrderField('address', formData.address);

        if (this.appData.validateOrderAddress()) {
            this.orderContactForm.reset();

            const currentEmail = this.appData.order.email || '';
            const currentPhone = this.appData.order.phone || '';
            
            let isContactValid = true;
            let contactErrors: string[] = [];
            
            if (currentEmail || currentPhone) {
                isContactValid = this.appData.validateOrderContact();
                contactErrors = [
                    this.appData.formErrors.email,
                    this.appData.formErrors.phone
                ].filter(Boolean) as string[];
            }

            this.modal.render({
                content: this.orderContactForm.render({
                    email: currentEmail,
                    phone: currentPhone,
                    valid: isContactValid,
                    errors: contactErrors
                }),
            });
        }
    }

    private handleOrderContactSubmit(formData: IOrderContactFormState): void {
        this.appData.setOrderField('email', formData.email);
        this.appData.setOrderField('phone', formData.phone);
        
        if (this.appData.validateOrderContact()) {
            this.api.getProductList()
                .then(freshProducts => {
                    const basketItems = this.appData.getBasketItems();
                    
                    if (basketItems.length === 0) {
                        console.error('Корзина пуста. Оформление заказа невозможно.');
                        return;
                    }
                    
                    const productPriceMap: Record<string, number> = {};
                    freshProducts.forEach(product => {
                        productPriceMap[product.id] = product.price;
                    });
                    
                    const validBasketItems = basketItems.filter(item => 
                        Object.prototype.hasOwnProperty.call(productPriceMap, item.id)
                    );
                    
                    if (validBasketItems.length < basketItems.length) {
                        console.warn('Некоторые товары больше недоступны и были исключены из заказа');
                        this.appData.basket = validBasketItems.map(item => item.id);
                        this.events.emit(AppEvents.BasketChanged);
                        
                        if (validBasketItems.length === 0) {
                            console.error('В корзине не осталось доступных товаров');
                            this.modal.close();
                            alert('Все товары в вашей корзине стали недоступны. Пожалуйста, выберите другие товары.');
                            return;
                        }
                    }
                    
                    const actualTotal = validBasketItems.reduce(
                        (sum, item) => sum + productPriceMap[item.id], 
                        0
                    );
                    
                    const finalOrder = {
                        payment: this.appData.order.payment as PaymentMethod,
                        address: this.appData.order.address || '',
                        email: this.appData.order.email || '',
                        phone: this.appData.order.phone || '',
                        items: validBasketItems.map(item => item.id),
                        total: actualTotal
                    };

                    if (!this.appData.validateOrder()) {
                        console.error('Заказ не прошел валидацию:', this.appData.formErrors);
                        return;
                    }

                    this.api.orderProducts(finalOrder)
                        .then((result) => {
                            console.log('Успешный ответ сервера:', result);
                            
                            const success = new OrderSuccess(cloneTemplate(this.templates.success), {
                                onClick: () => {
                                    this.modal.close();
                                    this.appData.clearBasket();
                                    this.appData.resetOrder();
                                    this.basket.reset();
                                    this.events.emit(AppEvents.BasketChanged);
                                    this.events.emit(AppEvents.ItemsChanged);
                                },
                            });
                            
                            this.modal.render({
                                content: success.render({
                                    title: 'Заказ успешно оформлен',
                                    amount: `${result.total}`,
                                }),
                            });
                        })
                        .catch((error) => {
                            console.error('Ошибка при оформлении заказа:', error);
                            
                            if (error.message && error.message.includes('не продается')) {
                                alert('К сожалению, один из товаров в корзине больше недоступен. Страница будет обновлена для получения актуальных данных.');
                                window.location.reload();
                            } else if (error.message && error.message.includes('Неверная сумма')) {
                                alert('Цена на один или несколько товаров изменилась. Пожалуйста, переоформите заказ.');
                                window.location.reload();
                            } else {
                                alert('Произошла ошибка при оформлении заказа. Пожалуйста, попробуйте позже.');
                            }
                        });
                })
                .catch(error => {
                    console.error('Ошибка при обновлении списка товаров:', error);
                    alert('Не удалось проверить актуальность товаров. Пожалуйста, обновите страницу и попробуйте снова.');
                });
        }
    }

    private initApp(): void {
        this.appData.basket = this.appData.basket || [];
        
        this.api.getProductList()
            .then((products) => {
                if (Array.isArray(products) && products.length > 0) {
                    this.appData.setCatalog(products);
                } else {
                    throw new Error('Получен пустой список товаров');
                }
            })
            .catch((error) => {
                console.error('Ошибка при загрузке товаров:', error);
                this.appData.setCatalog([]);
            });
    }
}