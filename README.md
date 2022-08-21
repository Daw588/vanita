# README

> :warning: **NEVER DOWNLOAD OR RUN CODE THAT COMES FROM SOMEWHERE ELSE EVEN IF SOMETHING OR SOMEONE ARE CLAIMING THAT IT'S FROM THIS REPOSITORY. ONLY RUN THE CODE FROM THIS REPOSITORY, OR EVEN BETTER, BUILD IT YOURSELF. RUNNING CODE THAT YOU DO NOT UNDERSTAND ALWAYS COMES WITH RISK OF ACCOUNT THEFT AND OTHER MALICIOUS ACTIONS, BE CAREFUL!**

## About :placard:

RWP stands for Roblox web panel, it's a code snippet that you can run via developer console or the provided Google Chrome extension to try out early Roblox site features before they're officially out without any programming experience.

## Usage :customs:

Both work well, however, installing browser extension will be better on the long run.

### Extension Method :electric_plug:

![extension method showcase gif](/examples/extension-method.gif)

1. Download this GitHub repository onto your computer.

2. Extract the zip file.

3. Go to [`chrome://extensions`](chrome://extensions).

4. Enable "Developer mode" toggle.

5. Click "Load unpacked" button.

6. Select the [`extension`](extension) folder and click "Select Folder".

7. Go to <https://www.roblox.com/> and click on the extension icon.

8. Check "Injection Enabled" checkbox and refresh the page.

### Console Method :computer:

![extension method showcase gif](/examples/console-method.gif)

1. Go to [`extension/program.js`](extension/program.js)

2. Click "Raw".

3. Select the entire page (Ctrl+A).

4. Copy to clipboard (Ctrl+C).

5. Go to <https://www.roblox.com/>.

6. Open developer console either by pressing (F12) or by the opening context menu (Right Click) and clicking "Inspect".

7. Click on the "Console" tab.

8. Paste from clipboard (Ctrl+V) into the console and press (Enter).

## Building :hammer:

If you don't trust the [`extension/program.js`](extension/program.js) file *(I dont blame you if you do)*, you can build it yourself.

### Requirements :passport_control:

1. Installed NodeJS runtime environment.

2. Installed NPM package manager.

3. Installed Bash terminal.

### Instructions :notebook:

1. Download this GitHub repository onto your computer.

2. Extract the zip file.

3. Open terminal in the folder that you extracted.

4. Run `npm i -g yarn` to install Yarn and wait until it's done.

5. Run `yarn install` to install dependencies that the project relies on and wait until it's done.

6. Run `yarn build` to build the [`extension/program.js`](extension/program.js) file and wait until it's done.

## Credits :medal_sports:

[@Julli4n](https://github.com/Julli4n) - [For discovering the API endpoint and documenting it](https://gist.github.com/Julli4n/13016b11e80109ba643ab9e90b431e02).
