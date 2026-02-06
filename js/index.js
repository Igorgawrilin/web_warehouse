// Глобальные переменные
let warehouseData = { shelves: {} };
let serverAvailable = false;
let assemblyList = []; // Массив {name, totalQuantity, locations: [{shelfName, subShelfName, takenQuantity}] }
let currentAssemblyItems = []; // Глобальная для передачи данных в onclick (избегать JSON в HTML)

// Функция загрузки склада (с сервера, fallback на LocalStorage)
async function loadWarehouse() {
    try {
        const response = await fetch('http://localhost:3000/warehouse');
        if (response.ok) {
            const data = await response.json();
            warehouseData = { shelves: data.shelves || {} };
            serverAvailable = true;
            localStorage.setItem('warehouse', JSON.stringify(warehouseData));
        } else {
            throw new Error('Server response not ok');
        }
    } catch (error) {
        console.warn('Server unavailable, using LocalStorage:', error);
        serverAvailable = false;
        const stored = localStorage.getItem('warehouse');
        warehouseData = stored ? JSON.parse(stored) : { shelves: {} };
    }
    displayWarehouse();
    displayAssemblyList(); // Обновляем список сборки при загрузке
}

// Функция отображения склада
function displayWarehouse() {
    const container = document.getElementById('warehouse-container');
    if (!container) return;
    container.innerHTML = '';

    if (!warehouseData.shelves) warehouseData.shelves = {};

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

            const addItemBtn = document.createElement('button');
            addItemBtn.textContent = 'Добавить предмет';
            addItemBtn.onclick = () => addItem(shelfName, subShelfName);
            subShelfDiv.appendChild(addItemBtn);

            shelfDiv.appendChild(subShelfDiv);
        }

        const addSubShelfBtn = document.createElement('button');
        addSubShelfBtn.textContent = 'Добавить полку';
        addSubShelfBtn.onclick = () => addSubShelf(shelfName);
        shelfDiv.appendChild(addSubShelfBtn);

        container.appendChild(shelfDiv);
    }

    const addShelfBtn = document.createElement('button');
    addShelfBtn.textContent = 'Добавить стеллаж';
    addShelfBtn.onclick = addShelf;
    container.appendChild(addShelfBtn);
}

