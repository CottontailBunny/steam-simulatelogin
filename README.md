# SteamLogin
## Setup
### Installation
```js
npm i steam-simulatelogin
```

### Usage
```js
const SteamLogin = require('steam-simulatelogin')
const lo = new SteamLogin('username','pwd')
```
如果控制台看到"请输入验证码" 请检查你的邮箱并输入验证码

If the console sees "please enter the verification code", please check your email and enter the verification code

```js
lo.login_req().then(res=>{
    console.log(res);
            /* 登陆成功
        {
        cookieArr: [
            'steamLoginSecure=7656119xxxxx%7C%7CB2222E50A3075Cxxxx97775F3BCB1A; Path=/; Secure; HttpOnly; SameSite=None',
            'steamMachineAuth7656119820xxxxxxxxx602D9392A722E8Cxx7F7; Expires=Tue, 31 Dec 2030 
        09:35:34 GMT; Path=/; Secure; HttpOnly; SameSite=None',
            'steamRememberLogin=7656119xxxxx%7Ce7c2a6dfa4xxxx6382ec0fbb5; Expires=Mon, 01 Feb 2021 
        09:35:34 GMT; Path=/; Secure; SameSite=None'
        ],
        login_result: {
            success: true,
            requires_twofactor: false,
            login_complete: true,
            transfer_urls: [
            'https://steamcommunity.com/login/transfer',   
            'https://help.steampowered.com/login/transfer' 
            ],
            transfer_parameters: {
            steamid: '76561198205559728',
            token_secure: 'B2222Exxxxx639497775F3BCB1A',
            auth: '2dfeae8xxx1e2a5c',      
            remember_login: true,
            webcookie: '476625xxxxxxxxx722E8CC07F7'
            }
        }
        } */
})
```
