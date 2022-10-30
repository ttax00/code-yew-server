# VSCode Rust-Yew extension
!!! Work In Progress !!! 
## Acknowledgements  
This project took inspiration from Alexandre-Borghi's [yew-highilighting](https://github.com/Alexandre-Borghi/yew-highlighting) extension. And guided by VSCode documentation on [embedded languages](https://code.visualstudio.com/api/language-extensions/embedded-languages) extension.

## Features
- Highlights `html! {}` macros.
![image](https://user-images.githubusercontent.com/10691398/198873504-59467cb9-7844-431e-a7ef-770dd4e8756d.png)
- HTML hover.
![image](https://user-images.githubusercontent.com/10691398/198873526-d73a6532-af17-4c93-a1a9-68202c91d161.png)
- HTML completion.
![image](https://user-images.githubusercontent.com/10691398/198873561-ae8b3b52-7073-48ad-90e9-280cd63ad935.png)
![image](https://user-images.githubusercontent.com/10691398/198873618-5f8be6d8-61a9-4344-8aea-a3fda82b920c.png)
![image](https://user-images.githubusercontent.com/10691398/198873632-b6163841-897d-4685-b21d-ace0656d0940.png)
- VSCode auto indentation on `Enter` (not document formatting).
- Partial document symbol support (known bug).
![image](https://user-images.githubusercontent.com/10691398/198873897-ae0567ea-beab-4f79-b90d-7814ac1e2559.png)

## Unplanned / require help
- [ ] Document formatting support.
- [ ] Document selection formatting support.
- [ ] FIXME: tag rename support issues.
- [ ] FIXME: missing document symbols issues.
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
