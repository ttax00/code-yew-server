# VSCode Rust-Yew extension

## Acknowledgements  
This project took inspiration from Alexandre-Borghi's [yew-highilighting](https://github.com/Alexandre-Borghi/yew-highlighting) extension. And guided by VSCode documentation on [embedded languages](https://code.visualstudio.com/api/language-extensions/embedded-languages) extension.

## Features
- Highlights `html! {}` macros.
- HTML hover.
- HTML completion.
- VSCode indentation (not formatting).
## Build
Tutorial: https://code.visualstudio.com/api/working-with-extensions/publishing-extension#vsce
```
npm install -g vsce
```
### Usage
```console
$ vsce package
# extension.vsix generated
```
