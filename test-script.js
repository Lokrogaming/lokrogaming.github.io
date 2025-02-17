var i = 0;
var txt = 'Lorem ipsum typing effect!'; /* The text */
var speed = 50; /* The speed/duration of the effect in milliseconds */

function typeWriter() {
  if (i < txt.length) {
    document.getElementById("demo").innerHTML += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}

function on() {
  document.getElementById("overlay").style.display = "block";
  documment.getElementById("overlaybtn").style.display ="none";
}

function off() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("overlaybtn".style.display = "block";
}

window.onload = on()
