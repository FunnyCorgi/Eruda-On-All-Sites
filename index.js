async function testInterpretGooglePage() {
    const response = await fetch("https://api.allorigins.win/get?url=https://google.com");
    const data = await response.json();
    const contentDisplay = document.getElementById('contentDisplay');
    contentDisplay.textContent = data.contents;
}

export { testInterpretGooglePage };
