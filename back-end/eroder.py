from settings import APP_STATIC
import os
import re
import time
from random import randint
import requests


def read_state():
    filenameWithPath = os.path.join(APP_STATIC, 'historyState.txt')
    with open(filenameWithPath, 'r') as f:
        fileContents = f.read()

    # if there is no more history then exit
    if '1' not in fileContents:
        print 'no more aces'
        exit()

    fileContents = re.sub(r'\s*', r'', fileContents)
    fileContents = list(fileContents)
    fileContents = [int(i) for i in fileContents]

    return fileContents


def delete_word(fileContents, position):
    position = int(position)
    fileContents[position] = 0

    result = ''
    for i in fileContents:
        result += str(i)

    filenameWithPath = os.path.join(APP_STATIC, 'historyState.txt')
    with open(filenameWithPath, 'w') as f:
        f.write(result)

    lastWordFilenamePath = os.path.join(APP_STATIC, 'lastWord.txt')
    r = requests.get('http://localhost:90/getTermAt/' + str(position))
    with open(lastWordFilenamePath, 'w') as f:
        f.write(r.content)

    lastWordFilenamePath = os.path.join(APP_STATIC, 'lastWordTimeStamp.txt')
    localtime = time.asctime(time.localtime(time.time()))
    with open(lastWordFilenamePath, 'w') as f:
        f.write(localtime)


def main():
    while True:
        fileContents = read_state()

        randomPositionInFile = randint(0, len(fileContents) - 1)
        while fileContents[randomPositionInFile] == 0:
            randomPositionInFile = randint(0, len(fileContents) - 1)
        fileContents[randomPositionInFile] = 0

        delete_word(fileContents, randomPositionInFile)

        durationOfSleep = 300
        print 'sleeping for: ' + str(durationOfSleep) + ' seconds'
        time.sleep(durationOfSleep)


if __name__ == '__main__':
    main()
