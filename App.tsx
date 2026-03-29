
import React, { useState, useEffect, Suspense } from 'react';
import { StepIndicator } from './shared/ui/StepIndicator';
import { Menu, X, Home, Zap, Building, ShieldCheck, Calculator, Settings, Database, FileText, Users, TrendingUp, ChevronRight, ChevronLeft } from './shared/icons/Icons';
import { ImportModal } from './features/modals/ImportModal';
import { ConfigModal } from './features/modals/ConfigModal';
import { DatabaseModal } from './features/modals/DatabaseModal';
const StepDashboard = React.lazy(() =>
  import('./features/steps/dashboard/StepDashboard').then(m => ({ default: m.StepDashboard }))
);
const StepSzybkaSymulacja = React.lazy(() =>
  import('./features/steps/simulation/StepSzybkaSymulacja').then(m => ({ default: m.StepSzybkaSymulacja }))
);
const StepFirma = React.lazy(() =>
  import('./features/steps/company/StepFirma').then(m => ({ default: m.StepFirma }))
);
const StepPracownicy = React.lazy(() =>
  import('./features/steps/employees/StepPracownicy').then(m => ({ default: m.StepPracownicy }))
);
const StepWynikStandard = React.lazy(() =>
  import('./features/steps/results/StepWynikStandard').then(m => ({ default: m.StepWynikStandard }))
);
const StepWynikPodzial = React.lazy(() =>
  import('./features/steps/results/StepWynikPodzial').then(m => ({ default: m.StepWynikPodzial }))
);
const StepPorownanie = React.lazy(() =>
  import('./features/steps/comparison/StepPorownanie').then(m => ({ default: m.StepPorownanie }))
);
const StepPodsumowanie = React.lazy(() =>
  import('./features/steps/summary/StepPodsumowanie').then(m => ({ default: m.StepPodsumowanie }))
);
const StepAnalizaPracownika = React.lazy(() =>
  import('./features/steps/simulation/StepAnalizaPracownika').then(m => ({ default: m.StepAnalizaPracownika }))
);
import { useAppStore } from './store/AppContext';
import { theme, animations } from './shared/config/theme';
import { DEFAULT_FIRMA_STATE } from './store/CompanyContext';
import { Toast } from './shared/ui/Toast';
import { ErrorBoundary } from './shared/ui/ErrorBoundary';

