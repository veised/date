
function getUsers() {
  try {
    let users = [];
    const cached = localStorage.getItem('db_users');
    
    if (cached) {
      users = JSON.parse(cached);
    }
    
    // Системные пользователи, которые должны быть всегда
    const systemUsers = [
      {
        id: 2,
        email: "manager@shaurma.ru",
        password: "1234",
        name: "Админ Денис",
        phone: "+79990000000",
        address: "Офис",
        role: "manager"
      },
      {
      "id": 3,
      "email": "courier@shaurma.ru",
      "password": "1234",
      "name": "Алексей Курьеров",
      "phone": "+79998887766",
      "address": "Склад",
      "role": "courier"
      }
    ];
    
    // Добавляем системных пользователей, если их нет
    systemUsers.forEach(systemUser => {
      if (!users.some(u => u.email === systemUser.email)) {
        users.push(systemUser);
      }
    });
    
    // Сохраняем обновлённый список
    localStorage.setItem('db_users', JSON.stringify(users));
    
    return users;
    
  } catch (error) {
    console.error('Error loading users:', error);
    return [];
  }
}
// Сохранение пользователей в localStorage
function saveUsers(users) {
  // Не сохраняем системного менеджера повторно
  const usersToSave = users.filter(user => user.email !== "manager@shaurma.ru");
  localStorage.setItem('db_users', JSON.stringify(usersToSave));
}
// Проверка авторизации
function checkAuth() {
  const currentUser = localStorage.getItem('currentUser');
  return !!currentUser;
}
// Функция показа ошибки
function showError(msg) {
  const el = document.getElementById('error-message');
  el.textContent = msg;
  el.style.display = 'block';
}

document.getElementById('register-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const errorMessage = document.getElementById('error-message');
  errorMessage.style.display = 'none';

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (password !== confirmPassword) {
    showError('Пароли не совпадают');
    return;
  }

  const users = getUsers();
  if (users.some(u => u.email === email)) {
    showError('Пользователь с таким email уже существует');
    return;
  }

  const newUser = {
    id: Date.now(),
    email,
    password,
    name,
    phone,
    address,
    role: 'user'
  };

  users.push(newUser);
  saveUsers(users);

  alert('Регистрация успешна! Теперь вы можете войти.');
  location.href = 'login.html';
});

// Вход
document.getElementById('login-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const errorMessage = document.getElementById('error-message');
  errorMessage.style.display = 'none';

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const users = getUsers(); // ← Должна возвращать актуальных пользователей
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showError('Неверный email или пароль');
    return;
  }

  localStorage.setItem('currentUser', JSON.stringify(user));
  alert(`Добро пожаловать, ${user.name}!`);
  location.href = 'profile.html';
});


function logout() {
  if (confirm('Вы действительно хотите выйти?')) {
    localStorage.removeItem('currentUser');
    alert('Вы успешно вышли из аккаунта');
    location.href = 'index.html';
  }
}
window.addEventListener('load', function() {
  const currentUser = localStorage.getItem('currentUser');
  const nav = document.getElementById('main-nav') || document.querySelector('.nav');
  if (!nav) return;

  // Удаляем старые динамические ссылки
  const dynamicLinks = nav.querySelectorAll('.dynamic-link');
  dynamicLinks.forEach(link => nav.removeChild(link));

  if (currentUser) {
    const user = JSON.parse(currentUser);

    // Кнопка выхода
    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.textContent = `Выход (${user.name})`;
    logoutLink.onclick = function(e) {
      e.preventDefault();
      logout();
    };
    logoutLink.className = 'dynamic-link';
    nav.appendChild(logoutLink);

    // Меню по ролям
    const currentPath = window.location.pathname;

    if (user.role === 'manager') {
      if (currentPath !== '/add-product.html') {
        const addProductLink = document.createElement('a');
        addProductLink.href = 'add-product.html';
        addProductLink.textContent = 'Добавить товар';
        addProductLink.className = 'dynamic-link';
        nav.prepend(addProductLink);
      }

      if (currentPath !== '/orders-manager.html') {
        const ordersLink = document.createElement('a');
        ordersLink.href = 'orders-manager.html';
        ordersLink.textContent = 'Все заказы';
        ordersLink.className = 'dynamic-link';
        nav.prepend(ordersLink);
      }
    }

    if (user.role === 'courier') {
      if (currentPath !== '/courier.html') {
        const courierLink = document.createElement('a');
        courierLink.href = 'courier.html';
        courierLink.textContent = 'Мои заказы';
        courierLink.className = 'dynamic-link';
        nav.prepend(courierLink);
      }
    }
  } else {
    // Гость → кнопка "Войти"
    const loginLink = document.createElement('a');
    loginLink.href = 'login.html';
    loginLink.textContent = 'Войти';
    loginLink.className = 'dynamic-link';
    nav.appendChild(loginLink);
  }
});