// Функция сохранения (на сервер + LocalStorage)
async function saveWarehouse() {
    localStorage.setItem('warehouse', JSON.stringify(warehouseData));
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

// CRUD функции (addShelf, deleteShelf и т.д.) остаются без изменений, но с saveWarehouse() в конце

// Функция добавления стеллажа
function addShelf() {
    const name = prompt('Введите название стеллажа:');
    if (name && !warehouseData.shelves[name]) {
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
        delete warehouseData.shelves[name];
        displayWarehouse();
        saveWarehouse();
    }
}

// Функция добавления полки
function addSubShelf(shelfName) {
    const name = prompt('Введите название полки:');
    if (name && warehouseData.shelves[shelfName] && !warehouseData.shelves[shelfName].shelves[name]) {
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
        delete warehouseData.shelves[shelfName].shelves[subShelfName];
        displayWarehouse();
        saveWarehouse();
    }
}

// Функция добавления предмета
function addItem(shelfName, subShelfName) {
    const name = prompt('Введите название предмета:');
    const quantity = parseInt(prompt('Введите количество:'), 10);
    if (name && quantity > 0 && !isNaN(quantity)) {
        const subShelf = warehouseData.shelves[shelfName].shelves[subShelfName];
        if (subShelf && !subShelf.items[name]) {
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
    const subShelf = warehouseData.shelves[shelfName].shelves[subShelfName];
    const currentQuantity = subShelf.items[itemName];
    const newQuantity = parseInt(prompt(`Введите новое количество для "${itemName}":`, currentQuantity), 10);
    if (newQuantity >= 0 && !isNaN(newQuantity)) {
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
        delete warehouseData.shelves[shelfName].shelves[subShelfName].items[itemName];
        displayWarehouse();
        saveWarehouse();
    }
}

// Функция поиска (обновлена для лучшего поиска по всем уровням)
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
                            location: currentPath + ' → ' + shelfName,
                            shelfName: shelfName,
                            subShelfName: shelfName // Примечание: shelfName здесь - это имя полки, если obj - shelves
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

// Функция показа модального окна (для поиска)
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

// Функция создания модального для поиска
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

// Новая функция: открытие модального окна сборки
function openAssemblyModal() {
    let modal = document.getElementById('assemblyModal');
    if (!modal) {
        createAssemblyModal();
        modal = document.getElementById('assemblyModal');
    }
    modal.style.display = 'block';
    updateAssemblyModal(); // Обновляем содержимое
}

// Функция создания модального для сборки
function createAssemblyModal() {
    const modalHtml = `
        <div id="assemblyModal" class="modal">
            <div class="modal-content">
                <h3>Сборка предметов</h3>
                <input type="text" id="assemblySearchInput" placeholder="Поиск предмета для сборки...">
                <button id="assemblySearchBtn">Найти</button>
                <div id="assemblyResults"></div>
                <h4>Список сборки:</h4>
                <ul id="assemblyList"></ul>
                <button id="finishAssemblyBtn">Завершение</button>
                <button id="closeAssemblyBtn" onclick="closeAssemblyModal()">Закрыть</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // События
    document.getElementById('assemblySearchBtn').addEventListener('click', () => {
        const itemName = document.getElementById('assemblySearchInput').value;
        searchForAssembly(itemName);
    });
    document.getElementById('assemblySearchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchForAssembly(e.target.value);
        }
    });
    document.getElementById('finishAssemblyBtn').addEventListener('click', finishAssembly);
    document.getElementById('assemblyModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('assemblyModal')) {
            closeAssemblyModal();
        }
    });
}

// Обновлённая функция поиска для сборки (группирует по уникальным предметам, показывает все локации)
function searchForAssembly(itemName) {
    if (!itemName.trim()) {
        alert('Введите название предмета!');
        return;
    }

    let foundItems = {}; // Группируем по имени предмета: {name: {totalQty, locations: [{shelf, subShelf, qty}]} }

    function searchInShelves(obj, currentPath = '', shelfName = '', subShelfName = '') {
        if (!obj) return;
        for (const key in obj) {
            if (obj[key].items) {
                for (const itemNameInData in obj[key].items) {
                    if (itemNameInData.toLowerCase().includes(itemName.toLowerCase())) {
                        const fullName = itemNameInData;
                        if (!foundItems[fullName]) {
                            foundItems[fullName] = { totalQty: 0, locations: [] };
                        }
                        foundItems[fullName].totalQty += obj[key].items[fullName];
                        foundItems[fullName].locations.push({
                            shelfName: shelfName || key,
                            subShelfName: key,
                            qty: obj[key].items[fullName],
                            location: currentPath + (currentPath ? ' → ' : '') + key
                        });
                    }
                }
            } else if (obj[key].shelves) {
                const newPath = currentPath + (currentPath ? ' → ' : '') + key;
                searchInShelves(obj[key].shelves, newPath, key, '');
            }
        }
    }

    if (warehouseData.shelves) {
        for (const shelf in warehouseData.shelves) {
            searchInShelves(warehouseData.shelves[shelf].shelves || {}, shelf, shelf);
        }
    }

    // Преобразуем в массив для отображения
    const itemsArray = Object.entries(foundItems).map(([name, data]) => ({
        name,
        totalQuantity: data.totalQty,
        locations: data.locations
    }));

    currentAssemblyItems = itemsArray; // Сохраняем в глобальную переменную
    updateAssemblyModal();
}

// Обновлённая функция обновления модального сборки (показывает все локации под предметом, кнопка без JSON)
function updateAssemblyModal() {
    const resultsDiv = document.getElementById('assemblyResults');
    const listUl = document.getElementById('assemblyList');

    resultsDiv.innerHTML = '';
    if (currentAssemblyItems.length > 0) {
        const ul = document.createElement('ul');
        currentAssemblyItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>${item.name}</strong> - Общее доступно: ${item.totalQuantity}<br>
                Локации:<br>
                <ul>
                    ${item.locations.map(loc => `<li>${loc.location}: ${loc.qty}</li>`).join('')}
                </ul>
                <button onclick="addToAssembly(${index})">Добавить в сборку</button>
            `;
            ul.appendChild(li);
        });
        resultsDiv.appendChild(ul);
    } else {
        resultsDiv.textContent = 'Предметы не найдены.';
    }

    listUl.innerHTML = '';
    assemblyList.forEach((item, index) => {
        const locDetails = item.locations.map(loc => `${loc.location || (loc.shelfName + ' → ' + loc.subShelfName)}: ${loc.takenQuantity}`).join(', ');
        const li = document.createElement('li');
        li.innerHTML = `${item.name} - Общее: ${item.totalQuantity}<br><small>Из локаций: ${locDetails}</small>
            <button onclick="removeFromAssembly(${index})">Удалить</button>`;
        listUl.appendChild(li);
    });
}

