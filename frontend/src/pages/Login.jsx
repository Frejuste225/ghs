import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Rediriger si déjà connecté
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await login(data);
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Erreur de connexion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue sur GHS
          </h1>
          <p className="text-gray-600">
            Gestion des Heures Supplémentaires
          </p>
        </div>

        <Card className="animate-fade-in">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="label">
                <User className="w-4 h-4 inline mr-2" />
                Nom d'utilisateur
              </label>
              <input
                {...register('username', {
                  required: 'Le nom d\'utilisateur est requis',
                })}
                type="text"
                className="input"
                placeholder="Entrez votre nom d'utilisateur"
                autoComplete="username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-danger-600">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="label">
                <Lock className="w-4 h-4 inline mr-2" />
                Mot de passe
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Entrez votre mot de passe"
                  autoComplete="current-password"
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
                <p className="mt-1 text-sm text-danger-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              Se connecter
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">Comptes de test :</p>
              <div className="space-y-1 text-xs">
                <p><strong>admin</strong> / admin123 (Administrateur)</p>
                <p><strong>supervisor</strong> / super123 (Superviseur)</p>
                <p><strong>user</strong> / user123 (Utilisateur)</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          GHS v2.0 - © 2024 - Tous droits réservés
        </div>
      </div>
    </div>
  );
};

export default Login;