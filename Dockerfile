FROM freekkalter/wkiw-docker-base

# setup app
RUN mkdir /app
WORKDIR /app
ADD ./webapp/ /app
ADD ./config.json /app/config.json
RUN chmod +x /app/webapp