// Обновлённая функция добавления в список сборки (с распределением по локациям, берёт из currentAssemblyItems)
function addToAssembly(index) {
    const item = currentAssemblyItems[index];
    const quantityToAdd = parseInt(prompt(`Сколько "${item.name}" добавить в сборку? (Доступно всего: ${item.totalQuantity})`), 10);
    
    if (quantityToAdd <= 0 || isNaN(quantityToAdd)) {
        alert('Неверное количество.');
        return;
    }

    if (quantityToAdd > item.totalQuantity) {
        alert(`Недостаточно "${item.name}" на складе! Доступно только ${item.totalQuantity}.`);
        return;
    }

    // Распределяем вычитание по локациям (по порядку)
    let remainingToTake = quantityToAdd;
    const takenLocations = []; // {shelfName, subShelfName, takenQuantity}

    for (const loc of item.locations) {
        if (remainingToTake <= 0) break;

        const availableInLoc = loc.qty;
        const takeHere = Math.min(remainingToTake, availableInLoc);

        // Вычитаем из склада
        const itemQty = warehouseData.shelves[loc.shelfName].shelves[loc.subShelfName].items[item.name];
        if (itemQty >= takeHere) {
            warehouseData.shelves[loc.shelfName].shelves[loc.subShelfName].items[item.name] -= takeHere;
            takenLocations.push({
                shelfName: loc.shelfName,
                subShelfName: loc.subShelfName,
                takenQuantity: takeHere
            });
            remainingToTake -= takeHere;
        }
    }

    if (remainingToTake > 0) {
        alert('Ошибка: не удалось вычесть всё количество (проверьте данные склада).');
        // Возвращаем вычтенное (откат)
        takenLocations.forEach(loc => {
            warehouseData.shelves[loc.shelfName].shelves[loc.subShelfName].items[item.name] += loc.takenQuantity;
        });
        return;
    }

    // Добавляем в список сборки
    assemblyList.push({
        name: item.name,
        totalQuantity: quantityToAdd,
        locations: takenLocations
    });

    displayWarehouse(); // Обновляем отображение склада
    saveWarehouse(); // Сохраняем изменения
    updateAssemblyModal(); // Обновляем модальное
    alert(`Добавлено ${quantityToAdd} шт. "${item.name}" (распределено по локациям).`);
}

// Обновлённая функция удаления из списка сборки (возврат в конкретные локации)
function removeFromAssembly(index) {
    const item = assemblyList[index];
    // Возвращаем в те же локации
    item.locations.forEach(loc => {
        warehouseData.shelves[loc.shelfName].shelves[loc.subShelfName].items[item.name] += loc.takenQuantity;
    });
    assemblyList.splice(index, 1);
    displayWarehouse();
    saveWarehouse();
    updateAssemblyModal();
}

// Функция завершения сборки
function finishAssembly() {
    displayAssemblyList();
    closeAssemblyModal();
}

// Функция закрытия модального сборки
function closeAssemblyModal() {
    document.getElementById('assemblyModal').style.display = 'none';
}

