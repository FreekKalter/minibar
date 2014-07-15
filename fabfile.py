from fabric.api import *
import hashlib
import shutil
from os import path
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
    build(all=True)
    with settings(hide('warnings'), warn_only=True):
        local('docker run -d -t -p 8000:80 -v /var/run/docker.sock:/tmp/docker.sock \
                --name=nginx_proxy jwilder/nginx-proxy')
        local('docker kill wkiw-app')
        local('docker rm wkiw-app')

    local('docker run -d -v /home/fkalter/github/minibar:/logdir\
            -v /home/fkalter/github/minibar/nginx-log:/var/log/nginx\
            -e VIRTUAL_HOST=localhost\
            --name=wkiw-app freekkalter/wkiw-app')

def build(all=False):
    local('make all')
    fingerprint_static()
    if all:
        with lcd('wkiw-docker-base'):
            local('docker build -t freekkalter/wkiw-docker-base .')
    local('docker build -t freekkalter/wkiw-app .')
    cleanup()

def cleanup():
    local('rm index.html')

def fingerprint_static():
    files = ['webapp/static/js/master.min.js', 'webapp/static/css/master.min.css']
    index = ''
    with open('webapp/index.html', 'r') as fh:
        index = fh.read()
    for f in files:
        (base, filename) = path.split(f)
        sha = hashlib.sha256()
        with open(f, 'r') as content:
            # calculate hash of filecontent
            sha.update(content.read())
            newname = path.join(base ,sha.hexdigest()[:10] + '-' + filename)
            # substitute filenames in index.html
            index = index.replace(f.replace('webapp/', ''), newname.replace('webapp/', ''))
            shutil.copy2(f, newname)

    with open('index.html', 'w') as fh:
        fh.write(index)
