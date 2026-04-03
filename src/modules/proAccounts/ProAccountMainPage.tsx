
import React, { useState } from 'react';
import { ModuleComponentProps } from './types';
import ModuleTabs from '../../../components/ModuleTabs'; 
import PlaceholderPage from '../../../components/PlaceholderPage'; 
import ProAccountOverviewPage from './ProAccountOverviewPage';
import ProAccountTransferListPage from './ProAccountTransferListPage';
import ProAccountTransfersPage from './ProAccountTransfersPage'; 
import ProAccountBeneficiaryListPage from './ProAccountBeneficiaryListPage'; 
import ProAccountCardsPage from './ProAccountCardsPage'; // Import Cards Page
import ProAccountAddCardPage from './ProAccountAddCardPage'; // Import Add Card Page
import ProAccountCardTransactionsPage from './ProAccountCardTransactionsPage'; // Import Card Transactions Page
import { ProAccountOnboarding } from './ProAccountOnboarding';


import {
  proAccountOverviewConfig,
  proAccountAccountConfig,
  proAccountTransferListConfig,
  proAccountNewTransferFormConfig, 
  proAccountCardsConfig,
  proAccountAddCardConfig, // Import Add Card Config
  proAccountCardTransactionsConfig, // Import Card Transactions Config
  proAccountBeneficiaryListConfig,
  proAccountMembersConfig
} from './config';

import { QuestionMarkCircleIcon, CreditCardIcon, InformationCircleIcon, ClockIcon, FolderPlusIcon, EnvelopeIcon, DocumentTextIcon, UserGroupIcon, CheckCircleIcon } from '../../constants/icons'; 


import { mockNotifications, addNotification } from '../../data/notifications';

