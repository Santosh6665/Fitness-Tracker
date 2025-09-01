import React from 'react';

const toHtml = (text: string): string => {
    // A more robust regex-based markdown parser
    let html = text
        // Headers
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-headline font-bold mt-6 mb-4">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-headline font-semibold mt-5 mb-3 border-b pb-2">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-headline font-semibold mt-4 mb-2">$1</h3>')
        
        // Bold and Italic
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        
        // Line breaks to <br>
        .replace(/\n/g, '<br />');

    // Handle lists - this is a bit tricky with regex alone.
    // We'll split by lines and build lists.
    const lines = html.split('<br />');
    let inList = false;
    let processedHtml = '';
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('- ')) {
            if (!inList) {
                processedHtml += '<ul class="list-disc list-inside space-y-2 my-4 pl-4">';
                inList = true;
            }
            processedHtml += `<li>${trimmedLine.substring(2)}</li>`;
        } else {
            if (inList) {
                processedHtml += '</ul>';
                inList = false;
            }
            processedHtml += trimmedLine ? `<p>${trimmedLine}</p>` : '';
        }
    }
    if (inList) {
        processedHtml += '</ul>';
    }
    
    // Remove empty paragraphs that might result from splitting
    processedHtml = processedHtml.replace(/<p><\/p>/g, '');

    return processedHtml;
};

export const Markdown: React.FC<{ content: string }> = ({ content }) => {
    return (
        <div
            className="space-y-4 text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: toHtml(content) }}
        />
    );
};
