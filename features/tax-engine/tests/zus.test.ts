import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG } from '../constants';
import { obliczZusPracownik, obliczZusPracodawca, obliczZdrowotna } from '../logic/zus';

// Zamrożona kopia konfiguracji
const CFG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

describe('obliczZusPracownik', () => {

  // 1. Standardowy UOP – składki pracownika
  it('UOP PELNE: emerytalna 9.76%, rentowa 1.5%, chorobowa 2.45% dla brutto 5000', () => {
    const zus = obliczZusPracownik(5000, 'UOP', 'PELNE', true, CFG);
    expect(zus.emerytalna).toBeCloseTo(488.00, 2);
    expect(zus.rentowa).toBeCloseTo(75.00, 2);
    expect(zus.chorobowa).toBeCloseTo(122.50, 2);
    expect(zus.suma).toBeCloseTo(685.50, 2);
  });

  // 2. Suma jest dokładnie sumą składowych (zaokrąglone osobno)
  it('Suma ZUS pracownika = emerytalna + rentowa + chorobowa', () => {
    const zus = obliczZusPracownik(7777, 'UOP', 'PELNE', true, CFG);
    expect(zus.suma).toBeCloseTo(zus.emerytalna + zus.rentowa + zus.chorobowa, 2);
  });

  // 3. Student na UZ (STUDENT_UZ) – brak składek
  it('ZUS = 0 dla trybSkladek: STUDENT_UZ', () => {
    const zus = obliczZusPracownik(5000, 'UZ', 'STUDENT_UZ', true, CFG);
    expect(zus.emerytalna).toBe(0);
    expect(zus.rentowa).toBe(0);
    expect(zus.chorobowa).toBe(0);
    expect(zus.suma).toBe(0);
  });

  // 4. Zbieg tytułów (INNY_TYTUL) – brak składek
  it('ZUS = 0 dla trybSkladek: INNY_TYTUL', () => {
    const zus = obliczZusPracownik(5000, 'UOP', 'INNY_TYTUL', true, CFG);
    expect(zus.emerytalna).toBe(0);
    expect(zus.rentowa).toBe(0);
    expect(zus.chorobowa).toBe(0);
    expect(zus.suma).toBe(0);
  });

  // 5. UZ z wyłączoną chorobową (choroboweAktywne: false)
  it('Chorobowa = 0 dla UZ gdy choroboweAktywne: false', () => {
    const zus = obliczZusPracownik(5000, 'UZ', 'PELNE', false, CFG);
    expect(zus.chorobowa).toBe(0);
    // Emerytalna i rentowa nadal liczone
    expect(zus.emerytalna).toBeCloseTo(488.00, 2);
    expect(zus.rentowa).toBeCloseTo(75.00, 2);
  });

  // 6. UZ z włączoną chorobową
  it('UZ PELNE: chorobowa naliczona gdy choroboweAktywne: true', () => {
    const zus = obliczZusPracownik(5000, 'UZ', 'PELNE', true, CFG);
    expect(zus.chorobowa).toBeCloseTo(122.50, 2);
  });

  // 7. Zaokrąglanie składek do groszy – niecałkowite brutto
  it('Zaokrąglanie składek do groszy dla brutto 3333.33', () => {
    const zus = obliczZusPracownik(3333.33, 'UOP', 'PELNE', true, CFG);
    // emerytalna: 3333.33 * 9.76% = 325.33 -> 325.33
    expect(zus.emerytalna).toBeCloseTo(325.33, 1);
    // suma = zaokraglone składniki
    const expectedSuma = zus.emerytalna + zus.rentowa + zus.chorobowa;
    expect(zus.suma).toBeCloseTo(expectedSuma, 2);
  });
});

