import os
import docker
import threading
import json
from dataclasses import dataclass, field
from enum import Enum
from parsers.common import BaseParser, ServerStatus
from parsers.valheim import ValheimParser
from datetime import datetime, timezone



LABEL = "server_monitor.enabled=true"
SHARED_STORAGE = os.path.join(
    '/app',
    'storage',
)


class ContainerStatus(Enum):
    RUNNING = "running"
    STOPPED = "stopped"
    UNKNOWN = "unknown"

@dataclass
class TrackedContainer:
    container: docker.models.containers.Container
    parser: BaseParser

    thread: threading.Thread | None = field(init=False, default=None)

    container_status: ContainerStatus
    server_status_list: list = field(init=False, default_factory=list)

    @property
    def server_status(self):
        if self.server_status_list:
            return self.server_status_list[-1]['status']
        return ServerStatus.UNKNOWN

    def start(self):
        if self.thread is None or not self.thread.is_alive():
            self.thread = threading.Thread(
                target=self._watch_logs,
                # args=(self.container,),
                daemon=True,
            )
            self.thread.start()
        else:
            print(f"Thread for container {self.container.id} is already running.")
        self.container_status = ContainerStatus.RUNNING

    def stop(self):
        raise NotImplementedError("Stopping threads is not implemented. You would need to implement a stopping mechanism.")

    def _watch_logs(self):
        save_change = False
        try:
            for line in self.container.logs(stream=True, follow=True):
                server_status, status_content = self.parser.parse(line.decode())
                if server_status and (server_status.name != self.server_status.name):
                    save_change = True
                if server_status:
                    self.server_status_list.append(status_content)
                if save_change:
                    self._save_current_state()
                    save_change = False
        finally:
            self.thread = None
            self.container_status = ContainerStatus.STOPPED

    def _save_current_state(self):
        server_status_list = []
        for ssl in self.server_status_list:
            server_status_list.append({
                "status": ssl['status'].name,
                "message": ssl['message'],
                "line": ssl['line'],
                "timestamp": ssl['timestamp'],
            })
        state = {
            "container_id": self.container.id,
            "container_status": self.container_status.value,
            "game_name": self.parser.game_name,
            "server_status_list": server_status_list,
        }
        path = os.path.join(
            SHARED_STORAGE,
            f"{self.container.id}_state.json"
        )
        with open(path, "w") as f:
            json.dump(state, f, indent=4)


def initialize():
    client = docker.from_env()
    tracked = {}

    for container in client.containers.list(filters={"label": LABEL}):
        tracked[container.id] = TrackedContainer(
            container=container,
            parser=ValheimParser(),
            container_status=ContainerStatus.RUNNING,
        )
        tracked[container.id].start()

    for file_path in os.listdir(SHARED_STORAGE):
        print(f"FILE PATH: {file_path}")
        if file_path.replace("_state.json", '') not in tracked:
            # Ensure its been marked Closed
            with open(os.path.join(SHARED_STORAGE, file_path)) as jf:
                content = json.load(jf)
                print(json.dumps(content, indent=4))
                content['container_status'] = ContainerStatus.STOPPED.value
                content['server_status_list'].append({
                    "status": ServerStatus.STOPPED.name,
                    "message": "Server has been shut down",
                    "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
                })
                with open(os.path.join(SHARED_STORAGE, file_path), "w") as f:
                    json.dump(content, f, indent=4)

    return client, tracked

def watch_containers(client, tracked):
    for event in client.events(
        decode=True,
        filters={
            "type": "container",
            "label": LABEL,
        },
    ):
        cid = event['Actor']["ID"]
        action = event["Action"]

        if action in ['start', 'create']:
            if cid not in tracked:
                tracked[cid] = TrackedContainer(
                    container=client.containers.get(cid),
                    parser=ValheimParser(),
                    container_status=ContainerStatus.RUNNING,
                )
                tracked[cid].start()

if __name__ == "__main__":
    client, tracked = initialize()
    watch_containers(client, tracked)
