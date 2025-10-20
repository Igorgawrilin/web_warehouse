// Глобальные переменные
let warehouseData = { shelves: {} }; // Инициализация по умолчанию
let serverAvailable = false; // Флаг доступности сервера

// Функция загрузки склада (с сервера, fallback на LocalStorage)
async function loadWarehouse() {
    try {
        // Пытаемся загрузить с сервера
        const response = await fetch('http://localhost:3000/warehouse');
        if (response.ok) {
            const data = await response.json();
            warehouseData = { shelves: data.shelves || {} }; // Гарантируем, что shelves существует
            serverAvailable = true;
            localStorage.setItem('warehouse', JSON.stringify(warehouseData)); // Синхронизируем LocalStorage
        } else {
            throw new Error('Server response not ok');
        }
    } catch (error) {
        console.warn('Server unavailable, using LocalStorage:', error);
        serverAvailable = false;
        const stored = localStorage.getItem('warehouse');
        warehouseData = stored ? JSON.parse(stored) : { shelves: {} }; // Fallback с гарантией
    }

    // Отображаем склад
    displayWarehouse();
}

// Функция отображения склада
function displayWarehouse() {
    const container = document.getElementById('warehouse-container');
    if (!container) return; // Проверка на существование контейнера
    container.innerHTML = ''; // Очищаем контейнер

    if (!warehouseData.shelves) warehouseData.shelves = {}; // Дополнительная защита

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
}

// Функция сохранения (на сервер + LocalStorage)
async function saveWarehouse() {
    localStorage.setItem('warehouse', JSON.stringify(warehouseData)); // Всегда сохраняем локально

    if (serverAvailable) {
        try {
            await fetch('http://localhost:3000/warehouse', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(warehouseData)
            });
        } catch (error) {
            console.warn('Failed to save to server:', error);
        }
    }
}

// Функция добавления стеллажа
function addShelf() {
    const name = prompt('Введите название стеллажа:');
    if (name && !warehouseData.shelves[name]) {
        if (!warehouseData.shelves) warehouseData.shelves = {}; // Защита
        warehouseData.shelves[name] = { shelves: {} };
        displayWarehouse();
        saveWarehouse();
    } else {
        alert('Стеллаж с таким именем уже существует или имя пустое.');
    }
}

// Функция удаления стеллажа
function deleteShelf(name) {
    if (confirm(`Удалить стеллаж "${name}" и всё его содержимое?`)) {
        if (warehouseData.shelves && warehouseData.shelves[name]) {
            delete warehouseData.shelves[name];
            displayWarehouse();
            saveWarehouse();
        }
    }
}

// Функция добавления полки
function addSubShelf(shelfName) {
    const name = prompt('Введите название полки:');
    if (name && warehouseData.shelves[shelfName] && !warehouseData.shelves[shelfName].shelves[name]) {
        if (!warehouseData.shelves[shelfName].shelves) warehouseData.shelves[shelfName].shelves = {}; // Защита
        warehouseData.shelves[shelfName].shelves[name] = { items: {} };
        displayWarehouse();
        saveWarehouse();
    } else {
        alert('Полка с таким именем уже существует или имя пустое.');
    }
}

// Функция удаления полки
function deleteSubShelf(shelfName, subShelfName) {
    if (confirm(`Удалить полку "${subShelfName}" и всё её содержимое?`)) {
        if (warehouseData.shelves[shelfName] && warehouseData.shelves[shelfName].shelves[subShelfName]) {
            delete warehouseData.shelves[shelfName].shelves[subShelfName];
            displayWarehouse();
            saveWarehouse();
        }
    }
}

// Функция добавления предмета
function addItem(shelfName, subShelfName) {
    const name = prompt('Введите название предмета:');
    const quantity = parseInt(prompt('Введите количество:'), 10);
    if (name && quantity > 0 && !isNaN(quantity)) {
        const shelf = warehouseData.shelves[shelfName];
        const subShelf = shelf && shelf.shelves[subShelfName];
        if (subShelf && !subShelf.items[name]) {
            if (!subShelf.items) subShelf.items = {}; // Защита
            subShelf.items[name] = quantity;
            displayWarehouse();
            saveWarehouse();
        } else {
            alert('Предмет с таким именем уже существует.');
        }
    } else {
        alert('Неверные данные.');
    }
}

