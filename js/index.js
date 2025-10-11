// Глобальные переменные
let shelvingsData = JSON.parse(localStorage.getItem('shelvings') || '{}');
let itemsData = JSON.parse(localStorage.getItem('items') || '{}');

// Миграция старых данных: если предметы сохранены как массивы строк, превращаем в объекты с quantity=1
function migrateItemsData() {
    for (let key in itemsData) {
        if (Array.isArray(itemsData[key]) && itemsData[key].length > 0 && typeof itemsData[key][0] === 'string') {
            itemsData[key] = itemsData[key].map(name => ({ name, quantity: 1 }));
        }
    }
    localStorage.setItem('items', JSON.stringify(itemsData));
}
migrateItemsData(); // Вызываем при загрузке

// Функция для создания элементов стеллажа
function createShelvingElement(name) {
    const newShelvingDiv = document.createElement('div');
    newShelvingDiv.className = 'my-div';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    newShelvingDiv.appendChild(nameSpan);

    for (let i = 0; i < 2; i++) {
        const btn = document.createElement('button');
        btn.textContent = '';
        newShelvingDiv.appendChild(btn);
    }

    const deleteBtn = newShelvingDiv.children[1];
    deleteBtn.title = 'Удалить стеллаж';
    deleteBtn.addEventListener('click', () => {
        showConfirm(
            `Вы хотите удалить стеллаж: "${name}"?`,
            () => {
                delete shelvingsData[name];
                delete itemsData[name]; // Удаляем связанные предметы
                localStorage.setItem('shelvings', JSON.stringify(shelvingsData));
                localStorage.setItem('items', JSON.stringify(itemsData));
                newShelvingDiv.remove();
                console.log(`Стеллаж "${name}" удалён`);
            },
            () => {
                console.log(`Удаление стеллажа "${name}" отменено`);
            }
        );
    });

    const renameBtn = newShelvingDiv.children[2];
    renameBtn.title = 'Переименовать стеллаж';
    renameBtn.addEventListener('click', () => {
        const oldName = name;
        const newName = prompt('Введите новое имя стеллажа:', oldName);
        if (newName && newName.trim() && newName.trim() !== oldName) {
            nameSpan.textContent = newName.trim();
            shelvingsData[newName.trim()] = shelvingsData[oldName];
            delete shelvingsData[oldName];
            localStorage.setItem('shelvings', JSON.stringify(shelvingsData));
        }
    });

    return newShelvingDiv;
}

// Функция для создания элементов полки
function createShelfElement(shelvingName, shelfName) {
    const newShelfDiv = document.createElement('div');
    newShelfDiv.className = 'my-div';

    const nameSpan = document.createElement('span');
    nameSpan.textContent = shelfName;
    newShelfDiv.appendChild(nameSpan);

    for (let i = 0; i < 3; i++) {
        const btn = document.createElement('button');
        btn.textContent = '';
        newShelfDiv.appendChild(btn);
    }

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'items-container';
    newShelfDiv.appendChild(itemsContainer);

    loadItemsForShelf(shelvingName, shelfName, itemsContainer);

    const deleteBtn = newShelfDiv.children[1];
    deleteBtn.title = 'Удалить полку';
    deleteBtn.addEventListener('click', () => {
        showConfirm(
            `Вы хотите удалить полку: "${shelfName}"?`,
            () => {
                delete shelvingsData[shelvingName][shelfName];
                delete itemsData[`${shelvingName}:${shelfName}`];
                localStorage.setItem('shelvings', JSON.stringify(shelvingsData));
                localStorage.setItem('items', JSON.stringify(itemsData));
                newShelfDiv.remove();
                console.log(`Полка "${shelfName}" удалена`);
            },
            () => {
                console.log(`Удаление полки "${shelfName}" отменено`);
            }
        );
    });

    const renameBtn = newShelfDiv.children[2];
    renameBtn.title = 'Переименовать полку';
    renameBtn.addEventListener('click', () => {
        const oldName = shelfName;
        const newName = prompt('Введите новое имя полки:', oldName);
        if (newName && newName.trim() && newName.trim() !== oldName) {
            nameSpan.textContent = newName.trim();
            shelvingsData[shelvingName][newName.trim()] = shelvingsData[shelvingName][oldName];
            delete shelvingsData[shelvingName][oldName];
            localStorage.setItem('shelvings', JSON.stringify(shelvingsData));
        }
    });

    const addItemBtn = newShelfDiv.children[3];
    addItemBtn.title = 'Добавить предмет';
    addItemBtn.addEventListener('click', () => {
        const itemName = prompt('Как назвать предмет?');
        if (!itemName || itemName.trim() === '') return;

        let itemQuantity = prompt('Сколько штук? (число)', '1');
        itemQuantity = parseInt(itemQuantity);
        if (isNaN(itemQuantity) || itemQuantity < 0) itemQuantity = 1;

        const newItemDiv = createItemElement(shelvingName, shelfName, itemName.trim(), itemQuantity);
        itemsContainer.appendChild(newItemDiv);

        const key = `${shelvingName}:${shelfName}`;
        if (!itemsData[key]) itemsData[key] = [];
        itemsData[key].push({ name: itemName.trim(), quantity: itemQuantity });
        localStorage.setItem('items', JSON.stringify(itemsData));
        console.log(`Предмет "${itemName.trim()}" добавлен с количеством ${itemQuantity}`);
    });

    return newShelfDiv;
}