// Обновлённая функция отображения списка сборки в #spare (с кнопками "Завершение" и "Сброс")
function displayAssemblyList() {
    const spareDiv = document.getElementById('spare');
    spareDiv.innerHTML = '<h3>Список сборки:</h3>';
    if (assemblyList.length > 0) {
        const ul = document.createElement('ul');
        assemblyList.forEach((item, index) => {
            const locDetails = item.locations.map(loc => `${loc.location || (loc.shelfName + ' → ' + loc.subShelfName)}: ${loc.takenQuantity}`).join(', ');
            const li = document.createElement('li');
            li.innerHTML = `
                ${item.name} - Общее: ${item.totalQuantity}<br>
                <small>Из локаций: ${locDetails}</small>
                <button onclick="removeFromAssemblyInSpare(${index})">Удалить из списка</button>
            `;
            ul.appendChild(li);
        });
        spareDiv.appendChild(ul);

        // Кнопка "Сброс" (возвращает всё)
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'Сброс (вернуть на полки)';
        resetBtn.onclick = resetAssembly;
        spareDiv.appendChild(resetBtn);

        // Новая кнопка "Завершение" (удаляет без возврата)
        const finishBtn = document.createElement('button');
        finishBtn.textContent = 'Завершение (удалить список, предметы не возвращаются)';
        finishBtn.style.backgroundColor = '#ff4444'; // Красный для предупреждения
        finishBtn.onclick = finishAssemblyList;
        spareDiv.appendChild(finishBtn);
    } else {
        spareDiv.innerHTML += '<p>Список пуст.</p>';
    }
}

// Новая функция: Завершение списка в #spare (удаляет без возврата)
function finishAssemblyList() {
    if (confirm('Завершить сборку? Список будет удалён, предметы НЕ вернутся на полки (как будто использованы).')) {
        assemblyList = [];
        displayAssemblyList();
        // Опционально: сохранить факт завершения в LocalStorage или на сервер, но пока просто очищаем
    }
}

// Функция удаления из списка в #spare (аналог removeFromAssembly, но обновляет #spare)
function removeFromAssemblyInSpare(index) {
    const item = assemblyList[index];
    // Возвращаем в локации (как в сбросе для одного)
    item.locations.forEach(loc => {
        warehouseData.shelves[loc.shelfName].shelves[loc.subShelfName].items[item.name] += loc.takenQuantity;
    });
    assemblyList.splice(index, 1);
    displayWarehouse();
    saveWarehouse();
    displayAssemblyList(); // Обновляем #spare
}

// Обновлённая функция сброса (возвращает всё, как раньше)
function resetAssembly() {
    if (confirm('Сбросить весь список? Все предметы вернутся на полки.')) {
        assemblyList.forEach(item => {
            item.locations.forEach(loc => {
                warehouseData.shelves[loc.shelfName].shelves[loc.subShelfName].items[item.name] += loc.takenQuantity;
            });
        });
        assemblyList = [];
        displayWarehouse();
        saveWarehouse();
        displayAssemblyList();
    }
}

