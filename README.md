# docker compose learning

This repository is for demo how to use docker compose


## demo with mongo and mongo-express

### 1 architecture diagram

![architecture](architecture.png)

### 2 with docker command

1. create bridge network for container communication

```shell
docker network create mongo-network
```

![network-created](network-created.png)

2. ls current network created

```shell
docker network ls
```
![network-ls](network-ls.png)

3. run mongo over mongo-network

```shell
docker run -d \
-p 27017:27017 \
-e MONGO_INITDB_ROOT_USERNAME=admin \
-e MONGO_INITDB_ROOT_PASSWORD=supersecret \
--network mongo-network \
--name mongodb \
mongo
```

![docker-mongo](docker-mongo.png)

![mongo-container](mongo-container.png)

4. run mongo-express over mongo-network

```shell
docker run -d \
-p 8081:8081 \
-e ME_CONFIG_MONGODB_ADMINUSERNAME=admin \
-e ME_CONFIG_MONGODB_ADMINPASSWORD=supersecret \
-e ME_CONFIG_MONGODB_SERVER=mongodb \
--network mongo-network \
--name mongo-express \
mongo-express
```

![mongo-express-container](mongo-express-container.png)

docker log for check mongo-express default user/password

![docker-log-for-mongo-express](docker-log-for-mongo-express.png)

![login-web-page](login-web-page.png)

### 3 with docker-compose 

1. create docker-compose.yml

```yaml
networks:
  mongo-network:
    driver: bridge
    name: mongo-network
services:
  mongodb:
    image: mongo:latest
    container_name: mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: supersecret
    networks:
      - mongo-network
    ports:
      - 27017:27017
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh mongodb://admin:supersecret@localhost:27017/ --quiet
      interval: 5s
      timeout: 10s
      retries: 3
  mongo-express:
    image: mongo-express:latest
    container_name: mongo-express
    environment:
      ME_CONFIG_MONGODB_ADMINUSERNAME: admin
      ME_CONFIG_MONGODB_ADMINPASSWORD: supersecret
      ME_CONFIG_MONGODB_SERVER: mongodb
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - mongo-network
    ports:
      - 8081:8081 
```

2. use docker compose command to start
```shell
docker compose up -d
```