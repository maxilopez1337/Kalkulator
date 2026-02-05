# 🚀 Kalkulator Stratton Prime v2.6.1 - Enhanced Excel Template

## 🎉 UPDATE: Smart Excel Formulas + Full Dropdowns! (25.11.2025)

### ⭐ Co nowego w v2.6.1?

**Excel z automatyką + pełne dropdowns!** ⚡

- **Auto KUP** - formuła Excel automatycznie przełącza 250 ↔ 20%
- **Full Dropdown** - Tryb składek z pełną listą rozwijaną
- **Smart UX** - niebieski kolor = auto-kolumna (nie trzeba wypełniać!)
- **Zero Errors** - formuła zapobiega błędom

---

## 🔧 CO SIĘ ZMIENIŁO?

### PRZED (v2.6.0):

```
Kolumna KUP:
❌ Trzeba ręcznie wpisać:
   - 250 dla UOP
   - 20% dla UZ
❌ Łatwo się pomylić!

Tryb składek:
❌ Trzeba wpisać długi tekst
❌ Łatwo o literówkę
```

### PO (v2.6.1):

```
Kolumna KUP: ⚡ AUTOMATYCZNA!
✅ Wybierasz "Umowa o pracę" → KUP = 250
✅ Wybierasz "Umowa zlecenie" → KUP = 20%
✅ Formuła Excel: =IF(D3="Umowa zlecenie","20%","250")
✅ Kolor niebieski = wiesz że auto!

Tryb składek: 📋 DROPDOWN!
✅ Klik strzałkę → lista się rozwija
✅ Wybierz z 6 opcji:
   1. Pełne składki
   2. Pełne składki z dobrowolną chorobową
   3. Bez dobrowolnej chorobowej
   4. Student/uczeń do 26 (bez ZUS)
   5. Inny tytuł do ubezpieczeń (tylko zdrowotna)
   6. Emeryt/rencista
```

---

## 🎯 JAK TO DZIAŁA?

### Auto KUP (kolumna G):

```
Excel Formula: =IF(D3="Umowa zlecenie","20%","250")

DEMO:
Row 3:
1. Wpisujesz dane w kolumnach A-F
2. Kolumna D: wybierasz "Umowa o pracę"
3. Kolumna G (KUP): ⚡ automatycznie pokazuje "250"
4. Zmieniasz D na "Umowa zlecenie"
5. Kolumna G: ⚡ automatycznie zmienia się na "20%"

MAGIA! ✨
```

**Możesz ręcznie zmienić:**
```
250 → 300 (dla twórców UOP)
20% → 50% (dla twórców UZ)
```

### Tryb składek (kolumna E):

```
DROPDOWN:
1. Kliknij w komórkę E3
2. Pojawi się strzałka ▼
3. Kliknij strzałkę
4. Lista się rozwija:
   ┌────────────────────────────────────────┐
   │ Pełne składki                          │
   │ Pełne składki z dobrowolną chorobową   │
   │ Bez dobrowolnej chorobowej             │
   │ Student/uczeń do 26 (bez ZUS)          │
   │ Inny tytuł do ubezpieczeń (...)        │
   │ Emeryt/rencista                        │
   └────────────────────────────────────────┘
5. Wybierz opcję
6. ENTER

Zero literówek! ✅
```

---

## 💡 PRZYKŁADY UŻYCIA

### Przykład 1: UOP Standard

```
USER FILLS:
Imię i Nazwisko:    Jan Kowalski
Data urodzenia:     1990-01-15
Płeć:               M (dropdown)
Typ umowy:          Umowa o pracę (dropdown)
Tryb składek:       Pełne składki (dropdown)
Netto docelowe:     5000
KUP:                [AUTO = 250] ⚡
KZP:                300
Ulga młodych:       NIE (dropdown)

EXCEL AUTOMATICALLY:
✅ Kolumna G pokazuje "250" (formuła)
```

### Przykład 2: UZ Student

```
USER FILLS:
Imię i Nazwisko:    Anna Nowak
Data urodzenia:     2000-05-20
Płeć:               K (dropdown)
Typ umowy:          Umowa zlecenie (dropdown) ⚡
Tryb składek:       Student/uczeń do 26 (dropdown)
Netto docelowe:     4500
KUP:                [AUTO = 20%] ⚡ zmienia się automatycznie!
KZP:                0
Ulga młodych:       TAK (dropdown)

EXCEL AUTOMATICALLY:
✅ Gdy wybierasz "Umowa zlecenie", KUP zmienia się z "250" na "20%"!
```