// Функция редактирования предмета
function editItem(shelfName, subShelfName, itemName) {
    const shelf = warehouseData.shelves[shelfName];
    const subShelf = shelf && shelf.shelves[subShelfName];
    const currentQuantity = subShelf && subShelf.items[itemName];
    const newQuantity = parseInt(prompt(`Введите новое количество для "${itemName}":`, currentQuantity || 0), 10);
    if (newQuantity > 0 && !isNaN(newQuantity) && subShelf && subShelf.items) {
        subShelf.items[itemName] = newQuantity;
        displayWarehouse();
        saveWarehouse();
    } else {
        alert('Неверное количество.');
    }
}

// Функция удаления предмета
function deleteItem(shelfName, subShelfName, itemName) {
    if (confirm(`Удалить предмет "${itemName}"?`)) {
        const shelf = warehouseData.shelves[shelfName];
        const subShelf = shelf && shelf.shelves[subShelfName];
        if (subShelf && subShelf.items && subShelf.items[itemName]) {
            delete subShelf.items[itemName];
            displayWarehouse();
            saveWarehouse();
        }
    }
}

// Функция поиска
function searchItem(itemName) {
    if (!itemName.trim()) {
        alert('Введите название предмета!');
        return;
    }

    let foundItems = [];

    function searchInShelves(obj, currentPath = '') {
        if (!obj) return;
        for (const shelfName in obj) {
            if (obj[shelfName].items) {
                for (const itemNameInData in obj[shelfName].items) {
                    if (itemNameInData.toLowerCase().includes(itemName.toLowerCase())) {
                        foundItems.push({
                            name: itemNameInData,
                            quantity: obj[shelfName].items[itemNameInData],
                            location: currentPath + ' → ' + shelfName
                        });
                    }
                }
            } else if (obj[shelfName].shelves) {
                const newPath = currentPath + (currentPath ? ' → ' : '') + shelfName;
                searchInShelves(obj[shelfName].shelves, newPath);
            }
        }
    }

    if (warehouseData.shelves) {
        searchInShelves(warehouseData.shelves);
    }

    if (foundItems.length > 0) {
        showModal(foundItems);
    } else {
        showModal('Предмет не найден', '', 'Проверьте название и попробуйте снова.');
    }
}

// Функция показа модального окна
function showModal(titleOrItems, quantity, location) {
    let modal = document.getElementById('searchModal');
    let modalTitle = document.getElementById('modalTitle');
    let modalContent = document.getElementById('modalContent');
    let modalCloseBtn = document.getElementById('modalCloseBtn');

    if (!modal) {
        createModal();
        modal = document.getElementById('searchModal');
        modalTitle = document.getElementById('modalTitle');
        modalContent = document.getElementById('modalContent');
        modalCloseBtn = document.getElementById('modalCloseBtn');
    }

    modalTitle.textContent = '';
    modalContent.innerHTML = '';

    if (Array.isArray(titleOrItems)) {
        modalTitle.textContent = 'Найденные предметы:';
        const ul = document.createElement('ul');
        titleOrItems.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${item.name}</strong> - Количество: ${item.quantity} - Расположение: ${item.location}`;
            ul.appendChild(li);
        });
        modalContent.appendChild(ul);
    } else {
        modalTitle.textContent = titleOrItems;
        modalContent.innerHTML = `<p>${location}</p>`;
    }

    modal.style.display = 'block';
}

// Функция создания модального
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
    document.body.insertAdjacentHTML('beforeend', modalHtml);

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

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const itemName = searchInput.value;
            searchItem(itemName);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchItem(this.value);
            }
        });
    }

    // Загружаем склад при старте
    loadWarehouse();

    // Автообновление каждые 5 секунд
    setInterval(loadWarehouse, 5000);
});
