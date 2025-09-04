// Проверка роли курьера
function checkCourier() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    alert('Доступ запрещён. Войдите в аккаунт.');
    location.href = 'login.html';
    return null;
  }

  const user = JSON.parse(currentUser);
  if (user.role !== 'courier') {
    alert('У вас нет прав для просмотра этой страницы.');
    location.href = 'index.html';
    return null;
  }

  return user;
}

const currentUser = checkCourier();
if (!currentUser) throw new Error('Доступ запрещён');

// Статусы
const statusLabels = {
  1: "Принят",
  2: "Готовим",
  3: "В пути",
  4: "Закрыт"
};

const statusColors = {
  1: "#ffcc00",
  2: "#ffa500",
  3: "#1e90ff",
  4: "#4CAF50"
};

// Отображение всех заказов по категориям
function displayOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];

  // Добавляем courierId, если заказ взял курьер
  let updated = false;
  orders.forEach(order => {
    if (order.status === 3 && !order.courierId) {
      order.courierId = currentUser.id;
      updated = true;
    }
  });
  if (updated) {
    localStorage.setItem('orders', JSON.stringify(orders));
  }

  // Фильтруем
  const availableOrders = orders.filter(o => (o.status === 1 || o.status === 2));
  const myOrders = orders.filter(o => o.status === 3 && o.courierId === currentUser.id);
  const closedOrders = orders.filter(o => o.status === 4 && o.courierId === currentUser.id);

  // Обновляем счётчики
  document.getElementById('available-count').textContent = availableOrders.length;
  document.getElementById('my-orders-count').textContent = myOrders.length;
  document.getElementById('closed-count').textContent = closedOrders.length;

  // Очищаем контейнеры
  document.getElementById('available-orders').innerHTML = '';
  document.getElementById('my-orders').innerHTML = '';
  document.getElementById('closed-orders').innerHTML = '';

  // 1. Можно взять
  if (availableOrders.length === 0) {
    document.getElementById('available-orders').innerHTML = '<p>Нет доступных заказов.</p>';
  } else {
    availableOrders.sort((a, b) => new Date(a.date) - new Date(b.date));
    renderOrders(availableOrders, 'available-orders', 'takeOrder');
  }

  // 2. В пути
  if (myOrders.length === 0) {
    document.getElementById('my-orders').innerHTML = '<p>У вас нет активных заказов.</p>';
  } else {
    myOrders.sort((a, b) => new Date(a.date) - new Date(b.date));
    renderOrders(myOrders, 'my-orders', 'deliverOrder');
  }

  // 3. Закрытые
  if (closedOrders.length === 0) {
    document.getElementById('closed-orders').innerHTML = '<p>Нет завершённых заказов.</p>';
  } else {
    closedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderOrders(closedOrders, 'closed-orders', null);
  }
}

// Рендер заказов
function renderOrders(orders, containerId, action) {
  const container = document.getElementById(containerId);
  const user = getUserById(currentUser.id);

  orders.forEach(order => {
    const client = getUserById(order.userId);
    const clientName = client ? client.name : 'Неизвестный';

    const orderElement = document.createElement('div');
    orderElement.className = 'order-card';
    orderElement.innerHTML = `
      <div class="order-info">
        <div>
          <strong>Заказ №${order.id}</strong>
          <span class="order-date">${new Date(order.date).toLocaleString("ru-RU")}</span><br>
          <small>Клиент: ${clientName}</small><br>
          <small>Сумма: ${order.total} ₽</small>
        </div>
      </div>

      <div class="order-items">
        ${order.items.slice(0, 2).map(i => `${i.quantity}× ${i.name}`).join(', ')}
        ${order.items.length > 2 ? '...' : ''}
      </div>

      <div class="order-status">
        <span style="
          background: ${statusColors[order.status]};
          color: white;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
        ">
          ${statusLabels[order.status]}
        </span>
      </div>

      <div class="order-actions">
        ${action === 'takeOrder' ? 
          `<button onclick="takeOrder(${order.id})" class="btn-take">Взять заказ</button>` : 
          action === 'deliverOrder' ? 
          `<button onclick="deliverOrder(${order.id})" class="btn-deliver">Доставлен</button>` : 
          ''}
      </div>
    `;
    container.appendChild(orderElement);
  });
}

// Взять заказ
function takeOrder(orderId) {
  if (!confirm('Вы уверены, что хотите взять этот заказ?')) return;

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.id == orderId);

  if (order && (order.status === 1 || order.status === 2)) {
    order.status = 3;
    order.courierId = currentUser.id;
    localStorage.setItem('orders', JSON.stringify(orders));
    
    showNotification(`Вы взяли заказ №${orderId}. Статус: "В пути"`);
    displayOrders();
  } else {
    alert('Заказ уже в пути или закрыт');
  }
}

// Доставить заказ
function deliverOrder(orderId) {
  if (!confirm('Вы подтверждаете доставку этого заказа?')) return;

  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.id == orderId);

  if (order && order.status === 3 && order.courierId === currentUser.id) {
    order.status = 4;
    localStorage.setItem('orders', JSON.stringify(orders));
    
    showNotification(`Заказ №${orderId} доставлен и закрыт`);
    displayOrders();
  } else {
    alert('Невозможно закрыть заказ');
  }
}

// Получить пользователя
function getUserById(userId) {
  const users = JSON.parse(localStorage.getItem('db_users')) || [];
  return users.find(u => u.id === userId);
}

// Уведомление
function showNotification(message) {
  const notif = document.createElement('div');
  notif.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    font-size: 0.95rem;
    animation: slideIn 0.3s ease, fadeOut 0.5s ease 2.5s forwards;
  `;
  notif.textContent = message;
  document.body.appendChild(notif);

  setTimeout(() => {
    if (notif.parentNode) notif.remove();
  }, 3000);
}

// Запуск
displayOrders();