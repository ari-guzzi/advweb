// Manipulate at least one CSS property 
const paragraphs = document.querySelectorAll("p");
paragraphs.forEach(function(p) {
    p.style.color = "green";
});

// Manipulate at least one other DOM property that is not a CSS property
window.onload = () => {
    const newHeader = document.createElement("h3");
    const headerThree = document.createTextNode("Added this h3 with JS!");
    newHeader.appendChild(headerThree);
    document.body.appendChild(newHeader);
  };

// First response to an event using event listeners
document.getElementById('hoverDiv').addEventListener('mouseover', function() {
    this.style.backgroundColor = 'purple';
});

document.getElementById('hoverDiv').addEventListener('mouseout', function() {
    this.style.backgroundColor = 'lightpink';
});

// Second response to an event using event listeners
document.addEventListener('keydown', function(event) {
    if (event.key === 'a' || event.key === 'A') {
        const messageArea = document.getElementById('secretMessage');
        messageArea.textContent = "SECRET MESSAGE!";
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key === 'a' || event.key === 'A') {
        const messageArea = document.getElementById('secretMessage');
        messageArea.textContent = "";
    }
});