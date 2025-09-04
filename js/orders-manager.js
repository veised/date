// Проверка менеджера
function checkManager() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    alert('Доступ запрещён. Войдите в аккаунт.');
    location.href = 'login.html';
    return null;
  }

  const user = JSON.parse(currentUser);
  if (user.role !== 'manager') {
    alert('У вас нет прав для просмотра этой страницы.');
    location.href = 'index.html';
    return null;
  }

  return user;
}

const currentUser = checkManager();
if (!currentUser) throw new Error('Доступ запрещён');

// Статусы заказов
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

// Получение пользователя по ID
function getUserById(userId) {
  const users = JSON.parse(localStorage.getItem('db_users')) || [];
  return users.find(u => u.id === userId);
}

// Отображение всех заказов
function displayOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const container = document.getElementById('orders-list');
  const totalOrders = document.getElementById('total-orders');
  totalOrders.textContent = orders.length;

  container.innerHTML = '';

  if (orders.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666; margin: 2rem;">Пока нет заказов.</p>';
    return;
  }

  // Сортировка: новые сверху
  orders.sort((a, b) => new Date(b.date) - new Date(a.date));

  orders.forEach(order => {
    const user = getUserById(order.userId);
    const userName = user ? user.name : 'Неизвестный';

    const orderElement = document.createElement('div');
    orderElement.className = 'order-card';
    orderElement.innerHTML = `
      <div class="order-info">
        <div>
          <strong>Заказ №${order.id}</strong>
          <span class="order-date">${new Date(order.date).toLocaleString("ru-RU")}</span><br>
          <small>Клиент: ${userName}</small><br>
          <small>Сумма: ${order.total} ₽</small>
        </div>
      </div>

      <div class="order-items">
        ${order.items.slice(0, 3).map(i => `${i.quantity}× ${i.name}`).join(', ')}
        ${order.items.length > 3 ? '...' : ''}
      </div>

      <div class="order-status">
        <select class="status-select" data-id="${order.id}" 
                style="background: ${statusColors[order.status] || '#ddd'};">
          ${Object.entries(statusLabels).map(([key, label]) => 
            `<option value="${key}" ${order.status == key ? 'selected' : ''}>${label}</option>`
          ).join('')}
        </select>
      </div>

      <div class="order-actions">
        <button onclick="showOrderDetails(${order.id})" class="btn-details">Детали</button>
      </div>
    `;
    container.appendChild(orderElement);
  });

  // Обработчик изменения статуса
  document.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', function() {
      const orderId = this.dataset.id;
      const newStatus = Number(this.value);

      const orders = JSON.parse(localStorage.getItem('orders')) || [];
      const order = orders.find(o => o.id == orderId);

      if (order) {
        order.status = newStatus;
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Обновляем цвет
        this.style.backgroundColor = statusColors[newStatus];
        
        // Показываем уведомление
        showNotification(`Статус заказа №${orderId} изменён на "${statusLabels[newStatus]}"`);
      }
    });
  });
}

// Показ деталей заказа
window.showOrderDetails = function(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.id == orderId);
  if (!order) return;

  const user = getUserById(order.userId);
  const userName = user ? user.name : 'Неизвестный';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Заказ №${orderId}</h2>
      <p><strong>Дата:</strong> ${new Date(order.date).toLocaleString("ru-RU")}</p>
      <p><strong>Статус:</strong> 
        <span style="color: ${statusColors[order.status]};">${statusLabels[order.status]}</span>
      </p>
      <p><strong>Клиент:</strong> ${userName}</p>
      <p><strong>Оплата:</strong> ${order.payment === 'card' ? 'Картой' : 'Наличными'}</p>
      <p><strong>Адрес:</strong> ${order.address}</p>
      <p><strong>Комментарий:</strong> ${order.comment || '—'}</p>

      <h3>Товары:</h3>
      <div class="items-list">
        ${order.items.map(item => `
          <div class="item-line">
            <span>${item.quantity}× ${item.name}</span>
            <span>— ${item.price * item.quantity} ₽</span>
          </div>
        `).join('')}
      </div>

      <div class="modal-footer">
        <button onclick="this.closest('.modal').remove()" class="btn-close">Закрыть</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

// Показ уведомления
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