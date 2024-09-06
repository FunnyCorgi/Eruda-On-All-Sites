async function testInterpretGooglePage() {
    try {
        const response = await fetch("https://api.allorigins.win/get?url=https://google.com");
        const data = await response.json();
        alert(data.contents);
    } catch (error) {
        alert('There was a problem with the fetch operation: ' + error.message);
    }
}

export { testInterpretGooglePage };
