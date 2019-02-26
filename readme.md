## Keyword Speed Dial

[Chrome extension](https://chrome.google.com/webstore/detail/keyword-speed-dial/ahkoeglneflhhgjihefngpfbljicjjem/)

### Quick Start

1. Go to extension's options page.
2. Add a speed dial group, e.g.
   - Name: Facebook
   - Prefix: fb
3. Add a speed dial, e.g.
   - Group: Facebook
   - Keyword: chrome
   - URL: [https://www.facebook.com/googlechrome](https://www.facebook.com/googlechrome)
4. Type `go fb chrome` in browser address bar and enter.

### URL Suffix Support

Any input after an existing speed dial keyword will be appended to the speed dial URL as suffix. E.g. with the speed dial created in Quick Start, by typing `go fb chrome /photos`, browser will go to [https://www.facebook.com/googlechrome/photos](https://www.facebook.com/googlechrome/photos).

This can be used to append URL params like `?foo=bar`.

### Import/Export

Config can be imported and exported as JSON from the options page.

Speed dials in the imported JSON with keywords that already exist on the options page will be ignored.