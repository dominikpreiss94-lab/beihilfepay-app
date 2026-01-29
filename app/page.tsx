'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Upload, X, Check, ArrowLeft, Sparkles } from 'lucide-react';
import Tesseract from 'tesseract.js';

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const [formData, setFormData] = useState({
    leistungserbringer: '',
    betrag: '',
    datum: '',
    art: 'arztbesuch',
    weiterleitungBeihilfe: true,
    weiterleitungPKV: true
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      processOCR(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      processOCR(selectedFile);
    }
  };

  const processOCR = async (file: File) => {
    setOcrProcessing(true);
    setOcrProgress(0);

    try {
      const result = await Tesseract.recognize(
        file,
        'deu', // Deutsche Sprache
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const text = result.data.text;
      console.log('OCR Text:', text);

      // Intelligente Extraktion
      extractDataFromText(text);

    } catch (error) {
      console.error('OCR Error:', error);
      alert('OCR fehlgeschlagen. Bitte fülle die Felder manuell aus.');
    } finally {
      setOcrProcessing(false);
      setOcrProgress(0);
    }
  };

  const extractDataFromText = (text: string) => {
    // Betrag finden (z.B. "125,50 €" oder "€ 125.50")
    const betragRegex = /(\d+[.,]\d{2})\s*€|€\s*(\d+[.,]\d{2})/g;
    const betragMatch = text.match(betragRegex);
    if (betragMatch && betragMatch.length > 0) {
      // Letzter Betrag ist meist Gesamtsumme
      const betragStr = betragMatch[betragMatch.length - 1]
        .replace('€', '')
        .replace(',', '.')
        .trim();
      setFormData(prev => ({ ...prev, betrag: betragStr }));
    }

    // Datum finden (DD.MM.YYYY oder DD/MM/YYYY)
    const datumRegex = /(\d{1,2})[.\/](\d{1,2})[.\/](\d{4})/;
    const datumMatch = text.match(datumRegex);
    if (datumMatch) {
      const [_, day, month, year] = datumMatch;
      const datum = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, datum }));
    }

    // Leistungserbringer finden (nach "Dr." oder "Praxis")
    const drRegex = /(Dr\.\s*med\.\s*[A-ZÄÖÜ][a-zäöüß]+\s+[A-ZÄÖÜ][a-zäöüß]+)/;
    const praxisRegex = /(Praxis\s+[A-ZÄÖÜ][a-zäöüß]+)/;
    const apothekenRegex = /(Apotheke\s+[A-ZÄÖÜ][a-zäöüß\s]+)/;
    
    const drMatch = text.match(drRegex);
    const praxisMatch = text.match(praxisRegex);
    const apothekenMatch = text.match(apothekenRegex);
    
    if (drMatch) {
      setFormData(prev => ({ ...prev, leistungserbringer: drMatch[1].trim() }));
    } else if (praxisMatch) {
      setFormData(prev => ({ ...prev, leistungserbringer: praxisMatch[1].trim() }));
    } else if (apothekenMatch) {
      setFormData(prev => ({ ...prev, leistungserbringer: apothekenMatch[1].trim() }));
      setFormData(prev => ({ ...prev, art: 'medikamente' }));
    }

    // Art der Behandlung erraten
    if (text.toLowerCase().includes('zahn')) {
      setFormData(prev => ({ ...prev, art: 'zahnarzt' }));
    } else if (text.toLowerCase().includes('physiotherapie') || text.toLowerCase().includes('krankengymnastik')) {
      setFormData(prev => ({ ...prev, art: 'physiotherapie' }));
    } else if (text.toLowerCase().includes('apotheke') || text.toLowerCase().includes('medikament')) {
      setFormData(prev => ({ ...prev, art: 'medikamente' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('data', JSON.stringify({
        leistungserbringer: formData.leistungserbringer,
        betrag: parseFloat(formData.betrag),
        datum: formData.datum,
        art: formData.art,
        status: 'in_bearbeitung',
        beihilfe_status: formData.weiterleitungBeihilfe ? 'eingereicht' : 'noch_nicht_eingereicht',
        pkv_status: formData.weiterleitungPKV ? 'eingereicht' : 'noch_nicht_eingereicht',
      }));

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) throw new Error('Upload failed');

      setUploading(false);
      setUploadSuccess(true);

      // Reset nach 3 Sekunden
      setTimeout(() => {
        setUploadSuccess(false);
        setFile(null);
        setFormData({
          leistungserbringer: '',
          betrag: '',
          datum: '',
          art: 'arztbesuch',
          weiterleitungBeihilfe: true,
          weiterleitungPKV: true
        });
      }, 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      alert('Upload fehlgeschlagen. Bitte versuche es erneut.');
    }
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
              <Link href="/upload" className="text-teal-600 font-semibold">Upload</Link>
              <Link href="/rechnungen" className="text-slate-600 hover:text-teal-600 transition">Rechnungen</Link>
              <Link href="/einstellungen" className="text-slate-600 hover:text-teal-600 transition">Einstellungen</Link>
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
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Neue Rechnung hochladen</h2>
          <p className="text-slate-600">📸 Mach ein Foto - wir lesen die Daten automatisch aus!</p>
        </div>

        {/* OCR Status Banner */}
        {ocrProcessing && (
          <div className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="animate-pulse" size={24} />
              <h3 className="text-lg font-bold">KI analysiert deine Rechnung...</h3>
            </div>
            <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-white h-full transition-all duration-300 rounded-full"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
            <p className="text-sm mt-2 text-white/90">{ocrProgress}% - Gleich fertig!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drag & Drop Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Rechnung / Beleg
            </label>
            
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition ${
                dragActive 
                  ? 'border-teal-500 bg-teal-50' 
                  : file 
                  ? 'border-teal-300 bg-teal-50'
                  : 'border-slate-300 bg-slate-50 hover:border-teal-400'
              }`}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
              
              {!file ? (
                <>
                  <Upload className="mx-auto mb-4 text-slate-400" size={48} />
                  <p className="text-slate-700 font-semibold mb-2">
                    📸 Foto machen oder Datei auswählen
                  </p>
                  <p className="text-sm text-slate-500 mb-4">
                    PDF, JPG oder PNG - KI liest automatisch aus!
                  </p>
                  <label 
                    htmlFor="file-upload"
                    className="inline-block px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 cursor-pointer transition"
                  >
                    Datei auswählen
                  </label>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="text-teal-600" size={32} />
                    <div className="text-left">
                      <p className="font-semibold text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-600">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-slate-400 hover:text-red-600 transition"
                  >
                    <X size={24} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Rechnungsinformationen */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900">Rechnungsinformationen</h3>
              {formData.betrag && (
                <span className="text-xs font-semibold text-teal-600 bg-teal-100 px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles size={12} />
                  KI ausgefüllt
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Leistungserbringer
              </label>
              <input
                type="text"
                value={formData.leistungserbringer}
                onChange={(e) => setFormData({...formData, leistungserbringer: e.target.value})}
                placeholder="z.B. Dr. med. Schmidt"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Betrag (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.betrag}
                  onChange={(e) => setFormData({...formData, betrag: e.target.value})}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Datum
                </label>
                <input
                  type="date"
                  value={formData.datum}
                  onChange={(e) => setFormData({...formData, datum: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Art der Behandlung
              </label>
              <select
                value={formData.art}
                onChange={(e) => setFormData({...formData, art: e.target.value})}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="arztbesuch">Arztbesuch</option>
                <option value="zahnarzt">Zahnarzt</option>
                <option value="medikamente">Medikamente</option>
                <option value="krankenhaus">Krankenhaus</option>
                <option value="physiotherapie">Physiotherapie</option>
                <option value="sonstiges">Sonstiges</option>
              </select>
            </div>
          </div>

          {/* Weiterleitung */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Automatische Weiterleitung</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.weiterleitungBeihilfe}
                  onChange={(e) => setFormData({...formData, weiterleitungBeihilfe: e.target.checked})}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
                <span className="text-slate-900">
                  An Beihilfestelle NRW weiterleiten
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.weiterleitungPKV}
                  onChange={(e) => setFormData({...formData, weiterleitungPKV: e.target.checked})}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
                <span className="text-slate-900">
                  An private Krankenversicherung weiterleiten
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!file || uploading || uploadSuccess || ocrProcessing}
              className={`flex-1 py-3 px-6 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 ${
                uploadSuccess
                  ? 'bg-teal-600'
                  : uploading || ocrProcessing
                  ? 'bg-slate-400 cursor-not-allowed'
                  : !file
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-600 to-blue-600 hover:shadow-lg'
              }`}
            >
              {uploadSuccess ? (
                <>
                  <Check size={20} />
                  Erfolgreich hochgeladen!
                </>
              ) : uploading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Wird hochgeladen...
                </>
              ) : ocrProcessing ? (
                <>
                  <Sparkles className="animate-pulse" size={20} />
                  KI analysiert...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Rechnung hochladen
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}