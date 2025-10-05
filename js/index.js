// Глобальная переменная для отслеживания выбранного стеллажа
let selectedShelving = null;

// Глобальная переменная для режима удаления полок
let isDeleteShelfMode = false;

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

        // Кнопка 1: Переименование стеллажа (вторая дочерний элемент, поскольку span - первый)
        const renameBtn = newDiv.children[1];
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

        // Кнопка 2: Создание полки (третий дочерний элемент)
        const createShelfBtn = newDiv.children[2];
        createShelfBtn.title = 'Создать полку';
        createShelfBtn.addEventListener('click', () => {
            const shelfName = prompt('Как назвать полку?');
            if (!shelfName || shelfName.trim() === '') {
                console.log('Создание полки отменено или пустое название!');
                return;
            }
            const trimmedShelfName = shelfName.trim();

            // Если стеллаж не выбран, выбираем его (разворачиваем)
            if (selectedShelving !== newDiv) {
                const container = document.getElementById('creating_shelving');
                const allShelvings = container.querySelectorAll('.my-div:not(.shelves-container .my-div)');
                allShelvings.forEach(div => div.style.display = 'none');
                container.insertBefore(newDiv, container.firstChild);
                newDiv.style.display = 'block';

                let shelvesContainer = container.querySelector('.shelves-container');
                if (!shelvesContainer) {
                    shelvesContainer = document.createElement('div');
                    shelvesContainer.className = 'shelves-container';
                    container.appendChild(shelvesContainer);
                } else {
                    shelvesContainer.innerHTML = '';
                }

                loadShelvesForShelving(nameSpan.textContent, shelvesContainer);
                selectedShelving = newDiv;
            }

            // Добавляем полку в DOM
            const shelvesContainer = document.querySelector('.shelves-container');
            if (shelvesContainer) {
                const newShelfDiv = document.createElement('div');
                newShelfDiv.className = 'my-div';

                const shelfSpan = document.createElement('span');
                shelfSpan.textContent = trimmedShelfName;
                newShelfDiv.appendChild(shelfSpan);

                // Создаём 3 кнопки для полки
                for (let i = 0; i < 3; i++) {
                    const btn = document.createElement('button');
                    btn.textContent = '';
                    newShelfDiv.appendChild(btn);
                }

                // Кнопка 1: Удаление полки (вторая дочерний элемент)
                const deleteShelfBtn = newShelfDiv.children[1];
                deleteShelfBtn.title = 'Удалить полку';
                deleteShelfBtn.addEventListener('click', () => {
                    showConfirm(
                        `Вы хотите удалить полку: "${trimmedShelfName}"?`,
                        () => {
                            newShelfDiv.remove();
                            // Обновляем localStorage
                            let shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
                            if (shelvesData[nameSpan.textContent]) {
                                const index = shelvesData[nameSpan.textContent].indexOf(trimmedShelfName);
                                if (index !== -1) {
                                    shelvesData[nameSpan.textContent].splice(index, 1);
                                    localStorage.setItem('shelves', JSON.stringify(shelvesData));
                                }
                            }
                            console.log(`Полка "${trimmedShelfName}" удалена`);
                        },
                        () => {
                            console.log(`Удаление полки "${trimmedShelfName}" отменено`);
                        }
                    );
                });

                // Кнопка 2: Переименование полки (третий дочерний элемент)
                const renameShelfBtn = newShelfDiv.children[2];
                renameShelfBtn.title = 'Переименовать полку';
                renameShelfBtn.addEventListener('click', () => {
                    const oldName = shelfSpan.textContent;
                    const newName = prompt('Введите новое имя полки:', oldName);
                    if (newName && newName.trim() && newName.trim() !== oldName) {
                        shelfSpan.textContent = newName.trim();
                        // Обновляем localStorage
                        let shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
                        if (shelvesData[nameSpan.textContent]) {
                            const index = shelvesData[nameSpan.textContent].indexOf(oldName);
                            if (index !== -1) {
                                shelvesData[nameSpan.textContent][index] = newName.trim();
                                localStorage.setItem('shelves', JSON.stringify(shelvesData));
                            }
                        }
                    }
                });

                shelvesContainer.appendChild(newShelfDiv);

                // Сохраняем в localStorage
                let shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
                if (!shelvesData[nameSpan.textContent]) {
                    shelvesData[nameSpan.textContent] = [];
                }
                shelvesData[nameSpan.textContent].push(trimmedShelfName);
                localStorage.setItem('shelves', JSON.stringify(shelvesData));
            }
        });

        // Кнопка 3: Режим удаления полок (четвертый дочерний элемент)
        const deleteModeBtn = newDiv.children[3];
        deleteModeBtn.title = 'Режим удаления полок';
        deleteModeBtn.addEventListener('click', () => {
            // Переключаем режим удаления полок
            isDeleteShelfMode = !isDeleteShelfMode;

            // Если стеллаж не выбран, выбираем его (разворачиваем)
            if (selectedShelving !== newDiv) {
                const container = document.getElementById('creating_shelving');
                const allShelvings = container.querySelectorAll('.my-div:not(.shelves-container .my-div)');
                allShelvings.forEach(div => div.style.display = 'none');
                container.insertBefore(newDiv, container.firstChild);
                newDiv.style.display = 'block';

                let shelvesContainer = container.querySelector('.shelves-container');
                if (!shelvesContainer) {
                    shelvesContainer = document.createElement('div');
                    shelvesContainer.className = 'shelves-container';
                    container.appendChild(shelvesContainer);
                } else {
                    shelvesContainer.innerHTML = '';
                }

                loadShelvesForShelving(nameSpan.textContent, shelvesContainer);
                selectedShelving = newDiv;
            }

            // Обновляем видимость режима
            const shelves = document.querySelectorAll('.shelves-container .my-div');
            shelves.forEach(shelf => {
                shelf.classList.toggle('delete-shelf-mode', isDeleteShelfMode);
            });

            if (isDeleteShelfMode) {
                deleteModeBtn.title = 'Выключить режим удаления полок';
                console.log('Режим удаления полок включен');
            } else {
                deleteModeBtn.title = 'Режим удаления полок';
                console.log('Режим удаления полок выключен');
            }
        });

        // Обработчик клика на стеллаж — выбор стеллажа (с toggle)
        newDiv.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return; // Игнорируем клик по кнопкам

            const container = document.getElementById('creating_shelving');
            const allShelvings = container.querySelectorAll('.my-div:not(.shelves-container .my-div)');

            if (selectedShelving === newDiv) {
                // Повторный клик: показываем все стеллажи и сбрасываем выбор
                allShelvings.forEach(div => div.style.display = 'block');
                const shelvesContainer = container.querySelector('.shelves-container');
                if (shelvesContainer) {
                    shelvesContainer.innerHTML = ''; // Очищаем контейнер полок
                }
                selectedShelving = null;
                isDeleteShelfMode = false; // Сбрасываем режим удаления полок при сбросе выбора
            } else {
                // Первый клик: скрываем все, показываем выбранный
                allShelvings.forEach(div => div.style.display = 'none');
                container.insertBefore(newDiv, container.firstChild);
                newDiv.style.display = 'block';

                // Создаём или очищаем контейнер для полок
                let shelvesContainer = container.querySelector('.shelves-container');
                if (!shelvesContainer) {
                    shelvesContainer = document.createElement('div');
                    shelvesContainer.className = 'shelves-container';
                    container.appendChild(shelvesContainer);
                } else {
                    shelvesContainer.innerHTML = '';
                }

                loadShelvesForShelving(nameSpan.textContent, shelvesContainer);
                selectedShelving = newDiv; // Запоминаем выбранный
            }
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
                if (selectedShelving === shelf) {
                    selectedShelving = null; // Сбрасываем выбор, если удаляем выбранный
                }
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

