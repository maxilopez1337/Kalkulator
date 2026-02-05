import { describe, it, expect, vi } from 'vitest';
import { DEFAULT_CONFIG } from '../features/tax-engine';
import { offerPdfGenerator, validateKalkulacjaInput, buildStatsFromKalkulacja, renderOfferHtml } from './offerPdfGenerator';
import { ZapisanaKalkulacja } from '../entities/history/model';

const createSampleKalkulacja = (): ZapisanaKalkulacja => ({
  id: 'test-1',
  dataUtworzenia: '2026-02-04T00:00:00.000Z',
  nazwaFirmy: 'ACME',
  liczbaPracownikow: 2,
  oszczednoscRoczna: 0,
  dane: {
    firma: {
      nazwa: 'ACME',
      nip: '123',
      okres: 'MIES',
      stawkaWypadkowa: 1.67,
    },
    pracownicy: [
      {
        id: 1,
        imie: 'Jan',
        nazwisko: 'Kowalski',
        dataUrodzenia: '1990-01-01',
        plec: 'M',
        typUmowy: 'UOP',
        trybSkladek: 'PELNE',
        choroboweAktywne: true,
        pit2: '300',
        ulgaMlodych: false,
        kupTyp: 'STANDARD',
        nettoDocelowe: 7140,
        nettoZasadnicza: 3600,
        pitMode: 'AUTO',
        skladkaFP: true,
        skladkaFGSP: true,
      },
      {
        id: 2,
        imie: 'Anna',
        nazwisko: 'Nowak',
        dataUrodzenia: '1992-05-05',
        plec: 'K',
        typUmowy: 'UOP',
        trybSkladek: 'PELNE',
        choroboweAktywne: true,
        pit2: '300',
        ulgaMlodych: false,
        kupTyp: 'STANDARD',
        nettoDocelowe: 9000,
        nettoZasadnicza: 3600,
        pitMode: 'AUTO',
        skladkaFP: true,
        skladkaFGSP: true,
      },
    ],
    config: DEFAULT_CONFIG,
    prowizjaProc: 10,
  },
});

describe('offerPdfGenerator helpers', () => {
  it('should flag missing netto fields in validation', () => {
    const calc = createSampleKalkulacja();
    // Remove nettoDocelowe to trigger validation error
    delete calc.dane.pracownicy[0].nettoDocelowe;

    const { errors } = validateKalkulacjaInput(calc);
    expect(errors.some((e) => e.includes('nettoDocelowe'))).toBe(true);
  });

  it('should include prowizja and retencja in kosztPracodawcy relations', () => {
    const calc = createSampleKalkulacja();
    const stats = buildStatsFromKalkulacja(calc.dane);

    const retentionAmount = stats.oszczednoscMiesieczna * 0.3;
    expect(stats.plus.kosztPracodawcy - stats.stratton.kosztPracodawcy).toBeCloseTo(retentionAmount, 2);
    expect(stats.plus.kosztPracodawcy).toBeLessThan(stats.standard.kosztPracodawcy);
    expect(stats.stratton.kosztPracodawcy).toBeGreaterThan(0);
  });

  it('should render deterministic HTML snapshot', () => {
    vi.setSystemTime(new Date('2026-02-04T00:00:00.000Z'));
    const calc = createSampleKalkulacja();
    const stats = buildStatsFromKalkulacja(calc.dane);

    const html = renderOfferHtml(calc.dane.firma, stats);
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toMatchSnapshot();
  });
});
