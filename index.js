async function testInterpretGooglePage() {
        const response = await fetch("https://api.allorigins.win/get?url=https://google.com");
        const data = await response.json();
        alert(data.contents);
}

export { testInterpretGooglePage };
