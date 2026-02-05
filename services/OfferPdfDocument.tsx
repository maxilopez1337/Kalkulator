import React from 'react';
import { Page, Text, View, Document, StyleSheet, Svg, Circle, Font } from '@react-pdf/renderer';
import { formatPLN } from '../shared/utils/formatters';

// --- FONTS REGISTRATION (Polish Characters Support) ---
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc9.ttf', fontWeight: 'bold' },
    { src: 'https://fonts.gstatic.com/s/roboto/v30/KFOkCnqEu92Fr1Mu51xIIzI.ttf', fontStyle: 'italic' }
  ]
});

// --- CONSTANTS ---
const COMMON_RISK_ITEMS = [
  {
    number: "01",
    title: "TRANSPARENTNOŚĆ FISKALNA",
    content: "Pełna jawność składników wynagrodzenia w deklaracjach ZUS RCA. Model wyklucza stosowanie struktur agresywnej optymalizacji podatkowej oraz ukrytych przepływów kapitałowych."
  },
  {
    number: "02",
    title: "BAZA LEGISLACYJNA",
    content: "Implementacja oparta o dedykowane Uchwały Zarządu oraz modyfikację Regulaminu Wynagradzania. Zmiany wprowadzane są w drodze porozumienia zmieniającego (Aneksu), co gwarantuje stabilność stosunku pracy."
  },
  {
    number: "03",
    title: "MITYGACJA RYZYKA (OC)",
    content: "Proces wdrożeniowy objęty jest ochroną ubezpieczeniową w zakresie doradztwa podatkowego. Odpowiedzialność karno-skarbowa za konstrukcję modelu spoczywa na operatorze (Stratton Prime)."
  }
];

const COMMON_TIMELINE_STEPS = [
  {
    week: 1,
    title: "AUDYT I FORMALIZACJA",
    description: "Analiza struktury kosztowej (Due Diligence). Zawarcie umowy o współpracy (NDA & Service Agreement)."
  },
  {
    week: 2,
    title: "PRZYGOTOWANIE PRAWNE",
    description: "Opracowanie dedykowanych aktów wewnątrzzakładowych (Uchwały, Regulaminy) oraz aneksów pracowniczych."
  },
  {
    week: 3,
    title: "KOMUNIKACJA I WDROŻENIE",
    description: "Spotkania informacyjne z kadrą. Proces akceptacji zmian (podpisywanie aneksów) przy wsparciu konsultantów."
  },
  {
    week: 4,
    title: "URUCHOMIENIE OPERACYJNE",
    description: "Pierwsze naliczenie listy płac w nowym modelu (Go-Live). Weryfikacja poprawności deklaracji ZUS DRA."
  }
];

