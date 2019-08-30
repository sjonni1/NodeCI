// Temporary file to create a new blog post

() => { 
       return fetch('/api/blogs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: 'My Title', content: 'My Content' })
    });
}

() => { 
    return fetch('/api/blogs', {
     method: 'GET',
     credentials: 'same-origin',
     headers: {
         'Content-Type': 'application/json'
     }
 });
}