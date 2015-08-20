import re
from classes import Datum
from classes import SearchTerm
import os
from settings import APP_STATIC


class xmlReader:
    def __init__(self, filename):
        with open(os.path.join(APP_STATIC, filename)) as f:
            content = f.read()
        dateConvDict = {"Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05",
                        "Jun": "06", "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10",
                        "Nov": "11", "Dec": "12"}
        self.totalHistory = []

        dates = re.findall(r'<DATE date=.*?</DATE>', content, re.DOTALL)

        for aDay in dates:
            #  prepare date
            dateStr = re.search(r'\w\w\w\s\d+,\s\d\d\d\d', aDay).group()
            tempDay = dateStr[4:dateStr.index(",")]
            if len(tempDay) == 1:
                tempDay = "0" + tempDay
            tempMonth = dateConvDict[dateStr[:3]]
            tempYear = dateStr[-4:]
            dateObj = Datum(int(tempDay), int(tempMonth), int(tempYear))

            #  prepare search terms, hours, min
            #  searchList = []
            terms = re.findall(r'<SEARCH term=.*"?>', aDay)
            for i in range(len(terms)):
                cleanTerm = re.search(r'term=".*?"', terms[i]).group()
                cleanTerm = cleanTerm[6:-1]
                hours = re.search(r'hour="\d*?"', terms[i]).group()[6:-1]
                mins = re.search(r'min="\d*?"', terms[i]).group()[5:-1]
                termObj = SearchTerm(cleanTerm.lower(), int(hours), int(mins))
                dateObj.terms = dateObj.terms + [termObj]

            #  update results list
            self.totalHistory = self.totalHistory + [dateObj]

    def getData(self):
        return self.totalHistory
