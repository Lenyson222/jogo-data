const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const screenW = canvas.width;
const screenH = canvas.height;

let dataColetada = "";
let jogoAtivo = false;
let munição = 50;
let health = 100;
let lastDamageTime = 0;


// O Mapa
const map = [
    [1,1,1,2,2,2,1,1,1,1,3,3,3,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [2,0,1,1,1,0,0,0,1,0,3,0,3,0,3],
    [2,0,1,0,1,0,0,0,0,0,0,0,0,0,3],
    [2,0,1,0,1,0,0,0,0,0,0,0,0,0,3],
    [1,0,1,1,1,0,0,0,1,0,3,0,3,0,3],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,1,1,2,2,2,1,1,1,1,3,3,3,1,1]
];
const mapW = map[0].length;
const mapH = map.length;

// Jogador
const player = {
    x: 1.5, y: 1.5, 
    dirX: -1.0, dirY: 0.0,
    planeX: 0.0, planeY: 0.66,
    speed: 4.0, rotSpeed: 3.0
};

// Matriz de Pixel Art Humanoide
const spriteHumanoide = [
    [0, 1, 1, 1, 0],
    [0, 1, 1, 1, 0],
    [2, 3, 3, 3, 2],
    [2, 3, 0, 3, 2], 
    [2, 3, 3, 3, 2],
    [0, 4, 0, 4, 0],
    [0, 4, 0, 4, 0],
    [0, 4, 0, 4, 0]
];

let sprites = [];
function spawnInimigos() {
    sprites = [];
    for(let i = 0; i <= 9; i++) {
        let sx = 0, sy = 0;
        while(map[Math.floor(sy)][Math.floor(sx)] !== 0 || (Math.abs(sx - player.x) < 2 && Math.abs(sy - player.y) < 2)) {
            sx = Math.random() * (mapW - 2) + 1;
            sy = Math.random() * (mapH - 2) + 1;
        }
        sprites.push({ x: sx, y: sy, valor: i, vivo: true });
    }
}

// === LÓGICA DO DIÁLOGO ===
let estadoDialogo = 0; 

function confirmarData() {
    const inputDate = document.getElementById('data-nascimento').value;
    if(!inputDate) {
        alert("Insere uma data válida!");
        return;
    }
    document.getElementById('step-1').style.display = 'none';
    document.getElementById('step-2').style.display = 'block';
    
    document.getElementById('dialogo-texto').innerText = "Tem certeza absoluta que essa é sua data de nascimento?";
    document.getElementById('btn-sim').style.display = 'block';
    document.getElementById('btn-nao').style.display = 'block';
    estadoDialogo = 0;
}

function clicouSim() {
    if(estadoDialogo === 0) {
        document.getElementById('dialogo-texto').innerText = "acho que vc esta mentindo";
        document.getElementById('btn-sim').style.display = 'none'; // Esconde a opção SIM
        estadoDialogo = 1; 
    }
}

function clicouNao() {
    document.getElementById('btn-sim').style.display = 'none';
    document.getElementById('btn-nao').style.display = 'none';

    if(estadoDialogo === 0) {
        document.getElementById('dialogo-texto').innerText = "eu sabia que vc estava mentindo, rala daqui seu fedelho";
        setTimeout(() => {
            document.getElementById('step-2').style.display = 'none';
            document.getElementById('step-1').style.display = 'block';
            document.getElementById('data-nascimento').value = ''; 
        }, 2000);
    } else if (estadoDialogo === 1) {
        document.getElementById('dialogo-texto').innerText = "eu sabia que vc estava mentindo, agora enfrente as consequências";
        setTimeout(() => {
            iniciarJogo();
        }, 2000);
    }
}
// =========================

// Controlos
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', e => { const k = e.key.toLowerCase(); if(keys.hasOwnProperty(k)) keys[k] = true; });
window.addEventListener('keyup', e => { const k = e.key.toLowerCase(); if(keys.hasOwnProperty(k)) keys[k] = false; });

document.addEventListener('mousemove', e => {
    if(!jogoAtivo || document.pointerLockElement !== canvas) return;
    const rot = e.movementX * 0.003;
    const oldDirX = player.dirX;
    player.dirX = player.dirX * Math.cos(-rot) - player.dirY * Math.sin(-rot);
    player.dirY = oldDirX * Math.sin(-rot) + player.dirY * Math.cos(-rot);
    const oldPlaneX = player.planeX;
    player.planeX = player.planeX * Math.cos(-rot) - player.planeY * Math.sin(-rot);
    player.planeY = oldPlaneX * Math.sin(-rot) + player.planeY * Math.cos(-rot);
});

