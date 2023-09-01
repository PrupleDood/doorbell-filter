let custom_cursor = document.querySelector(".cursor");
let button = document.querySelector(".btn-primary")

window.addEventListener("mousemove", cursor);
window.addEventListener("load", cursor);
window.addEventListener("scroll", cursor);
window.addEventListener("scroll", scrollBackground);
window.addEventListener("mousedown", cursorClick);
window.addEventListener("mouseup", cursorUnclick);
document.body.addEventListener("mouseleave", hideMouse);
document.body.addEventListener("mouseover", showMouse);

window.onload = function() {
  toggleDark2();
};

function hideMouse(e) {
  custom_cursor.style.visibility = "hidden";
};

function showMouse(e) {
  custom_cursor.style.visibility = "visible";
};

function scrollBackground(e) {
  document.body.style.backgroundPosition = "-9px " + (-9-scrollY/4) + "px";
};

function cursor(e) {
  custom_cursor.style.top = (e.pageY - scrollY) + "px";
  custom_cursor.style.left = e.pageX + "px";
};

function cursorClick(e) {
  custom_cursor.style.transform = "scale(1.4) translate(-37.5%, -37.5%)";
  custom_cursor.style.background = "rgb(255, 255, 255)";
};

function cursorUnclick(e) {
  custom_cursor.style.transform = "scale(1)";
  custom_cursor.style.transform = "translate(-50%, -50%)";
  custom_cursor.style.background = "rgba(255, 255, 255, 0)";
};

/*const darkModeToggle = document.getElementById("night-toggle-button");
const body = document.body;
const night_toggle_button = document.getElementById("button1");
const footer = document.querySelector("footer")


/*darkModeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");
  night_toggle_button.style.backgroundColor = "white"
});*/

sessionStorage.setItem("darkMode", "true");

function toggleDark()
{
  if (sessionStorage.getItem("darkMode") == "false")
  {
    sessionStorage.setItem("darkMode", "true");
    document.getElementById("darkButton").innerHTML = "Light Mode";
  }
  else
  {
    sessionStorage.setItem("darkMode", "false");
    document.getElementById("darkButton").innerHTML = "Dark Mode";
  }

  toggleDark2();
}

function toggleDark2() {
  console.log(sessionStorage.getItem("darkMode"));
  var element = document.body;
  var footer = document.querySelector("footer")

  const allElementsLight =(document.getElementsByClassName("bg-light"));
  const allElementsWhite =(document.getElementsByClassName("bg-white"));
  
  if (sessionStorage.getItem("darkMode") == "false"){
    for (i = 0; i < allElementsLight.length; i++)
    {
      console.log(allElementsLight.length);
      // allElements.item(i).className = allElements.item(i).className.replace( /(?:^|\s)bg-light(?!\S)/g , ' bg-white' )
      allElementsLight.item(i).className = allElementsLight.item(i).className.replace( "bg-light" , 'bg-white' );
      i--;
    }
    footer.classList.toggle("bg-white")
  }
  else if (sessionStorage.getItem("darkMode") == "true")
  {
    for (i = 0; i < allElementsWhite.length; i++)
    {
      // allElements.item(i).className = allElements.item(i).className.replace( /(?:^|\s)bg-white(?!\S)/g , ' bg-light' )
      allElementsWhite.item(i).className = allElementsWhite.item(i).className.replace( "bg-white" , 'bg-light' );
      i--;
    }
    footer.classList.toggle("bg-light")
  }

  if (sessionStorage.getItem("darkMode") == "true" && element.classList.contains('dark-mode') || sessionStorage.getItem("darkMode") == "false" && !element.classList.contains('dark-mode'))
  {
    element.classList.toggle("dark-mode");
  }
  
  console.log(allElementsLight);
  console.log(allElementsWhite);
  
  console.log("darkToggle");
}