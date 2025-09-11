from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class Delegation(SQLModel, table=True):
    """Modèle pour la table des délégations."""
    
    __tablename__ = "delegations"
    
    delegationID: Optional[int] = Field(default=None, primary_key=True)
    delegatedBy: int = Field(foreign_key="employees.employeeID")
    delegatedTo: int = Field(foreign_key="employees.employeeID")
    startAt: date = Field()
    endAt: date = Field()
    
    # Relations
    delegator: Optional["Employee"] = Relationship(
        back_populates="delegated_by",
        sa_relationship_kwargs={"foreign_keys": "Delegation.delegatedBy"}
    )
    delegate: Optional["Employee"] = Relationship(
        back_populates="delegated_to",
        sa_relationship_kwargs={"foreign_keys": "Delegation.delegatedTo"}
    )


class DelegationCreate(SQLModel):
    """Schéma pour créer une délégation."""
    delegatedBy: int
    delegatedTo: int
    startAt: date
    endAt: date


class DelegationUpdate(SQLModel):
    """Schéma pour mettre à jour une délégation."""
    delegatedBy: Optional[int] = None
    delegatedTo: Optional[int] = None
    startAt: Optional[date] = None
    endAt: Optional[date] = None


class DelegationRead(SQLModel):
    """Schéma pour lire une délégation."""
    delegationID: int
    delegatedBy: int
    delegatedTo: int
    startAt: date
    endAt: date