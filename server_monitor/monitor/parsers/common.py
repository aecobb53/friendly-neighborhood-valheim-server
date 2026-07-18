from enum import Enum


class ServerStatus(Enum):
    INITIALIZING = 'Initializing Server in Container'
    UPDATING = 'Updating Server from Steam'
    INSTALLING_MODS = 'Installing Server Mods'
    REGISTERING = 'Registering Server Lobby with Master Server'
    RUNNING = 'Server is Running'
    UNKNOWN = 'Unknown Server Status'
    STOPPED = 'Server is no longer used'


class BaseParser:
    game_name = "Unknown Game"
    def parse(self, line: str):
        raise NotImplementedError("Subclasses should implement this method.")
