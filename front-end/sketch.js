var noOfEntries = 0;
var historyStateString = "empty";
var historyStateArray = [];
var entrySurfaceArea;
var entrySideLength;
var entriesPerRow;
var entriesPerColumn;
var tempHistoryState;
var topMargin;
var leftMargin;
var prevTermIndex = -2;
var previousTermUnderMouse = "";
var currentTermUnderMouse="";
var serverAddress = 'http://83.212.114.31:90'; //switch to 90 for flask dev server 99 for gunicorn
//var serverAddress = 'http://127.0.0.1:8000';
var lastWordTimeStampAddress = serverAddress.concat("/lastWordTimeStamp/");
var lastWordAddress = serverAddress.concat("/lastWord/");
var historyAddress = serverAddress.concat("/simplerHistory/");
var searchTermIdx=-1;
var searchTermLocX=-300;
var searchTermLocY=-300;
var totalErased = 0;
var lastWord = "";
var lastWordTimeStamp = "";
var autoSelectFrequency = 80; //smaller means faster
var reloadHistoryFrequency = 553; //smaller means faster (every 888 frames check if history changed - about 1.7 mins on my machine)

function setup() {
    createCanvas(windowWidth, windowHeight);

    tempHistoryState = loadStrings(historyAddress, getHistoryState);
    tempLastWord = loadStrings(lastWordAddress, getLastWord);
    tempLastWordTimeStamp = loadStrings(lastWordTimeStampAddress, getLastWordTimeStamp);

    background(0);
};

function draw() {
    drawHistoryState();
    drawTermUnderMouse();
    drawInfoButton();

    textSize(50);
    fill(255);
    textFont('Roboto Slab');

    if (frameCount%autoSelectFrequency==0 && frameCount>0) {
        autoSelect();
        //fill(255,0,0);
        //rect(100,100,400,400);
    }

    if (frameCount%reloadHistoryFrequency==0 && frameCount>0) {
        tempHistoryState = loadStrings(historyAddress, getHistoryState);
        getHistoryState();
        tempLastWord = loadStrings(lastWordAddress, getLastWord);
        tempLastWordTimeStamp = loadStrings(lastWordTimeStampAddress, getLastWordTimeStamp);
    }
};

//***** INFO BUTTON *******//
function drawInfoButton() {
    var distance = dist(mouseX, mouseY, width-30, height-30);
    //if the distance is less than the circle's radius
    if(distance < 14) {
        isOverCircle = true;
    } else {
        isOverCircle = false;
    }

    //draw a circle
    //ellipseMode(CENTER);

    if(isOverCircle == true) {
        cursor(HAND);
        drawRevealText();
    } else {
        cursor(ARROW);
    }

    //fill(255);
    //ellipse(200, 200, 100, 100);
    fill(255);
    //noStroke();
    smooth();
    ellipse(width-30, height-30, 28, 28);
    fill(0);
    textSize(23);
    textFont('Roboto Slab');
    text ("i",width-34, height-22);
}

//***** REVEAL TEXT *******//
function  drawRevealText(){
    s = "This website is part of the interactive installation: Deletion process_Only you can see my history. The work comments on digital privacy, the right to be forgotten and the control and distribution of personal data. The work is based on the artist's Google search history between 2008 and 2013. Most of these searches are personal and rather banal, at the same time however, this search history composes a rich and detailed user profile on Google's data centers. 10.650 terms which the artist searched for during the last eight years, have been downloaded from her personal search history, stored locally and depicted as white squares on a webpage. An eroding process accesses this search history and deletes one random word for ever, turning the respective white square into a black one. At the same time the deleted word is printed on paper turning the digital archive into a physical one. At the end of the process all terms will have been deleted and this webpage will be completely black. The printed paper will be the only remnant of the personal web search history. The installation was presented in May 2015 in Athens Digital Art Festival. For more information on kyriakigoni.com";

    textSize(18);

    textFont('Roboto Slab');
    fill(0);
    rect(width/3,height/3,740, 350);
    fill(255,255,255);
    //fill(255);
    textLeading(20);

    text(s, width/3+20,height/3+20, 710, 310); // Text wraps within text box
}

//***** AUTOSELECT TERM *******//
function autoSelect() {
    var tempTermIdx;
    var termIsPresent;

    do {
       tempTermIdx  = int(random(noOfEntries));
       termIsPresent = historyStateString.charAt(tempTermIdx);
    }
    while (termIsPresent=='0')

    if (termIsPresent) {
       searchTermIdx = tempTermIdx;
       if (searchTermIdx != prevTermIndex) {
           var termAtAddress = serverAddress.concat("/getTermAt/");
           termAtAddress = termAtAddress.concat(String(searchTermIdx));
           result = loadStrings(termAtAddress, getTermAtCallback);
       } else {
           currentTermUnderMouse = previousTermUnderMouse;
       }
    }

    prevTermIndex = searchTermIdx;
}

