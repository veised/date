// Загружаем корзину из localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Элементы DOM
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const emptyCartMessage = document.getElementById('empty-cart');
const checkoutBtn = document.getElementById('checkout-btn');

// Отображение товаров в корзине
function renderCart() {
  start('renderCart');  
  cartItemsContainer.innerHTML = '';
  
  if (cart.length === 0) {
    emptyCartMessage.style.display = 'block';
    cartTotalElement.style.display = 'none';
    checkoutBtn.style.display = 'none';
    return;
  }

  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.image}" alt="${item.name}" width="60" />
        <div>
          <h3>${item.name}</h3>
          <p>${item.price} ₽ × <span class="quantity">${item.quantity}</span> шт.</p>
        </div>
      </div>
      <div class="cart-item-controls">
        <button onclick="changeQuantity(${item.id}, -1)">−</button>
        <button onclick="changeQuantity(${item.id}, 1)">+</button>
        <button onclick="removeItem(${item.id})" class="btn-remove">✕</button>
      </div>
      <div class="cart-item-price">
        <strong>${itemTotal} ₽</strong>
      </div>
    `;
    cartItemsContainer.appendChild(itemElement);
  });

  cartTotalElement.innerHTML = `Общая сумма: <strong>${total} ₽</strong>`;
  end('renderCart');
}

// Изменение количества
function changeQuantity(id, delta) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity < 1) item.quantity = 1; // минимум 1
    saveCart();
    renderCart();
  }
}

// Удаление товара
function removeItem(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

// Сохранение в localStorage
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Запуск при загрузке
renderCart();