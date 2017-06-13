const snoowrap = require('snoowrap');

// NOTE: The following examples illustrate how to use snoowrap. However, hardcoding
// credentials directly into your source code is generally a bad idea in practice (especially
// if you're also making your source code public). Instead, it's better to either (a) use a separate
// config file that isn't committed into version control, or (b) use environment variables.

// Create a new snoowrap requester with OAuth credentials.
// For more information on getting credentials, see here: https://github.com/not-an-aardvark/reddit-oauth-helper
const r = new snoowrap({
    userAgent: 'put your user-agent string here',
    clientId: 'cO_Tk2b60ij01Q',
    clientSecret: 'oM2ZP_RFxCYvVOR9zL3UxZ-h8yU',
    refreshToken: '11560010-hX54UQPDOKnRlL0eIXVfJexrcos'
});

var posts = r.getSubreddit("talesfromtechsupport").getHot();
console.log(posts);