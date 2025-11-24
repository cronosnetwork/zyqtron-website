import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { Shield, Lock, Printer } from 'lucide-react';

export default function RapportGenerator() {
  const [clientName, setClientName] = useState('Jean Dupont');
  const [dossierRef, setDossierRef] = useState('ZYQ-2024-001');
  const [contenu, setContenu] = useState('Collez ici l\'analyse générée par Gemini...');
  
  const printDocument = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#111] text-gray-200 font-sans">
      <Head>
        <title>Générateur Rapport ZYQTRON</title>
      </Head>

      {/* ZONE DE SAISIE (CACHÉE À L'IMPRESSION) */}
      <div className="print:hidden p-6 border-b border-gray-800 bg-[#0a0a0a]">
        <h2 className="text-xl font-bold text-emerald-500 mb-4">🛠 GÉNÉRATEUR DE RAPPORT</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input 
            type="text" 
            value={clientName} 
            onChange={(e) => setClientName(e.target.value)}
            className="bg-[#222] border border-gray-700 p-2 rounded text-white"
            placeholder="Nom Client"
          />
          <input 
            type="text" 
            value={dossierRef} 
            onChange={(e) => setDossierRef(e.target.value)}
            className="bg-[#222] border border-gray-700 p-2 rounded text-white"
            placeholder="Réf Dossier"
          />
          <button 
            onClick={printDocument}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center gap-2"
          >
            <Printer size={18} /> IMPRIMER EN PDF
          </button>
        </div>
        <textarea 
          value={contenu} 
          onChange={(e) => setContenu(e.target.value)}
          className="w-full h-32 bg-[#222] border border-gray-700 p-2 rounded text-white font-mono text-sm"
          placeholder="Collez l'analyse ici..."
        />
      </div>

      {/* ZONE DU RAPPORT (VISIBLE À L'IMPRESSION) */}
      <div className="max-w-[210mm] mx-auto bg-[#121212] min-h-[297mm] p-12 relative shadow-2xl print:shadow-none print:w-full">
        
        {/* HEADER */}
        <div className="flex justify-between items-end border-b-2 border-emerald-500 pb-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-white">ZYQTRON<span className="text-emerald-500">.</span></h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Moteur de Certitude & Analyse</p>
          </div>
          <div className="text-right">
            <div className="text-emerald-400 font-mono font-bold">{dossierRef}</div>
            <div className="text-gray-500 text-sm">{new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* CONTENU DU RAPPORT */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="text-emerald-500" size={24} />
            <h2 className="text-xl font-bold text-white uppercase">Rapport d'Analyse : {clientName}</h2>
          </div>
          
          <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap font-light leading-relaxed">
            {contenu}
          </div>
        </div>

        {/* FOOTER */}
        <div className="absolute bottom-12 left-12 right-12 border-t border-gray-800 pt-4 flex justify-between items-center text-xs text-gray-600 font-mono">
          <div className="flex items-center gap-2">
            <Lock size={12} />
            DOCUMENT CONFIDENTIEL
          </div>
          <div>
            GÉNÉRÉ PAR ZYQTRON ENGINE // SECURITY LEVEL 3
          </div>
        </div>
      </div>
    </div>
  );
}
