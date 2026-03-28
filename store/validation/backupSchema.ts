import { z } from 'zod';

// --- Pracownik ---
export const pracownikSchema = z.object({
  id: z.number(),
  imie: z.string(),
  nazwisko: z.string(),
  dataUrodzenia: z.string(),
  plec: z.enum(['K', 'M']),
  typUmowy: z.enum(['UOP', 'UZ']),
  trybSkladek: z.string(),
  choroboweAktywne: z.boolean(),
  pit2: z.string(),
  ulgaMlodych: z.boolean(),
  kupTyp: z.string(),
  nettoDocelowe: z.number(),
  nettoZasadnicza: z.number(),
  pitMode: z.enum(['AUTO', 'FLAT_0', 'FLAT_12', 'FLAT_32']),
  skladkaFP: z.boolean(),
  skladkaFGSP: z.boolean(),
});

export const pracownicyArraySchema = z.array(pracownikSchema);

// --- Firma ---
const firmaSchema = z.object({
  nazwa: z.string(),
  nip: z.string(),
  adres: z.string().optional(),
  kodPocztowy: z.string().optional(),
  miasto: z.string().optional(),
  email: z.string().optional(),
  telefon: z.string().optional(),
  osobaKontaktowa: z.string().optional(),
  opiekunNazwa: z.string().optional(),
  opiekunEmail: z.string().optional(),
  opiekunTelefon: z.string().optional(),
  okres: z.string(),
  stawkaWypadkowa: z.number(),
});

// --- Config ---
const zusStronaSchema = z.object({
  emerytalna: z.number(),
  rentowa: z.number(),
  chorobowa: z.number(),
});

const zusStronaPracodawcySchema = z.object({
  emerytalna: z.number(),
  rentowa: z.number(),
  wypadkowa: z.number(),
  fp: z.number(),
  fgsp: z.number(),
});

const zusUmowaSchema = z.object({
  pracownik: zusStronaSchema,
  pracodawca: zusStronaPracodawcySchema,
});

const configSchema = z.object({
  zus: z.object({
    uop: zusUmowaSchema,
    uz: zusUmowaSchema,
    zdrowotna: z.number(),
  }),
  pit: z.object({
    prog1Limit: z.number(),
    prog1Stawka: z.number(),
    prog2Stawka: z.number(),
    kwotaWolnaRoczna: z.number(),
    kwotaZmniejszajacaMies: z.number(),
    kupStandard: z.number(),
    kupPodwyzszone: z.number(),
    uzKupProc: z.number(),
    uzKupAutorskie: z.number(),
    ulgaMlodziMaxWiek: z.number(),
    ulgaMlodziLimitRoczny: z.number(),
    fpZwolnienieWiekKobieta: z.number(),
    fpZwolnienieWiekMezczyzna: z.number(),
  }),
  placaMinimalna: z.object({
    brutto: z.number(),
    netto: z.number(),
  }),
  minimalnaKwotaUZ: z.object({
    zasadniczaNetto: z.number(),
  }),
  swiadczenie: z.object({
    stawkaPit: z.number(),
    odplatnosc: z.number(),
  }),
  prowizja: z.object({
    standard: z.number(),
    plus: z.number(),
  }),
});

// --- ZapisanaKalkulacja ---
export const zapisanaKalkulacjaSchema = z.object({
  id: z.string(),
  dataUtworzenia: z.string(),
  nazwaFirmy: z.string(),
  liczbaPracownikow: z.number(),
  oszczednoscRoczna: z.number(),
  dane: z.object({
    firma: firmaSchema,
    pracownicy: pracownicyArraySchema,
    config: configSchema,
    prowizjaProc: z.number(),
  }),
});