const ProAccountMainPage: React.FC<ModuleComponentProps> = ({ onSubNavigate, activeSubPageId, onMainNavigate }) => {
  const [isActivated, setIsActivated] = useState(() => {
    return localStorage.getItem('proAccountActivated') === 'true';
  });
  const [savedStepIndex, setSavedStepIndex] = useState(() => {
    const saved = localStorage.getItem('proAccountOnboardingStep');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isOnboarding, setIsOnboarding] = useState(() => {
    const saved = localStorage.getItem('proAccountOnboardingStep');
    return saved && parseInt(saved, 10) >= 6 ? true : false;
  });
  const [hasStartedOnboarding, setHasStartedOnboarding] = useState(() => {
    return localStorage.getItem('proAccountOnboardingStarted') === 'true';
  });
  const [kycState, setKycState] = useState(() => {
    return localStorage.getItem('proAccountKycState') || 'not_started';
  });

  React.useEffect(() => {
    localStorage.setItem('proAccountKycState', kycState);
    if (kycState === 'approved') {
      setIsActivated(true);
      localStorage.setItem('proAccountActivated', 'true');
    }
  }, [kycState]);

  if (isOnboarding) {
    return (
      <ProAccountOnboarding 
        initialStep={hasStartedOnboarding ? savedStepIndex : 0}
        onNavigate={onMainNavigate}
        onComplete={() => {
          setIsOnboarding(false);
          setKycState(localStorage.getItem('proAccountKycState') || 'not_started');
          localStorage.removeItem('proAccountOnboardingStarted');
          localStorage.removeItem('proAccountOnboardingStep');
          // Optional: mark notification as archived if we had a function for it
        }}
        onCancel={(stepIndex) => {
          setIsOnboarding(false);
          setHasStartedOnboarding(true);
          setSavedStepIndex(stepIndex);
          localStorage.setItem('proAccountOnboardingStarted', 'true');
          localStorage.setItem('proAccountOnboardingStep', stepIndex.toString());
          addNotification({
            id: 'notif-pro-account-resume',
            type: 'pro_account_onboarding',
            title: 'Finalisez l\'ouverture de votre Compte Pro',
            description: 'Vous avez commencé l\'activation de votre Compte Pro. Reprenez là où vous vous étiez arrêté pour finaliser l\'ouverture.',
            status: 'pending',
            timestamp: new Date().toISOString(),
            relatedData: {},
            urgent: true,
          });
        }}
      />
    );
  }

  if (kycState === 'pending_identity_start' || kycState === 'identity_verification' || kycState === 'pending' || kycState === 'failed' || kycState === 'kyc_refused' || kycState === 'docs_requested') {
    let content;
    if (kycState === 'pending_identity_start') {
      content = (
        <div className="relative flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200 m-6">
          <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
            <InformationCircleIcon className="w-12 h-12 text-amber-500" />
          </div>
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">Vérification d'identité en attente</h2>
          <p className="text-slate-600 mb-8 max-w-md text-lg">
            Vous n'avez pas encore procédé à la vérification de votre identité. Cette étape est obligatoire pour activer votre Compte Pro.
          </p>

          <div className="flex gap-4">
            <button 
              onClick={() => {
                setKycState('identity_verification');
              }} 
              className="px-8 py-3 bg-theme-primary-600 text-white font-medium rounded-lg hover:bg-theme-primary-700 transition-colors shadow-sm text-lg"
            >
              Démarrer la vérification d'identité
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('proAccountActivated');
                localStorage.removeItem('proAccountOnboardingStarted');
                localStorage.removeItem('proAccountOnboardingStep');
                localStorage.removeItem('proAccountKycState');
                localStorage.removeItem('proAccountUbos');
                window.location.reload();
              }}
              className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-lg"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      );
    } else if (kycState === 'identity_verification') {
      content = (
        <div className="relative flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200 m-6">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
              <InformationCircleIcon className="w-12 h-12 text-blue-500" />
            </div>
            <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">Vérification d'identité en cours</h2>
          <p className="text-slate-600 mb-12 max-w-lg text-lg">
            Veuillez suivre les instructions envoyées sur votre smartphone pour vérifier votre identité. Cette étape prend généralement quelques minutes.
          </p>

          <div className="pt-8 border-t border-slate-100 w-full max-w-md">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4">Actions de Démo</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setKycState('pending')}
                className="px-6 py-2.5 bg-emerald-100 text-emerald-700 font-medium rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-200"
              >
                Simuler succès
              </button>
              <button
                onClick={() => setKycState('failed')}
                className="px-6 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200"
              >
                Simuler échec
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('proAccountActivated');
                  localStorage.removeItem('proAccountOnboardingStarted');
                  localStorage.removeItem('proAccountOnboardingStep');
                  localStorage.removeItem('proAccountKycState');
                  localStorage.removeItem('proAccountUbos');
                  window.location.reload();
                }}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      );
    } else if (kycState === 'pending') {
      content = (
        <div className="relative flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200 m-6">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
              <ClockIcon className="w-12 h-12 text-blue-500" />
            </div>
            <div className="absolute top-0 right-0 w-6 h-6 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
          
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">Vérification en cours</h2>
          <p className="text-slate-600 mb-12 max-w-lg text-lg">
            Notre partenaire analyse vos informations et vos documents. Cette étape prend généralement quelques minutes. Vous serez notifié par e-mail dès que votre compte sera actif.
          </p>

          <div className="pt-8 border-t border-slate-100 w-full max-w-md">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-4">Actions de Démo</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setKycState('kyc_refused')}
                className="px-6 py-2.5 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200"
              >
                Refuser le KYC
              </button>
              <button
                onClick={() => setKycState('docs_requested')}
                className="px-6 py-2.5 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
              >
                Demande de documents supplémentaire
              </button>
              <button
                onClick={() => setKycState('approved')}
                className="px-6 py-2.5 bg-emerald-100 text-emerald-700 font-medium rounded-lg hover:bg-emerald-200 transition-colors border border-emerald-200"
              >
                Valider le KYC
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('proAccountActivated');
                  localStorage.removeItem('proAccountOnboardingStarted');
                  localStorage.removeItem('proAccountOnboardingStep');
                  localStorage.removeItem('proAccountKycState');
                  localStorage.removeItem('proAccountUbos');
                  window.location.reload();
                }}
                className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      );
    } else if (kycState === 'failed') {
      content = (
        <div className="relative flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200 m-6">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
            <InformationCircleIcon className="w-12 h-12 text-red-500" />
          </div>
          
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">Vérification refusée</h2>
          <p className="text-slate-600 mb-12 max-w-lg text-lg">
            La vérification de votre identité a échoué. La photo est peut-être floue ou le document n'est pas valide. Veuillez réessayer.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setKycState('identity_verification');
              }}
              className="px-8 py-3 bg-theme-primary-600 text-white font-medium rounded-lg hover:bg-theme-primary-700 transition-colors shadow-sm"
            >
              Recommencer la vérification d'identité
            </button>
            <button
              onClick={() => {
                localStorage.removeItem('proAccountActivated');
                localStorage.removeItem('proAccountOnboardingStarted');
                localStorage.removeItem('proAccountOnboardingStep');
                localStorage.removeItem('proAccountKycState');
                localStorage.removeItem('proAccountUbos');
                window.location.reload();
              }}
              className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      );
    } else if (kycState === 'kyc_refused') {
      content = (
        <div className="relative flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200 m-6">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-8">
            <InformationCircleIcon className="w-12 h-12 text-red-500" />
          </div>
          
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">KYC Refusé</h2>
          <p className="text-slate-600 mb-12 max-w-lg text-lg">
            Suite à l'analyse de votre dossier, nous ne sommes pas en mesure d'ouvrir votre Compte Pro.
          </p>

          <button
            onClick={() => {
              localStorage.removeItem('proAccountActivated');
              localStorage.removeItem('proAccountOnboardingStarted');
              localStorage.removeItem('proAccountOnboardingStep');
              localStorage.removeItem('proAccountKycState');
              localStorage.removeItem('proAccountUbos');
              window.location.reload();
            }}
            className="px-8 py-3 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            Réinitialiser
          </button>
        </div>
      );
    } else if (kycState === 'docs_requested') {
      content = (
        <div className="relative flex flex-col items-center justify-center h-full p-8 bg-white rounded-xl shadow-sm border border-slate-200 m-6 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto py-8">
            <h2 className="text-3xl font-semibold text-slate-900 mb-2 text-center">Documents complémentaires requis</h2>
            <p className="text-slate-500 mb-12 text-lg text-center">
              Notre partenaire a besoin de documents supplémentaires pour finaliser l'ouverture de votre compte.
            </p>

            <div className="space-y-6 mb-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium text-slate-900">Justificatif de domicile récent</h3>
                    <p className="text-sm text-slate-500">Facture d'électricité, gaz, eau ou téléphone fixe de moins de 3 mois.</p>
                  </div>
                  <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">Requis</span>
                </div>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 cursor-pointer transition-colors">
                  <FolderPlusIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-sm text-theme-primary-600 font-medium">Cliquez pour ajouter un fichier</span>
                  <span className="text-sm text-slate-500"> ou glissez-déposez</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setKycState('pending')} 
                className="px-8 py-3 bg-theme-primary-600 text-white font-medium rounded-lg hover:bg-theme-primary-700 transition-colors shadow-sm text-lg"
              >
                Soumettre les documents
              </button>
            </div>
          </div>
        </div>
      );
    }

    return content;
  }

  if (!isActivated) {
    const flow = [
      { id: 'email', title: 'Identification du titulaire', description: 'Les informations du titulaire de compte', icon: EnvelopeIcon },
      { id: 'org', title: 'Organisation', description: 'Détails de votre entreprise', icon: DocumentTextIcon },
      { id: 'ubo', title: 'Bénéficiaires', description: 'Déclaration des bénéficiaires effectifs (UBO)', icon: UserGroupIcon },
      { id: 'docs', title: 'Documents', description: 'Pièces justificatives', icon: FolderPlusIcon },
      { id: 'id', title: 'Utilisateur', description: 'Création de l\'utilisateur chez notre partenaire', icon: InformationCircleIcon },
      { id: 'success', title: 'Finalisation', description: 'Finalisation de la création de votre compte pro', icon: CheckCircleIcon }
    ];

    return (
      <div className="relative flex flex-col items-center justify-center h-full p-8 bg-white rounded-xl shadow-sm border border-slate-200 m-6 overflow-y-auto">
        {hasStartedOnboarding && (
          <button
            onClick={() => {
              localStorage.removeItem('proAccountActivated');
              localStorage.removeItem('proAccountOnboardingStarted');
              localStorage.removeItem('proAccountOnboardingStep');
              localStorage.removeItem('proAccountKycState');
              localStorage.removeItem('proAccountUbos');
              window.location.reload();
            }}
            className="absolute top-4 right-4 px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Réinitialiser
          </button>
        )}
        
        <div className="max-w-7xl mx-auto w-full">
          <h2 className={`text-3xl font-semibold text-slate-900 text-center mt-8 ${hasStartedOnboarding ? 'mb-16' : 'mb-2'}`}>
            {hasStartedOnboarding ? "Reprenez la création de votre compte pro" : "Créez votre compte pro en 6 étapes"}
          </h2>
          {!hasStartedOnboarding && (
            <p className="text-slate-500 mb-16 text-center">Ouvrez votre Compte Pro en quelques minutes. Complétez ces étapes pour activer votre compte et accéder à vos services.</p>
          )}

          <div className="flex justify-between items-start relative mb-16 px-8">
            <div className="absolute top-8 left-24 right-24 h-[1px] bg-slate-200 -z-10"></div>
            {flow.map((s, idx) => {
              const isCurrent = hasStartedOnboarding && idx === savedStepIndex;
              const isPast = hasStartedOnboarding && idx < savedStepIndex;
              
              return (
                <div key={s.id} className="flex flex-col items-center flex-1 bg-white">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 border ${
                    isCurrent ? 'border-theme-primary-600 bg-theme-primary-50 shadow-sm ring-2 ring-theme-primary-100' : 
                    isPast ? 'border-theme-primary-200 bg-white' : 
                    !hasStartedOnboarding && idx === 0 ? 'border-theme-primary-200 bg-white shadow-sm' :
                    'border-slate-200 bg-white'
                  }`}>
                    {s.icon && <s.icon className={`w-8 h-8 ${
                      isCurrent || isPast || (!hasStartedOnboarding && idx === 0) ? 'text-theme-primary-600' : 'text-slate-400'
                    }`} />}
                  </div>
                  <p className={`text-sm font-medium text-center px-2 ${
                    isCurrent ? 'text-theme-primary-700 font-bold' : 
                    isPast || (!hasStartedOnboarding && idx === 0) ? 'text-slate-900' : 'text-slate-500'
                  }`}>
                    {idx + 1}. {s.title}
                  </p>
                  {s.description && (
                    <p className={`text-xs text-center px-2 mt-1 ${isCurrent ? 'text-theme-primary-600 font-medium' : 'text-slate-500'}`}>
                      {s.description}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setIsOnboarding(true)}
              className="px-8 py-3 bg-theme-primary-600 text-white font-medium rounded-lg hover:bg-theme-primary-700 transition-colors text-lg shadow-sm"
            >
              {hasStartedOnboarding ? "Reprendre" : "Commencer"}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const baseTabConfigs = [
    proAccountOverviewConfig,
    proAccountAccountConfig,
    proAccountCardsConfig, // Parent of Add Card and Card Transactions
    proAccountTransferListConfig,
    proAccountBeneficiaryListConfig,
    proAccountMembersConfig,
  ];

  const baseTabsMapped = baseTabConfigs.map(config => ({
    id: config.id || 'undefined-id', // Ensure id is always defined
    name: config.title,
    icon: React.createElement(config.icon as React.FC<React.SVGProps<SVGSVGElement>>, { className: "w-5 h-5" })
  }));

  let finalTabsToDisplay = [...baseTabsMapped];
  let tabIdToHighlightInModuleTabs = activeSubPageId;

  // Dynamically add "Ajouter une Carte" tab
  if (activeSubPageId === proAccountAddCardConfig.id) {
    const addCardDynamicTab = {
        id: proAccountAddCardConfig.id,
        name: `↳ ${proAccountAddCardConfig.title}`,
        icon: React.createElement(proAccountAddCardConfig.icon as React.FC<React.SVGProps<SVGSVGElement>>, {className: "w-5 h-5"})
    };
    const parentCardsTabIndex = finalTabsToDisplay.findIndex(tab => tab.id === proAccountCardsConfig.id);
    if (parentCardsTabIndex !== -1) {
        finalTabsToDisplay.splice(parentCardsTabIndex + 1, 0, addCardDynamicTab);
    } else {
        finalTabsToDisplay.push(addCardDynamicTab);
    }
    tabIdToHighlightInModuleTabs = proAccountAddCardConfig.id;
  }
  // Dynamically add "Transactions Carte X" tab
  else if (activeSubPageId && activeSubPageId.startsWith(proAccountCardTransactionsConfig.id)) {
     const cardId = activeSubPageId.split('?cardId=')[1] || '...';
     const cardTransactionsDynamicTab = {
        id: activeSubPageId, // Keep the full ID with param for selection
        name: `↳ Transactions Carte ...${cardId.slice(-4)}`, // Example dynamic title
        icon: React.createElement(proAccountCardTransactionsConfig.icon as React.FC<React.SVGProps<SVGSVGElement>>, {className: "w-5 h-5"})
     };
     const parentCardsTabIndex = finalTabsToDisplay.findIndex(tab => tab.id === proAccountCardsConfig.id);
     if (parentCardsTabIndex !== -1) {
        finalTabsToDisplay.splice(parentCardsTabIndex + 1, 0, cardTransactionsDynamicTab);
     } else {
        finalTabsToDisplay.push(cardTransactionsDynamicTab);
     }
     tabIdToHighlightInModuleTabs = activeSubPageId; // Highlight the specific transaction tab
  }
  // Default highlight if activeSubPageId is not a main tab or handled form
  else if (!baseTabConfigs.some(config => config.id === activeSubPageId)) {
    // If activeSubPageId is something like "comptes_pro_carte_transactions?cardId=xxx" but not yet added dynamically (e.g. initial load)
    // then we want to highlight the parent "Cartes" tab.
    if (activeSubPageId && activeSubPageId.startsWith(proAccountCardTransactionsConfig.id)) {
        tabIdToHighlightInModuleTabs = proAccountCardsConfig.id;
    } else {
        tabIdToHighlightInModuleTabs = baseTabConfigs.length > 0 ? (baseTabConfigs[0].id || '') : '';
    }
  }


  const renderActiveTabContent = () => {
    const propsForSubPages: ModuleComponentProps = { onSubNavigate, onMainNavigate, activeSubPageId };
    
    // Handle card transactions page specifically due to param
    if (activeSubPageId && activeSubPageId.startsWith(proAccountCardTransactionsConfig.id)) {
        return <ProAccountCardTransactionsPage {...propsForSubPages} />;
    }

    switch (activeSubPageId) {
      case proAccountOverviewConfig.id:
        return <ProAccountOverviewPage {...propsForSubPages} />;
      case proAccountAccountConfig.id:
        return <proAccountAccountConfig.component {...propsForSubPages} />;
      case proAccountTransferListConfig.id:
        return <ProAccountTransferListPage {...propsForSubPages} />;
      case proAccountCardsConfig.id:
        return <ProAccountCardsPage {...propsForSubPages} />;
      case proAccountAddCardConfig.id:
        return <ProAccountAddCardPage {...propsForSubPages} />;
      // CardTransactions handled above
      case proAccountBeneficiaryListConfig.id: 
        return <ProAccountBeneficiaryListPage {...propsForSubPages} />;
      default:
        const currentConfig = baseTabConfigs.find(conf => conf.id === activeSubPageId);
        if (currentConfig && currentConfig.component) {
           const ComponentToRender = currentConfig.component;
           return <ComponentToRender {...propsForSubPages} />;
        }
         if (currentConfig) {
          return (
            <PlaceholderPage 
                title={currentConfig.title} 
                icon={currentConfig.icon ? React.createElement(currentConfig.icon as React.FC<React.SVGProps<SVGSVGElement>>) : undefined} 
                description={currentConfig.description || "Contenu en cours de développement."}
            />
          );
        }
        return (
            <PlaceholderPage 
                title="Onglet non trouvé" 
                icon={<QuestionMarkCircleIcon />} 
                description="Le contenu de cet onglet n'est pas disponible ou l'identifiant est incorrect."
            />
        );
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <ModuleTabs
        tabs={finalTabsToDisplay}
        activeTabId={tabIdToHighlightInModuleTabs || (baseTabConfigs.length > 0 ? (baseTabConfigs[0].id || '') : '')}
        onTabClick={(tabId) => {
          if (onSubNavigate) {
            onSubNavigate(tabId);
          }
        }}
      />
      <div className="flex-1 pt-0 p-6">
        {renderActiveTabContent()}
      </div>
    </div>
  );
};

export default ProAccountMainPage;