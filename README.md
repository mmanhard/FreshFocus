# Fresh Focus

Fresh Focus implements the Pomodoro technique but takes it one step further:
website blocking while in the middle of a Pomodoro session.

Using the extension is simple. Configure your Pomodoro sessions, start the session
timer, and your most distracting sites will be blocked and out of reach until the
session is over. If you've never used or heard of the Pomodoro technique before,
[this article](https://lifehacker.com/productivity-101-a-primer-to-the-pomodoro-technique-1598992730)
does a great job of explaining it!

Fresh Focus was built with pure JS, CSS, and HTML.

## Live Version

This extension is available on the Chrome Web Store. [Check it out here!](https://chrome.google.com/webstore/detail/fresh-focus/fjkljljefpifhcppppgmjinfmkgjooap/related?hl=en-US)

## Usage

To use this extension, follow these steps in a Google Chrome browser:

1. [Download](https://github.com/mmanhard/FreshFocus/archive/master.zip) or clone
this repo to your machine.
2. Navigate to the Chrome extension manager in your browser: **chrome://extensions/**.
3. Select **"Load Unpacked"**.
4. Select the directory that contains the cloned repo.

After that, you're all set to try out the extension. Check it out in the
top-right corner of your Chrome browser.

## Why build Fresh Focus?

This was my first foray into the world of web development. I wanted to get more
comfortable with writing plain-old Javascript and using CSS/HTML. Additionally,
this extension has both a background page and a popup page, each with separate DOMs.
Understanding how these pages would communicate posed an interesting challenge
that I wouldn't have encountered while working on a typical web app. Specifically,
developing this app allowed me to explore technologies like Local Storage and message
passing.