// Функция создания и открытия модального окна для экспорта/импорта
function openExportModal() {
    console.log('Создаём модальное окно для экспорта/импорта...'); // Отладка

    // Создаём основной div модала
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'exportModal'; // Уникальный id, чтобы не конфликтовать с существующим modal
    modal.style.display = 'block'; // Показываем сразу

    // Создаём содержимое модала (modal-content)
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Заголовок
    const title = document.createElement('h3');
    title.textContent = 'Импорт и Экспорт';
    modalContent.appendChild(title);

    // Кнопка экспорта в файл
    const exportFileBtn = document.createElement('button');
    exportFileBtn.id = 'exportFileBtn';
    exportFileBtn.textContent = 'Экспорт в файл';
    modalContent.appendChild(exportFileBtn);

    // Кнопка импорта из файла (с input для файла)
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'fileInput';
    fileInput.accept = '.json';
    fileInput.style.display = 'none'; // Скрываем, будем вызывать через кнопку
    modalContent.appendChild(fileInput);

    const importFileBtn = document.createElement('button');
    importFileBtn.id = 'importFileBtn';
    importFileBtn.textContent = 'Импорт из файла';
    modalContent.appendChild(importFileBtn);

    // Разделитель
    modalContent.appendChild(document.createElement('br'));

    // Textarea для JSON-строки
    const jsonTextarea = document.createElement('textarea');
    jsonTextarea.id = 'jsonTextarea';
    jsonTextarea.placeholder = 'Вставьте JSON сюда для импорта';
    jsonTextarea.rows = 10;
    jsonTextarea.cols = 50;
    modalContent.appendChild(jsonTextarea);

    // Кнопка экспорта в строку
    const exportStringBtn = document.createElement('button');
    exportStringBtn.id = 'exportStringBtn';
    exportStringBtn.textContent = 'Экспорт в строку';
    modalContent.appendChild(exportStringBtn);

    // Кнопка импорта из строки
    const importStringBtn = document.createElement('button');
    importStringBtn.id = 'importStringBtn';
    importStringBtn.textContent = 'Импорт из строки';
    modalContent.appendChild(importStringBtn);

    // Сообщение статуса
    const modalMessage = document.createElement('p');
    modalMessage.id = 'modalMessage';
    modalMessage.textContent = ''; // Изначально пустое
    modalContent.appendChild(modalMessage);

    // Добавляем modal-content в modal
    modal.appendChild(modalContent);

    // Добавляем модал в body (в конец)
    document.body.appendChild(modal);

    console.log('Модальное окно добавлено в DOM'); // Отладка

    // Функции экспорта/импорта (с вашими данными, предполагаем warehouseData как глобальную переменную)
    // Экспорт в файл
    exportFileBtn.addEventListener('click', () => {
        console.log('Экспорт в файл');
        const dataStr = JSON.stringify(warehouseData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'warehouse_export.json';
        a.click();
        URL.revokeObjectURL(url);
        modalMessage.textContent = 'Экспорт в файл завершён!';
    });

    // Импорт из файла
    importFileBtn.addEventListener('click', () => {
        fileInput.click(); // Открываем выбор файла
    });
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    warehouseData = importedData; // Обновляем данные
                    displayWarehouse(); // Обновляем интерфейс (ваша функция)
                    saveWarehouse(); // Сохраняем на сервер (если есть)
                    modalMessage.textContent = 'Импорт из файла завершён!';
                } catch (error) {
                    modalMessage.textContent = 'Ошибка: Неверный JSON-файл!';
                }
            };
            reader.readAsText(file);
        }
    });

    // Экспорт в строку (вставляем в textarea)
    exportStringBtn.addEventListener('click', () => {
        console.log('Экспорт в строку');
        jsonTextarea.value = JSON.stringify(warehouseData, null, 2);
        modalMessage.textContent = 'Экспорт в строку завершён!';
    });

    // Импорт из строки (из textarea)
    importStringBtn.addEventListener('click', () => {
        console.log('Импорт из строки');
        try {
            const importedData = JSON.parse(jsonTextarea.value);
            warehouseData = importedData; // Обновляем данные
            displayWarehouse(); // Обновляем интерфейс
            saveWarehouse(); // Сохраняем на сервер
            modalMessage.textContent = 'Импорт из строки завершён!';
        } catch (error) {
            modalMessage.textContent = 'Ошибка: Неверный JSON!';
        }
    });

    // Закрытие модала по клику вне modal-content
    window.addEventListener('click', function closeModal(event) {
        if (event.target === modal) {
            console.log('Закрываем модал по клику вне содержимого');
            modal.remove(); // Удаляем из DOM
            window.removeEventListener('click', closeModal); // Убираем слушатель
        }
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const assemblyBtn = document.getElementById('assemblyBtn');
    const openModalBtn = document.getElementById('openExportModal'); // Кнопка в footer

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

    if (assemblyBtn) {
        assemblyBtn.addEventListener('click', openAssemblyModal);
    }

    if (openModalBtn) {
        openModalBtn.addEventListener('click', openExportModal);
        console.log('Слушатель для кнопки "Импорт и Экспорт" добавлен'); // Отладка
    } else {
        console.error('Кнопка "Импорт и Экспорт" не найдена! Проверьте HTML.');
    }

    loadWarehouse();
    setInterval(loadWarehouse, 5000);
});
