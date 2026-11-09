# IG Motors

Responsywna, wielostronicowa witryna IG Motors w czarno-czerwonej stylistyce. Strona główna, katalog, rozbudowane O nas, realizacje, kontakt i 10 osobnych stron samochodów. Implementacja jest oryginalna, inspirowana wskazanym wzorem TemplateMonster 388655.

## Uruchomienie

Strona jest statyczna, bez instalowania zależności i bez etapu kompilacji. Otwórz `dist/index.html` w przeglądarce albo uruchom z tego folderu:

```powershell
& '../.tools/node.exe' server.mjs
```

Adres podglądu: `http://localhost:4173`.

## Treść

- `dist/cars.js` — samochody, opisy, parametry i powiązania z postami źródłowymi.
- `dist/assets/` — zdjęcia pobrane z publicznych postów profilu `@igmotors__` oraz lokalne fonty.
- `content/` — dokumentacja źródeł i dat publikacji.
- `dist/styles.css` — motyw oraz układy mobilne.
- `dist/catalog-core.js` — łączenie filtrów, sortowanie i zapis wyszukiwania w adresie URL.
- `dist/catalog.js` — filtry katalogu, wybór marki po logo i usuwanie aktywnych filtrów.
- `dist/shared.js` — menu, prywatność i przygotowanie wiadomości.
- `dist/detail.js` — miniatury galerii i powiększanie zdjęć samochodu.
- `dist/hero-slider.js` — cztery zdjęcia banera, rotacja co 6,5 sekundy, strzałki, wskaźniki i pauza.
- `dist/motion.js` i `dist/motion.css` — animacje wejścia na wszystkich podstronach, również dla wyników filtrowania. Obsługują ograniczenie ruchu i nawigację klawiaturą.
- `source/home.html` — źródłowy układ strony głównej.
- `content/about.html` — rozwinięcie tekstu strony O nas.
- `scripts/build-pages.mjs` — generowanie 15 stron ze wspólną nawigacją.

Katalog obejmuje cztery oferty odczytane z OTOMOTO 09.11.2026 oraz sześć samochodów z Instagrama o dostępności wymagającej potwierdzenia. Ceny z dawnych postów są oznaczone. Zdjęcia aktualnych ogłoszeń OTOMOTO wykorzystano za zgodą użytkownika. Sprzedane realizacje są pokazane oddzielnie. Oferta nie synchronizuje się automatycznie.

Wyszukiwanie: słowa w opisie i wyposażeniu, logo marki, marka, model, stan, nadwozie, paliwo, skrzynia, zakres ceny, rocznika, maksymalny przebieg i minimalna moc. Dostępne jest pięć sposobów sortowania. Parametry wyszukiwania można udostępnić w linku.

Po edycji danych, treści lub generatora przebuduj strony:

```powershell
& '../.tools/node.exe' scripts/build-pages.mjs
```

Sekcja kontakt przygotowuje wiadomość do skopiowania i wysłania na Instagramie. Nie wysyła danych ani nie udaje działającego zaplecza formularza. Strona nie używa analityki ani cookies.
