.PHONY: all build run stop clean logs push publish install

# Variables
IMAGE_NAME = quay.io/ajayos/forti-tailscale-router
TAG ?= latest
CONTAINER_NAME = forti-tailscale-router

# Default target
all: build

# Install local dependencies for development (frontend)
install:
	@echo "Installing frontend dependencies..."
	cd web && npm install

# Build the Docker image
build:
	@echo "Building Docker image: $(IMAGE_NAME):$(TAG)"
	docker build -t $(IMAGE_NAME):$(TAG) .

# Run the container locally
run:
	@echo "Starting container: $(CONTAINER_NAME)"
	docker run -d \
		--name $(CONTAINER_NAME) \
		--cap-add=NET_ADMIN \
		--device /dev/net/tun \
		--device /dev/ppp \
		--privileged \
		--network host \
		-v tailscale-state:/var/lib/tailscale \
		-p 80:80 \
		-p 443:443 \
		$(IMAGE_NAME):$(TAG)

# Stop and remove the container
stop:
	@echo "Stopping and removing container..."
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

# View container logs
logs:
	docker logs -f $(CONTAINER_NAME)

# Push the Docker image to the registry
push:
	@echo "Pushing image to registry..."
	docker push $(IMAGE_NAME):$(TAG)

# Build and Push in one command
publish: build push
	@echo "Successfully built and published $(IMAGE_NAME):$(TAG)"

# Clean up local images and container
clean: stop
	@echo "Removing Docker image..."
	docker rmi $(IMAGE_NAME):$(TAG) || true