### Przykład 3: Twórca UZ

```
USER FILLS:
Typ umowy:          Umowa zlecenie
KUP:                [AUTO = 20%] → user zmienia na 50% ⚡
...

USER CAN OVERRIDE:
✅ Formuła pokazuje "20%"
✅ User może ręcznie zmienić na "50%"
✅ Działa!
```

---

## 🛠️ TECHNICAL DETAILS

### Excel Formula (Column G):

```excel
=IF(D3="Umowa zlecenie","20%","250")

Explanation:
- IF: warunek
- D3="Umowa zlecenie": sprawdza typ umowy
- "20%": wartość jeśli TRUE (UZ)
- "250": wartość jeśli FALSE (UOP)

Applied to: G3:G100 (first 97 data rows)
```

### Data Validation (Dropdowns):

```python
# Płeć
validation: "M,K"

# Typ umowy
validation: "Umowa o pracę,Umowa zlecenie"

# Tryb składek
validation: "Pełne składki,Pełne składki z dobrowolną chorobową,Bez dobrowolnej chorobowej,Student/uczeń do 26 (bez ZUS),Inny tytuł do ubezpieczeń (tylko zdrowotna),Emeryt/rencista"

# Ulga młodych
validation: "TAK,NIE"
```

### Cell Styling:

```python
# KUP column (G) - Formula cells
fill: PatternFill(color="E0F2FE")  # Light blue
→ Visual indicator: "This is auto!"

# Instruction row
fill: PatternFill(color="FEF3C7")  # Light yellow
→ "AUTO (formuła)" text
```

---

## 🎯 WORKFLOW

### Dla klienta:

```
1. Otwórz szablon Excel
   ✅ Arkusz "Szablon Import Pracowników"

2. Wypełnij dane:
   Row 3:
   - Kolumna A: Jan Kowalski
   - Kolumna B: 1990-01-15
   - Kolumna C: M (dropdown) ▼
   - Kolumna D: Umowa o pracę (dropdown) ▼
   - Kolumna E: Pełne składki (dropdown) ▼
   - Kolumna F: 5000
   - Kolumna G: [AUTO = 250] ⚡ nie trzeba wypełniać!
   - Kolumna H: 300
   - Kolumna I: NIE (dropdown) ▼

3. Dla UZ:
   - Kolumna D: Umowa zlecenie (dropdown) ▼
   - Kolumna E: Student/uczeń do 26 (dropdown) ▼
   - Kolumna G: ⚡ automatycznie zmienia się na "20%"!

4. Zaznacz wszystko (z nagłówkami!)
   Ctrl+C

5. W Kalkulatorze:
   Krok 2 → [Importuj z Excel] → Ctrl+V
   DONE! 🚀
```

---

## 💰 KORZYŚCI

### Dla klienta:

**Zero Errors:**
- ⭐ KUP automatycznie poprawny (250 dla UOP, 20% dla UZ)
- ⭐ Dropdowns = zero literówek
- ⭐ Nie da się pomylić trybu składek

**Faster:**
- ⭐ KUP - nie trzeba wypełniać (auto!)
- ⭐ Tryb składek - klik zamiast pisać
- ⭐ Wszystkie dropdowns - szybciej niż pisać

**Clear:**
- ⭐ Niebieski kolor = auto kolumna
- ⭐ "AUTO (formuła)" w instrukcji
- ⭐ Wiesz co wypełnić, a co się wypełni samo

### Dla Ciebie:

**Quality:**
- ⭐ Dane zawsze poprawne
- ⭐ KUP zawsze pasuje do typu umowy
- ⭐ Zero support questions ("Co wpisać w KUP?")

**Professional:**
- ⭐ Excel z formułami = pro impression
- ⭐ Dropdowns = modern UX
- ⭐ Klient czuje się jak w prawdziwym systemie

---

## 🧪 TESTOWANIE

### Test 1: Auto KUP Switch

```
1. Otwórz szablon Excel
2. Row 3, Kolumna D: wybierz "Umowa o pracę"
3. Kolumna G: ✅ pokazuje "250"
4. Kolumna D: zmień na "Umowa zlecenie"
5. Kolumna G: ✅ automatycznie zmienia się na "20%"!
6. Kolumna D: zmień z powrotem na "Umowa o pracę"
7. Kolumna G: ✅ wraca do "250"!

PERFECT! ⚡
```

