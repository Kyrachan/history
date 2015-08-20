from datetime import date, timedelta
import time
import re

class Datum:
  terms = []
  indexPos = 0
  def __init__(self, d, m, y):
    self.day = d
    self.month = m
    self.year = y
    self.date = date(y,m,d)

class SearchTerm:
  def __init__(self, s, h, m):
    self.string = s
    self.hour = h
    self.mins = m

class History:
  def __init__(self, datum):
    self.his=datum
    self.earliestDate, self.latestDate = self.getDateExtremes()
    self.rangeInDays = (self.latestDate - self.earliestDate).days

  def getDateExtremes(self):
    earliestDate = date(3000,1,1)
    latestDate = date(1900,1,1)
    for d in self.his:
      tempDate = date(d.year,d.month,d.day)
      if tempDate<earliestDate:
        earliestDate = tempDate
      if tempDate>latestDate:
        latestDate = tempDate
    return [earliestDate, latestDate]
  
  def distFromFirstEntryInDays(self, _d, _m, _y):
    delta = date(_y,_m,_d) - self.earliestDate
    return delta.days

  def distFromFirstEntryInFloat(self, _date):
    delta = _date - self.earliestDate
    return float(delta.days) / self.rangeInDays

  def distFromMidnightInFloat(self, _term):
    minSinceMidnight = _term.hour*60 + _term.mins
    return 1 - float(minSinceMidnight) / (24*60)

  def searchForTerm(self, _string):
    coordResults = []
    termResults = []
    for d in self.his:
      for t in d.terms:
        match = re.search(_string, t.string)
        if match:
            _distFirstEntry = self.distFromFirstEntryInFloat(d.date)
            _distMidnight = self.distFromMidnightInFloat(t)
            coordResults = coordResults + [(_distFirstEntry, _distMidnight)]
            termResults = termResults + [t]
    return (coordResults, termResults)

  def getTermAt(self, index):
    tempIndex = 0
    index = int(index)
    for d in self.his:
	  for t in d.terms:
	    if tempIndex == index:
		  return t.string
	    tempIndex = tempIndex + 1
    return str(tempIndex) + " " + str(index)

  def getNumberOfEntries(self):
	  totalSearchEntries = 0
	  for d in self.his:
		  for t in d.terms:
			  totalSearchEntries = totalSearchEntries + 1
	  return totalSearchEntries
