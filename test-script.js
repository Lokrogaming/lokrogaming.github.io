var i = 0;
var txt = 'Hallo! Willkommen auf meiner Seite! Huer teste ich viele Sachen aus die ich lerne. Viel Spaß! Falls du Tipps für mich hast, kontaktiere mich gerne!'; /* The text */
var speed = 50; /* The speed/duration of the effect in milliseconds */

function typeWriter() {
  if (i < txt.length) {
    document.getElementById("demo").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

function overlayactive() {
  document.getElementById("overlay").style.visibility = "visible";
  document.getElementById("overlaybtn").style.visibility ="hidden";
    if (i < txt.length) {
    document.getElementById("demo").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

function off() {
  document.getElementById("overlay").style.visibility = "hidden";
  document.getElementById("overlaybtn").style.visibility = "visible";
}

window.onload = overlayactive() 