describe('obliczZusPracodawca', () => {

  // 8. Standardowy UOP – składki pracodawcy
  it('UOP PELNE: emerytalna 9.76%, rentowa 6.5%, wypadkowa 1.67%, FP 2.45%, FGSP 0.1% dla brutto 5000', () => {
    const zus = obliczZusPracodawca(5000, 'UOP', 'PELNE', 1.67, true, true, CFG);
    expect(zus.emerytalna).toBeCloseTo(488.00, 2);
    expect(zus.rentowa).toBeCloseTo(325.00, 2);
    expect(zus.wypadkowa).toBeCloseTo(83.50, 2);
    expect(zus.fp).toBeCloseTo(122.50, 2);
    expect(zus.fgsp).toBeCloseTo(5.00, 2);
    expect(zus.suma).toBeCloseTo(1024.00, 2);
  });

  // 9. Student na UZ – brak składek pracodawcy
  it('ZUS pracodawcy = 0 dla trybSkladek: STUDENT_UZ', () => {
    const zus = obliczZusPracodawca(5000, 'UZ', 'STUDENT_UZ', 1.67, true, true, CFG);
    expect(zus.emerytalna).toBe(0);
    expect(zus.rentowa).toBe(0);
    expect(zus.wypadkowa).toBe(0);
    expect(zus.fp).toBe(0);
    expect(zus.fgsp).toBe(0);
    expect(zus.suma).toBe(0);
  });

  // 10. Zbieg tytułów – brak składek pracodawcy
  it('ZUS pracodawcy = 0 dla trybSkladek: INNY_TYTUL', () => {
    const zus = obliczZusPracodawca(5000, 'UOP', 'INNY_TYTUL', 1.67, true, true, CFG);
    expect(zus.suma).toBe(0);
  });

  // 11. Pracownik zwolniony z FP i FGSP (naliczajFP=false, naliczajFGSP=false – np. wiek)
  it('FP = 0 i FGSP = 0 gdy naliczajFP=false, naliczajFGSP=false', () => {
    const zus = obliczZusPracodawca(5000, 'UOP', 'PELNE', 1.67, false, false, CFG);
    expect(zus.fp).toBe(0);
    expect(zus.fgsp).toBe(0);
    // Ale emerytalna, rentowa, wypadkowa nadal naliczone
    expect(zus.emerytalna).toBeCloseTo(488.00, 2);
    expect(zus.rentowa).toBeCloseTo(325.00, 2);
    expect(zus.wypadkowa).toBeCloseTo(83.50, 2);
    expect(zus.suma).toBeCloseTo(896.50, 2);
  });

  // 12. Suma pracodawcy = suma składowych
  it('Suma ZUS pracodawcy = suma składowych', () => {
    const zus = obliczZusPracodawca(8500, 'UOP', 'PELNE', 1.67, true, true, CFG);
    const expectedSuma = zus.emerytalna + zus.rentowa + zus.wypadkowa + zus.fp + zus.fgsp;
    expect(zus.suma).toBeCloseTo(expectedSuma, 2);
  });

  // 13. Wypadkowa zależy od przekazanej stawki
  it('Wypadkowa naliczana od przekazanej stawki (2.0% zamiast 1.67%)', () => {
    const zus = obliczZusPracodawca(5000, 'UOP', 'PELNE', 2.0, true, true, CFG);
    expect(zus.wypadkowa).toBeCloseTo(100.00, 2);
  });
});

describe('obliczZdrowotna', () => {

  // 14. Zdrowotna 9% dla standardowego pracownika
  it('Zdrowotna 9% od podstawy wymiaru', () => {
    // podstawa = brutto - ZUS = 5000 - 685.50 = 4314.50 -> 9% = 388.31 (zaokr)
    const zdrowotna = obliczZdrowotna(4314.50, 'PELNE', CFG);
    expect(zdrowotna).toBeCloseTo(4314.50 * 0.09, 2);
  });

  // 15. Zdrowotna = 0 dla studenta na UZ
  it('Zdrowotna = 0 dla trybSkladek: STUDENT_UZ', () => {
    const zdrowotna = obliczZdrowotna(5000, 'STUDENT_UZ', CFG);
    expect(zdrowotna).toBe(0);
  });

  // 16. Zdrowotna naliczona dla INNY_TYTUL
  it('Zdrowotna 9% naliczona dla trybSkladek: INNY_TYTUL', () => {
    const podstawa = 5000;
    const zdrowotna = obliczZdrowotna(podstawa, 'INNY_TYTUL', CFG);
    expect(zdrowotna).toBeCloseTo(podstawa * 0.09, 2);
  });
});
