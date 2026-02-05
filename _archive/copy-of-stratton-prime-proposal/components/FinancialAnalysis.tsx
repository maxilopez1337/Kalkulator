import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProposalData } from '../types';
import { formatCurrency } from '../utils/format';
import PageHeader from './ui/PageHeader';
import PageFooter from './ui/PageFooter';

interface Props {
  data: ProposalData;
}

const FinancialAnalysis: React.FC<Props> = ({ data }) => {
  const chartData = [
    { name: 'Model Bazowy', cost: data.totalSummary.standard, profit: 0 },
    { name: 'Model Eliton', cost: data.totalSummary.eliton, profit: Math.abs(data.totalSummary.diff) },
  ];

  return (
    // Reduced padding from p-12 to p-8 (32px) to prevent vertical overflow
    <div className="h-full bg-white relative flex flex-col p-8 max-w-7xl mx-auto box-border">
      <PageHeader
        title="ANALIZA EKONOMICZNA"
        subtitle="PROJEKCJA PRZEPŁYWÓW (MIESIĘCZNIE)"
        pageInfo="Strona 2/4 • Nr Ref: SP/2026/A1"
      />

      <div className="flex-grow flex flex-col lg:flex-row gap-8 mt-2">
        {/* Left Column: Summary and Highlights */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Koszt As-Is</p>
                <p className="text-lg xl:text-xl font-bold text-slate-800">{formatCurrency(data.totalSummary.standard)}</p>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg">
                <p className="text-[10px] uppercase text-slate-500 font-bold mb-1">Koszt To-Be</p>
                <p className="text-lg xl:text-xl font-bold text-slate-800">{formatCurrency(data.totalSummary.eliton)}</p>
              </div>
          </div>

          <div className="bg-brand-dark text-white p-5 rounded-lg shadow-lg">
            <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Uwolnione Środki (Miesięcznie)</p>
            <p className="text-3xl font-bold text-brand-gold mb-1">{formatCurrency(data.savingsMonthly)}</p>
            <p className="text-[10px] text-gray-300">Dodatkowy Cash Flow Operacyjny</p>
          </div>

          <div className="flex-grow flex flex-col">
             <h4 className="text-xs font-bold uppercase text-slate-800 mb-2">Dekompozycja Kosztów</h4>
             <div className="flex-grow min-h-[200px] bg-slate-50 rounded-lg p-2 border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                        <YAxis hide />
                        <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', fontSize: '10px' }}
                        />
                        <Bar dataKey="cost" stackId="a" fill="#94a3b8" barSize={40} />
                        <Bar dataKey="profit" stackId="a" fill="#C59D5F" barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
             </div>
             <div className="flex gap-4 mt-2 text-[10px] uppercase font-bold text-slate-500 justify-center">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-400"></div> Koszty Pracy</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-brand-gold"></div> Uwolniony Kapitał</div>
             </div>
          </div>
        </div>

        {/* Right Column: Detailed Table */}
        <div className="w-full lg:w-2/3 flex flex-col justify-center">
            <div className="overflow-hidden">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="bg-gray-100 text-gray-600 uppercase text-[10px]">
                            <th className="py-2 px-3 text-left font-bold">Kategoria Budżetowa</th>
                            <th className="py-2 px-3 text-right">Model Bazowy</th>
                            <th className="py-2 px-3 text-right">Model Eliton</th>
                            <th className="py-2 px-3 text-right">Delta</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.financialData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                <td className="py-3 px-3 text-slate-700 font-medium">{row.category}</td>
                                <td className="py-3 px-3 text-right text-slate-600">{formatCurrency(row.standard)}</td>
                                <td className={`py-3 px-3 text-right font-semibold ${row.category === "Efektywne Wynagrodzenie Netto" ? "text-brand-dark" : "text-slate-800"}`}>
                                    {formatCurrency(row.eliton)}
                                </td>
                                <td className={`py-3 px-3 text-right font-bold ${row.highlight ? "text-green-600" : row.diff < 0 ? "text-slate-800" : "text-slate-400"}`}>
                                    {row.diff === 0 ? (row.category.includes("Brutto") ? <span className="text-[10px] text-gray-400 font-normal block text-right">RESTRUKTURYZACJA</span> : "-") : formatCurrency(row.diff)}
                                </td>
                            </tr>
                        ))}
                        {/* Spacer */}
                        <tr className="h-4"></tr>

                        {/* Extra Costs Section */}
                        {data.extraCosts.map((item, idx) => (
                            <tr key={`extra-${idx}`} className="hover:bg-gray-50 transition-colors">
                                <td className={`py-2 px-3 font-medium ${item.label.includes("Wzrost") || item.label.includes("Operacyjne") ? "text-blue-700" : "text-slate-500 italic"}`}>
                                    {item.label}
                                </td>
                                <td className="py-2 px-3 text-right text-slate-400">-</td>
                                <td className={`py-2 px-3 text-right ${item.label.includes("Wzrost") ? "text-blue-700 font-bold" : "text-brand-gold"}`}>
                                    {formatCurrency(item.value)}
                                </td>
                                <td className={`py-2 px-3 text-right text-[10px] uppercase font-bold ${item.label.includes("Wzrost") ? "text-blue-900" : item.type === "FAKTURA VAT" ? "text-gray-500" : "text-indigo-400"}`}>
                                    {item.type}
                                </td>
                            </tr>
                        ))}

                        {/* Total Row */}
                        <tr className="bg-brand-light border-t-2 border-brand-gold/20">
                            <td className="py-4 px-3 font-bold text-brand-dark text-sm">ŁĄCZNY KOSZT FINALNY</td>
                            <td className="py-4 px-3 text-right font-bold text-slate-800 text-sm">{formatCurrency(data.totalSummary.standard)}</td>
                            <td className="py-4 px-3 text-right font-bold text-brand-dark text-sm">{formatCurrency(data.totalSummary.eliton)}</td>
                            <td className="py-4 px-3 text-right font-bold text-brand-gold text-sm">{formatCurrency(data.totalSummary.diff)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div className="mt-2 text-right">
                <p className="text-[10px] text-gray-400 italic">
                    * Kwoty wyrażone w PLN. Kalkulacja obejmuje pełne obciążenia pracodawcy (ZUS, FP, FGŚP) oraz zaliczki na podatek dochodowy.
                </p>
            </div>
        </div>
      </div>
        <PageFooter pageNumber="2 Z 4" />
    </div>
  );
};

export default FinancialAnalysis;