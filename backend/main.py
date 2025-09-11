"""Application FastAPI pour la gestion des heures supplémentaires (GHS)."""

import os
import logging
from contextlib import asynccontextmanager
from typing import List
from datetime import timedelta

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

# Charger les variables d'environnement
load_dotenv()

from database import Database
from models import (
    Service, ServiceCreate, ServiceUpdate, ServiceRead,
    Employee, EmployeeCreate, EmployeeUpdate, EmployeeRead,
    Account, AccountCreate, AccountUpdate, AccountRead, AccountLogin,
    Request, RequestCreate, RequestUpdate, RequestRead,
    Delegation, DelegationCreate, DelegationUpdate, DelegationRead,
    Workflow, WorkflowCreate, WorkflowUpdate, WorkflowRead
)
from auth import (
    init_auth, authenticate_user, create_access_token, get_password_hash,
    get_current_active_user, require_profile, ACCESS_TOKEN_EXPIRE_MINUTES
)
from middleware import ErrorHandlerMiddleware, LoggingMiddleware
from validators import (
    validate_time_range, validate_date_range, validate_request_date,
    validate_working_hours, validate_employee_number_format,
    validate_service_code_format
)

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
# Configuration de la base de données
DB_CONFIG = {
    "db_user": os.getenv("DB_USER", "root"),
    "db_password": os.getenv("DB_PASSWORD", ""),
    "db_host": os.getenv("DB_HOST", "localhost"),
    "db_port": int(os.getenv("DB_PORT", "3306")),
    "db_name": os.getenv("DB_NAME", "ghs")
}

# Instance de base de données
database = Database(**DB_CONFIG)

# Initialiser l'authentification
init_auth(database)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestionnaire de cycle de vie de l'application."""
    # Démarrage
    if not database.start():
        raise RuntimeError("Impossible de se connecter à la base de données")
    yield
    # Arrêt
    database.close()


# Création de l'application FastAPI
app = FastAPI(
    title="GHS API",
    description="API pour la gestion des heures supplémentaires",
    version="2.0.0",
    lifespan=lifespan
)

# Ajout des middlewares
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(LoggingMiddleware)
# Configuration CORS
cors_origins = os.getenv("CORS_ORIGINS", "").split(",") if os.getenv("CORS_ORIGINS") else ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_session() -> Session:
    """Dépendance pour obtenir une session de base de données."""
    return next(database.get_session())


# ============================================================================
# ENDPOINTS AUTHENTIFICATION
# ============================================================================

@app.post("/auth/login", tags=["Authentication"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    """Connexion utilisateur avec génération de token JWT."""
    user = authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Nom d'utilisateur ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "username": user.username,
            "profile": user.profile,
            "employeeID": user.employeeID
        }
    }


@app.get("/auth/me", response_model=AccountRead, tags=["Authentication"])
def get_current_user_info(current_user: Account = Depends(get_current_active_user)):
    """Récupère les informations de l'utilisateur connecté."""
    return current_user


# ============================================================================
# ENDPOINTS SERVICES
# ============================================================================

@app.get("/services", response_model=List[ServiceRead], tags=["Services"])
def get_services(session: Session = Depends(get_session)):
    """Récupère tous les services."""
    services = session.exec(select(Service)).all()
    return services


@app.get("/services/{service_id}", response_model=ServiceRead, tags=["Services"])
def get_service(service_id: int, session: Session = Depends(get_session)):
    """Récupère un service par son ID."""
    service = session.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    return service


@app.post("/services", response_model=ServiceRead, tags=["Services"])
def create_service(
    service: ServiceCreate, 
    session: Session = Depends(get_session),
    current_user: Account = Depends(require_profile(["Administrator", "Supervisor"]))
):
    """Crée un nouveau service."""
    # Validation du format du code service
    validate_service_code_format(service.serviceCode)
    
    # Vérifier l'unicité du code service
    existing_service = session.exec(
        select(Service).where(Service.serviceCode == service.serviceCode)
    ).first()
    if existing_service:
        raise HTTPException(
            status_code=400,
            detail="Un service avec ce code existe déjà"
        )
    
    db_service = Service.model_validate(service)
    session.add(db_service)
    session.commit()
    session.refresh(db_service)
    return db_service


@app.put("/services/{service_id}", response_model=ServiceRead, tags=["Services"])
def update_service(
    service_id: int, 
    service: ServiceUpdate, 
    session: Session = Depends(get_session),
    current_user: Account = Depends(require_profile(["Administrator", "Supervisor"]))
):
    """Met à jour un service."""
    db_service = session.get(Service, service_id)
    if not db_service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    service_data = service.model_dump(exclude_unset=True)
    for key, value in service_data.items():
        setattr(db_service, key, value)
    
    session.add(db_service)
    session.commit()
    session.refresh(db_service)
    return db_service


