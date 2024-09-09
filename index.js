async function loadPage(url) {
    try {
        const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const response = await fetch(allOriginsUrl);
        const data = await response.json();
        const iframe = document.getElementById('contentFrame');
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

        // Write the HTML content from the response
        iframeDoc.open();
        iframeDoc.write(data.contents);
        iframeDoc.close();

        // Ensure the iframe is fully loaded before injecting Eruda
        iframeDoc.addEventListener('DOMContentLoaded', () => {
            const baseUrl = new URL(url).origin; // Extract base URL (e.g., https://google.com)

            // Inject Eruda script
            const erudaScript = iframeDoc.createElement('script');
            erudaScript.src = 'https://cdn.jsdelivr.net/npm/eruda';
            erudaScript.onload = () => {
                iframeDoc.defaultView.eruda.init();

                // Apply fetch/XHR interception after Eruda initialization
                const interceptionScript = `
                    (function() {
                        const allOriginsUrl = 'https://api.allorigins.win/get?url=';
                        const originalFetch = window.fetch;
                        const originalXhrOpen = XMLHttpRequest.prototype.open;

                        // Helper function to check if the URL is already proxied
                        function isProxied(url) {
                            return url.startsWith(allOriginsUrl);
                        }

                        // Convert relative URLs to absolute
                        function toAbsoluteUrl(relativeUrl) {
                            if (relativeUrl.startsWith('http')) {
                                return relativeUrl; // Already absolute
                            }
                            return new URL(relativeUrl, '${baseUrl}').href; // Convert to absolute URL
                        }

                        // Intercept fetch requests
                        window.fetch = async function(url, ...args) {
                            url = toAbsoluteUrl(url); // Convert to absolute URL
                            if (!isProxied(url)) {
                                url = allOriginsUrl + encodeURIComponent(url);
                            }
                            return originalFetch(url, ...args);
                        };

                        // Intercept XMLHttpRequest requests
                        XMLHttpRequest.prototype.open = function(method, url, ...args) {
                            url = toAbsoluteUrl(url); // Convert to absolute URL
                            if (!isProxied(url)) {
                                url = allOriginsUrl + encodeURIComponent(url);
                            }
                            originalXhrOpen.call(this, method, url, ...args);
                        };

                        // Function to fetch image data and replace src with Blob URL
                        async function replaceImageSource(imgEl) {
                            let originalUrl = imgEl.src;
                            originalUrl = toAbsoluteUrl(originalUrl); // Ensure the URL is absolute

                            if (isProxied(originalUrl)) return; // Skip already proxied images

                            try {
                                const allOriginsImageUrl = allOriginsUrl + encodeURIComponent(originalUrl);
                                const imageResponse = await fetch(allOriginsImageUrl);
                                
                                const imageData = await imageResponse.blob();  // Use blob for binary content
                                
                                const blobUrl = URL.createObjectURL(imageData);
                                
                                imgEl.src = blobUrl;  // Update src with Blob URL
                            } catch (error) {
                                console.error('Error fetching image: ', error);
                            }
                        }

                        // Rewrite image, script, and link resources
                        async function interceptResourceTags() {
                            const imgElements = document.querySelectorAll('img');
                            for (const imgEl of imgElements) {
                                if (imgEl.src.startsWith('http') && !isProxied(imgEl.src)) {
                                    await replaceImageSource(imgEl);
                                }
                            }

                            document.querySelectorAll('script, link').forEach(el => {
                                if (el.tagName.toLowerCase() === 'script' && el.src.startsWith('http') && !isProxied(el.src)) {
                                    el.src = allOriginsUrl + encodeURIComponent(toAbsoluteUrl(el.src));
                                } else if (el.tagName.toLowerCase() === 'link' && el.href.startsWith('http') && !isProxied(el.href)) {
                                    el.href = allOriginsUrl + encodeURIComponent(toAbsoluteUrl(el.href));
                                }
                            });
                        }

                        // Intercept <a> links to ensure proxy routing
                        function interceptLinks() {
                            document.querySelectorAll('a').forEach(el => {
                                if (el.href && el.href.startsWith('http') && !isProxied(el.href)) {
                                    const originalHref = el.href;
                                    el.removeAttribute('href');
                                    el.setAttribute('onclick', 'parent.handleLinkClick("' + toAbsoluteUrl(originalHref) + '")');
                                }
                            });
                        }

                        // Apply resource and link interception after page load
                        window.onload = function() {
                            interceptResourceTags();
                            interceptLinks();
                        };
                    })();
                `;

                // Inject the interception script
                const scriptTag = iframeDoc.createElement('script');
                scriptTag.textContent = interceptionScript;
                iframeDoc.head.appendChild(scriptTag);
            };
            iframeDoc.head.appendChild(erudaScript);
        });

    } catch (error) {
        console.error('There was a problem with the fetch operation: ' + error.message);
    }
}

// Function to handle link clicks and reload the iframe with the new URL through AllOrigins
function handleLinkClick(newUrl) {
    loadPage(newUrl); // Reload the iframe with the new page via proxy
}

// Function to start the page loading process with Google's homepage as the default
function testInterpretGooglePage() {
    loadPage("https://google.com");
}

export { testInterpretGooglePage, loadPage, handleLinkClick };
