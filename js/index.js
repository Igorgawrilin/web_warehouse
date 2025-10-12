// Полный код JavaScript для складского приложения (js/script.js)
// Включает весь функционал: управление складом (стеллажи → полки → предметы), LocalStorage, и исправленный поиск.
// Теперь поиск собирает ВСЕ места, где найден предмет (если он есть на нескольких полках), и отображает их в модальном окне.
// Если предмет не найден нигде, показывает сообщение "Предмет не найден".

// Глобальные переменные
let warehouseData = JSON.parse(localStorage.getItem('warehouse')) || { shelves: {} };

// Функция загрузки и отображения склада
function loadWarehouse() {
    const container = document.getElementById('warehouse-container');
    container.innerHTML = ''; // Очищаем контейнер

    for (const shelfName in warehouseData.shelves) {
        const shelfDiv = document.createElement('div');
        shelfDiv.className = 'shelf';
        shelfDiv.innerHTML = `<h3>${shelfName}</h3><button onclick="deleteShelf('${shelfName}')">Удалить стеллаж</button>`;

        const shelfShelves = warehouseData.shelves[shelfName].shelves || {};
        for (const subShelfName in shelfShelves) {
            const subShelfDiv = document.createElement('div');
            subShelfDiv.className = 'sub-shelf';
            subShelfDiv.innerHTML = `<h4>${subShelfName}</h4><button onclick="deleteSubShelf('${shelfName}', '${subShelfName}')">Удалить полку</button>`;

            const items = shelfShelves[subShelfName].items || {};
            for (const itemName in items) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'item';
                itemDiv.innerHTML = `
                    <span>${itemName}: ${items[itemName]}</span>
                    <button onclick="editItem('${shelfName}', '${subShelfName}', '${itemName}')">Изменить</button>
                    <button onclick="deleteItem('${shelfName}', '${subShelfName}', '${itemName}')">Удалить</button>
                `;
                subShelfDiv.appendChild(itemDiv);
            }

            // Кнопка добавления предмета
            const addItemBtn = document.createElement('button');
            addItemBtn.textContent = 'Добавить предмет';
            addItemBtn.onclick = () => addItem(shelfName, subShelfName);
            subShelfDiv.appendChild(addItemBtn);

            shelfDiv.appendChild(subShelfDiv);
        }

        // Кнопка добавления полки
        const addSubShelfBtn = document.createElement('button');
        addSubShelfBtn.textContent = 'Добавить полку';
        addSubShelfBtn.onclick = () => addSubShelf(shelfName);
        shelfDiv.appendChild(addSubShelfBtn);

        container.appendChild(shelfDiv);
    }

    // Кнопка добавления стеллажа
    const addShelfBtn = document.createElement('button');
    addShelfBtn.textContent = 'Добавить стеллаж';
    addShelfBtn.onclick = addShelf;
    container.appendChild(addShelfBtn);

    saveWarehouse(); // Сохраняем после загрузки (на случай изменений)
}

// Функция сохранения в LocalStorage
function saveWarehouse() {
    localStorage.setItem('warehouse', JSON.stringify(warehouseData));
}

// Функция добавления стеллажа
function addShelf() {
    const name = prompt('Введите название стеллажа:');
    if (name && !warehouseData.shelves[name]) {
        warehouseData.shelves[name] = { shelves: {} };
        loadWarehouse();
    } else {
        alert('Стеллаж с таким именем уже существует или имя пустое.');
    }
}

// Функция удаления стеллажа
function deleteShelf(name) {
    if (confirm(`Удалить стеллаж "${name}" и всё его содержимое?`)) {
        delete warehouseData.shelves[name];
        loadWarehouse();
    }
}

// Функция добавления полки
function addSubShelf(shelfName) {
    const name = prompt('Введите название полки:');
    if (name && !warehouseData.shelves[shelfName].shelves[name]) {
        warehouseData.shelves[shelfName].shelves[name] = { items: {} };
        loadWarehouse();
    } else {
        alert('Полка с таким именем уже существует или имя пустое.');
    }
}

// Функция удаления полки
function deleteSubShelf(shelfName, subShelfName) {
    if (confirm(`Удалить полку "${subShelfName}" и всё её содержимое?`)) {
        delete warehouseData.shelves[shelfName].shelves[subShelfName];
        loadWarehouse();
    }
}

// Функция добавления предмета
function addItem(shelfName, subShelfName) {
    const name = prompt('Введите название предмета:');
    const quantity = parseInt(prompt('Введите количество:'), 10);
    if (name && quantity > 0 && !isNaN(quantity)) {
        if (!warehouseData.shelves[shelfName].shelves[subShelfName].items[name]) {
            warehouseData.shelves[shelfName].shelves[subShelfName].items[name] = quantity;
            loadWarehouse();
        } else {
            alert('Предмет с таким именем уже существует.');
        }
    } else {
        alert('Неверные данные.');
    }
}

