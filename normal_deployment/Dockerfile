# Start with Ubuntu base image
FROM ubuntu:20.04

# Set environment variables to avoid prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Update and install essential packages
RUN apt-get update && apt-get install -y \
    vim \
    nano \
    curl \
    wget \
    sudo \
    gnupg \
    software-properties-common \
    && rm -rf /var/lib/apt/lists/*

# Download and setup ClickHouse
RUN curl https://clickhouse.com/ | sh

# Ensure log directory exists and is writable
RUN mkdir -p /var/log/clickhouse-server && chmod -R 777 /var/log/clickhouse-server

# Copy custom config.xml
COPY config.xml /etc/clickhouse-server/config.xml

# Copy custom users.xml
COPY users.xml /etc/clickhouse-server/users.xml

# Expose default ClickHouse ports
EXPOSE 8123 9000