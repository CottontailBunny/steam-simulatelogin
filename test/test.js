const SteamLogin=require('../src/SteamLogin')
const lo = new SteamLogin('softgirlcy','2')
lo.login_req().then(res=>{
    console.log(res);
})