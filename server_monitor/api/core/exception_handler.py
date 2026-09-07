import logging

from fastapi import Request
from fastapi.responses import JSONResponse

from common.exceptions import (
    ServerNotFoundError,
)
from common.models import ResponseObject

logger = logging.getLogger(__name__)


async def server_not_found(request: Request, exc: ServerNotFoundError):
    error_message = str(exc)
    logger.warning(error_message)

    return JSONResponse(
        status_code=404,
        content=ResponseObject(
            success=False,
            error=error_message,
        ).response(),
    )


# async def duplicate_server_handler(request: Request, exc: DuplicateServerError):
#     logger.warning(exc.message)

#     return JSONResponse(
#         status_code=409,
#         content={"detail": exc.message},
#     )


async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception")
    error_message = str(exc)
    logger.error(error_message)

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )