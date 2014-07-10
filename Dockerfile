FROM ubuntu:12.04
MAINTAINER Freek Kalter

# Install Nginx.
RUN apt-get update
RUN apt-get install -y python-software-properties wget
RUN add-apt-repository -y ppa:nginx/stable
RUN apt-get update
RUN apt-get install -y nginx supervisor
#RUN apt-get upgrade -y

# setup nginx
RUN echo "daemon off;" >> /etc/nginx/nginx.conf
ADD nginx.conf /etc/nginx/sites-enabled/default

#fix for long server names
RUN sed -i 's/# server_names_hash_bucket/server_names_hash_bucket/g' /etc/nginx/nginx.conf

# setup app
RUN mkdir /app
WORKDIR /app
ADD ./webapp/ /app
ADD ./config.json /app/config.json
RUN chmod +x /app/webapp

# setup supervisord
RUN mkdir -p /var/log/supervisor
ADD supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/etc/init.d/supervisor", "start"]
