Minibar
=======

The dutch beer brand Grolsch has a promotion about once a year. During this promotion they give away some item every hour.
To participate you have to enter a special unique code (wich you get when you buy some beer obviously) on their website.
The give something away at the end of every hour, 24 hours a day. And on the website you can see how many people have entered
a code that peticular hour.

I wanted to know what the best time would be to enter my code. The fewer people have entered their code, the higher my changes of
winning. I decided to write a script that checks at the end of every hour how many codes have been entered, they show a counter
of this number on the site where you ennter your code.

This resulted in the python script minibar.py, which i run every hour with cron on a server that is always on. It simply logs
the time, and the number on players on a new line.
After let this run for a while i quickly noticed that to make this data useful a had to plot it somehow.

So that resulted in the webapp wich is written in go. The go part is minimal, it just reads the log file created by the python script
and sends in a ordered json form to the javascript side of the webapp.
The client side of the webapp uses d3.js to plot the data in grouped bars. For every hour a group of 7 bars represet the days. Now you
can quickly see wich hour of wich day you have the best change of winning.
