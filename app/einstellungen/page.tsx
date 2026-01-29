import Link from 'next/link';
import { FileText, ArrowLeft, User, Shield, Bell, CreditCard } from 'lucide-react';

export default function EinstellungenPage() {
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
              <Link href="/rechnungen" className="text-slate-600 hover:text-teal-600 transition">Rechnungen</Link>
              <Link href="/einstellungen" className="text-teal-600 font-semibold">Einstellungen</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition mb-6">
          <ArrowLeft size={20} />
          Zurück zum Dashboard
        </Link>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Einstellungen</h2>
          <p className="text-slate-600">Verwalte deine persönlichen Daten und Einstellungen</p>
        </div>

        <div className="space-y-6">
          {/* Persönliche Informationen */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <User className="text-teal-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Persönliche Informationen</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Vorname
                </label>
                <input
                  type="text"
                  defaultValue="Max"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Nachname
                </label>
                <input
                  type="text"
                  defaultValue="Mustermann"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  E-Mail
                </label>
                <input
                  type="email"
                  defaultValue="max.mustermann@schule-nrw.de"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  defaultValue="+49 123 456789"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  defaultValue="Musterstraße 123, 12345 Musterstadt"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <button className="px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition">
                Änderungen speichern
              </button>
            </div>
          </div>

          {/* Versicherungsdaten */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="text-blue-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Versicherungsdaten</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Beihilfesatz (%)
                </label>
                <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                  <option value="50">50% (Standard)</option>
                  <option value="70">70% (mit 2+ Kindern)</option>
                  <option value="80">80% (Pensionär)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Beihilfenummer
                </label>
                <input
                  type="text"
                  defaultValue="BH-NRW-123456789"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Private Krankenversicherung
                </label>
                <input
                  type="text"
                  defaultValue="Debeka"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Versicherungsnummer (PKV)
                </label>
                <input
                  type="text"
                  defaultValue="PKV-987654321"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-6">
              <button className="px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition">
                Änderungen speichern
              </button>
            </div>
          </div>

          {/* Benachrichtigungen */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="text-purple-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Benachrichtigungen</h3>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-900">E-Mail Benachrichtigungen</p>
                  <p className="text-sm text-slate-600">Erhalte Updates zu deinen Rechnungen</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-900">Statusänderungen</p>
                  <p className="text-sm text-slate-600">Benachrichtigung bei Bearbeitungsfortschritt</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-900">Erstattungsbestätigung</p>
                  <p className="text-sm text-slate-600">Info wenn Geld überwiesen wurde</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-semibold text-slate-900">Erinnerungen</p>
                  <p className="text-sm text-slate-600">Erinnere mich an fällige Rechnungen</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
              </label>
            </div>
          </div>

          {/* Zahlungsmethoden */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="text-green-600" size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Zahlungsmethoden</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 border-2 border-teal-300 bg-teal-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-white rounded flex items-center justify-center font-bold text-xs">
                      BANK
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">Sparkasse</p>
                      <p className="text-sm text-slate-600">IBAN: DE89 ···· ···· 1234</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-teal-600 bg-teal-100 px-2 py-1 rounded-full">
                    Standard
                  </span>
                </div>
              </div>

              <button className="w-full py-3 px-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-teal-400 hover:text-teal-600 font-semibold transition">
                + Zahlungsmethode hinzufügen
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 p-6">
            <h3 className="text-xl font-bold text-red-600 mb-4">Gefahrenzone</h3>
            <p className="text-slate-600 mb-4">
              Sei vorsichtig! Diese Aktionen können nicht rückgängig gemacht werden.
            </p>
            <div className="space-y-3">
              <button className="px-6 py-2 bg-white border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition">
                Alle Daten exportieren
              </button>
              <button className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition">
                Account löschen
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}