// Конфигурация: укажи ID своей Google Таблицы
const SPREADSHEET_ID = "1FVmVjlhSOXKmalhaU0UAwwpNttKH1BBqpej1zChBBz";

// 1. ПОИСК КЛИЕНТА (doGet)
function doGet(e) {
  var phone = e.parameter.phone;
  var result = { found: false, name: "" };
  
  if (!phone) {
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
  
  // Очищаем пришедший телефон от лишних символов (пробелов, плюсов)
  var cleanTargetPhone = phone.replace(/\D/g, ""); 
  
  // Сначала ищем клиента в нашей новой Google Таблице (базе данных)
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
  var data = sheet.getDataRange().getValues();
  
  // Проходим по строкам таблицы (пропуская заголовок)
  for (var i = 1; i < data.length; i++) {
    var sheetPhone = String(data[i][2]).replace(/\D/g, ""); // Колонка C (Телефон)
    if (sheetPhone === cleanTargetPhone || sheetPhone.indexOf(cleanTargetPhone) !== -1) {
      result.found = true;
      result.name = data[i][1]; // Колонка B (Имя)
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Если в таблице не нашли — ищем «по старинке» в Google Календаре за последний год
  var calendar = CalendarApp.getDefaultCalendar();
  var now = new Date();
  var oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  var events = calendar.getEvents(oneYearAgo, now);
  
  for (var j = 0; j < events.length; j++) {
    var event = events[j];
    var title = event.getTitle() || "";
    var desc = event.getDescription() || "";
    var combinedText = (title + " " + desc).replace(/\D/g, "");
    
    if (combinedText.indexOf(cleanTargetPhone) !== -1) {
      result.found = true;
      result.name = title.split(/[+\d]/)[0].trim();
      break; 
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

// 2. ЗАПИСЬ НОВОГО КЛИЕНТА В КАЛЕНДАРЬ И ТАБЛИЦУ (doPost)
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    // А. Запись в Google Календарь
    var calendar = CalendarApp.getDefaultCalendar();
    var title = data.name + " (" + data.phone + ")";
    var startTime = new Date(data.date);
    var endTime = new Date(startTime.getTime() + (60 * 60 * 1000)); // Визит длится 1 час
    
    calendar.createEvent(title, startTime, endTime, {
      description: "Zgoda RODO: TAK. Usługa: " + data.service
    });
    
    // Б. Запись в Google Таблицу (Базу Данных)
    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    // Форматируем текущую дату (когда была сделана запись)
    var submissionDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    // Форматируем дату визита для таблицы
    var appointmentDateFormatted = Utilities.formatDate(startTime, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm");
    
    // Добавляем строку с данными в конец таблицы
    sheet.appendRow([
      submissionDate,             // A: Дата записи
      data.name,                  // B: Имя и Фамилия
      data.phone,                 // C: Телефон
      data.service,               // D: Услуга
      appointmentDateFormatted,   // E: Время визита
      "TAK"                       // F: Согласие RODO
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({success: true})).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({success: false, error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
