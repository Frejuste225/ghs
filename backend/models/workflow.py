from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship


class Workflow(SQLModel, table=True):
    """Modèle pour la table des workflows."""
    
    __tablename__ = "workflows"
    
    workflowID: Optional[int] = Field(default=None, primary_key=True)
    requestID: int = Field(foreign_key="requests.requestID")
    validator: int = Field(foreign_key="employees.employeeID")
    delegate: Optional[int] = Field(default=None, foreign_key="employees.employeeID")
    assignDate: datetime = Field()
    validationDate: Optional[datetime] = Field(default=None)
    status: int = Field()
    
    # Relations
    request: Optional["Request"] = Relationship(back_populates="workflows")
    validator_employee: Optional["Employee"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "Workflow.validator"}
    )
    delegate_employee: Optional["Employee"] = Relationship(
        sa_relationship_kwargs={"foreign_keys": "Workflow.delegate"}
    )


class WorkflowCreate(SQLModel):
    """Schéma pour créer un workflow."""
    requestID: int
    validator: int
    delegate: Optional[int] = None
    assignDate: datetime
    status: int


class WorkflowUpdate(SQLModel):
    """Schéma pour mettre à jour un workflow."""
    validator: Optional[int] = None
    delegate: Optional[int] = None
    assignDate: Optional[datetime] = None
    validationDate: Optional[datetime] = None
    status: Optional[int] = None


class WorkflowRead(SQLModel):
    """Schéma pour lire un workflow."""
    workflowID: int
    requestID: int
    validator: int
    delegate: Optional[int]
    assignDate: datetime
    validationDate: Optional[datetime]
    status: int