canvas.addEventListener('mousedown', e => { if(jogoAtivo) atirar(); });

function iniciarJogo() {
    document.getElementById('login-card').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    canvas.requestPointerLock();
    
    dataColetada = "";
    health = 100;
    munição = 50;
    player.x = 1.5; player.y = 1.5;
    
    atualizarHud();
    spawnInimigos();
    jogoAtivo = true;
    lastTime = performance.now();
    gameLoop(lastTime);
}

function atualizarHud() {
    let str = dataColetada.padEnd(8, "_");
    document.getElementById('hud-date').innerText = `${str.substring(0,2)}/${str.substring(2,4)}/${str.substring(4,8)}`;
    document.getElementById('hud-ammo').innerText = munição;
    document.getElementById('hud-health').innerText = health + "%";
    
    const face = document.getElementById('hud-face');
    if(health > 80) face.innerText = '😠';
    else if(health > 50) face.innerText = '😐';
    else if(health > 25) face.innerText = '🤕';
    else face.innerText = '💀';
}

function sofrerDano(time) {
    if (time - lastDamageTime > 1000) { 
        health -= 5;
        lastDamageTime = time;
        
        let blood = document.getElementById('blood-screen');
        blood.style.opacity = 1;
        setTimeout(() => blood.style.opacity = 0, 300);
        
        atualizarHud();

        if (health <= 0) {
            morrer();
        }
    }
}

function morrer() {
    jogoAtivo = false;
    document.exitPointerLock();
    alert("FALECESTE! Os demónios numéricos consumiram a tua mente. A data foi corrompida.");
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('login-card').style.display = 'block';
    
    document.getElementById('step-2').style.display = 'none';
    document.getElementById('step-1').style.display = 'block';
    document.getElementById('data-nascimento').value = '';
}

function atirar() {
    if (munição <= 0) return;
    
    munição--;
    atualizarHud();

    const flash = document.getElementById('flash');
    const weapon = document.getElementById('weapon');
    flash.style.opacity = 1;
    weapon.style.transform = 'translateX(-50%) translateY(30px) scale(1.05)';
    setTimeout(() => { 
        flash.style.opacity = 0; 
        weapon.style.transform = 'translateX(-50%) translateY(0) scale(1)';
    }, 100);

    for (let i = 0; i < sprites.length; i++) {
        let sp = sprites[i];
        if (!sp.vivo) continue;

        let spriteX = sp.x - player.x;
        let spriteY = sp.y - player.y;
        let invDet = 1.0 / (player.planeX * player.dirY - player.dirX * player.planeY);
        let transformX = invDet * (player.dirY * spriteX - player.dirX * spriteY);
        let transformY = invDet * (-player.planeY * spriteX + player.planeX * spriteY); 
        
        let spriteScreenX = Math.floor((screenW / 2) * (1 + transformX / transformY));
        let spriteSize = Math.abs(Math.floor(screenH / transformY)); 

        let hitBoxWidth = spriteSize * (5/8); 
        let hitBoxHeight = spriteSize;
        let drawStartY = -spriteSize / 2 + screenH / 2;

        let leftBound = spriteScreenX - (hitBoxWidth / 2);
        let rightBound = spriteScreenX + (hitBoxWidth / 2);
        let topBound = drawStartY;
        let bottomBound = drawStartY + hitBoxHeight;

        let crosshairX = screenW / 2;
        let crosshairY = screenH / 2;

        if (transformY > 0 && transformY < 10) {
            if (crosshairX >= leftBound && crosshairX <= rightBound && 
                crosshairY >= topBound && crosshairY <= bottomBound) {
                
                sp.vivo = false;
                dataColetada += sp.valor.toString();
                atualizarHud();

                setTimeout(() => {
                    let nx = 0, ny = 0;
                    while(map[Math.floor(ny)][Math.floor(nx)] !== 0) {
                        nx = Math.random() * (mapW - 2) + 1;
                        ny = Math.random() * (mapH - 2) + 1;
                    }
                    sp.x = nx; sp.y = ny; sp.vivo = true;
                }, 1000);

                if (dataColetada.length === 8) {
                    jogoAtivo = false;
                    document.exitPointerLock();
                    document.getElementById('game-container').style.display = 'none';
                    document.getElementById('login-card').style.display = 'block';
                    document.getElementById('step-2').style.display = 'none';
                    document.getElementById('ui-final').style.display = 'block';
                    
                    let d = dataColetada;
                    document.getElementById('data-final-display').innerText = `${d.substring(0,2)}/${d.substring(2,4)}/${d.substring(4,8)}`;
                }
                break; 
            }
        }
    }
}

