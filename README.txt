INDEX V21.30 — DEV VISUAL EDITOR / VIEWPORT FIT
2026-09-06

Cel:
- nie zgadywać kolejnych wymiarów na podstawie screenów;
- dać użytkownikowi wizualny edytor strony klienta w TEST/DEV.

Uruchomienie lokalne:
1. Najprościej: START_INDEX_EDITOR.cmd — uruchamia serwer i od razu otwiera edytor.
2. Alternatywnie START_INDEX_LOCAL_SERVER.cmd — otwiera zwykły index; wtedy wejdź na /index-editor.html na tym samym porcie.

W DEV ADMIN dodano zakładkę „Edytor strony”, która osadza index-editor.html.

Co można edytować osobno dla PC i telefonu:
- rozmiar i pozycję karty,
- padding karty i kadr tła,
- kadr/zoom sceny salonu,
- szerokość głównej kolumny,
- logo (rozmiar, X/Y, pionowe rozciągnięcie),
- hasło (tekst, rozmiar, szerokość, X/Y, interlinia, grubość, kolor),
- CTA (tekst, rozmiar, X/Y, wysokość, font, radius, gradient, kolor tekstu),
- galerię (szerokość, X/Y, odstępy, nagłówki, radius, cover/contain, 1/2/auto preview),
- stopkę (tekst, szerokość, X/Y, font, kolor),
- widoczność elementów.

Obsługa:
- kliknij element w podglądzie albo przycisk Karta/Logo/Hasło/CTA/Galeria/Stopka,
- zaznaczony element można przeciągać myszą,
- suwaki działają na żywo,
- „Preset: szeroki start” szybko cofa zbyt wąski układ V21.27,
- „Zapisz TEST lokalnie” zapisuje konfigurację wyłącznie w localStorage przeglądarki,
- eksport/import JSON pozwala przenieść ustawienia lub przekazać je do finalnego wdrożenia,
- Reset usuwa lokalną konfigurację i wraca do bazowego V21.27.

Bez zmian:
- booking.js / rezerwacja,
- Apps Script API,
- dynamiczne pobieranie galerii z Google Drive,
- lightbox/swipe,
- assety logo/karty/sceny.

V21.29 — poprawka po realnym smoke w Brave:
- lewy panel edytora działał, ale ramka PODGLĄD LIVE zwijała się i prawa strona była pusta;
- rozmiar podglądu PC/Telefon jest teraz wyliczany deterministycznie w px przez JS;
- usunięto zależność ramki od procentowego min() wewnątrz CSS Grid;
- cache-bust index-editor.css/js podniesiony do 1.1;
- sama strona klienta, booking, API, galeria i assety pozostają bez zmian względem V21.28.


V21.30 — poprawka po realnym smoke V21.29:
- ramka PODGLĄD LIVE jest już widoczna, ale na screenie była przesunięta głęboko w dół i częściowo poza ekran;
- prawy panel edytora ma teraz jawne 100vh i wyrównuje podgląd od góry zamiast pionowo go centrować;
- JS ogranicza wysokość ramki do faktycznie widocznego viewportu (uwzględnia pozycję hosta i padding);
- proporcje 16:9 dla PC i 9:19.5 dla telefonu pozostają zachowane;
- cache-bust index-editor.css/js podniesiony do 1.2;
- sama strona klienta, booking, API, galeria i assety nie zostały zmienione.
