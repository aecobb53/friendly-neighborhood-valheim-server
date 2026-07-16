import re
import datetime

from .common import BaseParser, ServerStatus


class ValheimParser(BaseParser):
    status_pattern = {
        r"Initializing your container": {
            "status": ServerStatus.INITIALIZING,
            "message": "Initializing Server in Container"
        },
        r"Downloading update": {
            "status": ServerStatus.UPDATING,
            "message": "Downloading update from Steam"
        },
        r"Update complete, launching Steamcmd": {
            "status": ServerStatus.UPDATING,
            "message": "Update complete, launching Steamcmd"
        },
        r"Installing mods": {
            "status": ServerStatus.INSTALLING_MODS,
            "message": "Installing Server Mods"
        },
        r"Registering lobby": {
            "status": ServerStatus.REGISTERING,
            "message": "Registering Server Lobby with Valheim Master Server"
        },
        r"Game server connected": {
            "status": ServerStatus.RUNNING,
            "message": "Server is Running and Connected to Master Server"
        },
    }

    # def __init__(self):
    #     self.statuses = []

    # @property
    # def status(self):
    #     return self.statuses[-1] if self.statuses else None

    def parse(self, line: str):
        for pattern, status_content in self.status_pattern.items():
            if re.search(pattern, line):
                print(f"LINE: {line}")
                content = status_content.copy()
                content['line'] = line.strip()
                timestamp = re.search(r"^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(.*)", line.strip())
                if timestamp:
                    content['timestamp'] = timestamp.group(1)
                else:
                    content['timestamp'] = datetime.datetime.now().isoformat()
                return content['status'], content
        return None, None
