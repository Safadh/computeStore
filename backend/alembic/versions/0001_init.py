"""init

Revision ID: 0001_init
Revises: 
Create Date: 2026-03-10

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "0001_init"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_id", "users", ["id"], unique=False)

    op.create_table(
        "vm_offers",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("cpu_cores", sa.Integer(), nullable=False),
        sa.Column("memory_gb", sa.Integer(), nullable=False),
        sa.Column("storage_gb", sa.Integer(), nullable=False),
        sa.Column("base_price_per_hour", sa.Float(), nullable=False),
        sa.Column("os_options", postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
    )
    op.create_index("ix_vm_offers_id", "vm_offers", ["id"], unique=False)

    op.create_table(
        "orders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("total_hourly_price", sa.Float(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="paid"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_orders_id", "orders", ["id"], unique=False)

    op.create_table(
        "vm_instances",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("owner_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("offer_id", sa.Integer(), sa.ForeignKey("vm_offers.id"), nullable=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("cpu_cores", sa.Integer(), nullable=False),
        sa.Column("memory_gb", sa.Integer(), nullable=False),
        sa.Column("storage_gb", sa.Integer(), nullable=False),
        sa.Column("os", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="provisioning"),
        sa.Column("console_log", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_vm_instances_id", "vm_instances", ["id"], unique=False)

    op.create_table(
        "cart_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("offer_id", sa.Integer(), sa.ForeignKey("vm_offers.id"), nullable=True),
        sa.Column("cpu_cores", sa.Integer(), nullable=False),
        sa.Column("memory_gb", sa.Integer(), nullable=False),
        sa.Column("storage_gb", sa.Integer(), nullable=False),
        sa.Column("os", sa.String(length=128), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("hourly_price", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.text("now()")),
    )
    op.create_index("ix_cart_items_id", "cart_items", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_cart_items_id", table_name="cart_items")
    op.drop_table("cart_items")
    op.drop_index("ix_vm_instances_id", table_name="vm_instances")
    op.drop_table("vm_instances")
    op.drop_index("ix_orders_id", table_name="orders")
    op.drop_table("orders")
    op.drop_index("ix_vm_offers_id", table_name="vm_offers")
    op.drop_table("vm_offers")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