// Функция для создания элементов предмета с количеством
function createItemElement(shelvingName, shelfName, itemName, itemQuantity) {
    const newItemDiv = document.createElement('div');
    newItemDiv.className = 'my-div';

    const itemSpan = document.createElement('span');
    itemSpan.textContent = itemName;
    newItemDiv.appendChild(itemSpan);

    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.min = '0';
    quantityInput.value = itemQuantity;
    quantityInput.style.width = '50px';
    quantityInput.title = 'Количество';
    newItemDiv.appendChild(quantityInput);

    for (let i = 0; i < 2; i++) {
        const btn = document.createElement('button');
        btn.textContent = '';
        newItemDiv.appendChild(btn);
    }

    quantityInput.addEventListener('change', () => {
        let val = parseInt(quantityInput.value);
        if (isNaN(val) || val < 0) val = 0;
        const key = `${shelvingName}:${shelfName}`;
        if (itemsData[key]) {
            const itemObj = itemsData[key].find(i => i.name === itemName);
            if (itemObj) {
                itemObj.quantity = val;
                localStorage.setItem('items', JSON.stringify(itemsData));
                console.log(`Количество "${itemName}" обновлено: ${val}`);
            }
        }
    });

    const deleteItemBtn = newItemDiv.children[2];
    deleteItemBtn.title = 'Удалить предмет';
    deleteItemBtn.addEventListener('click', () => {
        showConfirm(
            `Вы хотите удалить предмет: "${itemName}"?`,
            () => {
                newItemDiv.remove();
                const key = `${shelvingName}:${shelfName}`;
                if (itemsData[key]) {
                    const index = itemsData[key].findIndex(i => i.name === itemName);
                    if (index !== -1) {
                        itemsData[key].splice(index, 1);
                        localStorage.setItem('items', JSON.stringify(itemsData));
                    }
                }
                console.log(`Предмет "${itemName}" удалён`);
            },
            () => {
                console.log(`Удаление предмета "${itemName}" отменено`);
            }
        );
    });

    const renameItemBtn = newItemDiv.children[3];
    renameItemBtn.title = 'Переименовать предмет';
    renameItemBtn.addEventListener('click', () => {
        const oldName = itemName;
        const newName = prompt('Введите новое имя предмета:', oldName);
        if (newName && newName.trim() && newName.trim() !== oldName) {
            itemSpan.textContent = newName.trim();
            const key = `${shelvingName}:${shelfName}`;
            if (itemsData[key]) {
                const itemObj = itemsData[key].find(i => i.name === oldName);
                if (itemObj) {
                    itemObj.name = newName.trim();
                    localStorage.setItem('items', JSON.stringify(itemsData));
                }
            }
        }
    });

    return newItemDiv;
}

// Функция для загрузки предметов для полки
function loadItemsForShelf(shelvingName, shelfName, itemsContainer) {
    const key = `${shelvingName}:${shelfName}`;
    const items = itemsData[key] || [];

    itemsContainer.innerHTML = '';

    items.forEach(({ name, quantity }) => {
        const itemEl = createItemElement(shelvingName, shelfName, name, quantity);
        itemsContainer.appendChild(itemEl);
    });
}

// Функция для загрузки всех данных
function loadData() {
    const shelvingsContainer = document.getElementById('shelvingsContainer');
    shelvingsContainer.innerHTML = '';

    for (let shelvingName in shelvingsData) {
        const shelvingEl = createShelvingElement(shelvingName);
        shelvingsContainer.appendChild(shelvingEl);

        const shelvesContainer = document.createElement('div');
        shelvesContainer.className = 'shelves-container';
        shelvingEl.appendChild(shelvesContainer);

        for (let shelfName in shelvingsData[shelvingName]) {
            const shelfEl = createShelfElement(shelvingName, shelfName);
            shelvesContainer.appendChild(shelfEl);
        }

        const addShelfBtn = document.createElement('button');
        addShelfBtn.textContent = 'Добавить полку';
        addShelfBtn.addEventListener('click', () => {
            const shelfName = prompt('Как назвать полку?');
            if (shelfName && shelfName.trim()) {
                if (!shelvingsData[shelvingName][shelfName.trim()]) {
                    shelvingsData[shelvingName][shelfName.trim()] = true;
                    localStorage.setItem('shelvings', JSON.stringify(shelvingsData));
                    const shelfEl = createShelfElement(shelvingName, shelfName.trim());
                    shelvesContainer.appendChild(shelfEl);
                }
            }
        });
        shelvesContainer.appendChild(addShelfBtn);
    }
}

// Функция для показа подтверждения (предполагаю, что она у тебя есть; если нет, добавь)
function showConfirm(message, onConfirm, onCancel) {
    if (confirm(message)) {
        onConfirm();
    } else {
        onCancel();
    }
}

// Обработчик для добавления стеллажа
document.getElementById('addShelvingBtn').addEventListener('click', () => {
    const shelvingName = prompt('Как назвать стеллаж?');
    if (shelvingName && shelvingName.trim()) {
        if (!shelvingsData[shelvingName.trim()]) {
            shelvingsData[shelvingName.trim()] = {};
            localStorage.setItem('shelvings', JSON.stringify(shelvingsData));
            loadData();
        }
    }
});

// Загрузка данных при старте
loadData();
