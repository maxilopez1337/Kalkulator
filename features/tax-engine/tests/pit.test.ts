import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG } from '../constants';
import { obliczPit } from '../logic/pit';

// Zamrożona kopia konfiguracji
const CFG = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

describe('obliczPit', () => {

  // 1. PIT 12% z PIT-2 (300 zł) – standardowy UOP
  it('PIT 12% dla podstawy 4000 z PIT-2 300 zł', () => {
    // 4000 * 12% = 480 - 300 = 180
    const result = obliczPit(4000, '300', false, 12, CFG);
    expect(result).toBe(180);
  });

  // 2. PIT 12% bez PIT-2
  it('PIT 12% bez PIT-2 (pit2 = "0")', () => {
    // 4000 * 12% = 480 - 0 = 480
    const result = obliczPit(4000, '0', false, 12, CFG);
    expect(result).toBe(480);
  });

  // 3. PIT 12% bez PIT-2 (pusty string)
  it('PIT 12% bez PIT-2 (pusty string)', () => {
    // 5000 * 12% = 600
    const result = obliczPit(5000, '', false, 12, CFG);
    expect(result).toBe(600);
  });

  // 4. Ulga młodych – PIT = 0 niezależnie od podstawy
  it('PIT = 0 dla ulgaMlodych: true', () => {
    const result = obliczPit(8000, '300', true, 12, CFG);
    expect(result).toBe(0);
  });

  // 5. Ulga młodych – PIT = 0 nawet ze stawką 32%
  it('PIT = 0 dla ulgaMlodych: true, stawka 32%', () => {
    const result = obliczPit(15000, '0', true, 32, CFG);
    expect(result).toBe(0);
  });

  // 6. PIT 32% dla wysokich zarobków
  it('PIT 32% dla podstawy 10000 z PIT-2 300', () => {
    // 10000 * 32% = 3200 - 300 = 2900
    const result = obliczPit(10000, '300', false, 32, CFG);
    expect(result).toBe(2900);
  });

  // 7. PIT 32% bez kwoty zmniejszającej
  it('PIT 32% dla podstawy 15000 bez PIT-2', () => {
    // 15000 * 32% = 4800
    const result = obliczPit(15000, '0', false, 32, CFG);
    expect(result).toBe(4800);
  });

  // 8. PIT = 0 gdy podstawa ujemna (PIT-2 > podstawa)
  it('PIT = 0 gdy podatek wychodzi ujemny (mała podstawa, wysoka ulga)', () => {
    // 200 * 12% = 24 - 300 = -276 -> 0
    const result = obliczPit(200, '300', false, 12, CFG);
    expect(result).toBe(0);
  });

  // 9. PIT = 0 dla zerowej podstawy
  it('PIT = 0 dla podstawy 0', () => {
    const result = obliczPit(0, '300', false, 12, CFG);
    expect(result).toBe(0);
  });

  // 10. Zaokrąglanie do pełnych złotych (Art. 63 OP) – podstawa niecałkowita
  it('Zaokrąglanie do pełnych złotych – podstawa z groszami', () => {
    // Podstawa 4001.67 -> zaokrąglona 4002, * 12% = 480.24 - 300 = 180.24 -> zaokrąglone do 180
    const result = obliczPit(4001.67, '300', false, 12, CFG);
    expect(result).toBe(180);
  });

  // 11. Zaokrąglanie w górę gdy końcówka >= 50 gr
  it('Zaokrąglanie w górę gdy końcówka podatku >= 0.5', () => {
    // Podstawa 5000, * 12% = 600.00 - 300 = 300 (bez groszytu, ale sprawdzamy inny przypadek)
    // Podstawa 4167, * 12% = 500.04 - 300 = 200.04 -> 200
    const result = obliczPit(4167, '300', false, 12, CFG);
    expect(result).toBe(200);
  });

  // 12. PIT dla pracownika z podwyższonymi kosztami (kupTyp nie wpływa na obliczPit bezpośrednio,
  //     ale podstawa jest już podana po odjęciu KUP - weryfikujemy z obniżoną podstawą)
  it('PIT dla podstawy po odjęciu podwyższonych KUP (kupTyp: PODWYZSZONE)', () => {
    // Przy brutto 5000, KUP podwyzszone=300, ZUS UOP = 685.50
    // podstawa = 5000 - 685.50 - 300 = 4014.50 -> przekazana do obliczPit jako 4014.50
    // obliczPit(4014.50, '300', false, 12, cfg): zaokr 4015, * 12% = 481.8, -300=181.8 -> 182
    const result = obliczPit(4014.50, '300', false, 12, CFG);
    expect(result).toBe(182);
  });

  // 13. PIT dla UZ z podstawą odpowiadającą KUP 20% (PROC_20)
  it('PIT dla podstawy odpowiadającej UZ PROC_20 (przychód 5000, ZUS UZ ~ 685.50)', () => {
    // Podstawa zdrowotna = 5000 - 685.50 = 4314.50
    // KUP 20% = 4314.50 * 20% = 862.90
    // podstawa PIT = 4314.50 - 862.90 = 3451.60 -> przekazana do obliczPit
    // obliczPit(3451.60, '300', false, 12, cfg): zaokr 3452, *12% = 414.24, -300 = 114.24 -> 114
    const result = obliczPit(3451.60, '300', false, 12, CFG);
    expect(result).toBe(114);
  });

  // 14. PIT dla UZ z podstawą odpowiadającą KUP 50% (PROC_50)
  it('PIT dla podstawy odpowiadającej UZ PROC_50 (przychód 5000, KUP 50%)', () => {
    // Podstawa zdrowotna = 5000 - 685.50 = 4314.50
    // KUP 50% = 4314.50 * 50% = 2157.25
    // podstawa PIT = 4314.50 - 2157.25 = 2157.25
    // obliczPit(2157.25, '300', false, 12, cfg): zaokr 2157, *12% = 258.84, -300 = -41.16 -> 0
    const result = obliczPit(2157.25, '300', false, 12, CFG);
    expect(result).toBe(0);
  });
});
