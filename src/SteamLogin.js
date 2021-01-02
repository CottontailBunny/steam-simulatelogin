const axios = require('axios')
const fs = require('fs');
const { resolve } = require('path');
const querystring = require('querystring');
const RSA = require('./methods/encryp')
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });


class SteamLogin{
    /**
     * Creates an instance of SteamLogin.
     * @param {string} username  Your steam account
     * @param {string} password Your steam login password
     * @memberof SteamLogin
     */
    constructor(username,password){
        this.username=username;
        this.password=password;
        this.incorrMsg='The account name or password that you have entered is incorrect.';
        this.login_headers = {
            'Referer':'https://store.steampowered.com/login/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
        },
        this.get_rsakey_url = 'https://store.steampowered.com/login/getrsakey/',
        this.login_url = 'https://store.steampowered.com/login/dologin/' 
    }

    _warn(...args){
        console.warn('[steam_login]',...args);
    }

    /**
     *
     * encryption key 
     * @return {Promise<Object>} info for login
     * @memberof SteamLogin
     */
    get_login_rsakey(){
        return new Promise((resolve,reject)=>{
            const post_data = querystring.stringify({
                'donotcache':Number(new Date()).toString(),
                'username':this.username
            })
           axios({
                method:'post',
                url:this.get_rsakey_url,
                data:post_data,
                headers:this.login_headers
            }).then((res)=>{
                let pub_mod = res.data.publickey_mod;
                let pub_exp = res.data.publickey_exp;
                let timestamp = res.data.timestamp;
                let key =  RSA.getPublicKey(pub_mod,pub_exp);
                let pwd = RSA.encrypt(this.password,key)
                let login_info={
                    username:this.username,
                    pwd,
                    timestamp
                }
                resolve(login_info)
            })         
        })      
    }

    /**
     *
     * login request
     * @return {Promise<Object>} login result
     * @memberof SteamLogin
     */
    login_req(){
        //first login req
        return new Promise((resolve,reject)=>{
           this.get_login_rsakey().then(res=>{
               let login_data={
                   donotcache: Number(new Date()).toString(),
                   password:res.pwd,
                   username: res.username,
                   twofactorcode:'',
                   emailauth:'',
                   loginfriendlyname:'',
                   captchagid: -1,
                   captcha_text:'',
                   emailsteamid:'',
                   rsatimestamp: res.timestamp,
                   remember_login: false,
               }
               axios({
                   method:'post',
                   url:this.login_url,
                   data:querystring.stringify(login_data),
                   header:this.login_headers
               })
               .then(res=>{
                   let login_result=res.data;
                   if(login_result.success==false&&login_result.message==this.incorrMsg){
                       return Promise.reject(new TypeError(login_result.message))
                   }
                   if(login_result.success==false&&login_result.emailauth_needed==true){
                       //需要进行邮箱验证
                       console.log('请输入邮箱验证码(please enter the verification code)：');
                       rl.on('line', (input) => {
                           console.log(`接收到(code is)：${input}`);
                           rl.close();
                           let emailsteamid=login_result.emailsteamid;
                           let emailauth=input.toLowerCase();
                           let ver_data={
                                   emailsteamid,
                                   emailauth
                               }
                            this.email_verify(ver_data).then(res=>{
                                let cookieArr=res.headers['set-cookie']
                                let result={
                                    cookieArr,
                                    login_result:res.data
                                }
                                if(res.data.success==true&&res.data.login_complete==true){
                                    console.log('登陆成功(success)');
                                    resolve(result)
                                }
                            })
                         });
                   }
               })
               .catch(err=>{
                   reject(err)
               })
           })
        })
   }

   /**
    *
    * emailauthorization
    * @param {*} verdata
    * @return {*} {Promise<Object>} login result
    * @memberof SteamLogin
    */
   email_verify(verdata){
    return new Promise((resolve,reject)=>{
        this.get_login_rsakey().then(res=>{
		let login_data={
			donotcache: Number(new Date()).toString(),
			password: res.pwd,
			username: res.username,
			twofactorcode: '',
			emailauth: verdata.emailauth,
			loginfriendlyname: '',
			captchagid: -1,
			captcha_text: '',
			emailsteamid: verdata.emailsteamid,
			rsatimestamp: res.timestamp,
			remember_login: false,
		}
			axios({
				method:'post',
				url:this.login_url,
				data:querystring.stringify(login_data),
				header:this.login_headers
			}).then(res=>{
                resolve(res)
			})
        }).catch(err=>{
			reject(err)
		})
    })
}
}

module.exports=SteamLogin;
