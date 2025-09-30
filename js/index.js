// Ищем кнопку
const button = document.getElementById('creating_shelving_b');



// Проверяем, найдена ли кнопка
if (button) {
button.addEventListener('click', function() {
    let shelfName = prompt('Как назвать стеллаж?');
    if (!shelfName || shelfName.trim() === '') {
        console.log('Создание отменено или пустое название!');
        return;
    }
    shelfName = shelfName.trim();

    // Создаём новый div для стеллажа
    let newDiv = document.createElement('div');
    newDiv.className = 'my-div';

    // Создаём span с названием
    let nameSpan = document.createElement('span');
    nameSpan.textContent = shelfName;
    newDiv.appendChild(nameSpan);

    // Создаём 3 пустые кнопки
    for (let i = 0; i < 3; i++) {
        let btn = document.createElement('button');
        btn.textContent = '';
        newDiv.appendChild(btn);
    }

    // Кнопка 1: Переименование стеллажа (вторая кнопка)
    const renameBtn = newDiv.querySelector('button:nth-child(2)');
    renameBtn.title = 'Переименовать стеллаж';
    renameBtn.addEventListener('click', () => {
        const oldName = nameSpan.textContent;
        const newName = prompt('Введите новое имя стеллажа:', oldName);
        if (newName && newName.trim() && newName.trim() !== oldName) {
            nameSpan.textContent = newName.trim();
            let shelfData = JSON.parse(localStorage.getItem('shelvings') || '[]');
            const index = shelfData.indexOf(oldName);
            if (index !== -1) {
                shelfData[index] = newName.trim();
                localStorage.setItem('shelvings', JSON.stringify(shelfData));
            }
        }
    });

    // Кнопка 2: Создание полки (третья кнопка)
    const createShelfBtn = newDiv.querySelector('button:nth-child(3)');
    createShelfBtn.title = 'Создать полку';
    createShelfBtn.addEventListener('click', () => {
        const shelfName = nameSpan.textContent;
        const shelfNamePrompt = prompt('Введите имя полки:');
        if (shelfNamePrompt && shelfNamePrompt.trim()) {
            const newShelfDiv = document.createElement('div');
            newShelfDiv.className = 'my-div';

            const shelfSpan = document.createElement('span');
            shelfSpan.textContent = shelfNamePrompt.trim();
            newShelfDiv.appendChild(shelfSpan);

            for (let i = 0; i < 3; i++) {
                const btn = document.createElement('button');
                btn.textContent = '';
                newShelfDiv.appendChild(btn);
            }

            const shelvesContainer = document.querySelector('.shelves-container');
            if (shelvesContainer) {
                shelvesContainer.appendChild(newShelfDiv);
            }

            let shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
            if (!shelvesData[shelfName]) shelvesData[shelfName] = [];
            shelvesData[shelfName].push(shelfNamePrompt.trim());
            localStorage.setItem('shelves', JSON.stringify(shelvesData));
        }
    });

    // Обработчик клика на стеллаж — выбор стеллажа
    newDiv.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') return; // Игнорируем клик по кнопкам

        const container = document.getElementById('creating_shelving');
        const allShelvings = container.querySelectorAll('.my-div:not(.shelves-container .my-div)');

        // Скрываем все стеллажи
        allShelvings.forEach(div => div.style.display = 'none');

        // Перемещаем выбранный стеллаж в начало
        container.insertBefore(newDiv, container.firstChild);
        newDiv.style.display = 'block';

        // Создаём или очищаем контейнер для полок
        let shelvesContainer = container.querySelector('.shelves-container');
        if (!shelvesContainer) {
            shelvesContainer = document.createElement('div');
            shelvesContainer.className = 'shelves-container';
            container.appendChild(shelvesContainer);
        }

        loadShelvesForShelving(nameSpan.textContent, shelvesContainer);
    });

    // Добавляем стеллаж в контейнер
    const container = document.getElementById('creating_shelving');
    if (container) {
        container.appendChild(newDiv);
        // Сохраняем стеллажи
        if (typeof saveShelving === 'function') saveShelving();
    } else {
        console.error('Контейнер с ID "creating_shelving" не найден!');
    }
});
} else {
    console.error('Кнопка с ID "creating_shelving_b" не найдена!');
}


