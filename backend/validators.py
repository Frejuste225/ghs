"""Validateurs personnalisés pour les modèles."""

from datetime import date, time, datetime
from typing import Optional
from fastapi import HTTPException


def validate_time_range(start_time: time, end_time: time) -> None:
    """Valide qu'une plage horaire est cohérente."""
    if end_time <= start_time:
        raise HTTPException(
            status_code=400,
            detail="L'heure de fin doit être postérieure à l'heure de début"
        )


def validate_date_range(start_date: date, end_date: date) -> None:
    """Valide qu'une plage de dates est cohérente."""
    if end_date < start_date:
        raise HTTPException(
            status_code=400,
            detail="La date de fin doit être postérieure à la date de début"
        )


def validate_request_date(request_date: date) -> None:
    """Valide qu'une date de demande n'est pas dans le passé."""
    if request_date < date.today():
        raise HTTPException(
            status_code=400,
            detail="La date de demande ne peut pas être dans le passé"
        )


def validate_working_hours(start_time: time, end_time: time) -> None:
    """Valide que les heures sont dans une plage de travail raisonnable."""
    # Vérifier que c'est dans une plage de 24h
    validate_time_range(start_time, end_time)
    
    # Vérifier que la durée n'excède pas 12 heures
    start_minutes = start_time.hour * 60 + start_time.minute
    end_minutes = end_time.hour * 60 + end_time.minute
    duration_minutes = end_minutes - start_minutes
    
    if duration_minutes > 12 * 60:  # 12 heures max
        raise HTTPException(
            status_code=400,
            detail="La durée de travail ne peut pas excéder 12 heures"
        )


def validate_employee_number_format(employee_number: str) -> None:
    """Valide le format du numéro d'employé."""
    if not employee_number or len(employee_number) < 3:
        raise HTTPException(
            status_code=400,
            detail="Le numéro d'employé doit contenir au moins 3 caractères"
        )


def validate_service_code_format(service_code: str) -> None:
    """Valide le format du code service."""
    if not service_code or len(service_code) < 2:
        raise HTTPException(
            status_code=400,
            detail="Le code service doit contenir au moins 2 caractères"
        )
    
    if not service_code.isalnum():
        raise HTTPException(
            status_code=400,
            detail="Le code service ne peut contenir que des lettres et des chiffres"
        )