// --- STYLES ---
const styles = StyleSheet.create({
    page: { 
        fontFamily: 'Roboto', 
        fontSize: 10, 
        color: '#334155', 
        flexDirection: 'column', 
        backgroundColor: '#FFFFFF' 
    },
    // Cover Page Styles (Landscape Adjusted)
    coverContainer: {
        flexDirection: 'row',
        height: '100%',
    },
    coverSidebar: {
        width: '30%', // Reduced from 35% for landscape
        backgroundColor: '#0F172A', // Brand Dark
        padding: 40,
        color: '#FFFFFF',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    coverMain: {
        width: '70%',
        padding: 60, // More padding for landscape
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        position: 'relative',
    },
    brandTitle: {
        fontSize: 28, // Larger for landscape
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        letterSpacing: 2,
        color: '#C59D5F', // Brand Gold
        marginBottom: 20,
    },
    separator: {
        width: 80,
        height: 3,
        backgroundColor: '#475569',
        marginBottom: 30,
    },
    sidebarText: {
        fontSize: 11,
        color: '#94A3B8',
        textTransform: 'uppercase',
        letterSpacing: 1,
        lineHeight: 1.6,
    },
    clientLabel: {
        fontSize: 9,
        color: '#64748B',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    clientName: {
        fontSize: 26,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    clientId: {
        fontSize: 11,
        color: '#94A3B8',
    },
    confidentialText: {
        fontSize: 9,
        color: '#475569',
        marginTop: 60,
    },
    reportType: {
        fontSize: 12,
        color: '#C59D5F',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        letterSpacing: 1.5,
        marginBottom: 15,
    },
    mainTitle: {
        fontSize: 54, // Larger title
        fontFamily: 'Roboto',
        color: '#0F172A',
        marginBottom: 10,
        lineHeight: 1.1,
    },
    highlightGold: {
        color: '#C59D5F',
        fontFamily: 'Roboto',
        fontWeight: 'bold',
    },
    subtitle: {
        fontSize: 18,
        color: '#64748B',
        fontWeight: 'light',
        marginBottom: 50,
    },
    savingsBox: {
        backgroundColor: '#FFF7ED', // Orange-50
        borderLeftWidth: 5,
        borderLeftColor: '#C59D5F',
        padding: 35,
        marginBottom: 50,
        width: '90%', // Limit width
    },
    savingsLabel: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0F172A',
        textTransform: 'uppercase',
        marginBottom: 8,
    },
    savingsAmount: {
        fontSize: 42,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 12,
    },
    savingsNote: {
        fontSize: 11,
        color: '#C59D5F',
        fontFamily: 'Roboto',
        fontWeight: 'bold',
    },
    metaRow: {
        flexDirection: 'row',
        gap: 60, // Use gap for spacing between items
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
        paddingTop: 25,
        width: '90%',
    },
    metaLabel: {
        fontSize: 9,
        color: '#94A3B8',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    metaValue: {
        fontSize: 12, // Increased size
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#0F172A',
    },

    // Content Page Styles
    contentPage: {
        paddingVertical: 35,
        paddingHorizontal: 50,
    },
    pageHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0',
        paddingBottom: 12,
        marginBottom: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    pageTitle: {
        fontSize: 20,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#0F172A',
        textTransform: 'uppercase',
    },
    pageSubtitle: {
        fontSize: 9,
        color: '#C59D5F',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        fontWeight: 'bold',
    },
    pageNumber: {
        fontSize: 9,
        color: '#94A3B8',
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#C59D5F',
        paddingBottom: 6,
        alignSelf: 'flex-start',
    },
    
    // Financial Page
    kpiContainer: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 35,
    },
    kpiBox: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        padding: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    kpiHighlightBox: {
        flex: 1,
        backgroundColor: '#0F172A',
        padding: 20,
        borderRadius: 6,
    },
    kpiLabel: {
        fontSize: 9,
        textTransform: 'uppercase',
        color: '#64748B',
        marginBottom: 8,
    },
    kpiLabelLight: {
        fontSize: 9,
        textTransform: 'uppercase',
        color: '#94A3B8', // Light gray for dark bg
        marginBottom: 8,
    },
    kpiValue: {
        fontSize: 20,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#0F172A',
    },
    kpiValueGold: {
        fontSize: 24,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#C59D5F',
    },
    
    tableContainer: {
        width: '100%',
        marginTop: 15,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#F1F5F9',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 2,
        borderRadius: 4,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
        alignItems: 'center',
    },
    colCategory: { width: '45%', fontSize: 10, color: '#334155' },
    colValue: { width: '20%', fontSize: 10, textAlign: 'right', color: '#475569' },
    colDiff: { width: '15%', fontSize: 10, textAlign: 'right', fontFamily: 'Roboto', fontWeight: 'bold' },

    // Legal Page
    legalContainer: {
        flexDirection: 'row',
        gap: 40,
    },
    legalCol: {
        flex: 1,
    },
    statuteBox: {
        backgroundColor: '#F8FAFC',
        borderLeftWidth: 4,
        borderLeftColor: '#0F172A',
        padding: 15,
        marginBottom: 15,
        borderRadius: 4,
    },
    statuteTitle: {
        fontSize: 10,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 6,
    },
    statuteText: {
        fontSize: 10,
        fontStyle: 'italic',
        color: '#64748B',
        lineHeight: 1.4,
    },
    riskItem: {
        flexDirection: 'row',
        marginBottom: 25,
    },
    riskNumber: {
        fontSize: 36,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#E2E8F0',
        marginRight: 15,
        width: 50,
    },
    riskContent: { flex: 1 },
    riskTitle: {
        fontSize: 11,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 6,
    },
    riskDesc: {
        fontSize: 10,
        color: '#475569',
        lineHeight: 1.5,
    },

    // Roadmap Page
    timelineContainer: {
        marginTop: 30,
        marginBottom: 50,
        backgroundColor: '#F8FAFC',
        borderRadius: 8,
        padding: 20,
    },
    timelineStep: {
        flexDirection: 'column',
        alignItems: 'center',
        width: '24%', // Evenly distributed 4 steps
    },
    timelineStepRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Ensure top alignment
    },
    circle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#FFFFFF',
        borderWidth: 2,
        borderColor: '#0F172A',
        marginBottom: 15,
        alignItems: 'center', 
        justifyContent: 'center',
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
    },
    weekLabel: {
        fontSize: 9,
        color: '#C59D5F',
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    stepTitle: {
        fontSize: 11,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#0F172A',
        marginBottom: 6,
        textAlign: 'center',
        paddingHorizontal: 5,
    },
    stepDesc: {
        fontSize: 9,
        color: '#64748B',
        textAlign: 'center',
        paddingHorizontal: 10,
        lineHeight: 1.3,
    },
    
    summaryBox: {
        backgroundColor: '#F8FAFC',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 25,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderRadius: 6,
    },
    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 30,
    },
    signatureBlock: {
        width: '40%',
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#CBD5E1', 
        borderStyle: 'dashed',
        marginBottom: 8,
        height: 20,
    },
});

