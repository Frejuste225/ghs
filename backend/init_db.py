"""Script d'initialisation de la base de données avec des données de test."""

import os
from datetime import date, time, datetime
from dotenv import load_dotenv

from database import Database
from models import Service, Employee, Account, ContractType, ProfileType
from auth import get_password_hash

# Charger les variables d'environnement
load_dotenv()

def init_database():
    """Initialise la base de données avec des données de test."""
    print("🔧 Initialisation de la base de données...")
    
    # Configuration de la base de données
    config = {
        "db_user": os.getenv("DB_USER", "root"),
        "db_password": os.getenv("DB_PASSWORD", ""),
        "db_host": os.getenv("DB_HOST", "localhost"),
        "db_port": int(os.getenv("DB_PORT", "3306")),
        "db_name": os.getenv("DB_NAME", "ghs")
    }
    
    database = Database(**config)
    
    if not database.start():
        print("❌ Impossible de se connecter à la base de données")
        return False
    
    try:
        session = next(database.get_session())
        
        # Créer des services de test
        print("📋 Création des services...")
        services_data = [
            {
                "serviceCode": "IT001",
                "serviceName": "Service Informatique",
                "description": "Gestion des systèmes informatiques",
                "manager": "Jean Dupont"
            },
            {
                "serviceCode": "HR001",
                "serviceName": "Ressources Humaines",
                "description": "Gestion du personnel",
                "manager": "Marie Martin"
            },
            {
                "serviceCode": "FIN001",
                "serviceName": "Service Financier",
                "description": "Gestion financière et comptabilité",
                "manager": "Pierre Durand"
            }
        ]
        
        created_services = []
        for service_data in services_data:
            service = Service(**service_data)
            session.add(service)
            session.commit()
            session.refresh(service)
            created_services.append(service)
            print(f"  ✅ Service créé: {service.serviceName}")
        
        # Créer des employés de test
        print("👥 Création des employés...")
        employees_data = [
            {
                "employeeNumber": "EMP001",
                "lastName": "Admin",
                "firstName": "Super",
                "serviceID": created_services[0].serviceID,
                "contractType": ContractType.CDI,
                "contact": "admin@ghs.com",
                "birthdate": date(1980, 1, 1)
            },
            {
                "employeeNumber": "EMP002",
                "lastName": "Supervisor",
                "firstName": "Test",
                "serviceID": created_services[1].serviceID,
                "contractType": ContractType.CDI,
                "contact": "supervisor@ghs.com",
                "birthdate": date(1985, 5, 15)
            },
            {
                "employeeNumber": "EMP003",
                "lastName": "User",
                "firstName": "Normal",
                "serviceID": created_services[2].serviceID,
                "contractType": ContractType.CDI,
                "contact": "user@ghs.com",
                "birthdate": date(1990, 10, 20)
            }
        ]
        
        created_employees = []
        for employee_data in employees_data:
            employee = Employee(**employee_data)
            session.add(employee)
            session.commit()
            session.refresh(employee)
            created_employees.append(employee)
            print(f"  ✅ Employé créé: {employee.firstName} {employee.lastName}")
        
        # Créer des comptes de test
        print("🔐 Création des comptes...")
        accounts_data = [
            {
                "employeeID": created_employees[0].employeeID,
                "username": "admin",
                "password": "admin123",
                "profile": ProfileType.ADMINISTRATOR,
                "isActive": True
            },
            {
                "employeeID": created_employees[1].employeeID,
                "username": "supervisor",
                "password": "super123",
                "profile": ProfileType.SUPERVISOR,
                "isActive": True
            },
            {
                "employeeID": created_employees[2].employeeID,
                "username": "user",
                "password": "user123",
                "profile": ProfileType.VALIDATOR,
                "isActive": True
            }
        ]
        
        for account_data in accounts_data:
            # Hacher le mot de passe
            account_data["password"] = get_password_hash(account_data["password"])
            
            account = Account(**account_data)
            session.add(account)
            session.commit()
            session.refresh(account)
            print(f"  ✅ Compte créé: {account.username} ({account.profile})")
        
        print("\n🎉 Initialisation terminée avec succès !")
        print("\n📋 Comptes de test créés:")
        print("  - admin / admin123 (Administrator)")
        print("  - supervisor / super123 (Supervisor)")
        print("  - user / user123 (Validator)")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {e}")
        return False
    
    finally:
        database.close()

if __name__ == "__main__":
    init_database()