const deleteButton = document.getElementById('delete_shelving_b');
const container = document.getElementById('creating_shelving');

let isDeleteMode = false;

// Создаем кастомный confirm с кнопками Да/Нет
function showConfirm(message, onYes, onNo) {
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.right = 0;
    overlay.style.bottom = 0;
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = 1000;

    // Создаем окно подтверждения
    const box = document.createElement('div');
    box.style.background = 'white';
    box.style.padding = '20px';
    box.style.borderRadius = '8px';
    box.style.textAlign = 'center';
    box.style.minWidth = '300px';

    // Текст сообщения
    const text = document.createElement('p');
    text.textContent = message;
    box.appendChild(text);

    // Кнопки
    const btnYes = document.createElement('button');
    btnYes.textContent = 'Да';
    btnYes.style.margin = '10px';
    btnYes.style.padding = '5px 15px';

    const btnNo = document.createElement('button');
    btnNo.textContent = 'Нет';
    btnNo.style.margin = '10px';
    btnNo.style.padding = '5px 15px';

    box.appendChild(btnYes);
    box.appendChild(btnNo);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    btnYes.focus();

    // Обработчики кнопок
    btnYes.onclick = () => {
        onYes();
        document.body.removeChild(overlay);
    };
    btnNo.onclick = () => {
        onNo();
        document.body.removeChild(overlay);
    };
}

// Функция включения/выключения режима удаления
function toggleDeleteMode() {
    isDeleteMode = !isDeleteMode;

    const shelvings = document.querySelectorAll('.my-div');
    shelvings.forEach(shelf => {
        shelf.classList.toggle('delete-mode', isDeleteMode);
    });

    if (isDeleteMode) {
        deleteButton.textContent = 'Режим удаления (кликните на стеллаж для удаления)';
        console.log('Режим удаления включен');
    } else {
        deleteButton.textContent = 'Х'; // или ваш исходный текст
        console.log('Режим удаления выключен');
    }
}

// Обработчик кнопки удаления
deleteButton.addEventListener('click', () => {
    toggleDeleteMode();
});

// Обработчик клика по стеллажу
container.addEventListener('click', event => {
    if (!isDeleteMode) return;

    if (event.target.classList.contains('my-div')) {
        const shelf = event.target;
        const shelfName = shelf.querySelector('span').textContent || 'Без названия';

        showConfirm(
            `Вы хотите удалить стеллаж: "${shelfName}"?`,
            () => {
                // Да - удаляем
                shelf.remove();
                if (typeof saveShelving === 'function') {
                    saveShelving();
                }
                console.log(`Стеллаж "${shelfName}" удалён`);
            },
            () => {
                // Нет - ничего не делаем
                console.log(`Удаление стеллажа "${shelfName}" отменено`);
            }
        );
    }
});

//сохранение стеллажей
function saveShelving() {
    const shelvings = document.querySelectorAll('.my-div:not(.shelves-container .my-div)');
    const shelfData = Array.from(shelvings).map(shelf => shelf.querySelector('span').textContent);
    localStorage.setItem('shelvings', JSON.stringify(shelfData));
}

