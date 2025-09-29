// Ищем кнопку
const button = document.getElementById('creating_shelving_b');

// Проверяем, найдена ли кнопка
if (button) {
    button.addEventListener('click', function() {
        // Запрашиваем название у пользователя
        let shelfName = prompt('Как назвать стеллаж?');
        
        // Проверяем: если отменили или ввели пустое — ничего не делаем
        if (!shelfName || shelfName.trim() === '') {
            console.log('Создание отменено или пустое название!');
            return;  // Выходим из функции
        }
        
        // Создаём новый div
        let newDiv = document.createElement('div');
        
        // Настраиваем его (добавляем текст и класс)
        newDiv.textContent = shelfName.trim();  // Используем введённое название (без лишних пробелов)
        newDiv.className = 'my-div';  // Для стилизации в CSS
        
        // Ищем контейнер по ID
        const container = document.getElementById('creating_shelving');
        
        // Проверяем, найден ли контейнер, и добавляем
        if (container) {
            container.appendChild(newDiv);
            // Если у вас есть функция saveShelving — вызываем её здесь
            if (typeof saveShelving === 'function') {
                saveShelving();
            }
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
        const shelfName = shelf.textContent || 'Без названия';

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