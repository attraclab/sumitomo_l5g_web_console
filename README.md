# Ginzafarm Sumitomo L5G Web console

This repository is part of Sumitomo L5G robot project, this repo is taking care of web console. The robot control part is taking care by [Sumitomo_L5G](https://github.com/attraclab/Sumitomo_L5G) repo.

## Software Dependencies

- `sudo apt install nodejs npm`
- Init node
```sh
## make sure you have clone this repo under ~/web_dev
cd ~/web_dev/sumitomo_l5g/js

npm init

## press y couple of times

```
- `npm install websocket`
- `npm install ws`

This repo has to be on both robot Jetson Nano and also Edge server.

## TODO

1. on `offer.js` at [line 17](https://github.com/attraclab/sumitomo_l5g_web_console/blob/e0a33142d276808ce6a0a4e65c25c318c344120a/js/offer.js#L17), change `server_ip` to the IP of server.
2. on `answer.js` at [line 25](https://github.com/attraclab/sumitomo_l5g_web_console/blob/e0a33142d276808ce6a0a4e65c25c318c344120a/js/answer.js#L25), change `server_ip` to the IP of server.
3. symlink the project folder to hosting directory `sudo ln -s ~/web_dev/sumitomo_l5g /var/www/html/sumitomo_l5g`
4. symlink index.html to hosting directory `sudo ln -s ~/web_dev/sumitomo/index.html /var/www/html/index.html` , you may need to change 
    
    [this icon directory](https://github.com/attraclab/sumitomo_l5g_web_console/blob/e0a33142d276808ce6a0a4e65c25c318c344120a/index.html#L7) to `<link rel="shortcut icon" href="/var/www/html/sumitomo_l5g/images/ginzafarm.png">`
    
    [this css style](https://github.com/attraclab/sumitomo_l5g_web_console/blob/e0a33142d276808ce6a0a4e65c25c318c344120a/index.html#L9) to `<link rel="stylesheet" href="/var/www/html/sumitomo_l5g/css/style_main.css">`
   
    [this http](https://github.com/attraclab/sumitomo_l5g_web_console/blob/e0a33142d276808ce6a0a4e65c25c318c344120a/index.html#L27) to `http://<server-ip>/var/www/html/sumitomo_l5g/answer.html`