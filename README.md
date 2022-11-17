# VSCode Rust-Yew extension

<img
    style="display: block;margin: auto;width: 20%;"
    src="https://raw.githubusercontent.com/TechTheAwesome/code-yew-server/main/rustyew.png"
    alt="Pandora Logo">
</img>

![GitHub](https://img.shields.io/github/license/TechTheAwesome/code-yew-server?style=for-the-badge)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/techtheawesome/code-yew-server/Typescript?style=for-the-badge)

An extension that provides some language features for [Yew](https://yew.rs/)'s html macro syntax in Rus

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
- Document symbol support.

![image](https://user-images.githubusercontent.com/10691398/198873897-ae0567ea-beab-4f79-b90d-7814ac1e2559.png)

- `F2` Rename basic html tags. 

![image](https://user-images.githubusercontent.com/10691398/202401406-9980c5d8-2814-40fa-a22f-c1d9bc9ec5e3.png)
![image](https://user-images.githubusercontent.com/10691398/202403605-81ba2cf1-73de-4502-b42f-5cf45b26add0.png)
![image](https://user-images.githubusercontent.com/10691398/202403648-13392a6f-fa56-4acc-bd58-79e7a9d02698.png)


## Unplanned / require help
- [ ] Document formatting support.
- [ ] Document selection formatting support.
- [x] FIXME: tag rename support issues.
- [x] FIXME: missing document symbols issues.
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
## Acknowledgements
- Inspiration taken from [yew-highlighting](https://github.com/Alexandre-Borghi/yew-highlighting). 
- Follows the amazingly detailed guide for [embedded languages](https://code.visualstudio.com/api/language-extensions/embedded-languages).
