from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


class Service(SQLModel, table=True):
    """Modèle pour la table des services."""
    
    __tablename__ = "services"
    
    serviceID: Optional[int] = Field(default=None, primary_key=True)
    serviceCode: str = Field(max_length=10, unique=True, index=True)
    serviceName: str = Field(max_length=100)
    parentServiceID: Optional[int] = Field(default=None, foreign_key="services.serviceID")
    description: Optional[str] = Field(default=None)
    manager: Optional[str] = Field(default=None, max_length=100)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    # Relations
    employees: List["Employee"] = Relationship(back_populates="service")
    parent_service: Optional["Service"] = Relationship(
        back_populates="child_services",
        sa_relationship_kwargs={"remote_side": "Service.serviceID"}
    )
    child_services: List["Service"] = Relationship(back_populates="parent_service")


class ServiceCreate(SQLModel):
    """Schéma pour créer un service."""
    serviceCode: str = Field(max_length=10)
    serviceName: str = Field(max_length=100)
    parentServiceID: Optional[int] = None
    description: Optional[str] = None
    manager: Optional[str] = Field(default=None, max_length=100)


class ServiceUpdate(SQLModel):
    """Schéma pour mettre à jour un service."""
    serviceCode: Optional[str] = Field(default=None, max_length=10)
    serviceName: Optional[str] = Field(default=None, max_length=100)
    parentServiceID: Optional[int] = None
    description: Optional[str] = None
    manager: Optional[str] = Field(default=None, max_length=100)


class ServiceRead(SQLModel):
    """Schéma pour lire un service."""
    serviceID: int
    serviceCode: str
    serviceName: str
    parentServiceID: Optional[int]
    description: Optional[str]
    manager: Optional[str]
    createdAt: datetime
    updatedAt: datetime
