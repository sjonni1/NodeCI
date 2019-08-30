const Page = require('puppeteer/lib/Page');
// This is an exemple on how to add a login function to the puppeteer library to simplify login 
// when testing 

Page.prototype.login = async function() {
    const user = await userFactory();
    const { session, sig } = sessionFactory(user);

    await this.setCookie({ name: 'session', value: session });
    await this.setCookie({ name: 'session.sig', value: sig });
    await this.goto('localhost:3000');
    await this.waitFor('a[href="/auth/logout"]');
}

module.exports = Page.login;