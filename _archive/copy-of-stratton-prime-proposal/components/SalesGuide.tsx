import React from 'react';
import { X, CheckCircle2, AlertTriangle, Lightbulb, ArrowRight, ShieldAlert, Target } from 'lucide-react';
import PageHeader from './ui/PageHeader';

interface SalesGuideProps {
  onClose: () => void;
}

const SalesGuide: React.FC<SalesGuideProps> = ({ onClose }) => {
  return (
    <div className="bg-white min-h-screen w-full relative">
      {/* Floating Close Button */}
      <div className="fixed top-8 right-8 z-50">
        <button 
          onClick={onClose}
          className="bg-brand-dark text-white p-3 rounded-full shadow-xl hover:bg-slate-800 transition-colors flex items-center gap-2 px-6"
        >
          <X size={20} />
          <span className="font-bold text-sm">ZAMKNIJ PORADNIK</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-brand-dark text-white py-24 px-8 md:px-20">
        <div className="max-w-5xl mx-auto">
          <p className="text-brand-gold uppercase tracking-widest font-bold text-sm mb-4">BAZA WIEDZY STRATTON PRIME</p>
          <h1 className="text-5xl md:text-6xl font-serif font-bold mb-8 leading-tight">
            Mistrzowska Oferta Handlowa:<br />
            <span className="text-brand-gold">Jak przygotować dokument, który sprzedaje?</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl leading-relaxed">
            Kompletny przewodnik po strukturze, psychologii i estetyce dokumentów sprzedażowych, 
            które skutecznie przekonują klientów i zwiększają konwersję.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-8 md:px-20 py-16 space-y-20">
        
        {/* Intro */}
        <section>
          <h2 className="text-3xl font-serif font-bold text-brand-dark mb-6">Czym tak naprawdę jest oferta?</h2>
          <div className="prose prose-lg text-gray-600">
            <p className="mb-4">
              Wielu handlowców popełnia fundamentalny błąd, traktując ofertę jako zestawienie cen i specyfikacji technicznej. 
              To błędne podejście. <strong>Oferta handlowa to pisemna obietnica rozwiązania problemu klienta.</strong>
            </p>
            <p>
              To most łączący obecną, niesatysfakcjonującą sytuację klienta z jego pożądaną przyszłością, 
              w której Ty i Twój produkt jesteście przewodnikami. Jeśli Twoja oferta nie opowiada tej historii, 
              drastycznie zmniejszasz swoje szanse na sukces.
            </p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mt-8 rounded-r-lg">
            <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
              <Target size={20} />
              Zanim zaczniesz pisać: Diagnoza
            </h3>
            <p className="text-blue-800 text-sm">
              Oferta wysłana bez badania potrzeb jest jak recepta bez badania pacjenta. Zadaj sobie pytania:
              Jaki problem rozwiązuję? Co jest priorytetem (czas, cena, jakość)? Kto jest decydentem (CFO, CEO, Kierownik)?
            </p>
          </div>
        </section>

        {/* 7 Sins */}
        <section>
          <h2 className="text-3xl font-serif font-bold text-brand-dark mb-8 flex items-center gap-3">
            <AlertTriangle className="text-brand-gold" size={32} />
            7 Grzechów Głównych
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: 'Metoda "Kopiuj-Wklej"', desc: 'Klient zauważy nazwę innej firmy. To koniec zaufania.' },
              { title: 'Ja, My, Nasze', desc: 'Nadmierne ego. Klienta interesuje ON, nie TY.' },
              { title: 'Ściana tekstu', desc: 'Brak akapitów i grafik. Nikt tego nie przeczyta.' },
              { title: 'Brak języka korzyści', desc: 'Pisanie o cechach ("ma 500KM") zamiast o korzyściach ("szybko dowiezie towar").' },
              { title: 'Ukryte koszty', desc: 'Niejasny cennik budzi nieufność i podejrzenia.' },
              { title: 'Błędy formalne', desc: 'Literówki i błędy w obliczeniach podważają Twój profesjonalizm.' },
              { title: 'Format edytowalny (DOC)', desc: 'Zawsze wysyłaj PDF. Word wygląda inaczej na każdym komputerze.' },
            ].map((sin, idx) => (
              <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                <p className="font-bold text-red-600 mb-2">{idx + 1}. {sin.title}</p>
                <p className="text-sm text-gray-600">{sin.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 13 Elements */}
        <section>
          <h2 className="text-3xl font-serif font-bold text-brand-dark mb-10 pb-4 border-b border-gray-200">
            Anatomia Oferty: 13 Kluczowych Elementów
          </h2>
          <div className="space-y-8">
            {[
              { title: "1. Strona tytułowa", content: "Wizytówka. Musi zawierać logo Twoje i Klienta (buduje więź), tytuł i datę." },
              { title: "2. Spis treści", content: "Niezbędny przy dokumentach powyżej 5 stron. Ułatw nawigację decydentom." },
              { title: "3. Wstęp (Sytuacja i cele)", content: "Pokaż, że słuchałeś. Opisz obecne wyzwania klienta." },
              { title: "4. Rozwiązanie", content: "Serce oferty. Nie tylko produkt, ale sposób eliminacji problemów." },
              { title: "5. Cennik", content: "Przejrzysta tabela. Opcje Standard/Premium. Żadnych ukrytych kosztów." },
              { title: "6. Referencje", content: "Społeczny dowód słuszności. Logotypy, cytaty, case studies." },
              { title: "7. Plan działań", content: "Roadmapa. Pokaż krok po kroku, co wydarzy się po podpisaniu umowy." },
              { title: "8. Harmonogram", content: "Osadzenie w czasie. Kiedy start? Kiedy efekty? Biznes kocha konkrety." },
              { title: "9. Zespół", content: "Ludzie kupują od ludzi. Pokaż twarze opiekunów projektu." },
              { title: "10. Cross-selling", content: "Opcje dodatkowe. Zaproponuj więcej wartości (np. serwis, szkolenie)." },
              { title: "11. Termin ważności", content: "Reguła niedostępności. 14-30 dni. Motywuje do decyzji." },
              { title: "12. Dane kontaktowe", content: "Nie każ ich szukać. Imię, telefon, mail, link do kalendarza." },
              { title: "13. Call to Action", content: "Jasna instrukcja: 'Aby zacząć, podpisz umowę na str. 15'." }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="bg-brand-dark text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm">
                  {idx + 1}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                  <p className="text-gray-600">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Golden Rules */}
        <section className="bg-brand-light p-10 rounded-2xl border border-brand-gold/20">
          <h2 className="text-3xl font-serif font-bold text-brand-dark mb-8 text-center">Złote Zasady Skuteczności</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-brand-gold">
                <Lightbulb size={32} />
              </div>
              <h3 className="font-bold text-brand-dark mb-2">Język Korzyści</h3>
              <p className="text-sm text-gray-600">
                Nie pisz "Serwer ma uptime 99.9%".<br/>
                Napisz "Twój sklep zarabia 24/7 bez przerw".<br/>
                Cecha -> <strong>Korzyść</strong>.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-brand-gold">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-bold text-brand-dark mb-2">Przejrzystość</h3>
              <p className="text-sm text-gray-600">
                White space, punktory, pogrubienia.<br/>
                Infografiki zamiast ściany tekstu.<br/>
                Oko musi "odpoczywać".
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-brand-gold">
                <ArrowRight size={32} />
              </div>
              <h3 className="font-bold text-brand-dark mb-2">Personalizacja</h3>
              <p className="text-sm text-gray-600">
                Używaj języka branżowego klienta.<br/>
                Odnoś się do jego konkretnych problemów.<br/>
                Oferta musi być uszyta na miarę.
              </p>
            </div>
          </div>
        </section>

        {/* Automation & Footer */}
        <section className="border-t border-gray-200 pt-10">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h3 className="font-bold text-xl text-brand-dark mb-2">Automatyzacja i CRM</h3>
              <p className="text-gray-600 mb-4">
                Czas to pieniądz. Szansa na sprzedaż spada drastycznie po 24h.
                Nowoczesne systemy pozwalają tworzyć oferty z gotowych klocków i śledzić moment ich otwarcia przez klienta.
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-brand-gold">
                <ShieldAlert size={16} />
                <span>Ważne: Szybkość reakcji buduje autorytet.</span>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-lg text-center md:w-1/3">
              <p className="text-xs uppercase text-gray-400 font-bold mb-2">Przygotowano przez</p>
              <p className="font-serif font-bold text-xl text-brand-dark">Stratton Prime Academy</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default SalesGuide;