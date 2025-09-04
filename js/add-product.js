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

// Форма добавления товара
document.getElementById('product-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const price = Number(document.getElementById('price').value);
  const description = document.getElementById('description').value.trim();
  const category = document.getElementById('category').value;
  const image = document.getElementById('image').value.trim(); // Убираем пробелы

  if (!name || !price || !description || !image) {
    alert('Заполните все поля');
    return;
  }

  const newProduct = {
    id: Date.now(),
    name,
    price,
    description,
    category,
    image
  };

  const products = JSON.parse(localStorage.getItem('db_products')) || [];
  products.push(newProduct);
  localStorage.setItem('db_products', JSON.stringify(products));

  alert(`Товар "${name}" успешно добавлен!`);
  this.reset();
});

function exportDatabase() {
  const products = JSON.parse(localStorage.getItem('db_products')) || [];
  const users = JSON.parse(localStorage.getItem('db_users')) || [];
  const orders = JSON.parse(localStorage.getItem('orders')) || [];

  const cleanedProducts = products.map(p => ({ ...p, image: p.image.trim() }));

  const fullDB = {
    products: cleanedProducts,
    users,
    orders
  };

  const jsonStr = JSON.stringify(fullDB, null, 2);
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);

  // Проверяем, поддерживает ли браузер скачивание
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "database.json");

  try {
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    document.body.removeChild(downloadAnchorNode);
    alert('База данных сохранена как database.json! Замените файл в корне проекта.');
  } catch (e) {
    // Если не получилось — показываем инструкцию
    prompt(
      'Скопируйте JSON и сохраните как database.json в корне проекта:',
      jsonStr
    );
  }
}

// Обновить базу из database.json
async function reloadFromDatabase() {
  if (confirm('Все изменения в localStorage будут перезаписаны из database.json')) {
    try {
      const response = await fetch('../database.json');
      const data = await response.json();

      // Очистка и сохранение
      const cleanedProducts = data.products.map(p => ({ ...p, image: p.image.trim() }));
      
      localStorage.setItem('db_products', JSON.stringify(cleanedProducts));
      localStorage.setItem('db_users', JSON.stringify(data.users));
      localStorage.setItem('orders', JSON.stringify(data.orders || []));

      alert('База успешно обновлена из database.json!');
      location.reload();
    } catch (error) {
      alert('Ошибка загрузки файла database.json');
      console.error(error);
    }
  }
}