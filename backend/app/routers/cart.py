from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import CartItem, User, VMOffer
from app.schemas import CartItemCreate, CartItemRead, CartRead


router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=CartRead)
async def get_cart(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CartRead:
    stmt = select(CartItem).where(CartItem.user_id == current_user.id)
    result = await db.execute(stmt)
    items = result.scalars().all()
    item_reads = [CartItemRead.model_validate(i) for i in items]
    total = sum(i.hourly_price * i.quantity for i in items)
    return CartRead(items=item_reads, total_hourly_price=total)


@router.post("/items", response_model=CartItemRead, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item_in: CartItemCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CartItemRead:
    hourly_price = await _calculate_price(item_in, db)

    item = CartItem(
        user_id=current_user.id,
        offer_id=item_in.offer_id,
        cpu_cores=item_in.cpu_cores,
        memory_gb=item_in.memory_gb,
        storage_gb=item_in.storage_gb,
        os=item_in.os,
        quantity=item_in.quantity,
        hourly_price=hourly_price,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return CartItemRead.model_validate(item)


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    item_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    stmt = delete(CartItem).where(
        CartItem.id == item_id,
        CartItem.user_id == current_user.id,
    )
    result = await db.execute(stmt)
    if result.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")
    await db.commit()


async def _calculate_price(item_in: CartItemCreate, db: AsyncSession) -> float:
    base_price = 0.01 * item_in.cpu_cores + 0.005 * item_in.memory_gb + 0.0005 * item_in.storage_gb
    if item_in.offer_id:
        stmt = select(VMOffer).where(VMOffer.id == item_in.offer_id)
        result = await db.execute(stmt)
        offer = result.scalar_one_or_none()
        if offer:
            base_price = offer.base_price_per_hour
    return float(round(base_price, 4))

