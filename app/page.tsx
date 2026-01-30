'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Upload, Clock, CheckCircle, Euro, TrendingUp, Menu, X } from 'lucide-react';

type Rechnung = {
  id: string;
  leistungserbringer: string;
  betrag: number;
  datum: string;
  status: string;
  art: string;
};

export default function Dashboard() {
  const [rechnungen, setRechnungen] = useState<Rechnung[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchRechnungen() {
      try {
        const res = await fetch('/api/rechnungen');
        const data = await res.json();
        setRechnungen(data || []);
      } catch (error) {
        console.error('Error fetching rechnungen:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchRechnungen();
  }, []);

  const stats = {
    offeneRechnungen: rechnungen.filter(r => r.status !== 'erstattet').length,
    gesamtRechnungen: rechnungen.length,
    ausstehendBetrag: rechnungen
      .filter(r => r.status !== 'erstattet')
      .reduce((sum, r) => sum + Number(r.betrag), 0),
    erstattetBetrag: rechnungen
      .filter(r => r.status === 'erstattet')
      .reduce((sum, r) => sum + Number(r.betrag), 0)
  };

  const recentInvoices = rechnungen.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Daten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile-Optimized Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="text-white" size={20} />
              </div>
              <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                BeihilfePay
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6">
              <Link href="/" className="text-teal-600 font-semibold">Dashboard</Link>
              <Link href="/upload" className="text-slate-600 hover:text-teal-600 transition">Upload</Link>
              <Link href="/rechnungen" className="text-slate-600 hover:text-teal-600 transition">Rechnungen</Link>
              <Link href="/einstellungen" className="text-slate-600 hover:text-teal-600 transition">Einstellungen</Link>
            </nav>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-teal-600"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-3 border-t border-slate-200 pt-3 space-y-2">
              <Link 
                href="/" 
                className="block py-2 px-3 text-teal-600 font-semibold bg-teal-50 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                href="/upload" 
                className="block py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Upload
              </Link>
              <Link 
                href="/rechnungen" 
                className="block py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Rechnungen
              </Link>
              <Link 
                href="/einstellungen" 
                className="block py-2 px-3 text-slate-600 hover:bg-slate-50 rounded-lg transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Einstellungen
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Welcome */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 sm:mb-2">
            Willkommen zurück! 👋
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            Hier ist deine Beihilfe-Übersicht
          </p>
        </div>

        {/* Stats Grid - Mobile Optimized */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {/* Offene Rechnungen */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="text-orange-600" size={20} />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full hidden sm:inline">
                OFFEN
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
              {stats.offeneRechnungen}
            </p>
            <p className="text-xs sm:text-sm text-slate-600">Offene</p>
          </div>

          {/* Gesamt */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
              {stats.gesamtRechnungen}
            </p>
            <p className="text-xs sm:text-sm text-slate-600">Gesamt</p>
          </div>

          {/* Ausstehend */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Euro className="text-purple-600" size={20} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
              €{stats.ausstehendBetrag.toFixed(0)}
            </p>
            <p className="text-xs sm:text-sm text-slate-600">Ausstehend</p>
          </div>

          {/* Erstattet */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="text-teal-600" size={20} />
              </div>
              <span className="text-xs font-semibold text-teal-600 bg-teal-100 px-2 py-1 rounded-full hidden sm:inline">
                ✓
              </span>
            </div>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-1">
              €{stats.erstattetBetrag.toFixed(0)}
            </p>
            <p className="text-xs sm:text-sm text-slate-600">Erstattet</p>
          </div>
        </div>

        {/* Recent Invoices - Mobile Optimized */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              Aktuelle Rechnungen
            </h3>
            <Link 
              href="/rechnungen" 
              className="text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-semibold"
            >
              Alle →
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <FileText className="mx-auto text-slate-300 mb-4" size={40} />
              <p className="text-sm sm:text-base text-slate-600 mb-4">
                Noch keine Rechnungen hochgeladen
              </p>
              <Link 
                href="/upload"
                className="inline-block px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white text-sm sm:text-base rounded-lg font-semibold hover:shadow-lg transition"
              >
                Erste Rechnung hochladen
              </Link>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {recentInvoices.map((invoice) => (
                <div 
                  key={invoice.id}
                  className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="text-slate-600" size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base text-slate-900 truncate">
                        {invoice.leistungserbringer}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-600">
                        {invoice.art} • {invoice.datum}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 flex-shrink-0 ml-2">
                    <p className="font-bold text-sm sm:text-lg text-slate-900 whitespace-nowrap">
                      €{Number(invoice.betrag).toFixed(2)}
                    </p>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      invoice.status === 'erstattet' 
                        ? 'bg-teal-100 text-teal-700'
                        : invoice.status === 'eingereicht'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {invoice.status === 'erstattet' ? '✓' : 
                       invoice.status === 'eingereicht' ? '→' : '○'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Upload CTA */}
          <Link 
            href="/upload"
            className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-lg p-6 sm:p-8 text-white hover:shadow-xl transition group"
          >
            <Upload className="mb-3 sm:mb-4 group-hover:scale-110 transition" size={28} />
            <h3 className="text-lg sm:text-xl font-bold mb-2">Neue Rechnung</h3>
            <p className="text-sm sm:text-base text-teal-50">
              📸 Foto machen - KI liest automatisch aus
            </p>
          </Link>

          {/* Stats */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 hover:shadow-md transition">
            <TrendingUp className="mb-3 sm:mb-4 text-teal-600" size={28} />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
              Statistiken
            </h3>
            <p className="text-sm sm:text-base text-slate-600">
              {rechnungen.length > 0 ? (
                <>Ø Bearbeitung: <strong>5 Tage</strong></>
              ) : (
                <>Statistiken verfügbar nach Upload</>
              )}
            </p>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Padding */}
      <div className="h-20 sm:h-0"></div>
    </div>
  );
}