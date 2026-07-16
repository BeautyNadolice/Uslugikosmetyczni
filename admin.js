const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxptmseksKkEens4-K-dwX0TaQNM00vMWUcK2BCQ2USdE6Z6u2NbMBmHEPdXvANnd591Q/exec";

// --- СОСТОЯНИЕ И ЛОКАЛЬНАЯ ИСТОРИЯ (UNDO / REDO) ---
let currentServices = []; // Текущее состояние списка услуг на экране
let undoStack = [];       // Стек для отмены действий (Ctrl+Z)
let redoStack = [];       // Стек для возврата действий (Ctrl+Y)
let hasUnsavedChanges = false; // Флаг несохраненных изменений

document.addEventListener("DOMContentLoaded", () => {
    // Загружаем услуги и текущие настройки из таблицы при старте
    loadAdminServices();
    loadSettings();

    // Защита от случайного закрытия вкладки
    window.addEventListener("beforeunload", (e) => {
        if (hasUnsavedChanges) {
            e.preventDefault();
            e.returnValue = "Masz niezapisane zmiany в Szkicach! Czy na pewno chcesz opuścić stronę?";
        }
    });

    // Навешиваем горячие клавиши (Ctrl+Z / Ctrl+Y) для удобства
    document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            e.preventDefault();
            undo();
        }
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
            e.preventDefault();
            redo();
        }
    });
});

// 1. Переключение вкладок
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.style.display = 'block';
    }
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

// 2. Загрузка настроек из Google Таблицы
async function loadSettings() {
    try {
        const response = await fetch(APPS_SCRIPT_URL + "?checkBusy=true");
        const data = await response.json();
        if (data.settings) {
            document.getElementById("work_start_hour").value = data.settings.work_start
