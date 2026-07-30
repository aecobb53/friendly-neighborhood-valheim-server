import json

from datetime import datetime
from pydantic import BaseModel


class GalleryQueryParams(BaseModel):
    id: str | None = None
    server: str | None = None


class GalleryDataObject(BaseModel):
    id: str
    server: str
    title: str
    description: str
    media_count: int
    preview_url: str
    media_urls: list[str]
    created_at: datetime


class GalleryLegendObject(BaseModel):
    symbol: str
    label: str


class GalleryDataObject(BaseModel):
    server: str
    description: str
    last_updated: datetime
    image_url: str
    legend: list[GalleryLegendObject]
