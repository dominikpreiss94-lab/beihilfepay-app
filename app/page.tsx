'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Upload, Clock, CheckCircle, Euro, TrendingUp } from 'lucide-react';

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

  // Stats aus echten Daten berechnen
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Daten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="text-white" size={24} />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                BeihilfePay
              </h1>
            </div>
            <nav className="flex gap-6">
              <Link href="/" className="text-teal-600 font-semibold">Dashboard</Link>
              <Link href="/upload" className="text-slate-600 hover:text-teal-600 transition">Upload</Link>
              <Link href="/rechnungen" className="text-slate-600 hover:text-teal-600 transition">Rechnungen</Link>
              <Link href="/einstellungen" className="text-slate-600 hover:text-teal-600 transition">Einstellungen</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Willkommen zurück! 👋</h2>
          <p className="text-slate-600">Hier ist deine Beihilfe-Übersicht</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Offene Rechnungen */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="text-orange-600" size={24} />
              </div>
              <span className="text-xs font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                OFFEN
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.offeneRechnungen}</p>
            <p className="text-sm text-slate-600">Offene Rechnungen</p>
          </div>

          {/* Gesamt Rechnungen */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">{stats.gesamtRechnungen}</p>
            <p className="text-sm text-slate-600">Gesamt Rechnungen</p>
          </div>

          {/* Ausstehend */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Euro className="text-purple-600" size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">€{stats.ausstehendBetrag.toFixed(2)}</p>
            <p className="text-sm text-slate-600">Ausstehend</p>
          </div>

          {/* Erstattet */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-teal-600" size={24} />
              </div>
              <span className="text-xs font-semibold text-teal-600 bg-teal-100 px-2 py-1 rounded-full">
                ✓
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mb-1">€{stats.erstattetBetrag.toFixed(2)}</p>
            <p className="text-sm text-slate-600">Erstattet</p>
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-900">Aktuelle Rechnungen</h3>
            <Link 
              href="/rechnungen" 
              className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
            >
              Alle anzeigen →
            </Link>
          </div>

          {recentInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-600 mb-4">Noch keine Rechnungen hochgeladen</p>
              <Link 
                href="/upload"
                className="inline-block px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
              >
                Erste Rechnung hochladen
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div 
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:border-teal-300 hover:bg-slate-50 transition cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                      <FileText className="text-slate-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{invoice.leistungserbringer}</p>
                      <p className="text-sm text-slate-600">{invoice.art} • {invoice.datum}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-lg text-slate-900">€{Number(invoice.betrag).toFixed(2)}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      invoice.status === 'erstattet' 
                        ? 'bg-teal-100 text-teal-700'
                        : invoice.status === 'eingereicht'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {invoice.status === 'erstattet' ? 'Erstattet' : 
                       invoice.status === 'eingereicht' ? 'Eingereicht' : 'In Bearbeitung'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link 
            href="/upload"
            className="bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl shadow-lg p-8 text-white hover:shadow-xl transition group"
          >
            <Upload className="mb-4 group-hover:scale-110 transition" size={32} />
            <h3 className="text-xl font-bold mb-2">Neue Rechnung hochladen</h3>
            <p className="text-teal-50">📸 Foto machen - KI liest automatisch aus</p>
          </Link>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 hover:shadow-md transition">
            <TrendingUp className="mb-4 text-teal-600" size={32} />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Statistiken</h3>
            <p className="text-slate-600">
              {rechnungen.length > 0 ? (
                <>Durchschnittliche Bearbeitungszeit: <strong>5 Tage</strong></>
              ) : (
                <>Statistiken werden angezeigt sobald Rechnungen vorhanden sind</>
              )}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}