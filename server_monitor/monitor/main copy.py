import docker

print('RUNNING')

TARGET_IMAGES = {
    "mbround18/valheim:3",
}

print(f"Target images: {TARGET_IMAGES}")

client = docker.from_env()
print(f"Connected to Docker: {client.ping()}")

for container in client.containers.list():
    if any(tag in TARGET_IMAGES for tag in container.image.tags):
        print(
            f"{container.name} | "
            f"{container.status} | "
            f"{container.image.tags}"
        )

for event in client.events(decode=True):
    print(event["Type"], event["Action"])
