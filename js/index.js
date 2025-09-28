// Ищем кнопку
const button = document.getElementById('creating_shelving_b');

// Проверяем, найдена ли кнопка
if (button) {
    button.addEventListener('click', function() {
        // Создаём новый div
        let newDiv = document.createElement('div');
        
        // Настраиваем его (добавляем текст и класс)
        newDiv.textContent = 'Привет, это новый стеллаж!';  // Измените текст на нужный
        newDiv.className = 'my-div';  // Для стилизации в CSS
        
        // Ищем контейнер по ID
        const container = document.getElementById('creating_shelving');
        
        // Проверяем, найден ли контейнер, и добавляем
        if (container) {
            container.appendChild(newDiv);
        } else {
            console.error('Контейнер с ID "creating_shelving" не найден!');
        }
    });
} else {
    console.error('Кнопка с ID "creating_shelving_b" не найдена!');
}