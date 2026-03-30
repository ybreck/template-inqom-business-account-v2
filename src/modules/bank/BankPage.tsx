import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { mockBankAccounts, mockBankTransactions } from './data';
import BankKPICard from './components/BankKPICard';
import BankTransactionCard from './components/BankTransactionCard';
import { AdjustmentsVerticalIcon, ListBulletIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from './icons'; 
import { 
    ChevronDownIcon, 
    CalendarDaysIcon, 
    PlusIcon, 
    EnvelopeIcon, 
    CurrencyEuroIcon, 
    BuildingLibraryIcon,
    MagnifyingGlassIcon,
    FilterIcon,
    ArrowPathIcon
} from '../../constants/icons'; 
import { ModuleComponentProps, BankKPIData, BankGraphDataPoint, BankTransaction, BankTransactionStatus } from './types'; 
import BankManagementPage from './components/BankManagementPage';
import BankAccountDetailPage from './components/BankAccountDetailPage';
import { Calculator, Paperclip, Plus, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const formatCurrency = (value: number) => {
    return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 });
};


const BankPage: React.FC<ModuleComponentProps> = ({ onSubNavigate, activeSubPageId, themeColors }) => {
  const isDetailView = activeSubPageId?.startsWith('bank_detail?id=');
  const initialTab = isDetailView ? 'management' : 'transactions';
  const [activeTab, setActiveTab] = useState<'transactions' | 'management'>(initialTab);
  
  // State for transactions page
  const [showGraphs, setShowGraphs] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');
  const [transactionTab, setTransactionTab] = useState<'all' | 'to_justify' | 'justified'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [visibleFilters, setVisibleFilters] = useState<string[]>(['status']);
  const [filterValues, setFilterValues] = useState<{
    statuses: BankTransactionStatus[];
    startDate: string;
    endDate: string;
    minAmount: string;
    maxAmount: string;
  }>({
    statuses: [],
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
  });
  const [openFilterPopover, setOpenFilterPopover] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSubPageId?.startsWith('bank_detail?id=')) {
      setActiveTab('management');
    } else if (activeSubPageId?.startsWith('banque?accountId=')) {
      setActiveTab('transactions');
      const accountId = activeSubPageId.split('?accountId=')[1];
      if (accountId) {
        setSelectedAccountId(accountId);
      }
    }
  }, [activeSubPageId]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setOpenFilterPopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTabClick = (tab: 'transactions' | 'management') => {
    setActiveTab(tab);
    if (onSubNavigate) {
      onSubNavigate('banque');
    }
  };
  
  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccountId(e.target.value);
  };

  const isProAccountActivated = localStorage.getItem('proAccountActivated') === 'true';

  const filteredMockBankAccounts = useMemo(() => {
    return mockBankAccounts.filter(acc => isProAccountActivated || acc.id !== 'acc_inqom');
  }, [isProAccountActivated]);

  const filteredMockBankTransactions = useMemo(() => {
    return mockBankTransactions.filter(tx => isProAccountActivated || tx.accountId !== 'acc_inqom');
  }, [isProAccountActivated]);

  const uniqueStatuses = useMemo(() => Array.from(new Set(filteredMockBankTransactions.map(tx => tx.status))).filter((s): s is BankTransactionStatus => s !== null && s !== ''), [filteredMockBankTransactions]);

  const handleStatusFilterChange = (status: BankTransactionStatus) => {
    setFilterValues(prev => {
        const newStatuses = new Set(prev.statuses);
        if (newStatuses.has(status)) {
            newStatuses.delete(status);
        } else {
            newStatuses.add(status);
        }
        return { ...prev, statuses: Array.from(newStatuses) };
    });
  };

  const resetFilters = () => {
    // Keep selectedAccountId as is, reset only other filters
    setVisibleFilters(['status']);
    setFilterValues({
      statuses: [],
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
    });
    setSearchTerm('');
    setOpenFilterPopover(null);
  };
  
  const addFilter = (filterKey: string) => {
    setVisibleFilters(prev => {
        if (prev.includes(filterKey)) return prev;
        return [...prev, filterKey];
    });
    setOpenFilterPopover(null);
  };

  const allFilters: Record<string, string> = {
    date: "Date de transaction",
    amount: 'Montant',
  };

  const getFilterButtonText = useCallback((filterKey: string) => {
    const { statuses } = filterValues;
    switch (filterKey) {
      case 'status':
        if (statuses.length === 0) return 'Statut';
        if (statuses.length === 1) return `Statut: ${statuses[0]}`;
        return `Statuts: ${statuses.length} sélectionnés`;
      default:
        return 'Filtre';
    }
  }, [filterValues]);

  const isFilterActive = (filterKey: string): boolean => {
    const { statuses, startDate, endDate, minAmount, maxAmount } = filterValues;
    switch (filterKey) {
      case 'status': return statuses.length > 0;
      case 'date': return !!startDate || !!endDate;
      case 'amount': return !!minAmount || !!maxAmount;
      default: return false;
    }
  };

  const filteredTransactions = useMemo(() => {
    return filteredMockBankTransactions.filter(tx => {
      const { statuses, startDate, endDate, minAmount, maxAmount } = filterValues;
      const searchTermLower = searchTerm.toLowerCase();

      const matchesSearch = searchTermLower === '' ||
        tx.description.toLowerCase().includes(searchTermLower) ||
        tx.amount.toString().includes(searchTermLower) ||
        (tx.analyticalCode && tx.analyticalCode.toLowerCase().includes(searchTermLower)) ||
        (tx.reference && tx.reference.toLowerCase().includes(searchTermLower));
        
      const matchesStatus = statuses.length === 0 || (tx.status && statuses.includes(tx.status));
      const matchesAccount = selectedAccountId === 'all' || tx.accountId === selectedAccountId;
      
      const txDate = new Date(tx.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      if(start) start.setHours(0,0,0,0);
      if(end) end.setHours(23,59,59,999);
      const matchesDate = (!start || txDate >= start) && (!end || txDate <= end);
      
      const min = parseFloat(minAmount);
      const max = parseFloat(maxAmount);
      const matchesMinAmount = !minAmount || isNaN(min) || tx.amount >= min;
      const matchesMaxAmount = !maxAmount || isNaN(max) || tx.amount <= max;

      const matchesTransactionTab = 
        transactionTab === 'all' ? true :
        transactionTab === 'to_justify' ? (tx.status === 'À justifier' || tx.status === null) :
        transactionTab === 'justified' ? tx.status === 'Justifié' : true;

      return matchesSearch && matchesStatus && matchesAccount && matchesDate && matchesMinAmount && matchesMaxAmount && matchesTransactionTab;
    });
  }, [searchTerm, filterValues, selectedAccountId, transactionTab]);

  const kpis = useMemo((): BankKPIData[] => {
    const income = filteredTransactions
        .filter(tx => tx.amount > 0)
        .reduce((sum, tx) => sum + tx.amount, 0);

    const outcome = filteredTransactions
        .filter(tx => tx.amount < 0)
        .reduce((sum, tx) => sum + tx.amount, 0);

    const accountsToConsider = selectedAccountId === 'all'
        ? mockBankAccounts
        : mockBankAccounts.filter(acc => acc.id === selectedAccountId);
    const balance = accountsToConsider.reduce((sum, acc) => sum + acc.balance, 0);

    const generateRandomGraphData = (baseValue: number): BankGraphDataPoint[] => {
        return Array.from({ length: 30 }, (_, i) => ({
            name: `Day ${i + 1}`,
            value: Math.floor(Math.random() * (baseValue / 10)) + (baseValue * 0.8),
        }));
    };

    return [
      {
        id: 'income',
        title: "Entrées d'argent (filtrées)",
        amount: income,
        icon: React.createElement(ArrowUpCircleIcon, { className: "w-6 h-6 text-green-500" }),
        graphData: generateRandomGraphData(income).map(d => ({ ...d, color: '#34D399' })),
      },
      {
        id: 'outcome',
        title: "Sorties d'argent (filtrées)",
        amount: Math.abs(outcome),
        icon: React.createElement(ArrowDownCircleIcon, { className: "w-6 h-6 text-red-500" }),
        graphData: generateRandomGraphData(Math.abs(outcome)).map(d => ({ ...d, color: '#F87171' })),
      },
      {
        id: 'balance',
        title: "Solde des comptes sélectionnés",
        amount: balance,
        icon: React.createElement(CurrencyEuroIcon, { className: "w-6 h-6 text-theme-primary-500" }), 
        graphData: generateRandomGraphData(balance), 
      },
    ];

  }, [filteredTransactions, selectedAccountId]);

  const groupedTransactions = useMemo(() => {
    return filteredTransactions.reduce((acc: Record<string, BankTransaction[]>, tx) => {
      const dateKey = tx.date; // YYYY-MM-DD
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(tx);
      return acc;
    }, {});
  }, [filteredTransactions]);

  const sortedGroupedDates = useMemo(() => Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()), [groupedTransactions]);

  const formatDateHeader = (dateString: string) => {
    const parts = dateString.split('-').map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]); // Y, M-1, D
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    
    if (date.getTime() === today.getTime()) {
      return "Aujourd'hui";
    }
    if (date.getTime() === yesterday.getTime()) {
      return "Hier";
    }
    
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    };

    if (date.getFullYear() !== today.getFullYear()) {
      options.year = 'numeric';
    }
    
    const formattedDate = date.toLocaleDateString('fr-FR', options);
    return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  };
  
  const renderFilterPopoverContent = (filterKey: string) => {
    switch (filterKey) {
      case 'status':
        return (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">Filtrer par statut(s)</label>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-2">
            {uniqueStatuses.map(status => (
                <label key={status} className="flex items-center p-1.5 rounded-md hover:bg-gray-100 cursor-pointer">
                    <input type="checkbox" checked={filterValues.statuses.includes(status)} onChange={() => handleStatusFilterChange(status)} className="h-4 w-4 text-theme-primary-600 border-gray-300 rounded focus:ring-theme-primary-500" />
                    <span className="ml-2 text-sm text-gray-700">{status}</span>
                </label>
            ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const totalBalance = useMemo(() => {
    return filteredMockBankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  }, [filteredMockBankAccounts]);

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-semibold text-theme-text">Banques</h1>
        <div className="border-b border-gray-200 mt-4">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button 
                  onClick={() => handleTabClick('transactions')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm ${
                    activeTab === 'transactions' 
                    ? 'border-theme-primary-500 text-theme-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-current={activeTab === 'transactions' ? 'page' : undefined}
                >
                    Transactions
                </button>
                <button 
                  onClick={() => handleTabClick('management')}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm ${
                    activeTab === 'management' 
                    ? 'border-theme-primary-500 text-theme-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  aria-current={activeTab === 'management' ? 'page' : undefined}
                >
                    Gestion des banques
                </button>
            </nav>
        </div>
      </div>
      
      {activeTab === 'transactions' && (
         <div className="space-y-4">
            {/* Top Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
                <div className="w-1/3">
                    <label htmlFor="account-select" className="sr-only">Sélectionner un compte</label>
                    <select
                        id="account-select"
                        name="account"
                        onChange={handleAccountChange}
                        value={selectedAccountId}
                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-theme-primary-500 focus:border-theme-primary-500 rounded-md shadow-sm"
                    >
                        <option value="all">Tous les comptes et cartes bancaires</option>
                        {filteredMockBankAccounts.map(account => (
                            <option key={account.id} value={account.id}>
                                {account.accountName} ({account.bankName})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700 mr-3">Graphiques</span>
                        <button
                            onClick={() => setShowGraphs(!showGraphs)}
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary-500 ${showGraphs ? 'bg-theme-primary-500' : 'bg-gray-200'}`}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out ${showGraphs ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
                        Règles d'affectation bancaire
                    </button>
                </div>
            </div>

            {/* Second Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-md">
                    <button 
                        onClick={() => setTransactionTab('all')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${transactionTab === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Toutes
                    </button>
                    <button 
                        onClick={() => setTransactionTab('to_justify')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${transactionTab === 'to_justify' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        À justifier
                    </button>
                    <button 
                        onClick={() => setTransactionTab('justified')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${transactionTab === 'justified' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Justifiées
                    </button>
                </div>
                <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                        <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-theme-primary-500 focus:border-theme-primary-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 border border-gray-300 rounded-md px-3 py-2 bg-white">
                        <span>jj/mm/aaaa</span>
                        <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">|</span>
                        <span>jj/mm/aaaa</span>
                        <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <button className="px-4 py-2 bg-[#5859E6] text-white rounded-md text-sm font-medium hover:bg-[#4f50cf] shadow-sm whitespace-nowrap">
                        Exporter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entrées/sorties</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Analytique</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTransactions.map((tx) => {
                            const account = filteredMockBankAccounts.find(a => a.id === tx.accountId);
                            const isPositive = tx.amount >= 0;
                            const amountColor = isPositive ? 'text-blue-600' : 'text-red-600';
                            const formattedAmount = isPositive 
                                ? `+ ${tx.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                                : `- ${Math.abs(tx.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                            
                            return (
                                <tr 
                                    key={tx.id} 
                                    className="hover:bg-gray-50 cursor-pointer group transition-colors"
                                    onClick={() => setSelectedTransaction(tx)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-semibold text-gray-900 group-hover:text-theme-primary-600 transition-colors">{tx.description}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{account?.accountName || 'Compte inconnu'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(tx.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${amountColor}`}>
                                        {formattedAmount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {tx.status === 'Justifié' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                Justifié
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                À justifier
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tx.analyticalCode ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                {tx.analyticalCode}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-gray-400 hover:text-theme-primary-600 hover:bg-theme-primary-50 rounded-md transition-colors" title="Calculatrice" onClick={(e) => e.stopPropagation()}>
                                                <Calculator className="w-4 h-4" />
                                            </button>
                                            <div className="relative">
                                                <button className="p-1.5 text-gray-400 hover:text-theme-primary-600 hover:bg-theme-primary-50 rounded-md transition-colors" title="Pièce jointe" onClick={(e) => e.stopPropagation()}>
                                                    <Paperclip className="w-4 h-4" />
                                                </button>
                                                {tx.status === 'Justifié' && (
                                                    <span className="absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-theme-primary-500 text-[8px] font-bold text-white border-2 border-white">
                                                        1
                                                    </span>
                                                )}
                                            </div>
                                            <button className="p-1.5 text-gray-400 hover:text-theme-primary-600 hover:bg-theme-primary-50 rounded-md transition-colors" title="Ajouter" onClick={(e) => e.stopPropagation()}>
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredTransactions.length === 0 && (
                    <div className="text-center py-12 bg-white">
                        <FileText className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune transaction</h3>
                        <p className="mt-1 text-sm text-gray-500">Aucune transaction ne correspond à vos critères de recherche.</p>
                    </div>
                )}
            </div>

            {/* Side Drawer for Transaction Details */}
            {selectedTransaction && (
                <div className="fixed inset-0 overflow-hidden z-50">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedTransaction(null)} />
                        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
                            <div className="w-screen max-w-md transform transition-transform ease-in-out duration-300">
                                <div className="h-full flex flex-col bg-white shadow-xl overflow-y-scroll">
                                    <div className="px-4 py-6 sm:px-6 bg-gray-50 border-b border-gray-200 flex justify-between items-center sticky top-0 z-10">
                                        <h2 className="text-lg font-medium text-gray-900">Justifier la transaction</h2>
                                        <button onClick={() => setSelectedTransaction(null)} className="text-gray-400 hover:text-gray-500 bg-white rounded-full p-1 shadow-sm border border-gray-200">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="p-6 space-y-8">
                                        {/* Transaction Summary */}
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <p className="text-sm text-gray-500 font-medium">{new Date(selectedTransaction.date).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            <p className="text-lg font-bold text-gray-900 mt-1">{selectedTransaction.description}</p>
                                            <p className={`text-3xl font-bold mt-3 ${selectedTransaction.amount >= 0 ? 'text-blue-600' : 'text-gray-900'}`}>
                                                {selectedTransaction.amount >= 0 ? '+' : ''}{selectedTransaction.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                                            </p>
                                        </div>
                                        
                                        {/* Accounting Assignment */}
                                        <div className="space-y-5">
                                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Affectation comptable</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Compte comptable</label>
                                                <select className="block w-full pl-3 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-theme-primary-500 focus:border-theme-primary-500 rounded-md shadow-sm bg-white">
                                                    <option>Sélectionner un compte...</option>
                                                    <option>401 - Fournisseurs</option>
                                                    <option>411 - Clients</option>
                                                    <option>606 - Achats non stockés</option>
                                                    <option>622 - Rémunérations d'intermédiaires</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Taux de TVA</label>
                                                <select className="block w-full pl-3 pr-10 py-2.5 text-sm border-gray-300 focus:outline-none focus:ring-theme-primary-500 focus:border-theme-primary-500 rounded-md shadow-sm bg-white">
                                                    <option>20% (Taux normal)</option>
                                                    <option>10% (Taux intermédiaire)</option>
                                                    <option>5.5% (Taux réduit)</option>
                                                    <option>0% (Exonéré)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Code analytique</label>
                                                <input type="text" className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-theme-primary-500 focus:border-theme-primary-500 sm:text-sm py-2.5 px-3" placeholder="Ex: PROJ-2023" defaultValue={selectedTransaction.analyticalCode || ''} />
                                            </div>
                                        </div>

                                        {/* Attachments */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Justificatif</h3>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                                                <div className="space-y-2 text-center">
                                                    <Paperclip className="mx-auto h-10 w-10 text-gray-400" />
                                                    <div className="flex text-sm text-gray-600 justify-center">
                                                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-theme-primary-600 hover:text-theme-primary-500 focus-within:outline-none">
                                                            <span>Télécharger un fichier</span>
                                                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                                        </label>
                                                        <p className="pl-1">ou glisser-déposer</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG, PDF jusqu'à 10MB</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 px-6 py-5 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50 mt-auto">
                                        <button onClick={() => setSelectedTransaction(null)} className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary-500 transition-colors">
                                            Annuler
                                        </button>
                                        <button onClick={() => setSelectedTransaction(null)} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-theme-primary-600 hover:bg-theme-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary-500 transition-colors">
                                            Enregistrer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
         </div>
      )}
      
      {activeTab === 'management' && (
        <>
            {isDetailView ? (
                <BankAccountDetailPage {...{ onSubNavigate, activeSubPageId, themeColors }} />
            ) : (
                <BankManagementPage {...{ onSubNavigate, activeSubPageId, themeColors }} />
            )}
        </>
      )}
    </div>
  );
};

export default BankPage;