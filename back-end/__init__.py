from flask import Flask
from classes import History
from xmlReader import xmlReader
from flask.ext.script import Manager
from settings import APP_STATIC
import os
import json
from flask.ext.cors import CORS
from eroder import delete_word, read_state

app = Flask(__name__)
cors = CORS(app)
#  CORS(app, resources=r'/*', headers='Content-Type')

manager = Manager(app)
reader = xmlReader('web_history.xml')
global historyList
historyList = reader.getData()
global historyObj
historyObj = History(historyList)


#  enable file logging for debugging
if app.debug is not True:
    import logging
    from logging.handlers import RotatingFileHandler
    file_handler = RotatingFileHandler('python.log', maxBytes=1024 * 1024 * 100,
                                       backupCount=20)
    file_handler.setLevel(logging.ERROR)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    file_handler.setFormatter(formatter)
    app.logger.addHandler(file_handler)


@app.route('/')
def index():
    return '<h1>Hello master!</h1>'


@app.route('/history/')
def history():
    filenameWithPath = os.path.join(APP_STATIC, 'historyState.txt')

    def readHistoryState():
        with open(filenameWithPath, 'r') as f:
            fileContents = f.read()
        #  return ('file entries: ' + str(len(fileContents)) +
        #  '  data objects:' + str(historyObj.getNumberOfEntries()))

        #  if file is corrupted by write process
        if len(fileContents) == historyObj.getNumberOfEntries():
            return fileContents
        else:
            return ''
    historyStateString = readHistoryState()

    historyDict = {}
    historyDict['noOfEntries'] = len(historyStateString)
    historyDict['historyState'] = historyStateString
    resultsJSON = json.dumps(historyDict)

    return(resultsJSON)


@app.route('/simplerHistory/')
def simplerHistory():
    filenameWithPath = os.path.join(APP_STATIC, 'historyState.txt')

    def readHistoryState():
        with open(filenameWithPath, 'r') as f:
            fileContents = f.read()
        #  return ('file entries: ' + str(len(fileContents)) +
        #  '  data objects:' + str(historyObj.getNumberOfEntries()))

        #  if file is corrupted by write process
        if len(fileContents) == historyObj.getNumberOfEntries():
            return fileContents
        else:
            return ''

    historyStateString = readHistoryState()

    return (historyStateString + '\n')


@app.route('/lastWordTimeStamp/')
def lastWordTimeStamp():
    filenameWithPath = os.path.join(APP_STATIC, 'lastWordTimeStamp.txt')

    def getTimeStamp():
        with open(filenameWithPath, 'r') as f:
            fileContents = f.read()
            return fileContents

    timeStamp = getTimeStamp()

    return timeStamp


@app.route('/lastWord/')
def lastWord():
    filenameWithPath = os.path.join(APP_STATIC, 'lastWord.txt')

    def getLastWord():
        with open(filenameWithPath, 'r') as f:
            fileContents = f.read()
            return fileContents

    lastWord = getLastWord()

    return lastWord


@app.route('/lastWordJS/')
def lastWordJS():
    filenameWithPath = os.path.join(APP_STATIC, 'lastWord.txt')

    def getLastWord():
        with open(filenameWithPath, 'r') as f:
            fileContents = f.read()
        return fileContents

    lastWord = getLastWord()

    return lastWord


@app.route('/getTermAt/<position>')
def getTermAt(position):
    result = historyObj.getTermAt(position)
    return result


@app.route('/deleteTermAt/<position>')
def deleteTermAt(position):
    fileContents = read_state()
    delete_word(fileContents, position)
    return ''

@app.route('/search/<term>')
def search(term):
    (resultCoords, resultTerms) = historyObj.searchForTerm(term)
    result = '<p>'
    for t in resultTerms:
        result = result + t.string + '<br>'
    result = result + '</p>'

    return result


if __name__ == '__main__':
    manager.run()