//***** DRAW HISTORY STATE *****//
function drawHistoryState() {
    noStroke();

    for (x=0; x<entriesPerRow; x++) {
        for (y=0; y<entriesPerColumn; y++) {
            var tempIndex = (y * entriesPerRow)+x;

            locX = Math.floor(x * entrySideLength + leftMargin);
            locY = Math.floor(y * entrySideLength + topMargin);

            if (historyStateString.charAt(tempIndex) == '0' || ((y * entriesPerRow)+x)>noOfEntries) {
                //fill it with black
                fill(0);
                rect(locX, locY, entrySideLength, entrySideLength);
            } else if (tempIndex == searchTermIdx) {
                fill(255,0,0);
                rect(locX, locY, entrySideLength, entrySideLength);
            } else {
                fill(255);
                rect(locX, locY, entrySideLength, entrySideLength);
            }
        }
    }

    //statistics printer at the bottom left side of the page
    textSize(15);
    statString = totalErased + " / " + historyStateString.length + " deleted";
    bottomPos = Math.floor(entriesPerColumn * entrySideLength + topMargin) + 20;
    //text(statString, windowWidth - textWidth(statString)*2, bottomPos);
    fill(0)
    rect(0, bottomPos-20, width, 400); //black square to refresh that part of the canvas
    fill(255);
    text(statString, 10, bottomPos);

    //last word stuff
    fill(255);
    textSize(15);
    lastWordString = "last deletion" + " on " + lastWordTimeStamp + ": " + lastWord ;
    bottomPos2 = Math.floor(entriesPerColumn * entrySideLength + topMargin) + 40;
    //text(lastWordString, windowWidth - textWidth(statString)*2, bottomPos2);
    text(lastWordString, 10, bottomPos2);
};

//***** GET HISTORY STATE *****//
function getHistoryState() {
    historyStateString = String(tempHistoryState);
    noOfEntries = historyStateString.length;

    entrySurfaceArea = Math.floor(windowWidth*windowHeight)/noOfEntries;
    entrySideLength = Math.floor(Math.sqrt(entrySurfaceArea)); //width and height of square representing each entry
    entriesPerRow = Math.floor(width/entrySideLength); //no of squares (each representing a search term) per row
    entriesPerColumn = Math.ceil(noOfEntries/entriesPerRow); //no of squares (each representing a search term) per column
    leftMargin = (windowWidth - entriesPerRow*entrySideLength) / 2;
    topMargin = (windowHeight - entriesPerColumn*entrySideLength) / 2;

    totalErased = (historyStateString.match(/0/g)||[]).length;
};

//***** GET LAST WORD *****//
function getLastWord() {
    lastWord = tempLastWord;
};

//***** GET LAST WORD TIME STAMP *****//
function getLastWordTimeStamp() {
    lastWordTimeStamp = tempLastWordTimeStamp;
};

//***** GET TERM UNDER MOUSE *****//
function mousePressed() {
    var tempTermIdx  = convertMouseToLinear(mouseX, mouseY);

    if (tempTermIdx<=noOfEntries) {
        var termIsPresent = historyStateString.charAt(tempTermIdx);

        if (termIsPresent == '1') {
            searchTermIdx = tempTermIdx;
            if (searchTermIdx != prevTermIndex) {
                var termAtAddress = serverAddress.concat("/getTermAt/");
                termAtAddress = termAtAddress.concat(String(searchTermIdx));
                result = loadStrings(termAtAddress, getTermAtCallback);
                var deleteAtAddress = serverAddress.concat("/deleteTermAt/");
                deleteAtAddress = deleteAtAddress.concat(String(searchTermIdx));
                loadStrings(deleteAtAddress, deleteTermAtCallback);
            } else {
                currentTermUnderMouse = previousTermUnderMouse;
            }
        }
    }
    prevTermIndex = searchTermIdx;
};

//***** GET TERM AT *****//
function getTermAtCallback() {
    currentTermUnderMouse = result;

    searchTermLocX = searchTermIdx % entriesPerRow;
    searchTermLocX = (searchTermLocX * entrySideLength) + leftMargin + entrySideLength;

    searchTermLocY = Math.ceil(searchTermIdx / entriesPerRow);
    searchTermLocY = searchTermLocY * entrySideLength + topMargin;
}

//***** DELETE TERM AT *****//
function deleteTermAtCallback() {
    tempLastWord = loadStrings(lastWordAddress, getLastWord);
    tempLastWordTimeStamp = loadStrings(lastWordTimeStampAddress, getLastWordTimeStamp);
    tempHistoryState = loadStrings(historyAddress, getHistoryState);
    drawHistoryState();
}

//***** DRAW TERM UNDER MOUSE *****//
function drawTermUnderMouse() {
    fill(0);
    rect(0, 0, width, topMargin);

    textSize(30);
    var requiredWidth = textWidth(currentTermUnderMouse)+20;

    //if blue box goes out one side then place it on the other side of box
    if (searchTermLocX+requiredWidth > windowWidth) {
        searchTermLocX = searchTermLocX - requiredWidth - entrySideLength;
    } else {
        rect(searchTermLocX, searchTermLocY-32, requiredWidth, 50);
        fill(255);
        noStroke();
        text(currentTermUnderMouse, searchTermLocX+10, searchTermLocY);
    }
}

//***** CONVERT MOUSE COORDS TO LINEAR INDEX *****//
function convertMouseToLinear(mX, mY) {
    var convertedX = Math.floor((mX-leftMargin) / entrySideLength);
    var convertedY = Math.floor((mY-topMargin) / entrySideLength);

    return (convertedY * entriesPerRow) + convertedX;
}
