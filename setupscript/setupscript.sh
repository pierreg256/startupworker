#!/bin/sh

PROJ_DIR=$(sudo mktemp -d /opt/myapp.XXXXX)
sudo chmod 777 $PROJ_DIR

sudo rm -rf /opt/myapp
sudo ln -s $PROJ_DIR /opt/myapp


sudo apt-get install -y git nodejs npm 

cd $PROJ_DIR
git clone https://github.com/pierreg256/startupworker.git
cd ./startupworker/worker/worker

sudo npm install

sudo touch sampleapp.service
sudo chmod 777 sampleapp.service 

### Make a SystemV service 
cat << 'EOF' >> sampleapp.service
#!/bin/sh
### BEGIN INIT INFO
# Provides:          sampleapp
# Required-Start:    $local_fs $network $named $time $syslog
# Required-Stop:     $local_fs $network $named $time $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Description:       <DESCRIPTION>
### END INIT INFO

SCRIPT="/usr/bin/nodejs /opt/myapp/startupworker/worker/worker/app.js"
RUNAS=root

PIDFILE=/var/run/sampleapp.pid
LOGFILE=/var/log/sampleapp.log

start() {
  if [ -f $PIDFILE ] && kill -0 $(cat $PIDFILE); then
    echo 'Service already running' >&2
    return 1
  fi
  echo 'Starting serviceâ€¦' >&2
  local CMD="$SCRIPT &> \"$LOGFILE\" & echo \$!"
  su -c "$CMD" $RUNAS > "$PIDFILE"
  echo 'Service started' >&2
}

stop() {
  if [ ! -f "$PIDFILE" ] || ! kill -0 $(cat "$PIDFILE"); then
    echo 'Service not running' >&2
    return 1
  fi
  echo 'Stopping serviceâ€¦' >&2
  kill -15 $(cat "$PIDFILE") && rm -f "$PIDFILE"
  echo 'Service stopped' >&2
}

uninstall() {
  echo -n "Are you really sure you want to uninstall this service? That cannot be undone. [yes|No] "
  local SURE
  read SURE
  if [ "$SURE" = "yes" ]; then
    stop
    rm -f "$PIDFILE"
    echo "Notice: log file is not be removed: '$LOGFILE'" >&2
    update-rc.d -f sampleapp remove
    rm -fv "$0"
  fi
}

case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  uninstall)
    uninstall
    ;;
  retart)
    stop
    start
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|uninstall}"
esac

EOF

sudo mv -v sampleapp.service "/etc/init.d/sampleapp" 
sudo touch "/var/log/sampleapp.log"  
sudo update-rc.d sampleapp defaults 
sudo service sampleapp start 


