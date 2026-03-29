import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG } from '../constants';
import { znajdzBruttoDlaNetto, obliczNettoZBrutto, CalcParams } from '../logic/grossUp';

// Zamrożona kopia konfiguracji
const CFG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

// Bazowe parametry UOP z PIT-2
const PARAMS_UOP: CalcParams = {
  typUmowy: 'UOP',
  trybSkladek: 'PELNE',
  choroboweAktywne: true,
  pit2: '300',
  ulgaMlodych: false,
  kupTyp: 'STANDARD',
  pitMode: 'AUTO',
};

describe('znajdzBruttoDlaNetto (gross-up)', () => {

  // 1. Płaca minimalna 2026 – netto 3605.85 powinno dać brutto ~4806
  it('Gross-up dla płacy minimalnej netto (3605.85 → brutto ~4806)', () => {
    const result = znajdzBruttoDlaNetto(3605.85, PARAMS_UOP, CFG);
    expect(result.brutto).toBeCloseTo(4806, 1);
  });

  // 2. Wynik netto mieści się w tolerancji ±1 PLN od docelowego – płaca minimalna
  it('Netto wynikowe mieści się w ±1 PLN od docelowego (3605.85)', () => {
    const target = 3605.85;
    const result = znajdzBruttoDlaNetto(target, PARAMS_UOP, CFG);
    expect(Math.abs(result.netto - target)).toBeLessThanOrEqual(1);
  });

  // 3. Gross-up dla okrągłych kwot – 5000 netto
  it('Gross-up dla 5000 netto – wynikowe netto w ±1 PLN', () => {
    const target = 5000;
    const result = znajdzBruttoDlaNetto(target, PARAMS_UOP, CFG);
    expect(Math.abs(result.netto - target)).toBeLessThanOrEqual(1);
    expect(result.brutto).toBeGreaterThan(target);
  });

  // 4. Gross-up dla UZ z PROC_20
  it('Gross-up dla UZ z PROC_20 – wynikowe netto w ±1 PLN od 4000', () => {
    const params: CalcParams = {
      ...PARAMS_UOP,
      typUmowy: 'UZ',
      kupTyp: 'PROC_20',
    };
    const target = 4000;
    const result = znajdzBruttoDlaNetto(target, params, CFG);
    expect(Math.abs(result.netto - target)).toBeLessThanOrEqual(1);
  });

  // 5. Gross-up dla wysokich zarobków – 15 000 netto
  it('Gross-up dla 15 000 netto (wysokie zarobki) – wynikowe netto w ±1 PLN', () => {
    const target = 15000;
    const result = znajdzBruttoDlaNetto(target, PARAMS_UOP, CFG);
    expect(Math.abs(result.netto - target)).toBeLessThanOrEqual(1);
    expect(result.brutto).toBeGreaterThan(target);
  });

  // 6. Gross-up dla studenta (zerowe składki ZUS i zdrowotna)
  it('Gross-up dla studenta na UZ (STUDENT_UZ) – wynikowe netto w ±1 PLN od 4000', () => {
    const params: CalcParams = {
      typUmowy: 'UZ',
      trybSkladek: 'STUDENT_UZ',
      choroboweAktywne: false,
      pit2: '0',
      ulgaMlodych: true,
      kupTyp: 'PROC_20',
      pitMode: 'AUTO',
    };
    const target = 4000;
    const result = znajdzBruttoDlaNetto(target, params, CFG);
    // Student: brak ZUS, brak zdrowotnej, ulga młodych -> netto ≈ brutto
    expect(Math.abs(result.netto - target)).toBeLessThanOrEqual(1);
  });

  // 7. Stabilność: dwa wywołania z tymi samymi parametrami dają ten sam wynik
  it('Stabilność – dwa wywołania dają identyczny wynik', () => {
    const target = 6000;
    const result1 = znajdzBruttoDlaNetto(target, PARAMS_UOP, CFG);
    const result2 = znajdzBruttoDlaNetto(target, PARAMS_UOP, CFG);
    expect(result1.brutto).toBe(result2.brutto);
    expect(result1.netto).toBe(result2.netto);
  });

  // 8. Brutto > Netto docelowe (gross-up zawsze dodaje obciążenia)
  it('Brutto wynikowe jest zawsze większe niż netto docelowe', () => {
    const targets = [3605.85, 5000, 8000, 15000];
    targets.forEach(target => {
      const result = znajdzBruttoDlaNetto(target, PARAMS_UOP, CFG);
      expect(result.brutto).toBeGreaterThan(target);
    });
  });
});

describe('obliczNettoZBrutto (weryfikacja odwrotności gross-up)', () => {

  // 9. obliczNettoZBrutto(4806) daje netto ~3605.85 (oficjalna płaca minimalna 2026)
  it('obliczNettoZBrutto(4806) daje netto ~3605.85', () => {
    const result = obliczNettoZBrutto(4806, PARAMS_UOP, CFG);
    expect(result.netto).toBeCloseTo(3605.85, 0);
  });

  // 10. Gross-up i obliczNettoZBrutto są wzajemnie odwrotne
  it('Wynik gross-up zwrotnie oblicza docelowe netto', () => {
    const target = 7000;
    const grossUpResult = znajdzBruttoDlaNetto(target, PARAMS_UOP, CFG);
    const verification = obliczNettoZBrutto(grossUpResult.brutto, PARAMS_UOP, CFG);
    expect(Math.abs(verification.netto - target)).toBeLessThanOrEqual(1);
  });
});
