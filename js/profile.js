// Проверка авторизации
function checkAuth() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    alert('Для доступа в личный кабинет нужно войти');
    location.href = 'login.html';
    return null;
  }
  return JSON.parse(currentUser);
}

const user = checkAuth();
if (!user) throw new Error('Неавторизован');

// Отображаем данные
document.getElementById('user-name').textContent = user.name || '—';
document.getElementById('user-email').textContent = user.email;
document.getElementById('user-phone').textContent = user.phone || '—';
document.getElementById('user-address').textContent = user.address || '—';

// Кнопка редактирования
const editBtn = document.getElementById('edit-btn');
editBtn.addEventListener('click', function() {
  document.getElementById('edit-name').value = user.name || '';
  document.getElementById('edit-phone').value = user.phone || '';
  document.getElementById('edit-address').value = user.address || '';
  document.getElementById('profile-info').style.display = 'none';
  document.getElementById('edit-btn').style.display = 'none';
  document.getElementById('edit-form-section').style.display = 'block';
});

// Отмена редактирования
window.cancelEdit = function() {
  document.getElementById('edit-form-section').style.display = 'none';
  document.getElementById('profile-info').style.display = 'block';
  document.getElementById('edit-btn').style.display = 'block';
};

// Сохранение изменений
document.getElementById('edit-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const updatedUser = {
    ...user,
    name: document.getElementById('edit-name').value.trim(),
    phone: document.getElementById('edit-phone').value.trim(),
    address: document.getElementById('edit-address').value.trim()
  };

  // Обновляем в localStorage
  localStorage.setItem('currentUser', JSON.stringify(updatedUser));

  // Обновляем в списке пользователей
  const users = JSON.parse(localStorage.getItem('db_users')) || [];
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem('db_users', JSON.stringify(users));
  }

  // Обновляем отображение
  document.getElementById('user-name').textContent = updatedUser.name;
  document.getElementById('user-phone').textContent = updatedUser.phone || '—';
  document.getElementById('user-address').textContent = updatedUser.address || '—';

  cancelEdit();
  showNotification('Данные успешно обновлены!');
});

// Показ истории заказов
function displayOrders() {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const container = document.getElementById('orders-list');

  // Фильтруем только свои заказы
  const userOrders = orders.filter(order => order.userId === user.id);

  if (userOrders.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #666; margin: 2rem;">У вас пока нет заказов.</p>';
    return;
  }

  // Сортируем по дате (новые сверху)
  userOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

  userOrders.forEach(order => {
    const orderElement = document.createElement('div');
    orderElement.className = 'order-card';
    orderElement.innerHTML = `
      <div class="order-info">
        <div>
          <strong>Заказ №${order.id}</strong>
          <span class="order-date">${new Date(order.date).toLocaleString("ru-RU")}</span><br>
          <small>Сумма: ${order.total} ₽</small>
        </div>
      </div>

      <div class="order-items">
        ${order.items.slice(0, 3).map(i => `${i.quantity}× ${i.name}`).join(', ')}
        ${order.items.length > 3 ? '...' : ''}
      </div>

      <div class="order-status">
        <span style="
          background: ${statusColors[order.status] || '#ddd'};
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
        <button onclick="showOrderDetails(${order.id})" class="btn-details">Детали</button>
      </div>
    `;
    container.appendChild(orderElement);
  });
}

// Показ деталей заказа
window.showOrderDetails = function(orderId) {
  const orders = JSON.parse(localStorage.getItem('orders')) || [];
  const order = orders.find(o => o.id == orderId);
  if (!order) return;

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h2>Заказ №${orderId}</h2>
      <p><strong>Дата:</strong> ${new Date(order.date).toLocaleString("ru-RU")}</p>
      <p><strong>Статус:</strong> 
        <span style="color: ${statusColors[order.status]};">${statusLabels[order.status]}</span>
      </p>
      <p><strong>Оплата:</strong> ${order.payment === 'card' ? 'Картой' : 'Наличными'}</p>
      <p><strong>Адрес доставки:</strong> ${order.address}</p>
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

// Глобальные переменные (для совместимости)
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