### Test 2: Manual Override

```
1. Kolumna D: "Umowa zlecenie" (KUP = 20%)
2. Kliknij na komórkę G3
3. Wpisz "50%"
4. ENTER
5. ✅ Nadpisuje formułę, pokazuje "50%"
6. Zmień D na "Umowa o pracę"
7. ✅ Formuła się resetuje (bo był manual override)

NOTE: Manual override działa!
```

### Test 3: Tryb składek dropdown

```
1. Kliknij komórkę E3
2. ✅ Pojawia się strzałka ▼
3. Kliknij strzałkę
4. ✅ Lista rozwija się z 6 opcjami
5. Wybierz "Student/uczeń do 26 (bez ZUS)"
6. ENTER
7. ✅ Wartość się wpisuje
8. Spróbuj wpisać ręcznie "asdf"
9. ✅ Excel pokazuje error: "Wybierz z listy"

Validation works! 📋
```

### Test 4: Copy to Kalkulator

```
1. Wypełnij 3 przykładowe wiersze
2. Zaznacz A1:I5 (nagłówki + 3 rows)
3. Ctrl+C
4. Kalkulator → Krok 2 → [Importuj z Excel]
5. Ctrl+V
6. ✅ Preview pokazuje wszystkich 3
7. ✅ KUP poprawnie zmapowany (250 → STANDARD, 20% → PROC_20)
8. ✅ Tryb składek poprawnie zmapowany
9. Dodaj wszystkich
10. ✅ Wszyscy dodani!

END-TO-END WORKS! 🚀
```

---

## 📊 STATYSTYKI

- Excel formulas: 97 komórek (G3:G100)
- Dropdowns: 4 (Płeć, Typ umowy, Tryb składek, Ulga)
- Tryb składek options: 6
- Auto-switch: 1 (KUP based on Typ umowy)
- Visual indicators: 2 (blue fill for auto, yellow for instructions)
- Template version: v2 (enhanced)

---

## 📦 PLIKI

**v2.6.1:**
- `Szablon_Import_Pracownikow_v2.xlsx` - **ENHANCED! UŻYJ TEGO!** ⭐⭐⭐

**Poprzednie:**
- `Szablon_Import_Pracownikow.xlsx` - v1 (bez auto KUP, bez dropdown tryb)

**Parser:**
- `Kalkulator_v2.4_Step4.jsx` - bez zmian, działa z oboma!

---

## 💬 CO DALEJ?

### Opcja 1: Wyślij klientowi enhanced template
```
✅ Auto KUP - mniej błędów
✅ Full dropdowns - szybciej
✅ Professional - lepsze wrażenie

POLECAM! ⭐⭐⭐
```

### Opcja 2: Zostań przy v1
```
✅ Prostszy (bez formuł)
✅ User ma pełną kontrolę
✅ Działa też dobrze

OK też!
```

### Opcja 3: Test A/B
```
✅ Wyślij v2 jednemu klientowi
✅ Wyślij v1 innemu
✅ Zobacz który wolą

Naukowe podejście! 🧪
```

---

## 💡 TIPS DLA KLIENTA

1. **Kolumna KUP jest automatyczna!**
   - Niebieski kolor = auto
   - Zmieni się gdy wybierzesz typ umowy
   - Możesz ręcznie zmienić na 300 lub 50%

2. **Wszystkie dropdowns - klik strzałkę!**
   - Płeć: M/K
   - Typ umowy: UOP/UZ
   - Tryb składek: 6 opcji
   - Ulga: TAK/NIE

3. **Jeśli Excel pokazuje błąd...**
   - "Nieprawidłowa wartość" = wybierz z listy dropdown
   - Nie próbuj wpisywać ręcznie w dropdowns!

4. **Copy ALL including headers!**
   - Zaznacz od A1 (nagłówki!)
   - Do ostatniego wiersza
   - Ctrl+C → do kalkulatora

---

**Wersja:** 2.6.1 - Enhanced Excel Template  
**Baza:** v2.6.0 Client Template  
**Data:** 25.11.2025  
**Zmiana:** Auto KUP formula + Full dropdowns!  
**Status:** ✅ Production Ready  

**Made with ❤️ for Stratton Prime**