// Функция загрузки стеллажей из localStorage
function loadShelving() {
    const shelfData = JSON.parse(localStorage.getItem('shelvings') || '[]');
    const container = document.getElementById('creating_shelving');

    shelfData.forEach(name => {
        const newDiv = document.createElement('div');
        newDiv.className = 'my-div';

        // Создаём span с названием
        const nameSpan = document.createElement('span');
        nameSpan.textContent = name;
        newDiv.appendChild(nameSpan);

        // Создаём 3 пустые кнопки
        for (let i = 0; i < 3; i++) {
            const btn = document.createElement('button');
            btn.textContent = '';
            newDiv.appendChild(btn);
        }

        // Кнопка 1: Переименование стеллажа (вторая кнопка)
        const renameBtn = newDiv.querySelector('button:nth-child(2)');
        renameBtn.title = 'Переименовать стеллаж';
        renameBtn.addEventListener('click', () => {
            const oldName = nameSpan.textContent;
            const newName = prompt('Введите новое имя стеллажа:', oldName);
            if (newName && newName.trim() && newName.trim() !== oldName) {
                nameSpan.textContent = newName.trim();
                let shelfData = JSON.parse(localStorage.getItem('shelvings') || '[]');
                const index = shelfData.indexOf(oldName);
                if (index !== -1) {
                    shelfData[index] = newName.trim();
                    localStorage.setItem('shelvings', JSON.stringify(shelfData));
                }
            }
        });

        // Кнопка 2: Создание полки (третья кнопка)
        const createShelfBtn = newDiv.querySelector('button:nth-child(3)');
        createShelfBtn.title = 'Создать полку';
        createShelfBtn.addEventListener('click', () => {
            const shelfName = nameSpan.textContent;
            const shelfNamePrompt = prompt('Введите имя полки:');
            if (shelfNamePrompt && shelfNamePrompt.trim()) {
                const newShelfDiv = document.createElement('div');
                newShelfDiv.className = 'my-div';

                const shelfSpan = document.createElement('span');
                shelfSpan.textContent = shelfNamePrompt.trim();
                newShelfDiv.appendChild(shelfSpan);

                for (let i = 0; i < 3; i++) {
                    const btn = document.createElement('button');
                    btn.textContent = '';
                    newShelfDiv.appendChild(btn);
                }

                const shelvesContainer = document.querySelector('.shelves-container');
                if (shelvesContainer) {
                    shelvesContainer.appendChild(newShelfDiv);
                }

                let shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
                if (!shelvesData[shelfName]) shelvesData[shelfName] = [];
                shelvesData[shelfName].push(shelfNamePrompt.trim());
                localStorage.setItem('shelves', JSON.stringify(shelvesData));
            }
        });

        // Обработчик клика на стеллаж — выбор стеллажа
        newDiv.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return; // Игнорируем клик по кнопкам

            const container = document.getElementById('creating_shelving');
            const allShelvings = container.querySelectorAll('.my-div:not(.shelves-container .my-div)');

            // Скрываем все стеллажи
            allShelvings.forEach(div => div.style.display = 'none');

            // Перемещаем выбранный стеллаж в начало
            container.insertBefore(newDiv, container.firstChild);
            newDiv.style.display = 'block';

            // Создаём или очищаем контейнер для полок
            let shelvesContainer = container.querySelector('.shelves-container');
            if (!shelvesContainer) {
                shelvesContainer = document.createElement('div');
                shelvesContainer.className = 'shelves-container';
                container.appendChild(shelvesContainer);
            }

            loadShelvesForShelving(nameSpan.textContent, shelvesContainer);
        });

        container.appendChild(newDiv);
    });
}

function loadShelvesForShelving(shelfName, container) {
    container.innerHTML = ''; // Очищаем контейнер

    const shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
    const shelves = shelvesData[shelfName] || [];

    shelves.forEach(shelf => {
        const shelfDiv = document.createElement('div');
        shelfDiv.className = 'my-div';

        const shelfSpan = document.createElement('span');
        shelfSpan.textContent = shelf;
        shelfDiv.appendChild(shelfSpan);

        for (let i = 0; i < 3; i++) {
            const btn = document.createElement('button');
            btn.textContent = '';
            shelfDiv.appendChild(btn);
        }

        container.appendChild(shelfDiv);
    });
}

// Загружаем стеллажи при загрузке страницы
window.addEventListener('DOMContentLoaded', loadShelving);