const App = () => {
  // Start on Dashboard (-1), Simulation is -2
  const [currentStep, setCurrentStep] = useState(-1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapsed state
  const [isProcessVisible, setIsProcessVisible] = useState(false); // Visibility of calculation timeline
  const [isMobile, setIsMobile] = useState(false);
  const { firma, config, notification, clearNotification, setPracownicy, setFirma, setProwizjaProc } = useAppStore();

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [databaseModalOpen, setDatabaseModalOpen] = useState(false);

  // Business naming convention (Pro Style)
  const steps = [
      'Dane Organizacji', 
        'Ewidencja Osobowa',
        'Analiza Kosztów',
        'Model Docelowy',
        'Business Case',
        'Podsumowanie',
        'Analiza Pracownika'
  ];

  // Detect mobile & auto-configure sidebar
  useEffect(() => {
    const handleResize = () => {
        const mobile = window.innerWidth < 1024; // lg breakpoint
        setIsMobile(mobile);
        // On desktop, keep sidebar open by default. On mobile, keep closed.
        if (!mobile) setIsSidebarOpen(true);
        else setIsSidebarOpen(false);
    };
    
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-show/hide process timeline based on step
  useEffect(() => {
      // Show ONLY if we are in the process (step 0 to 5)
      // Hide if on Dashboard (-1) or Quick Sim (-2)
      setIsProcessVisible(currentStep >= 0);
  }, [currentStep]);

  // Funkcja resetująca sesję (czyszczenie danych i powrót do pulpitu)
  const handleCloseSession = () => {
      setPracownicy([]);
      setFirma({
          ...DEFAULT_FIRMA_STATE,
          okres: new Date().toISOString().slice(0, 7)
      });
      setProwizjaProc(config.prowizja.plus); // Default to Prime Plus
      setCurrentStep(-1);
  };

  const renderStep = () => {
      switch(currentStep) {
          case -2: return <StepSzybkaSymulacja onTransfer={() => setCurrentStep(1)} />;
          case -1: return <StepDashboard 
                            onNavigate={setCurrentStep} 
                            onImport={() => setImportModalOpen(true)}
                            onHistory={() => setDatabaseModalOpen(true)}
                            onConfig={() => setConfigModalOpen(true)}
                          />;
          case 0: return <StepFirma />;
          case 1: return <StepPracownicy onImportClick={() => setImportModalOpen(true)} />;
          case 2: return <StepWynikStandard />;
          case 3: return <StepWynikPodzial />;
          case 4: return <StepPorownanie />;
          case 5: return <StepPodsumowanie onGoToDashboard={handleCloseSession} />;
          case 6: return <StepAnalizaPracownika />;
          default: return null;
      }
  };

  const NavItem = ({ icon, label, onClick, active = false }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean, key?: React.Key }) => (
      <button 
        onClick={() => { onClick(); if(isMobile) setIsSidebarOpen(false); }}
        className={`flex items-center gap-3 py-3 md:py-2.5 transition-all rounded-md group relative mb-1
            ${isSidebarCollapsed ? 'justify-center px-2 w-full' : 'w-full px-4'}
            ${active
                ? 'bg-white text-brand shadow-sm ring-1 ring-[#edebe9]'
                : 'text-[#605e5c] hover:bg-[#f3f2f1] hover:text-[#201f1e]'}
        `}
        title={isSidebarCollapsed ? label : ''}
      >
          <div className={`${active ? 'text-brand' : 'text-[#a19f9d] group-hover:text-[#605e5c]'} flex-shrink-0 transition-transform ${isSidebarCollapsed ? 'scale-110' : ''}`}>
              {icon}
          </div>
          
          {!isSidebarCollapsed && (
              <span className="text-sm font-medium truncate">{label}</span>
          )}
          
          {/* Tooltip for collapsed mode */}
          {isSidebarCollapsed && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-[#323130] text-white text-xs rounded-sm opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity duration-150">
                  {label}
              </div>
          )}
      </button>
  );

  return (
    <div className={`${theme.layout.pageContainer} flex flex-col h-[100dvh] overflow-hidden`}>
      
      {/* HEADER - COMMAND BAR STYLE */}
      <header className="flex flex-col justify-end px-4 bg-brand text-white shadow-lg flex-shrink-0 z-30 transition-all w-full relative" style={{ paddingTop: 'env(safe-area-inset-top)', minHeight: 'calc(48px + env(safe-area-inset-top))' }}>
        <div className="flex justify-between items-center w-full h-[48px]">
        <div className="flex items-center gap-5 relative z-10">
            {/* Hamburger for Mobile */}
            <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className="text-white/80 hover:text-white transition-colors p-2 -ml-2 rounded-full hover:bg-white/10 lg:hidden"
            >
                {isSidebarOpen && isMobile ? <X /> : <Menu />}
            </button>
            
            {/* LOGO AREA */}
            <div
                className="flex items-center gap-3 select-none"
            >
                <div className="flex items-center justify-center w-8 h-8 transition-transform group-hover:scale-105">
                    <ShieldCheck className="h-8 w-auto text-white" />
                </div>

                <div className={`h-5 w-px bg-white/10 hidden sm:block transition-all ${animations.standard} ${isSidebarCollapsed ? 'opacity-0 w-0 mx-0' : 'opacity-100 mx-1'}`}></div>
                
                <div className={`flex flex-col justify-center overflow-hidden transition-all ${animations.standard} origin-left ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-48 opacity-100'}`}>
                    <span className="text-white font-bold tracking-tight text-sm whitespace-nowrap leading-tight">
                        Stratton Prime
                    </span>
                    <span className="text-blue-200/80 text-[10px] font-medium tracking-widest uppercase whitespace-nowrap">
                        System Płacowy
                    </span>
                </div>
            </div>
        </div>
        
        {/* CENTER: CONTEXT (ACTIVE COMPANY) - GLASSMORPHISM */}
        {firma.nazwa && (
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[400px]">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-full pl-1.5 pr-4 py-1.5 flex items-center gap-3 shadow-lg transition-all hover:bg-white/15 cursor-default group">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-bold text-white shadow-inner group-hover:scale-110 transition-transform">
                        {firma.nazwa.charAt(0)}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-[10px] text-blue-200 uppercase tracking-wider leading-none mb-0.5">Aktywna Sesja</span>
                        <span className="text-xs font-semibold text-white truncate max-w-[200px] leading-none">
                            {firma.nazwa}
                        </span>
                    </div>
                </div>
            </div>
        )}
        
        {/* RIGHT: GLOBAL ACTIONS & PROFILE */}
        <div className="flex items-center gap-4 relative z-10">
            
            {/* Tax Year Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-blue-950/50 border border-blue-900/50">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] font-medium text-blue-200 tracking-wide uppercase">
                    Rok Podatkowy <span className="text-white font-bold">2026</span>
                </span>
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

            {/* Profile */}
            <div className="flex items-center gap-3 group cursor-pointer">
                <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-white leading-none">DZIAŁ ANALIZ FINANSOWYCH</div>
                    <button onClick={handleCloseSession} className="text-[10px] text-blue-300 hover:text-white leading-none mt-1 transition-colors cursor-pointer">Wyloguj</button>
                </div>
                <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border-2 border-brand group-hover:border-blue-400 transition-colors">
                    SP
                </div>
            </div>
        </div>
        </div> {/* end inner 48px row */}
      </header>

      {/* WORKSPACE */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative w-full">
          
          {/* MOBILE OVERLAY BACKDROP */}
          {isMobile && isSidebarOpen && (
              <div 
                  className="absolute inset-0 bg-[#001433]/60 z-[35] backdrop-blur-sm transition-opacity animate-in fade-in"
                  onClick={() => setIsSidebarOpen(false)}
              ></div>
          )}

          {/* SIDEBAR */}
          <aside className={`
              absolute lg:static inset-y-0 left-0 z-40
              bg-[#f8fafc] border-r border-[#edebe9] shadow-2xl lg:shadow-none
              flex flex-col transition-all ${animations.standard} ease-in-out
              ${isSidebarCollapsed && !isMobile ? 'w-[72px]' : 'w-[280px] lg:w-72'}
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
              {/* Mobile Header in Sidebar */}
              <div className="lg:hidden flex justify-between items-center p-4 border-b border-[#edebe9] bg-white">
                  <span className="font-bold text-[#201f1e] text-sm uppercase tracking-wide">Menu</span>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-[#a19f9d] p-1"><X /></button>
              </div>

              {/* Collapse Toggle — desktop only */}
              <div className="hidden lg:flex items-center justify-end px-3 py-1.5 border-b border-[#edebe9]">
                  <button
                      onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                      className="p-1.5 rounded-md text-[#a19f9d] hover:text-[#323130] hover:bg-[#f3f2f1] transition-colors"
                      title={isSidebarCollapsed ? 'Rozwiń menu' : 'Zwiń menu'}
                  >
                      <ChevronLeft className={`w-4 h-4 transition-transform ${animations.standard} ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                  </button>
              </div>

              {/* Navigation Items */}
              <nav className={`flex-1 overflow-y-auto py-4 px-3 space-y-6 ${isSidebarCollapsed ? 'scrollbar-hide' : 'custom-scrollbar'}`}>

                  {/* GLOBAL NAV */}
                  <div>
                      {!isSidebarCollapsed && (
                          <div className="px-4 text-[10px] font-bold text-[#a19f9d] uppercase tracking-wider mb-2">
                              Start
                          </div>
                      )}
                      <NavItem active={currentStep === -1} onClick={() => setCurrentStep(-1)} icon={<Home />} label="Pulpit Startowy" />
                      <NavItem active={currentStep === -2} onClick={() => setCurrentStep(-2)} icon={<Zap />} label="Szybka Symulacja" />
                  </div>

                  {/* AKTYWNA ANALIZA — widoczna tylko gdy jesteśmy w procesie */}
                  {currentStep >= 0 && currentStep <= 5 && (
                      <div>
                          {!isSidebarCollapsed && (
                              <div className="px-4 text-[10px] font-bold text-[#a19f9d] uppercase tracking-wider mb-2">
                                  Aktywna Analiza
                              </div>
                          )}
                          {[
                              { icon: <Building />, label: 'Dane Organizacji' },
                              { icon: <Users />, label: 'Ewidencja Osobowa' },
                              { icon: <Calculator />, label: 'Analiza Kosztów' },
                              { icon: <ShieldCheck />, label: 'Model Docelowy' },
                              { icon: <TrendingUp />, label: 'Business Case' },
                              { icon: <FileText />, label: 'Podsumowanie' },
                          ].map((item, idx) => (
                              <NavItem
                                  key={idx}
                                  active={currentStep === idx}
                                  onClick={() => setCurrentStep(idx)}
                                  icon={item.icon}
                                  label={item.label}
                              />
                          ))}
                      </div>
                  )}

              </nav>

              {/* Bottom Actions */}
              <div className={`p-3 border-t border-[#edebe9] bg-white`}>
                  <NavItem icon={<Database className="w-4 h-4" />} label="Baza Ofert"    onClick={() => setDatabaseModalOpen(true)} />
                  <NavItem icon={<Settings className="w-4 h-4" />} label="Konfiguracja"  onClick={() => setConfigModalOpen(true)} />
              </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className={`
              flex-1 min-h-0 flex flex-col bg-[#f3f2f1] relative w-full overflow-hidden
              transition-all ${animations.standard}
          `}>
          <ErrorBoundary>

              {/* Step Indicator - Visible ONLY if step >= 0 */}
              {isProcessVisible && (
                  <div className="bg-white border-b border-[#edebe9] shadow-sm shrink-0 z-10 animate-in fade-in slide-in-from-top-2 w-full">
                      <div className="max-w-[1600px] mx-auto w-full">
                          <StepIndicator 
                              currentStep={currentStep} 
                              steps={steps} 
                              onStepClick={setCurrentStep} 
                          />
                      </div>
                  </div>
              )}

              {/* Scrollable Content Area - FIX: overflow-x-hidden to prevent horizontal scroll */}
              <div className={`flex-1 min-h-0 overflow-x-hidden w-full ${
                  (currentStep === -1 || currentStep === -2 || currentStep === 2 || currentStep === 3 || currentStep === 6)
                    ? 'overflow-hidden'
                    : 'overflow-y-auto custom-scrollbar'
              }`}>
                  <div className={`flex flex-col ${
                      currentStep === -1
                        ? 'h-full p-3 md:p-5 lg:p-6 max-w-[1600px] mx-auto w-full'
                        : currentStep === -2
                          ? 'h-full w-full'
                          : (currentStep === 2 || currentStep === 3 || currentStep === 6)
                            ? 'h-full min-h-0 w-full'
                            : (currentStep >= 0 ? 'min-h-full p-3 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full' : 'min-h-full w-full')
                  }`}>
                      <Suspense fallback={
                        <div className="flex items-center justify-center min-h-[400px] text-[#a19f9d] animate-pulse">
                          <div className="text-sm font-medium">Ładowanie...</div>
                        </div>
                      }>
                        {renderStep()}
                      </Suspense>
                  </div>
              </div>

              {/* Step Navigation Footer — Wróć / Dalej */}
              {currentStep >= 0 && currentStep <= 5 && (
                  <div className="bg-white border-t border-[#edebe9] px-4 md:px-6 py-2.5 flex items-center justify-between shrink-0 z-10 animate-in fade-in">
                      <button
                          onClick={() => setCurrentStep(currentStep === 0 ? -1 : currentStep - 1)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[#605e5c] hover:text-[#201f1e] hover:bg-[#f3f2f1] rounded-md transition-colors"
                      >
                          <ChevronLeft className="w-4 h-4" />
                          <span>{currentStep === 0 ? 'Pulpit' : steps[currentStep - 1]}</span>
                      </button>

                      <span className="text-[11px] text-[#a19f9d] font-medium tracking-wide hidden sm:block">
                          Krok {currentStep + 1} / 6
                      </span>

                      {currentStep < 5 ? (
                          <button
                              onClick={() => setCurrentStep(currentStep + 1)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white bg-brand hover:bg-[#002855] rounded-md transition-colors"
                          >
                              <span>{steps[currentStep + 1]}</span>
                              <ChevronRight className="w-4 h-4" />
                          </button>
                      ) : (
                          <div className="w-[120px]" />
                      )}
                  </div>
              )}

          </ErrorBoundary>
          </main>
      </div>

      {/* Global Toast Notification */}
      <Toast notification={notification} onClose={clearNotification} />

      {/* Modals */}
      <ImportModal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} />
      <ConfigModal isOpen={configModalOpen} onClose={() => setConfigModalOpen(false)} />
      <DatabaseModal 
        isOpen={databaseModalOpen} 
        onClose={() => setDatabaseModalOpen(false)} 
        onLoad={() => setCurrentStep(5)} 
      />

    </div>
  );
};

export default App;
