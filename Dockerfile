FROM ubuntu:12.04
MAINTAINER Freek Kalter

# Install Nginx.
RUN apt-get update
RUN apt-get install -y python-software-properties wget

RUN apt-get update
RUN apt-get upgrade -y

RUN mkdir /app
WORKDIR /app
ADD ./webapp/ /app
ADD ./config.json /app/config.json
RUN chmod +x /app/webapp

EXPOSE 5000

CMD ["./webapp"]
