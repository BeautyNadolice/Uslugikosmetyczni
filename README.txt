NAIL ART — INDEX V21.72 / TEST-DEV PACKAGE
Data przygotowania: 15.11.2026

ZAKRES
Pakiet zawiera pełne środowisko WWW przekazane w kandydacie V21.72: INDEX, edytor INDEX,
pliki i assety potrzebne do lokalnego testu oraz zastany snapshot ADMIN/CRM. Pliki ADMIN/CRM
zostały zachowane bez zmian w tym etapie; nie oznacza to zgody na ich osobną modyfikację,
synchronizację ani deployment.

CO ZAWIERA V21.72
- fizyczny page-design-config.js jest źródłem konfiguracji zwykłego INDEX;
- localStorage jest używany jako szkic wyłącznie w podglądzie DEV (?designPreview=1);
- Service Worker pomija cache page-design-config.js, aby nie zwracać starej konfiguracji;
- rozdzielenie geometrii PC / Telefon z V21.71 pozostaje bez zmian;
- zapis fizyczny edytora działa lokalnie przez File System Access API; przed nadpisaniem
  poprzednia zawartość jest pobierana jako kopia, a po zapisie wykonywany jest ponowny odczyt.

URUCHOMIENIE TESTU
1. Rozpakuj CAŁY ZIP do jednego nowego folderu (nie nadpisuj starego TEST).
2. Uruchom START_INDEX_EDITOR.cmd.
3. W edytorze sprawdź PC i Telefon oraz przełączanie PC → Telefon → PC → Telefon.
4. Nie klikaj „Zapisz plik INDEX”, jeśli nie chcesz fizycznie zmieniać page-design-config.js.
5. Pozostaw pierwszy serwer uruchomiony albo uruchom START_INDEX_LOCAL_SERVER.cmd — drugi
   proces wybierze kolejny wolny port 8080–8090.
6. Otwórz zwykły INDEX z drugiego adresu. Porównaj geometrię PC/Telefon z edytorem.
7. Potwierdź, że zwykły INDEX nie dziedziczy szkicu DEV z localStorage i korzysta z fizycznego
   page-design-config.js. Powtórz PC → Telefon → PC → Telefon.

WAŻNE
- START_INDEX_EDITOR.cmd, START_INDEX_LOCAL_SERVER.cmd i START_INDEX_LOCAL_SERVER.ps1
  są lokalnymi narzędziami testowymi. Nie przesyłaj ich na publiczny hosting.
- ADMIN/CRM jest zawarty wyłącznie jako niezmieniony snapshot środowiska. ADMIN pozostaje
  chronionym zakresem i wymaga osobnej wyraźnej zgody przed jego zmianą/synchronizacją/
  wdrożeniem. W tym pakiecie nie poprawiano logiki ADMIN ani Google Apps Script.
- Nie wykonano publikacji do GitHub, Google Drive ani produkcji. Nie wykonano deploymentu.
- Automatyczny test przeglądarkowy Chromium nie zakończył się w środowisku przygotowania;
  wymagany jest test użytkownika w Edge/Chrome na docelowym komputerze i telefonie.

PLIKI I KONTROLA
- VALIDATION_REPORT.json — wyniki walidacji i ograniczenia.
- FILE_MANIFEST_SHA256.json — rozmiary i SHA-256 plików pakietu (manifest nie hashuje sam siebie).
- index-editor.js.bak został zachowany osobno w NAIL_ART_INDEX_V21_72_EDITOR_JS_BACKUP_ONLY.zip;
  nie jest umieszczony w aktywnym katalogu WWW.