// Обработчик клика по полке в режиме удаления
container.addEventListener('click', event => {
    if (!isDeleteShelfMode) return;

    if (event.target.classList.contains('my-div') && event.target.parentElement.classList.contains('shelves-container')) {
        const shelf = event.target;
        const shelfName = shelf.querySelector('span').textContent || 'Без названия';
        const shelvingName = selectedShelving ? selectedShelving.querySelector('span').textContent : '';

        showConfirm(
            `Вы хотите удалить полку: "${shelfName}" из стеллажа "${shelvingName}"?`,
            () => {
                // Да - удаляем
                shelf.remove();
                // Обновляем localStorage
                let shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
                if (shelvesData[shelvingName]) {
                    const index = shelvesData[shelvingName].indexOf(shelfName);
                    if (index !== -1) {
                        shelvesData[shelvingName].splice(index, 1);
                        localStorage.setItem('shelves', JSON.stringify(shelvesData));
                    }
                }
                console.log(`Полка "${shelfName}" удалена из стеллажа "${shelvingName}"`);
            },
            () => {
                // Нет - ничего не делаем
                console.log(`Удаление полки "${shelfName}" отменено`);
            }
        );
    }
});

// Сохранение стеллажей
function saveShelving() {
    const shelvings = document.querySelectorAll('.my-div:not(.shelves-container .my-div)');
    const shelfData = Array.from(shelvings).map(shelf => shelf.querySelector('span').textContent);
    localStorage.setItem('shelvings', JSON.stringify(shelfData));
}

