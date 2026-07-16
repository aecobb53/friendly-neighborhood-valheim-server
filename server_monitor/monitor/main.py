import docker
import threading
from dataclasses import dataclass, field
import json
from enum import Enum
from parsers.common import BaseParser
from parsers.valheim import ValheimParser
import re



LABEL = "server_monitor.enabled=true"


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
        return self.server_status_list[-1] if self.server_status_list else None

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
        try:
            for line in self.container.logs(stream=True, follow=True):
                server_status, status_content = self.parser.parse(line.decode())
                if server_status:
                    self.server_status_list.append(status_content)
        finally:
            self.thread = None
            self.container_status = ContainerStatus.STOPPED


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
            # print(f"Container {cid} {action} is starting")
            if cid not in tracked:
                tracked[cid] = TrackedContainer(
                    container=client.containers.get(cid),
                    parser=ValheimParser(),
                    container_status=ContainerStatus.RUNNING,
                )
                tracked[cid].start()

# def watch_logs(container):
#     for line in container.logs(stream=True, follow=True):
#         # parser.parse(line.decode())
#         # print(container, line)
#         print(container)


client, tracked = initialize()
watch_containers(client, tracked)
