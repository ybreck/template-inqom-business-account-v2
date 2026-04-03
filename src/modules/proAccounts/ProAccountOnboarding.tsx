import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  EnvelopeIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  InformationCircleIcon,
  ArrowLeftIcon,
  FolderPlusIcon,
  ClockIcon
} from '../../constants/icons';
import { UboModal } from './UboModal';

interface ProAccountOnboardingProps {
  onComplete: () => void;
  onCancel: (stepIndex: number) => void;
  onNavigate?: (pageId: string) => void;
  initialStep?: number;
}

export const ProAccountOnboarding: React.FC<ProAccountOnboardingProps> = ({ onComplete, onCancel, onNavigate, initialStep = 0 }) => {
  const [stepIndex, setStepIndex] = useState(initialStep);
  const [orgType, setOrgType] = useState('Entreprise (SA, SARL, SAS, SCI...)');
  const [ubos, setUbos] = useState<any[]>(() => {
    const saved = localStorage.getItem('proAccountUbos');
    return saved ? JSON.parse(saved) : [];
  });
  const hasForeignUBO = ubos.some(ubo => ubo.birthCountry && ubo.birthCountry !== '🇫🇷 France');
  const [isUboModalOpen, setIsUboModalOpen] = useState(false);
  const [editingUboIndex, setEditingUboIndex] = useState<number | null>(null);
  const requiresDocs = orgType === 'Association ou fondation' || hasForeignUBO;

  const flow = [
    { id: 'email', title: 'Identification du titulaire', description: 'Les informations du titulaire de compte', icon: EnvelopeIcon },
    { id: 'org', title: 'Organisation', description: 'Détails de votre entreprise', icon: DocumentTextIcon },
    { id: 'ubo', title: 'Bénéficiaires', description: 'Déclaration des bénéficiaires effectifs (UBO)', icon: UserGroupIcon },
    { id: 'docs', title: 'Documents', description: 'Pièces justificatives', icon: FolderPlusIcon },
    { id: 'id', title: 'Utilisateur', description: 'Création de l\'utilisateur chez notre partenaire', icon: InformationCircleIcon },
    { id: 'success', title: 'Finalisation', description: 'Finalisation de la création de votre compte pro', icon: CheckCircleIcon }
  ];

  const currentStep = flow[stepIndex];
  const visualSteps = flow.filter(s => s.title);
  const currentVisualIndex = visualSteps.findIndex(s => s.id === currentStep.id);

  React.useEffect(() => {
    localStorage.setItem('proAccountOnboardingStep', stepIndex.toString());
    localStorage.setItem('proAccountOnboardingStarted', 'true');
  }, [stepIndex]);

  React.useEffect(() => {
    localStorage.setItem('proAccountUbos', JSON.stringify(ubos));
  }, [ubos]);

  const handleNext = () => {
    if (stepIndex < flow.length - 1) {
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      setStepIndex(stepIndex - 1);
    }
  };

  const renderProgressBar = () => {
    return (
      <div className="flex border-b border-slate-200 mb-8">
        {visualSteps.map((s, idx) => (
          <div 
            key={s.id} 
            className={`px-4 py-3 font-medium text-sm flex-1 text-center ${
              idx === currentVisualIndex 
                ? 'border-b-2 border-theme-primary-600 text-theme-primary-600' 
                : idx < currentVisualIndex 
                  ? 'text-theme-primary-600' 
                  : 'text-slate-400'
            }`}
          >
            {idx + 1}. {s.title}
          </div>
        ))}
      </div>
    );
  };



  const renderOrg = () => (
    <div className="max-w-5xl mx-auto mt-8 flex flex-col min-h-[600px]">
      {renderProgressBar()}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Informations de l'organisation</h2>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Type d'organisation
              </label>
              <select 
                value={orgType}
                onChange={(e) => setOrgType(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none bg-white"
              >
                <option value="Entreprise (SA, SARL, SAS, SCI...)">Entreprise (SA, SARL, SAS, SCI...)</option>
                <option value="Association ou fondation">Association ou fondation</option>
                <option value="Co-titularité">Co-titularité</option>
                <option value="Indépendant, entrepreneur individuel ou profession libérale">Indépendant, entrepreneur individuel ou profession libérale</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Votre organisation</label>
              <input 
                type="text" 
                defaultValue="Inqom"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Numéro d'immatriculation (SIREN)</label>
              <input 
                type="text" 
                defaultValue="999999999"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Numéro de TVA <span className="text-slate-400 italic font-normal">- Facultatif</span>
              </label>
              <input 
                type="text" 
                placeholder="FR..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Adresse de l'organisation</label>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <input 
                  type="text" 
                  placeholder="Numéro et nom de rue"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none"
                />
              </div>
              <div className="col-span-6 md:col-span-2">
                <input 
                  type="text" 
                  placeholder="Code postal"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none"
                />
              </div>
              <div className="col-span-6 md:col-span-4">
                <input 
                  type="text" 
                  placeholder="Ville"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Secteur d'activité professionnel</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none bg-white">
                <option value="">Sélectionnez un secteur...</option>
                <option value="tech">Technologies de l'information</option>
                <option value="commerce">Commerce de détail</option>
                <option value="services">Services aux entreprises</option>
                <option value="construction">Construction et immobilier</option>
                <option value="sante">Santé et action sociale</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Montant mensuel de transaction prévu</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none bg-white">
                <option value="">Sélectionnez une fourchette...</option>
                <option value="0-10k">Moins de 10 000 €</option>
                <option value="10k-50k">De 10 000 € à 50 000 €</option>
                <option value="50k-100k">De 50 000 € à 100 000 €</option>
                <option value="100k-500k">De 100 000 € à 500 000 €</option>
                <option value="500k+">Plus de 500 000 €</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description de l'activité</label>
            <textarea 
              rows={2}
              placeholder="Décrivez brièvement l'activité principale de votre organisation..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none resize-none"
            ></textarea>
          </div>
        </div>
      </div>

      <div className="flex justify-start gap-4 mt-auto pt-4">
        <button onClick={handlePrev} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Précédent
        </button>
        <button onClick={handleNext} className="px-6 py-2.5 bg-theme-primary-600 text-white font-medium rounded-lg hover:bg-theme-primary-700 transition-colors">
          Suivant
        </button>
      </div>
    </div>
  );

  const renderUbo = () => (
    <div className="max-w-5xl mx-auto mt-8 flex flex-col min-h-[600px]">
      {renderProgressBar()}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Déclarez les bénéficiaires effectifs</h2>
        <p className="text-slate-500 mb-6 text-sm">Ajoutez tous les bénéficiaires effectifs (UBO) de votre organisation. Ces informations sont requises par la loi.</p>

        <div className="grid grid-cols-2 gap-6 mb-4">
          {ubos.map((ubo, index) => (
            <div 
              key={index}
              onClick={() => {
                setEditingUboIndex(index);
                setIsUboModalOpen(true);
              }}
              className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-sm h-32 bg-white cursor-pointer hover:border-theme-primary-300 transition-colors relative group"
            >
              <div className="w-10 h-10 rounded-full bg-theme-primary-100 text-theme-primary-600 flex items-center justify-center font-medium text-sm shrink-0">
                {ubo.firstName?.[0]}{ubo.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{ubo.firstName} {ubo.lastName}</p>
                <p className="text-sm text-slate-500 truncate">{ubo.role}</p>
                {ubo.capitalPercentage ? (
                  <p className="text-sm text-slate-500 truncate">
                    {ubo.capitalPercentage}% du capital 
                    {(ubo.directOwnership || ubo.indirectOwnership) && (
                      <span className="text-slate-400 text-xs ml-1">
                        ({ubo.directOwnership && ubo.indirectOwnership ? 'Direct et Indirect' : ubo.directOwnership ? 'Direct' : 'Indirect'})
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 truncate">{ubo.birthCountry}, {ubo.city}</p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUbos(ubos.filter((_, i) => i !== index));
                }}
                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                title="Supprimer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}

          <div 
            onClick={() => {
              setEditingUboIndex(null);
              setIsUboModalOpen(true);
            }}
            className="border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer hover:bg-slate-100 transition-colors h-32 bg-white"
          >
            <div className="w-8 h-8 rounded-full border border-slate-400 flex items-center justify-center mb-2">
              <span className="text-slate-500 text-xl leading-none">+</span>
            </div>
            <span className="text-slate-600 text-sm font-medium">Ajouter un bénéficiaire</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Qu'est-ce qu'un Bénéficiaire Effectif (UBO) ?</p>
            <p className="mb-2">C'est toute personne physique qui détient plus de 25 % du capital ou des droits de vote de votre entreprise, ou qui exerce un contrôle sur ses organes de direction.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Si une société détient votre entreprise :</strong> Identifiez les personnes physiques qui possèdent cette société mère.</li>
              <li><strong>Si personne ne détient plus de 25 % :</strong> Le représentant légal de votre entreprise doit être déclaré comme bénéficiaire effectif.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex justify-start gap-4 mt-auto pt-4">
        <button onClick={handlePrev} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Précédent
        </button>
        <button onClick={handleNext} className="px-6 py-2.5 bg-theme-primary-600 text-white font-medium rounded-lg hover:bg-theme-primary-700 transition-colors">
          Suivant
        </button>
      </div>
    </div>
  );

  const renderDocs = () => {
    return (
      <div className="max-w-5xl mx-auto mt-8 flex flex-col min-h-[600px]">
        {renderProgressBar()}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Documents justificatifs</h2>
          
          {!requiresDocs ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm mb-8">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Aucun document requis</h3>
              <p className="text-slate-500">
                Sur la base des informations fournies, nous n'avons pas besoin de documents supplémentaires pour le moment.
              </p>
            </div>
          ) : (
            <>
              <p className="text-slate-500 mb-8 text-sm">
                En raison de la nature de votre organisation ({orgType}) ou de vos bénéficiaires, nous avons besoin de documents supplémentaires.
              </p>

              <div className="space-y-6 mb-8">
                {orgType === 'Association ou fondation' && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-slate-900">Statuts de l'association</h3>
                        <p className="text-sm text-slate-500">Copie des statuts datés et signés.</p>
                      </div>
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">Requis</span>
                    </div>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 cursor-pointer transition-colors">
                      <FolderPlusIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-sm text-theme-primary-600 font-medium">Cliquez pour ajouter un fichier</span>
                      <span className="text-sm text-slate-500"> ou glissez-déposez</span>
                    </div>
                  </div>
                )}

                {hasForeignUBO && (
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-slate-900">Pièce d'identité (Bénéficiaire étranger)</h3>
                        <p className="text-sm text-slate-500">Passeport ou carte d'identité en cours de validité.</p>
                      </div>
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">Requis</span>
                    </div>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 cursor-pointer transition-colors">
                      <FolderPlusIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-sm text-theme-primary-600 font-medium">Cliquez pour ajouter un fichier</span>
                      <span className="text-sm text-slate-500"> ou glissez-déposez</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-start gap-4 mt-auto pt-4">
          <button onClick={handlePrev} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Précédent
          </button>
          <button onClick={handleNext} className="px-6 py-2.5 bg-theme-primary-600 text-white font-medium rounded-lg hover:bg-theme-primary-700 transition-colors">
            Suivant
          </button>
        </div>
      </div>
    );
  };

  const renderEmail = () => (
    <div className="max-w-5xl mx-auto mt-8 flex flex-col min-h-[600px]">
      {renderProgressBar()}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">Identification du titulaire</h2>
        <p className="text-slate-500 mb-6 text-sm">Veuillez renseigner vos informations personnelles. Pour ouvrir ce compte, vous devez en être le titulaire, c'est-à-dire être le représentant légal de l'entreprise ou une personne formellement mandatée pour engager la société.</p>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-4">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Êtes-vous un représentant légal ?</label>
            <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="legalRep" className="w-4 h-4 text-theme-primary-600 focus:ring-theme-primary-500" defaultChecked />
                <span className="text-slate-700">Oui</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="legalRep" className="w-4 h-4 text-theme-primary-600 focus:ring-theme-primary-500" />
                <span className="text-slate-700">Non, mais j'ai une procuration</span>
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Adresse e-mail</label>
            <input 
              type="email" 
              defaultValue="emilien@inqom.com"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none"
            />
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">Adresse postale personnelle</label>
            <input 
              type="text" 
              placeholder="Numéro et nom de rue"
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 mb-3 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none"
            />
            <div className="grid grid-cols-2 gap-6">
              <input 
                type="text" 
                placeholder="Code postal"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none"
              />
              <input 
                type="text" 
                placeholder="Ville"
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-theme-primary-500 focus:border-theme-primary-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-start gap-4 mt-auto pt-4">
        <button onClick={handlePrev} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Précédent
        </button>
        <button onClick={handleNext} className="px-6 py-2.5 bg-theme-primary-600 text-white font-medium rounded-lg hover:bg-theme-primary-700 transition-colors">
          Suivant
        </button>
      </div>
    </div>
  );

  const renderId = () => (
    <div className="max-w-5xl mx-auto mt-8 flex flex-col min-h-[600px]">
      {renderProgressBar()}
      <div className="flex flex-col items-center justify-center text-center mt-4 bg-white p-10 rounded-2xl shadow-sm border border-slate-200 mb-4">
        <div className="w-16 h-16 bg-theme-primary-50 rounded-2xl flex items-center justify-center mb-6">
          <InformationCircleIcon className="w-8 h-8 text-theme-primary-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Création de l'utilisateur</h2>
        <p className="text-slate-600 max-w-md">
          Afin de pouvoir finaliser la création de votre compte, nous devons procéder à la création de votre profil utilisateur. Vous allez être redirigé vers notre partenaire Swan pour cette étape.
        </p>
      </div>

      <div className="flex justify-between items-center mt-auto pt-4">
        <button onClick={handlePrev} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Précédent
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => {
              localStorage.setItem('proAccountKycState', 'pending_identity_start');
              setStepIndex(flow.findIndex(s => s.id === 'success'));
            }} 
            className="px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Faire plus tard (Démo)
          </button>
          <button 
            onClick={() => {
              localStorage.setItem('proAccountKycState', 'identity_verification');
              setStepIndex(flow.findIndex(s => s.id === 'success'));
            }} 
            className="px-6 py-2.5 bg-theme-primary-600 text-white font-medium rounded-lg hover:bg-theme-primary-700 transition-colors"
          >
            Procéder à la création de l'utilisateur
          </button>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="max-w-5xl mx-auto mt-8 flex flex-col min-h-[600px]">
      {renderProgressBar()}
      <div className="flex flex-col items-center justify-center text-center mt-4 bg-white p-10 rounded-2xl shadow-sm border border-slate-200 mb-4">
        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-8">
          <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
        </div>
        
        <h2 className="text-3xl font-semibold text-slate-900 mb-4">Finalisation du compte</h2>
        <p className="text-slate-600 mb-8 max-w-lg text-lg">
          Vous y êtes presque ! Il reste à finaliser l'onboarding pour tout transmettre à notre partenaire Swan et valider la demande de création de compte pro. Vous serez notifié par e-mail dès que l'ouverture de votre compte sera finalisée.
        </p>

        <p className="text-sm text-slate-500">
          En cliquant sur "Finaliser", vous acceptez les <a href="#" className="text-theme-primary-600 hover:underline">Conditions générales</a>.
        </p>
      </div>

      <div className="flex justify-between items-center mt-auto pt-4">
        <button onClick={handlePrev} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
          Précédent
        </button>
        <button
          onClick={() => {
            onComplete();
          }}
          className="px-8 py-3 bg-theme-primary-600 text-white font-medium rounded-lg hover:bg-theme-primary-700 transition-colors shadow-sm"
        >
          Finaliser
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <button onClick={() => onCancel(stepIndex)} className="flex items-center text-slate-600 hover:text-slate-900 font-medium transition-colors">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Retour à Inqom
        </button>
        <div className="text-sm font-semibold text-slate-800">
          Ouverture de Compte Pro
        </div>
        <div className="w-24"></div> {/* Spacer for centering */}
      </div>
      
      <div className="flex-1 overflow-y-auto pb-24">
        {currentStep.id === 'email' && renderEmail()}
        {currentStep.id === 'org' && renderOrg()}
        {currentStep.id === 'ubo' && renderUbo()}
        {currentStep.id === 'docs' && renderDocs()}
        {currentStep.id === 'id' && renderId()}
        {currentStep.id === 'success' && renderSuccess()}
      </div>

      <UboModal 
        isOpen={isUboModalOpen} 
        onClose={() => {
          setIsUboModalOpen(false);
          setEditingUboIndex(null);
        }} 
        initialData={editingUboIndex !== null ? ubos[editingUboIndex] : undefined}
        onSave={(data) => {
          if (editingUboIndex !== null) {
            const newUbos = [...ubos];
            newUbos[editingUboIndex] = data;
            setUbos(newUbos);
          } else {
            setUbos([...ubos, data]);
          }
          setIsUboModalOpen(false);
          setEditingUboIndex(null);
        }} 
      />
    </div>
  );
};
