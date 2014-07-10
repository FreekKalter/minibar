from fabric.api import *
env.ssh_config_path = '/var/lib/jenkins/.ssh/config'
env.use_ssh_config = True
env.hosts.extend(['fkalter@km-app.kalteronline.org'])

deploypath = '/home/fkalter/minibar-deploy'
def deploy():
    # build webapp
    with lcd('webapp'):
        local('go build')

    # prepare remote env
    run('mkdir -p '+deploypath)
    put('minibar.conf', '/etc/init', use_sudo=True)
    sudo('chown root:root /etc/init/minibar.conf')
    sudo('chmod u=rw,o=,g= /etc/init/minibar.conf')

    # upload files
    put('minibar.py', deploypath )

    # dirty fucking hack, putting of local webapp does not work
    # if remote file has different permission, so delete it first
    run('rm '+deploypath+'/webapp/webapp')
    put('webapp', deploypath )
    run('chmod +x '+deploypath+'/webapp/webapp')

    # restart service
    sudo('service minibar restart')

def container_deploy():
    with lcd('webapp'):
        local('go build')

    local('docker build -t freekkalter/wkiw .')
    local('docker push freekkalter/wkiw')

    run('docker pull freekkalter/wkiw')

    # run nginx-proy, dont panic if it is already running
    with settings(hide('warnings'), warn_only=True):
        run('docker run -d -t -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock \
                --name=nginx_proxy jwilder/nginx-proxy')
        run('docker kill wkik_nl')

    run('docker run -d -e VIRTUAL_HOST=wanneerkanikwinnen.nl -v /home/fkalter/minibar-deploy:/logdir\
            --name=wkik_nl freekkalter/wkiw')