// Функция загрузки полок для стеллажа
function loadShelvesForShelving(shelvingName, shelvesContainer) {
    const shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
    const shelves = shelvesData[shelvingName] || [];

    shelves.forEach(shelfName => {
        const newShelfDiv = document.createElement('div');
        newShelfDiv.className = 'my-div';

        const shelfSpan = document.createElement('span');
        shelfSpan.textContent = shelfName;
        newShelfDiv.appendChild(shelfSpan);

        // Создаём 3 кнопки для полки
        for (let i = 0; i < 3; i++) {
            const btn = document.createElement('button');
            btn.textContent = '';
            newShelfDiv.appendChild(btn);
        }

        // Кнопка 1: Удаление полки (вторая дочерний элемент)
        const deleteShelfBtn = newShelfDiv.children[1];
        deleteShelfBtn.title = 'Удалить полку';
        deleteShelfBtn.addEventListener('click', () => {
            showConfirm(
                `Вы хотите удалить полку: "${shelfName}"?`,
                () => {
                    newShelfDiv.remove();
                    // Обновляем localStorage
                    let shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
                    if (shelvesData[shelvingName]) {
                        const index = shelvesData[shelvingName].indexOf(shelfName);
                        if (index !== -1) {
                            shelvesData[shelvingName].splice(index, 1);
                            localStorage.setItem('shelves', JSON.stringify(shelvesData));
                        }
                    }
                    console.log(`Полка "${shelfName}" удалена`);
                },
                () => {
                    console.log(`Удаление полки "${shelfName}" отменено`);
                }
            );
        });

        // Кнопка 2: Переименование полки (третий дочерний элемент)
        const renameShelfBtn = newShelfDiv.children[2];
        renameShelfBtn.title = 'Переименовать полку';
        renameShelfBtn.addEventListener('click', () => {
            const oldName = shelfSpan.textContent;
            const newName = prompt('Введите новое имя полки:', oldName);
            if (newName && newName.trim() && newName.trim() !== oldName) {
                shelfSpan.textContent = newName.trim();
                // Обновляем localStorage
                let shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
                if (shelvesData[shelvingName]) {
                    const index = shelvesData[shelvingName].indexOf(oldName);
                    if (index !== -1) {
                        shelvesData[shelvingName][index] = newName.trim();
                        localStorage.setItem('shelves', JSON.stringify(shelvesData));
                    }
                }
            }
        });

        shelvesContainer.appendChild(newShelfDiv);
    });
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

        // Кнопка 1: Переименование стеллажа (вторая дочерний элемент)
        const renameBtn = newDiv.children[1];
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

        // Кнопка 2: Создание полки (третий дочерний элемент)
        const createShelfBtn = newDiv.children[2];
        createShelfBtn.title = 'Создать полку';
        createShelfBtn.addEventListener('click', () => {
            const shelfName = prompt('Как назвать полку?');
            if (!shelfName || shelfName.trim() === '') {
                console.log('Создание полки отменено или пустое название!');
                return;
            }
            const trimmedShelfName = shelfName.trim();

            // Если стеллаж не выбран, выбираем его (разворачиваем)
            if (selectedShelving !== newDiv) {
                const container = document.getElementById('creating_shelving');
                const allShelvings = container.querySelectorAll('.my-div:not(.shelves-container .my-div)');
                allShelvings.forEach(div => div.style.display = 'none');
                container.insertBefore(newDiv, container.firstChild);
                newDiv.style.display = 'block';

                let shelvesContainer = container.querySelector('.shelves-container');
                if (!shelvesContainer) {
                    shelvesContainer = document.createElement('div');
                    shelvesContainer.className = 'shelves-container';
                    container.appendChild(shelvesContainer);
                } else {
                    shelvesContainer.innerHTML = '';
                }

                loadShelvesForShelving(nameSpan.textContent, shelvesContainer);
                selectedShelving = newDiv;
            }

            // Добавляем полку в DOM
            const shelvesContainer = document.querySelector('.shelves-container');
            if (shelvesContainer) {
                const newShelfDiv = document.createElement('div');
                newShelfDiv.className = 'my-div';

                const shelfSpan = document.createElement('span');
                shelfSpan.textContent = trimmedShelfName;
                newShelfDiv.appendChild(shelfSpan);

                // Создаём 3 кнопки для полки
                for (let i = 0; i < 3; i++) {
                    const btn = document.createElement('button');
                    btn.textContent = '';
                    newShelfDiv.appendChild(btn);
                }

                // Кнопка 1: Удаление полки (вторая дочерний элемент)
                const deleteShelfBtn = newShelfDiv.children[1];
                deleteShelfBtn.title = 'Удалить полку';
                deleteShelfBtn.addEventListener('click', () => {
                    showConfirm(
                        `Вы хотите удалить полку: "${trimmedShelfName}"?`,
                        () => {
                            newShelfDiv.remove();
                            // Обновляем localStorage
                            let shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
                            if (shelvesData[nameSpan.textContent]) {
                                const index = shelvesData[nameSpan.textContent].indexOf(trimmedShelfName);
                                if (index !== -1) {
                                    shelvesData[nameSpan.textContent].splice(index, 1);
                                    localStorage.setItem('shelves', JSON.stringify(shelvesData));
                                }
                            }
                            console.log(`Полка "${trimmedShelfName}" удалена`);
                        },
                        () => {
                            console.log(`Удаление полки "${trimmedShelfName}" отменено`);
                        }
                    );
                });

                // Кнопка 2: Переименование полки (третий дочерний элемент)
                const renameShelfBtn = newShelfDiv.children[2];
                renameShelfBtn.title = 'Переименовать полку';
                renameShelfBtn.addEventListener('click', () => {
                    const oldName = shelfSpan.textContent;
                    const newName = prompt('Введите новое имя полки:', oldName);
                    if (newName && newName.trim() && newName.trim() !== oldName) {
                        shelfSpan.textContent = newName.trim();
                        // Обновляем localStorage
                        let shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
                        if (shelvesData[nameSpan.textContent]) {
                            const index = shelvesData[nameSpan.textContent].indexOf(oldName);
                            if (index !== -1) {
                                shelvesData[nameSpan.textContent][index] = newName.trim();
                                localStorage.setItem('shelves', JSON.stringify(shelvesData));
                            }
                        }
                    }
                });

                shelvesContainer.appendChild(newShelfDiv);

                // Сохраняем в localStorage
                let shelvesData = JSON.parse(localStorage.getItem('shelves') || '{}');
                if (!shelvesData[nameSpan.textContent]) {
                    shelvesData[nameSpan.textContent] = [];
                }
                shelvesData[nameSpan.textContent].push(trimmedShelfName);
                localStorage.setItem('shelves', JSON.stringify(shelvesData));
            }
        });

        // Кнопка 3: Режим удаления полок (четвертый дочерний элемент)
        const deleteModeBtn = newDiv.children[3];
        deleteModeBtn.title = 'Режим удаления полок';
        deleteModeBtn.addEventListener('click', () => {
            // Переключаем режим удаления полок
            isDeleteShelfMode = !isDeleteShelfMode;

            // Если стеллаж не выбран, выбираем его (разворачиваем)
            if (selectedShelving !== newDiv) {
                const container = document.getElementById('creating_shelving');
                const allShelvings = container.querySelectorAll('.my-div:not(.shelves-container .my-div)');
                allShelvings.forEach(div => div.style.display = 'none');
                container.insertBefore(newDiv, container.firstChild);
                newDiv.style.display = 'block';

                let shelvesContainer = container.querySelector('.shelves-container');
                if (!shelvesContainer) {
                    shelvesContainer = document.createElement('div');
                    shelvesContainer.className = 'shelves-container';
                    container.appendChild(shelvesContainer);
                } else {
                    shelvesContainer.innerHTML = '';
                }

                loadShelvesForShelving(nameSpan.textContent, shelvesContainer);
                selectedShelving = newDiv;
            }

            // Обновляем видимость режима
            const shelves = document.querySelectorAll('.shelves-container .my-div');
            shelves.forEach(shelf => {
                shelf.classList.toggle('delete-shelf-mode', isDeleteShelfMode);
            });

            if (isDeleteShelfMode) {
                deleteModeBtn.title = 'Выключить режим удаления полок';
                console.log('Режим удаления полок включен');
            } else {
                deleteModeBtn.title = 'Режим удаления полок';
                console.log('Режим удаления полок выключен');
            }
        });

        // Обработчик клика на стеллаж — выбор стеллажа (с toggle)
        newDiv.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') return; // Игнорируем клик по кнопкам

            const container = document.getElementById('creating_shelving');
            const allShelvings = container.querySelectorAll('.my-div:not(.shelves-container .my-div)');

            if (selectedShelving === newDiv) {
                // Повторный клик: показываем все стеллажи и сбрасываем выбор
                allShelvings.forEach(div => div.style.display = 'block');
                const shelvesContainer = container.querySelector('.shelves-container');
                if (shelvesContainer) {
                    shelvesContainer.innerHTML = ''; // Очищаем контейнер полок
                }
                selectedShelving = null;
                isDeleteShelfMode = false; // Сбрасываем режим удаления полок при сбросе выбора
            } else {
                // Первый клик: скрываем все, показываем выбранный
                allShelvings.forEach(div => div.style.display = 'none');
                container.insertBefore(newDiv, container.firstChild);
                newDiv.style.display = 'block';

                // Создаём или очищаем контейнер для полок
                let shelvesContainer = container.querySelector('.shelves-container');
                if (!shelvesContainer) {
                    shelvesContainer = document.createElement('div');
                    shelvesContainer.className = 'shelves-container';
                    container.appendChild(shelvesContainer);
                } else {
                    shelvesContainer.innerHTML = '';
                }

                loadShelvesForShelving(nameSpan.textContent, shelvesContainer);
                selectedShelving = newDiv; // Запоминаем выбранный
            }
        });

        // Добавляем стеллаж в контейнер
        container.appendChild(newDiv);
    });
}

// Загружаем стеллажи при загрузке страницы
loadShelving();
