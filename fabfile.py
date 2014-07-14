from fabric.api import *
env.ssh_config_path = '/var/lib/jenkins/.ssh/config'
env.use_ssh_config = True
env.hosts.extend(['fkalter@km-app.kalteronline.org'])

deploypath = '/home/fkalter/minibar-deploy'

def deploy():
    build()
    local('docker push freekkalter/wkiw-app')

    run('docker pull freekkalter/wkiw-app')

    # do some shit that may fail, but only fails cause its already done
    with settings(hide('warnings'), warn_only=True):
        run('docker run -d -t -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock \
                --name=nginx_proxy jwilder/nginx-proxy')
        run('docker kill wkiw-app')
        run('docker rm wkiw-app')

    run('docker run -d -e VIRTUAL_HOST=wanneerkanikwinnen.nl\
            -v /home/fkalter/minibar-deploy:/logdir\
            -v /home/fkalter/minibar-nginx-log/:/var/log/nginx\
            --name=wkiw-app freekkalter/wkiw-app')

def local_run():
    build()
    with settings(hide('warnings'), warn_only=True):
        local('docker kill wkiw-app')
        local('docker rm wkiw-app')

    local('docker run -d -v /home/fkalter/github/minibar:/logdir -v /home/fkalter/github/minibar/nginx-log:/var/log/nginx --name=wkiw-app  -p 8000:80 freekkalter/wkiw-app')

def build():
    local('make all')

    local('docker build -t freekkalter/wkiw-app .')

