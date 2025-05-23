# Zибен Афиша

## Состав команды:
1. **Туймуков Егор** - <span style="color:red">*Team Lead & Frontend Developer*</span>
2. **Алгиничев Дмитрий** - <span style="color:red">*Backend Developer*</span>
3. **Строков Георгий** - <span style="color:red">*Backend Developer*</span>
4. **Шнайдер Дарья** - <span style="color:red">*Graphic Designer*</span>
5. **Баянов Владислав** - <span style="color:red">*Frontend Developer*</span>

## Описание проекта:
Zибен Афиша — это web-приложение, разработанное для упрощения поиска, бронирования и покупки билетов на массовые мероприятия, такие как концерты, спортивные события и культурные представления. Приложение ориентировано на широкую аудиторию, предлагая персонализированный подход благодаря расширенной фильтрации по жанру, городу, дате, цене и рейтингу. Пользователи могут легко войти в систему через интуитивный интерфейс с поддержкой логина и пароля, приобрести билеты, указав количество и данные карты, а также управлять своими покупками в личном кабинете. Функционал включает возврат билетов с простым процессом ввода данных, просмотр детальной информации о мероприятиях (дата, место, цена), а также интеграцию с Ticketmaster API для получения актуальных данных. Приложение выделяется стильным дизайном и удобством использования, что делает его идеальным инструментом для планирования культурного досуга.

## 🚀 Функционал

- **🔑 Регистрация и вход:**
  Безопасная аутентификация с хэшированием паролей и JWT-токенами.

- **🎫 Бронирование билетов:**
  Удобный интерфейс для выбора мероприятий и покупки билетов с имитацией оплаты.

- **🔍 Расширенная фильтрация:**
  Поиск мероприятий по жанру, городу, дате, цене и рейтингу.

- **⭐ Система рейтингов и отзывов:**
  Пользователи могут оставлять оценки и отзывы о мероприятиях.

- **🔔 Уведомления:**
  Система уведомлений о покупках, возвратах и персонализированных рекомендациях.

- **👤 Личный кабинет:**
  Управление профилем, предпочтениями, историей транзакций и уведомлениями.

- **📊 Интеграция с API:**
  Генерация данных о мероприятиях через Ticketmaster API для реалистичного тестирования.

- **❓ Возврат билетов:**
  Возможность возврата билетов в течение 24 часов после покупки.

## Технологический стек

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) ![SQLite](https://img.shields.io/badge/SQLite-07405E?style=flat-square&logo=sqlite&logoColor=white) ![Pydantic](https://img.shields.io/badge/Pydantic-FF6F61?style=flat-square&logo=pydantic&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black) ![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

## Ссылки на ресурсы:
- ![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)[Репозиторий проекта](https://github.com/Egor-Pomidor-pdf/Python-Project#)
- ![Notion](https://img.shields.io/badge/Notion-000000?style=flat-square&logo=notion&logoColor=white)[Таск-трекер Notion](https://www.notion.so/Resources-1ac83641f7ab81c0aee2c8e009121929?p=1ac83641f7ab80af9fdbee9e513a4d50&pm=s)
- ![Figma](https://img.shields.io/badge/Figma-F24E1E?style=flat-square&logo=figma&logoColor=white)[Макет на Figma](https://www.figma.com/design/DlNAubvnVvWGtQP1QCFsDF/%D1%81%D0%B0%D0%B9%D1%82?node-id=0-1&t=gV54C6zdYlhL8os1-1)
- [Рабочий процесс таск-трекера](./forReadmeFile/Снимок.PNG)
- [Распределение прав доступа](./forReadmeFile/распределениеПрав.jpg)
- [Бизнес-процессы](./forReadmeFile/БизнессПроцессыФото.PNG)
- [Схема базы данных](./forReadmeFile/Схема_БД.drawio.png)
- [Стадии реализации продукта](./forReadmeFile/СтадииРазвитияПродукта.PNG)

## Запуск проекта

1. **Установка зависимостей:**
    ```bash
    pip install -r requirements.txt
    npm install
    ```
2. **Запуск сервера:**
    ```bash
    uvicorn ticket_booking.main:app --host 0.0.0.0 --port 8000
    ```
    **Запуск сайта:**
    ```bash
    npm start
    ```

## Демонстрация проекта  
<figure>
  <img src="./qrcode.png" alt="YouTube QR" width="150" style="display: block; margin: 0 auto;">
  <figcaption style="text-align: center;">Сканируйте QR-код для просмотра видео</figcaption>
</figure>

## ...а также платформы, где представлены наши результаты
<div style="display: flex; justify-content: space-around;">
  <figure>
    <img src="https://img.shields.io/badge/Notion-000000?style=flat-square&logo=notion&logoColor=white" alt="qr notion" width="100">
    <figcaption style="text-align: center;">Notion</figcaption>
  </figure>
  <figure>
    <img src="https://img.shields.io/badge/Figma-F24E1E?style=flat-square&logo=figma&logoColor=white" alt="qr figma" width="100">
    <figcaption style="text-align: center;">Figma</figcaption>
  </figure>
</div>

## Zибен Events

![project icon](./static/icons/ZibenАфиша%20логотип.jpg)
