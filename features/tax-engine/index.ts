
import { Config, Firma } from '../../entities/company/model';
import { Pracownik } from '../../entities/employee/model';
import { WynikWariantuStandard, WynikWariantuPodzial } from '../../entities/calculation/model';
import { obliczZusPracodawca } from './logic/zus';
import { obliczPit } from './logic/pit';
import { znajdzBruttoDlaNetto } from './logic/grossUp';

export { DEFAULT_CONFIG } from './constants';
export { znajdzBruttoDlaNetto };

export const calculateCommission = (swiadczenieNetto: number, prowizjaProc: number) => {
  return swiadczenieNetto * (prowizjaProc / 100);
};

// ==================== WARIANTY OBLICZEŃ (ORKIESTRACJA) ====================

export const obliczWariantStandard = (pracownik: Pracownik, stawkaWypadkowa: number, config: Config): WynikWariantuStandard => {
  const params = {
    typUmowy: pracownik.typUmowy,
    trybSkladek: pracownik.trybSkladek,
    choroboweAktywne: pracownik.choroboweAktywne,
    pit2: pracownik.pit2,
    ulgaMlodych: pracownik.ulgaMlodych,
    kupTyp: pracownik.kupTyp,
    pitMode: pracownik.pitMode || 'AUTO'
  };
  
  const wynik = znajdzBruttoDlaNetto(pracownik.nettoDocelowe, params, config);
  
  const zusPracodawca = obliczZusPracodawca(
      wynik.brutto, 
      pracownik.typUmowy, 
      pracownik.trybSkladek, 
      stawkaWypadkowa, 
      pracownik.skladkaFP, 
      pracownik.skladkaFGSP, 
      config
  );
  
  return {
    ...wynik,
    zusPracodawca,
    kosztPracodawcy: wynik.brutto + zusPracodawca.suma
  };
};

