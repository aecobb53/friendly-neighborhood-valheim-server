from pydantic import BaseModel
from typing import Any


class ResponseObject(BaseModel):
    success: bool
    data: Any | None = None
