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


    // Ищем кнопку удаления
    const deleteButton = document.getElementById('delete_shelving_b');

    // Проверяем, найдена ли кнопка
    if (deleteButton) {
        deleteButton.addEventListener('click', function() {
            // Ищем контейнер
            const container = document.getElementById('creating_shelving');
            
            // Проверяем, найден ли контейнер и есть ли стеллажи
            if (container && container.lastElementChild) {
                container.removeChild(container.lastElementChild);  // Удаляем последний стеллаж
            } else {
                console.log('Нет стеллажей для удаления!');  // Или alert, если хотите
            }
        });
    } else {
        console.error('Кнопка с ID "delete_shelving_b" не найдена!');
    }