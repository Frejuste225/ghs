import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { accountService, employeeService } from '../services/ghs';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
  Plus, 
  Users, 
  Shield, 
  ShieldCheck,
  Edit,
  Trash2,
  Search,
  Eye,
  EyeOff,
  UserCheck,
  UserX
} from 'lucide-react';

const Accounts = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Récupérer les comptes et employés
  const { data: accounts = [], isLoading } = useQuery('accounts', accountService.getAll);
  const { data: employees = [] } = useQuery('employees', employeeService.getAll);

  // Filtrer les comptes selon la recherche
  const filteredAccounts = accounts.filter(account => {
    const employee = employees.find(emp => emp.employeeID === account.employeeID);
    return account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           employee?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Mutation pour créer un compte
  const createMutation = useMutation(accountService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('accounts');
      toast.success('Compte créé avec succès');
      setIsModalOpen(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création');
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const getEmployeeName = (employeeID) => {
    const employee = employees.find(emp => emp.employeeID === employeeID);
    return employee ? `${employee.firstName} ${employee.lastName}` : 'Employé inconnu';
  };

  const getProfileIcon = (profile) => {
    switch (profile) {
      case 'Administrator':
        return <ShieldCheck className="w-5 h-5 text-danger-600" />;
      case 'Supervisor':
        return <Shield className="w-5 h-5 text-warning-600" />;
      case 'Coordinator':
        return <UserCheck className="w-5 h-5 text-primary-600" />;
      default:
        return <Users className="w-5 h-5 text-secondary-600" />;
    }
  };

  const getProfileColor = (profile) => {
    switch (profile) {
      case 'Administrator':
        return 'bg-danger-100 text-danger-800';
      case 'Supervisor':
        return 'bg-warning-100 text-warning-800';
      case 'Coordinator':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getProfileText = (profile) => {
    switch (profile) {
      case 'Administrator':
        return 'Administrateur';
      case 'Supervisor':
        return 'Superviseur';
      case 'Coordinator':
        return 'Coordinateur';
      default:
        return 'Validateur';
    }
  };

  // Employés sans compte
  const employeesWithoutAccount = employees.filter(employee => 
    !accounts.some(account => account.employeeID === employee.employeeID)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comptes utilisateurs</h1>
          <p className="text-gray-600">
            Gérez les comptes d'accès à l'application
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2"
          disabled={employeesWithoutAccount.length === 0}
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau compte</span>
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total comptes</p>
              <p className="text-2xl font-bold text-primary-600">{accounts.length}</p>
            </div>
            <Users className="w-8 h-8 text-primary-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Administrateurs</p>
              <p className="text-2xl font-bold text-danger-600">
                {accounts.filter(a => a.profile === 'Administrator').length}
              </p>
            </div>
            <ShieldCheck className="w-8 h-8 text-danger-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comptes actifs</p>
              <p className="text-2xl font-bold text-success-600">
                {accounts.filter(a => a.isActive).length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-success-600" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Comptes inactifs</p>
              <p className="text-2xl font-bold text-gray-600">
                {accounts.filter(a => !a.isActive).length}
              </p>
            </div>
            <UserX className="w-8 h-8 text-gray-600" />
          </div>
        </Card>
      </div>

      {/* Barre de recherche */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher un compte..."
            className="input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Card>

      {/* Liste des comptes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccounts.map((account) => (
          <Card key={account.accountID} className="hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  {getProfileIcon(account.profile)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {getEmployeeName(account.employeeID)}
                  </h3>
                  <p className="text-sm text-gray-600">@{account.username}</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${account.isActive ? 'bg-success-500' : 'bg-gray-400'}`}></div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Profil</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProfileColor(account.profile)}`}>
                  {getProfileText(account.profile)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  account.isActive ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {account.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
              
              {account.lastLogin && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dernière connexion</span>
                  <span className="text-xs text-gray-500">
                    {new Date(account.lastLogin).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  Créé le {new Date(account.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <Card className="text-center py-12">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'Aucun compte trouvé' : 'Aucun compte'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Essayez de modifier votre recherche.'
              : 'Commencez par créer votre premier compte utilisateur.'
            }
          </p>
          {!searchTerm && employeesWithoutAccount.length > 0 && (
            <Button onClick={() => setIsModalOpen(true)}>
              Créer un compte
            </Button>
          )}
        </Card>
      )}

      {/* Modal de création */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAccount(null);
          reset();
        }}
        title="Nouveau compte utilisateur"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Employé</label>
            <select
              {...register('employeeID', { required: 'L\'employé est requis' })}
              className="input"
            >
              <option value="">Sélectionner un employé</option>
              {employeesWithoutAccount.map((employee) => (
                <option key={employee.employeeID} value={employee.employeeID}>
                  {employee.firstName} {employee.lastName} - {employee.employeeNumber}
                </option>
              ))}
            </select>
            {errors.employeeID && (
              <p className="mt-1 text-sm text-danger-600">{errors.employeeID.message}</p>
            )}
          </div>

          <div>
            <label className="label">Nom d'utilisateur</label>
            <input
              {...register('username', { 
                required: 'Le nom d\'utilisateur est requis',
                minLength: { value: 3, message: 'Minimum 3 caractères' }
              })}
              type="text"
              className="input"
              placeholder="Ex: jdupont"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-danger-600">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="label">Mot de passe</label>
            <div className="relative">
              <input
                {...register('password', { 
                  required: 'Le mot de passe est requis',
                  minLength: { value: 6, message: 'Minimum 6 caractères' }
                })}
                type={showPassword ? 'text' : 'password'}
                className="input pr-10"
                placeholder="Mot de passe sécurisé"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-400" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="label">Profil</label>
            <select
              {...register('profile', { required: 'Le profil est requis' })}
              className="input"
            >
              <option value="Validator">Validateur</option>
              <option value="Coordinator">Coordinateur</option>
              <option value="Supervisor">Superviseur</option>
              <option value="Administrator">Administrateur</option>
            </select>
            {errors.profile && (
              <p className="mt-1 text-sm text-danger-600">{errors.profile.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              {...register('isActive')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              defaultChecked={true}
            />
            <label className="ml-2 block text-sm text-gray-900">
              Compte actif
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                setEditingAccount(null);
                reset();
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              loading={createMutation.isLoading}
              disabled={createMutation.isLoading}
            >
              Créer le compte
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Accounts;