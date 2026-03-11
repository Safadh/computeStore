from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import VMOffer
from app.schemas import VMOfferRead


router = APIRouter(prefix="/offers", tags=["offers"])


@router.get("", response_model=list[VMOfferRead])
async def list_offers(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[VMOfferRead]:
    stmt = select(VMOffer)
    result = await db.execute(stmt)
    offers = result.scalars().all()
    return [VMOfferRead.model_validate(o) for o in offers]


@router.get("/{offer_id}", response_model=VMOfferRead)
async def get_offer(
    offer_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> VMOfferRead:
    stmt = select(VMOffer).where(VMOffer.id == offer_id)
    result = await db.execute(stmt)
    offer = result.scalar_one_or_none()
    if offer is None:
        from fastapi import HTTPException, status

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Offer not found")
    return VMOfferRead.model_validate(offer)

