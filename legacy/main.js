function   changediv() 
{ 
tops.style.display= "block "; 
setTimeout( "hidediv() ",5000) 
} 
function   hidediv() 
{ 
tops.style.display= "none "; 
setTimeout( "newwin() ",3000) 
} 
function   newwin() 
{ 
window.open( "new.htm ", " ",width=500,height=100) 
} 
function   showfull() 
{ 
setTimeout( "changediv() ",3000) 
} 
showfull()