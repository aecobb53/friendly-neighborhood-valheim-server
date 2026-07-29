import json

from datetime import datetime
from pydantic import BaseModel
from enum import Enum


class RequestsQueryParams(BaseModel):
    id: str | None = None
    server: str | None = None
    archived: bool = False


class RequestDataUrgency(Enum):
    URGENT = 'URGENT'
    SOON = 'SOON'
    WHENEVER = 'WHENEVER'

class RequestDataObject(BaseModel):
    id: str
    server: str
    title: str
    requested_by: str
    urgency: RequestDataUrgency
    description: str
    image: str | None = None  # Path to an image
    created_at: datetime
    completed: bool
    archived: bool

    @property
    def to_json(self):
        response = json.loads(self.model_dump_json())
        return response

    @classmethod
    def from_json(cls, data_object):
        obj = cls(**data_object)
        return obj
