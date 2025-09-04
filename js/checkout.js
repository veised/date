// Проверка авторизации
function checkAuth() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    alert('Для оформления заказа нужно войти в аккаунт');
    location.href = 'login.html';
    return null;
  }
  return JSON.parse(currentUser);
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];
const currentUser = checkAuth();
let total = 0;

const orderItemsContainer = document.getElementById('order-items');
const orderTotalElement = document.getElementById('order-total');
const deliveryForm = document.getElementById('delivery-form');
const successMessage = document.getElementById('success-message');
const orderNumberElement = document.getElementById('order-number');

function displayOrderItems() {
  start('displayOrderItems');
  orderItemsContainer.innerHTML = '';

  if (cart.length === 0) {
    orderItemsContainer.innerHTML = '<p>Корзина пуста.</p>';
    document.querySelector('.btn-checkout').disabled = true;
    return;
  }

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const itemElement = document.createElement('div');
    itemElement.className = 'cart-item';
    itemElement.innerHTML = `
      <div class="cart-item-info">
        <img src="${item.image.trim()}" alt="${item.name}" width="50" />
        <div>
          <h3>${item.name}</h3>
          <p>${item.price} ₽ × ${item.quantity} шт.</p>
        </div>
      </div>
      <div class="cart-item-price">
        <strong>${itemTotal} ₽</strong>
      </div>
    `;
    orderItemsContainer.appendChild(itemElement);
  });

  orderTotalElement.innerHTML = `Итого: <strong>${total} ₽</strong>`;
  end('displayOrderItems');
}

function fillUserData() {
  const addressInput = document.getElementById('address');
  if (currentUser.address && !addressInput.value) {
    addressInput.value = currentUser.address;
  }
}

deliveryForm.addEventListener('submit', function(e) {
  e.preventDefault();

  const address = document.getElementById('address').value;
  const payment = document.getElementById('payment').value;
  const comment = document.getElementById('comment').value;

  const order = {
    id: Date.now(),
    userId: currentUser.id,
    items: cart,
    total: total,
    address: address,
    payment: payment,
    comment: comment,
    status: 1, // Принят
    date: new Date().toISOString() // ISO формат
  };

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  orders.push(order);
  localStorage.setItem('orders', JSON.stringify(orders));

  localStorage.removeItem('cart');
  cart = [];

  orderNumberElement.textContent = order.id;
  successMessage.style.display = 'block';
  deliveryForm.style.display = 'none';
  orderTotalElement.style.display = 'none';
});

displayOrderItems();
fillUserData();