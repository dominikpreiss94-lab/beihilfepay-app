'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Download, Eye, ArrowLeft } from 'lucide-react';

type Rechnung = {
  id: string;
  leistungserbringer: string;
  betrag: number;
  datum: string;
  status: string;
  art: string;
  beihilfe_status: string;
  pkv_status: string;
};

export default function RechnungenPage() {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Rechnungen...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      erstattet: 'bg-teal-100 text-teal-700',
      eingereicht: 'bg-blue-100 text-blue-700',
      in_bearbeitung: 'bg-orange-100 text-orange-700',
      in_prüfung: 'bg-purple-100 text-purple-700',
      noch_nicht_eingereicht: 'bg-slate-100 text-slate-700'
    };

    const labels = {
      erstattet: 'Erstattet',
      eingereicht: 'Eingereicht',
      in_bearbeitung: 'In Bearbeitung',
      in_prüfung: 'In Prüfung',
      noch_nicht_eingereicht: 'Ausstehend'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

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
              <Link href="/" className="text-slate-600 hover:text-teal-600 transition">Dashboard</Link>
              <Link href="/upload" className="text-slate-600 hover:text-teal-600 transition">Upload</Link>
              <Link href="/rechnungen" className="text-teal-600 font-semibold">Rechnungen</Link>
              <Link href="/einstellungen" className="text-slate-600 hover:text-teal-600 transition">Einstellungen</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition mb-6">
          <ArrowLeft size={20} />
          Zurück zum Dashboard
        </Link>

        <div className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Meine Rechnungen</h2>
            <p className="text-slate-600">{rechnungen.length} Rechnungen insgesamt</p>
          </div>

          <Link 
            href="/upload"
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
          >
            + Neue Rechnung
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          <button className="px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold whitespace-nowrap">
            Alle ({rechnungen.length})
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 rounded-lg font-semibold hover:bg-slate-50 whitespace-nowrap border border-slate-200">
            In Bearbeitung ({rechnungen.filter(r => r.status === 'in_bearbeitung').length})
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 rounded-lg font-semibold hover:bg-slate-50 whitespace-nowrap border border-slate-200">
            Eingereicht ({rechnungen.filter(r => r.status === 'eingereicht').length})
          </button>
          <button className="px-4 py-2 bg-white text-slate-600 rounded-lg font-semibold hover:bg-slate-50 whitespace-nowrap border border-slate-200">
            Erstattet ({rechnungen.filter(r => r.status === 'erstattet').length})
          </button>
        </div>

        {/* Rechnungen Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Leistungserbringer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Art
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Datum
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Betrag
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Beihilfe
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    PKV
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rechnungen.map((rechnung) => (
                  <tr key={rechnung.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="text-slate-600" size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{rechnung.leistungserbringer}</p>
                          <p className="text-sm text-slate-500">ID: {rechnung.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {rechnung.art}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {new Date(rechnung.datum).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">
                        €{rechnung.betrag.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(rechnung.beihilfe_status)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(rechnung.pkv_status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition">
                          <Download size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Gesamt eingereicht</p>
            <p className="text-2xl font-bold text-slate-900">
              €{rechnungen.reduce((sum, r) => sum + r.betrag, 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Bereits erstattet</p>
            <p className="text-2xl font-bold text-teal-600">
              €{rechnungen.filter(r => r.status === 'erstattet').reduce((sum, r) => sum + r.betrag, 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <p className="text-sm text-slate-600 mb-2">Noch ausstehend</p>
            <p className="text-2xl font-bold text-orange-600">
              €{rechnungen.filter(r => r.status !== 'erstattet').reduce((sum, r) => sum + r.betrag, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}