
import React, { useState, useEffect } from 'react';
import { StepIndicator } from './shared/ui/StepIndicator';
import { Menu, X, Home, Zap, Building, ShieldCheck, Check, Info } from './common/Icons';
import { ImportModal } from './features/modals/ImportModal';
import { ConfigModal } from './features/modals/ConfigModal';
import { DatabaseModal } from './features/modals/DatabaseModal';
import { StepDashboard } from './features/steps/dashboard/StepDashboard';
import { StepSzybkaSymulacja } from './features/steps/simulation/StepSzybkaSymulacja';
import { StepFirma } from './features/steps/company/StepFirma';
import { StepPracownicy } from './features/steps/employees/StepPracownicy';
import { StepWynikStandard } from './features/steps/results/StepWynikStandard';
import { StepWynikPodzial } from './features/steps/results/StepWynikPodzial';
import { StepPorownanie } from './features/steps/comparison/StepPorownanie';
import { StepPodsumowanie } from './features/steps/summary/StepPodsumowanie';
import { useAppStore } from './store/AppContext';
import { theme } from './common/theme';
import { Calculator, Settings, Database, Users, FileText, TrendingUp, Save } from './common/Icons';
import { DEFAULT_FIRMA_STATE } from './store/CompanyContext';

// Toast Component Local
const ToastNotification = ({ notification, onClose }: { notification: any, onClose: () => void }) => {
    if (!notification) return null;

    const isSuccess = notification.type === 'success';
    const isError = notification.type === 'error';
    
    return (
        <div className={`fixed bottom-6 right-6 z-[100] max-w-sm w-full bg-white rounded-lg shadow-2xl border-l-4 overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center p-4 gap-3 ${isSuccess ? 'border-emerald-500' : isError ? 'border-rose-500' : 'border-blue-500'}`}>
            <div className={`p-2 rounded-full flex-shrink-0 ${isSuccess ? 'bg-emerald-100 text-emerald-600' : isError ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                {isSuccess ? <Check className="w-5 h-5" /> : isError ? <X className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            </div>
            <div className="flex-1">
                <h4 className={`text-sm font-bold ${isSuccess ? 'text-emerald-900' : isError ? 'text-rose-900' : 'text-blue-900'}`}>
                    {isSuccess ? 'Sukces' : isError ? 'Błąd' : 'Informacja'}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">{notification.message}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

const App = () => {
  // Start on Dashboard (-1), Simulation is -2
  const [currentStep, setCurrentStep] = useState(-1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Desktop collapsed state
  const [isProcessVisible, setIsProcessVisible] = useState(false); // Visibility of calculation timeline
  const [isMobile, setIsMobile] = useState(false);
  const { firma, notification, clearNotification, setPracownicy, setFirma, setProwizjaProc } = useAppStore();

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
      'Podsumowanie'
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
      setProwizjaProc(26); // Default 26% for Prime Plus
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
          default: return null;
      }
  };

  const NavItem = ({ icon, label, onClick, active = false }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) => (
      <button 
        onClick={() => { onClick(); if(isMobile) setIsSidebarOpen(false); }}
        className={`flex items-center gap-3 py-3 md:py-2.5 transition-all rounded-md group relative mb-1
            ${isSidebarCollapsed ? 'justify-center px-2 w-full' : 'w-full px-4'}
            ${active 
                ? 'bg-white text-[#001433] shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
        `}
        title={isSidebarCollapsed ? label : ''}
      >
          <div className={`${active ? 'text-[#001433]' : 'text-slate-400 group-hover:text-slate-600'} flex-shrink-0 transition-transform ${isSidebarCollapsed ? 'scale-110' : ''}`}>
              {icon}
          </div>
          
          {!isSidebarCollapsed && (
              <span className="text-sm font-medium truncate">{label}</span>
          )}
          
          {/* Tooltip for collapsed mode */}
          {isSidebarCollapsed && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                  {label}
              </div>
          )}
      </button>
  );

  // --- PROCES STEP ITEM (TIMELINE LOOK) ---
  const ProcessStepItem = ({ stepIdx, icon, label, onClick }: { stepIdx: number, icon: React.ReactNode, label: string, onClick: () => void }) => {
      const isActive = currentStep === stepIdx;
      const isCompleted = currentStep > stepIdx;
      const isLast = stepIdx === 5;

      // Collapsed View (Just Icons with status dot)
      if (isSidebarCollapsed) {
          return (
            <button 
                onClick={() => { onClick(); if(isMobile) setIsSidebarOpen(false); }}
                className={`relative flex justify-center items-center w-full py-3 mb-1 rounded-md transition-all group
                    ${isActive ? 'bg-[#001433] text-white shadow-md' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'}
                `}
                title={label}
            >
                {icon}
                {isCompleted && !isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border border-white"></div>
                )}
                <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {label}
                </div>
            </button>
          );
      }

      // Full Timeline View
      return (
        <div className="relative pl-4">
            {/* Connecting Line */}
            {!isLast && (
                <div className={`absolute left-[27px] top-8 bottom-[-8px] w-0.5 transition-colors duration-500 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}`}></div>
            )}

            <button 
                onClick={() => { onClick(); if(isMobile) setIsSidebarOpen(false); }}
                className={`group flex items-center gap-3 w-full py-2 px-2 rounded-lg transition-all text-left relative z-10
                    ${isActive ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'hover:bg-slate-50'}
                `}
            >
                {/* Step Circle/Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 transition-all duration-300 flex-shrink-0 shadow-sm
                    ${isActive 
                        ? 'bg-[#001433] border-[#001433] text-white scale-110 ring-2 ring-blue-100' 
                        : isCompleted 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                            : 'bg-white border-slate-200 text-slate-300 group-hover:border-slate-300'}
                `}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : icon}
                </div>

                <div className="flex flex-col min-w-0">
                    <span className={`text-sm truncate transition-colors font-medium ${isActive ? 'text-[#001433]' : isCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {label}
                    </span>
                    {isActive && <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider animate-in fade-in">W trakcie</span>}
                </div>
            </button>
        </div>
      );
  };

  return (
    <div className={`${theme.layout.pageContainer} flex flex-col h-[100dvh] overflow-hidden`}>
      
      {/* HEADER - COMMAND BAR STYLE */}
      <header className="flex justify-between items-center px-4 h-[64px] bg-[#001433] text-white shadow-lg flex-shrink-0 z-30 transition-all w-full relative overflow-hidden">
        
        {/* Background Gradient Accent */}
        <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none"></div>

        {/* LEFT: BRAND & TOGGLE */}
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
                className="flex items-center gap-3 cursor-pointer group select-none" 
                onClick={() => !isMobile && setIsSidebarCollapsed(!isSidebarCollapsed)}
                title="Przełącz widok menu"
            >
                <div className="flex items-center justify-center w-8 h-8 transition-transform group-hover:scale-105">
                    <ShieldCheck className="h-8 w-auto text-white" />
                </div>

                <div className={`h-5 w-px bg-white/10 hidden sm:block transition-all duration-300 ${isSidebarCollapsed ? 'opacity-0 w-0 mx-0' : 'opacity-100 mx-1'}`}></div>
                
                <div className={`flex flex-col justify-center overflow-hidden transition-all duration-300 origin-left ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-48 opacity-100'}`}>
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
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/50 border border-blue-900/50">
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
                    <div className="text-[10px] text-blue-300 leading-none mt-1">Wyloguj</div>
                </div>
                <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border-2 border-[#001433] group-hover:border-blue-400 transition-colors">
                    SP
                </div>
            </div>
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative w-full">
          
          {/* MOBILE OVERLAY BACKDROP */}
          {isMobile && isSidebarOpen && (
              <div 
                  className="absolute inset-0 bg-slate-900/60 z-40 backdrop-blur-sm transition-opacity animate-in fade-in"
                  onClick={() => setIsSidebarOpen(false)}
              ></div>
          )}

          {/* SIDEBAR */}
          <aside className={`
              absolute lg:static inset-y-0 left-0 z-50
              bg-[#f8fafc] border-r border-[#edebe9] shadow-2xl lg:shadow-none
              flex flex-col transition-all duration-300 ease-in-out
              ${isSidebarCollapsed && !isMobile ? 'w-[72px]' : 'w-[280px] lg:w-72'}
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
              {/* Mobile Header in Sidebar */}
              <div className="lg:hidden flex justify-between items-center p-4 border-b border-slate-200 bg-white">
                  <span className="font-bold text-slate-800 text-sm uppercase tracking-wide">Menu</span>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 p-1"><X /></button>
              </div>

              {/* Navigation Items */}
              <nav className={`flex-1 overflow-y-auto py-6 px-3 space-y-6 ${isSidebarCollapsed ? 'scrollbar-hide' : 'custom-scrollbar'}`}>
                  
                  {/* GLOBAL NAV */}
                  <div>
                      {!isSidebarCollapsed && (
                          <div className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                              Start
                          </div>
                      )}
                      <NavItem active={currentStep === -1} onClick={() => setCurrentStep(-1)} icon={<Home />} label="Pulpit Startowy" />
                      <NavItem active={currentStep === -2} onClick={() => setCurrentStep(-2)} icon={<Zap />} label="Szybka Symulacja" />
                  </div>
                  
                  {/* CONTEXTUAL PROCESS NAV (Dynamic Timeline) */}
                  <div className={`transition-all duration-500 ease-in-out origin-top ${isProcessVisible ? 'opacity-100 max-h-[800px] scale-y-100' : 'opacity-0 max-h-0 scale-y-95 overflow-hidden'}`}>
                      {!isSidebarCollapsed && (
                          <div className="px-4 text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-4 flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                              <span>Aktywny Proces</span>
                              <div className="h-px bg-blue-100 flex-1"></div>
                          </div>
                      )}
                      
                      <div className="space-y-0">
                          <ProcessStepItem stepIdx={0} onClick={() => setCurrentStep(0)} icon={<Building className="w-3.5 h-3.5" />} label="Dane Organizacji" />
                          <ProcessStepItem stepIdx={1} onClick={() => setCurrentStep(1)} icon={<Users className="w-3.5 h-3.5" />} label="Ewidencja Osobowa" />
                          <ProcessStepItem stepIdx={2} onClick={() => setCurrentStep(2)} icon={<Calculator className="w-3.5 h-3.5" />} label="Analiza Kosztów" />
                          <ProcessStepItem stepIdx={3} onClick={() => setCurrentStep(3)} icon={<Settings className="w-3.5 h-3.5" />} label="Model Docelowy" />
                          <ProcessStepItem stepIdx={4} onClick={() => setCurrentStep(4)} icon={<TrendingUp className="w-3.5 h-3.5" />} label="Business Case" />
                          <ProcessStepItem stepIdx={5} onClick={() => setCurrentStep(5)} icon={<FileText className="w-3.5 h-3.5" />} label="Podsumowanie" />
                      </div>
                  </div>

              </nav>

              {/* Bottom Actions */}
              <div className={`p-4 border-t border-[#edebe9] space-y-2 bg-white transition-all ${isSidebarCollapsed ? 'items-center flex flex-col px-2' : ''}`}>
                  <button 
                    onClick={() => { setDatabaseModalOpen(true); if(isMobile) setIsSidebarOpen(false); }} 
                    className={`flex items-center gap-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'}`}
                    title="Baza Ofert"
                  >
                      <Database className="w-4 h-4" /> 
                      {!isSidebarCollapsed && <span>Baza Ofert</span>}
                  </button>
                  <button 
                    onClick={() => { setConfigModalOpen(true); if(isMobile) setIsSidebarOpen(false); }} 
                    className={`flex items-center gap-3 py-2 text-sm font-medium text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors w-full ${isSidebarCollapsed ? 'justify-center px-0' : 'px-4'}`}
                    title="Konfiguracja"
                  >
                      <Settings className="w-4 h-4" /> 
                      {!isSidebarCollapsed && <span>Konfiguracja</span>}
                  </button>
              </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className={`
              flex-1 flex flex-col bg-[#f3f2f1] relative w-full overflow-hidden
              transition-all duration-300
          `}>
              
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
              <div className="flex-1 overflow-y-auto overflow-x-hidden p-0 md:p-0 custom-scrollbar w-full">
                  <div className={`min-h-full flex flex-col ${
                      (currentStep === 2 || currentStep === 3) 
                        ? 'p-2 md:p-4 w-full' 
                        : (currentStep >= 0 || currentStep === -1 ? 'p-3 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full' : 'w-full')
                  }`}>
                      {renderStep()}
                  </div>
              </div>

          </main>
      </div>

      {/* Global Toast Notification */}
      <ToastNotification notification={notification} onClose={clearNotification} />

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
