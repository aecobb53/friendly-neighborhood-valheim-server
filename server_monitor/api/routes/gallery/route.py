import os
import re
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import HTMLResponse, ORJSONResponse, FileResponse
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Annotated

import logging

from common.exceptions import ServerNotFoundError
logger = logging.getLogger(__name__)


from common.models import ResponseObject
from common.utils import DATA_DIR, SERVERS_DIR, parse_timestamp, find_servers, find_game_servers, find_specific_server, find_game_info, REQUESTS_DIR, IMAGES_DIR

from .models import GalleryQueryParams, GalleryDataObject, GalleryLegendObject, GalleryDataObject

gallery_router = APIRouter(
    prefix='/api/gallery',
    tags=['gallery'],
)
map_router = APIRouter(
    prefix='/api/maps',
    tags=['maps'],
)

@gallery_router.get('', status_code=200)
def gallery(query: Annotated[GalleryQueryParams, Depends()]) -> ResponseObject:
    response = []
    for fl in (IMAGES_DIR / "manifest_files").glob("*gal-*.json"):
        with open(fl, "r") as f:
            print(f"READING FILE: {fl}")
            data = json.load(f)
            response.append(data)
    return {
        "success": True,
        "data": response
    }

@gallery_router.post('', status_code=201)
def create_gallery(new_resource: GalleryDataObject) -> ResponseObject:
    return {
        "success": True,
        "data": new_resource
    }

@gallery_router.get('/{id}/media/{filename}', status_code=200)
def gallery_item(id: str, filename: str) -> ResponseObject:
    image_path = Path(IMAGES_DIR) / "gallery" / f"{filename}.png"
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        path=image_path,
        media_type="image/png",
        filename=image_path.name,
    )

@map_router.get('/{server}', status_code=200)
def map(server: str) -> ResponseObject:
    manifest_path = Path(IMAGES_DIR) / "manifest_files" / f"{server}.map.json"
    if not manifest_path.exists():
        raise HTTPException(status_code=404, detail="Map manifest not found")
    with open(manifest_path) as mf:
        manifest_content = json.load(mf)
    return {
        "success": True,
        "data": manifest_content
    }

@map_router.get('/{server}/image', status_code=200)
def map_item(server: str) -> ResponseObject:
    image_path = Path(IMAGES_DIR) / "maps" / f"{server}.png"
    if not image_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    return FileResponse(
        path=image_path,
        media_type="image/png",
        filename=image_path.name,
    )