let lastTime = 0;
let ZBuffer = new Array(screenW);

function gameLoop(time) {
    if(!jogoAtivo) return;
    const frameTime = (time - lastTime) / 1000;
    lastTime = time;

    // TETO E CHÃO
    ctx.fillStyle = '#383838'; 
    ctx.fillRect(0, 0, screenW, screenH/2);
    ctx.fillStyle = '#4f5448'; 
    ctx.fillRect(0, screenH/2, screenW, screenH/2);

    // PAREDES
    for (let x = 0; x < screenW; x++) {
        let cameraX = 2 * x / screenW - 1;
        let rayDirX = player.dirX + player.planeX * cameraX;
        let rayDirY = player.dirY + player.planeY * cameraX;

        let mapX = Math.floor(player.x); let mapY = Math.floor(player.y);
        let sideDistX, sideDistY;
        let deltaDistX = Math.abs(1 / rayDirX); let deltaDistY = Math.abs(1 / rayDirY);
        let perpWallDist;
        let stepX, stepY;
        let hit = 0, side = 0;

        if (rayDirX < 0) { stepX = -1; sideDistX = (player.x - mapX) * deltaDistX; } 
        else { stepX = 1; sideDistX = (mapX + 1.0 - player.x) * deltaDistX; }
        if (rayDirY < 0) { stepY = -1; sideDistY = (player.y - mapY) * deltaDistY; } 
        else { stepY = 1; sideDistY = (mapY + 1.0 - player.y) * deltaDistY; }

        while (hit === 0) {
            if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; } 
            else { sideDistY += deltaDistY; mapY += stepY; side = 1; }
            if (map[mapY][mapX] > 0) hit = 1;
        }

        if (side === 0) perpWallDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
        else perpWallDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY;

        ZBuffer[x] = perpWallDist;

        let lineHeight = Math.floor(screenH / perpWallDist);
        let drawStart = -lineHeight / 2 + screenH / 2;
        if(drawStart < 0) drawStart = 0;
        let drawEnd = lineHeight / 2 + screenH / 2;
        if(drawEnd >= screenH) drawEnd = screenH - 1;

        let wallType = map[mapY][mapX]; 
        let colorSide0, colorSide1;
        
        if (wallType === 1) { colorSide0 = '#878c81'; colorSide1 = '#6b7067'; } 
        else if (wallType === 2) { colorSide0 = '#2b3948'; colorSide1 = '#1c2631'; } 
        else if (wallType === 3) { colorSide0 = '#4b5e35'; colorSide1 = '#364525'; } 
        else { colorSide0 = '#5c4028'; colorSide1 = '#4a3320'; }

        ctx.fillStyle = side === 1 ? colorSide1 : colorSide0;
        ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);

        let wallHeight = drawEnd - drawStart;
        if (wallType === 1 && wallHeight > 20) {
            ctx.fillStyle = '#3a3d37'; 
            ctx.fillRect(x, drawStart + wallHeight * 0.1, 1, 3);
            ctx.fillRect(x, drawStart + wallHeight * 0.9, 1, 3);
        } else if (wallType === 2 && x % 8 === 0 && wallHeight > 30) {
            ctx.fillStyle = '#00ff00'; 
            ctx.fillRect(x, drawStart + wallHeight * 0.4, 1, 4);
        }

        ctx.fillStyle = `rgba(0,0,0,${Math.min(perpWallDist * 0.08, 0.85)})`; 
        ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
    }

    // INIMIGOS (IA E RENDERIZAÇÃO)
    for(let i=0; i<sprites.length; i++) {
        let sp = sprites[i];
        let dx = player.x - sp.x;
        let dy = player.y - sp.y;
        sp.dist = (dx*dx + dy*dy);

        if (sp.vivo) {
            let distReal = Math.sqrt(sp.dist);
            if (distReal < 6 && distReal > 0.5) {
                // Inimigos mais lentos (0.4)
                let moveX = (dx / distReal) * frameTime * 0.4;
                let moveY = (dy / distReal) * frameTime * 0.4;
                if(map[Math.floor(sp.y)][Math.floor(sp.x + moveX)] === 0) sp.x += moveX;
                if(map[Math.floor(sp.y + moveY)][Math.floor(sp.x)] === 0) sp.y += moveY;
            }
            if (distReal < 0.6) sofrerDano(time);
        }
    }
    
    sprites.sort((a, b) => b.dist - a.dist); 

    for(let i=0; i<sprites.length; i++) {
        let sp = sprites[i];
        if(!sp.vivo) continue;

        let spriteX = sp.x - player.x;
        let spriteY = sp.y - player.y;

        let invDet = 1.0 / (player.planeX * player.dirY - player.dirX * player.planeY);
        let transformX = invDet * (player.dirY * spriteX - player.dirX * spriteY);
        let transformY = invDet * (-player.planeY * spriteX + player.planeX * spriteY); 

        if (transformY > 0) { 
            let spriteScreenX = Math.floor((screenW / 2) * (1 + transformX / transformY));
            let spriteSize = Math.abs(Math.floor(screenH / transformY));

            if (transformY < ZBuffer[spriteScreenX]) {
                let drawStartY = -spriteSize / 2 + screenH / 2;
                
                let pixelW = spriteSize / 5; 
                let pixelH = spriteSize / 8; 
                let startX = spriteScreenX - (spriteSize * (5/8)) / 2; 

                for (let r = 0; r < 8; r++) {
                    for (let c = 0; c < 5; c++) {
                        let p = spriteHumanoide[r][c];
                        if (p === 0 && !(r === 3 && c === 2)) continue; 

                        if (p === 1) ctx.fillStyle = '#A0522D';      
                        else if (p === 2) ctx.fillStyle = '#5C4033'; 
                        else if (p === 3) ctx.fillStyle = '#8B4513'; 
                        else if (p === 4) ctx.fillStyle = '#3e2723'; 

                        if (p !== 0) {
                            ctx.fillRect(startX + c * pixelW, drawStartY + r * pixelH, pixelW + 1, pixelH + 1);
                        }
                    }
                }

                ctx.fillStyle = '#FF0000'; 
                ctx.font = `bold ${spriteSize * 0.3}px 'JetBrains Mono', monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(sp.valor, spriteScreenX, drawStartY + 3.5 * pixelH);
            }
        }
    }

    // MOVIMENTO DO JOGADOR
    let moveStep = player.speed * frameTime;
    if (keys.w) {
        if(map[Math.floor(player.y)][Math.floor(player.x + player.dirX * moveStep)] === 0) player.x += player.dirX * moveStep;
        if(map[Math.floor(player.y + player.dirY * moveStep)][Math.floor(player.x)] === 0) player.y += player.dirY * moveStep;
    }
    if (keys.s) {
        if(map[Math.floor(player.y)][Math.floor(player.x - player.dirX * moveStep)] === 0) player.x -= player.dirX * moveStep;
        if(map[Math.floor(player.y - player.dirY * moveStep)][Math.floor(player.x)] === 0) player.y -= player.dirY * moveStep;
    }
    if (keys.a) { 
        let strafeX = player.dirY; let strafeY = -player.dirX;
        if(map[Math.floor(player.y)][Math.floor(player.x + strafeX * moveStep)] === 0) player.x += strafeX * moveStep;
        if(map[Math.floor(player.y + strafeY * moveStep)][Math.floor(player.x)] === 0) player.y += strafeY * moveStep;
    }
    if (keys.d) { 
        let strafeX = -player.dirY; let strafeY = player.dirX;
        if(map[Math.floor(player.y)][Math.floor(player.x + strafeX * moveStep)] === 0) player.x += strafeX * moveStep;
        if(map[Math.floor(player.y + strafeY * moveStep)][Math.floor(player.x)] === 0) player.y += strafeY * moveStep;
    }

    let weapon = document.getElementById('weapon');
    if (keys.w || keys.s || keys.a || keys.d) {
        let sway = Math.sin(time * 0.01) * 10;
        weapon.style.transform = `translateX(calc(-50% + ${sway}px))`;
    }

    requestAnimationFrame(gameLoop);
}
