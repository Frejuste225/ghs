import React, { useState } from 'react';
import { Check, X, Eye, FileText, Users, Building2, Settings, Calendar, Clock, TrendingUp, AlertCircle, Download } from 'lucide-react';

// Composant pour la validation par les responsables (Administrateurs)
const ManagerDashboard = ({ user, demandes, onValidate, onReject }) => {
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const pendingDemandes = demandes.filter(d => 
    d.statut === 'Soumise au responsable' || d.statut === 'En attente de suivi'
  );

  const handleValidate = (demandeID) => {
    onValidate(demandeID);
  };

  const handleReject = (demandeID) => {
    setSelectedDemande(demandeID);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    onReject(selectedDemande, rejectReason);
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedDemande(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Demandes à valider ({pendingDemandes.length})
        </h2>
        <div className="flex space-x-2">
          <span className="text-sm text-gray-600">
            Délai de traitement : 7 jours maximum
          </span>
        </div>
      </div>

      {/* Alert pour demandes urgentes */}
      {pendingDemandes.some(d => {
        const daysDiff = Math.ceil((new Date() - new Date(d.dateJour)) / (1000 * 60 * 60 * 24));
        return daysDiff > 5;
      }) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <h3 className="ml-2 text-sm font-medium text-red-800">
              Attention : Demandes proches de l'échéance
            </h3>
          </div>
        </div>
      )}

      {/* Liste des demandes à valider */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Employé</th>
                  <th className="text-left py-3 px-4">Service</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Heures</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Motif</th>
                  <th className="text-left py-3 px-4">Échéance</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDemandes.map((demande) => {
                  const daysDiff = Math.ceil((new Date() - new Date(demande.dateJour)) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysDiff > 5;
                  
                  return (
                    <tr key={demande.demandeID} className={`border-b hover:bg-gray-50 ${isUrgent ? 'bg-red-50' : ''}`}>
                      <td className="py-3 px-4 font-medium">{demande.employe?.nomComplet}</td>
                      <td className="py-3 px-4">{demande.service?.nomService}</td>
                      <td className="py-3 px-4">{new Date(demande.dateJour).toLocaleDateString('fr-FR')}</td>
                      <td className="py-3 px-4">{demande.heureDebut} - {demande.heureFin}</td>
                      <td className="py-3 px-4 font-medium">{demande.totalHeures}h</td>
                      <td className="py-3 px-4">
                        <div className="max-w-xs truncate" title={demande.motif}>
                          {demande.motif}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isUrgent ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {7 - daysDiff} jours
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleValidate(demande.demandeID)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Valider</span>
                          </button>
                          <button
                            onClick={() => handleReject(demande.demandeID)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
                          >
                            <X className="w-3 h-3" />
                            <span>Rejeter</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de rejet */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Motif du rejet</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows="4"
              placeholder="Veuillez préciser le motif du rejet..."
              required
            />
            <div className="flex space-x-3 pt-4">
              <button
                onClick={confirmReject}
                disabled={!rejectReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirmer le rejet
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedDemande(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour la validation finale RH (Coordinateurs)
const HRDashboard = ({ user, demandes, onFinalValidate, onFinalReject }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDemande, setSelectedDemande] = useState(null);

  const finalValidationDemandes = demandes.filter(d => 
    d.statut === 'En attente de validation RH' || d.statut === 'Validée après suivi'
  );

  const handleFinalValidate = (demande) => {
    setSelectedDemande(demande);
    setShowPaymentModal(true);
  };

  const confirmFinalValidation = (tauxHoraire) => {
    const montant = (selectedDemande.totalHeures * tauxHoraire).toFixed(2);
    onFinalValidate(selectedDemande.demandeID, { montant, tauxHoraire });
    setShowPaymentModal(false);
    setSelectedDemande(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Validation finale RH ({finalValidationDemandes.length})
        </h2>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">{finalValidationDemandes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total heures</p>
              <p className="text-2xl font-bold text-gray-900">
                {finalValidationDemandes.reduce((sum, d) => sum + parseFloat(d.totalHeures), 0)}h
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Employés concernés</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(finalValidationDemandes.map(d => d.employeID)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des demandes pour validation finale */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Employé</th>
                  <th className="text-left py-3 px-4">Service</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Heures</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Motif</th>
                  <th className="text-left py-3 px-4">Validé par</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {finalValidationDemandes.map((demande) => (
                  <tr key={demande.demandeID} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{demande.employe?.nomComplet}</td>
                    <td className="py-3 px-4">{demande.service?.nomService}</td>
                    <td className="py-3 px-4">{new Date(demande.dateJour).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3 px-4">{demande.heureDebut} - {demande.heureFin}</td>
                    <td className="py-3 px-4 font-medium">{demande.totalHeures}h</td>
                    <td className="py-3 px-4">
                      <div className="max-w-xs truncate" title={demande.motif}>
                        {demande.motif}
                      </div>
                    </td>
                    <td className="py-3 px-4">{demande.responsable?.nomComplet}</td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleFinalValidate(demande)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center space-x-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Valider & Payer</span>
                        </button>
                        <button
                          onClick={() => onFinalReject(demande.demandeID)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
                        >
                          <X className="w-3 h-3" />
                          <span>Rejeter</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de validation avec calcul de paiement */}
      {showPaymentModal && selectedDemande && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Validation et calcul de paiement</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>Employé :</strong> {selectedDemande.employe?.nomComplet}</p>
                <p><strong>Date :</strong> {new Date(selectedDemande.dateJour).toLocaleDateString('fr-FR')}</p>
                <p><strong>Heures :</strong> {selectedDemande.totalHeures}h</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taux horaire (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue="25.00"
                  id="tauxHoraire"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-sm text-green-700">
                  <strong>Montant calculé :</strong> {selectedDemande.totalHeures} × 25,00 € = {(selectedDemande.totalHeures * 25).toFixed(2)} €
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => {
                  const tauxInput = document.getElementById('tauxHoraire');
                  confirmFinalValidation(parseFloat(tauxInput.value));
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
              >
                Valider et générer le paiement
              </button>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setSelectedDemande(null);
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour la gestion des employés
const EmployeeManagement = ({ employes, services, onAddEmployee, onEditEmployee }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    matricule: '',
    nomComplet: '',
    serviceID: '',
    poste: '',
    typeContrat: 'CDI',
    email: '',
    telephone: ''
  });

  const handleSubmit = () => {
    if (editingEmployee) {
      onEditEmployee(editingEmployee.employeID, formData);
    } else {
      onAddEmployee(formData);
    }
    setShowForm(false);
    setEditingEmployee(null);
    setFormData({
      matricule: '',
      nomComplet: '',
      serviceID: '',
      poste: '',
      typeContrat: 'CDI',
      email: '',
      telephone: ''
    });
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      matricule: employee.matricule,
      nomComplet: employee.nomComplet,
      serviceID: employee.serviceID,
      poste: employee.poste,
      typeContrat: employee.typeContrat,
      email: employee.email,
      telephone: employee.telephone
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Gestion des employés ({employes.length})
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Users className="w-4 h-4" />
          <span>Nouvel employé</span>
        </button>
      </div>

      {/* Liste des employés */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Matricule</th>
                  <th className="text-left py-3 px-4">Nom complet</th>
                  <th className="text-left py-3 px-4">Service</th>
                  <th className="text-left py-3 px-4">Poste</th>
                  <th className="text-left py-3 px-4">Type contrat</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Statut</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employes.map((employe) => (
                  <tr key={employe.employeID} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-sm">{employe.matricule}</td>
                    <td className="py-3 px-4 font-medium">{employe.nomComplet}</td>
                    <td className="py-3 px-4">{employe.service?.nomService}</td>
                    <td className="py-3 px-4">{employe.poste}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {employe.typeContrat}
                      </span>
                    </td>
                    <td className="py-3 px-4">{employe.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        employe.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {employe.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleEdit(employe)}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingEmployee ? 'Modifier l\'employé' : 'Nouvel employé'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
                <input
                  type="text"
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                <input
                  type="text"
                  value={formData.nomComplet}
                  onChange={(e) => setFormData({ ...formData, nomComplet: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                <select
                  value={formData.serviceID}
                  onChange={(e) => setFormData({ ...formData, serviceID: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner un service</option>
                  {services.map((service) => (
                    <option key={service.serviceID} value={service.serviceID}>
                      {service.nomService}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                <input
                  type="text"
                  value={formData.poste}
                  onChange={(e) => setFormData({ ...formData, poste: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type de contrat</label>
                <select
                  value={formData.typeContrat}
                  onChange={(e) => setFormData({ ...formData, typeContrat: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Interim">Interim</option>
                  <option value="Stage">Stage</option>
                  <option value="Alternance">Alternance</option>
                  <option value="MOO">MOO</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-6">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                {editingEmployee ? 'Modifier' : 'Créer'} l'employé
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingEmployee(null);
                  setFormData({
                    matricule: '',
                    nomComplet: '',
                    serviceID: '',
                    poste: '',
                    typeContrat: 'CDI',
                    email: '',
                    telephone: ''
                  });
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour les rapports et analyses
const ReportsAndAnalytics = ({ demandes, employes, services }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedService, setSelectedService] = useState('all');

  const filteredDemandes = demandes.filter(d => {
    const serviceMatch = selectedService === 'all' || d.serviceID === parseInt(selectedService);
    
    const now = new Date();
    const demandeDate = new Date(d.dateJour);
    
    let periodMatch = true;
    if (selectedPeriod === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      periodMatch = demandeDate >= weekAgo;
    } else if (selectedPeriod === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      periodMatch = demandeDate >= monthAgo;
    } else if (selectedPeriod === 'quarter') {
      const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      periodMatch = demandeDate >= quarterAgo;
    }
    
    return serviceMatch && periodMatch;
  });

  const stats = {
    totalDemandes: filteredDemandes.length,
    demandesValidees: filteredDemandes.filter(d => d.statut === 'Validée par la RH').length,
    demandesRejetees: filteredDemandes.filter(d => d.statut === 'Rejetée').length,
    totalHeures: filteredDemandes.reduce((sum, d) => sum + parseFloat(d.totalHeures || 0), 0),
    tempsTraitementMoyen: 4.2, // Simulé
    coutEstime: filteredDemandes
      .filter(d => d.statut === 'Validée par la RH')
      .reduce((sum, d) => sum + (parseFloat(d.totalHeures || 0) * 25), 0)
  };

  const demandesParService = services.map(service => ({
    nom: service.nomService,
    count: filteredDemandes.filter(d => d.serviceID === service.serviceID).length,
    heures: filteredDemandes
      .filter(d => d.serviceID === service.serviceID)
      .reduce((sum, d) => sum + parseFloat(d.totalHeures || 0), 0)
  })).filter(s => s.count > 0);

  const tauxValidation = filteredDemandes.length > 0 
    ? ((stats.demandesValidees / filteredDemandes.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Rapports et Analyses</h2>
        <div className="flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="quarter">90 derniers jours</option>
            <option value="all">Toute la période</option>
          </select>
          
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tous les services</option>
            {services.map(service => (
              <option key={service.serviceID} value={service.serviceID}>
                {service.nomService}
              </option>
            ))}
          </select>
          
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total demandes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDemandes}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taux de validation</p>
              <p className="text-2xl font-bold text-gray-900">{tauxValidation}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total heures</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalHeures.toFixed(1)}h</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Coût estimé</p>
              <p className="text-2xl font-bold text-gray-900">{stats.coutEstime.toLocaleString('fr-FR')} €</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par service */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par service</h3>
          <div className="space-y-3">
            {demandesParService.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{service.nom}</span>
                    <span className="text-sm text-gray-500">{service.count} demandes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(service.count / stats.totalDemandes * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm font-medium text-gray-900">{service.heures.toFixed(1)}h</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statuts des demandes */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">État des demandes</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Validées</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.demandesValidees}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">Rejetées</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{stats.demandesRejetees}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-yellow-500 rounded mr-3"></div>
                <span className="text-sm text-gray-700">En cours</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {stats.totalDemandes - stats.demandesValidees - stats.demandesRejetees}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tendances mensuelles */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des demandes</h3>
        <div className="h-64 flex items-end space-x-2">
          {[
            { mois: 'Jan', demandes: 45, heures: 120 },
            { mois: 'Fév', demandes: 52, heures: 140 },
            { mois: 'Mar', demandes: 38, heures: 95 },
            { mois: 'Avr', demandes: 61, heures: 165 },
            { mois: 'Mai', demandes: 48, heures: 128 },
            { mois: 'Juin', demandes: 55, heures: 148 }
          ].map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-blue-100 hover:bg-blue-200 transition-colors cursor-pointer rounded-t">
                <div 
                  className="bg-blue-600 rounded-t transition-all duration-300"
                  style={{ height: `${(data.demandes / 70) * 200}px` }}
                  title={`${data.demandes} demandes - ${data.heures}h`}
                ></div>
              </div>
              <span className="text-xs text-gray-600 mt-2">{data.mois}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top employés */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top employés (heures supplémentaires)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Classement</th>
                <th className="text-left py-2">Employé</th>
                <th className="text-left py-2">Service</th>
                <th className="text-left py-2">Demandes</th>
                <th className="text-left py-2">Total heures</th>
                <th className="text-left py-2">Coût estimé</th>
              </tr>
            </thead>
            <tbody>
              {employes.slice(0, 5).map((employe, index) => {
                const employeDemandes = filteredDemandes.filter(d => d.employeID === employe.employeID);
                const totalHeures = employeDemandes.reduce((sum, d) => sum + parseFloat(d.totalHeures || 0), 0);
                const coutEstime = totalHeures * 25;
                
                return (
                  <tr key={employe.employeID} className="border-b hover:bg-gray-50">
                    <td className="py-2">
                      <span className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full text-sm font-medium">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-2 font-medium">{employe.nomComplet}</td>
                    <td className="py-2">{employe.service?.nomService}</td>
                    <td className="py-2">{employeDemandes.length}</td>
                    <td className="py-2 font-medium">{totalHeures.toFixed(1)}h</td>
                    <td className="py-2 text-green-600 font-medium">{coutEstime.toLocaleString('fr-FR')} €</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export { 
  ManagerDashboard, 
  HRDashboard, 
  EmployeeManagement, 
  ReportsAndAnalytics 
};