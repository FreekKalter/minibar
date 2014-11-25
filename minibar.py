#!/usr/bin/env python
from __future__ import print_function
from bs4 import BeautifulSoup
import requests
from datetime import datetime
import re
import sys
import time
import argparse
from pytz import timezone
import pytz

url = "http://www.grolschwkactie.nl"
RFC1123 = "%a, %d %b %Y %H:%M:%S %Z"
utc = pytz.utc
session = requests.Session()
a = requests.adapters.HTTPAdapter(max_retries=5)
session.mount('http://',a)
session.cookies = requests.utils.cookiejar_from_dict(dict(age='26'))

def get_participants():
    try:
        r = session.get(url)
    except Exception as e:
        print("CONNECTION EXCEPTION")
        print(e)
    soup = BeautifulSoup(r.text)
    try:
        par = soup.find("span", "participants").string
    except AttributeError as e:
        print(e)
        sys.exit(1)
    return par.lstrip('0')

def write_new_participants(l, par):
    d = utc.localize(datetime.utcnow())
    l.append(d.strftime(RFC1123) + " | " + str(par) + '\n')
    with open('out.log', 'w') as out:
        out.writelines(lines)

def main():
    parser = argparse.ArgumentParser(description='scrape website for submission statistics')
    parser.add_argument('-o','--output', default="./out.log")
    args = parser.parse_args()
    lines = []
    try:
        with open(args.output, 'r') as log:
            lines = log.readlines()
    except IOError as e:
        write_new_participants(lines,get_participants())

    print(utc.localize(datetime.utcnow()).strftime(RFC1123))
    highpar = -1
    for i in range(18):
        if i != 0:
            time.sleep(20-i)
        par = get_participants()
        try:
            if int(par) > highpar:
                highpar = int(par)
                print(highpar)
            elif int(par) < highpar:
                print("number of times checked before exiting: " + str(i))
                break
        except ValueError as e:
            print(e)
            continue

    session.close()
    if highpar >= 0:
        print("writing: "+ str(highpar))
        write_new_participants(lines, highpar)
    print("----------------------------------------")

if __name__ == "__main__":
    main()
