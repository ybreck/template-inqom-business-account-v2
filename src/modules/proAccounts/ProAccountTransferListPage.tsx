
import React, { useState, useMemo } from 'react';
import { ModuleComponentProps, ProAccountTransaction } from './types';
import { mockProAccountTransactions, mockProAccountDetails } from './data';
import { PlusCircleIcon, ArrowsRightLeftIcon } from '../../../src/constants/icons';
import { Clock, CheckCircle2, XCircle, Download, RefreshCw, X, AlertCircle } from 'lucide-react';
import TransactionDetailsPanel from './TransactionDetailsPanel';
import NewTransferModal from './NewTransferModal';

const formatCurrency = (amount: number, currency: string = 'EUR') => {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency });
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

type TabType = 'planned' | 'history' | 'rejected';

const ProAccountTransferListPage: React.FC<ModuleComponentProps> = ({ onSubNavigate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('planned');
  const [selectedTransaction, setSelectedTransaction] = useState<ProAccountTransaction | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferInitialData, setTransferInitialData] = useState<ProAccountTransaction | null>(null);

  // Filter for outgoing transfers
  const outgoingTransfers = useMemo(() => {
    return mockProAccountTransactions
      .filter(tx => tx.type === 'Virement sortant' || (tx.type === 'Paiement par carte' && tx.amount < 0))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const plannedTransfers = outgoingTransfers.filter(tx => tx.status === 'En attente');
  const historyTransfers = outgoingTransfers.filter(tx => tx.status === 'Effectué');
  const rejectedTransfers = outgoingTransfers.filter(tx => tx.status === 'Rejeté' || tx.status === 'Annulé');

  const handleNewTransfer = () => {
    setTransferInitialData(null);
    setIsTransferModalOpen(true);
  };

  const handleRetryTransfer = (tx: ProAccountTransaction) => {
    setTransferInitialData(tx);
    setIsTransferModalOpen(true);
  };

  const renderTabContent = () => {
    let transfersToShow: ProAccountTransaction[] = [];
    
    if (activeTab === 'planned') transfersToShow = plannedTransfers;
    if (activeTab === 'history') transfersToShow = historyTransfers;
    if (activeTab === 'rejected') transfersToShow = rejectedTransfers;

    if (transfersToShow.length === 0) {
      return (
        <div className="py-16 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeTab === 'planned' && <Clock className="w-8 h-8 text-slate-400" />}
            {activeTab === 'history' && <CheckCircle2 className="w-8 h-8 text-slate-400" />}
            {activeTab === 'rejected' && <XCircle className="w-8 h-8 text-slate-400" />}
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">Aucun virement</h3>
          <p className="text-sm text-slate-500">
            {activeTab === 'planned' && "Vous n'avez aucun virement en attente ou programmé."}
            {activeTab === 'history' && "L'historique de vos virements émis apparaîtra ici."}
            {activeTab === 'rejected' && "Aucun virement n'a été rejeté."}
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {activeTab === 'planned' ? 'Date prévue' : 'Date'}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Bénéficiaire / Motif
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Montant
              </th>
              {activeTab === 'rejected' && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Motif du rejet
                </th>
              )}
              <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {transfersToShow.map((tx) => (
              <tr 
                key={tx.id} 
                className="hover:bg-slate-50 transition-colors group cursor-pointer"
                onClick={() => setSelectedTransaction(tx)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                  {formatDate(tx.date)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="font-medium text-slate-900 truncate max-w-xs" title={tx.thirdPartyName || tx.description}>
                    {tx.thirdPartyName || tx.description}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
                    Réf: {tx.reference || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-slate-900">
                  {formatCurrency(Math.abs(tx.amount), mockProAccountDetails.currency)}
                </td>
                
                {activeTab === 'rejected' && (
                  <td className="px-6 py-4 text-sm text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="truncate max-w-[200px]" title={tx.rejectionReason || 'Motif inconnu'}>
                      {tx.rejectionReason || 'Motif inconnu'}
                    </span>
                  </td>
                )}

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    {activeTab === 'planned' && (
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Annuler le virement">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    {activeTab === 'history' && (
                      <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors" title="Télécharger le justificatif">
                        <Download className="w-3.5 h-3.5" />
                        Justificatif
                      </button>
                    )}
                    {activeTab === 'rejected' && (
                      <button 
                        onClick={() => {
                          handleRetryTransfer(tx);
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Réessayer
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex items-start">
      <div className="flex-1 min-w-0 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Gestion des virements</h2>
            <p className="text-sm text-slate-500 mt-1">Suivez, annulez ou téléchargez les justificatifs de vos virements émis.</p>
          </div>
          <button
            onClick={handleNewTransfer}
            className="flex items-center px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <ArrowsRightLeftIcon className="w-5 h-5 mr-2" />
            Nouveau virement
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex -mb-px px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('planned')}
                className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'planned'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                À venir / Planifiés
                {plannedTransfers.length > 0 && (
                  <span className={`ml-1.5 py-0.5 px-2 rounded-full text-xs ${activeTab === 'planned' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                    {plannedTransfers.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'history'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Historique
              </button>
              <button
                onClick={() => setActiveTab('rejected')}
                className={`whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'rejected'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <XCircle className="w-4 h-4" />
                Rejetés
                {rejectedTransfers.length > 0 && (
                  <span className={`ml-1.5 py-0.5 px-2 rounded-full text-xs ${activeTab === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                    {rejectedTransfers.length}
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Content */}
          {renderTabContent()}
        </div>
      </div>

      <TransactionDetailsPanel 
        transaction={selectedTransaction} 
        onClose={() => setSelectedTransaction(null)} 
        isTransfer={true}
        onRetry={handleRetryTransfer}
      />

      <NewTransferModal 
        isOpen={isTransferModalOpen} 
        onClose={() => setIsTransferModalOpen(false)} 
        initialData={transferInitialData}
      />
    </div>
  );
};

export default ProAccountTransferListPage;