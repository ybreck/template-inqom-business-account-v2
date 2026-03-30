import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Search, ChevronDown, Building2, User, Plus } from 'lucide-react';
import { mockProAccountDetails, mockBeneficiaries, mockSuppliers } from './data';

import { ProAccountTransaction } from './types';

interface NewTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ProAccountTransaction | null;
}

const NewTransferModal: React.FC<NewTransferModalProps> = ({ isOpen, onClose, initialData }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState<string>('');
  const [beneficiaryId, setBeneficiaryId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [date, setDate] = useState<string>('');
  const [isInstant, setIsInstant] = useState<boolean>(false);
  const [label, setLabel] = useState<string>('');
  const [reference, setReference] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAmount(Math.abs(initialData.amount).toString());
        setLabel(initialData.description || '');
        setReference(initialData.reference || '');
        // For beneficiary, we would ideally match the ID, but for now we can just leave it empty or try to find a match
        setBeneficiaryId('');
        setSearchQuery(initialData.thirdPartyName || '');
        const today = new Date().toISOString().split('T')[0];
        setDate(today);
      } else {
        setAmount('2500');
        setBeneficiaryId('');
        setSearchQuery('');
        setDate('2027-06-25');
        setLabel('Frais de gestion Juin 2026');
        setReference('XXXXXXXX');
      }
      setStep(1);
    }
  }, [isOpen, initialData]);

  const accountDetails = mockProAccountDetails;
  
  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const currentBalance = accountDetails.balance;
  const parsedAmount = parseFloat(amount.replace(',', '.')) || 0;
  const balanceAfter = currentBalance - parsedAmount;

  // Combine and filter beneficiaries and suppliers
  const combinedRecipients = useMemo(() => {
    const suppliers = mockSuppliers.map(s => ({
      id: s.id,
      name: s.name,
      iban: s.iban,
      type: 'supplier' as const,
      hasIban: s.hasIban,
      category: s.category
    }));
    
    const beneficiaries = mockBeneficiaries.map(b => ({
      id: b.id,
      name: b.name,
      iban: b.iban,
      type: 'beneficiary' as const,
      hasIban: true,
      bankName: b.bankName
    }));

    const all = [...suppliers, ...beneficiaries];
    
    if (!searchQuery) return all;
    
    return all.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      r.iban.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const selectedBeneficiary = useMemo(() => {
    return combinedRecipients.find(b => b.id === beneficiaryId);
  }, [beneficiaryId, combinedRecipients]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleNext = () => {
    if (parsedAmount > 0 && beneficiaryId && date) {
      setStep(2);
    }
  };

  const handlePrevious = () => {
    setStep(1);
  };

  const handleFinalize = () => {
    // Implement finalize logic here
    console.log('Transfer finalized', { amount: parsedAmount, beneficiaryId, date, isInstant, label, reference });
    onClose();
    // Reset state
    setTimeout(() => setStep(1), 300);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => setStep(1), 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Nouveau virement</h2>
          <button 
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Montant */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Montant <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-4 pr-8 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="0,00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-slate-500">€</span>
                    </div>
                  </div>
                </div>

                {/* Bénéficiaire */}
                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Bénéficiaire ou Fournisseur <span className="text-red-500">*</span>
                  </label>
                  <div 
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-colors cursor-pointer flex items-center justify-between"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    {selectedBeneficiary ? (
                      <div className="flex items-center gap-2 truncate">
                        {selectedBeneficiary.type === 'supplier' ? (
                          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <User className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="truncate text-slate-900">{selectedBeneficiary.name}</span>
                        <span className="text-slate-500 text-sm truncate">({selectedBeneficiary.iban || 'Sans IBAN'})</span>
                      </div>
                    ) : (
                      <span className="text-slate-500">Rechercher un destinataire...</span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
                      <div className="p-2 border-b border-slate-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Nom, IBAN..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-md text-sm focus:ring-0"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {/* Group: Fournisseurs */}
                        {combinedRecipients.some(r => r.type === 'supplier') && (
                          <div className="py-1">
                            <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                              Fournisseurs (Achats)
                            </div>
                            {combinedRecipients.filter(r => r.type === 'supplier').map(supplier => (
                              <div
                                key={supplier.id}
                                onClick={() => {
                                  setBeneficiaryId(supplier.id);
                                  setIsDropdownOpen(false);
                                  setSearchQuery('');
                                }}
                                className={`px-3 py-2 cursor-pointer hover:bg-slate-50 flex items-center justify-between ${beneficiaryId === supplier.id ? 'bg-indigo-50' : ''}`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                                  <div className="truncate">
                                    <div className="text-sm font-medium text-slate-900 truncate">{supplier.name}</div>
                                    <div className="text-xs text-slate-500 truncate">
                                      {supplier.hasIban ? supplier.iban : 'Aucun IBAN renseigné'}
                                    </div>
                                  </div>
                                </div>
                                {!supplier.hasIban && (
                                  <span className="shrink-0 ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                    Ajouter IBAN
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Group: Bénéficiaires */}
                        {combinedRecipients.some(r => r.type === 'beneficiary') && (
                          <div className="py-1 border-t border-slate-100">
                            <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50">
                              Bénéficiaires enregistrés
                            </div>
                            {combinedRecipients.filter(r => r.type === 'beneficiary').map(beneficiary => (
                              <div
                                key={beneficiary.id}
                                onClick={() => {
                                  setBeneficiaryId(beneficiary.id);
                                  setIsDropdownOpen(false);
                                  setSearchQuery('');
                                }}
                                className={`px-3 py-2 cursor-pointer hover:bg-slate-50 flex items-center gap-2 ${beneficiaryId === beneficiary.id ? 'bg-indigo-50' : ''}`}
                              >
                                <User className="w-4 h-4 text-slate-400 shrink-0" />
                                <div className="truncate">
                                  <div className="text-sm font-medium text-slate-900 truncate">{beneficiary.name}</div>
                                  <div className="text-xs text-slate-500 truncate">{beneficiary.iban}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {combinedRecipients.length === 0 && (
                          <div className="p-4 text-center text-sm text-slate-500">
                            Aucun résultat trouvé
                          </div>
                        )}
                      </div>
                      
                      <div className="p-2 border-t border-slate-100 bg-slate-50">
                        <button className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors">
                          <Plus className="w-4 h-4" />
                          Nouveau bénéficiaire
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date de virement */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Date de virement <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Virement instantané */}
                <div className="flex items-center pt-6">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={isInstant}
                        onChange={(e) => setIsInstant(e.target.checked)}
                      />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${isInstant ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isInstant ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                    <div className="ml-3 text-sm font-medium text-slate-700">
                      Virement instantané
                    </div>
                  </label>
                </div>

                {/* Libellé du virement */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Libellé du virement
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Référence */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Référence
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Montant</p>
                    <p className="text-slate-700">{formatCurrency(parsedAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Bénéficiaire</p>
                    <p className="text-slate-700">{selectedBeneficiary?.name} - {selectedBeneficiary?.iban}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Date de virement</p>
                    <p className="text-slate-700">{new Date(date).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Virement instantané</p>
                    <p className="text-slate-700">{isInstant ? 'Oui' : 'Non'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Libellé du virement</p>
                    <p className="text-slate-700">{label || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Référence</p>
                    <p className="text-slate-700">{reference || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Balances */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            <div className="bg-slate-50 rounded-xl p-6 flex flex-col items-end justify-center border border-slate-100">
              <p className="text-sm font-medium text-slate-600 mb-2">Solde actuel</p>
              <p className="text-3xl font-bold text-indigo-700">{formatCurrency(currentBalance)}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-6 flex flex-col items-end justify-center border border-slate-100">
              <p className="text-sm font-medium text-slate-600 mb-2">Solde après virement</p>
              <p className="text-3xl font-bold text-indigo-700">{formatCurrency(balanceAfter)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-white">
          {step === 1 ? (
            <>
              <button 
                onClick={handleClose}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleNext}
                disabled={parsedAmount <= 0 || !beneficiaryId || !date}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Étape suivante
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={handlePrevious}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Étape précédente
              </button>
              <button 
                onClick={handleFinalize}
                className="px-5 py-2.5 text-sm font-medium text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Finaliser le virement
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewTransferModal;
