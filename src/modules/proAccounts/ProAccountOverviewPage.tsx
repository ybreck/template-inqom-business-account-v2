
import React, { useState, useMemo } from 'react';
import { ProAccountDetails, ProAccountTransaction, ModuleComponentProps } from './types';
import { mockProAccountDetails, mockProAccountTransactions, mockPaymentCards } from './data';
import { CreditCardIcon, DocumentTextIcon } from '../../../src/constants/icons'; 
import { Search, ChevronLeft, ChevronRight, ChevronDown, ArrowUpDown, Download, Copy, Plus, Send, CreditCard, Clock, ArrowRight, RefreshCw } from 'lucide-react';
import TransactionDetailsPanel from './TransactionDetailsPanel';
import NewTransferModal from './NewTransferModal';

const formatCurrency = (amount: number, currency: string = 'EUR') => {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency });
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const ProAccountOverviewPage: React.FC<ModuleComponentProps> = ({ onSubNavigate }) => {
  const accountDetails: ProAccountDetails = mockProAccountDetails;
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const upcomingTransactions = useMemo(() => {
    return mockProAccountTransactions
      .filter(tx => new Date(tx.date) > new Date() || tx.status === 'En attente')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, []);

  const upcomingBalance = useMemo(() => {
    const upcomingSum = upcomingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    return accountDetails.balance + upcomingSum;
  }, [accountDetails.balance, upcomingTransactions]);

  const activeCards = useMemo(() => {
    return mockPaymentCards.filter(card => card.status === 'Active');
  }, []);

  return (
    <div className="flex items-start">
      <div className="flex-1 min-w-0 space-y-6">
        {/* Top Header Card (Cockpit) */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-theme-primary-50 rounded-2xl flex items-center justify-center shrink-0">
              <CreditCardIcon className="w-8 h-8 text-theme-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{accountDetails.accountName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-slate-500 font-mono">{accountDetails.iban}</p>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-3">
                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Relevés de compte
                </button>
                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <DocumentTextIcon className="w-4 h-4" />
                  Télécharger le RIB
                </button>
              </div>
            </div>
          </div>
          <div className="text-right flex flex-col items-end">
            <button 
              onClick={() => {
                localStorage.removeItem('proAccountActivated');
                localStorage.removeItem('proAccountOnboardingStarted');
                localStorage.removeItem('proAccountOnboardingStep');
                localStorage.removeItem('proAccountKycState');
                localStorage.removeItem('proAccountUbos');
                window.location.reload();
              }}
              className="mb-4 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors flex items-center gap-1.5 shadow-sm"
              title="Pour les besoins de démonstration"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Onboarding
            </button>
            <p className="text-sm font-medium text-slate-500 mb-1">Solde actuel</p>
            <p className="text-4xl font-bold text-theme-primary-700">
              {formatCurrency(accountDetails.balance, accountDetails.currency)}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1">
              Solde à venir : {formatCurrency(upcomingBalance, accountDetails.currency)}
            </p>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Primary Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setIsTransferModalOpen(true)}
                className="bg-theme-primary-600 text-white p-5 rounded-xl flex items-center gap-4 hover:bg-theme-primary-700 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg">Nouveau virement</div>
                  <div className="text-theme-primary-100 text-sm mt-0.5">SEPA, permanent, multiple</div>
                </div>
              </button>
              <button 
                onClick={() => onSubNavigate?.('comptes_pro_carte_ajouter')} 
                className="bg-white border border-slate-200 text-slate-800 p-5 rounded-xl flex items-center gap-4 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6 text-theme-primary-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-lg">Commander une carte</div>
                  <div className="text-slate-500 text-sm mt-0.5">Physique ou virtuelle</div>
                </div>
              </button>
            </div>

            {/* Active Cards */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Cartes de paiement</h3>
                <button 
                  onClick={() => onSubNavigate?.('comptes_pro_cartes')} 
                  className="text-sm font-medium text-theme-primary-600 hover:text-theme-primary-700 flex items-center gap-1"
                >
                  Voir toutes <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCards.slice(0, 2).map(card => (
                  <div key={card.id} className="border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors">
                    <div className="flex justify-between items-start mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                          <CreditCard className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{card.cardholderName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">•••• {card.last4Digits} • {card.type}</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-100">Active</span>
                    </div>
                    {/* Jauge */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 font-medium">Plafond sur 30j</span>
                        <span className="font-medium text-slate-900">{formatCurrency(card.currentMonthSpending)} / {formatCurrency(card.spendingLimitMonth)}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-theme-primary-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${Math.min(100, (card.currentMonthSpending / card.spendingLimitMonth) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-5 pt-5 border-t border-slate-100">
                      <button className="flex-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 py-2 rounded-lg transition-colors border border-slate-200">Geler</button>
                      <button className="flex-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 py-2 rounded-lg transition-colors border border-slate-200">Code PIN</button>
                      <button className="flex-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 py-2 rounded-lg transition-colors border border-slate-200">Plafonds</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* Transactions à venir */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col h-full shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-5">Transactions à venir</h3>
              <div className="flex-1 space-y-5">
                {upcomingTransactions.length > 0 ? upcomingTransactions.slice(0, 6).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-100 transition-colors">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate" title={tx.description}>{tx.description}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{formatDate(tx.date)}</div>
                      </div>
                    </div>
                    <div className={`text-sm font-medium whitespace-nowrap ml-3 ${tx.amount < 0 ? 'text-slate-900' : 'text-green-600'}`}>
                      {tx.amount < 0 ? '' : '+'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                )) : (
                  <div className="text-sm text-slate-500 text-center py-8">Aucune transaction à venir</div>
                )}
              </div>
              <button 
                onClick={() => onSubNavigate?.('banque?accountId=acc_inqom')}
                className="mt-6 w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-lg transition-colors border border-slate-200"
              >
                Consulter l'historique
              </button>
            </div>
          </div>

        </div>
      </div>

      <NewTransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
      />
    </div>
  );
};

export default ProAccountOverviewPage;