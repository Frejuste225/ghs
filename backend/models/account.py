from datetime import datetime
from typing import Optional
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship


class ProfileType(str, Enum):
    """Types de profils utilisateur."""

    VALIDATOR = "Validator"
    SUPERVISOR = "Supervisor"
    ADMINISTRATOR = "Administrator"
    COORDINATOR = "Coordinator"


class Account(SQLModel, table=True):
    """Modèle pour la table des comptes."""

    __tablename__ = "accounts"

    accountID: Optional[int] = Field(default=None, primary_key=True)
    employeeID: int = Field(foreign_key="employees.employeeID", unique=True)
    username: str = Field(max_length=50, unique=True, index=True)
    password: str = Field(max_length=255)
    profile: ProfileType = Field(default=ProfileType.VALIDATOR)
    isActive: bool = Field(default=True)
    lastLogin: Optional[datetime] = Field(default=None)
    resetToken: Optional[str] = Field(default=None, max_length=100)
    resetTokenExpiry: Optional[datetime] = Field(default=None)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    # Relations
    employee: Optional["Employee"] = Relationship(back_populates="account")


class AccountCreate(SQLModel):
    """Schéma pour créer un compte."""

    employeeID: int
    username: str = Field(max_length=50)
    password: str = Field(max_length=255)
    profile: ProfileType = ProfileType.VALIDATOR
    isActive: bool = True


class AccountUpdate(SQLModel):
    """Schéma pour mettre à jour un compte."""

    username: Optional[str] = Field(default=None, max_length=50)
    password: Optional[str] = Field(default=None, max_length=255)
    profile: Optional[ProfileType] = None
    isActive: Optional[bool] = None
    resetToken: Optional[str] = Field(default=None, max_length=100)
    resetTokenExpiry: Optional[datetime] = None


class AccountRead(SQLModel):
    """Schéma pour lire un compte."""

    accountID: int
    employeeID: int
    username: str
    profile: ProfileType
    isActive: bool
    lastLogin: Optional[datetime]
    createdAt: datetime
    updatedAt: datetime


class AccountLogin(SQLModel):
    """Schéma pour la connexion."""

    username: str
    password: str
