import os
import re
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import HTMLResponse, ORJSONResponse
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Annotated

import logging

from common.exceptions import ServerNotFoundError
logger = logging.getLogger(__name__)


from common.models import ResponseObject
from common.utils import DATA_DIR, SERVERS_DIR, parse_timestamp, find_servers, find_game_servers, find_specific_server, find_game_info, REQUESTS_DIR
from .logic import find_requests

from .models import RequestsQueryParams, RequestDataUrgency, RequestDataObject

router = APIRouter(
    prefix='/api',
    tags=['requests'],
)

@router.get('/requests', status_code=200)
def requests(query: Annotated[RequestsQueryParams, Depends()]):
    response = find_requests(query=query)
    return {
        "success": True,
        "data": response
    }


@router.post('/requests', status_code=201)
def create_requests(creation_object: RequestDataObject):
    server = find_specific_server(server_name=creation_object.server)
    if not server:
        raise ServerNotFoundError(f"The server {creation_object['server']} does not exist")
    logger.info(f"Creating Request")
    req_id_number = 0
    for request_fl in REQUESTS_DIR.glob("req-*.json"):
        match = re.match(r".*req-(\d+)\.json", str(request_fl))
        req_id_number = max(req_id_number, int(match.group(1)))
    req_id_number += 1
    req_id = f"req-{req_id_number:03d}"
    creation_object.id = req_id

    with open(REQUESTS_DIR / f"{req_id}.json", 'w') as jf:
        jf.write(json.dumps(creation_object.to_json, indent=4))

    return {
        "success": True,
        "data": creation_object
    }


@router.put('/requests/{request_id}', status_code=200)
def update_requests(request_id: str, update_object: RequestDataObject):
    response = find_requests(query=RequestsQueryParams(id=request_id))

    # Verify fields were changed in an acceptable way

    req_id = update_object.id
    with open(REQUESTS_DIR / f"{req_id}.json", 'w') as jf:
        jf.write(json.dumps(update_object.to_json, indent=4))

    return {
        "success": True,
        "data": response
    }
