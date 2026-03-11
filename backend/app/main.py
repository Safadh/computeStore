from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers import auth, cart, checkout, offers, vms


def create_app() -> FastAPI:
    settings = get_settings()

    app = FastAPI(title=settings.app_name)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    api_prefix = settings.api_prefix
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(offers.router, prefix=api_prefix)
    app.include_router(cart.router, prefix=api_prefix)
    app.include_router(checkout.router, prefix=api_prefix)
    app.include_router(vms.router, prefix=api_prefix)

    @app.get("/")
    async def root() -> dict[str, str]:
        return {"message": "computeStore API is running"}

    return app


app = create_app()

