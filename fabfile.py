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
    put('webapp', deploypath )
    run('chmod +x '+deploypath+'/webapp/webapp')

    # restart service
    sudo('service minibar restart')
