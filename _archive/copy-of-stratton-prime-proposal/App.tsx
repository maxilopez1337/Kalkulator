import React, { useRef, useState } from 'react';
import CoverPage from './components/CoverPage';
import FinancialAnalysis from './components/FinancialAnalysis';
import LegalSection from './components/LegalSection';
import ActionPlan from './components/ActionPlan';
import SalesGuide from './components/SalesGuide';
import { ArrowDown, Printer, Download, Loader2, BookOpen, Briefcase } from 'lucide-react';
import { PROPOSAL_JAKRA, PROPOSAL_NEXUS } from './constants';
import { ProposalData } from './types';

const App: React.FC = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  
  // State for switching proposals
  const [currentProposal, setCurrentProposal] = useState<ProposalData>(PROPOSAL_JAKRA);

  // Fallback to window.print if html2pdf fails or user prefers standard print
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = contentRef.current;
    if (!element) return;

    // Check if html2pdf is available
    if (typeof (window as any).html2pdf === 'undefined') {
      alert('Biblioteka PDF nie została załadowana. Używam standardowego drukowania.');
      window.print();
      return;
    }

    // Scroll to top to ensure clean capture from the start of the document
    window.scrollTo(0, 0);
    setIsGenerating(true);

    // Wait for state update to remove shadows/margins (re-layout)
    await new Promise(resolve => setTimeout(resolve, 200));

    // Get exact pixel dimensions of the A4 container
    // When isGenerating is true, the container is exactly 297mm wide
    const width = element.offsetWidth;

    const opt = {
      margin: 0, 
      filename: `Stratton_Prime_${currentProposal.clientName.replace(/\s+/g, '_')}_Oferta.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, // 2x scale for crisp text on High DPI displays
        useCORS: true, 
        scrollY: 0,
        scrollX: 0,
        width: width, 
        windowWidth: width,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'landscape',
        compress: true
      }
    };

    try {
      await (window as any).html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF generation failed', error);
      alert('Błąd generowania PDF. Spróbuj użyć opcji drukowania.');
    } finally {
      setIsGenerating(false);
    }
  };

  const scrollToNext = () => {
    window.scrollTo({
        top: window.innerHeight,
        behavior: 'smooth'
    });
  };

  const toggleProposal = () => {
    setCurrentProposal(prev => prev.id === 'jakra' ? PROPOSAL_NEXUS : PROPOSAL_JAKRA);
  };

  if (showGuide) {
    return <SalesGuide onClose={() => setShowGuide(false)} />;
  }

  const isPreview = !isGenerating;

  // Unified Section Class strategy:
  // - Fixed Dimensions: 297mm x 210mm (Always A4 Landscape)
  // - No conditional borders (prevents internal layout shift)
  // - Margins and Shadows only in preview mode (visual separation)
  const sectionClass = `w-[297mm] h-[210mm] bg-white overflow-hidden relative page-break ${isPreview ? 'mb-8 shadow-2xl' : ''}`;

  return (
    <div className="bg-gray-200 min-h-screen font-sans pb-12 flex flex-col items-center">
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4 print-hide">
        {/* Proposal Switcher */}
        <button 
          onClick={toggleProposal}
          className="bg-brand-gold text-white p-4 rounded-full shadow-xl hover:bg-yellow-600 transition-colors flex items-center justify-center group relative border-2 border-white"
          title="Zmień Ofertę"
        >
          <Briefcase size={24} />
          <span className="absolute right-full mr-4 bg-brand-gold text-white px-3 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
            {currentProposal.id === 'jakra' ? 'Pokaż Ofertę Nexus' : 'Pokaż Ofertę Jakra'}
          </span>
        </button>

        <button 
          onClick={() => setShowGuide(true)}
          className="bg-white text-brand-dark p-4 rounded-full shadow-xl hover:bg-gray-50 transition-colors flex items-center justify-center group relative border-2 border-brand-dark"
          title="Baza Wiedzy"
        >
          <BookOpen size={24} />
          <span className="absolute right-full mr-4 bg-brand-dark text-white px-3 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
            Poradnik: Jak Tworzyć Oferty
          </span>
        </button>

        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="bg-brand-dark text-white p-4 rounded-full shadow-xl hover:bg-slate-800 transition-colors flex items-center justify-center group relative disabled:opacity-70 disabled:cursor-not-allowed"
          title="Pobierz PDF"
        >
          {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
          <span className="absolute right-full mr-4 bg-slate-800 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Generuj PDF
          </span>
        </button>

        <button 
          onClick={handlePrint}
          className="bg-gray-600 text-white p-4 rounded-full shadow-xl hover:bg-gray-700 transition-colors flex items-center justify-center group relative"
          title="Drukuj"
        >
          <Printer size={24} />
          <span className="absolute right-full mr-4 bg-gray-700 text-white px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Drukuj (Ctrl+P)
          </span>
        </button>

        <button 
          onClick={scrollToNext}
          className="bg-brand-gold text-white p-4 rounded-full shadow-xl hover:bg-yellow-600 transition-colors flex items-center justify-center group"
          title="Następna Strona"
        >
          <ArrowDown size={24} />
        </button>
      </div>

      {/* Main Container */}
      <div className="pt-8 print:pt-0 w-full flex justify-center overflow-auto">
          {/* 
            Wrapper for PDF Generation
            - During Generation: No external spacing, pure 297mm width, pages touch each other.
            - During Preview: 297mm width, pages separated by margins.
          */}
          <div 
            ref={contentRef} 
            className={`w-[297mm] bg-transparent flex-shrink-0 flex flex-col items-center print:mx-auto`}
          >
            {/* Sections */}
            <section className={sectionClass}>
                <CoverPage data={currentProposal} />
            </section>
            
            <section className={sectionClass}>
                <FinancialAnalysis data={currentProposal} />
            </section>

            <section className={sectionClass}>
                <LegalSection data={currentProposal} />
            </section>

            <section className={sectionClass}>
                <ActionPlan data={currentProposal} />
            </section>
          </div>
      </div>
    </div>
  );
};

export default App;