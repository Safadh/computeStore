from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import User, VMInstance
from app.schemas import (
    VMConsoleChunk,
    VMDeployRequest,
    VMInstanceRead,
    VMMetricPoint,
)


router = APIRouter(prefix="/vms", tags=["vms"])


@router.get("", response_model=list[VMInstanceRead])
async def list_vms(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[VMInstanceRead]:
    stmt = select(VMInstance).where(VMInstance.owner_id == current_user.id)
    result = await db.execute(stmt)
    vms = result.scalars().all()
    return [VMInstanceRead.model_validate(vm) for vm in vms]


@router.post("", response_model=VMInstanceRead, status_code=status.HTTP_201_CREATED)
async def deploy_vm(
    vm_in: VMDeployRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VMInstanceRead:
    vm = VMInstance(
        owner_id=current_user.id,
        offer_id=vm_in.offer_id,
        name=vm_in.name,
        cpu_cores=vm_in.cpu_cores,
        memory_gb=vm_in.memory_gb,
        storage_gb=vm_in.storage_gb,
        os=vm_in.os,
        status="running",
        console_log="VM boot successful. Future versions will stream real console output.\n",
    )
    db.add(vm)
    await db.commit()
    await db.refresh(vm)
    return VMInstanceRead.model_validate(vm)


@router.get("/{vm_id}", response_model=VMInstanceRead)
async def get_vm(
    vm_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VMInstanceRead:
    vm = await _get_owned_vm(vm_id, current_user, db)
    return VMInstanceRead.model_validate(vm)


@router.get("/{vm_id}/metrics", response_model=list[VMMetricPoint])
async def get_vm_metrics(
    vm_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[VMMetricPoint]:
    await _get_owned_vm(vm_id, current_user, db)
    now = datetime.utcnow()
    points: list[VMMetricPoint] = []
    for i in range(12):
        ts = now - timedelta(minutes=5 * (11 - i))
        points.append(
            VMMetricPoint(
                timestamp=ts,
                cpu_usage=20 + (i * 3 % 40),
                memory_usage=30 + (i * 4 % 50),
            )
        )
    return points


@router.get("/{vm_id}/console", response_model=list[VMConsoleChunk])
async def get_vm_console(
    vm_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[VMConsoleChunk]:
    vm = await _get_owned_vm(vm_id, current_user, db)
    lines = vm.console_log.splitlines() if vm.console_log else []
    now = datetime.utcnow()
    chunks = [
        VMConsoleChunk(
            content=line,
            timestamp=now,
        )
        for line in lines
    ]
    if not chunks:
        chunks.append(
            VMConsoleChunk(
                content="No console output yet.",
                timestamp=now,
            )
        )
    return chunks


async def _get_owned_vm(vm_id: int, user: User, db: AsyncSession) -> VMInstance:
    stmt = select(VMInstance).where(
        VMInstance.id == vm_id,
        VMInstance.owner_id == user.id,
    )
    result = await db.execute(stmt)
    vm = result.scalar_one_or_none()
    if vm is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="VM not found",
        )
    return vm

