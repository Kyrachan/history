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
var serverAddress = 'http://83.212.114.31:90';
var searchTermIdx=-1;
var searchTermLocX=-300;
var searchTermLocY=-300;
var totalErased = 0;
var lastWord = "";
var lastWordTimeStamp = "";
var autoSelectFrequency = 80; //smaller means faster

function setup() {
  createCanvas(windowWidth, windowHeight);
  var historyAddress = serverAddress.concat("/simplerHistory/");
  tempHistoryState = loadStrings(historyAddress, getHistoryState);
  
  var lastWordAddress = serverAddress.concat("/lastWord/");
  tempLastWord = loadStrings(lastWordAddress, getLastWord);

  var lastWordTimeStampAddress = serverAddress.concat("/lastWordTimeStamp/");
  tempLastWordTimeStamp = loadStrings(lastWordTimeStampAddress, getLastWordTimeStamp);
  
//  var historyAddressLastWord = serverAddress.concat("/history/");
//  tempHistoryState2 = loadStrings(historyAddress2, getHistoryState);
  //result = loadStrings("http://83.212.114.31:90/getTermAt/40", callback);
};

function draw() {
  background(0);

  drawHistoryState();
  drawTermUnderMouse();
  textSize(50);
  fill(255);
  
  if (frameCount%autoSelectFrequency==0 && frameCount>0)
  {
	  autoSelect();
	  //fill(255,0,0);
	  //rect(100,100,400,400);
  }
  //text(currentTermUnderMouse,mouseX, mouseY);
  //getTermUnderMouse();


  //result = loadStrings(termAtAddress, callback);
};

//***** AUTOSELECT TERM *******//
function autoSelect() {

  var tempTermIdx;
  var termIsPresent;

  do {
       tempTermIdx  = int(random(noOfEntries));
	   termIsPresent = historyStateString.charAt(tempTermIdx);
  }
  while (termIsPresent=='0')

  if (termIsPresent)
  {
     searchTermIdx = tempTermIdx;
	 if (searchTermIdx != prevTermIndex)
	 {
		var termAtAddress = serverAddress.concat("/getTermAt/");
		termAtAddress = termAtAddress.concat(String(searchTermIdx));
		result = loadStrings(termAtAddress, getTermAtCallback);
	  }
	  else
	  {
		currentTermUnderMouse = previousTermUnderMouse;
	  }
   }
 
  prevTermIndex = searchTermIdx;
}

//***** DRAW HISTORY STATE *****//
function drawHistoryState()
{
	noStroke();

    for (x=0; x<entriesPerRow; x++)
    {
		for (y=0; y<entriesPerColumn; y++)
		{
			var tempIndex = (y * entriesPerRow)+x;
			
			locX = Math.floor(x * entrySideLength + leftMargin);
			locY = Math.floor(y * entrySideLength + topMargin);
			
			if (historyStateString.charAt(tempIndex) == '0' || ((y * entriesPerRow)+x)>noOfEntries)
			{
				/*** do nothing ***/
			}
			else if (tempIndex == searchTermIdx)
			{
				fill(255,0,0);
				rect(locX, locY, entrySideLength, entrySideLength);
			}
			else
			{
				fill(255);
				rect(locX, locY, entrySideLength, entrySideLength);
			}
		}
	}
	
	//statistics printer at the bottom left side of the page
	fill(255);
	textSize(15);
	statString = totalErased + " / " + historyStateString.length + " deleted";
	bottomPos = Math.floor(entriesPerColumn * entrySideLength + topMargin) + 20;
	//text(statString, windowWidth - textWidth(statString)*2, bottomPos);
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
function getHistoryState()
{
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
function getLastWord()
{
  lastWord = tempLastWord;
};

//***** GET LAST WORD TIME STAMP *****//
function getLastWordTimeStamp()
{
  lastWordTimeStamp = tempLastWordTimeStamp;
};

//***** GET TERM UNDER MOUSE *****//
function mousePressed()
{
  var tempTermIdx  = convertMouseToLinear(mouseX, mouseY);
  
  if (tempTermIdx<=noOfEntries)
  {
	var termIsPresent = historyStateString.charAt(tempTermIdx);

    if (termIsPresent == '1') //if it's present
    {
       searchTermIdx = tempTermIdx;
	   if (searchTermIdx != prevTermIndex)
	   {
			var termAtAddress = serverAddress.concat("/getTermAt/");
			termAtAddress = termAtAddress.concat(String(searchTermIdx));
			result = loadStrings(termAtAddress, getTermAtCallback);
		}
		else
		{
			currentTermUnderMouse = previousTermUnderMouse;
		}
	}
  }
  prevTermIndex = searchTermIdx;
};

//***** GET TERM AT *****//
function getTermAtCallback()
{
	currentTermUnderMouse = result;

	searchTermLocX = searchTermIdx % entriesPerRow;
	searchTermLocX = (searchTermLocX * entrySideLength) + leftMargin + entrySideLength;
				
	searchTermLocY = Math.ceil(searchTermIdx / entriesPerRow);
	searchTermLocY = searchTermLocY * entrySideLength + topMargin;
}

//***** DRAW TERM UNDER MOUSE *****//
function drawTermUnderMouse()
{
   fill(0);
   textSize(30);
   var requiredWidth = textWidth(currentTermUnderMouse)+20;
   
   if (searchTermLocX+requiredWidth > windowWidth) //if blue box goes out one side then place it on the other side of box
   {
		searchTermLocX = searchTermLocX - requiredWidth - entrySideLength;
   }
   else
   {
	   rect(searchTermLocX, searchTermLocY-32, requiredWidth, 50);
	   fill(255);
	   noStroke();
	   text(currentTermUnderMouse, searchTermLocX+10, searchTermLocY);
   }
}

//***** CONVERT MOUSE COORDS TO LINEAR INDEX *****//
function convertMouseToLinear(mX, mY)
{
  var convertedX = Math.floor((mX-leftMargin) / entrySideLength);
  var convertedY = Math.floor((mY-topMargin) / entrySideLength);

  return (convertedY * entriesPerRow) + convertedX;
}
