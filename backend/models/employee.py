from datetime import datetime, date
from typing import Optional, List
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship


class ContractType(str, Enum):
    """Types de contrat disponibles."""
    CDI = "CDI"
    CDD = "CDD"
    INTERIM = "Interim"
    STAGE = "Stage"
    ALTERNANCE = "Alternance"
    MOO = "MOO"


class Employee(SQLModel, table=True):
    """Modèle pour la table des employés."""
    
    __tablename__ = "employees"
    
    employeeID: Optional[int] = Field(default=None, primary_key=True)
    employeeNumber: str = Field(max_length=20, unique=True, index=True)
    lastName: str = Field(max_length=20)
    firstName: str = Field(max_length=30)
    serviceID: int = Field(foreign_key="services.serviceID")
    contractType: ContractType = Field(default=ContractType.CDI)
    contact: Optional[str] = Field(default=None, max_length=20)
    birthdate: Optional[date] = Field(default=None)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    # Relations
    service: Optional["Service"] = Relationship(back_populates="employees")
    account: Optional["Account"] = Relationship(back_populates="employee")
    requests: List["Request"] = Relationship(back_populates="employee")
    created_requests: List["Request"] = Relationship(
        back_populates="creator",
        sa_relationship_kwargs={"foreign_keys": "Request.createdBy"}
    )
    delegated_by: List["Delegation"] = Relationship(
        back_populates="delegator",
        sa_relationship_kwargs={"foreign_keys": "Delegation.delegatedBy"}
    )
    delegated_to: List["Delegation"] = Relationship(
        back_populates="delegate",
        sa_relationship_kwargs={"foreign_keys": "Delegation.delegatedTo"}
    )


class EmployeeCreate(SQLModel):
    """Schéma pour créer un employé."""
    employeeNumber: str = Field(max_length=20)
    lastName: str = Field(max_length=20)
    firstName: str = Field(max_length=30)
    serviceID: int
    contractType: ContractType = ContractType.CDI
    contact: Optional[str] = Field(default=None, max_length=20)
    birthdate: Optional[date] = None


class EmployeeUpdate(SQLModel):
    """Schéma pour mettre à jour un employé."""
    employeeNumber: Optional[str] = Field(default=None, max_length=20)
    lastName: Optional[str] = Field(default=None, max_length=20)
    firstName: Optional[str] = Field(default=None, max_length=30)
    serviceID: Optional[int] = None
    contractType: Optional[ContractType] = None
    contact: Optional[str] = Field(default=None, max_length=20)
    birthdate: Optional[date] = None


class EmployeeRead(SQLModel):
    """Schéma pour lire un employé."""
    employeeID: int
    employeeNumber: str
    lastName: str
    firstName: str
    serviceID: int
    contractType: ContractType
    contact: Optional[str]
    birthdate: Optional[date]
    createdAt: datetime
    updatedAt: datetime