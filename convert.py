from __future__ import print_function
from datetime import datetime
from pytz import timezone
import pytz

utc = pytz.utc

with open('out.log', 'r') as input, open('out_converted.log', 'w') as output:
    oldformat = "%a %d-%m %H:%M %Y"
    #RFC1123     = "Mon, 02 Jan 2006 15:04:05 MST"
    RFC1123 = "%a, %d %b %Y %H:%M:%S %Z"
    for line in input:
        t = line.split("|")[0].strip()
        t += " 2014"
        c = utc.localize(datetime.strptime(t, oldformat))
        print(c.strftime(RFC1123))
        output.write(c.strftime(RFC1123) + " |" + line.split("|")[1])
