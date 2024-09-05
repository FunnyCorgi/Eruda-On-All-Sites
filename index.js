async function testInterpretGooglePage() {
    try {
        // Attempt to fetch google.com as HTML
        const response = await fetch("https://google.com");
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Get the response text
        const text = await response.text();
        
        // Alert the response text (or handle it as needed)
        alert(text);
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

export { testInterpretGooglePage };
