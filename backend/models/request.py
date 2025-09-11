from datetime import datetime, date, time
from typing import Optional, List
from enum import Enum
from sqlmodel import SQLModel, Field, Relationship


class RequestStatus(str, Enum):
    """Statuts des demandes."""
    PENDING = "pending"
    SUBMITTED = "submitted"
    FIRST_LEVEL_APPROVED = "firstLevelApproved"
    IN_PROGRESS = "inProgress"
    SECOND_LEVEL_APPROVED = "secondLevelApproved"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class Request(SQLModel, table=True):
    """Modèle pour la table des demandes."""
    
    __tablename__ = "requests"
    
    requestID: Optional[int] = Field(default=None, primary_key=True)
    employeeID: int = Field(foreign_key="employees.employeeID")
    requestDate: date = Field()
    previousStart: Optional[time] = Field(default=None)
    previousEnd: Optional[time] = Field(default=None)
    startAt: time = Field()
    endAt: time = Field()
    status: RequestStatus = Field(default=RequestStatus.PENDING)
    comment: Optional[str] = Field(default=None)
    createdBy: Optional[int] = Field(default=None, foreign_key="employees.employeeID")
    validatedN1At: Optional[datetime] = Field(default=None)
    validatedN2At: Optional[datetime] = Field(default=None)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    # Relations
    employee: Optional["Employee"] = Relationship(back_populates="requests")
    creator: Optional["Employee"] = Relationship(
        back_populates="created_requests",
        sa_relationship_kwargs={"foreign_keys": "Request.createdBy"}
    )
    workflows: List["Workflow"] = Relationship(back_populates="request")
    request_employees: List["RequestEmployee"] = Relationship(back_populates="request")


class RequestCreate(SQLModel):
    """Schéma pour créer une demande."""
    employeeID: int
    requestDate: date
    previousStart: Optional[time] = None
    previousEnd: Optional[time] = None
    startAt: time
    endAt: time
    comment: Optional[str] = None
    createdBy: Optional[int] = None


class RequestUpdate(SQLModel):
    """Schéma pour mettre à jour une demande."""
    requestDate: Optional[date] = None
    previousStart: Optional[time] = None
    previousEnd: Optional[time] = None
    startAt: Optional[time] = None
    endAt: Optional[time] = None
    status: Optional[RequestStatus] = None
    comment: Optional[str] = None
    validatedN1At: Optional[datetime] = None
    validatedN2At: Optional[datetime] = None


class RequestRead(SQLModel):
    """Schéma pour lire une demande."""
    requestID: int
    employeeID: int
    requestDate: date
    previousStart: Optional[time]
    previousEnd: Optional[time]
    startAt: time
    endAt: time
    status: RequestStatus
    comment: Optional[str]
    createdBy: Optional[int]
    validatedN1At: Optional[datetime]
    validatedN2At: Optional[datetime]
    createdAt: datetime
    updatedAt: datetime


class RequestEmployee(SQLModel, table=True):
    """Modèle pour la table de liaison RequestEmployee."""
    
    __tablename__ = "requestEmployee"
    
    ID: Optional[int] = Field(default=None, primary_key=True)
    employeeID: int = Field(foreign_key="employees.employeeID")
    requestID: int = Field(foreign_key="requests.requestID")
    totalHours: float = Field()
    
    # Relations
    employee: Optional["Employee"] = Relationship()
    request: Optional["Request"] = Relationship(back_populates="request_employees")