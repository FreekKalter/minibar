from bs4 import BeautifulSoup
import requests
from datetime import datetime
import re
import sys
import time

url = "http://www.grolschwkactie.nl"
cookies = dict(age='26')
timeformat = "%a %d-%m %H:%M"
# look into requests.Session()

def get_participants():
    try:
        r = requests.get(url, cookies=cookies)
    except Exception as e:
        print e
    soup = BeautifulSoup(r.text)
    par = soup.find("span", "participants").string
    return par.lstrip('0')

def write_new_participants(l, par):
    d = datetime.utcnow()
    l.append(d.strftime(timeformat) + " | " + str(par) + '\n')
    with open('out.log', 'w') as out:
        out.writelines(lines)

lines = []
try:
    with open('out.log', 'r') as log:
        lines = log.readlines()
except IOError as e:
    write_new_participants(lines,get_participants())

print datetime.utcnow().strftime(timeformat)
highpar = -1
for i in range(18):
    if i != 0:
        time.sleep(20-i)
    par = get_participants()
    try:
        if int(par) > highpar:
            highpar = int(par)
            print highpar
        elif int(par) < highpar:
            print "number of times checked before exiting: " + str(i)
            break
    except ValueError:
        print "par at moment of exception: " + par
        continue

if highpar >= 0:
    print("writing: ", highpar)
    write_new_participants(lines, highpar)
print "----------------------------------------"
