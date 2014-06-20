#
# Nginx Dockerfile
#
# https://github.com/dockerfile/nginx
#
FROM ubuntu:13.10

# Update OS.
RUN echo "deb http://archive.ubuntu.com/ubuntu saucy main" > /etc/apt/sources.list
RUN echo "deb http://archive.ubuntu.com/ubuntu saucy-updates main" >> /etc/apt/sources.list
RUN echo "deb http://security.ubuntu.com/ubuntu saucy-security main universe" >> /etc/apt/sources.list
RUN echo "deb http://archive.ubuntu.com/ubuntu saucy universe" >> /etc/apt/sources.list
RUN echo "deb http://archive.ubuntu.com/ubuntu saucy-updates universe" >> /etc/apt/sources.list

RUN apt-get update
RUN apt-get upgrade -y

# Install basic packages.
RUN apt-get install -y software-properties-common
RUN apt-get install -y curl git htop unzip vim wget

ADD webapp /webapp
RUN chmod +x /webapp

ADD js /js
ADD css /js
ADD index.html index.html

EXPOSE 5000

ENTRYPOINT ["/webapp"]
