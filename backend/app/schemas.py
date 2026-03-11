from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    full_name: str = Field(min_length=2, max_length=255)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = " ".join(v.strip().split())
        parts = [p for p in v.split(" ") if p]
        if len(parts) < 2:
            raise ValueError("full_name must include at least first name and last name")
        return v


class UserRead(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: str
    exp: int


class VMOfferBase(BaseModel):
    name: str
    description: Optional[str] = None
    cpu_cores: int
    memory_gb: int
    storage_gb: int
    base_price_per_hour: float
    os_options: dict


class VMOfferRead(VMOfferBase):
    id: int

    class Config:
        from_attributes = True


class VMConfigBase(BaseModel):
    cpu_cores: int
    memory_gb: int
    storage_gb: int
    os: str


class CartItemCreate(VMConfigBase):
    offer_id: Optional[int] = None
    quantity: int = Field(default=1, ge=1)


class CartItemRead(VMConfigBase):
    id: int
    offer_id: Optional[int]
    quantity: int
    hourly_price: float
    created_at: datetime

    class Config:
        from_attributes = True


class CartRead(BaseModel):
    items: list[CartItemRead]
    total_hourly_price: float


class CheckoutRequest(BaseModel):
    card_number: str = Field(min_length=12, max_length=19)
    card_exp_month: int = Field(ge=1, le=12)
    card_exp_year: int
    card_cvc: str = Field(min_length=3, max_length=4)


class CheckoutResponse(BaseModel):
    order_id: int
    total_hourly_price: float
    status: str


class VMInstanceRead(VMConfigBase):
    id: int
    name: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VMDeployRequest(VMConfigBase):
    name: str
    offer_id: Optional[int] = None


class VMMetricPoint(BaseModel):
    timestamp: datetime
    cpu_usage: float
    memory_usage: float


class VMConsoleChunk(BaseModel):
    content: str
    timestamp: datetime