interface Props {
    firma: any;
    stats: any;
    prowizjaProc: number;
    customContent: any; // We'll ignore this for the new layout mostly
}

// --- HELPER DEFAULTS FOR BACKWARD COMPATIBILITY ---
export interface PdfCustomContent {
    // Keeping this interface to match what offerPdfGenerator expects,
    // even if we ignore some fields in the new layout.
    coverTitle: string;
    coverSubtitle: string; 
    [key: string]: any;
}
export const getDefaultPdfContent = (isPlus: boolean): PdfCustomContent => ({
    coverTitle: "OFERTA",
    coverSubtitle: "STANDARD",
});


// --- COMPONENT ---
export const OfferPdfDocument = ({ firma, stats, prowizjaProc }: Props) => {
    
    // Prepare financial data rows
    const financialRows = [
        { 
            label: "Łączne Wynagrodzenia Brutto", 
            standard: stats.standard.brutto, 
            eliton: stats.stratton.brutto, 
            diff: stats.standard.brutto - stats.stratton.brutto 
        },
        { 
            label: "Narzuty Publicznoprawne (ZUS Pracodawcy)", 
            standard: stats.standard.zusPracodawca, 
            eliton: stats.stratton.zusPracodawca, 
            diff: stats.standard.zusPracodawca - stats.stratton.zusPracodawca, 
            highlight: true 
        },
        { 
            label: "Obciążenia Składkowe Pracownika", 
            standard: stats.standard.zusPracownik, 
            eliton: stats.stratton.zusPracownik, 
            diff: stats.standard.zusPracownik - stats.stratton.zusPracownik 
        },
        { 
            label: "Zaliczka na Podatek Dochodowy (PIT)", 
            standard: stats.standard.pit, 
            eliton: stats.stratton.pit, 
            diff: stats.standard.pit - stats.stratton.pit 
        },
        { 
            label: "Efektywne Wynagrodzenie Netto", 
            standard: stats.standard.netto, 
            eliton: stats.stratton.netto, 
            diff: 0 // Assumes net neutral or negotiation, simplified for report
        },
    ];

    return (
        <Document>
            
            {/* 1. COVER PAGE - LANDSCAPE */}
            <Page size="A4" orientation="landscape" style={styles.page}>
                <View style={styles.coverContainer}>
                    {/* Sidebar */}
                    <View style={styles.coverSidebar}>
                        <View>
                            <Text style={styles.brandTitle}>STRATTON{"\n"}PRIME</Text>
                            <View style={styles.separator} />
                            <Text style={styles.sidebarText}>Memorandum Strategiczne:{"\n"}Efektywność Kosztowa</Text>
                        </View>
                        <View>
                            <Text style={styles.clientLabel}>Podmiot Opracowania:</Text>
                            <Text style={styles.clientName}>{firma.nazwa || "KLIENT"}</Text>
                            <Text style={styles.clientId}>ID: PL-2026-X892</Text>
                            <View style={{ marginTop: 60 }}>
                                <Text style={styles.sidebarText}>© 2026 Stratton Prime Sp. z o.o.</Text>
                                <Text style={styles.confidentialText}>DOKUMENT POUFNY (CONFIDENTIAL).{"\n"}Wyłącznie do użytku Zarządu.</Text>
                            </View>
                        </View>
                    </View>

                    {/* Main Content */}
                    <View style={styles.coverMain}>
                        <View>
                             <Svg height="250" width="250" style={{ position: 'absolute', top: -60, right: -60, opacity: 0.08 }}>
                                <Circle cx="125" cy="125" r="100" stroke="#C59D5F" strokeWidth="3" fill="none" />
                                <Circle cx="125" cy="125" r="75" stroke="#0F172A" strokeWidth="1" fill="none" />
                            </Svg>

                            <Text style={styles.reportType}>Raport Wdrożeniowy (Executive Summary)</Text>
                            <Text style={styles.mainTitle}>Model{"\n"}<Text style={styles.highlightGold}>Eliton Prime™</Text></Text>
                            <Text style={styles.subtitle}>Strategia optymalizacji kosztów pracy i retencji kapitału</Text>

                            <View style={styles.savingsBox}>
                                <Text style={styles.savingsLabel}>Prognozowana Nadwyżka Finansowa (Rocznie)</Text>
                                <Text style={styles.savingsAmount}>{formatPLN(stats.oszczednoscRoczna)}</Text>
                                <Text style={styles.savingsNote}>przy zachowaniu pełnego bezpieczeństwa prawno-skarbowego</Text>
                            </View>

                            <View style={styles.metaRow}>
                                <View>
                                    <Text style={styles.metaLabel}>Data Opracowania:</Text>
                                    <Text style={styles.metaValue}>{new Date().toLocaleDateString('pl-PL')}</Text>
                                </View>
                                <View>
                                    <Text style={styles.metaLabel}>Standard Raportowania:</Text>
                                    <Text style={styles.metaValue}>v2.6.1 (Legislacja 2026)</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Page>

            {/* 2. FINANCIAL ANALYSIS */}
            <Page size="A4" orientation="landscape" style={styles.contentPage}>
                 <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.pageTitle}>Analiza Ekonomiczna</Text>
                        <Text style={styles.pageSubtitle}>PROJEKCJA PRZEPŁYWÓW (MIESIĘCZNIE)</Text>
                    </View>
                    <Text style={styles.pageNumber}>Strona 2/4 • Nr Ref: SP/2026/A1</Text>
                </View>

                {/* KPIs */}
                <View style={styles.kpiContainer}>
                     <View style={styles.kpiBox}>
                        <Text style={styles.kpiLabel}>Koszt As-Is (Miesięcznie)</Text>
                        <Text style={styles.kpiValue}>{formatPLN(stats.standard.kosztPracodawcy)}</Text>
                    </View>
                    <View style={styles.kpiBox}>
                        <Text style={styles.kpiLabel}>Koszt To-Be (Miesięcznie)</Text>
                        <Text style={styles.kpiValue}>{formatPLN(stats.stratton.kosztPracodawcy)}</Text>
                    </View>
                     <View style={styles.kpiHighlightBox}>
                        <Text style={styles.kpiLabelLight}>Uwolnione Środki (Miesięcznie)</Text>
                        <Text style={styles.kpiValueGold}>{formatPLN(stats.oszczednoscMiesieczna)}</Text>
                    </View>
                </View>

                {/* Table */}
                <Text style={styles.sectionTitle}>Dekompozycja Kosztów</Text>
                <View style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                        <Text style={styles.colCategory}>KATEGORIA BUDŻETOWA</Text>
                        <Text style={styles.colValue}>MODEL BAZOWY</Text>
                        <Text style={styles.colValue}>MODEL ELITON</Text>
                        <Text style={styles.colDiff}>DELTA</Text>
                    </View>
                    {financialRows.map((row, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={[styles.colCategory, { fontWeight: row.highlight ? 'bold' : 'normal', fontFamily: row.highlight ? 'Roboto' : 'Roboto' }]}>{row.label}</Text>
                            <Text style={styles.colValue}>{formatPLN(row.standard)}</Text>
                            <Text style={styles.colValue}>{formatPLN(row.eliton)}</Text>
                            <Text style={[styles.colDiff, { color: row.diff > 0 ? '#DC2626' : '#16A34A' }]}>
                                {row.diff === 0 ? "-" : formatPLN(row.diff)}
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={{ marginTop: 25 }}>
                     <Text style={{ fontSize: 10, color: '#64748B' }}>
                         * Powyższe wyliczenia przedstawiają uśrednioną projekcję oszczędności dla całego zespołu. Szczegółowe kalkulacje pracownicze znajdują się w załączniku nr 1.
                     </Text>
                </View>
            </Page>

            {/* 3. LEGAL & RISK */}
            <Page size="A4" orientation="landscape" style={styles.contentPage}>
                 <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.pageTitle}>Ramy Prawno-Podatkowe</Text>
                        <Text style={styles.pageSubtitle}>COMPLIANCE & RISK MANAGEMENT</Text>
                    </View>
                    <Text style={styles.pageNumber}>Strona 3/4</Text>
                </View>

                <View style={styles.legalContainer}>
                    {/* Left Column */}
                    <View style={styles.legalCol}>
                        <Text style={styles.sectionTitle}>Architektura Rozwiązania</Text>
                        <Text style={{ fontSize: 11, lineHeight: 1.6, color: '#334155', marginBottom: 25 }}>
                            Model Eliton Prime™ wykorzystuje legalny dualizm składników wynagrodzenia, operując w granicach wyznaczonych przez obowiązujący porządek prawny (tzw. Safe Harbour). 
                            Mechanizm polega na zastosowaniu ustawowych wyłączeń z podstawy wymiaru składek ZUS dla określonych kategorii przychodów.
                        </Text>

                        <View style={styles.statuteBox}>
                            <Text style={styles.statuteTitle}>ART. 12 UST. 1 USTAWY O PIT</Text>
                            <Text style={styles.statuteText}>
                                "Za przychody ze stosunku pracy uważa się wszelkiego rodzaju wypłaty pieniężne oraz wartość pieniężną świadczeń w naturze..."
                            </Text>
                        </View>
                         <View style={styles.statuteBox}>
                            <Text style={styles.statuteTitle}>§2 UST. 1 PKT 26 ROZP. MPiPS</Text>
                            <Text style={styles.statuteText}>
                                "Podstawy wymiaru składek nie stanowią (...) korzyści materialne wynikające z układów zbiorowych pracy, regulaminów wynagradzania..."
                            </Text>
                        </View>
                    </View>

                    {/* Right Column */}
                    <View style={styles.legalCol}>
                        <Text style={styles.sectionTitle}>Zarządzanie Ryzykiem</Text>
                        <View style={{ marginTop: 10 }}>
                            {COMMON_RISK_ITEMS.map((item, idx) => (
                                <View key={idx} style={styles.riskItem}>
                                    <Text style={styles.riskNumber}>{item.number}</Text>
                                    <View style={styles.riskContent}>
                                        <Text style={styles.riskTitle}>{item.title}</Text>
                                        <Text style={styles.riskDesc}>{item.content}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </Page>

            {/* 4. ACTION PLAN */}
            <Page size="A4" orientation="landscape" style={styles.contentPage}>
                 <View style={styles.pageHeader}>
                    <View>
                        <Text style={styles.pageTitle}>Mapa Drogowa Wdrożenia</Text>
                        <Text style={styles.pageSubtitle}>HARMONOGRAM I DECYZJE OPERACYJNE</Text>
                    </View>
                    <Text style={styles.pageNumber}>Strona 4/4</Text>
                </View>

                <Text style={styles.sectionTitle}>Cykl Implementacyjny (4 Tygodnie)</Text>
                
                {/* Horizontal Timeline simulation */}
                <View style={styles.timelineContainer}>
                    <View style={styles.timelineStepRow}>
                        {COMMON_TIMELINE_STEPS.map((step, idx) => (
                            <View key={idx} style={styles.timelineStep}>
                                <View style={styles.circle}>
                                     <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#0F172A' }} />
                                </View>
                                <Text style={styles.weekLabel}>TYDZIEŃ {step.week}</Text>
                                <Text style={styles.stepTitle}>{step.title}</Text>
                                <Text style={styles.stepDesc}>{step.description}</Text>
                            </View>
                        ))}
                    </View>
                </View>


                <View style={{ marginTop: 30 }}>
                    <View style={styles.summaryBox}>
                        <View>
                             <Text style={{ fontSize: 9, textTransform: 'uppercase', color: '#64748B', marginBottom: 5 }}>REKAPITULACJA WARTOŚCI BIZNESOWEJ</Text>
                             <Text style={{ fontSize: 20, fontFamily: 'Roboto', fontWeight: 'bold', color: '#0F172A' }}>Model Eliton Prime™</Text>
                             <Text style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>Wariant PLUS: Retencja pracowników + Oszczędność</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                              <Text style={{ fontSize: 9, textTransform: 'uppercase', color: '#64748B', marginBottom: 5 }}>SZACOWANA OSZCZĘDNOŚĆ ROCZNA</Text>
                              <Text style={{ fontSize: 28, fontFamily: 'Roboto', fontWeight: 'bold', color: '#0F172A' }}>{formatPLN(stats.oszczednoscRoczna)}</Text>
                        </View>
                    </View>

                    <View style={styles.signatureRow}>
                         <View style={styles.signatureBlock}>
                             <Text style={{ fontSize: 9, fontFamily: 'Roboto', fontWeight: 'bold', color: '#0F172A', marginBottom: 20 }}>REPREZENTACJA STRATTON PRIME:</Text>
                             <View style={styles.signatureLine} />
                             <Text style={{ fontSize: 9, color: '#94A3B8' }}>Data i Podpis Członka Zarządu / Prokurenta</Text>
                         </View>
                         <View style={styles.signatureBlock}>
                             <Text style={{ fontSize: 9, fontFamily: 'Roboto', fontWeight: 'bold', color: '#0F172A', marginBottom: 20 }}>REPREZENTACJA KLIENTA:</Text>
                             <View style={styles.signatureLine} />
                             <Text style={{ fontSize: 9, color: '#94A3B8' }}>Data i Podpis Osób Upoważnionych (KRS)</Text>
                         </View>
                    </View>
                </View>
            </Page>

        </Document>
    );
};








