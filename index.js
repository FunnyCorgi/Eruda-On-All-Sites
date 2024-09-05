async function testInterpretGooglePage() {
    try {
        // Example of a CORS-friendly request (placeholder API)
        const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Get the response JSON
        const data = await response.json();
        
        // Alert or handle the response data
        alert(JSON.stringify(data));
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

export { testInterpretGooglePage };