@app.delete("/services/{service_id}", tags=["Services"])
def delete_service(
    service_id: int, 
    session: Session = Depends(get_session),
    current_user: Account = Depends(require_profile(["Administrator"]))
):
    """Supprime un service."""
    service = session.get(Service, service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    session.delete(service)
    session.commit()
    return {"message": "Service supprimé avec succès"}


# ============================================================================
# ENDPOINTS EMPLOYEES
# ============================================================================

@app.get("/employees", response_model=List[EmployeeRead], tags=["Employees"])
def get_employees(session: Session = Depends(get_session)):
    """Récupère tous les employés."""
    employees = session.exec(select(Employee)).all()
    return employees


@app.get("/employees/{employee_id}", response_model=EmployeeRead, tags=["Employees"])
def get_employee(employee_id: int, session: Session = Depends(get_session)):
    """Récupère un employé par son ID."""
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    return employee


@app.post("/employees", response_model=EmployeeRead, tags=["Employees"])
def create_employee(
    employee: EmployeeCreate, 
    session: Session = Depends(get_session),
    current_user: Account = Depends(require_profile(["Administrator", "Supervisor"]))
):
    """Crée un nouvel employé."""
    # Validation du format du numéro d'employé
    validate_employee_number_format(employee.employeeNumber)
    
    # Vérifier l'unicité du numéro d'employé
    existing_employee = session.exec(
        select(Employee).where(Employee.employeeNumber == employee.employeeNumber)
    ).first()
    if existing_employee:
        raise HTTPException(
            status_code=400,
            detail="Un employé avec ce numéro existe déjà"
        )
    
    # Vérifier que le service existe
    service = session.get(Service, employee.serviceID)
    if not service:
        raise HTTPException(
            status_code=400,
            detail="Le service spécifié n'existe pas"
        )
    
    db_employee = Employee.model_validate(employee)
    session.add(db_employee)
    session.commit()
    session.refresh(db_employee)
    return db_employee


@app.put("/employees/{employee_id}", response_model=EmployeeRead, tags=["Employees"])
def update_employee(
    employee_id: int, 
    employee: EmployeeUpdate, 
    session: Session = Depends(get_session),
    current_user: Account = Depends(require_profile(["Administrator", "Supervisor"]))
):
    """Met à jour un employé."""
    db_employee = session.get(Employee, employee_id)
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    
    employee_data = employee.model_dump(exclude_unset=True)
    for key, value in employee_data.items():
        setattr(db_employee, key, value)
    
    session.add(db_employee)
    session.commit()
    session.refresh(db_employee)
    return db_employee


@app.delete("/employees/{employee_id}", tags=["Employees"])
def delete_employee(
    employee_id: int, 
    session: Session = Depends(get_session),
    current_user: Account = Depends(require_profile(["Administrator"]))
):
    """Supprime un employé."""
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    
    session.delete(employee)
    session.commit()
    return {"message": "Employé supprimé avec succès"}


# ============================================================================
# ENDPOINTS ACCOUNTS
# ============================================================================

@app.get("/accounts", response_model=List[AccountRead], tags=["Accounts"])
def get_accounts(
    session: Session = Depends(get_session),
    current_user: Account = Depends(require_profile(["Administrator"]))
):
    """Récupère tous les comptes."""
    accounts = session.exec(select(Account)).all()
    return accounts


@app.get("/accounts/{account_id}", response_model=AccountRead, tags=["Accounts"])
def get_account(
    account_id: int, 
    session: Session = Depends(get_session),
    current_user: Account = Depends(require_profile(["Administrator"]))
):
    """Récupère un compte par son ID."""
    account = session.get(Account, account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Compte non trouvé")
    return account


@app.post("/accounts", response_model=AccountRead, tags=["Accounts"])
def create_account(
    account: AccountCreate, 
    session: Session = Depends(get_session),
    current_user: Account = Depends(require_profile(["Administrator"]))
):
    """Crée un nouveau compte."""
    # Vérifier que l'employé existe
    employee = session.get(Employee, account.employeeID)
    if not employee:
        raise HTTPException(
            status_code=400,
            detail="L'employé spécifié n'existe pas"
        )
    
    # Vérifier l'unicité du nom d'utilisateur
    existing_account = session.exec(
        select(Account).where(Account.username == account.username)
    ).first()
    if existing_account:
        raise HTTPException(
            status_code=400,
            detail="Un compte avec ce nom d'utilisateur existe déjà"
        )
    
    # Hacher le mot de passe
    account_data = account.model_dump()
    account_data["password"] = get_password_hash(account.password)
    
    db_account = Account.model_validate(account_data)
    session.add(db_account)
    session.commit()
    session.refresh(db_account)
    return db_account


# ============================================================================
# ENDPOINTS REQUESTS
# ============================================================================

@app.get("/requests", response_model=List[RequestRead], tags=["Requests"])
def get_requests(session: Session = Depends(get_session)):
    """Récupère toutes les demandes."""
    requests = session.exec(select(Request)).all()
    return requests


@app.get("/requests/{request_id}", response_model=RequestRead, tags=["Requests"])
def get_request(request_id: int, session: Session = Depends(get_session)):
    """Récupère une demande par son ID."""
    request = session.get(Request, request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    return request


@app.post("/requests", response_model=RequestRead, tags=["Requests"])
def create_request(
    request: RequestCreate, 
    session: Session = Depends(get_session),
    current_user: Account = Depends(get_current_active_user)
):
    """Crée une nouvelle demande."""
    # Validations
    validate_request_date(request.requestDate)
    validate_working_hours(request.startAt, request.endAt)
    
    if request.previousStart and request.previousEnd:
        validate_time_range(request.previousStart, request.previousEnd)
    
    # Vérifier que l'employé existe
    employee = session.get(Employee, request.employeeID)
    if not employee:
        raise HTTPException(
            status_code=400,
            detail="L'employé spécifié n'existe pas"
        )
    
    # Définir le créateur de la demande
    request_data = request.model_dump()
    request_data["createdBy"] = current_user.employeeID
    
    db_request = Request.model_validate(request)
    session.add(db_request)
    session.commit()
    session.refresh(db_request)
    return db_request


@app.put("/requests/{request_id}", response_model=RequestRead, tags=["Requests"])
def update_request(
    request_id: int, 
    request: RequestUpdate, 
    session: Session = Depends(get_session),
    current_user: Account = Depends(get_current_active_user)
):
    """Met à jour une demande."""
    db_request = session.get(Request, request_id)
    if not db_request:
        raise HTTPException(status_code=404, detail="Demande non trouvée")
    
    # Vérifier les permissions
    if (db_request.employeeID != current_user.employeeID and 
        current_user.profile not in ["Administrator", "Supervisor"]):
        raise HTTPException(
            status_code=403,
            detail="Vous n'avez pas l'autorisation de modifier cette demande"
        )
    
    # Validations si les champs sont modifiés
    if request.requestDate:
        validate_request_date(request.requestDate)
    
    if request.startAt and request.endAt:
        validate_working_hours(request.startAt, request.endAt)
    elif request.startAt and db_request.endAt:
        validate_working_hours(request.startAt, db_request.endAt)
    elif request.endAt and db_request.startAt:
        validate_working_hours(db_request.startAt, request.endAt)
    
    request_data = request.model_dump(exclude_unset=True)
    for key, value in request_data.items():
        setattr(db_request, key, value)
    
    session.add(db_request)
    session.commit()
    session.refresh(db_request)
    return db_request


# ============================================================================
# ENDPOINTS DELEGATIONS
# ============================================================================

@app.get("/delegations", response_model=List[DelegationRead], tags=["Delegations"])
def get_delegations(
    session: Session = Depends(get_session),
    current_user: Account = Depends(get_current_active_user)
):
    """Récupère toutes les délégations."""
    delegations = session.exec(select(Delegation)).all()
    return delegations


@app.post("/delegations", response_model=DelegationRead, tags=["Delegations"])
def create_delegation(
    delegation: DelegationCreate, 
    session: Session = Depends(get_session),
    current_user: Account = Depends(require_profile(["Administrator", "Supervisor"]))
):
    """Crée une nouvelle délégation."""
    # Validations
    validate_date_range(delegation.startAt, delegation.endAt)
    
    # Vérifier que les employés existent
    delegator = session.get(Employee, delegation.delegatedBy)
    delegate = session.get(Employee, delegation.delegatedTo)
    
    if not delegator or not delegate:
        raise HTTPException(
            status_code=400,
            detail="Un ou plusieurs employés spécifiés n'existent pas"
        )
    
    if delegation.delegatedBy == delegation.delegatedTo:
        raise HTTPException(
            status_code=400,
            detail="Un employé ne peut pas se déléguer à lui-même"
        )
    
    db_delegation = Delegation.model_validate(delegation)
    session.add(db_delegation)
    session.commit()
    session.refresh(db_delegation)
    return db_delegation


# ============================================================================
# ENDPOINTS WORKFLOWS
# ============================================================================

@app.get("/workflows", response_model=List[WorkflowRead], tags=["Workflows"])
def get_workflows(
    session: Session = Depends(get_session),
    current_user: Account = Depends(require_profile(["Administrator", "Supervisor"]))
):
    """Récupère tous les workflows."""
    workflows = session.exec(select(Workflow)).all()
    return workflows


@app.post("/workflows", response_model=WorkflowRead, tags=["Workflows"])
def create_workflow(
    workflow: WorkflowCreate, 
    session: Session = Depends(get_session),
    current_user: Account = Depends(require_profile(["Administrator", "Supervisor"]))
):
    """Crée un nouveau workflow."""
    # Vérifier que la demande existe
    request = session.get(Request, workflow.requestID)
    if not request:
        raise HTTPException(
            status_code=400,
            detail="La demande spécifiée n'existe pas"
        )
    
    # Vérifier que le validateur existe
    validator = session.get(Employee, workflow.validator)
    if not validator:
        raise HTTPException(
            status_code=400,
            detail="Le validateur spécifié n'existe pas"
        )
    
    db_workflow = Workflow.model_validate(workflow)
    session.add(db_workflow)
    session.commit()
    session.refresh(db_workflow)
    return db_workflow


# ============================================================================
# ENDPOINT DE SANTÉ
# ============================================================================

@app.get("/health", tags=["Health"])
def health_check():
    """Vérification de l'état de l'API."""
    return {
        "status": "healthy", 
        "message": "GHS API is running",
        "version": "2.0.0"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)