export const obliczWariantPodzial = (pracownik: Pracownik, stawkaWypadkowa: number, nettoZasadnicza: number, config: Config): WynikWariantuPodzial => {
  const paramsZasadnicza = {
    typUmowy: pracownik.typUmowy,
    trybSkladek: pracownik.trybSkladek,
    choroboweAktywne: pracownik.choroboweAktywne,
    pit2: pracownik.pit2,
    ulgaMlodych: pracownik.ulgaMlodych,
    kupTyp: pracownik.kupTyp,
    pitMode: pracownik.pitMode || 'AUTO'
  };
  
  const wynikZasadnicza = znajdzBruttoDlaNetto(nettoZasadnicza, paramsZasadnicza, config);
  const swiadczenieNetto = pracownik.nettoDocelowe - nettoZasadnicza;
  
  if (swiadczenieNetto <= 0) {
    const zusPracodawca = obliczZusPracodawca(
        wynikZasadnicza.brutto, 
        pracownik.typUmowy, 
        pracownik.trybSkladek, 
        stawkaWypadkowa, 
        pracownik.skladkaFP, 
        pracownik.skladkaFGSP, 
        config
    );
    
    return {
      zasadnicza: { ...wynikZasadnicza, zusPracodawca, nettoGotowka: nettoZasadnicza },
      swiadczenie: { brutto: 0, netto: 0, zaliczka: 0, kup: 0 },
      pit: {
        lacznyPrzychod: wynikZasadnicza.brutto,
        podstawa: wynikZasadnicza.podstawaPit,
        kup: wynikZasadnicza.kup,
        kupOdZasadniczej: wynikZasadnicza.kup,
        kupOdSwiadczenia: 0,
        stawka: wynikZasadnicza.stawkaPit,
        kwota: wynikZasadnicza.pit,
        kwotaOdZasadniczej: wynikZasadnicza.pit,
        kwotaOdSwiadczenia: 0
      },
      kosztPracodawcy: wynikZasadnicza.brutto + zusPracodawca.suma,
      nettoCalkowite: nettoZasadnicza,
      doWyplatyGotowka: nettoZasadnicza,
      doWyplatySwiadczenie: 0,
      doWyplaty: nettoZasadnicza
    };
  }
  
  let stawkaPitDlaSwiadczenia = wynikZasadnicza.stawkaPit / 100;
  if (pracownik.pitMode === 'FLAT_12') stawkaPitDlaSwiadczenia = config.pit.prog1Stawka / 100;
  else if (pracownik.pitMode === 'FLAT_32') stawkaPitDlaSwiadczenia = config.pit.prog2Stawka / 100;
  else if (pracownik.pitMode === 'FLAT_0') stawkaPitDlaSwiadczenia = 0;

  let wspolczynnikKupSwiadczenia = 0;
  if (pracownik.typUmowy === 'UZ') {
    wspolczynnikKupSwiadczenia = (pracownik.kupTyp === 'PROC_50' ? config.pit.uzKupAutorskie : config.pit.uzKupProc) / 100;
  }
  
  let efektywnaStawkaSwiadczenia = stawkaPitDlaSwiadczenia * (1 - wspolczynnikKupSwiadczenia);
  let swiadczenieBruttoWstepne = swiadczenieNetto / (1 - efektywnaStawkaSwiadczenia);
  let lacznyPrzychodWstepny = wynikZasadnicza.brutto + swiadczenieBruttoWstepne;
  
  let kupCalkowiteWstepne = wynikZasadnicza.kup;
  if (pracownik.typUmowy === 'UZ') {
    const procKup = pracownik.kupTyp === 'PROC_50' ? config.pit.uzKupAutorskie : config.pit.uzKupProc;
    kupCalkowiteWstepne = (lacznyPrzychodWstepny - wynikZasadnicza.zusPracownik.suma) * (procKup / 100);
  }
  
  // Kalkulator liczy "Tu i Teraz" (Miesiąc 1) bez projekcji rocznej.
  // Stawka 32% dostępna tylko przez ręczny wybór FLAT_32.
  
  let kupOdSwiadczeniaWstepne = 0;
  if (pracownik.typUmowy === 'UZ') {
    kupOdSwiadczeniaWstepne = swiadczenieBruttoWstepne * ((pracownik.kupTyp === 'PROC_50' ? config.pit.uzKupAutorskie : config.pit.uzKupProc) / 100);
  }
  
  const zaliczkaOdSwiadczenia = Math.round((swiadczenieBruttoWstepne - kupOdSwiadczeniaWstepne) * stawkaPitDlaSwiadczenia);
  const swiadczenieBrutto = swiadczenieNetto + zaliczkaOdSwiadczenia;
  const lacznyPrzychod = wynikZasadnicza.brutto + swiadczenieBrutto;
  
  let kupCalkowite = wynikZasadnicza.kup;
  if (pracownik.typUmowy === 'UZ') {
    const procKup = pracownik.kupTyp === 'PROC_50' ? config.pit.uzKupAutorskie : config.pit.uzKupProc;
    kupCalkowite = (lacznyPrzychod - wynikZasadnicza.zusPracownik.suma) * (procKup / 100);
  }
  
  const podstawaPitCalkowita = Math.round(Math.max(0, lacznyPrzychod - wynikZasadnicza.zusPracownik.suma - kupCalkowite));
  const kupOdSwiadczenia = kupCalkowite - wynikZasadnicza.kup;

  let stawkaPitFinal = config.pit.prog1Stawka;
  if (pracownik.pitMode === 'FLAT_32') stawkaPitFinal = config.pit.prog2Stawka;
  else if (pracownik.pitMode === 'FLAT_12') stawkaPitFinal = config.pit.prog1Stawka;
  else if (pracownik.pitMode === 'FLAT_0') stawkaPitFinal = 0;
  // Dla AUTO: sprawdzamy tylko bieżący miesiąc bez projekcji rocznej, chyba że podstawa miesięczna > 120k
  else stawkaPitFinal = podstawaPitCalkowita > config.pit.prog1Limit ? config.pit.prog2Stawka : config.pit.prog1Stawka;

  const pitCalkowity = obliczPit(podstawaPitCalkowita, pracownik.pit2, pracownik.ulgaMlodych, stawkaPitFinal, config);
  
  const kwotaOdZasadniczej = wynikZasadnicza.pit || 0;
  const kwotaOdSwiadczenia = pitCalkowity - kwotaOdZasadniczej;

  const zusPracodawca = obliczZusPracodawca(
      wynikZasadnicza.brutto, 
      pracownik.typUmowy, 
      pracownik.trybSkladek, 
      stawkaWypadkowa, 
      pracownik.skladkaFP, 
      pracownik.skladkaFGSP, 
      config
  );

  return {
    zasadnicza: { ...wynikZasadnicza, zusPracodawca, nettoGotowka: nettoZasadnicza },
    swiadczenie: { brutto: swiadczenieBrutto, netto: swiadczenieNetto, zaliczka: kwotaOdSwiadczenia, kup: kupOdSwiadczenia },
    pit: {
      lacznyPrzychod,
      podstawa: podstawaPitCalkowita,
      kup: kupCalkowite,
      kupOdZasadniczej: wynikZasadnicza.kup,
      kupOdSwiadczenia,
      stawka: stawkaPitFinal,
      kwota: pitCalkowity,
      kwotaOdZasadniczej: kwotaOdZasadniczej,
      kwotaOdSwiadczenia: kwotaOdSwiadczenia
    },
    kosztPracodawcy: wynikZasadnicza.brutto + zusPracodawca.suma + swiadczenieBrutto,
    nettoCalkowite: nettoZasadnicza + swiadczenieNetto,
    doWyplatyGotowka: nettoZasadnicza - 1,
    doWyplatySwiadczenie: swiadczenieNetto,
    doWyplaty: nettoZasadnicza - 1 + swiadczenieNetto
  };
};
