async function testInterpretGooglePage() {
    try {
        const response = await fetch("https://api.allorigins.win/get?url=https://google.com"); // `no-cors` won't let you see the response body
        const text = await response.text();  // Use text() for non-JSON responses
        alert(text);
    } catch (error) {
        alert('There was a problem with the fetch operation: ' + error.message);
    }
}

export { testInterpretGooglePage };
