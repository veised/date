
// Массив товаров
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Загрузка товаров из database.json или localStorage
// Автоматически загружаем базу при старте
async function loadProducts() {
  start('loadProducts');
  log('Start loading products');
  try {
    // Проверяем, есть ли товары в localStorage
    const cached = localStorage.getItem('db_products');
    if (cached) {
      products = JSON.parse(cached);
      console.log('Товары загружены из localStorage');
    } else {
      // Если нет — читаем из database.json
      console.log('Загружаем базу из database.json...');
      const response = await fetch('../database.json');
      
      if (!response.ok) throw new Error('Файл не найден');

      const data = await response.json();
      
      // Очищаем URL изображений
      products = data.products.map(p => ({
        ...p,
        image: p.image.trim()
      }));

      // Сохраняем в localStorage
      localStorage.setItem('db_products', JSON.stringify(products));
      localStorage.setItem('db_users', JSON.stringify(data.users));
      localStorage.setItem('orders', JSON.stringify(data.orders || []));

      console.log('База данных загружена из database.json и сохранена в localStorage');
    }

    displayProductsByCategory();
  } catch (error) {
    console.error("Ошибка загрузки базы:", error);
    document.querySelector('.main-content').innerHTML = `
      <p style="color: #c62828; text-align: center; margin: 2rem;">
        Не удалось загрузить базу данных. Проверьте сервер.
      </p>
    `;
  }
  success('Products loaded', { count: products.length });
  end('loadProducts');
}

// Отображение товаров по категориям
function displayProductsByCategory() {
  const categories = ['шаурма', 'напитки', 'картошка', 'соусы'];
  categories.forEach(category => {
    const container = document.getElementById(`category-${category}`);
    if (container) container.innerHTML = '';
  });

  products.forEach(product => {
    const container = document.getElementById(`category-${product.category}`);
    if (!container) return;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p class="description">${product.description}</p>
      <p class="price">${product.price} ₽</p>
      <button onclick="addToCart(${product.id})">В корзину</button>
    `;
    container.appendChild(card);
  });
}

// Поиск
document.getElementById('search').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  const containers = document.querySelectorAll('.products-container');
  containers.forEach(c => c.innerHTML = '');

  if (!query) {
    displayProductsByCategory();
    return;
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.description.toLowerCase().includes(query)
  );

  filtered.forEach(product => {
    const container = document.getElementById(`category-${product.category}`);
    if (!container) return;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p class="description">${product.description}</p>
      <p class="price">${product.price} ₽</p>
      <button onclick="addToCart(${product.id})">В корзину</button>
    `;
    container.appendChild(card);
  });
});

// Добавление в корзину
function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(item => item.id === id);
  
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${product.name} добавлен в корзину!`);
}

// Загрузка при старте
loadProducts();