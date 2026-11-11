# IG Motors

Responsywna, wielostronicowa witryna IG Motors w czarno-czerwonej stylistyce. Strona główna, katalog, rozbudowane O nas, realizacje, kontakt i 10 osobnych stron samochodów, blog, formularz autorów oraz panel redakcji. Implementacja jest oryginalna, inspirowana wskazanym wzorem TemplateMonster 388655.

## Uruchomienie

Strona nie wymaga instalacji zależności. Blog korzysta z serwera i bazy danych. Z tego folderu uruchom podgląd poleceniem:

```powershell
& '../.tools/node.exe' server.mjs
```

Adres podglądu: `http://localhost:4173`.

## Treść

- `public/cars.js` — samochody, opisy, parametry i powiązania z postami źródłowymi.
- `public/assets/` — zdjęcia pobrane z publicznych postów profilu `@igmotors__` oraz lokalne fonty.
- `content/` — dokumentacja źródeł i dat publikacji.
- `public/styles.css` — motyw oraz układy mobilne.
- `public/catalog-core.js` — łączenie filtrów, sortowanie i zapis wyszukiwania w adresie URL.
- `public/catalog.js` — filtry katalogu, wybór marki po logo i usuwanie aktywnych filtrów.
- `public/shared.js` — menu, prywatność i przygotowanie wiadomości.
- `public/detail.js` — miniatury galerii i powiększanie zdjęć samochodu.
- `public/hero-slider.js` — cztery zdjęcia banera, rotacja co 6,5 sekundy, strzałki, wskaźniki i pauza.
- `public/motion.js` i `public/motion.css` — animacje wejścia na wszystkich podstronach, również dla wyników filtrowania. Obsługują ograniczenie ruchu i nawigację klawiaturą.
- `source/home.html` — źródłowy układ strony głównej.
- `content/about.html` — rozwinięcie tekstu strony O nas.
- `scripts/build-pages.mjs` — generowanie 19 stron ze wspólną nawigacją.

Katalog obejmuje cztery oferty odczytane z OTOMOTO 09.11.2026 oraz sześć samochodów z Instagrama o dostępności wymagającej potwierdzenia. Ceny z dawnych postów są oznaczone. Zdjęcia aktualnych ogłoszeń OTOMOTO wykorzystano za zgodą użytkownika. Sprzedane realizacje są pokazane oddzielnie. Oferta nie synchronizuje się automatycznie.

Wyszukiwanie: słowa w opisie i wyposażeniu, logo marki, marka, model, stan, nadwozie, paliwo, skrzynia, zakres ceny, rocznika, maksymalny przebieg i minimalna moc. Dostępne jest pięć sposobów sortowania. Parametry wyszukiwania można udostępnić w linku.

Po edycji danych, treści lub generatora przebuduj strony:

```powershell
& '../.tools/node.exe' scripts/build-pages.mjs
```

Sekcja kontakt przygotowuje wiadomość do skopiowania i wysłania na Instagramie. Nie wysyła danych ani nie udaje działającego zaplecza formularza. Strona nie używa analityki ani cookies.


## Blog i zapisywanie wpisów

Blog korzysta ze wspólnej bazy Cloudflare D1 (`DB`). Formularz dostępny jest na `dodaj-wpis.html`. Zgłoszenia są zapisywane jako oczekujące i nie są widoczne publicznie przed zatwierdzeniem. Przykładowy artykuł jest częścią treści strony.

Panel `admin-blog.html` korzysta z logowania ChatGPT. Serwer dopuszcza tylko właściciela wskazanego w sekretnej zmiennej `BLOG_ADMIN_EMAIL`. Podpis sesji formularza korzysta z `BLOG_TOKEN_SECRET`. Wartości są ustawione w Sites, a nie w kodzie. Serwer weryfikuje treść, zgodę, pochodzenie żądania, podpis formularza i limit 5 zgłoszeń dziennie. Publiczna odpowiedź nie zawiera informacji o moderatorze ani kluczy technicznych.

`public/` jest źródłem zasobów i stron. `scripts/build-worker.mjs` generuje `dist/client/` i `dist/server/index.js`. Manifest nie zawiera trybu static. Migracje są w `drizzle/`; dane i przykładowy wpis nie są wstawiane przez migracje.

Uruchomienie podglądu: `node server.mjs` (Node.js 22.13 lub nowszy). Podgląd zapisuje zgłoszenia w ignorowanym `.local/blog.sqlite`. Logowanie redakcji jest symulowane wyłącznie w lokalnym serwerze nasłuchującym na pętli zwrotnej. Produkcja korzysta z tożsamości przekazanej przez platformę Sites.

Testy API: `node --test tests/blog.test.mjs`. Budowanie: `node scripts/build-worker.mjs`.
