"""Module d'authentification JWT pour l'application GHS."""

import os
from datetime import datetime, timedelta
from typing import Optional, List
from functools import wraps

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlmodel import Session, select

from models import Account
from database import Database

# Configuration JWT
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Configuration de sécurité
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Instance de base de données (sera initialisée par init_auth)
_database: Optional[Database] = None


def init_auth(database: Database) -> None:
    """Initialise le module d'authentification avec la base de données."""
    global _database
    _database = database


def get_session() -> Session:
    """Obtient une session de base de données pour l'authentification."""
    if not _database:
        raise RuntimeError("Le module d'authentification n'est pas initialisé")
    return next(_database.get_session())


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie un mot de passe en clair contre son hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Génère le hash d'un mot de passe."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crée un token JWT d'accès."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def authenticate_user(username: str, password: str, session: Session) -> Optional[Account]:
    """Authentifie un utilisateur avec son nom d'utilisateur et mot de passe."""
    account = session.exec(
        select(Account).where(Account.username == username)
    ).first()
    
    if not account:
        return None
    
    if not verify_password(password, account.password):
        return None
    
    if not account.isActive:
        return None
    
    # Mettre à jour la dernière connexion
    account.lastLogin = datetime.utcnow()
    session.add(account)
    session.commit()
    
    return account


def get_current_user(token: str = Depends(oauth2_scheme)) -> Account:
    """Récupère l'utilisateur actuel à partir du token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Impossible de valider les identifiants",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    session = get_session()
    account = session.exec(
        select(Account).where(Account.username == username)
    ).first()
    
    if account is None:
        raise credentials_exception
    
    return account


def get_current_active_user(current_user: Account = Depends(get_current_user)) -> Account:
    """Récupère l'utilisateur actuel s'il est actif."""
    if not current_user.isActive:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Utilisateur inactif"
        )
    return current_user


def require_profile(allowed_profiles: List[str]):
    """Décorateur pour exiger certains profils utilisateur."""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Récupérer l'utilisateur actuel depuis les kwargs
            current_user = None
            for key, value in kwargs.items():
                if isinstance(value, Account):
                    current_user = value
                    break
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Utilisateur non authentifié"
                )
            
            if current_user.profile not in allowed_profiles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Profil requis: {', '.join(allowed_profiles)}"
                )
            
            return func(*args, **kwargs)
        return wrapper
    
    # Retourner une fonction qui peut être utilisée comme dépendance FastAPI
    def dependency(current_user: Account = Depends(get_current_active_user)) -> Account:
        if current_user.profile not in allowed_profiles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Profil requis: {', '.join(allowed_profiles)}"
            )
        return current_user
    
    return dependency