// Функция редактирования предмета
function editItem(shelfName, subShelfName, itemName) {
    const newQuantity = parseInt(prompt(`Введите новое количество для "${itemName}":`, warehouseData.shelves[shelfName].shelves[subShelfName].items[itemName]), 10);
    if (newQuantity > 0 && !isNaN(newQuantity)) {
        warehouseData.shelves[shelfName].shelves[subShelfName].items[itemName] = newQuantity;
        loadWarehouse();
    } else {
        alert('Неверное количество.');
    }
}

// Функция удаления предмета
function deleteItem(shelfName, subShelfName, itemName) {
    if (confirm(`Удалить предмет "${itemName}"?`)) {
        delete warehouseData.shelves[shelfName].shelves[subShelfName].items[itemName];
        loadWarehouse();
    }
}

// Функция поиска (исправленная: теперь находит ВСЕ места)
function searchItem(itemName) {
    if (!itemName.trim()) {
        alert('Введите название предмета!');
        return;
    }

    let foundItems = []; // Массив для всех найденных предметов

    // Рекурсивный поиск по стеллажам → полкам → предметам (собираем все совпадения)
    function searchInShelves(obj, currentPath = '') {
        for (const shelfName in obj) {
            if (obj[shelfName].items) {
                // Это полка с предметами
                for (const itemNameInData in obj[shelfName].items) {
                    if (itemNameInData.toLowerCase().includes(itemName.toLowerCase())) { // Частичное совпадение, нечувствительное к регистру
                        foundItems.push({
                            name: itemNameInData,
                            quantity: obj[shelfName].items[itemNameInData],
                            location: currentPath + ' → ' + shelfName
                        });
                        // НЕ останавливаем поиск — продолжаем искать все места
                    }
                }
            } else if (obj[shelfName].shelves) {
                // Это стеллаж с полками
                const newPath = currentPath + (currentPath ? ' → ' : '') + shelfName;
                searchInShelves(obj[shelfName].shelves, newPath); // Рекурсивно продолжаем
            }
        }
    }

    // Запуск поиска (warehouseData.shelves — корень)
    if (warehouseData.shelves) {
        searchInShelves(warehouseData.shelves);
    }

    if (foundItems.length > 0) {
        // Показываем модальное окно со списком всех найденных
        showModal(foundItems);
    } else {
        // Не найден
        showModal('Предмет не найден', '', 'Проверьте название и попробуйте снова.');
    }
}

// Функция показа модального окна (обновленная: принимает массив или строку)
function showModal(titleOrItems, quantity, location) {
    let modal = document.getElementById('searchModal');
    let modalTitle = document.getElementById('modalTitle');
    let modalContent = document.getElementById('modalContent');
    let modalCloseBtn = document.getElementById('modalCloseBtn');

    if (!modal) {
        // Создаем модальное, если его нет
        createModal();
        // После создания заново получаем ссылки на элементы
        modal = document.getElementById('searchModal');
        modalTitle = document.getElementById('modalTitle');
        modalContent = document.getElementById('modalContent');
        modalCloseBtn = document.getElementById('modalCloseBtn');
    }

    modalTitle.textContent = ''; // Сброс
    modalContent.innerHTML = ''; // Сброс

    if (Array.isArray(titleOrItems)) {
        // Массив найденных предметов
        modalTitle.textContent = 'Найденные предметы:';
        const ul = document.createElement('ul');
        titleOrItems.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.name}</strong> - Количество: ${item.quantity} - Расположение: ${item.location}`;
            ul.appendChild(li);
        });
        modalContent.appendChild(ul);
    } else {
        // Сообщение об ошибке (строка)
        modalTitle.textContent = titleOrItems;
        modalContent.innerHTML = `<p>${location}</p>`;
    }

    modal.style.display = 'block'; // Показываем
}

// Функция создания модального HTML (обновленная: добавлен div для контента)
function createModal() {
    const modalHtml = `
        <div id="searchModal" class="modal">
            <div class="modal-content">
                <h3 id="modalTitle"></h3>
                <div id="modalContent"></div>
                <button id="modalCloseBtn" class="close-btn" onclick="closeModal()">OK</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml); // Добавляем в body

    // Event listener для закрытия по клику на overlay
    document.getElementById('searchModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// Функция закрытия модального
function closeModal() {
    document.getElementById('searchModal').style.display = 'none';
}

// Event listeners (добавляются после загрузки DOM)
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const itemName = searchInput.value;
            searchItem(itemName);
        });
    }

    // Опционально: поиск по Enter в input
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchItem(this.value);
            }
        });
    }

    // Загружаем склад при старте
    loadWarehouse();
});
