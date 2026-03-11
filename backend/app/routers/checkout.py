from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import CartItem, Order, User, VMInstance
from app.schemas import CheckoutRequest, CheckoutResponse


router = APIRouter(prefix="/checkout", tags=["checkout"])


@router.post("", response_model=CheckoutResponse)
async def checkout(
    payload: CheckoutRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CheckoutResponse:
    if not payload.card_number.isdigit():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid card number")

    stmt_items = select(CartItem).where(CartItem.user_id == current_user.id)
    result = await db.execute(stmt_items)
    items = result.scalars().all()
    if not items:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")

    total = float(sum(i.hourly_price * i.quantity for i in items))

    order = Order(
        user_id=current_user.id,
        total_hourly_price=total,
        status="paid",
    )
    db.add(order)
    await db.flush()

    for item in items:
        for idx in range(item.quantity):
            vm = VMInstance(
                owner_id=current_user.id,
                offer_id=item.offer_id,
                name=f"vm-{order.id}-{item.id}-{idx + 1}",
                cpu_cores=item.cpu_cores,
                memory_gb=item.memory_gb,
                storage_gb=item.storage_gb,
                os=item.os,
                status="running",
                console_log="VM deployed via computeStore checkout.\n",
            )
            db.add(vm)

    stmt_delete = delete(CartItem).where(CartItem.user_id == current_user.id)
    await db.execute(stmt_delete)

    await db.commit()
    await db.refresh(order)

    return CheckoutResponse(
        order_id=order.id,
        total_hourly_price=order.total_hourly_price,
        status=order.status,
    )

